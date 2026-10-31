import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { STUDIO_PATH } from "./studio-path";
import {
  WORKSPACE_BOUNCE_SCRIPT,
  WORKSPACE_MARKER_SCRIPT,
} from "./workspace-visit";
import { homeGraph } from "./schema-org";
import { featureSlugs } from "./features";
import { USE_CASE_SLUGS, findUseCasePage } from "./use-cases";
import { findStylePage } from "./styles";
import { HELP_ROUTES } from "./help";
import { LOCALE_CODES } from "./i18n";

/**
 * t68 — the marketing homepage surface.
 *
 * The reference serves its landing page at `/` and the studio at
 * /workspace/rodin, with a client-side returning-visitor bounce between
 * them. These tests pin that shape: the studio route, the landing page's
 * bounce + @graph + metadata, the redirect table, and the landing
 * chrome's every href resolving to a route this clone really serves.
 */

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

const landingPage = read("../app/page.tsx");
const studioPage = read("../app/workspace/rodin/page.tsx");
const nextConfig = read("../../next.config.ts");
const headerSrc = read("../components/hyper3d/site-header.tsx");
const footerSrc = read("../components/hyper3d/site-footer.tsx");
const marketingSrc = read("../components/hyper3d/landing/marketing-home.tsx");
const demoCardSrc = read("../components/hyper3d/landing/hero-demo-card.tsx");

/* ------------------------------------------------------ the URL shape */

describe("t68 URL shape — landing at /, studio at /workspace/rodin", () => {
  it("STUDIO_PATH is the reference's studio route", () => {
    expect(STUDIO_PATH).toBe("/workspace/rodin");
  });

  it("the studio route renders the app and stamps the visit markers", () => {
    expect(studioPage).toContain("Hyper3DApp");
    expect(studioPage).toContain("WORKSPACE_MARKER_SCRIPT");
    expect(studioPage).toContain(
      '"Rodin AI - Free AI 3D Model Generator For Everyone',
    );
  });

  it("the landing page renders the marketing home, the bounce, and the @graph", () => {
    expect(landingPage).toContain("MarketingHome");
    expect(landingPage).toContain("WORKSPACE_BOUNCE_SCRIPT");
    expect(landingPage).toContain("homeGraph()");
    expect(landingPage).toContain("Hyper3D Rodin - Best AI 3D Model Generator");
  });

  it("the studio page no longer redirects to / — the old single-page shortcut is gone", () => {
    expect(nextConfig).not.toMatch(/source:\s*"\/workspace\/rodin",\s*destination:\s*"/);
    expect(nextConfig).not.toContain('destination: "/?auth=signup"');
  });

  it("redirects land on the studio route with the params the app consumes", () => {
    expect(nextConfig).toContain(
      '{ source: "/workspace", destination: "/workspace/rodin", permanent: false }',
    );
    expect(nextConfig).toContain(
      '{ source: "/signup", destination: "/workspace/rodin?auth=signup", permanent: false }',
    );
    expect(nextConfig).toContain(
      '{ source: "/r/:code", destination: "/workspace/rodin?auth=signup&referral_code=:code", permanent: false }',
    );
    expect(nextConfig).toContain(
      '{ source: "/a/:code", destination: "/workspace/rodin?auth=signup&referral_code=:code", permanent: false }',
    );
  });
});

/* -------------------------------------------------- the bounce scripts */

describe("t68 workspace-visit scripts — the reference's marker contract", () => {
  it("the marker script stamps all three markers the reference's shell sets", () => {
    expect(WORKSPACE_MARKER_SCRIPT).toContain('sessionStorage.setItem("hyper3dWorkspaceVisited"');
    expect(WORKSPACE_MARKER_SCRIPT).toContain(
      'localStorage.setItem("hyper3dWorkspaceVisitedAt"',
    );
    expect(WORKSPACE_MARKER_SCRIPT).toContain(
      'document.cookie="hyper3d_workspace_visited=1; Path=/; Max-Age=31536000; SameSite=Lax"',
    );
    expect(WORKSPACE_MARKER_SCRIPT).toContain('"https:"===location.protocol?"; Secure":""');
  });

  it("the bounce script checks the reference's five conditions and honors bypass=true", () => {
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"hyper3d_workspace_visited"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"hyper3dWorkspaceVisited"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"hyper3dWorkspaceVisitedAt"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"token"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"user_uuid"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"BASE_URL"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('"CURRENT_ROLE"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain('get("bypass")==="true"');
    expect(WORKSPACE_BOUNCE_SCRIPT).toContain(
      'location.replace("/workspace"+location.search+location.hash)',
    );
  });
});

/* --------------------------------------------------------- the @graph */

describe("t68 homepage @graph — the reference's node fields", () => {
  const graph = homeGraph()["@graph"] as Record<string, unknown>[];

  it("keeps the six nodes", () => {
    expect(graph.map((n) => n["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "WebApplication",
      "ImageObject",
      "BreadcrumbList",
    ]);
  });

  it("the WebSite node lists the 12 serving locales (en + the 11 localized trees)", () => {
    const site = graph.find((n) => n["@type"] === "WebSite") as Record<string, unknown>;
    const langs = site.inLanguage as string[];
    expect(langs).toHaveLength(12);
    expect(langs[0]).toBe("en");
    for (const code of LOCALE_CODES) {
      expect(langs).toContain(code === "pt" ? "pt-BR" : code);
    }
  });

  it("the WebApplication featureList matches what this clone's exporters really write", () => {
    const app = graph.find((n) => n["@type"] === "WebApplication") as Record<
      string,
      unknown
    >;
    const list = app.featureList as string;
    for (const format of ["GLB", "GLTF", "FBX", "OBJ", "STL", "USDZ"]) {
      expect(list).toContain(format);
    }
  });
});

/* --------------------------------------------- landing chrome wiring */

function hrefsIn(src: string): string[] {
  return [
    ...src.matchAll(/href:\s*"(\/[^"?#]*)"/g),
    ...src.matchAll(/href="(\/[^"?#]*)"/g),
  ].map((m) => m[1]);
}

describe("t68 landing chrome — every href resolves to a real route", () => {
  const featureSet = new Set(featureSlugs().map((s) => `/features/${s}`));
  const useCaseSet = new Set(USE_CASE_SLUGS.map((s) => `/use-cases/${s}`));

  it("header: every internal href is a real clone route", () => {
    const internal = hrefsIn(headerSrc);
    expect(internal.length).toBeGreaterThan(40);
    for (const href of internal) {
      const ok =
        href === "/" ||
        href === STUDIO_PATH ||
        href === "/pricing" ||
        href === "/blog" ||
        href === "/3d-prompts" ||
        href === "/help" ||
        featureSet.has(href) ||
        useCaseSet.has(href) ||
        (href.startsWith("/styles/") &&
          findStylePage(href.slice("/styles/".length)) !== undefined) ||
        (href.startsWith("/use-cases/") && findUseCasePage(href.slice("/use-cases/".length)) !== undefined) ||
        LOCALE_CODES.includes(href.slice(1) as never);
      expect(ok, `header href ${href}`).toBe(true);
    }
  });

  it("header: the locale picker covers the reference's 12 languages as real routes", () => {
    for (const code of LOCALE_CODES) {
      expect(headerSrc).toContain(`href: "/${code}"`);
    }
    expect(headerSrc).toContain('href: "/"');
  });

  it("footer: every internal href is a real clone route", () => {
    const internal = hrefsIn(footerSrc);
    for (const href of internal) {
      const ok =
        href === "/" ||
        href === STUDIO_PATH ||
        href === "/workspace/omnicraft" ||
        href.startsWith("/workspace/omnicraft/") ||
        href.startsWith("/features/") ||
        href.startsWith("/legal/") ||
        href === "/tools/viewer" ||
        href === "/tools/converter" ||
        LOCALE_CODES.includes(href.slice(1) as never);
      expect(ok, `footer href ${href}`).toBe(true);
    }
    // the tools column's two /tools links really exist in the tools registry
    expect(read("../../src/lib/tools-registry.ts") + read("../../src/lib/tools-content.ts")).toContain(
      '"/tools/viewer"',
    );
  });

  it("footer: the five reference columns keep their real link counts", () => {
    expect(footerSrc.match(/label: "ChatAvatar"/g)?.length).toBe(1);
    for (const label of ["Text to 3D", "Image to 3D", "API", "HDRI Generator", "Model Viewer", "Format Converter", "Blender", "Terms of Use"]) {
      expect(footerSrc).toContain(`label: "${label}"`);
    }
    expect(footerSrc).toContain("© 2026 Hyper3D Clone");
  });

  it("marketing body: feature and control cards deep-link to real pages", () => {
    const internal = hrefsIn(marketingSrc);
    expect(internal).toContain("/features/image-to-3d");
    expect(internal).toContain("/features/text-to-3d");
    expect(internal).toContain("/features/chatavatar");
    expect(internal).toContain("/features/omnicraft/ai-texture-generator");
    expect(internal).toContain("/workspace/omnicraft");
    expect(internal).toContain("/help/articles/use-bang-and-partial-edit");
    expect(internal).toContain("/help/articles/control-topology-polycount-and-lods");
    expect(internal).toContain("/help/articles/how-to-get-hyper3d-enterprise-support");
    expect(internal).toContain("/features/api");
    // studio links flow through the STUDIO_PATH constant in JSX braces
    expect(marketingSrc).toContain("href={STUDIO_PATH}");
    for (const href of internal) {
      if (href.startsWith("/help/")) {
        expect(HELP_ROUTES.includes(href), `help href ${href}`).toBe(true);
      }
    }
  });

  it("marketing body: the trust row carries the reference's 17 partner names", () => {
    for (const name of ["Acer", "Bambu", "ComfyUI", "Deepmind", "Fal", "Lovart", "Meta", "MIT", "NetEase", "NVIDIA", "PICO XR", "Replicate", "Rokid", "Shutterstock", "Supercell", "Tencent", "UCB"]) {
      expect(marketingSrc).toContain(`"${name}"`);
    }
  });

  it("marketing body: honest enterprise treatment — reference-only, linked to the article", () => {
    expect(marketingSrc).toContain("None of that machinery exists");
    expect(marketingSrc).toContain("Reference-only — not in this clone.");
  });

  it("demo card: interactive effort tiers reuse the real EFFORTS table, GENERATE enters the studio", () => {
    expect(demoCardSrc).toContain("EFFORTS");
    expect(demoCardSrc).toContain("GEN_VERSION");
    expect(demoCardSrc).toContain('href={STUDIO_PATH}');
    expect(demoCardSrc).toContain("Free Preview");
    expect(demoCardSrc).toContain("redos are free");
  });
});
