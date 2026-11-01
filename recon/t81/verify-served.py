#!/usr/bin/env python3
"""t81 served-HTML verification: check the clone's locally-served blog
article pages carry the full t81 link-structure anatomy —
  1. the TOC "Overview" → #article-top first entry
  2. the #article-top anchor on the article header
  3. the six-network share panel (X/LinkedIn/Facebook/Reddit/WhatsApp/Email
     formulas built from the clone's own origin + H1) + the Copy link button
  4. inline prose links rendered as real <a>/<Link> anchors
  5. "Keep reading" image cards on the 24 class-A articles (registry images,
     destination titles, snippet descriptions) and chip rows on class B
  6. share URLs byte-exact against the shareLinks() formulas
"""
import json
import re
import urllib.request

CLONE = "http://127.0.0.1:3111"
ORIGIN = "https://hyper3d-clone.vercel.app"

CLASS_A = [
    "what-is-glb-file",
    "glb-vs-gltf",
    "obj-vs-stl",
    "3d-text-prompt-guide",
    "image-to-stl",
    "hyper3d-review",
]
CLASS_B = [
    "what-is-hyper3d",
    "how-many-credits-does-each-hyper3d-generation-cost",
    "how-to-reset-hyper3d-password",
    "do-hyper3d-credits-expire",
]

fails = 0


def check(cond, label):
    global fails
    if not cond:
        fails += 1
        print(f"  FAIL: {label}")


def get(path):
    with urllib.request.urlopen(CLONE + path, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def enc(s):
    """JS encodeURIComponent parity: alphanumerics plus !*'()*-._~ stay literal."""
    from urllib.parse import quote

    return quote(s, safe="!*'()~")


for slug in CLASS_A + CLASS_B:
    html = get(f"/blog/{slug}")
    klass = "A" if slug in CLASS_A else "B"
    print(f"== /blog/{slug} (class {klass})")

    # 1. TOC Overview first + 2. anchor
    nav = re.search(r'aria-label="On this page".*?</nav>', html, re.S)
    check(nav is not None, "TOC nav present")
    if nav:
        first = re.search(r'<a\s+href="#([^"]+)"[^>]*>\s*<span[^>]*>0\.</span>\s*Overview', nav.group(0))
        check(first is not None and first.group(1) == "article-top", "TOC first entry Overview→#article-top")
    check('id="article-top"' in html, "article-top anchor present")

    # 3. share panel: six formulas + copy button
    panel = re.search(r'aria-label="Share this article".*?</section>', html, re.S)
    check(panel is not None, "share panel present")
    if panel:
        import html as _h
        p = _h.unescape(panel.group(0))
        title_m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        import html as _h
        title = _h.unescape(re.sub(r"<[^>]+>", "", title_m.group(1))).strip() if title_m else ""
        url = f"{ORIGIN}/blog/{slug}"
        expected = [
            f"https://twitter.com/intent/tweet?url={enc(url)}&text={enc(title)}",
            f"https://www.linkedin.com/sharing/share-offsite/?url={enc(url)}",
            f"https://www.facebook.com/sharer/sharer.php?u={enc(url)}",
            f"https://www.reddit.com/submit?url={enc(url)}&title={enc(title)}",
            f"https://api.whatsapp.com/send?text={enc(f'{title} {url}')}",
            f"mailto:?subject={enc(title)}&body={enc(url)}",
        ]
        for exp in expected:
            check(f'href="{exp}"' in p, f"share link {exp[:60]}")
        for label in ["Share on X", "Share on LinkedIn", "Share on Facebook", "Share on Reddit", "Share on WhatsApp", "Share on Email"]:
            check(f'aria-label="{label}"' in p, f"aria-label {label}")
        check("Copy link" in p, "copy link button")
        check('rel="noopener noreferrer nofollow"' in p, "share rel attribute")

    # 4. inline prose links (class A must have >=2, class B >=1)
    main = re.search(r'<main[^>]*>.*?</main>', html, re.S)
    prose_links = []
    if main:
        for pm in re.finditer(r"<p\b[^>]*>.*?</p>", main.group(0), re.S):
            # skip TOC/lede paragraphs: count only anchors inside <p> that are not #
            for am in re.finditer(r'<a\s+[^>]*href="([^"]+)"[^>]*>', pm.group(0)):
                if not am.group(1).startswith("#"):
                    prose_links.append(am.group(1))
    floor = 2 if klass == "A" else 1
    check(len(prose_links) >= floor, f"inline prose links {len(prose_links)} >= {floor}")

    # 5. keep-reading cards vs chips
    if klass == "A":
        check("Keep reading" in html, "Keep reading heading")
        cards = re.findall(r'aria-label="Related blog posts".*?</section>', html, re.S)
        imgs = re.findall(r'<img\s+src="(https://(?:storage\.deemos\.dev|hyper3d\.ai)/[^"]+)"[^>]*alt="([^"]+)"[^>]*width="1200"[^>]*height="675"', html)
        check(len(cards) >= 1, "related cards section")
        check(len(imgs) >= 1, f"registry images on cards ({len(imgs)})")
        check("loading=\"lazy\"" in html, "lazy images")
    else:
        check("Keep reading" not in html, "class B has no Keep reading")
        check(">Related<" in html, "class B keeps the chip row")

print()
print("FAILURES:", fails)
exit(1 if fails else 0)
