#!/usr/bin/env python3
"""t80: build the blog-translation + sub-category-locale registry
(src/lib/reference-alternate-languages.ts) from the probe, cross-validated
against the t75 census before emission.

Sources:
  /tmp/t80-hreflang.json — the per-EN-page hreflang probe (1,092 pages)
  recon/t75/title-probe.json — the census (7,078 titled URLs)

Emits:
  - REFERENCE_TRANSLATED_BLOG_SLUGS: the 235 EN slugs with translations
  - REFERENCE_BLOG_TRANSLATION_EXCEPTIONS: the two partial-set articles
  - REFERENCE_SUB_CATEGORY_LOCALES: the nsfw-content subset
Cross-checks asserted before writing:
  - probe-derived translated set == census-derived set (2,580 locale URLs)
  - every full article carries exactly 11 locales; exceptions 10 and 7
  - sub-category targets == the censused locale sub-category routes
"""
import json
import re

probe = json.load(open("/tmp/t80-hreflang.json"))
census = json.load(open("/home/z/my-project/hyper3d-clone/recon/t75/title-probe.json"))["titles"]
LOCS = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]

# ---- 1. probe-derived blog translation registry
en_articles = {
    p[len("/blog/"):]
    for p in probe
    if p.startswith("/blog/") and not p.startswith(("/blog/category/", "/blog/page/"))
}
translated = {}   # slug -> [locale, ...]
oddballs = {}     # "loc/base" -> target slug (the double-suffixed forms)
for path, v in probe.items():
    if not path.startswith("/blog/"):
        continue
    if path.startswith("/blog/category/") or path.startswith("/blog/page/"):
        continue
    langs = [x["lang"] for x in v["hreflang"] if x["lang"] not in ("en", "x-default")]
    locales = [("pt" if l == "pt-BR" else l) for l in langs]
    for l in locales:
        assert l in LOCS, (path, l)
    slug = path[len("/blog/"):]
    if locales:
        translated[slug] = sorted(locales, key=LOCS.index)
    # capture double-suffixed targets (e.g. ar -> {base}-zh-ar)
    for x in v["hreflang"]:
        lang = x["lang"]
        if lang in ("en", "x-default"):
            continue
        loc = "pt" if lang == "pt-BR" else lang
        href = x["href"].replace("https://hyper3d.ai", "")
        target_slug = href.split("/blog/")[1]
        if target_slug != f"{slug}-{loc}":
            oddballs[f"{loc}/{slug}"] = target_slug

full = sorted(s for s, ls in translated.items() if len(ls) == 11)
partial = {s: ls for s, ls in translated.items() if len(ls) != 11}
print(f"probe: {len(translated)} translated articles "
      f"({len(full)} full-11, {len(partial)} partial: "
      f"{ {s: len(ls) for s, ls in partial.items()} })")
assert len(translated) == 235, len(translated)
assert set(partial) == {"free-stl-files-for-3d-printing", "use-bang-and-partial-edit"}
assert len(partial["free-stl-files-for-3d-printing"]) == 10
assert len(partial["use-bang-and-partial-edit"]) == 7
assert oddballs == {
    "ar/ai-game-character-creator": "ai-game-character-creator-zh-ar",
    "tr/what-is-ply-file": "what-is-ply-file-zh-tr",
}, oddballs
print("double-suffixed oddball targets:", oddballs)

# suffix-target shape for every translated article, all locales
def expected_target(slug, loc):
    odd = oddballs.get(f"{loc}/{slug}")
    return f"/{loc}/blog/{odd if odd else slug + '-' + loc}"

for path, v in probe.items():
    if path.startswith("/blog/") and not path.startswith(("/blog/category/", "/blog/page/")):
        slug = path[len("/blog/"):]
        for x in v["hreflang"]:
            lang = x["lang"]
            href = x["href"].replace("https://hyper3d.ai", "")
            if lang in ("en", "x-default"):
                assert href == path, (path, href)
            else:
                loc = "pt" if lang == "pt-BR" else lang
                assert href == expected_target(slug, loc), (path, lang, href)
print("suffix-target shape: all translated articles verified")

# ---- 2. census-derived translated set (independent source)
cens_locale_articles = [
    k for k in census
    if re.fullmatch(r"/(zh|de|ja|ko|ru|pt|fr|es|ar|tr|it)/blog/[^/]+", k)
]
print(f"census locale blog article URLs: {len(cens_locale_articles)}")
cens_translated = {}
for k in cens_locale_articles:
    loc = k.split("/")[1]
    slug = k.split("/blog/")[1]
    base = slug[: -len(loc) - 1] if slug.endswith("-" + loc) else slug
    if base not in en_articles and base.endswith("-zh"):
        base = base[:-3]  # the double-suffixed oddball forms
    cens_translated.setdefault(base, set()).add(loc)
assert set(cens_translated) == set(translated), (
    sorted(set(cens_translated) ^ set(translated))[:10])
for s, ls in translated.items():
    assert cens_translated[s] == set(ls), (s, sorted(cens_translated[s]), ls)
print("census cross-check: identical translation sets (probe == census)")

# ---- 3. sub-category registry from the probe
subcat = {}
for path, v in probe.items():
    if not path.startswith("/sub-categories/"):
        continue
    langs = [x["lang"] for x in v["hreflang"] if x["lang"] not in ("en", "x-default")]
    locales = [("pt" if l == "pt-BR" else l) for l in langs]
    if locales:
        subcat[path[len("/sub-categories/"):]] = locales
        # targets are plain-prefix, verified against the census below
        for x in v["hreflang"]:
            lang = x["lang"]
            href = x["href"].replace("https://hyper3d.ai", "")
            if lang in ("en", "x-default"):
                assert href == path
            else:
                loc = "pt" if lang == "pt-BR" else lang
                assert href == f"/{loc}{path}", (path, href)
                assert href in census, (path, href)
assert subcat == {"nsfw-content": ["ja", "ko", "pt", "es"]}, subcat
print("sub-category registry:", subcat, "(targets all censused)")

# ---- 4. emit the registry TS
def ts_arr(items, indent="  "):
    if not items:
        return "[]"
    if len(items) <= 4:
        return "[" + ", ".join(f'"{i}"' for i in items) + "]"
    return "[\n" + "".join(f'{indent}"{i}",\n' for i in items) + "]"

out = f"""/**
 * The reference's hreflang alternate registry (t80) — which censused EN
 * routes carry which locale alternates, pinned from the live reference
 * (recon/t80, {len(probe)} EN pages probed 2026-11-01).
 *
 * The reference's own head behavior, verified across the whole EN tree:
 *  - The full 13-link set (en + 11 locales in sitemap order, pt-BR for
 *    Portuguese, x-default -> EN last) on every family route, the blog
 *    index, the blog pagination (page-for-page), and the 3d-prompts index.
 *  - EN blog articles carry per-article sets: 233 full 11-locale sets,
 *    two partial exceptions (below), and en+x-default only for the other
 *    {sum(1 for p, v in probe.items() if p.startswith('/blog/') and not p.startswith(('/blog/category/', '/blog/page/')) and len(v['hreflang']) == 2)}
 *    untranslated articles. Targets use the reference's own
 *    ``-{{loc}}``-suffixed locale slugs.
 *  - /sub-categories carries per-slug subsets (nsfw-content in 4 locales;
 *    dark-fantasy and roblox untranslated); /event/chroma-awards
 *    untranslated.
 *  - ZERO hreflang links on the blog category hubs, the whole app
 *    surface (/workspace, /content-preview), and every 3d-prompts
 *    route below the index (numbered pages, 403 detail slugs, model
 *    hubs) — probed, not assumed.
 *  - One dead-link quirk mirrored deliberately: the EN help oddball
 *    /help/articles/use-bang-and-partial-edit emits mechanical
 *    (unsuffixed) locale targets that 404 on the reference itself —
 *    the renamed routes are the live ones. The clone emits the same
 *    mechanical targets.
 *
 * Generated by recon/t80/build-alternate-languages-registry.py; the
 * values below are asserted against both the probe and the t75 census
 * before emission. Resolution: referenceAlternateLanguages() in this
 * file; wired solely through familyMetadata (see seo.ts) + the homepage.
 */
import {{ LOCALE_CODES, type LocaleCode }} from "./i18n";
import {{ LOCALE_BLOG_ODDBALLS }} from "./i18n-locale-data";

/** The reference's two double-suffixed locale blog targets
 * (`ai-game-character-creator` -> `/ar/blog/ai-game-character-creator-zh-ar`,
 * `what-is-ply-file` -> `/tr/blog/what-is-ply-file-zh-tr`) — served in
 * LOCALE_BLOG_ODDBALLS and pinned here as the hreflang target shape. */
const DOUBLE_SUFFIXED_TARGETS = new Set<string>(LOCALE_BLOG_ODDBALLS);

function blogTargetPath(slug: string, loc: LocaleCode): string {{
  const targetSlug = DOUBLE_SUFFIXED_TARGETS.has(`${{loc}}/${{slug}}-zh-${{loc}}`)
    ? `${{slug}}-zh-${{loc}}`
    : `${{slug}}-${{loc}}`;
  return `/${{loc}}/blog/${{targetSlug}}`;
}}

/** EN blog slugs carrying the full 11-locale translation set (233). */
export const REFERENCE_TRANSLATED_BLOG_SLUGS: readonly string[] = {ts_arr(full)};

/** The two articles whose translation sets are partial — the reference's
 * own gaps, pinned per locale. */
export const REFERENCE_BLOG_TRANSLATION_EXCEPTIONS: Record<string, readonly LocaleCode[]> = {{
{chr(10).join(f'  "{s}": {ts_arr(ls, "    ")},' for s, ls in sorted(partial.items()))}
}};

/** Sub-category detail slugs with locale alternates on the reference
 * (plain-prefix targets; every censused target below is a live route). */
export const REFERENCE_SUB_CATEGORY_LOCALES: Record<string, readonly LocaleCode[]> = {{
{chr(10).join(f'  "{s}": {ts_arr(ls, "    ")},' for s, ls in sorted(subcat.items()))}
}};

function localesForBlogSlug(slug: string): readonly LocaleCode[] {{
  const exception = REFERENCE_BLOG_TRANSLATION_EXCEPTIONS[slug];
  if (exception) return exception;
  return REFERENCE_TRANSLATED_BLOG_SLUGS.includes(slug) ? LOCALE_CODES : [];
}}

/**
 * The hreflang map for one censused EN path — the reference's own
 * alternate set, with relative hrefs that resolve against metadataBase
 * exactly like every canonical this clone emits (path shapes are
 * byte-identical to the reference's, on this clone's own origin).
 *
 * Key order is load-bearing: Next.js emits <link rel="alternate"> in
 * object order, and the reference's own order is en first, the locales
 * in sitemap order (pt emitted as pt-BR), x-default last.
 *
 * Returns null for the reference's zero-link classes — no languages key
 * at all, hence no alternate <link> tags.
 */
export function referenceAlternateLanguages(path: string): Record<string, string> | null {{
  // zero-link classes — probed, not assumed
  if (path.startsWith("/workspace/") || path === "/workspace") return null;
  if (path.startsWith("/3d-prompts/")) return null;
  if (path.startsWith("/blog/category/")) return null;

  const self = path === "/" ? "/" : path;
  // locale targets: the root's locale mirrors carry no trailing slash
  // (probed: / -> /zh, not /zh/) — same rule as localePath().
  const clean = path === "/" ? "" : path;

  // EN blog articles: per-article locale sets, -{{loc}}-suffixed targets
  // (the two double-suffixed oddballs excepted — see blogTargetPath)
  if (path.startsWith("/blog/") && !path.startsWith("/blog/page/")) {{
    const slug = path.slice("/blog/".length);
    const locales = localesForBlogSlug(slug);
    const out: Record<string, string> = {{ en: self }};
    for (const loc of locales) {{
      const key = loc === "pt" ? "pt-BR" : loc;
      out[key] = blogTargetPath(slug, loc);
    }}
    out["x-default"] = self;
    return out;
  }}

  // sub-category details: per-slug subsets, plain-prefix targets
  if (path.startsWith("/sub-categories/")) {{
    const slug = path.slice("/sub-categories/".length);
    const locales = REFERENCE_SUB_CATEGORY_LOCALES[slug] ?? [];
    const out: Record<string, string> = {{ en: self }};
    for (const loc of locales) {{
      const key = loc === "pt" ? "pt-BR" : loc;
      out[key] = `/${{loc}}${{clean}}`;
    }}
    out["x-default"] = self;
    return out;
  }}

  // events: the censused chroma-awards carries en + x-default only
  if (path.startsWith("/event/")) {{
    return {{ en: self, "x-default": self }};
  }}

  // family tree, blog index, blog pagination, the prompt index: full 13
  const out: Record<string, string> = {{ en: self }};
  for (const loc of LOCALE_CODES) {{
    const key = loc === "pt" ? "pt-BR" : loc;
    out[key] = `/${{loc}}${{clean}}`;
  }}
  out["x-default"] = self;
  return out;
}}
"""

open("/home/z/my-project/hyper3d-clone/src/lib/reference-alternate-languages.ts", "w").write(out)
print("wrote src/lib/reference-alternate-languages.ts:",
      len(out), "bytes,", len(full), "full slugs")
