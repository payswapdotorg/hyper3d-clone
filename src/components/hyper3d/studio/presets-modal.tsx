"use client";

/**
 * Presets modal — the reference's GENERATE-row "Presets" panel
 * (UX-recon 2026-10-22): 590×345 centered glass modal with
 *  - header: "Presets" + "Use Recommended" toggle (green check when on)
 *  - "Geometry" section with pill tags: ‹Micro› ‹Creative› ‹Symmetric--›
 *    Detailed(active) Soft
 *  - PROMPT label + textarea, "Caption Override" + toggle at its right
 *  - footer: Save Presets (save icon) · Generate (outline) ·
 *    Generate and Save (gradient)
 *
 * Honest wiring: geometry presets append a style hint to the generation
 * prompt; Caption Override stops the auto-caption from overwriting the
 * prompt; Save persists to localStorage (Load saved applies it back on
 * click — user-initiated, no silent state swaps). Mounted only while open.
 */
import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";

import { cn } from "@/lib/utils";

export const PRESET_GEOMETRIES = ["Micro", "Creative", "Symmetric--", "Detailed", "Soft"] as const;
export type PresetGeometry = (typeof PRESET_GEOMETRIES)[number];

const PRESET_HINTS: Record<PresetGeometry, string> = {
  Micro: "miniature scale, tiny proportions",
  Creative: "creative stylized proportions",
  "Symmetric--": "mostly symmetric layout",
  Detailed: "highly detailed",
  Soft: "soft rounded shapes",
};

export function presetHint(g: PresetGeometry): string {
  return PRESET_HINTS[g];
}

const PRESETS_KEY = "h3d.presets.v1";

interface SavedPresets {
  geometry?: PresetGeometry;
  captionOverride?: boolean;
  prompt?: string;
}

function readSaved(): SavedPresets | null {
  try {
    return JSON.parse(window.localStorage.getItem(PRESETS_KEY) ?? "null") as SavedPresets | null;
  } catch {
    return null;
  }
}

export function PresetsModal({
  onClose,
  prompt,
  onPromptChange,
  captionOverride,
  onCaptionOverrideChange,
  geometry,
  onGeometryChange,
  onGenerate,
}: {
  onClose: () => void;
  prompt: string;
  onPromptChange: (p: string) => void;
  captionOverride: boolean;
  onCaptionOverrideChange: (v: boolean) => void;
  geometry: PresetGeometry;
  onGeometryChange: (g: PresetGeometry) => void;
  onGenerate: () => void;
}) {
  const [saved, setSaved] = useState<SavedPresets | null>(() => readSaved());
  const [useRecommended, setUseRecommended] = useState(true);

  /* Escape closes (matches the reference's lightweight dismiss) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    const next = { geometry, captionOverride, prompt };
    try {
      window.localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    } catch {
      /* private mode — in-memory only */
    }
    setSaved(next);
  };

  const loadSaved = () => {
    if (!saved) return;
    if (saved.geometry) {
      onGeometryChange(saved.geometry);
      setUseRecommended(saved.geometry === "Detailed");
    }
    if (typeof saved.captionOverride === "boolean") onCaptionOverrideChange(saved.captionOverride);
    if (typeof saved.prompt === "string") onPromptChange(saved.prompt);
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Presets"
        className="fixed left-1/2 top-1/2 z-[81] flex w-[min(590px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[25px] border-2 border-white/12 bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        {/* header — title + Use Recommended toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Presets</h2>
          <div className="flex items-center gap-4">
            {saved && (
              <button
                type="button"
                onClick={loadSaved}
                className="text-[12px] font-semibold text-white/55 underline-offset-2 transition-colors hover:text-white hover:underline"
              >
                Load saved
              </button>
            )}
            <button
              type="button"
              aria-pressed={useRecommended}
              onClick={() => {
                const next = !useRecommended;
                setUseRecommended(next);
                if (next) onGeometryChange("Detailed");
              }}
              className="flex items-center gap-2 text-[13px] font-semibold text-white/80 transition-colors hover:text-white"
            >
              <span
                className={cn(
                  "flex size-[18px] items-center justify-center rounded-full border transition-colors",
                  useRecommended ? "border-[#22c55e]/60 bg-[#22c55e]/20 text-[#4ade80]" : "border-white/25 text-transparent",
                )}
              >
                <Check className="size-3" aria-hidden="true" />
              </span>
              Use Recommended
            </button>
          </div>
        </div>

        {/* Geometry pills */}
        <section aria-label="Geometry">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Geometry</p>
          <div role="radiogroup" aria-label="Geometry preset" className="mt-2 flex flex-wrap gap-2">
            {PRESET_GEOMETRIES.map((g) => {
              const active = geometry === g;
              return (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    onGeometryChange(g);
                    setUseRecommended(g === "Detailed");
                  }}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {g === "Micro" || g === "Creative" || g === "Symmetric--" ? `‹ ${g} ›` : g}
                </button>
              );
            })}
          </div>
        </section>

        {/* PROMPT + Caption Override */}
        <section aria-label="Prompt" className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe the item you want to generate..."
              aria-label="Prompt"
              rows={3}
              className="mt-2 w-full resize-none rounded-[14px] border border-white/12 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
            />
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2 pt-6">
            <span className="text-[11px] font-semibold text-white/60" id="caption-override-label">
              Caption Override
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={captionOverride}
              aria-label="Caption override"
              onClick={() => onCaptionOverrideChange(!captionOverride)}
              className={cn(
                "flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                captionOverride ? "justify-end bg-[#8b5cf6]/70" : "justify-start bg-white/15",
              )}
            >
              <span className="size-5 rounded-full bg-white shadow" />
            </button>
          </div>
        </section>

        {/* footer actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              save();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Save className="size-3.5" aria-hidden="true" />
            Save Presets
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGenerate();
            }}
            className="rounded-full border border-white/25 px-5 py-2 text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/10"
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => {
              save();
              onClose();
              onGenerate();
            }}
            className="rounded-full bg-[linear-gradient(112.97deg,#9ec9ff_4.67%,#ffaeb0_96%)] px-5 py-2 text-[13px] font-bold text-[#17181c] transition-opacity hover:opacity-90"
          >
            Generate and Save
          </button>
        </div>
      </div>
    </>
  );
}
