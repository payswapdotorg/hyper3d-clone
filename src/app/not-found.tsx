import Link from "next/link";

/**
 * Themed 404 — the reference's own error page copy (recon 2026-10-29 of a
 * missing /features route): "404 / Reconstruction failed — This page slipped
 * out of the mesh..." Parity means matching the misses too.
 */
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
