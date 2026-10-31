import type { Metadata } from "next";

import { OmniCraftToolRouter } from "@/components/hyper3d/omnicraft/tool-router";
import { baselineJsonLd, webApplication, type JsonLdObject } from "@/lib/schema-org";
import { familyMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/hyper3d/json-ld";
import { omnicraftToolBySlug } from "@/lib/omnicraft";

/**
 * Per-tool OmniCraft route at the reference's own workspace URL
 * (/workspace/omnicraft/{tool}, probed 2026-10-31: hdri, viewer, formatcon,
 * vecto3d, mesh, enhancer, remix, search, texture — all 200 on the
 * reference). The slug decides between a real tool and the honest
 * not-in-clone panel; unknown slugs render the same honesty (never a fake
 * product page). t71 moved the toolbag here from the retired public
 * /omnicraft tree (DECISIONS.md #51).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const def = omnicraftToolBySlug(tool);
  const title = def ? `${def.name} — OmniCraft` : "Unknown tool — OmniCraft";
  const description = def
    ? def.blurb
    : "This OmniCraft tool does not exist — neither in the reference's grid nor in this clone.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    ...familyMetadata({ title, description, path: `/workspace/omnicraft/${tool}` }),
  };
}

export default async function OmniCraftToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  // t67: live tools are real browser apps → WebApplication; the honest
  // panels get the plain WebPage + breadcrumb baseline.
  const def = omnicraftToolBySlug(tool);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "OmniCraft", path: "/workspace/omnicraft" },
    ...(def ? [{ name: def.name, path: `/workspace/omnicraft/${def.slug}` }] : []),
  ];
  const jsonLd: JsonLdObject[] = def
    ? [
        ...(def.status === "live"
          ? [webApplication(def.name, def.blurb, `/workspace/omnicraft/${def.slug}`)]
          : []),
        ...baselineJsonLd(def.name, def.blurb, `/workspace/omnicraft/${def.slug}`, crumbs),
      ]
    : [];
  return (
    <>
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <OmniCraftToolRouter slug={tool} />
    </>
  );
}
