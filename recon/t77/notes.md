# t77 recon — the byte-faithful og:image registry (2026-10-31)

Method: the t76 census list, rebuilt from the title registry keys
(`build-url-list.py` — 7,078 registry paths + the one 405 = the exact
7,079-URL probe set), probed for the image dimension with
`og-image-probe.py` — 24 threads, ~97 seconds — capturing
`og:image`, `og:image:alt`, `twitter:image`, `twitter:image:alt`,
and any `og:image:width/height/type` (attribute orders handled,
HTML-unescaped).

Findings:

- 7,077 of 7,079 URLs carry an og:image. The two misses are the same
  honest exclusions as t76: `/content-preview` (the reference answers
  HTTP 200 but serves NO og:image — this clone keeps its honest page
  image there) and `/content-preview/render` (the t75 405).
- The boundary is exact: og:image registry == description registry
  (== title registry minus `/content-preview`), 7,077 paths, verified
  set-diff both ways.
- 797 unique image URLs, two hosts: `storage.deemos.dev`
  (4,014 pages — per-page CDN art under `features/`, `help/`,
  `blog/`, `use-cases/`, `seo-page-main/`, `event/`) and `hyper3d.ai`
  (3,063 pages — the shared `assets/og-banner.webp`).
- Extensions across the 797: webp 547 / png 232 / jpg 9 / avif 8 /
  svg 1 (the svg is the help center's `link-guide.svg`, shared by
  every locale's `/help` root).
- Two shared banners, both real: `hyper3d.ai/assets/og-banner.webp`
  (3,063 pages — the `/tools` converter matrix, help articles,
  legal, EN blog, switch, locale 3d-prompts, sub-categories) and
  `storage.deemos.dev/assets/og-banner.png` (60 pages — the
  features/styles/pricing/tools/use-cases root indexes across all 12
  locales, EN included).
- The banner this clone hotlinked everywhere before t77
  (`hyper3d.ai/assets/og-banner.png`) is served by ZERO censused
  pages — it was never one of the reference's og:image assets (it
  lives on only as a legacy asset path).
- twitter:image equals og:image on every pinned page (0 mismatches
  in 7,077); twitter:image:alt equals og:image:alt (0 mismatches);
  every og:image ships an alt; NO page ships og:image:width/height/
  type — nothing to pin in those dimensions.
- **The alt is derivable, not pinned**: on all 7,077 pages
  og:image:alt equals the t75 title minus the trailing
  `" | Hyper3D"` suffix — exactly `referenceCardTitle()` (7,065 with
  the suffix stripped + 12 titles that never carried it, 0 others).
  So the alt flows from the title registry and every route's
  existing `familyMetadata({ title: cardTitle })` argument; no alt
  registry is needed and none was generated.
- The reference's own JSON-LD `Organization.logo` pins
  `storage.deemos.dev/assets/og-banner.png` (homepage @graph probe),
  and its banner ImageObject carries `"width":1200,"height":625` —
  both now mirrored (`OG_IMAGE_URL` + `bannerImageNode`).

Wiring: `referenceOgImage(path) ?? OG_BANNER_FALLBACK_URL` at the two
funnel points — `familyMetadata()` (which every EN family route
spreads into its metadata) and the locale catch-all's own card —
with the card title as og:image:alt and, newly, twitter:image:alt
(the reference ships it on every page; the twitter image entry
promoted from a bare string to `{ url, alt }`). The homepage `/` was
already pinned inline by t68 (agentic webp + full card) and matches
the registry entry exactly; it stays as-is. Uncensused deep routes
(3D prompt library pagination/details/hubs, blog pagination,
per-locale sub-category slugs) keep the honest fallback — the
og-banner.webp the reference itself serves on those very families'
deep censused routes.

Out of scope (kept honest, unchanged): body copy, per-page og:image
mirroring (the clone hotlinks the reference's own CDN URLs — the
honest alternative to mirroring 797 assets), og:image:secure_url /
og:image dimensions (the reference ships none), and every /workspace
route (app surface, not crawler surface).

Files: `og-image-probe.py` (the probe), `build-url-list.py` (rebuilds
the census URL list from the title registry),
`build-og-image-registry.py` (the generator — regenerate only from a
fresh probe), `og-image-probe.json` (the raw capture, 7,077 images +
alt + the 2 exclusions), `analyze-alt.py` (the alt-derivation audit).

Verification: 84 new tests (820 / 43 suites green), lint clean, tsc
baseline 27 → 26 errors (no new; one pre-existing test-file error
disappeared with the touched import block). Production build
spot-verified — the pinned images bake into the served HTML of every
probed family: `/pricing` (storage png), `/help` (link-guide.svg),
`/features/text-to-3d` (prompt-img-1.avif),
`/blog/zbrush-alternative` (blog_84 png),
`/zh/use-cases/3d-printing` (dragon.avif),
`/tools/converter/3ds/to/dae` (webp banner), `/zh` (agentic webp),
`/styles/voxel` (seo-page-main webp), `/3d-prompts` (webp banner),
and the deep uncensused `/3d-prompts/2` falls back to the webp
banner; og:image:alt + twitter:image:alt verified baked on `/help`,
`/tools/converter/3ds/to/dae`, `/zh`; the JSON-LD logo and the
banner ImageObject's width/height verified baked on the homepage.
