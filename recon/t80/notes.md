# t80 recon — the hreflang alternate dimension across the EN tree (2026-11-01)

The t79 session queued this gap: the reference serves a 13-link hreflang
set on every censused EN page while this clone's EN family routes emit
none (`familyMetadata` never generated `alternates.languages`). This
recon closed it end to end.

Method: three probes.

1. `hreflang-probe.py` — GET probe of all 1,092 censused EN pages (the
   t75 census minus the 5,986 locale URLs), capturing the full
   `<link rel="alternate" hreflang>` set verbatim plus canonical. All
   1,092 pages returned 200. Raw data: `hreflang-probe.json`.
2. `target-probe.py` — sample-probed the reference's hreflang TARGETS
   (existence, per class), the app surface, and uncensused 3d-prompts
   routes. Findings: every sampled target is live (200) on the
   reference — the sets are not dead links — and the app surface
   (/workspace, /workspace/omnicraft, /content-preview) plus every
   3d-prompts route below the index (numbered pages, detail slugs,
   model hubs) serves ZERO alternate links.
3. `analyze.py` / `analyze2.py` — shape derivation (below).

Findings:

- **542 full 13-link pages**: 309 family routes (root, /pricing, the
  tools/help/features/styles/legal/use-cases/switch trees, the blog
  index, the 3d-prompts index — plain-prefix targets `/{loc}{path}`)
  + 233 translated blog articles (targets `/{loc}/blog/{slug}-{loc}`).
  The lang order is constant: en, zh, de, ja, ko, ru, pt-BR, fr, es,
  ar, tr, it, x-default — the locale order is the sitemap order, pt
  tagged pt-BR (consistent with t79), x-default → EN last.
- **546 two-link pages** (`en + x-default`, both the bare page URL):
  the 543 untranslated blog articles, /event/chroma-awards,
  /sub-categories/dark-fantasy, /sub-categories/roblox.
- **One 6-link page**: /sub-categories/nsfw-content (en, ja, ko, pt-BR,
  es, x-default) — its four locale mirrors are exactly the censused
  locale sub-category routes.
- **Two partial blog sets**: /blog/free-stl-files-for-3d-printing (12
  links — every locale except zh) and /blog/use-bang-and-partial-edit
  (9 links — zh/de/ja/ko/ru/fr/es only: the same seven locales that
  rename the help oddball).
- **Zero-link classes**: /content-preview (censused); the blog category
  hubs (t79's finding, re-confirmed); the app surface; the whole
  3d-prompts tree below its index.
- **Two double-suffixed oddball targets**: the AR mirror of
  ai-game-character-creator is `/ar/blog/ai-game-character-creator-zh-ar`
  and the TR mirror of what-is-ply-file is
  `/tr/blog/what-is-ply-file-zh-tr` — already catalogued in
  LOCALE_BLOG_ODDBALLS.
- **One dead-link quirk**: the EN help oddball
  /help/articles/use-bang-and-partial-edit emits mechanical unsuffixed
  targets (`/zh/help/articles/use-bang-and-partial-edit`) that 404 on
  the reference itself (the renamed `-zh` routes are the live ones,
  probed 200/404 side by side). Mirrored verbatim.
- **Target/census reconciliation is exact**: 5,976 of the 5,983 unique
  locale targets are censused routes this clone already serves; the 7
  that are not are precisely the dead oddball targets above. The 2,580
  censused locale blog article URLs = 233×11 + 10 + 7, matching the
  probe's translation sets one-for-one (cross-validated in the
  generator before emission).
- **The root's own self links**: `https://hyper3d.ai/` (trailing
  slash) for en/x-default, `/{loc}` (no trailing slash) for the locale
  mirrors.

Deliverables: `src/lib/reference-alternate-languages.ts` (the registry
+ `referenceAlternateLanguages(path)` resolver; generator
`build-alternate-languages-registry.py`, values asserted against both
the probe and the census before emission), the `familyMetadata` wiring
(one funnel for every family route — seo.ts), the homepage's inline
set, and /tools dropping its now-redundant hand-pinned override.

Verification: 28 new tests (registry + wiring, every class covered) +
1 updated pin; 914 / 48 suites green; lint clean; tsc 26 = baseline;
local standalone build verified on served HTML (`verify-served.py`,
14 route classes compared link-for-link against the probe) — all
byte-identical except the homepage's two self links, where Next.js
normalizes root URLs to origin form (`https://…-clone.vercel.app` vs
`https://hyper3d.ai/`): equivalent URLs per RFC 3986, unavoidable
through the Metadata API, documented in DECISIONS.md #60.

Production: Vercel re-checked after push (both tokens; the account was
fair-use blocked at t78/t79) — outcome recorded below in the deploy
section appended after the attempt.

Out of scope, queued as t81: nothing queued from this recon — the head
dimensions (title t75, description t76, og:image t77, robots/fb/
article/RSS t78, locale blog family t79, hreflang t80) now cover
every head dimension the census probed. The remaining known gaps are
body-level: the EN blog article bodies' link structure and the
og:image asset mirroring decision (t77 notes).
