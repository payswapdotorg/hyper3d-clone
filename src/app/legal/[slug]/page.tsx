import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/hyper3d/legal/legal-page";
import { LEGAL_DOCUMENTS, legalBySlug, legalSlugs } from "@/lib/legal";

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
  return {
    title: `${doc.title} — Legal`,
    description: doc.description.slice(0, 180),
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
