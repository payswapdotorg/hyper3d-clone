"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Gem, ImagePlus, Plus } from "lucide-react";

import { EFFORTS, GEN_VERSION } from "@/lib/hyper3d";
import { STUDIO_PATH } from "@/lib/studio-path";

/**
 * t68 — the landing hero's embedded studio teaser.
 *
 * The reference homepage embeds a live mini-studio in the hero (mode pills,
 * the 3D Editing card, the Gen-2.5 pill + Select Effort popover, GENERATE
 * with a Free Preview sub-label). This clone's honest equivalent: the same
 * card visually, with the effort popover fully interactive (it reuses the
 * real EFFORTS table — the same five tiers and ~s times the studio
 * runs), while GENERATE and every mode control deep-link into the real
 * studio instead of pretending to generate inline. Nothing here fakes a
 * pipeline; the card is a doorway into the one that exists.
 */

const MODE_PILLS: { label: string; note: string }[] = [
  { label: "Image to 3D", note: "one image is enough" },
  { label: "Text to Image/3D", note: "prompt to object" },
];

const GEN_CHIPS: { label: string; note: string }[] = [
  { label: "Remix Gen", note: "remix inputs with an idea" },
  { label: "Turbo Gen", note: "single image / multi-view" },
];

const EDITING_LINES = ["Supports .obj .fbx .glb", "Parts / Refine / Modify"];

export function HeroDemoCard() {
  const [effortOpen, setEffortOpen] = useState(false);
  const [effort, setEffort] = useState<(typeof EFFORTS)[number]>(
    EFFORTS.find((e) => e.id === "high") ?? EFFORTS[0],
  );

  return (
    <div className="relative w-full max-w-md">
      {/* lilac bloom behind the card (reference hero right column) */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(167,139,250,0.16),transparent)] blur-2xl"
      />
      <div className="rounded-2xl border border-white/10 bg-black/45 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {/* mode row — the reference's tab strip + gen chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MODE_PILLS.map((m) => (
            <Link
              key={m.label}
              href={STUDIO_PATH}
              title={m.note}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
            >
              {m.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-white/15" aria-hidden="true" />
          {GEN_CHIPS.map((c) => (
            <Link
              key={c.label}
              href={STUDIO_PATH}
              title={c.note}
              className="inline-flex min-h-8 items-center rounded-lg border border-violet-400/25 bg-violet-400/10 px-2.5 text-[11px] font-semibold text-violet-200/90 transition-colors hover:border-violet-400/50 hover:text-violet-100"
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* the + entry — the reference's upload/prompt well */}
        <Link
          href={STUDIO_PATH}
          className="group mt-3 flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
        >
          <span className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition-colors group-hover:border-violet-400/50 group-hover:text-violet-200">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1.5 text-sm text-white/60">
            <ImagePlus className="size-4 text-violet-300/80" aria-hidden="true" />
            <span>
              <span className="font-semibold text-violet-300">Text</span>
              <span className="text-white/50"> to image/3d</span>
            </span>
          </span>
          <span className="text-[11px] text-white/35">
            Describe the item you want to generate…
          </span>
        </Link>

        {/* the reference's 3D Editing card */}
        <Link
          href={STUDIO_PATH}
          className="mt-3 block rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-violet-400/40"
        >
          <p className="text-xs font-bold text-white/85">3D Editing</p>
          {EDITING_LINES.map((line) => (
            <p key={line} className="mt-0.5 text-[11px] leading-relaxed text-white/50">
              {line}
            </p>
          ))}
        </Link>

        {/* effort popover — interactive, same EFFORTS table the studio runs */}
        <div className="relative mt-3 flex items-center gap-2">
          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/80">
            <Gem className="size-3.5 text-violet-300" aria-hidden="true" />
            {GEN_VERSION.split(" ")[0]}
          </span>
          <button
            type="button"
            className="inline-flex min-h-9 flex-1 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/80 transition-colors hover:border-violet-400/40"
            onClick={() => setEffortOpen((v) => !v)}
            aria-expanded={effortOpen}
            aria-label="Select Effort"
          >
            <span>
              Select Effort <span className="text-violet-300">{effort.label}</span>
            </span>
            <ChevronDown
              className={`size-3.5 text-white/50 transition-transform ${effortOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {effortOpen ? (
            <div className="absolute bottom-11 left-16 right-0 z-20 rounded-xl border border-white/12 bg-[#16161c] p-2 shadow-2xl">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                Thinking Effort
              </p>
              {EFFORTS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    effort.id === e.id
                      ? "bg-violet-400/15 font-bold text-violet-100"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={() => {
                    setEffort(e);
                    setEffortOpen(false);
                  }}
                >
                  <span>{e.label}</span>
                  <span className="font-mono text-[10px] text-white/40">~ {e.seconds}s</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* GENERATE — into the real studio */}
        <Link
          href={STUDIO_PATH}
          className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c0466b] via-[#b14ec9] to-[#7a5cff] text-sm font-black tracking-wide text-white shadow-lg transition-transform hover:scale-[1.01]"
        >
          GENERATE
        </Link>
        <p className="mt-1.5 text-center text-[11px] text-white/40">
          Free Preview — redos are free; confirming a result is 1–10 credits.
        </p>
      </div>
    </div>
  );
}
