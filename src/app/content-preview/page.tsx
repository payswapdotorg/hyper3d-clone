import type { Metadata } from "next";

import { ContentPreviewHost } from "@/components/hyper3d/content-preview/content-preview-host";

/**
 * /content-preview — the host half of the reference's draft-preview
 * surface (recon 2026-10-31: 200, listed in static-en, and noindex /
 * nofollow in its own <head> — the reference lists it for crawlers while
 * telling them not to index it; the clone mirrors both halves of that
 * split). The page itself is one status line plus a client protocol:
 * an editor embeds it, posts `h3d-content-preview:render`, and gets
 * `rendered` / `size` / `error` events back — the real, working
 * postMessage contract, implemented honestly in
 * src/components/hyper3d/content-preview/content-preview-host.tsx.
 */
export const metadata: Metadata = {
  title: "Content preview | Hyper3D",
  description:
    "The content-preview host: an embedded draft renderer that speaks the h3d-content-preview postMessage protocol to its parent window.",
  robots: { index: false, follow: false },
};

export default function ContentPreviewPage() {
  return <ContentPreviewHost />;
}
