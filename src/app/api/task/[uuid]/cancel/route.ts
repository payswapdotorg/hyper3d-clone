import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ledger } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cancel a running task (the studio's Cancel button during a neural run or
 * a server pipeline). Marks the task failed with an honest "canceled" error.
 * Pay-by-result tasks were never charged — nothing to refund. Legacy
 * creation-charged tasks (creditsSpent > 0) are refunded in full (Task 48
 * audit: pay only for what you keep).
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (task.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (task.userState === "DonePreview" || task.userState === "done") {
    return NextResponse.json({ error: "already_complete" }, { status: 409 });
  }
  if (task.userState === "failed") {
    return NextResponse.json({ canceled: true, already_failed: true });
  }

  const settings = { ...((task.settings as Record<string, unknown> | null) ?? {}) };
  delete settings.progress;
  await db.task.update({
    where: { id: uuid },
    data: {
      userState: "failed",
      error: "Canceled by user",
      settings,
      ...(task.creditsSpent > 0 ? { creditsSpent: 0 } : {}),
    },
  });

  // Refund a creation-time charge (legacy non-pay-by-result tasks only).
  let refunded = 0;
  if (task.creditsSpent > 0) {
    refunded = await ledger.grant({
      userId: user.id,
      amount: task.creditsSpent,
      reason: "cancel_refund",
    });
  }

  return NextResponse.json({ canceled: true, ...(refunded ? { refunded } : {}) });
}
