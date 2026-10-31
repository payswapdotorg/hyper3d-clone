import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { workspaceEntryBySlug } from "@/lib/workspace-routes";

/**
 * /workspace/register — the reference's dedicated signup entry route
 * (probed live 2026-10-31): its marketing header's "Sign up for free"
 * CTA lands here, the SPA shell serves the same studio chrome, and the
 * register view renders for guests — Email + Send Code with the
 * Google/GitHub/SSO stand-ins — while signed-in sessions continue to
 * the studio.
 *
 * The clone renders the same app shell with the sign-in panel opened
 * in sign-up mode (this clone's REAL auth: email + password, 50 free
 * credits on the demo account; Google/GitHub/SSO stay honest
 * reference-chrome stand-ins inside the panel). t74 replaces the old
 * 307 → /workspace/rodin?auth=signup shortcut with this real route —
 * the reference serves 200 here, not a redirect.
 *
 * Title: the reference serves its default workspace title on this route
 * (no register-specific <title> — probed).
 */

const entry = workspaceEntryBySlug("register");

export const metadata: Metadata = {
  title: entry?.title,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceRegisterPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp initialView="register" />
    </>
  );
}
