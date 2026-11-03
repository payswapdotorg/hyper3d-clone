#!/usr/bin/env python3
"""t88 anatomy: dump the reference's help article anatomy — h1/h2/h3 for
all 33 articles + the 6 category hubs + the index — the per-page anatomy
the clone's shared renderer must mirror (t87-anatomy.py convention,
compact stdout form)."""
import re, html, urllib.request, concurrent.futures as cf
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
def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")
def clean(s):
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()
docs = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = {ex.submit(fetch, REF + r): r for r in ROUTES}
    for f in cf.as_completed(futs):
        r = futs[f]
        try:
            docs[r] = f.result()
        except Exception as e:
            docs[r] = None
            print(f"!! {r} FETCH-ERROR {getattr(e, 'code', e)}", flush=True)
for r in ROUTES:
    doc = docs.get(r)
    if not doc:
        continue
    m = re.search(r"<main\b.*?</main>", doc, re.S | re.I)
    body = m.group(0) if m else doc
    print(f"\n=== {r} ===")
    for tag, text in re.findall(r"<(h[1234])[^>]*>(.*?)</\1>", body, re.S | re.I):
        t = clean(text)
        if not t:
            continue
        indent = {"h1": "", "h2": "  ", "h3": "    ", "h4": "      "}.get(tag.lower(), "        ")
        print(f"{indent}[{tag.lower()}] {t[:100]}")
