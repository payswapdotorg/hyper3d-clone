/**
 * t82 — the shared body for the /workspace routes whose reference
 * behavior is "200 shell + pre-paint replace": /workspace (root),
 * /workspace/signup, /workspace/r|a/*, the bad-shape /404 replaces,
 * and the non-canonical rodin tab normalizes.
 *
 * The reference serves its 11KB SPA shell (splash chrome + the boot
 * scripts) and the client replaces the URL before the app renders;
 * the clone serves the honest minimal equivalent — the visit-marker
 * script (every /workspace route stamps it on the reference), the
 * replace script itself, and the reference's own noscript notice.
 * No <title>: the reference's shell carries none pre-replace.
 */

import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";

export function ShellRedirect({ script }: { script: string }) {
  return (
    <>
      {/* The reference's shared-shell visit markers — every /workspace
          route stamps these (t72's WORKSPACE_MARKER_SCRIPT). */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      {/* The client-router replace this route exists to perform. */}
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>You need to enable JavaScript to run this app.</noscript>
    </>
  );
}
