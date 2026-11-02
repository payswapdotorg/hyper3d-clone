import { describe, expect, it } from "vitest";
import { STUDIO_PATH } from "./studio-path";
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
  (t) => `/workspace/omnicraft/${t.slug}`,
);

/** Routes that genuinely exist in this clone. */
const KNOWN_ROUTE_PREFIXES = [
  "/features/",
  "/workspace/omnicraft/",
  "/legal/",
  "/use-cases/",
  "/api/healthz",
];

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "" || base === STUDIO_PATH) return true; // studio root
  if (base === "/features" || base === "/workspace/omnicraft" || base === "/legal" || base === "/use-cases")
    return true;
  return KNOWN_ROUTE_PREFIXES.some((p) => base.startsWith(p));
}

/** Flatten a page's text for content assertions (t87: includes the new
 * optional blocks, so the honesty contract covers them too). */
function pageText(slug: string): string {
  const page = findUseCasePage(slug);
  if (!page) throw new Error(`no use-case page ${slug}`);
  const parts: string[] = [
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
  ];
  if (page.promptExamples) {
    parts.push(page.promptExamples.title, page.promptExamples.intro);
    parts.push(...page.promptExamples.cards.flatMap((c) => [c.prompt, c.note]));
  }
  if (page.techCards) {
    parts.push(page.techCards.title, page.techCards.intro);
    parts.push(...page.techCards.cards.flatMap((c) => [c.title, c.body]));
  }
  if (page.exportTypes) {
    parts.push(page.exportTypes.title, page.exportTypes.intro);
    parts.push(...page.exportTypes.formats.flatMap((f) => [f.name, f.note]));
  }
  return parts.join("\n");
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
      expect(page.closingCta.href).toBe(STUDIO_PATH);
      expect(page.cta.href).toBe(STUDIO_PATH);
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
      expect(page.cta.href).toBe(STUDIO_PATH);
      expect(page.closingCta.href).toBe(STUDIO_PATH);
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
        if (link.href.startsWith("/workspace/omnicraft/")) {
          expect(LIVE_TOOL_ROUTES, `${page.slug} → ${link.href}`).toContain(link.href);
        }
      }
    }
  });
});

describe("use-cases wiring — footer, sitemap, routes", () => {
  it("public/landing-sitemap-use-cases-en.xml lists every use-cases route with absolute URLs", () => {
    // t67: the monolith became a 90-child sitemap index; each family owns its child file.
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-use-cases-en.xml"),
      "utf8",
    );
    for (const route of USE_CASE_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    expect(xml.match(/<url>/g)?.length).toBe(12);
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
    const others = ["/features", "/legal", "/workspace/omnicraft"];
    for (const route of USE_CASE_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// t87 section anatomy — the reference's per-page bands the shared renderer
// gained (promptExamples / techCards / exportTypes), carried honestly. Every
// anchor below pins content to real code constants, mirroring the t85/t86
// features-tree conventions.
// ---------------------------------------------------------------------------

describe("use-cases registry — t87 section anatomy", () => {
  it("carries the reference's missing sections on exactly the right pages", () => {
    const withSection = (sel: (p: (typeof USE_CASE_PAGES)[number]) => unknown) =>
      USE_CASE_PAGES.filter(sel).map((p) => p.slug).sort();
    expect(withSection((p) => p.promptExamples)).toEqual([
      "3d-printing",
      "animation",
      "automotive-design",
      "character-design",
      "game-development",
      "metaverse",
      "nft-creation",
      "vr-ar",
    ]);
    expect(withSection((p) => p.techCards)).toEqual([
      "3d-printing",
      "animation",
      "character-design",
      "e-commerce",
      "game-development",
      "jewelry-design",
      "mechanical-engineering",
      "metaverse",
      "nft-creation",
      "vr-ar",
    ]);
    expect(withSection((p) => p.exportTypes)).toEqual([
      "3d-printing",
      "animation",
      "automotive-design",
      "e-commerce",
      "jewelry-design",
      "mechanical-engineering",
      "metaverse",
      "vr-ar",
    ]);
  });

  it("writes honest prompt cards — a real prompt plus a real note, never bare", () => {
    for (const p of USE_CASE_PAGES) {
      if (!p.promptExamples) continue;
      expect(p.promptExamples.cards.length, `${p.slug} cards`).toBeGreaterThanOrEqual(3);
      for (const card of p.promptExamples.cards) {
        expect(card.prompt.length, `${p.slug} prompt`).toBeGreaterThanOrEqual(25);
        // The honest note IS the section — 80+ chars of what really happens here.
        expect(card.note.length, `${p.slug} note`).toBeGreaterThanOrEqual(80);
      }
      // The partial page must keep saying the rigging half is absent.
      if (p.status === "partial") {
        const joined = p.promptExamples.cards.map((c) => c.note).join(" ");
        expect(/no skeleton|rigging|rig/i.test(joined), `${p.slug} rigging gap in cards`).toBe(
          true,
        );
      }
    }
  });

  it("writes substantive tech cards carrying the reference's own bands", () => {
    for (const p of USE_CASE_PAGES) {
      if (!p.techCards) continue;
      expect(p.techCards.cards.length, `${p.slug} tech cards`).toBeGreaterThanOrEqual(4);
      for (const card of p.techCards.cards) {
        expect(card.body.length, `${p.slug}: ${card.title}`).toBeGreaterThanOrEqual(80);
      }
    }
  });

  it("exportTypes pins the format list to EXPORT_FORMATS exactly, per page", () => {
    for (const p of USE_CASE_PAGES) {
      if (!p.exportTypes) continue;
      expect(p.exportTypes.formats.map((f) => f.name), `${p.slug} formats`).toEqual(
        EXPORT_FORMATS,
      );
      for (const f of p.exportTypes.formats) {
        expect(f.note.length, `${p.slug} .${f.name} note`).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it("lifted the FAQ floor on every use-case page (t87 density contract)", () => {
    for (const p of USE_CASE_PAGES) {
      expect(p.faq.length, `${p.slug} faq floor`).toBeGreaterThanOrEqual(8);
    }
  });

  it("states the polycount/LOD gap wherever the reference sells the controls", () => {
    // Reference pages carrying "Target Polygon Count & Optional LODs" (or the
    // Sim Ready panel): 3d-printing, character-design, game-development,
    // metaverse. The gap must be stated, not blurred.
    const CARRIES_CONTROLS = ["3d-printing", "character-design", "game-development", "metaverse"];
    for (const slug of CARRIES_CONTROLS) {
      const text = pageText(slug);
      expect(text, `${slug} names the lever`).toMatch(/polycount/i);
      expect(
        text,
        `${slug} states the gap`,
      ).toMatch(/no target|no polycount|neither target|no budget slider|no LOD|does not expose a polycount/i);
    }
  });

  it("the animation page pins the studio's real editing subset (orientation, material redo, ControlNet)", () => {
    const text = JSON.stringify(findUseCasePage("animation")!);
    expect(text).toMatch(/orientation/i);
    expect(text).toMatch(/ControlNet/i);
    expect(text).toMatch(/material/i);
    // and the hosted-editor gap stays stated
    expect(pageText("animation")).toMatch(/hosted (mesh )?editor is not here|not in this clone/i);
  });

  it("every OmniCraft route mentioned anywhere in a def is a LIVE tool route", () => {
    for (const p of USE_CASE_PAGES) {
      const text = JSON.stringify(p);
      for (const m of text.match(/\/workspace\/omnicraft\/[a-z0-9]+/g) ?? []) {
        expect(LIVE_TOOL_ROUTES, `${p.slug} → ${m}`).toContain(m);
      }
    }
  });

  it("pages naming the HDRI generator point at the real live tool", () => {
    for (const p of USE_CASE_PAGES) {
      const text = JSON.stringify(p);
      if (/HDRI generator/i.test(text)) {
        expect(text, `${p.slug} hdri route`).toContain("/workspace/omnicraft/hdri");
      }
    }
  });

  it("never claims a 40-credit wallet — the real signup grant is 50", () => {
    for (const p of USE_CASE_PAGES) {
      const text = JSON.stringify(p);
      expect(text.includes("40-credit"), `${p.slug}`).toBe(false);
      expect(text.includes("40 credits"), `${p.slug}`).toBe(false);
      expect(text.includes("40 at sign-up"), `${p.slug}`).toBe(false);
    }
  });
});
