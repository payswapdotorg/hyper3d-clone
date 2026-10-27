import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { InsufficientCreditsError, computeTaskCost } from "@/lib/credits";
import { ledger } from "@/lib/ledger";
import { runPipelineNow } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Serverless: the paced pipeline (effort pace capped at 40s in queue.ts)
// runs post-response inside after() — keep the invocation alive for it.
export const maxDuration = 60;

const CreateTaskSchema = z.object({
  type: z.enum(["RodinAgentic", "RodinStandard"]),
  prompt: z.string().min(1).max(2000),
  effort: z.enum(["extreme-low", "low", "medium", "high", "extreme-high"]).optional().default("medium"),
  image: z.string().min(8).max(8_000_000).optional(), // data URL or bare base64
  settings: z.object({ height: z.number().finite().min(1).max(100) }).partial().optional(),
  // ---- ControlNet spatial constraint (reference affordance, 2026-10-28) ----
  /** Derived from the editor state (lib/controlnet.ts) — aspect/fill/anchors. */
  controlnet: z
    .object({
      mode: z.enum(["bbox", "voxel", "pointcloud"]),
      aspect: z.tuple([z.number().finite().min(0.01).max(1000), z.number().finite().min(0.01).max(1000), z.number().finite().min(0.01).max(1000)]),
      fill: z.number().finite().min(0).max(1).optional(),
      anchors: z.number().int().min(0).max(4096).optional(),
    })
    .optional(),
  // ---- engine2 recovery: free neural engine + pay-by-result ----
  /** Tier: "neural" (client-direct Hunyuan3D-2.1) or "fast" (in-house lathe). */
  engine: z.enum(["neural", "fast"]).optional(),
  /** 0..65535 — card-visible reproducibility (both tiers; lathe jitters by it). */
  seed: z.number().int().min(0).max(65535).optional(),
  /** Up to 4 extra view images (data URLs) for the neural multiview params. */
  mvImages: z.array(z.string().min(8).max(4_000_000)).max(4).optional(),
  // ---- workspace parity options (reference surface, 2026-10-20) ----
  /** Product line: gen-1.5 (Default/Speedy) or gen-2.5 (efforts + agentic). */
  genVersion: z.enum(["gen-1.5", "gen-2.5"]).optional(),
  /** Legacy Gen-2 era mode name (only meaningful with genVersion=gen-1.5). */
  legacyMode: z.enum(["default", "speedy"]).optional(),
  /** Material pass: pbr | shaded | all | none (none skips the texture pass). */
  material: z.enum(["pbr", "shaded", "all", "none"]).optional(),
  /** Private task: excluded from the featured/public gallery. */
  isPrivate: z.boolean().optional(),
  /** WorldGen creation mode: build-myself | generate-objects | complete-scene. */
  creationMode: z.enum(["build-myself", "generate-objects", "complete-scene"]).optional(),
  /** image_label parity: per-view direction labels (reference Gen-2.5 enum). */
  imageLabels: z.array(z.enum(["F", "FL", "FR", "B", "BL", "BR", "L", "R", "U", "D", "?"])).max(4).optional(),
});

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** Parse a data URL (or bare base64) into raw bytes + mime + extension. */
function parseImageRef(image: string): { bytes: Buffer; mime: string; ext: string } | null {
  const match = image.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  let mime: string | undefined;
  let base64: string;
  if (match) {
    mime = match[1];
    base64 = match[2];
  } else {
    base64 = image;
  }
  try {
    const bytes = Buffer.from(base64, "base64");
    if (bytes.length === 0) return null;
    const ext = (mime ?? "image/png").split("/")[1]?.replace("jpeg", "jpg") ?? "png";
    return { bytes, mime: mime ?? MIME_BY_EXT[ext] ?? "image/png", ext };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const { type, prompt, effort, image, settings, controlnet, engine, seed, mvImages, genVersion, legacyMode, material, isPrivate, creationMode, imageLabels } = parsed.data;

  // Pay-by-result (engine2): engine-tagged tasks are billed ONLY at confirm —
  // generation + preview are free (mirrors the reference free tier). The old
  // billing (creation-time charge, first task free) stays for non-engine tasks.
  const payByResult = engine !== undefined;
  const taskCount = payByResult
    ? 0
    : await db.task.count({ where: { userId: user.id, isFeatured: false } });
  const cost = payByResult ? 0 : computeTaskCost({ type, taskCount });

  const taskId = randomUUID();
  let imageBase64: string | undefined;
  let imageMime: string | undefined;
  let inputImageUrl: string | undefined;
  let inputMime: string | undefined;

  let inputBytes: Buffer | undefined;
  if (image) {
    const parsedImage = parseImageRef(image);
    if (!parsedImage) {
      return NextResponse.json({ error: "invalid_image" }, { status: 400 });
    }
    // blob-in-DB (serverless-safe): reference image persisted on the task row.
    inputBytes = parsedImage.bytes;
    inputImageUrl = `/api/task/${taskId}/input`;
    inputMime = parsedImage.mime;
    imageBase64 = parsedImage.bytes.toString("base64");
    imageMime = parsedImage.mime;
  }

  const task = await db.task.create({
    data: {
      id: taskId,
      userId: user.id,
      type,
      prompt,
      step: "ModelGenerate",
      userState: "created",
      inputImageUrl,
      settings: {
        effort,
        height: settings?.height ?? 8,
        version: "v3",
        type: "model_generate",
        ...(inputMime ? { input_mime: inputMime } : {}),
        ...(engine ? { engine } : {}),
        ...(seed !== undefined ? { seed } : {}),
        ...(engine ? { pay_by_result: true } : {}),
        ...(mvImages ? { mv_image_count: mvImages.length } : {}),
        ...(genVersion ? { gen_version: genVersion } : {}),
        ...(legacyMode ? { legacy_mode: legacyMode } : {}),
        ...(material ? { material } : {}),
        ...(creationMode ? { creation_mode: creationMode } : {}),
        ...(imageLabels ? { image_labels: imageLabels } : {}),
        ...(controlnet ? { controlnet } : {}),
      },
      creditsSpent: cost,
      ...(engine ? { engine } : {}),
      ...(seed !== undefined ? { seed } : {}),
      ...(isPrivate ? { isPrivate } : {}),
      ...(inputBytes ? { inputBytes: new Uint8Array(inputBytes) } : {}), // blob-in-DB (serverless-safe)
    },
  });

  if (!payByResult) {
    try {
      await ledger.spend({
        userId: user.id,
        amount: cost,
        reason: cost === 0 ? "free_preview" : type === "RodinAgentic" ? "agentic_generation" : "standard_generation",
        taskId,
      });
    } catch (err) {
      // Roll the task row back — a failed charge must not leave a live task.
      await db.task.delete({ where: { id: task.id } }).catch(() => undefined);
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: "insufficient_credits", balance: err.balance, required: err.amount },
          { status: 402 },
        );
      }
      throw err;
    }
  }

  // Kick the pipeline. Neural tasks are CLIENT-driven (the browser calls the
  // engine directly and POSTs the mesh back) — no server enqueue for them.
  // Fast-tier and legacy tasks run the server pipeline as before.
  // Serverless (Vercel): after() keeps this invocation alive post-response.
  if (engine !== "neural") {
    const kick = () => runPipelineNow(taskId, { imageBase64, imageMime });
    if (typeof process !== "undefined" && process.env.VERCEL) {
      after(kick);
    } else {
      void kick();
    }
  }

  return NextResponse.json({
    uuid: taskId,
    producer: type === "RodinAgentic" ? "agentic" : "standard",
    ...(engine ? { engine, pay_by_result: true } : {}),
    job: { uuids: [taskId], subscription_key: "clone-local" },
  });
}
