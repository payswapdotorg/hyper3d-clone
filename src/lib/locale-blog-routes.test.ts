import { describe, expect, it } from "vitest";

import { generateMetadata as localePageMetadata } from "@/app/[locale]/[[...slug]]/page";
import { generateMetadata as blogCategoryMetadata } from "@/app/blog/category/[slug]/page";
import { generateMetadata as blogPageMetadata } from "@/app/blog/page/[page]/page";
import { hreflangFor, LOCALE_CODES } from "./i18n";
import { localeServingPaths, resolveLocalePage } from "./i18n-pages";
import { LOCALE_BLOG_SLUGS } from "./i18n-locale-data";
import {
  EN_CATEGORY_TITLE_NAMES,
  LOCALE_BLOG_WORD,
  LOCALE_CATEGORY_NAMES,
  LOCALE_PAGE_WORD,
} from "./locale-blog-terms";
import { referenceDescription } from "./reference-descriptions";
import { BLOG_CATEGORIES, findBlogEntry } from "./blog";
import { BLOG_PAGE_COUNT } from "./blog-registry";
import { OG_BANNER_FALLBACK_URL, SITE_ORIGIN } from "./schema-org";

/**
 * t79: the reference's locale blog category/pagination routes — 341 pages
 * this clone used to 404 (recon/t79/heads.json, probed 383/383 → 200:
 * 12 categories + 19 pages × 11 locales + the EN controls). The head is
 * byte-faithful on every dimension the probe captured; the terms registry
 * carries the reference's own published translations, and every
 * route-level string derives from them by the reference's own templates
 * (0 mismatches across the full probe).
 */

async function meta(locale: string, ...slug: string[]) {
  return localePageMetadata({
    params: Promise.resolve({ locale, slug: slug.length ? slug : undefined }),
  });
}

describe("locale blog terms — the reference's own translations (t79)", () => {
  it("carries the 11 Blog words and 11 Page words, pinned from the probe", () => {
    expect(LOCALE_BLOG_WORD.zh).toBe("博客");
    expect(LOCALE_BLOG_WORD.ar).toBe("المدونة");
    expect(LOCALE_BLOG_WORD.ja).toBe("ブログ");
    expect(LOCALE_BLOG_WORD.ko).toBe("블로그");
    expect(LOCALE_BLOG_WORD.ru).toBe("Блог");
    expect(LOCALE_BLOG_WORD.fr).toBe("Blog");
    expect(LOCALE_PAGE_WORD.zh).toBe("页");
    expect(LOCALE_PAGE_WORD.de).toBe("Seite");
    expect(LOCALE_PAGE_WORD.ja).toBe("ページ");
    expect(LOCALE_PAGE_WORD.ar).toBe("الصفحة");
    expect(LOCALE_PAGE_WORD.pt).toBe("Página");
    expect(Object.keys(LOCALE_BLOG_WORD)).toHaveLength(11);
    expect(Object.keys(LOCALE_PAGE_WORD)).toHaveLength(11);
  });

  it("carries all 132 localized category names (11 locales x 12)", () => {
    expect(Object.keys(LOCALE_CATEGORY_NAMES)).toHaveLength(11);
    for (const locale of LOCALE_CODES) {
      expect(Object.keys(LOCALE_CATEGORY_NAMES[locale]), locale).toHaveLength(12);
    }
    // spot pins from the probe
    expect(LOCALE_CATEGORY_NAMES.zh.news).toBe("新闻");
    expect(LOCALE_CATEGORY_NAMES.zh["3d-printing"]).toBe("3D 打印");
    expect(LOCALE_CATEGORY_NAMES.ar["game-development"]).toBe("تطوير الألعاب");
    expect(LOCALE_CATEGORY_NAMES.ja["ai-texturing"]).toBe("AIテクスチャ生成");
    expect(LOCALE_CATEGORY_NAMES.de["prompt-guide"]).toBe("Prompt-Leitfaden");
  });

  it("carries the EN names in the reference's own title case", () => {
    // The reference's <title> says "Text To 3D" where the display name
    // says "Text to 3D" — both are its own strings, pinned separately.
    expect(EN_CATEGORY_TITLE_NAMES["text-to-3d"]).toBe("Text To 3D");
    expect(EN_CATEGORY_TITLE_NAMES["image-to-3d"]).toBe("Image To 3D");
    expect(EN_CATEGORY_TITLE_NAMES.news).toBe("News");
    expect(EN_CATEGORY_TITLE_NAMES["3d-printing"]).toBe("3D Printing");
    expect(Object.keys(EN_CATEGORY_TITLE_NAMES)).toHaveLength(12);
    const displayNames = BLOG_CATEGORIES.map((c) => c.name);
    expect(displayNames).toContain("Text to 3D");
  });
});

describe("locale blog route resolution (t79)", () => {
  it("resolves every category in every locale", () => {
    for (const locale of LOCALE_CODES) {
      for (const cat of BLOG_CATEGORIES) {
        const def = resolveLocalePage(locale, `blog/category/${cat.slug}`);
        expect(def?.kind, `/${locale}/blog/category/${cat.slug}`).toBe("blog-category");
      }
    }
  });

  it("resolves the 19 pagination pages in every locale, page 1 at the index", () => {
    expect(BLOG_PAGE_COUNT).toBe(20);
    for (const locale of LOCALE_CODES) {
      for (let n = 2; n <= 20; n += 1) {
        const def = resolveLocalePage(locale, `blog/page/${n}`);
        expect(def?.kind, `/${locale}/blog/page/${n}`).toBe("blog-pagination");
        if (def?.kind === "blog-pagination") expect(def.page).toBe(n);
      }
      expect(resolveLocalePage(locale, "blog/page/1")).toBeNull();
      expect(resolveLocalePage(locale, "blog/page/21")).toBeNull();
    }
  });

  it("404s the localized-suffixed and unknown category forms", () => {
    expect(resolveLocalePage("zh", "blog/category/news-zh")).toBeNull();
    expect(resolveLocalePage("fr", "blog/category/news-fr")).toBeNull();
    expect(resolveLocalePage("zh", "blog/category/not-a-category")).toBeNull();
    expect(resolveLocalePage("zh", "blog/page/not-a-number")).toBeNull();
  });

  it("lists the locale's own articles per topic — a superset of the probed set", () => {
    const def = resolveLocalePage("zh", "blog/category/news");
    if (def?.kind !== "blog-category") throw new Error("unresolved");
    // The reference's /zh/blog/category/news lists three of these -zh
    // articles (recon/t79 body probe); this clone lists the census's
    // complete news set — the same registry slice the EN hub serves —
    // so the reference's three are a subset of it.
    const hrefs = def.links.map((l) => l.href);
    expect(hrefs).toContain("/zh/blog/hyper3d-featured-nvidia-lowes-ai-3d-workflow-zh");
    expect(hrefs).toContain("/zh/blog/deemos-tech-launches-hyper3d-rodin-zh");
    expect(hrefs).toContain("/zh/blog/hyper3d-shutterstock-zh");
    // the full census-derived set (5 zh news articles)
    expect(hrefs).toHaveLength(5);
  });

  it("every locale's category links point at real localized article routes", () => {
    for (const locale of LOCALE_CODES) {
      const slugs = LOCALE_BLOG_SLUGS[locale];
      for (const cat of BLOG_CATEGORIES) {
        const def = resolveLocalePage(locale, `blog/category/${cat.slug}`);
        if (def?.kind !== "blog-category") throw new Error("unresolved");
        for (const link of def.links) {
          const slug = link.href.split("/").pop() as string;
          expect(slugs, `${locale} ${cat.slug} ${slug}`).toContain(slug);
        }
      }
    }
  });

  it("adds exactly 31 serving paths per locale (12 categories + 19 pages)", () => {
    for (const locale of LOCALE_CODES) {
      const serving = new Set(localeServingPaths(locale));
      for (const cat of BLOG_CATEGORIES) {
        expect(serving.has(`blog/category/${cat.slug}`), `${locale} ${cat.slug}`).toBe(true);
      }
      for (let n = 2; n <= 20; n += 1) {
        expect(serving.has(`blog/page/${n}`), `${locale} page ${n}`).toBe(true);
      }
    }
  });
});

describe("locale blog category head — byte-faithful to the probe (t79)", () => {
  it("zh/news: title, template description, self canonical, zero hreflang, noindex", async () => {
    const m = await meta("zh", "blog", "category", "news");
    expect(m.title).toBe("新闻 | 博客 | Hyper3D");
    expect(m.description).toBe("Browse the latest Hyper3D blog posts in the 新闻 category.");
    expect(m.robots).toBe("noindex, follow");
    expect((m.alternates as { canonical?: string }).canonical).toBe("/zh/blog/category/news");
    expect((m.alternates as { languages?: unknown }).languages).toBeUndefined();
    expect((m.alternates as { types?: unknown }).types).toEqual({
      "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
    });
    const og = m.openGraph as { title?: string; url?: string; images?: { url: string; alt: string }[]; type?: string };
    expect(og.title).toBe("新闻 | 博客");
    expect(og.url).toBe(`${SITE_ORIGIN}/zh/blog/category/news`);
    expect(og.images).toEqual([{ url: OG_BANNER_FALLBACK_URL, alt: "新闻 | 博客" }]);
    expect(og.type).toBe("website");
  });

  it("ar/3d-printing and de/xr: the same shapes in other scripts", async () => {
    const ar = await meta("ar", "blog", "category", "3d-printing");
    expect(ar.title).toBe("طباعة ثلاثية الأبعاد | المدونة | Hyper3D");
    expect(ar.description).toBe(
      "Browse the latest Hyper3D blog posts in the طباعة ثلاثية الأبعاد category.",
    );
    const de = await meta("de", "blog", "category", "xr");
    expect(de.title).toBe("XR | Blog | Hyper3D");
    expect((de.alternates as { canonical?: string }).canonical).toBe("/de/blog/category/xr");
  });

  it("every locale/category pair carries the reference's exact title", async () => {
    for (const locale of LOCALE_CODES) {
      for (const cat of BLOG_CATEGORIES) {
        const m = await meta(locale, "blog", "category", cat.slug);
        expect(m.title, `/${locale}/blog/category/${cat.slug}`).toBe(
          `${LOCALE_CATEGORY_NAMES[locale][cat.slug]} | ${LOCALE_BLOG_WORD[locale]} | Hyper3D`,
        );
      }
    }
  });
});

describe("locale blog pagination head — byte-faithful to the probe (t79)", () => {
  it("zh/page/2: title, prefixed index description, index-aliased canonical + og:url, 13 hreflangs", async () => {
    const m = await meta("zh", "blog", "page", "2");
    expect(m.title).toBe("博客 — 页 2 | Hyper3D");
    expect(m.description).toBe(`页 2: ${referenceDescription("/zh/blog")}`);
    expect(m.robots).toBe("index, follow");
    expect((m.alternates as { canonical?: string }).canonical).toBe("/zh/blog");
    const languages = (m.alternates as { languages?: Record<string, string> }).languages;
    expect(Object.keys(languages ?? {})).toHaveLength(13);
    expect(languages?.en).toBe("/blog/page/2");
    expect(languages?.zh).toBe("/zh/blog/page/2");
    expect(languages?.["pt-BR"]).toBe("/pt/blog/page/2");
    expect(languages?.["x-default"]).toBe("/blog/page/2");
    const og = m.openGraph as { title?: string; url?: string; images?: { url: string }[] };
    expect(og.title).toBe("博客 — 页 2");
    expect(og.url).toBe(`${SITE_ORIGIN}/zh/blog`);
    expect(og.images).toEqual([{ url: OG_BANNER_FALLBACK_URL, alt: "博客 — 页 2" }]);
    expect((m.alternates as { types?: unknown }).types).toEqual({
      "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
    });
  });

  it("ar/page/20: the same shape in RTL", async () => {
    const m = await meta("ar", "blog", "page", "20");
    expect(m.title).toBe("المدونة — الصفحة 20 | Hyper3D");
    expect(m.description).toBe(`الصفحة 20: ${referenceDescription("/ar/blog")}`);
    expect((m.alternates as { canonical?: string }).canonical).toBe("/ar/blog");
    const languages = (m.alternates as { languages?: Record<string, string> }).languages;
    expect(languages?.en).toBe("/blog/page/20");
    expect(languages?.ar).toBe("/ar/blog/page/20");
  });

  it("the description is full length — never the 180-char template slice", async () => {
    const m = await meta("fr", "blog", "page", "5");
    const full = referenceDescription("/fr/blog") ?? "";
    expect(m.description).toBe(`Page 5: ${full}`);
    if (full.length > 0) {
      expect((m.description ?? "").length).toBe(`Page 5: `.length + full.length);
    }
  });
});

describe("EN blog category head — the t79 corrections (t79)", () => {
  it("text-to-3d: the reference's title case, the template description, zero hreflang", async () => {
    const m = await blogCategoryMetadata({ params: Promise.resolve({ slug: "text-to-3d" }) });
    expect(m.title).toBe("Text To 3D | Blog | Hyper3D");
    expect(m.description).toBe("Browse the latest Hyper3D blog posts in the Text To 3D category.");
    expect(m.robots).toBe("noindex, follow");
    expect((m.alternates as { canonical?: string }).canonical).toBe("/blog/category/text-to-3d");
    expect((m.alternates as { languages?: unknown }).languages).toBeUndefined();
    const og = m.openGraph as { title?: string; images?: { url: string }[] };
    expect(og.title).toBe("Text To 3D | Blog");
    expect(og.images?.[0]?.url).toBe(OG_BANNER_FALLBACK_URL);
  });

  it("3d-printing: same shape", async () => {
    const m = await blogCategoryMetadata({ params: Promise.resolve({ slug: "3d-printing" }) });
    expect(m.title).toBe("3D Printing | Blog | Hyper3D");
    expect(m.robots).toBe("noindex, follow");
    expect((m.alternates as { languages?: unknown }).languages).toBeUndefined();
  });

  it("every EN category follows the reference's title template", async () => {
    for (const cat of BLOG_CATEGORIES) {
      const m = await blogCategoryMetadata({ params: Promise.resolve({ slug: cat.slug }) });
      expect(m.title, cat.slug).toBe(`${EN_CATEGORY_TITLE_NAMES[cat.slug]} | Blog | Hyper3D`);
      expect(m.description, cat.slug).toBe(
        `Browse the latest Hyper3D blog posts in the ${EN_CATEGORY_TITLE_NAMES[cat.slug]} category.`,
      );
    }
  });
});

describe("EN blog pagination head — the t79 corrections (t79)", () => {
  it("page 2: the reference's title, prefixed index description, /blog-aliased canonical + og:url, 13 hreflangs", async () => {
    const m = await blogPageMetadata({ params: Promise.resolve({ page: "2" }) });
    expect(m.title).toBe("Blog — Page 2 | Hyper3D");
    expect(m.description).toBe(
      `Page 2: ${referenceDescription("/blog")}`,
    );
    expect((m.alternates as { canonical?: string }).canonical).toBe("/blog");
    const languages = (m.alternates as { languages?: Record<string, string> }).languages;
    expect(Object.keys(languages ?? {})).toHaveLength(13);
    expect(languages?.en).toBe("/blog/page/2");
    expect(languages?.zh).toBe("/zh/blog/page/2");
    expect(languages?.["pt-BR"]).toBe("/pt/blog/page/2");
    const og = m.openGraph as { title?: string; url?: string; images?: { url: string }[] };
    expect(og.title).toBe("Blog — Page 2");
    expect(og.url).toBe("/blog");
    expect(og.images?.[0]?.url).toBe(OG_BANNER_FALLBACK_URL);
    expect(m.robots).toBe("index, follow");
    expect((m.alternates as { types?: unknown }).types).toEqual({
      "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
    });
  });

  it("page 20: the window's last page keeps the same shape", async () => {
    const m = await blogPageMetadata({ params: Promise.resolve({ page: "20" }) });
    expect(m.title).toBe("Blog — Page 20 | Hyper3D");
    expect((m.alternates as { canonical?: string }).canonical).toBe("/blog");
    expect((m.alternates as { languages?: Record<string, string> }).languages?.en).toBe(
      "/blog/page/20",
    );
  });
});

describe("hreflangFor — the pt-BR tag (t79)", () => {
  it("emits pt-BR (never bare pt) — the reference's own tag", () => {
    const map = hreflangFor("/blog/page/2");
    expect(map["pt-BR"]).toBe("/pt/blog/page/2");
    expect(map.pt).toBeUndefined();
    expect(Object.keys(map)).toHaveLength(13);
  });

  it("every locale page's hreflang set uses the reference's 13 tags", () => {
    const tags = Object.keys(hreflangFor("/pricing"));
    expect(tags).toEqual([
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
    ]);
  });
});

describe("locale blog category census — the links derive from the registry (t79)", () => {
  it("every census blog slug resolves to a real EN entry", () => {
    // The reference derives its locale category membership from its own
    // CMS; this clone derives it from the computed registry category —
    // every locale article must resolve against the EN catalog (the
    // category field exists on computed rows; written articles carry
    // none and simply never match a category hub).
    for (const locale of LOCALE_CODES) {
      for (const slug of LOCALE_BLOG_SLUGS[locale]) {
        let base = slug.endsWith(`-${locale}`) ? slug.slice(0, -(`-${locale}`.length)) : slug;
        if (!findBlogEntry(base) && base.endsWith("-zh")) base = base.slice(0, -3);
        const entry = findBlogEntry(base);
        expect(entry, `${locale} ${slug}`).toBeTruthy();
      }
    }
  });

  it("every locale news category carries only real localized article routes", () => {
    for (const locale of LOCALE_CODES) {
      const def = resolveLocalePage(locale, "blog/category/news");
      if (def?.kind !== "blog-category") throw new Error("unresolved");
      for (const link of def.links) {
        expect(link.href.startsWith(`/${locale}/blog/`)).toBe(true);
        expect(link.href.endsWith(`-${locale}`)).toBe(true);
      }
    }
  });
});
