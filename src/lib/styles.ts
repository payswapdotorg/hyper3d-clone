/**
 * Styles tree registry — the single source of truth for the /styles tree,
 * shared by the index page, the /styles/[slug] route, the studio footer
 * wiring, the sitemap, and the tests. Same pattern as features.ts (t57),
 * legal.ts (t58), and use-cases.ts (t59).
 *
 * Reference sitemap truth (landing-sitemap-styles-en.xml, recon
 * 2026-10-29): index + 21 style pages. Honesty contract: 17 styles are
 * genuinely steerable here through the real levers (prompt-steered spec
 * geometry, flat parameter materials, real exports); 4 are partial —
 * cel-shaded, hand-painted, photorealistic, pixel-art — because their
 * essence is baked textures or a toon shading model, which this clone
 * does not have (stated on each page, asserted by test).
 */
import { STYLE_PAGES_A } from "./style-content-a";
import { STYLE_PAGES_B } from "./style-content-b";
import { STYLE_PAGES_C } from "./style-content-c";
import type { StylePageDef } from "./style-types";

export type {
  StylePageDef,
  StyleStatus,
  StyleStep,
  StyleSignal,
  StyleRecipe,
  StyleFaq,
  StyleCrossLink,
  StyleCta,
} from "./style-types";

/** The reference's styles sitemap (captured 2026-10-29). */
export const REFERENCE_STYLE_SLUGS = [
  "abstract",
  "anime",
  "cartoon",
  "cel-shaded",
  "fantasy",
  "flat",
  "gothic",
  "hand-painted",
  "industrial",
  "isometric",
  "low-poly",
  "medieval",
  "minimalist",
  "modern",
  "organic",
  "photorealistic",
  "pixel-art",
  "realistic",
  "retro",
  "stylized",
  "voxel",
] as const;

/** All 21 style pages, reference sitemap order. */
export const STYLE_PAGES: StylePageDef[] = [
  ...STYLE_PAGES_A,
  ...STYLE_PAGES_B,
  ...STYLE_PAGES_C,
];

export function findStylePage(slug: string): StylePageDef | undefined {
  return STYLE_PAGES.find((p) => p.slug === slug);
}

/** Slugs for generateStaticParams. */
export const STYLE_SLUGS: string[] = STYLE_PAGES.map((p) => p.slug);

/** The routes the styles tree exposes (for the sitemap + tests). */
export const STYLE_ROUTES: string[] = [
  "/styles",
  ...STYLE_PAGES.map((p) => `/styles/${p.slug}`),
];

/**
 * Grouping for the index page. The reference index is a flat "Style
 * Matrix" grid; this clone keeps the same 21 cards in three readable
 * bands by how the style is honestly delivered, plus the fourth band
 * that names the partial contract outright.
 */
export const STYLE_GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: "Geometric & flat",
    slugs: ["low-poly", "voxel", "isometric", "flat", "minimalist", "abstract"],
  },
  {
    title: "Stylized worlds",
    slugs: ["cartoon", "anime", "stylized", "fantasy", "medieval", "gothic", "retro"],
  },
  {
    title: "Real-world & product",
    slugs: ["realistic", "modern", "industrial", "organic"],
  },
  {
    title: "Texture-dependent — finish in your DCC",
    slugs: ["photorealistic", "hand-painted", "cel-shaded", "pixel-art"],
  },
];
