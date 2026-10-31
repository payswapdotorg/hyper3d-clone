import { describe, expect, it } from "vitest";
import { STUDIO_PATH } from "./studio-path";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPORT_FORMATS } from "./exporters";
import { INITIAL_BALANCE, STANDARD_COST, AGENTIC_COST } from "./credits";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { USE_CASE_PAGES } from "./use-cases";
import { STYLE_PAGES } from "./styles";
import { HELP_ARTICLES } from "./help";
import { featureSlugs } from "./features";
import {
  REFERENCE_SUBCATEGORY_SLUGS,
  SUBCATEGORY_PAGES,
  SUBCATEGORY_ROUTES,
  SUBCATEGORY_SLUGS,
  findSubCategory,
} from "./subcategories";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The clone's genuinely live OmniCraft tool routes. */
const LIVE_TOOL_ROUTES = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
  (t) => `/workspace/omnicraft/${t.slug}`,
);

/** Deep-link targets that genuinely exist in this clone's registries. */
const REAL_STYLE_SLUGS = new Set(STYLE_PAGES.map((p) => p.slug));
const REAL_USE_CASE_SLUGS = new Set(USE_CASE_PAGES.map((p) => p.slug));
const REAL_HELP_SLUGS = new Set(HELP_ARTICLES.map((a) => a.slug));
const REAL_LEGAL_SLUGS = new Set(["copyright-license", "fulfillment", "privacy", "refund", "terms"]);
const REAL_FEATURE_SLUGS = new Set(featureSlugs());
const REAL_SUBCATEGORY_SLUGS = new Set(SUBCATEGORY_SLUGS);

const KNOWN_SINGLETON_ROUTES = new Set([
  "/",
  "/features",
  "/styles",
  "/use-cases",
  "/help",
  "/legal",
  "/workspace/omnicraft",
  "/pricing",
  "/3d-prompts",
  "/api/healthz",
]);

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === STUDIO_PATH) return true; // t68: the studio's real route
  if (KNOWN_SINGLETON_ROUTES.has(base)) return true;
  if (base.startsWith("/styles/")) {
    return REAL_STYLE_SLUGS.has(base.slice("/styles/".length));
  }
  if (base.startsWith("/use-cases/")) {
    return REAL_USE_CASE_SLUGS.has(base.slice("/use-cases/".length));
  }
  if (base.startsWith("/help/articles/")) {
    return REAL_HELP_SLUGS.has(base.slice("/help/articles/".length));
  }
  if (base.startsWith("/legal/")) {
    return REAL_LEGAL_SLUGS.has(base.slice("/legal/".length));
  }
  if (base.startsWith("/features/")) {
    return REAL_FEATURE_SLUGS.has(base.slice("/features/".length));
  }
  if (base.startsWith("/workspace/omnicraft/")) {
    return LIVE_TOOL_ROUTES.includes(base);
  }
  if (base.startsWith("/sub-categories/")) {
    return REAL_SUBCATEGORY_SLUGS.has(base.slice("/sub-categories/".length));
  }
  return false;
}

/** Every href a page def carries, flattened. */
function allHrefs(page: (typeof SUBCATEGORY_PAGES)[number]): string[] {
  const hrefs: string[] = [];
  const push = (h?: { href: string }) => {
    if (h) hrefs.push(h.href);
  };
  push(page.cta);
  push(page.ctaSecondary);
  push(page.generateCta);
  push(page.generateSecondary);
  push(page.closingCta);
  for (const link of [
    ...page.browseLinks,
    ...page.featuredLinks,
    ...page.relatedLinks,
    ...(page.alsoIn?.links ?? []),
  ]) {
    hrefs.push(link.href);
  }
  return hrefs;
}

/** Flatten a page's text for content assertions. */
function pageText(slug: string): string {
  const page = findSubCategory(slug);
  if (!page) throw new Error(`no sub-category page ${slug}`);
  return [
    page.title,
    page.description,
    page.subline,
    page.statusPanel.summary,
    ...page.statusPanel.works,
    ...page.statusPanel.limits,
    page.browseIntro,
    page.featuredBody,
    page.generateBody,
    page.alsoIn?.intro ?? "",
    page.relatedIntro,
    ...page.faq.flatMap((f) => [f.q, f.a]),
    page.closingBody,
  ].join("\n");
}

describe("sub-categories registry — reference parity", () => {
  it("exactly covers the reference's three sub-category pages", () => {
    expect(SUBCATEGORY_SLUGS.sort()).toEqual([...REFERENCE_SUBCATEGORY_SLUGS].sort());
    expect(SUBCATEGORY_PAGES).toHaveLength(3);
    expect(SUBCATEGORY_ROUTES).toEqual(
      [
        "/sub-categories/dark-fantasy",
        "/sub-categories/nsfw-content",
        "/sub-categories/roblox",
      ].sort(),
    );
  });

  it("ships no index route — bare /sub-categories is not a page (like /event)", () => {
    expect(SUBCATEGORY_ROUTES).not.toContain("/sub-categories");
    expect(existsSync(join(process.cwd(), "src", "app", "sub-categories", "page.tsx"))).toBe(false);
  });

  it("has unique slugs and names", () => {
    expect(new Set(SUBCATEGORY_SLUGS).size).toBe(SUBCATEGORY_SLUGS.length);
    expect(new Set(SUBCATEGORY_PAGES.map((p) => p.name)).size).toBe(SUBCATEGORY_PAGES.length);
  });

  it("resolves every slug through findSubCategory and nothing else", () => {
    for (const slug of REFERENCE_SUBCATEGORY_SLUGS) {
      expect(findSubCategory(slug)?.slug).toBe(slug);
    }
    expect(findSubCategory("darkfantasy")).toBeUndefined();
    expect(findSubCategory("roblox-avatar")).toBeUndefined();
    expect(findSubCategory("")).toBeUndefined();
  });

  it("every page has the full reference anatomy (hero, status panel, browse, featured, generate, related, FAQ, CTAs)", () => {
    for (const page of SUBCATEGORY_PAGES) {
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.subline.length).toBeGreaterThan(40);
      expect(page.statusPanel.works.length).toBeGreaterThanOrEqual(4);
      expect(page.statusPanel.limits.length).toBeGreaterThanOrEqual(4);
      expect(page.browseLinks.length).toBeGreaterThanOrEqual(3);
      expect(page.featuredBody.length).toBeGreaterThan(60);
      expect(page.featuredLinks.length).toBeGreaterThanOrEqual(3);
      expect(page.generateBody.length).toBeGreaterThan(60);
      expect(page.relatedLinks.length).toBeGreaterThanOrEqual(4);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.closingCta.href).toBe(STUDIO_PATH);
      expect(page.cta.href).toBe(STUDIO_PATH);
      expect(page.generateCta.href).toBe(STUDIO_PATH);
    }
  });

  it("the two reference parents map to alsoIn sections on exactly dark-fantasy and roblox", () => {
    const withParent = SUBCATEGORY_PAGES.filter((p) => p.alsoIn).map((p) => p.slug).sort();
    expect(withParent).toEqual(["dark-fantasy", "roblox"]);
    expect(findSubCategory("dark-fantasy")?.alsoIn?.title).toContain("Fantasy & Mythology");
    expect(findSubCategory("roblox")?.alsoIn?.title).toContain("Gaming");
    expect(findSubCategory("nsfw-content")?.alsoIn).toBeUndefined();
  });
});

describe("sub-categories content — the honesty contract", () => {
  it("statuses: dark-fantasy and roblox generatable, nsfw-content absent", () => {
    expect(findSubCategory("dark-fantasy")?.status).toBe("generatable");
    expect(findSubCategory("roblox")?.status).toBe("generatable");
    expect(findSubCategory("nsfw-content")?.status).toBe("absent");
  });

  it("every 'Featured Free …' band opens 'Not here.' — the marketplace grid is never faked", () => {
    for (const page of SUBCATEGORY_PAGES) {
      expect(page.featuredBody.startsWith("Not here."), page.slug).toBe(true);
    }
  });

  it("every 'Browse by Tag' intro opens 'Not here' — no /tags/* system exists", () => {
    for (const page of SUBCATEGORY_PAGES) {
      expect(page.browseIntro, page.slug).toMatch(/^Not here/);
    }
    for (const page of SUBCATEGORY_PAGES) {
      expect(page.browseIntro, page.slug).toMatch(
        /no tag|tag.*(not here|does not exist|do not exist)/i,
      );
    }
  });

  it("no fake marketplace model counts anywhere (the reference's '88 models' pattern is absent)", () => {
    for (const page of SUBCATEGORY_PAGES) {
      const text = pageText(page.slug);
      expect(text, page.slug).not.toMatch(/\b\d{2,4}\+? models\b/i);
      expect(text, page.slug).not.toMatch(/\bmodels?: \d{2,4}\b/i);
    }
  });

  it("the nsfw page states the absence outright — no collection, no tags, no mode", () => {
    const text = pageText("nsfw-content");
    expect(text).toContain("no NSFW collection");
    expect(text).toContain("no NSFW mode");
    expect(text.toLowerCase()).toContain("no nsfw tags");
    // the FAQ answers the collection question with a flat No
    const faq = findSubCategory("nsfw-content")!.faq;
    expect(faq[0].q).toMatch(/Is there an NSFW model collection/i);
    expect(faq[0].a.startsWith("No.")).toBe(true);
    expect(faq[1].a.startsWith("No.")).toBe(true);
  });

  it("the roblox page makes no import-compatibility promise and names the real constraints", () => {
    const text = pageText("roblox");
    expect(text).toContain("no polycount slider");
    expect(text).toMatch(/no LOD generation/i);
    expect(text).not.toMatch(/ready to import into Roblox Studio[^?]*\? Yes/i);
    expect(text).not.toMatch(/guaranteed? (Roblox|import) compatibility/i);
    expect(text).toMatch(/Roblox Studio's (own import tooling|requirements|decision)/i);
  });

  it("format claims match the real exporter set — nothing invented", () => {
    const real = [...EXPORT_FORMATS];
    const fakeFormats = ["3MF", "DAE", "DWG", "DXF", "PLY", "RBXM", "RBXL"];
    for (const page of SUBCATEGORY_PAGES) {
      const text = pageText(page.slug);
      for (const fake of fakeFormats) {
        expect(text.includes(`${fake} export`), `${page.slug}: ${fake}`).toBe(false);
        expect(text.includes(`export ${fake}`), `${page.slug}: ${fake}`).toBe(false);
        expect(text.includes(`as ${fake}`), `${page.slug}: ${fake}`).toBe(false);
      }
      if (/format/i.test(text)) {
        const mentioned = real.filter((f) => new RegExp(`\\b${f.toUpperCase()}\\b`).test(text));
        expect(mentioned.length, page.slug).toBeGreaterThanOrEqual(1);
      }
    }
    // the roblox page leans on FBX + OBJ, both real
    expect(pageText("roblox")).toMatch(/\bFBX\b/);
    expect(pageText("roblox")).toMatch(/\bOBJ\b/);
  });

  it("credit numbers, where stated, match the real metering (50 / 1 / 10, free previews)", () => {
    for (const page of SUBCATEGORY_PAGES) {
      const text = pageText(page.slug);
      if (/credit/i.test(text)) {
        expect(text).toContain(`${INITIAL_BALANCE}`);
        expect(text).toContain(`${STANDARD_COST} credit`);
        expect(text).toContain(`${AGENTIC_COST}`);
      }
    }
  });

  it("no style-lock or guaranteed-consistency claims", () => {
    for (const page of SUBCATEGORY_PAGES) {
      const text = pageText(page.slug);
      expect(text, page.slug).not.toMatch(/style lock|locked to the style|guarantees? the style/i);
      expect(text, page.slug).not.toMatch(/guaranteed style consistency/i);
    }
    // dark-fantasy says the steering contract outright (hyphenated, the
    // styles-tree convention — the negative regex above stays clean)
    expect(pageText("dark-fantasy")).toContain("No style-lock");
  });

  it("no fake CTAs: primary CTAs open the real studio, every href resolves to a real route", () => {
    for (const page of SUBCATEGORY_PAGES) {
      expect(page.cta.href).toBe(STUDIO_PATH);
      expect(page.closingCta.href).toBe(STUDIO_PATH);
      expect(page.generateCta.href).toBe(STUDIO_PATH);
      for (const href of allHrefs(page)) {
        expect(isKnownRoute(href), `${page.slug} → ${href}`).toBe(true);
      }
    }
  });

  it("OmniCraft cross-links only target LIVE tools", () => {
    for (const page of SUBCATEGORY_PAGES) {
      for (const href of allHrefs(page)) {
        if (href.startsWith("/workspace/omnicraft/")) {
          expect(LIVE_TOOL_ROUTES, `${page.slug} → ${href}`).toContain(href);
        }
      }
    }
  });

  it("the three pages interlink — every page links at least one sibling collection", () => {
    for (const page of SUBCATEGORY_PAGES) {
      const siblings = allHrefs(page).filter(
        (h) => h.startsWith("/sub-categories/") && h !== `/sub-categories/${page.slug}`,
      );
      expect(siblings.length, page.slug).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("sub-categories wiring — sitemap, routes", () => {
  it("public/landing-sitemap-sub-categories-en.xml lists the three routes, zero alternates (reference quirk)", () => {
    // t67: the monolith became a 90-child sitemap index; each family owns its child file.
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-sub-categories-en.xml"),
      "utf8",
    );
    for (const route of SUBCATEGORY_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    expect(xml.match(/<url>/g)?.length).toBe(3);
    // the reference's sub-category sitemaps carry no hreflang alternates at all
    expect(xml.includes("xhtml:link")).toBe(false);
  });

  it("the route's generateStaticParams sources from the registry, not literals", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "sub-categories", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("SUBCATEGORY_SLUGS");
    expect(route).toContain("findSubCategory(slug)");
    expect(route).toContain("notFound()");
    for (const slug of SUBCATEGORY_SLUGS) {
      expect(route.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("sub-category routes cannot collide with other trees", () => {
    const others = ["/features", "/legal", "/workspace/omnicraft", "/use-cases", "/styles", "/help", "/pricing", "/3d-prompts", "/switch", "/event"];
    for (const route of SUBCATEGORY_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });
});
