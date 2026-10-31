#!/usr/bin/env python3
"""t77: generate src/lib/reference-og-images.ts from /tmp/og-images.json.

The registry maps pathname -> the reference's exact og:image URL
(the same URL serves og:image AND twitter:image on every pinned page —
0 mismatches in 7,077). One entry per line, sorted by path,
deterministic output.
"""
import json

SRC = "/tmp/og-images.json"
OUT = "/home/z/my-project/hyper3d-clone/src/lib/reference-og-images.ts"

data = json.load(open(SRC, encoding="utf-8"))
images = data["images"]
bad = data.get("bad", [])
no_image = data.get("no_image", [])
print(f"{len(images)} og:images, {len(bad)} bad, {len(no_image)} no-image")

uniq = sorted(set(r["image"] for r in images.values()))
print(f"{len(uniq)} unique image URLs")


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
for path in sorted(images):
    lines.append(f"  {ts_str(path)}: {ts_str(images[path]['image'])},")

header = '''/**
 * t77 — the byte-faithful reference og:image registry.
 *
 * Recon 2026-10-31 (recon/t77/og-image-probe.py): every URL in the
 * t75/t76 census — 7,079 URLs — was probed for its served
 * `<meta property="og:image">`. 7,077 carry one (the same two honest
 * exclusions as the description registry: /content-preview serves
 * HTTP 200 with NO og:image at all, /content-preview/render is the
 * 405), so the image URL is pinned verbatim in this 7,077-entry
 * registry (`referenceOgImage(path)`).
 *
 * Shape of the captured set, verified across the full probe:
 *   - 797 unique image URLs, all absolute, two hosts:
 *     storage.deemos.dev (4,014 pages — per-page CDN art under
 *     features/, help/, blog/, use-cases/, seo-page-main/) and
 *     hyper3d.ai (3,063 pages — the shared og-banner.webp);
 *   - twitter:image equals og:image on every pinned page (0
 *     mismatches) and twitter:image:alt equals og:image:alt (0
 *     mismatches), so one pinned URL + one alt string covers the OG
 *     and twitter surfaces at once;
 *   - og:image:alt is NOT pinned here: on all 7,077 pages it equals
 *     the t75 title with the trailing " | Hyper3D" suffix removed —
 *     exactly what referenceCardTitle() already derives — so the alt
 *     flows from the title registry, and familyMetadata's existing
 *     `alt: title` (routes pass the card title) is already the
 *     reference's own alt byte-for-byte;
 *   - no page ships og:image:width/height/type — nothing to pin there.
 *
 * Two shared banners, both pinned because both are what the reference
 * serves: https://hyper3d.ai/assets/og-banner.webp (3,063 pages — the
 * /tools converter matrix, help articles, legal, EN blog, switch,
 * locale 3d-prompts, sub-categories) and
 * https://storage.deemos.dev/assets/og-banner.png (60 pages — the
 * locale root indexes of features/styles/pricing/tools/use-cases).
 * The banner this clone used to hotlink everywhere
 * (hyper3d.ai/assets/og-banner.png) is served by ZERO censused pages.
 *
 * Honest boundary: this registry covers exactly the t76
 * description-registry paths (title registry minus /content-preview).
 * Deep served-but-not-sitemapped routes (3D prompt library
 * pagination/details/hubs, blog pagination, per-locale sub-category
 * slugs beyond each locale's sitemap list) keep the honest fallback
 * banner (OG_BANNER_FALLBACK_URL — the og-banner.webp the reference
 * itself serves on those very families' deep routes).
 *
 * Generated once from the probe capture; regenerate only with a fresh
 * probe. Do not hand-edit single entries — the tests pin the census.
 */

export const REFERENCE_OG_IMAGES: Record<string, string> = {
'''

footer = """};

/** The reference's exact og:image URL for a censused path, if pinned. */
export function referenceOgImage(path: string): string | undefined {
  return REFERENCE_OG_IMAGES[path];
}
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(header)
    f.write("\n".join(lines))
    f.write("\n")
    f.write(footer)

import os

print(f"wrote {OUT}: {os.path.getsize(OUT)} bytes, {len(lines)} entries")
