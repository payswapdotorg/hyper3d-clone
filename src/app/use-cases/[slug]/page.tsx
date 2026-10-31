import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UseCasePage } from "@/components/hyper3d/use-cases/use-case-page";
import { findUseCasePage, USE_CASE_SLUGS } from "@/lib/use-cases";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /use-cases/[slug] — the 11 use-case pages from the registry (single
 * source of truth), SSG'd via generateStaticParams; anything else 404s
 * into the themed not-found page. Same conventions as /features/[...slug]
 * and /legal/[slug].
 */
export function generateStaticParams() {
  return USE_CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = findUseCasePage(slug);
  if (!def) return { title: "Use case not found" };
  const path = `/use-cases/${def.slug}`;
  return {
    title: referenceTitle(path) ?? `${def.title} — Use Cases`,
    description: def.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? def.title, description: def.description.slice(0, 180), path }),
  };
}

export default async function UseCaseRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = findUseCasePage(slug);
  if (!def) notFound();
  return <UseCasePage def={def} />;
}
