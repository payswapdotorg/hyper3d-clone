import type { Metadata } from "next";

import { BlogIndexPage } from "@/components/hyper3d/blog/blog-index-pages";
import { BLOG_CENSUS } from "@/lib/blog-registry";
import { blogPage } from "@/lib/blog";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /blog — the front page and pagination page 1 (mirrors the reference,
 * whose /blog and /blog/page/1 are the same list). t84: the page body is
 * the reference's own index anatomy — 4 featured cards, the Categories +
 * Subscribe sidebar, the 12 per-category sections with 3 cards each, the
 * 12-row All Articles cap — computed in blog-index-anatomy; the full
 * 40-row catalog section below it stays as this clone's honesty layer.
 */
export const metadata: Metadata = {
  title: referenceTitle("/blog") ?? "Blog — Hyper3D",
  description: referenceDescription("/blog") ?? `The honest blog of an AI-3D workspace clone: ${BLOG_CENSUS.written} written articles anchored to real code, ${BLOG_CENSUS.total - BLOG_CENSUS.written} catalog routes honestly marked instead of faked.`,
  ...familyMetadata({
    title: referenceCardTitle("/blog") ?? "Blog — Hyper3D",
    description: referenceDescription("/blog") ?? `The honest blog of an AI-3D workspace clone: ${BLOG_CENSUS.written} written articles anchored to real code, ${BLOG_CENSUS.total - BLOG_CENSUS.written} catalog routes honestly marked instead of faked.`,
    path: "/blog",
    // t78: the reference ships its RSS alternate link on every blog
    // index / article / pagination / category page.
    rss: true,
  }),
};

export default function BlogRoute() {
  return <BlogIndexPage pageEntries={blogPage(1)} page={1} />;
}
