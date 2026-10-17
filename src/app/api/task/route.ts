import { NextRequest, NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { InsufficientCreditsError, computeTaskCost } from "@/lib/credits";
import { ledger } from "@/lib/ledger";
import { enqueue } from "@/lib/queue";

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
  const { type, prompt, effort, image, settings } = parsed.data;

  // Only the user's own generations count toward the free-preview rule —
  // seeded featured gallery rows (demo-authored) are not generation history.
  const taskCount = await db.task.count({ where: { userId: user.id, isFeatured: false } });
  const cost = computeTaskCost({ type, taskCount });

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
      },
      creditsSpent: cost,
      ...(inputBytes ? { inputBytes: new Uint8Array(inputBytes) } : {}), // blob-in-DB (serverless-safe)
    },
  });

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

  // Kick the pipeline. Serverless (Vercel): after() keeps this invocation
  // alive post-response so the paced pipeline can run to completion (or be
  // resumed by the card poll's resumeStaleTask if this invocation dies —
  // spec-first persistence means no re-billed AI calls on resume). Local
  // dev / tests: plain fire-and-forget, unchanged behavior.
  const kick = () => enqueue(taskId, { imageBase64, imageMime });
  if (typeof process !== "undefined" && process.env.VERCEL) {
    after(kick);
  } else {
    kick();
  }

  return NextResponse.json({
    uuid: taskId,
    producer: type === "RodinAgentic" ? "agentic" : "standard",
    job: { uuids: [taskId], subscription_key: "clone-local" },
  });
}
