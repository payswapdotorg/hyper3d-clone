#!/usr/bin/env python3
"""t79 round 1: the status-code matrix for the reference's locale blog
category / pagination routes. 11 locales x {blog, category/12, page/2..20}
plus suffix-form probes (-zh etc.) to test whether the reference localizes
the category slugs. Output: /tmp/t79-status.json
"""
import json
import urllib.request
import urllib.error
import concurrent.futures as cf

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}

LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]
CATEGORIES = ["news", "comparisons", "xr", "ai-texturing", "game-development",
              "prompt-guide", "text-to-3d", "image-to-3d", "insights",
              "3d-printing", "workflow", "animation"]
PAGES = [str(n) for n in range(2, 21)]


def probe(url):
    req = urllib.request.Request(url, headers=UA, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return url, r.status, None
    except urllib.error.HTTPError as e:
        return url, e.code, None
    except Exception as e:  # noqa: BLE001
        return url, None, str(e)


urls = []
# the full EN control set
for c in CATEGORIES:
    urls.append(f"{REF}/blog/category/{c}")
for p in PAGES:
    urls.append(f"{REF}/blog/page/{p}")
# the locale matrix
for loc in LOCALES:
    urls.append(f"{REF}/{loc}/blog")
    for c in CATEGORIES:
        urls.append(f"{REF}/{loc}/blog/category/{c}")
    for p in PAGES:
        urls.append(f"{REF}/{loc}/blog/page/{p}")
# suffix-form spot probes (does the reference localize category slugs?)
for loc in ["zh", "fr", "de"]:
    for c in ["news", "comparisons"]:
        urls.append(f"{REF}/{loc}/blog/category/{c}-{loc}")

print(f"probing {len(urls)} urls (HEAD)...")
results = {}
with cf.ThreadPoolExecutor(max_workers=24) as ex:
    for url, status, err in ex.map(probe, urls):
        results[url.replace(REF, "")] = {"status": status, "err": err}

json.dump(results, open("/tmp/t79-status.json", "w"), indent=1, sort_keys=True)

# summary
ok = sum(1 for v in results.values() if v["status"] == 200)
nf = sum(1 for v in results.values() if v["status"] == 404)
other = sum(1 for v in results.values() if v["status"] not in (200, 404, None))
err = sum(1 for v in results.values() if v["status"] is None)
print(f"200: {ok}  404: {nf}  other: {other}  errors: {err}")

# per-locale matrix
for loc in ["EN"] + LOCALES:
    prefix = "" if loc == "EN" else f"/{loc}"
    cats_ok = [c for c in CATEGORIES
               if results.get(f"{prefix}/blog/category/{c}", {}).get("status") == 200]
    pages_ok = [p for p in PAGES
                if results.get(f"{prefix}/blog/page/{p}", {}).get("status") == 200]
    blog_ok = results.get(f"{prefix}/blog", {}).get("status") == 200
    print(f"{loc}: blog={blog_ok} cats={len(cats_ok)}/{len(CATEGORIES)} "
          f"pages={len(pages_ok)}/{len(PAGES)}"
          + (f" cats_ok={cats_ok}" if 0 < len(cats_ok) < len(CATEGORIES) else ""))
