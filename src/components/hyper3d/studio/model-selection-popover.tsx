"use client";

/**
 * Model Selection popover — the reference's shared option picker
 * (DOM/UX-recon 2026-10-22, /workspace/rodin):
 *
 *  - opened by the controls-row ‹Gen-2.5› pill, the Gem+High effort pill and
 *    the GENERATE-row settings icon (all three open the SAME panel)
 *  - glass panel ~605×396 centered above the GENERATE capsule:
 *    rounded-[25px], 2px border white/12, bg white/5, backdrop-blur-30px
 *  - header "Model Selection" + document icon
 *  - Gen-2.5 section ("The most capable model yet.") with a horizontal
 *    five-segment Thinking Effort control (Extreme-Low ~4s … Extreme-High
 *    ~80s) — picking a segment applies immediately and closes (proven:
 *    reference pill flips High → Medium on click, no confirm step)
 *  - Gen-1.5 section ("Faster, better on simple models.") with a 2×2 grid
 *    (Default / Focal / Zero / Speedy + one-line sub-texts)
 */
import { Brain, FileText, LayoutGrid, Droplets, Zap, Crosshair } from "lucide-react";

import { EFFORTS, LEGACY_MODES, type EffortId, type LegacyModeId, type GenVersionId } from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

const LEGACY_ICONS: Record<LegacyModeId, typeof LayoutGrid> = {
  default: LayoutGrid,
  focal: Crosshair,
  zero: Droplets,
  speedy: Zap,
};

export function ModelSelectionPopover({
  genVersion,
  effort,
  legacyMode,
  onPickEffort,
  onPickLegacy,
  onClose,
}: {
  genVersion: GenVersionId;
  effort: EffortId;
  legacyMode: LegacyModeId;
  onPickEffort: (effort: EffortId) => void;
  onPickLegacy: (mode: LegacyModeId) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* click-away layer (transparent, like the reference's backdrop-less close) */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Model Selection"
        className="fixed left-1/2 top-[168px] z-[61] w-[min(605px,calc(100vw-32px))] -translate-x-1/2 rounded-[25px] border-2 border-white/12 bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        {/* header — title + document icon (reference rodin-version-modal-panel) */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Model Selection</h2>
          <span className="flex size-8 items-center justify-center rounded-full bg-white/8 text-white/70" aria-hidden="true">
            <FileText className="size-4" />
          </span>
        </div>

        {/* Gen-2.5 section */}
        <section className="mt-4" aria-label="Gen-2.5">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-bold text-white">Gen-2.5</h3>
            <span className="text-xs text-white/50">The most capable model yet.</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-white/70" aria-hidden="true">
            <Brain className="size-3.5 text-[#b98acf]" />
            Thinking Effort
          </div>
          {/* five-segment horizontal control — DOM-probed: active segment = purple bg */}
          <div
            role="radiogroup"
            aria-label="Thinking Effort"
            className="mt-2 grid grid-cols-5 gap-1.5 rounded-[14px] bg-black/25 p-1.5"
          >
            {EFFORTS.map((e) => {
              const active = genVersion === "gen-2.5" && effort === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={e.blurb}
                  onClick={() => onPickEffort(e.id)}
                  className={cn(
                    "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[11px] px-1 py-2 transition-colors",
                    active ? "bg-[#8b5cf6]/45 text-white" : "bg-white/[0.04] text-white/65 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span className="text-center text-[11px] font-semibold leading-tight">{e.label}</span>
                  <span className="text-[10px] text-white/45">~{e.seconds}s</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Gen-1.5 section */}
        <section className="mt-5" aria-label="Gen-1.5">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-bold text-white">Gen-1.5</h3>
            <span className="text-xs text-white/50">Faster, better on simple models.</span>
          </div>
          <div role="radiogroup" aria-label="Gen-1.5 quality" className="mt-2 grid grid-cols-2 gap-1.5">
            {LEGACY_MODES.map((m) => {
              const Icon = LEGACY_ICONS[m.id];
              const active = genVersion === "gen-1.5" && legacyMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onPickLegacy(m.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[13px] px-3 py-2.5 text-left transition-colors",
                    active ? "bg-[#8b5cf6]/45 text-white" : "bg-white/[0.04] text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-white/60" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">{m.label}</span>
                    <span className="block truncate text-[11px] text-white/45">{m.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
