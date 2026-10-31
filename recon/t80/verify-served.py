#!/usr/bin/env python3
"""t80 served-HTML verification: compare the clone's emitted hreflang
<link> tags against the reference's own probe sets, per route class.
Hosts differ by the established honest-canonical contract (clone origin),
path shapes must be byte-identical."""
import re
import json

CLONE_ORIGIN = "https://hyper3d-clone.vercel.app"
REF = "https://hyper3d.ai"
probe = json.load(open("/tmp/t80-hreflang.json"))

PAGES = {
    "/": "/tmp/t80-home.html",
    "/pricing": "/tmp/t80-pricing.html",
    "/tools/converter": "/tmp/t80-tools.html",
    "/blog/2d-image-to-3d-model": "/tmp/t80-blogfull.html",
    "/blog/free-stl-files-for-3d-printing": "/tmp/t80-blog12.html",
    "/blog/use-bang-and-partial-edit": "/tmp/t80-blog9.html",
    "/blog/10-essential-tips-for-beginners-in-antimatter-dimensions-your-path-to-success": "/tmp/t80-blog2.html",
    "/sub-categories/nsfw-content": "/tmp/t80-subcat.html",
    "/event/chroma-awards": "/tmp/t80-event.html",
    "/blog/category/news": "/tmp/t80-cat.html",
    "/3d-prompts/2": "/tmp/t80-prompt.html",
    "/workspace/omnicraft": "/tmp/t80-ws.html",
    "/help/articles/use-bang-and-partial-edit": "/tmp/t80-helpodd.html",
    "/blog/page/2": "/tmp/t80-page2.html",
}

fails = 0
for path, f in PAGES.items():
    body = open(f).read()
    head = body.split("</head>", 1)[0]
    got = []
    for tag in re.findall(r"<link\s+[^>]*>", head):
        lang = re.search(r'hrefLang="([^"]+)"', tag, re.I)
        href = re.search(r'href="([^"]+)"', tag)
        if lang and href and "alternate" in tag:
            got.append((lang.group(1), href.group(1)))
    # expected from the probe (t79 covers category/pagination; t80 probe
    # covers the rest — pagination expectation is the plain page-for-page set)
    if path in probe:
        want = [(x["lang"], x["href"].replace(REF, CLONE_ORIGIN))
                for x in probe[path]["hreflang"]]
    elif path == "/blog/page/2":
        # t79: 13-link set, page-for-page
        want = [("en", f"{CLONE_ORIGIN}/blog/page/2")]
        for loc in ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]:
            want.append((("pt-BR" if loc == "pt" else loc), f"{CLONE_ORIGIN}/{loc}/blog/page/2"))
        want.append(("x-default", f"{CLONE_ORIGIN}/blog/page/2"))
    else:
        want = []
    ok = got == want
    status = "MATCH " if ok else "DIFF  "
    if not ok:
        fails += 1
    print(f"{status}{path}: clone {len(got)} links, reference {len(want)} links")
    if not ok:
        for i in range(max(len(got), len(want))):
            g = got[i] if i < len(got) else None
            w = want[i] if i < len(want) else None
            if g != w:
                print(f"    [{i}] clone={g} reference={w}")

print()
print("FAILURES:", fails)
