/**
 * OmniCraft toolbag registry — the reference's nine workspace tools
 * (DOM truth, 2026-10-28 recon of hyper3d.ai/workspace/omnicraft/hdri:
 * Texture Generator, Image Enhancer, Image Remix, HDRI Generation,
 * Rodin Search, Vector to 3D, Mesh Editor, Model Viewer, Format Convertor;
 * slugs re-pinned 2026-10-31 against the live workspace URLs: vecto3d and
 * formatcon, not the retired public landing's vector/convertor).
 *
 * This registry is the single source of truth shared by the toolbag index
 * (/workspace/omnicraft), the per-tool routes (/workspace/omnicraft/[tool]),
 * and the studio's OmniCraft grid dropdown — the same nine names, in the
 * reference's order. The public /omnicraft landing tree is retired exactly
 * like the reference's own (301s, sitemap removal — DECISIONS.md #51).
 *
 * Honesty contract (same ethos as DECISIONS.md #34): a tool is `live` only
 * when it is actually implemented in this clone; the rest are listed with a
 * truthful note, because a dead-but-pretty grid is worse than an honest one.
 */

export type OmniCraftToolStatus = "live" | "not-in-clone";

export interface OmniCraftTool {
  /** URL slug under /workspace/omnicraft/ (the reference's own workspace slugs). */
  slug: string;
  /** The reference grid's exact label. */
  name: string;
  /** One-line honest description of what the clone's version does. */
  blurb: string;
  status: OmniCraftToolStatus;
  /** True when the tool runs entirely in the browser — no upload, no server round-trip. */
  local: boolean;
  /** For `not-in-clone` tools: the truthful reason. */
  note?: string;
}

export const OMNICRAFT_TOOLS: OmniCraftTool[] = [
  {
    slug: "texture",
    name: "Texture Generator",
    blurb: "AI texture painting for uploaded models.",
    status: "not-in-clone",
    local: false,
    note: "Needs a generative image model this clone does not wire — the studio's material redo (neural engine, in-browser re-paint) is the honest equivalent here.",
  },
  {
    slug: "enhancer",
    name: "Image Enhancer",
    blurb: "Upscale and enhance reference images.",
    status: "not-in-clone",
    local: false,
    note: "Needs a generative upscaler; this clone's image inputs are passed to the engine at their uploaded fidelity.",
  },
  {
    slug: "remix",
    name: "Image Remix",
    blurb: "Re-imagine an image with a prompt.",
    status: "not-in-clone",
    local: false,
    note: "A pure image-to-image feature of the reference's separate toolbag — no honest local equivalent exists in this clone yet.",
  },
  {
    slug: "hdri",
    name: "HDRI Generation",
    blurb: "Prompt-seeded procedural skyboxes — 360° preview, PNG up to 4K, fully local.",
    status: "live",
    local: true,
  },
  {
    slug: "search",
    name: "Rodin Search",
    blurb: "The reference's 3D model search engine.",
    status: "not-in-clone",
    local: false,
    note: "A web-wide model index — nothing in this clone honestly reproduces it. The studio's gallery search covers your own tasks.",
  },
  {
    slug: "vecto3d",
    name: "Vector to 3D",
    blurb: "SVG in, extruded GLB out — depth, bevel and color, rendered locally.",
    status: "live",
    local: true,
  },
  {
    slug: "mesh",
    name: "Mesh Editor",
    blurb: "The reference's hosted mesh editing suite.",
    status: "not-in-clone",
    local: false,
    note: "The studio already covers the honest subset (orientation, material redo, aspect constraints); a full hosted editor is out of scope for this clone.",
  },
  {
    slug: "viewer",
    name: "Model Viewer",
    blurb: "Drop any GLB/GLTF and inspect it locally — no upload.",
    status: "live",
    local: true,
  },
  {
    slug: "formatcon",
    name: "Format Convertor",
    blurb: "Your generated tasks to GLB, GLTF, FBX, OBJ, STL or USDZ.",
    status: "live",
    local: false,
  },
];

/** Live tools in reference grid order (used by the studio dropdown). */
export function liveOmniCraftTools(): OmniCraftTool[] {
  return OMNICRAFT_TOOLS.filter((t) => t.status === "live");
}

export function omnicraftToolBySlug(slug: string): OmniCraftTool | undefined {
  return OMNICRAFT_TOOLS.find((t) => t.slug === slug);
}

export function omnicraftHref(slug: string): string {
  return `/workspace/omnicraft/${slug}`;
}

/** Valid dynamic-route slugs — anything else renders the honest unknown-tool panel. */
export function isOmnicraftSlug(slug: string): boolean {
  return omnicraftToolBySlug(slug) !== undefined;
}
