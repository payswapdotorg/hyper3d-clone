import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { ShellRedirect } from "@/components/hyper3d/workspace/shell-redirect";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { WORKSPACE_TAB_TITLES } from "@/lib/workspace-tabs";
import {
  IMAGETO3D_LCP_SCRIPT,
  NOT_FOUND_REPLACE_SCRIPT,
  isUuidShape,
} from "@/lib/workspace-shell-routes";

/**
 * /workspace/imageto3d/[uuid] — the imageto3d detail entry (t82,
 * probed 2026-11-01). The reference's shell serves 200 for any uuid
 * shape and its boot script preloads the model's basic render as the
 * LCP image; the client router then looks the model up:
 *
 *   known model   → replace → /workspace/rodin/{uuid} + the detail view
 *                   (exactly-200-char "AI {prompt} 3D Models | …" title)
 *   unknown model → the default studio view AT THIS URL, studio title
 *   invalid shape → replace → /404
 *
 * The clone has no model database, so every uuid takes the reference's
 * own unknown-model branch — the studio view in place — plus the
 * reference's own LCP preload script verbatim (it 404s silently for
 * unknown models on the reference too; behavior-identical). The
 * known-model branch is documented in recon/t82/notes.md for the day
 * a model surface exists. Invalid shapes keep the reference's replace
 * to /404.
 */

type Imageto3dParams = { uuid: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Imageto3dParams>;
}): Promise<Metadata> {
  const { uuid } = await params;
  // The 404-replace shell carries no title (the reference's shell has
  // none pre-replace — title: null suppresses the root layout default);
  // the studio fallback carries the studio title.
  if (!isUuidShape(uuid)) return { title: null };
  return { title: WORKSPACE_TAB_TITLES.asset };
}

export default async function WorkspaceImageto3dUuidPage({
  params,
}: {
  params: Promise<Imageto3dParams>;
}) {
  const { uuid } = await params;

  if (!isUuidShape(uuid)) {
    return <ShellRedirect script={NOT_FOUND_REPLACE_SCRIPT} />;
  }

  return (
    <>
      {/* The reference shell's own imageto3d boot script, verbatim: it
          re-derives the uuid from the pathname, stamps
          data-initial-imageto3d-detail, and preloads the model's basic
          render from the reference's CDN (fetchpriority=high). */}
      <script dangerouslySetInnerHTML={{ __html: IMAGETO3D_LCP_SCRIPT }} />
      {/* The shared-shell visit markers — this is a /workspace route. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp />
    </>
  );
}
