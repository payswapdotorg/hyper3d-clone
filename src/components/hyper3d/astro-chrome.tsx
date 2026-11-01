/**
 * The reference's two page-chrome shapes, as server components (t83).
 *
 * Recon 2026-11-01 (recon/t83): every reference *marketing* page — home,
 * locales, features, help, 3d-prompts, pricing, tools, event, use-cases,
 * legal, styles, sub-categories, switch and the 404 — ships the same
 * Astro chrome: a storage.deemos.dev preconnect (crossorigin) +
 * dns-prefetch pair, two Google-Fonts preconnects, the Google Fonts
 * stylesheet itself and a noscript fallback for it. The blog family
 * (index, pagination, category hubs, articles — every locale) ships the
 * storage hints but NO font links: its template genuinely renders in
 * the CSS fallback stack (no @font-face anywhere in the reference's
 * _astro CSS — the fonts load only through these links, so the blog
 * pages simply never load them).
 *
 * These components are rendered per-surface (family layouts, the home
 * page, the global 404, the locale catch-all's non-blog defs). React 19
 * hoists every one of these tags into <head> — resource hints
 * unconditionally, the stylesheet via its precedence prop.
 */

/** The reference's own Google Fonts URL, byte-faithful (family order,
 * weight sets and display=swap exactly as served). IBM Plex Mono ships
 * 400 only; Inter 300-600; Poppins 400-800. */
export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@300;400;500;600&family=Poppins:wght@400;500;600;700;800&display=swap";

/**
 * The CDN hint pair every Astro page ships (marketing AND blog): the
 * og:image host this clone hotlinks 4,014 censused images from, hinted
 * with the reference's own crossorigin + dns-prefetch shape.
 */
export function AstroHints() {
  return (
    <>
      <link rel="preconnect" href="https://storage.deemos.dev" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://storage.deemos.dev" />
    </>
  );
}

/**
 * The font quartet: two preconnects (googleapis plain, gstatic
 * crossorigin — the reference's own split), the stylesheet itself and
 * the noscript fallback. Two framework artifacts, verified on the
 * standalone build (recon/t83): React hoists the stylesheet into
 * <head> (via its precedence prop) but cannot hoist <noscript>, so the
 * fallback renders at the component's body position — inert for JS
 * clients, and applied by no-JS parsers exactly like the reference's
 * head-position copy (body-level stylesheet links load fine without
 * scripting); and the reference's media="print" + onload deferred-load
 * trick is not emittable through RSC (inline string handlers on
 * hoisted links are unsupported), so the stylesheet serves as a plain
 * render-blocking link — the same URL, the same noscript fallback.
 * crossorigin serializes as crossorigin="anonymous" (React's form of
 * the reference's bare `crossorigin` — the same anonymous state).
 *
 * A third artifact, found wiring the 404 (recon/t83): the not-found
 * boundary ships in every notFound()-capable page's Flight payload, and
 * ANY stylesheet link in that payload — precedence or not — makes React
 * pre-emit a font preload into every such page's head, including the
 * blog family's deliberately font-free heads. That is why the 404
 * renders no chrome components at all (see not-found.tsx): the
 * error-root shell renders the boundary client-side only, so its links
 * would never reach served bytes anyway.
 */
export function GoogleFontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} precedence="google-fonts" />
      <noscript>
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      </noscript>
    </>
  );
}

/** The full marketing chrome (hints + fonts) — what every non-blog
 * content surface renders. */
export function AstroChrome() {
  return (
    <>
      <AstroHints />
      <GoogleFontLinks />
    </>
  );
}
