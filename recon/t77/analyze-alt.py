#!/usr/bin/env python3
"""t77 analysis: og:image:alt vs the pinned title registry — is the alt
derivable (title minus a brand suffix) or independent per-page copy?
"""
import json
import re

titles = {}
src = open("src/lib/reference-titles.ts", encoding="utf-8").read()
body = src[src.index("{") + 1 : src.rindex("}")]
for m in re.finditer(r'^\s*"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)",?\s*$', body, re.MULTILINE):
    p = json.loads('"' + m.group(1) + '"')
    t = json.loads('"' + m.group(2) + '"')
    titles[p] = t

og = json.load(open("/tmp/og-images.json"))["images"]

SUFFIX = " | Hyper3D"
same = strip = other = 0
other_examples = []
for path, rec in og.items():
    t = titles.get(path)
    if t is None:
        continue
    alt = rec.get("alt", "")
    if alt == t:
        same += 1
    elif alt + SUFFIX == t:
        strip += 1
    else:
        other += 1
        if len(other_examples) < 15:
            other_examples.append((path, t, alt))

print(f"alt == title exactly: {same}")
print(f"alt == title minus '{SUFFIX}': {strip}")
print(f"other: {other}")
for p, t, a in other_examples:
    print(f"  {p}\n    title: {t!r}\n    alt  : {a!r}")

# also: do the two og-banner flavors split by family?
banner_webp = [p for p, r in og.items() if r["image"] == "https://hyper3d.ai/assets/og-banner.webp"]
banner_png = [p for p, r in og.items() if r["image"] == "https://storage.deemos.dev/assets/og-banner.png"]
fams = {}
for p in banner_webp:
    fams.setdefault("webp:" + (re.sub(r"^(/[a-z-]{2,5})?/", "/", p.count("/") > 1 and "/" + p.strip("/").split("/")[0 if p.count("/") <= 1 else 1] or ""), re.match(r"^(/[a-z-]{2,5})?(/[^/]+)", p).group(2)), []).append(p)
print("\nbanner.webp families:", {k: len(v) for k, v in sorted(fams.items())})
fams2 = {}
for p in banner_png:
    m = re.match(r"^(/[a-z-]{2,5})?(/[^/]+)", p)
    fams2.setdefault(m.group(2), []).append(p)
print("banner.png families:", {k: len(v) for k, v in sorted(fams2.items())})
