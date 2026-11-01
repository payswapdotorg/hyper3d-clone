import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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
import { EXPORT_FORMATS } from "./exporters";

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

// ---------------------------------------------------------------------------
// t85: the features tree's body density — the five new optional sections
// (recon/t85/notes.md): promptExamples, researchNote, techCards, codeExamples,
// exportTypes. Every anchor below pins content to real code constants.
// ---------------------------------------------------------------------------

describe("features registry — t85 section anatomy", () => {
  it("carries the reference's missing sections on exactly the right pages", () => {
    const withSection = (sel: (p: (typeof FEATURE_PAGES)[number]) => unknown) =>
      FEATURE_PAGES.filter(sel).map((p) => p.slug).sort();
    expect(withSection((p) => p.promptExamples)).toEqual([
      "ai-image-generator",
      "ai-video-generator",
      "text-to-3d",
    ]);
    expect(withSection((p) => p.researchNote)).toEqual(["image-to-3d", "worldgen"]);
    expect(withSection((p) => p.techCards)).toEqual([
      "chatavatar",
      "image-to-3d",
      "mcp",
      "text-to-3d",
      "worldgen",
    ]);
    expect(withSection((p) => p.codeExamples)).toEqual(["api", "mcp"]);
    expect(withSection((p) => p.exportTypes)).toEqual(["api"]);
  });

  it("writes honest prompt cards — a real prompt plus a real note, never bare", () => {
    for (const p of FEATURE_PAGES) {
      if (!p.promptExamples) continue;
      expect(p.promptExamples.cards.length, `${p.slug} cards`).toBeGreaterThanOrEqual(3);
      for (const card of p.promptExamples.cards) {
        expect(card.prompt.length, `${p.slug} prompt`).toBeGreaterThanOrEqual(25);
        // The honest note IS the section — 80+ chars of what really happens here.
        expect(card.note.length, `${p.slug} note`).toBeGreaterThanOrEqual(80);
      }
      // Reference-only pages must say the bitmap/video half is not here.
      if (p.status === "reference-only") {
        const joined = p.promptExamples.cards.map((c) => c.note.toLowerCase()).join(" ");
        expect(/\b(no|not|nothing|never)\b/.test(joined), `${p.slug} gap stated`).toBe(true);
      }
    }
  });

  it("mirrors the reference's research credentials with the clone's disclaimer", () => {
    for (const p of FEATURE_PAGES) {
      if (!p.researchNote) continue;
      const body = p.researchNote.body.toLowerCase();
      // The reference's story, attributed — and the clone's plain statement.
      expect(body.includes("reference"), `${p.slug} attributes the research`).toBe(true);
      expect(body.includes("clone"), `${p.slug} speaks for itself`).toBe(true);
      expect(
        body.includes("no ") && body.includes("research"),
        `${p.slug} disclaims the lineage`,
      ).toBe(true);
      expect(p.researchNote.body.length, `${p.slug} substance`).toBeGreaterThanOrEqual(200);
    }
  });

  it("writes substantive tech cards", () => {
    for (const p of FEATURE_PAGES) {
      if (!p.techCards) continue;
      expect(p.techCards.cards.length, `${p.slug} tech cards`).toBeGreaterThanOrEqual(4);
      for (const card of p.techCards.cards) {
        expect(card.body.length, `${p.slug}: ${card.title}`).toBeGreaterThanOrEqual(80);
      }
    }
  });

  it("lifted the FAQ floor on every touched page (t85 density contract)", () => {
    const TOUCHED: Record<string, number> = {
      "text-to-3d": 8,
      "image-to-3d": 8,
      api: 8,
      mcp: 8,
      worldgen: 8,
      chatavatar: 8,
      "ai-image-generator": 8,
      "ai-video-generator": 8,
    };
    for (const [slug, floor] of Object.entries(TOUCHED)) {
      expect(featureBySlug(slug)!.faq.length, `${slug} faq floor`).toBeGreaterThanOrEqual(floor);
    }
  });

  it("never claims a 40-credit wallet — the real signup grant is 50", () => {
    for (const p of FEATURE_PAGES) {
      const text = JSON.stringify(p);
      expect(text.includes("40-credit"), `${p.slug}`).toBe(false);
      expect(text.includes("40 credits"), `${p.slug}`).toBe(false);
      expect(text.includes("40 at sign-up"), `${p.slug}`).toBe(false);
    }
  });
});

describe("features registry — t85 code examples anchor to real routes", () => {
  /** Extract every /api/… path meant as THIS clone's route, normalized.
   *  External URLs (https://api.hyper3d.com/… — the reference's own endpoint,
   *  documented as a fact) are stripped first: only local-origin paths and
   *  bare /api/ routes are this clone's surface. */
  function apiPathsIn(code: string): string[] {
    const local = code.replace(/https?:\/\/[^\s'"]+/g, " ");
    return [...local.matchAll(/\/api\/[A-Za-z0-9\-_/$.{}]+/g)].map((m) =>
      m[0].replace(/[.?]+$/, ""),
    );
  }

  it("every /api/ path in every code block exists under src/app/api", () => {
    expect.assertions(1);
    const apiRoot = join(process.cwd(), "src", "app", "api");
    for (const p of FEATURE_PAGES) {
      if (!p.codeExamples) continue;
      for (const block of p.codeExamples.blocks) {
        for (const raw of apiPathsIn(block.code)) {
          // $UUID → [uuid] (the real dynamic segment name in the route tree);
          // slice(1) drops the leading "api" — apiRoot already covers it.
          const segs = raw
            .replace("$UUID", "[uuid]")
            .split("?")[0]
            .split("/")
            .filter(Boolean)
            .slice(1);
          const routeFile = join(apiRoot, ...segs, "route.ts");
          expect(
            existsSync(routeFile),
            `${p.slug}: ${raw} must exist (${routeFile})`,
          ).toBe(true);
        }
      }
    }
  });

  it("the api page documents the real request fields the schema accepts", () => {
    const api = featureBySlug("api")!;
    const taskBlock = api
      .codeExamples!.blocks.find((b) => b.label.includes("Create a generation task"))!;
    for (const field of ['"type"', '"prompt"', '"effort"', '"seed"']) {
      expect(taskBlock.code.includes(field), field).toBe(true);
    }
    // The poll block exercises the real progress + export endpoints.
    const pollBlock = api.codeExamples!.blocks.find((b) => b.label.includes("Poll progress"))!;
    expect(pollBlock.code.includes("/api/task/$UUID/progress")).toBe(true);
    expect(pollBlock.code.includes("/api/task/$UUID/export")).toBe(true);
  });

  it("the mcp code blocks are the modal's own constants, pinned to its source", () => {
    const modal = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "mcp-connect-modal.tsx"),
      "utf8",
    );
    const endpoint = modal.match(/MCP_ENDPOINT = "([^"]+)"/)![1];
    const cli = modal.match(/CLI_INSTALL = "([^"]+)"/)![1];
    const mcp = featureBySlug("mcp")!;
    const codes = mcp.codeExamples!.blocks.map((b) => b.code);
    expect(codes).toContain(endpoint);
    expect(codes).toContain(cli);
    // The paste-ready agent instruction is the modal's own text, verbatim-ish:
    // same setup sentence, same closing checklist clause.
    const instruction = codes.find((c) => c.includes("Set up Hyper3D MCP"))!;
    expect(instruction.includes(endpoint)).toBe(true);
    expect(instruction.includes("restart is required")).toBe(true);
  });

  it("exportTypes pins the format list to EXPORT_FORMATS exactly", () => {
    const api = featureBySlug("api")!;
    expect(api.exportTypes!.formats.map((f) => f.name)).toEqual(EXPORT_FORMATS);
    for (const f of api.exportTypes!.formats) {
      expect(f.note.length, `.${f.name} note`).toBeGreaterThanOrEqual(40);
    }
  });
});
