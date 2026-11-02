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

/**
 * t87: the reference's per-page anatomy blocks the shared renderer did not
 * have — each optional, rendered only when a page's def carries it (the
 * t85/t86 shared-renderer convention for the features tree, ported to the
 * use-cases tree; see recon/t87/notes.md for the per-page mapping to the
 * reference's own h2 sections).
 */

/** A copy-paste prompt card (mono box + honest note) — the t60/t85 recipes shape. */
export interface UseCasePromptCard {
  /** The prompt text itself, shown in a bordered mono box. */
  prompt: string;
  /** Honest note: what this prompt really does here / the nearest real path. */
  note: string;
}

export interface UseCasePromptExamples {
  title: string;
  intro: string;
  cards: UseCasePromptCard[];
}

/** The reference's extra card bands ("Watertight or it doesn't print",
 * "One base mesh, a whole rarity ladder", "Frame rate is the real art
 * director"…), carried honestly. */
export interface UseCaseTechCard {
  title: string;
  body: string;
}

export interface UseCaseTechSection {
  title: string;
  intro: string;
  cards: UseCaseTechCard[];
}

/** The reference's format bands ("Exports that fit automotive pipelines",
 * "Formats your storefront actually accepts"…) — names pinned to
 * EXPORT_FORMATS, same as the t85 features convention. */
export interface UseCaseExportFormat {
  name: string;
  note: string;
}

export interface UseCaseExportTypes {
  title: string;
  intro: string;
  formats: UseCaseExportFormat[];
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
  /** t87 optional block: copy-paste prompt cards (between benefits and cards). */
  promptExamples?: UseCasePromptExamples;
  /** t87 optional block: the reference's extra card bands (after the cards). */
  techCards?: UseCaseTechSection;
  /** t87 optional block: export-format cards pinned to EXPORT_FORMATS (after tech cards). */
  exportTypes?: UseCaseExportTypes;
}
