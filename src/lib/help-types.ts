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
  /** 2-4 body sections. */
  sections: HelpSection[];
  /** 2-5 cross-links to routes that genuinely exist. */
  related: HelpLink[];
  /** Last-reviewed stamp (YYYY-MM-DD). */
  updated: string;
}
