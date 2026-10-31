import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ToolPageView } from "@/components/hyper3d/tools/tool-page";
import {
  ConverterIndexView,
  ViewerIndexView,
} from "@/components/hyper3d/tools/tools-index-pages";
import {
  REFERENCE_CONVERTER_PAIRS,
  REFERENCE_IMAGE_TO_FORMATS,
  REFERENCE_VIEWER_FORMATS,
} from "@/lib/tools-registry";
import {
  buildConverterPairPage,
  buildImageToPage,
  buildViewerPage,
} from "@/lib/tools-content";
import { CONVERTER_INDEX } from "@/lib/tools-index-content";
import type { ToolPageDef } from "@/lib/tool-types";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /tools/[...slug] — the whole tools tree in one catch-all (t64),
 * exactly the reference's 203 sitemap routes and nothing else:
 *
 *   /tools/converter                        — the honest 178-pair matrix
 *   /tools/converter/{from}/to/{to}         — 178 pair pages
 *   /tools/image-to-{format}                — 8 flat image-to pages
 *   /tools/viewer                           — the honest 15-format list
 *   /tools/viewer/{format}                  — 15 viewer pages
 *
 * Bare /tools 404s (the reference's sitemap ships no /tools index), the
 * same index-less convention as /event and /sub-categories. Every param
 * set comes from the registries via generateStaticParams — no literals.
 */

/** Resolve a slug array to a leaf page def, or null for unknown routes. */
function resolveToolPage(slug: string[]): ToolPageDef | null {
  // /tools/converter/{from}/to/{to}
  if (slug.length === 4 && slug[0] === "converter" && slug[2] === "to") {
    const from = slug[1];
    const to = slug[3];
    const known = REFERENCE_CONVERTER_PAIRS.some(
      ([f, t]) => f === from && t === to,
    );
    if (!known) return null;
    return buildConverterPairPage(from, to);
  }
  // /tools/image-to-{format}
  if (slug.length === 1 && slug[0].startsWith("image-to-")) {
    const format = slug[0].slice("image-to-".length);
    if (!(REFERENCE_IMAGE_TO_FORMATS as readonly string[]).includes(format)) return null;
    return buildImageToPage(format);
  }
  // /tools/viewer/{format}
  if (slug.length === 2 && slug[0] === "viewer") {
    const format = slug[1];
    if (!(REFERENCE_VIEWER_FORMATS as readonly string[]).includes(format)) return null;
    return buildViewerPage(format);
  }
  return null;
}

/** Every static param: the two indexes + all 201 leaf pages. */
function allToolSlugs(): string[][] {
  const slugs: string[][] = [["converter"]];
  for (const [from, to] of REFERENCE_CONVERTER_PAIRS) {
    slugs.push(["converter", from, "to", to]);
  }
  for (const format of REFERENCE_IMAGE_TO_FORMATS) {
    slugs.push([`image-to-${format}`]);
  }
  slugs.push(["viewer"]);
  for (const format of REFERENCE_VIEWER_FORMATS) {
    slugs.push(["viewer", format]);
  }
  return slugs;
}

export function generateStaticParams() {
  return allToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length === 1 && slug[0] === "converter") {
    return {
      title: referenceTitle("/tools/converter") ?? `${CONVERTER_INDEX.title} — Tools`,
      description: CONVERTER_INDEX.description.slice(0, 180),
      ...familyMetadata({
        title: referenceCardTitle("/tools/converter") ?? CONVERTER_INDEX.title,
        description: CONVERTER_INDEX.description.slice(0, 180),
        path: "/tools/converter",
      }),
    };
  }
  if (slug.length === 1 && slug[0] === "viewer") {
    return {
      title: referenceTitle("/tools/viewer") ?? `${CONVERTER_INDEX.viewerTitle} — Tools`,
      description: CONVERTER_INDEX.viewerDescription.slice(0, 180),
      ...familyMetadata({
        title: referenceCardTitle("/tools/viewer") ?? CONVERTER_INDEX.viewerTitle,
        description: CONVERTER_INDEX.viewerDescription.slice(0, 180),
        path: "/tools/viewer",
      }),
    };
  }
  const def = resolveToolPage(slug);
  if (!def) return { title: "Tool not found" };
  return {
    title: referenceTitle(def.route) ?? `${def.title} — Tools`,
    description: def.description.slice(0, 180),
    ...familyMetadata({ title: referenceCardTitle(def.route) ?? def.title, description: def.description.slice(0, 180), path: def.route }),
  };
}

export default async function ToolsRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (slug.length === 1 && slug[0] === "converter") {
    return <ConverterIndexView />;
  }
  if (slug.length === 1 && slug[0] === "viewer") {
    return <ViewerIndexView />;
  }
  const def = resolveToolPage(slug);
  if (!def) notFound();
  return <ToolPageView def={def} />;
}
