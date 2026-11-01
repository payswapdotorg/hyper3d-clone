import type { Metadata } from "next";
import Link from "next/link";

import {
  FACEBOOK_DOMAIN_VERIFICATION,
  OG_BANNER_FALLBACK_URL,
} from "@/lib/schema-org";

/**
 * Themed 404 — the reference's own error page copy (recon 2026-10-29 of a
 * missing /features route): "404 / Reconstruction failed — This page slipped
 * out of the mesh..." Parity means matching the misses too.
 *
 * t78: the reference's 404 head — the <title> "404 Page Not Found |
 * Hyper3D", robots "noindex, nofollow", and the same
 * facebook-domain-verification token every crawler-surface page carries
 * (probe-verified on the reference's own 404 responses).
 *
 * t83: the rest of the reference's 404 head, verbatim (recon/t83,
 * not-found.html — probed on a nonexistent slug): the description, the
 * full og + twitter card on the shared og-banner.webp, the /404
 * self-canonical, and the thirteen-link hreflang set (/{loc}/404
 * targets, x-default → /404 — the reference serves the same head for
 * EVERY 404 response). Key order follows the reference's own: en, zh,
 * de, ja, ko, ru, pt-BR, fr, es, ar, tr, it, x-default last.
 *
 * The one honest exclusion: the reference 404's font/hint links cannot
 * reach this clone's served bytes. Next's error-root pages (the
 * __next_error__ shell unknown-path 404s serve) render the boundary
 * client-side only — component-rendered links exist solely in the
 * Flight payload — and ANY stylesheet in that payload makes React
 * pre-emit a font preload into every notFound()-capable page's head,
 * including the blog family's deliberately font-free heads (verified
 * on the standalone build, recon/t83). The 404 keeps every
 * metadata-driven field (all served correctly above); its four chrome
 * links are the documented divergence, and the page renders in the
 * fallback stack. (Next also auto-emits its own robots "noindex" meta
 * on error pages alongside the explicit one — a framework artifact.)
 */

/** The reference's own 404 hreflang set — /404 self-links in every
 * censused locale, the x-default last (load-bearing key order). */
const NOT_FOUND_LANGUAGES: Record<string, string> = {
  en: "/404",
  zh: "/zh/404",
  de: "/de/404",
  ja: "/ja/404",
  ko: "/ko/404",
  ru: "/ru/404",
  "pt-BR": "/pt/404",
  fr: "/fr/404",
  es: "/es/404",
  ar: "/ar/404",
  tr: "/tr/404",
  it: "/it/404",
  "x-default": "/404",
};

const NOT_FOUND_DESCRIPTION =
  "The requested Hyper3D page could not be found. Return home and keep creating with Hyper3D.";

export const metadata: Metadata = {
  title: "404 Page Not Found | Hyper3D",
  description: NOT_FOUND_DESCRIPTION,
  robots: "noindex, nofollow",
  other: { "facebook-domain-verification": FACEBOOK_DOMAIN_VERIFICATION },
  openGraph: {
    type: "website",
    siteName: "Hyper3D",
    title: "404 Page Not Found",
    description: NOT_FOUND_DESCRIPTION,
    url: "/404",
    images: [{ url: OG_BANNER_FALLBACK_URL, alt: "404 Page Not Found" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DeemosTech",
    title: "404 Page Not Found",
    description: NOT_FOUND_DESCRIPTION,
    images: [{ url: OG_BANNER_FALLBACK_URL, alt: "404 Page Not Found" }],
  },
  alternates: {
    canonical: "/404",
    languages: NOT_FOUND_LANGUAGES,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0f12] p-8 text-white">
      <div className="max-w-md text-center">
        <p className="font-mono text-5xl font-black text-white/15">404</p>
        <h1 className="mt-2 text-lg font-bold text-white/85">Reconstruction failed</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          This page slipped out of the mesh. The link may have moved, or the model for this route
          was never generated. Head back to Hyper3D and keep creating.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
          >
            Back to Hyper3D
          </Link>
          <Link
            href="/features"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            Browse features
          </Link>
        </div>
      </div>
    </div>
  );
}
