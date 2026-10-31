#!/usr/bin/env python3
"""t77 full recon: probe the reference's og:image for EVERY URL in the
t76 census (7,079 URLs). Captures, per URL, HTML-unescaped:
  - og:image
  - og:image:alt
  - twitter:image
  - twitter:image:alt
  - any og:image:width / og:image:height / og:image:type metas
Output: /tmp/og-images.json {images: {path: {...}}, bad: [...], empty: [...]}
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


def meta_re(name):
    # attribute order varies across pages; match both shapes
    return re.compile(
        r'<meta\s+(?:property="%s"\s+content="([^"]*)"|content="([^"]*)"\s+property="%s")'
        % (name, name),
        re.IGNORECASE,
    )


def meta_re_name(name):
    return re.compile(
        r'<meta\s+(?:name="%s"\s+content="([^"]*)"|content="([^"]*)"\s+name="%s")'
        % (name, name),
        re.IGNORECASE,
    )


OG_IMAGE = meta_re("og:image")
OG_ALT = meta_re("og:image:alt")
OG_W = meta_re("og:image:width")
OG_H = meta_re("og:image:height")
OG_T = meta_re("og:image:type")
TW_IMAGE = meta_re_name("twitter:image")
TW_ALT = meta_re_name("twitter:image:alt")


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
    rec = {
        "image": first_group(OG_IMAGE.search(src)),
        "alt": first_group(OG_ALT.search(src)),
        "tw": first_group(TW_IMAGE.search(src)),
        "tw_alt": first_group(TW_ALT.search(src)),
        "w": first_group(OG_W.search(src)),
        "h": first_group(OG_H.search(src)),
        "type": first_group(OG_T.search(src)),
    }
    for k, v in list(rec.items()):
        if v is not None:
            rec[k] = html.unescape(v)
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

    ok = [r for r in results if r[2] and r[2]["image"]]
    none_img = [r for r in results if r[2] and not r[2]["image"]]
    bad = [r for r in results if r[2] is None]
    print(f"\nOK: {len(ok)} with og:image | NO-IMAGE: {len(none_img)} | BAD: {len(bad)}")

    # distribution analysis
    imgs = {}
    for r in ok:
        imgs.setdefault(r[2]["image"], []).append(r[0])
    print(f"unique og:image URLs: {len(imgs)}")
    top = sorted(imgs.items(), key=lambda kv: -len(kv[1]))[:12]
    for img, pages in top:
        print(f"  {len(pages):5d}  {img}")

    # host analysis
    hosts = {}
    for img, pages in imgs.items():
        m = re.match(r"https?://([^/]+)", img)
        h = m.group(1) if m else "(relative)"
        hosts[h] = hosts.get(h, 0) + len(pages)
    print("hosts:", hosts)

    # og:image vs twitter:image equality
    tw_mism = [r for r in ok if r[2]["tw"] is not None and r[2]["tw"] != r[2]["image"]]
    print(f"twitter:image != og:image: {len(tw_mism)}")
    no_tw = [r for r in ok if r[2]["tw"] is None]
    print(f"og:image but NO twitter:image: {len(no_tw)}")
    alt_mism = [r for r in ok if r[2]["tw_alt"] is not None and r[2]["tw_alt"] != (r[2]["alt"] or "")]
    print(f"twitter:image:alt != og:image:alt: {len(alt_mism)}")

    # alt coverage
    no_alt = [r for r in ok if not r[2]["alt"]]
    print(f"og:image without alt: {len(no_alt)}")

    # dims
    with_dims = [r for r in ok if r[2]["w"] or r[2]["h"] or r[2]["type"]]
    print(f"pages with width/height/type metas: {len(with_dims)}")
    for r in with_dims[:6]:
        print("  DIMS", r[0], r[2]["w"], r[2]["h"], r[2]["type"])

    data = {}
    for r in ok:
        p = r[0].replace(REF, "") or "/"
        data[p] = {
            "image": r[2]["image"],
            **({"alt": r[2]["alt"]} if r[2]["alt"] else {}),
        }
    json.dump(
        {
            "images": data,
            "no_image": [r[0].replace(REF, "") or "/" for r in none_img],
            "bad": [{"url": r[0], "status": r[1]} for r in bad],
        },
        open("/tmp/og-images.json", "w"),
        ensure_ascii=False,
        indent=0,
    )
    print(
        f"wrote /tmp/og-images.json ({len(data)} og:images) in {time.time()-t0:.0f}s"
    )
    for r in bad[:20]:
        print("BAD:", r[0], r[1])
    for r in none_img[:10]:
        print("NO-IMAGE:", r[0])


if __name__ == "__main__":
    main()
