"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  signIn as mockSignIn,
  signOut as mockSignOut,
  useHyper3dAuth,
  useHyper3dCredits,
  writeCredits,
} from "@/lib/auth";
import { INITIAL_CREDITS, type EffortId, type GenMode } from "@/lib/hyper3d";

interface StudioSeed {
  prompt: string;
  mode: GenMode;
  effort: EffortId;
  controlNet: DemoGenerateRequest["controlNet"];
  free: boolean;
}

type PendingAuth = "studio" | "generate" | null;

const DEFAULT_SEED: StudioSeed = {
  prompt: "",
  mode: "text-to-3d",
  effort: "medium",
  controlNet: null,
  free: false,
};

export function Hyper3DApp() {
  const [view, setView] = useState<"landing" | "studio">("landing");
  const { authed, email } = useHyper3dAuth();
  const credits = useHyper3dCredits();
  const [guestAck, setGuestAck] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInIntent, setSignInIntent] = useState<string | undefined>(undefined);
  const [resumeSignal, setResumeSignal] = useState(0);
  const [studioInitial, setStudioInitial] = useState<StudioInitial>({
    ...DEFAULT_SEED,
    freePreview: false,
    nonce: 0,
  });

  const pendingKindRef = useRef<PendingAuth>(null);
  const pendingStudioReqRef = useRef<StudioSeed | null>(null);

  /* ---------- lock body scroll while studio is open ---------- */
  useEffect(() => {
    document.body.style.overflow = view === "studio" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  /* ---------- studio navigation ---------- */
  const openStudio = useCallback((seed: StudioSeed) => {
    setStudioInitial({
      prompt: seed.prompt,
      mode: seed.mode,
      effort: seed.effort,
      controlNet: seed.controlNet,
      freePreview: seed.free,
      nonce: Date.now(),
    });
    setView("studio");
  }, []);

  /* ---------- auth flows ---------- */
  const requestAuth = useCallback(
    (intent: string, kind: Exclude<PendingAuth, null>, seed?: StudioSeed) => {
      pendingKindRef.current = kind;
      pendingStudioReqRef.current = seed ?? null;
      setSignInIntent(intent);
      setSignInOpen(true);
    },
    [],
  );

  const resolvePending = useCallback(
    (via: "auth" | "guest") => {
      const kind = pendingKindRef.current;
      const seed = pendingStudioReqRef.current;
      pendingKindRef.current = null;
      pendingStudioReqRef.current = null;
      if (via === "guest") setGuestAck(true);
      if (kind === "studio" && seed) {
        openStudio(seed);
      } else if (kind === "generate") {
        setResumeSignal((n) => n + 1);
      }
    },
    [openStudio],
  );

  const handleSignInSuccess = useCallback(
    (userEmail: string) => {
      mockSignIn(userEmail);
      toast.success(`Welcome, ${userEmail.split("@")[0]}`, {
        description: `${INITIAL_CREDITS} starter credits loaded · Free 7-day trial active.`,
      });
      resolvePending("auth");
    },
    [resolvePending],
  );

  const handleGuest = useCallback(() => {
    resolvePending("guest");
  }, [resolvePending]);

  const handleSignOut = useCallback(() => {
    mockSignOut();
    setGuestAck(false);
    toast.info("Signed out", { description: "Local session and credits cleared." });
  }, []);

  /* ---------- credits ---------- */
  const consumeCredit = useCallback((): boolean => {
    if (credits <= 0) {
      toast.error("Out of credits", {
        description: "Upgrade your plan or add a credit pack to keep generating.",
      });
      return false;
    }
    writeCredits(credits - 1);
    return true;
  }, [credits]);

  /* ---------- landing intents ---------- */
  const handleHeroGenerate = useCallback(
    (req: DemoGenerateRequest) => {
      const wantsGeneration = req.prompt.trim().length > 0 && !req.free;
      if (!authed && !guestAck && wantsGeneration) {
        requestAuth(
          "Sign in to generate — or continue as a guest (previews stay free).",
          "studio",
          {
            prompt: req.prompt,
            mode: req.mode,
            effort: req.effort,
            controlNet: req.controlNet,
            free: req.free,
          },
        );
        return;
      }
      openStudio({
        prompt: req.prompt,
        mode: req.mode,
        effort: req.effort,
        controlNet: req.controlNet,
        free: req.free,
      });
    },
    [authed, guestAck, openStudio, requestAuth],
  );

  const handleStartCreating = useCallback(() => {
    openStudio(DEFAULT_SEED);
  }, [openStudio]);

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
        authed={authed}
        userEmail={email}
        credits={credits}
        onSignIn={() => {
          pendingKindRef.current = null;
          setSignInIntent(undefined);
          setSignInOpen(true);
        }}
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
            pendingKindRef.current = null;
            pendingStudioReqRef.current = null;
          }
        }}
        onSuccess={handleSignInSuccess}
        onGuest={handleGuest}
        intent={signInIntent}
      />

      {view === "studio" && (
        <Studio
          initial={studioInitial}
          authed={authed}
          credits={credits}
          guestAcknowledged={guestAck}
          onRequestAuth={(intent) => {
            // generation gate: resumed via resumeSignal after auth/guest
            requestAuth(intent, "generate");
          }}
          onConsumeCredit={consumeCredit}
          onClose={() => setView("landing")}
          resumeSignal={resumeSignal}
        />
      )}
    </div>
  );
}
