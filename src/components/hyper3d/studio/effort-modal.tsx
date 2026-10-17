"use client";

/**
 * Effort selection modal — blueprint §2.3: "Which thinking effort is more
 * suitable for you?" with five effort cards (Extreme-High ~80s …
 * Extreme-Low ~4s) and a showcase category panel.
 */
import { useState } from "react";
import { Clock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EFFORTS, type EffortId } from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

const SHOWCASE_CATEGORIES = [
  { label: "3A Gaming", desc: "Hero props, weapons, environment kits" },
  { label: "Product Mockup", desc: "Packaging, devices, tabletop goods" },
  { label: "Hard-Surface Workflows", desc: "Mechs, vehicles, paneling" },
  { label: "Character Creation", desc: "Bases, costumes, accessories" },
  { label: "Premium Showcases", desc: "Marketing-ready hero assets" },
  { label: "Virtual Production", desc: "Set pieces and previz blocking" },
];

export function EffortModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (effort: EffortId) => void;
}) {
  const [selected, setSelected] = useState<EffortId>("medium");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h3d-glass-strong max-h-[90vh] overflow-y-auto border-white/15 bg-[#17171b]/95 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-white">
            Which thinking effort is more suitable for you?
          </DialogTitle>
          <DialogDescription>
            Higher effort spends more time refining geometry and materials before delivering the preview.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
          {/* effort cards */}
          <div role="radiogroup" aria-label="Thinking effort" className="grid gap-2.5">
            {EFFORTS.slice()
              .reverse()
              .map((effort) => {
                const active = selected === effort.id;
                return (
                  <button
                    key={effort.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(effort.id)}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      active
                        ? "border-h3d-purple/60 bg-h3d-purple/12"
                        : "border-white/10 bg-white/[0.03] hover:border-white/25",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-white">{effort.label}</span>
                      <span className="block text-xs text-h3d-muted">{effort.blurb}</span>
                    </span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px]",
                        active ? "border-h3d-purple/50 text-h3d-violet" : "border-white/10 text-white/55",
                      )}
                    >
                      <Clock className="size-3" aria-hidden="true" /> ~{effort.seconds}s
                    </span>
                  </button>
                );
              })}
          </div>

          {/* showcase panel */}
          <aside className="h3d-glass rounded-2xl p-4" aria-label="Showcase categories">
            <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Showcases</p>
            <ul className="mt-3 space-y-2.5">
              {SHOWCASE_CATEGORIES.map((c) => (
                <li key={c.label} className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Sparkles className="size-3 text-h3d-purple" aria-hidden="true" />
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-h3d-muted">{c.desc}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <Button
          className="h-12 w-full h3d-gradient-primary text-sm font-bold tracking-wide text-white hover:opacity-90"
          onClick={() => onSelect(selected)}
        >
          SELECT · {EFFORTS.find((e) => e.id === selected)?.label} effort
        </Button>
      </DialogContent>
    </Dialog>
  );
}
