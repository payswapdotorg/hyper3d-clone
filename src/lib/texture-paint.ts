/**
 * Texture painting for neural meshes (quota-free, client-side).
 *
 * The free neural engine returns an untextured (white) watertight mesh.
 * This module paints it before preview:
 *   - FRONT projection: Hunyuan meshes are constructed front-aligned to the
 *     input image, so a front orthographic projection maps the source
 *     image's RGB onto front-facing vertices (u from X, v flipped from Y).
 *   - BACK/SIDE fill: vertical gradient built from the caption palette —
 *     smooth, no hard seams.
 *   - Blend: smoothstep over the world-space normal's front component, so
 *     silhouette edges crossfade instead of cutting.
 *
 * Colors are baked as three.js vertex colors (the `color` attribute), which
 * every exporter (GLB/GLTF/OBJ/STL/USDZ) carries as COLOR_0. Pure three.js
 * math — runs in the browser (live painting) and in Node (tests).
 */
import * as THREE from "three";

export interface PaintSource {
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel, row-major, top row first. */
  rgba: Uint8Array | Uint8ClampedArray;
}

export interface PaintOptions {
  /** Palette hex colors — gradient runs bottom (first) → top (last). */
  palette?: string[];
  /**
   * Which world axis faces the camera in the source image. Hunyuan3D-2.1
   * meshes are front-aligned along +Z by construction (verified contract in
   * recon/engine-probe.md); kept configurable for future axis heuristics.
   */
  frontAxis?: "z" | "-z" | "x" | "-x";
  /** Normal-front threshold where the image fully takes over. */
  fullFrontThreshold?: number;
  /** Below this normal-front value the palette gradient fully applies. */
  gradientThreshold?: number;
}

export interface PaintStats {
  /** Vertices that received a color (every mesh vertex). */
  painted: number;
  /** Meshes that were painted. */
  meshes: number;
}

const DEFAULT_FRONT = 0.25;
const DEFAULT_GRADIENT = 0.02;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0 || 1e-6)));
  return t * t * (3 - 2 * t);
}

function paletteToRgb(palette: string[]): THREE.Color[] {
  return palette
    .filter((hex) => /^#[0-9a-fA-F]{6}$/.test(hex))
    .slice(0, 8)
    .map((hex) => new THREE.Color(hex));
}

/** Sample the source image at normalized [0..1] uv (clamped, nearest). */
export function sampleImage(source: PaintSource, u: number, v: number): THREE.Color {
  const x = Math.min(source.width - 1, Math.max(0, Math.floor(u * source.width)));
  // v=0 is the BOTTOM of the object; images store the top row first.
  const y = Math.min(source.height - 1, Math.max(0, Math.floor((1 - v) * source.height)));
  const offset = (y * source.width + x) * 4;
  return new THREE.Color(
    source.rgba[offset] / 255,
    source.rgba[offset + 1] / 255,
    source.rgba[offset + 2] / 255,
  );
}

/** Vertical palette gradient at normalized height t (0=bottom, 1=top). */
export function gradientAt(colors: THREE.Color[], t: number): THREE.Color {
  if (colors.length === 0) return new THREE.Color(0.55, 0.55, 0.58);
  if (colors.length === 1) return colors[0].clone();
  const scaled = Math.min(0.9999, Math.max(0, t)) * (colors.length - 1);
  const index = Math.floor(scaled);
  const frac = scaled - index;
  return colors[index].clone().lerp(colors[Math.min(index + 1, colors.length - 1)], frac);
}

function frontVector(axis: NonNullable<PaintOptions["frontAxis"]>): THREE.Vector3 {
  switch (axis) {
    case "z":
      return new THREE.Vector3(0, 0, 1);
    case "-z":
      return new THREE.Vector3(0, 0, -1);
    case "x":
      return new THREE.Vector3(1, 0, 0);
    default:
      return new THREE.Vector3(-1, 0, 0);
  }
}

/**
 * Paint vertex colors onto every mesh under `root`, in world space (the
 * caller may pre-transform the root). Mutates geometries by setting the
 * `color` attribute (COLOR_0 on export). Deterministic.
 */
export function paintVertexColors(
  root: THREE.Object3D,
  source: PaintSource,
  options: PaintOptions = {},
): PaintStats {
  const palette = paletteToRgb(options.palette ?? []);
  const front = frontVector(options.frontAxis ?? "z");
  const fullFront = options.fullFrontThreshold ?? DEFAULT_FRONT;
  const gradientEdge = options.gradientThreshold ?? DEFAULT_GRADIENT;

  root.updateMatrixWorld(true);

  // World-space bounds over all meshes drive the projection + gradient.
  const box = new THREE.Box3();
  let hasMesh = false;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      box.expandByObject(mesh);
      hasMesh = true;
    }
  });
  if (!hasMesh) return { painted: 0, meshes: 0 };

  const min = box.min;
  const size = new THREE.Vector3();
  box.getSize(size);
  const spanX = size.x || 1;
  const spanY = size.y || 1;

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const imageColor = new THREE.Color();
  const gradientColor = new THREE.Color();
  const out = new THREE.Color();

  let painted = 0;
  let meshes = 0;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!posAttr) return;
    const normalAttr = geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;

    const colors = new Float32Array(posAttr.count * 3);
    const matrix = mesh.matrixWorld;

    for (let i = 0; i < posAttr.count; i++) {
      position.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
      if (normalAttr) {
        normal.fromBufferAttribute(normalAttr, i);
      } else {
        normal.set(0, 0, 1);
      }
      // Direction-only transform (ignores scale) for the world normal.
      worldNormal.copy(normal).transformDirection(matrix);

      const u = (position.x - min.x) / spanX;
      const t = (position.y - min.y) / spanY;

      // v: object bottom (t=0) samples the image bottom row; u runs left→right.
      imageColor.copy(sampleImage(source, u, t));
      gradientColor.copy(gradientAt(palette, t));

      const facing = worldNormal.dot(front);
      const blend = smoothstep(gradientEdge, fullFront, facing);
      out.copy(gradientColor).lerp(imageColor, blend);

      colors[i * 3] = out.r;
      colors[i * 3 + 1] = out.g;
      colors[i * 3 + 2] = out.b;
      painted += 1;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    meshes += 1;
  });

  return { painted, meshes };
}

/**
 * Enable vertexColors on every material under the root so standard three.js
 * renderers/exporters pick up the baked COLOR_0 attribute.
 */
export function enableVertexColors(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material && "vertexColors" in material) {
        (material as THREE.MeshStandardMaterial).vertexColors = true;
        material.needsUpdate = true;
      }
    }
  });
}
