#!/usr/bin/env python3
"""t86 probe: omnicraft sub-family density, reference vs clone (post-t85)."""
import re, html, urllib.request, concurrent.futures as cf
CLONE = "http://127.0.0.1:3112"
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
def visible_words(raw: bytes) -> int:
    s = raw.decode("utf-8", errors="replace")
    s = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return len(re.findall(r"[A-Za-z][A-Za-z\-’']+", s))
def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read()
rows = {}
with cf.ThreadPoolExecutor(max_workers=14) as ex:
    futs = {ex.submit(fetch, REF + r): ("ref", r) for r in ROUTES}
    futs.update({ex.submit(fetch, CLONE + r): ("clone", r) for r in ROUTES})
    for f in cf.as_completed(futs):
        side, route = futs[f]
        try:
            st, body = f.result()
            rows[(side, route)] = (st, visible_words(body) if st == 200 else 0)
        except Exception as e:
            rows[(side, route)] = (getattr(e, "code", 0), 0)
print(f"{'route':42} {'ref':>5} {'clone':>5}  ratio  gap-words")
for r in ROUTES:
    rs, rw = rows.get(("ref", r), (0, 0))
    cs, cw = rows.get(("clone", r), (0, 0))
    if rs != 200 or cs != 200:
        print(f"{r:42} {rs:>5} {cs:>5}  STATUS-MISMATCH"); continue
    ratio = (cw / rw) if rw else 0
    flag = "  <<< THIN" if ratio < 0.55 else ""
    print(f"{r:42} {rw:>5} {cw:>5}  {ratio:5.2f}  {rw - cw:+6d}{flag}")
