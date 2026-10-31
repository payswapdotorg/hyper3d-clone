/**
 * schema.org structured-data builders (t67).
 *
 * Recon 2026-10-30 of the reference's served HTML shows a rich JSON-LD
 * surface the clone did not yet carry: a six-node @graph on the homepage
 * (Organization / WebSite / WebPage / WebApplication / ImageObject /
 * BreadcrumbList), nine blocks on feature pages, seven on use-case pages
 * (a Service + FAQPage among them), five on tool pages, Article on help
 * articles, CollectionPage / BlogPosting on the blog tree.
 *
 * This module reproduces those SHAPES from THIS clone's own registries —
 * every node is built from the same defs the pages render, so titles,
 * descriptions, FAQ counts and breadcrumb targets can never drift from
 * what a visitor actually sees. Nothing here is hand-copied reference
 * prose; the only reference-owned strings are the honest image
 * attribution lines (the og-banner we hotlink IS Deemos' asset — the
 * t53-established pattern — so the creditText / copyrightNotice say so).
 *
 * Node builders are plain functions returning JSON-able objects; pages
 * render them through <JsonLd> (src/components/hyper3d/json-ld.tsx).
 * All URLs are absolute on SITE_ORIGIN, as schema.org requires.
 */

import type { FeaturePageDef } from "./features-types";
import type { UseCasePageDef } from "./use-case-types";
import type { ToolPageDef } from "./tool-types";
import type { HelpArticleDef, HelpCategoryId, HelpCategoryDef } from "./help-types";
import type { BlogArticleDef, BlogCategory, BlogEntry } from "./blog-types";
import type { LegalDocDef } from "./legal-types";
import type { StylePageDef } from "./style-types";
import type { PromptArticleDef } from "./prompts-types";
import { HELP_CATEGORIES } from "./help";
import { BLOG_CATEGORIES } from "./blog";

/** The blog category def shape shared by blog.ts and blog-types.ts. */
export interface BlogCategoryInfo {
  slug: BlogCategory;
  name: string;
  blurb: string;
}

/** The production origin every absolute URL is built on. */
export const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/**
 * The JSON-LD banner/logo image — the reference's own Organization
 * node pins exactly this storage.deemos.dev URL (t77 probe), and the
 * ImageObject nodes below credit it to Deemos because it is theirs.
 */
export const OG_IMAGE_URL = "https://storage.deemos.dev/assets/og-banner.png";

/**
 * The og:image fallback for routes outside the t77 registry — the
 * banner the reference itself serves on 3,063 censused pages (the
 * /tools matrix, help articles, legal, EN blog) and therefore the
 * honest stand-in for the deep routes it serves but never sitemaps.
 */
export const OG_BANNER_FALLBACK_URL = "https://hyper3d.ai/assets/og-banner.webp";

/** Our real terms route — the license / acquireLicensePage target. */
const TERMS_URL = `${SITE_ORIGIN}/legal/terms`;

/** Every JSON-LD object this library emits. */
export type JsonLdObject = Record<string, unknown>;

/** A breadcrumb step: display name + absolute URL. */
export interface Crumb {
  name: string;
  path: string;
}

const CONTEXT = "https://schema.org";

function absolute(path: string): string {
  return path.startsWith("http") ? path : `${SITE_ORIGIN}${path}`;
}

/* ------------------------------------------------------------------ */
/* Node builders — one per schema.org type the reference ships.       */
/* ------------------------------------------------------------------ */

export function organizationNode(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@id": `${SITE_ORIGIN}/#organization`,
    "@type": "Organization",
    url: `${SITE_ORIGIN}/`,
    logo: OG_IMAGE_URL,
    name: "Hyper3D",
    description:
      "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
  };
}

export function websiteNode(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@id": `${SITE_ORIGIN}/#website`,
    "@type": "WebSite",
    url: `${SITE_ORIGIN}/`,
    name: "Hyper3D",
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
  };
}

export function breadcrumbList(items: Crumb[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  };
}

/** The shared og-banner ImageObject with honest Deemos attribution. */
export function bannerImageNode(name: string, caption: string): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "ImageObject",
    url: OG_IMAGE_URL,
    contentUrl: OG_IMAGE_URL,
    width: 1200,
    height: 625,
    name,
    caption,
    license: TERMS_URL,
    acquireLicensePage: TERMS_URL,
    creditText: "Hyper3D by Deemos",
    copyrightNotice: "\u00a9 Deemos Corporation. All rights reserved.",
  };
}

export function faqPage(faqs: readonly { q: string; a: string }[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function howTo(
  name: string,
  description: string,
  steps: readonly { title: string; body: string }[],
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s) => ({
      "@type": "HowToStep",
      name: s.title,
      text: s.body,
    })),
  };
}

export function webApplication(
  name: string,
  description: string,
  path: string,
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "WebApplication",
    "@id": `${absolute(path)}#webapplication`,
    name,
    description,
    url: absolute(path),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern browser with WebGL enabled.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    mainEntityOfPage: absolute(path),
  };
}

export function serviceNode(
  name: string,
  description: string,
  path: string,
  serviceType: string,
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "Service",
    name,
    description,
    serviceType,
    category: "AI 3D asset generation",
    provider: { "@id": `${SITE_ORIGIN}/#organization` },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: absolute(path),
  };
}

export function webPage(
  name: string,
  description: string,
  path: string,
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "WebPage",
    url: absolute(path),
    name,
    description,
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    primaryImageOfPage: { "@id": OG_IMAGE_URL },
  };
}

export function itemListNode(
  name: string,
  items: readonly { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absolute(it.path),
      item: { "@type": "WebPage", url: absolute(it.path), name: it.name },
    })),
  };
}

/** Help-center articles: the reference's Article shape. */
export function articleNode(
  headline: string,
  description: string,
  path: string,
  dateModified: string,
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline,
    description,
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
    author: { "@type": "Person", name: "Hyper3D" },
    publisher: { "@type": "Organization", name: "Hyper3D", url: SITE_ORIGIN },
    image: OG_IMAGE_URL,
  };
}

export function blogPostingNode(article: BlogArticleDef, path: string): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Person", name: "Hyper3D" },
    publisher: { "@type": "Organization", name: "Hyper3D", url: SITE_ORIGIN },
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
    image: [OG_IMAGE_URL],
  };
}

export function collectionPageNode(
  name: string,
  description: string,
  path: string,
): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "CollectionPage",
    name,
    description,
    url: absolute(path),
    publisher: { "@type": "Organization", name: "Hyper3D", url: SITE_ORIGIN },
    image: {
      "@type": "ImageObject",
      url: OG_IMAGE_URL,
      contentUrl: OG_IMAGE_URL,
      caption: name,
      license: TERMS_URL,
      acquireLicensePage: TERMS_URL,
      creditText: "Hyper3D by Deemos",
      copyrightNotice: "\u00a9 Deemos Corporation. All rights reserved.",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Family bundles — the per-family block sets recon observed.        */
/* ------------------------------------------------------------------ */

/**
 * Homepage: the reference's single six-node @graph
 * (Organization, WebSite, WebPage, WebApplication, ImageObject,
 * BreadcrumbList) in one script tag.
 */
export function homeGraph(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@id": `${SITE_ORIGIN}/#organization`,
        "@type": "Organization",
        url: `${SITE_ORIGIN}/`,
        logo: OG_IMAGE_URL,
        name: "Hyper3D",
        description:
          "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
      },
      {
        "@id": `${SITE_ORIGIN}/#website`,
        "@type": "WebSite",
        url: `${SITE_ORIGIN}/`,
        name: "Hyper3D",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        // t68: the reference's WebSite node lists its 12 serving locales
        // (en + 11); this clone's localized landing tree covers exactly the
        // same set, so the claim is real here.
        inLanguage: [
          "en", "zh", "de", "ja", "ko", "ru", "pt-BR", "fr", "es", "ar", "tr", "it",
        ],
      },
      {
        "@id": `${SITE_ORIGIN}/#webpage`,
        "@type": "WebPage",
        url: `${SITE_ORIGIN}/`,
        name: "Hyper3D Rodin - Best AI 3D Model Generator",
        description:
          "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        primaryImageOfPage: { "@id": `${SITE_ORIGIN}/#primaryimage` },
        about: { "@id": `${SITE_ORIGIN}/#software` },
      },
      {
        "@id": `${SITE_ORIGIN}/#software`,
        "@type": "WebApplication",
        url: `${SITE_ORIGIN}/`,
        name: "Hyper3D",
        description:
          "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
        // t68: the reference's WebApplication node ships a featureList;
        // this one lists what THIS clone's pipeline really does (its
        // exporters write all six formats — EXPORT_FORMATS in hyper3d.ts).
        featureList:
          "Text to 3D, image to 3D, AI texture generation, controllable editing, model optimization, GLB, GLTF, FBX, OBJ, STL and USDZ export",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web browser",
        browserRequirements: "Requires a modern browser with WebGL enabled.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      },
      {
        "@id": `${SITE_ORIGIN}/#primaryimage`,
        "@type": "ImageObject",
        url: OG_IMAGE_URL,
        contentUrl: OG_IMAGE_URL,
        width: 1200,
        height: 625,
        caption: "Hyper3D Rodin AI 3D model generator",
        license: TERMS_URL,
        acquireLicensePage: TERMS_URL,
        creditText: "Hyper3D by Deemos",
        copyrightNotice: "\u00a9 Deemos Corporation. All rights reserved.",
      },
      {
        "@id": `${SITE_ORIGIN}/#breadcrumb`,
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hyper3D", item: `${SITE_ORIGIN}/` },
        ],
      },
    ],
  };
}

/**
 * Feature pages: nine blocks — Organization, WebSite, WebPage,
 * BreadcrumbList (Home → page, the reference's own two-step shape),
 * WebApplication, HowTo (from the registry's steps), FAQPage (from the
 * registry's faq), ImageObject, ItemList (cross-links).
 */
export function featureJsonLd(def: FeaturePageDef): JsonLdObject[] {
  const path = `/features/${def.slug}`;
  return [
    organizationNode(),
    websiteNode(),
    webPage(def.title, def.subline, path),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: def.name, path },
    ]),
    webApplication(def.title, def.subline, path),
    howTo(def.stepsTitle, def.stepsIntro, def.steps),
    faqPage(def.faq),
    bannerImageNode(def.title, def.subline),
    itemListNode(
      "Related Hyper3D feature pages",
      def.crossLinks
        .filter((l) => l.href.startsWith("/features/"))
        .map((l) => ({ name: l.label, path: l.href })),
    ),
  ];
}

/**
 * Use-case pages: seven blocks — Organization, WebSite, WebPage,
 * BreadcrumbList (Home → Use Cases → page), Service (+ free Offer),
 * ImageObject, FAQPage.
 */
export function useCaseJsonLd(def: UseCasePageDef): JsonLdObject[] {
  const path = `/use-cases/${def.slug}`;
  return [
    organizationNode(),
    websiteNode(),
    webPage(def.title, def.description, path),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Use Cases", path: "/use-cases" },
      { name: def.name, path },
    ]),
    serviceNode(def.title, def.description, path, def.subline),
    bannerImageNode(def.title, def.description),
    faqPage(def.faq),
  ];
}

/**
 * Tool pages: five blocks, matching the reference's tool-page set —
 * WebApplication, BreadcrumbList (Home → converter/viewer hub → page),
 * FAQPage, HowTo (first steps section that has any), ItemList
 * (cross-links).
 */
export function toolJsonLd(def: ToolPageDef): JsonLdObject[] {
  const hub = def.route.startsWith("/tools/viewer")
    ? "/tools/viewer"
    : "/tools/converter";
  const stepsSection = def.sections.find((s) => s.steps && s.steps.length > 0);
  return [
    webApplication(def.title, def.description, def.route),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: hub === "/tools/viewer" ? "3D File Viewer" : "3D Format Converter", path: hub },
      { name: def.name, path: def.route },
    ]),
    faqPage(def.faq),
    ...(stepsSection
      ? [howTo(stepsSection.title, stepsSection.intro ?? def.description, stepsSection.steps ?? [])]
      : []),
    itemListNode(
      "Related Hyper3D tool pages",
      def.crossLinks.map((l) => ({ name: l.label, path: l.href })),
    ),
  ];
}

function helpCategoryName(id: HelpCategoryId): string {
  return HELP_CATEGORIES.find((c) => c.slug === id)?.name ?? "Help Center";
}

/** Help articles: BreadcrumbList (Help Center → topic → article) + Article. */
export function helpArticleJsonLd(def: HelpArticleDef): JsonLdObject[] {
  const path = `/help/articles/${def.slug}`;
  return [
    breadcrumbList([
      { name: "Help Center", path: "/help" },
      { name: helpCategoryName(def.category), path: `/help/${def.category}` },
      { name: def.title, path },
    ]),
    articleNode(def.title, def.description, path, def.updated),
  ];
}

/** Help topic hubs: BreadcrumbList + CollectionPage. */
export function helpCategoryJsonLd(def: HelpCategoryDef): JsonLdObject[] {
  return [
    breadcrumbList([
      { name: "Help Center", path: "/help" },
      { name: def.name, path: `/help/${def.slug}` },
    ]),
    collectionPageNode(def.name, def.blurb, `/help/${def.slug}`),
  ];
}

/** The help center index: BreadcrumbList + CollectionPage. */
export function helpIndexJsonLd(): JsonLdObject[] {
  return [
    breadcrumbList([{ name: "Help Center", path: "/help" }]),
    collectionPageNode(
      "Help Center",
      "Answers about accounts, credits, exports, and what this clone does and does not ship.",
      "/help",
    ),
  ];
}

/** Blog index and category hubs: CollectionPage + BreadcrumbList. */
export function blogIndexJsonLd(): JsonLdObject[] {
  return [
    collectionPageNode(
      "Blog",
      "A dedicated Hyper3D blog hub for product notes, workflow ideas, and practical 3D creation updates.",
      "/blog",
    ),
    breadcrumbList([{ name: "Blog", path: "/blog" }]),
  ];
}

export function blogCategoryJsonLd(def: BlogCategoryInfo): JsonLdObject[] {
  return [
    collectionPageNode(def.name, def.blurb, `/blog/category/${def.slug}`),
    breadcrumbList([
      { name: "Blog", path: "/blog" },
      { name: def.name, path: `/blog/category/${def.slug}` },
    ]),
  ];
}

/** Blog pagination pages: CollectionPage + BreadcrumbList. */
export function blogPageJsonLd(n: number): JsonLdObject[] {
  return [
    collectionPageNode(
      `All articles, page ${n}`,
      "The full blog catalog — written articles, honestly marked routes, and the computed census.",
      `/blog/page/${n}`,
    ),
    breadcrumbList([
      { name: "Blog", path: "/blog" },
      { name: `Page ${n}`, path: `/blog/page/${n}` },
    ]),
  ];
}

/**
 * Written blog posts: BlogPosting + BreadcrumbList
 * (Blog → category → post, the reference's three-step shape).
 * The not-written registry entries render the honest router page and
 * carry no BlogPosting — there is no article to describe.
 */
export function blogPostJsonLd(entry: BlogEntry): JsonLdObject[] {
  if (!entry.article) return [];
  const cat: BlogCategoryInfo | undefined = entry.category
    ? BLOG_CATEGORIES.find((c) => c.slug === entry.category)
    : undefined;
  const path = `/blog/${entry.slug}`;
  const crumbs: Crumb[] = [{ name: "Blog", path: "/blog" }];
  if (cat) crumbs.push({ name: cat.name, path: `/blog/category/${cat.slug}` });
  crumbs.push({ name: entry.article.title, path });
  return [blogPostingNode(entry.article, path), breadcrumbList(crumbs)];
}

/** Legal documents: WebPage + BreadcrumbList. */
export function legalJsonLd(doc: LegalDocDef): JsonLdObject[] {
  const path = `/legal/${doc.slug}`;
  return [
    webPage(doc.title, doc.description, path),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Legal", path: "/legal" },
      { name: doc.title, path },
    ]),
  ];
}

/** Style pages: Organization, WebSite, WebPage, BreadcrumbList, FAQPage. */
export function styleJsonLd(def: StylePageDef): JsonLdObject[] {
  const path = `/styles/${def.slug}`;
  return [
    organizationNode(),
    websiteNode(),
    webPage(def.title, def.description, path),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Styles", path: "/styles" },
      { name: def.name, path },
    ]),
    faqPage(def.faq),
  ];
}

/**
 * The generic baseline for families the reference gives a plain
 * WebPage + breadcrumb: pricing, prompts, switch, event, sub-categories,
 * omnicraft, and the family index hubs.
 */
export function baselineJsonLd(
  title: string,
  description: string,
  path: string,
  crumbs: Crumb[],
): JsonLdObject[] {
  return [
    organizationNode(),
    websiteNode(),
    webPage(title, description, path),
    breadcrumbList(crumbs.length > 0 ? crumbs : [{ name: "Home", path: "/" }]),
  ];
}

/* ------------------------------------------------------------------ */
/* Prompt library (t69) — the /3d-prompts tree's block sets.          */
/* ------------------------------------------------------------------ */

/**
 * A written prompt page — the reference's CreativeWork + BreadcrumbList
 * (All prompts → name), carrying this clone's own prompt data. Community
 * routes get NO CreativeWork: there is no prompt here to describe (the
 * t65 rule, applied to prompts).
 */
export function promptArticleJsonLd(
  def: PromptArticleDef,
): JsonLdObject[] {
  const path = `/3d-prompts/${def.slug}`;
  return [
    {
      "@context": CONTEXT,
      "@type": "CreativeWork",
      name: `${def.title} — Studio 3D Prompt`,
      description: def.description,
      url: absolute(path),
      keywords: def.keywords.join(", "),
      author: { "@type": "Person", name: "Hyper3D" },
      publisher: { "@type": "Organization", name: "Hyper3D", url: SITE_ORIGIN },
      mainEntityOfPage: { "@type": "WebPage", "@id": absolute(path) },
      image: OG_IMAGE_URL,
    },
    breadcrumbList([
      { name: "All prompts", path: "/3d-prompts" },
      { name: def.title, path },
    ]),
  ];
}

/** The index (page 1): CollectionPage + HowTo (the real three steps). */
export function promptsIndexJsonLd(
  description: string,
  steps: readonly { title: string; body: string }[],
): JsonLdObject[] {
  return [
    collectionPageNode("Free 3D Prompts & Examples", description, "/3d-prompts"),
    howTo("How to use a 3D prompt", "Three real steps for running a prompt in this studio.", steps),
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Free 3D Prompts & Examples", path: "/3d-prompts" },
    ]),
  ];
}

/** Index pages 2+: the reference's "Page N" CollectionPage + breadcrumb. */
export function promptsIndexPageJsonLd(n: number, description: string): JsonLdObject[] {
  const path = `/3d-prompts/${n}`;
  return [
    collectionPageNode(`Free 3D Prompts & Examples / Page ${n}`, description, path),
    breadcrumbList([{ name: "All prompts", path: "/3d-prompts" }]),
  ];
}

/** Model hubs: CollectionPage + BreadcrumbList (All prompts → Model). */
export function promptHubJsonLd(hub: { name: string; slug: string; claimed: number }): JsonLdObject[] {
  const path = `/3d-prompts/models/${hub.slug}`;
  return [
    collectionPageNode(
      `${hub.name} / Free 3D Prompts & Examples`,
      `${hub.name} prompts on the reference site — ${hub.claimed} community entries indexed by the model they were written for. This clone keeps the route and serves it honestly.`,
      path,
    ),
    breadcrumbList([
      { name: "All prompts", path: "/3d-prompts" },
      { name: hub.name, path },
    ]),
  ];
}
