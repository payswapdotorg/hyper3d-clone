import type { Metadata } from "next";

import { OAuthGuestView } from "@/components/hyper3d/workspace/oauth-guest-view";
import { OAUTH_DEVICE_COPY, OAUTH_PRIVATE_FLAG_SCRIPT } from "@/lib/workspace-shell-routes";

/**
 * /workspace/oauth/device — the device-authorization guest surface
 * (t82, probed 2026-11-01). The reference's shared shell marks this
 * path private (`__HYPER3D_PRIVATE_OAUTH__` + a no-referrer meta) and
 * the client router renders its guest error state — the state an
 * authorization link reaches without OAuth request parameters. The
 * clone serves that view server-rendered with the probed copy and NO
 * <title> (the reference serves none).
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

export default function WorkspaceOauthDevicePage() {
  return (
    <>
      {/* The reference shell's private-mode window flag (script #1's
          other half — the no-referrer meta above is the server-side
          half). */}
      <script dangerouslySetInnerHTML={{ __html: OAUTH_PRIVATE_FLAG_SCRIPT }} />
      <OAuthGuestView copy={OAUTH_DEVICE_COPY} />
    </>
  );
}
