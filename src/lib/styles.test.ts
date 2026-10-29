import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPORT_FORMATS } from "./exporters";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import {
  REFERENCE_STYLE_SLUGS,
  STYLE_GROUPS,
  STYLE_PAGES,
  findStylePage,
  STYLE_ROUTES,
  STYLE_SLUGS,
} from "./styles";

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
  "/styles/",
  "/api/healthz",
];

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "") return true; // studio root
  if (
    base === "/features" ||
    base === "/omnicraft" ||
    base === "/legal" ||
    base === "/use-cases" ||
    base === "/styles"
  )
    return true;
  return KNOWN_ROUTE_PREFIXES.some((p) => base.startsWith(p));
}

/** Flatten a page's text for content assertions. */
function pageText(slug: string): string {
  const page = findStylePage(slug);
  if (!page) throw new Error(`no style page ${slug}`);
  return [
    page.title,
    page.description,
    page.subline,
    page.statusPanel.summary,
    ...page.statusPanel.works,
    ...page.statusPanel.limits,
    ...page.steps.flatMap((s) => [s.title, s.body]),
    ...page.signals.flatMap((s) => [s.title, s.body]),
    ...page.recipes.flatMap((r) => [r.title, r.prompt, r.note]),
    ...page.faq.flatMap((f) => [f.q, f.a]),
    page.closingBody,
  ].join("\n");
}

describe("styles registry — reference parity", () => {
  it("exactly covers the reference's 21 style pages (+ index route)", () => {
    expect(STYLE_SLUGS.sort()).toEqual([...REFERENCE_STYLE_SLUGS].sort());
    expect(STYLE_PAGES).toHaveLength(21);
    expect(STYLE_ROUTES).toEqual([
      "/styles",
      ...[...REFERENCE_STYLE_SLUGS].sort().map((s) => `/styles/${s}`),
    ]);
  });

  it("has unique slugs and names", () => {
    expect(new Set(STYLE_SLUGS).size).toBe(STYLE_SLUGS.length);
    expect(new Set(STYLE_PAGES.map((p) => p.name)).size).toBe(STYLE_PAGES.length);
  });

  it("resolves every slug through findStylePage and nothing else", () => {
    for (const slug of REFERENCE_STYLE_SLUGS) {
      expect(findStylePage(slug)?.slug).toBe(slug);
    }
    expect(findStylePage("lowpoly")).toBeUndefined();
    expect(findStylePage("")).toBeUndefined();
  });

  it("the index groups cover every page exactly once", () => {
    const grouped = STYLE_GROUPS.flatMap((g) => g.slugs);
    expect(grouped.sort()).toEqual([...STYLE_SLUGS].sort());
  });

  it("every page has full anatomy (hero, status panel, steps, signals, recipes, FAQ, cross-links, CTAs)", () => {
    for (const page of STYLE_PAGES) {
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.subline.length).toBeGreaterThan(20);
      expect(page.statusPanel.works.length).toBeGreaterThanOrEqual(3);
      expect(page.statusPanel.limits.length).toBeGreaterThanOrEqual(3);
      expect(page.steps.length).toBeGreaterThanOrEqual(3);
      expect(page.signals.length).toBeGreaterThanOrEqual(4);
      expect(page.recipes.length).toBeGreaterThanOrEqual(4);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.crossLinks.length).toBeGreaterThanOrEqual(4);
      expect(page.closingCta.href).toBe("/");
      expect(page.cta.href).toBe("/");
    }
  });

  it("every recipe is a real prompt with an honest note", () => {
    for (const page of STYLE_PAGES) {
      for (const recipe of page.recipes) {
        expect(recipe.prompt.length, `${page.slug}/${recipe.title}`).toBeGreaterThan(40);
        expect(recipe.note.length, `${page.slug}/${recipe.title}`).toBeGreaterThan(30);
      }
    }
  });

  it("every cross-link points at a route that genuinely exists", () => {
    for (const page of STYLE_PAGES) {
      for (const link of page.crossLinks) {
        expect(isKnownRoute(link.href), `${page.slug} → ${link.href}`).toBe(true);
      }
      if (page.ctaSecondary) {
        expect(isKnownRoute(page.ctaSecondary.href), `${page.slug} ctaSecondary`).toBe(true);
      }
    }
  });

  it("sibling cross-links resolve to real style pages", () => {
    for (const page of STYLE_PAGES) {
      for (const link of page.crossLinks) {
        if (link.href.startsWith("/styles/")) {
          const slug = link.href.slice("/styles/".length);
          expect(findStylePage(slug), `${page.slug} → ${slug}`).toBeDefined();
        }
      }
    }
  });
});

describe("styles content — the honesty contract", () => {
  it("statuses: 17 styles steerable, 4 partial (texture/shading-model dependent)", () => {
    const live = STYLE_PAGES.filter((p) => p.status === "live");
    const partial = STYLE_PAGES.filter((p) => p.status === "partial");
    expect(partial.map((p) => p.slug).sort()).toEqual(
      ["cel-shaded", "hand-painted", "photorealistic", "pixel-art"].sort(),
    );
    expect(live.map((p) => p.slug).sort()).toEqual(
      [...REFERENCE_STYLE_SLUGS]
        .filter((s) => !["cel-shaded", "hand-painted", "photorealistic", "pixel-art"].includes(s))
        .sort(),
    );
  });

  it("the four partial pages state the real reason (parameters, not baked maps / no toon model)", () => {
    expect(pageText("cel-shaded")).toContain("MeshStandardMaterial");
    expect(pageText("cel-shaded")).toMatch(/no toon|toon shading model|not.*toon/i);
    expect(pageText("hand-painted")).toMatch(/no texture painting|bakes no textures|no baked textures/i);
    expect(pageText("photorealistic")).toContain("MeshStandardMaterial");
    expect(pageText("photorealistic")).toMatch(/no baked PBR|no albedo/i);
    expect(pageText("pixel-art")).toMatch(/no texture baking|bakes none|no baked textures/i);
  });

  it("no page claims baked PBR texture maps (materials are parameters here)", () => {
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      // if a page mentions texture maps, it must be to deny/hedge them
      const mapClaim = /\b(albedo|normal map|texture-map|PBR maps?|texture maps?)\b/i;
      if (mapClaim.test(text)) {
        expect(text, page.slug).toMatch(
          /not baked|no baked|no separate|not here|bakes none|bakes no|your DCC|downstream/i,
        );
      }
      // every page's limits name at least one real constraint
      expect(page.statusPanel.limits.join(" "), page.slug).toMatch(
        /parameter|map|texture|polycount|LOD|shading|vocabulary|style-lock|remesher|CAD|grid|palette/i,
      );
    }
  });

  it("no polycount-targeting or LOD-generation claims (the controls do not exist)", () => {
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      // the reference's unambiguous overclaims must not appear
      expect(text, page.slug).not.toMatch(/up to 10 million/i);
      expect(text, page.slug).not.toMatch(/choose a target polygon count/i);
      expect(text, page.slug).not.toMatch(/optionally generate LODs/i);
      // any LOD/polycount mention must sit in a denial or DCC hand-off context
      if (/LOD|polycount/i.test(text)) {
        expect(text, page.slug).toMatch(
          /no polycount|no LOD|decimate|your DCC|engine-side/i,
        );
      }
    }
    // the low-poly page, where the temptation is strongest, states it directly
    expect(pageText("low-poly")).toContain("no polycount slider");
  });

  it("no style-lock or guaranteed-consistency claims (steering is prompt-level)", () => {
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      expect(text, page.slug).not.toMatch(/style lock|locked to the style|guarantees? the style/i);
      expect(text, page.slug).not.toMatch(/guaranteed style consistency/i);
    }
    // the umbrella page states the no-style-lock contract outright
    expect(pageText("stylized")).toContain("No style-lock");
  });

  it("voxel is honest about construction (box primitives, no dedicated remesher)", () => {
    const text = pageText("voxel");
    expect(text).toContain("no dedicated voxel");
    expect(text).not.toMatch(/voxel remesher (that|which) converts/i);
    expect(text).not.toContain(".vox import");
  });

  it("format claims match the real exporter set (GLB/GLTF/OBJ/STL/USDZ/FBX)", () => {
    const real = [...EXPORT_FORMATS];
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      const mentioned = real.filter((f) =>
        new RegExp(`\\b${f.toUpperCase()}\\b`).test(text),
      );
      // most pages name at least one real export format
      expect(mentioned.length, page.slug).toBeGreaterThanOrEqual(1);
    }
    // no page invents formats the exporters do not ship (3MF, DAE, DWG…)
    const fakeFormats = ["3MF", "DAE", "DWG", "DXF", "PLY"];
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      for (const fake of fakeFormats) {
        expect(text.includes(`${fake} export`), `${page.slug}: ${fake}`).toBe(false);
        expect(text.includes(`export ${fake}`), `${page.slug}: ${fake}`).toBe(false);
      }
    }
  });

  it("no fake CTAs: primary CTAs open the real studio, none target dead surfaces", () => {
    for (const page of STYLE_PAGES) {
      expect(page.cta.href).toBe("/");
      expect(page.closingCta.href).toBe("/");
    }
  });

  it("credit numbers, where stated, match the real metering", () => {
    for (const page of STYLE_PAGES) {
      const text = pageText(page.slug);
      if (/credit/i.test(text)) {
        expect(text).toMatch(/1 credit[^.\n]{0,24}(standard|Confirm|pay-by-result)/i);
        expect(text).toContain("10");
        expect(text).toContain("first task free");
      }
    }
  });

  it("OmniCraft cross-links only target LIVE tools (no dead tool pages)", () => {
    for (const page of STYLE_PAGES) {
      for (const link of page.crossLinks) {
        if (link.href.startsWith("/omnicraft/")) {
          expect(LIVE_TOOL_ROUTES, `${page.slug} → ${link.href}`).toContain(link.href);
        }
      }
    }
  });
});

describe("styles wiring — footer, sitemap, routes", () => {
  it("public/sitemap.xml lists every styles route with absolute URLs", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    for (const route of STYLE_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
  });

  it("the studio footer's STYLES column routes to real pages (no toasts)", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain(`heading: "STYLES"`);
    expect(studio).toContain(`["Low Poly", "/styles/low-poly"]`);
    expect(studio).toContain(`["Voxel", "/styles/voxel"]`);
    expect(studio).toContain(`["All styles", "/styles"]`);
  });

  it("the styles route's generateStaticParams source covers exactly the registry", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "styles", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("STYLE_SLUGS");
    expect(route).toContain("findStylePage(slug)");
    expect(route).toContain("notFound()");
    for (const slug of STYLE_SLUGS) {
      expect(route.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("style routes cannot collide with features, legal, use-case, or tool routes", () => {
    const others = ["/features", "/legal", "/omnicraft", "/use-cases"];
    for (const route of STYLE_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });
});
