import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOCALE_CODES,
  LOCALE_NAMES,
  blogBaseSlug,
  helpArticleSlugFor,
  hreflangFor,
  isLocale,
  localeDir,
  localePath,
} from "./i18n";
import { LOCALE_MESSAGES, fillCount } from "./i18n-messages";
import {
  LOCALE_BLOG_ODDBALLS,
  LOCALE_FAMILY_SLUGS,
  LOCALE_ONLY_SUBCATEGORIES,
  LOCALE_ROUTE_COUNTS,
  LOCALE_BLOG_SLUGS,
  LOCALE_STATIC_ROUTES,
  LOCALE_SUBCATEGORY_SLUGS,
} from "./i18n-locale-data";
import { localePaths, localeServingPaths, localeStaticParams, resolveLocalePage } from "./i18n-pages";
import { TOOLS_ROUTES } from "./tools-registry";
import { featureRoutes } from "./features";
import { USE_CASE_ROUTES } from "./use-cases";
import { STYLE_ROUTES } from "./styles";
import { legalRoutes } from "./legal";
import {
  PROMPT_CATALOG,
  PROMPT_CENSUS,
  PROMPT_PAGE_COUNT,
  PROMPT_HUBS,
} from "./prompts-registry";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The eight sitemap families the t67 split ships children for. */
const SITEMAP_FAMILIES = [
  "static",
  "features",
  "tools",
  "use-cases",
  "styles",
  "legal",
  "sub-categories",
  "blog",
] as const;

/** The exact per-locale route totals the reference's sitemaps ship. */
const PINNED_COUNTS: Record<string, number> = {
  zh: 542,
  de: 543,
  ja: 544,
  ko: 545,
  ru: 543,
  pt: 543,
  fr: 543,
  es: 545,
  ar: 542,
  tr: 543,
  it: 542,
};

describe("i18n registry — the 11 non-EN locales", () => {
  it("ships the reference's locales in sitemap-index order", () => {
    expect([...LOCALE_CODES]).toEqual([
      "zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it",
    ]);
  });

  it("gives every locale a native and English name", () => {
    for (const locale of LOCALE_CODES) {
      expect(LOCALE_NAMES[locale].native.length).toBeGreaterThan(0);
      expect(LOCALE_NAMES[locale].english.length).toBeGreaterThan(0);
    }
  });

  it("treats Arabic as the only RTL locale", () => {
    expect(localeDir("ar")).toBe("rtl");
    for (const locale of LOCALE_CODES.filter((l) => l !== "ar")) {
      expect(localeDir(locale)).toBe("ltr");
    }
  });

  it("isLocale accepts the 11 codes and nothing else", () => {
    for (const locale of LOCALE_CODES) expect(isLocale(locale)).toBe(true);
    for (const bad of ["en", "zz", "ZH", "", "english", "zh-CN"]) {
      expect(isLocale(bad)).toBe(false);
    }
  });

  it("prefixes paths without double slashes", () => {
    expect(localePath("zh", "/")).toBe("/zh");
    expect(localePath("zh", "/pricing")).toBe("/zh/pricing");
    expect(localePath("de", "/tools/converter/glb/to/obj")).toBe(
      "/de/tools/converter/glb/to/obj",
    );
  });

  it("builds the 13-link hreflang set (12 languages + x-default at EN)", () => {
    const map = hreflangFor("/pricing");
    expect(Object.keys(map)).toHaveLength(13);
    expect(map.en).toBe("/pricing");
    expect(map["x-default"]).toBe("/pricing");
    expect(map.zh).toBe("/zh/pricing");
    expect(map.it).toBe("/it/pricing");
    const home = hreflangFor("/");
    expect(home.en).toBe("/");
    expect(home.ar).toBe("/ar");
  });

  it("strips the locale suffix from blog slugs", () => {
    expect(blogBaseSlug("zh", "what-is-glb-file-zh")).toBe("what-is-glb-file");
    expect(blogBaseSlug("tr", "what-is-ply-file-zh-tr")).toBe("what-is-ply-file-zh");
    expect(blogBaseSlug("de", "un-suffixed")).toBe("un-suffixed");
  });

  it("mirrors the reference's use-bang oddball in exactly six locales", () => {
    for (const locale of ["zh", "de", "ja", "ko", "ru", "fr", "es"]) {
      expect(helpArticleSlugFor(locale, "use-bang-and-partial-edit")).toBe(
        `use-bang-and-partial-edit-${locale}`,
      );
    }
    for (const locale of ["pt", "ar", "tr", "it"]) {
      expect(helpArticleSlugFor(locale, "use-bang-and-partial-edit")).toBe(
        "use-bang-and-partial-edit",
      );
    }
    expect(helpArticleSlugFor("zh", "what-is-hyper3d")).toBe("what-is-hyper3d");
  });
});

describe("i18n messages — 11 hand-written packs, one contract", () => {
  /** Collect every string leaf of a pack keyed by its path. */
  function leaves(value: unknown, prefix = ""): [string, string][] {
    if (typeof value === "string") return [[prefix, value]];
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      leaves(v, prefix ? `${prefix}.${k}` : k),
    );
  }

  it("covers the identical key set in every locale, no empty strings", () => {
    const reference = leaves(LOCALE_MESSAGES.zh).map(([k]) => k).sort();
    expect(reference.length).toBeGreaterThan(30);
    for (const locale of LOCALE_CODES) {
      const keys = leaves(LOCALE_MESSAGES[locale]).map(([k]) => k).sort();
      expect(keys, `${locale} key set`).toEqual(reference);
      for (const [key, value] of leaves(LOCALE_MESSAGES[locale])) {
        expect(value.trim().length, `${locale}.${key} empty`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the {count} slot in every hub intro and fills it", () => {
    for (const locale of LOCALE_CODES) {
      expect(LOCALE_MESSAGES[locale].hub.intro).toContain("{count}");
      const filled = fillCount(LOCALE_MESSAGES[locale].hub.intro, 42);
      expect(filled).toContain("42");
      expect(filled).not.toContain("{count}");
    }
  });

  it("never ships the reference's AI-spam tells or leftover placeholders", () => {
    const banned = ["TODO", "lorem", "which is relevant when working with"];
    for (const locale of LOCALE_CODES) {
      for (const [key, value] of leaves(LOCALE_MESSAGES[locale])) {
        for (const tell of banned) {
          expect(value.toLowerCase(), `${locale}.${key}`).not.toContain(tell);
        }
      }
    }
  });

  it("labels the honest statuses in every locale", () => {
    for (const locale of LOCALE_CODES) {
      const m = LOCALE_MESSAGES[locale];
      expect(m.status.works).not.toBe("WORKS HERE");
      expect(m.blogFamily.game).not.toBe("GAME-GUIDE SEO");
    }
  });
});

describe("i18n route data — generated, pinned to the reference sitemaps", () => {
  it("pins the per-locale route totals (5,975 localized routes)", () => {
    expect(LOCALE_ROUTE_COUNTS).toEqual(PINNED_COUNTS);
    const total = Object.values(LOCALE_ROUTE_COUNTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(5975);
  });

  it("carries the EN slugs verbatim in the five shared families", () => {
    expect([...LOCALE_FAMILY_SLUGS.features].sort()).toEqual(
      ["", ...featureRoutes().map((r) => r.replace("/features/", ""))].sort(),
    );
    expect(LOCALE_FAMILY_SLUGS.tools.length).toBe(TOOLS_ROUTES.length);
    expect(LOCALE_FAMILY_SLUGS.useCases.length).toBe(USE_CASE_ROUTES.length);
    expect(LOCALE_FAMILY_SLUGS.styles.length).toBe(STYLE_ROUTES.length);
    expect(LOCALE_FAMILY_SLUGS.legal.length).toBe(legalRoutes().length);
  });

  it("ships no /event route in any locale (the reference keeps it EN-only)", () => {
    for (const locale of LOCALE_CODES) {
      expect(
        LOCALE_STATIC_ROUTES[locale].some((p) => p.startsWith("event/")),
        `${locale} event leak`,
      ).toBe(false);
    }
  });

  it("suffixed every locale blog slug and pinned the oddballs verbatim", () => {
    for (const locale of LOCALE_CODES) {
      for (const slug of LOCALE_BLOG_SLUGS[locale]) {
        expect(slug, `${locale} blog slug`).toMatch(new RegExp(`-${locale}$`));
      }
    }
    expect([...LOCALE_ONLY_SUBCATEGORIES]).toEqual([
      "ko/insects-bugs",
      "es/firearms",
      "tr/rocks-minerals",
    ]);
    expect([...LOCALE_BLOG_ODDBALLS]).toEqual([
      "ar/ai-game-character-creator-zh-ar",
      "tr/what-is-ply-file-zh-tr",
    ]);
  });

  it("ships sub-categories only for the five locales the reference does", () => {
    const withSubcats = LOCALE_CODES.filter(
      (l) => LOCALE_SUBCATEGORY_SLUGS[l].length > 0,
    );
    expect([...withSubcats]).toEqual(["ja", "ko", "pt", "es", "tr"]);
    expect(LOCALE_SUBCATEGORY_SLUGS.ja).toEqual(["nsfw-content"]);
    expect(LOCALE_SUBCATEGORY_SLUGS.ko).toEqual(["insects-bugs", "nsfw-content"]);
    expect(LOCALE_SUBCATEGORY_SLUGS.ar).toEqual([]);
  });
});

describe("i18n resolver — every localized route resolves honestly", () => {
  /** Every EN route that actually exists — read from the t67 split
   * children's EN files, which the t57–t65 tests pin against the registries. */
  function englishRouteSet(): Set<string> {
    const locales = new Set<string>(LOCALE_CODES);
    const out = new Set<string>();
    for (const family of SITEMAP_FAMILIES) {
      const xml = readFileSync(
        join(process.cwd(), "public", `landing-sitemap-${family}-en.xml`),
        "utf8",
      );
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const path = m[1].slice(SITE_ORIGIN.length);
        const first = path.replace(/^\//, "").split("/")[0];
        if (!locales.has(first)) out.add(path);
      }
    }
    return out;
  }

  it("generates exactly 5,975 + 4,943 = 10,918 serving static params", () => {
    // t70: the SERVING set — the sitemap set plus the unsitemapped deep
    // trees the live reference serves (recon/locale-deep-trees.md):
    // 4,873 prompt routes + 11 tools indexes + 59 new sub-category
    // routes (66 served, 7 already in the sitemap set)
    expect(localeStaticParams()).toHaveLength(10918);
  });

  it("resolves every generated param — zero dead routes", () => {
    for (const { locale, slug } of localeStaticParams()) {
      const path = (slug ?? []).join("/");
      const def = resolveLocalePage(locale, path);
      expect(def, `/${locale}/${path}`).not.toBeNull();
    }
  });

  it("links every article to a real English original", () => {
    const englishRoutes = englishRouteSet();
    for (const { locale, slug } of localeStaticParams()) {
      const path = (slug ?? []).join("/");
      const def = resolveLocalePage(locale, path);
      if (!def || def.kind !== "article") continue;
      // t70: the /3d-prompts deep tree is deliberately OUT of every
      // sitemap (the reference's own choice) — its EN originals live in
      // the registry, not the sitemap children, so they are checked apart
      if (def.enHref.startsWith("/3d-prompts/")) {
        expect(PROMPT_CATALOG.some((e) => `/3d-prompts/${e.slug}` === def.enHref)).toBe(true);
        continue;
      }
      expect(
        englishRoutes.has(def.enHref),
        `/${locale}/${path} → ${def.enHref}`,
      ).toBe(true);
    }
  });

  it("resolves the key shapes correctly", () => {
    expect(resolveLocalePage("zh", "")).toEqual({ kind: "home" });
    expect(resolveLocalePage("zh", "pricing")?.kind).toBe("article");
    expect(resolveLocalePage("zh", "help")?.kind).toBe("hub");
    expect(resolveLocalePage("zh", "help/billing")?.kind).toBe("hub");
    expect(resolveLocalePage("zh", "help/articles/what-is-hyper3d")?.kind).toBe(
      "article",
    );
    // the reference's renamed help article still finds its EN original
    const oddball = resolveLocalePage("zh", "help/articles/use-bang-and-partial-edit-zh");
    expect(oddball && oddball.kind === "article" ? oddball.enHref : null).toBe(
      "/help/articles/use-bang-and-partial-edit",
    );
    // blog suffix + the double-suffixed oddballs
    const blog = resolveLocalePage("zh", "blog/what-is-glb-file-zh");
    expect(blog && blog.kind === "article" ? blog.enHref : null).toBe(
      "/blog/what-is-glb-file",
    );
    const doubleOddball = resolveLocalePage("tr", "blog/what-is-ply-file-zh-tr");
    expect(
      doubleOddball && doubleOddball.kind === "article" ? doubleOddball.enHref : null,
    ).toBe("/blog/what-is-ply-file");
    // locale-only sub-categories have no English original
    expect(resolveLocalePage("ko", "sub-categories/insects-bugs")).toMatchObject({
      kind: "locale-only",
      slug: "insects-bugs",
    });
    expect(resolveLocalePage("ko", "sub-categories/nsfw-content")).toMatchObject({
      kind: "article",
      enHref: "/sub-categories/nsfw-content",
    });
  });

  it("404s everything the reference does not ship", () => {
    const dead = [
      ["zh", "event/chroma-awards"],
      ["zh", "omnicraft/hdri"],
      ["zh", "blog/page/2"],
      ["zh", "blog/category/news"],
      ["zh", "blog/rss.xml"],
      // t70 boundaries — the localized prompt tree keeps the EN math:
      // /1 and /18 are outside the 2..17 pagination, unknown models,
      // unknown slugs, and the bare /models all 404.
      ["zh", "3d-prompts/1"],
      ["zh", "3d-prompts/18"],
      ["zh", "3d-prompts/models"],
      ["zh", "3d-prompts/models/not-a-model"],
      ["zh", "3d-prompts/models/gpt-6-astra/12"],
      ["zh", "3d-prompts/models/claude-fable-5.1/5"],
      ["zh", "3d-prompts/not-a-real-slug"],
      ["pt", "help/articles/use-bang-and-partial-edit-pt"],
      ["zh", "sub-categories/not-a-real-subcategory"],
      ["zh", "features/not-a-feature"],
      ["zz", "pricing"],
      ["zh", "nonsense"],
    ] as const;
    for (const [locale, path] of dead) {
      expect(resolveLocalePage(locale as string, path), `/${locale}/${path}`).toBeNull();
    }
  });

  it("capped the hub card lists (big families stay count + EN link)", () => {
    const blog = resolveLocalePage("zh", "blog");
    expect(blog && blog.kind === "hub" ? blog.links.length : -1).toBe(0);
    const converter = resolveLocalePage("zh", "tools/converter");
    expect(converter && converter.kind === "hub" ? converter.links.length : -1).toBe(0);
    const features = resolveLocalePage("zh", "features");
    expect(features && features.kind === "hub" ? features.links.length : -1).toBe(18);
  });

  it("path enumeration is internally consistent with the counts", () => {
    for (const locale of LOCALE_CODES) {
      expect(localePaths(locale)).toHaveLength(PINNED_COUNTS[locale]);
    }
  });
});

describe("i18n sitemap + studio wiring", () => {
  it("ships exactly 5,975 localized locs across the per-locale children (7,070 total)", () => {
    // t67: the monolith became a 90-child index; each locale's routes are
    // spread across its 8 family children — sum them and pin the total.
    let total = 0;
    for (const locale of LOCALE_CODES) {
      let localeCount = 0;
      for (const family of SITEMAP_FAMILIES) {
        const file = `landing-sitemap-${family}-${locale}.xml`;
        try {
          const xml = readFileSync(join(process.cwd(), "public", file), "utf8");
          localeCount += xml.match(/<url>/g)?.length ?? 0;
        } catch {
          // sub-categories exist only for ja/ko/pt/es/tr — reference parity
        }
      }
      expect(localeCount, `${locale} sitemap locs`).toBe(PINNED_COUNTS[locale]);
      total += localeCount;
    }
    expect(total).toBe(5975);
  });

  it("wires the studio Globe icon to the 12 real language homes", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain('href={`/${code}`}');
    expect(studio).toContain("LOCALE_CODES.map");
    // the decorative toast is gone — the menu navigates for real
    expect(studio).not.toContain("12-locale selector is decorative");
  });
});

describe("i18n deep trees (t70) — served-but-not-sitemapped parity", () => {
  /** The per-locale SERVING additions: the localized 3D prompt library
   * (16 pagination + 403 details + 11 hubs + 13 hub pages = 443), the
   * bare tools index (1), and the sub-category matrix widened from the
   * sitemap subset to all six slugs (6 - the sitemap-listed count). */
  const SERVING_ADDITIONS: Record<string, number> = {
    zh: 443 + 1 + 6,
    de: 443 + 1 + 6,
    ja: 443 + 1 + 5, // sitemap already lists nsfw-content
    ko: 443 + 1 + 4, // sitemap already lists insects-bugs + nsfw-content
    ru: 443 + 1 + 6,
    pt: 443 + 1 + 5, // sitemap already lists nsfw-content
    fr: 443 + 1 + 6,
    es: 443 + 1 + 4, // sitemap already lists firearms + nsfw-content
    ar: 443 + 1 + 6,
    tr: 443 + 1 + 5, // sitemap already lists rocks-minerals
    it: 443 + 1 + 6,
  };

  it("serves the deep trees in every locale: 5,975 + 4,943 = 10,918", () => {
    let total = 0;
    for (const locale of LOCALE_CODES) {
      const serving = localeServingPaths(locale);
      expect(serving, `${locale} serving paths`).toHaveLength(
        PINNED_COUNTS[locale] + SERVING_ADDITIONS[locale],
      );
      total += serving.length;
    }
    expect(total).toBe(10918);
  });

  it("every locale carries the full localized prompt library", () => {
    for (const locale of LOCALE_CODES) {
      const serving = new Set(localeServingPaths(locale));
      expect(serving.has("3d-prompts"), `${locale} index`).toBe(true);
      for (let page = 2; page <= PROMPT_PAGE_COUNT; page += 1) {
        expect(serving.has(`3d-prompts/${page}`), `${locale} page ${page}`).toBe(true);
      }
      for (const entry of PROMPT_CATALOG) {
        expect(serving.has(`3d-prompts/${entry.slug}`), `${locale} ${entry.slug}`).toBe(true);
      }
      for (const hub of PROMPT_HUBS) {
        expect(serving.has(`3d-prompts/models/${hub.slug}`), `${locale} hub ${hub.slug}`).toBe(
          true,
        );
        for (let page = 2; page <= hub.pages; page += 1) {
          expect(
            serving.has(`3d-prompts/models/${hub.slug}/${page}`),
            `${locale} hub ${hub.slug}/${page}`,
          ).toBe(true);
        }
      }
    }
  });

  it("serves the bare tools index and the six-slug sub-category matrix in every locale", () => {
    for (const locale of LOCALE_CODES) {
      const serving = new Set(localeServingPaths(locale));
      expect(serving.has("tools"), `${locale} tools index`).toBe(true);
      for (const slug of [
        "dark-fantasy",
        "nsfw-content",
        "roblox",
        "insects-bugs",
        "firearms",
        "rocks-minerals",
      ]) {
        expect(serving.has(`sub-categories/${slug}`), `${locale} subcat ${slug}`).toBe(true);
      }
    }
  });

  it("keeps the SITEMAP set untouched — zero sitemap change, pinned", () => {
    for (const locale of LOCALE_CODES) {
      const sitemapSet = localePaths(locale);
      // the counts stay pinned to the reference's own sitemaps
      expect(sitemapSet).toHaveLength(PINNED_COUNTS[locale]);
      // none of the t70 surfaces leak into the sitemap set
      for (const path of sitemapSet) {
        expect(path.startsWith("3d-prompts/"), `${locale} ${path}`).toBe(false);
        expect(path === "tools", `${locale} bare tools`).toBe(false);
      }
      // the sitemap sub-category subset stays the generated one, not the matrix
      const sitemapSubcats = sitemapSet
        .filter((p) => p.startsWith("sub-categories/"))
        .map((p) => p.slice("sub-categories/".length));
      expect(sitemapSubcats).toEqual([...LOCALE_SUBCATEGORY_SLUGS[locale]]);
    }
  });

  it("the split children on disk carry none of the t70 surfaces", () => {
    for (const locale of LOCALE_CODES) {
      for (const family of SITEMAP_FAMILIES) {
        const file = `landing-sitemap-${family}-${locale}.xml`;
        let xml: string;
        try {
          xml = readFileSync(join(process.cwd(), "public", file), "utf8");
        } catch {
          continue; // sub-categories exist only for the five reference locales
        }
        expect(xml.includes(`/${locale}/3d-prompts/`), `${file} prompts child`).toBe(false);
        expect(xml.includes(`/${locale}/tools</loc>`), `${file} bare tools`).toBe(false);
        for (const slug of ["dark-fantasy", "roblox"]) {
          if (LOCALE_SUBCATEGORY_SLUGS[locale].includes(slug)) continue;
          expect(
            xml.includes(`/${locale}/sub-categories/${slug}</loc>`),
            `${file} extra subcat ${slug}`,
          ).toBe(false);
        }
      }
      // the EN children stay free of the EN /tools index too
      const enTools = readFileSync(join(process.cwd(), "public", "landing-sitemap-tools-en.xml"), "utf8");
      expect(enTools.includes("https://hyper3d-clone.vercel.app/tools</loc>")).toBe(false);
    }
  });

  it("resolves the deep-tree shapes honestly", () => {
    // the index upgrades from the t66 wrapper to the real grid
    expect(resolveLocalePage("zh", "3d-prompts")).toEqual({ kind: "prompts-index", page: 1 });
    expect(resolveLocalePage("zh", "3d-prompts/2")).toEqual({ kind: "prompts-index", page: 2 });
    expect(resolveLocalePage("zh", "3d-prompts/17")).toEqual({
      kind: "prompts-index",
      page: PROMPT_PAGE_COUNT,
    });
    // written routes are plain articles pointing at their EN originals
    const written = resolveLocalePage("ja", "3d-prompts/kana-pixel-rabbit-archer");
    expect(written && written.kind === "article" ? written.enHref : null).toBe(
      "/3d-prompts/kana-pixel-rabbit-archer",
    );
    // community routes carry the not-reproduced banner shape
    const community = resolveLocalePage("de", "3d-prompts/kaiju-city-battle-2096251574918013135");
    expect(community && community.kind === "prompt-community" ? community.entry.family : null).toBe(
      "community",
    );
    // hubs resolve with the reference's own pagination math
    const hub = resolveLocalePage("zh", "3d-prompts/models/gpt-6-astra");
    expect(hub && hub.kind === "prompt-hub" ? hub.hub.slug : null).toBe("gpt-6-astra");
    const hubPage = resolveLocalePage("pt", "3d-prompts/models/gpt-6-astra/11");
    expect(hubPage && hubPage.kind === "prompt-hub" ? hubPage.page : null).toBe(11);
    // the sub-category matrix: EN three as articles, oddballs as locale-only
    expect(resolveLocalePage("de", "sub-categories/roblox")).toMatchObject({
      kind: "article",
      enHref: "/sub-categories/roblox",
    });
    expect(resolveLocalePage("ar", "sub-categories/insects-bugs")).toMatchObject({
      kind: "locale-only",
      slug: "insects-bugs",
    });
    // the tools index hub mirrors the reference's own ten links
    const tools = resolveLocalePage("zh", "tools");
    expect(tools && tools.kind === "hub" ? tools.links.length : -1).toBe(10);
    expect(tools && tools.kind === "hub" ? tools.enHref : null).toBe("/tools");
  });

  it("every pack carries the prompt chrome, slots intact", () => {
    for (const locale of LOCALE_CODES) {
      const messages = LOCALE_MESSAGES[locale];
      const prompts = messages.prompts;
      for (const [key, value] of Object.entries(prompts)) {
        expect(typeof value, `${locale}.${key}`).toBe("string");
        expect((value as string).length, `${locale}.${key}`).toBeGreaterThan(0);
      }
      expect(prompts.indexIntro).toContain("{count}");
      expect(prompts.pageOf).toContain("{page}");
      expect(prompts.pageOf).toContain("{total}");
      expect(prompts.hubBody).toContain("{model}");
      expect(prompts.hubBody).toContain("{count}");
      // prev/next differ (a pack that ships the same word twice is a
      // translation accident, not chrome)
      expect(prompts.prev === prompts.next).toBe(false);
    }
  });
});
