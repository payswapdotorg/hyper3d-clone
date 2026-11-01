import concurrent.futures, json, urllib.request, urllib.error

BASE = "https://hyper3d.ai"
PATHS = [
    "/workspace", "/workspace/", "/workspace/foobar", "/workspace/xyz/abc",
    "/workspace/login", "/workspace/logout", "/workspace/signup",
    "/workspace/register", "/workspace/subscribe", "/workspace/api-dashboard",
    "/workspace/chatavatar", "/workspace/video", "/workspace/contact-us",
    "/workspace/rodin", "/workspace/rodin/", "/workspace/rodin/xyz",
    "/workspace/rodin/tab/story", "/workspace/rodin/tab/asset",
    "/workspace/rodin/tab/a/b", "/workspace/rodin/tab/",
    "/workspace/omnicraft", "/workspace/omnicraft/viewer", "/workspace/omnicraft/foobar",
    "/workspace/oauth", "/workspace/oauth/device", "/workspace/oauth/device/extra",
    "/workspace/mcp", "/workspace/mcp/oauth", "/workspace/mcp/oauth/consent",
    "/workspace/mcp/oauth/consent/extra",
    "/workspace/imageto3d", "/workspace/imageto3d/",
    "/workspace/imageto3d/not-a-uuid",
    "/workspace/imageto3d/0bb1d4a9-e701-4871-ace0-9491e775238e",
    "/workspace/imageto3d/0bb1d4a9-e701-4871-ace0-9491e775238e/extra",
    "/workspace/imageto3d/48c8d17d-fb60-4bf6-be06-7388fca55e15",
    "/workspace/r", "/workspace/r/", "/workspace/r/testcode", "/workspace/r/testcode/extra",
    "/workspace/a", "/workspace/a/testcode",
    "/workspace/b/testcode", "/workspace/ref/testcode",
    "/workspace/settings", "/workspace/user", "/workspace/profile",
    "/workspace/history", "/workspace/download", "/workspace/api",
    "/workspace/worldgen", "/workspace/scene", "/workspace/hdri",
    "/workspace/terms", "/workspace/privacy",
]

def probe(path):
    req = urllib.request.Request(BASE + path, method="GET",
        headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read().decode("utf-8", "replace")
            return path, r.status, r.geturl(), len(body), "splash-brand" in body, r.headers.get("Location", "")
    except urllib.error.HTTPError as e:
        return path, e.code, "", 0, False, e.headers.get("Location", "") if e.headers else ""
    except Exception as e:
        return path, "ERR", str(e), 0, False, ""

with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    results = list(ex.map(probe, PATHS))

rows = [{"path": p, "status": s, "final": u, "bytes": b, "shell": sh, "location": loc}
        for p, s, u, b, sh, loc in results]
for r in sorted(rows, key=lambda x: x["path"]):
    tag = "SHELL" if r["shell"] else ("404 " if r["status"] == 404 else "OTHER")
    loc = f"  -> {r['location']}" if r["location"] else ""
    print(f"{r['status']:>4} {tag:<5} {r['path']}{loc}")
json.dump(rows, open("boundary-probe.json", "w"), indent=1)
