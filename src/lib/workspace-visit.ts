/**
 * t68 — the reference's workspace-visit marker + landing-bounce scripts.
 *
 * Recon 2026-10-31 (reference /workspace shell + / landing HTML):
 *
 * 1. Every workspace shell load runs an inline <head> script that stamps
 *    three "you have been here" markers:
 *      sessionStorage.hyper3dWorkspaceVisited      = "1"
 *      localStorage.hyper3dWorkspaceVisitedAt      = <ISO timestamp>
 *      cookie hyper3d_workspace_visited=1          (1 year, SameSite=Lax, Secure)
 *
 * 2. The landing page runs an inline script that bounces returning visitors
 *    client-side into the workspace:
 *      location.replace('/workspace' + search + hash)
 *    whenever ANY of these hold:
 *      - the hyper3d_workspace_visited cookie,
 *      - sessionStorage.hyper3dWorkspaceVisited === '1',
 *      - a stored localStorage.hyper3dWorkspaceVisitedAt,
 *      - stored auth state (localStorage 'token' + 'user_uuid'),
 *      - stored workspace runtime state (localStorage 'BASE_URL' or
 *        'CURRENT_ROLE').
 *    `?bypass=true` skips the bounce so the landing page stays reachable.
 *
 * Both scripts are reproduced here with the reference's exact marker keys
 * and escape hatches so the observable behavior — visit the studio once,
 * and `/` forwards you to the workspace from then on — matches. The
 * reference's own script is copied in behavior, not byte-for-byte layout:
 * the logic is identical (safe storage accessors, the same five checks,
 * the same redirect URL builder), reformatted for this codebase.
 *
 * Honest note: the auth-state branch checks localStorage keys this clone
 * never writes (its session is an httpOnly cookie — invisible to JS), so
 * for this clone the bounce fires on the visit markers; a signed-in user
 * has, by definition, visited the studio and carries them too.
 */

export const WORKSPACE_VISITED_COOKIE = "hyper3d_workspace_visited";
export const WORKSPACE_VISITED_SESSION_KEY = "hyper3dWorkspaceVisited";
export const WORKSPACE_VISITED_AT_KEY = "hyper3dWorkspaceVisitedAt";

/** Inline script the studio route stamps on every load (reference shell). */
export const WORKSPACE_MARKER_SCRIPT = `(function(){try{sessionStorage.setItem("${WORKSPACE_VISITED_SESSION_KEY}","1")}catch(t){}try{localStorage.setItem("${WORKSPACE_VISITED_AT_KEY}",(new Date).toISOString())}catch(t){}try{var e="https:"===location.protocol?"; Secure":"";document.cookie="${WORKSPACE_VISITED_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax"+e}catch(t){}})();`;

/** Inline script the landing page runs before paint (reference landing). */
export const WORKSPACE_BOUNCE_SCRIPT = `(function(){var a="hyper3dWorkspaceVisitedAt",s="hyper3dWorkspaceVisited",c="hyper3d_workspace_visited";function g(k){try{return localStorage.getItem(k)}catch(e){return null}}function st(k){try{return sessionStorage.getItem(k)}catch(e){return null}}function has(k){var v=g(k);return typeof v==="string"&&v.trim()!==""}function ck(k){try{return document.cookie.split(";").some(function(i){return i.trim().indexOf(k+"=")===0})}catch(e){return false}}function mark(){try{sessionStorage.setItem(s,"1")}catch(e){}try{localStorage.setItem(a,new Date().toISOString())}catch(e){}try{var q=location.protocol==="https:"?"; Secure":"";document.cookie=c+"=1; Path=/; Max-Age=31536000; SameSite=Lax"+q}catch(e){}}function bypass(){try{return new URLSearchParams(location.search).get("bypass")==="true"}catch(e){return false}}if(bypass())return;var visited=ck(c)||st(s)==="1"||has(a);var auth=g("token")&&g("user_uuid");var runtime=g("BASE_URL")||g("CURRENT_ROLE");if(visited||auth||runtime){mark();location.replace("/workspace"+location.search+location.hash)}})();`;
