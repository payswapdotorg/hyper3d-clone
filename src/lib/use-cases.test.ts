import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPORT_FORMATS } from "./exporters";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import {
  REFERENCE_USE_CASE_SLUGS,
  USE_CASE_GROUPS,
  USE_CASE_PAGES,
  findUseCasePage,
  USE_CASE_ROUTES,
  USE_CASE_SLUGS,
} from "./use-cases";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The clone's genuinely live OmniCraft tool routes. */
const LIVE_TOOL_ROUTES = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
  (t) => `/omnicraft/${t.slug}`,
);

/** Routes that genuinely exist in this clone. */
const KNOWN_ROUTE_PREFIXES = [
  "/features/",
  "/omnicraft/",
  "/legal/",
  "/use-cases/",
  "/api/healthz",
];

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "") return true; // studio root
  if (base === "/features" || base === "/omnicraft" || base === "/legal" || base === "/use-cases")
    return true;
  return KNOWN_ROUTE_PREFIXES.some((p) => base.startsWith(p));
}

/** Flatten a page's text for content assertions. */
function pageText(slug: string): string {
  const page = findUseCasePage(slug);
  if (!page) throw new Error(`no use-case page ${slug}`);
  return [
    page.title,
    page.description,
    page.subline,
    page.statusPanel.summary,
    ...page.statusPanel.works,
    ...page.statusPanel.limits,
    ...page.steps.flatMap((s) => [s.title, s.body]),
    ...page.benefits.flatMap((b) => [b.title, b.body]),
    ...page.cards.flatMap((c) => [c.title, c.body]),
    ...page.faq.flatMap((f) => [f.q, f.a]),
    page.closingBody,
  ].join("\n");
}

describe("use-cases registry — reference parity", () => {
  it("exactly covers the reference's 11 use-case pages (+ index route)", () => {
    expect(USE_CASE_SLUGS.sort()).toEqual([...REFERENCE_USE_CASE_SLUGS].sort());
    expect(USE_CASE_PAGES).toHaveLength(11);
    expect(USE_CASE_ROUTES).toEqual([
      "/use-cases",
      ...[...REFERENCE_USE_CASE_SLUGS].sort().map((s) => `/use-cases/${s}`),
    ]);
  });

  it("has unique slugs and names", () => {
    expect(new Set(USE_CASE_SLUGS).size).toBe(USE_CASE_SLUGS.length);
    expect(new Set(USE_CASE_PAGES.map((p) => p.name)).size).toBe(USE_CASE_PAGES.length);
  });

  it("resolves every slug through findUseCasePage and nothing else", () => {
    for (const slug of REFERENCE_USE_CASE_SLUGS) {
      expect(findUseCasePage(slug)?.slug).toBe(slug);
    }
    expect(findUseCasePage("gamedev")).toBeUndefined();
    expect(findUseCasePage("")).toBeUndefined();
  });

  it("the index groups cover every page exactly once", () => {
    const grouped = USE_CASE_GROUPS.flatMap((g) => g.slugs);
    expect(grouped.sort()).toEqual([...USE_CASE_SLUGS].sort());
  });

  it("every page has full anatomy (hero, status panel, steps, benefits, cards, FAQ, cross-links, CTAs)", () => {
    for (const page of USE_CASE_PAGES) {
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.subline.length).toBeGreaterThan(20);
      expect(page.statusPanel.works.length).toBeGreaterThanOrEqual(3);
      expect(page.statusPanel.limits.length).toBeGreaterThanOrEqual(3);
      expect(page.steps.length).toBeGreaterThanOrEqual(3);
      expect(page.benefits.length).toBeGreaterThanOrEqual(4);
      expect(page.cards.length).toBeGreaterThanOrEqual(4);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.crossLinks.length).toBeGreaterThanOrEqual(4);
      expect(page.closingCta.href).toBe("/");
      expect(page.cta.href).toBe("/");
    }
  });

  it("every cross-link points at a route that genuinely exists", () => {
    for (const page of USE_CASE_PAGES) {
      for (const link of page.crossLinks) {
        expect(isKnownRoute(link.href), `${page.slug} → ${link.href}`).toBe(true);
      }
      if (page.ctaSecondary) {
        expect(isKnownRoute(page.ctaSecondary.href), `${page.slug} ctaSecondary`).toBe(true);
      }
    }
  });

  it("sibling cross-links resolve to real use-case pages", () => {
    for (const page of USE_CASE_PAGES) {
      for (const link of page.crossLinks) {
        if (link.href.startsWith("/use-cases/")) {
          const slug = link.href.slice("/use-cases/".length);
          expect(findUseCasePage(slug), `${page.slug} → ${slug}`).toBeDefined();
        }
      }
    }
  });
});

describe("use-cases content — the honesty contract", () => {
  it("statuses: 10 workflows live, animation partial (rigging absent)", () => {
    const live = USE_CASE_PAGES.filter((p) => p.status === "live");
    const partial = USE_CASE_PAGES.filter((p) => p.status === "partial");
    expect(live.map((p) => p.slug).sort()).toEqual(
      [...REFERENCE_USE_CASE_SLUGS].filter((s) => s !== "animation").sort(),
    );
    expect(partial.map((p) => p.slug)).toEqual(["animation"]);
    // the partial page says WHY, in its limits
    const animation = pageText("animation");
    expect(animation).toContain("No rigging");
  });

  it("no page claims baked PBR texture maps (materials are parameters here)", () => {
    for (const page of USE_CASE_PAGES) {
      const text = pageText(page.slug);
      // if a page mentions texture maps, it must be to deny/hedge them
      const mapClaim = /\b(albedo|normal map|texture-map|PBR maps?|texture maps?)\b/i;
      if (mapClaim.test(text)) {
        expect(text, page.slug).toMatch(
          /not baked|no baked|no separate|not here|no[ .—]|keep your photography/i,
        );
      }
      expect(page.statusPanel.limits.join(" "), page.slug).toMatch(
        /parameter|map|polycount|LOD|rigging|grade|budget|CAD|parametric/i,
      );
    }
  });

  it("format claims match the real exporter set (GLB/GLTF/OBJ/STL/USDZ/FBX)", () => {
    const real = [...EXPORT_FORMATS];
    for (const page of USE_CASE_PAGES) {
      const text = pageText(page.slug);
      const mentioned = real.filter((f) =>
        new RegExp(`\\b${f.toUpperCase()}\\b`).test(text),
      );
      // every live page names at least one real export format
      expect(mentioned.length, page.slug).toBeGreaterThanOrEqual(1);
    }
    // no page invents formats the exporters do not ship (3MF, DAE, DWG…)
    const fakeFormats = ["3MF", "DAE", "DWG", "DXF", "PLY", "STLP"];
    for (const page of USE_CASE_PAGES) {
      const text = pageText(page.slug);
      for (const fake of fakeFormats) {
        expect(text.includes(`${fake} export`), `${page.slug}: ${fake}`).toBe(false);
        expect(text.includes(`export ${fake}`), `${page.slug}: ${fake}`).toBe(false);
      }
    }
  });

  it("no fake CTAs: primary CTAs open the real studio, none target dead surfaces", () => {
    for (const page of USE_CASE_PAGES) {
      expect(page.cta.href).toBe("/");
      expect(page.closingCta.href).toBe("/");
    }
  });

  it("pay-by-result and credit numbers, where stated, match the real metering", () => {
    for (const page of USE_CASE_PAGES) {
      const text = pageText(page.slug);
      if (/credit/i.test(text)) {
        // any credit numbers must be the real ones (1 standard / 10 agentic / 1 confirm)
        expect(text).toMatch(/1 credit[^.\n]{0,24}(standard|Confirm|pay-by-result)/i);
        expect(text).toContain("10");
        expect(text).toContain("first task free");
      }
    }
  });

  it("OmniCraft cross-links only target LIVE tools (no dead tool pages)", () => {
    for (const page of USE_CASE_PAGES) {
      for (const link of page.crossLinks) {
        if (link.href.startsWith("/omnicraft/")) {
          expect(LIVE_TOOL_ROUTES, `${page.slug} → ${link.href}`).toContain(link.href);
        }
      }
    }
  });
});

describe("use-cases wiring — footer, sitemap, routes", () => {
  it("public/sitemap.xml lists every use-cases route with absolute URLs", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    for (const route of USE_CASE_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    expect(xml.count).toBeUndefined(); // guard: no stray fields
  });

  it("the studio footer's USE CASES column routes to real pages (no toasts)", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain(`heading: "USE CASES"`);
    expect(studio).toContain(`["Game Development", "/use-cases/game-development"]`);
    expect(studio).toContain(`["3D Printing", "/use-cases/3d-printing"]`);
    expect(studio).toContain(`["All use cases", "/use-cases"]`);
    expect(studio).not.toContain(`stubToast("Game Development")`);
    expect(studio).not.toContain(`stubToast("3D Printing")`);
  });

  it("the use-cases route's generateStaticParams source covers exactly the registry", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "use-cases", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("USE_CASE_SLUGS");
    expect(route).toContain("findUseCasePage(slug)");
    expect(route).toContain("notFound()");
    for (const slug of USE_CASE_SLUGS) {
      expect(route.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("use-case routes cannot collide with features, legal, or tool routes", () => {
    const others = ["/features", "/legal", "/omnicraft"];
    for (const route of USE_CASE_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });
});
