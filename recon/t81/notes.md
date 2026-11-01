# t81 recon — the EN blog article bodies' link structure (2026-11-01)

The t80 notes queued this as the remaining body-level gap: the reference's
article bodies carry a link anatomy this clone's written articles lack.
This recon probed all 55 counterpart pages for the slugs this clone
actually wrote (`article-probe.py`, 55/55 HTTP 200; raw capture
`article-probe.json`; `analyze.py` + `validate-registry.ts` for
cross-checks against the t76/t77 registries).

## The reference's anatomy (per article, probed)

Two classes, split exactly along the article-content divide:

- **Class A — the 24 format/comparison/prompt-guide articles**
  (what-is-glb-file, glb-vs-gltf, 3d-text-prompt-guide, ...): 2-9 real
  inline prose links PLUS the "Keep reading" related-card section
  (3 cards each, 72 cards total, every href a /blog/ article).
- **Class B — the 31 platform/credits/account-FAQ articles**: 0-3 prose
  links (one outlier, official-hyper3d-links-and-scam-safety, at 9 —
  it is a links round-up whose targets are the reference's own social
  profiles), NO related section.

Constant on ALL 55 (both classes):

1. **TOC** ("On this page"): first entry is always "Overview" →
   `#article-top`; the anchor sits on the `<header id="article-top">`
   wrapping the H1. 2-11 entries per article (h2s + h3s).
2. **Share panel** (`<section class="share-panel"
   aria-label="Share this article">`, h3 "Share"): six networks, each
   `target="_blank" rel="noopener noreferrer nofollow"` with
   `aria-label="Share on X|LinkedIn|Facebook|Reddit|WhatsApp|Email"`,
   plus a "Copy link" button. Exact formulas (url = the article's own
   URL, title = the H1, both percent-encoded):
   - X: `https://twitter.com/intent/tweet?url={url}&text={title}`
   - LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={url}`
   - Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}`
   - Reddit: `https://www.reddit.com/submit?url={url}&title={title}`
   - WhatsApp: `https://api.whatsapp.com/send?text={title} {url}`
   - Email: `mailto:?subject={title}&body={url}`
3. **Vote card** ("Was this post useful?", Yes / "Not really" buttons,
   `data-vote-key="blog:{slug}"`) — functional UI, not links.
4. **Side CTA**: 0/55 on these articles (the 50%-off side CTA appears
   only on not-written articles like zbrush-alternative) — out of scope.

The related cards: image = the target's og:image hotlinked from
storage.deemos.dev (`<img>` with `alt="{slug}" width="1200"
height="675" loading="lazy" decoding="async"`), title = the target's
H1, description = a ~155-char snippet.

## Registry cross-validation (validate-registry.ts)

- **Card image == t77 `referenceOgImage(href)`: 70/72.** The two misses
  are the same known oddball — /blog/ai-3d-prompts, whose URL embeds a
  U+2060 WORD JOINER: the t77 registry pins it percent-encoded
  (`%E2%81%A0`), the reference's card emits the raw character. Same
  URL modulo encoding; the clone keeps the t77 value (the established
  byte-alignment source).
- **Card description == t76 `referenceDescription(href)`: 57/72 exact**,
  ~10 more equal modulo HTML entities (`&#39;` vs `'` — my capture kept
  entities raw), 2 genuine reference-internal inconsistencies
  (what-is-3d-rendering, free-ai-avatar-generator: the card snippet and
  the og:description are different truncations of the same source).
  The clone's honest rule is self-consistency: the card shows exactly
  the description the destination's own head serves
  (`referenceDescription(href) ?? own description`), truncated at
  155 chars + "..." when longer (12/72 t76 values exceed 155).
- **Prose-link palette (internal)**: /tools/viewer/{fmt},
  /tools/converter/{fmt}/to/{fmt}, /tools/image-to-{fmt}, /workspace
  (+ /workspace/rodin, /workspace/rodin/tab/*, /workspace/omnicraft/*,
  /workspace/subscribe, /workspace/login), /features/*, /use-cases/*,
  /styles/*, /help, /pricing, /blog cross-links. External: the
  reference's own socials/docs (discord, twitter, youtube, instagram,
  blender.org, gltf-viewer.donmccurdy.com, gltfeditor.com,
  api.hyper3d.com) — the reference links OUT 9 times across 55 pages.
- One reference artifact: a Google-click-ID-polluted link
  (`/en?_gl=1*...`) — not reproducible on purpose.

## The clone's honest mirror (this task's contract)

Structure aligned, copy stays this clone's own (the two-tier contract):

- Every written article gets: the TOC "Overview" → `#article-top` first
  entry (anchor on the article header), the share panel (same six
  formulas + Copy link, built from the clone's own SITE_ORIGIN and its
  own H1 title), and inline prose links in its own paragraphs.
- The 24 class-A articles get the "Keep reading" section: their
  blog-article related links rendered as image cards (t77 image, the
  destination's own on-page title, the destination's head description
  truncated at 155+"..."); non-blog related links stay chips. The 31
  class-B articles keep the chip-style "Related" section, mirroring the
  reference's absence. The 24-slug set is probed data, pinned as
  `KEEP_READING_SLUGS`.
- Inline prose links are authored per article at natural spots, all
  internal routes this clone genuinely serves (validated by test).
- Out of scope, documented: the vote card (functional UI with a vote
  backend the clone does not have — shipping dead buttons would fake
  functionality), the side CTA (0/55 here anyway), the heading-N id
  scheme (the clone's #section-N is the same structure), external
  prose links (the clone's honest destinations are its own routes),
  og:image asset mirroring (the standing t77 decision), and locale
  article bodies (translation shells per the t76/t79 contract).

Out of scope, queued for later: nothing new queued from this recon —
the remaining known gaps stay the /workspace app-surface routes and
the og:image mirroring decision.

## Deliverables (implemented)

- `src/lib/blog-prose.ts` — the markdown-lite parser (`[label](href)` →
  runs; internal → next/link, external → plain anchor with the
  reference's `target="_blank" rel="noopener noreferrer nofollow"`).
- `src/lib/share-links.ts` — `shareLinks(path, title, origin)`, the six
  formulas + aria-labels, pinned byte-exact by test.
- `src/lib/blog-related.ts` — `KEEP_READING_SLUGS` (the probed 24),
  `cardSnippet` (155+"..."), `relatedCard(href)` (t77 image ?? fallback
  banner, destination's own on-page title, destination's head
  description snippet-shaped).
- `src/components/hyper3d/blog/copy-link-button.tsx` — the client
  Copy-link action (clipboard API + execCommand fallback, honest
  failure state).
- `src/components/hyper3d/blog/blog-page.tsx` — `#article-top` on the
  article header, the TOC "Overview" first entry, `<Prose>` rendering
  for section paragraphs, `<SharePanel>` (six icons + copy) after the
  FAQ, and the two-class related split: class A renders "Keep reading"
  image cards (blog links) + a compact chip row (non-blog links);
  class B keeps the "Related" chip row.
- Content: **103 curated inline prose links** across all 55 written
  articles (three authoring passes, script-applied with
  exactly-once anchor assertions — `apply-inline-links.py`,
  `apply-inline-links-2.py`, plus the fbx boost). Class A ≥2 each
  (median 2-3, proportional to the clone's shorter prose against the
  reference's 7-14); class B 1-3 where natural (reference: 0-3).
- `src/lib/blog.test-helpers.ts` — the shared `isKnownRoute` (now
  covering the tools tree: 15 viewer routes, 178 converter pairs, 8
  image-to routes), extracted from blog.test.ts so chips and prose
  links validate against the same vocabulary.

## Verification

- 31 new/updated tests: parser (6), content invariants (5 — every
  article ≥1 link, class A ≥2, all hrefs known routes, blog links
  resolve, family vocabulary), share formulas (10), related cards
  (10) + blog.test.ts refactored onto the shared helpers.
  **945 tests / 51 suites green** (was 914/48). Lint clean. tsc 26
  errors = baseline, none in touched files.
- Local standalone build verified on served HTML (`verify-served.py`,
  10 routes: 6 class A + 4 class B): TOC Overview→#article-top, the
  anchor, all six share URLs byte-exact against the formulas (entity
  and JS-encodeURIComponent parity handled), aria-labels, Copy link,
  rel attribute, prose-link floors, Keep-reading cards with registry
  images (incl. the og-banner fallback card on hyper3d-review —
  correct: that route's reference og:image IS the banner), class B
  chip rows. 0 failures.

## Honest exclusions (documented)

- The vote card ("Was this post useful?") — 55/55 on the reference,
  but functional UI needing a vote backend; shipping dead buttons
  would fake functionality. Skipped.
- The side CTA ("Try Hyper3D for free", 50% off) — 0/55 on these
  articles anyway (reference promo copy; the clone's own "Put it to
  work" CTA stands).
- External prose links (the reference links to blender.org, its docs,
  its socials) — the clone's honest inline destinations are its own
  routes; internal-only.
- The not-written filler pages keep their established t65 honest
  design (no share panel/TOC changes) — the t81 dimension is the
  written articles' bodies.
- `heading-N` TOC anchor ids — the clone's `#section-N` is the same
  structure; the reference's N values are source-markdown offsets.

Production: Vercel remained account-blocked at t80 (402 account-wide,
resource_creation_blocked on the surviving token); the local
standalone build + verify-served.py is the verification of record
here too. Deploy attempted after push — outcome in the deploy section.
