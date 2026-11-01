#!/usr/bin/env python3
"""t84 served-HTML verification: the blog index's reference anatomy + the
tools tree's compact converter aliases, checked against the locally served
standalone build (recon/t84/notes.md):

  1. EN /blog: the reference's index anatomy — 4 featured h2 cards, the
     twelve category h2 sections in the registry's order with their h3
     cards, the 12-row All Articles cap, the Categories sidebar, the
     honest Subscribe block (RSS link, never a dead form), the full
     catalog honesty layer below
  2. the locale indexes (zh + de): the same anatomy with localized
     section names, the pipe-form titles (博客 | Hyper3D / Blog | Hyper3D),
     locale-suffixed card links, the honest subscribe in the locale's
     own language
  3. the alias class: compact converter aliases 301 to their canonical
     pair pages, the reference's own 11 gaps 404 (with live canonicals),
     the /tools/image-to-3d cross-surface alias
  4. regressions: the pagination page, the category hub, the RSS feed
     still serve after the index rebuild
"""
import re
import urllib.request
import urllib.error

CLONE = "http://127.0.0.1:3111"

fails = 0
checks = 0


def check(cond, label):
    global fails, checks
    checks += 1
    if not cond:
        fails += 1
        print(f"  FAIL  {label}")


def get(path):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t84-verify"})
    try:
        with opener.open(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location", ""), e.read().decode("utf-8", "replace")


def get200(path):
    opener = urllib.request.build_opener()
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t84-verify"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", "replace")


print("1. EN /blog — the reference's index anatomy")

status, html = get200("/blog")
check(status == 200, f"/blog 200 (got {status})")

# the 4 featured h2 cards — this clone's 4 newest written articles
for href in (
    "/blog/create-3d-models-from-text-with-rodin",
    "/blog/image-to-3d",
    "/blog/what-is-hyper3d",
    "/blog/create-3d-models-from-images-with-rodin",
):
    check(f'href="{href}"' in html, f"/blog: featured card {href}")

# the twelve category sections, exact registry order, as h2 headings
order = [
    "News", "Comparisons", "XR", "AI Texturing", "Game Development",
    "Prompt Guide", "Text to 3D", "Image to 3D", "Insights",
    "3D Printing", "Workflow", "Animation",
]
positions = []
for name in order:
    m = re.search(r"<h2[^>]*>\s*<a[^>]*>" + re.escape(name) + r"</a>", html)
    check(m is not None, f"/blog: h2 section {name}")
    positions.append(m.start() if m else -1)
check(positions == sorted(positions), "/blog: the twelve sections in registry order")

# the reference's News trio (its own news posts, cataloged not reproduced)
for href in (
    "/blog/deemos-tech-launches-hyper3d-rodin",
    "/blog/hyper3d-ai-secures-commercial-license-for-3d-assets-from-shutterstock",
    "/blog/hyper3d-cambridge-arcade-ai-hackathon-2026",
):
    check(f'href="{href}"' in html, f"/blog: News card {href}")

# 35 section cards (12x3 minus prompt-guide's honest 2), each an h3
h3_cards = re.findall(r"<h3[^>]*class=", html)
check(len(h3_cards) >= 36, f"/blog: card h3 count (got {len(h3_cards)})")

# cards carry the og-registry CDN images
check(
    len(re.findall(r'src="https://storage\.deemos\.dev', html)) >= 25,
    "/blog: cards carry the t77 og-registry images",
)

# the sidebar: Categories (12 links) + the honest subscribe
cats = set(re.findall(r'href="(/blog/category/[a-z0-9-]+)"', html))
check(len(cats) == 12, f"/blog: sidebar + sections carry the 12 category links (got {len(cats)})")
check("Subscribe To Updates" in html, "/blog: the subscribe block heading")
check('href="/blog/rss.xml"' in html, "/blog: the honest RSS subscribe link")
check("<form" not in html and "<input" not in html, "/blog: no dead subscribe form")

# the All Articles 12-row cap + the full-catalog layer below it
check("All articles" in html, "/blog: the All articles heading")
check("The full catalog" in html, "/blog: the full-catalog honesty layer")
m_all = html.find("All articles")
m_cat = html.find("The full catalog")
check(0 <= m_all < m_cat, "/blog: All articles precedes the full catalog")

# the 12-row cap: the catalog's first 12 (written newest first)
rows = re.findall(r'href="(/blog/[a-z0-9-]+)"', html[m_all:m_cat])
uniq = list(dict.fromkeys(rows))
check(len(uniq) == 12, f"/blog: All articles caps at 12 links (got {len(uniq)})")

print("2. the locale indexes — zh + de")

status, html = get200("/zh/blog")
check(status == 200, f"/zh/blog 200 (got {status})")
check("<title>博客 | Hyper3D</title>" in html, "/zh/blog: the pipe-form title")
for name in ("新闻", "对比评测", "XR", "AI 纹理", "游戏开发", "提示词指南",
              "文本生成 3D", "图片生成 3D", "洞察", "3D 打印", "工作流", "动画"):
    check(f">{name}</a>" in html or f">{name}<" in html, f"/zh/blog: section {name}")
zh_links = set(re.findall(r'href="(/zh/blog/[a-z0-9-]+)"', html))
check(len(zh_links) >= 30, f"/zh/blog: locale article links (got {len(zh_links)})")
zh_cats = set(re.findall(r'href="(/zh/blog/category/[a-z0-9-]+)"', html))
check(len(zh_cats) == 12, f"/zh/blog: the 12 category links (got {len(zh_cats)})")
check("订阅更新" in html, "/zh/blog: the localized subscribe heading")
check('href="/blog/rss.xml"' in html, "/zh/blog: the RSS subscribe link")
check("<form" not in html, "/zh/blog: no dead form")
check('href="/blog"' in html, "/zh/blog: the EN-original browse link")
check("全部文章" in html, "/zh/blog: the localized All Articles heading")

status, html = get200("/de/blog")
check(status == 200, f"/de/blog 200 (got {status})")
check("<title>Blog | Hyper3D</title>" in html, "/de/blog: the pipe-form title")
for name in ("News", "Vergleiche", "XR", "KI-Texturierung", "Spieleentwicklung",
             "Prompt-Leitfaden", "Text zu 3D", "Bild zu 3D", "Einblicke",
             "3D-Druck", "Workflow", "Animation"):
    check(f">{name}</a>" in html or f">{name}<" in html, f"/de/blog: section {name}")
de_links = set(re.findall(r'href="(/de/blog/[a-z0-9-]+)"', html))
check(len(de_links) >= 30, f"/de/blog: locale article links (got {len(de_links)})")
check("Updates abonnieren" in html, "/de/blog: the localized subscribe heading")
check("<form" not in html, "/de/blog: no dead form")

print("3. the compact converter aliases (301) + the reference's 11 gaps (404)")

for alias, canonical in (
    ("/tools/stl-to-obj", "/tools/converter/stl/to/obj"),
    ("/tools/fbx-to-obj", "/tools/converter/fbx/to/obj"),
    ("/tools/obj-to-stl", "/tools/converter/obj/to/stl"),
    ("/tools/glb-to-obj", "/tools/converter/glb/to/obj"),
    ("/tools/fbx-to-gltf", "/tools/converter/fbx/to/gltf"),
    ("/tools/ply-to-stl", "/tools/converter/ply/to/stl"),
    ("/tools/usdz-to-glb", "/tools/converter/usdz/to/glb"),
    ("/tools/3ds-to-obj", "/tools/converter/3ds/to/obj"),
    ("/tools/dae-to-obj", "/tools/converter/dae/to/obj"),
    ("/tools/blend-to-fbx", "/tools/converter/blend/to/fbx"),
):
    status, loc, _ = get(alias)
    check(status == 301, f"{alias}: 301 (got {status})")
    check(loc == canonical, f"{alias}: Location {canonical} (got {loc})")

# the cross-surface alias
status, loc, _ = get("/tools/image-to-3d")
check(status == 301, f"/tools/image-to-3d: 301 (got {status})")
check(loc == "/features/image-to-3d", f"/tools/image-to-3d: Location /features/image-to-3d (got {loc})")

# the reference's own 11 gaps — 404 there, 404 here (canonicals live)
for gap, canonical in (
    ("/tools/blend-to-dae", "/tools/converter/blend/to/dae"),
    ("/tools/blend-to-glb", "/tools/converter/blend/to/glb"),
    ("/tools/off-to-glb", "/tools/converter/off/to/glb"),
    ("/tools/off-to-stl", "/tools/converter/off/to/stl"),
    ("/tools/x-to-fbx", "/tools/converter/x/to/fbx"),
    ("/tools/x-to-obj", "/tools/converter/x/to/obj"),
):
    status, loc, _ = get(gap)
    check(status == 404, f"{gap}: 404 like the reference (got {status})")
    status, html = get200(canonical)
    check(status == 200, f"{canonical}: the canonical page is live (got {status})")

print("4. regressions — the pagination, category hub, and RSS survive")

status, html = get200("/blog/page/2")
check(status == 200, f"/blog/page/2 200 (got {status})")
check("All articles" in html, "/blog/page/2: the catalog list intact")

status, html = get200("/blog/category/news")
check(status == 200, f"/blog/category/news 200 (got {status})")

status, html = get200("/blog/rss.xml")
check(status == 200, f"/blog/rss.xml 200 (got {status})")
check("<rss" in html or "<?xml" in html, "/blog/rss.xml: still the feed")

print()
print(f"t84 verify-served: {checks - fails}/{checks} checks passed")
if fails:
    print(f"FAILURES: {fails}")
    raise SystemExit(1)
print("ALL GREEN")
