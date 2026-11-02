#!/usr/bin/env python3
"""t87 served-HTML verification: the use-cases tree's body density, checked
against the locally served standalone build (recon/t87/notes.md):

  1. the 11 use-case pages serve 200 and render their new t87 sections
     (promptExamples / techCards / exportTypes, per the per-page map)
  2. the new content serves its real anchors: the export-format cards on all
     8 carriers, the studio's real editing subset on animation (orientation,
     ControlNet), the polycount/LOD gap on the 4 control-carrying pages,
     the live HDRI tool on vr-ar/metaverse/game
  3. FAQ floors are visible served-side: >=8 <details> per page
  4. regressions: unknown use-case slug still 404s; an untouched features
     page (image-to-3d — researchNote only, no t85 prompt/code blocks) renders
     no empty section shells; the /use-cases index still serves
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
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t87-verify"})
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
    "/use-cases/3d-printing": [
        "Prompt recipes for the print queue",
        "Watertight or it doesn't print",
        "The export row a print workflow actually gets",
    ],
    "/use-cases/animation": [
        "Prompt recipes for shot assets",
        "Mesh inspection and creative editing — the real subset",
        "Formats the animation half actually ships",
    ],
    "/use-cases/automotive-design": [
        "Concept prompts that iterate",
        "Exports that fit automotive pipelines",
    ],
    "/use-cases/character-design": [
        "Character prompts that compile",
        "Stylized, realistic, or in between — the honest controls",
    ],
    "/use-cases/e-commerce": [
        "The product page is your new showroom",
        "Every format the exporter row actually ships",
    ],
    "/use-cases/game-development": [
        "Prompt recipes for the asset pipeline",
        "Target polygon count, strong silhouette",
    ],
    "/use-cases/jewelry-design": [
        "Castable STL for lost-wax printing",
        "The export row a bench actually gets",
    ],
    "/use-cases/mechanical-engineering": [
        "The spec-sheet claims, answered",
        "The export row on the spec sheet",
    ],
    "/use-cases/metaverse": [
        "Prompts that stock a world",
        "Target polygon count & optional LODs — the honest status",
        "The export row a world platform gets",
    ],
    "/use-cases/nft-creation": [
        "Rarity-ladder prompts",
        "What happens on mint day",
    ],
    "/use-cases/vr-ar": [
        "Prompts that build scenes",
        "Frame rate is the real art director",
        "The full export row for AR/VR pipelines",
    ],
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

# --- 2. the new content serves its real anchors ----------------------------
EXPORT_CARRIERS = [
    "/use-cases/3d-printing",
    "/use-cases/animation",
    "/use-cases/automotive-design",
    "/use-cases/e-commerce",
    "/use-cases/jewelry-design",
    "/use-cases/mechanical-engineering",
    "/use-cases/metaverse",
    "/use-cases/vr-ar",
]
for path in EXPORT_CARRIERS:
    html = PAGES[path]
    for fmt in ("glb", "gltf", "fbx", "obj", "stl", "usdz"):
        check(f".{fmt}" in html, f"{path} serves export card .{fmt}")

# prompt cards: mono box + the honest "Here:" note prefix, on the 8 carriers
PROMPT_CARRIERS = [p for p in SECTION_PAGES if p not in ("/use-cases/e-commerce", "/use-cases/jewelry-design", "/use-cases/mechanical-engineering")]
for path in PROMPT_CARRIERS:
    html = PAGES[path]
    # Flight payload duplicates rendered strings; >=3 visible cards -> >=6 hits
    check(html.count("Here: ") >= 6, f"{path} prompt cards carry the honest note prefix")
    check("font-mono" in html, f"{path} prompt cards render in mono boxes")

# the animation page pins the studio's real editing subset
html = PAGES["/use-cases/animation"]
for token in ("ControlNet", "orientation"):
    check(token in html, f"animation page serves real studio control '{token}'")
check("hosted editor is not here" in html.lower(), "animation page states the hosted-editor gap")

# the polycount/LOD gap, served on the reference's own control pages
for path in (
    "/use-cases/3d-printing",
    "/use-cases/character-design",
    "/use-cases/game-development",
    "/use-cases/metaverse",
):
    low = PAGES[path].lower()
    check("polycount" in low, f"{path} names the polycount lever")
    check(
        re.search(r"no target|no polycount|neither target|no budget slider|no lod|does not expose a polycount", low)
        is not None,
        f"{path} states the polycount/LOD gap",
    )

# the live HDRI tool is the named path on the sky-carrying pages
for path in ("/use-cases/vr-ar", "/use-cases/metaverse", "/use-cases/game-development"):
    check("HDRI generator" in PAGES[path], f"{path} names the live HDRI generator")
    check("/workspace/omnicraft/hdri" in PAGES[path], f"{path} links the live HDRI route")

# --- 3. FAQ floors, visible served-side -------------------------------------
for path in SECTION_PAGES:
    n = PAGES[path].count("<details")
    check(n >= 8, f"{path} serves >=8 FAQ <details> (got {n})")

# --- 4. regressions ----------------------------------------------------------
st, _ = get("/use-cases/not-a-use-case")
check(st == 404, "unknown use-case slug still 404s")
st, raw = get("/features/image-to-3d")
html = text_of(raw)
check(st == 200, "untouched features page still serves")
check("Here: " not in html, "untouched features page renders no empty prompt-card shells")
check("<pre" not in html, "untouched features page renders no empty code-block shells")
st, raw = get("/use-cases")
check(st == 200, "the use-cases index still serves 200")
check("Use Cases" in text_of(raw), "the use-cases index still renders its heading")

print(f"\n{checks - fails}/{checks} checks passed")
if fails:
    raise SystemExit(1)
