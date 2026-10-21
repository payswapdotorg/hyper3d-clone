import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Blueprint §5 user object shape. */
export async function POST(req: NextRequest) {
  await ensureSeeded();
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const preferences =
    user.preferences && typeof user.preferences === "object" ? user.preferences : { rodin_generation_mode: "standard" };

  // Redo quotas (reference: Creator tier Geometry ×20 / Material ×6) live in
  // user preferences; absent counters mean untouched quotas.
  const redoPrefs = (preferences as Record<string, unknown>).redo as
    | { geometry?: number; material?: number }
    | undefined;

  return NextResponse.json({
    user_uuid: user.id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    frozen: 0,
    chances_left_to_set_private_task: 10,
    registration_time: user.createdAt.toISOString(),
    has_complete_order: false,
    has_purchase_credit: false,
    preferences,
    redo: {
      geometry: redoPrefs?.geometry ?? 20,
      material: redoPrefs?.material ?? 6,
    },
    subscriptions: {
      current_active: false,
      highest_level: "Free",
      trial_eligibility: true,
      active_subscriptions: [],
      quota_unlimited_plan: 5,
      quota_reset_remain: 52652,
    },
    privileges: ["LowPriorityQueue"],
    features: ["user_queue.low_priority"],
    referral_code: user.referralCode,
  });
}
