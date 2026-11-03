#!/usr/bin/env python3
"""t89 verify-served: the deepened band section on the standalone build's
served HTML. Checks, over the 24 phase-one routes plus controls:
  1. every deepened route serves 200 with the band-section heading and
     >= 6 band <details> whose summaries are the reference's verbatim h2s
     (spot-checked against the captured anatomy);
  2. the attribution line quotes the captured reference word count;
  3. an UNTOUCHED written article (what-is-hyper3d) carries NO band section
     — the deepening must not leak onto phase-two articles;
  4. a not-written filler route still serves its honest status page (no
     bands, no TOC) — the t65 contract must survive t89;
  5. unknown blog slug still 404s.
Recon note (t86): Flight payloads embed the themed 404 boundary — empty-shell
checks must grep rendered markers, not class names.
"""
import re, html, json, urllib.request, concurrent.futures as cf

BASE = "http://127.0.0.1:3112"
ANATOMY = json.load(open("recon/t89/written-anatomy.json"))
BAND_HEADING = "The reference\u2019s article at this URL, answered here"

PHASE_ONE = [
    "what-is-obj-file", "3d-text-prompt-guide", "what-is-glb-file", "obj-vs-stl",
    "text-to-3d-model", "image-to-3d", "text-to-stl", "how-to-convert-image-to-3d-model",
    "what-is-dxf-file", "what-is-ply-file", "what-is-usdz", "glb-vs-gltf",
    "what-is-stl-file", "what-is-3mf-file", "fbx-vs-glb", "3mf-vs-stl",
    "image-to-stl", "3d-prompt-engineering", "how-to-make-3d-models-with-ai",
    "generate-3d-game-assets", "free-text-to-3d-model", "what-is-fbx-file",
    "stl-vs-obj-vs-fbx", "hyper3d-review",
]

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "t89-verify"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

fails = []
def check(cond, label):
    if not cond:
        fails.append(label)
        print(f"  FAIL {label}")

with cf.ThreadPoolExecutor(max_workers=12) as ex:
    docs = dict(zip(PHASE_ONE, ex.map(fetch, [f"/blog/{s}" for s in PHASE_ONE])))

print(f"[1] deepened routes: band section + >=6 details + verbatim titles")
for slug in PHASE_ONE:
    st, doc = docs[slug]
    check(st == 200, f"{slug} status {st}")
    check(BAND_HEADING in doc, f"{slug} band heading rendered")
    # the band details are the only <details> whose summaries match captured titles
    summaries = re.findall(r"<summary[^>]*>(.*?)</summary>", doc, flags=re.S)
    summaries = [html.unescape(re.sub(r"<[^>]+>", " ", s)).strip() for s in summaries]
    captured = ANATOMY[slug]["bands"]
    hit = sum(1 for t in captured if t in summaries)
    check(hit >= 6, f"{slug} verbatim band titles rendered ({hit}/{len(captured)})")
    check(f"{ANATOMY[slug]['words']:,}-word" in doc or f"{ANATOMY[slug]['words']}-word" in doc,
          f"{slug} attribution word count quoted")

print(f"[2] untouched controls: no band section leak")
for slug in ["what-is-hyper3d", "how-to-check-hyper3d-credit-history", "edit-3d-models-in-rodin-workspace"]:
    st, doc = fetch(f"/blog/{slug}")
    check(st == 200, f"control {slug} status {st}")
    check(BAND_HEADING not in doc, f"control {slug} carries no band section")

print(f"[3] filler route contract survives (no bands, no TOC)")
st, doc = fetch("/blog/warframes-hidden-easter-eggs-uncovering-secrets-in-the-origin-system")
check(st == 200, f"filler status {st}")
check(BAND_HEADING not in doc, "filler carries no band section")
check("On this page" not in doc, "filler carries no TOC")
check("NOT WRITTEN HERE" in doc, "filler honest banner present")

print(f"[4] unknown slug 404s")
st, _ = fetch("/blog/this-slug-does-not-exist")
check(st == 404, f"unknown slug status {st}")

print(f"\n{'PASS' if not fails else 'FAIL'}: {len(PHASE_ONE) * 4 + 3 + 4 + 1 - len(fails)}/{len(PHASE_ONE) * 4 + 3 + 4 + 1} checks")
for f in fails:
    print("  -", f)
raise SystemExit(1 if fails else 0)
