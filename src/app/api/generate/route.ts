import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";
import { GALLERY_FALLBACK_IMAGES, hashString } from "@/lib/hyper3d";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GenerateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  mode: z
    .enum(["image-to-3d", "text-to-3d", "remix-gen", "turbo-gen", "editing-3d"])
    .optional()
    .default("text-to-3d"),
  effort: z
    .enum(["extreme-low", "low", "medium", "high", "extreme-high"])
    .optional()
    .default("medium"),
});

const FALLBACK_IMAGES = GALLERY_FALLBACK_IMAGES;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const { prompt, mode, effort } = parsed.data;
  const taskId = `task_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;

  try {
    const zai = await ZAI.create();
    const result = await zai.images.generations.create({
      prompt: `game-ready 3D asset render of ${prompt}, dark studio background, purple rim lighting, PBR materials, high quality, detailed`,
      size: "1024x1024",
    });

    const base64 = result?.data?.[0]?.base64;
    if (!base64) throw new Error("SDK returned no image data");

    const dir = path.join(process.cwd(), "public", "images", "generated");
    await mkdir(dir, { recursive: true });
    const fileName = `${Date.now()}-${randomBytes(4).toString("hex")}.png`;
    await writeFile(path.join(dir, fileName), Buffer.from(base64, "base64"));

    return NextResponse.json({
      url: `/images/generated/${fileName}`,
      taskId,
      meta: { mode, effort },
    });
  } catch {
    // Any SDK failure degrades gracefully to a static gallery image.
    const fallback = FALLBACK_IMAGES[hashString(prompt) % FALLBACK_IMAGES.length];
    return NextResponse.json({
      url: fallback,
      taskId,
      meta: { mode, effort },
      fallback: true,
    });
  }
}
