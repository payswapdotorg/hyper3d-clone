import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromptIndexPageView } from "@/components/hyper3d/landing/prompts-page";
import {
  PromptArticlePage,
  PromptCommunityPage,
} from "@/components/hyper3d/prompts/prompt-page";
import { LANDING_PROMPTS_PAGE } from "@/lib/landing";
import {
  PROMPT_CATALOG,
  PROMPT_PAGE_COUNT,
  PROMPT_RESERVED_SLUGS,
  findPromptEntry,
  isPromptIndexPage,
  promptPage,
} from "@/lib/prompts-registry";
import { familyMetadata } from "@/lib/seo";

/**
 * /3d-prompts/[slug] — the whole library in one route (t69):
 *  - numeric slugs 2..17 render the index pagination pages (page 1 is
 *    the bare /3d-prompts route, /3d-prompts/1 404s — the reference's
 *    own shape);
 *  - any of the 403 registry slugs renders the detail page (written
 *    prompt pages for the 36, honest not-reproduced pages for the 367
 *    community routes);
 *  - "models" is reserved for the sibling hub routes and 404s here;
 *  - everything else 404s.
 */
export function generateStaticParams() {
  return [
    ...Array.from({ length: PROMPT_PAGE_COUNT - 1 }, (_, i) => ({ slug: String(i + 2) })),
    ...PROMPT_CATALOG.map((entry) => ({ slug: entry.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isPromptIndexPage(slug)) {
    const title = `${LANDING_PROMPTS_PAGE.title} / Page ${slug} — Hyper3D`;
    return {
      title,
      description: LANDING_PROMPTS_PAGE.description,
      ...familyMetadata({ title, description: LANDING_PROMPTS_PAGE.description, path: `/3d-prompts/${slug}` }),
    };
  }
  const entry = findPromptEntry(slug);
  if (!entry) return { title: "Prompt not found" };
  if (entry.family === "written" && entry.article) {
    const title = `${entry.article.title} — 3D Prompts — Hyper3D`;
    return {
      title,
      description: entry.article.description.slice(0, 180),
      ...familyMetadata({
        title: entry.article.title,
        description: entry.article.description.slice(0, 180),
        path: `/3d-prompts/${entry.slug}`,
      }),
    };
  }
  const title = `${entry.title} — not reproduced here — 3D Prompts — Hyper3D`;
  return {
    title,
    description:
      "This prompt-library route is kept for reference-route parity and served as an honestly marked page — the reference's community prompt is not reproduced, and none is faked.",
    ...familyMetadata({
      title: `${entry.title} — not reproduced here`,
      description:
        "A reference-parity prompt-library route kept honestly marked — no community prompt is reproduced, and none is faked.",
      path: `/3d-prompts/${entry.slug}`,
    }),
  };
}

export default async function PromptSlugRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if ((PROMPT_RESERVED_SLUGS as readonly string[]).includes(slug)) notFound();
  if (isPromptIndexPage(slug)) {
    return (
      <PromptIndexPageView
        page={LANDING_PROMPTS_PAGE}
        pageNumber={Number(slug)}
        entries={promptPage(Number(slug))}
      />
    );
  }
  const entry = findPromptEntry(slug);
  if (!entry) notFound();
  if (entry.family === "written" && entry.article) {
    return <PromptArticlePage entry={entry} />;
  }
  return <PromptCommunityPage entry={entry} />;
}
