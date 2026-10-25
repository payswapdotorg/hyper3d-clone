import type { Metadata, Viewport } from "next";
import { Poppins, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  // NOTE (t53 audit): the <title> stays byte-identical to the reference's
  // rendered title — it is the standing drift-verification anchor (t49/t51).
  title:
    "Rodin AI - Free AI 3D Model Generator For Everyone | Instantly Create Stunning 3D Assets, 3D Models, and 3D Objects - Create 3D Designs Powered by AI | Hyper3D",
  description:
    "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows. Turn text prompts or images into detailed 3D assets in seconds — no 3D experience required.",
  keywords: [
    "AI 3D model generator",
    "text to 3D",
    "image to 3D",
    "Rodin",
    "Hyper3D",
    "PBR texturing",
    "GLB export",
  ],
  // Link-preview card — matches the reference's served card exactly (t53 G1):
  // og:title "Hyper3D" (helmet-set on the reference), twitter large-image card
  // with @DeemosTech attribution and the reference's own og-banner URL.
  openGraph: {
    title: "Hyper3D",
    description:
      "Meet Hyper3D, the world's highest-quality, most controllable AI 3D model generator.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@DeemosTech",
    title: "Hyper3D - Rodin & ChatAvatar",
    description: "Closest to Production-ready 3D Assets Generator",
    images: ["https://hyper3d.ai/assets/og-banner.png"],
  },
  // Icon set — self-hosted copies of the reference's files (t53 G2).
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.json",
  other: {
    google: "notranslate",
  },
};

// Viewport — mirrors the reference's locked viewport (t53 G5):
// no pinch-zoom, notch-safe inset. Deliberate reference behavior.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${plexMono.variable} antialiased bg-background text-foreground`}
      >
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
