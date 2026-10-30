# Locale deep trees — served-but-not-sitemapped surface (recon 2026-10-31)

Live probes against hyper3d.ai (curl, desktop UA) after t69 revealed three
locale-prefixed surfaces the reference SERVES but never lists in its
sitemaps. The t66 recon derived the localized route sets from the landing
sitemaps only, so the clone 404s all of these today.

## 1. The localized 3D prompt library — 444 routes × 11 locales

The reference serves the ENTIRE t69 tree under every locale prefix:

- `/{loc}/3d-prompts` — the real localized index (ja title 無料の3Dプロンプトと制作事例,
  358 KB vs EN 361 KB — the full card grid, machine-translated per locale).
  The bare index IS sitemapped (static-{loc} carries `/{loc}/3d-prompts`),
  and the clone currently serves the t66 generic wrapper there.
- `/{loc}/3d-prompts/{2..17}` — the 16 pagination pages, verified 200
  (ar/2, de/2, ja/2, ja/17, zh/3); `/1` and `/18` verified 404 (it/1, tr/18).
- `/{loc}/3d-prompts/{slug}` — all 403 details verified serving for random
  community slugs across locales (ja/godot-racing…, de/kaiju-city…,
  es/claude-opus-5-5…, ko/azadi-tower…, ru/campfire-scene…), plus
  ja/kana-pixel-rabbit-archer. Nonsense slugs 404. Card titles are the
  reference's own machine translations of community post titles (e.g.
  炭酸飲料ボトルのロケット打ち上げ) — the clone shows the EN registry display
  names instead (t66 tier-2 honesty; no machine-translated prose).
- `/{loc}/3d-prompts/models/{model}` — all 11 hubs × 11 locales (ja+zh
  gpt-6-astra, zh claude-fable-5.1 verified).
- `/{loc}/3d-prompts/models/{model}/{2..N}` — hub pagination follows the EN
  math exactly: pt/gpt-6-astra/11 → 200, fr/gpt-6-astra/12 → 404,
  zh/gpt-6-astra/2 → 200, ja/claude-fable-5.1/5 → 404 (4 pages only).
- `/{loc}/3d-prompts/models` (bare) → 404, `/{loc}/3d-prompts/models/{unknown}` → 404.

The EN tree is entirely out of the reference's sitemaps (t69 pinned that);
the localized tree is equally absent — static-{loc} carries only the bare
`/{loc}/3d-prompts`.

## 2. The sub-category matrix — 6 slugs × 11 locales = 66 routes

The t66 sitemap recon saw sub-categories only in the ja/ko/pt/es/tr
sitemaps with small per-locale sets (ja:nsfw-content, ko:insects-bugs +
nsfw-content, pt:nsfw-content, es:firearms + nsfw-content, tr:rocks-minerals).
The LIVE site serves the full matrix — all six slugs (the EN three
dark-fantasy / nsfw-content / roblox PLUS the locale-only insects-bugs /
firearms / rocks-minerals) under ALL 11 locales: probed 66/66 → 200,
nonsense slug → 404 in all 11. Sitemaps still list only the original
subset (zero sitemap change mirrors that).

## 3. The bare tools index — 12 routes (EN + 11 locales)

`/{loc}/tools` serves 200 in all 11 locales (ja/ar/it/zh/ru/fr verified;
the reference renders a real localized index — ja hero ツールマトリクス).
The tools-{loc} sitemap lists exactly 203 deep family URLs and NOT the
bare index (verified against landing-sitemap-tools-ja.xml). The deep
family routes were already cloned by t66 (EN slugs verbatim); only the
bare index is missing.

**The EN bare `/tools` serves 200 too** — title "Free AI 3D Tools for
Image to 3D, Viewing and Conversion | Hyper3D", H1 "Tools Matrix", bands
"Explore Hyper3D AI 3D tools" / "Start building with Hyper3D tools", and
exactly 10 /tools links (the 8 image-to pages + viewer + converter).
The t64 recon treated the sitemap as the whole surface and pinned bare
/tools as 404 — the live site disagrees. Its canonical is self
(https://hyper3d.ai/tools) and it carries the full 13-link hreflang set
(en + 11 locales + x-default), even though no locale sitemap lists
/{loc}/tools.

## Canonical / hreflang behavior on the reference (observed)

- `/tools` (EN): self-canonical + 13 hreflang links.
- `/3d-prompts` (EN index): self-canonical + 13 hreflang links.
- `/3d-prompts/{slug}` and `/3d-prompts/models/{m}` (EN): self-canonical,
  NO hreflang — despite serving locale variants.
- `/ja/3d-prompts/2`: canonical → `/ja/3d-prompts` (the locale index),
  no hreflang. `/ja/3d-prompts/models/gpt-6-astra`: self-canonical in
  locale, no hreflang.

The clone keeps its own t66 contract instead of mirroring this
inconsistency: localized router pages canonicalize to their EN original
and carry the 13-link hreflang set; the EN `/tools` index gets the
reference's own shape (self-canonical + hreflang, now accurate since all
12 tools indexes exist).

## Route math

- 3d-prompts deep: (16 pagination + 403 details + 11 hubs + 13 hub pages) × 11 = 4,873
- sub-categories: 6 × 11 = 66 served (59 NEW — the sitemap set already
  served 7: ja/nsfw-content, ko/insects-bugs+nsfw-content, pt/nsfw-content,
  es/firearms+nsfw-content, tr/rocks-minerals)
- tools bare index: 11 locales + 1 EN = 12
- **Total new serving routes: 4,944** (4,873 + 59 + 11 locale + 1 EN;
  plus the 11 existing generic `/{loc}/3d-prompts` wrappers upgraded to
  the real index render — not new routes).
- Serving static params after t70: 5,975 + 4,943 = 10,918.
- SSG total after t70: 7,543 + 4,944 = 12,487 pages.
- Sitemap delta: ZERO (all three surfaces stay out, mirroring the
  reference's own choice; the sitemap-listed locale sub-category subset
  is untouched).

## Honesty contract (t66 tier-2, extended)

Localized chrome (hero titles, band headers, status chips, pagination
labels, community banner, notices) is hand-written per locale in
i18n-messages.ts. Long-form content stays English: the localized index
grid shows the EN registry display names (route data, not prose), written
details carry the tier-2 notice linking the EN original, community
details carry the localized COMMUNITY PROMPT — NOT REPRODUCED banner.
Canonicals point at the EN originals; locale-only sub-category slugs keep
their in-locale canonical (existing pattern).
