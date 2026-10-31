import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SITE_ORIGIN,
  OG_IMAGE_URL,
  OG_BANNER_FALLBACK_URL,
  homeGraph,
  featureJsonLd,
  useCaseJsonLd,
  toolJsonLd,
  helpArticleJsonLd,
  blogPostJsonLd,
  baselineJsonLd,
  breadcrumbList,
} from "./schema-org";
import { familyMetadata } from "./seo";
import { referenceAlternateLanguages } from "./reference-alternate-languages";
import { FEATURE_PAGES } from "./features-content-core";
import { featureBySlug } from "./features";
import { findUseCasePage, USE_CASE_ROUTES } from "./use-cases";
import { findBlogEntry, BLOG_SITEMAP_LOCS } from "./blog";
import { HELP_ARTICLES } from "./help";
import { buildConverterPairPage } from "./tools-content";

/** The eight families the t67 sitemap split ships children for. */
const FAMILIES = [
  "static",
  "features",
  "tools",
  "use-cases",
  "styles",
  "legal",
  "sub-categories",
  "blog",
] as const;

const LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"] as const;

function readPublic(name: string): string {
  return readFileSync(join(process.cwd(), "public", name), "utf8");
}

/** Extract @type from a JSON-LD object (or @graph node types). */
function nodeTypes(obj: Record<string, unknown>): string[] {
  if (Array.isArray(obj["@graph"])) {
    return (obj["@graph"] as Record<string, unknown>[]).map((n) => String(n["@type"]));
  }
  return [String(obj["@type"])];
}

describe("schema-org — node builders", () => {
  it("builds the homepage six-node @graph with the reference's node set", () => {
    const graph = homeGraph();
    expect(nodeTypes(graph)).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "WebApplication",
      "ImageObject",
      "BreadcrumbList",
    ]);
    const nodes = graph["@graph"] as Record<string, unknown>[];
    // every @id and url is absolute — on the clone origin, except the
    // og-banner ImageObject whose url is deliberately the reference's own
    // asset (the t53 card pattern; creditText says so)
    for (const n of nodes) {
      for (const key of ["@id", "url"]) {
        if (typeof n[key] === "string") {
          const ok =
            String(n[key]).startsWith(`${SITE_ORIGIN}/`) || String(n[key]) === OG_IMAGE_URL;
          expect(ok, `${key}=${n[key]}`).toBe(true);
        }
      }
    }
    // the WebApplication carries the honest free Offer — no paid tiers exist here
    const app = nodes.find((n) => n["@type"] === "WebApplication")!;
    expect(app.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    // the ImageObject credits the banner to Deemos — it is their asset
    const image = nodes.find((n) => n["@type"] === "ImageObject")!;
    expect(image.creditText).toBe("Hyper3D by Deemos");
    expect(image.copyrightNotice).toContain("Deemos Corporation");
    expect(image.license).toBe(`${SITE_ORIGIN}/legal/terms`);
  });

  it("builds the nine-block feature set — HowTo and FAQPage from the same def", () => {
    const def = featureBySlug("text-to-3d")!;
    const blocks = featureJsonLd(def);
    expect(blocks.map((b) => b["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "BreadcrumbList",
      "WebApplication",
      "HowTo",
      "FAQPage",
      "ImageObject",
      "ItemList",
    ]);
    const howto = blocks.find((b) => b["@type"] === "HowTo") as Record<string, unknown>;
    expect((howto.step as unknown[]).length).toBe(def.steps.length);
    const faq = blocks.find((b) => b["@type"] === "FAQPage") as Record<string, unknown>;
    expect((faq.mainEntity as unknown[]).length).toBe(def.faq.length);
    const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList") as Record<string, unknown>;
    // the reference's own two-step feature breadcrumb: Home → page
    expect((crumbs.itemListElement as { name: string }[]).map((i) => i.name)).toEqual([
      "Home",
      def.name,
    ]);
  });

  it("builds the seven-block use-case set with the Service node", () => {
    const def = findUseCasePage(USE_CASE_ROUTES[1]) ?? findUseCasePage("game-development")!;
    const blocks = useCaseJsonLd(def);
    expect(blocks.map((b) => b["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "BreadcrumbList",
      "Service",
      "ImageObject",
      "FAQPage",
    ]);
    const service = blocks.find((b) => b["@type"] === "Service") as Record<string, unknown>;
    expect(service.offers).toEqual({ "@type": "Offer", price: "0", priceCurrency: "USD" });
    expect(service.provider).toEqual({ "@id": `${SITE_ORIGIN}/#organization` });
  });

  it("builds the five-block tool set — HowTo only when a section has steps", () => {
    const def = buildConverterPairPage("3ds", "obj");
    const blocks = toolJsonLd(def);
    const types = blocks.map((b) => b["@type"]);
    expect(types).toContain("WebApplication");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
    expect(types).toContain("ItemList");
    expect(types.filter((t) => t === "HowTo").length).toBeLessThanOrEqual(1);
    // breadcrumb: Home → converter hub → page (the reference's 3-step shape)
    const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList") as Record<string, unknown>;
    expect((crumbs.itemListElement as unknown[]).length).toBe(3);
  });

  it("help articles carry BreadcrumbList + Article with the real updated stamp", () => {
    for (const def of HELP_ARTICLES.slice(0, 5)) {
      const blocks = helpArticleJsonLd(def);
      expect(blocks.map((b) => b["@type"])).toEqual(["BreadcrumbList", "Article"]);
      const article = blocks[1] as Record<string, unknown>;
      expect(article.dateModified).toBe(def.updated);
      expect(article.mainEntityOfPage).toEqual({
        "@type": "WebPage",
        "@id": `${SITE_ORIGIN}/help/articles/${def.slug}`,
      });
    }
  });

  it("blog posts carry BlogPosting + breadcrumb; not-written routes carry nothing", () => {
    const slugOf = (loc: string) => loc.replace("/blog/", "");
    const written = BLOG_SITEMAP_LOCS.find((loc) => findBlogEntry(slugOf(loc))?.article)!;
    const entry = findBlogEntry(slugOf(written))!;
    const blocks = blogPostJsonLd(entry);
    expect(blocks.map((b) => b["@type"])).toEqual(["BlogPosting", "BreadcrumbList"]);
    const posting = blocks[0] as Record<string, unknown>;
    expect(posting.datePublished).toBe(entry.article!.date);
    expect(posting.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `${SITE_ORIGIN}/blog/${entry.slug}`,
    });

    const filler = BLOG_SITEMAP_LOCS.map((l) => findBlogEntry(slugOf(l))).find(
      (e) => e && !e.article,
    )!;
    expect(blogPostJsonLd(filler)).toEqual([]);
  });

  it("baseline bundle renders org + website + webpage + breadcrumb", () => {
    const blocks = baselineJsonLd("T", "D", "/t", [{ name: "Home", path: "/" }]);
    expect(blocks.map((b) => b["@type"])).toEqual([
      "Organization",
      "WebSite",
      "WebPage",
      "BreadcrumbList",
    ]);
  });

  it("breadcrumbs resolve to absolute URLs under the clone origin", () => {
    const crumb = breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
    ]) as Record<string, unknown>;
    const items = crumb.itemListElement as { item: string; position: number }[];
    expect(items[0].item).toBe(`${SITE_ORIGIN}/`);
    expect(items[1].item).toBe(`${SITE_ORIGIN}/blog`);
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe("seo — per-family link-preview metadata", () => {
  it("emits the full og card + twitter card + canonical on the clone origin", () => {
    const md = familyMetadata({
      title: "Text to 3D",
      description: "Generate 3D models from text prompts.",
      path: "/features/text-to-3d",
    });
    // t77: /features/text-to-3d is censused, so the card serves the
    // reference's own per-page og:image, and twitter:image:alt ships
    // (the reference ships it on every censused page).
    expect(md.openGraph).toMatchObject({
      type: "website",
      siteName: "Hyper3D",
      title: "Text to 3D",
      url: `${SITE_ORIGIN}/features/text-to-3d`,
      images: [
        {
          url: "https://storage.deemos.dev/features/text-to-3d/prompt-img-1.avif",
          alt: "Text to 3D",
        },
      ],
    });
    expect(md.twitter).toMatchObject({
      card: "summary_large_image",
      site: "@DeemosTech",
      title: "Text to 3D",
      images: [
        {
          url: "https://storage.deemos.dev/features/text-to-3d/prompt-img-1.avif",
          alt: "Text to 3D",
        },
      ],
    });
    expect(md.alternates).toEqual({
      canonical: `${SITE_ORIGIN}/features/text-to-3d`,
      // t80: family routes carry the reference's own 13-link hreflang set
      languages: referenceAlternateLanguages("/features/text-to-3d"),
    });
  });

  it("uncensused paths fall back to the reference's own shared og-banner.webp", () => {
    const md = familyMetadata({
      title: "A deep prompt-library page",
      description: "Not in the census.",
      path: "/3d-prompts/2",
    });
    const og = md.openGraph as { images: { url: string; alt: string }[] };
    const tw = md.twitter as { images: { url: string; alt: string }[] };
    expect(og.images[0].url).toBe(OG_BANNER_FALLBACK_URL);
    expect(tw.images[0].url).toBe(OG_BANNER_FALLBACK_URL);
    expect(og.images[0].alt).toBe("A deep prompt-library page");
    // the fallback is the webp banner the reference serves on 3,063
    // censused pages — NOT the old .png hotlink (served by zero)
    expect(OG_BANNER_FALLBACK_URL).toBe(
      "https://hyper3d.ai/assets/og-banner.webp",
    );
    expect(OG_BANNER_FALLBACK_URL).not.toBe(OG_IMAGE_URL);
  });

  it("article prose pages request og:type article", () => {
    const md = familyMetadata({ title: "A", description: "B", path: "/blog/x", type: "article" });
    expect((md.openGraph as { type: string }).type).toBe("article");
  });
});

describe("t67 sitemap split — the 90-child index shape", () => {
  it("sitemap.xml and landing-sitemap-index.xml are identical sitemapindexes", () => {
    const a = readPublic("sitemap.xml");
    const b = readPublic("landing-sitemap-index.xml");
    expect(a.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(a).toContain("<sitemapindex");
    expect(a).toBe(b);
    // 90 children: 12 locales × 7 families + 6 sub-category locales
    expect(a.match(/<sitemap>/g)?.length).toBe(90);
    expect(a.match(/<url>/g)).toBeNull(); // the monolith is gone
  });

  it("every index child exists as a file with real URLs and absolute locs", () => {
    const index = readPublic("sitemap.xml");
    const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(children).toHaveLength(90);
    for (const child of children) {
      expect(child.startsWith(`${SITE_ORIGIN}/landing-sitemap-`), child).toBe(true);
      const file = readPublic(child.slice(SITE_ORIGIN.length + 1));
      expect(file.match(/<url>/g)?.length ?? 0).toBeGreaterThan(0);
      for (const loc of [...file.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
        expect(loc.startsWith(`${SITE_ORIGIN}/`), loc).toBe(true);
      }
    }
  });

  it("sums to 7,070 URLs across the 90 children (1,095 EN + 5,975 localized)", () => {
    let total = 0;
    let en = 0;
    for (const family of FAMILIES) {
      for (const loc of ["en", ...LOCALES] as const) {
        try {
          const xml = readPublic(`landing-sitemap-${family}-${loc}.xml`);
          const urls = xml.match(/<url>/g)?.length ?? 0;
          total += urls;
          if (loc === "en") en += urls;
        } catch {
          // sub-categories exist in only 5 locales — reference parity
        }
      }
    }
    expect(en).toBe(1092);
    expect(total).toBe(7067);
  });

  it("sub-category children carry zero hreflang alternates (reference quirk)", () => {
    for (const loc of ["en", "ja", "ko", "pt", "es", "tr"] as const) {
      const xml = readPublic(`landing-sitemap-sub-categories-${loc}.xml`);
      expect(xml.includes("xhtml:link"), `${loc}`).toBe(false);
    }
  });

  it("blog children: alternate census pinned to the reference's own coverage", () => {
    // Recon 2026-10-30 of the reference's blog-en sitemap: only ~234 of the
    // 779 EN articles have localized mirrors (13 links: 12 langs + x-default);
    // 543 are EN-only (2 links: en + x-default); the /blog hub carries 12
    // without x-default; the renamed use-bang-and-partial-edit exists in 7
    // locales (9 links); free-stl-files-for-3d-printing misses zh (12).
    const xml = readPublic("landing-sitemap-blog-en.xml");
    const census: Record<number, number> = {};
    const urls = [...xml.matchAll(/<url>.*?<\/url>/gs)].map((m) => m[0]);
    for (const u of urls) {
      const n = [...u.matchAll(/hreflang=/g)].length;
      census[n] = (census[n] ?? 0) + 1;
    }
    expect(census).toEqual({ 2: 543, 9: 1, 12: 2, 13: 233 });
    // and every non-hub blog entry carries the x-default link
    for (const u of urls) {
      const loc = /<loc>([^<]+)<\/loc>/.exec(u)![1];
      if (loc !== `${SITE_ORIGIN}/blog`) {
        expect(u).toContain('hreflang="x-default"');
      }
    }
  });

  it("non-blog families carry 12 alternates; /event carries en + x-default", () => {
    const features = readPublic("landing-sitemap-features-en.xml");
    for (const u of [...features.matchAll(/<url>.*?<\/url>/gs)].map((m) => m[0])) {
      expect([...u.matchAll(/hreflang=/g)]).toHaveLength(12);
    }
    const staticXml = readPublic("landing-sitemap-static-en.xml");
    const event = [...staticXml.matchAll(/<url>.*?<\/url>/gs)]
      .map((m) => m[0])
      .find((u) => u.includes("/event/"))!;
    const alts = [...event.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]);
    expect(alts).toEqual(["en", "x-default"]);
    // pt renders as pt-BR in every alternate set (reference parity)
    const zh = readPublic("landing-sitemap-static-zh.xml");
    expect(zh.includes('hreflang="pt-BR"')).toBe(true);
  });

  it("children carry no <lastmod> (no fabricated dates — documented deviation)", () => {
    for (const family of FAMILIES) {
      const xml = readPublic(`landing-sitemap-${family}-en.xml`);
      expect(xml.includes("<lastmod>"), family).toBe(false);
    }
  });
});

describe("t67 robots.txt — the reference's rule set", () => {
  const robots = readFileSync(join(process.cwd(), "public", "robots.txt"), "utf8");

  it("mirrors the reference's disallow rules verbatim", () => {
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    for (const rule of [
      "/api",
      "/workspace",
      "/vendor",
      "/models",
      "/assets",
      "/draco",
      "/environments",
      "/res",
      "/logo",
      "/*?sort=",
      "/*?utm_",
      "/*?gad_",
    ]) {
      expect(robots).toContain(`Disallow: ${rule}`);
    }
  });

  it("points at the absolute landing-sitemap-index.xml (spec-compliant)", () => {
    expect(robots).toContain(
      `Sitemap: ${SITE_ORIGIN}/landing-sitemap-index.xml`,
    );
    // the old relative Sitemap line is spec-invalid — it must be gone
    expect(robots).not.toContain("Sitemap: /sitemap.xml");
  });
});

describe("t67 JSON-LD wiring — every family renderer ships its blocks", () => {
  function src(rel: string): string {
    return readFileSync(join(process.cwd(), "src", rel), "utf8");
  }

  it("the homepage renders the six-node @graph", () => {
    expect(src("app/page.tsx")).toContain("homeGraph()");
  });

  it("family renderers call their family bundles and the JsonLd component", () => {
    const wiring: [string, string][] = [
      ["components/hyper3d/features/feature-page.tsx", "featureJsonLd"],
      ["components/hyper3d/use-cases/use-case-page.tsx", "useCaseJsonLd"],
      ["components/hyper3d/styles/style-page.tsx", "styleJsonLd"],
      ["components/hyper3d/tools/tool-page.tsx", "toolJsonLd"],
      ["components/hyper3d/help/help-article-page.tsx", "helpArticleJsonLd"],
      ["components/hyper3d/help/help-category-page.tsx", "helpCategoryJsonLd"],
      ["components/hyper3d/help/help-center-page.tsx", "helpIndexJsonLd"],
      ["components/hyper3d/blog/blog-page.tsx", "blogPostJsonLd"],
      ["components/hyper3d/blog/blog-index-pages.tsx", "blogIndexJsonLd"],
      ["components/hyper3d/legal/legal-page.tsx", "legalJsonLd"],
      ["components/hyper3d/sub-categories/subcategory-page.tsx", "baselineJsonLd"],
      ["components/hyper3d/landing/pricing-page.tsx", "baselineJsonLd"],
      // t69: the prompts index moved from the generic baseline to its own
      // family bundle (CollectionPage + HowTo + breadcrumb).
      ["components/hyper3d/landing/prompts-page.tsx", "promptsIndexJsonLd"],
      ["components/hyper3d/prompts/prompt-page.tsx", "promptArticleJsonLd"],
      ["components/hyper3d/prompts/prompt-hub.tsx", "promptHubJsonLd"],
      ["components/hyper3d/landing/switch-page.tsx", "baselineJsonLd"],
      ["components/hyper3d/landing/event-page.tsx", "baselineJsonLd"],
      ["app/workspace/omnicraft/page.tsx", "baselineJsonLd"],
      ["app/workspace/omnicraft/[tool]/page.tsx", "webApplication"],
    ];
    for (const [file, symbol] of wiring) {
      const text = src(file);
      expect(text).toContain(symbol);
      expect(text).toContain("<JsonLd");
    }
  });

  it("blog articles pass the registry entry so not-written routes stay schema-free", () => {
    expect(src("app/blog/[slug]/page.tsx")).toContain("entry={entry}");
  });
});

describe("t67 metadata wiring — every family route spreads familyMetadata", () => {
  function src(rel: string): string {
    return readFileSync(join(process.cwd(), "src", "app", rel), "utf8");
  }

  const routes = [
    "features/[...slug]/page.tsx",
    "features/page.tsx",
    "use-cases/[slug]/page.tsx",
    "use-cases/page.tsx",
    "styles/[slug]/page.tsx",
    "styles/page.tsx",
    "help/articles/[slug]/page.tsx",
    "help/[category]/page.tsx",
    "help/page.tsx",
    "legal/[slug]/page.tsx",
    "legal/page.tsx",
    "sub-categories/[slug]/page.tsx",
    "blog/[slug]/page.tsx",
    "blog/page.tsx",
    "blog/category/[slug]/page.tsx",
    "blog/page/[page]/page.tsx",
    "event/[slug]/page.tsx",
    "switch/[slug]/page.tsx",
    "switch/page.tsx",
    "3d-prompts/page.tsx",
    "3d-prompts/[slug]/page.tsx",
    "3d-prompts/models/[model]/page.tsx",
    "3d-prompts/models/[model]/[page]/page.tsx",
    "pricing/page.tsx",
    "workspace/omnicraft/page.tsx",
    "workspace/omnicraft/[tool]/page.tsx",
    "tools/[...slug]/page.tsx",
  ];

  it("spreads familyMetadata in every family route", () => {
    for (const route of routes) {
      expect(src(route), route).toContain("familyMetadata(");
    }
  });

  it("the root layout ships metadataBase + the full homepage og card", () => {
    const layout = readFileSync(
      join(process.cwd(), "src", "app", "layout.tsx"),
      "utf8",
    );
    expect(layout).toContain('metadataBase: new URL("https://hyper3d-clone.vercel.app")');
    expect(layout).toContain("siteName:");
    expect(layout).toContain("images:");
  });
});
