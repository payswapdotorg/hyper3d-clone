import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticlePage, BlogFillerPage } from "@/components/hyper3d/blog/blog-page";
import { BLOG_CATALOG } from "@/lib/blog-registry";
import { BLOG_RESERVED_SLUGS, findBlogEntry } from "@/lib/blog";

/**
 * /blog/[slug] — all 778 article routes from the registry (single source
 * of truth): a written slug renders the real article; any other catalog
 * slug renders the honest not-written page; everything else — including
 * the reserved single segments that belong to sibling routes (/blog/page,
 * /blog/category, /blog/rss.xml) — 404s into the themed page.
 */
export function generateStaticParams() {
  return BLOG_CATALOG.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBlogEntry(slug);
  if (!entry) return { title: "Article not found" };
  if (entry.family === "written" && entry.article) {
    return {
      title: `${entry.article.title} — Blog — Hyper3D`,
      description: entry.article.description.slice(0, 180),
    };
  }
  return {
    title: `${entry.title} — not written here — Blog — Hyper3D`,
    description:
      "This blog route is kept for reference-sitemap parity and served as an honestly marked page — no article was written for it, and none is faked.",
  };
}

export default async function BlogArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if ((BLOG_RESERVED_SLUGS as readonly string[]).includes(slug)) notFound();
  const entry = findBlogEntry(slug);
  if (!entry) notFound();
  if (entry.family === "written" && entry.article) {
    return <BlogArticlePage def={entry.article} />;
  }
  return <BlogFillerPage entry={entry} />;
}
