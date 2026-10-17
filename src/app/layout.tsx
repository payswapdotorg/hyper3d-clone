import type { Metadata } from "next";
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
  title: "Hyper3D Rodin – Best AI 3D Model Generator",
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
  openGraph: {
    title: "Hyper3D Rodin – Best AI 3D Model Generator",
    description:
      "Meet Hyper3D, the world's highest-quality, most controllable AI 3D model generator.",
    type: "website",
  },
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
