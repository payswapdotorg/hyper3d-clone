import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogCategoryPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { blogArticlesByCategory, blogEntriesByCategory } from "@/lib/blog";
import { EN_CATEGORY_TITLE_NAMES } from "@/lib/locale-blog-terms";
import { familyMetadata } from "@/lib/seo";

/**
 * /blog/category/[slug] — the reference's twelve topic hubs (recon
 * 2026-10-30: news, comparisons, xr, ai-texturing, game-development,
 * prompt-guide, text-to-3d, image-to-3d, insights, 3d-printing, workflow,
 * animation). Each hub lists its written articles as cards and the rest of
 * the topic's computed catalog as marked rows. Unknown categories 404.
 *
 * t79: the head is the reference's own byte-faithful shape (probed on all
 * twelve hubs — recon/t79/heads.json): <title> "{Name} | Blog | Hyper3D"
 * in the reference's own title case ("Text To 3D", not the display name's
 * "Text to 3D"), og:title "{Name} | Blog", the templated description
 * "Browse the latest Hyper3D blog posts in the {Name} category.", the
 * shared og-banner.webp, a self canonical, and ZERO hreflang links (the
 * only family-route class the reference ships without an alternate set).
 */
export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: "Blog topic not found" };
  // The reference's own title-case name for this category (its <title>
  // says "Text To 3D" where the display name says "Text to 3D").
  const name = EN_CATEGORY_TITLE_NAMES[cat.slug];
  const cardTitle = `${name} | Blog`;
  const description = `Browse the latest Hyper3D blog posts in the ${name} category.`;
  const family = familyMetadata({ title: cardTitle, description, path: `/blog/category/${cat.slug}`, rss: true });
  return {
    title: `${cardTitle} | Hyper3D`,
    description,
    ...family,
    // t78: the reference serves its blog category hubs as
    // noindex, follow — crawled for links, kept out of the index —
    // and still carries the RSS alternate link. Verified on every
    // served category of the reference (recon/t78/notes.md).
    robots: "noindex, follow",
    // t79: zero hreflang on the category hubs — the reference's only
    // family-route class without an alternate set (12/12 in the probe);
    // familyMetadata emits none by default, pinned here for intent.
    alternates: {
      canonical: `/blog/category/${cat.slug}`,
      types: {
        "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
      },
    },
  };
}

export default async function BlogCategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = BLOG_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();
  const written = blogArticlesByCategory(cat.slug);
  const entries = blogEntriesByCategory(cat.slug);
  return <BlogCategoryPage category={cat.slug} written={written} entries={entries} />;
}
