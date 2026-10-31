#!/usr/bin/env python3
"""t79 round 2: full head probe of the reference's locale blog category /
pagination routes (341 locale routes + 31 EN controls). Captures per page:
status, title, description, robots, fb token, og:type/title/url/desc/image/
locale, article:* namespace, RSS link, canonical, hreflang set, twitter card.
Output: /tmp/t79-heads.json
"""
import re
import html as htmlmod
import json
import urllib.request
import urllib.error
import concurrent.futures as cf
from collections import OrderedDict

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}

LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]
CATEGORIES = ["news", "comparisons", "xr", "ai-texturing", "game-development",
              "prompt-guide", "text-to-3d", "image-to-3d", "insights",
              "3d-printing", "workflow", "animation"]
PAGES = [str(n) for n in range(2, 21)]


def attrs(tag):
    out = {}
    for m in re.finditer(r'([\w:-]+)="([^"]*)"', tag):
        out[m.group(1)] = htmlmod.unescape(m.group(2))
    return out


def probe(path):
    url = REF + path
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            body = r.read().decode("utf-8", "replace")
            status = r.status
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", "replace")
        except Exception:
            body = ""
        return path, {"status": e.code}
    except Exception as e:  # noqa: BLE001
        return path, {"status": None, "err": str(e)}

    head = body.split("</head>", 1)[0] if "</head>" in body else body
    d = {"status": status, "len": len(body)}

    m = re.search(r"<title[^>]*>(.*?)</title>", head, re.S)
    d["title"] = htmlmod.unescape(m.group(1)).strip() if m else None

    metas = re.findall(r"<meta\s+[^>]*>", head)
    for tag in metas:
        a = attrs(tag)
        name = a.get("name")
        prop = a.get("property")
        if name == "robots":
            d["robots"] = a.get("content")
        elif name == "facebook-domain-verification":
            d["fb"] = a.get("content")
        elif name == "description":
            d["description"] = a.get("content")
        elif prop == "og:type":
            d["og_type"] = a.get("content")
        elif prop == "og:title":
            d["og_title"] = a.get("content")
        elif prop == "og:url":
            d["og_url"] = a.get("content")
        elif prop == "og:description":
            d["og_desc"] = a.get("content")
        elif prop == "og:image":
            d.setdefault("og_image", []).append(a.get("content"))
        elif prop == "og:locale":
            d["og_locale"] = a.get("content")
        elif prop and prop.startswith("article:"):
            d.setdefault("article", {})[prop] = a.get("content")
        elif name == "twitter:card":
            d["tw_card"] = a.get("content")

    for tag in re.findall(r"<link\s+[^>]*>", head):
        a = attrs(tag)
        rel = a.get("rel", "")
        if "alternate" in rel and a.get("type") == "application/rss+xml":
            d["rss"] = {"href": a.get("href"), "title": a.get("title")}
        elif "canonical" in rel:
            d["canonical"] = a.get("href")
        elif "alternate" in rel and a.get("hreflang"):
            d.setdefault("hreflang", []).append(
                {"lang": a.get("hreflang"), "href": a.get("href")})

    # body shape: main heading + article-card count + pagination links
    if status == 200:
        b = body
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", b, re.S)
        d["h1"] = re.sub(r"<[^>]+>", "", h1.group(1)).strip()[:120] if h1 else None
        d["body_lang"] = (re.search(r'<html[^>]*\blang="([^"]*)"', b) or [None, None])[1] \
            if re.search(r'<html[^>]*\blang="([^"]*)"', b) else None
        d["n_articles"] = len(re.findall(r"<article\b", b))
        # og:image count precise
    return path, d


paths = []
for c in CATEGORIES:
    paths.append(f"/blog/category/{c}")
for p in PAGES:
    paths.append(f"/blog/page/{p}")
for loc in LOCALES:
    paths.append(f"/{loc}/blog")
    for c in CATEGORIES:
        paths.append(f"/{loc}/blog/category/{c}")
    for p in PAGES:
        paths.append(f"/{loc}/blog/page/{p}")

print(f"GET-probing {len(paths)} pages...")
results = OrderedDict()
with cf.ThreadPoolExecutor(max_workers=24) as ex:
    for path, d in ex.map(probe, paths):
        results[path] = d

json.dump(results, open("/tmp/t79-heads.json", "w"), indent=1, sort_keys=True)
print("done:", len(results), "entries")
ok = sum(1 for v in results.values() if v.get("status") == 200)
print("200:", ok, "non-200:", len(results) - ok)
