#!/usr/bin/env python3
"""t78: generate src/lib/reference-article-metas.ts from /tmp/t78-metas.json.

The registry maps pathname -> the reference's exact OpenGraph article
namespace: { published, modified, author } — the served
article:published_time, article:modified_time, and article:author of
every blog article page in the census (3,358 pages: EN + 11 locale
variants). Help articles carry og:type=article but NO article metas
(the probe verified: 396 help articles, zero article props) — they are
honestly excluded from this registry, as is every non-blog page.
One entry per line, sorted by path, deterministic output.
"""
import json

SRC = "/tmp/t78-metas.json"
OUT = "/home/z/my-project/hyper3d-clone/src/lib/reference-article-metas.ts"

data = json.load(open(SRC, encoding="utf-8"))
metas = data["metas"]
bad = data.get("bad", [])
print(f"{len(metas)} pages probed, {len(bad)} bad")

articles = {
    p: r["article"] for p, r in metas.items() if "article" in r
}
print(f"{len(articles)} pages with article metas")

# sanity: every article page is a /blog family route
non_blog = [p for p in articles if not (p == "/blog" or p.startswith("/blog") or p[3:].startswith("/blog"))]
assert not non_blog, non_blog[:5]

# sanity: exactly the three props on every entry
props = set()
for v in articles.values():
    props.update(v.keys())
assert props == {"article:published_time", "article:modified_time", "article:author"}, props


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
for path in sorted(articles):
    a = articles[path]
    lines.append(
        f"  {ts_str(path)}: {{"
        f' published: {ts_str(a["article:published_time"])},'
        f' modified: {ts_str(a["article:modified_time"])},'
        f' author: {ts_str(a["article:author"])} }},'
    )

header = '''/**
 * t78 — the byte-faithful reference OpenGraph article-meta registry.
 *
 * Recon 2026-10-31 (recon/t78/meta-probe.py): every URL in the
 * t75–t77 census (7,079 URLs) was probed for the article namespace —
 * article:published_time, article:modified_time, article:author (plus
 * og:type to correlate). 3,358 pages carry all three, and every one
 * is a blog article route (EN + the 11 locale variants); their
 * values are pinned verbatim here (`referenceArticleMeta(path)`).
 *
 * Honest exclusions, pinned by probe and by test:
 *   - help articles (396 pages = 33 articles × 12 locales) serve
 *     og:type=article but NO article metas at all — the reference
 *     emits the namespace on blog articles only, so this clone's
 *     help-article cards stay article-typed and article-meta-free;
 *   - every non-blog page (og:type=website) carries no article metas;
 *   - /content-preview (serves 200 with no og:type at all) and
 *     /content-preview/render (the t75 405) are outside every
 *     registry, this one included.
 *
 * Shape of the pinned set, verified across the full probe:
 *   - published: 3,331 distinct ISO timestamps — real per-page CMS
 *     data (EN originals dated Feb–May 2026, locale variants dated
 *     at their translation moments, e.g. the twelve zbrush-alternative
 *     variants span 2026-05-14T18:02:23Z..T18:02:35Z);
 *   - modified: 629 distinct timestamps — 2,640 pages share the
 *     global rebuild 2026-06-25T21:05:48.398Z, the rest carry
 *     their own per-article touch dates; not derivable, pinned;
 *   - author: four real bylines — "Hyper3D" (3,328),
 *     "Hyper3D News" (11), "joel" (12, the photo-to-3d-model family),
 *     "Hyper3D Team" (7) — per-page, pinned.
 *
 * Generated once from the probe capture; regenerate only with a fresh
 * probe. Do not hand-edit single entries — the tests pin the census.
 */

export interface ReferenceArticleMeta {
  /** article:published_time — the reference's own CMS timestamp. */
  published: string;
  /** article:modified_time — the reference's own CMS timestamp. */
  modified: string;
  /** article:author — the reference's own byline. */
  author: string;
}

export const REFERENCE_ARTICLE_METAS: Record<string, ReferenceArticleMeta> = {
'''

footer = """};

/** The reference's exact article metas for a censused blog path, if pinned. */
export function referenceArticleMeta(path: string): ReferenceArticleMeta | undefined {
  return REFERENCE_ARTICLE_METAS[path];
}
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(header)
    f.write("\n".join(lines))
    f.write("\n")
    f.write(footer)

import os

print(f"wrote {OUT}: {os.path.getsize(OUT)} bytes, {len(lines)} entries")
