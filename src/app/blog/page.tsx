import type { Metadata } from "next";

import { BlogIndexPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_CENSUS } from "@/lib/blog-registry";
import { blogPage, WRITTEN_BLOG_ARTICLES } from "@/lib/blog";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /blog — the front page and pagination page 1 (mirrors the reference,
 * whose /blog and /blog/page/1 are the same list). Featured strip: the six
 * newest written articles; "All articles" carries the catalog's first
 * 40-row slice with the computed status dots.
 */
export const metadata: Metadata = {
  title: referenceTitle("/blog") ?? "Blog — Hyper3D",
  description: referenceDescription("/blog") ?? `The honest blog of an AI-3D workspace clone: ${BLOG_CENSUS.written} written articles anchored to real code, ${BLOG_CENSUS.total - BLOG_CENSUS.written} catalog routes honestly marked instead of faked.`,
  ...familyMetadata({
    title: referenceCardTitle("/blog") ?? "Blog — Hyper3D",
    description: referenceDescription("/blog") ?? `The honest blog of an AI-3D workspace clone: ${BLOG_CENSUS.written} written articles anchored to real code, ${BLOG_CENSUS.total - BLOG_CENSUS.written} catalog routes honestly marked instead of faked.`,
    path: "/blog",
  }),
};

export default function BlogRoute() {
  return (
    <BlogIndexPage
      featured={WRITTEN_BLOG_ARTICLES.slice(0, 6)}
      pageEntries={blogPage(1)}
      page={1}
    />
  );
}
