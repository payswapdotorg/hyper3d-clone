/**
 * Blog public API — categories, lookup helpers, and the RSS feed builder.
 *
 * Mirrors the reference's blog surfaces (recon 2026-10-30): twelve category
 * hubs at /blog/category/{slug}, pagination at /blog/page/{n}, and an RSS
 * 2.0 feed at /blog/rss.xml whose channel carries only articles that
 * actually exist here. Category blurbs are this clone's own copy.
 */
import type { BlogArticleDef, BlogCategory, BlogEntry } from "./blog-types";
import {
  BLOG_ARTICLES,
  BLOG_CATALOG,
  BLOG_CENSUS,
  BLOG_PAGE_COUNT,
  blogPage,
} from "./blog-registry";

export type { BlogArticleDef, BlogCategory, BlogEntry, BlogFamily, BlogStatus } from "./blog-types";
export {
  BLOG_ARTICLES,
  BLOG_CATALOG,
  BLOG_CENSUS,
  BLOG_PAGE_COUNT,
  BLOG_PAGE_SIZE,
  BLOG_SITEMAP_LOCS,
  blogPage,
  blogFamily,
  blogTopicTitle,
  computedBlogCategory,
} from "./blog-registry";

/** The reference's twelve category hubs, with this clone's blurbs. */
export const BLOG_CATEGORIES: { slug: BlogCategory; name: string; blurb: string }[] = [
  {
    slug: "news",
    name: "News",
    blurb:
      "The reference's company announcements. A clone has none — every news route here is an honestly marked page, and the seven of them say why.",
  },
  {
    slug: "comparisons",
    name: "Comparisons",
    blurb:
      "Format face-offs written from the specs themselves: GLB vs glTF, OBJ vs STL, FBX vs GLB. The third-party tool comparisons stay honestly unwritten.",
  },
  {
    slug: "xr",
    name: "XR",
    blurb: "AR/VR delivery — USDZ for Apple surfaces, GLB for the web, and the honest boundaries of each.",
  },
  {
    slug: "ai-texturing",
    name: "AI Texturing",
    blurb:
      "Materials and environments: the HDRI generator's fully-local procedural skies, PBR modes on generation, and the texture topics that are reference-only.",
  },
  {
    slug: "game-development",
    name: "Game Development",
    blurb:
      "Asset-bound generation for games — the prop-first workflow, engine formats, and the topology/LOD notes most roundups skip.",
  },
  {
    slug: "prompt-guide",
    name: "Prompt Guide",
    blurb: "Prompt craft for mesh pipelines: the four-slot structure, constraint stacking, and iteration habits that keep credits cheap.",
  },
  {
    slug: "text-to-3d",
    name: "Text to 3D",
    blurb: "Prompt-to-mesh workflows: presets, effort tiers, ControlNet silhouettes, and the free-preview loop.",
  },
  {
    slug: "image-to-3d",
    name: "Image to 3D",
    blurb: "Reference-driven generation: one image, an editable caption, a free preview, then a 1-credit confirm.",
  },
  {
    slug: "insights",
    name: "Insights",
    blurb:
      "The platform's own story — what it is, what it costs, how its meter works — plus the format explainers that anchor the whole catalog.",
  },
  {
    slug: "3d-printing",
    name: "3D Printing",
    blurb: "Print-bound pipelines: text-to-STL, image-to-STL, the format decisions, and printability prompting.",
  },
  {
    slug: "workflow",
    name: "Workflow",
    blurb: "End-to-end how-tos: the beginner loop, export troubleshooting, and the reference-only surfaces explained honestly.",
  },
  {
    slug: "animation",
    name: "Animation",
    blurb:
      "Rigging and animation topics. This pipeline outputs static meshes — the deep articles here are honestly marked as reference territory.",
  },
];

const CATEGORY_SLUGS = new Set(BLOG_CATEGORIES.map((c) => c.slug));

export function findBlogCategory(slug: string): { slug: BlogCategory; name: string; blurb: string } | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

/** Written articles in a category (date desc). */
export function blogArticlesByCategory(category: BlogCategory): BlogArticleDef[] {
  return BLOG_ARTICLES.filter((a) => a.category === category).sort((a, b) =>
    a.date === b.date ? (a.slug < b.slug ? -1 : 1) : a.date < b.date ? 1 : -1,
  );
}

/** Every catalog row filed under a category (written + computed). */
export function blogEntriesByCategory(category: BlogCategory): BlogEntry[] {
  return BLOG_CATALOG.filter((e) =>
    e.family === "written" ? e.article?.category === category : e.category === category,
  );
}

/** A written article by slug. */
export function findBlogArticle(slug: string): BlogArticleDef | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

/** A catalog row by slug (any family). */
export function findBlogEntry(slug: string): BlogEntry | undefined {
  return BLOG_CATALOG.find((e) => e.slug === slug);
}

/** Written articles, newest first — the feed and the featured strip. */
export const WRITTEN_BLOG_ARTICLES: BlogArticleDef[] = [...BLOG_ARTICLES].sort((a, b) =>
  a.date === b.date ? (a.slug < b.slug ? -1 : 1) : a.date < b.date ? 1 : -1,
);

/** Reserved single segments that must never resolve as article slugs. */
export const BLOG_RESERVED_SLUGS = ["page", "category", "rss.xml"] as const;

// -- RSS --------------------------------------------------------------------

const RFC822_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RFC822_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function rfc822(dateStr: string): string {
  const d = new Date(`${dateStr}T09:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const day = RFC822_DAYS[d.getUTCDay()];
  const month = RFC822_MONTHS[d.getUTCMonth()];
  return `${day}, ${String(d.getUTCDate()).padStart(2, "0")} ${month} ${d.getUTCFullYear()} 09:00:00 GMT`;
}

function xmlEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const RSS_CHANNEL_DESCRIPTION =
  "The honest blog of an AI-3D workspace clone: written articles anchor every claim to code that runs here; the rest of the catalog is marked, not faked.";

/**
 * RSS 2.0 feed — written articles only. A feed is a promise of items that
 * exist, so the 723 not-written routes are excluded by design.
 */
export function buildBlogRssXml(origin: string): string {
  const items = WRITTEN_BLOG_ARTICLES.map((a) => {
    const link = `${origin}/blog/${a.slug}/`;
    return [
      "<item>",
      `<title>${xmlEscape(a.title)}</title>`,
      `<link>${xmlEscape(link)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(link)}</guid>`,
      `<description>${xmlEscape(a.description)}</description>`,
      `<pubDate>${rfc822(a.date)}</pubDate>`,
      `<category>${xmlEscape(a.category)}</category>`,
      "</item>",
    ].join("");
  }).join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0"><channel>' +
    "<title>Hyper3D Clone Blog</title>" +
    `<description>${xmlEscape(RSS_CHANNEL_DESCRIPTION)}</description>` +
    `<link>${xmlEscape(origin)}/</link>` +
    items +
    "</channel></rss>"
  );
}
