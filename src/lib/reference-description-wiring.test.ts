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
import { referenceDescription } from "./reference-descriptions";

/**
 * t76 wiring: every family route's generateMetadata prefers the
 * registry's byte-faithful reference description (meta + og + twitter)
 * over its honest template, and serves it full-length — never the
 * 180-char slice the templates use. One representative per family + the
 * locale catch-all that carries the whole localized tree. The registry
 * census itself is pinned in reference-descriptions.test.ts; these
 * tests pin that the routes actually SERVE the pinned strings.
 */

function descriptionOf(m: { description?: unknown }): string {
  return m.description as string;
}

function ogDescriptionOf(m: { openGraph?: unknown }): string {
  return (m.openGraph as { description?: string }).description as string;
}

function twitterDescriptionOf(m: { twitter?: unknown }): string {
  return (m.twitter as { description?: string }).description as string;
}

describe("static family routes serve the pinned reference description", () => {
  it("/pricing", () => {
    expect(descriptionOf(pricingMetadata)).toBe(referenceDescription("/pricing"));
    expect(ogDescriptionOf(pricingMetadata)).toBe(referenceDescription("/pricing"));
    expect(twitterDescriptionOf(pricingMetadata)).toBe(
      referenceDescription("/pricing"),
    );
  });
  it("/3d-prompts", () => {
    expect(descriptionOf(promptsMetadata)).toBe(
      referenceDescription("/3d-prompts"),
    );
  });
  it("/help", () => {
    expect(descriptionOf(helpMetadata)).toBe(referenceDescription("/help"));
  });
  it("/features", () => {
    expect(descriptionOf(featuresMetadata)).toBe(
      referenceDescription("/features"),
    );
  });
  it("/tools (served, not sitemapped)", () => {
    expect(descriptionOf(toolsMetadata)).toBe(referenceDescription("/tools"));
    expect(ogDescriptionOf(toolsMetadata)).toBe(referenceDescription("/tools"));
  });
  it("/use-cases", () => {
    expect(descriptionOf(useCasesMetadata)).toBe(
      referenceDescription("/use-cases"),
    );
  });
  it("/styles", () => {
    expect(descriptionOf(stylesMetadata)).toBe(referenceDescription("/styles"));
  });
  it("/legal", () => {
    expect(descriptionOf(legalMetadata)).toBe(referenceDescription("/legal"));
  });
  it("/blog", () => {
    expect(descriptionOf(blogMetadata)).toBe(referenceDescription("/blog"));
  });
});

describe("dynamic family routes serve the pinned reference description", () => {
  it("a written blog article", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "why-did-my-hyper3d-generation-fail" }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription("/blog/why-did-my-hyper3d-generation-fail"),
    );
    expect(ogDescriptionOf(m)).toBe(
      referenceDescription("/blog/why-did-my-hyper3d-generation-fail"),
    );
  });
  it("a not-written blog route keeps the reference's real description, body stays honest", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "zbrush-alternative" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/blog/zbrush-alternative"));
  });
  it("/features/ai-image-generator", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["ai-image-generator"] }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription("/features/ai-image-generator"),
    );
    expect(ogDescriptionOf(m)).toBe(
      referenceDescription("/features/ai-image-generator"),
    );
  });
  it("/features/text-to-3d", async () => {
    const m = await featurePageMetadata({
      params: Promise.resolve({ slug: ["text-to-3d"] }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/features/text-to-3d"));
  });
  it("/help/articles/[slug] — including the reference's mid-word truncation", async () => {
    const m = await helpArticleMetadata({
      params: Promise.resolve({
        slug: "are-credits-deducted-when-a-generation-fails",
      }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription(
        "/help/articles/are-credits-deducted-when-a-generation-fails",
      ),
    );
  });
  it("/help/[category]", async () => {
    const m = await helpCategoryMetadata({
      params: Promise.resolve({ category: "billing" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/help/billing"));
  });
  it("/tools/converter (the matrix index)", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter"] }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/tools/converter"));
  });
  it("/tools/converter/3ds/to/dae", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter", "3ds", "to", "dae"] }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription("/tools/converter/3ds/to/dae"),
    );
    expect(ogDescriptionOf(m)).toBe(
      referenceDescription("/tools/converter/3ds/to/dae"),
    );
  });
  it("/tools/viewer/stp", async () => {
    const m = await toolPageMetadata({
      params: Promise.resolve({ slug: ["viewer", "stp"] }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/tools/viewer/stp"));
  });
  it("/use-cases/3d-printing", async () => {
    const m = await useCaseMetadata({
      params: Promise.resolve({ slug: "3d-printing" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/use-cases/3d-printing"));
  });
  it("/styles/anime", async () => {
    const m = await stylePageMetadata({
      params: Promise.resolve({ slug: "anime" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/styles/anime"));
  });
  it("/legal/privacy", async () => {
    const m = await legalDocMetadata({
      params: Promise.resolve({ slug: "privacy" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/legal/privacy"));
  });
  it("/sub-categories/roblox", async () => {
    const m = await subCategoryMetadata({
      params: Promise.resolve({ slug: "roblox" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/sub-categories/roblox"));
  });
  it("/switch/makerworld — en-dash range pinned byte-for-byte", async () => {
    const m = await switchPageMetadata({
      params: Promise.resolve({ slug: "makerworld" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/switch/makerworld"));
    expect(descriptionOf(m)).toContain("11–50: 3 months free");
  });
  it("/event/chroma-awards", async () => {
    const m = await eventPageMetadata({
      params: Promise.resolve({ slug: "chroma-awards" }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/event/chroma-awards"));
  });
});

describe("the locale catch-all serves pinned descriptions, full-length", () => {
  it("/zh home", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: undefined }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/zh"));
    expect(ogDescriptionOf(m)).toBe(referenceDescription("/zh"));
    expect(twitterDescriptionOf(m)).toBe(referenceDescription("/zh"));
  });
  it("/zh/help", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["help"] }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/zh/help"));
  });
  it("/de/tools — the served-not-sitemapped extension", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "de", slug: ["tools"] }),
    });
    expect(descriptionOf(m)).toBe(referenceDescription("/de/tools"));
  });
  it("/zh/tools/converter/3ds/to/dae", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["tools", "converter", "3ds", "to", "dae"],
      }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription("/zh/tools/converter/3ds/to/dae"),
    );
  });
  it("/ja/blog/3d-animation-pipeline-ja — article card keeps the description", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "ja",
        slug: ["blog", "3d-animation-pipeline-ja"],
      }),
    });
    expect((m.openGraph as { type?: string }).type).toBe("article");
    expect(descriptionOf(m)).toBe(
      referenceDescription("/ja/blog/3d-animation-pipeline-ja"),
    );
  });
  it("/zh/use-cases/3d-printing", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["use-cases", "3d-printing"],
      }),
    });
    expect(descriptionOf(m)).toBe(
      referenceDescription("/zh/use-cases/3d-printing"),
    );
  });
  it("/fr/styles/voxel — a 296-char description served full-length, never sliced", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "fr", slug: ["styles", "voxel"] }),
    });
    const pinned = referenceDescription("/fr/styles/voxel") as string;
    expect(pinned.length).toBe(296);
    expect(descriptionOf(m)).toBe(pinned);
    expect(ogDescriptionOf(m)).toBe(pinned);
  });
  it("unknown locale falls back to the not-found title with no description", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "xx", slug: ["help"] }),
    });
    expect((m as { title?: string }).title).toBe("Page not found");
  });
});

describe("uncensused deep routes keep their honest template descriptions (t76 boundary)", () => {
  it("the prompt library's pagination and deep details are not in the registry", () => {
    expect(referenceDescription("/3d-prompts/2")).toBeUndefined();
    expect(referenceDescription("/3d-prompts/a-cinematic-hoverbike")).toBeUndefined();
    expect(referenceDescription("/blog/page/2")).toBeUndefined();
    expect(referenceDescription("/zh/sub-categories/beyond-its-own-sitemap-list"))
      .toBeUndefined();
  });

  it("a deep locale route falls back to the localized template copy", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["3d-prompts", "2"] }),
    });
    const template = descriptionOf(m);
    expect(template).toBeDefined();
    expect(template).not.toBe(referenceDescription("/zh/3d-prompts/2"));
    // the template keeps the clone's 180-char slice convention
    expect(template.length).toBeLessThanOrEqual(180);
  });
});
