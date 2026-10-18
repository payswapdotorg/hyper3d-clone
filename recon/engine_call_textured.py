#!/usr/bin/env python3
"""Free-engine full pipeline: anonymous call to tencent/Hunyuan3D-2.1
/generation_all — shape generation + texture painting in one pass.

Usage:
    uv run --with gradio_client python3 engine_call_textured.py [image_path]

Outputs in out/hy21_textured/ : white_mesh.glb, textured_mesh.glb, run_meta.json
"""
import glob
import json
import os
import shutil
import sys
import time

from gradio_client import Client, file

SPACE = "tencent/Hunyuan3D-2.1"
IMG = sys.argv[1] if len(sys.argv) > 1 else "fixtures/apple.jpg"
OUT = os.path.join("out", "hy21_textured")
os.makedirs(OUT, exist_ok=True)


def file_value(x):
    """Extract a filepath from gradio return items (str or {'value': path})."""
    if isinstance(x, dict):
        v = x.get("value")
        return v if isinstance(v, str) else None
    if isinstance(x, str) and (x.endswith(".glb") or x.endswith(".obj")):
        return x
    return None


t0 = time.time()
c = Client(SPACE)
print(f"[{time.time()-t0:7.1f}s] connected (anonymous)", flush=True)

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
    api_name="/generation_all",
)
gen_dt = time.time() - t1
print(f"[{time.time()-t0:7.1f}s] generation_all done in {gen_dt:.1f}s", flush=True)

items = list(res) if isinstance(res, (list, tuple)) else [res]
print("components:", [repr(i)[:100] for i in items], flush=True)
files = [file_value(i) for i in items]
stats = next((i for i in items if isinstance(i, dict) and "model" in str(i)[:200]), None)

saved = []
for f in files:
    if f and os.path.exists(f):
        base = "textured_mesh.glb" if "textured" in os.path.basename(f) or (saved and not any("white" in s for s in saved)) else "white_mesh.glb"
        # simpler: keep original basename mapping
        dst = os.path.join(OUT, os.path.basename(f))
        shutil.copy(f, dst)
        saved.append(os.path.basename(f))
        print(f"SAVED {dst} ({os.path.getsize(dst)} bytes)", flush=True)

# fallback: fresh gradio cache entries
if not saved:
    fresh = sorted(glob.glob("/tmp/gradio/*/*.glb"), key=os.path.getmtime, reverse=True)[:3]
    for f in fresh:
        if time.time() - os.path.getmtime(f) < 600:
            shutil.copy(f, os.path.join(OUT, "cache_" + os.path.basename(f)))
            saved.append("cache_" + os.path.basename(f))
            print(f"RECOVERED {f}", flush=True)

meta = {
    "space": SPACE,
    "image": IMG,
    "generate_s": round(gen_dt, 1),
    "total_s": round(time.time() - t0, 1),
    "saved_files": saved,
    "mesh_stats": stats,
}
with open(os.path.join(OUT, "run_meta.json"), "w") as f:
    json.dump(meta, f, indent=2, default=str)
print(f"TOTAL {time.time()-t0:.1f}s anonymous end-to-end with texture", flush=True)
