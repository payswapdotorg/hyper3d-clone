#!/usr/bin/env python3
"""t82 served-HTML verification: check the clone's locally-served
standalone build carries the full t82 workspace-shell route contract
against the reference's probed behavior matrix (recon/t82/notes.md):

  1. root aliases: /register + /login + /imageto3d + /r|a/:code 301s,
     /signup + /r + /a bare + /imageto3d/{bad} 404s, /imageto3d/{uuid}
     shape-checked 301
  2. /workspace: 200 + pre-paint replace to /workspace/rodin, no title
  3. /workspace/signup: 200 + replace to /workspace/register
  4. /workspace/r|a/{code}: 200 + referral replace (code set, query merged)
  5. /workspace/{unknown}: 200 + the studio view at the unknown URL
  6. /workspace/imageto3d: the ChatAvatar view under the short title
  7. /workspace/imageto3d/{uuid}: studio view + the LCP preload script;
     invalid shape: 200 + replace to /404
  8. /workspace/rodin/{uuid}: studio view; {non-uuid}: replace to /404;
     non-canonical tabs: replace to /workspace/rodin
  9. the two OAuth guest views: probed copy, no title, no-referrer,
     the private-mode flag, the visit markers
"""
import re
import urllib.request
import urllib.error

CLONE = "http://127.0.0.1:3111"

STUDIO_TITLE_PREFIX = "Rodin AI - Free AI 3D Model Generator For Everyone"
CHATAVATAR_SHORT_TITLE = "ChatAvatar - AI 3D Facial Assets Generator | Hyper3D"
UUID = "0bb1d4a9-e701-4871-ace0-9491e775238e"

fails = 0
checks = 0


def check(cond, label):
    global fails, checks
    checks += 1
    if not cond:
        fails += 1
        print(f"  FAIL  {label}")


def get(path):
    """Return (status, final_url, location, body)."""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(CLONE + path, headers={"User-Agent": "t82-verify"})
    try:
        with opener.open(req, timeout=30) as r:
            return r.status, r.geturl(), "", r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, "", e.headers.get("Location", ""), e.read().decode("utf-8", "replace")


def title_of(body):
    m = re.search(r"<title[^>]*>([^<]*)</title>", body)
    return m.group(1) if m else None


print("1. root-level aliases (the reference's 301s and 404s)")

status, _, loc, _ = get("/register")
check(status == 301 and loc.endswith("/workspace/register"), f"/register 301 → /workspace/register (got {status} {loc})")

status, _, loc, _ = get("/login")
check(status == 301 and loc.endswith("/workspace/login"), f"/login 301 → /workspace/login (got {status} {loc})")

status, _, _, _ = get("/signup")
check(status == 404, f"/signup 404 (got {status})")

status, _, loc, _ = get("/imageto3d")
check(status == 301 and loc.endswith("/features/image-to-3d"), f"/imageto3d 301 → /features/image-to-3d (got {status} {loc})")

status, _, loc, _ = get(f"/imageto3d/{UUID}")
check(status == 301 and loc.endswith(f"/workspace/imageto3d/{UUID}"), f"/imageto3d/{{uuid}} 301 (got {status} {loc})")

status, _, _, _ = get("/imageto3d/bad")
check(status == 404, f"/imageto3d/bad 404 (got {status})")

status, _, _, _ = get("/imageto3d/x/y")
check(status == 404, f"/imageto3d/x/y 404 (got {status})")

status, _, loc, _ = get("/r/testcode")
check(status == 301 and loc.endswith("/workspace/r/testcode"), f"/r/:code 301 → /workspace/r/:code (got {status} {loc})")

status, _, loc, _ = get("/r/testcode/extra")
check(status == 301 and loc.endswith("/workspace/r/testcode/extra"), f"/r/:code/:rest 301 (got {status} {loc})")

status, _, loc, _ = get("/a/testcode")
check(status == 301 and loc.endswith("/workspace/a/testcode"), f"/a/:code 301 (got {status} {loc})")

for bare in ("/r", "/a"):
    status, _, _, _ = get(bare)
    check(status == 404, f"{bare} bare 404 (got {status})")

print("2. /workspace — 200 + pre-paint replace, no title")

status, _, _, body = get("/workspace")
check(status == 200, f"/workspace 200 (got {status})")
check(title_of(body) is None, f"/workspace no <title> (got {title_of(body)!r})")
check('window.location.replace("/workspace/rodin"' in body, "/workspace replace script present")
check("hyper3d_workspace_visited" in body, "/workspace stamps the visit markers")
check("You need to enable JavaScript to run this app." in body, "/workspace noscript notice")

print("3. /workspace/signup — 200 + replace to register")

status, _, _, body = get("/workspace/signup")
check(status == 200, f"/workspace/signup 200 (got {status})")
check(title_of(body) is None, f"/workspace/signup no <title> (got {title_of(body)!r})")
check('window.location.replace("/workspace/register"+(window.location.search||"")+(window.location.hash||""));' in body,
      "/workspace/signup replace script (search+hash preserved)")

print("4. /workspace/r|a — the referral replaces")

status, _, _, body = get("/workspace/r/testcode")
check(status == 200, f"/workspace/r/testcode 200 (got {status})")
check('p.set("referral_code","testcode")' in body, "referral replace sets the code")
check("new URLSearchParams(window.location.search)" in body, "referral replace merges the query")
check('(window.location.hash||"")' in body, "referral replace preserves the hash")

status, _, _, body = get("/workspace/a/x/y")
check(status == 200 and 'p.set("referral_code","x")' in body, "/workspace/a/x/y replaces with referral_code=x (deeper ignored)")

status, _, _, body = get("/workspace/r")
check(status == 200 and 'window.location.replace("/workspace/register"+(window.location.search||"")' in body,
      "/workspace/r bare → plain register replace")

print("5. /workspace/{unknown} — the studio view at the unknown URL")

for path in ("/workspace/foobar", "/workspace/settings", "/workspace/xyz/abc"):
    status, _, _, body = get(path)
    check(status == 200, f"{path} 200 (got {status})")
    t = title_of(body)
    check(t is not None and t.startswith(STUDIO_TITLE_PREFIX), f"{path} studio title (got {t!r})")
    check("hyper3d_workspace_visited" in body, f"{path} stamps the visit markers")

print("6. /workspace/imageto3d — the ChatAvatar view, short title")

status, _, _, body = get("/workspace/imageto3d")
check(status == 200, f"/workspace/imageto3d 200 (got {status})")
check(title_of(body) == CHATAVATAR_SHORT_TITLE, f"/workspace/imageto3d short title (got {title_of(body)!r})")
check("ChatAvatar" in body, "/workspace/imageto3d renders the ChatAvatar view")
check("hyper3d_workspace_visited" in body, "/workspace/imageto3d stamps the visit markers")

print("7. /workspace/imageto3d/{uuid} — studio view + the LCP preload script")

status, _, _, body = get(f"/workspace/imageto3d/{UUID}")
check(status == 200, f"/workspace/imageto3d/{{uuid}} 200 (got {status})")
t = title_of(body)
check(t is not None and t.startswith(STUDIO_TITLE_PREFIX), f"uuid page studio title (got {t!r})")
check("imageto3d\\/([0-9a-f-]{36})" in body, "the reference's imageto3d regex is served verbatim")
check("file.hyper3d.com/" in body and "/preview/render_basic.jpg" in body, "the LCP preload builds the CDN render URL")
check('fetchpriority","high"' in body, "the LCP preload carries fetchpriority=high")
check("hyper3d_workspace_visited" in body, "uuid page stamps the visit markers")

status, _, _, body = get("/workspace/imageto3d/bad")
check(status == 200, f"/workspace/imageto3d/bad 200 (got {status})")
check('window.location.replace("/404");' in body, "invalid shape replaces to /404")
check(title_of(body) is None, f"invalid shape no <title> (got {title_of(body)!r})")

print("8. /workspace/rodin children — uuid studio / non-uuid 404 / tab normalize")

status, _, _, body = get(f"/workspace/rodin/{UUID}")
check(status == 200, f"/workspace/rodin/{{uuid}} 200 (got {status})")
t = title_of(body)
check(t is not None and t.startswith(STUDIO_TITLE_PREFIX), f"rodin uuid studio title (got {t!r})")

status, _, _, body = get("/workspace/rodin/xyz")
check(status == 200 and 'window.location.replace("/404");' in body, "/workspace/rodin/xyz replaces to /404")

status, _, _, body = get("/workspace/rodin/zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
check(status == 200 and 'window.location.replace("/404");' in body, "36-z segment replaces to /404")

status, _, _, body = get("/workspace/rodin/tab/a/b")
check(status == 200 and 'window.location.replace("/workspace/rodin");' in body, "/workspace/rodin/tab/a/b normalizes to the studio root")

status, _, _, body = get("/workspace/rodin/tab/nope")
check(status == 200 and 'window.location.replace("/workspace/rodin");' in body, "unknown tab normalizes to the studio root")

status, _, _, body = get("/workspace/rodin")
check(status == 200 and title_of(body).startswith(STUDIO_TITLE_PREFIX), "/workspace/rodin still the studio")

status, _, _, body = get("/workspace/rodin/tab/story")
check(status == 200 and title_of(body) == "Rodin - User Stories Collection | Hyper3D", "story tab title unchanged")

status, _, _, body = get("/workspace/rodin/tab/research")
check(status == 200 and title_of(body) == "Rodin - Research Library | Hyper3D", "research tab title unchanged")

print("9. the OAuth guest surfaces")

status, _, _, body = get("/workspace/oauth/device")
check(status == 200, f"/workspace/oauth/device 200 (got {status})")
check(title_of(body) is None, f"device no <title> (got {title_of(body)!r})")
for needle in (
    ">Hyper3D</span>",
    "Device authorization",
    "Unable to continue",
    "This authorization link is incomplete or invalid. Return to your terminal and start a new login request.",
    "Only authorize devices and clients you trust.",
):
    check(needle in body, f"device copy: {needle[:50]}")
check('name="referrer" content="no-referrer"' in body, "device no-referrer meta")
check("window.__HYPER3D_PRIVATE_OAUTH__=true;" in body, "device private-mode flag")
check("hyper3d_workspace_visited" in body, "device stamps the visit markers")

status, _, _, body = get("/workspace/mcp/oauth/consent")
check(status == 200, f"/workspace/mcp/oauth/consent 200 (got {status})")
check(title_of(body) is None, f"consent no <title> (got {title_of(body)!r})")
for needle in (
    ">HYPER3D</span>",
    ">RODIN</span>",
    "Client authorization",
    "Authorization request is invalid",
    "Return to your client or terminal and start the connection again.",
    "Only authorize clients you trust.",
):
    check(needle in body, f"consent copy: {needle[:50]}")
check('name="referrer" content="no-referrer"' in body, "consent no-referrer meta")
check("window.__HYPER3D_PRIVATE_OAUTH__=true;" in body, "consent private-mode flag")

print("10. the pre-existing workspace routes still serve their views")

for path, needle in (
    ("/workspace/login", "hyper3d_workspace_visited"),
    ("/workspace/register", "hyper3d_workspace_visited"),
    ("/workspace/subscribe", "hyper3d_workspace_visited"),
    ("/workspace/api-dashboard", "hyper3d_workspace_visited"),
    ("/workspace/chatavatar", "ChatAvatar"),
    ("/workspace/video", "hyper3d_workspace_visited"),
    ("/workspace/contact-us", "hyper3d_workspace_visited"),
):
    status, _, _, body = get(path)
    check(status == 200 and needle in body, f"{path} still 200 with its view")

print()
print(f"{checks - fails}/{checks} checks passed" + (f", {fails} FAILURES" if fails else ""))
raise SystemExit(1 if fails else 0)
