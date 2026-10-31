# t76 recon — the byte-faithful meta-description registry (2026-10-31)

Method: same full-tree probe as t75, description dimension. The t75
census list (7,078 title-registry paths + the one 405 =
`/content-preview/render`) was re-probed with
`full-description-probe.py` — 7,079 URLs, 24 threads, ~80 seconds —
capturing `<meta name="description">` and `og:description`
(HTML-unescaped, both attribute orders handled).

Findings:

- 7,077 of 7,079 URLs carry a meta description. The two misses are
  the honest exclusions: `/content-preview` (the reference answers
  HTTP 200 but serves NO meta description at all — the clone keeps its
  own honest page description there) and `/content-preview/render`
  (the t75 405, never in either registry).
- The boundary is exact: description registry == title registry minus
  `/content-preview` (7,077 paths). Verified set-diff both ways.
- The reference's og:description equals the meta description on every
  single pinned page — 0 mismatches in 7,077 — and no page carries a
  meta description without an og:description. So one pinned string
  wired through `familyMetadata`/the locale catch-all covers meta, OG,
  and twitter surfaces (same shape as the t75 card-title derivation).
- Lengths run 22–296 chars, median 141; 106 pinned descriptions
  exceed the 180 chars this clone's own templates slice to. Pinned
  strings are served full-length, never sliced (the slice stays a
  template-fallback convention only).
- 6,714 of 7,077 are unique strings — real per-page SEO copy with
  human translations per locale, not derivable from slugs or
  templates.
- The reference's own content quirks, pinned byte-for-byte because
  they are what the reference serves:
  - 19 blog descriptions contain literal backslash escape sequences
    ("UNCHARTED\u2122", "guide\ \ to") — a CMS artifact that never got
    decoded, present in their served HTML (verified raw with cat -A);
  - some long help-article descriptions are truncated mid-word with a
    literal "..." ("…Wallet History befor...") — their truncation,
    their string.

Wiring: `referenceDescription(path) ?? template` at every t75 call
site — the same 23 route files (10 static family indexes, 12 dynamic
family routes, the locale catch-all). The locale catch-all's
`localizedDescription(locale, path)?.slice(0, 180)` stays as the
fallback; a pinned locale path serves the reference's own localized
description full-length. The homepage `/` was already pinned inline in
t68 (its served string matches the registry entry exactly — verified);
`/content-preview` keeps its template description by design.

Out of scope (kept honest, unchanged): body copy, per-page og:image
assets (the shared-banner hotlink remains), the deep
served-but-not-sitemapped routes (3D prompt library pagination/
details/hubs, blog pagination, per-locale sub-category slugs beyond
each locale's sitemap list), and every /workspace route (app surface,
not crawler surface).

Files: `full-description-probe.py` (the probe),
`build-description-registry.py` (the generator — regenerate only from
a fresh probe), `description-probe.json` (the raw capture, 7,077
descriptions + the 2 exclusions).

Verification: 78 new tests (736/41 green), lint clean, tsc unchanged,
production build spot-verified (the pinned descriptions bake into the
served HTML of every probed family — `/pricing`, `/help`,
`/features/ai-image-generator`, `/blog/zbrush-alternative`,
`/zh/use-cases/3d-printing`, `/tools/converter/3ds/to/dae`,
`/help/articles/are-credits-deducted-when-a-generation-fails`,
`/fr/styles/voxel` full-length, `/zh`).
