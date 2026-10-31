#!/usr/bin/env python3
"""t75: generate src/lib/reference-titles.ts from /tmp/full-titles.json.

The registry maps pathname -> the reference's exact <title> (HTML-unescaped
source characters, e.g. real '&' and typographic apostrophes). One entry
per line, sorted by path, deterministic output.
"""
import json

SRC = "/tmp/full-titles.json"
OUT = "/home/z/my-project/hyper3d-clone/src/lib/reference-titles.ts"

data = json.load(open(SRC, encoding="utf-8"))
titles = data["titles"]
bad = data.get("bad", [])
print(f"{len(titles)} titles, {len(bad)} bad")


def ts_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


lines = []
for path in sorted(titles):
    lines.append(f"  {ts_str(path)}: {ts_str(titles[path])},")

header = '''/**
 * t75 — the byte-faithful reference <title> registry.
 *
 * Recon 2026-10-31 (scripts/full-title-probe.py, mirrored to the repo's
 * recon notes): every URL in the reference's own landing-sitemap tree —
 * all 90 children, 7,067 URLs across 12 locales x 8 families — was probed
 * and its served <title> captured verbatim. 7,066 of 7,067 census URLs carry a title; the single
 * miss is /content-preview/render, which the reference itself
 * answers with HTTP 405 to a plain GET (this clone keeps serving its own
 * page there — no registry entry, template title stays).
 *
 * Shape of the captured set, verified across the full probe:
 *   - 7,066 of the pinned titles end with the " | Hyper3D" suffix;
 *   - the 12 homepages (EN + 11 locales) use the brand-first pattern
 *     ("Hyper3D Rodin - Best AI 3D Model Generator" and its localized
 *     siblings) with no suffix;
 *   - the reference's og:title / twitter:title equal the <title> minus
 *     that suffix (0 mismatches in the sampled verification), which
 *     referenceCardTitle() derives.
 *
 * Why a registry instead of templates: the reference's titles are real
 * per-page SEO copy — "AI 3D Asset Generator for Games: Game-Ready 3D
 * Models", "Best ZBrush Alternative? Free AI Sculpting Tools (2026)" —
 * and each locale carries its own human translation, so they cannot be
 * derived from slugs. They are page labels (the crawler-surface
 * contract), not body copy: pinning them byte-faithfully follows the
 * t73/t74 title discipline (DECISIONS.md #53/#54) applied to the whole
 * served tree.
 *
 * Honest boundary: this registry covers the sitemap-censused tree — the
 * crawler surface — plus one explicit, separately-probed extension: the
 * twelve bare /tools indexes (EN + 11 locales) that the reference serves
 * with real localized titles but never sitemaps (the t70 recon already
 * documented that serving gap; 7,078 pinned paths in total). Deep routes
 * the reference serves but does not sitemap (the 3D prompt library's
 * pagination/details/hubs, blog pagination, /tools/converter's siblings
 * under other shapes) keep their honest template titles, and routes with
 * no entry fall back to their family template unchanged.
 *
 * Generated once from the probe capture; regenerate only with a fresh
 * probe. Do not hand-edit single entries — the tests pin the census.
 */

export const TITLE_SUFFIX = " | Hyper3D";

export const REFERENCE_TITLES: Record<string, string> = {
'''

footer = """};

/** The reference's exact <title> for a sitemap-censused path, if pinned. */
export function referenceTitle(path: string): string | undefined {
  return REFERENCE_TITLES[path];
}

/**
 * The reference's link-preview card title (og:title / twitter:title) for a
 * pinned path: the <title> without the " | Hyper3D" suffix. Homepages and
 * any suffix-less title return as-is.
 */
export function referenceCardTitle(path: string): string | undefined {
  const title = REFERENCE_TITLES[path];
  if (title === undefined) return undefined;
  return title.endsWith(TITLE_SUFFIX)
    ? title.slice(0, -TITLE_SUFFIX.length)
    : title;
}
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(header)
    f.write("\n".join(lines))
    f.write("\n")
    f.write(footer)

import os
print(f"wrote {OUT}: {os.path.getsize(OUT)} bytes, {len(lines)} entries")
