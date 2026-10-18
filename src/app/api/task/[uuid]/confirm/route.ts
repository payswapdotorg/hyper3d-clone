import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmTaskCharge } from "@/lib/confirm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pay-by-result confirm gate (reference behavior: "Generate for free before
 * confirmation"). POST Confirm & Export — exactly 1 credit, atomic,
 * idempotent (no double-charge), floor 0.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (task.userId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  if (settings.pay_by_result !== true) {
    return NextResponse.json(
      { error: "not_pay_by_result", detail: "this task was already billed at creation" },
      { status: 400 },
    );
  }

  await req.json().catch(() => undefined); // body optional

  const outcome = await confirmTaskCharge(uuid, user.id);
  switch (outcome.status) {
    case "already_confirmed":
      return NextResponse.json({ already_confirmed: true, charged: 0, balance: outcome.balance });
    case "insufficient":
      return NextResponse.json(
        {
          error: "insufficient_credits",
          balance: outcome.balance,
          required: outcome.required,
          detail: "Out of credits — generation and preview remain free; top up to export.",
        },
        { status: 402 },
      );
    default:
      return NextResponse.json({ confirmed: true, charged: outcome.charged, balance: outcome.balance });
  }
}
