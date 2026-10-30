/**
 * i18n page resolver (t66): maps (locale, path) → the page definition the
 * shared localized renderer draws, composing the reference's own localized
 * route sets (i18n-locale-data.ts) with THIS clone's EN registries — the
 * single source of truth for titles and honest statuses.
 *
 * Three page kinds exist (DECISIONS.md #46):
 *  - home   — the /{locale} landing page (translated hero + directory)
 *  - hub    — a family/category index: translated intro, a card list of
 *             the localized routes (capped at LOCALE_LINK_CAP; bigger
 *             families show the count + the EN link only), EN hub CTA
 *  - article — every deep route: the EN title, the honest status where the
 *             EN registry has one, and the tier-2 notice linking the
 *             English original. Never translated prose.
 *
 * `locale-only` is the honest variant for routes the reference ships with
 * no English original at all (ko/insects-bugs, es/firearms,
 * tr/rocks-minerals — pinned in LOCALE_ONLY_SUBCATEGORIES).
 */

import { blogBaseSlug, isLocale, type LocaleCode } from "./i18n";
import {
  LOCALE_BLOG_SLUGS,
  LOCALE_FAMILY_SLUGS,
  LOCALE_STATIC_ROUTES,
  LOCALE_SUBCATEGORY_SLUGS,
} from "./i18n-locale-data";
import { LANDING_PRICING_PAGE, LANDING_PROMPTS_PAGE, SWITCH_PAGES } from "./landing";
import { HELP_ARTICLES, HELP_CATEGORIES, findHelpArticle, helpArticlesByCategory } from "./help";
import type { HelpStatus } from "./help-types";
import { featureBySlug } from "./features";
import { findStylePage } from "./styles";
import { findUseCasePage } from "./use-cases";
import { legalBySlug } from "./legal";
import { SUBCATEGORY_PAGES } from "./subcategories";
import { findBlogEntry } from "./blog";
import type { BlogFamily } from "./blog-types";
import {
  REFERENCE_CONVERTER_PAIRS,
  REFERENCE_IMAGE_TO_FORMATS,
  REFERENCE_VIEWER_FORMATS,
} from "./tools-registry";
import { buildConverterPairPage, buildImageToPage, buildViewerPage } from "./tools-content";

export type LocaleFamilyKey =
  | "pricing"
  | "prompts"
  | "switch"
  | "help"
  | "features"
  | "tools"
  | "styles"
  | "useCases"
  | "legal"
  | "subCategories"
  | "blog";

export interface LocaleLink {
  href: string;
  label: string;
}

export type LocalePageDef =
  | { kind: "home" }
  | {
      kind: "hub";
      family: LocaleFamilyKey;
      /** The English family hub this localized hub mirrors. */
      enHref: string;
      /** Total localized routes under this hub (the hub itself included). */
      count: number;
      /** Card list of localized routes (empty when the family is too big). */
      links: LocaleLink[];
    }
  | {
      kind: "article";
      family: LocaleFamilyKey;
      /** The English original — the page that actually carries the content. */
      enHref: string;
      title: string;
      status?: LocaleStatus;
    }
  | {
      kind: "locale-only";
      family: "subCategories";
      slug: string;
      title: string;
    };

export type LocaleStatus =
  | { kind: "help"; status: HelpStatus }
  | { kind: "blog"; family: BlogFamily }
  | { kind: "tool"; status: "live" | "task-export" | "generative" | "not-here" };

/** Families bigger than this render as count + EN link, no card list. */
export const LOCALE_LINK_CAP = 60;

/* ------------------------------------------------------------------ paths */

/** Every localized path (post-locale, '' = home) that exists for a locale,
 * exactly the reference's own set — the static-param source of truth. */
export function localePaths(locale: LocaleCode): string[] {
  const paths = new Set<string>();
  for (const p of LOCALE_STATIC_ROUTES[locale]) paths.add(p);
  for (const family of ["features", "tools", "useCases", "styles", "legal"] as const) {
    for (const slug of LOCALE_FAMILY_SLUGS[family]) {
      paths.add(slug === "" ? familyPath(family) : `${familyPath(family)}/${slug}`);
    }
  }
  for (const slug of LOCALE_SUBCATEGORY_SLUGS[locale]) {
    paths.add(`sub-categories/${slug}`);
  }
  paths.add("blog");
  for (const slug of LOCALE_BLOG_SLUGS[locale]) paths.add(`blog/${slug}`);
  return [...paths];
}

/** Static params for the catch-all route: one entry per localized route. */
export function localeStaticParams(): { locale: string; slug?: string[] }[] {
  const params: { locale: string; slug?: string[] }[] = [];
  for (const locale of Object.keys(LOCALE_STATIC_ROUTES) as LocaleCode[]) {
    for (const path of localePaths(locale)) {
      params.push({ locale, slug: path === "" ? [] : path.split("/") });
    }
  }
  return params;
}

function familyPath(family: LocaleFamilyKey): string {
  switch (family) {
    case "pricing":
      return "pricing";
    case "prompts":
      return "3d-prompts";
    case "switch":
      return "switch";
    case "help":
      return "help";
    case "features":
      return "features";
    case "tools":
      return "tools";
    case "styles":
      return "styles";
    case "useCases":
      return "use-cases";
    case "legal":
      return "legal";
    case "subCategories":
      return "sub-categories";
    case "blog":
      return "blog";
  }
}

/* ---------------------------------------------------------------- resolve */

/** Resolve a localized path ('' = the locale home) to its page def, or null
 * when the reference ships no such route (→ themed 404). */
export function resolveLocalePage(locale: LocaleCode, path: string): LocalePageDef | null {
  if (!isLocale(locale)) return null;
  const known = new Set(localePaths(locale));
  if (!known.has(path)) return null;

  if (path === "") return { kind: "home" };

  /* ---- the static family (pricing / prompts / switch / help tree) ---- */
  if (LOCALE_STATIC_ROUTES[locale].includes(path)) {
    const def = resolveStaticRoute(locale, path);
    if (def) return def;
  }

  /* ---- shared families: EN slugs verbatim --------------------------- */
  const features = LOCALE_FAMILY_SLUGS.features;
  if (path === "features") return featuresHub(locale);
  if (path.startsWith("features/")) {
    const slug = path.slice("features/".length);
    if (!(LOCALE_FAMILY_SLUGS.features as readonly string[]).includes(slug)) return null;
    const def = featureBySlug(slug);
    if (!def) return null;
    return { kind: "article", family: "features", enHref: `/features/${slug}`, title: def.title };
  }

  if (path === "tools/converter") return converterHub(locale);
  if (path === "tools/viewer") return viewerHub(locale);
  if (path.startsWith("tools/")) {
    const rest = path.slice("tools/".length);
    const segments = rest.split("/");
    // /tools/converter/{from}/to/{to}
    if (
      segments.length === 4 &&
      segments[0] === "converter" &&
      segments[2] === "to" &&
      REFERENCE_CONVERTER_PAIRS.some(([f, t]) => f === segments[1] && t === segments[3])
    ) {
      const page = buildConverterPairPage(segments[1], segments[3]);
      return {
        kind: "article",
        family: "tools",
        enHref: `/tools/${rest}`,
        title: page.title,
        status: { kind: "tool", status: page.status },
      };
    }
    // /tools/image-to-{format}
    if (segments.length === 1 && segments[0].startsWith("image-to-")) {
      const format = segments[0].slice("image-to-".length);
      if (!(REFERENCE_IMAGE_TO_FORMATS as readonly string[]).includes(format)) return null;
      const page = buildImageToPage(format);
      return {
        kind: "article",
        family: "tools",
        enHref: `/tools/${rest}`,
        title: page.title,
        status: { kind: "tool", status: page.status },
      };
    }
    // /tools/viewer/{format}
    if (segments.length === 2 && segments[0] === "viewer") {
      if (!(REFERENCE_VIEWER_FORMATS as readonly string[]).includes(segments[1])) return null;
      const page = buildViewerPage(segments[1]);
      return {
        kind: "article",
        family: "tools",
        enHref: `/tools/${rest}`,
        title: page.title,
        status: { kind: "tool", status: page.status },
      };
    }
    return null;
  }

  if (path === "use-cases") {
    return hubDef(locale, "useCases", "/use-cases", caseLinks(locale));
  }
  if (path.startsWith("use-cases/")) {
    const slug = path.slice("use-cases/".length);
    const def = findUseCasePage(slug);
    if (!def) return null;
    return { kind: "article", family: "useCases", enHref: `/use-cases/${slug}`, title: def.title };
  }

  if (path === "styles") {
    return hubDef(locale, "styles", "/styles", styleLinks(locale));
  }
  if (path.startsWith("styles/")) {
    const slug = path.slice("styles/".length);
    const def = findStylePage(slug);
    if (!def) return null;
    return { kind: "article", family: "styles", enHref: `/styles/${slug}`, title: def.title };
  }

  if (path === "legal") {
    return hubDef(locale, "legal", "/legal", legalLinks(locale));
  }
  if (path.startsWith("legal/")) {
    const slug = path.slice("legal/".length);
    const def = legalBySlug(slug);
    if (!def) return null;
    return { kind: "article", family: "legal", enHref: `/legal/${slug}`, title: def.title };
  }

  /* ---- sub-categories: EN three + the locale-only oddballs ---------- */
  if (path.startsWith("sub-categories/")) {
    const slug = path.slice("sub-categories/".length);
    if (!LOCALE_SUBCATEGORY_SLUGS[locale].includes(slug)) return null;
    const def = SUBCATEGORY_PAGES.find((p) => p.slug === slug);
    if (def) {
      return {
        kind: "article",
        family: "subCategories",
        enHref: `/sub-categories/${slug}`,
        title: def.title,
      };
    }
    return {
      kind: "locale-only",
      family: "subCategories",
      slug,
      title: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    };
  }

  /* ---- blog: the locale-suffixed article set ------------------------ */
  if (path === "blog") return blogHub(locale);
  if (path.startsWith("blog/")) {
    const slug = path.slice("blog/".length);
    if (!LOCALE_BLOG_SLUGS[locale].includes(slug)) return null;
    // strip "-{loc}", then the reference's own double-suffixed "-zh" tail
    let base = blogBaseSlug(locale, slug);
    if (!findBlogEntry(base) && base.endsWith("-zh")) base = base.slice(0, -3);
    const entry = findBlogEntry(base);
    if (!entry) return null;
    return {
      kind: "article",
      family: "blog",
      enHref: `/blog/${base}`,
      title: entry.title,
      status: { kind: "blog", family: entry.family },
    };
  }

  return null;
}

/* ------------------------------------------------------- static family */

function resolveStaticRoute(locale: LocaleCode, path: string): LocalePageDef | null {
  switch (path) {
    case "pricing":
      return { kind: "article", family: "pricing", enHref: "/pricing", title: LANDING_PRICING_PAGE.title };
    case "3d-prompts":
      return { kind: "article", family: "prompts", enHref: "/3d-prompts", title: LANDING_PROMPTS_PAGE.title };
    case "switch": {
      const index = SWITCH_PAGES.find((p) => p.slug === "index");
      return {
        kind: "article",
        family: "switch",
        enHref: "/switch",
        title: index?.title ?? "Switch",
      };
    }
    case "switch/makerworld": {
      const page = SWITCH_PAGES.find((p) => p.slug === "makerworld");
      if (!page) return null;
      return { kind: "article", family: "switch", enHref: "/switch/makerworld", title: page.title };
    }
    case "help":
      return helpHub(locale);
    default:
      break;
  }
  if (path.startsWith("help/articles/")) {
    const raw = path.slice("help/articles/".length);
    // the reference renames this one article per locale — recover the EN slug
    const oddball = `use-bang-and-partial-edit-${locale}`;
    const base = raw === oddball ? "use-bang-and-partial-edit" : raw;
    const article = findHelpArticle(base);
    if (!article) return null;
    return {
      kind: "article",
      family: "help",
      enHref: `/help/articles/${base}`,
      title: article.title,
      status: { kind: "help", status: article.status },
    };
  }
  if (path.startsWith("help/")) {
    const cat = path.slice("help/".length);
    const category = HELP_CATEGORIES.find((c) => c.slug === cat);
    if (!category) return null;
    const articles = helpArticlesByCategory(category.slug);
    const links: LocaleLink[] = articles.map((a) => ({
      href: `/${locale}/help/articles/${a.slug}`,
      label: a.title,
    }));
    return hubDef(locale, "help", `/help/${cat}`, links, articles.length + 1);
  }
  return null;
}

/* ------------------------------------------------------------------ hubs */

function hubDef(
  locale: LocaleCode,
  family: LocaleFamilyKey,
  enHref: string,
  links: LocaleLink[],
  countOverride?: number,
): LocalePageDef {
  const count = countOverride ?? links.length + 1;
  return {
    kind: "hub",
    family,
    enHref,
    count,
    links: links.length <= LOCALE_LINK_CAP ? links : [],
  };
}

function featuresHub(locale: LocaleCode): LocalePageDef {
  const links: LocaleLink[] = LOCALE_FAMILY_SLUGS.features
    .filter((slug) => slug !== "")
    .map((slug) => {
      const def = featureBySlug(slug);
      return { href: `/${locale}/features/${slug}`, label: def?.title ?? slug };
    });
  return hubDef(locale, "features", "/features", links);
}

function converterHub(locale: LocaleCode): LocalePageDef {
  const pairCount = REFERENCE_CONVERTER_PAIRS.length;
  return {
    kind: "hub",
    family: "tools",
    enHref: "/tools/converter",
    count: pairCount + 1,
    links: [], // 178 pairs — over the card cap; the matrix lives on the EN page
  };
}

function viewerHub(locale: LocaleCode): LocalePageDef {
  const links: LocaleLink[] = REFERENCE_VIEWER_FORMATS.map((format) => {
    const page = buildViewerPage(format);
    return { href: `/${locale}/tools/viewer/${format}`, label: page.title };
  });
  return hubDef(locale, "tools", "/tools/viewer", links);
}

function caseLinks(locale: LocaleCode): LocaleLink[] {
  return LOCALE_FAMILY_SLUGS.useCases
    .filter((slug) => slug !== "")
    .map((slug) => {
      const def = findUseCasePage(slug);
      return { href: `/${locale}/use-cases/${slug}`, label: def?.title ?? slug };
    });
}

function styleLinks(locale: LocaleCode): LocaleLink[] {
  return LOCALE_FAMILY_SLUGS.styles
    .filter((slug) => slug !== "")
    .map((slug) => {
      const def = findStylePage(slug);
      return { href: `/${locale}/styles/${slug}`, label: def?.title ?? slug };
    });
}

function legalLinks(locale: LocaleCode): LocaleLink[] {
  return LOCALE_FAMILY_SLUGS.legal
    .filter((slug) => slug !== "")
    .map((slug) => {
      const def = legalBySlug(slug);
      return { href: `/${locale}/legal/${slug}`, label: def?.title ?? slug };
    });
}

function helpHub(locale: LocaleCode): LocalePageDef {
  const links: LocaleLink[] = [];
  for (const category of HELP_CATEGORIES) {
    links.push({ href: `/${locale}/help/${category.slug}`, label: category.name });
  }
  for (const article of HELP_ARTICLES) {
    links.push({ href: `/${locale}/help/articles/${article.slug}`, label: article.title });
  }
  return hubDef(locale, "help", "/help", links);
}

function blogHub(locale: LocaleCode): LocalePageDef {
  return {
    kind: "hub",
    family: "blog",
    enHref: "/blog",
    count: LOCALE_BLOG_SLUGS[locale].length + 1,
    links: [], // 234-235 articles — over the card cap; the catalog lives on the EN blog
  };
}
