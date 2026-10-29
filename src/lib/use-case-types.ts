/**
 * Use-case page types — the /use-cases tree's contract (t59).
 *
 * Mirrors the reference's use-case page anatomy (recon 2026-10-29 of
 * hyper3d.ai/use-cases/*: hero + "in three steps" + a benefits/quality
 * band + per-discipline cards + FAQ + "Explore more AI 3D use cases"
 * cross-links + closing CTA), with this clone's honesty contract on top:
 * every page states which parts of the workflow genuinely work here and
 * which are reference-only (same ethos as the features tree, t57).
 *
 * Status semantics for use-cases (a workflow, not a single feature):
 *  - "live":     the full loop works in this clone — generate from a
 *                prompt/image, get a real mesh, export it in the formats
 *                the page names, with the stated caveats.
 *  - "partial":  part of the loop is missing (e.g. animation: meshes and
 *                exports are real, rigging is not — the page says so).
 */

export type UseCaseStatus = "live" | "partial";

export interface UseCaseStep {
  title: string;
  body: string;
}

export interface UseCaseBenefit {
  title: string;
  body: string;
}

export interface UseCaseCard {
  title: string;
  body: string;
}

export interface UseCaseFaq {
  q: string;
  a: string;
}

export interface UseCaseCrossLink {
  label: string;
  href: string;
}

export interface UseCaseCta {
  label: string;
  href: string;
}

export interface UseCasePageDef {
  /** Path segment under /use-cases/ (reference sitemap order). */
  slug: string;
  /** Short name for nav/cards, e.g. "Game Development". */
  name: string;
  /** Page H1 (reference pattern: "AI 3D Asset Generator for Games" etc.). */
  title: string;
  /** Meta description (<=180 chars). */
  description: string;
  /** Hero subline under the H1. */
  subline: string;
  /** live | partial — see type doc. */
  status: UseCaseStatus;
  /** Chip label shown in the header ("WORKS HERE" / "PARTIAL HERE"). */
  statusChip: string;
  /** The honest status panel. */
  statusPanel: {
    /** One-sentence verdict. */
    summary: string;
    /** What genuinely works in this clone. */
    works: string[];
    /** What is different here vs the reference page. */
    limits: string[];
  };
  /** The "…in three steps" section. */
  stepsTitle: string;
  steps: UseCaseStep[];
  /** Benefits/quality band ("Built for…" / "What you get"). */
  benefitsTitle: string;
  benefits: UseCaseBenefit[];
  /** Per-discipline "what people make" cards. */
  cardsTitle: string;
  cards: UseCaseCard[];
  /** FAQ (native <details> — server component). */
  faqTitle: string;
  faq: UseCaseFaq[];
  /** Cross-links: sibling use-cases + relevant features/tools. */
  crossLinksTitle: string;
  crossLinks: UseCaseCrossLink[];
  /** Closing CTA band. */
  closingTitle: string;
  closingBody: string;
  closingCta: UseCaseCta;
  /** Hero CTAs. */
  cta: UseCaseCta;
  ctaSecondary?: UseCaseCta;
}
