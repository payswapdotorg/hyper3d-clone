import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TASK_BLOB_OMIT } from "@/lib/task-serializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProgressPostSchema = z.object({
  message: z.string().min(1).max(300),
  percent: z.number().int().min(0).max(100).optional(),
  stage: z.string().min(1).max(40).optional(),
});

/**
 * Neural progress heartbeat (browser → server). The neural run happens
 * client-direct, so the browser is the only place that knows the live stage;
 * it posts here so the task card / rail reflect real progress and
 * resumeStaleTask can tell "client-driven" from "server pipeline died".
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: uuid }, omit: TASK_BLOB_OMIT });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (task.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (task.userState === "DonePreview" || task.userState === "done" || task.userState === "failed") {
    return NextResponse.json({ error: "task_not_running" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ProgressPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  const settings = { ...((task.settings as Record<string, unknown> | null) ?? {}) };
  settings.progress = {
    message: parsed.data.message,
    percent: parsed.data.percent ?? null,
    at: Date.now(),
    ...(parsed.data.stage ? { stage: parsed.data.stage } : {}),
  };
  if (task.userState === "created") {
    // First heartbeat: visibly move the task into the pipeline.
    await db.task.update({ where: { id: uuid }, data: { userState: "queued", settings } });
  } else {
    await db.task.update({ where: { id: uuid }, data: { settings } });
  }

  return NextResponse.json({ ok: true });
}

/** Thin status poll for the neural flow (cheaper than the full card). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid }, omit: TASK_BLOB_OMIT });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  const progress = (settings.progress as { message?: string; percent?: number; stage?: string; at?: number } | undefined) ?? null;
  return NextResponse.json({
    task_uuid: uuid,
    user_state: task.userState,
    engine: task.engine ?? null,
    engine_used: task.engineUsed ?? null,
    progress,
    elapsed_ms: task.generateTime ? null : Date.now() - task.createdAt.getTime(),
  });
}
