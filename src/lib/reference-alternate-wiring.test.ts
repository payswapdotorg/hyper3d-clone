import { describe, expect, it } from "vitest";

import { metadata as homeMetadata } from "@/app/page";
import { metadata as pricingMetadata } from "@/app/pricing/page";
import { metadata as promptsMetadata } from "@/app/3d-prompts/page";
import { metadata as helpMetadata } from "@/app/help/page";
import { metadata as featuresMetadata } from "@/app/features/page";
import { metadata as toolsMetadata } from "@/app/tools/page";
import { metadata as useCasesMetadata } from "@/app/use-cases/page";
import { metadata as stylesMetadata } from "@/app/styles/page";
import { metadata as legalMetadata } from "@/app/legal/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { metadata as switchMetadata } from "@/app/switch/page";
import { metadata as workspaceOmnicraftMetadata } from "@/app/workspace/omnicraft/page";
import { generateMetadata as blogArticleMetadata } from "@/app/blog/[slug]/page";
import { generateMetadata as blogCategoryMetadata } from "@/app/blog/category/[slug]/page";
import { generateMetadata as blogPaginationMetadata } from "@/app/blog/page/[page]/page";
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
import { referenceAlternateLanguages } from "./reference-alternate-languages";

/**
 * t80 wiring: every EN route's metadata serves the reference's own
 * hreflang alternate set for its path — the full 13-link set on family
 * routes, per-article registry subsets on blog articles, en+x-default on
 * the untranslated classes, and NO languages key at all on the
 * reference's zero-link classes (blog category hubs, the app surface,
 * the 3d-prompts tree below its index). The registry rules themselves
 * are pinned in reference-alternate-languages.test.ts; these tests pin
 * that the funnels actually serve them.
 */

function languagesOf(m: { alternates?: unknown }): Record<string, string> | undefined {
  return (m.alternates as { languages?: Record<string, string> })?.languages;
}

function expectServesReferenceSet(
  m: { alternates?: unknown },
  path: string,
): void {
  expect(languagesOf(m)).toEqual(referenceAlternateLanguages(path));
}

describe("static EN family routes serve the reference's hreflang set (t80)", () => {
  it("/ — the landing root's 13-link set (en/x-default keep the slash)", () => {
    const langs = languagesOf(homeMetadata) as Record<string, string>;
    expect(Object.keys(langs)).toHaveLength(13);
    expect(langs.en).toBe("/");
    expect(langs.zh).toBe("/zh");
    expect(langs["pt-BR"]).toBe("/pt");
    expect(langs["x-default"]).toBe("/");
  });
  it("/pricing, /tools, /help, /features, /styles, /legal, /use-cases, /switch, /blog, /3d-prompts", () => {
    expectServesReferenceSet(pricingMetadata, "/pricing");
    expectServesReferenceSet(toolsMetadata, "/tools");
    expectServesReferenceSet(helpMetadata, "/help");
    expectServesReferenceSet(featuresMetadata, "/features");
    expectServesReferenceSet(stylesMetadata, "/styles");
    expectServesReferenceSet(legalMetadata, "/legal");
    expectServesReferenceSet(useCasesMetadata, "/use-cases");
    expectServesReferenceSet(switchMetadata, "/switch");
    expectServesReferenceSet(blogMetadata, "/blog");
    expectServesReferenceSet(promptsMetadata, "/3d-prompts");
  });
});

describe("dynamic EN family routes serve the reference's hreflang set (t80)", () => {
  it("a translated blog article serves its 11-locale suffixed set", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "2d-image-to-3d-model" }),
    });
    expectServesReferenceSet(m, "/blog/2d-image-to-3d-model");
    const langs = languagesOf(m) as Record<string, string>;
    expect(langs.zh).toBe("/zh/blog/2d-image-to-3d-model-zh");
    expect(langs.ar).toBe("/ar/blog/2d-image-to-3d-model-ar");
  });

  it("the 12-link article serves its zh-less set", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "free-stl-files-for-3d-printing" }),
    });
    expectServesReferenceSet(m, "/blog/free-stl-files-for-3d-printing");
    expect(languagesOf(m)).not.toHaveProperty("zh");
  });

  it("the 9-link article serves its seven-locale set", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "use-bang-and-partial-edit" }),
    });
    expectServesReferenceSet(m, "/blog/use-bang-and-partial-edit");
    for (const absent of ["pt-BR", "ar", "tr", "it"]) {
      expect(languagesOf(m)).not.toHaveProperty(absent);
    }
  });

  it("an untranslated blog article serves en + x-default only", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({
        slug: "10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success",
      }),
    });
    expectServesReferenceSet(
      m,
      "/blog/10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success",
    );
    expect(Object.keys(languagesOf(m) as object)).toEqual(["en", "x-default"]);
  });

  it("the blog category hubs serve ZERO hreflang links", async () => {
    for (const slug of ["news", "text-to-3d"]) {
      const m = await blogCategoryMetadata({
        params: Promise.resolve({ slug }),
      });
      expect(languagesOf(m)).toBeUndefined();
    }
  });

  it("the blog pagination serves the page-for-page 13-link set", async () => {
    const m = await blogPaginationMetadata({
      params: Promise.resolve({ page: "2" }),
    });
    expectServesReferenceSet(m, "/blog/page/2");
    // canonical still aliases the index (the t79 pin, unchanged)
    expect((m.alternates as { canonical?: string }).canonical).toBe("/blog");
  });

  it("tools / help / features / use-cases / styles / legal / switch details", async () => {
    const tool = await toolPageMetadata({
      params: Promise.resolve({ slug: ["converter"] }),
    });
    expectServesReferenceSet(tool, "/tools/converter");
    const help = await helpArticleMetadata({
      params: Promise.resolve({ slug: "are-credits-deducted-when-a-generation-fails" }),
    });
    expectServesReferenceSet(
      help,
      "/help/articles/are-credits-deducted-when-a-generation-fails",
    );
    const helpCat = await helpCategoryMetadata({
      params: Promise.resolve({ category: "getting-started" }),
    });
    expectServesReferenceSet(helpCat, "/help/getting-started");
    const feature = await featurePageMetadata({
      params: Promise.resolve({ slug: ["text-to-3d"] }),
    });
    expectServesReferenceSet(feature, "/features/text-to-3d");
    const useCase = await useCaseMetadata({
      params: Promise.resolve({ slug: "3d-printing" }),
    });
    expectServesReferenceSet(useCase, "/use-cases/3d-printing");
    const style = await stylePageMetadata({
      params: Promise.resolve({ slug: "abstract" }),
    });
    expectServesReferenceSet(style, "/styles/abstract");
    const legal = await legalDocMetadata({
      params: Promise.resolve({ slug: "copyright-license" }),
    });
    expectServesReferenceSet(legal, "/legal/copyright-license");
    const switchPage = await switchPageMetadata({
      params: Promise.resolve({ slug: "makerworld" }),
    });
    expectServesReferenceSet(switchPage, "/switch/makerworld");
  });

  it("the help oddball serves the reference's dead mechanical targets", async () => {
    const m = await helpArticleMetadata({
      params: Promise.resolve({ slug: "use-bang-and-partial-edit" }),
    });
    expectServesReferenceSet(m, "/help/articles/use-bang-and-partial-edit");
    // /zh/help/articles/use-bang-and-partial-edit 404s on the reference
    // itself — the renamed -zh route is the live one. Mirrored verbatim.
    expect(languagesOf(m)?.zh).toBe("/zh/help/articles/use-bang-and-partial-edit");
  });

  it("nsfw-content serves its 6-link set; the other sub-categories 2-link", async () => {
    const nsfw = await subCategoryMetadata({
      params: Promise.resolve({ slug: "nsfw-content" }),
    });
    expectServesReferenceSet(nsfw, "/sub-categories/nsfw-content");
    expect(Object.keys(languagesOf(nsfw) as object)).toEqual([
      "en", "ja", "ko", "pt-BR", "es", "x-default",
    ]);
    for (const slug of ["dark-fantasy", "roblox"]) {
      const m = await subCategoryMetadata({
        params: Promise.resolve({ slug }),
      });
      expectServesReferenceSet(m, `/sub-categories/${slug}`);
      expect(Object.keys(languagesOf(m) as object)).toEqual(["en", "x-default"]);
    }
  });

  it("event/chroma-awards serves en + x-default", async () => {
    const m = await eventPageMetadata({
      params: Promise.resolve({ slug: "chroma-awards" }),
    });
    expectServesReferenceSet(m, "/event/chroma-awards");
    expect(Object.keys(languagesOf(m) as object)).toEqual(["en", "x-default"]);
  });
});

describe("the reference's zero-link classes serve no languages key (t80)", () => {
  it("the 3d-prompts tree below its index (numbered page, detail, model hub)", () => {
    // static metadata export from the [slug] route covers numbered pages
    // and prompt details alike — path-derived, both resolve to null.
    expect(
      referenceAlternateLanguages("/3d-prompts/2"),
    ).toBeNull();
    expect(
      referenceAlternateLanguages("/3d-prompts/soda-bottle-starship-kitchen-launch"),
    ).toBeNull();
  });

  it("the workspace app surface (omnicraft toolbag)", () => {
    expect(languagesOf(workspaceOmnicraftMetadata)).toBeUndefined();
    expect(referenceAlternateLanguages("/workspace/omnicraft")).toBeNull();
  });

  it("the blog category hubs (12/12 probed in t79)", async () => {
    const m = await blogCategoryMetadata({
      params: Promise.resolve({ slug: "news" }),
    });
    expect(m.alternates).not.toHaveProperty("languages");
  });
});

describe("the emitted link order matches the reference's own (t80)", () => {
  it("family routes: en, locales in sitemap order (pt-BR), x-default last", () => {
    expect(Object.keys(languagesOf(toolsMetadata) as object)).toEqual([
      "en", "zh", "de", "ja", "ko", "ru", "pt-BR",
      "fr", "es", "ar", "tr", "it", "x-default",
    ]);
  });
});
