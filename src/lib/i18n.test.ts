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
import { localePaths, localeStaticParams, resolveLocalePage } from "./i18n-pages";
import { TOOLS_ROUTES } from "./tools-registry";
import { featureRoutes } from "./features";
import { USE_CASE_ROUTES } from "./use-cases";
import { STYLE_ROUTES } from "./styles";
import { legalRoutes } from "./legal";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

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
  /** Every EN route that actually exists — read from the sitemap's EN
   * section, which the t57–t65 tests already pin against the registries. */
  function englishRouteSet(): Set<string> {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    const locales = new Set<string>(LOCALE_CODES);
    return new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => m[1].slice(SITE_ORIGIN.length))
        .filter((path) => {
          const first = path.replace(/^\//, "").split("/")[0];
          return !locales.has(first);
        }),
    );
  }

  it("generates exactly 5,975 static params", () => {
    expect(localeStaticParams()).toHaveLength(5975);
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
      ["zh", "tools"],
      ["zh", "sub-categories/roblox"],
      ["pt", "help/articles/use-bang-and-partial-edit-pt"],
      ["ar", "sub-categories/insects-bugs"],
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
  it("appends exactly 5,975 localized locs (7,070 total, EN preserved)", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    expect(xml.match(/<url>/g)?.length).toBe(7070);
    for (const locale of LOCALE_CODES) {
      const localeLocs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => m[1])
        .filter(
          (loc) =>
            loc === `${SITE_ORIGIN}/${locale}` ||
            loc.startsWith(`${SITE_ORIGIN}/${locale}/`),
        );
      expect(localeLocs, `${locale} sitemap locs`).toHaveLength(PINNED_COUNTS[locale]);
    }
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
