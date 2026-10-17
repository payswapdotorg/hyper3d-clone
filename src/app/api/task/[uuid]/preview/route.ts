import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Poster PNG rendered server-side from the task's actual geometry. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const bytes = await readFile(path.join(process.cwd(), "db", "generated", uuid, "poster.png"));
    return new NextResponse(bytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "poster_not_ready" }, { status: 404 });
  }
}
