import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KNOWN_EXTS = ["png", "jpg", "jpeg", "webp"];

/** Serve the stored reference input image for a task. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task || !task.inputImageUrl) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  const mime = typeof settings.input_mime === "string" ? settings.input_mime : "image/png";
  const dir = path.join(process.cwd(), "db", "generated", uuid);

  for (const ext of KNOWN_EXTS) {
    try {
      const bytes = await readFile(path.join(dir, `input.${ext}`));
      return new NextResponse(bytes as unknown as BodyInit, {
        status: 200,
        headers: {
          "content-type": mime,
          "cache-control": "public, max-age=3600",
        },
      });
    } catch {
      // try the next extension
    }
  }
  return NextResponse.json({ error: "input_not_stored" }, { status: 404 });
}
