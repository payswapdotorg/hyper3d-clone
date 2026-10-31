import { describe, expect, it } from "vitest";

import { metadata as pricingMetadata } from "@/app/pricing/page";
import { metadata as promptsMetadata } from "@/app/3d-prompts/page";
import { metadata as helpMetadata } from "@/app/help/page";
import { metadata as featuresMetadata } from "@/app/features/page";
import { metadata as toolsMetadata } from "@/app/tools/page";
import { metadata as useCasesMetadata } from "@/app/use-cases/page";
import { metadata as stylesMetadata } from "@/app/styles/page";
import { metadata as legalMetadata } from "@/app/legal/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { generateMetadata as blogArticleMetadata } from "@/app/blog/[slug]/page";
import { generateMetadata as featurePageMetadata } from "@/app/features/[...slug]/page";
import { generateMetadata as helpArticleMetadata } from "@/app/help/articles/[slug]/page";
import { generateMetadata as helpCategoryMetadata } from "@/app/help/[category]/page";
import { generateMetadata as toolPageMetadata } from "@/app/tools/[...slug]/page";
import { generateMetadata as useCaseMetadata } from "@/app/use-cases/[slug]/page";
import { generateMetadata as stylePageMetadata } from "@/app/styles/[slug]/page";
import { generateMetadata as legalDocMetadata } from "@/app/legal/[slug]/page";
import { generateMetadata as subCategoryMetadata } from "@/app/sub-categories/[slug]/page";
import { generateMetadata as switchPageMetadata } from "@/app/switch/[slug]/page";
import { generateMetadata as eventPageMetadata } from "@/app/event/[slug]/page";
import { generateMetadata as localePageMetadata } from "@/app/[locale]/[[...slug]]/page";
import { referenceOgImage } from "./reference-og-images";
import { referenceCardTitle } from "./reference-titles";
import { OG_BANNER_FALLBACK_URL } from "./schema-org";

/**
 * t77 wiring: every family route's generateMetadata prefers the
 * registry's byte-faithful reference og:image (og:image AND
 * twitter:image — the reference serves the same URL on both, 0
 * mismatches in the probe) with the card title as og:image:alt (the
 * reference's own alt rule, verified on the full census). Routes
 * outside the census keep the honest fallback banner. The registry
 * census itself is pinned in reference-og-images.test.ts; these tests
 * pin that the routes actually SERVE the pinned images.
 */

function ogImageOf(m: {
  openGraph?: unknown;
}): { url: string; alt: string } | undefined {
  const og = m.openGraph as { images?: { url: string; alt: string }[] };
  return og?.images?.[0];
}

function twitterImageOf(m: {
  twitter?: unknown;
}): { url: string; alt: string } | undefined {
  const tw = m.twitter as { images?: { url: string; alt: string }[] };
  return tw?.images?.[0];
}

function expectServesPinnedImage(
  m: { openGraph?: unknown; twitter?: unknown },
  path: string,
): void {
  const pinned = referenceOgImage(path) as string;
  expect(pinned, `${path} must be censused for this assertion`).toBeDefined();
  const og = ogImageOf(m);
  const tw = twitterImageOf(m);
  expect(og?.url).toBe(pinned);
  expect(tw?.url).toBe(pinned);
  // twitter:image:alt ships (the reference ships it on every page)
  expect(tw?.alt).toBe(og?.alt);
}

describe("static family routes serve the pinned reference og:image", () => {
  it("/pricing — the storage og-banner.png root", () => {
    expectServesPinnedImage(pricingMetadata, "/pricing");
    expect(ogImageOf(pricingMetadata)?.url).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
    expect(ogImageOf(pricingMetadata)?.alt).toBe(
      referenceCardTitle("/pricing"),
    );
  });
  it("/3d-prompts — the webp banner root", () => {
    expectServesPinnedImage(promptsMetadata, "/3d-prompts");
    expect(ogImageOf(promptsMetadata)?.alt).toBe("Free 3D Prompts & Examples");
  });
  it("/help — the link-guide.svg", () => {
    expectServesPinnedImage(helpMetadata, "/help");
    expect(ogImageOf(helpMetadata)?.url).toBe(
      "https://storage.deemos.dev/help/link-guide.svg",
    );
    expect(ogImageOf(helpMetadata)?.alt).toBe("Help Center");
  });
  it("/features", () => {
    expectServesPinnedImage(featuresMetadata, "/features");
  });
  it("/tools (served, not sitemapped)", () => {
    expectServesPinnedImage(toolsMetadata, "/tools");
    expect(ogImageOf(toolsMetadata)?.url).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
  });
  it("/use-cases", () => {
    expectServesPinnedImage(useCasesMetadata, "/use-cases");
  });
  it("/styles", () => {
    expectServesPinnedImage(stylesMetadata, "/styles");
  });
  it("/legal", () => {
    expectServesPinnedImage(legalMetadata, "/legal");
  });
  it("/blog", () => {
    expectServesPinnedImage(blogMetadata, "/blog");
    expect(ogImageOf(blogMetadata)?.url).toBe(
      "https://hyper3d.ai/assets/og-banner.webp",
    );
  });
});

describe("dynamic family routes serve the pinned reference og:image", () => {
  it("a written blog article serves its own CDN art", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "why-did-my-hyper3d-generation-fail" }),
    });
    expectServesPinnedImage(m, "/blog/why-did-my-hyper3d-generation-fail");
  });
  it("a not-written blog route still serves the reference's pinned image", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "zbrush-alternative" }),
    });
    expectServesPinnedImage(m, "/blog/zbrush-alternative");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/blog/blog_84_zbrush-alternative.md.png",
    );
    expect(ogImageOf(m)?.alt).toBe(
      "Best ZBrush Alternative? Free AI Sculpting Tools (2026)",
    );
  });
  it("/features/ai-image-generator", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["ai-image-generator"] }),
    });
    expectServesPinnedImage(m, "/features/ai-image-generator");
  });
  it("/features/text-to-3d", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["text-to-3d"] }),
    });
    expectServesPinnedImage(m, "/features/text-to-3d");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/features/text-to-3d/prompt-img-1.avif",
    );
  });
  it("/features/worldgen", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["worldgen"] }),
    });
    expectServesPinnedImage(m, "/features/worldgen");
  });
  it("/help/articles/[slug]", async () => {
    const m = await helpArticleMetadata({
      params: Promise.resolve({
        slug: "are-credits-deducted-when-a-generation-fails",
      }),
    });
    expectServesPinnedImage(
      m,
      "/help/articles/are-credits-deducted-when-a-generation-fails",
    );
    expect(ogImageOf(m)?.alt).toBe(
      "Are Credits Deducted When a Generation Fails",
    );
  });
  it("/help/[category]", async () => {
    const m = await helpCategoryMetadata({
      params: Promise.resolve({ category: "billing" }),
    });
    expectServesPinnedImage(m, "/help/billing");
  });
  it("/tools/converter (the matrix index)", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter"] }),
    });
    expectServesPinnedImage(m, "/tools/converter");
  });
  it("/tools/converter/3ds/to/dae", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter", "3ds", "to", "dae"] }),
    });
    expectServesPinnedImage(m, "/tools/converter/3ds/to/dae");
    expect(ogImageOf(m)?.alt).toBe("Free 3DS to DAE Converter Online");
  });
  it("/tools/viewer/stp", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["viewer", "stp"] }),
    });
    expectServesPinnedImage(m, "/tools/viewer/stp");
  });
  it("/use-cases/3d-printing", async () => {
    const m = await useCaseMetadata({
      params: Promise.resolve({ slug: "3d-printing" }),
    });
    expectServesPinnedImage(m, "/use-cases/3d-printing");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/use-cases/3d-printing/dragon.avif",
    );
  });
  it("/styles/anime", async () => {
    const m = await stylePageMetadata({
      params: Promise.resolve({ slug: "anime" }),
    });
    expectServesPinnedImage(m, "/styles/anime");
  });
  it("/legal/privacy", async () => {
    const m = await legalDocMetadata({
      params: Promise.resolve({ slug: "privacy" }),
    });
    expectServesPinnedImage(m, "/legal/privacy");
  });
  it("/sub-categories/roblox", async () => {
    const m = await subCategoryMetadata({
      params: Promise.resolve({ slug: "roblox" }),
    });
    expectServesPinnedImage(m, "/sub-categories/roblox");
  });
  it("/switch/makerworld", async () => {
    const m = await switchPageMetadata({
      params: Promise.resolve({ slug: "makerworld" }),
    });
    expectServesPinnedImage(m, "/switch/makerworld");
  });
  it("/event/chroma-awards", async () => {
    const m = await eventPageMetadata({
      params: Promise.resolve({ slug: "chroma-awards" }),
    });
    expectServesPinnedImage(m, "/event/chroma-awards");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/event/bg-icon01.webp",
    );
  });
});

describe("the locale catch-all serves pinned og:images", () => {
  it("/zh home — the agentic banner like the reference's own locale landings", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: undefined }),
    });
    expectServesPinnedImage(m, "/zh");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp",
    );
    expect(ogImageOf(m)?.alt).toBe(
      "Hyper3D Rodin - 最佳 AI 3D 模型生成器",
    );
  });
  it("/zh/help — the shared link-guide.svg", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["help"] }),
    });
    expectServesPinnedImage(m, "/zh/help");
  });
  it("/de/tools — the served-not-sitemapped extension", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "de", slug: ["tools"] }),
    });
    expectServesPinnedImage(m, "/de/tools");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/assets/og-banner.png",
    );
  });
  it("/zh/tools/converter/3ds/to/dae — the webp banner, localized alt", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["tools", "converter", "3ds", "to", "dae"],
      }),
    });
    expectServesPinnedImage(m, "/zh/tools/converter/3ds/to/dae");
    expect(ogImageOf(m)?.alt).toBe("免费 3DS 转 DAE 在线转换器");
  });
  it("/zh/use-cases/3d-printing — per-page art shared with the EN original", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["use-cases", "3d-printing"],
      }),
    });
    expectServesPinnedImage(m, "/zh/use-cases/3d-printing");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/use-cases/3d-printing/dragon.avif",
    );
  });
  it("/fr/styles/voxel — per-page art shared with the EN original", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "fr", slug: ["styles", "voxel"] }),
    });
    expectServesPinnedImage(m, "/fr/styles/voxel");
    expect(ogImageOf(m)?.url).toBe(
      "https://storage.deemos.dev/seo-page-main/styles/voxel.webp",
    );
    expect(ogImageOf(m)?.alt).toBe(
      "Générateur IA de modèles 3D voxel style MagicaVoxel",
    );
  });
  it("unknown locale falls back to the not-found title with no image", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "xx", slug: ["help"] }),
    });
    expect((m as { title?: string }).title).toBe("Page not found");
    expect(ogImageOf(m)).toBeUndefined();
  });
});

describe("uncensused deep routes keep the honest fallback banner (t77 boundary)", () => {
  it("the prompt library's pagination and deep details are not in the registry", () => {
    expect(referenceOgImage("/3d-prompts/2")).toBeUndefined();
    expect(referenceOgImage("/3d-prompts/a-cinematic-hoverbike")).toBeUndefined();
    expect(referenceOgImage("/blog/page/2")).toBeUndefined();
    expect(
      referenceOgImage("/zh/sub-categories/beyond-its-own-sitemap-list"),
    ).toBeUndefined();
  });

  it("a deep locale route falls back to the reference's own shared webp banner", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["3d-prompts", "2"] }),
    });
    expect(ogImageOf(m)?.url).toBe(OG_BANNER_FALLBACK_URL);
    expect(twitterImageOf(m)?.url).toBe(OG_BANNER_FALLBACK_URL);
    // the honest fallback still carries an alt (the card title)
    expect(ogImageOf(m)?.alt).toBe(twitterImageOf(m)?.alt);
    expect(ogImageOf(m)?.alt?.length).toBeGreaterThan(0);
  });
});
