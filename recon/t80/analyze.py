#!/usr/bin/env python3
"""t80 analysis: shape of the hreflang sets across the EN tree."""
import json
import re
import collections

d = json.load(open("/tmp/t80-hreflang.json"))
LOCS = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]


def en_class(path):
    parts = path.strip("/").split("/")
    if len(parts) == 1 and parts[0]:
        return parts[0]
    if not parts[0]:
        return "(root)"
    return parts[0]


# 1. set-size histogram by class
print("=== set size by class ===")
by_class = collections.defaultdict(collections.Counter)
for path, v in d.items():
    by_class[en_class(path)][len(v["hreflang"])] += 1
for cls in sorted(by_class):
    sizes = by_class[cls]
    total = sum(sizes.values())
    desc = ", ".join(f"{k} links:{cnt}" for k, cnt in sorted(sizes.items()))
    print(f"  {cls} ({total}): {desc}")

# 2. lang-key sequence of a full set — check consistency
print("\n=== lang sequence variants (13-link sets) ===")
seqs = collections.Counter()
for path, v in d.items():
    if len(v["hreflang"]) == 13:
        seqs[tuple(x["lang"] for x in v["hreflang"])] += 1
for seq, cnt in seqs.most_common(5):
    print(f"  {cnt}x: {list(seq)}")

# 3. how do the locale targets transform per class?
print("\n=== target shape per class (zh target vs EN path) ===")
shape_by_class = collections.defaultdict(collections.Counter)
for path, v in d.items():
    zh = next((x for x in v["hreflang"] if x["lang"] == "zh"), None)
    if not zh:
        continue
    href = zh["href"].replace("https://hyper3d.ai", "")
    if href == f"/zh{path if path != '/' else ''}":
        shape = "plain-prefix"
    elif re.fullmatch(r"/zh/blog/[^\s]+-zh", href) and path.startswith("/blog/"):
        shape = "blog-suffixed"
    elif re.fullmatch(r"/zh/blog/category/[^\s]+", href) or re.fullmatch(r"/zh/blog/page/\d+", href):
        shape = "category/pagination"
    else:
        shape = f"OTHER:{href}"
    shape_by_class[en_class(path)][shape] += 1
for cls in sorted(shape_by_class):
    print(f"  {cls}: {dict(shape_by_class[cls])}")

# 4. en self-link and x-default shapes
print("\n=== en/x-default shapes ===")
en_shapes = collections.Counter()
xd_shapes = collections.Counter()
for path, v in d.items():
    for x in v["hreflang"]:
        href = x["href"].replace("https://hyper3d.ai", "")
        if x["lang"] == "en":
            en_shapes["self-bare" if href == (path if path != "/" else "/") else f"OTHER:{href}"] += 1
        elif x["lang"] == "x-default":
            xd_shapes["en-bare" if href == (path if path != "/" else "/") else f"OTHER:{href}"] += 1
print("  en:", dict(en_shapes))
print("  x-default:", dict(xd_shapes))

# 5. absolute vs relative hrefs, https host
print("\n=== href form ===")
forms = collections.Counter()
for path, v in d.items():
    for x in v["hreflang"]:
        if x["href"].startswith("https://hyper3d.ai"):
            forms["absolute-https"] += 1
        elif x["href"].startswith("/"):
            forms["relative"] += 1
        else:
            forms[f"OTHER:{x['href'][:40]}"] += 1
print(" ", dict(forms))

# 6. classes with zero hreflang — enumerate exactly
print("\n=== zero-hreflang pages ===")
zero = [p for p, v in d.items() if not v["hreflang"]]
zc = collections.Counter(en_class(p) for p in zero)
print(f"  total {len(zero)}:", dict(zc))
for p in sorted(zero)[:40]:
    print(f"    {p}")
if len(zero) > 40:
    print(f"    ... and {len(zero) - 40} more")
