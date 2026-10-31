import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { featureBySlug, featureSlugs } from "@/lib/features";
import { FeaturePage } from "@/components/hyper3d/features/feature-page";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * Catch-all for the reference's 19 feature pages (nested slugs like
 * "mcp/mcp-claude" and "omnicraft/ai-hdri-generator" live here). Slugs come
 * from the registry — the single source of truth — via generateStaticParams;
 * anything else 404s into the themed not-found page (never a fake product).
 */
export function generateStaticParams() {
  return featureSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = featureBySlug(slug.join("/"));
  if (!def) return { title: "Feature not found" };
  const path = `/features/${def.slug}`;
  return {
    title: referenceTitle(path) ?? `${def.title} — Features`,
    description: def.subline.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? def.title, description: def.subline.slice(0, 180), path }),
  };
}

export default async function FeaturePageRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const def = featureBySlug(slug.join("/"));
  if (!def) notFound();
  return <FeaturePage def={def} />;
}
