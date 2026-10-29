/**
 * Use-cases tree registry — the single source of truth for the /use-cases
 * tree, shared by the index page, the /use-cases/[slug] route, the studio
 * footer wiring, the sitemap, and the tests. Same pattern as features.ts
 * (t57) and legal.ts (t58).
 *
 * Reference sitemap truth (landing-sitemap-use-cases-en.xml, recon
 * 2026-10-29): index + 11 pages. Honesty contract: 10 workflows are
 * genuinely live end-to-end here (generate + real exports); animation is
 * partial (meshes real, rigging absent — stated on the page, asserted by
 * test).
 */
import { USE_CASE_PAGES_A } from "./use-case-content-a";
import { USE_CASE_PAGES_B } from "./use-case-content-b";
import type { UseCasePageDef } from "./use-case-types";

export type {
  UseCasePageDef,
  UseCaseStatus,
  UseCaseStep,
  UseCaseBenefit,
  UseCaseCard,
  UseCaseFaq,
  UseCaseCrossLink,
  UseCaseCta,
} from "./use-case-types";

/** The reference's use-cases sitemap (captured 2026-10-29). */
export const REFERENCE_USE_CASE_SLUGS = [
  "3d-printing",
  "animation",
  "automotive-design",
  "character-design",
  "e-commerce",
  "game-development",
  "jewelry-design",
  "mechanical-engineering",
  "metaverse",
  "nft-creation",
  "vr-ar",
] as const;

/** All 11 use-case pages, reference sitemap order. */
export const USE_CASE_PAGES: UseCasePageDef[] = [...USE_CASE_PAGES_A, ...USE_CASE_PAGES_B];

export function findUseCasePage(slug: string): UseCasePageDef | undefined {
  return USE_CASE_PAGES.find((p) => p.slug === slug);
}

/** Slugs for generateStaticParams. */
export const USE_CASE_SLUGS: string[] = USE_CASE_PAGES.map((p) => p.slug);

/** The routes the use-cases tree exposes (for the sitemap + tests). */
export const USE_CASE_ROUTES: string[] = [
  "/use-cases",
  ...USE_CASE_PAGES.map((p) => `/use-cases/${p.slug}`),
];

/** Grouping for the index page (reference groups by discipline loosely;
 * this clone groups the same 11 pages into three readable bands). */
export const USE_CASE_GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: "Make & print",
    slugs: ["3d-printing", "jewelry-design", "mechanical-engineering"],
  },
  {
    title: "Games, XR & worlds",
    slugs: ["game-development", "vr-ar", "metaverse", "nft-creation"],
  },
  {
    title: "Products & characters",
    slugs: ["e-commerce", "character-design", "automotive-design", "animation"],
  },
];
