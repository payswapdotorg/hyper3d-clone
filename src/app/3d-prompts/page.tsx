import type { Metadata } from "next";

import { PromptsPageView } from "@/components/hyper3d/landing/prompts-page";
import { LANDING_PROMPTS_PAGE } from "@/lib/landing";
import { promptPage } from "@/lib/prompts-registry";
import { familyMetadata } from "@/lib/seo";

/**
 * /3d-prompts — the prompt library index, page 1 (t62's honest page,
 * absorbed by t69 into the reference's full section stack: the
 * #prompt-library card grid with its 17-page pagination, the creator
 * curation, the model-hub rail, the studio's own example prompts, the
 * how-to steps, and the honest note).
 */
export const metadata: Metadata = {
  title: `${LANDING_PROMPTS_PAGE.title} — Hyper3D`,
  description: LANDING_PROMPTS_PAGE.description,
  ...familyMetadata({
    title: `${LANDING_PROMPTS_PAGE.title} — Hyper3D`,
    description: LANDING_PROMPTS_PAGE.description,
    path: "/3d-prompts",
  }),
};

export default function ThreeDPromptsRoute() {
  return <PromptsPageView page={LANDING_PROMPTS_PAGE} entries={promptPage(1)} />;
}
