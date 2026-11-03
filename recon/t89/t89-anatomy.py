#!/usr/bin/env python3
"""t89 anatomy: reference blog article h2/h3 structure over a stratified sample,
to learn whether the reference's 778-article corpus is itself templated.
Also dumps the clone's current registry field shape for one article."""
import re, html, json, urllib.request, concurrent.futures as cf

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

# stratified: shortest + longest + middle of the alphabetical EN blog list
import glob
locs = []
for f in glob.glob("public/landing-sitemap-blog-en.xml"):
    raw = open(f, encoding="utf-8").read()
    locs = [re.sub(r"^https?://[^/]+", "", m) for m in re.findall(r"<loc>([^<]+)</loc>", raw)]
arts = sorted(p for p in locs if p != "/blog")
sample = (arts[:4] + arts[len(arts)//2 - 2:len(arts)//2 + 2] + arts[-4:]
          + ["/blog/what-is-hyper3d", "/blog/image-to-3d", "/blog/rodin-gen-2",
             "/blog/stl-converter", "/blog/upcoming-dlcs-for-halls-of-torment-what-players-can-expect"])
sample = sorted(set(sample))

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", errors="replace")

def headings(doc):
    out = []
    for m in re.finditer(r"<(h[23])[^>]*>(.*?)</\1>", doc, flags=re.S | re.I):
        txt = re.sub(r"<[^>]+>", " ", m.group(2))
        txt = html.unescape(re.sub(r"\s+", " ", txt)).strip()
        if txt:
            out.append((m.group(1).lower(), txt))
    return out

def words(doc):
    s = re.sub(r"<(script|style|noscript)[^>]*>.*?</\1>", " ", doc, flags=re.S | re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(re.findall(r"[A-Za-z][A-Za-z\-’']+", html.unescape(s)))

with cf.ThreadPoolExecutor(max_workers=11) as ex:
    docs = dict(zip(sample, ex.map(fetch, [REF + p for p in sample])))

for p in sample:
    h = headings(docs[p])
    h2 = [t for tag, t in h if tag == "h2"]
    h3 = [t for tag, t in h if tag == "h3"]
    print(f"\n== {p}  ({words(docs[p])} words)")
    print(f"   h2 x{len(h2)}: " + " | ".join(h2[:10]))
    if len(h2) > 10:
        print(f"   ... +{len(h2)-10} more h2: " + " | ".join(h2[10:]))
    if h3:
        print(f"   h3 x{len(h3)}: " + " | ".join(h3[:8]) + (" ..." if len(h3) > 8 else ""))

# clone side: what the registry holds for one article
print("\n--- clone registry probe (blog-registry-data.ts head) ---")
src = open("src/lib/blog-registry-data.ts", encoding="utf-8").read()
print(src[:1400])
