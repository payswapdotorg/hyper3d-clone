#!/usr/bin/env python3
"""t88 served-HTML verification: the /help tree's body density, checked
against the locally served standalone build (recon/t88/notes.md):

  1. all 40 help routes serve 200 — index + 6 hubs + 33 articles
  2. every article renders its "Related questions" FAQ band (>=4 <details>)
     and every hub its guide FAQ band (>=3); the index renders the
     "How to read these answers" band + its FAQ (>=4)
  3. the new reference-verbatim bands serve on spot-checked pages, incl.
     the "Business Lisence" quirk (recorded faithfully) and the attributed
     price ladder on the plans article
  4. real anchors served: the MCP endpoint modal-constant string, the
     multi-view schema facts, the seed/privacy facts on the settings article
  5. regressions: unknown article slug and unknown category still 404; an
     untouched features page renders no FAQ shells; the index's popular band
     and browse-by-topic still render
"""
import re
import html as htmllib
import urllib.request
import urllib.error
import concurrent.futures as cf

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
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t88-verify"})
    try:
        with opener.open(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def text_of(html: str) -> str:
    return htmllib.unescape(html).replace("<!-- -->", "")


ARTICLES = [r for r in open(__file__.replace("verify-served.py", "t88-probe-help.py")).read().split('"')[1::2] if r.startswith("/help/")]
ARTICLES = [r for r in ARTICLES if r != "/help"][0:] or ARTICLES
# robust re-derivation: pull ROUTES from the probe file
_routes_src = open(__file__.replace("verify-served.py", "t88-probe-help.py")).read()
ROUTES = re.findall(r'"(/help[^"]*)"', _routes_src)
HUBS = [r for r in ROUTES if r != "/help" and "/articles/" not in r]
ARTS = [r for r in ROUTES if "/articles/" in r]

PAGES = {}
with cf.ThreadPoolExecutor(max_workers=12) as ex:
    futs = {ex.submit(get, r): r for r in ROUTES}
    for f in cf.as_completed(futs):
        PAGES[futs[f]] = f.result()

# --- 1. all 40 routes serve 200 ---------------------------------------------
for path in ROUTES:
    st, _ = PAGES[path]
    check(st == 200, f"{path} serves 200 (got {st})")

# --- 2. FAQ bands render served-side ----------------------------------------
for path in ARTS:
    page = text_of(PAGES[path][1])
    n = page.count("<details")
    # Flight payload duplicates rendered strings; >=4 visible items is the floor
    check(n >= 4, f"{path} serves >=4 FAQ <details> (got {n})")
    check("Related questions" in page, f"{path} renders the FAQ band heading")

for path in HUBS:
    page = text_of(PAGES[path][1])
    n = page.count("<details")
    check(n >= 3, f"{path} hub serves >=3 guide FAQ <details> (got {n})")

index = text_of(PAGES["/help"][1])
check("How to read these answers" in index, "index renders the reading-guide heading")
check(index.count("<details") >= 4, "index serves >=4 reading-guide FAQ items")

# --- 3. reference-verbatim bands on spot-checked pages ----------------------
SPOT = {
    "/help/articles/what-is-hyper3d": ["What can you create with Hyper3D?", "More than a 3D generator"],
    "/help/articles/how-to-use-hyper3d-beginners-guide": ["Add Textures to Your Model"],
    "/help/articles/what-features-does-hyper3d-have": ["Rodin Text to 3D", "Rodin Image to 3D", "ChatAvatar", "API and add-ons"],
    "/help/articles/does-hyper3d-support-languages-besides-english": ["Change the website language"],
    "/help/articles/how-to-get-support-from-hyper3d": ["Start with self-service resources"],
    "/help/articles/official-hyper3d-links-and-scam-safety": ["How to recognize a suspicious page or message"],
    "/help/articles/how-to-reset-hyper3d-password": ["If the message does not arrive", "Google, GitHub, and SSO accounts"],
    "/help/articles/how-much-do-hyper3d-plans-cost": ["What to confirm before subscribing", "Free: $0"],
    "/help/articles/how-to-purchase-hyper3d-credits": ["Purchase direct credits from Wallet", "Get credits through a subscription"],
    "/help/articles/how-to-request-a-hyper3d-refund": ["When a refund may be considered"],
    "/help/articles/what-happens-to-credits-when-changing-plans": ["Upgrading Your Subscription", "Need Help?"],
    "/help/articles/are-credits-deducted-when-a-generation-fails": ["Web generation", "API generation"],
    "/help/articles/are-credits-returned-after-canceling-a-generation": ["Unconfirmed web results", "Accepted API tasks"],
    "/help/articles/do-hyper3d-credits-expire": ["Subscription credits", "Directly purchased credits"],
    "/help/articles/how-many-credits-does-each-hyper3d-generation-cost": ["Use the displayed cost as the source of truth"],
    "/help/articles/how-to-check-hyper3d-credit-history": ["Open your credit history"],
    "/help/articles/why-did-my-hyper3d-generation-fail": ["Common causes"],
    "/help/articles/choose-rodin-model-and-generation-settings": ["Choose between Gen-2.5 and Gen-1.5", "Set privacy and batch size before generation", "Use presets for repeatable input"],
    "/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents": ["Connect the MCP server", "Troubleshoot the connection"],
    "/help/articles/control-topology-polycount-and-lods": ["Choose face count from the use case", "Bake normals for efficient delivery"],
    "/help/articles/create-3d-avatars-with-chatavatar": ["Prepare the identity reference", "Review more than likeness", "Business Lisence"],
    "/help/articles/create-3d-models-from-images-with-rodin": ["Assign Image Directions (Optional)", "Keep every image consistent"],
    "/help/articles/create-3d-models-from-text-with-rodin": ["Write one object at a time", "Refine the source before rebuilding everything"],
    "/help/articles/create-editable-scenes-with-hyper3d-worldgen": ["Upload a readable scene image", "Choose the creation mode"],
    "/help/articles/create-hdri-skyboxes-with-omnicraft": ["Inspect the 360-degree preview", "Understand the package"],
    "/help/articles/edit-3d-models-in-rodin-workspace": ["Preview before committing", "Open 3D Editing and upload the model"],
    "/help/articles/edit-3d-models-with-omnicraft-mesh-editor": ["Import a mesh or start from a primitive"],
    "/help/articles/fix-common-hyper3d-export-problems": ["Model appears white or untextured", "Scale or orientation is incorrect", "Download or import fails"],
    "/help/articles/import-models-into-hyper3d-tools": ["Choose the destination tool", "Usage Notes"],
    "/help/articles/use-bang-and-partial-edit": ["Use BANG or Parts for component structure", "Use Partial Edit for a local change"],
    "/help/articles/use-rodin-agentic-mode-for-image-to-3d": ["Turn on Agentic Mode before generation", "Know when to use manual controls"],
    "/help/articles/how-to-get-hyper3d-enterprise-support": ["Enterprise inquiry or ordinary product support?", "When to contact the Enterprise team"],
}
for path, titles in SPOT.items():
    page = text_of(PAGES[path][1])
    for t in titles:
        check(t in page, f"{path} renders band '{t}'")

# the attributed price ladder + the local boundary, in the same served page
plans = text_of(PAGES["/help/articles/how-much-do-hyper3d-plans-cost"][1])
check("$30" in plans and "$280" in plans, "plans article serves the reference's attributed numbers")
check(re.search(r"no plans and no prices", plans, re.I) is not None, "plans article states the local boundary")

# --- 4. real anchors served ---------------------------------------------------
mcp = text_of(PAGES["/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents"][1])
check("https://api.hyper3d.com/api/mcp" in mcp, "MCP article serves the modal's real endpoint")
check("npm install --global @hyper3d/cli" in mcp, "MCP article serves the real CLI install line")

img = text_of(PAGES["/help/articles/create-3d-models-from-images-with-rodin"][1])
check("PNG, JPEG and WebP" in img, "images article serves the real accepted types")
check(re.search(r"up to (eight|four)", img) is not None, "images article serves the real image-count caps")

settings = text_of(PAGES["/help/articles/choose-rodin-model-and-generation-settings"][1])
check("Gen-2.5" in settings and "Gen-1.5" in settings, "settings article serves both real versions")
check(re.search(r"seed", settings, re.I) is not None and "no seed" not in settings.lower(), "settings article states the real seed surface")
check("privacy" in settings.lower(), "settings article states the real privacy toggle")

hdri = text_of(PAGES["/help/articles/create-hdri-skyboxes-with-omnicraft"][1])
check("2048" in hdri and "4096" in hdri, "HDRI article serves the real 2K/4K dimensions")

# --- 5. regressions -----------------------------------------------------------
st, _ = get("/help/articles/not-an-article")
check(st == 404, "unknown article slug still 404s")
st, _ = get("/help/not-a-category")
check(st == 404, "unknown category slug still 404s")
st, raw = get("/features/text-to-3d")
feat = text_of(raw)
check(st == 200, "untouched features page still serves")
# the features pages legitimately carry their own t85/t86 FAQ <details> — the
# regression marker is the help tree's own band heading, not <details> itself
# (same recon-note family as t87: pick untouched-page checks carefully)
check("Related questions" not in feat, "untouched features page renders no help FAQ band")
st, raw = get("/use-cases/3d-printing")
uc = text_of(raw)
check(st == 200, "untouched use-cases page still serves")
check("Related questions" not in uc, "untouched use-cases page renders no help FAQ band")
check("Popular articles" in index, "index still renders the popular band")
check("Browse by topic" in index, "index still renders the browse band")
check("No matching articles" in index or "search" in index.lower(), "index still renders its search surface")

# hub guides render
for path in HUBS:
    page = text_of(PAGES[path][1])
    slug = path.split("/")[-1]
    check("articles" in page, f"{path} still renders its article list")

print(f"\n{checks - fails}/{checks} checks passed")
if fails:
    raise SystemExit(1)
