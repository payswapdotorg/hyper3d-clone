import type { Metadata } from "next";

import { PromptsPageView } from "@/components/hyper3d/landing/prompts-page";
import { LANDING_PROMPTS_PAGE } from "@/lib/landing";
import { familyMetadata } from "@/lib/seo";

/**
 * /3d-prompts — the real example-prompt hub (t62). Every card on this
 * page is a prompt that works in the text-to-3D studio at the root of
 * this site; the three featured cards are the studio's own placeholder
 * examples. No community gallery, no model-name filters, no video
 * embeds — the page says so, and points at the real polish button, the
 * four generation modes, and the 21 style pages instead.
 */
export const metadata: Metadata = {
  title: `${LANDING_PROMPTS_PAGE.title} — Hyper3D`,
  description: LANDING_PROMPTS_PAGE.description,
  ...familyMetadata({ title: `${LANDING_PROMPTS_PAGE.title} — Hyper3D`, description: LANDING_PROMPTS_PAGE.description, path: "/3d-prompts" }),
};

export default function ThreeDPromptsRoute() {
  return <PromptsPageView page={LANDING_PROMPTS_PAGE} />;
}
