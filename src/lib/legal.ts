/**
 * Legal Center registry — single source of truth for the /legal tree,
 * shared by the index page, the /legal/[slug] route, the studio footer
 * wiring, the sitemap, and the tests. Same pattern as features.ts (t57).
 */
import { LEGAL_DOCS } from "./legal-content";
import type { LegalDocDef } from "./legal-types";

export type { LegalDocDef, LegalSection } from "./legal-types";

/** The reference's legal sitemap (captured 2026-10-29), minus the index. */
export const REFERENCE_LEGAL_SLUGS = [
  "copyright-license",
  "fulfillment",
  "privacy",
  "refund",
  "terms",
] as const;

/** All five documents, reference sitemap order. */
export const LEGAL_DOCUMENTS: LegalDocDef[] = LEGAL_DOCS;

export function legalBySlug(slug: string): LegalDocDef | undefined {
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug);
}

/** Slugs for generateStaticParams. */
export function legalSlugs(): string[] {
  return LEGAL_DOCUMENTS.map((d) => d.slug);
}

/** The routes the legal tree exposes (for the sitemap + tests). */
export function legalRoutes(): string[] {
  return ["/legal", ...LEGAL_DOCUMENTS.map((d) => `/legal/${d.slug}`)];
}
