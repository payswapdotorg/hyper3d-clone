import type { Metadata } from "next";

import { OmniCraftLanding } from "@/components/hyper3d/omnicraft/omnicraft-landing";
import { baselineJsonLd } from "@/lib/schema-org";
import { familyMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * OmniCraft toolbag landing — route parity with the reference's tool grid
 * (recon 2026-10-28: /workspace/omnicraft/* tool pages, nine-tool grid).
 */

export const metadata: Metadata = {
  title: "OmniCraft — the honest toolbag",
  description:
    "The OmniCraft toolbag: HDRI generation, model viewing, format conversion, and vector tracing run right here in the browser — the other five grid tiles say plainly that they are not part of this clone.",
  ...familyMetadata({
    title: "OmniCraft — the honest toolbag",
    description:
      "The OmniCraft toolbag: HDRI generation, model viewing, format conversion, and vector tracing run right here in the browser — the other five grid tiles say plainly that they are not part of this clone.",
    path: "/omnicraft",
  }),
};

export default function OmniCraftPage() {
  // t67: baseline WebPage + breadcrumb for the toolbag landing.
  const jsonLd = baselineJsonLd(
    "OmniCraft — the honest toolbag",
    "Browser-side 3D toolbag: HDRI, viewer, convertor, vector — plus honestly marked tiles for the tools this clone does not ship.",
    "/omnicraft",
    [
      { name: "Home", path: "/" },
      { name: "OmniCraft", path: "/omnicraft" },
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
