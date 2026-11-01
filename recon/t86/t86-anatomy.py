#!/usr/bin/env python3
"""t86 anatomy: dump the reference's h2 (+h3 counts) sections for the 7
omnicraft feature pages — the per-page anatomy the clone's shared renderer
must mirror (the t85ref-*.html pattern, compact stdout form)."""
import re, html, urllib.request
REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
ROUTES = [
    "/features/omnicraft/ai-hdri-generator",
    "/features/omnicraft/svg-to-3d-converter",
    "/features/omnicraft/ai-texture-generator",
    "/features/omnicraft/ai-image-enhancer",
    "/features/omnicraft/ai-image-remix",
    "/features/omnicraft/3d-model-search-engine",
    "/features/omnicraft/3d-mesh-editor",
]
def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")
def clean(s):
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()
for r in ROUTES:
    doc = fetch(REF + r)
    # main content region only (skip nav/footer chrome) — Astro pages keep
    # the article inside <main>; fall back to whole doc.
    m = re.search(r"<main\b.*?</main>", doc, re.S | re.I)
    body = m.group(0) if m else doc
    print(f"\n=== {r} ===")
    # split into headings in order
    for tag, text in re.findall(r"<(h[123])[^>]*>(.*?)</\1>", body, re.S | re.I):
        t = clean(text)
        if not t:
            continue
        indent = {"h1": "", "h2": "  ", "h3": "    "}.get(tag.lower(), "      ")
        print(f"{indent}[{tag.lower()}] {t[:90]}")
