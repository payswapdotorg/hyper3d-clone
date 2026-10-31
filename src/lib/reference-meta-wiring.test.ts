import { describe, expect, it } from "vitest";

import { metadata as pricingMetadata } from "@/app/pricing/page";
import { metadata as helpMetadata } from "@/app/help/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as notFoundMetadata } from "@/app/not-found";
import { generateMetadata as blogArticleMetadata } from "@/app/blog/[slug]/page";
import { generateMetadata as blogCategoryMetadata } from "@/app/blog/category/[slug]/page";
import { generateMetadata as blogPageMetadata } from "@/app/blog/page/[page]/page";
import { generateMetadata as helpArticleMetadata } from "@/app/help/articles/[slug]/page";
import { generateMetadata as localePageMetadata } from "@/app/[locale]/[[...slug]]/page";
import { familyMetadata, type FamilyMetadataInput } from "./seo";
import { FACEBOOK_DOMAIN_VERIFICATION } from "./schema-org";
import { referenceArticleMeta } from "./reference-article-metas";

/**
 * t78 wiring: the reference's remaining crawler-surface head ships from
 * every route — robots "index, follow" and the
 * facebook-domain-verification token on every censused page (the blog
 * category hubs are the one noindex, follow exception), the OpenGraph
 * article namespace (published / modified / author) on blog articles,
 * and the RSS alternate link across the blog family (indexes, articles,
 * pagination, categories). The raw-probe census pins live in
 * reference-article-metas.test.ts; these tests pin that the routes
 * actually SERVE the pinned values.
 */

const FB = { "facebook-domain-verification": FACEBOOK_DOMAIN_VERIFICATION };
const RSS_TYPES = {
  "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
};

function robotsOf(m: { robots?: unknown }): string {
  return m.robots as string;
}

function fbOf(m: { other?: unknown }): Record<string, string> {
  return m.other as Record<string, string>;
}

function articleOf(m: { openGraph?: unknown }): {
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
} {
  return m.openGraph as {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
}

function rssOf(m: { alternates?: unknown }): unknown {
  return (m.alternates as { types?: unknown }).types;
}

describe("familyMetadata emits the t78 head (t78)", () => {
  const base: FamilyMetadataInput = {
    title: "Text to 3D",
    description: "Generate 3D models from text prompts.",
    path: "/features/text-to-3d",
  };

  it("robots 'index, follow' + the facebook-domain-verification token", () => {
    const md = familyMetadata(base);
    expect(robotsOf(md)).toBe("index, follow");
    expect(fbOf(md)).toEqual(FB);
  });

  it("no RSS alternate link unless requested", () => {
    expect(rssOf(familyMetadata(base))).toBeUndefined();
  });

  it("rss: true adds the blog family's RSS alternate link", () => {
    const md = familyMetadata({ ...base, path: "/blog", rss: true });
    expect(rssOf(md)).toEqual(RSS_TYPES);
    // the canonical survives alongside
    expect((md.alternates as { canonical: string }).canonical).toBe(
      "https://hyper3d-clone.vercel.app/blog",
    );
  });

  it("article metas flow into the OpenGraph card", () => {
    const pinned = referenceArticleMeta("/blog/zbrush-alternative");
    expect(pinned).toBeDefined();
    const md = familyMetadata({
      title: "Best ZBrush Alternative? Free AI Sculpting Tools (2026)",
      description: "Looking for a ZBrush alternative?",
      path: "/blog/zbrush-alternative",
      type: "article",
      article: pinned,
      rss: true,
    });
    const og = articleOf(md);
    expect(og.publishedTime).toBe(pinned?.published);
    expect(og.modifiedTime).toBe(pinned?.modified);
    expect(og.authors).toEqual([pinned?.author]);
    expect(rssOf(md)).toEqual(RSS_TYPES);
  });
});

describe("static family routes serve robots + fb-verify (t78)", () => {
  it("/pricing, /help, /blog, the homepage", () => {
    for (const m of [pricingMetadata, helpMetadata, blogMetadata, homeMetadata]) {
      expect(robotsOf(m)).toBe("index, follow");
      expect(fbOf(m)).toEqual(FB);
    }
  });

  it("the homepage's fb token is the probe-pinned reference byte", () => {
    expect(FACEBOOK_DOMAIN_VERIFICATION).toBe(
      "lu7584v1wtckhvpsboezn5jbytqgf8",
    );
  });
});

describe("blog family routes serve the RSS alternate link (t78)", () => {
  it("the EN blog index", () => {
    expect(rssOf(blogMetadata)).toEqual(RSS_TYPES);
  });

  it("blog pagination", async () => {
    const m = await blogPageMetadata({ params: Promise.resolve({ page: "2" }) });
    expect(rssOf(m)).toEqual(RSS_TYPES);
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
  });

  it("a written blog article — RSS + article namespace + robots + fb", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "why-did-my-hyper3d-generation-fail" }),
    });
    const pinned = referenceArticleMeta(
      "/blog/why-did-my-hyper3d-generation-fail",
    );
    expect(pinned).toBeDefined();
    expect(articleOf(m).publishedTime).toBe(pinned?.published);
    expect(articleOf(m).modifiedTime).toBe(pinned?.modified);
    expect(articleOf(m).authors).toEqual([pinned?.author]);
    expect(rssOf(m)).toEqual(RSS_TYPES);
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
  });

  it("a not-written blog route still serves the reference's pinned article metas", async () => {
    const m = await blogArticleMetadata({
      params: Promise.resolve({ slug: "zbrush-alternative" }),
    });
    const pinned = referenceArticleMeta("/blog/zbrush-alternative");
    expect(pinned).toBeDefined();
    expect(articleOf(m).publishedTime).toBe(pinned?.published);
    expect(articleOf(m).modifiedTime).toBe(pinned?.modified);
    expect(articleOf(m).authors).toEqual(["Hyper3D"]);
    expect(rssOf(m)).toEqual(RSS_TYPES);
  });

  it("the blog category hubs serve noindex, follow + RSS + fb (the one robots exception)", async () => {
    const m = await blogCategoryMetadata({
      params: Promise.resolve({ slug: "news" }),
    });
    expect(robotsOf(m)).toBe("noindex, follow");
    expect(rssOf(m)).toEqual(RSS_TYPES);
    expect(fbOf(m)).toEqual(FB);
  });
});

describe("help articles stay article-typed but article-meta-free (t78 boundary)", () => {
  it("no publishedTime / modifiedTime / authors on a help article card", async () => {
    const m = await helpArticleMetadata({
      params: Promise.resolve({
        slug: "are-credits-deducted-when-a-generation-fails",
      }),
    });
    expect((m.openGraph as { type: string }).type).toBe("article");
    const og = articleOf(m);
    expect(og.publishedTime).toBeUndefined();
    expect(og.modifiedTime).toBeUndefined();
    expect(og.authors).toBeUndefined();
    expect(rssOf(m)).toBeUndefined();
    // the rest of the t78 head still ships
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
  });
});

describe("the locale catch-all serves the t78 head (t78)", () => {
  it("a locale family page: robots + fb, no RSS, no article metas", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["help"] }),
    });
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
    expect(rssOf(m)).toBeUndefined();
    expect(articleOf(m).publishedTime).toBeUndefined();
  });

  it("the locale blog index: RSS + robots + fb", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({ locale: "zh", slug: ["blog"] }),
    });
    expect(rssOf(m)).toEqual(RSS_TYPES);
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
  });

  it("a locale blog article: the reference's pinned article metas + RSS", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["blog", "2d-image-to-3d-model-zh"],
      }),
    });
    const pinned = referenceArticleMeta("/zh/blog/2d-image-to-3d-model-zh");
    expect(pinned).toBeDefined();
    expect(articleOf(m).publishedTime).toBe(pinned?.published);
    expect(articleOf(m).modifiedTime).toBe(pinned?.modified);
    expect(articleOf(m).authors).toEqual([pinned?.author]);
    expect(rssOf(m)).toEqual(RSS_TYPES);
    expect(robotsOf(m)).toBe("index, follow");
    expect(fbOf(m)).toEqual(FB);
  });

  it("a locale non-blog article (help) keeps no article namespace", async () => {
    const m = await localePageMetadata({
      params: Promise.resolve({
        locale: "zh",
        slug: ["help", "articles", "how-to-purchase-hyper3d-credits"],
      }),
    });
    expect(articleOf(m).publishedTime).toBeUndefined();
    expect(rssOf(m)).toBeUndefined();
  });
});

describe("the 404 head (t78)", () => {
  it("the reference's own 404 title, robots, and fb token", () => {
    expect(notFoundMetadata.title).toBe("404 Page Not Found | Hyper3D");
    expect(robotsOf(notFoundMetadata)).toBe("noindex, nofollow");
    expect(fbOf(notFoundMetadata)).toEqual(FB);
  });
});
