# t88 — the help tree's body density

The t84 arc's fourth and last named family: after t85/t86 (features) and
t87 (use-cases), the /help tree sat at 0.44 per the t84-era probes — 39 of
40 routes under the 0.55 line (only /help/features, the 14-card hub,
passed). t88 ports the proven recipe one more time: a registry-driven
optional section added once to the shared renderers, then registry content
only — every article mirroring the reference's OWN anatomy
(recon/t88/t88-anatomy.py, h1/h2/h3 dump of all 40 routes, 2026-11-02)
with the clone's three-way honesty contract on top.

## Density outcome (recon/t88/t88-probe-help.py, standalone :3112 vs prod)

| route | ref | clone | ratio (was 0.14-0.74) |
|---|---|---|---|
| /help | 916 | 754 | 0.82 |
| /help/getting-started | 931 | 671 | 0.72 |
| /help/account-settings | 811 | 561 | 0.69 (was 0.19) |
| /help/billing | 865 | 561 | 0.65 (was 0.29) |
| /help/credit | 928 | 609 | 0.66 (was 0.38) |
| /help/features | 1157 | 1179 | 1.02 (was 0.74) |
| /help/enterprise | 794 | 494 | 0.62 (was 0.14) |
| articles (33) | 929-1329 | 493-931 | 0.55-0.89 (was 0.22-0.40) |

All 40 above 0.55; 0/40 THIN. Calibration note: the reference's page
totals are chrome-heavy (~716-744 nav/footer words vs 149-301 in
<main>), so the clone's body carries the density — the honest mirror
is the per-band anatomy, not padding.

## What was added (the recipe, ported)

- **`faq: HelpFaqItem[]`** on every article — a "Related questions"
  accordion band after the body (the t85-t87 FAQ-floor convention, in
  the use-cases tree's exact visual family). 4-6 items per article,
  every answer >=80 chars, each question ending in "?".
- **Reference-verbatim bands**: every article now carries 4-8 sections,
  mirroring the reference's own un-mirrored h2 bands verbatim-titled
  with honest content — e.g. "What can you create with Hyper3D?",
  "Add Textures to Your Model", "Rodin Text to 3D", "When a
  verification code appears", "Upgrading Your Subscription", "Web
  generation", "Subscription credits", "Choose between Gen-2.5 and
  Gen-1.5", "Assign Image Directions (Optional)", "Model appears white
  or untextured", "Business Lisence" (the reference's own typo,
  recorded faithfully — the t86 quirk convention).
- **Category guides** on all 6 hubs (`guide` on HelpCategoryDef): the
  topic's honest walkthrough + its own FAQ band, rendered after the
  article list.
- **The index's "How to read these answers"** band
  (HELP_READING_GUIDE): the three-way contract explained in prose plus
  the index's own FAQ.

## Two honesty bugs fixed on the way (the t85 convention)

1. **The stale seed claim.** The settings article said "no seeds —
   absence stated on the panel itself", but the studio's presets panel
   really carries a numeric seed (0-65535) with a lock/randomize
   toggle (`lockSeed`, aria-label="Seed"), sent on every engine task.
   The note now states the real surface, a new test pins it against
   studio.tsx, and the two stale sentences are gone.
2. **The stale multi-view claim.** The images article's note said "no
   multi-view capture" full stop, but the API schema really accepts
   one primary image + up to 4 direction-tagged extra views
   (mvImages.max(4), imageLabels enum) on the neural tier. The note now
   splits the truth (multi-view INPUT is real; multi-view CAPTURE is
   not), and a test pins the schema string.

Plus one carry-over fix: the t87 VLM script's `require()` tripped the
fresh post-reset eslint install — file-level disable with a comment
(pre-existing at HEAD, verified by stash; not a t88 regression).

## The honest decisions worth recording

1. The reference's price ladder rides the plans article as
   **attribution only** ("the reference's plan ladder (its prices, not
   this clone's)" + "Free: $0" answered in this clone's terms), with
   the local boundary stated in the same article — test-enforced: the
   plans article must contain "the reference" AND "no plans and no
   prices", and no other billing/credit article may quote a dollar
   amount.
2. The two thinnest hubs (account-settings 0.19, enterprise 0.14) got
   their density from longer guides + more FAQ items — genuinely
   useful triage content for two-article and one-article topics, never
   invented article cards.
3. The FAQ answers repeat the codebase's real constants (50/1/10, 402,
   409, 7-day cookie, six formats) rather than new claims; the honesty
   contract covers them because articleText flattens the faq band
   (the t87 pageText convention).
4. The ChatAvatar "Business Lisence" band carries the reference's own
   typo with its explanation, pinned verbatim in tests — faithful
   recording, never silent correction.
5. The MCP article's new bands serve the modal's byte-pinned constants
   (https://api.hyper3d.com/api/mcp, npm install --global @hyper3d/cli)
   — verified served-side in verify-served.py.

## Verification record

- bun run test: 1076/1076 green, 54 suites (1067 -> 1076, +9 t88
  tests: FAQ floor + question form, section floor >=4, the 53-line
  verbatim-band map, price-attribution rules, the Lisence quirk, hub
  guide floors, the reading-guide contract, the multi-view schema pin,
  the real-seed pin). articleText now flattens the faq band so the
  honesty contract (credits/formats/mcp/live routes) covers it.
- lint: clean (after the t87-script carry-over fix). tsc --noEmit:
  26 errors = the pre-existing baseline.
- Standalone build, served on :3112: recon/t88/verify-served.py
  199/199 — all 40 routes 200, every article renders >=4 FAQ
  <details> + the band heading, every hub >=3, the index's
  reading-guide band, the spot-checked reference-verbatim bands, the
  attributed price numbers + the local boundary in one page, the MCP
  constants, the image-count caps, both Gen versions, the seed and
  privacy statements, the 2K/4K dimensions, unknown article + category
  404s, and untouched features/use-cases pages with no help FAQ band
  (recon note: features pages legitimately carry their own t85/t86
  <details> — the regression marker is the help band heading, not
  <details> itself; same lesson family as t87's text-to-3d note).
- VLM layout: NO DEFECTS x3 (features-article full-stack, credit-hub
  guide anatomy, help-index reading-guide) — screenshots in
  download/t88-verify/.
- Vercel deploy attempt on the pushed commit (29bb529), both tokens,
  per the t80-t87 pattern: token-1 HTTP 402 resource_creation_blocked
  (fair-use block), token-2 HTTP 403 forbidden/invalidToken, live
  domain 402 account-wide. Local build verification (199/199) is the
  record of note.

## Next (per the t84 arc)

The arc's four named families are complete (features, use-cases, help).
The remaining work is the sweep: re-probe the whole clone for any thin
routes outside the named families (blog bodies, sub-categories, the
locale trees), then the long-tail polish.
