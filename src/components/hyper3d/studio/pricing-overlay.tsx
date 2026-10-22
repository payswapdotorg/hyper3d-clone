"use client";

/**
 * Pricing overlay — the reference's full-screen membership view
 * (UX-recon 2026-10-22, agent-walked): clicking the topbar Subscribe /
 * 7-Day Trial pill opens a full-viewport fixed overlay (z-2000) over the
 * workspace — NO URL change, click-outside dismisses:
 *  - header: "JOIN OUR MEMBERSHIP" + "Access Premium Features and
 *    Exclusive Content"
 *  - "Pay by Result ❤️" line with the marketing widget: a GENERATE/Redo
 *    block, "before" chip, "Confirm" chip (illustrating pay-per-result)
 *  - Monthly | Yearly segmented toggle (Yearly −20%)
 *  - plan cards: Free (Your Plan) · Education (Not Verified) · Creator
 *    (7 FREE-DAY) · Business (RPM: 120, DashBoard) · Enterprise (Let's Talk)
 *    with the reference's own feature lists (360 credits/year, Unlimited
 *    Private Assets, OmniCraft tool tiers, ×50/×15 redos…)
 *  - "Trusted by Industry Leaders" logo row (Bambu Lab · Comfy · Google ·
 *    fal · Lovart)
 *
 * Honest wiring: plan "Select This Plan" actions show the reference-parity
 * toast (this clone's demo wallet already covers every feature); the
 * Monthly/Yearly toggle really switches the price row (−20%).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Cycle = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  strike?: { monthly?: number; yearly?: number };
  badge?: { text: string; kind: "current" | "trial" | "note" | "metric" };
  renewAssets: string;
  renewCredits: string;
  off?: string;
  features: { section?: string; items: string[] }[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    badge: { text: "Your Plan", kind: "current" },
    renewAssets: "—",
    renewCredits: "$1.5/credit",
    features: [
      { items: ["Generate for Free", "10 Private Assets", "Export from Legacy Model"] },
    ],
    cta: "Current Plan",
  },
  {
    id: "education",
    name: "Education",
    monthly: 12,
    yearly: 10,
    strike: { monthly: 24 },
    badge: { text: "Not Verified", kind: "note" },
    renewAssets: "~60 Assets",
    renewCredits: "360 credits renew per year",
    off: "66% Off",
    features: [{ items: ["Everything in Creator Tier"] }],
    cta: "Select This Plan",
  },
  {
    id: "creator",
    name: "Creator",
    monthly: 24,
    yearly: 19,
    badge: { text: "7 FREE-DAY", kind: "trial" },
    renewAssets: "~60 Assets",
    renewCredits: "360 credits renew per year",
    off: "47% Off",
    features: [
      { items: ["Unlimited Export & Any Use", "Unlimited Private Assets"] },
      {
        section: "Rodin",
        items: ["Multi-Image to 3D & Smart Low-Poly", "More Thinking Effort & Polycount Options", "HD Texture & Custom Texture"],
      },
      {
        section: "Image & Video",
        items: ["Free Creator Tier Models", "Business Tier Models", "Full Access"],
      },
      {
        section: "OmniCraft",
        items: ["Image Remix — Free", "HDRI Generator — Free", "8K Texture Generator — Free Downloads", "Image Enhancer — Unlimited 2K & 4K"],
      },
    ],
    cta: "Select This Plan",
  },
  {
    id: "business",
    name: "Business",
    monthly: 96,
    yearly: 77,
    badge: { text: "RPM: 120 · DashBoard", kind: "metric" },
    renewAssets: "~416 Assets",
    renewCredits: "2496 credits renew per year",
    off: "69% Off",
    features: [
      { items: ["Everything in Creator Tier", "Rodin API Full Access", "Up to 10 results at a time", "Up to 12K Textures & High-Poly Quads", "Redos: Geometry ×50 · Material ×15"] },
      { section: "Image & Video", items: ["Free Featured Business Models"] },
    ],
    cta: "Select This Plan",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: -1,
    yearly: -1,
    renewAssets: "Custom",
    renewCredits: "Custom volume",
    features: [{ items: ["Dedicated support & volume pricing", "Team seats", "SLA"] }],
    cta: "Let's Talk",
  },
];

const TRUSTED = ["Bambu Lab", "Comfy", "Google", "fal", "Lovart"];

export function PricingOverlay({ onClose }: { onClose: () => void }) {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const rootRef = useRef<HTMLDivElement>(null);

  /* click-outside dismisses (agent-verified on the reference: clicking the
   * backdrop area away from the cards closes the view) */
  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === rootRef.current) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Membership plans"
      onMouseDown={onBackdrop}
      className="fixed inset-0 z-[2100] overflow-y-auto bg-[#101114]/95 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-[1231px] px-6 pb-16 pt-[105px]">
        {/* header */}
        <div className="max-w-[754px]">
          <h2 className="text-[32px] font-bold leading-tight text-white">JOIN OUR MEMBERSHIP</h2>
          <p className="mt-1 text-[15px] text-white/55">Access Premium Features and Exclusive Content</p>
        </div>

        {/* Pay by Result marketing line + Monthly/Yearly toggle */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4">
          <p className="flex items-center gap-1.5 text-lg font-semibold text-white">
            Pay by Result <Heart className="size-4 fill-[#ff5f7e] text-[#ff5f7e]" aria-hidden="true" />
          </p>
          {/* the reference's illustrative widget: GENERATE → Redo → before → Confirm */}
          <span className="hidden items-center gap-2 text-xs text-white/50 md:flex" aria-hidden="true">
            <span className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5 font-semibold text-white/80">GENERATE</span>
            <span className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5">Redo</span>
            <span>for</span>
            <span className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5">½</span>
            <span>before</span>
            <span className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5">Confirm</span>
          </span>
          <div
            className="ml-auto flex h-[38px] items-center rounded-full border border-white/12 bg-white/[0.05] p-1"
            role="radiogroup"
            aria-label="Billing cycle"
          >
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cycle === c}
                onClick={() => setCycle(c)}
                className={cn(
                  "flex h-full items-center gap-1.5 rounded-full px-4 text-sm font-semibold capitalize transition-colors",
                  cycle === c ? "bg-white text-[#17181c]" : "text-white/60 hover:text-white",
                )}
              >
                {c}
                {c === "yearly" && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", cycle === "yearly" ? "bg-[#e6765d] text-white" : "bg-[#e6765d]/80 text-white")}>
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* plan cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = cycle === "monthly" ? plan.monthly : plan.yearly;
            const strike = cycle === "monthly" ? plan.strike?.monthly : plan.strike?.yearly;
            const isFree = plan.id === "free";
            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-5",
                  plan.id === "creator"
                    ? "border-[#e6765d]/60 bg-white/[0.05]"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                {plan.badge && (
                  <span
                    className={cn(
                      "absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide",
                      plan.badge.kind === "trial" && "bg-[linear-gradient(112.97deg,#9ec9ff_4.67%,#ffaeb0_96%)] text-[#17181c]",
                      plan.badge.kind === "current" && "border border-[#e6765d] bg-[#1a1512] text-[#e6765d]",
                      plan.badge.kind === "note" && "border border-white/15 bg-[#17181c] text-white/50",
                      plan.badge.kind === "metric" && "border border-white/15 bg-[#17181c] text-white/70",
                    )}
                  >
                    {plan.badge.text}
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-2 flex items-baseline gap-1.5">
                  {strike != null && price >= 0 && (
                    <span className="text-sm text-white/35 line-through">${strike}</span>
                  )}
                  <span className="text-3xl font-bold text-white">{price < 0 ? "Let's Talk" : `$${price}`}</span>
                  {price >= 0 && <span className="text-xs text-white/45">/ month</span>}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-white/65">{plan.renewAssets}</p>
                <p className="text-[11px] text-white/40">{plan.renewCredits}</p>
                {plan.off && <p className="mt-1 text-[11px] font-bold text-[#7fd884]">{plan.off}</p>}
                <div className="mt-4 flex flex-1 flex-col gap-3">
                  {plan.features.map((f, fi) => (
                    <div key={fi}>
                      {f.section && (
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/45">{f.section}</p>
                      )}
                      <ul className="space-y-1">
                        {f.items.map((item) => (
                          <li key={item} className="flex items-start gap-1.5 text-xs leading-relaxed text-white/70">
                            <Sparkles className="mt-0.5 size-3 shrink-0 text-[#d2b6df]" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={isFree}
                  onClick={() =>
                    toast.info(plan.id === "enterprise" ? "Let's Talk" : `${plan.name} plan`, {
                      description: "The reference's paid tiers are not part of this clone — the demo wallet already covers every feature here.",
                    })
                  }
                  className={cn(
                    "mt-5 h-11 rounded-full text-sm font-bold transition-colors",
                    isFree
                      ? "cursor-default border border-white/10 text-white/40"
                      : plan.id === "creator"
                        ? "bg-[linear-gradient(112.97deg,#9ec9ff_4.67%,#ffaeb0_96%)] text-[#17181c] hover:brightness-105"
                        : "border border-white/20 text-white hover:border-white/40",
                  )}
                >
                  {plan.cta}
                </button>
              </article>
            );
          })}
        </div>

        {/* trusted-by row */}
        <div className="mt-12 text-center">
          <p className="text-sm text-white/40">Trusted by Industry Leaders</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {TRUSTED.map((name) => (
              <span key={name} className="text-base font-bold tracking-wide text-white/35">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
