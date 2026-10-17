"use client";

/**
 * Mock auth matching the real site's contract (PRODUCT_FACTS §f):
 * localStorage keys `token` + `user_uuid`, window event `hyper3d-auth-change`,
 * and a `__HYPER3D_AUTH__` global for inspection.
 *
 * State is exposed through useSyncExternalStore so React 19 subscribes to the
 * localStorage "store" without setState-in-effect cascades.
 */

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { INITIAL_CREDITS } from "@/lib/hyper3d";

export interface Hyper3dAuth {
  token: string;
  user_uuid: string;
}

export const AUTH_EVENT = "hyper3d-auth-change";
export const EMAIL_KEY = "hyper3d-email";
const CREDITS_KEY = "hyper3d-credits";

export const INITIAL_CREDITS_VALUE = INITIAL_CREDITS;

/* ------------------------------ store plumbing ------------------------------ */

function ls(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* non-fatal */
  }
}

function lsRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* non-fatal */
  }
}

function notify() {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: readAuthRaw() }));
}

export function subscribeHyper3d(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readAuthRaw(): Hyper3dAuth | null {
  const token = ls("token");
  const user_uuid = ls("user_uuid");
  if (token && user_uuid) return { token, user_uuid };
  return null;
}

function getAuthSnapshot(): string {
  return JSON.stringify([ls("token"), ls("user_uuid"), ls(EMAIL_KEY)]);
}

function getServerAuthSnapshot(): string {
  return JSON.stringify([null, null, null]);
}

function getCreditsSnapshot(): number {
  const raw = ls(CREDITS_KEY);
  if (raw === null) return INITIAL_CREDITS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : INITIAL_CREDITS;
}

function getServerCreditsSnapshot(): number {
  return INITIAL_CREDITS;
}

/* ------------------------------ auth actions ------------------------------ */

export function readAuth(): Hyper3dAuth | null {
  if (typeof window === "undefined") return null;
  return readAuthRaw();
}

export function signIn(email: string): Hyper3dAuth {
  const token = `demo_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const user_uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  lsSet("token", token);
  lsSet("user_uuid", user_uuid);
  lsSet(EMAIL_KEY, email);
  if (ls(CREDITS_KEY) === null) lsSet(CREDITS_KEY, String(INITIAL_CREDITS));
  const auth: Hyper3dAuth = { token, user_uuid };
  try {
    (window as unknown as Record<string, unknown>).__HYPER3D_AUTH__ = auth;
  } catch {
    /* non-fatal */
  }
  notify();
  return auth;
}

export function signOut(): void {
  lsRemove("token");
  lsRemove("user_uuid");
  lsRemove(EMAIL_KEY);
  lsRemove(CREDITS_KEY);
  try {
    (window as unknown as Record<string, unknown>).__HYPER3D_AUTH__ = null;
  } catch {
    /* non-fatal */
  }
  notify();
}

export function writeCredits(n: number): void {
  if (typeof window === "undefined") return;
  lsSet(CREDITS_KEY, String(n));
  notify();
}

/* ------------------------------ hooks ------------------------------ */

export function useHyper3dAuth(): {
  authed: boolean;
  token: string | null;
  userUuid: string | null;
  email: string | null;
} {
  const snapshot = useSyncExternalStore(
    subscribeHyper3d,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const parsed = useMemo(
    () => JSON.parse(snapshot) as [string | null, string | null, string | null],
    [snapshot],
  );
  return {
    authed: Boolean(parsed[0] && parsed[1]),
    token: parsed[0],
    userUuid: parsed[1],
    email: parsed[2],
  };
}

export function useHyper3dCredits(): number {
  return useSyncExternalStore(
    subscribeHyper3d,
    getCreditsSnapshot,
    getServerCreditsSnapshot,
  );
}

/** Keeps a ref updated with the latest callback without writing during render. */
export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
