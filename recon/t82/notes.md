# t82 recon — the workspace shell's uncensured route classes (2026-11-01)

The t81 notes left two known gaps: the /workspace app-surface routes and
the og:image mirroring decision (standing t77 exclusion). This recon
closes the app-surface gap: the reference's shared SPA shell carries
boot-logic route classes this clone 404s or mis-redirects.

Method: HTTP boundary probe (`boundary-probe.py`, 53 candidate paths,
all under /workspace — every single one serves the byte-identical 200
shell, 11,256 bytes, `splash-brand` signature), root-level curl probes
for the short-form aliases, and 18 agent-browser walks for the
client-router behavior (post-boot URL + title + view). Raw data:
`boundary-probe.json`, `rodin-shell.html`, `shell-imageto3d.html`
(byte-identical to the rodin shell — route handling is 100%
client-side), screenshots `oauth-device.png`, `mcp-consent.png`,
`imageto3d-bare.png`.

## The shell's own boot scripts (the route classes the reference itself calls out)

The served shell (any /workspace path) runs three path-sensitive
scripts before the app boots:

1. **OAuth private-mode**: `/workspace/oauth/device` and
   `/workspace/mcp/oauth/consent` set `window.__HYPER3D_PRIVATE_OAUTH__`
   and append `<meta name="referrer" content="no-referrer">`.
2. **imageto3d detail**: `(?:^|/)(?:workspace/)?imageto3d/([0-9a-f-]{36})(?:/)?$`
   (case-insensitive) → stamps `data-initial-imageto3d-detail` on <html>
   and preloads `https://file.hyper3d.com/{uuid}/preview/render_basic.jpg`
   (fetchpriority=high) as the LCP image.
3. **Signup + referral short links**: `/signup` or `/workspace/signup`
   (exact, trailing slashes normalized) → replace to
   `/workspace/register` + search + hash; first segment `r` or `a`
   (workspace-prefixed or root) with a second segment → replace to
   `/workspace/register` with `referral_code` set (existing query
   merged, `set` semantics) + hash.
   Plus the shared visit-marker script (cookie/localStorage/sessionStorage)
   that t72 already mirrors as WORKSPACE_MARKER_SCRIPT.

## The probed behavior matrix

Root level (server, no JS):

| path | reference | clone before t82 |
|---|---|---|
| `/register` | **301** → /workspace/register | 302 → same |
| `/login` | **301** → /workspace/login | 404 |
| `/signup` | **404** (the shell script never serves here) | 302 → /workspace/rodin?auth=signup |
| `/logout` | 404 | 404 ✓ |
| `/imageto3d` | **301** → /features/image-to-3d | 404 |
| `/imageto3d/{36-hex-dash, case-i}` | **301** → /workspace/imageto3d/{uuid} (case preserved, trailing slash preserved) | 404 |
| `/imageto3d/{invalid}` , `/imageto3d/{uuid}/extra` | 404 | 404 ✓ |
| `/r/{code}` (≥1 segment, any depth) | **301** → /workspace/r/{code} (`/r/testcode/extra` keeps the extra segment) | 302 → /workspace/register?referral_code={code} |
| `/r`, `/a` bare | 404 | 404 ✓ (after re-point: `:path+` keeps bare unmatched) |
| `/a/{code...}` | **301** → /workspace/a/{code...} | 302 → register |

Workspace level (every path HTTP 200 + shell; client-router post-boot,
agent-walked):

| path | post-boot behavior | clone before t82 |
|---|---|---|
| `/workspace` | replace → **/workspace/rodin** | 302 → /workspace/rodin |
| `/workspace/signup` | replace → **/workspace/register** (+q+#) | 302 → /workspace/rodin?auth=signup |
| `/workspace/r`, `/workspace/a` (bare) | replace → **/workspace/register** | 404 |
| `/workspace/r|a/{code}[...]` | replace → **/workspace/register?referral_code={code}** (query merged, code=2nd segment, deeper ignored) | 404 |
| `/workspace/{unknown}` (foobar, settings, logout, xyz/abc, history…) | **default studio view**, URL stays, studio title | 404 |
| `/workspace/imageto3d` | **ChatAvatar view**, URL stays, title `ChatAvatar - AI 3D Facial Assets Generator \| Hyper3D` | 404 |
| `/workspace/imageto3d/{uuid}` (known model) | replace → /workspace/rodin/{uuid}, detail view, **exactly-200-char title** `AI {prompt} 3D Models \| Realistic {prompt} 3D Graphics & Assets Created by {author} \| Download 3D {prompt} in FB...` | 404 |
| `/workspace/imageto3d/{uuid}` (unknown model) | **default studio view**, URL stays, studio title | 404 |
| `/workspace/imageto3d/{invalid}` | replace → **/404** | 404 |
| `/workspace/imageto3d/{uuid}/extra` | default studio view, URL stays | 404 |
| `/workspace/oauth/device` | guest error view, **no title**: brand `Hyper3D · Device authorization`; card: alert icon, eyebrow `Device authorization`, H1 `Unable to continue`, description `This authorization link is incomplete or invalid. Return to your terminal and start a new login request.`; footer `Only authorize devices and clients you trust.` | 404 |
| `/workspace/mcp/oauth/consent` | guest error view, **no title**: brand `HYPER3D · RODIN`; eyebrow `Client authorization`, H1 `Authorization request is invalid`, description `Return to your client or terminal and start the connection again.`; footer `Only authorize clients you trust.` | 404 |
| `/workspace/rodin` | studio (unchanged, t72) ✓ | ✓ |
| `/workspace/rodin/tab/story\|research` | views (t72) ✓ | ✓ |
| `/workspace/rodin/tab` (bare) | replace → /workspace/rodin | studio view, URL stays |
| `/workspace/rodin/tab/{other}` and deeper (`/tab/a/b`) | replace → **/workspace/rodin** | studio view, URL stays |
| `/workspace/rodin/{uuid}` (known) | detail view, 200-char title | studio view (title = studio) |
| `/workspace/rodin/{uuid}` (unknown) | **default studio view, URL stays** | studio view ✓ (already the honest unknown-uuid behavior) |
| `/workspace/rodin/{single non-uuid}` (`xyz`, 36×`z`) | replace → **/404** (re-verified twice) | studio view |
| `/workspace/rodin/{x}/{y}` (first ≠ tab) | replace → **/workspace/rodin** | studio view |
| `/404` | HTTP 404, marketing 404 page, title `404 Page Not Found \| Hyper3D` | not-found route, already aligned (t78) ✓ |

Probed model sample: task uuid `0bb1d4a9-e701-4871-ace0-9491e775238e`
("A red fresh apple. simple geometry." by yaslen Catty, from the t69-era
task-card capture) — the only uuid with a live model; the
00000000-…-00000000 zeros uuid renders the studio fallback.

## OAuth view design (DOM-extracted, both views share the mcpOAuthConsent_* CSS)

Page bg `#121317`, min-height 100dvh, centered column; brand header
(logo 32px + name 13px/600 #f5f5f5 + product tag 13px/500 #a0a0a5,
margin-bottom 18px); card 560px, bg `#202024`, border 1px `#36363a`,
radius 32px, padding 32px; icon 40px circle bg `rgba(238,145,136,.08)`
color `#ee9188` (lucide circle-alert), margin-bottom 16px; eyebrow
11px/600 `#a0a0a8`; H1 24px/600 `#f5f5f5`; description 13px/400
`#a6a6ad`; footer note below the card, muted 13px. Device view:
section aria-busy=false, alert role on the description. Consent view:
section aria-live=assertive.

## The clone's honest mirror (this task's contract)

- Root aliases become the reference's own **301s**: `/register`,
  `/login`, `/imageto3d` → `/features/image-to-3d`, and `/r|a/:path+`
  → `/workspace/r|a/:path+` (the reference's own two-hop referral
  shape). `/signup` loses its redirect — the reference 404s it.
- `/workspace/signup`, `/workspace/r|a/*` become **200 + pre-paint
  replace scripts** (the reference's shell mechanism, verbatim-in-
  behavior: query merge with `set` semantics, hash preserved).
- `/workspace` becomes 200 + replace → `/workspace/rodin` (the t68
  302 finally matches the reference's own 200-then-replace shape).
- `/workspace/{unknown}` serves the **studio view at the unknown URL**
  via a `[[...rest]]` catch-all — the reference's own fallback
  (studio view + studio title, URL stays).
- `/workspace/imageto3d` serves the ChatAvatar view under its own
  short probed title; `/workspace/imageto3d/{uuid}` serves the studio
  view (the reference's unknown-uuid behavior — the honest state for a
  clone with no model database) **plus the reference's own LCP preload
  script verbatim**; invalid shapes replace → `/404`.
- `/workspace/rodin/{uuid}` keeps the studio view (honest unknown-uuid
  behavior — no model DB); single non-uuid segments and non-canonical
  tab shapes become pre-paint replaces (→ `/404`, → `/workspace/rodin`)
  instead of silently rendering the studio.
- The two OAuth surfaces render as **server-rendered guest error
  views** with the probed copy, no `<title>` (the reference serves
  none), `<meta name="referrer" content="no-referrer">`, and the
  `__HYPER3D_PRIVATE_OAUTH__` flag script.
- Every new /workspace page stamps WORKSPACE_MARKER_SCRIPT (the
  reference's shared shell stamps it on every /workspace route).

## Honest exclusions (documented)

- **The model detail view itself** (`/workspace/rodin/{uuid}` with the
  200-char `AI {prompt} 3D Models | …` title, download panel, author
  card): it needs the reference's model database. The clone serves the
  reference's own unknown-uuid behavior (studio view) for every uuid —
  the same honest stance as t74's auth-gated dashboard. The 200-char
  title formula is recorded here for the day a model surface exists.
- **`/r` vs `/r/`**: the reference 404s bare `/r` but 301s `/r/` →
  `/workspace/r/`. Next.js's trailing-slash normalization makes `/r/`
  ≡ `/r` (308 → `/r` → 404), and the reference's own split is a
  server quirk; not reproduced (documented divergence).
- **Auth-gated app views** (settings/history/profile/logout render the
  studio fallback for guests on the reference — probed on settings and
  logout): the catch-all's studio view is the mirror; the signed-in
  views need the backend.
- **The splash chrome** (#index-loading shimmer, noscript notice): the
  clone's server-rendered pages are post-boot equivalents; t72 set
  this precedent.
- og:image asset mirroring stays the standing t77 exclusion.

## Verification plan

New unit/wiring tests in `src/lib/workspace-shell-routes.test.ts` +
updated pins in `workspace-routes.test.ts` / `workspace-tabs.test.ts` /
`marketing-home.test.ts`; `bun run test` (vitest) full suite; lint;
standalone build; served-HTML verification (`verify-served.py`) of
every new route class: the replaces, the 301s, the two OAuth views'
copy and title-less heads, the imageto3d titles, and the catch-all
studio fallback.

## Build finding: the optional catch-all mis-shadowing (output:standalone)

The first implementation used ONE optional catch-all
(`/workspace/[[...rest]]/page.tsx`) for the bare root and the children.
`next start` served every route correctly, but the **standalone**
server mis-resolved exactly two static routes — `/workspace/oauth/device`
and `/workspace/imageto3d` — into the `[locale]` tree (the runtime wrote
`$d$locale` segment-cache variants for them and served the 404 not-found,
ISR-cached with s-maxage=31536000). Removing the catch-all made both
serve 200 again (verified with a no-catch-all rebuild), pinning the
cause: **Next 16.1.3 standalone mis-shadows certain nested static
routes when an optional catch-all sits at their parent**. The fix: the
bare `/workspace` is its own `page.tsx` (the root replace) and the
children use a MANDATORY catch-all `/workspace/[...rest]/page.tsx` —
the sibling pattern this app already builds cleanly (omnicraft +
`[tool]`). After the split, the standalone server serves every route
correctly (84/84 served checks, below). No `[[...rest]]` route remains
under /workspace.

## Verification result (2026-11-01, local standalone build)

- `bun run test` (vitest): **975 tests / 52 suites green** (was
  945/51). Lint clean. `tsc --noEmit` = 26 errors, the pre-existing
  baseline, none in touched files.
- `verify-served.py` against `node .next/standalone/server.js`:
  **84/84 checks passed** — the ten route classes above (root aliases'
  301s/404s, the /workspace replace, signup, r|a referral replaces
  including the deeper-segments-ignored rule, the unknown-path studio
  fallback, the imageto3d bare/uuid/invalid classes, the rodin
  uuid/non-uuid/tab-normalize classes, both OAuth guest views' full
  copy + no-title + no-referrer + private flag, and the pre-existing
  workspace routes still serving their views).

## Deploy outcome (2026-11-01, post-push)

Attempted with the surviving token after pushing — see the deploy
section appended below after the attempt.
