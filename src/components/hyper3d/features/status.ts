import type { FeatureStatus } from "@/lib/features-types";

/**
 * Shared status presentation helpers for the features tree (index cards +
 * page chips). Kept beside the renderer so both stay in sync.
 */

export function statusOrder(status: FeatureStatus): "live" | "partial" | "reference-only" {
  return status;
}

/** Tailwind classes per status, mirroring the renderer's chip tones. */
export const STATUS_CHIP_CLASS: Record<FeatureStatus, string> = {
  live: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  partial: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  "reference-only": "border-white/10 bg-white/[0.03] text-white/40",
};

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: "LIVE",
  partial: "PARTIAL",
  "reference-only": "REF-ONLY",
};
