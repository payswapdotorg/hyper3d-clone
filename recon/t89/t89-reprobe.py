#!/usr/bin/env python3
"""t89 re-probe: the 24 deepened articles' density, reference vs clone
(post-deepening). Same visible-word math as t89-probe-sweep.py; the bar is
the 0.55 THIN line the sweep established, with 0.58 expected on average."""
import re, html, urllib.request, concurrent.futures as cf

CLONE = "http://127.0.0.1:3112"
REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

PHASE_ONE = [
    "what-is-obj-file", "3d-text-prompt-guide", "what-is-glb-file", "obj-vs-stl",
    "text-to-3d-model", "image-to-3d", "text-to-stl", "how-to-convert-image-to-3d-model",
    "what-is-dxf-file", "what-is-ply-file", "what-is-usdz", "glb-vs-gltf",
    "what-is-stl-file", "what-is-3mf-file", "fbx-vs-glb", "3mf-vs-stl",
    "image-to-stl", "3d-prompt-engineering", "how-to-make-3d-models-with-ai",
    "generate-3d-game-assets", "free-text-to-3d-model", "what-is-fbx-file",
    "stl-vs-obj-vs-fbx", "hyper3d-review",
]

def visible_words(raw: bytes) -> int:
    s = raw.decode("utf-8", errors="replace")
    s = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return len(re.findall(r"[A-Za-z][A-Za-z\-’']+", s))

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.status, r.read()

rows = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = {ex.submit(fetch, f"{REF}/blog/{s}"): ("ref", s) for s in PHASE_ONE}
    futs.update({ex.submit(fetch, f"{CLONE}/blog/{s}"): ("clone", s) for s in PHASE_ONE})
    for f in cf.as_completed(futs):
        side, slug = futs[f]
        try:
            st, body = f.result()
            rows[(side, slug)] = (st, visible_words(body) if st == 200 else 0)
        except Exception as e:
            rows[(side, slug)] = (getattr(e, "code", 0), 0)

thin = 0
print(f"{'slug':38} {'ref':>5} {'clone':>6}  ratio")
for s in PHASE_ONE:
    rs, rw = rows.get(("ref", s), (0, 0))
    cs, cw = rows.get(("clone", s), (0, 0))
    if rs != 200 or cs != 200:
        print(f"{s:38} {rs:>5} {cs:>6}  STATUS-MISMATCH")
        thin += 1
        continue
    ratio = cw / rw if rw else 0
    flag = "  <<< THIN" if ratio < 0.55 else ""
    if ratio < 0.55:
        thin += 1
    print(f"{s:38} {rw:>5} {cw:>6}  {ratio:5.2f}{flag}")
print(f"\nTHIN (< 0.55): {thin}/{len(PHASE_ONE)}")
