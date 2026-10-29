/**
 * Landing page types — the contracts for the five standalone landing
 * routes this clone adds in t62 to reach full parity with the reference's
 * English landing sitemap: /pricing, /3d-prompts, /switch,
 * /switch/makerworld, and /event/chroma-awards.
 *
 * These are singleton marketing-style pages (not content trees like
 * features/styles/use-cases/help), so each page gets its own def shape —
 * but all of them follow the same honesty contract as every other public
 * surface in this clone: claims are anchored to real code constants
 * (credits.ts 50/1/10, exporters.ts EXPORT_FORMATS), absences are stated
 * outright, and the nearest real path is always named.
 *
 * Reference recon (2026-10-30):
 *  - hyper3d.ai/pricing — Free/$0, Creator $30, Business $120, Enterprise,
 *    Education; monthly/yearly toggle; comparison table; pricing FAQ; CTA.
 *  - hyper3d.ai/3d-prompts — featured examples, prompt cards organized by
 *    the AI model that wrote them, "how to use a 3D prompt" three steps.
 *  - hyper3d.ai/switch — Meshy/Tripo migration offer (up to 6 months
 *    free, 50% off 12 months, profile-link verification, comparison
 *    table, testimonials, FAQ).
 *  - hyper3d.ai/switch/makerworld — MakerWorld creator offer with
 *    model-count tiers (≤10 / 11–50 / 51+), bio-code verification.
 *  - hyper3d.ai/event/chroma-awards — Chroma Awards entrant offer (a
 *    free month of Creator, redeem deadline, backer list, workflow
 *    picker).
 */

import type { ReactNode } from "react";

/** A call-to-action that must point at a real route in this clone. */
export interface LandingCta {
  label: string;
  href: string;
}

/** Question + honest answer pair (FAQ blocks on every landing page). */
export interface LandingFaq {
  question: string;
  answer: string;
}

/** One row of a "what it actually costs" style summary table. */
export interface LandingTableRow {
  /** The thing you do (left cell). */
  action: string;
  /** What it really costs / really is (right cell). */
  cost: string;
  /** Optional third column: the honest detail. */
  detail?: string;
}

/** Shared shell props: eyebrow chip, H1, subhead paragraph, CTAs. */
export interface LandingHero {
  eyebrow: string;
  headline: string;
  /** May contain a single <em> rendered with the clone's gradient text. */
  subhead: ReactNode | string;
  primaryCta: LandingCta;
  secondaryCta?: LandingCta;
}

/** Shared closing band: headline, body, one CTA. */
export interface LandingClosing {
  headline: string;
  body: string;
  cta: LandingCta;
}

/* ------------------------------------------------------------------ */
/* /pricing                                                            */
/* -------------------------------------------------------------------- */

/** The reference's paid tiers, honestly marked as absent here. */
export interface AbsentTier {
  /** The reference's tier name ("Creator" …). */
  name: string;
  /** The reference's own headline price, quoted as context. */
  referencePrice: string;
  /** Why it does not exist here (own words). */
  why: string;
  /** The nearest real thing in this clone, as a resolvable link. */
  nearest: { label: string; href: string };
}

/** The single card that IS real: what every account actually gets. */
export interface OnlyPlan {
  name: string;
  price: string;
  period: string;
  note: string;
  features: string[];
  cta: LandingCta;
}

export interface PricingPageDef {
  route: "/pricing";
  title: string;
  description: string;
  hero: LandingHero;
  onlyPlan: OnlyPlan;
  absentTiersHeading: string;
  absentTiers: AbsentTier[];
  priceListHeading: string;
  priceList: LandingTableRow[];
  faqs: LandingFaq[];
  closing: LandingClosing;
}

/* ------------------------------------------------------------------ */
/* /3d-prompts                                                         */
/* -------------------------------------------------------------------- */

export type PromptCategory = "characters" | "props" | "environments" | "stylized";

/** One copyable example prompt for the real text-to-3D studio. */
export interface PromptExample {
  title: string;
  /** The literal prompt text — rendered in a mono box, copyable. */
  prompt: string;
  category: PromptCategory;
  /** Why this prompt works: the technique it demonstrates. */
  why: string;
}

export interface PromptsPageDef {
  route: "/3d-prompts";
  title: string;
  description: string;
  hero: LandingHero;
  featuredHeading: string;
  featured: PromptExample[];
  examplesHeading: string;
  examples: PromptExample[];
  stepsHeading: string;
  steps: { title: string; body: string }[];
  /** The honest note about what the reference has that this clone
   * does not (model-name filters, community gallery, video embeds). */
  note: string;
  noteLinks: LandingCta[];
  closing: LandingClosing;
}

/* ------------------------------------------------------------------ */
/* /switch + /switch/[slug]                                            */
/* -------------------------------------------------------------------- */

/** One of the reference's offer mechanics, honestly marked absent. */
export interface AbsentOfferPoint {
  /** The reference's step/promise, paraphrased in this clone's words. */
  referencePromise: string;
  /** The honest status here. */
  hereStatus: string;
}

/** A real capability that replaces the missing offer. */
export interface RealInsteadItem {
  title: string;
  body: string;
}

export interface SwitchPageDef {
  /** "index" renders at /switch; "makerworld" at /switch/makerworld. */
  slug: "index" | "makerworld";
  route: string;
  title: string;
  description: string;
  hero: LandingHero;
  /** "What the offer would need" — the reference's mechanics, inverted. */
  offerHeading: string;
  offerPoints: AbsentOfferPoint[];
  /** The reference's offer table, answered honestly. */
  tableHeading: string;
  table: LandingTableRow[];
  /** What IS real here instead of the offer. */
  realHeading: string;
  realItems: RealInsteadItem[];
  faqs: LandingFaq[];
  closing: LandingClosing;
}

/* ------------------------------------------------------------------ */
/* /event/[slug]                                                       */
/* -------------------------------------------------------------------- */

/** One of the reference's event-page promises, honestly marked absent. */
export interface AbsentPromise {
  referencePromise: string;
  hereReality: string;
}

/** A real workflow cross-link (replaces the reference's workflow picker). */
export interface RealWorkflowLink {
  label: string;
  href: string;
  blurb: string;
}

export interface EventPageDef {
  slug: string;
  route: string;
  title: string;
  description: string;
  hero: LandingHero;
  promisesHeading: string;
  absentPromises: AbsentPromise[];
  workflowsHeading: string;
  workflows: RealWorkflowLink[];
  faqs: LandingFaq[];
  closing: LandingClosing;
}
