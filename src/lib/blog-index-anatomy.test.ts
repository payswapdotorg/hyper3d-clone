import { describe, expect, it } from "vitest";

import { generateMetadata as localePageMetadata } from "@/app/[locale]/[[...slug]]/page";
import { BLOG_CATALOG } from "./blog-registry";
import { BLOG_CATEGORIES, WRITTEN_BLOG_ARTICLES, blogEntriesByCategory, findBlogEntry } from "./blog";
import {
  BLOG_INDEX_ALL_SIZE,
  BLOG_INDEX_FEATURED_COUNT,
  BLOG_INDEX_SECTION_SIZE,
  blogIndexAllArticles,
  blogIndexCard,
  blogIndexFeatured,
  blogIndexSections,
} from "./blog-index-anatomy";
import { LOCALE_CODES } from "./i18n";
import { LOCALE_BLOG_SLUGS } from "./i18n-locale-data";
import { resolveLocalePage } from "./i18n-pages";
import { LOCALE_BLOG_WORD } from "./locale-blog-terms";
import { referenceDescription } from "./reference-descriptions";
import { referenceOgImage } from "./reference-og-images";
import { OG_BANNER_FALLBACK_URL } from "./schema-org";
import {
  REFERENCE_ALIAS_GAPS,
  REFERENCE_CONVERTER_ALIASES,
  REFERENCE_CONVERTER_PAIRS,
  TOOLS_ROUTES,
} from "./tools-registry";

/**
 * t84 — the blog index's reference anatomy (recon/t84/notes.md) and the
 * tools tree's compact converter aliases. Every count here is the
 * reference's own probed shape: 4 featured cards, 12 category sections
 * with 3 cards each (prompt-guide honestly thin at 2), the 12-row All
 * Articles cap, 167 alias redirects with the reference's own 11 gaps.
 */

async function meta(locale: string, ...slug: string[]) {
  return localePageMetadata({
    params: Promise.resolve({ locale, slug: slug.length ? slug : undefined }),
  });
}

/* -------------------------------------------------------- the EN anatomy */

describe("blog index anatomy — featured (t84)", () => {
  const featured = blogIndexFeatured();

  it("is exactly the reference's four cards, all written here", () => {
    expect(featured).toHaveLength(BLOG_INDEX_FEATURED_COUNT);
    expect(BLOG_INDEX_FEATURED_COUNT).toBe(4);
    expect(featured.every((c) => c.family === "written")).toBe(true);
  });

  it("is the four newest written articles, date desc", () => {
    expect(featured.map((c) => c.href)).toEqual(
      WRITTEN_BLOG_ARTICLES.slice(0, 4).map((a) => `/blog/${a.slug}`),
    );
  });

  it("every card carries a real og-registry image and a snippet body", () => {
    for (const card of featured) {
      expect(card.image.startsWith("https://")).toBe(true);
      expect(card.image).toBe(referenceOgImage(card.href));
      expect(card.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(card.description.length).toBeGreaterThan(20);
    }
  });
});

describe("blog index anatomy — the twelve category sections (t84)", () => {
  const sections = blogIndexSections();

  it("has exactly twelve sections in the registry's reference order", () => {
    expect(sections.map((s) => s.category)).toEqual(BLOG_CATEGORIES.map((c) => c.slug));
    expect(sections.map((s) => s.name)).toEqual(BLOG_CATEGORIES.map((c) => c.name));
  });

  it("every section carries exactly 3 cards except prompt-guide's honest 2", () => {
    expect(BLOG_INDEX_SECTION_SIZE).toBe(3);
    for (const section of sections) {
      expect(section.cards.length).toBeLessThanOrEqual(3);
      if (section.category === "prompt-guide") {
        // the clone's census for that topic genuinely has 2 routes — never
        // padded with unrelated articles to fake the reference's 3
        expect(section.cards).toHaveLength(2);
      } else {
        expect(section.cards).toHaveLength(3);
      }
    }
  });

  it("section cards are the topic's catalog head (written first), no padding", () => {
    for (const section of sections) {
      const expected = blogEntriesByCategory(section.category).slice(0, 3);
      expect(section.cards.map((c) => c.href)).toEqual(expected.map((e) => `/blog/${e.slug}`));
    }
  });

  it("every card href resolves to a real catalog entry, images resolve", () => {
    const seen = new Set<string>();
    for (const section of sections) {
      for (const card of section.cards) {
        expect(seen.has(card.href)).toBe(false);
        seen.add(card.href);
        const entry = findBlogEntry(card.href.slice("/blog/".length));
        expect(entry).toBeDefined();
        expect(card.image).toBe(referenceOgImage(card.href) ?? OG_BANNER_FALLBACK_URL);
      }
    }
    // 12 sections × 3 cards minus prompt-guide's one honest shortfall
    expect(seen.size).toBe(35);
  });

  it("not-written cards carry honest bodies, never invented prose", () => {
    let sawNotWritten = 0;
    for (const section of sections) {
      for (const card of section.cards) {
        if (card.family === "written") continue;
        sawNotWritten += 1;
        expect(card.date).toBe("");
        // the body is either the reference's own head description (the t76
        // registry, same as the t81 related cards) or the honest family
        // label — both are pinned sources, never invented copy
        const ref = referenceDescription(card.href);
        if (ref) {
          expect(card.description).toBe(ref.length > 155 ? `${ref.slice(0, 155)}...` : ref);
        } else {
          expect(card.description).toMatch(
            /announcement — cataloged, not reproduced|has not written yet|kept as a marked route|not reproduced here/,
          );
        }
      }
    }
    expect(sawNotWritten).toBeGreaterThan(0);
  });
});

describe("blog index anatomy — the All Articles cap (t84)", () => {
  it("is the reference's twelve links: the catalog's newest head", () => {
    expect(BLOG_INDEX_ALL_SIZE).toBe(12);
    const all = blogIndexAllArticles();
    expect(all).toHaveLength(12);
    expect(all).toEqual(BLOG_CATALOG.slice(0, 12));
    expect(all.slice(0, 4).every((e) => e.family === "written")).toBe(true);
  });

  it("blogIndexCard gives written cards their own description as the snippet", () => {
    const written = BLOG_CATALOG.find((e) => e.family === "written");
    expect(written).toBeDefined();
    const card = blogIndexCard(written!, "News");
    const raw = written!.article!.description;
    const snippet = raw.length > 155 ? `${raw.slice(0, 155)}...` : raw;
    expect(card.description).toBe(snippet);
    expect(card.date).toBe(written!.article!.date);
  });
});

/* ------------------------------------------------------- the locale side */

describe("locale blog index defs — the reference's locale anatomy (t84)", () => {
  it("every locale resolves /{loc}/blog to the full blog-index def", () => {
    for (const locale of LOCALE_CODES) {
      const def = resolveLocalePage(locale, "blog");
      expect(def?.kind).toBe("blog-index");
    }
  });

  it("featured is the reference's locale trio (3, never 4)", () => {
    for (const locale of LOCALE_CODES) {
      const def = resolveLocalePage(locale, "blog");
      if (def?.kind !== "blog-index") throw new Error(`bad kind for ${locale}`);
      expect(def.featured).toHaveLength(3);
    }
  });

  it("twelve sections, the honest census coverage, All Articles capped at 12", () => {
    for (const locale of LOCALE_CODES) {
      const def = resolveLocalePage(locale, "blog");
      if (def?.kind !== "blog-index") continue;
      expect(def.sections).toHaveLength(12);
      expect(def.sections.map((s) => s.category)).toEqual(BLOG_CATEGORIES.map((c) => c.slug));
      // the locale census honestly covers every topic with 1-3 cards (the
      // written pairs land in prompt-guide/workflow; pt/ar/tr/it hold a
      // single workflow article apiece — the reference has 3 localized
      // cards everywhere; this clone renders what its census actually
      // has, never padding)
      for (const section of def.sections) {
        expect(section.links.length).toBeGreaterThanOrEqual(1);
        expect(section.links.length).toBeLessThanOrEqual(3);
      }
      expect(def.allArticles).toHaveLength(12);
    }
  });

  it("every locale card href is a real locale-suffixed route with the EN title", () => {
    for (const locale of LOCALE_CODES) {
      const def = resolveLocalePage(locale, "blog");
      if (def?.kind !== "blog-index") continue;
      const slugs = new Set(LOCALE_BLOG_SLUGS[locale]);
      const links = [
        ...def.featured,
        ...def.sections.flatMap((s) => s.links),
        ...def.allArticles,
      ];
      expect(links.length).toBeGreaterThan(30);
      for (const link of links) {
        const slug = link.href.split("/").pop() as string;
        expect(slugs.has(slug)).toBe(true);
        const entry = findBlogEntry(slug.replace(/-(zh|ja|ko|ru|pt|fr|es|ar|tr|it|de)$/, ""));
        expect(entry).toBeDefined();
        expect(link.label).toBe(entry!.title);
      }
    }
  });

  it("the locale index title is the reference's pipe form (博客 | Hyper3D)", async () => {
    const zh = await meta("zh", "blog");
    expect(zh.title).toBe("博客 | Hyper3D");
    const de = await meta("de", "blog");
    expect(de.title).toBe("Blog | Hyper3D");
    expect(LOCALE_BLOG_WORD.zh).toBe("博客");
  });
});

/* ------------------------------------------------------- the tools aliases */

describe("the tools compact converter aliases (t84)", () => {
  it("is exactly 167 rows — the reference's own alias coverage", () => {
    expect(REFERENCE_CONVERTER_ALIASES).toHaveLength(167);
    expect(REFERENCE_CONVERTER_PAIRS).toHaveLength(178);
    expect(REFERENCE_ALIAS_GAPS).toHaveLength(11);
  });

  it("every row maps /tools/{from}-to-{to} to the canonical pair page", () => {
    const pairSet = new Set(REFERENCE_CONVERTER_PAIRS.map(([f, t]) => `${f}/${t}`));
    for (const row of REFERENCE_CONVERTER_ALIASES) {
      const m = row.source.match(/^\/tools\/([a-z0-9]+)-to-([a-z0-9]+)$/);
      expect(m).not.toBeNull();
      expect(pairSet.has(`${m![1]}/${m![2]}`)).toBe(true);
      expect(row.destination).toBe(`/tools/converter/${m![1]}/to/${m![2]}`);
    }
  });

  it("mirrors the reference's own 11 gaps — no alias rows where it 404s", () => {
    const sources = new Set(REFERENCE_CONVERTER_ALIASES.map((r) => r.source));
    for (const [from, to] of REFERENCE_ALIAS_GAPS) {
      expect(sources.has(`/tools/${from}-to-${to}`)).toBe(false);
    }
    // the quirky pair: blend-fbx/obj/stl alias, blend-dae/glb/gltf/usdz do not
    expect(sources.has("/tools/blend-to-fbx")).toBe(true);
    expect(sources.has("/tools/blend-to-dae")).toBe(false);
  });

  it("no alias source collides with a served tools route", () => {
    const served = new Set(TOOLS_ROUTES);
    for (const row of REFERENCE_CONVERTER_ALIASES) {
      expect(served.has(row.source)).toBe(false);
    }
    // the gap routes are not served either — they 404 like the reference's
    for (const [from, to] of REFERENCE_ALIAS_GAPS) {
      expect(served.has(`/tools/${from}-to-${to}`)).toBe(false);
    }
  });

  it("next.config carries every alias as a 301 + the image-to-3d cross alias", async () => {
    const config = (await import("../../next.config")).default;
    const rows = await config.redirects!();
    expect(rows).toHaveLength(177);
    const bySource = new Map(rows.map((r) => [r.source, r]));
    for (const row of REFERENCE_CONVERTER_ALIASES) {
      const found = bySource.get(row.source);
      expect(found).toBeDefined();
      expect(found!.destination).toBe(row.destination);
      expect(found!.statusCode).toBe(301);
    }
    expect(bySource.get("/tools/image-to-3d")).toEqual({
      source: "/tools/image-to-3d",
      destination: "/features/image-to-3d",
      statusCode: 301,
    });
    // the pre-existing t82/t71 rows survive the table merge
    expect(bySource.get("/register")!.destination).toBe("/workspace/register");
    expect(bySource.get("/omnicraft/viewer")!.destination).toBe("/tools/viewer");
  });
});
