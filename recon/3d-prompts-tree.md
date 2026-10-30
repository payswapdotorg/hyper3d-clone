# Recon — the /3d-prompts tree (2026-10-31, live crawl)

The last large un-cloned surface on the reference. Everything below was
measured from static HTML (curl, no JS execution); the reference's card
grids are server-rendered so the census is exact.

## Route census

| Surface | Count | Notes |
| --- | --- | --- |
| Index pages | 17 | `/3d-prompts` + `/3d-prompts/2` … `/3d-prompts/17`; page 18 → 404 |
| Cards per index page | 24 × 16 + 19 | 403 cards, all unique, zero cross-page repeats |
| Detail routes | 403 | named (13) + id-suffixed (390, e.g. `…-2096342420543660277`) |
| Model hubs | 11 | `/3d-prompts/models/<model>`; `/3d-prompts/models` itself → 404 |
| Hub pagination | 13 extra | gpt-6-astra `/2`…`/11` (252 members), claude-fable-5.1 `/2`…`/4` (83); every other hub is a single page (≤24 members); `<model>/1` → 404 |
| Model memberships | 421 | every slug belongs to ≥1 hub; 18 slugs belong to 2+ |

Total tree: 17 + 24 + 403 = **444 routes** (443 new; `/3d-prompts` itself
was already shipped by t62).

## The 11 models (hub order as the index rail lists them)

gpt-6.1-sol (4), sonnet-5.5 (1), gpt-6-astra (252), opus-5.5 (2),
claude-opus-5.5 (16), gpt-6-sol (6), gpt-6-luna (1), claude-fable-5.1 (83),
kimi-k3 (22), claude-fable-5 (18), claude-opus-5 (16).

The reference's own index cards claim these counts; the crawled hub
memberships match every one exactly (421 total). Cards also carry
multi-model labels ("GPT-6 Sol / Claude Opus 5.5") consistent with the
hub lists.

## Index page anatomy (page 1)

Hero "Free 3D Prompts & Examples" → `#prompt-library` card grid (24 cards)
→ "See the prompts become working 3D" (6 external YouTube creator reviews —
the reference's own curation, links live) → "3D prompts for games, worlds
and simulations" (the 11 model-hub cards, "Explore N 3D prompt examples
created with <Model>.") → "Integrate 3D generation into your daily work"
(the studio's OWN example prompts with keyword chips — this is exactly the
t62 honest page's content) → "How to use a 3D prompt" (3 steps) →
"Imagine It. Shape It." footer CTA. Pages 2+ drop everything but the grid:
H1 becomes "3D prompt examples".

Card anatomy: image (storage.deemos.dev, community screenshot) + model
label + title + one-line description + external X/Twitter attribution +
date. JSON-LD: Organization, WebSite, CollectionPage (with hasPart HowTo),
BreadcrumbList (Home → page), ImageObject, HowTo (the 3 steps), plus a
second CollectionPage + BreadcrumbList ("All prompts") pair for the
library part. Pagination nav: numbered window + Prev/Next, `#prompt-library`
anchors.

## Detail page anatomy

Title `<Name> — <Model> 3D Prompt | Hyper3D`. H1 name → H2 "Prompt"
("Sign in to copy" + prompt text + "Show more …") → H2 "Keywords" (model
keyword chip + topic chips) → MCP entry card ("Create with Hyper3D MCP")
→ H2 "Make your next creation." (studio CTA) → H2 "Prompt optimization
tips" (H3 tips: Create with Hyper3D MCP / Specify editability / Close the
test loop / Stage long builds) → H2 "More ideas to explore" (related
prompts) → footer CTA. JSON-LD: CreativeWork + BreadcrumbList
(All prompts → Model → name).

## Hub page anatomy

Title `<Model> / Free 3D Prompts & Examples | Hyper3D`; H1
"<Model> 3D Prompts"; H2 "<Model> / 3D prompt examples" + the footer CTA.
Same card grid, 24/page, paginated for the two big models. JSON-LD:
CollectionPage + BreadcrumbList (All prompts → Model).

## Sitemaps (parity constraint)

The reference keeps the ENTIRE tree out of its sitemaps:
`landing-sitemap-static-en.xml` carries `/3d-prompts` only — no details,
no pagination, no hubs, no prompts child sitemap. robots.txt has no
/3d-prompts rule. The clone mirrors both choices exactly (zero sitemap
edits; pinned by test).

## Honest-clone mapping (t69)

- Route parity: all 444 routes exist. 36 detail routes get real,
  original prompt articles (this clone's own prompts, runnable in its
  text-to-3D studio); the other 367 are honestly marked "community
  prompt, not reproduced" — the reference's entries are externally
  attributed community submissions whose prompts, screenshots and
  attribution this clone does not copy.
- Model hubs: the reference's taxonomy indexes prompts by the
  third-party LLM they were written FOR. This clone's generator is its
  own pipeline, so the hubs exist for parity and say so; the member
  routes are listed with honest status rows (24/page, same page math).
- Index: written-first card order (no fake feed dates/attribution),
  the reference's external YouTube curation kept as external links
  clearly labeled as the reference's picks, the t62 studio-example
  content absorbed as the "Integrate …" band, how-to steps rewritten
  for this studio's real flow.
- JSON-LD: CreativeWork only for written prompts; CollectionPage +
  BreadcrumbList for index/hubs; HowTo on page 1 (real steps); marked
  routes carry no CreativeWork (nothing to describe — the t65 rule).

## Crawl artifacts

`/tmp/ref-idx-<1..17>.html`, `/tmp/ref-m-<model>[-<n>].html` (also
archived under the workspace scripts dir),
`scripts/prompts-cards.json` (extracted census),
`scripts/extract-prompts-cards.py` (the extractor).
