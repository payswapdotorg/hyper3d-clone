import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HelpArticlePage } from "@/components/hyper3d/help/help-article-page";
import { HELP_ARTICLE_SLUGS, findHelpArticle } from "@/lib/help";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /help/articles/[slug] — the 33 articles from the registry (single source
 * of truth), SSG'd via generateStaticParams; anything else 404s into the
 * themed not-found page. Same conventions as the other content trees.
 */
export function generateStaticParams() {
  return HELP_ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = findHelpArticle(slug);
  if (!def) return { title: "Article not found" };
  const path = `/help/articles/${def.slug}`;
  return {
    title: referenceTitle(path) ?? `${def.title} — Help Center`,
    description: referenceDescription(path) ?? def.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? def.title, description: referenceDescription(path) ?? def.description.slice(0, 180), path, type: "article" }),
  };
}

export default async function HelpArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = findHelpArticle(slug);
  if (!def) notFound();
  return <HelpArticlePage def={def} />;
}
