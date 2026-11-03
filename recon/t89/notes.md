# t89 notes — the blog tree's body density, phase 1 (the written 24)

## Task definition (from the t88 worklog's next-step directive)

"Sweep the whole clone for remaining thin routes (blog bodies,
sub-categories, locale trees), then long-tail polish." The sweep ran first
(`t89-probe-sweep.py`, committed): 1092 EN routes from the clone's own
sitemaps, reference vs clone visible-word ratio per route, THIN < 0.55.

## Sweep findings (the durable map, recon/t89/sweep-en.json)

| family | n | thin | avg | verdict |
|---|---|---|---|---|
| /blog articles | 778 | 777 | 0.16 | the main battlefield |
| /tools | 203 | 203 | 0.25 | t90+ |
| /styles | 21 | 20 | 0.47 | t90+ |
| /legal | 5 | 5 | 0.26 | t90+ |
| /features | 18 | 3 | 0.56 | 3 laggards, t90+ |
| static | 12 | 6 | 0.58 | mixed |
| /help, /sub-categories, /use-cases, blog index, home | — | 0 | 0.65-0.92 | t84-t88 held |

Correction to the worklog's guess: sub-categories are NOT thin (0.74 avg —
the t65 pages were already dense enough). The blog family is the battlefield,
split 55 written / 723 not-written.

## t89 scope chosen: the 24 deepest-thin WRITTEN articles

The written set is where the clone owes real body: 54/55 written articles
were THIN (0.12-0.50) against reference URLs that serve 2.0-3.5K-word
evergreen articles. Phase 1 = the 24 worst (ratio ≤ 0.21 plus the review):
8 format explainers, 5 format comparisons, 7 conversion/generation guides,
2 prompt guides, 1 product review. Phase 2 (t90): the remaining 31 written
articles (0.23-0.50). Phase 3 (t91+): the 723 not-written routes (family-
templated reference-anatomy attribution) and the tools/styles/legal laggards.

## Method (the t85-t88 recipe, ported to the blog tree)

1. **Capture** (`t89-capture-written.py`): the reference's per-URL article
   anatomy for all 55 written slugs — h2 bands (chrome excluded), h3 subs
   (the reference's own tool lists), visible word count, article class, and
   this clone's pre-deepening word count — generated into
   `src/lib/blog-reference-anatomy.ts`. The reference's own SEO quirks
   (doubled keyword headings like "What is an OBJ file?: What Is Obj File")
   are captured verbatim and recorded faithfully, per the t86/t88 quirk
   convention.
2. **Type + registry**: `BlogArticleDef.referenceBands?: { title, note }[]`,
   merged in `blog-registry.ts` from six content modules (a-f) with a
   load-time invariant (deepening slug must be written).
3. **Renderer**: one shared section — "The reference's article at this URL,
   answered here" — attribution paragraph quoting the captured word count,
   then an accordion of the reference's verbatim h2 bands, each answered by
   this clone's own note (prose links, real routes only). TOC gains one
   entry. `articleText` (honesty contract) flattens the NOTES but not the
   verbatim titles — the titles are pinned separately against the anatomy.
4. **Content**: ~19K words of authored notes across 24 articles (initial
   write + four extension waves, `t89-extend-notes*.py` committed as the
   record). Anchors: EXPORT_FORMATS (six, pinned), the formatcon/viewer
   tool contracts, 50/1/10 credit constants, the multi-view schema, the
   presets panel (Gen-2.5/Gen-1.5, privacy, batch, 0-65535 seed), the HDRI
   and SVG-to-3D real engines, format facts (history, structure, failure
   modes), and the reference's own h3 tool lists as attribution.

## The floor design (and its mid-course correction)

The per-article note-word floor is COMPUTED from the captured anatomy:
`ceil(0.58 x refWords) - cloneBaseWords - 150` — self-maintaining, tied
directly to the 0.55 sweep bar (0.58 = bar + probe-noise margin). The
first draft used hand-set tier floors (1450/1050) that over-targeted
0.57-0.70 for the largest references and under-sized the recheck loop; the
computed floor corrected the overdesign while keeping every article above
the line. Lesson recorded: derive density floors from the captured pair
(reference words, pre-state clone words), not from tier intuition.

## Verification (all layers)

- `bun run test`: **1087/55 green** (baseline 1076 + 11 new deepening tests:
  phase-set equality, verbatim-title pinning against the anatomy, note
  floors (computed), local-boundary statements, six-format enumeration per
  article, credit-constant anchoring, prose-link route validity, anatomy
  coverage of all 55 written slugs).
- lint clean; tsc 26 = baseline (pre-existing legacy set).
- `verify-served.py`: **104/104** — all 24 routes 200 with the band section,
  ≥6 verbatim summaries each, attribution word count quoted; untouched
  controls carry no band section; the filler contract (no bands, no TOC,
  honest banner) survives; unknown slug 404s.
- `t89-reprobe.py`: **0/24 THIN** — ratios 0.55-0.77 (avg ~0.59), from
  0.12-0.23 pre-deepening. The full sweep map for the remaining families
  is in sweep-en.json for t90+.
- VLM ×3 (obj-format, obj-vs-stl, prompt-guide): **NO DEFECTS** each —
  download/t89-verify/.

## Vercel deploy outcome

Attempted post-push per convention: still the t80-t88 fair-use block —
resource_creation_blocked on the surviving token, backup token forbidden,
live domain 402 account-wide; latest production deployment remains
dpl_E6YXAjhq (0d56c9b, t77-era). The local standalone build is the
verification of record (this file).
