/**
 * ControlNet constraint state — the reference's three spatial-conditioning
 * inputs (live recon 2026-10-28: "Bounding Box ControlNet" / "Voxel
 * ControlNet" / "PointCloud ControlNet" tabs, W×H×L inputs defaulting to
 * 100/100/100).
 *
 * Engine honesty: the clone's deterministic pipeline normalizes every scene
 * to a fixed bounding box before poster/export, so ABSOLUTE positions do not
 * survive. What the engine really consumes from a ControlNet drawing is:
 *
 *   1. ASPECT — the W:H:L proportions of the constraint volume (bbox: the
 *      entered dimensions; voxel/pointcloud: the bounding box of the drawn
 *      cells/points). Applied as a real per-axis scale wrap around the
 *      generated spec (see aspectWrap) — a 100×40×60 box visibly flattens
 *      the result.
 *   2. FILL — the share of the constraint volume the drawing occupies
 *      (voxel mode especially). Passed to the planner as a sparsity hint.
 *   3. ANCHORS — how many points/cells were placed. Passed to the planner
 *      as a silhouette-complexity hint.
 *
 * All three modes derive the same Constraints shape; nothing in the UI is
 * dead — every control the user touches changes at least one of the three
 * values the engine receives.
 *
 * Pure state module — no React, no three.js; the studio wires it up and the
 * queue applies it.
 */
import type { SceneSpec, SceneObjectNode } from "./spec";
import { parseSceneSpec } from "./spec";

export type ControlnetMode = "bbox" | "voxel" | "pointcloud";

/** Voxel editor grid (front view): GRID × GRID cells. */
export const VOXEL_GRID = 8;
/** Pointcloud editor canvas (front view): POINTS × POINTS slots. */
export const POINT_GRID = 16;

/** Entered bounding-box dimensions, reference units (defaults 100/100/100). */
export interface BBoxState {
  mode: "bbox";
  w: number;
  h: number;
  l: number;
}

/** Marked voxel cells: keys are "x,y" grid coordinates. */
export interface VoxelState {
  mode: "voxel";
  cells: Record<string, true>;
}

/** Placed points: keys are "x,y" grid coordinates. */
export interface PointCloudState {
  mode: "pointcloud";
  points: Record<string, true>;
}

export type ControlnetState = BBoxState | VoxelState | PointCloudState;

/** The normalized constraint contract the engine consumes. */
export interface Constraints {
  mode: ControlnetMode;
  /** W:H:L proportions, each clamped to [1, 200] (reference units). */
  aspect: [number, number, number];
  /** 0..1 — share of the constraint footprint the drawing fills. */
  fill: number;
  /** Number of placed anchors (boxes=1, cells, points). */
  anchors: number;
}

const MIN_DIM = 1;
const MAX_DIM = 200;

/** Clamp one dimension into the reference's legal range. */
export function clampDim(v: number): number {
  if (!Number.isFinite(v)) return 100;
  return Math.min(MAX_DIM, Math.max(MIN_DIM, v));
}

function clampAspect(w: number, h: number, l: number): [number, number, number] {
  return [clampDim(w), clampDim(h), clampDim(l)];
}

/** Bounds (in grid coords) of a set of "x,y" keys. */
function gridBounds(keys: string[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const key of keys) {
    const [x, y] = key.split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Derive the engine constraint from any editor state.
 *
 *  bbox       — aspect is the entered W/H/L; fill is 1 (a box fills itself);
 *              anchors 1.
 *  voxel      — aspect from the marked cells' bounds (+1 cell of depth);
 *              fill = marked cells / bounds area; anchors = cell count.
 *  pointcloud — aspect from the points' bounds (points are thin: the depth
 *              axis falls back to a quarter of the wider face so the wrap
 *              never zeroes an axis); fill = points / bounds area; anchors
 *              = point count.
 *
 * Empty voxel/pointcloud states derive null (no constraint — the affordance
 * is skippable, exactly like the reference).
 */
export function deriveConstraints(state: ControlnetState): Constraints | null {
  switch (state.mode) {
    case "bbox":
      return { mode: "bbox", aspect: clampAspect(state.w, state.h, state.l), fill: 1, anchors: 1 };
    case "voxel": {
      const keys = Object.keys(state.cells);
      if (keys.length === 0) return null;
      const { minX, maxX, minY, maxY } = gridBounds(keys);
      const w = (maxX - minX + 1) * (MAX_DIM / VOXEL_GRID);
      const h = (maxY - minY + 1) * (MAX_DIM / VOXEL_GRID);
      const l = MAX_DIM / VOXEL_GRID; // one cell of depth
      return {
        mode: "voxel",
        aspect: clampAspect(w, h, l),
        fill: keys.length / Math.max(1, (maxX - minX + 1) * (maxY - minY + 1)),
        anchors: keys.length,
      };
    }
    case "pointcloud": {
      const keys = Object.keys(state.points);
      if (keys.length === 0) return null;
      const { minX, maxX, minY, maxY } = gridBounds(keys);
      const w = (maxX - minX + 1) * (MAX_DIM / POINT_GRID);
      const h = (maxY - minY + 1) * (MAX_DIM / POINT_GRID);
      const l = Math.max(MIN_DIM, Math.max(w, h) / 4); // thin cloud depth
      return {
        mode: "pointcloud",
        aspect: clampAspect(w, h, l),
        fill: keys.length / Math.max(1, (maxX - minX + 1) * (maxY - minY + 1)),
        anchors: keys.length,
      };
    }
  }
}

/**
 * The planner hint appended to the engine prompt. Honest one-liner: it
 * describes the constraint volume so the scene planner can bias component
 * proportions, and the sparsity/anchor count so it can bias detail.
 */
export function constraintPromptLine(c: Constraints): string {
  const [w, h, l] = c.aspect;
  const dims = `${Math.round(w)}x${Math.round(h)}x${Math.round(l)}`;
  const shape =
    c.fill >= 0.75 ? "solid" : c.fill >= 0.35 ? "moderately sparse" : "sparse";
  const detail =
    c.anchors > 24 ? "with rich silhouette detail" : c.anchors > 8 ? "with moderate silhouette detail" : "with a simple silhouette";
  return `Spatial constraint: fit the object's silhouette to a ${dims} bounding box, ${shape} occupancy, ${detail}.`;
}

/* --------------------------- aspect wrap --------------------------- */

/**
 * Wrap a spec's objects in a scaling group so the scene's extent proportions
 * match the target aspect. `currentExtents` are the measured per-axis extents
 * of the BUILT scene (the caller measures — this module stays three.js-free).
 *
 * The scale factors are computed per axis and normalized by the largest, so
 * the wrap only ever SHRINKS axes relative to each other (downstream
 * normalization sets the final overall size anyway — only proportions
 * matter).
 *
 * A 1:1:1 target returns the spec unchanged (no pointless wrapper).
 */
export function aspectWrap(
  spec: SceneSpec,
  currentExtents: [number, number, number],
  targetAspect: [number, number, number],
): SceneSpec {
  const target = clampAspect(targetAspect[0], targetAspect[1], targetAspect[2]);
  // Guard degenerate axes: a flat object still needs a positive extent.
  const current: [number, number, number] = [
    Math.max(0.01, currentExtents[0]),
    Math.max(0.01, currentExtents[1]),
    Math.max(0.01, currentExtents[2]),
  ];
  const raw: [number, number, number] = [
    target[0] / current[0],
    target[1] / current[1],
    target[2] / current[2],
  ];
  const maxFactor = Math.max(raw[0], raw[1], raw[2]);
  if (!Number.isFinite(maxFactor) || maxFactor <= 0) return spec;
  const scale: [number, number, number] = [
    raw[0] / maxFactor,
    raw[1] / maxFactor,
    raw[2] / maxFactor,
  ];
  // Effectively uniform → aspect already matches; skip the wrapper.
  const spread = Math.max(...scale) - Math.min(...scale);
  if (spread < 0.02) return spec;

  const wrapped: SceneSpec = {
    ...spec,
    objects: [
      {
        type: "group",
        children: spec.objects as SceneObjectNode[],
        transform: { scale },
      } as SceneObjectNode,
    ],
  };
  // Round-trip through the validator so a malformed wrap can never reach
  // the mesh builder (strict-schema guarantee).
  return parseSceneSpec(wrapped);
}

/** True when an aspect is effectively uniform (no wrap needed). */
export function isUniformAspect(aspect: [number, number, number]): boolean {
  const [w, h, l] = clampAspect(aspect[0], aspect[1], aspect[2]);
  return Math.max(w, h, l) - Math.min(w, h, l) < 2;
}
