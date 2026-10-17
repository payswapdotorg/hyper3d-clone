import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST as signInRoute } from "@/app/api/auth/sign-in/route";
import { POST as signOutRoute } from "@/app/api/auth/sign-out/route";
import { POST as getUserInfoRoute } from "@/app/api/user/get_info/route";
import { POST as createTaskRoute } from "@/app/api/task/route";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { jsonRequest, sessionCookieFrom, resetDb, BASE } from "@/lib/testing/api";

describe("auth", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureSeeded({ posters: false });
  });

  it("hashes and verifies passwords", () => {
    const hash = hashPassword("demo1234");
    expect(hash).not.toContain("demo1234");
    expect(verifyPassword("demo1234", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
    // Salted: two hashes of the same password differ.
    expect(hashPassword("demo1234")).not.toBe(hash);
  });

  it("round-trips session tokens and rejects tampering", () => {
    const token = createSessionToken("user-123");
    const payload = verifySessionToken(token);
    expect(payload?.uid).toBe("user-123");
    expect(typeof payload?.iat).toBe("number");

    expect(verifySessionToken(`${token}x`)).toBeNull();
    expect(verifySessionToken("garbage")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("aaa.bbb")).toBeNull();
  });

  it("sign-in rejects wrong credentials", async () => {
    const res = await signInRoute(
      jsonRequest(`${BASE}/api/auth/sign-in`, "POST", { email: "demo@hyper3d.clone", password: "wrong" }),
    );
    expect(res.status).toBe(401);
  });

  it("sign-in rejects unknown users and bad bodies", async () => {
    const unknown = await signInRoute(
      jsonRequest(`${BASE}/api/auth/sign-in`, "POST", { email: "nobody@example.com", password: "x" }),
    );
    expect(unknown.status).toBe(401);

    const badBody = await signInRoute(
      new NextRequest(`${BASE}/api/auth/sign-in`, { method: "POST", body: "not-json", headers: { "content-type": "application/json" } }),
    );
    expect(badBody.status).toBe(400);
  });

  it("sign-in sets an httpOnly session cookie for the demo user", async () => {
    const res = await signInRoute(
      jsonRequest(`${BASE}/api/auth/sign-in`, "POST", {
        email: "demo@hyper3d.clone",
        password: "demo1234",
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user_uuid: string; username: string; email: string };
    expect(body.email).toBe("demo@hyper3d.clone");

    const setCookie = res.headers.getSetCookie?.()[0] ?? res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("SameSite=Lax");

    // The cookie value is a valid session token.
    const pair = sessionCookieFrom(res);
    const token = pair.slice(SESSION_COOKIE.length + 1);
    const payload = verifySessionToken(token);
    expect(payload?.uid).toBe(body.user_uuid);
  });

  it("GET /api/task without a session cookie 401s", async () => {
    const res = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "x" }),
    );
    expect(res.status).toBe(401);
  });

  it("POST /api/user/get_info mirrors the blueprint §5 user shape", async () => {
    const signIn = await signInRoute(
      jsonRequest(`${BASE}/api/auth/sign-in`, "POST", {
        email: "demo@hyper3d.clone",
        password: "demo1234",
      }),
    );
    const cookie = sessionCookieFrom(signIn);
    const res = await getUserInfoRoute(jsonRequest(`${BASE}/api/user/get_info`, "POST", {}, cookie));
    expect(res.status).toBe(200);
    const info = (await res.json()) as Record<string, unknown>;

    expect(info.user_uuid).toBeTruthy();
    expect(info.username).toBeTruthy();
    expect(info.email).toBe("demo@hyper3d.clone");
    expect(info.balance).toBe(50);
    expect(info.frozen).toBe(0);
    expect(info.chances_left_to_set_private_task).toBe(10);
    expect(typeof info.registration_time).toBe("string");
    expect(info.has_complete_order).toBe(false);
    expect(info.has_purchase_credit).toBe(false);
    expect(info.preferences).toMatchObject({ rodin_generation_mode: expect.any(String) });
    expect(info.subscriptions).toMatchObject({
      current_active: false,
      highest_level: "Free",
      trial_eligibility: true,
      active_subscriptions: [],
      quota_unlimited_plan: 5,
      quota_reset_remain: expect.any(Number),
    });
    expect(info.privileges).toEqual(["LowPriorityQueue"]);
    expect(info.features).toEqual(["user_queue.low_priority"]);
    expect(typeof info.referral_code).toBe("string");

    // without cookie → 401
    const anon = await getUserInfoRoute(jsonRequest(`${BASE}/api/user/get_info`, "POST", {}));
    expect(anon.status).toBe(401);
  });

  it("sign-out clears the session cookie", async () => {
    const res = await signOutRoute();
    expect(res.status).toBe(200);
    const setCookie = res.headers.getSetCookie?.()[0] ?? res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
  });
});
