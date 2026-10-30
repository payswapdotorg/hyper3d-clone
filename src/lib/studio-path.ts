/**
 * t68 — the studio's canonical URL.
 *
 * Recon 2026-10-31: the reference serves its marketing page at `/` and the
 * studio at `/workspace/rodin`, with a client-side returning-visitor bounce
 * (`/` → `/workspace`) keyed off workspace-visit markers. This clone used to
 * mount the studio at `/` (single-page-app shortcut, DECISIONS.md #G6 era);
 * t68 restores the reference's URL shape: marketing home at `/`, studio at
 * `/workspace/rodin`.
 *
 * Every content-tree CTA that used to say `href: "/"` ("Open the studio",
 * "Generate a … Model", …) resolves through this constant so the studio
 * address lives in exactly one place.
 */
export const STUDIO_PATH = "/workspace/rodin";
