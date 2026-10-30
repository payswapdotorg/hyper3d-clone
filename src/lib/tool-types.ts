/**
 * Tool page types — the /tools tree's contract (t64).
 *
 * Mirrors the reference's three tool-page anatomies (recon 2026-10-30):
 *  - converter pair pages ("/tools/converter/3ds/to/dae"): H1 "Free X
 *    to Y Converter", how-to steps, why-use cards, FAQ, converter-matrix
 *    links, other-tools links;
 *  - viewer pages ("/tools/viewer/glb"): H1 "Free GLB Viewer Online",
 *    workflows, what-you-can-check, how-to, FAQ, more-tools;
 *  - image-to pages ("/tools/image-to-glb"): H1 "Free AI Image to GLB
 *    Converter", how-to, why-use, related tools, FAQ, closing CTA.
 *
 * All three collapse onto one section-based shape (hero + honest status
 * panel + ordered sections + FAQ + cross-links + closing CTA), rendered
 * by one shared server component. The honesty contract is identical to
 * every tree: statuses are computed from real facts (tools-registry),
 * never hand-set; "live" pages state exactly what runs, "generative"
 * pages say generation-not-conversion, "not-here" pages say why and
 * link the nearest real surface.
 */

/**
 * live = genuinely runs here (viewer formats, image-to pages);
 * task-export = converter pairs that really run, task-based (emerald);
 * generative = a real generative path, not a conversion (amber);
 * not-here = does not exist in this clone (rose).
 */
export type ToolStatus = "live" | "task-export" | "generative" | "not-here";

export interface ToolLink {
  label: string;
  href: string;
}

export interface ToolCta {
  label: string;
  href: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolStep {
  title: string;
  body: string;
}

export interface ToolCard {
  title: string;
  body: string;
}

/** A flexible page section: steps (numbered), cards (grid), or links (chips). */
export interface ToolSection {
  title: string;
  intro?: string;
  steps?: ToolStep[];
  cards?: ToolCard[];
  links?: ToolLink[];
}

export interface ToolStatusPanel {
  summary: string;
  works: string[];
  limits: string[];
}

export interface ToolPageDef {
  /** Route under /tools, e.g. "/tools/converter/3ds/to/dae". */
  route: string;
  /** Short label for the top bar, e.g. "3DS → DAE". */
  name: string;
  /** Page H1 (reference pattern: "Free 3DS to DAE Converter"). */
  title: string;
  /** Meta description (<=180 chars), this clone's own honest text. */
  description: string;
  /** Hero subline under the H1. */
  subline: string;
  /** live | generative | not-here — computed, never hand-set. */
  status: ToolStatus;
  /** Chip label ("REAL HERE" / "REAL PATH — GENERATION" / "NOT HERE"). */
  statusChip: string;
  /** The honest status panel. */
  statusPanel: ToolStatusPanel;
  /** Ordered sections between the status panel and the FAQ. */
  sections: ToolSection[];
  faqTitle: string;
  faq: ToolFaq[];
  crossLinksTitle: string;
  crossLinks: ToolLink[];
  closingTitle: string;
  closingBody: string;
  closingCta: ToolCta;
  /** Hero CTAs. */
  cta: ToolCta;
  ctaSecondary?: ToolCta;
}
