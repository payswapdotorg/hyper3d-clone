#!/usr/bin/env python3
"""t83 served-HTML verification: check the clone's locally-served
standalone build carries the two (plus one bare) head shapes against the
reference's probed chrome matrix (recon/t83/notes.md):

  1. Shape A marketing pages: plain viewport, the single webp icon, the
     storage.deemos.dev hint pair, the Google-Fonts quartet (head
     stylesheet + body noscript fallback), and NONE of the workspace-only
     metas (keywords/theme-color/notranslate/manifest/apple-touch-icon)
  2. the blog family (EN + locale): storage hints, ZERO font links
     anywhere in the document (head, preloads, Flight payload)
  3. Shape B workspace shell: locked viewport, theme-color #000000,
     notranslate, the ico/32/16 + apple + manifest icon set,
     file.hyper3d.com hints, og:title-only, NO canonical/hreflang,
     no fonts, no storage hints
  4. the 404: canonical /404, the 13-link hrefLang set (x-default last),
     og+twitter cards on the og-banner fallback, robots, NO chrome links
     (the documented Flight-payload exclusion)
  5. Shape C content-preview: bare head — no hints, no fonts, robots
     noindex/nofollow, the inherited webp icon
  6. the icon files at their well-known paths (sizes pinned)

Served-serialization notes (React/Next 16.1.3, found on this build):
alternate links serialize the camelCase `hrefLang` attribute; crossorigin
serializes as crossorigin="anonymous"; the font stylesheet hoists into
<head> with data-precedence while the <noscript> fallback stays at the
component's body position; the viewport serves initial-scale=1 where the
reference hand-sets 1.0 (framework artifact, documented).
"""
import re
import urllib.request
import urllib.error

CLONE = "http://127.0.0.1:3111"

GOOGLE_FONTS_URL = (
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400"
    "&amp;family=Inter:wght@300;400;500;600&amp;family=Poppins"
    ":wght@400;500;600;700;800&amp;display=swap"
)

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
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t83-verify"})
    try:
        with opener.open(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def head_body(html):
    parts = html.split("</head>")
    return parts[0], parts[1] if len(parts) > 1 else ""


MARKETING = [
    "/", "/features", "/help", "/pricing", "/tools", "/use-cases",
    "/legal", "/styles", "/switch", "/3d-prompts",
    "/event/chroma-awards", "/sub-categories/dark-fantasy",
    "/zh", "/de", "/pt", "/ar",
]

BLOG = [
    "/blog", "/blog/page/2", "/blog/category/news",
    "/blog/2d-image-to-3d-model",
    "/zh/blog", "/zh/blog/page/2", "/zh/blog/category/news",
    "/zh/blog/2d-image-to-3d-model-zh",
]

WORKSPACE = [
    "/workspace", "/workspace/rodin", "/workspace/imageto3d",
    "/workspace/login", "/workspace/api-dashboard",
]


def check_marketing_chrome(path):
    status, html = get(path)
    head, body = head_body(html)
    p = path if path != "/" else "(home)"
    check(status == 200, f"{p}: 200 (got {status})")

    # the plain viewport (reference hand-sets 1.0; Next renders 1 — the
    # two-char framework artifact documented in recon/t83)
    check(
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>' in head,
        f"{p}: plain viewport",
    )

    # ONE icon link — the webp favicon, and nothing else
    icons = re.findall(r'<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>', head)
    check(
        icons == ['<link rel="icon" href="/favicon-32x32.webp" type="image/webp" sizes="32x32"/>'],
        f"{p}: single webp icon link (got {icons})",
    )

    # the storage CDN hint pair
    check(
        '<link rel="preconnect" href="https://storage.deemos.dev" crossorigin="anonymous"/>' in head,
        f"{p}: storage preconnect with crossorigin",
    )
    check(
        '<link rel="dns-prefetch" href="https://storage.deemos.dev"/>' in head,
        f"{p}: storage dns-prefetch",
    )

    # the font quartet: two preconnects + the head stylesheet + the
    # body-level noscript fallback (React cannot hoist <noscript>)
    check(
        '<link rel="preconnect" href="https://fonts.googleapis.com"/>' in head,
        f"{p}: googleapis preconnect",
    )
    check(
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>' in head,
        f"{p}: gstatic preconnect with crossorigin",
    )
    check(
        f'<link rel="stylesheet" href="{GOOGLE_FONTS_URL}" data-precedence="google-fonts"/>' in head,
        f"{p}: the font stylesheet in head",
    )
    check(
        f'<noscript><link rel="stylesheet" href="{GOOGLE_FONTS_URL}"/></noscript>' in body,
        f"{p}: the noscript font fallback in body",
    )

    # the workspace-only metas: all censused absent on Astro pages
    for absent, label in (
        ("theme-color", "theme-color"),
        ('name="google"', "notranslate"),
        ('name="keywords"', "keywords"),
        ("apple-touch-icon", "apple-touch-icon"),
        ('rel="manifest"', "manifest link"),
    ):
        check(absent not in head, f"{p}: no {label}")


def check_blog_chrome(path):
    status, html = get(path)
    head, body = head_body(html)
    check(status == 200, f"{path}: 200 (got {status})")
    check(
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>' in head,
        f"{path}: plain viewport",
    )
    check(
        '<link rel="icon" href="/favicon-32x32.webp" type="image/webp" sizes="32x32"/>' in head,
        f"{path}: the webp icon",
    )
    check(
        '<link rel="preconnect" href="https://storage.deemos.dev" crossorigin="anonymous"/>' in head
        and '<link rel="dns-prefetch" href="https://storage.deemos.dev"/>' in head,
        f"{path}: the storage hint pair",
    )
    # the blog template ships NO font mechanism at all — not in the head,
    # not as a preload, not in the Flight payload
    check("fonts.googleapis.com" not in html, f"{path}: zero font links document-wide")
    check("fonts.gstatic.com" not in html, f"{path}: zero gstatic references")
    for absent, label in (
        ("theme-color", "theme-color"),
        ('name="google"', "notranslate"),
        ("apple-touch-icon", "apple-touch-icon"),
        ('rel="manifest"', "manifest link"),
    ):
        check(absent not in head, f"{path}: no {label}")


def check_workspace_chrome(path):
    status, html = get(path)
    head, body = head_body(html)
    check(status == 200, f"{path}: 200 (got {status})")

    # the locked viewport
    vp = re.search(r'<meta name="viewport" content="([^"]*)"', head)
    check(vp is not None, f"{path}: viewport present")
    if vp:
        for field in (
            "width=device-width", "initial-scale=1", "minimum-scale=1",
            "maximum-scale=1", "viewport-fit=cover", "user-scalable=no",
        ):
            check(field in vp.group(1), f"{path}: viewport {field}")

    # the shell's own metas
    check(
        '<meta name="theme-color" content="#000000"/>' in head,
        f"{path}: theme-color #000000",
    )
    check(
        '<meta name="google" content="notranslate"/>' in head,
        f"{path}: google-notranslate",
    )

    # the shell's icon set
    for link in (
        '<link rel="icon" href="/favicon.ico"/>',
        '<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png"/>',
        '<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png"/>',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"/>',
        '<link rel="manifest" href="/manifest.json"/>',
    ):
        check(link in head, f"{path}: {link}")

    # the shell's CDN hints — file.hyper3d.com, not storage, not fonts
    check(
        '<link rel="preconnect" href="https://file.hyper3d.com"/>' in head,
        f"{path}: file.hyper3d.com preconnect",
    )
    check(
        '<link rel="dns-prefetch" href="https://file.hyper3d.com"/>' in head,
        f"{path}: file.hyper3d.com dns-prefetch",
    )
    check("storage.deemos.dev" not in head, f"{path}: no storage hints")
    check("fonts.googleapis.com" not in html, f"{path}: no font links document-wide")

    # the og:title-only card (no other og fields)
    og = re.findall(r'<meta property="og:([^"]*)"', head)
    check(og == ["title"], f"{path}: og:title only (got {og})")
    check('content="Hyper3D"' in head, f"{path}: og:title is Hyper3D")

    # NO canonical, NO hreflang (the shell's own absence)
    check('rel="canonical"' not in head, f"{path}: no canonical")
    check('rel="alternate"' not in head, f"{path}: no hreflang")

    # the twitter card inherited from the root layout, byte-for-byte the
    # shell's own
    for meta in (
        '<meta name="twitter:card" content="summary_large_image"/>',
        '<meta name="twitter:site" content="@DeemosTech"/>',
        '<meta name="twitter:title" content="Hyper3D - Rodin &amp; ChatAvatar"/>',
        '<meta name="twitter:description" content="Closest to Production-ready 3D Assets Generator"/>',
        '<meta name="twitter:image" content="https://hyper3d.ai/assets/og-banner.png"/>',
    ):
        check(meta in head, f"{path}: {meta}")


print("1. Shape A — the Astro marketing chrome (16 surfaces)")
for path in MARKETING:
    check_marketing_chrome(path)

print("2. the blog family — storage hints, zero font links (8 surfaces)")
for path in BLOG:
    check_blog_chrome(path)

print("3. Shape B — the workspace SPA shell chrome (5 surfaces)")
for path in WORKSPACE:
    check_workspace_chrome(path)

print("4. the 404 head (the reference serves the full marketing head)")

status, html = get("/no-such-page")
head, body = head_body(html)
check(status == 404, f"404 status (got {status})")
check(
    "<title>404 Page Not Found | Hyper3D</title>" in head,
    "404 title",
)
check(
    '<link rel="canonical" href="https://hyper3d-clone.vercel.app/404"/>' in head,
    "404 canonical /404",
)
langs = re.findall(r'<link rel="alternate" hrefLang="([^"]*)" href="([^"]*)"/>', head)
check(len(langs) == 13, f"404 hreflang count 13 (got {len(langs)})")
if langs:
    keys = [k for k, _ in langs]
    check(
        keys
        == ["en", "zh", "de", "ja", "ko", "ru", "pt-BR", "fr", "es", "ar", "tr", "it", "x-default"],
        f"404 hreflang key order (got {keys})",
    )
    check(keys[-1] == "x-default", "404 x-default last")
    check(
        all(url.endswith("/404") for _, url in langs),
        "404 every hreflang target is the /404 form",
    )
check(
    '<meta name="robots" content="noindex, nofollow"/>' in head,
    "404 robots noindex,nofollow",
)
check(
    '<meta property="og:image" content="https://hyper3d.ai/assets/og-banner.webp"/>' in head,
    "404 og:image on the shared banner fallback",
)
check(
    '<meta name="twitter:image" content="https://hyper3d.ai/assets/og-banner.webp"/>' in head,
    "404 twitter:image on the shared banner fallback",
)
check(
    '<meta name="twitter:image:alt" content="404 Page Not Found"/>' in head,
    "404 twitter:image:alt",
)
# the documented exclusion: the boundary renders client-side only, so
# its chrome links never reach served bytes (and a stylesheet there would
# leak font preloads into every notFound()-capable page's head)
check("fonts.googleapis.com" not in html, "404: no font links (the Flight exclusion)")
check("storage.deemos.dev" not in html, "404: no storage hints (the Flight exclusion)")

print("5. Shape C — the bare content-preview head")

status, html = get("/content-preview")
head, body = head_body(html)
check(status == 200, f"content-preview 200 (got {status})")
check(
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>' in head,
    "content-preview: framework-default viewport",
)
check("storage.deemos.dev" not in html, "content-preview: no hints")
check("fonts.googleapis.com" not in html, "content-preview: no font links")
check(
    '<meta name="robots" content="noindex, nofollow"/>' in head,
    "content-preview: robots noindex,nofollow",
)
# the documented divergence: the root layout's webp icon is inherited
# (the reference's bare page links no icon at all)
check(
    '<link rel="icon" href="/favicon-32x32.webp" type="image/webp" sizes="32x32"/>' in head,
    "content-preview: the inherited webp icon (documented)",
)

print("6. the icon files at their well-known paths")

for path, size in (
    ("/favicon-32x32.webp", 620),
    ("/apple-touch-icon.png", 11989),
    ("/manifest.json", 568),
    ("/favicon.ico", None),
    ("/favicon-32x32.png", None),
    ("/favicon-16x16.png", None),
):
    status, html = get(path)
    check(status == 200, f"{path}: 200 (got {status})")
    if size is not None:
        raw = get(path)
        # decode length in bytes via the raw body
        req = urllib.request.Request(CLONE + path)
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        check(len(data) == size, f"{path}: {size} bytes (got {len(data)})")

print("7. the home page's twitter:image:alt (the reference's own card)")

_, html = get("/")
head, _ = head_body(html)
check(
    '<meta name="twitter:image:alt" content="Hyper3D Rodin - Best AI 3D Model Generator"/>' in head,
    "home: twitter:image:alt mirrors the card title",
)

print()
print(f"t83 verify-served: {checks - fails}/{checks} checks passed")
if fails:
    print(f"FAILURES: {fails}")
    raise SystemExit(1)
print("ALL GREEN")
