import { describe, it, expect } from "vitest";
import { parseSceneSpec, safeParseSceneSpec, type SceneSpec } from "@/lib/spec";

const ALL_PRIMITIVES_SPEC: unknown = {
  name: "kitchen sink",
  palette: ["#ff0000", "#00ff00", "#0000ff"],
  objects: [
    { type: "box", params: { width: 2, height: 1, depth: 1 } },
    { type: "sphere", params: { radius: 1.25, widthSegments: 24, heightSegments: 16 } },
    { type: "cylinder", params: { radiusTop: 0.5, radiusBottom: 0.75, height: 2, radialSegments: 24 } },
    { type: "cone", params: { radius: 1, height: 2, radialSegments: 16 } },
    { type: "torus", params: { radius: 1.1, tube: 0.35, radialSegments: 12, tubularSegments: 48 } },
    { type: "lathe", params: { points: [[0, 0], [0.6, 0.2], [0.4, 1.0], [0, 1.2]], segments: 24 } },
    { type: "extrude", params: { shape: [[-1, -1], [1, -1], [1, 1], [-1, 1]], depth: 0.5 } },
  ],
};

describe("SceneSpec schema", () => {
  it("parses a valid spec containing all seven primitives", () => {
    const spec = parseSceneSpec(ALL_PRIMITIVES_SPEC);
    expect(spec.objects).toHaveLength(7);
    const types = spec.objects.map((o) => (o as { type: string }).type);
    expect(types).toEqual(["box", "sphere", "cylinder", "cone", "torus", "lathe", "extrude"]);
  });

  it("applies defaults for a minimal spec", () => {
    const spec = parseSceneSpec({ objects: [{ type: "sphere", params: { radius: 1 } }] });
    expect(spec.objects).toHaveLength(1);
    expect(spec.palette).toBeUndefined();
  });

  it("parses transforms: position, rotation, uniform and per-axis scale", () => {
    const spec = parseSceneSpec({
      objects: [
        {
          type: "box",
          params: { width: 1, height: 1, depth: 1 },
          transform: { position: [1, 2, 3], rotation: [0.5, 1, 0], scale: 2 },
        },
        {
          type: "sphere",
          params: { radius: 1 },
          transform: { scale: [1, 2, 0.5] },
        },
      ],
    });
    const box = spec.objects[0] as { transform?: { position?: number[]; scale?: number | number[] } };
    expect(box.transform?.position).toEqual([1, 2, 3]);
    expect(box.transform?.scale).toBe(2);
    const sphere = spec.objects[1] as { transform?: { scale?: number | number[] } };
    expect(sphere.transform?.scale).toEqual([1, 2, 0.5]);
  });

  it("parses materials with color, metalness, roughness and opacity", () => {
    const spec = parseSceneSpec({
      objects: [
        {
          type: "box",
          params: { width: 1, height: 1, depth: 1 },
          material: { color: "#c62828", metalness: 0.8, roughness: 0.25, opacity: 0.5 },
        },
      ],
    });
    const mat = (spec.objects[0] as { material?: Record<string, unknown> }).material;
    expect(mat).toMatchObject({ color: "#c62828", metalness: 0.8, roughness: 0.25, opacity: 0.5 });
  });

  it("parses nested groups with transforms and children", () => {
    const spec = parseSceneSpec({
      objects: [
        {
          type: "group",
          transform: { position: [0, 1, 0] },
          children: [
            { type: "sphere", params: { radius: 0.5 } },
            {
              type: "group",
              children: [{ type: "box", params: { width: 0.2, height: 0.2, depth: 0.2 } }],
            },
          ],
        },
      ],
    });
    const group = spec.objects[0] as { type: string; children: unknown[] };
    expect(group.type).toBe("group");
    expect(group.children).toHaveLength(2);
  });

  it("round-trips valid specs through safeParse", () => {
    const result = safeParseSceneSpec(ALL_PRIMITIVES_SPEC);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.spec as SceneSpec).objects.length).toBe(7);
    }
  });

  it("rejects unknown keys at every level", () => {
    const cases: unknown[] = [
      { objects: [], bogus: true },
      { objects: [{ type: "sphere", params: { radius: 1 }, bogus: 1 }] },
      { objects: [{ type: "sphere", params: { radius: 1, bogus: 2 } }] },
      { objects: [{ type: "sphere", params: { radius: 1 }, transform: { position: [0, 0, 0], bogus: 1 } }] },
      { objects: [{ type: "sphere", params: { radius: 1 }, material: { color: "#112233", bogus: 1 } }] },
      { objects: [{ type: "group", children: [], bogus: 1 }] },
    ];
    for (const input of cases) {
      expect(() => parseSceneSpec(input), `spec ${JSON.stringify(input)} must be rejected`).toThrow();
    }
  });

  it("rejects unknown primitive types", () => {
    expect(() => parseSceneSpec({ objects: [{ type: "dodecahedron", params: {} }] })).toThrow();
    expect(() => parseSceneSpec({ objects: [{ type: "mesh", params: {} }] })).toThrow();
  });

  it("rejects out-of-range and non-finite numbers", () => {
    const badCases: unknown[] = [
      { objects: [{ type: "sphere", params: { radius: -1 } }] },
      { objects: [{ type: "sphere", params: { radius: 0 } }] },
      { objects: [{ type: "sphere", params: { radius: 1e6 } }] },
      { objects: [{ type: "box", params: { width: Number.NaN, height: 1, depth: 1 } }] },
      { objects: [{ type: "box", params: { width: Number.POSITIVE_INFINITY, height: 1, depth: 1 } }] },
      {
        objects: [
          {
            type: "box",
            params: { width: 1, height: 1, depth: 1 },
            material: { metalness: 1.5 },
          },
        ],
      },
      {
        objects: [
          {
            type: "box",
            params: { width: 1, height: 1, depth: 1 },
            material: { roughness: -0.1 },
          },
        ],
      },
      {
        objects: [
          {
            type: "box",
            params: { width: 1, height: 1, depth: 1 },
            material: { opacity: 1.2 },
          },
        ],
      },
      {
        objects: [
          {
            type: "box",
            params: { width: 1, height: 1, depth: 1 },
            transform: { scale: 0 },
          },
        ],
      },
      {
        objects: [
          {
            type: "box",
            params: { width: 1, height: 1, depth: 1 },
            transform: { position: [Number.NaN, 0, 0] },
          },
        ],
      },
    ];
    for (const input of badCases) {
      expect(() => parseSceneSpec(input), `spec ${JSON.stringify(input)} must be rejected`).toThrow();
    }
  });

  it("rejects malformed colors, points and shapes", () => {
    const badCases: unknown[] = [
      { palette: ["red", "#12345", "#12345g"] },
      { objects: [{ type: "box", params: { width: 1, height: 1, depth: 1 }, material: { color: "red" } }] },
      { objects: [{ type: "lathe", params: { points: [[0, 0]] } }] },
      { objects: [{ type: "lathe", params: { points: [[0], [1]] } }] },
      { objects: [{ type: "extrude", params: { shape: [[0, 0], [1, 1]], depth: 1 } }] },
      { objects: [{ type: "extrude", params: { shape: [[0, 0], [1, 1], [2, 2]], depth: -1 } }] },
      { objects: [{ type: "group", children: [] }] }, // groups need at least one child
    ];
    for (const input of badCases) {
      expect(() => parseSceneSpec(input), `spec ${JSON.stringify(input)} must be rejected`).toThrow();
    }
  });

  it("requires at least one top-level object", () => {
    expect(() => parseSceneSpec({ objects: [] })).toThrow();
    expect(() => parseSceneSpec({})).toThrow();
    expect(() => parseSceneSpec(null)).toThrow();
    expect(() => parseSceneSpec("sphere")).toThrow();
  });
});
