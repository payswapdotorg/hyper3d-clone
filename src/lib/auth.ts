/**
 * Server-side session auth — HMAC-signed httpOnly cookie.
 *
 * Passwords: scrypt (node:crypto) with per-hash random salt.
 * Sessions: base64url(JSON payload).base64url(HMAC-SHA256) with the
 * SESSION_SECRET; stateless verification, no session store needed.
 *
 * Route handlers read the cookie straight from the request (never through
 * next/headers) so they stay directly invocable under vitest.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "./db";

export const SESSION_COOKIE = "h3d_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const SECRET = process.env.SESSION_SECRET ?? "hyper3d-clone-dev-secret-change-me";

export interface SessionPayload {
  uid: string;
  iat: number;
}

/* ------------------------------ passwords ------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

/* ------------------------------ session tokens ------------------------------ */

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { uid: userId, iat: Math.floor(Date.now() / 1000) };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.iat !== "number") return null;
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------ cookie headers ------------------------------ */

export function sessionCookieHeader(token: string, maxAgeSec: number = SESSION_MAX_AGE): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/* ------------------------------ request helper ------------------------------ */

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  balance: number;
  preferences: unknown;
  referralCode: string;
  createdAt: Date;
};

/** Read + verify the session cookie on a request, then load the user. */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  // t53: run the light migration guard before the first User select — the
  // Prisma client now includes referredByCode, which may not exist yet on a
  // pre-t53 database (once per process, no-op afterwards).
  const { ensureLightMigrations } = await import("./light-migrate");
  await ensureLightMigrations();
  const user = await db.user.findUnique({ where: { id: payload.uid } });
  if (!user) return null;
  return user;
}
