/**
 * t83 — the two head shapes: the Astro marketing chrome vs the workspace
 * app chrome. Every pin mirrors the reference's served <head>, probed
 * 2026-11-01 across 30+ pages (recon/t83/notes.md + the raw dumps).
 *
 * Shape A (Astro marketing): plain `width=device-width, initial-scale=1.0`
 * viewport, ONE icon link (the 620-byte webp favicon), no
 * keywords/theme-color/notranslate/manifest/apple-touch-icon, the
 * storage.deemos.dev preconnect (crossorigin) + dns-prefetch pair, and —
 * on every non-blog family — the Google-Fonts quartet. The blog family
 * (every locale) ships the storage hints but NO font links.
 *
 * Shape B (the /workspace SPA shell): the locked viewport, theme-color
 * #000000, google-notranslate, the ico/32/16 icon set + apple-touch-icon
 * + manifest, an og:title-only OpenGraph, the twitter card, and
 * file.hyper3d.com hints — not storage.deemos.dev, and no font links.
 *
 * Framework artifacts pinned here as documented divergences (recon/t83):
 * Next renders initial-scale=1 where the reference hand-sets 1.0; React
 * serializes crossorigin="anonymous" for the reference's bare crossorigin;
 * the not-found boundary renders client-side only so its chrome links
 * never reach served bytes (and a stylesheet in its Flight payload would
 * leak font preloads into every notFound()-capable page's head).
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { GOOGLE_FONTS_URL } from "@/components/hyper3d/astro-chrome";
import { isLocaleBlogFamilyDef } from "@/lib/i18n-pages";

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

const CHROME = read("../components/hyper3d/astro-chrome.tsx");
const ROOT_LAYOUT = read("../app/layout.tsx");
const WS_LAYOUT = read("../app/workspace/layout.tsx");
const BLOG_LAYOUT = read("../app/blog/layout.tsx");
const HOME = read("../app/page.tsx");
const LOCALE_PAGE = read("../app/[locale]/[[...slug]]/page.tsx");
const NOT_FOUND = read("../app/not-found.tsx");
const GLOBALS = read("../app/globals.css");

/** The metadata export only — doc comments above AND INSIDE it
 * legitimately name the fields it deliberately drops ("keywords ...
 * are gone"), so absence pins run against the comment-stripped code. */
const ROOT_META = ROOT_LAYOUT.split("export const metadata")[1].split(
  "export const viewport",
)[0].replace(/\/\/[^\n]*/g, "");

/** The eleven families whose reference pages ship the full marketing
 * chrome (font links included), per the recon/t83 per-family census. */
const FULL_CHROME_FAMILIES = [
  "3d-prompts",
  "event",
  "features",
  "help",
  "legal",
  "pricing",
  "styles",
  "sub-categories",
  "switch",
  "tools",
  "use-cases",
] as const;

/* ---------------------------------------------- the Google Fonts URL */

describe("t83 the Google Fonts URL (byte-faithful to the reference's own link)", () => {
  it("is the reference's exact URL: family order, weight sets, display=swap", () => {
    expect(GOOGLE_FONTS_URL).toBe(
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=Inter:wght@300;400;500;600&family=Poppins:wght@400;500;600;700;800&display=swap",
    );
  });

  it("serves the three censused families in the reference's order (mono, Inter, Poppins)", () => {
    const idxMono = GOOGLE_FONTS_URL.indexOf("IBM+Plex+Mono");
    const idxInter = GOOGLE_FONTS_URL.indexOf("Inter");
    const idxPoppins = GOOGLE_FONTS_URL.indexOf("Poppins");
    expect(idxMono).toBeGreaterThan(-1);
    expect(idxInter).toBeGreaterThan(idxMono);
    expect(idxPoppins).toBeGreaterThan(idxInter);
  });

  it("carries no extra parameters (no subset/text/other display values)", () => {
    const params = GOOGLE_FONTS_URL.split("?")[1].split("&");
    expect(params.filter((p) => p.startsWith("display="))).toEqual([
      "display=swap",
    ]);
    expect(params.some((p) => p.startsWith("subset="))).toBe(false);
    expect(params.some((p) => p.startsWith("text="))).toBe(false);
  });
});

/* ------------------------------------------ the two chrome components */

describe("t83 AstroHints — the CDN pair every censused page ships", () => {
  it("preconnects storage.deemos.dev WITH crossorigin (the reference's own shape)", () => {
    expect(CHROME).toContain(
      '<link rel="preconnect" href="https://storage.deemos.dev" crossOrigin="anonymous" />',
    );
  });

  it("dns-prefetches storage.deemos.dev (the second link of the pair)", () => {
    expect(CHROME).toContain(
      '<link rel="dns-prefetch" href="https://storage.deemos.dev" />',
    );
  });

  it("renders exactly the two hint links — no font links inside AstroHints", () => {
    const body = CHROME.split("export function AstroHints")[1].split(
      "export function",
    )[0];
    expect(body.match(/<link/g)?.length).toBe(2);
    expect(body).not.toContain("fonts.googleapis");
  });
});

describe("t83 GoogleFontLinks — the reference's font quartet", () => {
  it("preconnects fonts.googleapis.com plain (no crossorigin on that one)", () => {
    expect(CHROME).toContain(
      '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    );
    expect(CHROME).not.toContain(
      '<link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin',
    );
  });

  it("preconnects fonts.gstatic.com WITH crossorigin (the reference's split)", () => {
    expect(CHROME).toContain(
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />',
    );
  });

  it("serves the stylesheet itself via the precedence prop", () => {
    expect(CHROME).toContain(
      `<link rel="stylesheet" href={GOOGLE_FONTS_URL} precedence="google-fonts" />`,
    );
  });

  it("ships the noscript fallback for the same URL", () => {
    expect(CHROME).toMatch(
      /<noscript>\s*<link rel="stylesheet" href=\{GOOGLE_FONTS_URL\} \/>\s*<\/noscript>/,
    );
  });

  it("orders the quartet like the reference: hints before stylesheet", () => {
    const body = CHROME.split("export function GoogleFontLinks")[1].split(
      "export function",
    )[0];
    const googleapis = body.indexOf("fonts.googleapis.com");
    const gstatic = body.indexOf("fonts.gstatic.com");
    const stylesheet = body.indexOf('rel="stylesheet"');
    const noscript = body.indexOf("<noscript>");
    expect(googleapis).toBeGreaterThan(-1);
    expect(gstatic).toBeGreaterThan(googleapis);
    expect(stylesheet).toBeGreaterThan(gstatic);
    expect(noscript).toBeGreaterThan(stylesheet);
  });
});

/* ---------------------------------------- Shape A: the root layout */

describe("t83 the root layout is the Astro marketing default", () => {
  it("ships the plain unlocked viewport (width + initial-scale only)", () => {
    const vp = ROOT_LAYOUT.split("export const viewport")[1];
    expect(vp).toContain('width: "device-width"');
    expect(vp).toContain("initialScale: 1");
    expect(vp).not.toContain("maximumScale");
    expect(vp).not.toContain("minimumScale");
    expect(vp).not.toContain("userScalable");
    expect(vp).not.toContain("viewportFit");
    expect(vp).not.toContain("themeColor");
  });

  it("links ONE icon: the webp favicon, and nothing else", () => {
    const icons = ROOT_META.match(/icons:\s*\{[\s\S]*?\},/)?.[0] ?? "";
    expect(icons).toContain('"/favicon-32x32.webp"');
    expect(icons).toContain('"image/webp"');
    expect(icons).toContain('"32x32"');
    expect(icons.match(/url:/g)?.length).toBe(1);
    expect(ROOT_META).not.toContain("/favicon.ico");
    expect(ROOT_META).not.toContain("favicon-32x32.png");
    expect(ROOT_META).not.toContain("favicon-16x16.png");
    expect(ROOT_META).not.toContain("apple-touch-icon");
    expect(ROOT_META).not.toContain("manifest");
  });

  it("serves none of the workspace-only metas (censused absent on 30+ Astro pages)", () => {
    expect(ROOT_META).not.toContain("keywords");
    expect(ROOT_META).not.toContain("themeColor");
    expect(ROOT_META).not.toContain("notranslate");
    expect(ROOT_META).not.toContain("apple");
  });

  it("imports no font mechanism of its own (next/font is gone; CDN links render per-surface)", () => {
    expect(ROOT_LAYOUT).not.toMatch(/^import .*next\/font/m);
    expect(ROOT_LAYOUT).not.toMatch(/^import .*google\/fonts/m);
    expect(ROOT_LAYOUT).not.toContain("<AstroChrome");
    expect(ROOT_LAYOUT).not.toContain("<AstroHints");
    expect(ROOT_LAYOUT).not.toContain("<GoogleFontLinks");
  });
});

/* -------------------------------------- Shape B: the workspace shell */

describe("t83 the workspace layout is the SPA shell's own chrome", () => {
  it("ships the locked viewport with theme-color #000000", () => {
    const vp = WS_LAYOUT.split("export const viewport")[1];
    expect(vp).toContain('width: "device-width"');
    expect(vp).toContain("minimumScale: 1");
    expect(vp).toContain("maximumScale: 1");
    expect(vp).toContain("userScalable: false");
    expect(vp).toContain('viewportFit: "cover"');
    expect(vp).toContain('themeColor: "#000000"');
  });

  it("serves the shell's icon set: ico + 32/16 png + apple-touch + manifest", () => {
    expect(WS_LAYOUT).toContain('url: "/favicon.ico"');
    expect(WS_LAYOUT).toContain('url: "/favicon-32x32.png"');
    expect(WS_LAYOUT).toContain('url: "/favicon-16x16.png"');
    expect(WS_LAYOUT).toContain('url: "/apple-touch-icon.png"');
    expect(WS_LAYOUT).toContain('sizes: "180x180"');
    expect(WS_LAYOUT).toContain('manifest: "/manifest.json"');
  });

  it("carries google-notranslate and the og:title-only OpenGraph", () => {
    expect(WS_LAYOUT).toContain('other: { google: "notranslate" }');
    expect(WS_LAYOUT).toContain("openGraph: { title: \"Hyper3D\" }");
    const og = WS_LAYOUT.match(/openGraph:\s*\{[^\n]*\}/)?.[0] ?? "";
    expect(og).not.toContain("images");
    expect(og).not.toContain("description");
    expect(og).not.toContain("url");
  });

  it("nulls the title and description (untitled routes serve none, like the shell)", () => {
    expect(WS_LAYOUT).toContain("title: null");
    expect(WS_LAYOUT).toContain("description: null");
  });

  it("serves NO canonical — null alternates replace the root's homepage canonical", () => {
    // The shell census (recon/t83 ws-shell.html): no canonical, no
    // hreflang. Next merges alternates per-segment; a null canonical
    // resolves to no <link rel="canonical"> (verified on the standalone
    // build — serve-side artifact found: the old server process must be
    // killed by pid, next-server retitles itself past `pkill -f
    // server.js`).
    expect(WS_LAYOUT).toContain("alternates: { canonical: null }");
    const meta = WS_LAYOUT.split("export const metadata")[1].split(
      "export const viewport",
    )[0];
    expect(meta).not.toMatch(/canonical:\s*"/);
    expect(meta).not.toContain("languages");
  });

  it("hints file.hyper3d.com — NOT storage.deemos.dev — and no font links", () => {
    expect(WS_LAYOUT).toContain(
      '<link rel="preconnect" href="https://file.hyper3d.com" />',
    );
    expect(WS_LAYOUT).toContain(
      '<link rel="dns-prefetch" href="https://file.hyper3d.com" />',
    );
    expect(WS_LAYOUT).not.toMatch(/<link[^>]*storage\.deemos\.dev/);
    expect(WS_LAYOUT).not.toMatch(/<link[^>]*fonts\.googleapis/);
    expect(WS_LAYOUT).not.toContain("GoogleFontLinks");
  });
});

/* ------------------------------------------- per-surface wiring split */

describe("t83 every full-chrome family layout renders AstroChrome", () => {
  for (const family of FULL_CHROME_FAMILIES) {
    it(`/src/app/${family}/layout.tsx renders the hints + font quartet`, () => {
      const file = read(`../app/${family}/layout.tsx`);
      expect(file).toContain('from "@/components/hyper3d/astro-chrome"');
      expect(file).toContain("<AstroChrome />");
    });
  }

  it("the family layouts exist for all eleven (recon/t83 census set)", () => {
    for (const family of FULL_CHROME_FAMILIES) {
      expect(existsSync(join(__dirname, `../app/${family}/layout.tsx`))).toBe(
        true,
      );
    }
  });
});

describe("t83 the blog family renders the storage hints and NO font links", () => {
  it("blog/layout.tsx wires AstroHints only (the reference's own blog shape)", () => {
    expect(BLOG_LAYOUT).toContain(
      'import { AstroHints } from "@/components/hyper3d/astro-chrome"',
    );
    expect(BLOG_LAYOUT).toContain("<AstroHints />");
    expect(BLOG_LAYOUT).not.toContain("AstroChrome");
    expect(BLOG_LAYOUT).not.toContain("GoogleFontLinks");
  });
});

describe("t83 the home page renders the full marketing chrome", () => {
  it("page.tsx renders AstroChrome alongside the landing", () => {
    expect(HOME).toContain('from "@/components/hyper3d/astro-chrome"');
    expect(HOME).toContain("<AstroChrome />");
  });
});

/* -------------------------------------- the locale catch-all split */

describe("t83 the locale catch-all splits chrome by family (probed per class)", () => {
  it("wires the split: blog-family defs get hints, everything else the full chrome", () => {
    expect(LOCALE_PAGE).toContain("isLocaleBlogFamilyDef(def)");
    expect(LOCALE_PAGE).toContain(
      "const chrome = isLocaleBlogFamilyDef(def) ? <AstroHints /> : <AstroChrome />;",
    );
  });

  it("blog-family defs resolve true (hub, article, category, pagination)", () => {
    expect(
      isLocaleBlogFamilyDef({ kind: "hub", family: "blog", enHref: "/blog", count: 1, links: [] }),
    ).toBe(true);
    expect(
      isLocaleBlogFamilyDef({ kind: "article", family: "blog", enHref: "/blog/x", title: "x", status: { kind: "blog", family: "written" } }),
    ).toBe(true);
    expect(
      isLocaleBlogFamilyDef({ kind: "blog-category", category: "news", links: [] }),
    ).toBe(true);
    expect(isLocaleBlogFamilyDef({ kind: "blog-pagination", page: 2 })).toBe(true);
  });

  it("every other def resolves false", () => {
    expect(isLocaleBlogFamilyDef({ kind: "home" })).toBe(false);
    expect(
      isLocaleBlogFamilyDef({ kind: "hub", family: "features", enHref: "/features", count: 1, links: [] }),
    ).toBe(false);
    expect(
      isLocaleBlogFamilyDef({ kind: "article", family: "features", enHref: "/features/x", title: "x" }),
    ).toBe(false);
    expect(
      isLocaleBlogFamilyDef({ kind: "hub", family: "pricing", enHref: "/pricing", count: 1, links: [] }),
    ).toBe(false);
  });
});

/* ---------------------------------------------------- the 404 head */

describe("t83 the 404 head (the reference serves the full marketing head on 404s)", () => {
  it("self-canonicalizes at /404 with the 13-link hreflang set, x-default last", () => {
    expect(NOT_FOUND).toContain('canonical: "/404"');
    const langs = NOT_FOUND.match(/NOT_FOUND_LANGUAGES[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
    const keys = langs
      .split("\n")
      .map((l) => l.match(/^\s*(?:"([^"]+)"|([A-Za-z-]+)):/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => m[1] ?? m[2]);
    expect(keys).toEqual([
      "en", "zh", "de", "ja", "ko", "ru", "pt-BR", "fr", "es", "ar", "tr", "it", "x-default",
    ]);
    expect(keys.filter((k) => k === "x-default").length).toBe(1);
  });

  it("every hreflang target is the /404 form in its locale slot", () => {
    expect(NOT_FOUND).toContain('en: "/404"');
    expect(NOT_FOUND).toContain('"x-default": "/404"');
    // 11 non-EN locales (zh de ja ko ru pt fr es ar tr it), each /{loc}/404
    expect(NOT_FOUND.match(/\/(zh|de|ja|ko|ru|pt|fr|es|ar|tr|it)\/404/g)?.length).toBe(11);
  });

  it("serves the card on the shared og-banner fallback with alt", () => {
    expect(NOT_FOUND.match(/OG_BANNER_FALLBACK_URL/g)?.length).toBeGreaterThanOrEqual(2);
    expect(NOT_FOUND).toContain('alt: "404 Page Not Found"');
  });

  it("renders NO chrome components (the Flight-payload exclusion, recon/t83)", () => {
    expect(NOT_FOUND).not.toContain("astro-chrome");
    expect(NOT_FOUND).not.toContain("AstroChrome");
    expect(NOT_FOUND).not.toContain("AstroHints");
    expect(NOT_FOUND).not.toContain("GoogleFontLinks");
  });
});

/* ------------------------------------------- the font stacks (CSS) */

describe("t83 globals.css names the CDN families with the reference's stacks", () => {
  it("--font-inter leads with Inter and a ui-sans-serif stack", () => {
    expect(GLOBALS).toMatch(
      /--font-inter: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;/,
    );
  });

  it("--font-poppins leads with Poppins over the Helvetica stack (the reference's own var)", () => {
    expect(GLOBALS).toContain('--font-poppins: "Poppins", "Helvetica Neue", Helvetica, Arial');
  });

  it("--font-plex-mono leads with IBM Plex Mono over a ui-monospace stack", () => {
    expect(GLOBALS).toContain('--font-plex-mono: "IBM Plex Mono", ui-monospace');
  });

  it("declares no @font-face anywhere (fonts load only via the CDN stylesheet)", () => {
    expect(GLOBALS).not.toContain("@font-face");
  });
});

/* --------------------------------------------- the icon file assets */

describe("t83 the icon assets at their well-known paths", () => {
  it("the webp favicon is the reference's own 620-byte file, self-hosted", () => {
    const stat = statSync(join(__dirname, "../../public/favicon-32x32.webp"));
    expect(stat.size).toBe(620);
  });

  it("the workspace shell's linked files all live on (the reference serves them too)", () => {
    for (const f of [
      "favicon.ico",
      "favicon-32x32.png",
      "favicon-16x16.png",
      "apple-touch-icon.png",
      "manifest.json",
    ]) {
      expect(existsSync(join(__dirname, `../../public/${f}`))).toBe(true);
    }
    expect(statSync(join(__dirname, "../../public/apple-touch-icon.png")).size).toBe(11989);
    expect(statSync(join(__dirname, "../../public/manifest.json")).size).toBe(568);
  });
});
