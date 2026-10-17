"use client";

/**
 * Client session state backed by the REAL server session cookie.
 * All data comes from POST /api/user/get_info (blueprint §5 shape).
 */
import { useCallback, useEffect, useState } from "react";

export const SESSION_EVENT = "hyper3d-session-change";

export interface UserInfo {
  user_uuid: string;
  username: string;
  email: string;
  balance: number;
  frozen: number;
  chances_left_to_set_private_task: number;
  registration_time: string;
  has_complete_order: boolean;
  has_purchase_credit: boolean;
  preferences: Record<string, unknown>;
  subscriptions: Record<string, unknown>;
  privileges: string[];
  features: string[];
  referral_code: string;
}

export function useSession(): {
  user: UserInfo | null;
  loading: boolean;
  refresh: () => Promise<UserInfo | null>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<UserInfo | null> => {
    try {
      const res = await fetch("/api/user/get_info", { method: "POST", cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const info = (await res.json()) as UserInfo;
      setUser(info);
      return info;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      setUser(null);
      window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: null }));
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
    const onChange = () => {
      void refresh();
    };
    window.addEventListener(SESSION_EVENT, onChange);
    return () => {
      window.removeEventListener(SESSION_EVENT, onChange);
    };
  }, [refresh]);

  return { user, loading, refresh, signOut };
}
