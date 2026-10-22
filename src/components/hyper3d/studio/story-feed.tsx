"use client";

/**
 * Story feed — the reference's EXPLORE tab (UX-recon 2026-10-22,
 * agent-walked): clicking EXPLORE swaps the gallery for a story feed
 * (the reference routes to /workspace/rodin/tab/story; the workspace
 * chrome — topbar/hero — stays, a "Back" control returns):
 *  - "STORY — Share @ Discord" heading row
 *  - story cards: the reference's own announcement posts (Agentic Mode
 *    intro, WorldGen promo) + a Share-a-Post & Earn-1-Credit card with
 *    the Discord/Twitter/Youtube/Linkedin share panel
 *  - a "Rodin Tips" card (Tutorial · Official · English · 中文 · Other
 *    Languages — as seen on the reference)
 *
 * Honest wiring: share actions are reference-parity chrome toasts; the
 * story cards carry the reference's own copy (it's their public
 * announcement text).
 */
import { useState } from "react";
import { ArrowLeft, Youtube,Linkedin, MessageCircle, Twitter } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORIES: { id: string; title: string; body: string; art: string; hue: string }[] = [
  {
    id: "agentic",
    title: "🚀 Introducing #HYPER3D Agentic Mode.",
    body: "Vibe Modeling: let the agent plan and build — describe the idea, it picks the steps. Toggle Agentic Mode in the controls row to feel it.",
    art: "A G E N T",
    hue: "#b98acf",
  },
  {
    id: "worldgen",
    title: "One image. A world to train in, shoot in & explore. 🌍",
    body: "👀 Meet HYPER3D #WorldGen: independent foreground meshes + #3DGS background, built for interaction. For robotics 🦾, film 🎬, games 🎮, DCC 💎 & XR.",
    art: "W O R L D",
    hue: "#ca6650",
  },
];

const SHARE_TARGETS = [
  { name: "Discord", icon: MessageCircle },
  { name: "Twitter", icon: Twitter },
  { name: "Youtube", icon: Youtube },
  { name: "Linkedin", icon: Linkedin },
] as const;

export function StoryFeed({ onBack }: { onBack: () => void }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-10 md:px-20" aria-label="Story feed">
      {/* STORY header + back (reference: "STORY — Share @ Discord" + Back) */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </button>
        <h2 className="text-[26px] font-bold leading-none text-white">STORY</h2>
        <button
          type="button"
          onClick={() =>
            toast.info("Share @ Discord", { description: "The reference's community share flow is not part of this clone." })
          }
          className="flex items-center gap-1.5 text-sm font-semibold text-[#d2b6df] transition-colors hover:text-white"
        >
          Share @ Discord
        </button>
      </div>

      {/* story cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STORIES.map((s) => (
          <article
            key={s.id}
            className="flex flex-col overflow-hidden rounded-[26px] border border-white/8 bg-white/[0.03]"
          >
            <div
              className="flex aspect-[4/3] items-center justify-center text-lg font-black tracking-[0.3em] text-white/25"
              style={{ background: `linear-gradient(135deg, ${s.hue}33, transparent 70%)` }}
              aria-hidden="true"
            >
              {s.art}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="text-sm font-bold leading-snug text-white">{s.title}</h3>
              <p className="text-xs leading-relaxed text-white/60">{s.body}</p>
            </div>
          </article>
        ))}

        {/* Share a Post & Earn 1 Credit (reference promo card) */}
        <article className="relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#d2b6df]/30 bg-[linear-gradient(160deg,rgba(210,182,223,0.12),rgba(236,193,108,0.06))] p-4">
          <div>
            <h3 className="text-sm font-bold text-white">Share a Post &amp; Earn 1 Credit!</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">
              Post your creation with #HYPER3D — the community feed rewards every share.
            </p>
          </div>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              aria-expanded={shareOpen}
              className="h-9 w-full rounded-full bg-white text-sm font-bold text-[#17181c] transition-colors hover:bg-white/90"
            >
              Share
            </button>
            {/* share panel (reference: 248×248, radius 26 — Discord/Twitter/Youtube/Linkedin) */}
            <div
              className={cn(
                "absolute bottom-12 right-0 z-10 grid w-[248px] grid-cols-2 gap-2 rounded-[26px] border border-white/12 bg-[#17181c]/95 p-3 shadow-2xl backdrop-blur-xl transition-all",
                shareOpen ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-1 opacity-0",
              )}
            >
              {SHARE_TARGETS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() =>
                    toast.info(`Share @ ${t.name}`, { description: "The reference's share targets are not part of this clone." })
                  }
                  className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
                >
                  <t.icon className="size-4" aria-hidden="true" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </article>

        {/* Rodin Tips card (seen on the reference's story area) */}
        <article className="flex flex-col gap-2 rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
          <h3 className="text-sm font-bold text-white">Rodin Tips</h3>
          <div className="flex flex-wrap gap-1.5">
            {["Tutorial", "Official", "English", "中文", "Other Languages"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  toast.info(chip, { description: "The reference's tips channel is not part of this clone." })
                }
                className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Redos are free, but confirmation costs credits. Drink water to speed up generation!
          </p>
        </article>
      </div>
    </section>
  );
}
