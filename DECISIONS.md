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

## Deployment adaptations (serverless / Vercel)

The worker's build targeted a long-lived node process (dev/standalone). The
Vercel deployment required the following honest adaptations, all verified by
the same test suites plus a live golden-path run:

21. **PostgreSQL + blob-in-DB.** sqlite/filesystem storage (Task rows plus
    `db/generated/{uuid}/` poster+input files) does not survive on serverless
    (ephemeral disk, no shared local state). Schema switched to Postgres
    (Neon); posters and reference inputs persist as Prisma `Bytes` columns
    (`Task.posterBytes` / `Task.inputBytes`) served through the same stable
    API routes. `postinstall: prisma generate` covers the Vercel build.
22. **AI backend selection (ai-clients.ts).** z-ai-web-dev-sdk requires a
    platform `.z-ai-config` (absent on Vercel). Backend chain: ZAI →
    OpenRouter (`OPENROUTER_API_KEY`; text =
    `meta-llama/llama-3.3-70b-instruct`, vision =
    `deepseek/deepseek-v4-flash-vision-exp`, both verified live: valid
    SceneSpec JSON / caption JSON) → deterministic fallback specs. When no
    backend resolves, `generateSpecFromPrompt` / `analyzeImage` degrade to
    their deterministic fallbacks — generation never hard-fails, and it is
    never faked (the fallback still builds real geometry).
23. **Queue is serverless-safe.** The fire-and-forget runner cannot rely on
    a warm process. Three mechanisms: (a) POST /api/task kicks the pipeline
    inside `after()` with `maxDuration = 60`; (b) the card poll runs
    `resumeStaleTask` — a task with a stale progress heartbeat (>10s) gets
    driven to completion by the poll itself; (c) **spec-first persistence**
    — the generated SceneSpec is written to the task row the moment it
    validates, so a resumed task finalizes (poster + DonePreview) from
    storage without re-billing the AI pipeline. Image inputs self-heal from
    `Task.inputBytes`. Cross-instance resume races are bounded: both racers
    converge on the same deterministic spec/poster (last-write-wins).
24. **Pace cap on serverless.** The artificial effort pacing (up to 80s for
    Extreme-High) is capped at 40s when `process.env.VERCEL` is set so one
    invocation can finish the pipeline; local dev keeps the faithful pace.
    The resume path skips pacing entirely.
25. **Test database**: dedicated Postgres (`TEST_DATABASE_URL`, wiped on
    every run by the vitest global setup) — the sqlite test DB from the
    worker's build was replaced together with the storage switch (#19).

26. **AI backend chain extended with Bailian (2026-10-18 parity pass).** The
    operator's live audit found production image-to-3D silently degraded to
    the deterministic fallback (a grey cube) — root cause: the OpenRouter
    key's credit budget hit zero (`total_credits: 0`), so every vision and
    text call 402'd and the catch-alls fired. Fix: a third backend,
    Bailian/Alibaba Model Studio (operator-provisioned key), reusing the
    OpenAI-compatible transport with intl-endpoint defaults
    (qwen-plus text / qwen3-vl-plus vision). Chain order is now
    ZAI → Bailian → OpenRouter → deterministic fallback, so a funded
    OpenRouter key still takes over automatically if Bailian is absent.
    qwen3-vl-plus was validated live: 5.5s apple caption with a lathe
    silhouette profile and image-sampled palette (#DC143C body, #6B8E23 stem).
27. **Lathe-first caption prompt.** The reference product's fresh run (same
    test image) captioned "A shiny red apple with a short stem" and produced
    a real organic mesh; the old prompt let weak models answer "A simple 3D
    object". The new CAPTION_SYSTEM_PROMPT demands object identification
    first, lathe silhouette profiles for organic bodies, cylinders/cones for
    attachments with explicit colors sampled from the image — matching what
    the reference's engine does for simple objects, within the clone's
    procedural pipeline. The deterministic fallback is now a neutral rounded
    pebble (lathe) instead of a grey box so a backend outage reads as a
    placeholder rather than a bug.
28. **Poster auto-framing.** The audit caught the preview poster rendering
    an "empty dark corner": the fixed camera eye (~3.6 units) was inside the
    normalized object's angular size for large objects — the render showed
    the cube's interior faces. The poster camera now derives its distance
    from the model's bounding sphere (fit + 18% margin), so every object
    frames correctly regardless of proportions.
29. **Turntable WebM export (parity feature).** The reference's outputs
    include a turntable.webm orbit video. The clone now records one full
    orbit client-side from the live WebGL viewer (canvas.captureStream +
    MediaRecorder, ~6s at autoRotateSpeed 10, 4 Mbps) and offers it as a
    "Turntable · WebM" download next to the format exports — a real video
    artifact of the user's actual model, not a stub. Server-side video
    encoding was rejected (no headless WebGL / heavy codecs on serverless).
30. **Rodin public API documented + seam reserved.** Reverse-engineered the
    reference's engine surface from the live product and docs.hyper3d.ai:
    api.hyper3d.com/api/v2 (Bearer, multipart /rodin with tier Gen-2.5-*,
    mesh_mode, quality, texture_mode, geometry_instruct_mode creative|
    faithful → jobs.subscription_key → /status → /download → GLB/USDZ +
    render.webp + turntable.webm; /check_balance for API credits). Verified
    live that API-key creation is subscribe-gated (free accounts get a
    subscribe-tip), so the clone keeps ProviderA as the engine and the
    RODIN_API_KEY seam in providers/index.ts documents the exact contract
    for a future real-engine pass when the operator enables the add-on.

## Session 2026-10-28 (continuation pass — t54 re-land + ControlNet)

31. **Light migration is dialect-aware.** The t53 re-land's
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS` is a Postgres-only form —
    on SQLite it is a *syntax* error (`near "EXISTS"`), not the
    swallowed "duplicate column" failure, so every local cold start logged
    a `[light-migration]` warning. `lib/light-migrate.ts` now probes
    `PRAGMA table_info("User")` on SQLite (`file:`/`:memory:` URLs) and adds
    the bare column only when absent; Postgres keeps `IF NOT EXISTS`.
    Regression suite `light-migrate.test.ts` covers both the no-op path and
    the heal path (drop column → fresh module → re-added).
32. **Connect Hyper3D MCP modal (parity for the topbar affordance).** The
    live workspace's topbar exposes "Connect Hyper3D MCP", which opens a
    setup sheet with two copyable blocks: an MCP setup instruction for AI
    coding agents (name `hyper3d`, Streamable HTTP
    `https://api.hyper3d.com/api/mcp`, OAuth) and the
    `npm install --global @hyper3d/cli` command. The clone's former
    "MCP&CLI" button was an honest stub toast — dead UI, against this
    build's own principle. It is now a real modal (`mcp-connect-modal.tsx`)
    with the same function: two copy-to-clipboard blocks (clipboard API
    with textarea fallback, per-button "Copied" state). The endpoint URL
    and package name are the public connection facts; the instructional
    wording is the clone's own, not the reference's marketing copy.
33. **Stale test contracts re-anchored (130 → 147 tests, 17 suites, all
    green).** Two tests had drifted from the shipped behavior after the
    workspace-parity commit: `exporters.test.ts` still expected `fbx` to be
    *rejected* (the ASCII FBX 7.3 exporter had since made it a first-class
    format — the rejection probe now uses `"3ds"` and a dedicated FBX
    structure test asserts the header/geometry blocks); and
    `direction-picker.test.ts` still expected the four-cardinal walk
    (`front → back → left → right`) although the picker had grown to the
    reference's eleven labels in reading order (`front-left` first) — the
    test now walks that order, asserts the 4-view cap, and checks the
    all-slots-filled null case with a hand-built state.
34. **ControlNet — real spatial constraints, not stubs (the reference's
    three conditioning tabs).** Live recon (2026-10-28): the reference's
    input cluster exposes "Bounding Box ControlNet" / "Voxel ControlNet" /
    "PointCloud ControlNet" tabs with W×H×L inputs (defaults 100/100/100);
    its full editor is login-gated. The clone's rail buttons were honest
    stub toasts; they are now a real editor (`controlnet-modal.tsx`) with
    the same three tabs: Bounding Box (W/H/L inputs + live proportion
    preview), Voxel (8×8 toggleable front-view grid), Point Cloud (16×16
    click-to-place anchors). **Engine honesty:** every scene is normalized
    to a fixed bounding box before poster/export, so absolute positions
    cannot survive — what the engine really consumes is (a) ASPECT — the
    constraint volume's W:H:L proportions, applied as a deterministic
    per-axis scale group wrapped around the generated spec (`aspectWrap`,
    measured from the real built extents via three.js Box3; uniform aspects
    skip the wrapper); (b) FILL — occupancy share of the drawing, from the
    marked bounds; (c) ANCHORS — placed cell/point count. All three are
    derived by `lib/controlnet.ts` (pure, 15-test suite), ride with the
    task (`POST /api/task` `controlnet` field → `settings.controlnet`), and
    act twice: the planner prompt is annotated
    (`constraintPromptLine` — proportions/occupancy/silhouette detail) and
    the returned spec is proportion-wrapped in the queue. Verified
    end-to-end: a 100×40×100 bbox flattened a mushroom house (root group
    scale [1, 0.286, 1], VLM read the poster as "squashed and flat"); an
    8-cell top-row voxel mark derived 200×25×25 and squashed a river stone
    to [1, 0.34, 0.43]. The neural (client-driven) path does not apply the
    wrap — the Hunyuan mesh is the browser's artifact; documented here.
    The constraint stays editable from the working-state sidebar (applied
    chip → reopens the editor; Remove clears it), since the empty-state
    input cluster is hidden once a task exists. Modal is mount-on-open
    (draft state initialized from props — no setState-in-effect).
35. **Golden path re-verified end-to-end locally** (2026-10-28): sign-up →
    40-credit wallet; text-to-3D with and without ControlNet constraints →
    DonePreview with real spec/poster; byte-checked GLB exports; neural
    pay-by-result path re-confirmed (mesh POST → confirm → exactly 1
    credit charged).

36. **OmniCraft toolbag made real — 4 live tools, 5 honest stubs** (2026-10-28,
    t56): recon of the reference showed the toolbag at /workspace/omnicraft/*
    with a nine-tool grid (Texture Generator, Image Enhancer, Image Remix,
    HDRI Generation, Rodin Search, Vector to 3D, Mesh Editor, Model Viewer,
    Format Convertor) and nav Features pages per tool. The clone previously
    had a static grid + a "separate product" stub toast. Now lib/omnicraft.ts
    is the single registry (same nine names, reference order) driving the
    /omnicraft landing grid, per-tool routes, the studio menu dropdown, the
    promo tile CTA and footer links; /workspace/omnicraft(/:tool) redirects
    resolve. Live tools: (a) **HDRI Generation** — a prompt-seeded
    *procedural* engine (lib/hdri.ts): time/weather/palette keywords pin the
    sky, FNV-1a + mulberry32 fill the rest (same prompt → same sky, forever),
    sliders always win; equirect painter with seam-free periodic-noise fbm
    clouds, sun disc/glow, calibrated coverage (measured fbm distribution:
    threshold 0.75−0.48·density), physical night deepening (palette darkens
    as the sun drops below the horizon — VLM verification caught the original
    day-bright-night bug), star field with size variety, and real image
    palette extraction (4-bit bucket quantization on the dropped image's
    pixels, in-browser). 360° preview uses the canonical panorama sphere
    (scale(-1,1,1) — a plain BackSide sphere mirrors the azimuth, which had
    aimed the camera away from the sun) with the camera aimed at the sun; 2K
    and 4K PNG downloads are both free (the reference gates 8K). VLM-verified
    for sunset/starry-night/stormy-morning. (b) **Vector to 3D** —
    SVGLoader → ExtrudeGeometry with depth/bevel/curve sliders and colors;
    the preview streams the exact GLB the downloads serve (normalizeForExport
    centers + uniformly scales — translate, not set, bug caught by test).
    (c) **Model Viewer** — the studio's real viewer pointed at local object
    URLs (drop GLB, never uploaded) or remote URLs. (d) **Format Convertor**
    — lists YOUR tasks (auth-gated), previews the exact export-endpoint GLB,
    six real format downloads; pay-by-result tasks show the confirm-first
    gate (buildCompactCard now passes pay_by_result top-level). The five
    remaining tools state honestly why they are not in the clone (each with
    its reason on the card and in the dropdown tooltip). 177 tests / 20
    suites green (+30); lint clean; all four tools browser-verified. A fourth
    environment reset wiped the working tree mid-session; all t56 work was
    rebuilt from the conversation record and pushed as 5049384.

37. **Features tree — the reference's 18 feature pages, honestly** (2026-10-29,
    t57): recon of the reference's features sitemap
    (landing-sitemap-features-en.xml) enumerated 18 pages + index: 5 core
    (text-to-3d, image-to-3d, worldgen, api, chatavatar), 2 AI media
    (image/video generators), MCP + 3 agent sub-pages (claude/codex/kimi),
    and 7 OmniCraft feature pages. The clone previously had NO /features
    routes — footer "Features" links and the Avatar/Video product tabs all
    fired toasts. Now: src/lib/features.ts (+3 content modules) is the
    single registry (18 pages, reference sitemap order) rendered through one
    shared server component (feature-page.tsx — breadcrumb bar with status
    chip, hero + CTAs, honest status panel, 3-step section, benefits grid,
    use-case cards, native-<details> FAQ, cross-links, closing CTA band)
    served by a catch-all /features/[...slug] route (generateStaticParams,
    per-page metadata) + a "Features matrix" index page grouped like the
    reference's. Status contract: 8 live (text-to-3d, image-to-3d, MCP×4,
    HDRI, SVG-to-3D — each CTA-ing its real surface), 1 partial (api — the
    app's own task/auth endpoints, honestly no key program), 9
    reference-only (worldgen, chatavatar, image/video generators, texture,
    enhancer, remix, search, mesh editor — full reference content + what the
    clone ships instead; no fake CTAs, asserted by test). OmniCraft feature
    statuses are pinned to the tool registry (live pages deep-link
    /omnicraft/{slug}). Also shipped: the reference's themed 404
    ("Reconstruction failed — this page slipped out of the mesh"),
    public/sitemap.xml (+robots.txt Sitemap line), studio footer FEATURES/
    PRODUCT columns now real links (OmniCraft toast was stale even before
    t56), and the Avatar/Video workspace tabs route to their honest feature
    pages instead of toasting. Note: site-header/site-footer components are
    currently unmounted legacy (the studio IS the landing) — their nav maps
    were updated anyway for consistency. 193 tests / 21 suites green (+16);
    lint clean; build SSGs all 18 pages; browser-verified: footer link click
    navigates, Avatar tab → /features/chatavatar, unknown feature → themed
    404; VLM-verified index + text-to-3d pages render the full anatomy.
