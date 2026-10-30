import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogCategoryPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { blogArticlesByCategory, blogEntriesByCategory } from "@/lib/blog";

/**
 * /blog/category/[slug] — the reference's twelve topic hubs (recon
 * 2026-10-30: news, comparisons, xr, ai-texturing, game-development,
 * prompt-guide, text-to-3d, image-to-3d, insights, 3d-printing, workflow,
 * animation). Each hub lists its written articles as cards and the rest of
 * the topic's computed catalog as marked rows. Unknown categories 404.
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
  return {
    title: `${cat.name} — Blog — Hyper3D`,
    description: cat.blurb.slice(0, 180),
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
