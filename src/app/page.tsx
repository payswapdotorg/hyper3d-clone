import type { Metadata } from "next";

import { MarketingHome } from "@/components/hyper3d/landing/marketing-home";
import { JsonLd } from "@/components/hyper3d/json-ld";
import { homeGraph } from "@/lib/schema-org";
import { WORKSPACE_BOUNCE_SCRIPT } from "@/lib/workspace-visit";

/**
 * `/` — the marketing landing page (t68).
 *
 * Recon 2026-10-31: the reference serves its SSR marketing page here
 * (title "Hyper3D Rodin - Best AI 3D Model Generator", the six-node
 * @graph, og card with the agentic banner) and runs an inline script that
 * bounces returning visitors client-side into /workspace — the studio
 * shell they came from — unless ?bypass=true is set. This clone used to
 * mount the studio at `/` directly; t68 restores the reference's shape:
 * the landing page lives here, the studio at /workspace/rodin, and the
 * bounce script below reproduces the reference's marker logic so a
 * visited-the-studio-once browser gets forwarded the same way.
 */

export const metadata: Metadata = {
  // The reference landing's own served title/description (byte-faithful
  // anchors), card image hotlinked from their CDN (the t53 pattern).
  title: "Hyper3D Rodin - Best AI 3D Model Generator",
  description:
    "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
  openGraph: {
    title: "Hyper3D Rodin - Best AI 3D Model Generator",
    description:
      "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
    url: "/",
    images: [
      {
        url: "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp",
        alt: "Hyper3D Rodin - Best AI 3D Model Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyper3D Rodin - Best AI 3D Model Generator",
    description:
      "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
    images: [
      "https://storage.deemos.dev/features/agentic/b7faa93dd63010643d74db337da0f2ee03b365ea.webp",
    ],
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* The returning-visitor bounce — the reference's own pre-paint
          landing script, reproduced in behavior (see workspace-visit.ts).
          Runs before hydration; ?bypass=true keeps the landing page on
          screen. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_BOUNCE_SCRIPT }} />
      {/* t67: the reference homepage's six-node @graph (Organization,
          WebSite, WebPage, WebApplication + free Offer, ImageObject,
          BreadcrumbList) — it belongs on the landing page, where the
          reference serves it. */}
      <JsonLd data={homeGraph()} />
      <MarketingHome />
    </>
  );
}
