#!/usr/bin/env python3
"""t76 full recon: probe the reference's meta description for EVERY URL
in the t75 census (the landing-sitemap tree minus the 405, plus the
twelve /tools indexes — 7,079 URLs). Output: /tmp/full-descriptions.json
mapping pathname -> meta description (HTML-unescaped), plus og:description
for the equality audit and coverage stats.
"""
import re
import html
import json
import urllib.request
import urllib.error
import concurrent.futures as cf
import time

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}

# attribute order varies across pages; match both shapes
META_RE = re.compile(
    r'<meta\s+(?:name="description"\s+content="([^"]*)"|content="([^"]*)"\s+name="description")',
    re.IGNORECASE,
)
OG_RE = re.compile(
    r'<meta\s+(?:property="og:description"\s+content="([^"]*)"|content="([^"]*)"\s+property="og:description")',
    re.IGNORECASE,
)


def fetch(url, timeout=30):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception:
        return None, None


def first_group(m):
    if m is None:
        return None
    for g in m.groups():
        if g is not None:
            return g
    return None


def probe(url):
    status, src = fetch(url)
    if src is None:
        # one retry
        status, src = fetch(url)
    if src is None:
        return (url, status, None, None)
    dm = first_group(META_RE.search(src))
    odm = first_group(OG_RE.search(src))
    desc = html.unescape(dm) if dm is not None else None
    ogd = html.unescape(odm) if odm is not None else None
    return (url, status, desc, ogd)


def main():
    t0 = time.time()
    urls = json.load(open("/tmp/t76-urls.json"))
    print(f"{len(urls)} URLs to probe", flush=True)

    results = []
    with cf.ThreadPoolExecutor(24) as ex:
        futs = {ex.submit(probe, u): u for u in urls}
        done = 0
        for fut in cf.as_completed(futs):
            results.append(fut.result())
            done += 1
            if done % 500 == 0:
                print(f"  {done}/{len(urls)} ({time.time()-t0:.0f}s)", flush=True)

    ok = [r for r in results if r[2]]
    empty = [r for r in results if r[2] == ""]
    bad = [r for r in results if r[2] is None]
    print(f"\nOK: {len(ok)} with descriptions | EMPTY: {len(empty)} | BAD: {len(bad)}")

    # og == meta equality audit
    mism = [r for r in ok if r[3] is not None and r[3] != r[2]]
    print(f"og:description != meta description: {len(mism)}")
    for r in mism[:8]:
        print("  ", r[0])
        print("     meta:", repr(r[2][:120]))
        print("     og  :", repr(r[3][:120]))
    noog = [r for r in ok if r[3] is None]
    print(f"pages with meta but NO og:description: {len(noog)}")
    for r in noog[:8]:
        print("  ", r[0])

    # length stats
    lens = sorted(len(r[2]) for r in ok)
    if lens:
        print(
            f"\nlength min/median/max: {lens[0]}/{lens[len(lens)//2]}/{lens[-1]}; "
            f">180 chars: {sum(1 for l in lens if l > 180)}"
        )
        for r in sorted(ok, key=lambda x: -len(x[2]))[:5]:
            print("  LONG", r[0], len(r[2]))

    data = {r[0].replace(REF, "") or "/": r[2] for r in ok}
    json.dump(
        {
            "descriptions": data,
            "bad": [{"url": r[0], "status": r[1]} for r in bad],
            "empty": [r[0] for r in empty],
        },
        open("/tmp/full-descriptions.json", "w"),
        ensure_ascii=False,
        indent=0,
    )
    print(
        f"wrote /tmp/full-descriptions.json ({len(data)} descriptions) "
        f"in {time.time()-t0:.0f}s"
    )
    for r in bad[:20]:
        print("BAD:", r[0], r[1])


if __name__ == "__main__":
    main()
