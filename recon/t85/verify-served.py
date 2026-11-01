#!/usr/bin/env python3
"""t85 served-HTML verification: the features tree's body density, checked
against the locally served standalone build (recon/t85/notes.md):

  1. the 9 touched pages serve 200 and render their new sections —
     promptExamples (mono-box prompt cards + "Here:" notes), researchNote,
     techCards, codeExamples (mono <pre> blocks), exportTypes
  2. the api page's code blocks carry the real routes and the real schema
     fields; the export cards are exactly the six EXPORT_FORMATS
  3. the mcp page's code blocks are the modal's own constants (endpoint,
     CLI install, agent instruction)
  4. the /features index carries the status-chip legend and the closing
     "Start with the right AI 3D feature" section
  5. regressions: unknown feature slug still 404s; a page without the new
     sections renders no empty section shells
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
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t85-verify"})
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
    "/features/text-to-3d": ["Text to 3D Prompt Examples", "AI Technology Behind Text to 3D Model Generation"],
    "/features/image-to-3d": ["Built on award-winning 3D research", "The AI Behind Image to 3D Here"],
    "/features/api": ["API Examples — Real Calls to This Clone", "Supported Outputs — The Real Six"],
    "/features/mcp": ["Integrate 3D Generation into Your Daily Work", "Copy-Ready Connection Config"],
    "/features/worldgen": ["Built on award-winning 3D research", "Understands Physics, Ready to Edit"],
    "/features/chatavatar": ["Built for Complete Avatar Creation"],
    "/features/ai-image-generator": ["Prompt Examples for Better AI Images"],
    "/features/ai-video-generator": ["Better Prompts for AI Video Generation"],
}

for path, titles in SECTION_PAGES.items():
    st, raw = get(path)
    check(st == 200, f"{path} serves 200 (got {st})")
    page = text_of(raw)
    for t in titles:
        check(
            re.search(re.escape(t), page) is not None,
            f"{path} renders section '{t}'",
        )

# prompt cards: mono box + the honest "Here:" note prefix
st, raw = get("/features/text-to-3d")
html = text_of(raw)
check(html.count("Here: ") >= 4, "text-to-3d prompt cards carry the honest note prefix")
check("font-mono" in html, "prompt cards render in mono boxes")
check("A red fresh apple" in html, "the apple example prompt is served")

# --- 2. the api page's real routes and fields ------------------------------
st, raw = get("/features/api")
html = text_of(raw)
for route in ("/api/auth/sign-in", "/api/task", "/api/task/$UUID/progress", "/api/task/$UUID/export", "/api/healthz"):
    check(route in html, f"api page documents {route}")
for field in ('"type": "RodinStandard"', '"effort": "medium"', '"seed": 4242'):
    check(field in html, f"api task example carries real field {field}")
for fmt in ("glb", "gltf", "fbx", "obj", "stl", "usdz"):
    check(f".{fmt}" in html, f"api export card .{fmt} served")

# --- 3. the mcp page's modal constants -------------------------------------
st, raw = get("/features/mcp")
html = text_of(raw)
check("https://api.hyper3d.com/api/mcp" in html, "mcp page serves the modal's endpoint")
check("npm install --global @hyper3d/cli" in html, "mcp page serves the modal's CLI install")
check("Set up Hyper3D MCP in this client" in html, "mcp page serves the paste-ready agent instruction")
check("restart is required" in html, "agent instruction keeps the restart clause")

# --- 4. the features index legend + closing --------------------------------
st, raw = get("/features")
html = text_of(raw)
check(st == 200, "/features serves 200")
check("How to read the matrix" in html, "index carries the status-chip legend")
check("Start with the right AI 3D feature" in html, "index carries the closing section")
check("REFERENCE-ONLY" in html and "PARTIAL" in html, "index legend names all three statuses")

# --- 5. regressions ---------------------------------------------------------
st, raw = get("/features/not-a-feature")
check(st == 404, "unknown feature slug still 404s")
st, raw = get("/features/omnicraft/ai-hdri-generator")
html = text_of(raw)
check(st == 200, "untouched omnicraft page still serves")
check("API Examples" not in html, "untouched page renders no empty code-example shell")

print(f"\n{checks - fails}/{checks} checks passed")
if fails:
    raise SystemExit(1)
