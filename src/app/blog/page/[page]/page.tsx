import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogListPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_PAGE_COUNT } from "@/lib/blog-registry";
import { blogPage } from "@/lib/blog";

/**
 * /blog/page/[page] — the pagination surface (the reference pages its 778
 * articles across 20 pages; ours computes the same math from the catalog).
 * Params come from the registry only — no smuggled literals — and pages
 * outside 2..BLOG_PAGE_COUNT 404. Page 1 lives at /blog itself.
 */
export function generateStaticParams() {
  const pages: { page: string }[] = [];
  for (let p = 2; p <= BLOG_PAGE_COUNT; p++) pages.push({ page: String(p) });
  return pages;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2 || n > BLOG_PAGE_COUNT) return { title: "Blog not found" };
  return {
    title: `All articles, page ${n} — Blog — Hyper3D`,
    description: `The full blog catalog, 40 routes per page — written articles, honestly marked routes, and the computed census.`,
  };
}

export default async function BlogPageRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2 || n > BLOG_PAGE_COUNT) notFound();
  const entries = blogPage(n);
  if (entries.length === 0) notFound();
  return <BlogListPage pageEntries={entries} page={n} />;
}
