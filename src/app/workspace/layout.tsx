import type { Metadata, Viewport } from "next";

/**
 * /workspace family layout (t83) — the SPA shell's own head chrome.
 *
 * Recon 2026-11-01 (recon/t83, ws-shell.html): the reference's /workspace
 * shell is a different app with a different head shape than the Astro
 * marketing surface — the locked viewport, theme-color #000000, the
 * google-notranslate meta, the favicon.ico + 32/16 png icon set with the
 * apple-touch-icon and manifest links, an og:title-only OpenGraph
 * ("Hyper3D", no og:image/url/description/site_name), the twitter card
 * (site @DeemosTech, "Hyper3D - Rodin & ChatAvatar", the og-banner.png
 * image), and preconnect + dns-prefetch for file.hyper3d.com — NOT
 * storage.deemos.dev, and no font links at all.
 *
 * This layout restores that shape for every /workspace route (the t53
 * recon that produced it now lives here instead of the root layout).
 * Pages keep their own <title>s (t72/t82 — the post-boot-equivalent
 * stance); title-less pages (the t82 OAuth views set title: null
 * themselves) serve none, like the shell. The root layout's
 * description falls away the same way — the shell serves no description
 * meta. The twitter card inherits from the root layout, which already
 * carries the shell's own card byte-for-byte.
 */

export const metadata: Metadata = {
  // The shell serves no server <title> and no description meta; pages
  // that set their own (every titled workspace route, t72/t82) win the
  // merge, so only the untitled ones — and the head fields the shell
  // genuinely omits — go empty.
  title: null,
  description: null,
  // The shell serves NO canonical (and no hreflang) — recon/t83's
  // ws-shell.html census. Next merges alternates per-segment: this
  // object replaces the root layout's homepage canonical, and a null
  // canonical resolves to no <link rel="canonical"> at all (verified
  // in Next 16.1.3's resolve-alternates: falsy canonical emits nothing).
  alternates: { canonical: null },
  // The shell's icon set: favicon.ico + the 32/16 png pair, plus the
  // apple-touch-icon and manifest links the marketing head does not
  // carry. The files sit in public/ at their well-known paths (the
  // reference serves them there too).
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  other: { google: "notranslate" },
  // The shell's OpenGraph is og:title only — the child key replaces the
  // root layout's full card (Next merges metadata shallowly per key).
  openGraph: { title: "Hyper3D" },
};

// The shell's locked viewport (t53 G5): no pinch-zoom, notch-safe
// inset, theme-color #000000. Field order in the served meta is
// Next's own serialization — the reference's order differs, a
// framework artifact.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The shell's own CDN hints — file.hyper3d.com (the model-file
          host), not storage.deemos.dev. React hoists both into <head>. */}
      <link rel="preconnect" href="https://file.hyper3d.com" />
      <link rel="dns-prefetch" href="https://file.hyper3d.com" />
      {children}
    </>
  );
}
