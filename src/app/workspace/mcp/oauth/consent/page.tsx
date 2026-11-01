import type { Metadata } from "next";

import { OAuthGuestView } from "@/components/hyper3d/workspace/oauth-guest-view";
import { MCP_OAUTH_CONSENT_COPY, OAUTH_PRIVATE_FLAG_SCRIPT } from "@/lib/workspace-shell-routes";

/**
 * /workspace/mcp/oauth/consent — the MCP client-authorization consent
 * surface (t82, probed 2026-11-01). Same private-mode shell treatment
 * as the device surface; the guest state without OAuth parameters is
 * the probed invalid-request card. The reference serves no <title>.
 */

export const metadata: Metadata = {
  // No title — the reference's client never sets one on this route
  // (title: null suppresses the root layout's default <title>).
  // The reference shell's private-mode meta for the OAuth paths,
  // emitted server-side here instead of its script (recon/t82).
  title: null,
  other: { referrer: "no-referrer" },
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this page, exactly like the reference.
};

export default function WorkspaceMcpOauthConsentPage() {
  return (
    <>
      {/* The reference shell's private-mode window flag (script #1's
          other half — the no-referrer meta above is the server-side
          half). */}
      <script dangerouslySetInnerHTML={{ __html: OAUTH_PRIVATE_FLAG_SCRIPT }} />
      <OAuthGuestView copy={MCP_OAUTH_CONSENT_COPY} />
    </>
  );
}
