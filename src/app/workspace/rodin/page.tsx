import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";

/**
 * /workspace/rodin — the studio (t68).
 *
 * Recon 2026-10-31: the reference serves its studio here (the marketing
 * landing lives at `/` and bounces returning visitors to `/workspace`).
 * This clone used to mount the studio at `/` and redirect
 * /workspace/rodin → /; t68 restores the reference's URL shape, so this
 * is now the real route and `/` is the landing page.
 *
 * The inline marker script reproduces the reference shell's pre-paint
 * <head> script verbatim-in-behavior: every studio visit stamps the
 * cookie / sessionStorage / localStorage markers the landing bounce
 * checks (see src/lib/workspace-visit.ts).
 */

export const metadata: Metadata = {
  // Byte-identical to the reference's served <title> for the workspace
  // shell — the standing drift anchor (t49/t51/t53); the reference ships
  // no meta description on the shell.
  title:
    "Rodin AI - Free AI 3D Model Generator For Everyone | Instantly Create Stunning 3D Assets, 3D Models, and 3D Objects - Create 3D Designs Powered by AI | Hyper3D",
  // The workspace is robots-disallowed (robots.txt mirrors the reference's
  // `Disallow: /workspace`), so crawlers never index this card anyway.
};

export default function WorkspaceRodinPage() {
  return (
    <>
      {/* Inline, dependency-free, and deliberately pre-hydration — the
          reference's own <head> marker script behaves the same way. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp />
    </>
  );
}
