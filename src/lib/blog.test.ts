import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BLOG_ARTICLES,
  BLOG_CATALOG,
  BLOG_CENSUS,
  BLOG_CATEGORIES,
  BLOG_PAGE_COUNT,
  BLOG_PAGE_SIZE,
  BLOG_RESERVED_SLUGS,
  BLOG_SITEMAP_LOCS,
  blogFamily,
  blogPage,
  blogTopicTitle,
  buildBlogRssXml,
  computedBlogCategory,
  findBlogArticle,
  findBlogCategory,
  findBlogEntry,
  WRITTEN_BLOG_ARTICLES,
  blogArticlesByCategory,
  blogEntriesByCategory,
} from "./blog";
import { REFERENCE_BLOG_SLUGS } from "./blog-registry-data";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { USE_CASE_ROUTES } from "./use-cases";
import { HELP_ARTICLE_SLUGS } from "./help";
import { STUDIO_PATH } from "./studio-path";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** Routes that genuinely exist in this clone (for related-link checks).
 * OmniCraft tool routes exist for ALL tools — not-in-clone tools render an
 * honest status page at their route, which is a real page, not a 404. */
const TOOL_ROUTES = OMNICRAFT_TOOLS.map((t) => `/workspace/omnicraft/${t.slug}`);
const BLOG_ARTICLE_ROUTES = new Set(BLOG_CATALOG.map((e) => `/blog/${e.slug}`));
const BLOG_CATEGORY_ROUTES = BLOG_CATEGORIES.map((c) => `/blog/category/${c.slug}`);

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "" || base === STUDIO_PATH) return true;
  if (BLOG_ARTICLE_ROUTES.has(base)) return true;
  if (BLOG_CATEGORY_ROUTES.includes(base) || base === "/blog") return true;
  if (
    base === "/pricing" ||
    base === "/help" ||
    base === "/workspace/omnicraft" ||
    ["/help/getting-started", "/help/account-settings", "/help/billing", "/help/credit", "/help/features", "/help/enterprise"].includes(base)
  )
    return true;
  if (TOOL_ROUTES.includes(base)) return true;
  if (USE_CASE_ROUTES.includes(base)) return true;
  if (HELP_ARTICLE_SLUGS.some((s) => `/help/articles/${s}` === base)) return true;
  if (base.startsWith("/features/") || base === "/features") return true;
  if (base.startsWith("/styles") || base.startsWith("/use-cases") || base.startsWith("/legal")) return true;
  return false;
}

/** Flatten a written article's whole text for content assertions. */
function articleText(def: (typeof BLOG_ARTICLES)[number]): string {
  return [
    def.title,
    def.description,
    def.answer,
    ...def.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...def.faqs.flatMap((f) => [f.q, f.a]),
    ...def.related.map((r) => r.label),
  ].join("\n");
}

describe("blog registry — route parity with the reference sitemap", () => {
  it("covers all 778 reference article slugs, exactly, no extras, no dups", () => {
    expect(REFERENCE_BLOG_SLUGS).toHaveLength(778);
    expect(new Set(REFERENCE_BLOG_SLUGS).size).toBe(778);
    expect(BLOG_CATALOG).toHaveLength(778);
    const catalogSlugs = BLOG_CATALOG.map((e) => e.slug).sort();
    expect(catalogSlugs).toEqual([...REFERENCE_BLOG_SLUGS].sort());
  });

  it("the catalog reserves none of the sibling-route segments", () => {
    for (const reserved of BLOG_RESERVED_SLUGS) {
      expect(BLOG_CATALOG.find((e) => e.slug === reserved)).toBeUndefined();
    }
  });

  it("census is computed from the data and pins the t65 split", () => {
    expect(BLOG_CENSUS.total).toBe(778);
    expect(BLOG_CENSUS.written).toBe(55);
    expect(BLOG_CENSUS.referenceNews).toBe(7);
    expect(BLOG_CENSUS.coreFiller).toBe(204);
    expect(BLOG_CENSUS.offScope).toBe(6);
    expect(BLOG_CENSUS.gameFiller).toBe(506);
    expect(
      BLOG_CENSUS.written +
        BLOG_CENSUS.referenceNews +
        BLOG_CENSUS.coreFiller +
        BLOG_CENSUS.offScope +
        BLOG_CENSUS.gameFiller,
    ).toBe(778);
  });

  it("families classify consistently with the curated sets", () => {
    for (const entry of BLOG_CATALOG) {
      if (entry.family === "written") {
        expect(entry.article, entry.slug).toBeDefined();
      } else {
        expect(entry.article, `${entry.slug} must carry no article`).toBeUndefined();
      }
    }
    // the written family is exactly the article list
    expect(BLOG_CATALOG.filter((e) => e.family === "written")).toHaveLength(
      BLOG_ARTICLES.length,
    );
  });

  it("game-guides and off-scope rows are uncategorized (as on the reference)", () => {
    for (const entry of BLOG_CATALOG) {
      if (entry.family === "game-filler" || entry.family === "off-scope") {
        expect(entry.category, entry.slug).toBeUndefined();
      }
    }
  });

  it("reference-news rows file under news; core rows compute a category", () => {
    for (const entry of BLOG_CATALOG) {
      if (entry.family === "reference-news") {
        expect(entry.category, entry.slug).toBe("news");
      } else if (entry.family === "core-filler") {
        expect(entry.category, entry.slug).toBeDefined();
        expect(BLOG_CATEGORIES.find((c) => c.slug === entry.category)).toBeDefined();
      }
    }
  });

  it("topic titles derive from slugs (title case, minor words lowered)", () => {
    expect(blogTopicTitle("what-is-glb-file")).toBe("What Is Glb File");
    expect(blogTopicTitle("best-mods-for-frostpunk-2")).toBe("Best Mods for Frostpunk 2");
    expect(blogTopicTitle("3d-printing-guide")).toBe("3d Printing Guide");
  });
});

describe("blog categories — the reference's twelve hubs", () => {
  it("has exactly the twelve category slugs from the recon", () => {
    expect(BLOG_CATEGORIES.map((c) => c.slug)).toEqual([
      "news",
      "comparisons",
      "xr",
      "ai-texturing",
      "game-development",
      "prompt-guide",
      "text-to-3d",
      "image-to-3d",
      "insights",
      "3d-printing",
      "workflow",
      "animation",
    ]);
    for (const cat of BLOG_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.blurb.length).toBeGreaterThan(40);
    }
  });

  it("written articles file under valid categories with no orphans", () => {
    for (const def of BLOG_ARTICLES) {
      expect(findBlogCategory(def.category), def.slug).toBeDefined();
    }
    // every category the written set uses resolves entries
    for (const cat of BLOG_CATEGORIES) {
      expect(blogEntriesByCategory(cat.slug).length).toBeGreaterThan(0);
    }
  });
});

describe("written articles — structure and copy discipline", () => {
  it("55 articles, unique slugs and titles, well-formed dates", () => {
    expect(BLOG_ARTICLES).toHaveLength(55);
    expect(new Set(BLOG_ARTICLES.map((a) => a.slug)).size).toBe(55);
    expect(new Set(BLOG_ARTICLES.map((a) => a.title)).size).toBe(55);
    for (const def of BLOG_ARTICLES) {
      expect(def.slug).toMatch(/^[a-z0-9-]+$/);
      expect(def.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(def.description.length).toBeGreaterThan(60);
      expect(def.description.length).toBeLessThanOrEqual(180);
      expect(def.answer.length).toBeGreaterThan(80);
    }
  });

  it("every article has 2-4 sections with real paragraphs, 2-4 FAQs, 2-5 related links", () => {
    for (const def of BLOG_ARTICLES) {
      expect(def.sections.length, def.slug).toBeGreaterThanOrEqual(2);
      expect(def.sections.length, def.slug).toBeLessThanOrEqual(4);
      for (const section of def.sections) {
        expect(section.paragraphs.length, def.slug).toBeGreaterThanOrEqual(1);
        for (const p of section.paragraphs) {
          expect(p.length, `${def.slug} section paragraph`).toBeGreaterThan(120);
        }
      }
      expect(def.faqs.length, def.slug).toBeGreaterThanOrEqual(2);
      expect(def.faqs.length, def.slug).toBeLessThanOrEqual(4);
      expect(def.related.length, def.slug).toBeGreaterThanOrEqual(2);
      expect(def.related.length, def.slug).toBeLessThanOrEqual(5);
    }
  });

  it("carries no reference AI-filler tells (keyword stuffing, boilerplate ethics)", () => {
    for (const def of BLOG_ARTICLES) {
      const text = articleText(def).toLowerCase();
      expect(text.includes("which is relevant when working with"), def.slug).toBe(false);
      expect(text.includes("ethical considerations"), def.slug).toBe(false);
      expect(text.includes("first-hand experience"), def.slug).toBe(false);
      expect(text, def.slug).not.toMatch(/lorem|placeholder|todo\b|xxx/i);
    }
  });

  it("credits/billing articles anchor the real constants (50 / 1 / 10)", () => {
    const billingSlugs = BLOG_ARTICLES.filter((a) =>
      /credit|plan|refund|pricing/.test(a.slug),
    );
    expect(billingSlugs.length).toBeGreaterThanOrEqual(9);
    for (const def of billingSlugs) {
      const text = articleText(def);
      expect(text.includes("50 credits"), `${def.slug} must state the signup grant`).toBe(true);
      expect(text.includes("1 credit"), `${def.slug} must state the standard cost`).toBe(true);
      expect(text.includes("10 credits"), `${def.slug} must state the agentic cost`).toBe(true);
    }
  });

  it("every related link points at a route that genuinely exists", () => {
    for (const def of BLOG_ARTICLES) {
      for (const link of def.related) {
        expect(isKnownRoute(link.href), `${def.slug} → ${link.href}`).toBe(true);
      }
    }
  });

  it("sibling blog links resolve to catalog entries", () => {
    for (const def of BLOG_ARTICLES) {
      for (const link of def.related) {
        if (link.href.startsWith("/blog/")) {
          const slug = link.href.slice("/blog/".length);
          expect(findBlogEntry(slug), `${def.slug} → ${slug}`).toBeDefined();
        }
      }
    }
  });

  it("the newest-first order is by date desc (feed + featured source)", () => {
    for (let i = 1; i < WRITTEN_BLOG_ARTICLES.length; i++) {
      expect(WRITTEN_BLOG_ARTICLES[i - 1].date >= WRITTEN_BLOG_ARTICLES[i].date).toBe(true);
    }
  });
});

describe("blog pagination — computed math", () => {
  it("40 per page across 20 pages covers the catalog (778 = 19×40 + 18)", () => {
    expect(BLOG_PAGE_SIZE).toBe(40);
    expect(BLOG_PAGE_COUNT).toBe(20);
    expect(blogPage(1)).toHaveLength(40);
    expect(blogPage(19)).toHaveLength(40);
    expect(blogPage(20)).toHaveLength(18);
    expect(blogPage(0)).toHaveLength(0);
    expect(blogPage(21)).toHaveLength(0);
  });

  it("page 1 leads with the six newest written articles", () => {
    const page1 = blogPage(1);
    expect(page1[0].family).toBe("written");
    expect(page1.slice(0, 6).map((e) => e.slug)).toEqual(
      WRITTEN_BLOG_ARTICLES.slice(0, 6).map((a) => a.slug),
    );
  });

  it("written articles come before every filler family", () => {
    const families = BLOG_CATALOG.map((e) => e.family);
    const firstFiller = families.findIndex((f) => f !== "written");
    expect(families.slice(0, firstFiller).every((f) => f === "written")).toBe(true);
    expect(firstFiller).toBe(55);
  });
});

describe("blog RSS — a feed is a promise of items that exist", () => {
  it("contains exactly the 55 written articles, never filler", () => {
    const xml = buildBlogRssXml(SITE_ORIGIN);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">')).toBe(true);
    expect(xml.match(/<item>/g)?.length).toBe(55);
    expect(xml.includes("<channel>")).toBe(true);
    for (const def of WRITTEN_BLOG_ARTICLES) {
      expect(xml.includes(`<link>${SITE_ORIGIN}/blog/${def.slug}/</link>`), def.slug).toBe(true);
    }
    // a known filler route must never appear in the feed
    expect(xml.includes("/blog/best-mods-for-frostpunk-2")).toBe(false);
  });

  it("every item carries an RFC-822 pubDate and an escaped description", () => {
    const xml = buildBlogRssXml(SITE_ORIGIN);
    expect(xml.match(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 09:00:00 GMT<\/pubDate>/g)?.length).toBe(55);
    expect(xml.includes("&amp;")).toBe(false); // no article copy contains raw &
    expect(xml.includes("<description>")).toBe(true);
  });
});

describe("blog wiring — sitemap, routes, footer", () => {
  // t67: the monolith became a 90-child sitemap index; the blog owns its child.
  const xml = readFileSync(
    join(process.cwd(), "public", "landing-sitemap-blog-en.xml"),
    "utf8",
  );

  it("lists /blog plus all 778 articles with absolute URLs (779 blog locs)", () => {
    for (const loc of BLOG_SITEMAP_LOCS) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${loc}</loc>`), loc).toBe(true);
    }
    expect(xml.match(/<url>/g)?.length).toBe(779);
    expect(BLOG_SITEMAP_LOCS).toHaveLength(779);
  });

  it("does not sitemap category hubs, pagination, or rss (reference parity)", () => {
    expect(xml.includes("/blog/category/")).toBe(false);
    expect(xml.includes("/blog/page/")).toBe(false);
    expect(xml.includes("/blog/rss.xml")).toBe(false);
  });

  it("the article route's generateStaticParams sources the catalog registry", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "blog", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("BLOG_CATALOG");
    expect(route).toContain("BLOG_RESERVED_SLUGS");
    expect(route).toContain("notFound()");
  });

  it("the pagination and category routes source their registries", () => {
    const page = readFileSync(
      join(process.cwd(), "src", "app", "blog", "page", "[page]", "page.tsx"),
      "utf8",
    );
    expect(page).toContain("BLOG_PAGE_COUNT");
    const cat = readFileSync(
      join(process.cwd(), "src", "app", "blog", "category", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(cat).toContain("BLOG_CATEGORIES");
  });

  it("the studio footer's HELP column routes to the blog (no toasts)", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain('["Blog", "/blog"]');
    expect(studio).toContain('["What is Hyper3D", "/blog/what-is-hyper3d"]');
  });

  it("findBlogArticle resolves written slugs and rejects unknowns", () => {
    expect(findBlogArticle("what-is-glb-file")?.title).toBeTruthy();
    expect(findBlogArticle("best-mods-for-frostpunk-2-enhance-your-gameplay-experience")).toBeUndefined();
    expect(findBlogEntry("best-mods-for-frostpunk-2-enhance-your-gameplay-experience")?.family).toBe(
      "game-filler",
    );
  });

  it("category helpers compute the honest split", () => {
    const insights = blogEntriesByCategory("insights");
    const insightsWritten = blogArticlesByCategory("insights");
    expect(insights.length).toBeGreaterThan(insightsWritten.length);
    expect(insightsWritten.length).toBeGreaterThan(0);
    const news = blogEntriesByCategory("news");
    expect(news.every((e) => e.family === "reference-news")).toBe(true);
    expect(news).toHaveLength(7);
  });

  it("computedBlogCategory agrees with the entry-level assignment", () => {
    for (const entry of BLOG_CATALOG) {
      if (entry.family === "written" || entry.family === "game-filler" || entry.family === "off-scope") {
        expect(computedBlogCategory(entry.slug)).toBeUndefined();
      } else {
        expect(entry.category).toBe(computedBlogCategory(entry.slug));
      }
    }
  });

  it("blogFamily never guesses for curated rows", () => {
    expect(blogFamily("what-is-hyper3d")).toBe("written");
    expect(blogFamily("hyper3d-shutterstock")).toBe("reference-news");
    expect(blogFamily("cdr-to-pdf-converter")).toBe("off-scope");
    expect(blogFamily("blender-vs-maya")).toBe("core-filler");
    expect(blogFamily("top-10-hidden-secrets-in-summer-clover-unlocking-the-games-best-kept-secrets")).toBe(
      "game-filler",
    );
  });
});
