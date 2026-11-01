/**
 * The blog index's reference anatomy (t84) — the computed card sets the
 * front page renders. Recon 2026-11-01 (recon/t84/notes.md), probed on the
 * live reference's own /blog:
 *
 *   featured            4 cards (EN) — the reference shows its 4 newest
 *                       news posts; this clone shows its 4 newest WRITTEN
 *                       articles (the honest content it actually has)
 *   category sections   12 sections — the registry's order (News …
 *                       Animation) — exactly 3 cards each
 *   all articles        12 links, no pagination nav on the index (the
 *                       reference's 20 /blog/page/{n} routes are
 *                       sitemap-only; this clone keeps its full-catalog
 *                       pagination section below as its own honesty layer)
 *
 * Cards for not-written rows are honest: they carry the family label as
 * the body text, never invented prose.
 */
import { BLOG_CATALOG } from "./blog-registry";
import { BLOG_CATEGORIES, blogEntriesByCategory } from "./blog";
import { referenceDescription } from "./reference-descriptions";
import { referenceOgImage } from "./reference-og-images";
import { cardSnippet } from "./blog-related";
import type { BlogCategory, BlogEntry, BlogFamily } from "./blog-types";
import { OG_BANNER_FALLBACK_URL } from "./schema-org";

/** The reference's index caps: featured 4, per-section 3, All Articles 12. */
export const BLOG_INDEX_FEATURED_COUNT = 4;
export const BLOG_INDEX_SECTION_SIZE = 3;
export const BLOG_INDEX_ALL_SIZE = 12;

/** A card the index renders — written and not-written rows share it. */
export interface BlogIndexCard {
  /** Card link href (an article route). */
  href: string;
  /** Card image — the t77 og:image registry URL for the route. */
  image: string;
  /** Image alt (the slug). */
  alt: string;
  /** Card title (the entry's display title). */
  title: string;
  /** Card body: the article's own description, a reference-head snippet
   * for news rows, or the honest family label for not-written rows. */
  description: string;
  /** Publish date for written rows; empty for not-written rows. */
  date: string;
  /** Honesty verdict — drives the status dot, same vocabulary as the
   * catalog rows. */
  family: BlogFamily;
  /** The category (or topic) eyebrow. */
  category: string;
}

/** Build one card from a catalog entry. */
export function blogIndexCard(entry: BlogEntry, eyebrow: string): BlogIndexCard {
  const href = `/blog/${entry.slug}`;
  const written = entry.family === "written" ? entry.article : undefined;
  const description =
    written?.description ??
    referenceDescription(href) ??
    familyBody(entry.family);
  return {
    href,
    image: referenceOgImage(href) ?? OG_BANNER_FALLBACK_URL,
    alt: entry.slug,
    title: entry.title,
    description: cardSnippet(description),
    date: written?.date ?? "",
    family: entry.family,
    category: eyebrow,
  };
}

/** The honest body for a not-written card — never invented prose. */
function familyBody(family: BlogFamily): string {
  return {
    written: "",
    "reference-news": "The reference company's own announcement — cataloged, not reproduced.",
    "core-filler": "A real 3D-domain topic this clone has not written yet — the route is marked, not faked.",
    "off-scope": "Off-scope SEO bait on the reference — kept as a marked route, no filler prose.",
    "game-filler": "Third-party game-guide content farming — not reproduced here.",
  }[family];
}

/** The 4 featured cards: the newest written articles, date desc. */
export function blogIndexFeatured(): BlogIndexCard[] {
  return BLOG_CATALOG.filter((e) => e.family === "written")
    .slice(0, BLOG_INDEX_FEATURED_COUNT)
    .map((e) => blogIndexCard(e, e.article ? categoryName(e.article.category) : ""));
}

/** The 12 category sections, registry order, 3 cards each. */
export function blogIndexSections(): { category: BlogCategory; name: string; cards: BlogIndexCard[] }[] {
  return BLOG_CATEGORIES.map((cat) => ({
    category: cat.slug,
    name: cat.name,
    cards: blogEntriesByCategory(cat.slug)
      .slice(0, BLOG_INDEX_SECTION_SIZE)
      .map((e) => blogIndexCard(e, cat.name)),
  }));
}

/** The All Articles rows: the first 12 catalog entries. */
export function blogIndexAllArticles(): BlogEntry[] {
  return BLOG_CATALOG.slice(0, BLOG_INDEX_ALL_SIZE);
}

function categoryName(slug: BlogCategory): string {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
