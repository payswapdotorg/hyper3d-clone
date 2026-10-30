import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPORT_FORMATS } from "./exporters";
import { INITIAL_BALANCE, STANDARD_COST, AGENTIC_COST } from "./credits";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { featureSlugs } from "./features";
import {
  REFERENCE_CONVERTER_PAIRS,
  REFERENCE_IMAGE_TO_FORMATS,
  REFERENCE_VIEWER_FORMATS,
  CONVERTER_PAIR_ROUTES,
  IMAGE_TO_ROUTES,
  VIEWER_ROUTES,
  TOOLS_ROUTES,
  converterCensus,
  converterPairStatus,
  viewerFormatStatus,
  imageToStatus,
} from "./tools-registry";
import { REAL_EXPORT_FORMATS, REAL_FORMAT_LIST } from "./tool-formats";
import {
  buildConverterPairPage,
  buildImageToPage,
  buildViewerPage,
} from "./tools-content";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The clone's genuinely live OmniCraft tool routes. */
const LIVE_TOOL_ROUTES = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
  (t) => `/omnicraft/${t.slug}`,
);

const REAL_FEATURE_SLUGS = new Set(featureSlugs());
const KNOWN_SINGLETONS = new Set(["/", "/features", "/omnicraft", "/tools/converter"]);

function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (KNOWN_SINGLETONS.has(base)) return true;
  if (base.startsWith("/omnicraft/")) return LIVE_TOOL_ROUTES.includes(base);
  if (base.startsWith("/features/")) {
    return REAL_FEATURE_SLUGS.has(base.slice("/features/".length));
  }
  if (base.startsWith("/tools/")) return TOOLS_ROUTES.includes(base);
  return false;
}

/** Every href a page def carries. */
function allHrefs(page: ReturnType<typeof buildConverterPairPage>): string[] {
  const hrefs: string[] = [];
  const push = (h?: { href: string }) => {
    if (h) hrefs.push(h.href);
  };
  push(page.cta);
  push(page.ctaSecondary);
  push(page.closingCta);
  for (const link of page.crossLinks) hrefs.push(link.href);
  for (const section of page.sections) {
    for (const link of section.links ?? []) hrefs.push(link.href);
  }
  return hrefs;
}

/** Flatten a page's text for content assertions. */
function pageText(page: ReturnType<typeof buildConverterPairPage>): string {
  return [
    page.title,
    page.description,
    page.subline,
    page.statusPanel.summary,
    ...page.statusPanel.works,
    ...page.statusPanel.limits,
    ...page.sections.flatMap((s) => [
      s.intro ?? "",
      ...(s.steps ?? []).flatMap((st) => [st.title, st.body]),
      ...(s.cards ?? []).flatMap((c) => [c.title, c.body]),
    ]),
    ...page.faq.flatMap((f) => [f.q, f.a]),
    page.closingBody,
  ].join("\n");
}

describe("tools registry — reference parity", () => {
  it("covers exactly the reference's 203 tools routes (1+178+8+1+15)", () => {
    expect(REFERENCE_CONVERTER_PAIRS).toHaveLength(178);
    expect(new Set(REFERENCE_CONVERTER_PAIRS.map((p) => p.join("/"))).size).toBe(178);
    expect(REFERENCE_IMAGE_TO_FORMATS).toHaveLength(8);
    expect(REFERENCE_VIEWER_FORMATS).toHaveLength(15);
    expect(CONVERTER_PAIR_ROUTES).toHaveLength(178);
    expect(IMAGE_TO_ROUTES).toHaveLength(8);
    expect(VIEWER_ROUTES).toHaveLength(16);
    expect(TOOLS_ROUTES).toHaveLength(203);
    expect(new Set(TOOLS_ROUTES).size).toBe(203);
  });

  it("the census is computed, not hand-written: 24 real / 46 generative / 108 not-here", () => {
    expect(converterCensus()).toEqual({
      "task-export": 24,
      generative: 46,
      "not-here": 108,
    });
  });

  it("statuses derive from the real exporter set — spot checks", () => {
    // both sides real → task-export
    expect(converterPairStatus("glb", "fbx")).toBe("task-export");
    expect(converterPairStatus("obj", "usdz")).toBe("task-export");
    expect(converterPairStatus("stl", "glb")).toBe("task-export");
    // image in, real out → generative
    expect(converterPairStatus("png", "obj")).toBe("generative");
    expect(converterPairStatus("svg", "glb")).toBe("generative");
    // everything else → not-here
    expect(converterPairStatus("3ds", "dae")).toBe("not-here");
    expect(converterPairStatus("glb", "dae")).toBe("not-here");
    expect(converterPairStatus("png", "webp")).toBe("not-here");
    expect(converterPairStatus("step", "stl")).toBe("not-here");
    // the registry never invents pairs outside the reference list
    expect(
      REFERENCE_CONVERTER_PAIRS.some(([f, t]) => f === "glb" && t === "ply"),
    ).toBe(false);
  });

  it("viewer and image-to statuses: only GLB/GLTF and the six real formats", () => {
    for (const f of REFERENCE_VIEWER_FORMATS) {
      expect(viewerFormatStatus(f)).toBe(f === "glb" || f === "gltf" ? "live" : "not-here");
    }
    for (const f of REFERENCE_IMAGE_TO_FORMATS) {
      expect(imageToStatus(f)).toBe(EXPORT_FORMATS.includes(f as never) ? "live" : "not-here");
    }
    expect(REAL_EXPORT_FORMATS).toEqual([...EXPORT_FORMATS]);
  });
});

describe("tools content — the honesty contract (all 201 leaf pages)", () => {
  const pairPages = REFERENCE_CONVERTER_PAIRS.map(([f, t]) => ({
    from: f,
    to: t,
    page: buildConverterPairPage(f, t),
  }));
  const viewerPages = REFERENCE_VIEWER_FORMATS.map((f) => buildViewerPage(f));
  const imageToPages = REFERENCE_IMAGE_TO_FORMATS.map((f) => buildImageToPage(f));
  const allPages = [...pairPages.map((p) => p.page), ...viewerPages, ...imageToPages];

  it("every page has the full anatomy", () => {
    for (const page of allPages) {
      expect(page.title.length).toBeGreaterThan(8);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.description.length).toBeLessThanOrEqual(180);
      expect(page.subline.length).toBeGreaterThan(40);
      expect(page.statusPanel.works.length).toBeGreaterThanOrEqual(3);
      expect(page.statusPanel.limits.length).toBeGreaterThanOrEqual(3);
      expect(page.sections.length).toBeGreaterThanOrEqual(1);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.crossLinks.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("task-export pages never claim arbitrary upload and always say 'generated tasks'", () => {
    for (const { page } of pairPages.filter((p) => p.page.status === "task-export")) {
      const text = pageText(page);
      expect(text, page.route).toContain("generated tasks");
      expect(text, page.route).toMatch(/task-based/i);
      expect(text, page.route).toMatch(/No arbitrary .* upload|not an arbitrary/i);
      expect(text, page.route).toContain("nothing extra");
      expect(text, page.route).not.toMatch(/drag (a |your )?(file|model) (in|into)/i);
      expect(text, page.route).not.toMatch(/upload your .* file/i);
    }
  });

  it("generative pages always say generation, not conversion, with the real credit numbers", () => {
    // svg→glb is the one legitimate exception: a genuine local conversion
    // via the live Vector to 3D tool (its own dedicated test covers it).
    for (const { from, to, page } of pairPages.filter(
      (p) => p.page.status === "generative" && !(p.from === "svg" && p.to === "glb"),
    )) {
      void from;
      void to;
      const text = pageText(page);
      expect(text, page.route).toMatch(/generation, not conversion|not a conversion/i);
      if (/credit/i.test(text)) {
        expect(text, page.route).toContain(`${INITIAL_BALANCE}`);
        expect(text, page.route).toContain(`${STANDARD_COST} credit`);
        expect(text, page.route).toContain(`${AGENTIC_COST}`);
      }
    }
  });

  it("the svg→glb page names the genuinely local Vector to 3D tool", () => {
    const page = buildConverterPairPage("svg", "glb");
    const text = pageText(page);
    expect(text).toContain("Vector to 3D");
    expect(text).toMatch(/locally|in your browser/i);
    expect(page.cta.href).toBe("/omnicraft/vector");
  });

  it("not-here pages open with the honest reason and never describe a running conversion", () => {
    for (const { page } of pairPages.filter((p) => p.page.status === "not-here")) {
      const text = pageText(page);
      expect(text, page.route).toMatch(/does not exist|not among them|No arbitrary|There is no|is not an input|cannot enter/i);
      expect(text, page.route).not.toMatch(/converts .*(in your browser|locally) after upload/i);
      expect(text, page.route).not.toMatch(/drag (a |your )?(file|model) (in|into)/i);
    }
  });

  it("format claims resolve against the real exporter set — nothing invented", () => {
    // the real enumeration is DERIVED from EXPORT_FORMATS and must match
    const names: Record<string, string> = {
      glb: "GLB",
      gltf: "glTF",
      fbx: "FBX",
      obj: "OBJ",
      stl: "STL",
      usdz: "USDZ",
    };
    const derived = EXPORT_FORMATS.map((f) => names[f] ?? f.toUpperCase());
    const derivedList =
      derived.slice(0, -1).join(", ") + " and " + derived[derived.length - 1];
    expect(REAL_FORMAT_LIST).toBe(derivedList);
    expect(REAL_FORMAT_LIST).toBe("GLB, glTF, FBX, OBJ, STL and USDZ");

    // formats that appear NOWHERE in the reference tree must appear nowhere
    // in the copy — the clone invents no formats
    const fakeFormats = ["RBXM", "RBXL", "ABC", "MD2", "WRL", "X3D", "AMF", "3DXML"];
    for (const page of allPages) {
      const text = pageText(page);
      for (const fake of fakeFormats) {
        expect(text.includes(fake), `${page.route}: ${fake}`).toBe(false);
      }
      // every explicit "export(s) as/in X" target is a real format name
      const exportTargets = text.match(/exports? (?:as|in|to) [A-Z][A-Za-z0-9]{1,7}/g) ?? [];
      for (const m of exportTargets) {
        const token = m.replace(/exports? (?:as|in|to) /, "");
        expect(
          ["GLB", "GLTF", "glTF", "FBX", "OBJ", "STL", "USDZ"].includes(token),
          `${page.route}: ${m}`,
        ).toBe(true);
      }
    }
  });

  it("every href on every page resolves to a real route", () => {
    for (const page of allPages) {
      for (const href of allHrefs(page)) {
        expect(isKnownRoute(href), `${page.route} → ${href}`).toBe(true);
      }
    }
  });

  it("live viewer pages state the local contract: parsed locally, never uploaded", () => {
    for (const page of viewerPages.filter((p) => p.status === "live")) {
      const text = pageText(page);
      expect(text, page.route).toContain("never");
      expect(text, page.route).toMatch(/parsed .*(locally|in your browser)|in your browser/i);
      expect(text, page.route).toContain("GLTF");
      expect(page.cta.href).toBe("/omnicraft/viewer");
    }
    for (const page of viewerPages.filter((p) => p.status === "not-here")) {
      const text = pageText(page);
      expect(text, page.route).toMatch(/GLB and GLTF only|GLB\/GLTF only|parses GLB\/GLTF only/i);
      if (/CAD/i.test(text)) {
        expect(text, page.route).toMatch(/no CAD support/i);
      }
    }
  });

  it("image-to pages: the six real ones generative-honest, the two absent ones blunt", () => {
    const live = imageToPages.filter((p) => p.status === "live");
    expect(live.map((p) => p.route).sort()).toEqual(
      ["/tools/image-to-fbx", "/tools/image-to-glb", "/tools/image-to-gltf", "/tools/image-to-obj", "/tools/image-to-stl", "/tools/image-to-usdz"].sort(),
    );
    for (const page of live) {
      const text = pageText(page);
      expect(text, page.route).toMatch(/generation, not (a )?conversion|It is generation/i);
      expect(text, page.route).toContain(`${STANDARD_COST} credit`);
    }
    const absent = imageToPages.filter((p) => p.status === "not-here");
    expect(absent.map((p) => p.route).sort()).toEqual(
      ["/tools/image-to-3mf", "/tools/image-to-dxf"].sort(),
    );
    for (const page of absent) {
      const text = pageText(page);
      expect(text, page.route).toMatch(/not among the six real export formats|no CAD support/i);
    }
  });

  it("credit numbers, where stated anywhere, match the real metering", () => {
    for (const page of allPages) {
      const text = pageText(page);
      if (/credits?\b/i.test(text) && /50|start/i.test(text)) {
        expect(text, page.route).toContain(`${INITIAL_BALANCE}`);
      }
      if (/1 credit/i.test(text)) {
        expect(text, page.route).toMatch(/10|agentic/i);
      }
    }
  });
});

describe("tools wiring — sitemap, routes", () => {
  it("public/sitemap.xml lists all 203 tools routes with absolute URLs (7070 total)", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    for (const route of TOOLS_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    expect(xml.match(/<url>/g)?.length).toBe(7070); // 1095 EN + 5975 localized (t66)
  });

  it("the catch-all route sources every param from the registries, not literals", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "tools", "[...slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("REFERENCE_CONVERTER_PAIRS");
    expect(route).toContain("REFERENCE_IMAGE_TO_FORMATS");
    expect(route).toContain("REFERENCE_VIEWER_FORMATS");
    expect(route).toContain("notFound()");
    expect(route).toContain("generateStaticParams");
    // no literal pair/format slugs smuggled into the route file
    for (const slug of ["3ds", "makerworld", "chroma"]) {
      expect(route.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("tools routes cannot collide with other trees", () => {
    const others = ["/features", "/legal", "/omnicraft", "/use-cases", "/styles", "/help", "/pricing", "/3d-prompts", "/switch", "/event", "/sub-categories"];
    for (const route of TOOLS_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });

  it("bare /tools is not a page (the reference's sitemap ships no /tools index)", () => {
    expect(TOOLS_ROUTES).not.toContain("/tools");
    const files = readFileSync(
      join(process.cwd(), "src", "app", "tools", "[...slug]", "page.tsx"),
      "utf8",
    );
    expect(files).not.toContain('slug.length === 0');
  });
});
