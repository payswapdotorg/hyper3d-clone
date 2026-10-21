import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildHistory, TASK_BLOB_OMIT } from "@/lib/task-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generation versions + model URLs for a finished task. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid }, omit: TASK_BLOB_OMIT });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const history = buildHistory(task);
  if (!history) {
    return NextResponse.json({ error: "not_complete", user_state: task.userState }, { status: 409 });
  }
  return NextResponse.json(history);
}
