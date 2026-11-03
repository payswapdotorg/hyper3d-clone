#!/usr/bin/env python3
"""t88 probe: /help tree density, reference vs clone (post-t87).
Same shape as t87-probe-use-cases.py — THIN flag under 0.55.
Covers the index + 6 hubs + all 33 articles."""
import re, html, urllib.request, concurrent.futures as cf
CLONE = "http://127.0.0.1:3112"
REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
ROUTES = [
    "/help",
    "/help/getting-started",
    "/help/account-settings",
    "/help/billing",
    "/help/credit",
    "/help/features",
    "/help/enterprise",
    "/help/articles/what-is-hyper3d",
    "/help/articles/how-to-use-hyper3d-beginners-guide",
    "/help/articles/what-features-does-hyper3d-have",
    "/help/articles/does-hyper3d-support-languages-besides-english",
    "/help/articles/how-to-get-support-from-hyper3d",
    "/help/articles/official-hyper3d-links-and-scam-safety",
    "/help/articles/can-i-log-in-to-hyper3d-with-a-verification-code",
    "/help/articles/how-to-reset-hyper3d-password",
    "/help/articles/how-much-do-hyper3d-plans-cost",
    "/help/articles/how-to-purchase-hyper3d-credits",
    "/help/articles/how-to-request-a-hyper3d-refund",
    "/help/articles/what-happens-to-credits-when-changing-plans",
    "/help/articles/are-credits-deducted-when-a-generation-fails",
    "/help/articles/are-credits-returned-after-canceling-a-generation",
    "/help/articles/do-hyper3d-credits-expire",
    "/help/articles/how-many-credits-does-each-hyper3d-generation-cost",
    "/help/articles/how-to-check-hyper3d-credit-history",
    "/help/articles/why-did-my-hyper3d-generation-fail",
    "/help/articles/choose-rodin-model-and-generation-settings",
    "/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents",
    "/help/articles/control-topology-polycount-and-lods",
    "/help/articles/create-3d-avatars-with-chatavatar",
    "/help/articles/create-3d-models-from-images-with-rodin",
    "/help/articles/create-3d-models-from-text-with-rodin",
    "/help/articles/create-editable-scenes-with-hyper3d-worldgen",
    "/help/articles/create-hdri-skyboxes-with-omnicraft",
    "/help/articles/edit-3d-models-in-rodin-workspace",
    "/help/articles/edit-3d-models-with-omnicraft-mesh-editor",
    "/help/articles/fix-common-hyper3d-export-problems",
    "/help/articles/import-models-into-hyper3d-tools",
    "/help/articles/use-bang-and-partial-edit",
    "/help/articles/use-rodin-agentic-mode-for-image-to-3d",
    "/help/articles/how-to-get-hyper3d-enterprise-support",
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
thin = 0
print(f"{'route':58} {'ref':>5} {'clone':>5}  ratio  gap-words")
for r in ROUTES:
    rs, rw = rows.get(("ref", r), (0, 0))
    cs, cw = rows.get(("clone", r), (0, 0))
    if rs != 200 or cs != 200:
        print(f"{r:58} {rs:>5} {cs:>5}  STATUS-MISMATCH"); continue
    ratio = (cw / rw) if rw else 0
    flag = "  <<< THIN" if ratio < 0.55 else ""
    if ratio < 0.55:
        thin += 1
    print(f"{r:58} {rw:>5} {cw:>5}  {ratio:5.2f}  {rw - cw:+6d}{flag}")
print(f"\nTHIN routes (ratio < 0.55): {thin}/{len(ROUTES)}")
