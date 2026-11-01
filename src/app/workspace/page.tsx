import type { Metadata } from "next";

import { ShellRedirect } from "@/components/hyper3d/workspace/shell-redirect";
import { WORKSPACE_ROOT_REPLACE_SCRIPT } from "@/lib/workspace-shell-routes";

/**
 * /workspace — the bare workspace root (t82, probed 2026-11-01): the
 * reference serves its SPA shell here (HTTP 200, no title) and the
 * client router replaces to /workspace/rodin. The t68 302 is retired
 * — this route is the reference's own 200-then-replace shape.
 *
 * A dedicated page rather than part of the [...rest] catch-all: the
 * reference's client treats the bare root and unknown children
 * differently (root replaces; unknown children render the studio view
 * in place), and a bare page + mandatory catch-all is the sibling
 * pattern this app already builds cleanly (omnicraft + [tool]).
 */

export const metadata: Metadata = {
  // No title — the reference's shell serves none pre-replace (title:
  // null suppresses the root layout's default <title>).
  title: null,
};

export default function WorkspaceRootPage() {
  return <ShellRedirect script={WORKSPACE_ROOT_REPLACE_SCRIPT} />;
}
