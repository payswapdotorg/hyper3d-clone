"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Hero, type DemoGenerateRequest } from "./hero";
import { Features } from "./sections/features";
import { ControlNetSection } from "./sections/controlnet";
import { HowItWorks } from "./sections/how-it-works";
import { Pipeline } from "./sections/pipeline";
import { Enterprise } from "./sections/enterprise";
import { Gallery } from "./sections/gallery";
import { WhyChoose } from "./sections/why-choose";
import { Workflows } from "./sections/workflows";
import { Research } from "./sections/research";
import { Faq } from "./sections/faq";
import { Pricing } from "./sections/pricing";
import { SignInDialog } from "./sign-in-dialog";
import { Studio, type StudioInitial } from "./studio/studio";
import { useSession } from "@/lib/use-session";
import type { EffortId, GenMode } from "@/lib/hyper3d";

interface StudioSeed {
  prompt: string;
  mode: GenMode;
  effort: EffortId;
}

const DEFAULT_SEED: StudioSeed = {
  prompt: "",
  mode: "image-to-3d",
  effort: "high",
};

export function Hyper3DApp() {
  const [view, setView] = useState<"landing" | "studio">("landing");
  const { user, refresh, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInIntent, setSignInIntent] = useState<string | undefined>(undefined);
  const [afterSignIn, setAfterSignIn] = useState<(() => void) | null>(null);
  const [studioInitial, setStudioInitial] = useState<StudioInitial>({
    ...DEFAULT_SEED,
    nonce: 0,
  });

  /* ---------- lock body scroll while studio is open ---------- */
  useEffect(() => {
    document.body.style.overflow = view === "studio" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  /* ---------- studio navigation ---------- */
  const openStudio = useCallback((seed: StudioSeed) => {
    setStudioInitial({ ...seed, nonce: Date.now() });
    setView("studio");
  }, []);

  /* ---------- auth flows ---------- */
  const requestAuth = useCallback(
    (intent: string, then?: () => void) => {
      setSignInIntent(intent);
      setAfterSignIn(then ? () => then : null);
      setSignInOpen(true);
    },
    [],
  );

  const handleSignInSuccess = useCallback(async () => {
    const info = await refresh();
    setAfterSignIn((fn) => {
      if (fn) fn();
      return null;
    });
    // Gate-found fix: the dialog no longer closes itself on success (it used
    // to clear afterSignIn mid-flight); we own the close here, AFTER the
    // pending action (e.g. open the studio) has run.
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

  /* ---------- landing intents ---------- */
  const handleHeroGenerate = useCallback(
    (req: DemoGenerateRequest) => {
      openStudio({ prompt: req.prompt, mode: req.mode, effort: req.effort });
    },
    [openStudio],
  );

  const handleStartCreating = useCallback(() => {
    if (!user) {
      requestAuth("Sign in to open your Rodin workspace.", () => openStudio(DEFAULT_SEED));
      return;
    }
    openStudio(DEFAULT_SEED);
  }, [user, requestAuth, openStudio]);

  const handleGalleryOpen = useCallback(
    (prompt: string) => {
      openStudio({ ...DEFAULT_SEED, prompt });
    },
    [openStudio],
  );

  return (
    <div className="flex min-h-screen flex-col bg-h3d-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-h3d-purple focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <SiteHeader
        authed={Boolean(user)}
        userEmail={user?.email ?? null}
        credits={user?.balance ?? 0}
        onSignIn={() => requestAuth("Access your Rodin workspace, credits, and generated assets.")}
        onSignOut={handleSignOut}
        onStartCreating={handleStartCreating}
      />

      <main id="main-content" className="flex-1">
        <Hero onGenerate={handleHeroGenerate} />
        <Features />
        <ControlNetSection />
        <HowItWorks />
        <Pipeline />
        <Enterprise />
        <Gallery onOpenModel={handleGalleryOpen} />
        <WhyChoose />
        <Workflows />
        <Research />
        <Faq />
        <Pricing onStartFree={handleStartCreating} />
      </main>

      <SiteFooter />

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

      {view === "studio" && (
        <Studio
          initial={studioInitial}
          user={user}
          onNeedAuth={requestAuth}
          onSessionRefresh={() => void refresh()}
          onClose={() => setView("landing")}
        />
      )}
    </div>
  );
}
