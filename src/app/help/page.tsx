import type { Metadata } from "next";

import { HelpCenterPage } from "@/components/hyper3d/help/help-center-page";

/**
 * /help — the Help Center index (search + popular articles + six topic
 * hubs + the honest support block). All content comes from the help
 * registry; the search is a real client-side filter over it.
 */
export const metadata: Metadata = {
  title: "Help Center — honest answers about this Hyper3D workspace",
  description:
    "33 articles across six topics, each stating what genuinely works in this clone, what is partial, and what does not exist here — with the nearest real path named.",
};

export default function HelpRoute() {
  return <HelpCenterPage />;
}
