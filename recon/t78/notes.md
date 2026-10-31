# t78 recon — the remaining head dimensions: robots, facebook-domain-verification, the article namespace, and the blog RSS link (2026-10-31)

Method: the t77 census URL list (rebuilt from the title registry keys —
7,078 paths + the one 405 = 7,079 URLs) probed with `meta-probe.py`
(24 threads, ~99 seconds) for every head dimension the t68–t77 chain
had not yet covered: `<meta name="robots">`,
`<meta name="facebook-domain-verification">`, `og:type`, the whole
`article:*` namespace, and `<link rel="alternate"
type="application/rss+xml">` presence (attribute orders handled,
HTML-unescaped).

Findings:

- **robots** is a served value with exactly two shapes: `index, follow`
  on 7,077 pages and `noindex, nofollow` on exactly one —
  `/content-preview`, the same honest-exclusion page that carries no
  description (t76), no og:image (t77), and no og:type at all. The
  noindex seen on some uncensused routes is the reference's own 404
  page (e.g. the mistyped `/blog/deemos-shutterstock`), not a censused
  page. Separately probed outside the census: the reference serves its
  blog category hubs as **`noindex, follow`** (all 9 real categories:
  news, comparisons, xr, ai-texturing, game-development, prompt-guide,
  insights, workflow, animation — every one 200 with that exact
  value), its blog pagination as `index, follow`, and its app-surface
  workspace routes (post-login-redirect) carry NO robots meta at all.
- **facebook-domain-verification** is one constant token on every
  censused page — `lu7584v1wtckhvpsboezn5jbytqgf8` — 7,077 of 7,078,
  absent only on `/content-preview` (and on the workspace app surface).
  Pinned verbatim; like the @DeemosTech twitter attribution it is the
  reference's own published head byte, inert on any other domain.
- **og:type** census: website 3,323 / article 3,754 / absent 1 (the
  eternal `/content-preview`). The 3,754 article-typed pages split
  exactly into 3,358 blog articles + 396 help articles (33 × 12
  locales).
- **The article namespace ships on blog articles only**: 3,358 pages
  (every EN article + all 11 locale variants) carry
  `article:published_time` + `article:modified_time` +
  `article:author`; the 396 help articles carry og:type=article but
  ZERO article metas. Pinned per-page in
  `src/lib/reference-article-metas.ts`:
  - published: 3,331 distinct ISO timestamps — real per-page CMS data
    (EN originals Feb–May 2026; the twelve zbrush-alternative variants
    span 2026-05-14T18:02:23Z..T18:02:35Z, their translation moments);
  - modified: 629 distinct — 2,640 pages share the global rebuild
    `2026-06-25T21:05:48.398Z`, the rest carry per-article touches;
  - author: four real bylines — "Hyper3D" (3,328), "Hyper3D News" (11),
    "joel" (12 — the photo-to-3d-model family), "Hyper3D Team" (7 —
    some locale variants of the NVIDIA×Lowe's feature).
- **The RSS alternate link** ships on 3,370 pages, every one /blog
  family: the 12 locale blog indexes + the 3,358 articles. Separately
  probed outside the census: the reference also ships it on blog
  pagination and on the (noindex,follow) category hubs. The exact
  reference tag: `<link rel="alternate" type="application/rss+xml"
  title="Hyper3D Blog" href="/blog/rss.xml">` (relative href; this
  clone's metadataBase resolves it to its own absolute /blog/rss.xml —
  the same origin translation every canonical already applies).
- Bonus alignment: the reference preconnects + dns-prefetches
  `storage.deemos.dev` on every page — this clone now hotlinks 4,014
  og:images from that host, so its root layout ships the same two
  hints (React 19 hoists them into <head>; verified in served HTML).

Wiring: `robots: "index, follow"` + `other:
{ "facebook-domain-verification": ... }` added to `familyMetadata()`
(every EN family route + pagination + workspace omnicraft pages spread
it) and to the locale catch-all and the homepage's inline metadata.
`familyMetadata` gains two optional inputs: `article` (fills
openGraph.publishedTime/modifiedTime/authors from the registry) and
`rss` (adds the alternates.types link). The blog routes pass both —
index, written and not-written articles, pagination, categories (the
category route then overrides robots to the reference's own
`noindex, follow` — the one deliberate exception in the family).
`not-found.tsx` gains the reference's own 404 head: title "404 Page
Not Found | Hyper3D", robots "noindex, nofollow", the fb token.
`/content-preview` already served `noindex, nofollow` with no fb token
— exactly the reference's shape, untouched.

One framework artifact, documented: Next 16 injects
`<meta name="robots" content="noindex">` UNCONDITIONALLY on any
notFound() response (make-get-server-inserted-html.js), so the clone's
404 serves that tag alongside the explicit `noindex, nofollow` — two
robots metas where the reference serves one. Semantically identical
(crawlers combine multiple robots metas by taking the most restrictive
interpretation, which is noindex+nofollow either way); suppressing
Next's auto-tag is not possible, and dropping the explicit tag would
lose the follow directive — a real semantic drift. Chosen: keep the
explicit tag, document the duplicate.

Out of scope (kept honest, unchanged): body copy, per-page og:image
mirroring, og:image dimensions (the reference ships none — t77), the
workspace app surface (serves no robots/fb on the reference either —
verified post-redirect), and the two DISCOVERED gaps now queued:
the reference serves `/{locale}/blog/category/{slug}` (200,
noindex, follow) and `/{locale}/blog/page/{n}` (200) routes that this
clone's locale catch-all does not resolve (404) — the t79 candidate.

Files: `meta-probe.py` (the probe), `build-article-metas-registry.py`
(the generator — regenerate only from a fresh probe),
`meta-probe.json` (the raw capture: robots/fb/og:type/article/rss per
page + the 405).

Verification: 42 new tests (862 / 45 suites green), lint clean, tsc
baseline unchanged (26 errors, none new). Local standalone production
server spot-verified on served HTML — /pricing, /help, /blog (+
RSS link), /blog/zbrush-alternative, /blog/page/2,
/blog/category/news (noindex, follow + RSS), the locale article
/zh/blog/2d-image-to-3d-model-zh (article metas + RSS), /zh/blog,
/features/text-to-3d, the homepage, the 404 (title + robots + fb, with
the documented duplicate), and /content-preview (noindex, nofollow, no
fb — the reference's own shape).

Production note: the Vercel account's serving edge went mid-session
into a hard `402 Payment required / DEPLOYMENT_DISABLED` state (every
route, including direct deployment URLs; the API still reports all
deployments READY and billing active — an account-level serving block,
not fixable from the API). The t78 verification above ran against the
local standalone production build instead; production verification to
be re-run once Vercel serving is restored. The code is pushed to
GitHub regardless.
