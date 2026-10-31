import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FEATURE_GROUPS,
  FEATURE_NAV_HREFS,
  FEATURE_PAGES,
  featureBySlug,
  featureRoutes,
  featureSlugs,
} from "./features";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { STUDIO_PATH } from "./studio-path";

/** This clone's production origin (sitemap locs must be absolute, t58). */
const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The reference's features sitemap, captured 2026-10-29 from
 * hyper3d.ai/landing-sitemap-features-en.xml (minus the index route itself). */
const REFERENCE_FEATURE_SLUGS = [
  "ai-image-generator",
  "ai-video-generator",
  "api",
  "chatavatar",
  "image-to-3d",
  "mcp",
  "mcp/mcp-claude",
  "mcp/mcp-codex",
  "mcp/mcp-kimi",
  "omnicraft/3d-mesh-editor",
  "omnicraft/3d-model-search-engine",
  "omnicraft/ai-hdri-generator",
  "omnicraft/ai-image-enhancer",
  "omnicraft/ai-image-remix",
  "omnicraft/ai-texture-generator",
  "omnicraft/svg-to-3d-converter",
  "text-to-3d",
  "worldgen",
] as const;

/** Routes that genuinely exist in this clone (pages + tool routes + studio). */
const KNOWN_ROUTE_PREFIXES = ["/features/", "/workspace/omnicraft/", "/api/healthz"];

function isKnownRoute(href: string): boolean {
  // strip query/hash: "/?mcp=1" and "/#how-it-works" are the studio root
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "" || base === STUDIO_PATH) return true;
  if (base === "/workspace/omnicraft") return true;
  return KNOWN_ROUTE_PREFIXES.some((p) => base.startsWith(p));
}

describe("features registry — reference parity", () => {
  it("exactly covers the reference's 18 feature pages (+ index)", () => {
    expect(featureSlugs().sort()).toEqual([...REFERENCE_FEATURE_SLUGS].sort());
    expect(FEATURE_PAGES).toHaveLength(18);
  });

  it("has unique slugs and unique names", () => {
    expect(new Set(featureSlugs()).size).toBe(featureSlugs().length);
    expect(new Set(FEATURE_PAGES.map((p) => p.name)).size).toBe(FEATURE_PAGES.length);
  });

  it("resolves every slug through featureBySlug and nothing else", () => {
    for (const slug of REFERENCE_FEATURE_SLUGS) {
      expect(featureBySlug(slug)?.slug).toBe(slug);
    }
    expect(featureBySlug("not-a-feature")).toBeUndefined();
    expect(featureBySlug("mcp/mcp-notreal")).toBeUndefined();
  });

  it("exposes routes for the sitemap", () => {
    expect(featureRoutes()).toEqual(featureSlugs().map((s) => `/features/${s}`));
  });
});

describe("features registry — content depth (no shallow pages)", () => {
  it("gives every page the full reference anatomy", () => {
    for (const p of FEATURE_PAGES) {
      expect(p.title.length, `${p.slug} title`).toBeGreaterThan(8);
      expect(p.subline.length, `${p.slug} subline`).toBeGreaterThan(80);
      expect(p.steps, `${p.slug} steps`).toHaveLength(3);
      expect(p.benefits.length, `${p.slug} benefits`).toBeGreaterThanOrEqual(4);
      expect(p.useCases.length, `${p.slug} use cases`).toBeGreaterThanOrEqual(3);
      expect(p.faq.length, `${p.slug} faq`).toBeGreaterThanOrEqual(4);
      expect(p.crossLinks.length, `${p.slug} cross links`).toBeGreaterThanOrEqual(4);
      expect(p.indexBlurb.length, `${p.slug} index blurb`).toBeGreaterThan(20);
      expect(p.statusNote.length, `${p.slug} status note`).toBeGreaterThan(120);
    }
  });

  it("writes substantive prose in every step, benefit, use case and FAQ entry", () => {
    for (const p of FEATURE_PAGES) {
      for (const s of p.steps) {
        expect(s.body.length, `${p.slug}: ${s.title}`).toBeGreaterThan(60);
      }
      for (const b of p.benefits) {
        expect(b.body.length, `${p.slug}: ${b.title}`).toBeGreaterThan(50);
      }
      for (const u of p.useCases) {
        expect(u.body.length, `${p.slug}: ${u.title}`).toBeGreaterThan(30);
      }
      for (const f of p.faq) {
        expect(f.a.length, `${p.slug}: ${f.q}`).toBeGreaterThan(60);
      }
    }
  });

  it("marks a real status on every page", () => {
    const statuses = new Set(FEATURE_PAGES.map((p) => p.status));
    expect(statuses).toEqual(new Set(["live", "partial", "reference-only"]));
    for (const p of FEATURE_PAGES) {
      expect(p.statusChip.length).toBeGreaterThan(3);
    }
  });
});

describe("features registry — honest routing", () => {
  it("live and partial pages carry primary CTAs to real routes", () => {
    for (const p of FEATURE_PAGES) {
      if (p.status === "reference-only") {
        expect(p.cta, `${p.slug} should have no fake CTA`).toBeNull();
      } else {
        expect(p.cta, `${p.slug} needs a CTA`).not.toBeNull();
        expect(isKnownRoute(p.cta!.href), `${p.slug} CTA ${p.cta!.href}`).toBe(true);
      }
      expect(isKnownRoute(p.closingCta.href), `${p.slug} closing CTA`).toBe(true);
    }
  });

  it("keeps every cross-link internal and known", () => {
    for (const p of FEATURE_PAGES) {
      for (const link of p.crossLinks) {
        expect(link.href.startsWith("/"), `${p.slug}: ${link.href}`).toBe(true);
        expect(isKnownRoute(link.href), `${p.slug}: unknown route ${link.href}`).toBe(true);
      }
    }
  });

  it("points secondary CTAs at real routes too", () => {
    for (const p of FEATURE_PAGES) {
      if (p.ctaSecondary) {
        expect(isKnownRoute(p.ctaSecondary.href), `${p.slug} secondary`).toBe(true);
      }
    }
  });
});

describe("features registry — OmniCraft consistency (single source of truth)", () => {
  const FEATURE_TO_TOOL: Record<string, string> = {
    "omnicraft/ai-hdri-generator": "hdri",
    "omnicraft/svg-to-3d-converter": "vecto3d",
    "omnicraft/ai-texture-generator": "texture",
    "omnicraft/ai-image-enhancer": "enhancer",
    "omnicraft/ai-image-remix": "remix",
    "omnicraft/3d-model-search-engine": "search",
    "omnicraft/3d-mesh-editor": "mesh",
  };

  it("covers every OmniCraft tool that has a reference feature page", () => {
    const covered = FEATURE_PAGES.filter((p) => p.group === "omnicraft").map((p) => p.slug);
    expect(covered.sort()).toEqual(Object.keys(FEATURE_TO_TOOL).sort());
  });

  it("agrees with the tool registry's live/not-in-clone statuses", () => {
    for (const [slug, toolSlug] of Object.entries(FEATURE_TO_TOOL)) {
      const page = featureBySlug(slug)!;
      const tool = OMNICRAFT_TOOLS.find((t) => t.slug === toolSlug)!;
      // Feature-page status narrows the tool status honestly: tools the
      // registry calls live get live pages; not-in-clone tools never do.
      if (tool.status === "live") {
        expect(page.status, `${slug}`).toBe("live");
        expect(page.cta?.href, `${slug} must deep-link the real tool`).toBe(
          `/workspace/omnicraft/${toolSlug}`,
        );
      } else {
        expect(page.status, `${slug}`).toBe("reference-only");
        expect(page.cta, `${slug} must not fake a tool CTA`).toBeNull();
      }
    }
  });
});

describe("features registry — index and nav wiring", () => {
  it("groups cover every page exactly once", () => {
    const grouped = FEATURE_GROUPS.flatMap((g) => g.pages.map((p) => p.slug));
    expect(grouped.sort()).toEqual(featureSlugs().sort());
    for (const g of FEATURE_GROUPS) {
      expect(g.pages.length, `group ${g.id}`).toBeGreaterThan(0);
    }
  });

  it("nav hrefs resolve to real registry pages", () => {
    for (const [label, href] of Object.entries(FEATURE_NAV_HREFS)) {
      expect(href.startsWith("/features/") || href.startsWith("/workspace/omnicraft/"), label).toBe(true);
      if (href.startsWith("/features/")) {
        expect(featureBySlug(href.slice("/features/".length)), label).toBeDefined();
      } else {
        const toolSlug = href.slice("/workspace/omnicraft/".length);
        expect(OMNICRAFT_TOOLS.some((t) => t.slug === toolSlug), label).toBe(true);
      }
    }
  });

  it("covers every label the header/footer features nav can emit", () => {
    // NAV_FEATURES_MAIN + NAV_AI_MEDIA + NAV_OMNICRAFT + Products ChatAvatar
    const navLabels = [
      "Image To 3D",
      "Text To 3D",
      "WorldGen",
      "API",
      "MCP",
      "AI Video Generator",
      "AI Image Generator",
      "AI Image Remix",
      "AI Image Enhancer",
      "AI Texture Generator",
      "AI HDRI Generator",
      "3D Model Search Engine",
      "SVG to 3D Converter",
      "3D Mesh Editor",
      "ChatAvatar",
    ];
    for (const label of navLabels) {
      expect(FEATURE_NAV_HREFS[label], `nav label: ${label}`).toBeDefined();
    }
  });
});

describe("features sitemap", () => {
  it("public/landing-sitemap-features-en.xml lists every features route; static-en retired the omnicraft locs", () => {
    // t67: the monolith became a 90-child sitemap index; features own their
    // child. t71: the reference removed the five omnicraft locs from
    // static-en (the routes 301 away now) and added the two content-preview
    // locs in their place — the clone's static-en matches line-for-line.
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-features-en.xml"),
      "utf8",
    );
    const staticXml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-static-en.xml"),
      "utf8",
    );
    for (const route of featureRoutes()) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    for (const tool of OMNICRAFT_TOOLS) {
      expect(staticXml.includes(`<loc>${SITE_ORIGIN}/omnicraft/${tool.slug}</loc>`), tool.slug).toBe(
        false,
      );
    }
    expect(staticXml.includes(`<loc>${SITE_ORIGIN}/content-preview</loc>`)).toBe(true);
    expect(staticXml.includes(`<loc>${SITE_ORIGIN}/content-preview/render</loc>`)).toBe(true);
    expect(staticXml.includes(`<loc>${SITE_ORIGIN}/</loc>`)).toBe(true);
    expect(xml.includes(`<loc>${SITE_ORIGIN}/features</loc>`)).toBe(true);
  });

  it("uses absolute URLs for every loc (sitemap protocol requirement, t58)", () => {
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-features-en.xml"),
      "utf8",
    );
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${SITE_ORIGIN}/`), loc).toBe(true);
    }
  });
});
