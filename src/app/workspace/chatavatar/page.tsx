import type { Metadata } from "next";

import { ChatAvatarWorkspace } from "@/components/hyper3d/workspace/chatavatar-workspace";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { workspaceEntryBySlug } from "@/lib/workspace-routes";

/**
 * /workspace/chatavatar — the reference's ChatAvatar product route
 * (probed live 2026-10-31, agent-walked): a full workspace product —
 * V0.7 (Beta), "Progressive Generation of Animatable 3D Faces under
 * Text/Image Guidance", image upload / generate-from-text cards, and a
 * Featured gallery — served under its own long product title (the
 * reference's client-set <title>, byte-faithful below).
 *
 * The clone reproduces the surface honestly: no face-generation model
 * exists here, the Generate action says so, and the Featured gallery is
 * the reference's own public set, labeled as such. The marketing
 * header's Products menu and the footer's Product column link here
 * (the reference's own hrefs).
 *
 * robots-disallowed prefix (robots.txt `Disallow: /workspace`) — this
 * route enters no sitemap, exactly like the reference's.
 */

const entry = workspaceEntryBySlug("chatavatar");

export const metadata: Metadata = {
  title: entry?.title,
  description:
    "ChatAvatar — progressive generation of animatable 3D faces under text/image guidance. Educational clone surface: the avatar model itself is not reproduced.",
};

export default function WorkspaceChatAvatarPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <ChatAvatarWorkspace />
    </>
  );
}
