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
