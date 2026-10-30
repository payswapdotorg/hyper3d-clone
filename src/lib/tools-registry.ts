/**
 * Tools tree registry (t64) — the single source of truth for the
 * /tools tree: the converter matrix (index + 178 from/to pairs), the
 * viewer pages (index + 15 formats) and the eight flat image-to pages.
 * 203 routes total, exactly the reference's
 * landing-sitemap-tools-en.xml (recon 2026-10-30), nothing invented.
 *
 * Pair statuses are COMPUTED from the real facts (never hand-set, so
 * they can never drift from the codebase):
 *  - "task-export": from AND to are both among the six real export
 *    formats — the live Format Convertor genuinely re-exports your
 *    generated tasks between them. (24 pairs)
 *  - "generative": from is an image format and to is a real export
 *    format — there is no file conversion here, but the real path is
 *    image-to-3D generation plus export, and the page says it is
 *    generation, not conversion. (46 pairs)
 *  - "not-here": everything else — with the honest reason computed
 *    from which side fails. (108 pairs)
 *
 * Viewer statuses: glb/gltf are real (the live Model Viewer parses
 * them locally, never uploads); the other 13 are not.
 * Image-to statuses: the six real export formats are real (Rodin image
 * mode + export); 3mf/dxf are not.
 */

import {
  IMAGE_SOURCE_FORMATS,
  REAL_EXPORT_FORMATS,
  isCadFormat,
  isImageSourceFormat,
  isRealExportFormat,
  toolFormat,
} from "./tool-formats";

export type ConverterPairStatus = "task-export" | "generative" | "not-here";
export type ViewerFormatStatus = "live" | "not-here";
export type ImageToStatus = "live" | "not-here";

/** The reference's 178 converter pairs, captured from its sitemap. */
export const REFERENCE_CONVERTER_PAIRS: readonly [string, string][] = [
  ["3ds", "dae"], ["3ds", "fbx"], ["3ds", "glb"], ["3ds", "obj"], ["3ds", "stl"], ["3ds", "usdz"],
  ["3mf", "fbx"], ["3mf", "glb"], ["3mf", "obj"], ["3mf", "stl"],
  ["avif", "3dm"], ["avif", "3mf"], ["avif", "dae"], ["avif", "dwg"], ["avif", "dxf"], ["avif", "glb"], ["avif", "obj"], ["avif", "stl"],
  ["blend", "dae"], ["blend", "fbx"], ["blend", "glb"], ["blend", "gltf"], ["blend", "obj"], ["blend", "stl"], ["blend", "usdz"],
  ["bmp", "3ds"], ["bmp", "dwg"], ["bmp", "dxf"], ["bmp", "glb"], ["bmp", "jpg"], ["bmp", "obj"], ["bmp", "stl"],
  ["dae", "fbx"], ["dae", "glb"], ["dae", "obj"],
  ["dxf", "fbx"], ["dxf", "glb"], ["dxf", "gltf"], ["dxf", "obj"], ["dxf", "stl"],
  ["fbx", "glb"], ["fbx", "gltf"], ["fbx", "obj"], ["fbx", "stl"],
  ["gcode", "stl"],
  ["gif", "3dm"], ["gif", "3ds"], ["gif", "3mf"], ["gif", "dwg"], ["gif", "dxf"], ["gif", "glb"], ["gif", "gltf"], ["gif", "jpeg"], ["gif", "obj"], ["gif", "ply"], ["gif", "stl"],
  ["glb", "dae"], ["glb", "fbx"], ["glb", "gltf"], ["glb", "obj"], ["glb", "stl"], ["glb", "usdz"],
  ["gltf", "dae"], ["gltf", "fbx"], ["gltf", "glb"], ["gltf", "obj"], ["gltf", "usdz"],
  ["heic", "3dm"], ["heic", "3ds"], ["heic", "3mf"], ["heic", "dae"], ["heic", "dwg"], ["heic", "dxf"], ["heic", "fbx"], ["heic", "glb"], ["heic", "obj"], ["heic", "stl"],
  ["jpeg", "3dm"], ["jpeg", "3ds"], ["jpeg", "3mf"], ["jpeg", "dwg"], ["jpeg", "dxf"], ["jpeg", "fbx"], ["jpeg", "glb"], ["jpeg", "gltf"], ["jpeg", "obj"], ["jpeg", "ply"], ["jpeg", "stl"], ["jpeg", "usdz"], ["jpeg", "webp"],
  ["jpg", "3dm"], ["jpg", "3ds"], ["jpg", "3mf"], ["jpg", "dae"], ["jpg", "dwg"], ["jpg", "dxf"], ["jpg", "fbx"], ["jpg", "glb"], ["jpg", "gltf"], ["jpg", "obj"], ["jpg", "ply"], ["jpg", "stl"], ["jpg", "usdz"],
  ["obj", "dae"], ["obj", "fbx"], ["obj", "glb"], ["obj", "gltf"], ["obj", "stl"], ["obj", "usdz"],
  ["off", "glb"], ["off", "stl"],
  ["ply", "glb"], ["ply", "obj"], ["ply", "stl"], ["ply", "usdz"],
  ["png", "3dm"], ["png", "3ds"], ["png", "3mf"], ["png", "dae"], ["png", "dwg"], ["png", "dxf"], ["png", "fbx"], ["png", "glb"], ["png", "gltf"], ["png", "obj"], ["png", "ply"], ["png", "stl"], ["png", "usdz"],
  ["stl", "fbx"], ["stl", "glb"], ["stl", "obj"], ["stl", "ply"],
  ["svg", "3dm"], ["svg", "3ds"], ["svg", "3mf"], ["svg", "dwg"], ["svg", "dxf"], ["svg", "fbx"], ["svg", "glb"], ["svg", "gltf"], ["svg", "obj"], ["svg", "ply"], ["svg", "stl"], ["svg", "usdz"], ["svg", "webp"],
  ["tiff", "3dm"], ["tiff", "3ds"], ["tiff", "3mf"], ["tiff", "dae"], ["tiff", "dwg"], ["tiff", "dxf"], ["tiff", "fbx"], ["tiff", "glb"], ["tiff", "obj"], ["tiff", "ply"],
  ["usdz", "dae"], ["usdz", "fbx"], ["usdz", "glb"], ["usdz", "gltf"],
  ["webp", "3dm"], ["webp", "3ds"], ["webp", "3mf"], ["webp", "dae"], ["webp", "dwg"], ["webp", "dxf"], ["webp", "fbx"], ["webp", "glb"], ["webp", "gltf"], ["webp", "jpg"], ["webp", "obj"], ["webp", "ply"], ["webp", "png"], ["webp", "stl"],
  ["x", "fbx"], ["x", "glb"], ["x", "gltf"], ["x", "obj"], ["x", "stl"],
];

/** The reference's eight flat image-to routes. */
export const REFERENCE_IMAGE_TO_FORMATS = [
  "3mf",
  "dxf",
  "fbx",
  "glb",
  "gltf",
  "obj",
  "stl",
  "usdz",
] as const;

/** The reference's viewer index + 15 viewer format pages. */
export const REFERENCE_VIEWER_FORMATS = [
  "3dm",
  "3ds",
  "3mf",
  "dae",
  "fbx",
  "glb",
  "gltf",
  "ifc",
  "iges",
  "obj",
  "ply",
  "step",
  "stl",
  "stp",
  "usdz",
] as const;

/** Computed from the real facts — never hand-set. */
export function converterPairStatus(from: string, to: string): ConverterPairStatus {
  if (isRealExportFormat(from) && isRealExportFormat(to)) return "task-export";
  if (isImageSourceFormat(from) && isRealExportFormat(to)) return "generative";
  return "not-here";
}

export function viewerFormatStatus(format: string): ViewerFormatStatus {
  return format === "glb" || format === "gltf" ? "live" : "not-here";
}

export function imageToStatus(format: string): ImageToStatus {
  return isRealExportFormat(format) ? "live" : "not-here";
}

/** The honest reason a not-here pair is not here (computed). */
export function converterPairReason(from: string, to: string): string {
  const fromReal = isRealExportFormat(from);
  const toReal = isRealExportFormat(to);
  const fromImage = isImageSourceFormat(from);
  const toImage = isImageSourceFormat(to);
  if (fromReal && !toReal) {
    if (toImage) {
      return `There is no image output anywhere in this clone — the exporters ship exactly six 3D formats, and ${to.toUpperCase()} is an image format. The studio generates 3D models; it does not process images into other image formats.`;
    }
    if (isCadFormat(to)) {
      return `The exporters ship exactly six 3D formats — GLB, glTF, FBX, OBJ, STL and USDZ — and ${to.toUpperCase()} is not among them. This clone has no CAD support of any kind, so there is no CAD detour either.`;
    }
    return `The exporters ship exactly six 3D formats — GLB, glTF, FBX, OBJ, STL and USDZ — and ${to.toUpperCase()} is not among them. Take a real export into your DCC if you need ${to.toUpperCase()}.`;
  }
  if (fromImage && !toReal) {
    if (toImage) {
      return `Image-to-image conversion does not exist in this clone at all — ${from.toUpperCase()} to ${to.toUpperCase()} is picture processing, and this studio generates 3D geometry; it does not convert pictures into pictures.`;
    }
    if (isCadFormat(to)) {
      return `The real path from a ${from.toUpperCase()} image is image-to-3D generation, and generated models export in exactly six formats — GLB, glTF, FBX, OBJ, STL and USDZ. ${to.toUpperCase()} is a CAD format this clone has no support for at all.`;
    }
    return `The real path from a ${from.toUpperCase()} image is image-to-3D generation, and generated models export in exactly six formats — GLB, glTF, FBX, OBJ, STL and USDZ. ${to.toUpperCase()} is not among them.`;
  }
  // from is not real and not an image the studio can generate from
  return `The Format Convertor re-exports your own generated tasks — it does not import ${from.toUpperCase()} files. ${toolFormat(from)?.hereNote ?? ""}`;
}

/** All 178 converter pair routes. */
export const CONVERTER_PAIR_ROUTES: string[] = REFERENCE_CONVERTER_PAIRS.map(
  ([from, to]) => `/tools/converter/${from}/to/${to}`,
);

/** The viewer tree's routes: index + 15 formats. */
export const VIEWER_ROUTES: string[] = [
  "/tools/viewer",
  ...REFERENCE_VIEWER_FORMATS.map((f) => `/tools/viewer/${f}`),
];

/** The eight flat image-to routes. */
export const IMAGE_TO_ROUTES: string[] = REFERENCE_IMAGE_TO_FORMATS.map(
  (f) => `/tools/image-to-${f}`,
);

/** Every route the /tools tree exposes (for the sitemap + tests). */
export const TOOLS_ROUTES: string[] = [
  "/tools/converter",
  ...CONVERTER_PAIR_ROUTES,
  ...IMAGE_TO_ROUTES,
  ...VIEWER_ROUTES,
];

/** The honest census, computed — asserted by the tests. */
export function converterCensus() {
  const counts = { "task-export": 0, generative: 0, "not-here": 0 } as Record<ConverterPairStatus, number>;
  for (const [from, to] of REFERENCE_CONVERTER_PAIRS) {
    counts[converterPairStatus(from, to)] += 1;
  }
  return counts;
}

/** Group the pairs by from-format for the converter index matrix. */
export function converterPairsByFrom(): { from: string; tos: string[] }[] {
  const map = new Map<string, string[]>();
  for (const [from, to] of REFERENCE_CONVERTER_PAIRS) {
    if (!map.has(from)) map.set(from, []);
    map.get(from)!.push(to);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, tos]) => ({ from, tos: [...tos].sort() }));
}

/** Image source formats, exported for content builders. */
export { IMAGE_SOURCE_FORMATS, REAL_EXPORT_FORMATS };
