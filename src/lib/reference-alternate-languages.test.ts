import { describe, expect, it } from "vitest";

import { LOCALE_CODES, hreflangFor } from "./i18n";
import { LOCALE_BLOG_SLUGS } from "./i18n-locale-data";
import {
  REFERENCE_BLOG_TRANSLATION_EXCEPTIONS,
  REFERENCE_SUB_CATEGORY_LOCALES,
  REFERENCE_TRANSLATED_BLOG_SLUGS,
  referenceAlternateLanguages,
} from "./reference-alternate-languages";

/**
 * t80 registry pins — the reference's hreflang dimension across the
 * censused EN tree (recon/t80: 1,092 EN pages probed 2026-11-01).
 *
 * The generator (recon/t80/build-alternate-languages-registry.py)
 * asserts probe/census agreement before emission; these tests pin the
 * emitted values and the resolver's per-class rules so they cannot
 * drift: 542 thirteen-link pages (309 family routes + 233 translated
 * blog articles), 546 two-link pages (en + x-default: the 543
 * untranslated articles + event + two sub-categories), one 12-link and
 * one 9-link partial set, one 6-link sub-category, and exactly one
 * zero-link censused page (/content-preview — outside familyMetadata).
 */

const LANG_ORDER = [
  "en",
  "zh",
  "de",
  "ja",
  "ko",
  "ru",
  "pt-BR",
  "fr",
  "es",
  "ar",
  "tr",
  "it",
  "x-default",
];

describe("the blog translation registry (t80)", () => {
  it("pins 233 full-11-locale slugs, alphabetically", () => {
    expect(REFERENCE_TRANSLATED_BLOG_SLUGS).toHaveLength(233);
    expect([...REFERENCE_TRANSLATED_BLOG_SLUGS]).toEqual(
      [...REFERENCE_TRANSLATED_BLOG_SLUGS].sort(),
    );
    // spot anchors from the probe
    expect(REFERENCE_TRANSLATED_BLOG_SLUGS).toContain("2d-image-to-3d-model");
    expect(REFERENCE_TRANSLATED_BLOG_SLUGS).toContain("ai-game-character-creator");
    expect(REFERENCE_TRANSLATED_BLOG_SLUGS).not.toContain("what-is-glb");
  });

  it("pins the two partial-set exceptions byte-for-byte", () => {
    expect(REFERENCE_BLOG_TRANSLATION_EXCEPTIONS).toEqual({
      // no zh on the reference's own set (12-link page)
      "free-stl-files-for-3d-printing": [
        "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it",
      ],
      // no pt/ar/tr/it (9-link page) — the same seven locales that
      // rename the help oddball
      "use-bang-and-partial-edit": ["zh", "de", "ja", "ko", "ru", "fr", "es"],
    });
  });

  it("every registry target is a locale slug the clone actually serves", () => {
    let targets = 0;
    const translated: [string, readonly string[]][] = [
      ...REFERENCE_TRANSLATED_BLOG_SLUGS.map(
        (slug) => [slug, LOCALE_CODES] as [string, readonly string[]],
      ),
      ...Object.entries(REFERENCE_BLOG_TRANSLATION_EXCEPTIONS),
    ];
    for (const [slug, locales] of translated) {
      for (const loc of locales) {
        const map = referenceAlternateLanguages(`/blog/${slug}`) as Record<string, string>;
        const href = map[loc === "pt" ? "pt-BR" : loc];
        expect(href, `${slug} ${loc}`).toBeDefined();
        const targetSlug = href!.split("/blog/")[1];
        expect(
          LOCALE_BLOG_SLUGS[loc],
          `${slug} -> ${loc}/${targetSlug}`,
        ).toContain(targetSlug);
        targets += 1;
      }
    }
    // 233 full + 10 + 7 — the exact count of locale blog article URLs
    // in the t75 census (2,580), reconciled at generation time.
    expect(targets).toBe(233 * 11 + 10 + 7);
  });

  it("the two double-suffixed oddball targets (zh-ar / zh-tr)", () => {
    const ai = referenceAlternateLanguages("/blog/ai-game-character-creator") as Record<string, string>;
    expect(ai.ar).toBe("/ar/blog/ai-game-character-creator-zh-ar");
    const ply = referenceAlternateLanguages("/blog/what-is-ply-file") as Record<string, string>;
    expect(ply.tr).toBe("/tr/blog/what-is-ply-file-zh-tr");
  });
});

describe("the resolver's per-class rules (t80)", () => {
  it("family routes: the full 13-link set, key order load-bearing", () => {
    for (const path of [
      "/", "/pricing", "/tools", "/tools/converter", "/help",
      "/help/articles/are-credits-deducted-when-a-generation-fails",
      "/features", "/features/text-to-3d", "/styles", "/styles/abstract",
      "/legal/copyright-license", "/use-cases/3d-printing", "/switch",
      "/switch/makerworld", "/3d-prompts", "/blog", "/blog/page/2",
    ]) {
      const map = referenceAlternateLanguages(path) as Record<string, string>;
      expect(Object.keys(map)).toEqual(LANG_ORDER);
      expect(map.en).toBe(path);
      expect(map["x-default"]).toBe(path);
      // the root's locale mirrors carry no trailing slash (probed)
      const clean = path === "/" ? "" : path;
      expect(map["pt-BR"]).toBe(`/pt${clean}`);
      expect(map.zh).toBe(`/zh${clean}`);
    }
  });

  it("the reference's 13-link order equals hreflangFor's (one order, two funnels)", () => {
    expect(
      Object.keys(referenceAlternateLanguages("/pricing") as Record<string, string>),
    ).toEqual(Object.keys(hreflangFor("/pricing")));
  });

  it("translated blog articles: -{loc}-suffixed targets, en/x-default bare", () => {
    const map = referenceAlternateLanguages("/blog/2d-image-to-3d-model") as Record<string, string>;
    expect(Object.keys(map)).toEqual(LANG_ORDER);
    expect(map.en).toBe("/blog/2d-image-to-3d-model");
    expect(map["x-default"]).toBe("/blog/2d-image-to-3d-model");
    expect(map.zh).toBe("/zh/blog/2d-image-to-3d-model-zh");
    expect(map["pt-BR"]).toBe("/pt/blog/2d-image-to-3d-model-pt");
  });

  it("untranslated blog articles: en + x-default only (the 543)", () => {
    const map = referenceAlternateLanguages(
      "/blog/10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success",
    ) as Record<string, string>;
    expect(map).toEqual({
      en: "/blog/10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success",
      "x-default": "/blog/10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success",
    });
  });

  it("the help oddball emits the reference's own dead mechanical targets", () => {
    // /zh/help/articles/use-bang-and-partial-edit 404s on the reference
    // itself — the renamed -zh route is the live one. The clone mirrors
    // the mechanical emission byte-for-byte (probed, pinned).
    const map = referenceAlternateLanguages(
      "/help/articles/use-bang-and-partial-edit",
    ) as Record<string, string>;
    expect(Object.keys(map)).toEqual(LANG_ORDER);
    expect(map.zh).toBe("/zh/help/articles/use-bang-and-partial-edit");
    expect(map.tr).toBe("/tr/help/articles/use-bang-and-partial-edit");
  });

  it("sub-categories: nsfw-content's 6-link set, the others 2-link", () => {
    expect(REFERENCE_SUB_CATEGORY_LOCALES).toEqual({
      "nsfw-content": ["ja", "ko", "pt", "es"],
    });
    const nsfw = referenceAlternateLanguages("/sub-categories/nsfw-content") as Record<string, string>;
    expect(Object.keys(nsfw)).toEqual(["en", "ja", "ko", "pt-BR", "es", "x-default"]);
    expect(nsfw.ja).toBe("/ja/sub-categories/nsfw-content");
    for (const slug of ["dark-fantasy", "roblox"]) {
      expect(referenceAlternateLanguages(`/sub-categories/${slug}`)).toEqual({
        en: `/sub-categories/${slug}`,
        "x-default": `/sub-categories/${slug}`,
      });
    }
  });

  it("event/chroma-awards: en + x-default (the reference's own shape)", () => {
    expect(referenceAlternateLanguages("/event/chroma-awards")).toEqual({
      en: "/event/chroma-awards",
      "x-default": "/event/chroma-awards",
    });
  });

  it("the zero-link classes: null — no languages key at all", () => {
    // the blog category hubs (12/12 in the t79 probe)
    expect(referenceAlternateLanguages("/blog/category/news")).toBeNull();
    // the app surface (probed: /workspace, /workspace/omnicraft,
    // /content-preview all serve zero alternate links)
    expect(referenceAlternateLanguages("/workspace")).toBeNull();
    expect(referenceAlternateLanguages("/workspace/omnicraft")).toBeNull();
    // the 3d-prompts tree below its index (numbered pages, the 403
    // detail slugs, the model hubs — probed, not assumed)
    expect(referenceAlternateLanguages("/3d-prompts/2")).toBeNull();
    expect(referenceAlternateLanguages("/3d-prompts/soda-bottle-starship-kitchen-launch")).toBeNull();
    expect(referenceAlternateLanguages("/3d-prompts/models/gpt-6-astra")).toBeNull();
  });
});
