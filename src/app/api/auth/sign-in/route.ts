import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, createSessionToken, sessionCookieHeader } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SignInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  // Make sure the demo account exists on a fresh database.
  await ensureSeeded();

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    user_uuid: user.id,
    username: user.username,
    email: user.email,
  });
  res.headers.append("Set-Cookie", sessionCookieHeader(token));
  return res;
}
