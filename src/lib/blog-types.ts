/**
 * Blog types — the /blog tree's contract (t65).
 *
 * Recon 2026-10-30 of hyper3d.ai/blog (landing-sitemap-blog-en.xml +
 * live-page anatomy): 778 article routes plus the index, 12 category hubs
 * (/blog/category/news … animation, live but not sitemapped), 20 pagination
 * pages at 40 articles per page, and an RSS feed at /blog/rss.xml. The
 * reference's articles are AI-generated SEO content — the tell is visible in
 * its own pages: keyword phrases repeated mid-sentence ("which is relevant
 * when working with what is glb file"), boilerplate "ethical
 * considerations" sections, and invented mod lists for games with no mod
 * support.
 *
 * This clone's honesty contract at blog scale: the 778 routes ALL exist
 * (sitemap parity), a curated 55 of them carry articles this clone actually
 * wrote — every claim anchored to code that runs here — and the remaining
 * 723 are honestly marked pages that say what they are and why they were
 * not written. Family assignment is curated data; the census is computed
 * from it, never hand-set.
 *
 * Article statuses reuse the help tree's three-way verdict:
 *  - "live":         the thing described works here exactly as written.
 *  - "partial":      part of the story is real here, part is reference-only.
 *  - "not-in-clone": the reference feature does not exist here; the article
 *                    says so and points at the nearest honest path.
 */

/** The reference's twelve blog categories (category-hub slugs). */
export type BlogCategory =
  | "news"
  | "comparisons"
  | "xr"
  | "ai-texturing"
  | "game-development"
  | "prompt-guide"
  | "text-to-3d"
  | "image-to-3d"
  | "insights"
  | "3d-printing"
  | "workflow"
  | "animation";

/** Honesty verdict for a written article (same semantics as the help tree). */
export type BlogStatus = "live" | "partial" | "not-in-clone";

/**
 * Family of a blog route — computed from the curated registry data:
 *  - "written":        this clone wrote the article (full prose, real anchors)
 *  - "reference-news": the reference company's own announcement
 *  - "core-filler":    a real 3D-domain topic, not (yet) written here
 *  - "off-scope":      non-3D SEO bait (PDF converters, soundboards, ...)
 *  - "game-filler":    third-party game-guide content farming
 */
export type BlogFamily =
  | "written"
  | "reference-news"
  | "core-filler"
  | "off-scope"
  | "game-filler";

export interface BlogSection {
  /** Section H2 (articles read best with 2-4). */
  heading: string;
  /** 1-3 paragraphs of this clone's own body copy. */
  paragraphs: string[];
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogLink {
  label: string;
  href: string;
}

/** A written article — the only pages with real prose. */
export interface BlogArticleDef {
  /** Path segment under /blog/ (the reference sitemap slug, kept verbatim). */
  slug: string;
  /** Article H1 — this clone's own headline (never the reference's copy). */
  title: string;
  /** Which category hub the article is filed under. */
  category: BlogCategory;
  /** Meta description (<=180 chars), this clone's own text. */
  description: string;
  /** Publish date (YYYY-MM-DD) — the date this clone wrote it. */
  date: string;
  /** live | partial | not-in-clone — see the type doc above. */
  status: BlogStatus;
  /** The lede — the direct verdict before the first section. */
  answer: string;
  /** 2-4 body sections. */
  sections: BlogSection[];
  /** 2-4 FAQs, rendered as <details> like the use-cases tree. */
  faqs: BlogFaq[];
  /** 2-5 cross-links to routes that genuinely exist here. */
  related: BlogLink[];
}

/** One row of the blog catalog — every one of the 778 reference routes. */
export interface BlogEntry {
  /** The reference sitemap slug. */
  slug: string;
  /** Computed family (see BlogFamily). */
  family: BlogFamily;
  /** The written article, when family === "written". */
  article?: BlogArticleDef;
  /** Computed category for reference-news/core-filler rows; game-filler and
   * off-scope rows are deliberately uncategorized (the reference's game
   * articles carry no category either — verified on live pages). */
  category?: BlogCategory;
  /** Display title — the article's own headline, or the topic derived from
   * the slug for not-written rows. */
  title: string;
}
