#!/usr/bin/env python3
"""t76: generate src/lib/reference-descriptions.ts from
/tmp/full-descriptions.json.

The registry maps pathname -> the reference's exact meta description
(HTML-unescaped source characters, including the reference's own literal
backslash escape quirks like "\\u2122" and "\\ \\", pinned verbatim).
One entry per line, sorted by path, deterministic output.
"""
import json

SRC = "/tmp/full-descriptions.json"
OUT = "/home/z/my-project/hyper3d-clone/src/lib/reference-descriptions.ts"

data = json.load(open(SRC, encoding="utf-8"))
descs = data["descriptions"]
bad = data.get("bad", [])
empty = data.get("empty", [])
print(f"{len(descs)} descriptions, {len(bad)} bad, {len(empty)} empty")


def ts_str(s: str) -> str:
    return (
        '"'
        + s.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
        + '"'
    )


lines = []
for path in sorted(descs):
    lines.append(f"  {ts_str(path)}: {ts_str(descs[path])},")

header = '''/**
 * t76 — the byte-faithful reference meta-description registry.
 *
 * Recon 2026-10-31 (recon/t76/full-description-probe.py): every URL in
 * the t75 census — the reference's own 90-child landing-sitemap tree
 * (7,067 URLs) plus the twelve served-not-sitemapped /tools indexes,
 * plus the one 405 — was probed and its served
 * `<meta name="description">` captured verbatim, HTML-unescaped.
 * 7,077 of the 7,078 title-registry paths carry a description; the
 * single miss is /content-preview, which the reference answers with
 * HTTP 200 but NO meta description at all (this clone keeps serving
 * its own honest page description there — no registry entry, template
 * stays). /content-preview/render stays the t75 405 exclusion.
 *
 * Shape of the captured set, verified across the full probe:
 *   - the reference's og:description equals the meta description on
 *     every single pinned page (0 mismatches in 7,077), so the
 *     link-preview card description is the same pinned string — wired
 *     once through familyMetadata and the locale catch-all;
 *   - lengths run 22–296 chars (median 141); 106 pinned descriptions
 *     exceed the 180 chars this clone's own templates slice to —
 *     pinned strings are served full-length, never sliced;
 *   - 19 blog descriptions contain the reference's own literal
 *     backslash escape quirks ("UNCHARTED\\u2122", "guide\\ \\ to") —
 *     a CMS artifact on the reference, pinned byte-for-byte like every
 *     other served character;
 *   - 6,714 of 7,077 are unique strings — real per-page SEO copy with
 *     human translations per locale, not derivable from slugs.
 *
 * Why a registry instead of templates: same argument as the t75 title
 * registry (DECISIONS.md #55) applied to the description dimension —
 * the reference writes real per-page SEO copy ("Compare Free, Creator,
 * Business, and Enterprise plans…", "Rodin 可为受支持的工作流生成高质量、
 * 几乎达到生产就绪状态的 3D 资产。"), localized per locale, and this
 * clone's honest template descriptions drift from it on every family.
 * Descriptions are crawler-surface labels (meta/OG), not body copy.
 *
 * Honest boundary: this registry covers exactly the t75 title-registry
 * paths minus /content-preview — the sitemap-censused tree plus the
 * twelve /tools indexes, 7,077 paths. Deep served-but-not-sitemapped
 * routes (3D prompt library pagination/details/hubs, blog pagination,
 * per-locale sub-category slugs beyond each locale's sitemap list)
 * keep their honest template descriptions, and routes with no entry
 * fall back to their family template unchanged.
 *
 * Generated once from the probe capture; regenerate only with a fresh
 * probe. Do not hand-edit single entries — the tests pin the census.
 */

export const REFERENCE_DESCRIPTIONS: Record<string, string> = {
'''

footer = """};

/** The reference's exact meta description for a censused path, if pinned. */
export function referenceDescription(path: string): string | undefined {
  return REFERENCE_DESCRIPTIONS[path];
}
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(header)
    f.write("\n".join(lines))
    f.write("\n")
    f.write(footer)

import os

print(f"wrote {OUT}: {os.path.getsize(OUT)} bytes, {len(lines)} entries")
