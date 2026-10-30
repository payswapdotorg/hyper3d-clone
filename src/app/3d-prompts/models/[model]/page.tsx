import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromptHubView } from "@/components/hyper3d/prompts/prompt-hub";
import { PROMPT_HUBS, findPromptHub } from "@/lib/prompts-registry";
import { REFERENCE_HUB_MEMBERS } from "@/lib/prompts-registry-data";
import { familyMetadata } from "@/lib/seo";

/**
 * /3d-prompts/models/[model] — the 11 model-hub routes (t69), page 1 of
 * each. Every hub serves its member routes as honest status rows, 24 per
 * page; the two big hubs paginate (gpt-6-astra /2…/11, claude-fable-5.1
 * /2…/4 — the reference's own page math, mirrored exactly).
 */
export function generateStaticParams() {
  return PROMPT_HUBS.map((hub) => ({ model: hub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model } = await params;
  const hub = findPromptHub(model);
  if (!hub) return { title: "Model hub not found" };
  const title = `${hub.name} — Free 3D Prompts & Examples — Hyper3D`;
  return {
    title,
    description: `The ${hub.name} prompt hub, kept for route parity: the reference files ${hub.claimed} community prompts under this third-party model. This clone keeps the routes and serves them honestly — its prompts run in its own studio.`,
    ...familyMetadata({
      title: `${hub.name} — Free 3D Prompts & Examples`,
      description: `The ${hub.name} prompt hub kept for route parity — the reference's community prompts are not reproduced; this clone's own prompts run in its studio.`,
      path: `/3d-prompts/models/${hub.slug}`,
    }),
  };
}

export default async function PromptModelHubRoute({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;
  const hub = findPromptHub(model);
  if (!hub) notFound();
  return <PromptHubView hub={hub} page={1} memberSlugs={REFERENCE_HUB_MEMBERS[hub.slug].slice(0, 24)} />;
}
