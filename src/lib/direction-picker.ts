/**
 * Direction picker state — the optional multiview step after the main image
 * upload. Reference surface (live workspace 2026-10-20 + Gen-2.5 API
 * `image_label`): ELEVEN direction labels — Front / Front-Left / Front-Right /
 * Left / Up / Right / Back-Left / Back / Back-Right / Down / Unknown — with
 * Unknown (?) as the documented default and the whole step skippable
 * (pose-free single image remains the primary flow).
 *
 * Engine honesty: our free neural engine (Hunyuan3D-2.1) consumes exactly
 * four mv_image slots (front/back/left/right). The four cardinal slots map
 * 1:1 onto those params; the seven extra reference labels are ACCEPTED and
 * recorded on the task card (image_label parity with the reference API
 * surface) and map to the nearest engine slot for reconstruction, with the
 * honest footnote surfaced in the picker UI. Skippable by design.
 *
 * Pure state module — no React, no network; the studio wires it up.
 */

export const VIEW_DIRECTIONS = [
  "front-left",
  "front",
  "front-right",
  "left",
  "up",
  "right",
  "back-left",
  "back",
  "back-right",
  "down",
  "unknown",
] as const;

export type ViewDirection = (typeof VIEW_DIRECTIONS)[number];

/** The four slots the neural engine actually consumes. */
export const ENGINE_DIRECTIONS = ["front", "back", "left", "right"] as const;
export type EngineDirection = (typeof ENGINE_DIRECTIONS)[number];

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

/** The next free direction in reading order (or null when full). */
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
 * How a picker direction maps onto the engine's four mv_image slots.
 * Cardinals map to themselves; diagonals lean toward their facing side
 * (front-left → front, back-right → back); up/down/unknown have no engine
 * slot — they are recorded on the task card only.
 */
export const ENGINE_SLOT_OF: Record<ViewDirection, EngineDirection | null> = {
  "front-left": "front",
  front: "front",
  "front-right": "front",
  left: "left",
  up: null,
  right: "right",
  "back-left": "back",
  back: "back",
  "back-right": "back",
  down: null,
  unknown: null,
};

/**
 * Engine argument slots in the exact mv_image_front/back/left/right order
 * the neural client expects; null = not supplied. When two picker slots
 * collapse onto the same engine slot, the FIRST in reading order wins
 * (deterministic) — the other stays recorded as task metadata.
 */
export function engineSlots(state: DirectionState): (PickerView | null)[] {
  const taken = new Set<EngineDirection>();
  const out: Partial<Record<EngineDirection, PickerView>> = {};
  for (const dir of VIEW_DIRECTIONS) {
    const view = state[dir];
    if (!view) continue;
    const slot = ENGINE_SLOT_OF[dir];
    if (!slot || taken.has(slot)) continue;
    taken.add(slot);
    out[slot] = view;
  }
  return [out.front ?? null, out.back ?? null, out.left ?? null, out.right ?? null];
}

/** Direction labels shown on chips/cards (reference wording). */
export const DIRECTION_LABELS: Record<ViewDirection, string> = {
  "front-left": "Front Left",
  front: "Front",
  "front-right": "Front Right",
  left: "Left",
  up: "Up",
  right: "Right",
  "back-left": "Back Left",
  back: "Back",
  "back-right": "Back Right",
  down: "Down",
  unknown: "Unknown",
};

/** Short labels for the compact picker grid. */
export const DIRECTION_SHORT: Record<ViewDirection, string> = {
  "front-left": "FL",
  front: "F",
  "front-right": "FR",
  left: "L",
  up: "UP",
  right: "R",
  "back-left": "BL",
  back: "B",
  "back-right": "BR",
  down: "DN",
  unknown: "?",
};

/** The reference API's single-letter image_label enum, positionally matched
 * to VIEW_DIRECTIONS (docs.hyper3d.ai Gen-2.5, Aug 2026 changelog). */
export const IMAGE_LABELS: Record<ViewDirection, string> = {
  "front-left": "FL",
  front: "F",
  "front-right": "FR",
  left: "L",
  up: "U",
  right: "R",
  "back-left": "BL",
  back: "B",
  "back-right": "BR",
  down: "D",
  unknown: "?",
};
