#!/usr/bin/env python3
"""Free-engine proof of concept: anonymous gradio_client call to the official
tencent/Hunyuan3D-2.1 HuggingFace Space (no account, no token, no payment).

Produces a 3D mesh (GLB) from a single RGB image, near-Rodin class quality.

Usage:
    uv run --with gradio_client python3 engine_call.py [image_path]

Outputs land in out/hy21_run/ :
    white_mesh.glb  - generated mesh (num_chunks-decimated, watertight)
    run_meta.json   - timings, queue stats, seed, mesh_stats from the space
"""
import json
import os
import shutil
import sys
import time

from gradio_client import Client, file

SPACE = "tencent/Hunyuan3D-2.1"
IMG = sys.argv[1] if len(sys.argv) > 1 else "fixtures/apple.jpg"
OUT = os.path.join("out", "hy21_run")
os.makedirs(OUT, exist_ok=True)

t0 = time.time()
c = Client(SPACE)
print(f"[{time.time()-t0:7.1f}s] connected (anonymous) to {SPACE}", flush=True)

# Full endpoint dump for the integration spec
api = c.view_api(return_format="dict")
with open(os.path.join(OUT, "endpoints.json"), "w") as f:
    json.dump(api, f, indent=1, default=str)
for name, info in api.get("named_endpoints", {}).items():
    if name == "/shape_generation":
        continue
    params = [p.get("parameter_name") for p in info.get("parameters", [])]
    rets = [r.get("label") for r in info.get("returns", [])]
    print(f"  (endpoint) {name} params={params} returns={rets}", flush=True)

t1 = time.time()
res = c.predict(
    image=file(IMG),
    steps=30,
    guidance_scale=5.0,
    seed=1234,
    octree_resolution=256,
    check_box_rembg=True,
    num_chunks=8000,
    randomize_seed=False,
    api_name="/shape_generation",
)
gen_dt = time.time() - t1
print(f"[{time.time()-t0:7.1f}s] shape_generation done in {gen_dt:.1f}s", flush=True)

# returns: (file, output_html, mesh_stats, seed) — but be defensive about shapes
with open(os.path.join(OUT, "debug_res.txt"), "w") as f:
    f.write(repr(res)[:4000])
items = list(res) if isinstance(res, (list, tuple)) else [res]
mesh_f = None
html = stats = seed = None
for it in items:
    if isinstance(it, str):
        if it.endswith(".glb") or it.endswith(".obj") or it.endswith(".ply"):
            mesh_f = it
        elif "<" in it:
            html = it
    elif isinstance(it, dict):
        stats = it
    elif isinstance(it, (int, float)):
        seed = it
print("result components:", [repr(i)[:120] for i in items], flush=True)

meta = {
    "space": SPACE,
    "image": IMG,
    "connect_s": round(t1 - t0, 1),
    "generate_s": round(gen_dt, 1),
    "total_s": round(time.time() - t0, 1),
    "seed": seed,
    "mesh_stats": stats,
    "queue_hint_html": (html or "")[:400],
}
with open(os.path.join(OUT, "run_meta.json"), "w") as f:
    json.dump(meta, f, indent=2, default=str)
print("mesh_stats:", json.dumps(stats, default=str)[:600], flush=True)

if mesh_f and os.path.exists(mesh_f):
    dst = os.path.join(OUT, "white_mesh.glb")
    shutil.copy(mesh_f, dst)
    print(f"SAVED {dst} ({os.path.getsize(dst)} bytes)", flush=True)
    print(f"TOTAL {time.time()-t0:.1f}s anonymous end-to-end", flush=True)
else:
    # last resort: scan gradio cache for fresh glb
    import glob
    fresh = sorted(glob.glob("/tmp/gradio/*/*.glb"), key=os.path.getmtime, reverse=True)
    if fresh and time.time() - os.path.getmtime(fresh[0]) < 300:
        shutil.copy(fresh[0], os.path.join(OUT, "white_mesh.glb"))
        print(f"RECOVERED from gradio cache: {fresh[0]}", flush=True)
    else:
        print("NO MESH RETURNED — inspect debug_res.txt", flush=True)
        sys.exit(2)
