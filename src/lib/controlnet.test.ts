import { describe, it, expect } from "vitest";
import {
  deriveConstraints,
  constraintPromptLine,
  aspectWrap,
  clampDim,
  isUniformAspect,
  VOXEL_GRID,
  POINT_GRID,
  type BBoxState,
  type VoxelState,
  type PointCloudState,
} from "./controlnet";
import { safeParseSceneSpec, type SceneSpec } from "./spec";

const box = (w: number, h: number, d: number): SceneSpec =>
  safeParseSceneSpec({
    name: "T",
    objects: [{ type: "box", params: { width: w, height: h, depth: d } }],
  }).ok
    ? ((safeParseSceneSpec({
        name: "T",
        objects: [{ type: "box", params: { width: w, height: h, depth: d } }],
      }) as { spec: SceneSpec }).spec)
    : ({} as SceneSpec);

describe("controlnet — deriveConstraints", () => {
  it("bbox: aspect from entered W/H/L, full fill, one anchor", () => {
    const state: BBoxState = { mode: "bbox", w: 100, h: 40, l: 60 };
    const c = deriveConstraints(state);
    expect(c).toEqual({ mode: "bbox", aspect: [100, 40, 60], fill: 1, anchors: 1 });
  });

  it("clamps out-of-range and non-finite dims into [1, 200]", () => {
    expect(clampDim(0)).toBe(1);
    expect(clampDim(9999)).toBe(200);
    expect(clampDim(Number.NaN)).toBe(100);
    const state: BBoxState = { mode: "bbox", w: 0, h: 500, l: Number.NaN };
    const c = deriveConstraints(state);
    expect(c?.aspect).toEqual([1, 200, 100]);
  });

  it("voxel: empty grid derives null — skippable", () => {
    const state: VoxelState = { mode: "voxel", cells: {} };
    expect(deriveConstraints(state)).toBeNull();
  });

  it("voxel: full-width top row → wide, flat, thin", () => {
    const cells: Record<string, true> = {};
    for (let x = 0; x < VOXEL_GRID; x++) cells[`${x},0`] = true;
    const c = deriveConstraints({ mode: "voxel", cells });
    expect(c).not.toBeNull();
    // 8 cells wide = 200, 1 tall = 25, 1 deep = 25
    expect(c?.aspect).toEqual([200, 25, 25]);
    expect(c?.fill).toBeCloseTo(1);
    expect(c?.anchors).toBe(VOXEL_GRID);
  });

  it("voxel: sparse marks derive fill < 1 and the marked bounds' aspect", () => {
    const cells: Record<string, true> = { "2,2": true, "5,6": true };
    const c = deriveConstraints({ mode: "voxel", cells });
    // bounds 4 wide × 5 tall → [100, 125, 25]; 2 of 20 cells filled
    expect(c?.aspect).toEqual([100, 125, 25]);
    expect(c?.fill).toBeCloseTo(2 / 20);
    expect(c?.anchors).toBe(2);
  });

  it("pointcloud: empty cloud derives null", () => {
    const state: PointCloudState = { mode: "pointcloud", points: {} };
    expect(deriveConstraints(state)).toBeNull();
  });

  it("pointcloud: tall narrow cloud → tall aspect, thin depth floor, anchor count", () => {
    const points: Record<string, true> = { "8,0": true, "8,15": true };
    const c = deriveConstraints({ mode: "pointcloud", points });
    // 1 slot wide (12.5), 16 tall (200), depth = max(12.5, 200)/4 = 50
    expect(c?.aspect).toEqual([12.5, 200, 50]);
    expect(c?.anchors).toBe(2);
    expect(c?.fill).toBeCloseTo(2 / 16);
  });
});

describe("controlnet — constraintPromptLine", () => {
  it("mentions the dimensions, occupancy band, and detail band", () => {
    const line = constraintPromptLine({ mode: "bbox", aspect: [100, 40, 60], fill: 1, anchors: 1 });
    expect(line).toContain("100x40x60");
    expect(line).toContain("solid occupancy");
    expect(line).toContain("simple silhouette");
  });

  it("sparse voxel drawings read as sparse with detail from anchor count", () => {
    const line = constraintPromptLine({ mode: "voxel", aspect: [100, 125, 25], fill: 0.1, anchors: 30 });
    expect(line).toContain("sparse occupancy");
    expect(line).toContain("rich silhouette detail");
  });
});

describe("controlnet — aspectWrap", () => {
  it("a uniform 1:1:1 target returns the spec unchanged (no wrapper)", () => {
    const spec = box(2, 2, 2);
    const out = aspectWrap(spec, [2, 2, 2], [100, 100, 100]);
    expect(out).toBe(spec);
    expect(isUniformAspect([100, 100, 100])).toBe(true);
  });

  it("near-matching aspect (spread < 0.02) skips the wrapper", () => {
    const spec = box(2, 1, 2);
    // current 2:1:2, target 200:100:200 → factors identical → no wrap
    const out = aspectWrap(spec, [2, 1, 2], [200, 100, 200]);
    expect(out).toBe(spec);
  });

  it("a wide target flattens a cube: scale factors normalized by the max", () => {
    const spec = box(1, 1, 1);
    const out = aspectWrap(spec, [1, 1, 1], [100, 40, 100]);
    expect(out.objects).toHaveLength(1);
    const wrap = out.objects[0] as { type: string; transform?: { scale?: [number, number, number] } };
    expect(wrap.type).toBe("group");
    // factors [1, .4, 1] / max 1 → y squashed to 0.4
    expect(wrap.transform?.scale).toEqual([1, 0.4, 1]);
    // children preserved
    expect((wrap as unknown as { children: unknown[] }).children).toHaveLength(1);
  });

  it("the wrapped spec round-trips the strict schema (no smuggled garbage)", () => {
    const spec = box(1, 2, 3);
    const out = aspectWrap(spec, [1, 2, 3], [40, 200, 60]);
    const check = safeParseSceneSpec(out);
    expect(check.ok).toBe(true);
  });

  it("degenerate current extents (flat object) still produce positive scales", () => {
    const spec = box(2, 2, 0.001);
    const out = aspectWrap(spec, [2, 2, 0], [100, 100, 100]);
    const wrap = out.objects[0] as { transform?: { scale?: [number, number, number] } };
    // current z clamped to 0.01 → raw factors [50, 50, 10000] / 10000
    expect(wrap.transform?.scale?.[2]).toBeCloseTo(1);
    expect(wrap.transform?.scale?.[0]).toBeCloseTo(0.005);
    expect(wrap.transform?.scale?.[1]).toBeCloseTo(0.005);
  });

  it("target dims are clamped before use", () => {
    const spec = box(1, 1, 1);
    const out = aspectWrap(spec, [1, 1, 1], [9999, 0, 100]);
    const wrap = out.objects[0] as { transform?: { scale?: [number, number, number] } };
    // clamped to [200, 1, 100] → factors [200, 1, 100]/200 = [1, .005, .5]
    expect(wrap.transform?.scale?.[0]).toBeCloseTo(1);
    expect(wrap.transform?.scale?.[1]).toBeCloseTo(0.005);
    expect(wrap.transform?.scale?.[2]).toBeCloseTo(0.5);
  });
});
