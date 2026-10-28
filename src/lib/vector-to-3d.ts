/**
 * OmniCraft Vector to 3D — SVG → extruded mesh helpers.
 *
 * The reference's tool turns vector art into 3D via an AI/DCC pipeline; this
 * clone's honest equivalent is a real local extrusion: SVGLoader (browser)
 * parses the paths, ExtrudeGeometry gives them thickness, and the result is
 * exported through the same exporter pipeline as every other model in this
 * clone. This module holds the pure, testable parts: settings clamping,
 * export normalization math, and SVG source detection.
 */
import * as THREE from "three";

/** Extrusion controls shared by the UI and the geometry pass. */
export interface ExtrudeControls {
  /** Extrusion depth in model units. [0.05, 4] */
  depth: number;
  /** Bevel size in model units. [0, 0.5] */
  bevelSize: number;
  bevelEnabled: boolean;
  /** Path curve tessellation. [4, 32] */
  curveSegments: number;
}

export const DEFAULT_EXTRUDE_CONTROLS: ExtrudeControls = {
  depth: 0.5,
  bevelSize: 0.05,
  bevelEnabled: true,
  curveSegments: 12,
};

/** Clamp arbitrary UI input into the engine's legal extrusion ranges. */
export function extrudeSettingsFrom(c: Partial<ExtrudeControls>): ExtrudeControls {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    depth: clamp(typeof c.depth === "number" && Number.isFinite(c.depth) ? c.depth : DEFAULT_EXTRUDE_CONTROLS.depth, 0.05, 4),
    bevelSize: clamp(
      typeof c.bevelSize === "number" && Number.isFinite(c.bevelSize) ? c.bevelSize : DEFAULT_EXTRUDE_CONTROLS.bevelSize,
      0,
      0.5,
    ),
    bevelEnabled: c.bevelEnabled ?? DEFAULT_EXTRUDE_CONTROLS.bevelEnabled,
    curveSegments: Math.round(
      clamp(
        typeof c.curveSegments === "number" && Number.isFinite(c.curveSegments) ? c.curveSegments : DEFAULT_EXTRUDE_CONTROLS.curveSegments,
        4,
        32,
      ),
    ),
  };
}

/** three.js ExtrudeGeometry options derived from the clamped controls. */
export function extrudeGeometryOptions(c: ExtrudeControls): {
  depth: number;
  bevelEnabled: boolean;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
  curveSegments: number;
} {
  return {
    depth: c.depth,
    bevelEnabled: c.bevelEnabled && c.bevelSize > 0,
    bevelThickness: c.bevelSize,
    bevelSize: c.bevelSize,
    bevelSegments: 2,
    curveSegments: c.curveSegments,
  };
}

/**
 * Normalize an arbitrary object for export: center at the origin and
 * uniformly scale so the largest dimension is `targetSize` (no axis
 * distortion — a uniform aspect stays uniform). Applied in place via a
 * wrapper group so the caller keeps its own hierarchy intact.
 */
export function normalizeForExport(root: THREE.Object3D, targetSize = 2): THREE.Group {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1;
  const wrapper = new THREE.Group();
  // Translate by -center (do not overwrite position — the root may sit anywhere).
  root.position.x -= center.x;
  root.position.y -= center.y;
  root.position.z -= center.z;
  wrapper.add(root);
  wrapper.scale.setScalar(scale);
  return wrapper;
}

/** Quick source sniff so obviously non-SVG pastes fail with a clear message. */
export function looksLikeSvg(source: string): boolean {
  const s = source.trim().toLowerCase();
  if (!s) return false;
  if (s.startsWith("<svg")) return true;
  // Allow XML prolog / DOCTYPE / comments before the root <svg> element.
  const rootIdx = s.indexOf("<svg");
  return rootIdx > 0 && s.slice(0, rootIdx).replace(/<\?[^?]*\?>|<!doctype[^>]*>|<!--[\s\S]*?-->/g, "").trim() === "";
}

/** A small built-in sample so the tool demos itself (a 5-point star). */
export const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="#8b5cf6" d="M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z"/>
  <circle cx="50" cy="50" r="8" fill="#0f0f12"/>
</svg>`;
