import type { Metadata } from "next";

import { OmniCraftLanding } from "@/components/hyper3d/omnicraft/omnicraft-landing";
import { baselineJsonLd } from "@/lib/schema-org";
import { familyMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * OmniCraft toolbag index — t71: the reference retired its public
 * /omnicraft landing tree (301s to marketing pages, sitemap removal) and
 * serves the toolbag itself at /workspace/omnicraft (probed 2026-10-31,
 * 200). The clone now mirrors that split exactly: this is the tool grid,
 * and it lives under /workspace like the reference's own — robots.txt
 * disallows the whole prefix, and the page doubles down with noindex.
 */

export const metadata: Metadata = {
  title: "OmniCraft — the honest toolbag",
  description:
    "The OmniCraft toolbag: HDRI generation, model viewing, format conversion, and vector tracing run right here in the browser — the other five grid tiles say plainly that they are not part of this clone.",
  robots: { index: false, follow: false },
  ...familyMetadata({
    title: "OmniCraft — the honest toolbag",
    description:
      "The OmniCraft toolbag: HDRI generation, model viewing, format conversion, and vector tracing run right here in the browser — the other five grid tiles say plainly that they are not part of this clone.",
    path: "/workspace/omnicraft",
  }),
};

export default function OmniCraftWorkspacePage() {
  // t67: baseline WebPage + breadcrumb for the toolbag index.
  const jsonLd = baselineJsonLd(
    "OmniCraft — the honest toolbag",
    "Browser-side 3D toolbag: HDRI, viewer, format conversion, vector extrusion — plus honestly marked tiles for the tools this clone does not ship.",
    "/workspace/omnicraft",
    [
      { name: "Home", path: "/" },
      { name: "OmniCraft", path: "/workspace/omnicraft" },
    ],
  );
  return (
    <>
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <OmniCraftLanding />
    </>
  );
}
