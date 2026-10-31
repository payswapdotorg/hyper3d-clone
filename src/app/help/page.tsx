import type { Metadata } from "next";

import { HelpCenterPage } from "@/components/hyper3d/help/help-center-page";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /help — the Help Center index (search + popular articles + six topic
 * hubs + the honest support block). All content comes from the help
 * registry; the search is a real client-side filter over it.
 */
export const metadata: Metadata = {
  title: referenceTitle("/help") ?? "Help Center — honest answers about this Hyper3D workspace",
  description: referenceDescription("/help") ??
    "33 articles across six topics, each stating what genuinely works in this clone, what is partial, and what does not exist here — with the nearest real path named.",
  ...familyMetadata({ title: referenceCardTitle("/help") ?? "Help Center — honest answers about this Hyper3D workspace", description: referenceDescription("/help") ?? "33 articles across six topics, each stating what genuinely works in this clone, what is partial, and what does not exist here — with the nearest real path named.", path: "/help" }),
};

export default function HelpRoute() {
  return <HelpCenterPage />;
}
