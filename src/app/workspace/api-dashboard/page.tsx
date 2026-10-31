import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { workspaceEntryBySlug } from "@/lib/workspace-routes";

/**
 * /workspace/api-dashboard — the reference's API dashboard route
 * (probed live 2026-10-31, agent-walked): the marketing header's API
 * action links here (auth-only chrome — hidden for guests), and the
 * SPA shell serves the studio chrome under the client-set title
 * "API Dashboard | Hyper3D". The dashboard panel itself is auth-gated:
 * a guest gets the standard studio view, not a dashboard.
 *
 * The clone renders the same studio shell — guests get the studio
 * view, exactly like the reference's guest experience; a signed-in
 * user gets the honest word (toast): this clone's API is the real REST
 * surface at /api/task/* that powers the workspace, and it has no API
 * keys to manage, so no dashboard is faked.
 */

const entry = workspaceEntryBySlug("api-dashboard");

export const metadata: Metadata = {
  title: entry?.title,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceApiDashboardPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp initialView="api-dashboard" />
    </>
  );
}
