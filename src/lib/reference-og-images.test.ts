import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { REFERENCE_DESCRIPTIONS } from "./reference-descriptions";
import { referenceCardTitle, REFERENCE_TITLES } from "./reference-titles";
import {
  REFERENCE_OG_IMAGES,
  referenceOgImage,
} from "./reference-og-images";

/**
 * t77 — the byte-faithful reference og:image registry, pinned.
 *
 * Recon 2026-10-31 (recon/t77/og-image-probe.py): every URL in the
 * t75/t76 census (7,079 URLs) was probed live for its served
 * `<meta property="og:image">`; 7,077 carried one. The probe verified
 * across the full set that twitter:image equals og:image (0
 * mismatches in 7,077), twitter:image:alt equals og:image:alt (0
 * mismatches), every og:image ships an alt, and no page ships
 * og:image:width/height/type — so one pinned URL per page covers the
 * OG and twitter image surfaces at once.
 *
 * The alt itself is NOT pinned: on all 7,077 pages it equals the t75
 * title minus the trailing " | Hyper3D" suffix — exactly
 * referenceCardTitle() — pinned below against the raw probe capture.
 *
 * The registry boundary is exact and pinned both ways below:
 *   registry == description registry (== title registry minus /content-preview)
 * /content-preview is the page the reference serves (HTTP 200) with NO
 * og:image at all; /content-preview/render stays the t75 405 exclusion.
 */

const PROBE = JSON.parse(
  readFileSync(join(process.cwd(), "recon/t77/og-image-probe.json"), "utf-8"),
) as {
  images: Record<string, { image: string; alt?: string }>;
  no_image: string[];
  bad: { url: string; status: number }[];
};

describe("reference-og-images registry (t77)", () => {
  it("pins the full probe census: 7,077 og:images", () => {
    expect(Object.keys(REFERENCE_OG_IMAGES)).toHaveLength(7077);
  });

  it("every key is an absolute internal path", () => {
    for (const key of Object.keys(REFERENCE_OG_IMAGES)) {
      expect(key.startsWith("/")).toBe(true);
      expect(key.includes("//")).toBe(false);
      expect(key === "/" || !key.endsWith("/")).toBe(true);
    }
  });

  it("every pinned URL is an absolute https URL on one of the reference's two image hosts", () => {
    for (const value of Object.values(REFERENCE_OG_IMAGES)) {
      expect(value.startsWith("https://")).toBe(true);
      expect(
        value.startsWith("https://storage.deemos.dev/") ||
          value.startsWith("https://hyper3d.ai/"),
        value,
      ).toBe(true);
    }
  });

  it("registry == description registry exactly (the same 7,077 paths, both ways)", () => {
    const descs = new Set(Object.keys(REFERENCE_DESCRIPTIONS));
    const imgs = new Set(Object.keys(REFERENCE_OG_IMAGES));
    expect(descs.size).toBe(7077);
    expect(imgs.size).toBe(7077);

    const missing = [...descs].filter((p) => !imgs.has(p));
    expect(missing).toEqual([]);
    const extra = [...imgs].filter((p) => !descs.has(p));
    expect(extra).toEqual([]);
  });

  it("the two honest exclusions resolve undefined", () => {
    expect(referenceOgImage("/content-preview")).toBeUndefined();
    expect(referenceOgImage("/content-preview/render")).toBeUndefined();
  });

  it("resolves and misses cleanly", () => {
    expect(referenceOgImage("/definitely-not-a-route")).toBeUndefined();
    expect(referenceOgImage("")).toBeUndefined();
  });

  it("the registry equals the raw probe capture entry-for-entry", () => {
    // the generator wrote the registry from this exact capture — pin
    // that no drift crept in between probe and registry.
    expect(Object.keys(PROBE.images)).toHaveLength(7077);
    expect(PROBE.no_image).toEqual(["/content-preview"]);
    expect(PROBE.bad).toEqual([
      { url: "https://hyper3d.ai/content-preview/render", status: 405 },
    ]);
    for (const [path, rec] of Object.entries(PROBE.images)) {
      expect(REFERENCE_OG_IMAGES[path]).toBe(rec.image);
    }
  });

  it("exactly 797 unique image URLs across the census", () => {
    expect(new Set(Object.values(REFERENCE_OG_IMAGES)).size).toBe(797);
  });

  it("host split pinned: 4,014 storage.deemos.dev pages, 3,063 hyper3d.ai pages", () => {
    let storage = 0;
    let site = 0;
    for (const value of Object.values(REFERENCE_OG_IMAGES)) {
      if (value.startsWith("https://storage.deemos.dev/")) storage += 1;
      else site += 1;
    }
    expect(storage).toBe(4014);
    expect(site).toBe(3063);
  });

  it("the two shared banners, both pinned because both are served", () => {
    const webp = Object.values(REFERENCE_OG_IMAGES).filter(
      (u) => u === "https://hyper3d.ai/assets/og-banner.webp",
    );
    const png = Object.values(REFERENCE_OG_IMAGES).filter(
      (u) => u === "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(webp).toHaveLength(3063);
    expect(png).toHaveLength(60);
  });

  it("the old clone hotlink (hyper3d.ai/assets/og-banner.png) is served by ZERO censused pages", () => {
    expect(
      Object.values(REFERENCE_OG_IMAGES).includes(
        "https://hyper3d.ai/assets/og-banner.png",
      ),
    ).toBe(false);
  });

  it("extension census pinned: webp 547 / png 232 / jpg 9 / avif 8 / svg 1", () => {
    const ext = new Map<string, number>();
    for (const u of new Set(Object.values(REFERENCE_OG_IMAGES))) {
      const m = /(\.[a-z]+)$/.exec(u);
      const e = m ? m[1].slice(1) : "(none)";
      ext.set(e, (ext.get(e) ?? 0) + 1);
    }
    expect(ext.get("webp")).toBe(547);
    expect(ext.get("png")).toBe(232);
    expect(ext.get("jpg")).toBe(9);
    expect(ext.get("avif")).toBe(8);
    expect(ext.get("svg")).toBe(1);
  });

  it("the one svg is the help center's link-guide", () => {
    expect(referenceOgImage("/help")).toBe(
      "https://storage.deemos.dev/help/link-guide.svg",
    );
    expect(referenceOgImage("/ko/help")).toBe(
      "https://storage.deemos.dev/help/link-guide.svg",
    );
  });

  it("locale family root indexes share the storage og-banner.png (60 pages = 5 families × 12 locales)", () => {
    expect(referenceOgImage("/ar/features")).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(referenceOgImage("/de/pricing")).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(referenceOgImage("/ar/styles")).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(referenceOgImage("/ar/tools")).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(referenceOgImage("/ar/use-cases")).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
  });

  it("the deep /tools converter matrix and help articles share the og-banner.webp", () => {
    expect(referenceOgImage("/tools/converter/3ds/to/dae")).toBe(
      "https://hyper3d.ai/assets/og-banner.webp",
    );
    expect(referenceOgImage("/zh/tools/converter/3ds/to/dae")).toBe(
      "https://hyper3d.ai/assets/og-banner.webp",
    );
    expect(
      referenceOgImage(
        "/help/articles/are-credits-deducted-when-a-generation-fails",
      ),
    ).toBe("https://hyper3d.ai/assets/og-banner.webp");
    expect(referenceOgImage("/legal/privacy")).toBe(
      "https://hyper3d.ai/assets/og-banner.webp",
    );
  });
});

describe("the alt invariant — og:image:alt == the card title, full census (t77)", () => {
  it("on every one of the 7,077 censused pages the reference's served alt equals referenceCardTitle(path)", () => {
    let checked = 0;
    for (const [path, rec] of Object.entries(PROBE.images)) {
      const alt = rec.alt ?? "";
      expect(alt.length, `alt missing on ${path}`).toBeGreaterThan(0);
      expect(alt, `alt drift on ${path}`).toBe(referenceCardTitle(path));
      checked += 1;
    }
    expect(checked).toBe(7077);
  });

  it("which is the t75 title minus the ' | Hyper3D' suffix — spot pins", () => {
    // 12 censused titles carry no suffix; their alt equals the title.
    // 7,065 carry it; their alt is the title minus the suffix.
    expect(referenceCardTitle("/")).toBe(
      "Hyper3D Rodin - Best AI 3D Model Generator",
    );
    expect(PROBE.images["/"].alt).toBe(
      "Hyper3D Rodin - Best AI 3D Model Generator",
    );
    expect(REFERENCE_TITLES["/3d-prompts"]).toBe(
      "Free 3D Prompts & Examples | Hyper3D",
    );
    expect(PROBE.images["/3d-prompts"].alt).toBe("Free 3D Prompts & Examples");
    expect(REFERENCE_TITLES["/help"]).toBe("Help Center | Hyper3D");
    expect(PROBE.images["/help"].alt).toBe("Help Center");
  });
});

describe("reference-og-images spot pins — one per family, drift exemplars (t77)", () => {
  it.each([
    [
      "/",
      "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp",
    ],
    ["/pricing", "https://storage.deemos.dev/assets/og-banner.png"],
    ["/help", "https://storage.deemos.dev/help/link-guide.svg"],
    [
      "/features/text-to-3d",
      "https://storage.deemos.dev/features/text-to-3d/prompt-img-1.avif",
    ],
    [
      "/features/ai-image-generator",
      "https://storage.deemos.dev/features/ai-image-generator/intro-bg.avif",
    ],
    [
      "/features/worldgen",
      "https://storage.deemos.dev/features/worldgen/introBg.webp",
    ],
    ["/blog", "https://hyper3d.ai/assets/og-banner.webp"],
    [
      "/blog/zbrush-alternative",
      "https://storage.deemos.dev/blog/blog_84_zbrush-alternative.md.png",
    ],
    [
      "/blog/2d-image-to-3d-model",
      "https://storage.deemos.dev/blog/blog_10_2d-image-to-3d-model.md.png",
    ],
    [
      "/fr/blog/zbrush-alternative-fr",
      "https://storage.deemos.dev/blog/blog_84_zbrush-alternative.md.png",
    ],
    [
      "/use-cases/3d-printing",
      "https://storage.deemos.dev/use-cases/3d-printing/dragon.avif",
    ],
    [
      "/zh/use-cases/3d-printing",
      "https://storage.deemos.dev/use-cases/3d-printing/dragon.avif",
    ],
    [
      "/styles/voxel",
      "https://storage.deemos.dev/seo-page-main/styles/voxel.webp",
    ],
    [
      "/fr/styles/voxel",
      "https://storage.deemos.dev/seo-page-main/styles/voxel.webp",
    ],
    [
      "/styles/anime",
      "https://storage.deemos.dev/seo-page-main/styles/anime.webp",
    ],
    [
      "/zh/styles/anime",
      "https://storage.deemos.dev/seo-page-main/styles/anime.webp",
    ],
    [
      "/event/chroma-awards",
      "https://storage.deemos.dev/event/bg-icon01.webp",
    ],
    ["/tools", "https://storage.deemos.dev/assets/og-banner.png"],
    ["/tools/converter", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/tools/viewer/stp", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/3d-prompts", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/switch", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/switch/makerworld", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/sub-categories/roblox", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/help/features", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/legal/privacy", "https://hyper3d.ai/assets/og-banner.webp"],
    [
      "/help/articles/are-credits-deducted-when-a-generation-fails",
      "https://hyper3d.ai/assets/og-banner.webp",
    ],
    [
      "/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents",
      "https://hyper3d.ai/assets/og-banner.webp",
    ],
    [
      "/ja",
      "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp",
    ],
    ["/zh", "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp"],
    ["/zh/blog", "https://hyper3d.ai/assets/og-banner.webp"],
    ["/ko/help", "https://storage.deemos.dev/help/link-guide.svg"],
  ] as const)("pins %s", (path, image) => {
    expect(REFERENCE_OG_IMAGES[path]).toBe(image);
    expect(referenceOgImage(path)).toBe(image);
  });
});
