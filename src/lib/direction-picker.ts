/**
 * Direction picker state — the optional multiview step after the main image
 * upload (reference behavior: up to 4 extra views labeled Front / Back /
 * Left / Right, mapping 1:1 onto the neural engine's mv_image_front/
 * back/left/right params). Skippable by design: a single image remains the
 * default flow, and the picker is only offered on the Quality (neural) tier.
 *
 * Pure state module — no React, no network; the studio wires it up.
 */

export const VIEW_DIRECTIONS = ["front", "back", "left", "right"] as const;

export type ViewDirection = (typeof VIEW_DIRECTIONS)[number];

export interface PickerView {
  /** data URL of the uploaded image (display + engine upload). */
  dataUrl: string;
  name: string;
}

export type DirectionState = Partial<Record<ViewDirection, PickerView>>;

export const MAX_EXTRA_VIEWS = 4;

export type Tier = "quality" | "fast";

export type AddViewResult =
  | { ok: true; state: DirectionState }
  | { ok: false; reason: "occupied" | "full" | "unknown_direction" };

/** Multiview is a Quality-tier affordance only (mirrors the reference's
 * paid-tier multi-image gating — documented in DECISIONS.md). */
export function tierAllowsViews(tier: Tier): boolean {
  return tier === "quality";
}

/** Number of extra views currently held. */
export function viewCount(state: DirectionState): number {
  return VIEW_DIRECTIONS.reduce((n, dir) => (state[dir] ? n + 1 : n), 0);
}

/** Can another view still be added? */
export function canAddView(state: DirectionState): boolean {
  return viewCount(state) < MAX_EXTRA_VIEWS;
}

/** The next free direction in F → B → L → R order (or null when full). */
export function nextFreeDirection(state: DirectionState): ViewDirection | null {
  for (const dir of VIEW_DIRECTIONS) {
    if (!state[dir]) return dir;
  }
  return null;
}

/**
 * Add a view to a direction slot. Occupied slots and a full picker are
 * rejected with an explicit reason (the UI toasts it honestly).
 */
export function addView(state: DirectionState, direction: string, view: PickerView): AddViewResult {
  if (!VIEW_DIRECTIONS.includes(direction as ViewDirection)) {
    return { ok: false, reason: "unknown_direction" };
  }
  const dir = direction as ViewDirection;
  // Capacity check first: a full picker rejects regardless of the slot.
  if (viewCount(state) >= MAX_EXTRA_VIEWS) {
    return { ok: false, reason: "full" };
  }
  if (state[dir]) {
    return { ok: false, reason: "occupied" };
  }
  return { ok: true, state: { ...state, [dir]: view } };
}

/** Remove a view (freeing the slot for re-add). */
export function removeView(state: DirectionState, direction: ViewDirection): DirectionState {
  const next: DirectionState = { ...state };
  delete next[direction];
  return next;
}

/**
 * Engine argument slots in the exact mv_image_front/back/left/right order
 * the neural client expects; null = not supplied.
 */
export function engineSlots(state: DirectionState): (PickerView | null)[] {
  return VIEW_DIRECTIONS.map((dir) => state[dir] ?? null);
}

/** Direction labels shown on chips/cards. */
export const DIRECTION_LABELS: Record<ViewDirection, string> = {
  front: "Front",
  back: "Back",
  left: "Left",
  right: "Right",
};
