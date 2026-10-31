import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { workspaceEntryBySlug } from "@/lib/workspace-routes";

/**
 * /workspace/subscribe — the reference's subscription entry route
 * (probed live 2026-10-31, agent-walked): the marketing header's
 * "7-Day Trial Subscribe" pill links here (both the trial-button and
 * the subscribe-button hrefs on the reference homepage), and the SPA
 * shell serves the studio chrome with the membership drawer opened —
 * the plans surface (FREE 7-DAY / Creator 24 per month, 30 credits /
 * Business 96 per month, 208 credits / Education / Enterprise) under
 * the client-set title "Pricing | Hyper3D".
 *
 * The clone mounts the same studio shell with the membership overlay
 * opened on load (pricingInitiallyOpen) — the honest plans surface
 * that says plainly that this clone takes no payments.
 */

const entry = workspaceEntryBySlug("subscribe");

export const metadata: Metadata = {
  title: entry?.title,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceSubscribePage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp initialView="subscribe" />
    </>
  );
}
