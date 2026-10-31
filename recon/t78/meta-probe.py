#!/usr/bin/env python3
"""t78 full recon: probe the reference's remaining head dimensions for
EVERY URL in the census (7,079 URLs):
  - meta robots
  - meta facebook-domain-verification
  - og:type (to correlate the article namespace)
  - article:published_time / article:modified_time / article:author
    (plus any other article:* metas, e.g. section/tag)
  - <link rel="alternate" type="application/rss+xml"> presence
Output: /tmp/t78-metas.json
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


def attr_re(attr):
    # attribute order varies across pages; match both shapes
    return re.compile(
        r'<meta\s+(?:name="%s"\s+content="([^"]*)"|content="([^"]*)"\s+name="%s")'
        % (attr, attr),
        re.IGNORECASE,
    )


def prop_re(prop):
    return re.compile(
        r'<meta\s+(?:property="%s"\s+content="([^"]*)"|content="([^"]*)"\s+property="%s")'
        % (prop, prop),
        re.IGNORECASE,
    )


ROBOTS = attr_re("robots")
FB = attr_re("facebook-domain-verification")
OG_TYPE = prop_re("og:type")
ARTICLE_ANY = re.compile(
    r'<meta\s+(?:property="(article:[^"]+)"\s+content="([^"]*)"'
    r'|content="([^"]*)"\s+property="(article:[^"]+)")',
    re.IGNORECASE,
)
RSS_LINK = re.compile(
    r'<link\s+[^>]*type="application/rss\+xml"[^>]*>', re.IGNORECASE
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
        status, src = fetch(url)
    if src is None:
        return (url, status, None)
    head = src[: src.find("</head>")] if "</head>" in src else src
    rec = {
        "robots": first_group(ROBOTS.search(head)),
        "fb": first_group(FB.search(head)),
        "og_type": first_group(OG_TYPE.search(head)),
        "article": {},
        "rss": bool(RSS_LINK.search(head)),
    }
    for m in ARTICLE_ANY.finditer(head):
        prop = m.group(1) or m.group(4)
        val = html.unescape(m.group(2) if m.group(2) is not None else m.group(3))
        rec["article"][prop] = val
    for k in ("robots", "fb", "og_type"):
        if rec[k] is not None:
            rec[k] = html.unescape(rec[k])
    return (url, status, rec)


def main():
    t0 = time.time()
    urls = json.load(open("/tmp/t77-urls.json"))
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
    bad = [r for r in results if r[2] is None]

    # robots distribution
    from collections import Counter

    robots_c = Counter(r[2]["robots"] for r in ok)
    print(f"\nrobots values: {dict(robots_c)}")
    fb_c = Counter(r[2]["fb"] for r in ok)
    print(f"fb-verify values: {dict(fb_c)}")
    ogtype_c = Counter(r[2]["og_type"] for r in ok)
    print(f"og:type values: {dict(ogtype_c)}")

    # article namespace
    art = [r for r in ok if r[2]["article"]]
    print(f"\npages with article:* metas: {len(art)}")
    art_props = Counter()
    for r in art:
        for p in r[2]["article"]:
            art_props[p] += 1
    print(f"article props: {dict(art_props)}")
    # which families
    fams = Counter()
    for r in art:
        p = r[0].replace(REF, "") or "/"
        m = re.match(r"^(/[a-z]{2}(?:-[a-z]{2})?)?(/[^/]+)", p)
        fams[m.group(2) if m else p] += 1
    print(f"article families: {dict(fams)}")
    # do all og:type=article pages have article metas? cross-tab
    article_type_no_art = [r for r in ok if r[2]["og_type"] == "article" and not r[2]["article"]]
    print(f"og:type=article WITHOUT article metas: {len(article_type_no_art)}")
    for r in article_type_no_art[:8]:
        print("   ", r[0].replace(REF, ""))
    # author values
    auth_c = Counter(r[2]["article"].get("article:author") for r in art)
    print(f"article:author values: {dict(auth_c)}")
    mod_c = Counter(r[2]["article"].get("article:modified_time") for r in art)
    print(f"article:modified_time distinct: {len(mod_c)}; top: {dict(list(mod_c.items())[:3])}")
    pub = [r[2]["article"].get("article:published_time") for r in art if r[2]["article"].get("article:published_time")]
    print(f"article:published_time distinct: {len(set(pub))} of {len(pub)}")
    # rss link
    rss = [r for r in ok if r[2]["rss"]]
    print(f"\npages with rss alternate link: {len(rss)}")
    rss_fams = Counter()
    for r in rss:
        p = r[0].replace(REF, "") or "/"
        m = re.match(r"^(/[a-z]{2}(?:-[a-z]{2})?)?(/[^/]+)", p)
        rss_fams[m.group(2) if m else p] += 1
    print(f"rss families: {dict(rss_fams)}")
    for r in rss[:5]:
        print("   ", r[0].replace(REF, ""))

    data = {}
    for r in ok:
        p = r[0].replace(REF, "") or "/"
        rec = r[2]
        entry = {}
        if rec["robots"] is not None:
            entry["robots"] = rec["robots"]
        if rec["fb"] is not None:
            entry["fb"] = rec["fb"]
        if rec["og_type"] is not None:
            entry["og_type"] = rec["og_type"]
        if rec["article"]:
            entry["article"] = rec["article"]
        if rec["rss"]:
            entry["rss"] = True
        data[p] = entry
    json.dump(
        {"metas": data, "bad": [{"url": r[0], "status": r[1]} for r in bad]},
        open("/tmp/t78-metas.json", "w"),
        ensure_ascii=False,
        indent=0,
    )
    print(
        f"\nwrote /tmp/t78-metas.json ({len(data)} pages, {len(bad)} bad) "
        f"in {time.time()-t0:.0f}s"
    )
    for r in bad[:20]:
        print("BAD:", r[0], r[1])


if __name__ == "__main__":
    main()
