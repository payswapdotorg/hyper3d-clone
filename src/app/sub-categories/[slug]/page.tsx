import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SubCategoryPageView } from "@/components/hyper3d/sub-categories/subcategory-page";
import { SUBCATEGORY_SLUGS, findSubCategory } from "@/lib/subcategories";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /sub-categories/[slug] — the three collection pages from the registry
 * (single source of truth), SSG'd via generateStaticParams; anything
 * else 404s into the themed not-found page. There is deliberately NO
 * /sub-categories index route: the reference's sitemap ships none, and
 * bare /event (t62) set the precedent for index-less trees. Same
 * conventions as /styles/[slug] and /event/[slug].
 */
export function generateStaticParams() {
  return SUBCATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = findSubCategory(slug);
  if (!def) return { title: "Collection not found" };
  const path = `/sub-categories/${def.slug}`;
  return {
    title: referenceTitle(path) ?? `${def.title} — Sub-Categories`,
    description: def.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? def.title, description: def.description.slice(0, 180), path }),
  };
}

export default async function SubCategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = findSubCategory(slug);
  if (!def) notFound();
  return <SubCategoryPageView def={def} />;
}
