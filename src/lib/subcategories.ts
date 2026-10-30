/**
 * Sub-categories tree registry — the single source of truth for the
 * /sub-categories tree (t63), shared by the /sub-categories/[slug] route,
 * the sitemap, and the tests. Same pattern as features.ts (t57),
 * legal.ts (t58), use-cases.ts (t59), styles.ts (t60), help.ts (t61).
 *
 * Reference sitemap truth (landing-sitemap-sub-categories-en.xml, recon
 * 2026-10-30): exactly three leaf pages — dark-fantasy, nsfw-content,
 * roblox — and NO index page (bare /sub-categories 404s at the reference,
 * exactly like bare /event; the clone reproduces that).
 *
 * Honesty contract: two pages are "generatable" (the theme steers the
 * real generator; the marketplace collection is honestly absent) and one
 * is "absent" (nsfw-content — no collection, no tags, no mode at all).
 * The reference's model counts ("88 models", "843 models") appear
 * nowhere in this clone.
 */

import type { SubCategoryPageDef } from "./subcategory-types";
import {
  DARK_FANTASY_PAGE,
  NSFW_CONTENT_PAGE,
  ROBLOX_PAGE,
} from "./subcategory-content";

export type {
  SubCategoryCta,
  SubCategoryFaq,
  SubCategoryLink,
  SubCategoryPageDef,
  SubCategoryStatus,
} from "./subcategory-types";

/** The reference's sub-category sitemap (captured 2026-10-30). */
export const REFERENCE_SUBCATEGORY_SLUGS = [
  "dark-fantasy",
  "nsfw-content",
  "roblox",
] as const;

/** All three sub-category pages, reference sitemap order. */
export const SUBCATEGORY_PAGES: SubCategoryPageDef[] = [
  DARK_FANTASY_PAGE,
  NSFW_CONTENT_PAGE,
  ROBLOX_PAGE,
];

export function findSubCategory(slug: string): SubCategoryPageDef | undefined {
  return SUBCATEGORY_PAGES.find((p) => p.slug === slug);
}

/** Slugs for generateStaticParams. */
export const SUBCATEGORY_SLUGS: string[] = SUBCATEGORY_PAGES.map((p) => p.slug);

/**
 * The routes this tree exposes (for the sitemap + tests): exactly the
 * reference's three leaves — deliberately NO "/sub-categories" index,
 * because the reference's sitemap ships none and bare /event set the
 * precedent for index-less trees.
 */
export const SUBCATEGORY_ROUTES: string[] = SUBCATEGORY_PAGES.map(
  (p) => `/sub-categories/${p.slug}`,
);
