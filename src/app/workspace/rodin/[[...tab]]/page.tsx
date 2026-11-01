import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { ShellRedirect } from "@/components/hyper3d/workspace/shell-redirect";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { WORKSPACE_TAB_STATIC_PARAMS, WORKSPACE_TAB_TITLES } from "@/lib/workspace-tabs";
import {
  NOT_FOUND_REPLACE_SCRIPT,
  RODIN_NORMALIZE_SCRIPT,
  classifyRodinChild,
} from "@/lib/workspace-shell-routes";

/**
 * /workspace/rodin — the studio (t68) and, since t72, its tab routes:
 * /workspace/rodin/tab/story and /workspace/rodin/tab/research (probed
 * live 2026-10-31 — the reference's EXPLORE/Story and Research tabs are
 * real URLs now, so the optional catch-all keeps all three on one
 * mounted Studio: generation state survives tab switches exactly like
 * the reference's SPA).
 *
 * t82 refines the non-canonical shapes (all re-probed 2026-11-01):
 *
 *   /workspace/rodin/{uuid}          the studio view AT THIS URL — the
 *                                    reference's own unknown-model fallback
 *                                    (its client looks the uuid up; unknown
 *                                    renders the studio, URL unchanged). The
 *                                    clone has no model database, so this is
 *                                    every uuid — the honest state.
 *   /workspace/rodin/tab (bare) and  pre-paint replace → /workspace/rodin
 *   any non-canonical /tab/* depth   (probed /tab and /tab/a/b both land
 *                                    back on the studio root)
 *   /workspace/rodin/{single
 *    non-uuid segment}               pre-paint replace → /404 (the reference's
 *                                    client 404s these — probed twice — via
 *                                    its own /404 route)
 *   /workspace/rodin/{x}/{y} with    pre-paint replace → /workspace/rodin
 *    first segment ≠ tab
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
  const view = classifyRodinChild(tab);
  // Byte-identical titles per class: the default shell title for the
  // studio root and the uuid fallback (the reference's client sets it
  // post-boot on both), the two collection titles for the sub-tabs.
  // The transient replace shells carry no <title> — the reference's
  // shell serves none pre-replace.
  switch (view.kind) {
    case "studio":
      return { title: WORKSPACE_TAB_TITLES.asset };
    case "model":
      return { title: WORKSPACE_TAB_TITLES.asset };
    case "tab":
      return { title: WORKSPACE_TAB_TITLES[view.tab] };
    default:
      // the transient replace shells — no title (title: null suppresses
      // the root layout's default <title>)
      return { title: null };
  }
}

export default async function WorkspaceRodinPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}) {
  const { tab } = await params;
  const view = classifyRodinChild(tab);

  if (view.kind === "normalize-root") {
    return <ShellRedirect script={RODIN_NORMALIZE_SCRIPT} />;
  }
  if (view.kind === "not-found") {
    return <ShellRedirect script={NOT_FOUND_REPLACE_SCRIPT} />;
  }

  // studio | model | tab — the mounted Studio in every rendering shape;
  // the Studio derives its tab from the pathname on the client.
  return (
    <>
      {/* Inline, dependency-free, and deliberately pre-hydration — the
          reference's own <head> marker script behaves the same way. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp />
    </>
  );
}
