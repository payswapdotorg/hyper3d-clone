# DECISIONS — hyper3d-clone "make it real" build

Documented deviations from the work order / real-product behavior, with
reasons. Everything not listed here follows the work order or the
`recon/API-BLUEPRINT.md` contract verbatim.

## Pipeline

1. **Poster rendering — software rasterizer, not WebGL.** The runtime has no
   headless WebGL, so `lib/render-preview.ts` rasterizes the *actual* built
   geometry (z-buffer, barycentric normals, 3-light setup, 2× supersampling)
   into a deterministic 512×512 **PNG** via a hand-rolled encoder
   (`node:zlib`), instead of a webp poster from a WebGL canvas. The poster
   is a true render of the exported mesh.
2. **Turntable video skipped.** `video_url` is always `null` — the work
   order allows skipping webm ("use a static video_url=null and document
   it"). No fake video assets are served.
3. **GLTFExporter server shim.** three.js's GLTFExporter reads its own
   output Blobs through `FileReader`, which doesn't exist outside browsers.
   `lib/exporters.ts` installs a minimal, byte-faithful `FileReader`
   polyfill (readAsArrayBuffer/Text/DataURL via Blob async methods). The
   shim is server-side only; export bytes come from the stock three.js
   GLTF/OBJ/STL/USDZ exporters.
4. **FBX removed from exports.** The work order's export list is
   glb|gltf|obj|stl|usdz; three.js ships no FBXExporter, so the old UI's FBX
   button was dropped rather than faked. Exported formats: GLB, GLTF, OBJ,
   STL, USDZ — all byte-verified by tests.
5. **ProviderB is env-gated.** With no `MESHY_API_KEY` / `TRIPO_API_KEY` /
   `HYPER3D_API_KEY` in this deployment, ProviderB logs once and defers to
   ProviderA (ZAI LLM/VLM pipeline), which carries the entire golden path.
   No remote calls are simulated.
6. **Token usage.** Text-to-3D records the chat response's token usage.
   Image-to-3D estimates tokens from caption size (the vision response does
   not expose a usage block); recorded values are honest estimates, labeled
   as such here.
7. **`elapsed_seconds`** is the real wall-clock time of the paced pipeline
   (effort pacing included), matching how the real product reports engine
   time.

## Credits & pricing

8. **Ledger prices: 50 start / 10 agentic / 1 standard / first task free.**
   The work-order test contract mandates standard = 1; the real product's
   button reads "0.5 Credits". The clone charges 1 and labels the button
   accordingly ("GENERATE 1 Credit"). First task is a free preview (0) for
   any task type.
9. **Featured seeds don't count as generation history.** The 8 seeded
   gallery tasks are authored by the demo user but excluded from the
   free-preview task count (they are gallery content, not user history).

## API shape

10. **`GET /api/task/card/:uuid`** — the work order mandates GET; the real
    product POSTs to `/api/task/card/{uuid}`. Shapes mirror blueprint §4
    (task_uuid, type, prompt, step, image_url, video_url, usage, settings,
    model_preview_info, versions, user_state, author, generate_time, …).
    Additive field: `progress {message, percent}` while a task is running
    (drives the agentic status pills); `error` on failures.
11. **Auth is an HMAC-signed httpOnly cookie** (`h3d_session`), scrypt
    password hashes — a lightweight stand-in for the real product's Google
    OAuth + opaque Bearer tokens. Sign-in dialog wired to
    `/api/auth/sign-in|out`; `/api/user/get_info` mirrors blueprint §5.
12. **Files on disk, not signed CDN URLs.** Input images and posters are
    stored at `db/generated/{uuid}/` and served through
    `/api/task/{uuid}/preview` and `/api/task/{uuid}/input`. Exports are
    generated on demand from the stored spec (deterministic — same spec,
    same bytes). The blueprint's TOS-signed URLs are approximated by these
    stable API routes.
13. **The fake `/api/generate` route was deleted.** The old route generated
    a 2D image via the SDK and passed it off as a render; fake
    image-generation routes are forbidden. The only image generation now is
    the poster of the real geometry (see #1).

## Studio UI

14. **3D Editing / WorldGen render honest "coming soon in this clone"
    states.** No fake generation for those tabs. Remix Gen / Turbo Gen
    pseudo-modes from the visual clone were removed; the tab set is
    Image to 3D | Text to 3D | 3D Editing | WorldGen.
15. **ControlNet selector removed from the studio sidebar** (kept in the
    marketing hero, where it always was demo copy). The old studio
    ControlNet buttons had no backing behavior — dead UI is exactly what
    this build removes.
16. **Effort modal** appears on the first agentic GENERATE per studio
    session (blueprint §2.3 "on first GENERATE click"); afterwards the
    slider value is used directly. Standard generations use the sidebar
    slider only.
17. **Session persistence**: the studio relies on the server session
    (cookie), replacing the old localStorage mock (`token`/`user_uuid`).
    Guest generation is gone — unauthenticated GENERATE opens the sign-in
    dialog, like the real site.

## Ops

18. **Dev server reaper workaround**: `base/.zscripts/dev.sh` launches
    `next dev -p 3000` via nohup + disown, pins `DATABASE_URL` explicitly
    (a parent-directory `.env` from the workspace template would otherwise
    win Prisma's env walk), runs `prisma generate + db push`, and waits for
    HTTP 200.
19. **Test database isolation**: vitest runs with
    `DATABASE_URL=file:../db/test.db`, sequential file execution
    (`fileParallelism: false`), schema pushed in globalSetup. The AI clients
    are `vi.mock`ed in route tests; the generation engine is injectable
    (`setEngine`) so the full queue pipeline runs against a fake engine
    without network.
20. **E2E upload fixture**: a programmatically drawn PNG apple
    (`scripts/make-fixture-image.ts`) — the work order explicitly allows "a
    canvas png fixture" as the alternative to an SDK-generated image. The
    captioning and generation calls in the e2e were REAL ZAI VLM/LLM calls.
