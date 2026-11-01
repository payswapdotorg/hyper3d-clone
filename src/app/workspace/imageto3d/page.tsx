import type { Metadata } from "next";

import { ChatAvatarWorkspace } from "@/components/hyper3d/workspace/chatavatar-workspace";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { IMAGETO3D_BARE_TITLE } from "@/lib/workspace-shell-routes";

/**
 * /workspace/imageto3d — the bare imageto3d path (t82, probed
 * 2026-11-01): the reference's client router renders the ChatAvatar
 * product view here under its own short client-set title — distinct
 * from the long /workspace/chatavatar product title — with the URL
 * staying at /workspace/imageto3d. The uuid detail form lives one
 * level down ([uuid]/page.tsx); the root-level /imageto3d alias 301s
 * to /features/image-to-3d (the marketing page), all probed.
 */

export const metadata: Metadata = {
  title: IMAGETO3D_BARE_TITLE,
  // robots-disallowed prefix (robots.txt `Disallow: /workspace`) — no
  // crawler sees this card, exactly like the reference.
};

export default function WorkspaceImageto3dPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <ChatAvatarWorkspace />
    </>
  );
}
