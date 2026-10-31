#!/usr/bin/env python3
"""t80 analysis round 2: enumerate the odd hreflang shapes exactly."""
import json
import collections

d = json.load(open("/tmp/t80-hreflang.json"))

# 1. what IS the 2-link set?
print("=== the 2-link sets ===")
two = collections.Counter()
for path, v in d.items():
    if len(v["hreflang"]) == 2:
        two[tuple(x["lang"] for x in v["hreflang"])] += 1
for k, cnt in two.most_common():
    print(f"  {cnt}x: {list(k)}")
ex = next(p for p, v in d.items() if len(v["hreflang"]) == 2)
print("  example:", ex, json.dumps(d[ex]["hreflang"]))

# 2. blog sub-shapes: articles vs index vs pagination vs categories
print("\n=== blog path shapes ===")
blog = {p: v for p, v in d.items() if p == "/blog" or p.startswith("/blog/")}
shapes = collections.Counter()
for p, v in blog.items():
    if p == "/blog":
        shapes["index"] = len(v["hreflang"])
    elif p.startswith("/blog/category/"):
        shapes["category"] = len(v["hreflang"])
    elif p.startswith("/blog/page/"):
        shapes["pagination"] = len(v["hreflang"])
    else:
        shapes["article"] = len(v["hreflang"])
print(f"  index: {shapes['index']} links; category: {shapes['category']}; "
      f"pagination: {shapes['pagination']}; article: {shapes['article']}")
# how many of each
sub = collections.Counter()
for p in blog:
    if p == "/blog":
        sub["index"] += 1
    elif p.startswith("/blog/category/"):
        sub["category"] += 1
    elif p.startswith("/blog/page/"):
        sub["pagination"] += 1
    else:
        sub["article"] += 1
print(f"  counts: {dict(sub)}")

# 3. the 9-link and 12-link blog singletons
print("\n=== odd blog singletons ===")
for p, v in sorted(blog.items()):
    n = len(v["hreflang"])
    if n not in (2, 13):
        print(f"  {p} ({n} links):")
        for x in v["hreflang"]:
            print(f"    {x['lang']:10s} {x['href']}")

# 4. the non-blog odd shapes: event, sub-categories
print("\n=== event + sub-categories ===")
for p, v in sorted(d.items()):
    if p.startswith("/event") or p.startswith("/sub-categories"):
        print(f"  {p} ({len(v['hreflang'])} links):")
        for x in v["hreflang"]:
            print(f"    {x['lang']:10s} {x['href']}")

# 5. among 13-link sets: is the href always https://hyper3d.ai + expected?
#    check one tools page and one help page target list verbatim
print("\n=== full 13-link examples (tools, help, styles) ===")
for want in ["/tools", "/help", "/styles", "/pricing"]:
    if want in d:
        print(f"  {want}:")
        for x in d[want]["hreflang"]:
            print(f"    {x['lang']:10s} {x['href']}")

# 6. the 234 blog-suffixed: verify each target is /{loc}/blog/{slug}-{loc}
#    for ALL 11 locales (not just zh), and the en/x-default bare
print("\n=== blog-suffixed target check (all locales) ===")
bad = 0
checked = 0
for p, v in blog.items():
    if len(v["hreflang"]) != 13:
        continue
    slug = p[len("/blog/"):]
    for x in v["hreflang"]:
        href = x["href"].replace("https://hyper3d.ai", "")
        lang = x["lang"]
        if lang in ("en", "x-default"):
            expect = p
        else:
            loc = "pt" if lang == "pt-BR" else lang
            expect = f"/{loc}/blog/{slug}-{loc}"
        checked += 1
        if href != expect:
            bad += 1
            if bad <= 5:
                print(f"    MISMATCH {p} {lang}: {href} != {expect}")
print(f"  checked {checked} targets, {bad} mismatches")

# 7. the 543 2-link articles: which links exactly, and is there ANY
#    translation signal (e.g. it href exists but others don't)?
print("\n=== 2-link article example(s) ===")
n = 0
for p, v in sorted(blog.items()):
    if len(v["hreflang"]) == 2 and p.startswith("/blog/") and "/category/" not in p and "/page/" not in p:
        print(f"  {p}: {json.dumps(v['hreflang'])}")
        n += 1
        if n >= 3:
            break
