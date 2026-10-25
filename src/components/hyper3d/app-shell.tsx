"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { SignInDialog } from "./sign-in-dialog";
import { Studio, type StudioInitial } from "./studio/studio";
import { useSession } from "@/lib/use-session";

const DEFAULT_SEED: StudioInitial = {
  prompt: "",
  mode: "image-to-3d",
  effort: "high",
  nonce: 0,
};

export function Hyper3DApp() {
  const { user, refresh, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInIntent, setSignInIntent] = useState<string | undefined>(undefined);
  const [afterSignIn, setAfterSignIn] = useState<(() => void) | null>(null);

  /* ---------- auth flows ---------- */
  const requestAuth = useCallback((intent: string, then?: () => void) => {
    setSignInIntent(intent);
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
  }, [refresh]);

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
      />

      <SignInDialog
        open={signInOpen}
        onOpenChange={(open) => {
          setSignInOpen(open);
          if (!open) {
            setSignInIntent(undefined);
            setAfterSignIn(null);
          }
        }}
        onSuccess={() => void handleSignInSuccess()}
        intent={signInIntent}
      />
    </>
  );
}
