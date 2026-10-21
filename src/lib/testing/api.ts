import { NextRequest } from "next/server";
import { POST as signInRoute } from "@/app/api/auth/sign-in/route";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEMO_EMAIL, DEMO_PASSWORD, ensureSeeded } from "@/lib/seed";

/**
 * Test-only helpers for invoking Next.js route handlers directly under
 * vitest (no server). Route handlers are pure enough for this because they
 * read the session from the request cookies, never from next/headers.
 */

export function jsonRequest(
  url: string,
  method: "GET" | "POST",
  body?: unknown,
  cookie?: string,
): NextRequest {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return new NextRequest(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function multipartRequest(
  url: string,
  file: { name: string; type: string; bytes: Uint8Array },
  fieldName = "file",
): NextRequest {
  const form = new FormData();
  form.append(fieldName, new File([file.bytes as BlobPart], file.name, { type: file.type }));
  return new NextRequest(url, { method: "POST", body: form });
}

export function routeCtx<T extends Record<string, string>>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) };
}

/** Extract the session cookie pair ("h3d_session=...") from a Set-Cookie header. */
export function sessionCookieFrom(res: Response): string {
  const all = res.headers.getSetCookie?.() ?? [];
  const raw = all[0] ?? res.headers.get("set-cookie") ?? "";
  const pair = raw.split(";")[0];
  if (!pair.startsWith("h3d_session=")) {
    throw new Error(`no session cookie in set-cookie: ${raw}`);
  }
  return pair;
}

/** Sign the (already existing) demo user in and return a session cookie. */
export async function signInAs(
  creds: { email: string; password: string } = { email: DEMO_EMAIL, password: DEMO_PASSWORD },
): Promise<{ cookie: string; userId: string }> {
  await ensureSeeded({ posters: false });
  const res = await signInRoute(
    jsonRequest("http://localhost/api/auth/sign-in", "POST", creds),
  );
  if (res.status !== 200) throw new Error(`sign-in failed: ${res.status}`);
  const body = (await res.json()) as { user_uuid: string };
  return { cookie: sessionCookieFrom(res), userId: body.user_uuid };
}

export async function createTestUser(opts: {
  email: string;
  password?: string;
  balance?: number;
}): Promise<{ id: string; email: string; password: string }> {
  const password = opts.password ?? "pass1234";
  const user = await db.user.create({
    data: {
      email: opts.email,
      username: opts.email.split("@")[0],
      passwordHash: hashPassword(password),
      balance: opts.balance ?? 50,
      preferences: { rodin_generation_mode: "standard" },
      referralCode: `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    },
  });
  return { id: user.id, email: opts.email, password };
}

/** Wipe task/credit/user data between tests (featured seeds are re-created lazily). */
export async function resetDb(): Promise<void> {
  await db.creditEntry.deleteMany();
  await db.task.deleteMany();
  await db.user.deleteMany();
}

export const BASE = "http://localhost";
