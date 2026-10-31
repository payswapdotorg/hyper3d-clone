#!/usr/bin/env python3
"""t79 generator: builds src/lib/locale-blog-terms.ts from the raw probe
capture (heads.json). Regenerate ONLY from a fresh probe — the values are
the reference's own published translations, pinned byte-faithfully.

Extracts:
  - LOCALE_BLOG_WORD  (11): "博客", "Blog", ...
  - LOCALE_PAGE_WORD  (11): "页", "Seite", ...
  - LOCALE_CATEGORY_NAMES (11 x 12): localized category names
  - EN_CATEGORY_TITLE_NAMES (12): title-case EN names ("Text To 3D")
"""
import json

d = json.load(open("recon/t79/heads.json"))
LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]
CATS = ["news", "comparisons", "xr", "ai-texturing", "game-development",
        "prompt-guide", "text-to-3d", "image-to-3d", "insights",
        "3d-printing", "workflow", "animation"]

# verify the patterns hold on the full probe before generating
for loc in LOCALES:
    t = d[f"/{loc}/blog/page/2"]["title"]
    assert t.endswith(" | Hyper3D"), (loc, t)
    blog_word, rest = t[:-len(" | Hyper3D")].split(" — ")
    page_word = rest[:-len(" 2")]
    for n in range(2, 21):
        tn = d[f"/{loc}/blog/page/{n}"]["title"]
        assert tn == f"{blog_word} — {page_word} {n} | Hyper3D", (loc, n, tn)
    for c in CATS:
        tc = d[f"/{loc}/blog/category/{c}"]["title"]
        name = tc[:-len(" | Hyper3D")].split(" | ")[0]
        bw2 = tc[:-len(" | Hyper3D")].split(" | ")[1]
        assert bw2 == blog_word, (loc, c, tc)
        dc = d[f"/{loc}/blog/category/{c}"]["description"]
        assert dc == f"Browse the latest Hyper3D blog posts in the {name} category.", (loc, c, dc)

en_names = {}
for c in CATS:
    t = d[f"/blog/category/{c}"]["title"]
    en_names[c] = t[:-len(" | Hyper3D")].split(" | ")[0]

out = []
out.append("""/**
 * The reference's own blog-family UI translations, pinned byte-faithfully
 * from the t79 probe (recon/t79/heads.json — every locale category/pagination
 * route the reference serves; generator: recon/t79/build-locale-blog-terms.py).
 *
 * These are the ONLY per-locale strings the blog category/pagination head
 * needs: the reference derives every one of its 341 locale routes' titles
 * and descriptions from these ~155 words by pure template (verified 0
 * mismatches across the full probe), so this clone derives, not pins,
 * the route-level strings.
 */

import type { LocaleCode } from "./i18n";
import type { BlogCategory } from "./blog-types";

/** The localized word for "Blog" as the reference uses it in blog
 * pagination titles ("博客 — 页 2 | Hyper3D"). */
export const LOCALE_BLOG_WORD: Record<LocaleCode, string> = {
""")
for loc in LOCALES:
    t = d[f"/{loc}/blog/page/2"]["title"]
    bw = t[:-len(" | Hyper3D")].split(" — ")[0]
    out.append(f'  {loc}: "{bw}",\n')
out.append("};\n\n")

out.append("""/** The localized word for "Page" as the reference uses it in blog
 * pagination titles and description prefixes ("页 2: …"). */
export const LOCALE_PAGE_WORD: Record<LocaleCode, string> = {
""")
for loc in LOCALES:
    t = d[f"/{loc}/blog/page/2"]["title"]
    pw = t[:-len(" | Hyper3D")].split(" — ")[1][:-len(" 2")]
    out.append(f'  {loc}: "{pw}",\n')
out.append("};\n\n")

out.append("""/** The localized category names as the reference uses them in locale
 * category titles and description templates — 11 locales x 12 categories,
 * the reference's own next-intl strings. */
export const LOCALE_CATEGORY_NAMES: Record<LocaleCode, Record<BlogCategory, string>> = {
""")
for loc in LOCALES:
    out.append(f"  {loc}: {{\n")
    for c in CATS:
        t = d[f"/{loc}/blog/category/{c}"]["title"]
        name = t[:-len(" | Hyper3D")].split(" | ")[0]
        out.append(f'    "{c}": {json.dumps(name, ensure_ascii=False)},\n')
    out.append("  },\n")
out.append("};\n\n")

out.append("""/** The EN category names in the exact title case the reference puts in
 * its EN category <title>/og:title ("Text To 3D", not "Text to 3D" — the
 * BLOG_CATEGORIES display names differ; both are the reference's own). */
export const EN_CATEGORY_TITLE_NAMES: Record<BlogCategory, string> = {
""")
for c in CATS:
    out.append(f'  "{c}": {json.dumps(en_names[c], ensure_ascii=False)},\n')
out.append("};\n")

src = "".join(out)
open("src/lib/locale-blog-terms.ts", "w").write(src)
print("written src/lib/locale-blog-terms.ts:", len(src), "bytes")
# count entries
print("blog words: 11, page words: 11, category names:", 11 * 12, "EN names: 12")
