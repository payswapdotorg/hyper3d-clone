# t75 recon — the byte-faithful <title> registry (2026-10-31)

Method: full-tree probe of the reference's own landing-sitemap tree.
The homepage link census (t74) stayed closed and the 90-child sitemap
index stayed at exact parity, so the audit moved to the served
`<title>` dimension. `full-title-probe.py` fetched every URL in all 90
children (7,067 URLs, 12 locales × 8 families) and captured `<title>`
plus og:title; a sample-first diff against this clone's production
served HTML found 59/60 pages drifting.

Findings:

- 7,066 of 7,067 census URLs carry a title on the reference. The one
  miss is `/content-preview/render` — the reference answers HTTP 405 to
  a plain GET (this clone serves its own page there; no registry entry,
  the route keeps its template title).
- 7,054 census titles end with ` | Hyper3D`; the 12 homepages (EN + 11
  locales) use the brand-first pattern `Hyper3D Rodin - …` with no
  suffix.
- The reference's og:title / twitter:title equal the `<title>` minus
  the suffix (0 mismatches in the sampled verification) — the card
  title is derived, not stored.
- og:url on the reference's locale pages is the locale page's own URL;
  canonical is in-locale there. This clone's locale pages keep the
  t66 canonical-to-English contract; the og:url added in t75 is the
  locale page's own URL.
- The drift classes fixed: separator (`—` vs `|`), missing brand
  suffix on three index pages, machine-stub localized titles
  ("Hyper3D — 中文版", "3D 提示词 — Hyper3D"), un-translated feature
  names inside localized templates ("AI Image Generator — 機能 —
  Hyper3D"), slug-derived titles where the reference has real SEO copy
  (blog posts, use-cases, styles, sub-categories), and locale
  homepages.
- The reference's locale blog slugs carry a `-{locale}` suffix
  (`/zh/blog/2d-image-to-3d-model-zh`) — this clone already served
  them (t70), so the registry keys them directly.

The explicit registry extension: the twelve bare `/tools` indexes (EN
+ 11 locales) are served by the reference with real localized titles
but never sitemapped (the t70 serving gap) — probed separately and
pinned, so the registry is exactly (sitemap − `/content-preview/render`)
+ 12 `/tools` indexes = 7,078 paths. The boundary is pinned both ways
in `src/lib/reference-titles.test.ts`.

Out of scope (kept honest, unchanged): body copy, meta descriptions,
per-page og:image assets (the shared-banner hotlink remains), and the
deep served-but-not-sitemapped routes (3D prompt library pagination/
details/hubs, blog pagination, per-locale sub-category slugs beyond
each locale's sitemap list). The reference 404s `/blog/category/*` and
`/3d-prompts/models/rodin` while serving `/blog/page/2`
("Blog — Page 2 | Hyper3D" — an em-dash in the reference's own title)
and `/3d-prompts/2` ("Free 3D Prompts & Examples / Page 2 | Hyper3D");
this clone's deep-route behavior is unchanged from t69/t70.

Files: `full-title-probe.py` (the probe), `build-title-registry.py`
(the generator — regenerate only from a fresh probe),
`title-probe.json` (the raw capture, 7,078 titles + the one 405).

Reset note: this session began at the 10th workspace reset — recovery
procedure re-verified end to end (credential store rebuilt from the
persistent credential list, `git clone --depth 50`, `bun install`,
`.env` restored, 572/37 baseline green, lint clean) before any t75
work began.
