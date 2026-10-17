import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildTaskCard } from "@/lib/task-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Task detail / status poll — blueprint §4 task-card shape. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({
    where: { id: uuid },
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(buildTaskCard(task, task.user));
}
