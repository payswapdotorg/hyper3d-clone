import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Poster PNG rendered server-side from the task's actual geometry.
 * Deployment adaptation: served from Task.posterBytes (blob-in-DB) so it
 * works identically on serverless hosts with no filesystem. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const bytes = task.posterBytes;
  if (!bytes || bytes.length === 0) {
    return NextResponse.json({ error: "poster_not_ready" }, { status: 404 });
  }
  const body = new Uint8Array(bytes);
  return new NextResponse(body as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
    },
  });
}
