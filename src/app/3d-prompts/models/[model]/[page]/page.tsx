import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromptHubView } from "@/components/hyper3d/prompts/prompt-hub";
import { HUB_PAGE_SIZE, PROMPT_HUBS, findPromptHub } from "@/lib/prompts-registry";
import { REFERENCE_HUB_MEMBERS } from "@/lib/prompts-registry-data";
import { familyMetadata } from "@/lib/seo";

/**
 * /3d-prompts/models/[model]/[page] — hub pagination (t69). Only two
 * hubs have more than one page (gpt-6-astra: 11, claude-fable-5.1: 4 —
 * 24 members per page, the reference's own math). /<model>/1 404s: page
 * 1 is the bare hub route, exactly as the reference behaves.
 */
export function generateStaticParams() {
  return PROMPT_HUBS.flatMap((hub) =>
    Array.from({ length: hub.pages - 1 }, (_, i) => ({ model: hub.slug, page: String(i + 2) })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string; page: string }>;
}): Promise<Metadata> {
  const { model, page } = await params;
  const hub = findPromptHub(model);
  if (!hub || !/^\d+$/.test(page) || Number(page) < 2 || Number(page) > hub.pages) {
    return { title: "Model hub not found" };
  }
  const title = `${hub.name} / Free 3D Prompts & Examples / Page ${page} — Hyper3D`;
  return {
    title,
    description: `Page ${page} of the ${hub.name} prompt hub — ${hub.claimed} member routes kept for parity, served honestly.`,
    ...familyMetadata({
      title: `${hub.name} / Free 3D Prompts & Examples / Page ${page}`,
      description: `Page ${page} of the ${hub.name} prompt hub — member routes kept for parity, served honestly.`,
      path: `/3d-prompts/models/${hub.slug}/${page}`,
    }),
  };
}

export default async function PromptModelHubPageRoute({
  params,
}: {
  params: Promise<{ model: string; page: string }>;
}) {
  const { model, page } = await params;
  const hub = findPromptHub(model);
  if (!hub || !/^\d+$/.test(page)) notFound();
  const n = Number(page);
  if (n < 2 || n > hub.pages) notFound();
  const memberSlugs = REFERENCE_HUB_MEMBERS[hub.slug].slice((n - 1) * HUB_PAGE_SIZE, n * HUB_PAGE_SIZE);
  return <PromptHubView hub={hub} page={n} memberSlugs={memberSlugs} />;
}
