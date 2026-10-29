/**
 * Legal document types — the /legal tree's contract.
 *
 * t58 (2026-10-29): the reference's legal sitemap
 * (hyper3d.ai/landing-sitemap-legal-en.xml) exposes an index + 5 documents
 * (privacy, terms, refund, copyright-license, fulfillment). This clone
 * mirrors the PAGE SET and the section anatomy, but every sentence is this
 * clone's own text and states what THIS service actually does — the same
 * honesty contract as the features tree (DECISIONS.md #34/#36/#37):
 * legal pages that describe mechanics the clone does not have would be the
 * least honest pages on the site, so numbers and behaviors here are
 * tethered to the real ledger constants (credits.ts) by test.
 */

export interface LegalSection {
  /** Stable anchor id (used in the TOC and section links). */
  id: string;
  /** Numbered heading, e.g. "1. Personal data we collect". */
  heading: string;
  /** Body paragraphs (rendered in order). */
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

export interface LegalDocDef {
  /** Path segment under /legal/ (reference sitemap order). */
  slug: string;
  /** Short name for nav/cards, e.g. "Privacy Policy". */
  name: string;
  /** Full page title (meta + H1 context), reference title pattern. */
  title: string;
  /** Meta description (<=180 chars, mirrors the reference's pattern). */
  description: string;
  /** "Last updated" date shown on the page. */
  updated: string;
  /** Ordered document sections. */
  sections: LegalSection[];
}
