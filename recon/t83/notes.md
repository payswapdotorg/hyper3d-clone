# t83 recon — the two head shapes: the Astro marketing chrome vs the workspace app chrome (2026-11-01)

The t75-t82 head series aligned every *content* dimension (title, description,
og:image, robots, fb token, article namespace, RSS, hreflang). The *chrome*
around that content — viewport, icons, fonts, resource hints — was never
censused as its own dimension, and the clone serves one hybrid shape
everywhere. The reference serves two (plus a bare tool variant).

Method: full-head `<meta|link|title>` dumps across 30+ reference pages
(home, 4 locale homes, features, help index + article, 3 blog articles,
blog index + pagination + 2 categories (en), locale blog index/pagination,
tools index + 2 pair routes, event, 2 pricing locales, use-cases, legal,
switch, content-preview, the /404 response, and the /workspace/rodin SPA
shell). Raw dumps: home.html, article.html, ws-shell.html + the probe
prints below.

## Shape A — the Astro marketing chrome (every non-blog content page)

```
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/webp" sizes="32x32" href="/favicon-32x32.webp">   ← the ONLY icon link
<link rel="preconnect" href="https://storage.deemos.dev" crossorigin>
<link rel="dns-prefetch" href="https://storage.deemos.dev">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@300;400;500;600&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.onload=null;this.media='all'">
<noscript><link href="…same URL…" rel="stylesheet"></noscript>
```

ABSENT on every Astro page: keywords, theme-color, google-notranslate,
manifest link, apple-touch-icon link. (The files favicon.ico / -16/-32 png /
apple-touch-icon.png / manifest.json all still 200 at their well-known
paths — they are simply not *linked* from the marketing head.)

Font links present on: home, all locale homes, features tree, help tree,
3d-prompts tree, pricing (+zh), tools tree, event, use-cases, legal,
sub-categories, switch, the /404 page. ABSENT on the whole blog family
(EN + locale: index, pagination, 12 category hubs, articles) — the blog
template genuinely renders in the fallback stack (no @font-face anywhere
in the reference's _astro CSS; fonts load ONLY via those stylesheet
links). Probed per-class, not assumed.

## Shape B — the workspace app chrome (/workspace/*, the SPA shell)

```
<link rel="icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no,maximum-scale=1,minimum-scale=1"/>
<meta content="#000000" name="theme-color"/>
<meta name="google" content="notranslate"/>
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta property="og:title" content="Hyper3D" data-react-helmet="true"/>   ← the ONLY og field
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:site" content="@DeemosTech"/>
<meta name="twitter:title" content="Hyper3D - Rodin & ChatAvatar"/>
<meta name="twitter:description" content="Closest to Production-ready 3D Assets Generator"/>
<meta name="twitter:image" content="https://hyper3d.ai/assets/og-banner.png"/>
<link rel="preconnect" href="https://file.hyper3d.com">
<link rel="dns-prefetch" href="https://file.hyper3d.com">
```

NO server <title>, no description, no robots, no canonical, no hreflang,
no storage.deemos.dev hints on the shell (file.hyper3d.com instead). The
clone's root layout was built from the t53 *workspace* recon — i.e. the
whole marketing tree currently serves the workspace's locked viewport,
theme-color, notranslate, 3-icon set, manifest link and keywords.

## Shape C — the bare tool page (/content-preview)

viewport `width=device-width, initial-scale=1` (framework default, no
`1.0`), NO icon link, NO font links, robots noindex/nofollow.

## The other probed dimensions

- `<html>` tags: reference locale pages serve `<html lang="zh"|"de"|"pt-BR"|"ar" data-page-theme="dark" data-astro-cid-…>`; the clone serves `lang="en"` everywhere (one root layout). Fixing lang requires the multi-root-layout restructure — recorded as the t84 candidate, not forced into this task.
- The reference's own CSS font vars (acquisition-touch.css): --font-display/--font-body/--font-primary = "Poppins" + the Helvetica/Arial/… stack; --font-sans = ui-sans-serif stack; --font-mono = ui-monospace stack.
- /manifest.json (568 B) and /apple-touch-icon.png (11,989 B) live on at well-known paths for the workspace's links.
- favicon-32x32.webp is 620 bytes (self-hosted copy into public/, the t53 pattern).

## The clone's wiring plan

- Root layout becomes the Astro default: plain viewport export, the single
  webp icon, no keywords/theme-color/notranslate/manifest/apple, and NO
  next/font (Google-Fonts links replace it — the same hot-link stance as
  the og:image registry; blog pages then honestly render in the fallback
  stack exactly like the reference's own blog template).
- New server components: AstroHints (storage preconnect crossorigin +
  dns-prefetch) and GoogleFontLinks (2 font preconnects + stylesheet +
  noscript fallback) in src/components/hyper3d/astro-chrome.tsx.
- Per-surface wiring: family layouts (features, help, 3d-prompts, pricing,
  tools, event, use-cases, legal, styles, sub-categories, switch) render
  both; blog/layout.tsx renders AstroHints only; the home page, the global
  not-found, and the [locale] catch-all render them in-page (the locale
  tree skips font links for its blog-family defs); workspace/layout.tsx
  carries the shell's file.hyper3d.com hints + locked viewport + full icon
  set + manifest + notranslate + the og:title-only card.
- The /404 head gap found in passing: the reference's 404 serves canonical
  /404 + a 13-link hreflang set + the full marketing chrome — wired into
  not-found.tsx metadata.
- content-preview: keep the bare shape (no hints — automatic once the root
  layout stops rendering links; the inherited icon link documented).

## Framework artifacts to document (not fixable through sanctioned APIs)

- `initial-scale=1.0` vs Next's `initial-scale=1` (2 chars; Astro itself
  serves `1` on content-preview — the decimal is hand-set in their layout).
- The print/onload deferred-load trick: RSC cannot emit inline `onload=`
  string handlers on hoisted stylesheet links — served as a plain
  stylesheet + the noscript fallback (same URL, same order).
- `&` in the font href serializes as `&amp;` (HTML-equivalent).

## Verification plan

New astro-chrome + head-shape tests; full vitest suite; standalone build +
served-HTML verification (verify-served.py extended to the chrome: viewport
bytes, icon sets, hint hosts, font-link presence/absence per family, the
workspace shell shape, the 404 head); lint; tsc baseline 26.

## Verification result (2026-11-01, local standalone build)

- vitest: **1023 tests / 53 suites green** (was 975/52) — 48 new in
  src/lib/astro-chrome.test.ts. lint clean, tsc 26 = baseline.
- standalone build + verify-served.py: **473/473 checks** —
  16 marketing surfaces (plain viewport, single webp icon, storage
  pair, full font quartet incl. the body-level noscript fallback, no
  workspace-only metas), 8 blog surfaces (storage hints, ZERO
  font references document-wide — head, preloads, Flight payload),
  5 workspace surfaces (locked viewport, theme-color #000000,
  notranslate, ico/32/16 + apple + manifest icon set,
  file.hyper3d.com hints, og:title-only, no canonical/hreflang/fonts),
  the 404 (canonical /404, 13 hrefLang links x-default last, og+twitter
  cards on og-banner.webp, robots, no chrome links), the bare
  content-preview head, the icon files (webp 620 B, apple 11,989 B,
  manifest 568 B), the home twitter:image:alt.

## Two build findings (2026-11-01)

1. **The canonical the shell must not serve.** The workspace shell
   serves NO canonical — but the clone's /workspace pages inherited the
   root layout's homepage canonical through the metadata merge.
   `alternates: { canonical: null }` in workspace/layout.tsx removes it
   (Next 16.1.3: the per-segment merge REPLACES the alternates object,
   and the resolver emits nothing for a falsy canonical — the same
   nulling that already worked for title/description). Confirmed on
   the rebuilt standalone server: no canonical on
   /workspace/rodin, /workspace/login, /workspace/imageto3d.
2. **The stale-server trap.** next-server retitles its process (it is
   NOT matched by `pkill -f server.js`), so a fresh `node
   .next/standalone/server.js` fails EADDRINUSE silently while curl
   keeps hitting the OLD build — a fixed bug then reads as unfixed.
   Kill by pid from `ss -tlnp` and re-curl before trusting the result.
   (The prerendered rodin.html in the new build was canonical-free all
   along; only the serving process was stale.)

Served-serialization pins recorded for future verifications: React
serializes alternate links with the camelCase **hrefLang** attribute;
crossorigin serializes as crossorigin="anonymous"; the font stylesheet
hoists into <head> with data-precedence while the <noscript> fallback
stays at the component's body position.

## Vercel deploy outcome (2026-11-01, post-push of f1002c8)

Attempted on both surviving tokens: vcp_1Ihx… → resource_creation_blocked
("Your Team exceeded our fair use limits and has been blocked", the same
t80/t81/t82 state); vcp_3uMg… → forbidden / invalidToken. Latest
production deployment remains dpl_E6YXAjhq (commit 0d56c9b, the t77-era
deploy); the live domain answers 402 account-wide. Production
re-verification impossible — the local standalone build + verify-served.py
(473/473) is the verification of record for t83, as it was for t81/t82.
