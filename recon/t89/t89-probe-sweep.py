#!/usr/bin/env python3
"""t89 probe: WHOLE-SITE density sweep, reference vs clone (post-t88).

Aggregates every EN route from public/landing-sitemap-*-en.xml, fetches both
sides, computes visible-word ratio per route, flags THIN < 0.55, and rolls
the results up per family so the remaining thin surfaces name themselves.
Reference paths are identity-mapped (verified: /sub-categories leaves 200 at
the reference, bare /sub-categories 404s there — index route skipped).
Output: stdout table (worst 60 + per-family rollup) + recon/t89/sweep-en.json
"""
import re, html, json, glob, urllib.request, concurrent.futures as cf

CLONE = "http://127.0.0.1:3112"
REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
OUT = "recon/t89/sweep-en.json"

def routes_from_sitemaps():
    seen, order = set(), []
    for f in sorted(glob.glob("public/landing-sitemap-*-en.xml")):
        raw = open(f, encoding="utf-8").read()
        for loc in re.findall(r"<loc>([^<]+)</loc>", raw):
            path = re.sub(r"^https?://[^/]+", "", loc) or "/"
            if path not in seen:
                seen.add(path)
                order.append(path)
    # reference has no /sub-categories index — exclude it from ratio math
    order = [p for p in order if p != "/sub-categories"]
    return order

def family(path):
    if path == "/":
        return "home"
    for pref in ("/blog/", "/help/", "/features/", "/legal/", "/styles/",
                 "/use-cases/", "/tools/", "/sub-categories/"):
        if path.startswith(pref):
            return pref.rstrip("/")
    if path == "/blog":
        return "blog"
    return "static"

def visible_words(raw: bytes) -> int:
    s = raw.decode("utf-8", errors="replace")
    s = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return len(re.findall(r"[A-Za-z][A-Za-z\-’']+", s))

def fetch(url, tries=2):
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.status, r.read()
        except Exception as e:
            code = getattr(e, "code", 0)
            if code in (404, 402, 403):
                return code, b""
    return 0, b""

ROUTES = routes_from_sitemaps()
rows = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = {ex.submit(fetch, REF + r): ("ref", r) for r in ROUTES}
    futs.update({ex.submit(fetch, CLONE + r): ("clone", r) for r in ROUTES})
    done = 0
    for f in cf.as_completed(futs):
        side, route = futs[f]
        try:
            st, body = f.result()
            rows[(side, route)] = (st, visible_words(body) if st == 200 else 0)
        except Exception:
            rows[(side, route)] = (0, 0)
        done += 1
        if done % 400 == 0:
            print(f"  ... {done}/{len(futs)} fetches", flush=True)

results = []
for r in ROUTES:
    rs, rw = rows.get(("ref", r), (0, 0))
    cs, cw = rows.get(("clone", r), (0, 0))
    ratio = round(cw / rw, 2) if (rs == 200 and cs == 200 and rw) else None
    results.append({"route": r, "family": family(r), "ref_status": rs,
                    "clone_status": cs, "ref_words": rw, "clone_words": cw,
                    "ratio": ratio, "thin": bool(ratio is not None and ratio < 0.55)})

fam = {}
for x in results:
    f = fam.setdefault(x["family"], {"n": 0, "thin": 0, "sum_ratio": 0.0,
                                     "cnt_ratio": 0, "missing_ref": 0, "missing_clone": 0})
    f["n"] += 1
    if x["ratio"] is None:
        if x["ref_status"] != 200:
            f["missing_ref"] += 1
        if x["clone_status"] != 200:
            f["missing_clone"] += 1
        continue
    f["sum_ratio"] += x["ratio"]
    f["cnt_ratio"] += 1
    if x["thin"]:
        f["thin"] += 1

print(f"\n{'family':16} {'n':>5} {'thin':>6} {'avg':>6}  {'ref404':>6} {'clone404':>8}")
for f in sorted(fam, key=lambda k: -fam[k]["thin"]):
    d = fam[f]
    avg = d["sum_ratio"] / d["cnt_ratio"] if d["cnt_ratio"] else 0
    print(f"{f:16} {d['n']:>5} {d['thin']:>6} {avg:>6.2f}  {d['missing_ref']:>6} {d['missing_clone']:>8}")

thin_rows = [x for x in results if x["thin"]]
thin_rows.sort(key=lambda x: x["ratio"])
print(f"\nTHIN routes (ratio < 0.55): {len(thin_rows)}/{len(results)}")
print(f"{'route':62} {'ref':>5} {'clone':>5}  ratio")
for x in thin_rows[:60]:
    print(f"{x['route']:62} {x['ref_words']:>5} {x['clone_words']:>5}  {x['ratio']:5.2f}")
if len(thin_rows) > 60:
    print(f"  ... {len(thin_rows) - 60} more thin routes (see {OUT})")

json.dump({"generated": "2026-11-03", "results": results}, open(OUT, "w"), indent=1)
print(f"\n[ok] full results -> {OUT}")
