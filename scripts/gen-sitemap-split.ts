/**
 * t67 sitemap split generator: replaces the monolithic public/sitemap.xml
 * with the reference's own crawler shape —
 *
 *   /sitemap.xml                  → a <sitemapindex> (90 children)
 *   /landing-sitemap-index.xml    → the same index (the robots.txt target)
 *   /landing-sitemap-{family}-{loc}.xml → 90 child sitemaps
 *     (static ×12, features ×12, tools ×12, use-cases ×12, styles ×12,
 *      legal ×12, blog ×12, sub-categories ×6 — 12×7 + 6 = 90)
 *
 * Run with: bun scripts/gen-sitemap-split.ts
 *
 * Behavior:
 *  1. Composes the EN route set from the registries (single source of
 *     truth) and asserts 1,092 routes with every family present (t71: the
 *     five retired OmniCraft locs left, the two content-preview locs
 *     arrived).
 *  2. Composes each locale's route set via localePaths() and asserts the
 *     per-locale counts against LOCALE_ROUTE_COUNTS (5,975 total).
 *  3. Classifies every path into a family; assigns changefreq/priority
 *     from the hand-tuned per-family tables extracted from the t57–t66
 *     monolithic sitemap (EN outliers pinned path-by-path below).
 *  4. Computes each URL's hreflang alternate set from
 *     resolveLocalePage()'s enHref — the SAME resolver the localized
 *     pages use for their canonical links, so sitemap alternates can
 *     never disagree with page-level hreflang. Family quirks mirror the
 *     reference exactly: sub-categories carry ZERO alternates; blog
 *     entries carry 12 languages + x-default; /event is EN-only so its
 *     alternate set is en + x-default; every other family carries the
 *     12 languages (no x-default).
 *  5. Writes the 90 children plus both index files and prints the census.
 *
 * Succession note: this script supersedes scripts/gen-sitemap.ts (t66),
 * which appended the localized section to a byte-preserved monolithic
 * file. The priority tables below ARE those byte-preserved values,
 * lifted out once, path-by-path, before the monolith was retired.
 *
 * Deliberate deviation, documented in DECISIONS.md #47: child entries
 * carry no <lastmod> — this clone does not track per-URL modification
 * dates and will not fabricate them; the reference's own coverage is
 * partial (7/46 static, 10/203 tools). The index files carry the fixed
 * LASTMOD stamp = the date this tree was last regenerated.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { LOCALE_CODES, blogBaseSlug, isLocale, type LocaleCode } from "../src/lib/i18n";
import { LOCALE_ROUTE_COUNTS } from "../src/lib/i18n-locale-data";
import { localePaths, resolveLocalePage } from "../src/lib/i18n-pages";
import { landingRoutes } from "../src/lib/landing";
import { featureRoutes } from "../src/lib/features";
import { TOOLS_ROUTES } from "../src/lib/tools-registry";
import { USE_CASE_ROUTES } from "../src/lib/use-cases";
import { STYLE_ROUTES } from "../src/lib/styles";
import { legalRoutes } from "../src/lib/legal";
import { HELP_ROUTES } from "../src/lib/help";
import { SUBCATEGORY_ROUTES } from "../src/lib/subcategories";
import { BLOG_SITEMAP_LOCS } from "../src/lib/blog";

const ORIGIN = "https://hyper3d-clone.vercel.app";
const PUBLIC = join(process.cwd(), "public");
/** Index <lastmod> stamp — bump when the tree itself changes. */
const LASTMOD = "2026-10-31";

/* ------------------------------------------------------------------ */
/* Family classification                                              */
/* ------------------------------------------------------------------ */

type Family =
  | "static"
  | "features"
  | "tools"
  | "use-cases"
  | "styles"
  | "legal"
  | "sub-categories"
  | "blog";

function familyOf(path: string): Family {
  if (path === "") return "static"; // the locale homes + EN "/"
  const first = path.split("/")[0];
  switch (first) {
    case "features":
    case "tools":
    case "use-cases":
    case "styles":
    case "legal":
    case "sub-categories":
    case "blog":
      return first;
    default:
      return "static"; // 3d-prompts, pricing, switch, event, help, content-preview
  }
}

/* ------------------------------------------------------------------ */
/* Hand-tuned EN priority tables (lifted from the t57–t66 monolith)   */
/* ------------------------------------------------------------------ */

const EN_OUTLIERS: Record<string, [string, string]> = {
  "/": ["weekly", "1.0"],
  "/blog": ["weekly", "0.9"],
  "/features": ["weekly", "0.9"],
  "/features/text-to-3d": ["monthly", "0.8"],
  "/features/image-to-3d": ["monthly", "0.8"],
  "/features/mcp": ["monthly", "0.7"],
  "/help": ["monthly", "0.7"],
  "/pricing": ["monthly", "0.8"],
  "/3d-prompts": ["weekly", "0.8"],
  "/switch": ["monthly", "0.6"],
  "/switch/makerworld": ["monthly", "0.6"],
  "/legal": ["yearly", "0.4"],
  "/use-cases": ["weekly", "0.8"],
  "/use-cases/game-development": ["monthly", "0.7"],
  "/styles": ["weekly", "0.7"],
  "/tools/converter": ["monthly", "0.6"],
  "/tools/viewer": ["monthly", "0.6"],
};

const EN_HELP_CATEGORIES = [
  "getting-started",
  "account-settings",
  "billing",
  "credit",
  "features",
  "enterprise",
];

function enEntry(path: string): [string, string] {
  if (EN_OUTLIERS[path]) return EN_OUTLIERS[path];
  if (path.startsWith("/content-preview")) return ["monthly", "0.5"]; // the reference's own values
  if (path.startsWith("/features/omnicraft/")) return ["monthly", "0.5"];
  if (path.startsWith("/help/")) {
    // articles monthly 0.5; the six topic hubs monthly 0.6
    const rest = path.slice("/help/".length);
    return EN_HELP_CATEGORIES.includes(rest) ? ["monthly", "0.6"] : ["monthly", "0.5"];
  }
  switch (familyOf(path.slice(1))) {
    case "blog":
      return ["monthly", "0.7"];
    case "features":
      return ["monthly", "0.6"];
    case "tools":
      return ["monthly", "0.4"];
    case "use-cases":
      return ["monthly", "0.6"];
    case "styles":
      return ["monthly", "0.6"];
    case "legal":
      return ["yearly", "0.3"];
    case "sub-categories":
      return ["monthly", "0.5"];
    default:
      return ["monthly", "0.5"]; // help articles, /event
  }
}

/** Locale priorities (t66 rules): home 0.7/weekly, hubs 0.5/weekly, rest 0.3/monthly. */
function localeEntry(path: string): [string, string] {
  if (path === "") return ["weekly", "0.7"];
  if (
    path === "blog" ||
    path === "features" ||
    path === "help" ||
    path === "styles" ||
    path === "use-cases" ||
    path === "legal" ||
    path === "tools/converter" ||
    path === "tools/viewer" ||
    /^help\/[^/]+$/.test(path)
  ) {
    return ["weekly", "0.5"];
  }
  return ["monthly", "0.3"];
}

/* ------------------------------------------------------------------ */
/* hreflang alternate sets                                            */
/* ------------------------------------------------------------------ */

/** hreflang labels: pt renders as pt-BR on the reference; others verbatim. */
function hreflangLabel(locale: string): string {
  return locale === "pt" ? "pt-BR" : locale;
}

/** The EN path a localized path mirrors, via the pages' own resolver. */
function enMirror(locale: LocaleCode, path: string): string | null {
  const def = resolveLocalePage(locale, path);
  if (!def) return null;
  if (def.kind === "home") return "/";
  if (def.kind === "hub" || def.kind === "article") return def.enHref;
  return null; // locale-only routes have no EN original
}

interface Alternate {
  lang: string;
  href: string;
}

/**
 * Family quirks, pinned from the reference's own child sitemaps:
 *  - sub-categories: zero alternates (both EN and localized files);
 *  - /content-preview (t71): zero alternates — the reference lists the
 *    preview host + render endpoint in static-en with no hreflang set;
 *  - blog ARTICLES: 12 languages + x-default (13 links); the /blog and
 *    /{loc}/blog hubs carry 12 without x-default;
 *  - /event (EN-only family member): en + x-default;
 *  - everything else: the 12 languages, no x-default.
 */
function alternatesFor(
  family: Family,
  isEvent: boolean,
  isBlogHub: boolean,
  mirrors: { lang: string; href: string }[],
): Alternate[] {
  if (family === "sub-categories") return [];
  const list: Alternate[] = [{ lang: "en", href: mirrors[0]?.href ?? "" }, ...mirrors.slice(1)];
  if (family === "blog" ? !isBlogHub : isEvent) {
    list.push({ lang: "x-default", href: mirrors[0]?.href ?? "" });
  }
  return list;
}

/* ------------------------------------------------------------------ */
/* XML emission                                                       */
/* ------------------------------------------------------------------ */

function urlXml(
  loc: string,
  changefreq: string,
  priority: string,
  alts: readonly Alternate[],
): string {
  const links = alts
    .map((a) => `<xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`)
    .join("");
  return `<url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority>${links}</url>`;
}

function childXml(urls: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "",
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

function indexXml(children: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "",
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...children.map(
      (c) =>
        `  <sitemap>\n    <loc>${ORIGIN}/${c}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </sitemap>`,
    ),
    "</sitemapindex>",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

function expectedEnglishLocs(): string[] {
  // t71: the OmniCraft landing tree is retired (the reference removed its
  // five locs and 301s the routes); the content-preview host + render
  // endpoint take their place in static-en, exactly where the reference
  // lists them (monthly / 0.5 / no lastmod / zero alternates).
  return [
    "/",
    ...landingRoutes(),
    "/features",
    ...featureRoutes(),
    "/content-preview",
    "/content-preview/render",
    ...TOOLS_ROUTES,
    ...USE_CASE_ROUTES,
    ...STYLE_ROUTES,
    ...legalRoutes(),
    ...HELP_ROUTES,
    ...SUBCATEGORY_ROUTES,
    ...BLOG_SITEMAP_LOCS,
  ];
}

function fail(msg: string): never {
  console.error(`gen-sitemap-split: ${msg}`);
  process.exit(1);
}

async function main(): Promise<void> {
  /* ---- EN routes + guards ---- */
  const enPaths = expectedEnglishLocs();
  if (new Set(enPaths).size !== enPaths.length) fail("duplicate EN locs");
  if (enPaths.length !== 1092) fail(`EN route count ${enPaths.length} != 1092`);

  /* ---- mirror map: EN path → localized mirrors ---- */
  // mirrors.get(enPath) = [{lang, href}] with the EN entry first, then
  // every locale that ships a mirror of the same EN original.
  const mirrors = new Map<string, { lang: string; href: string }[]>();
  const put = (enPath: string, lang: string, href: string) => {
    const list = mirrors.get(enPath) ?? [];
    list.push({ lang, href });
    mirrors.set(enPath, list);
  };
  for (const en of enPaths) put(en, "en", `${ORIGIN}${en}`);

  const localeUrlCount: Record<string, number> = {};
  for (const locale of LOCALE_CODES) {
    let count = 0;
    for (const path of localePaths(locale)) {
      const href = path === "" ? `/${locale}` : `/${locale}/${path}`;
      const en = enMirror(locale, path);
      // Locale-only sub-category routes have no EN original — keyed apart.
      put(en ?? `@locale-only/${locale}/${path}`, hreflangLabel(locale), `${ORIGIN}${href}`);
      count += 1;
    }
    if (count !== LOCALE_ROUTE_COUNTS[locale]) {
      fail(`locale ${locale}: ${count} != ${LOCALE_ROUTE_COUNTS[locale]} routes`);
    }
    localeUrlCount[locale] = count;
  }

  /* ---- build child files ---- */
  mkdirSync(PUBLIC, { recursive: true });
  const familyFiles = new Map<string, string[]>(); // "{family}-{loc}" → xml lines
  const bucket = (family: Family, loc: string) => {
    const key = `${family}-${loc}`;
    if (!familyFiles.has(key)) familyFiles.set(key, []);
    return familyFiles.get(key)!;
  };

  // EN children
  for (const path of enPaths) {
    const family = familyOf(path.slice(1));
    const [cf, pr] = enEntry(path);
    const isEvent = path.startsWith("/event/");
    const isBlogHub = path === "/blog";
    // t71: the content-preview surface carries zero alternates (the
    // reference's own static-en entries for both URLs).
    const isPreview = path.startsWith("/content-preview");
    const m = mirrors.get(path) ?? [];
    bucket(family, "en").push(
      urlXml(`${ORIGIN}${path}`, cf, pr, isPreview ? [] : alternatesFor(family, isEvent, isBlogHub, m)),
    );
  }

  // locale children
  for (const locale of LOCALE_CODES) {
    for (const path of localePaths(locale)) {
      const href = path === "" ? `/${locale}` : `/${locale}/${path}`;
      const family = familyOf(path);
      const [cf, pr] = localeEntry(path);
      const en = enMirror(locale, path);
      const m = en ? (mirrors.get(en) ?? []) : [];
      const isBlogHub = path === "blog";
      bucket(family, locale).push(
        urlXml(`${ORIGIN}${href}`, cf, pr, alternatesFor(family, false, isBlogHub, m)),
      );
    }
  }

  /* ---- guards on totals ---- */
  let totalUrls = 0;
  for (const [key, urls] of familyFiles) {
    totalUrls += urls.length;
    writeFileSync(join(PUBLIC, `landing-sitemap-${key}.xml`), childXml(urls), "utf8");
  }
  if (familyFiles.size !== 90) fail(`child count ${familyFiles.size} != 90`);
  if (totalUrls !== 7067) fail(`total <url> ${totalUrls} != 7067`);

  /* ---- indexes ---- */
  const children = [...familyFiles.keys()].sort().map((key) => `landing-sitemap-${key}.xml`);
  const index = indexXml(children);
  writeFileSync(join(PUBLIC, "sitemap.xml"), index, "utf8");
  writeFileSync(join(PUBLIC, "landing-sitemap-index.xml"), index, "utf8");

  console.log(`wrote ${familyFiles.size} child sitemaps + 2 index files`);
  console.log(`EN routes: ${enPaths.length}`);
  for (const locale of LOCALE_CODES) {
    console.log(`  ${locale}: ${localeUrlCount[locale]} localized routes`);
  }
  console.log(`total <url>: ${totalUrls}`);
  // census of alternate-set sizes (the pinned reference quirks)
  const withXd = (familyFiles.get("blog-en") ?? []).filter((u) =>
    u.includes('hreflang="x-default"'),
  ).length;
  const subCats = familyFiles.get("sub-categories-en") ?? [];
  console.log(
    `blog-en x-default coverage: ${withXd}; sub-categories-en alternates: ${
      subCats.filter((u) => u.includes("xhtml:link")).length
    }/3`,
  );
}

await main();
