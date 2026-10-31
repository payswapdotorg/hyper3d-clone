import type { Metadata } from "next";

import { VideoWorkspace } from "@/components/hyper3d/workspace/video-workspace";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { workspaceEntryBySlug } from "@/lib/workspace-routes";

/**
 * /workspace/video — the reference's video product route (probed live
 * 2026-10-31, agent-walked): the Image-to-Video product — upload (JPG,
 * PNG, WebP, max 10MB), prompt, Sound Effect, Resolution 720p,
 * Duration 5, "Generate Video 0.5 Credits", and the "No Videos Yet"
 * empty state — served under its own long product title (the
 * reference's client-set <title>, byte-faithful below).
 *
 * The clone reproduces the surface honestly: no video-generation
 * backend exists here, Generate says so plainly, and the empty state
 * says no video will ever appear. The left asset rail links this
 * clone's real routes (features pages / OmniCraft tool routes).
 *
 * robots-disallowed prefix (robots.txt `Disallow: /workspace`) — this
 * route enters no sitemap, exactly like the reference's.
 */

const entry = workspaceEntryBySlug("video");

export const metadata: Metadata = {
  title: entry?.title,
  description:
    "Free text to video AI surface — upload an image, describe the scene, pick pacing and tone. Educational clone surface: the video model itself is not reproduced.",
};

export default function WorkspaceVideoPage() {
  return (
    <>
      {/* Same pre-paint marker script the reference's shared shell stamps
          on every /workspace route, this one included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <VideoWorkspace />
    </>
  );
}
