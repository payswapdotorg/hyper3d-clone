/**
 * Help Center types — the /help tree's contract (t61).
 *
 * Mirrors the reference's help center anatomy (recon 2026-10-30 of
 * hyper3d.ai/help: search box + Popular articles + Browse by topic with
 * six categories + Live Chat Support block; 33 articles at
 * /help/articles/[slug], category hubs at /help/[category]), with this
 * clone's honesty contract on top: every article states plainly whether
 * the thing it describes works here, partially works, or does not exist
 * in this clone at all — and "not existing here" is still a real, useful
 * answer because it says what the nearest honest path is.
 *
 * Status semantics for help articles (an answer, not a marketing page):
 *  - "live":         the question has a full, truthful answer grounded in
 *                    this codebase — the thing described works here as
 *                    written (numbers match real constants).
 *  - "partial":      part of the answer is real here and part is not —
 *                    the article says which is which.
 *  - "not-in-clone": the reference feature the article is about does not
 *                    exist in this clone; the article answers honestly
 *                    ("no — and here is why, and here is the nearest
 *                    thing that IS real").
 */

export type HelpStatus = "live" | "partial" | "not-in-clone";

/** The reference's six topic categories (sitemap slugs). */
export type HelpCategoryId =
  | "getting-started"
  | "account-settings"
  | "billing"
  | "credit"
  | "features"
  | "enterprise";

export interface HelpCategoryDef {
  /** Path segment under /help/ (reference sitemap slugs). */
  slug: HelpCategoryId;
  /** The reference's topic name ("Getting Started" …). */
  name: string;
  /** One-line honest description of what this topic covers HERE. */
  blurb: string;
  /** t88: the topic's own honest walkthrough + FAQ, rendered on the hub
   * after the article list. */
  guide: HelpCategoryGuide;
}

export interface HelpStep {
  title: string;
  body: string;
}

export interface HelpSection {
  /** Section heading (question-form articles read best with 2-4). */
  heading: string;
  /** 1-3 paragraphs of body text. */
  paragraphs: string[];
  /** Optional numbered how-to steps rendered as an ordered list. */
  steps?: HelpStep[];
  /** Optional honest note, rendered in a bordered mono box (same family
   * as the styles tree's recipe notes). */
  note?: string;
}

export interface HelpLink {
  label: string;
  href: string;
}

/** One adjacent question in an article's "Related questions" band (t88).
 * The reference's help articles end their anatomy with follow-up
 * question bands; this clone's equivalent carries the questions a reader
 * most plausibly asks next — answered with the same three-way honesty
 * as the article itself. */
export interface HelpFaqItem {
  q: string;
  a: string;
}

/** The per-category guide on each topic hub (t88): a short honest walk
 * of what this topic covers HERE plus the topic's own FAQ band. */
export interface HelpCategoryGuide {
  heading: string;
  paragraphs: string[];
  faq: HelpFaqItem[];
}

export interface HelpArticleDef {
  /** Path segment under /help/articles/ (reference sitemap slugs). */
  slug: string;
  /** Article H1 — this clone's own question phrasing (never the
   * reference's copy). */
  title: string;
  /** Which topic hub the article belongs to. */
  category: HelpCategoryId;
  /** Meta description (<=180 chars), this clone's own text. */
  description: string;
  /** live | partial | not-in-clone — see type doc. */
  status: HelpStatus;
  /** "The short answer" box — the direct verdict, up front. */
  answer: string;
  /** 3-8 body sections (t88: the reference's own per-article anatomy
   * carries 3-6 content bands; the count now mirrors it per page). */
  sections: HelpSection[];
  /** t88: adjacent questions rendered as an accordion band after the
   * body — every article carries >=4. */
  faq: HelpFaqItem[];
  /** 2-5 cross-links to routes that genuinely exist. */
  related: HelpLink[];
  /** Last-reviewed stamp (YYYY-MM-DD). */
  updated: string;
}
