/**
 * Tools index pages (t64) — the two real indexes in the /tools tree:
 * /tools/converter (the honest 178-pair matrix) and /tools/viewer
 * (the honest 15-format list). The reference's sitemap ships no other
 * /tools indexes (no bare /tools, no image-to index — both 404, like
 * /event and /sub-categories before them).
 *
 * Same honesty contract as the leaf pages: statuses are computed, the
 * census (24 / 46 / 108) is derived from the registry, and every chip
 * links a route that genuinely exists in this tree.
 */

import {
  REFERENCE_VIEWER_FORMATS,
  converterPairsByFrom,
  converterPairStatus,
  viewerFormatStatus,
} from "./tools-registry";
import { toolFormat } from "./tool-formats";
import type { ToolLink } from "./tool-types";

export interface ConverterIndexGroup {
  from: string;
  fromName: string;
  pairs: { to: string; toName: string; href: string; status: string }[];
}

/** The /tools/converter matrix: every pair, grouped by source format. */
export function converterIndexGroups(): ConverterIndexGroup[] {
  return converterPairsByFrom().map(({ from, tos }) => ({
    from,
    fromName: toolFormat(from)?.name ?? from.toUpperCase(),
    pairs: tos.map((to) => ({
      to,
      toName: toolFormat(to)?.name ?? to.toUpperCase(),
      href: `/tools/converter/${from}/to/${to}`,
      status: converterPairStatus(from, to),
    })),
  }));
}

/** The /tools/viewer list: 15 formats with computed statuses. */
export function viewerIndexFormats(): {
  slug: string;
  name: string;
  href: string;
  status: string;
}[] {
  return REFERENCE_VIEWER_FORMATS.map((slug) => ({
    slug,
    name: toolFormat(slug)?.name ?? slug.toUpperCase(),
    href: `/tools/viewer/${slug}`,
    status: viewerFormatStatus(slug),
  }));
}

export const CONVERTER_INDEX = {
  title: "3D File Converter Matrix",
  description:
    "All 178 converter pairs, honestly statused: 24 run as real task re-exports, 46 have a real generative path, 108 do not exist here. Every page says which.",
  subline:
    "The reference's converter accepts 25 input formats and converts them in the browser. This clone's conversion surface is narrower, and this matrix states it exactly — every pair below links to a page that says what runs, what generates, and what does not exist.",
  censusIntro:
    "The census, computed from the real exporters and tools — not hand-written, so it cannot drift:",
  viewerTitle: "3D Viewer Formats",
  viewerDescription:
    "All 15 viewer formats, honestly statused: GLB and GLTF are live in the local Model Viewer; the other 13 do not open here.",
  viewerSubline:
    "The reference's viewer opens DCC and CAD formats in the browser. This clone's Model Viewer parses GLB/GLTF only — locally, never uploaded — and the list below says which is which.",
};

/** The bare /tools index (t70) — the reference serves this page without
 * ever sitemapping it (recon/locale-deep-trees.md). Clone-own copy: the
 * reference's own link set (the 8 image-to routes + the viewer and
 * converter hubs), the honest census, and where the four REAL tools
 * actually live. */
export const TOOLS_MATRIX_INDEX = {
  title: "AI 3D Tools — the honest index",
  description:
    "Every /tools route in this clone, honestly statused: 178 converter pairs, 15 viewer formats, 8 image-to routes — plus the four real OmniCraft tools. Each page says what runs, what generates, and what does not exist here.",
  hero: {
    eyebrow: "TOOLS",
    headline: "The tools matrix, honestly statused",
    subline:
      "The reference's /tools page links its image-to, viewer, and converter surfaces. This clone serves the same 203 tool routes — and every one of them opens a page that states, in its first breath, whether the tool actually runs in this codebase. Nothing on this index promises a tool the repo does not ship.",
  },
  bands: {
    imageToTitle: "Image-to format tools",
    imageToBody:
      "Eight routes, one honest split: image-to-3D generation is a live studio feature, and a confirmed task exports as any of the six formats the exporters ship. The other two routes say plainly that their format is not an export target here.",
    viewerConverterTitle: "Viewer and converter tools",
    viewerConverterBody:
      "The converter matrix covers all 178 pairs the reference ships — 24 run as real task re-exports, 46 have a real generative path, 108 do not exist here. The viewer list covers 15 formats — GLB and GLTF open in the local Model Viewer, the other 13 do not.",
    realToolsTitle: "The four tools that really run here",
    realToolsBody:
      "Beyond the statused routes, four tools genuinely execute in this repo — the Format Convertor and Model Viewer from the OmniCraft toolbag, plus the studio's own generation modes.",
  },
};

/** Shared links for the index pages' cross-link sections. */
export const TOOLS_INDEX_LINKS: ToolLink[] = [
  { label: "Format Convertor (live tool)", href: "/omnicraft/convertor" },
  { label: "Model Viewer (live tool)", href: "/omnicraft/viewer" },
  { label: "Vector to 3D (live tool)", href: "/omnicraft/vector" },
  { label: "Image to 3D (the real feature)", href: "/features/image-to-3d" },
];
