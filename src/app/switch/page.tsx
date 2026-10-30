import type { Metadata } from "next";

import { SwitchPageView } from "@/components/hyper3d/landing/switch-page";
import { SWITCH_INDEX_PAGE } from "@/lib/landing";
import { familyMetadata } from "@/lib/seo";

/**
 * /switch — the Meshy/Tripo migration page, honestly (t62). The
 * reference's URL carries a migration offer; this clone has no offer
 * engine, no verification flow, and no subscriptions to discount, so
 * the page reproduces the anatomy and inverts every promise, pointing
 * at the free studio and the real price list instead.
 */
export const metadata: Metadata = {
  title: `${SWITCH_INDEX_PAGE.title} — Hyper3D`,
  description: SWITCH_INDEX_PAGE.description,
  ...familyMetadata({ title: `${SWITCH_INDEX_PAGE.title} — Hyper3D`, description: SWITCH_INDEX_PAGE.description, path: "/switch" }),
};

export default function SwitchRoute() {
  return <SwitchPageView page={SWITCH_INDEX_PAGE} />;
}
