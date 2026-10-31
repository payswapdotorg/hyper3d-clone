import type { Metadata } from "next";

import { ToolsMatrixIndexView } from "@/components/hyper3d/tools/tools-matrix-page";
import { hreflangFor } from "@/lib/i18n";
import { TOOLS_MATRIX_INDEX } from "@/lib/tools-index-content";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /tools — the bare tools index (t70). The reference SERVES this page in
 * every language (title "Free AI 3D Tools for Image to 3D, Viewing and
 * Conversion", H1 "Tools Matrix", exactly ten /tools links) but never
 * lists it in any sitemap — the t64 recon read the sitemap as the whole
 * surface and pinned bare /tools as 404; the live site disagrees
 * (recon/locale-deep-trees.md). The clone mirrors the serving behavior
 * and the sitemap silence: this route exists, the sitemap is untouched,
 * and the page itself is the clone's own honest index — computed census,
 * the reference's own link set, and pointers to the four real tools.
 *
 * Metadata mirrors the reference's own shape for this route:
 * self-canonical plus the full 13-link hreflang set (all eleven
 * /{locale}/tools mirrors exist since t70).
 */
export const metadata: Metadata = {
  title: referenceTitle("/tools") ?? `${TOOLS_MATRIX_INDEX.title} — Hyper3D`,
  description: TOOLS_MATRIX_INDEX.description.slice(0, 180),
  ...familyMetadata({
    title: referenceCardTitle("/tools") ?? `${TOOLS_MATRIX_INDEX.title} — Hyper3D`,
    description: TOOLS_MATRIX_INDEX.description.slice(0, 180),
    path: "/tools",
  }),
  alternates: {
    canonical: "/tools",
    languages: hreflangFor("/tools"),
  },
};

export default function ToolsMatrixRoute() {
  return <ToolsMatrixIndexView />;
}
