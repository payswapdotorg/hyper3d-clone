# t79 recon — the reference's locale blog category/pagination routes (2026-11-01)

The t78 session queued this gap: the reference serves
`/{locale}/blog/category/{slug}` and `/{locale}/blog/page/{n}` (200) that
this clone's locale catch-all 404'd. This recon closed it end to end.

Method: two probes.
1. `status-matrix.py` — HEAD matrix, 389 URLs: 11 locales × {blog index,
   12 categories, 19 pages} + the EN controls + suffixed-form spot
   probes. Result: **383/383 real routes → 200; the six `-{locale}`
   suffixed category forms 404** — the reference never localizes the
   category slug.
2. `head-probe.py` — GET probe of all 383 pages capturing every head
   dimension (title/description/robots/fb token/og:* /article namespace/
   RSS link/canonical/hreflang set/twitter card) + body shape
   (h1, article links, pagination nav).

Findings:

- **Serving matrix**: 11 locales × (12 categories + 19 pages) + the EN
  controls — 383 pages, all 200. Every locale serves the reference's
  FULL 20-page window even though the locale sitemaps carry only 234–235
  articles (zh blog sitemap: 234) — the pagination window is the EN
  math, not the locale's own.
- **The locale pagination pages do not actually paginate**: pages 2, 3,
  19, and 20 of /zh/blog/page/* list 36/39 identical article links —
  each page repeats the index's list plus a small per-page tail. The EN
  pagination repeats a 37-link fixed block too (page 2 vs 3: 37/44
  identical, first 37 in the same order) with a per-page tail of 5–7.
  The reference's pagination is a fixed recommendation block + a small
  tail, not a clean 40/page slice.
- **robots**: categories `noindex, follow` (132/132 locale + 12/12 EN —
  extends the t78 finding, which had verified nine of the twelve);
  pagination `index, follow` (209/209 + 19/19); the fb token constant on
  all 383.
- **Pagination head aliases the index**: canonical AND og:url point at
  `/{loc}/blog` (the locale blog index, never the pagination URL) while
  the 13-link hreflang set still points page-for-page
  (`/{loc}/blog/page/{n}`, x-default → EN). og:image: the shared
  `hyper3d.ai/assets/og-banner.webp` on all 383 — exactly the t77
  fallback URL, so no registry needed.
- **Titles are pure templates over 155 words**: pagination
  `{Blog word} — {Page word} {n} | Hyper3D` (0/209 mismatches);
  categories `{localized category name} | {Blog word} | Hyper3D`
  (0/144); og:title = title minus ` | Hyper3D` (383/383).
- **Descriptions likewise**: pagination `{Page word} {n}: {locale index
  description}` — byte-identical to the t76-registry locale blog index
  descriptions on all 209; categories the EN sentence `Browse the latest
  Hyper3D blog posts in the {localized name} category.` (144/144).
- **Category canonical is SELF, in-locale** (not the EN original — a
  real exception to the t66 locale contract), with **zero hreflang
  links** on all 144 category pages (the only family-route class the
  reference ships without an alternate set).
- **The hreflang tag for Portuguese is `pt-BR`** on every page — this
  clone's `hreflangFor` was emitting bare `pt`; fixed globally in t79.
- **EN head corrections discovered en route** (this clone already served
  these routes with template head): the real EN pagination title is
  `Blog — Page {n} | Hyper3D` (not `All articles, page n — Blog —
  Hyper3D`), its canonical/og:url alias `/blog`, its description is
  `Page {n}: {the /blog registry description}`; the real EN category
  title is `{Name} | Blog | Hyper3D` in the reference's own title case
  (`Text To 3D`, not `Text to 3D`), its description the same Browse
  template, zero hreflang.
- **Category body**: the reference's locale category pages list that
  locale's own translated articles (zh/news lists exactly three -zh
  articles — a subset of this clone's census-derived five; the reference's
  locale category lists are partial CMS lists, not the full topic).

Deliverables: `src/lib/locale-blog-terms.ts` (the ~155-word translation
registry — 11 Blog words, 11 Page words, 132 localized category names,
12 EN title-case names; generator `build-locale-blog-terms.py`, values
asserted against every probed route before emission), two new
`LocalePageDef` kinds (`blog-category`, `blog-pagination`) resolved in
`resolveLocalePage` + 341 new `localeServingPaths` entries, the locale
catch-all's per-kind metadata (self-canonical/no-hreflang/noindex
categories; index-aliased/13-hreflang pagination), two honest locale
views (`BlogCategoryLocaleView`, `BlogPaginationLocaleView`), the EN
category/pagination head corrections, and the `hreflangFor` pt→pt-BR
fix (affects every locale page's alternate set).

Out of scope, queued as **t80**: the reference serves a 13-link hreflang
set on EVERY censused EN page (probed: /pricing, /features/*, /blog,
/blog/{article}, /help, /tools all carry it) while this clone's EN
family routes emit none — `familyMetadata` never generates
`alternates.languages`. That is a full-tree dimension (~5,000 EN routes),
deliberately not smuggled into t79.

Verification: 24 new tests (`src/lib/locale-blog-routes.test.ts`) +
3 updated pins in `i18n.test.ts` — 886/46 suites green; lint clean;
tsc 26 = baseline 26 (no new errors); local standalone production build
verified on served HTML (zh/ar/fr category + pagination titles,
descriptions, robots, canonicals, og:* cards, 13-link hrefLang sets with
pt-BR, RSS links, the zero-hreflang category shape, and the four 404
boundaries: page/1, page/21, suffixed categories, unknown categories).

Production note: the Vercel account remained fair-use blocked at deploy
time (`resource_creation_blocked`, both tokens tried) — as at the end of
t78; production re-verification stays pending until Vercel serving is
restored. Code is pushed to GitHub.
