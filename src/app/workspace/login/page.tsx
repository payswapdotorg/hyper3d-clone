import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { WORKSPACE_TAB_TITLES } from "@/lib/workspace-tabs";

/**
 * /workspace/login — the reference's dedicated workspace login route
 * (probed live 2026-10-31): its marketing site's header Login button
 * and hero "Start Creating" CTA both land here (hrefs on the reference
 * homepage), the SPA shell serves the same studio chrome, and the login
 * view renders for guests — signed-in sessions continue to the studio.
 *
 * The clone renders the same app shell with the sign-in panel opened
 * (email + password, the clone's REAL auth; Google/GitHub/SSO stay
 * honest reference-chrome stand-ins inside the panel). After a
 * successful sign-in — or when a session already exists — the shell
 * routes to /workspace/rodin, matching the reference's post-login
 * landing.
 *
 * Title: the reference serves its default workspace title on this route
 * (no login-specific <title> — probed).
 */

export const metadata: Metadata = {
  title: WORKSPACE_TAB_TITLES.asset,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceLoginPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp initialView="login" />
    </>
  );
}
