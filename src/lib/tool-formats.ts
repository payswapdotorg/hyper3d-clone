/**
 * Tool-format fact table — the single source of truth for what each
 * 3D/image/CAD format genuinely IS in this clone (t64).
 *
 * The reference's /tools tree (landing-sitemap-tools-en.xml, recon
 * 2026-10-30: /tools/converter + 178 from/to pairs, /tools/viewer +
 * 15 formats, 8 flat /tools/image-to-{format} pages — 203 routes)
 * is an upload-anything converter + multi-format viewer. This clone's
 * real surfaces are different and narrower, and every page in the
 * /tools tree must state them exactly:
 *
 *  - The Format Convertor (live, /workspace/omnicraft/formatcon) re-exports YOUR
 *    generated tasks across the six real export formats — it is
 *    auth-gated and task-based; it does not upload arbitrary files.
 *  - The Model Viewer (live, /workspace/omnicraft/viewer) accepts GLB/GLTF only,
 *    parsed locally in the browser, never uploaded.
 *  - Vector to 3D (live, /workspace/omnicraft/vecto3d) extrudes SVG into GLB
 *    locally — the one genuinely local file→file conversion here.
 *  - Image-to-3D (real studio feature, /features/image-to-3d) turns a
 *    reference image into a generated 3D model — generation, not
 *    conversion, metered in credits.
 *
 * Every fact below is anchored to src/lib/exporters.ts EXPORT_FORMATS
 * and asserted by tools.test.ts.
 */

import { EXPORT_FORMATS } from "./exporters";

/** What kind of thing a format is (for honest per-page copy). */
export type ToolFormatKind =
  | "real-export" // shipped by this clone's exporters
  | "image" // a raster/vector image format
  | "dcc" // a DCC/exchange 3D format this clone does not ship
  | "cad" // a CAD/BIM format this clone does not touch
  | "print" // a 3D-printing format this clone does not ship
  | "image-out"; // an image OUTPUT format (image-to-image conversion)

export interface ToolFormatInfo {
  /** Lowercase slug as it appears in the reference's routes. */
  slug: string;
  /** Display name, e.g. "GLB", "FBX", "STEP". */
  name: string;
  kind: ToolFormatKind;
  /** One honest sentence about this format's status in this clone. */
  hereNote: string;
}

/** The six formats this clone's exporters really ship. */
export const REAL_EXPORT_FORMATS: string[] = [...EXPORT_FORMATS];

/** Display names for the six real export formats. */
const REAL_FORMAT_NAMES: Record<string, string> = {
  glb: "GLB",
  gltf: "glTF",
  fbx: "FBX",
  obj: "OBJ",
  stl: "STL",
  usdz: "USDZ",
};

/**
 * The real format list as prose ("GLB, glTF, FBX, OBJ, STL and USDZ") —
 * DERIVED from EXPORT_FORMATS, never hand-written, so every page that
 * enumerates the formats matches the exporters exactly.
 */
export const REAL_FORMAT_LIST: string = (() => {
  const names = EXPORT_FORMATS.map((f) => REAL_FORMAT_NAMES[f] ?? f.toUpperCase());
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
})();

/** The image formats the reference's converter accepts as input. */
export const IMAGE_SOURCE_FORMATS = [
  "avif",
  "bmp",
  "gif",
  "heic",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tiff",
  "webp",
] as const;

/** Every format that appears anywhere in the reference's /tools routes. */
export const TOOL_FORMATS: ToolFormatInfo[] = [
  // --- the six real export formats ---
  { slug: "glb", name: "GLB", kind: "real-export", hereNote: "GLB is the studio's native exchange format — every generated task previews and exports as GLB, fully real here." },
  { slug: "gltf", name: "glTF", kind: "real-export", hereNote: "glTF is a real export format here — the exporters ship it alongside GLB." },
  { slug: "fbx", name: "FBX", kind: "real-export", hereNote: "FBX is a real export format here — generated tasks export as FBX for DCC and game-engine workflows." },
  { slug: "obj", name: "OBJ", kind: "real-export", hereNote: "OBJ is a real export format here — generated tasks export as OBJ with material parameters." },
  { slug: "stl", name: "STL", kind: "real-export", hereNote: "STL is a real export format here — generated tasks export as STL for 3D printing." },
  { slug: "usdz", name: "USDZ", kind: "real-export", hereNote: "USDZ is a real export format here — generated tasks export as USDZ for AR workflows." },
  // --- image inputs (generation is real; conversion is not) ---
  { slug: "avif", name: "AVIF", kind: "image", hereNote: "AVIF is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "bmp", name: "BMP", kind: "image", hereNote: "BMP is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "gif", name: "GIF", kind: "image", hereNote: "GIF is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "heic", name: "HEIC", kind: "image", hereNote: "HEIC is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "jpeg", name: "JPEG", kind: "image", hereNote: "JPEG is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "jpg", name: "JPG", kind: "image", hereNote: "JPG is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "png", name: "PNG", kind: "image", hereNote: "PNG is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "svg", name: "SVG", kind: "image", hereNote: "SVG is special: the live Vector to 3D tool extrudes SVG into GLB locally — a genuine browser-side conversion, no account needed." },
  { slug: "tiff", name: "TIFF", kind: "image", hereNote: "TIFF is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  { slug: "webp", name: "WebP", kind: "image", hereNote: "WebP is an image format — this clone has no image converter, but image-to-3D generation accepts reference images." },
  // --- DCC / exchange formats this clone does not ship ---
  { slug: "3ds", name: "3DS", kind: "dcc", hereNote: "3DS is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  { slug: "3mf", name: "3MF", kind: "print", hereNote: "3MF is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  { slug: "blend", name: "BLEND", kind: "dcc", hereNote: "BLEND is Blender's own format — not shipped by this clone's exporters; take a real export into Blender instead." },
  { slug: "dae", name: "DAE", kind: "dcc", hereNote: "DAE (Collada) is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  { slug: "dxf", name: "DXF", kind: "cad", hereNote: "DXF is a CAD exchange format — this clone has no CAD support of any kind." },
  { slug: "dwg", name: "DWG", kind: "cad", hereNote: "DWG is AutoCAD's format — this clone has no CAD support of any kind." },
  { slug: "gcode", name: "G-code", kind: "print", hereNote: "G-code is slicer output, not a model format this clone reads or writes." },
  { slug: "off", name: "OFF", kind: "dcc", hereNote: "OFF is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  { slug: "ply", name: "PLY", kind: "dcc", hereNote: "PLY is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  { slug: "x", name: "X", kind: "dcc", hereNote: "X (DirectX) is not shipped by this clone's exporters — the six real formats are GLB, glTF, FBX, OBJ, STL and USDZ." },
  // --- CAD formats the reference's viewer lists ---
  { slug: "3dm", name: "3DM", kind: "cad", hereNote: "3DM is Rhino's format — this clone has no CAD support of any kind." },
  { slug: "ifc", name: "IFC", kind: "cad", hereNote: "IFC is a BIM format — this clone has no CAD or BIM support of any kind." },
  { slug: "iges", name: "IGES", kind: "cad", hereNote: "IGES is a legacy CAD exchange format — this clone has no CAD support of any kind." },
  { slug: "step", name: "STEP", kind: "cad", hereNote: "STEP is a CAD exchange format — this clone has no CAD support of any kind." },
  { slug: "stp", name: "STP", kind: "cad", hereNote: "STP is STEP by another extension — this clone has no CAD support of any kind." },
];

/** Lookup by slug. */
const BY_SLUG = new Map(TOOL_FORMATS.map((f) => [f.slug, f]));

export function toolFormat(slug: string): ToolFormatInfo | undefined {
  return BY_SLUG.get(slug);
}

/** Is this slug one of the six real export formats? */
export function isRealExportFormat(slug: string): boolean {
  return REAL_EXPORT_FORMATS.includes(slug);
}

/** Is this slug an image format the reference's converter accepts? */
export function isImageSourceFormat(slug: string): boolean {
  return (IMAGE_SOURCE_FORMATS as readonly string[]).includes(slug);
}

/** Is this slug a CAD/BIM format? */
export function isCadFormat(slug: string): boolean {
  return ["3dm", "dxf", "dwg", "ifc", "iges", "step", "stp"].includes(slug);
}
