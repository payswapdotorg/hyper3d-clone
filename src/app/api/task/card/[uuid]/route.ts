import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { buildTaskCard } from "@/lib/task-serializer";
import { resumeStaleTask } from "@/lib/queue";
import { isComplete, type TaskState } from "@/lib/task-machine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Serverless: this poll doubles as the freeze-recovery driver — a stale
// non-terminal task is resumed post-response inside after().
export const maxDuration = 60;

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

  // Serverless freeze recovery: if this task's pipeline died mid-flight
  // (stale heartbeat), this poll drives it to completion — from the stored
  // spec when possible (no re-billed AI calls). Local dev: fire-and-forget.
  if (!isComplete(task.userState as TaskState) && task.userState !== "failed") {
    if (typeof process !== "undefined" && process.env.VERCEL) {
      after(() => resumeStaleTask(uuid));
    } else {
      void resumeStaleTask(uuid);
    }
  }

  return NextResponse.json(buildTaskCard(task, task.user));
}
