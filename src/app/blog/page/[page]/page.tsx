import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogListPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_PAGE_COUNT } from "@/lib/blog-registry";
import { blogPage } from "@/lib/blog";
import { referenceDescription } from "@/lib/reference-descriptions";
import { hreflangFor } from "@/lib/i18n";
import { familyMetadata } from "@/lib/seo";

/**
 * /blog/page/[page] — the pagination surface (the reference pages its 778
 * articles across 20 pages; ours computes the same math from the catalog).
 * Params come from the registry only — no smuggled literals — and pages
 * outside 2..BLOG_PAGE_COUNT 404. Page 1 lives at /blog itself.
 *
 * t79: the head is the reference's own byte-faithful shape (probed on all
 * 19 pages — recon/t79/heads.json): <title> "Blog — Page {n} | Hyper3D",
 * og:title "Blog — Page {n}", the description is the index description
 * prefixed "Page {n}: ", and BOTH the canonical and og:url alias to /blog
 * (never the pagination URL itself) while the 13-link hreflang set still
 * points page-for-page at every locale's pagination route.
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
  // The reference's own index description with its "Page {n}: " prefix —
  // the pinned t76 registry value, falling back to the honest template.
  const indexDescription =
    referenceDescription("/blog") ??
    "The honest blog of an AI-3D workspace clone: written articles anchored to real code, honestly marked catalog routes.";
  const description = `Page ${n}: ${indexDescription}`;
  const cardTitle = `Blog — Page ${n}`;
  // t77 wiring: uncensused pagination paths fall back to the shared
  // og-banner.webp — exactly the image the reference serves here.
  const family = familyMetadata({
    title: cardTitle,
    description,
    path: `/blog/page/${n}`,
    // t78: the reference ships the RSS alternate link on its blog
    // pagination too (recon/t78/notes.md).
    rss: true,
  });
  return {
    title: `${cardTitle} | Hyper3D`,
    description,
    ...family,
    // t79: canonical + og:url alias to /blog, hreflang stays page-for-page.
    alternates: {
      canonical: "/blog",
      languages: hreflangFor(`/blog/page/${n}`),
      types: {
        "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
      },
    },
    openGraph: {
      ...family.openGraph,
      url: "/blog",
    },
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
