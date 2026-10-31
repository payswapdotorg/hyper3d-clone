#!/usr/bin/env python3
"""t75 full recon: probe the reference's <title> for EVERY URL in the
landing-sitemap tree (all 90 children). Output: /tmp/full-titles.json
mapping pathname -> title (HTML-unescaped), plus coverage stats.
"""
import re
import html
import json
import urllib.request
import concurrent.futures as cf
import time

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}


def fetch(url, timeout=30):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception:
        return None, None


def probe(url):
    status, src = fetch(url)
    if src is None:
        # one retry
        status, src = fetch(url)
    if src is None:
        return (url, status, None, None)
    tm = re.search(r"<title[^>]*>([^<]*)</title>", src)
    ogm = re.search(r'property="og:title"[^>]*content="([^"]*)"', src)
    title = html.unescape(tm.group(1)) if tm else None
    og = html.unescape(ogm.group(1)) if ogm else None
    return (url, status, title, og)


def main():
    t0 = time.time()
    _, idx = fetch(f"{REF}/landing-sitemap-index.xml")
    children = re.findall(r"<loc>([^<]+)</loc>", idx)
    print(f"{len(children)} sitemap children")

    all_urls = []
    with cf.ThreadPoolExecutor(12) as ex:
        for child, sm in zip(children, ex.map(lambda c: fetch(c)[1], children)):
            if not sm:
                print("MISSING CHILD:", child)
                continue
            urls = re.findall(r"<loc>([^<]+)</loc>", sm)
            all_urls += urls
    # dedupe, keep order
    seen, uniq = set(), []
    for u in all_urls:
        if u not in seen:
            seen.add(u)
            uniq.append(u)
    print(f"{len(all_urls)} URLs, {len(uniq)} unique")

    results = []
    with cf.ThreadPoolExecutor(16) as ex:
        futs = {ex.submit(probe, u): u for u in uniq}
        done = 0
        for fut in cf.as_completed(futs):
            results.append(fut.result())
            done += 1
            if done % 500 == 0:
                print(f"  {done}/{len(uniq)} ({time.time()-t0:.0f}s)")

    ok = [r for r in results if r[2]]
    bad = [r for r in results if not r[2]]
    print(f"\nOK: {len(ok)} with titles | BAD: {len(bad)} (no title / non-200)")

    # suffix rule verification on a sample
    suffix_mismatch = [
        r for r in ok[:2000]
        if r[3] is not None and r[2].endswith(" | Hyper3D") and r[3] != r[2][: -len(" | Hyper3D")]
    ]
    print(f"og-suffix rule mismatches in first 2000: {len(suffix_mismatch)}")
    for r in suffix_mismatch[:5]:
        print("  ", r[0], "|", repr(r[2]), "|", repr(r[3]))

    data = {r[0].replace(REF, "") or "/": r[2] for r in ok}
    json.dump(
        {"titles": data, "bad": [{"url": r[0], "status": r[1]} for r in bad]},
        open("/tmp/full-titles.json", "w"),
        ensure_ascii=False,
        indent=0,
    )
    print(f"wrote /tmp/full-titles.json ({len(data)} titles) in {time.time()-t0:.0f}s")
    for r in bad[:20]:
        print("BAD:", r[0], r[1])


if __name__ == "__main__":
    main()
