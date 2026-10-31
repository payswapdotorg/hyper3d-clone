import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventPageView } from "@/components/hyper3d/landing/event-page";
import { EVENT_PAGES, eventPageBySlug } from "@/lib/landing";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /event/[slug] — the event pages (t62). Only chroma-awards exists,
 * here and at the reference; there is deliberately no /event index
 * (the reference's sitemap has none either), so the bare /event path
 * 404s into the themed not-found page. Same conventions as
 * /switch/[slug].
 */
export function generateStaticParams() {
  return EVENT_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = eventPageBySlug(slug);
  if (!page) return { title: "Event page not found" };
  const path = `/event/${page.slug}`;
  return {
    title: referenceTitle(path) ?? `${page.title} — Hyper3D`,
    description: referenceDescription(path) ?? page.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(path) ?? page.title, description: referenceDescription(path) ?? page.description.slice(0, 180), path }),
  };
}

export default async function EventSlugRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = eventPageBySlug(slug);
  if (!page) notFound();
  return <EventPageView page={page} />;
}
