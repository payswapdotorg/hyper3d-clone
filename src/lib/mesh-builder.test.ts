import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { buildScene } from "@/lib/mesh-builder";
import { parseSceneSpec, type SceneSpec } from "@/lib/spec";

function collectMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
  });
  return meshes;
}

function signatureOf(group: THREE.Group): string {
  // Deterministic structural signature: geometry type + params + transform + material.
  const rows: string[] = [];
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry as THREE.BufferGeometry & { parameters?: Record<string, unknown> };
    const params: Record<string, unknown> = geo.parameters ?? {};
    for (const key of Object.keys(params)) {
      const value = params[key];
      params[key] = Array.isArray(value) ? value : value;
    }
    const mat = mesh.material as THREE.MeshStandardMaterial;
    rows.push(
      JSON.stringify({
        geo: geo.type,
        params,
        pos: mesh.position.toArray(),
        rot: mesh.rotation.toArray().slice(0, 3),
        scale: mesh.scale.toArray(),
        color: "#" + mat.color.getHexString(),
        metalness: mat.metalness,
        roughness: mat.roughness,
        opacity: mat.opacity,
      }),
    );
  });
  return rows.join("\n");
}

describe("mesh builder (SceneSpec → three.js Group)", () => {
  it("creates one mesh per primitive and preserves hierarchy for groups", () => {
    const spec = parseSceneSpec({
      palette: ["#c62828", "#6d4c41"],
      objects: [
        { type: "sphere", params: { radius: 1 } },
        { type: "cylinder", params: { radiusTop: 0.06, radiusBottom: 0.08, height: 0.7 } },
        {
          type: "group",
          transform: { position: [1, 0, 0] },
          children: [
            { type: "box", params: { width: 0.5, height: 0.5, depth: 0.5 } },
            { type: "cone", params: { radius: 0.3, height: 0.6 } },
          ],
        },
      ],
    });
    const group = buildScene(spec);
    const meshes = collectMeshes(group);
    expect(meshes).toHaveLength(4);
    const childTypes = group.children.map((c) => c.type);
    expect(childTypes.filter((t) => t === "Group")).toHaveLength(1);
  });

  it("produces a non-zero bounding box", () => {
    const spec = parseSceneSpec({ objects: [{ type: "sphere", params: { radius: 1 } }] });
    const group = buildScene(spec);
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    expect(size.x).toBeGreaterThan(0);
    expect(size.y).toBeGreaterThan(0);
    expect(size.z).toBeGreaterThan(0);
  });

  it("applies the palette to materials of objects without an explicit color", () => {
    const spec = parseSceneSpec({
      palette: ["#ff0000", "#00ff00", "#0000ff"],
      objects: [
        { type: "sphere", params: { radius: 1 } },
        { type: "sphere", params: { radius: 1 } },
        { type: "sphere", params: { radius: 1 } },
        { type: "box", params: { width: 1, height: 1, depth: 1 }, material: { color: "#ffffff" } },
      ],
    });
    const group = buildScene(spec);
    const meshes = collectMeshes(group);
    const colors = meshes.map((m) => (m.material as THREE.MeshStandardMaterial).color.getHexString());
    expect(colors).toEqual(["ff0000", "00ff00", "0000ff", "ffffff"]);
  });

  it("applies material PBR values to the generated materials", () => {
    const spec = parseSceneSpec({
      objects: [
        {
          type: "sphere",
          params: { radius: 1 },
          material: { metalness: 0.9, roughness: 0.1, opacity: 0.35 },
        },
      ],
    });
    const group = buildScene(spec);
    const mat = collectMeshes(group)[0].material as THREE.MeshStandardMaterial;
    expect(mat.metalness).toBeCloseTo(0.9);
    expect(mat.roughness).toBeCloseTo(0.1);
    expect(mat.opacity).toBeCloseTo(0.35);
    expect(mat.transparent).toBe(true);
  });

  it("applies transforms to meshes", () => {
    const spec = parseSceneSpec({
      objects: [
        {
          type: "box",
          params: { width: 1, height: 1, depth: 1 },
          transform: { position: [5, 6, 7], rotation: [0, Math.PI / 2, 0], scale: [2, 3, 4] },
        },
      ],
    });
    const group = buildScene(spec);
    const mesh = collectMeshes(group)[0];
    expect(mesh.position.toArray()).toEqual([5, 6, 7]);
    expect(mesh.rotation.y).toBeCloseTo(Math.PI / 2);
    expect(mesh.scale.toArray()).toEqual([2, 3, 4]);
  });

  it("builds lathe and extrude geometry with real vertices", () => {
    const spec = parseSceneSpec({
      objects: [
        { type: "lathe", params: { points: [[0, 0], [0.6, 0.2], [0.4, 1], [0, 1.2]], segments: 16 } },
        { type: "extrude", params: { shape: [[-1, -1], [1, -1], [1, 1], [-1, 1]], depth: 0.5 } },
      ],
    });
    const group = buildScene(spec);
    for (const mesh of collectMeshes(group)) {
      expect(mesh.geometry.attributes.position.count).toBeGreaterThan(3);
    }
  });

  it("is deterministic: the same spec yields an identical structure twice", () => {
    const spec: SceneSpec = parseSceneSpec({
      palette: ["#c62828", "#6d4c41", "#43a047"],
      objects: [
        { type: "sphere", params: { radius: 1 } },
        { type: "torus", params: { radius: 1.2, tube: 0.3 }, transform: { position: [0, 1, 0] } },
        {
          type: "group",
          children: [
            { type: "box", params: { width: 1, height: 0.4, depth: 1 } },
            { type: "cone", params: { radius: 0.5, height: 1 }, transform: { scale: 2 } },
          ],
        },
      ],
    });
    const a = buildScene(spec);
    const b = buildScene(spec);
    expect(signatureOf(a)).toBe(signatureOf(b));
  });
});

describe("lathe profile smoothing", () => {
  it("spline-smooths sparse vision profiles into dense organic bodies (x >= 0)", () => {
    // A sparse 6-point apple-ish profile — what vision models actually emit.
    const sparse: [number, number][] = [
      [0, 0],
      [0.5, 0.1],
      [0.85, 0.5],
      [0.8, 0.9],
      [0.4, 1.1],
      [0, 1.15],
    ];
    const scene = buildScene({
      name: "smooth test",
      palette: ["#ff0000"],
      objects: [{ type: "lathe", params: { points: sparse } }],
    });
    let positions = 0;
    let maxX = 0;
    let minY = Infinity;
    let maxY = -Infinity;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geo = mesh.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      positions = pos.count;
      for (let i = 0; i < pos.count; i++) {
        maxX = Math.max(maxX, Math.abs(pos.getX(i)));
        minY = Math.min(minY, pos.getY(i));
        maxY = Math.max(maxY, pos.getY(i));
      }
    });
    // 6 control points -> >= 24 spline samples -> smooth revolve rows.
    expect(positions).toBeGreaterThanOrEqual(24 * 2);
    // Radii stay non-negative and near-bounded (Catmull-Rom may overshoot
    // the widest control point by a few percent at sharp curvature).
    expect(maxX).toBeLessThanOrEqual(0.85 * 1.1);
    // The body spans the original profile height.
    expect(minY).toBeCloseTo(0, 1);
    expect(maxY).toBeCloseTo(1.15, 1);
  });

  it("passes dense profiles through untouched", () => {
    const dense: [number, number][] = Array.from({ length: 25 }, (_, i) => [
      0.5 * Math.sin((i / 24) * Math.PI),
      i / 24,
    ]);
    const scene = buildScene({
      name: "dense test",
      palette: ["#00ff00"],
      objects: [{ type: "lathe", params: { points: dense } }],
    });
    let rows = 0;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geo = mesh.geometry as THREE.BufferGeometry;
      rows = (geo.attributes.position as THREE.BufferAttribute).count;
    });
    // 25 control points + closing ring ≈ 26 rings × 37 vertices ≈ 962 —
    // pass-through, NOT the ~3× spline subdivision (~2900) of sparse paths.
    expect(rows).toBeLessThan(1200);
  });
});
