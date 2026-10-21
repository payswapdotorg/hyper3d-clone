/**
 * ab-smoothing.ts — controlled A/B: render a FIXED canonical apple spec
 * with the current (smoothing) builder vs a no-smoothing control, and save
 * both posters for visual comparison.
 */
import { writeFileSync } from "node:fs";
import { buildScene } from "../src/lib/mesh-builder";
import { renderPoster } from "../src/lib/render-preview";
import { parseSceneSpec } from "../src/lib/spec";

const CANONICAL = {
  name: "canonical apple",
  palette: ["#C1121F", "#6B8E23"],
  objects: [
    {
      type: "lathe" as const,
      params: {
        points: [
          [0, 0], [0.45, 0.05], [0.72, 0.25], [0.85, 0.55], [0.8, 0.85],
          [0.62, 1.05], [0.3, 1.14], [0, 1.15],
        ] as [number, number][],
      },
      transform: { position: [0, 0, 0] as [number, number, number] },
      material: { color: "#C1121F", roughness: 0.35 },
    },
    {
      type: "cylinder" as const,
      params: { radiusTop: 0.05, radiusBottom: 0.05, height: 0.3 },
      transform: { position: [0, 1.3, 0] as [number, number, number] },
      material: { color: "#6B8E23", roughness: 0.6 },
    },
  ],
};

const spec = parseSceneSpec(CANONICAL);

// A: current builder (with smoothing)
const groupA = buildScene(spec);
writeFileSync("/home/z/h3d-capture/ab-smoothed.png", renderPoster(groupA));

// B: control — monkey-patch: rebuild the lathe WITHOUT spline by pre-densifying
// the profile manually (so the builder's >20-point pass-through path engages).
const denseSpec = JSON.parse(JSON.stringify(CANONICAL));
const pts = denseSpec.objects[0].params.points;
// linear interpolation x3 (what a NON-spline smooth would roughly look like — flat shading between points, i.e. the old faceted look is the 1x path; here we simply verify the spline path against the ORIGINAL sparse path)
const specSparse = parseSceneSpec(CANONICAL);
// Sparse control: build with smoothing disabled via a >20 dense COPY is not
// equivalent; instead render the sparse profile through a local LatheGeometry
// replicating the OLD builder (no spline).
import * as THREE from "three";
function oldBuild() {
  const group = new THREE.Group();
  for (const obj of CANONICAL.objects) {
    let geo: THREE.BufferGeometry;
    if (obj.type === "lathe") {
      geo = new THREE.LatheGeometry(
        obj.params.points.map(([x, y]) => new THREE.Vector2(x, y)),
        36,
      );
    } else {
      geo = new THREE.CylinderGeometry(obj.params.radius, obj.params.radius, obj.params.height, 24);
    }
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(obj.material?.color ?? "#888888"),
        roughness: obj.material?.roughness ?? 0.5,
      }),
    );
    if (obj.transform?.position) mesh.position.set(...obj.transform.position);
    group.add(mesh);
  }
  return group;
}
writeFileSync("/home/z/h3d-capture/ab-faceted.png", renderPoster(oldBuild()));

console.log("A (spline-smoothed) → /home/z/h3d-capture/ab-smoothed.png");
console.log("B (sparse/faceted)  → /home/z/h3d-capture/ab-faceted.png");
