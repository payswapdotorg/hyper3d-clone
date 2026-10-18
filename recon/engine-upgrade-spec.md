# Engine Upgrade Spec — Task 17 (image-to-3D parity, zero payments)

**Goal:** close the fidelity gap with hyper3d.ai's Rodin image-to-3D (current clone 4/10 vs reference 8/10) using ONLY free paths: a free public neural engine + our existing in-house engine, plus behavior parity from research. **Nothing paid, no new accounts, no API keys.**

**Inputs (read these first):**
- `research/rodin-behavior.md` — reference behavior + 13 ranked SPEC IMPLICATIONS
- `research/engine-probe.md` — engine verdict, verified REST recipe, quota model
- Repo: `/home/z/hyper3d-clone` (main @ ab45a08, 82 tests, DECISIONS.md has 30 entries — append, don't rewrite)

## 1. Engine architecture

### 1a. Quality tier = free neural shape (client-direct)
Browser (from our production origin — CORS verified) calls `https://tencent-hunyuan3d-2-1.hf.space` directly:
1. `POST /upload` multipart (`files=@<image>`) → server path
2. `POST /call/shape_generation` JSON:
   `{"data":[{"path":"<path>","meta":{"_type":"gradio.FileData"}}, <mvF|null>, <mvB|null>, <mvL|null>, <mvR|null>, 30, 5.0, <seed>, 256, true, <num_chunks>, false]}`
3. `GET /call/shape_generation/<event_id>` — SSE stream (heartbeat lines start with `:`; `event: error` or `event: complete` + `data:` payload with mesh `/file=` URL)
4. Fetch mesh URL (CORS-verified) → `white_mesh.glb` (watertight, ~264K faces at num_chunks high; 180KB at 8000)

Rules:
- `num_chunks`: default **50000** for usable quality (~1-2MB), **8000** for the stored/history copy.
- **Stall guard:** if SSE yields no terminal event within **75s** or stream errors → abort → fallback (§1c). Show elapsed time + stage label + Cancel while running.
- Space availability is not guaranteed (public free infrastructure — attribution + honesty required): DECISIONS entry + an "engine powered by Hunyuan3D-2.1 (free public demo)" note in the About/UI footer of the workspace, NOT onerous.
- Optional warm check: `GET /config` or a zero-GPU `/call/lambda` ping (<2s) before committing to the neural path; skip on failure.

### 1b. Texture painting (client-side, quota-free)
The neural engine returns an untextured (white) mesh. Paint it in three.js before preview:
- Load GLB; compute normalized device coords per vertex from a front orthographic projection (Hunyuan meshes are front-aligned to the input image by construction — VERIFY on apple; if orientation deviates, fit by bounding-box + axis-swap heuristic).
- Front-project the input image RGB onto vertices (sample the rembg'd/centered source image — reuse existing palette-sampling code paths from the lathe engine where possible).
- Back/side fill: vertical gradient from the sampled palette (existing Bailian caption palette endpoint) — smooth, no hard seams.
- Bake as vertex colors (`COLOR_0`), export path unchanged (GLB/USDZ/STL/OBJ/GLTF all fine with vertex colors).
- Keep the existing lathe engine's texturing as the fallback variant.

### 1c. Fast tier = existing in-house lathe engine (fallback)
- Reuse the production-proven Task-15 pipeline (Bailian caption → lathe → palette) as (i) the "Fast" tier choice and (ii) the **automatic fallback** when the neural path aborts/errors/stalls.
- On fallback: honest toast — "Neural engine is busy right now — generated with the Fast engine instead. Retry for higher quality." + one-click Retry (neural).
- Task record must store `engineUsed` ("neural" | "fast") + `fallbackReason` when applicable.

## 2. UX parity (from rodin-behavior.md implications)

1. **Tier toggle** on the generator: Quality (neural, "~1-2 min") vs Fast ("~15 s") — mirrors reference Turbo/Quality; default Quality.
2. **Pay-by-result confirm gate**: generation + preview FREE; "Confirm & Export — 1 credit" charges the user's credit balance and unlocks downloads/exports. If a credit ledger doesn't exist yet in the clone, implement minimal: users table balance (start 40, like the reference free tier), decrement on confirm, show balance chip in the workspace header, history cards show "1 Credit". Generate-again on the same task doesn't re-charge until confirmed.
3. **Direction picker (multiview, optional)**: after the main image upload, an optional "Add more views" affordance accepting up to 4 extra images labeled **Front / Back / Left / Right** (maps 1:1 to the engine's `mv_image_*` params; matches reference's direction-label concept). Skippable; single-image remains the default flow. Only for the Quality tier.
4. **Seed control**: seed number + dice (randomize) in advanced settings (both tiers; lathe uses it for variation).
5. **Exports**: add **OBJ** (OBJExporter) and **GLTF** (GLTFExporter) client-side → surface = GLB, GLTF, OBJ, USDZ, STL + PNG poster + Turntable WebM (reference has 6 mesh formats; we cover 5/6 — FBX omitted, note honestly in DECISIONS).
6. **History**: neural tasks store the ≤2MB decimated GLB (base64 in the task record or existing storage pattern — inspect repo and follow it), poster PNG, engineUsed, seed, credit charge.

## 3. Server-side (minimal, no heavy work server-side)

- Task API: accept `engine`, `seed`, `mvImages` (≤4 refs), new status transitions; persist neural result blob after client POSTs it (mesh + painted-copy) — never proxy the space through serverless.
- Keep Bailian captioning for: task naming in history, palette (texture fill), Fast tier.
- Credits: confirm endpoint (atomic decrement + floor at 0; if 0 → "out of credits" state with honest copy — free tier regenerations still allowed per pay-by-result semantics: preview free, export costs).
- No new env vars, no keys, no accounts.

## 4. Non-goals

- FBX export (proprietary, not feasible client-side), engine-side texture (`/generation_all` is quota-blocked — post-refill retest optional, do NOT block on it), R2/mesh CDN (follow existing storage pattern), reference-engine proxying (ToS).

## 5. Gates (all must pass)

1. `bun run lint` 0/0, existing 82 tests still pass + new suites: REST client (upload/call/SSE parse/stall-guard, mocked), texture painter (projection math, COLOR_0 bake), credit ledger (atomic, floor-0, no double-charge), direction-picker state.
2. Local e2e (existing :3213 pattern): apple image → Quality tier → neural OR documented-fallback path → textured preview renders → confirm charges 1 credit → all 7 exports byte-verified (GLB magic, USDZ zip, STL, OBJ text, GLTF json, PNG, WebM).
3. Fallback e2e: block the space domain via route interception → Fast engine delivers end-to-end with honest toast; no stuck states.
4. Production verify (orchestrator): repeat e2e on hyper3d-clone.vercel.app; VLM verdict on apple result target **≥6/10** (baseline 4/10, reference 8/10) — honest if the neural engine is quota-blocked at verify time (then verify fallback + retry).
5. Responsive + a11y pass on new UI (direction picker, tier toggle, confirm gate): keyboard paths, labels, no layout break; sticky footer intact.
6. Docs: DECISIONS.md entries (#31+: free-engine architecture, quota model, texture approach, credit semantics, FBX omission), README engine note.

## 6. Delivery

- Branch → commits to main (5-15 commits, conventional messages), push with the repo's existing PAT env, Vercel auto-deploys; verify healthz; report prod URL + commit range. Update worklog + mission-state (orchestrator handles kanban; worker appends worklog section).
