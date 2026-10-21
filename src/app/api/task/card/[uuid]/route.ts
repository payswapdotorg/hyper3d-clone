import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildTaskCard, TASK_BLOB_OMIT } from "@/lib/task-serializer";
import { resumeStaleTask } from "@/lib/queue";
import { isComplete, type TaskState } from "@/lib/task-machine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Serverless: this poll doubles as the freeze-recovery driver — a stale
// non-terminal task is resumed by the request's own lifetime + grace.
export const maxDuration = 60;

/** Task detail / status poll — blueprint §4 task-card shape. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({
    where: { id: uuid },
    omit: TASK_BLOB_OMIT,
    include: { user: { select: { id: true, username: true, email: true } } },
  });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Serverless freeze recovery: if this task's pipeline died mid-flight
  // (stale heartbeat), this poll drives it to completion — from the stored
  // spec when possible (no re-billed AI calls).
  // Fired PRE-response (request lifetime + platform grace): after() was
  // empirically unreliable on this deployment — ~500 card polls of a wedged
  // task never executed the after() callback (resume_count never
  // incremented, 2026-10-19 audit). resumeStaleTask is heartbeat-claimed
  // and resume-capped, so overlapping fires across polls/instances are safe.
  if (!isComplete(task.userState as TaskState) && task.userState !== "failed") {
    void resumeStaleTask(uuid);
  }

  return NextResponse.json(buildTaskCard(task, task.user));
}
