"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SignInDialog } from "./sign-in-dialog";
import { Studio, type StudioInitial } from "./studio/studio";
import { WORKSPACE_TAB_ROUTES } from "@/lib/workspace-tabs";
import { useSession } from "@/lib/use-session";

const DEFAULT_SEED: StudioInitial = {
  prompt: "",
  mode: "image-to-3d",
  effort: "high",
  nonce: 0,
};

export function Hyper3DApp({
  initialView,
}: {
  initialView?: "login" | "contact";
} = {}) {
  const router = useRouter();
  const { user, refresh, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInIntent, setSignInIntent] = useState<string | undefined>(undefined);
  const [afterSignIn, setAfterSignIn] = useState<(() => void) | null>(null);
  /* t53 G6: deep-link auth state — /signup, /r/<code>, /a/<code> redirect in
   * with ?auth=signup[&referral_code=<code>]; the panel opens in sign-up mode
   * with the referrer's code prefilled (read-only, honestly stored). */
  const [signInMode, setSignInMode] = useState<"signin" | "signup">("signin");
  const [signInReferral, setSignInReferral] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) return; // already signed in — deep-link is moot
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "signup") return;
    const referral = params.get("referral_code")?.trim().slice(0, 40) || undefined;
    // One-time client-only initialization from the URL (no event to hook):
    // the recommended pattern for deep links — rule is over-strict here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignInReferral(referral);

    setSignInMode("signup");

    setSignInIntent(
      referral ? "You were invited — create an account to continue." : "Create an account to continue.",
    );

    setSignInOpen(true);
  }, [user]);

  /* ---------- t72: /workspace/login — the reference's dedicated login
   * route renders the login view for guests (its marketing header Login
   * button and hero "Start Creating" CTA both point here, probed
   * 2026-10-31); a session — existing or just created — continues into
   * the studio, exactly like the reference's post-login landing. ---------- */
  const loginView = initialView === "login";
  const loginHandledRef = useRef(false);
  useEffect(() => {
    if (!loginView || loginHandledRef.current) return;
    // the ?auth=signup deep link owns the panel on this route (above)
    if (new URLSearchParams(window.location.search).get("auth") === "signup") return;
    if (!user) {
      // guests get the open panel (signin mode, no intent banner).
      // One-time client-only initialization from the route (no event to
      // hook): same deep-link pattern as the effect above — the rule is
      // over-strict here.
      loginHandledRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSignInMode("signin");
      setSignInOpen(true);
      return;
    }
    // already signed in — land in the studio
    loginHandledRef.current = true;
    router.replace(WORKSPACE_TAB_ROUTES.asset);
  }, [loginView, user, router]);

  /* ---------- auth flows ---------- */
  const requestAuth = useCallback((intent: string, then?: () => void) => {
    setSignInIntent(intent);
    setSignInMode("signin");
    setAfterSignIn(then ? () => then : null);
    setSignInOpen(true);
  }, []);

  const handleSignInSuccess = useCallback(async () => {
    const info = await refresh();
    setAfterSignIn((fn) => {
      if (fn) fn();
      return null;
    });
    // Gate-found fix: the dialog no longer closes itself on success (it used
    // to clear afterSignIn mid-flight); we own the close here, AFTER the
    // pending action has run.
    setSignInOpen(false);
    setSignInIntent(undefined);
    toast.success(`Welcome, ${info?.username ?? "creator"}`, {
      description: "Session started · 50 starter credits on the demo account.",
    });
    // t72: a sign-in completed on the /workspace/login route lands in the
    // studio (the reference's post-login landing).
    if (loginView) router.replace(WORKSPACE_TAB_ROUTES.asset);
  }, [refresh, loginView, router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast.info("Signed out", { description: "Session cookie cleared." });
  }, [signOut]);

  /* ---------- studio seed (future deep-links can pre-seed a prompt) ---------- */

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-h3d-purple focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Studio
        initial={DEFAULT_SEED}
        user={user}
        onNeedAuth={requestAuth}
        onSessionRefresh={() => void refresh()}
        onSignOut={handleSignOut}
        /* t73: /workspace/contact-us mounts the same studio with the
           "Chat with us" dock opened (the reference's own contact
           surface — probed 2026-10-31, agent-walked). */
        chatInitiallyOpen={initialView === "contact"}
      />

      <SignInDialog
        open={signInOpen}
        mode={signInMode}
        referralCode={signInReferral}
        onOpenChange={(open) => {
          setSignInOpen(open);
          if (!open) {
            setSignInIntent(undefined);
            setSignInMode("signin");
            setAfterSignIn(null);
          }
        }}
        onSuccess={() => void handleSignInSuccess()}
        intent={signInIntent}
      />
    </>
  );
}
