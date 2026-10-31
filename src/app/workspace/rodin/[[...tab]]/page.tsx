import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import {
  WORKSPACE_TAB_STATIC_PARAMS,
  WORKSPACE_TAB_TITLES,
  tabFromSegments,
} from "@/lib/workspace-tabs";

/**
 * /workspace/rodin — the studio (t68) and, since t72, its tab routes:
 * /workspace/rodin/tab/story and /workspace/rodin/tab/research (probed
 * live 2026-10-31 — the reference's EXPLORE/Story and Research tabs are
 * real URLs now, so the optional catch-all keeps all three on one
 * mounted Studio: generation state survives tab switches exactly like
 * the reference's SPA).
 *
 * Unknown /tab/* segments render the default studio view (the reference
 * serves its shell for any /workspace path and its client router falls
 * back to the default view + default title — probed
 * /workspace/rodin/tab/unknownxyz), so nothing 404s under the root.
 *
 * The inline marker script reproduces the reference shell's pre-paint
 * <head> script verbatim-in-behavior: every studio visit stamps the
 * cookie / sessionStorage / localStorage markers the landing bounce
 * checks (see src/lib/workspace-visit.ts).
 */

export async function generateStaticParams() {
  return WORKSPACE_TAB_STATIC_PARAMS;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}): Promise<Metadata> {
  const { tab } = await params;
  const resolved = tabFromSegments(tab);
  // Byte-identical titles per tab (probed on the reference, 2026-10-31):
  // the default shell title for the studio root, the two collection
  // titles for the sub-tabs; unknown tabs fall back to the default view
  // and the default title, mirroring the reference.
  return { title: WORKSPACE_TAB_TITLES[resolved] };
}

export default async function WorkspaceRodinPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}) {
  // Consumed for its side effect only (title above); the Studio derives
  // its tab from the pathname on the client, so unknown segments fall
  // back to the asset view without a notFound().
  await params;
  return (
    <>
      {/* Inline, dependency-free, and deliberately pre-hydration — the
          reference's own <head> marker script behaves the same way. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp />
    </>
  );
}
