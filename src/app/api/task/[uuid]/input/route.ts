import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serve the stored reference input image for a task.
 * Deployment adaptation: served from Task.inputBytes (blob-in-DB) so it
 * works identically on serverless hosts with no filesystem. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task || !task.inputImageUrl) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const bytes = task.inputBytes;
  if (!bytes || bytes.length === 0) {
    return NextResponse.json({ error: "input_not_stored" }, { status: 404 });
  }

  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  const mime = typeof settings.input_mime === "string" ? settings.input_mime : "image/png";
  const body = new Uint8Array(bytes);
  return new NextResponse(body as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": mime,
      "cache-control": "public, max-age=3600",
    },
  });
}
