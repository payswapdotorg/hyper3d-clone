import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/**
 * Root layout — the reference's Astro default chrome (t83).
 *
 * Recon 2026-11-01 (recon/t83): the reference serves two head shapes.
 * Its marketing/content surface (every non-blog, non-workspace page)
 * ships a plain `width=device-width, initial-scale=1.0` viewport, a
 * single webp favicon link, NO keywords/theme-color/notranslate/
 * manifest/apple-touch-icon, and its fonts as Google-Fonts stylesheet
 * links. Its /workspace SPA shell ships the locked viewport +
 * theme-color + notranslate + ico/png icon set + manifest + the
 * file.hyper3d.com hints — the shape this root layout used to serve
 * app-wide (it was built from the t53 workspace recon, before the
 * marketing tree existed).
 *
 * t83 splits the shapes: THIS layout is the marketing default (plain
 * viewport, the webp icon, no font mechanism of its own); the font
 * links + CDN hints are rendered per-surface (family layouts, the home
 * page, the 404, the locale catch-all) because the blog family
 * deliberately ships neither; the workspace layout restores the shell's
 * own chrome for /workspace/*.
 *
 * Fonts: next/font is gone — the pages that load fonts at all load the
 * reference's own Google Fonts stylesheet (the same hot-link stance as
 * the og:image registry), and the CSS variables (--font-inter/
 * --font-poppins/--font-plex-mono) are defined in globals.css against
 * the CDN families. Blog pages, like the reference's own blog template,
 * render in the fallback stack (no @font-face ships anywhere).
 */

export const metadata: Metadata = {
  // NOTE (t53 audit): the <title> stays byte-identical to the reference's
  // rendered title — it is the standing drift-verification anchor (t49/t51).
  title:
    "Rodin AI - Free AI 3D Model Generator For Everyone | Instantly Create Stunning 3D Assets, 3D Models, and 3D Objects - Create 3D Designs Powered by AI | Hyper3D",
  description:
    "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows. Turn text prompts or images into detailed 3D assets in seconds — no 3D experience required.",
  // t67: og:url / og:image / og:image:alt / og:site_name added — the
  // reference homepage ships the full card; metadataBase makes every
  // per-page canonical/og:url resolve against the production origin.
  metadataBase: new URL("https://hyper3d-clone.vercel.app"),
  openGraph: {
    title: "Hyper3D",
    description:
      "Meet Hyper3D, the world's highest-quality, most controllable AI 3D model generator.",
    type: "website",
    siteName: "Hyper3D",
    url: "https://hyper3d-clone.vercel.app",
    images: [
      {
        url: "https://hyper3d.ai/assets/og-banner.png",
        alt: "Hyper3D Rodin - Best AI 3D Model Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DeemosTech",
    title: "Hyper3D - Rodin & ChatAvatar",
    description: "Closest to Production-ready 3D Assets Generator",
    images: ["https://hyper3d.ai/assets/og-banner.png"],
  },
  // t67: the homepage self-canonicalizes (the reference does too); every
  // family route overrides this with its own per-page canonical.
  alternates: {
    canonical: "https://hyper3d-clone.vercel.app",
  },
  // t83: the reference's marketing head links ONE icon — the webp
  // favicon (self-hosted copy of the reference's own 620-byte file).
  // The ico/png/apple/manifest set belongs to the workspace shell's
  // head; the files stay in public/ at their well-known paths, where
  // the reference serves them too. Keywords/theme-color/notranslate/
  // manifest are gone: the reference's Astro surface serves none of
  // them (recon/t83 census, 30+ pages).
  icons: {
    icon: [{ url: "/favicon-32x32.webp", type: "image/webp", sizes: "32x32" }],
  },
};

// t83: the reference's marketing viewport — plain, unlocked (the locked
// viewport is the workspace shell's own; the Astro pages ship only
// width + initial-scale). Next renders initial-scale=1 where the
// reference hand-sets 1.0 — a two-character framework artifact,
// documented in recon/t83 (Astro itself serves `1` on its own default
// pages, e.g. /content-preview).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* The per-surface chrome (storage/font hints) renders from the
          family layouts and page components — see astro-chrome.tsx —
          because the blog family and the workspace ship their own. */}
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1c1c22",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
