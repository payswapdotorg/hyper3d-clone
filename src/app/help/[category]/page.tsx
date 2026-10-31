import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HelpCategoryPage } from "@/components/hyper3d/help/help-category-page";
import { HELP_CATEGORY_SLUGS, findHelpCategory, helpArticlesByCategory } from "@/lib/help";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /help/[category] — the six topic hubs from the registry (single source
 * of truth), SSG'd via generateStaticParams; anything else 404s into the
 * themed not-found page. Same conventions as /features/[...slug],
 * /legal/[slug], /use-cases/[slug] and /styles/[slug].
 *
 * Note: /help/articles/[slug] is a separate static route tree, so the
 * dynamic [category] segment never captures it; /help/articles on its own
 * resolves here with an unknown category slug and 404s honestly.
 */
export function generateStaticParams() {
  return HELP_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const def = findHelpCategory(category);
  if (!def) return { title: "Help topic not found" };
  const path = `/help/${def.slug}`;
  return {
    title: referenceTitle(path) ?? `${def.name} — Help Center`,
    description: def.blurb.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? def.name, description: def.blurb.slice(0, 180), path }),
  };
}

export default async function HelpCategoryRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const def = findHelpCategory(category);
  if (!def) notFound();
  return <HelpCategoryPage category={def} articles={helpArticlesByCategory(def.slug)} />;
}
