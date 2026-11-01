import { AstroHints } from "@/components/hyper3d/astro-chrome";

/**
 * /blog family layout (t83) — the reference's blog chrome: the
 * storage.deemos.dev hint pair but NO font links. The blog template on
 * the reference ships neither the preconnects for fonts nor the
 * stylesheet itself (probed on the EN index, pagination, category hubs,
 * articles and their locale mirrors), so its blog pages render in the
 * CSS fallback stack — this clone's honest mirror of that shape
 * (recon/t83).
 */
export default function BlogFamilyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AstroHints />
      {children}
    </>
  );
}
