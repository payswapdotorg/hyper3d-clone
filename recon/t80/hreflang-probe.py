#!/usr/bin/env python3
"""t80: full hreflang probe of the reference's EN tree — every censused EN
page (1,092 URLs from the t75 census), capturing the <link rel="alternate"
hreflang> set verbatim plus canonical for cross-check. The t79 probe showed
EN pagination carries the 13-link set page-for-page; this probe answers,
for the whole EN tree: which classes carry the set, what the locale targets
look like per class (plain prefix vs -{loc}-suffixed blog slugs vs renamed
help slugs), and which classes ship zero links.

Output: /tmp/t80-hreflang.json
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

census = json.load(open("/home/z/my-project/hyper3d-clone/recon/t75/title-probe.json"))
titles = census["titles"]
LOCS = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]
en_paths = [
    k for k in titles
    if not any(k == "/" + l or k.startswith("/" + l + "/") for l in LOCS)
]
print(f"EN census paths: {len(en_paths)}")


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
        return path, {"status": e.code, "hreflang": [], "canonical": None}
    except Exception as e:  # noqa: BLE001
        return path, {"status": None, "err": str(e), "hreflang": [], "canonical": None}

    head = body.split("</head>", 1)[0] if "</head>" in body else body
    d = {"status": status, "len": len(body), "hreflang": [], "canonical": None}
    for tag in re.findall(r"<link\s+[^>]*>", head):
        a = attrs(tag)
        rel = a.get("rel", "")
        if "canonical" in rel:
            d["canonical"] = a.get("href")
        elif "alternate" in rel and a.get("hreflang"):
            d["hreflang"].append(
                {"lang": a.get("hreflang"), "href": a.get("href")})
    return path, d


print(f"GET-probing {len(en_paths)} EN pages...")
results = OrderedDict()
with cf.ThreadPoolExecutor(max_workers=24) as ex:
    for path, d in ex.map(probe, en_paths):
        results[path] = d

json.dump(results, open("/tmp/t80-hreflang.json", "w"), indent=1, sort_keys=True)
print("done:", len(results), "entries")
ok = sum(1 for v in results.values() if v.get("status") == 200)
print("200:", ok, "non-200:", len(results) - ok)
