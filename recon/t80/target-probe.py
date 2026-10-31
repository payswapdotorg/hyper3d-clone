#!/usr/bin/env python3
"""t80 round 2: sample-probe (a) hreflang TARGET existence on the reference,
(b) the app surface's hreflang shape, (c) uncensused family routes (3d-prompt
detail pages) to validate the mechanical-default assumption."""
import re
import html as htmlmod
import json
import urllib.request
import urllib.error
import concurrent.futures as cf

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}

d = json.load(open("/tmp/t80-hreflang.json"))


def attrs(tag):
    out = {}
    for m in re.finditer(r'([\w:-]+)="([^"]*)"', tag):
        out[m.group(1)] = htmlmod.unescape(m.group(2))
    return out


def get(path):
    req = urllib.request.Request(REF + path, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        try:
            return e.code, e.read().decode("utf-8", "replace")
        except Exception:
            return e.code, ""
    except Exception as e:  # noqa: BLE001
        return None, ""


def hreflangs(path):
    st, body = get(path)
    if st != 200:
        return st, None
    head = body.split("</head>", 1)[0]
    out = []
    for tag in re.findall(r"<link\s+[^>]*>", head):
        a = attrs(tag)
        if "alternate" in a.get("rel", "") and a.get("hreflang"):
            out.append((a["hreflang"], a["href"].replace(REF, "")))
    return st, out


# ---- (a) target existence: for sample EN pages, probe every locale target
sample_classes = {
    "tools-detail": next(p for p in d if p.startswith("/tools/") and len(d[p]["hreflang"]) == 13),
    "help-article": next(p for p in d if p.startswith("/help/articles/") and len(d[p]["hreflang"]) == 13),
    "features": next(p for p in d if p.startswith("/features/") and len(d[p]["hreflang"]) == 13),
    "styles": next(p for p in d if p.startswith("/styles/") and len(d[p]["hreflang"]) == 13),
    "use-cases": next(p for p in d if p.startswith("/use-cases/") and len(d[p]["hreflang"]) == 13),
    "legal": next(p for p in d if p.startswith("/legal/") and len(d[p]["hreflang"]) == 13),
    "switch": next(p for p in d if p.startswith("/switch/") and len(d[p]["hreflang"]) == 13),
    "blog-full": next(p for p in d if p.startswith("/blog/") and len(d[p]["hreflang"]) == 13 and "/category/" not in p and "/page/" not in p),
    "blog-12link": "/blog/free-stl-files-for-3d-printing",
    "blog-9link": "/blog/use-bang-and-partial-edit",
    "subcat-nsfw": "/sub-categories/nsfw-content",
}
print("=== target existence by class ===")
for cls, p in sample_classes.items():
    targets = [(x["lang"], x["href"].replace(REF, ""))
               for x in d[p]["hreflang"] if x["lang"] not in ("en", "x-default")]
    statuses = {}
    with cf.ThreadPoolExecutor(max_workers=11) as ex:
        for lang, href in zip([t[0] for t in targets], targets):
            pass
        res = list(ex.map(lambda t: (t[0], get(t[1])[0]), targets))
    statuses = {lang: st for lang, st in res}
    ok = sum(1 for st in statuses.values() if st == 200)
    print(f"  {cls} {p}: {ok}/{len(targets)} targets 200  {statuses}")

# ---- (b) app surface hreflang shape
print("\n=== app surface ===")
for p in ["/workspace", "/workspace/omnicraft", "/content-preview"]:
    st, hl = hreflangs(p)
    print(f"  {p}: status={st} hreflang_links={len(hl) if hl is not None else 'n/a'}"
          + (f" {hl[:3]}" if hl else ""))

# ---- (c) uncensused family routes: 3d-prompt detail pages
print("\n=== uncensused 3d-prompts pages ===")
# find some slugs: the clone's 3d-prompts/[slug] — probe a few made-up + real ones.
# real ones come from the reference sitemap? not censused; try known families
for p in ["/3d-prompts/robot", "/3d-prompts/cyberpunk-city", "/3d-prompts/models"]:
    st, hl = hreflangs(p)
    if st == 200 and hl is not None:
        langs = [l for l, _ in hl]
        print(f"  {p}: 200, {len(hl)} links: {langs}")
    else:
        print(f"  {p}: status={st}")
