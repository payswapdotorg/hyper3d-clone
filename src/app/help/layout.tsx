import { AstroChrome } from "@/components/hyper3d/astro-chrome";

/**
 * /help family layout (t83) — the reference's Astro marketing chrome:
 * the storage.deemos.dev hint pair plus the Google-Fonts quartet every
 * non-blog content page ships (recon/t83). Rendered here so every page
 * in the family carries it without per-page wiring.
 */
export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AstroChrome />
      {children}
    </>
  );
}
