# t84 recon — the blog index's reference anatomy + the tools tree's compact converter aliases

Probed 2026-11-01 against the live reference (hyper3d.ai), continuing from
the t83 baseline (1023/53 green, e91ac4d).

## The gap analysis that picked this task

A text-density probe (scripts/t84-probe-density.py, 43 routes, reference vs
the local standalone build) found two classes of gap:

1. **Route class**: `/tools/stl-to-obj` — the reference 301s the compact
   converter alias to the canonical `/tools/converter/stl/to/obj`; this
   clone 404'd it. Every alias in the matrix was then probed (below).
2. **Body content**: the flagship content surfaces run 0.31-0.52 of the
   reference's visible word count — worst: /imageto3d 0.31, /features/api
   0.32, **/blog index 0.33 (+1795 words, the largest single-page gap)**,
   /use-cases/* 0.35-0.43, /styles/* 0.49-0.51, /help 0.44, /pricing 0.52.
   (Home 0.92 and /3d-prompts 0.83 are already close.)

The og:image-mirror candidate from the t83 handoff was REJECTED by recon:
the reference itself hotlinks storage.deemos.dev for essentially all card/
hero/og imagery (only the logo + a few chrome icons are same-origin
/_astro/ hashes) — hotlinking the same CDN is the faithful shape, and the
t83 storage preconnect hint exists precisely because of it. Mirroring 796
images into public/ would change served URLs, add repo weight, and reduce
fidelity. Documented, dropped.

t84 takes the two highest-value items: the blog index rebuild (the worst
flagship content gap, EN + all 11 locale indexes) and the converter alias
route class (found by the probe, fully enumerated below). The remaining
thin surfaces (features/use-cases/styles/help/pricing bodies) are the next
tasks' arc.

## The tools alias class (probed exhaustively)

`/tools/{from}-to-{to}` → 301 → `/tools/converter/{from}/to/{to}`:

- **167 of the 178 sitemap pairs serve the 301** (all verified one by one,
  scripts/t84-probe-aliases.py, exact Location pinned per pair).
- **11 pairs 404 on the reference even though their canonical pages are
  live 200s** (probed: /tools/converter/blend/to/dae = 200 while
  /tools/blend-to-dae = 404) — the reference's alias table is hand-
  maintained and has gaps. The 11:
      blend-dae, blend-glb, blend-gltf, blend-usdz,
      off-glb, off-stl,
      x-fbx, x-glb, x-gltf, x-obj, x-stl
  (blend-fbx/obj/stl DO alias — the table is genuinely quirky.)
- The one cross-surface alias: `/tools/image-to-3d` → 301 →
  `/features/image-to-3d` (target serves 200 both sides).
- Negative probes (all 404 on the reference): /tools/step-to-stl,
  /tools/stl-to-step, /tools/img-to-3d, /tools/text-to-3d, /tools/worldgen,
  /tools/mcp, /tools/api, /tools/video-to-3d, /tools/chatavatar,
  /tools/omnicraft, /tools/texture, /tools/pbr, /tools/stl-viewer,
  /tools/3d-model-viewer — the alias family is EXACTLY the 167 + the one
  cross-surface row.
- Locale-prefixed aliases do NOT exist (probed: /zh/tools/stl-to-obj,
  /de/tools/glb-to-obj, /zh/tools/image-to-3d all 404) — EN-only route
  class, like the rest of the /tools tree.

Honest mirror: this clone serves the same 167 aliases as next.config
redirect rows (statusCode 301), 404s the same 11 gaps (no rows for them),
and adds the /tools/image-to-3d → /features/image-to-3d row.

## The reference /blog index anatomy (EN + 11 locales)

EN /blog (304KB HTML, 2666 visible words):

```
h1: BLOG
[featured]   4 cards, each an <h2> title (the 4 newest news posts:
             Cambridge hackathon, NVIDIA case study, Gen 1.5 launch,
             Shutterstock license) — each card carries a
             storage.deemos.dev image
[sidebar]    h3: Categories       — 12 links to /blog/category/{slug}
             h3: Subscribe To Updates — copy "Join our newsletter to stay
             informed on product updates, workflows, and practical 3D
             creation notes." + a real email <form>/<input>
[sections]   12 × <h2> category name (News, Comparisons, XR, AI
             Texturing, Game Development, Prompt Guide, Text To 3D,
             Image To 3D, Insights, 3D Printing, Workflow, Animation —
             exactly the registry's order) → 3 × <h3> cards each, every
             card an article link with image
[all]        h2: All Articles — 12 article links, NO pagination nav
             (the reference's 20 /blog/page/{n} routes are sitemap-only,
             not linked from the index)
```

Locale indexes (probed zh/ja/de/ru): the same anatomy, with:

- **featured = 3 cards, not 4** — the same trio everywhere (NVIDIA case
  study, Gen 1.5 launch, Shutterstock license); the Cambridge hackathon
  post has no locale versions yet, so EN alone shows 4.
- localized category names (新闻 / 对比评测 / XR / AI 纹理 / 游戏开发 /
  提示词指南 / 文本生成 3D / 图片生成 3D / 洞察 / 3D 打印 / 工作流 / 动画)
  — already in this clone's LOCALE_CATEGORY_NAMES (t79).
- localized "全部文章" / Categories / 订阅更新 headings.
- cards link the locale-suffixed routes (/zh/blog/{slug}-zh), titles
  localized on the reference. This clone keeps the t79 convention: locale
  cards carry the EN title (the content-bearing original) with the
  locale-suffix link, because the locale titles are the reference's own
  marketing copy this clone does not reproduce.

## This clone's mirror decisions

- EN featured: the 4 newest WRITTEN articles (h2 card titles).
- Locale featured: the locale's 3 newest census entries (h3-card shape,
  matching the reference's 3).
- Per-category sections: first 3 of blogEntriesByCategory (written
  articles first — date desc — then the computed census rows with their
  honest family labels). All 12 sections always render, in the
  registry's reference order.
- All Articles: first 12 catalog rows (written newest first) — the
  reference's cap — with the clone's existing full-catalog pagination
  section kept below as its own honesty layer (documented delta: the
  reference leaves its pagination pages sitemap-only; this clone's
  catalog IS the honesty mechanism, so the nav stays).
- Subscribe To Updates: the reference's block is a real email form wired
  to a backend this clone does not have. Honest mirror: same sidebar
  section + heading + copy shape, but the body says there is no
  newsletter backend here and links the real RSS feed (/blog/rss.xml)
  instead of a fake form (the t81 vote-card precedent: no dead buttons).
- Card images: the t77 og:image registry per route (referenceOgImage) —
  the same storage.deemos.dev URLs the reference's own cards use, with
  the og-banner fallback.
- H1 keeps this clone's editorial line ("The Blog, With the Receipts
  Attached") — the heading STRUCTURE matches the reference outline; the
  hero copy stays the clone's own voice (the honest-parallel pattern of
  t73/t81).

## Verification result (2026-11-01, local standalone build)

- vitest: **1043 tests / 54 suites green** (was 1023/53) — 20 new in
  src/lib/blog-index-anatomy.test.ts, plus the i18n.test.ts hub-cap
  assertion re-pointed (the zh/blog hub became the blog-index def) and
  the astro-chrome.test.ts blog-family pin re-pointed to the new kind.
  lint clean, tsc 26 = baseline.
- standalone build + verify-served.py (recon/t84/verify-served.py):
  **108/108 checks** — the EN index anatomy (4 featured h2 cards, the
  12 h2 sections in registry order with their h3 cards, the News trio,
  12 category links, the honest subscribe with RSS and no form, the
  12-row All Articles cap preceding the full-catalog layer, ≥25
  og-registry card images), zh + de locale indexes (pipe-form titles,
  all 12 localized sections, ≥30 locale links, the localized honest
  subscribe, no form), 10 alias 301s with exact Locations + the
  cross-surface alias, 6 of the reference's gap routes 404 with their
  canonicals live 200, and the pagination/category/RSS regressions.
- visible-text density: /blog moved **871 → 1803 words** (0.33 → 0.68
  of the reference's 2666; the remainder is the reference's own long SEO
  card copy, which the honest-parallel voice does not reproduce).

## Implementation findings (2026-11-01)

1. **The effective-category bug.** The first locale-sections build
   filtered on `entry.category` — but that field is only set for census
   rows; written rows carry their category on `entry.article.category`
   (the same reason blogEntriesByCategory has the two-branch rule).
   Symptom: zh prompt-guide/workflow sections rendered 0 cards although
   both topics have written articles with -zh routes. Fix:
   localeBlogEntries resolves the EFFECTIVE category per row.
2. **The locale index title's separator.** Found incidentally while
   wiring the def: the reference's locale blog index title is the pipe
   form — 博客 | Hyper3D, Blog | Hyper3D — while the clone had been
   serving the generic hub formula's em-dash (博客 — Hyper3D). The
   blog-index title case now pins the pipe form (probed zh + de).
3. **Locale census truth.** The reference fills 3 cards in every
   section on every locale; this clone's honest census gives 2-3 per
   topic (prompt-guide 2: the two written prompt guides both have -zh
   routes; workflow 1-2 — pt/ar/tr/it hold a single workflow article
   apiece). Never padded. Pinned in the tests.
4. **The EN News section mirrors the reference's own trio.** The
   reference's featured block IS its 3-4 newest news posts; this clone's
   News section cards are its catalog's news head — the same three
   stories the reference features (Rodin launch, Shutterstock license,
   Cambridge hackathon), served as cataloged-not-reproduced cards.
5. **The subscribe block honesty.** The reference's Subscribe To Updates
   is a real email form + backend. This clone renders the same sidebar
   section + copy shape, with the body saying there is no newsletter
   backend and linking the real RSS feed — the t81 vote-card rule (no
   dead buttons). Same rule applied in all 11 locale subscribe blocks
   (hand-written translations, i18n-messages.ts blogIndex).
6. **The heading-level convention on locale pages.** The reference's
   locale index uses h1 博客 + h2 sections; this clone's locale tree
   has rendered page titles as h2 since t66 (the shared wrapper's
   convention), so the locale index renders h2 博客 + h3 sections —
   same section structure, one level shifted, consistent with every
   other localized page here. Documented, deliberate.


## Vercel deploy outcome (2026-11-01, post-push of f51e087)

Attempted on both surviving tokens: vcp_1Ihx… → resource_creation_blocked
("Your Team exceeded our fair use limits and has been blocked" — the
same t80/t81/t82/t83 state); vcp_3uMg… → forbidden / invalidToken.
Latest production deployment remains dpl_E6YXAjhq (commit 0d56c9b, the
t77-era deploy); the live domain answers 402 account-wide. Production
re-verification impossible — the local standalone build +
verify-served.py (108/108) is the verification of record for t84, as
it was for t81/t82/t83.
