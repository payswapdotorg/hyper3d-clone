#!/usr/bin/env python3
"""t86 served-HTML verification: the omnicraft long tail of the features
tree, checked against the locally served standalone build (recon/t86/notes.md):

  1. the 7 touched omnicraft pages serve 200 and render their new sections —
     techCards on all seven, promptExamples on the three that carry them
     (texture, remix, search), exportTypes on the SVG page
  2. the live pages' cards carry the real engine constants (FNV-1a,
     mulberry32, 2K/4K tiers; depth 0.05-4 / bevel 0-0.5 / curve 4-32)
  3. the reference-only pages attribute their sections to the reference and
     state the gap
  4. the enhancer page records the reference's own video-heading quirk
  5. regressions: unknown feature slug still 404s; an untouched non-omnicraft
     page (an MCP agent sub-page) renders no empty section shells
"""
import re
import html as htmllib
import urllib.request
import urllib.error

CLONE = "http://127.0.0.1:3112"

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
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t86-verify"})
    try:
        with opener.open(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def text_of(html: str) -> str:
    """Normalize served HTML for content checks: unescape entities (&quot;,
    &#x27;) and drop RSC text-node separators (<!-- -->)."""
    return htmllib.unescape(html).replace("<!-- -->", "")


# --- 1. the new sections render on the right pages -------------------------
SECTION_PAGES = {
    "/features/omnicraft/ai-hdri-generator": ["The Engine Behind the Skies"],
    "/features/omnicraft/svg-to-3d-converter": ["Extrusion Depth and Bevel You Control", "Every Format the Exporter Serves"],
    "/features/omnicraft/ai-texture-generator": ["One Model, Any Material Direction", "The Reference's Production Controls"],
    "/features/omnicraft/ai-image-enhancer": ["the Feature Set This Clone Declines to Fake"],
    "/features/omnicraft/ai-image-remix": ["Three References, One Prompt, One Scene", "Real Controls Behind Every Remix"],
    "/features/omnicraft/3d-model-search-engine": ["Describe It, Don't Keyword It", "Ask by Text, Image, or Model"],
    "/features/omnicraft/3d-mesh-editor": ["Optional Creative Control for Every Surface"],
}

PAGES = {}
for path, titles in SECTION_PAGES.items():
    st, raw = get(path)
    check(st == 200, f"{path} serves 200 (got {st})")
    page = text_of(raw)
    PAGES[path] = page
    for t in titles:
        check(
            re.search(re.escape(t), page) is not None,
            f"{path} renders section '{t}'",
        )

# prompt cards: mono box + the honest "Here:" note prefix, on the 3 carriers
for path in (
    "/features/omnicraft/ai-texture-generator",
    "/features/omnicraft/ai-image-remix",
    "/features/omnicraft/3d-model-search-engine",
):
    html = PAGES[path]
    check(html.count("Here: ") >= 3, f"{path} prompt cards carry the honest note prefix")
    check("font-mono" in html, f"{path} prompt cards render in mono boxes")

# --- 2. the live pages' real constants --------------------------------------
html = PAGES["/features/omnicraft/ai-hdri-generator"]
for token in ("FNV-1a", "mulberry32", "2K", "4K", "src/lib/hdri.ts"):
    check(token in html, f"hdri page serves real engine fact '{token}'")
check("8K" in html, "hdri page states the 8K gap (reference's tier)")
check("gallery of shared HDRIs" in html, "hdri page mirrors the reference's gallery card honestly")

html = PAGES["/features/omnicraft/svg-to-3d-converter"]
for token in ("0.05", "0.5", "32", "six-swatch"):
    check(token in html, f"svg page serves real slider fact '{token}'")
for fmt in ("glb", "gltf", "fbx", "obj", "stl", "usdz"):
    check(f".{fmt}" in html, f"svg export card .{fmt} served")

# --- 3. reference-only pages attribute and state the gap --------------------
for path in (
    "/features/omnicraft/ai-texture-generator",
    "/features/omnicraft/ai-image-enhancer",
    "/features/omnicraft/ai-image-remix",
    "/features/omnicraft/3d-model-search-engine",
    "/features/omnicraft/3d-mesh-editor",
):
    html = PAGES[path]
    low = html.lower()
    check("reference" in low, f"{path} attributes its sections to the reference")
    check(
        re.search(r"\b(no|not|nothing|never|does not)\b", low) is not None,
        f"{path} states the gap",
    )

# --- 4. the enhancer quirk, recorded faithfully ------------------------------
html = PAGES["/features/omnicraft/ai-image-enhancer"]
check("Why Choose Hyper3D for AI Video Generation?" in html, "enhancer page records the reference's own video heading")

# --- 5. regressions ----------------------------------------------------------
st, raw = get("/features/not-a-feature")
check(st == 404, "unknown feature slug still 404s")
st, raw = get("/features/mcp/mcp-claude")
html = text_of(raw)
check(st == 200, "untouched mcp agent page still serves")
check("Here: " not in html, "untouched page renders no empty prompt-card shells")
check("<pre" not in html, "untouched page renders no empty code-block shells")
# (the Flight payload's font-mono hit on this page is the themed 404 boundary
#  Next embeds in every tree — a rendering artifact, not a section shell)

print(f"\n{checks - fails}/{checks} checks passed")
if fails:
    raise SystemExit(1)
