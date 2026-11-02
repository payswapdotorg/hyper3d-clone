#!/usr/bin/env python3
"""t87 anatomy: dump the reference's h2 (+h3 counts) sections for the 11
use-case pages — the per-page anatomy the clone's shared renderer must
mirror (the t86-anatomy.py convention, compact stdout form)."""
import re, html, urllib.request
REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
ROUTES = [
    "/use-cases/3d-printing",
    "/use-cases/animation",
    "/use-cases/automotive-design",
    "/use-cases/character-design",
    "/use-cases/e-commerce",
    "/use-cases/game-development",
    "/use-cases/jewelry-design",
    "/use-cases/mechanical-engineering",
    "/use-cases/metaverse",
    "/use-cases/nft-creation",
    "/use-cases/vr-ar",
]
def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")
def clean(s):
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()
for r in ROUTES:
    try:
        doc = fetch(REF + r)
    except Exception as e:
        print(f"\n=== {r} === FETCH-ERROR {getattr(e, 'code', e)}")
        continue
    m = re.search(r"<main\b.*?</main>", doc, re.S | re.I)
    body = m.group(0) if m else doc
    print(f"\n=== {r} ===")
    for tag, text in re.findall(r"<(h[123])[^>]*>(.*?)</\1>", body, re.S | re.I):
        t = clean(text)
        if not t:
            continue
        indent = {"h1": "", "h2": "  ", "h3": "    "}.get(tag.lower(), "      ")
        print(f"{indent}[{tag.lower()}] {t[:90]}")
