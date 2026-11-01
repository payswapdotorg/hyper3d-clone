/**
 * Types for the /features tree (see features.ts for the registry contract).
 * Kept in a dedicated module so the three content files and the registry can
 * import the shapes without cycles.
 */

export type FeatureStatus = "live" | "partial" | "reference-only";

export interface FeatureStep {
  title: string;
  body: string;
}

export interface FeatureBenefit {
  title: string;
  body: string;
}

export interface FeatureUseCase {
  tag: string;
  title: string;
  body: string;
}

export interface FeatureFaq {
  q: string;
  a: string;
}

export interface FeatureCrossLink {
  label: string;
  href: string;
}

export interface FeatureCta {
  label: string;
  href: string;
}

/**
 * t85: the reference's per-page anatomy blocks the shared renderer did not
 * have — each optional, rendered only when a page's def carries it (the
 * shared-renderer convention; see recon/t85/notes.md for the per-page
 * mapping to the reference's own h2 sections).
 */

/** A copy-paste prompt card (mono box + honest note) — the t60 recipes shape. */
export interface FeaturePromptCard {
  /** The prompt text itself, shown in a bordered mono box. */
  prompt: string;
  /** Honest note: what this prompt really does here / the nearest real path. */
  note: string;
}

export interface FeaturePromptExamples {
  title: string;
  intro: string;
  cards: FeaturePromptCard[];
}

/** The reference's "The AI Behind…" / "Built for…" card rows. */
export interface FeatureTechCard {
  title: string;
  body: string;
}

export interface FeatureTechSection {
  title: string;
  intro: string;
  cards: FeatureTechCard[];
}

/** The reference's "Built on award-winning 3D research" block, mirrored honestly. */
export interface FeatureResearchNote {
  title: string;
  body: string;
}

/** A mono code block (real, runnable text — routes fs-verified in tests). */
export interface FeatureCodeBlock {
  label: string;
  code: string;
}

export interface FeatureCodeExamples {
  title: string;
  intro: string;
  blocks: FeatureCodeBlock[];
}

/** The api page's export-format cards — names pinned to EXPORT_FORMATS. */
export interface FeatureExportFormat {
  name: string;
  note: string;
}

export interface FeatureExportTypes {
  title: string;
  intro: string;
  formats: FeatureExportFormat[];
}

export interface FeaturePageDef {
  /** URL path under /features/ (nested slugs allowed: "mcp/mcp-claude"). */
  slug: string;
  /** The reference nav label. */
  name: string;
  /** H1 hero title, reference style. */
  title: string;
  /** Hero subline paragraph. */
  subline: string;
  /** Honest clone status. */
  status: FeatureStatus;
  /** One-line honest chip label (what this page's status means here). */
  statusChip: string;
  /** Longer honest paragraph shown in the status panel (all statuses). */
  statusNote: string;
  /** Primary CTA — always a real internal route (or null for pure reference pages). */
  cta: FeatureCta | null;
  /** Secondary text CTA under the hero. */
  ctaSecondary: FeatureCta | null;
  stepsTitle: string;
  stepsIntro: string;
  steps: FeatureStep[];
  benefitsTitle: string;
  benefitsIntro: string;
  benefits: FeatureBenefit[];
  useCasesTitle: string;
  useCasesIntro: string;
  useCases: FeatureUseCase[];
  /** t85 optional block: copy-paste prompt cards (between benefits and use cases). */
  promptExamples?: FeaturePromptExamples;
  /** t85 optional block: the reference's research-credentials section, mirrored honestly. */
  researchNote?: FeatureResearchNote;
  /** t85 optional block: "The AI Behind…" pipeline cards (after use cases). */
  techCards?: FeatureTechSection;
  /** t85 optional block: mono code examples with real routes (after tech cards). */
  codeExamples?: FeatureCodeExamples;
  /** t85 optional block: export-format cards pinned to EXPORT_FORMATS. */
  exportTypes?: FeatureExportTypes;
  faqTitle: string;
  faqIntro: string;
  faq: FeatureFaq[];
  crossLinksTitle: string;
  crossLinksIntro: string;
  crossLinks: FeatureCrossLink[];
  closingTitle: string;
  closingBody: string;
  closingCta: FeatureCta;
  /** Index grid grouping (mirrors the reference /features index). */
  group: "core" | "ai-media" | "mcp" | "omnicraft";
  /** One-liner for the /features index card. */
  indexBlurb: string;
}
