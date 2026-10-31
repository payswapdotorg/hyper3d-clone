import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/hyper3d/legal/legal-page";
import { LEGAL_DOCUMENTS, legalBySlug, legalSlugs } from "@/lib/legal";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /legal/[slug] — the five legal documents from the registry (single source
 * of truth), SSG'd via generateStaticParams; anything else 404s into the
 * themed not-found page.
 */
export function generateStaticParams() {
  return legalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  if (!doc) return { title: "Legal document not found" };
  const path = `/legal/${doc.slug}`;
  return {
    title: referenceTitle(path) ?? `${doc.title} — Legal`,
    description: referenceDescription(path) ?? doc.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? doc.title, description: referenceDescription(path) ?? doc.description.slice(0, 180), path }),
  };
}

export default async function LegalDocRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  if (!doc) notFound();
  return <LegalPage doc={doc} siblings={LEGAL_DOCUMENTS} />;
}
