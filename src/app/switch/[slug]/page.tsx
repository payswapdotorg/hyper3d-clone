import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SwitchPageView } from "@/components/hyper3d/landing/switch-page";
import { SWITCH_PAGES, switchPageBySlug } from "@/lib/landing";

/**
 * /switch/[slug] — the switch tree's child pages (t62). Only makerworld
 * exists, here and at the reference; anything else 404s into the themed
 * not-found page. Same conventions as /styles/[slug] and
 * /help/articles/[slug].
 */
export function generateStaticParams() {
  return SWITCH_PAGES.filter((page) => page.slug !== "index").map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = switchPageBySlug(slug);
  if (!page || page.slug === "index") return { title: "Switch page not found" };
  return {
    title: `${page.title} — Hyper3D`,
    description: page.description.slice(0, 180),
  };
}

export default async function SwitchSlugRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = switchPageBySlug(slug);
  if (!page || page.slug === "index") notFound();
  return <SwitchPageView page={page} />;
}
