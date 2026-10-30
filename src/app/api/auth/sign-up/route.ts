import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, createSessionToken, sessionCookieHeader } from "@/lib/auth";
import { INITIAL_BALANCE } from "@/lib/credits";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sign-up (Task 48 backend audit): the sign-in panel's "Sign Up to create a
 * new account!" link is now real. Creates the account, hashes the password
 * (scrypt, same as sign-in), and establishes the session immediately — the
 * user lands signed in, exactly like the reference's e-mail flow.
 *
 * t65 anchor fix: the starting grant is INITIAL_BALANCE (50) from
 * credits.ts — the same constant the ledger, the seeded demo account, the
 * tests, and every credit-related page use. A literal 40 lived here before
 * ("reference free tier"), which contradicted the metering contract; the
 * grant is now imported, not hand-set.
 */
const SignUpSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(40)
    .optional(),
  // t53 G6.3: referrer's code from the /r//a/ short links — captured and
  // stored honestly (no invented bonus economics).
  referralCode: z
    .string()
    .trim()
    .min(2, "Referral code looks too short")
    .max(40)
    .optional(),
});

function randomReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SignUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }
  const email = parsed.data.email.toLowerCase();

  await ensureSeeded();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "email_taken", message: "An account with this email already exists — sign in instead." },
      { status: 409 },
    );
  }

  const username =
    parsed.data.username?.trim() || email.split("@")[0].replace(/[^a-z0-9]+/gi, " ").trim().slice(0, 40) || "creator";

  const user = await db.user.create({
    data: {
      email,
      username,
      passwordHash: hashPassword(parsed.data.password),
      balance: INITIAL_BALANCE, // the ledger's own signup constant (50)
      preferences: { rodin_generation_mode: "standard" },
      referralCode: randomReferralCode(),
      referredByCode: parsed.data.referralCode || null,
    },
  });

  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    user_uuid: user.id,
    username: user.username,
    email: user.email,
  });
  res.headers.append("Set-Cookie", sessionCookieHeader(token));
  return res;
}
