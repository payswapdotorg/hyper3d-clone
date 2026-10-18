# Free Image-to-3D Engine Probe — Task 16-b

**Verdict: a free, no-signup, no-payment neural image-to-3D engine EXISTS and is production-integrable.**
`tencent/Hunyuan3D-2.1` (official HuggingFace Space) exposes anonymous, CORS-open REST endpoints producing watertight 264K-face meshes from a single image in ~32s. Textured full-pipeline is ZeroGPU-budget-gated (anonymous pool too small) — texture must be painted in-app. Recommended architecture: **browser-direct neural shape + client-side texture painting + existing in-house lathe engine as automatic fallback.**

## Probe results matrix

| Space | Endpoint | Anonymous result | Detail |
|---|---|---|---|
| tencent/Hunyuan3D-2.1 | `/shape_generation` | ✅ WORKS (×3 today) | ~32s wall / 17.7s GPU; rembg 1.0s + shape 16.7s; 264,118 faces / 132,060 verts; deterministic with `randomize_seed=False`; returns mesh GLB + stats + seed |
| tencent/Hunyuan3D-2.1 | `/generation_all` (shape+texture) | ❌ blocked | "requested GPU duration (270s) is larger than the maximum allowed … Subscribe to HF PRO" |
| tencent/Hunyuan3D-2 | `/shape_generation` | ✅ WORKS (agent run 08:56) | 13.3MB shape GLB; takes extra `caption` param |
| tencent/Hunyuan3D-2 | `/generation_all` | ❌ quota | "exceeded your ZeroGPU quota (135s requested vs. 94s left). Try again in 2:45:34" → anonymous pool is FINITE but REFILLING |
| tencent/Hunyuan3D-2mini-Turbo | any | ❌ space broken | api info 500 Internal Server Error |
| TRELLIS / TripoSR / InstantMesh / SF3D | — | not probed | Hunyuan family outperforms and already succeeded; shortlists captured in /tmp/hf_*.json if needed later |

## Verified working recipe (Python gradio_client)

`research/engine_call.py` — ran successfully end-to-end:
`Client("tencent/Hunyuan3D-2.1")` → `predict(image=file(img), steps=30, guidance_scale=5.0, seed=1234, octree_resolution=256, check_box_rembg=True, num_chunks=8000, randomize_seed=False, api_name="/shape_generation")`
Returns `(file, output_html, mesh_stats, seed)` — file arrives as `{'value': '/tmp/gradio/<hash>/white_mesh.glb'}`. `num_chunks` controls decimation: 8000 → 180KB mesh, raw → 4.7MB (v2.1) / 13.3MB (v2).

## Verified working recipe (plain REST — what our Node/browser code will use)

All against `https://tencent-hunyuan3d-2-1.hf.space`, **CORS verified** with `Origin: https://hyper3d-clone.vercel.app` (echoed back on upload, OPTIONS, and file download):
1. `POST /upload` (multipart `files=@img.jpg`) → `["/tmp/gradio/<hash>/img.jpg"]`
2. `POST /call/shape_generation` JSON `{"data":[{"path":"<path>","meta":{"_type":"gradio.FileData"}}, null, null, null, null, 30, 5.0, 1234, 256, true, 8000, false]}` → `{"event_id":"…"}`
   (params: image, mv_image_front/back/left/right, steps, guidance_scale, seed, octree_resolution, check_box_rembg, num_chunks, randomize_seed)
3. `GET /call/shape_generation/<event_id>` → SSE stream (`event: complete` / `event: error`; heartbeat lines start with `:`)
4. Mesh URL in complete payload: `/file=/tmp/gradio/…/white_mesh.glb` (4.7MB, `content-length` + CORS verified)

Zero-GPU endpoints (e.g. `POST /call/lambda {"data":[]}`) roundtrip cleanly — protocol mechanics independent of GPU quota.

## Quota model (critical for architecture)

- Anonymous ZeroGPU access = **finite refilling pool per client IP** (today: several shape gens worked back-to-back, then "94s left, refill 2:45:34", then jobs queue indefinitely / SSE `error null`).
- Implications:
  1. **Browser-direct calls** (from hyper3d-clone.vercel.app, CORS-allowed) give each USER their own IP quota — no shared-pool bottleneck, no Vercel function timeouts (generation is 30-90s).
  2. **Fallback is mandatory**: on SSE `error`, queue stall > N s, or fetch failure → fall back to the existing in-house lathe engine (already production-proven in Task 15). This mirrors the reference's tier system: Quality (neural, free) vs Fast (procedural, always available).
  3. Never proxy through our serverless functions: shared egress IP = shared drained pool + 60s function cap.

## Additional endpoint intel

- `/on_export_click(file_out, file_out2, file_type, reduce_face, export_texture, target_face_num)` → server-side format conversion + decimation (untested; client-side exporters already exist in the clone).
- `/generation_all` params identical to `/shape_generation`; v2 spaces additionally accept a `caption` text param.
- Multiview inputs (`mv_image_front/back/left/right`) exist on shape endpoints — pairs naturally with the reference's direction-label flow (11-label enum F/FL/FR/B/BL/BR/L/R/U/D/?; 4 usable here: F/B/L/R).

## Blocked / rejected alternatives

- HF PRO subscription (paid — operator constraint), ModelScope/fal/Replicate/Meshy/Tripo APIs (paid or need account signup; operator inboxes unreachable for email verification), running TRELLIS/Hunyuan locally (no GPU, ~4GB RAM box), using the reference's own web-session/credits to power the clone (ToS violation, fragile, wrong).

## Artifacts

- `engine_call.py` (shape, tested), `engine_call_textured.py` (blocked by quota — kept for post-refill retest), `out/hy21_run/` (run_meta.json: timings + mesh_stats + endpoints.json full API map), `out/*.glb` (3 valid meshes), `out/hy21_textured/run_meta.json` (the 270s GPU-budget error captured).
- Post-refill optional retest: v2 `/generation_all` (135s GPU budget) may fit a fresh anonymous pool → engine-side texture. Not required for the spec (client-side painting is quota-free and always available).
