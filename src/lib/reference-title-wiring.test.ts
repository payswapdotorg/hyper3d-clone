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
import { referenceCardTitle, referenceTitle } from "./reference-titles";

/**
 * t75 wiring: every family route's generateMetadata prefers the registry's
 * byte-faithful reference title (and card title) over its honest template.
 * One representative per family + the locale catch-all that carries the
 * whole localized tree. The registry census itself is pinned in
 * reference-titles.test.ts; these tests pin that the routes actually SERVE
 * the pinned strings.
 */

function titleOf(m: { title?: unknown }): string {
  return m.title as string;
}

describe("static family routes serve the pinned reference <title>", () => {
  it("/pricing", () => {
    expect(titleOf(pricingMetadata)).toBe(referenceTitle("/pricing"));
  });
  it("/3d-prompts", () => {
    expect(titleOf(promptsMetadata)).toBe(referenceTitle("/3d-prompts"));
  });
  it("/help", () => {
    expect(titleOf(helpMetadata)).toBe(referenceTitle("/help"));
  });
  it("/features", () => {
    expect(titleOf(featuresMetadata)).toBe(referenceTitle("/features"));
  });
  it("/tools (served, not sitemapped)", () => {
    expect(titleOf(toolsMetadata)).toBe(referenceTitle("/tools"));
  });
  it("/use-cases", () => {
    expect(titleOf(useCasesMetadata)).toBe(referenceTitle("/use-cases"));
  });
  it("/styles", () => {
    expect(titleOf(stylesMetadata)).toBe(referenceTitle("/styles"));
  });
  it("/legal", () => {
    expect(titleOf(legalMetadata)).toBe(referenceTitle("/legal"));
  });
  it("/blog", () => {
    expect(titleOf(blogMetadata)).toBe(referenceTitle("/blog"));
  });
});

describe("dynamic family routes serve the pinned reference <title>", () => {
  it("a written blog article", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "why-did-my-hyper3d-generation-fail" }),
    });
    expect(titleOf(m)).toBe(
      referenceTitle("/blog/why-did-my-hyper3d-generation-fail"),
    );
  });
  it("a not-written blog route keeps the reference's real title, body stays honest", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "zbrush-alternative" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/blog/zbrush-alternative"));
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/blog/zbrush-alternative"),
    );
  });
  it("/features/ai-image-generator", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["ai-image-generator"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/features/ai-image-generator"));
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/features/ai-image-generator"),
    );
  });
  it("/features/text-to-3d", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["text-to-3d"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/features/text-to-3d"));
  });
  it("/help/articles/[slug]", async () => {
    const m = await helpArticleMetadata({
      params: Promise.resolve({
        slug: "are-credits-deducted-when-a-generation-fails",
      }),
    });
    expect(titleOf(m)).toBe(
      referenceTitle("/help/articles/are-credits-deducted-when-a-generation-fails"),
    );
  });
  it("/help/[category]", async () => {
    const m = await helpCategoryMetadata({
      params: Promise.resolve({ category: "billing" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/help/billing"));
  });
  it("/tools/converter (the matrix index)", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/tools/converter"));
  });
  it("/tools/converter/3ds/to/dae", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter", "3ds", "to", "dae"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/tools/converter/3ds/to/dae"));
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/tools/converter/3ds/to/dae"),
    );
  });
  it("/tools/viewer/stp", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["viewer", "stp"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/tools/viewer/stp"));
  });
  it("/use-cases/3d-printing", async () => {
    const m = await useCaseMetadata({
      params: Promise.resolve({ slug: "3d-printing" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/use-cases/3d-printing"));
  });
  it("/styles/anime", async () => {
    const m = await stylePageMetadata({
      params: Promise.resolve({ slug: "anime" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/styles/anime"));
  });
  it("/legal/privacy", async () => {
    const m = await legalDocMetadata({
      params: Promise.resolve({ slug: "privacy" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/legal/privacy"));
  });
  it("/sub-categories/roblox", async () => {
    const m = await subCategoryMetadata({
      params: Promise.resolve({ slug: "roblox" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/sub-categories/roblox"));
  });
  it("/switch/makerworld", async () => {
    const m = await switchPageMetadata({
      params: Promise.resolve({ slug: "makerworld" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/switch/makerworld"));
  });
  it("/event/chroma-awards", async () => {
    const m = await eventPageMetadata({
      params: Promise.resolve({ slug: "chroma-awards" }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/event/chroma-awards"));
  });
});

describe("the locale catch-all serves pinned titles + full preview cards", () => {
  it("/zh home — brand-first, no suffix, card title passes through", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: undefined }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/zh"));
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/zh"),
    );
  });
  it("/zh/help", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["help"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/zh/help"));
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/zh/help"),
    );
  });
  it("/de/tools — the served-not-sitemapped extension", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "de", slug: ["tools"] }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/de/tools"));
  });
  it("/zh/tools/converter/3ds/to/dae", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["tools", "converter", "3ds", "to", "dae"],
      }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/zh/tools/converter/3ds/to/dae"));
  });
  it("/ja/blog/3d-animation-pipeline-ja — article type card", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "ja",
        slug: ["blog", "3d-animation-pipeline-ja"],
      }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/ja/blog/3d-animation-pipeline-ja"));
    expect((m.openGraph as { type?: string }).type).toBe("article");
    expect((m.openGraph as { title?: string }).title).toBe(
      referenceCardTitle("/ja/blog/3d-animation-pipeline-ja"),
    );
  });
  it("/zh/use-cases/3d-printing", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["use-cases", "3d-printing"],
      }),
    });
    expect(titleOf(m)).toBe(referenceTitle("/zh/use-cases/3d-printing"));
  });
  it("unknown locale falls back to the not-found title", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "xx", slug: ["help"] }),
    });
    expect(titleOf(m)).toBe("Page not found");
  });
});
