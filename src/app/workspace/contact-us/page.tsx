import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { WORKSPACE_TAB_TITLES } from "@/lib/workspace-tabs";

/**
 * /workspace/contact-us — the reference's contact surface (probed live
 * 2026-10-31, agent-walked): its marketing homepage's FAQ closes with
 * "Still have questions? Chat with our team." linking here, and the
 * route serves the workspace SPA shell — the studio chrome with the
 * right-hand "Chat with us" dock opened: a Live Chat Support card, a
 * scrollable 21-question Popular Questions list, and the message form.
 *
 * The clone renders the same shell with the dock opened
 * (chatInitiallyOpen): the Live Chat card states plainly that no chat
 * backend exists here, every Popular Question is answered honestly and
 * linked to the real help article that covers it, and the Submit button
 * says where feedback actually goes (nowhere — it stays local).
 *
 * Title: the reference serves its default workspace title on this route
 * (no contact-specific <title> — probed, same as /workspace/login).
 * The workspace prefix is robots-disallowed, so no sitemap change.
 */

export const metadata: Metadata = {
  title: WORKSPACE_TAB_TITLES.asset,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceContactUsPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp initialView="contact" />
    </>
  );
}
