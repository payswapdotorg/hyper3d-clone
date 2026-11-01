/**
 * t82 — the workspace shell's uncensured route classes: the reference's
 * shared SPA shell (probed live 2026-11-01, recon/t82/notes.md) runs
 * path-sensitive boot scripts and a client router that together define
 * these behaviors this module mirrors:
 *
 *   /workspace/signup            200 shell → replace → /workspace/register (+q+#)
 *   /workspace/r|a/{code}[...]   200 shell → replace → /workspace/register?referral_code={code}
 *   /workspace                   200 shell → replace → /workspace/rodin
 *   /workspace/{unknown}         200 shell → default studio view, URL stays
 *   /workspace/imageto3d         200 shell → ChatAvatar view, short probed title
 *   /workspace/imageto3d/{uuid}  200 shell → studio view (unknown-uuid fallback)
 *                                 + the shell's own LCP preload script
 *   /workspace/imageto3d/{bad}   200 shell → replace → /404
 *   /workspace/rodin/{uuid}      studio view, URL stays (unknown-uuid fallback)
 *   /workspace/rodin/{bad}       200 shell → replace → /404
 *   /workspace/rodin/tab/{other} 200 shell → replace → /workspace/rodin
 *
 * Every /workspace path serves HTTP 200 on the reference (the boundary
 * probe hit 53 candidate paths — all the byte-identical shell), so none
 * of these notFound(); the "404" shapes are pre-paint replaces to the
 * reference's own /404 route, exactly its mechanism.
 *
 * The uuid shape is the reference shell's own regex, verbatim:
 * `[0-9a-f-]{36}` case-insensitive — including its quirks (36 dashes
 * is a "uuid"). Root /imageto3d/{uuid} enforces the same shape
 * server-side (probed: invalid → 404, valid → 301 → the workspace path).
 */

/** The reference shell's own uuid test (recon/t82/notes.md, script #2). */
export const UUID_SHAPE_RE = /^[0-9a-f-]{36}$/i;

export function isUuidShape(segment: string): boolean {
  return UUID_SHAPE_RE.test(segment);
}

/* ------------------------------------------------------------------ *
 * The /workspace catch-all classifier ([[...rest]] segments)         *
 * ------------------------------------------------------------------ */

export type WorkspaceCatchallView =
  | { kind: "root" }
  | { kind: "referral"; code?: string }
  | { kind: "signup" }
  | { kind: "studio" };

/**
 * Classify /workspace/{...rest} segments. The reference's shell script
 * replaces `/workspace/signup` (exact, single segment — deeper paths
 * fall through to the router's studio fallback) and first-segment
 * `r`|`a` (code = second segment when present, deeper segments ignored
 * — the script reads pathSegments[1..2] only). Bare `/workspace/r` has
 * no code so the script stays quiet, but the client router still
 * replaces it to /workspace/register (probed) — same destination, so
 * the classifier folds both into "referral". Everything else renders
 * the default studio view at the unknown URL (probed: /workspace/foobar,
 * /workspace/settings, /workspace/xyz/abc all land on the studio view
 * with the studio title, URL unchanged).
 */
export function classifyWorkspaceCatchall(
  segments: string[] | undefined,
): WorkspaceCatchallView {
  if (!segments || segments.length === 0) return { kind: "root" };
  const [first, second] = segments;
  if (first === "signup" && segments.length === 1) return { kind: "signup" };
  if (first === "r" || first === "a") {
    return { kind: "referral", code: second };
  }
  return { kind: "studio" };
}

/* ------------------------------------------------------------------ *
 * The /workspace/rodin child classifier ([[...tab]] segments)        *
 * ------------------------------------------------------------------ */

export type RodinChildView =
  | { kind: "studio" }
  | { kind: "tab"; tab: "story" | "research" }
  | { kind: "model"; uuid: string }
  | { kind: "normalize-root" }
  | { kind: "not-found" };

/**
 * Classify /workspace/rodin/{...tab} segments (probed 2026-11-01):
 *
 *   []                          studio (the t72 default view)
 *   [tab, story] | [tab, research]  those views (t72)
 *   [{uuid}]                    studio view, URL stays — the reference's
 *                               own unknown-model fallback (the clone has
 *                               no model database, so this is every uuid)
 *   [tab] or any other ≥2-segment shape  replace → /workspace/rodin
 *   [{single non-uuid}]         replace → /404 (re-verified twice)
 */
export function classifyRodinChild(
  segments: string[] | undefined,
): RodinChildView {
  if (!segments || segments.length === 0) return { kind: "studio" };
  if (segments.length === 1) {
    const [only] = segments;
    if (isUuidShape(only)) return { kind: "model", uuid: only };
    return { kind: "not-found" };
  }
  if (segments.length === 2 && segments[0] === "tab") {
    if (segments[1] === "story") return { kind: "tab", tab: "story" };
    if (segments[1] === "research") return { kind: "tab", tab: "research" };
  }
  return { kind: "normalize-root" };
}

/* ------------------------------------------------------------------ *
 * The pre-paint replace scripts (the reference's shell mechanism)    *
 * ------------------------------------------------------------------ */

/**
 * The reference shell's signup replace, verbatim-in-behavior: exact
 * /workspace/signup (trailing slashes already normalized by Next)
 * replaces to /workspace/register preserving search and hash.
 */
export const SIGNUP_REPLACE_SCRIPT =
  'window.location.replace("/workspace/register"+(window.location.search||"")+(window.location.hash||""));';

/**
 * The reference shell's referral replace for a known code, built from
 * the shell script's own semantics: existing query params are merged
 * with `set("referral_code", code)` (the code wins), hash preserved.
 * Bare /workspace/r (no code) is the router's own replace to the plain
 * register URL — same builder with the set() skipped.
 */
export function referralReplaceScript(code: string | undefined): string {
  if (!code) {
    return 'window.location.replace("/workspace/register"+(window.location.search||"")+(window.location.hash||""));';
  }
  return (
    `!function(){var p=new URLSearchParams(window.location.search);` +
    `p.set("referral_code",${JSON.stringify(code)});var q=p.toString();` +
    `window.location.replace("/workspace/register"+(q?"?"+q:"")+(window.location.hash||""))}();`
  );
}

/** The client router's /workspace → studio replace (probed). */
export const WORKSPACE_ROOT_REPLACE_SCRIPT =
  'window.location.replace("/workspace/rodin"+(window.location.search||"")+(window.location.hash||""));';

/** The client router's unknown-shape replace to the reference's /404. */
export const NOT_FOUND_REPLACE_SCRIPT = 'window.location.replace("/404");';

/** The client router's non-canonical tab normalize (probed /tab/a/b). */
export const RODIN_NORMALIZE_SCRIPT = 'window.location.replace("/workspace/rodin");';

/**
 * The reference shell's imageto3d LCP script, VERBATIM (recon/t82
 * rodin-shell.html, script #2): re-derives the uuid from the pathname,
 * stamps `data-initial-imageto3d-detail`, and preloads the model's
 * basic render from the reference's own CDN as the LCP image. On the
 * clone the preload 404s for any uuid (no model database — the honest
 * state); the reference's own unknown-uuid pages have the same
 * failing preload, so this is behavior-identical.
 */
export const IMAGETO3D_LCP_SCRIPT =
  '!function(e,t){var a=e.location.pathname.match(/(?:^|\\/)(?:workspace\\/)?imageto3d\\/([0-9a-f-]{36})(?:\\/)?$/i);if(a){var i="https://file.hyper3d.com/"+a[1]+"/preview/render_basic.jpg";t.documentElement.setAttribute("data-initial-imageto3d-detail","true");var r=t.createElement("link");r.rel="preload",r.as="image",r.href=i,r.setAttribute("fetchpriority","high"),(t.head||t.documentElement).appendChild(r),e.__HYPER3D_INITIAL_LCP_IMAGE__=i}}(window,document);';

/**
 * The reference shell's OAuth private-mode flag (script #1's other
 * half — the no-referrer meta is emitted server-side via metadata
 * instead, this script sets the window flag the app reads).
 */
export const OAUTH_PRIVATE_FLAG_SCRIPT = 'window.__HYPER3D_PRIVATE_OAUTH__=true;';

/* ------------------------------------------------------------------ *
 * The probed copy (both OAuth guest views, DOM-extracted)           *
 * ------------------------------------------------------------------ */

export interface OAuthGuestViewCopy {
  /** The brand name span (13px/600) beside the logo. */
  brandName: string;
  /** The brand product tag (13px/500, muted). */
  brandProduct: string;
  /** The eyebrow above the H1 (11px/600, muted). */
  eyebrow: string;
  /** The H1 (24px/600). */
  heading: string;
  /** The description paragraph (13px/400, muted). */
  description: string;
  /** The trust note below the card (13px, muted). */
  trustNote: string;
}

export const OAUTH_DEVICE_COPY: OAuthGuestViewCopy = {
  brandName: "Hyper3D",
  brandProduct: "Device authorization",
  eyebrow: "Device authorization",
  heading: "Unable to continue",
  description:
    "This authorization link is incomplete or invalid. Return to your terminal and start a new login request.",
  trustNote: "Only authorize devices and clients you trust.",
};

export const MCP_OAUTH_CONSENT_COPY: OAuthGuestViewCopy = {
  brandName: "HYPER3D",
  brandProduct: "RODIN",
  eyebrow: "Client authorization",
  heading: "Authorization request is invalid",
  description: "Return to your client or terminal and start the connection again.",
  trustNote: "Only authorize clients you trust.",
};

/**
 * /workspace/imageto3d serves the ChatAvatar view under its own short
 * client-set title (probed 2026-11-01) — distinct from the long
 * /workspace/chatavatar product title pinned in workspace-routes.ts.
 */
export const IMAGETO3D_BARE_TITLE =
  "ChatAvatar - AI 3D Facial Assets Generator | Hyper3D";
