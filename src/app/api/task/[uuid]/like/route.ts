import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Like toggle (Task 48 backend audit): one like per user per task
 * (@@unique(userId, taskId) makes the toggle idempotent). The denormalized
 * Task.likeCount is maintained in the same transaction so gallery counters
 * stay consistent. Auth-gated — guests get 401 (the reference requires an
 * account to like too).
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const task = await db.task.findUnique({ where: { id: uuid }, select: { id: true, userId: true } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const existing = await db.like.findUnique({
    where: { userId_taskId: { userId: user.id, taskId: uuid } },
  });

  if (existing) {
    // unlike
    const [, updated] = await db.$transaction([
      db.like.delete({ where: { id: existing.id } }),
      db.task.update({
        where: { id: uuid },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);
    return NextResponse.json({ liked: false, num_like: Math.max(0, updated.likeCount) });
  }

  const [, updated] = await db.$transaction([
    db.like.create({ data: { userId: user.id, taskId: uuid } }),
    db.task.update({
      where: { id: uuid },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);
  return NextResponse.json({ liked: true, num_like: updated.likeCount });
}
