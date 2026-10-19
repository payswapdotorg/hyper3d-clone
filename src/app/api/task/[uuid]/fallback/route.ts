import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { enqueue } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BodySchema = z.object({
  reason: z.string().min(1).max(300).optional(),
});

/**
 * Neural → Fast fallback. The browser's neural run aborted (SSE error, stall
 * >75s, fetch failure, quota) and honest fallback was chosen: the server now
 * runs the production-proven lathe pipeline (Fast tier) for this task and
 * stamps engineUsed="fast" + fallbackReason on completion. Preview stays
 * free; the confirm gate is unchanged.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (task.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  if (settings.engine !== "neural") {
    return NextResponse.json({ error: "not_neural_task" }, { status: 400 });
  }
  if (task.userState === "DonePreview" || task.userState === "done") {
    return NextResponse.json({ error: "already_complete" }, { status: 409 });
  }
  if (task.userState === "failed" && !String(task.error ?? "").includes("canceled")) {
    // A genuinely failed task may still fall back (e.g. cancel then retry).
    return NextResponse.json({ error: "task_failed" }, { status: 409 });
  }

  let reason = "neural engine unavailable";
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (parsed.success && parsed.data.reason) reason = parsed.data.reason;
  } catch {
    /* body optional */
  }

  await db.task.update({
    where: { id: uuid },
    data: {
      userState: "created", // re-arm the state machine for the fast pipeline
      error: null,
      settings: { ...settings, fallback_reason: reason.slice(0, 300) },
      // Persist the reason on the COLUMN too: buildTaskCard reads
      // task.fallbackReason — without this the card lost the "why" after a
      // refresh (settings-only writes never surfaced).
      fallbackReason: reason.slice(0, 300),
    },
  });

  enqueue(uuid, { fast: true });
  return NextResponse.json({ fallback: "fast", reason, task_uuid: uuid }, { status: 202 });
}
