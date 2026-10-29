import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StylePageView } from "@/components/hyper3d/styles/style-page";
import { findStylePage, STYLE_SLUGS } from "@/lib/styles";

/**
 * /styles/[slug] — the 21 style pages from the registry (single source
 * of truth), SSG'd via generateStaticParams; anything else 404s into
 * the themed not-found page. Same conventions as /features/[...slug],
 * /legal/[slug], and /use-cases/[slug].
 */
export function generateStaticParams() {
  return STYLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = findStylePage(slug);
  if (!def) return { title: "Style not found" };
  return {
    title: `${def.title} — Styles`,
    description: def.description.slice(0, 180),
  };
}

export default async function StyleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = findStylePage(slug);
  if (!def) notFound();
  return <StylePageView def={def} />;
}
