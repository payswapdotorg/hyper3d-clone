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

38. **Legal Center — the reference's 5 legal documents, rewritten honestly
    for this clone** (2026-10-29, t58): recon of the reference's legal
    sitemap (landing-sitemap-legal-en.xml) found an index + 5 documents
    (privacy, terms, refund, copyright-license, fulfillment) — while this
    clone's footer LEGAL column fired toasts. Now: src/lib/legal.ts (+
    legal-types.ts + legal-content.ts) is the single registry (reference
    sitemap order), rendered through one shared server component
    (legal-page.tsx — breadcrumb top bar, sticky TOC sidebar with anchor
    links, numbered sections, sibling cross-links, closing Legal Center
    band) served by /legal/[slug] (generateStaticParams + per-page
    metadata) + a "Legal Center" index with document cards. **The text is
    this clone's own, tethered to the real code by test**: the terms state
    the actual metering imported from credits.ts (50-credit signup grant,
    1 credit standard / 10 agentic, first task free, pay-by-result
    1-credit Confirm & Export charge — atomic and idempotent), the privacy
    policy describes the real auth mechanics (scrypt per-hash salt,
    HMAC-signed httpOnly SameSite=Lax cookie, 7-day Max-Age, one cookie
    total, AI-backend processing disclosure, zero trackers), the refund
    policy documents the two implemented automatic paths (cancel_refund in
    full; pay-by-result never charged before export) AND states the real
    limitation plainly — legacy creation-charged tasks that FAIL do not
    auto-refund, because no such path exists — rather than copying the
    reference's cash-refund process (this clone processes no payments;
    the membership overlay is parity chrome). Copying Deemos' legal text
    would have been both dishonest (describing money flows that don't
    exist here) and copyright-infringing; this records the equivalent
    coverage instead. Also shipped: public/sitemap.xml converted to
    ABSOLUTE URLs (sitemap protocol requirement — the t57 relative locs
    were a spec bug, caught while adding the 6 legal routes) and the
    studio footer LEGAL column wired to real links. 207 tests / 22 suites
    green (+14, including the ledger-tether assertions); lint clean; build
    SSGs all 5 documents; browser-verified: footer Privacy click navigates
    to /legal/privacy, unknown doc → themed 404; VLM-verified index (5
    cards) + privacy page (TOC + 11 numbered sections, no layout defects).

39. **Use-cases tree — the reference's 11 workflow pages, honestly
    statused** (2026-10-29, t59): recon of the reference's use-cases
    sitemap (landing-sitemap-use-cases-en.xml) enumerated index + 11 pages
    (3d-printing, animation, automotive-design, character-design,
    e-commerce, game-development, jewelry-design, mechanical-engineering,
    metaverse, nft-creation, vr-ar). The clone previously had NO
    /use-cases routes. Now: src/lib/use-cases.ts (+ use-case-types.ts +
    content modules A/B) is the single registry (reference sitemap order)
    rendered through one shared server component (use-case-page.tsx —
    breadcrumb bar, hero + CTAs, honest status panel, "…in three steps",
    benefits grid, discipline cards, native-<details> FAQ, cross-links,
    closing CTA band) served by /use-cases/[slug] (generateStaticParams,
    per-page metadata) + a grouped index page. Status contract, asserted
    by test: 10 workflows are **live** end-to-end (generation from prompt/
    image + the real six-format export row GLB/GLTF/OBJ/STL/USDZ/ASCII-FBX
    — including FBX, which t39-era engine2 work made real again), and
    **animation is partial** (meshes and exports real; rigging/skeleton/
    pose-picking absent — stated in the page's limits, not implied).
    Honesty rules the tests enforce: no page claims baked PBR texture-map
    sets (materials here are per-part color/metalness/roughness parameters
    — mesh-builder.ts buildMaterial); format mentions must match the real
    EXPORT_FORMATS set (no invented 3MF/DAE/DWG buttons); OmniCraft
    cross-links may only target LIVE tools (vr-ar deep-links the live HDRI
    generator); primary CTAs go to the real studio; credit numbers, where
    stated, must match the real metering (1 standard / 10 agentic / first
    free / 1 at Confirm & Export). Copying the reference's page copy would
    have imported claims this clone cannot back (rigging-ready, PBR maps,
    polycount targeting, remesh-to-budget) — every one of those is instead
    answered with the honest "not here, do it in your DCC" that the FAQ
    states. Registry exports were renamed to avoid the react-hooks/
    rules-of-hooks lint trap (useCaseBySlug → findUseCasePage; slug/route
    lists as const arrays) — functions starting with "use" read as hooks
    to ESLint in .tsx route files. Also shipped: studio footer USE CASES
    column wired to real links (the reference exposes use-cases in its
    header mega-menu; this clone's studio footer is the equivalent surface)
    and public/sitemap.xml +12 routes (43 locs total). 224 tests / 23
    suites green (+17); lint clean; build SSGs all 12 routes; browser-
    verified: footer "Game Development" click navigates to the page,
    unknown slug → themed 404; VLM-verified index (grouped cards, status
    chips), game-development (green panel, steps, FAQ), animation (amber
    PARTIAL chip) render without layout defects.

40. **Styles tree — the reference's 21 style pages, honestly statused**
    (2026-10-29, t60): recon of the reference's styles sitemap
    (landing-sitemap-styles-en.xml) enumerated index + 21 pages
    (abstract, anime, cartoon, cel-shaded, fantasy, flat, gothic,
    hand-painted, industrial, isometric, low-poly, medieval, minimalist,
    modern, organic, photorealistic, pixel-art, realistic, retro,
    stylized, voxel). The clone previously had NO /styles routes. Now:
    src/lib/styles.ts (+ style-types.ts + content modules A/B/C) is the
    single registry (reference sitemap order) rendered through one
    shared server component (style-page.tsx — breadcrumb bar, hero +
    CTAs, honest status panel, "…in three steps", "What makes a model
    read as [style]" signal cards, "[style] prompt recipes that work"
    with copy-paste-able prompts + honest notes, native-<details> FAQ,
    cross-links, closing CTA band) served by /styles/[slug]
    (generateStaticParams, per-page metadata) + a grouped "Style Matrix"
    index. Status contract, asserted by test: 17 styles are **live** —
    their core character (exaggerated ratios, chunky geometry, flat
    palettes, vertical silhouettes, smooth revolves) is expressible
    through the real levers: prompt-steered spec geometry (shape
    vocabulary/palette/proportions/segment counts) + per-part
    MeshStandardMaterial parameters + the real six-format export row;
    and 4 are **partial** — cel-shaded (no toon shading model),
    hand-painted (no texture painting), photorealistic (no baked PBR
    maps), pixel-art (no texture baking at all) — each page says the
    mesh and loop are real and the LOOK finishes in your DCC. Honesty
    rules the tests enforce: no baked-PBR/texture-map claims anywhere
    (materials are parameters — mesh-builder.ts buildMaterial); no
    polycount-targeting or LOD-generation claims (no such controls
    exist; any LOD/polycount mention must sit in a denial or DCC
    hand-off, and the low-poly page must contain "no polycount
    slider"); no style-lock/guaranteed-consistency claims (steering is
    prompt-level; the stylized page states "No style-lock" outright);
    voxel must disclose "no dedicated voxel remesher" (the look is box
    primitives the spec stacks, no .vox format); format mentions must
    match the real EXPORT_FORMATS set; OmniCraft cross-links only
    target LIVE tools; primary CTAs go to the real studio; credit
    numbers, where stated, match the real metering (1 standard / 10
    agentic / first free / 1 at Confirm & Export). Copying the
    reference's page copy would have imported claims this clone cannot
    back ("set a target polygon count", "up to 10 million polygons",
    "optional LODs", baked PBR maps, Sim Ready) — every one of those is
    answered with the honest "not here, do it in your DCC" that the
    FAQ states. Also shipped: studio footer STYLES column wired to real
    links (the reference exposes Styles in its header mega-menu; this
    clone's studio footer is the equivalent surface) and
    public/sitemap.xml +22 routes (65 locs total). 246 tests / 24
    suites green (+22); lint clean; build SSGs all 22 routes; local
    smoke: footer STYLES links present in studio HTML, unknown slug →
    themed 404.

## 41. t61 — Help Center: 33 honest articles, 6 topic hubs, real client-side search

The reference's help center (recon 2026-10-30 of hyper3d.ai/help +
landing-sitemap-static-en.xml) is an Astro page with a search box, a
"Popular articles" band, "Browse by topic" (six categories: Getting
Started / Account Settings / Billing / Credit / Features / Enterprise),
a "Live Chat Support" block, and 33 articles at /help/articles/[slug]
plus six category hubs at /help/[category]. The clone reproduces the
structure exactly — 1 + 6 + 33 = 40 routes — with the registry pattern
from t57-t60: `src/lib/help.ts` registry + three content modules +
shared server renderers (`help-center-page.tsx`, `help-category-page.tsx`,
`help-article-page.tsx`) + SSG routes with generateStaticParams +
per-page metadata + themed 404.

**The status contract is three-way, not binary.** Marketing pages
(features/styles/use-cases) split into live/partial; a help center
answers questions, and the honest answer to "can I buy credits" is a
third state: the feature does not exist here. 13 articles are `live`
(the answer describes something that fully works — grounded in real
constants: 50/1/10 pricing, scrypt+httpOnly+7-day auth, six export
formats, cancel_refund, 409 already_complete, 75s stall → Fast
fallback), 7 are `partial` (support channels, credit-history UI, model
settings, MCP sheet, import-into-tools, agentic tier, refunds — part
real, part absent, article says which), and 13 are `not-in-clone`
(languages, verification codes, password reset, plans, purchases,
plan changes, topology/LODs, ChatAvatar, WorldGen, workspace editing,
Mesh Editor, BANG/partial edit, enterprise). Every not-in-clone
article opens with the verdict ("No." / "You can't" / "There are no")
and names the nearest real path. The test suite asserts the exact
13/7/13 split, the exact slug set and the exact per-category counts
(6/2/4/6/14/1) against the reference's own category JSON.

**The search is real, not decorative.** The reference's search box is
reproduced as a client-side filter over the article registry
(title + description + category, substring, case-insensitive) with the
reference's own "No matching articles" empty state. The reference's
"Live Chat Support" block became an honest "Support" section that
states there is no live chat, no widget and no queue — a fake chat
window would be a lie with a timeout.

**Copy discipline:** all 33 titles/descriptions/answers/bodies are the
clone's own text (the reference's article JSON descriptions were used
only to understand topic coverage, never quoted). Honesty rules the
tests enforce: credit numbers must match the imported constants
(INITIAL_BALANCE/STANDARD_COST/AGENTIC_COST); billing articles must
say "no plans and no prices" / "no payment processing" / purchase
answer starts "You cannot"; auth articles must name email+password,
scrypt, httpOnly and the 7-day cookie and state "no password-reset";
topology must say "no polycount slider" and "no LOD"; the HDRI article
must keep the procedural-not-AI wording; the MCP article must carry
the same endpoint the real modal ships (api.hyper3d.com/api/mcp —
asserted by reading mcp-connect-modal.tsx); export articles must name
exactly the real EXPORT_FORMATS; related links must resolve against
every registry (help/articles, help categories, features, styles,
use-cases, legal — note the legal doc slug is fulfillment, not
delivery — live OmniCraft tools only) or the studio root.

Also shipped: studio footer HELP column (Help Center / Getting Started
/ Credit & billing / Troubleshooting / Scam safety — all real routes,
no toasts) between PLUG-INS and LEGAL, and public/sitemap.xml +40
routes (105 locs total). 269 tests / 25 suites green (+23); lint
clean; build SSGs all 40 routes; local smoke: index renders hero +
search + popular + topics + no-live-chat block, article renders the
short-answer box with the real numbers and status chip, footer HELP
links present in studio HTML, unknown article/category → themed 404.

## 42. t62 — the last five landing routes: pricing, prompts, switch, event — full sitemap parity

Recon 2026-10-30 (landing-sitemap-static-en.xml + VLM screenshot
analysis of the live pages): after t61 exactly five reference URLs
remained uncovered — /pricing, /3d-prompts, /switch,
/switch/makerworld, /event/chroma-awards. t62 covers all five, which
brings this clone to 100% parity with the reference's English landing
sitemap (110 locs). Same registry pattern as t57-t61 but singleton
pages, not trees: `src/lib/landing.ts` registry + landing-types.ts
contracts + three content modules + four shared server renderers
(`landing-shared.tsx` shell + pricing/prompts/switch/event views) + SSG
routes (the two dynamic ones, /switch/[slug] and /event/[slug], source
params from the registry; /event deliberately has no index because the
reference's sitemap has none — bare /event 404s).

**The five honest inversions.** /pricing: the reference sells five
tiers with a monthly/yearly toggle and a comparison table; the clone
reproduces the anatomy (highlighted plan card, tier cards, comparison
table, pricing FAQ, closing CTA) with ONE real card — "Every account,
$0 forever" — the four paid tiers shown once each with a NOT HERE chip
and a nearest-real link, the comparison table replaced by the real
price list (signup 50, preview 0, confirm 1, agentic 10, cancel
refunded, buy-more "you can't"), and FAQ answers that match the help
center's billing articles word for word. /3d-prompts: the reference
sorts prompts by the AI model that wrote them with community authors
and YouTube embeds; the clone ships 15 real copyable prompts (the three
featured are the studio's own placeholder prompts, asserted verbatim
against studio.tsx in the tests) across four categories, a real
clipboard-write copy island (the page's only client JS, the same
one-island discipline as the help center's search), the reference's
three-step how-to with the real costs, and a note stating plainly that
no gallery, no model filter, and no videos exist here. /switch and
/switch/makerworld: every offer mechanic (profile-link checker, bio
codes, free months, model-count tiers) gets a NOT HERE row with the
real reason; the makerworld table answers the reference's print claims
honestly (watertight "Not promised", color separation "Not here",
10M faces "No", STL "Yes — really" — anchored to EXPORT_FORMATS
containing stl, and "no polycount slider" asserted like the styles
tree); the reference's testimonials are dropped rather than faked and
the table says why in one row. /event/chroma-awards: the reference
gives Chroma Awards entrants a free month of a paid plan before a
deadline; the clone inverts all four promises (no partnership, no
codes, no deadline, backed by nothing but its own codebase) and
re-points the workflow picker at the real feature pages.

**Copy discipline (test-enforced, 27 new tests):** pricing numbers must
match the imported constants (INITIAL_BALANCE/STANDARD_COST/
AGENTIC_COST); "no pricing tiers"/"no purchase flow"/"no payment
processing" must appear; the four tier names exactly
Creator/Business/Enterprise/Education with why-text matching
/^(no .*(plan|tier|program|verification|deployment))/i; at least three
FAQ answers must open "No." or "You cannot."; featured prompts must
appear verbatim in studio.tsx; every prompt is lowercase comma-prose;
the note must say "no community gallery"/"no model-name filter"/"no
video embed"; switch offer points must open "Not here." (one honest
exception: the migration-not-transfer point); event promises must open
"There is no/are no/This clone is backed"; the event affiliation FAQ
must open "No."; every CTA/cross-link on all five pages resolves
against the same isKnownRoute family as help.test.ts extended with the
landing routes; sitemap asserts 110 <url> entries and the five new
absolute locs; footer asserts ["Pricing", "/pricing"] with no
stubToast; SSG routes must source params from registries, not literals.

Also shipped: studio footer PRODUCT column gains the Pricing link
(the reference exposes Pricing in its header nav; this clone's studio
footer is the equivalent surface) and public/sitemap.xml +5 routes
(110 locs total). 296 tests / 26 suites green (+27); lint clean; build
SSGs all five new routes; local smoke: all five 200, unknown
switch/event slugs → themed 404, pricing HTML contains "One plan. Zero
dollars." + 50/1/10 + "you can't", prompts HTML contains the featured
prompt text and Copy buttons, footer Pricing link present. Production
(Vercel dpl_CVCRiQHbLoCnK5dmpQWZYL5s8faJ, READY): all five routes 200,
unknown slug 404, sitemap.xml serves 110 locs, footer Pricing href
present, VLM QA of /pricing + /3d-prompts + /switch/makerworld
screenshots: layouts clean (plan card readable, prompt grid with mono
boxes and Copy buttons aligned, NOT HERE rows and tables readable, no
overflow or contrast defects).

## 43. t63 — sub-categories tree: the three collection pages, honestly inverted

Recon 2026-10-30 (landing-sitemap-sub-categories-en.xml + live-page
anatomy of /sub-categories/{dark-fantasy,nsfw-content,roblox}): the
reference ships exactly three leaf pages and NO index (bare
/sub-categories 404s — same shape as /event). Each page is a tagged
marketplace collection: "Browse by Tag" chips under /tags/*, a
"Featured Free … 3D Models" asset grid, a "Generate Custom …" CTA into
Rodin, "Also in <Parent>" sibling collections with model counts
("Wizards & Magic Users 88 models"), "You May Also Like" category
links, and a short FAQ.

t63 reproduces the anatomy and inverts the marketplace honestly. Same
registry pattern as t57-t62 (`subcategory-types.ts` contract +
`subcategory-content.ts` content + `subcategories.ts` registry +
`subcategory-page.tsx` shared server renderer + `/sub-categories/[slug]`
SSG route; generateStaticParams from the registry, per-page metadata,
unknown slug → themed 404, and deliberately no index page).

**The three honest inversions.** dark-fantasy ("generatable"): the
collection is not here, but the theme steers the real generator —
silhouette vocabulary over the shape grammar, per-part color/metalness/
roughness as real MeshStandardMaterial parameters, six real exports;
limits state no tagged marketplace, parameter materials (not baked
dark-fantasy texture sets), no style-lock, no per-asset terms. The
"Also in Fantasy & Mythology" parent re-points at real siblings
(/styles/gothic, /styles/fantasy, /styles/medieval,
/use-cases/character-design, /use-cases/game-development). roblox
("generatable"): low-poly/voxel steering is real, FBX and OBJ are among
the six real exports, and the page makes NO import-compatibility
promise — "whether Roblox Studio accepts a mesh is Roblox Studio's own
import tooling's call", plus the tree's established "no polycount
slider" / "no LOD generation" claims; "Also in Gaming" re-points at
/styles/low-poly, /styles/voxel, /styles/pixel-art and the
game-development/animation use cases. nsfw-content ("absent", the
tree's first rose status): the entire category does not exist here —
no NSFW collection, no NSFW tags, no NSFW mode, no per-asset licenses;
the page exists to say that flatly and route to what is real (the
general-purpose generator, the legal center, the help center's
scam-safety article). It is the only page with no alsoIn section,
matching the reference's own shape.

**Copy discipline (test-enforced, 21 new tests):** every "Featured
Free …" body opens "Not here."; every "Browse by Tag" intro opens "Not
here" and denies the tag system; the reference's model-count pattern
("\d{2,4} models") appears nowhere; the nsfw FAQ's collection and mode
answers open "No."; the roblox page contains "no polycount slider" and
matches /no LOD generation/i, never promises Roblox compatibility, and
must name Roblox Studio's own tooling as the decider; format claims
resolve against EXPORT_FORMATS only (FBX/OBJ asserted on roblox; no
3MF/DAE/DWG/DXF/PLY/RBXM inventions); credit numbers where stated must
carry 50/1/10 together (INITIAL_BALANCE/STANDARD_COST/AGENTIC_COST);
"No style-lock" is hyphenated (the styles-tree convention that keeps
the negative style-lock regex clean); every href on every page resolves
against a composed isKnownRoute that validates deep links against the
real registries (styles, use-cases, features, help articles, legal,
live OmniCraft tools, sibling sub-categories, /pricing, /3d-prompts);
primary CTAs all open the real studio; OmniCraft links target live
tools only; the three pages interlink (each links a sibling).

Also shipped: public/sitemap.xml +3 routes (113 locs total — the
count assertions in help.test.ts and landing.test.ts moved to 113).
317 tests / 27 suites green (+21); lint clean; build SSGs all three
routes (111 static pages); local smoke: all three 200 with expected
markers (H1, status chips, "Not here." bands, "no polycount slider",
Generate and Download CTAs, Also-in sections), bare /sub-categories and
unknown slugs → themed 404, sitemap.xml serves 113 locs.

## 44. t64 — the tools tree: 203 honest converter/viewer/image-to routes

Recon 2026-10-30 (landing-sitemap-tools-en.xml + live-page anatomy of
/tools/converter/3ds/to/dae, /tools/viewer/glb, /tools/image-to-glb):
the reference ships exactly 203 tools routes — /tools/converter (index)
+ 178 from/to pair pages (25 source formats), 8 flat
/tools/image-to-{format} pages, /tools/viewer (index) + 15 viewer format
pages — and no bare /tools (it 404s, like /event and /sub-categories).

t64 reproduces all 203 routes with computed honesty. New modules:
tool-formats.ts (the format fact table: 6 real export formats, 10 image
sources, CAD/DCC/print formats with per-format hereNotes; REAL_FORMAT_LIST
derived from EXPORT_FORMATS so enumerations cannot drift),
tools-registry.ts (the 178 reference pairs as data + the status
functions — converterPairStatus/viewerFormatStatus/imageToStatus — all
COMPUTED from the real facts, never hand-set), tools-content.ts (the
builders: every leaf def is generated from registry + facts),
tools-index-content.ts (the two index pages), tool-page.tsx + 
tools-index-pages.tsx (one shared renderer family), and one catch-all
route src/app/tools/[...slug]/page.tsx whose generateStaticParams emits
exactly the registry's 203 param sets; unknown shapes and invented
pairs (e.g. glb/to/ply) 404 into the themed page.

**The honest census, computed and test-pinned.** 24 of the 178 pairs
run for real ("task-export": both sides among the six export formats —
the live Format Convertor re-exports YOUR generated tasks; the pages
never claim arbitrary-file upload and state the auth gate and the
nothing-extra re-export cost). 46 pairs carry a real generative path
("generative": image source + real export target — always labeled
"generation, not conversion" with the 50/1/10 credit numbers; the one
genuine exception is svg→glb, which names the live Vector to 3D tool
as a true local conversion, CTA to /omnicraft/vector). 108 pairs do
not exist ("not-here": the computed reason — exporters ship exactly six
formats, no CAD support anywhere, no arbitrary upload — plus the
nearest-real works). Viewer: GLB and GLTF are live (the local Model
Viewer's own contract: parsed in the browser, never uploaded, orbit +
material modes + live triangle count); the other 13 say why not — the
DCC four get the studio's own published path ("generate or import
first, then use the Format Convertor"), the CAD five get "no CAD
support anywhere". Image-to: the six real export formats are live
generative pages (Rodin image mode + export); 3mf/dxf are not-here.

**Copy discipline (test-enforced, 18 new tests):** route parity is
pinned (203 unique routes = 1+178+8+1+15, zero missing, zero extra);
the census is asserted (24/46/108); task-export pages must mention
"generated tasks", "task-based", "No arbitrary … upload" and "nothing
extra", and must never match drag-file/upload-your-file patterns;
generative pages must match /generation, not conversion|not a
conversion/ (svg→glb exempt with its own dedicated test) and carry
50/1/10 together wherever credits appear; not-here pages must open
with a computed-reason pattern and never describe a running
conversion; the six-format enumeration is REAL_FORMAT_LIST, asserted
equal to the EXPORT_FORMATS-derived join; no invented formats anywhere
(RBXM/RBXL/ABC/MD2/WRL/X3D/AMF/3DXML absent; every "export(s) as/in/to
X" target is a real format name); every href on every page resolves
against the composed route set (tools routes, live OmniCraft tools,
real feature pages, studio root); live viewer pages must state the
local contract; the sitemap asserts all 203 absolute tools locs and
316 <url> total (help.test.ts, landing.test.ts and subcategories.test.ts
counts moved to 316); the catch-all must source params from the
registries with no smuggled literals.

Also shipped: /tools/converter renders the honest matrix — the census
as three status cards (green runs / amber generates / grey does not
exist) above all 178 pairs grouped by source format, each chip
status-colored and linking its page; /tools/viewer lists the 15 formats
with LIVE/not-here rows. 335 tests / 28 suites green (+18); lint
clean; build SSGs all 314 pages (111 + 203) after extending
ToolStatus with "task-export" (the build caught the renderer's missing
STATUS_META entry — statuses are now a four-key union);
local smoke: every route type 200 with expected markers, bare /tools
and invented pairs 404, sitemap 316 locs, converter index shows the
24/108 census.

## 45. t65 — the blog tree: 778 routes, 55 written, 723 honestly marked

Recon 2026-10-30 (landing-sitemap-blog-en.xml + live-page anatomy of
/blog, /blog/category/game-development, /blog/page/2, /blog/rss.xml, and
four articles): the reference ships 778 article routes plus the index in
its blog sitemap, 12 category hubs and 20 pagination pages live but
UNSITEMAPPED, and an RSS 2.0 feed. The articles themselves are an AI
content farm — the tells are visible in their own HTML: the phrase
"which is relevant when working with what is glb file" repeated
mid-sentence through every section, boilerplate "Ethical Considerations"
chapters in game-guide posts, and invented mod lists for games with no
mod support. The catalog splits ~258 core-3D topics from ~506 game-guide
posts targeting third-party Steam titles, plus 7 reference-company news
posts and 6 non-3D SEO strays (CDR/DWG→PDF, soundboards, overclocking,
upscalers).

t65 reproduces all 778 routes with a two-tier honesty contract. New
modules: blog-types.ts (the contract), blog-registry-data.ts (GENERATED
by scripts/gen-blog-registry.py from the fetched sitemap — 778 slugs
plus four curated sets; regenerate, never hand-edit),
blog-registry.ts (families, computed categories, derived titles, the
catalog order, pagination math — census computed at module load, never
hand-set), blog.ts (categories with honest blurbs, helpers, the RSS
builder), blog-content-a..e.ts (the 55 written articles:
overview/credits 12, account/support 9, tutorials 11, formats 13,
workflows 10), blog-page.tsx + blog-index-pages.tsx (the shared
renderers), and five routes: /blog, /blog/page/[page] (2..20),
/blog/category/[slug] (the 12 hubs), /blog/[slug] (all 778),
/blog/rss.xml (force-dynamic, origin-derived).

**The census, computed and test-pinned: 55 written / 7 reference-news /
204 core-filler / 6 off-scope / 506 game-filler.** Written pages get the
full anatomy (breadcrumb, lede, "On this page" TOC, sections, FAQ
details, related chips, three-way status chip like the help tree).
Not-written routes get the honest page: a family banner (GAME-GUIDE SEO
/ REAL 3D TOPIC / REFERENCE NEWS / NOT EVEN A 3D TOPIC), the computed
reason (game-filler pages name the content-farm practice and its tells;
core-filler pages say "not yet written, here is the written set";
reference-news pages say a clone has no company news; off-scope pages
name adjacent-search bait), the parity note, and nearest-real links —
never a TOC, never an FAQ, never fake prose. Game-guides are
deliberately uncategorized, mirroring the reference's live pages
(verified: game articles carry no category badge; category hubs list
core articles only).

**The 55 written articles anchor to code, not vibes.** Credits articles
quote INITIAL_BALANCE 50 / STANDARD_COST 1 / AGENTIC_COST 10 /
CONFIRM_COST 1 and the cancel-route refund semantics (pay-by-result
never charged; legacy charged → refunded in full). Auth articles quote
the scrypt+session-cookie contract and the absence of any mailer.
Tutorials map the reference's Rodin/ChatAvatar/WorldGen/BANG/MCP flows
to what runs here (two live modes, HDRI fully local procedural, MCP
modal real, WorldGen/BANG/avatars reference-only). Format explainers
(what-is-glb/obj/stl/fbx/3mf/dxf/ply/usdz + five comparisons) are real
technical writing anchored to the six exporters — DXF/3MF/PLY articles
state "real format, no writer here". During writing, one real bug was
found and fixed: the sign-up route granted a literal 40 credits against
every other surface's 50 — it now imports INITIAL_BALANCE (the t65
anchor fix).

**Copy discipline (test-enforced, 30 new tests):** route parity is
pinned (778 exact-set, no dups, no reserved segments — /blog/page,
/blog/category, /blog/rss.xml must 404 as article slugs); the census
sums to 778; written articles must have unique slugs/titles, 2-4
sections of ≥120-char paragraphs, 2-4 FAQs, 2-5 related links resolving
against the composed route set (all OmniCraft routes count — honest
status pages are real pages); no article may contain the reference's
AI-spam tells ("which is relevant when working with", "ethical
considerations", "first-hand experience"); billing articles must carry
50 credits / 1 credit / 10 credits together; pagination math is pinned
(40/page, 20 pages, 19×40+18, written-first ordering); RSS carries
exactly the 55 written items with RFC-822 dates and never a filler
route; the sitemap asserts 779 blog locs and 1095 <url> total with
category/pagination/rss deliberately absent (reference parity); route
files must source params from the registries; the studio footer's HELP
column routes to the blog.

Shipped alongside: the studio footer gains Blog + What is Hyper3D
links. Build SSGs 1124 pages (314 + 810 blog) in ~11s; local smoke:
every route type 200 (written, filler, news, off-scope, category, page,
rss), /blog/page/1 and /21, bare /blog/page and /blog/category,
unknown slugs/categories 404; rss.xml serves 55 items; filler pages
contain zero <details>. 365 tests / 29 suites green (+30); lint clean.

## 46. t66 — the localized landing tree: 5,975 routes, honestly router-shaped

Recon 2026-10-30 (landing-sitemap-index.xml): the reference ships its
whole landing tree in 12 languages — EN unprefixed plus zh, de, ja, ko,
ru, pt, fr, es, ar, tr, it — with per-family per-locale sitemaps. The
localized trees are NOT copies of the EN tree: 542-545 routes per locale
(static 45 — no /event; features 19, tools 203, use-cases 12, styles 22,
legal 6 — EN slugs verbatim; sub-categories only for ja/ko/pt/es/tr with
locale-only slugs ko/insects-bugs, es/firearms, tr/rocks-minerals that
have no EN route at all; blog ~234-235 articles, every slug suffixed
"-{loc}"). Two reference quirks are mirrored verbatim: the help article
use-bang-and-partial-edit is renamed use-bang-and-partial-edit-{loc} in
zh/de/ja/ko/ru/fr/es (pt/ar/tr/it keep the plain slug), and the ar/tr
blog sitemaps carry double-suffixed oddballs
(ai-game-character-creator-zh-ar, what-is-ply-file-zh-tr). Everything
above is GENERATED data: scripts/gen-locale-routes.py fetches the
reference's sitemaps, validates the structure, and writes
src/lib/i18n-locale-data.ts — regenerate, never hand-edit.

**The honesty contract is two-tier.** Tier 1, genuinely translated: the
page chrome — top bar, family labels, locale-home hero, hub intros,
status chip labels, the honest-untranslated notice, language switcher,
footer — hand-written per locale in i18n-messages.ts (11 packs against
one typed contract; the reference machine-translates everything, and no
machine-translated prose is faked here). Tier 2, honest router pages:
long-form content stays English. Every localized deep page shows the EN
title, the honest status where the EN registry has one, and a notice in
the locale's own language stating that the complete text — sections,
FAQs, every code-anchored claim — lives at the English original, with a
link. Localized pages never render translated article bodies, TOCs, or
FAQs. Locale-only routes (insects-bugs, firearms, rocks-minerals) get
the amber variant: the reference ships them only in localized sitemaps,
there is no English original, and the page says exactly that.

**Canonicals point at the English originals.** The reference
self-canonicalizes each localized URL — correct for translated content,
wrong for honest router pages whose content lives elsewhere: localized
pages canonicalize to their EN href while carrying the reference's full
13-link hreflang alternate set (12 languages + x-default). One
deviation is deliberate: <html lang> stays "en" (the root layout is
shared with the EN tree and the studio app; restructuring into multiple
root layouts would churn 40 route files for one attribute), so each
locale page scopes its content with a lang/dir wrapper — Arabic runs
RTL inside it.

Hub card lists are capped at 60 links (features 19, styles 22, help 39,
legal 5, viewer 15 list their routes; the 178-pair converter matrix and
the 234-article blog hubs stay count + EN link, where the real indexes
live). The studio's Globe icon, previously a decorative toast, is now a
real 12-language menu routing to the locale homes.

Copy discipline (test-enforced, 26 new tests → 391 / 30 suites): every
generated param resolves (zero dead routes across all 5,975); every
article links a real EN route (checked against the sitemap's EN
section); blog slugs all -{loc} suffixed; oddballs pinned verbatim;
per-locale totals pinned (zh 542 … ko/es 545, 5,975 total); no
/{loc}/event or /{loc}/omnicraft; packs cover the identical key set
with no empty strings; the sitemap carries exactly 7,070 <url> (1,095
EN byte-preserved + 5,975 localized — the generator,
scripts/gen-sitemap.ts, refuses to write on EN drift). One build fix
during landing: optional catch-all generateStaticParams entries must
carry the slug key consistently (slug: [] for locale homes) or Next
prerenders nothing — mixed key shapes silently fell back to
server-rendering; the consistent shape SSGs all 7,099 pages in ~56s.
Lint clean.

## 47. t67 — the crawler surface: 90-child sitemap index, JSON-LD, full OG cards, robots.txt

Recon 2026-10-30 of the reference's served HTML found four surfaces the
clone did not carry: (1) robots.txt with 13 disallow rules and an
absolute Sitemap line (ours said only `Disallow: /api` plus a
spec-invalid relative `Sitemap: /sitemap.xml`); (2) a split sitemap —
/sitemap.xml and /landing-sitemap-index.xml are both sitemapindexes
over 90 per-family-per-locale children (static×12, features×12,
tools×12, use-cases×12, styles×12, legal×12, sub-categories×6, blog×12)
while ours was one 7,070-URL monolith; (3) a rich JSON-LD layer — a
six-node @graph on the homepage, nine blocks on feature pages, seven on
use-case pages (Service among them), five on tool pages (WebApplication
/ HowTo / FAQPage / ItemList), Article on help pages, CollectionPage /
BlogPosting on the blog; (4) full link-preview cards on every page
(og:title/description/url/image/image:alt + self-canonical) where our
routes emitted only title + meta description.

**The sitemap split keeps every hand-tuned value.** The t57–t66 EN
priorities were lifted out of the retired monolith path-by-path into
scripts/gen-sitemap-split.ts (explicit outlier map + per-family
defaults; gen-sitemap.ts is deleted, superseded). Family partitioning
mirrors the reference exactly — help rides in static (46 reference
routes + this clone's /omnicraft + 4 live tools = 51), event lives in
static as EN-only, sub-categories get 6 locale files. hreflang
alternates inside each <url> are computed from resolveLocalePage()'s
enHref — the same resolver the localized pages use for canonical links,
so sitemap and page-level hreflang cannot disagree. The reference's
alternate quirks reproduce verbatim, census-pinned: sub-categories
carry zero alternates; blog articles carry 12+x-default while the blog
hubs carry 12 without; only ~234 of 779 EN blog articles have localized
mirrors at all (543 are EN-only: 2 links; use-bang-and-partial-edit
exists in 7 locales: 9 links; free-stl-files-for-3d-printing misses zh:
12) — the generated blog-en census {2:543, 9:1, 12:2, 13:233} matches
the reference's byte-for-byte. One honest deviation: child entries
carry no <lastmod> — this clone does not track per-URL modification
dates and will not fabricate them (the reference's own coverage is
partial: 7/46 static, 10/203 tools); the two index files carry the
fixed regeneration stamp.

**JSON-LD is generated from the same defs the pages render.**
src/lib/schema-org.ts builds every node type the reference ships
(Organization, WebSite, WebPage, WebApplication+free-Offer, Service,
HowTo, FAQPage, ImageObject, ItemList, BreadcrumbList, Article,
BlogPosting, CollectionPage) and <JsonLd> renders them server-side —
crawlers do not execute JS. FAQ counts equal the registry's faq arrays,
HowTo steps equal the workflow arrays, breadcrumbs resolve against the
registries, WebApplication offers price 0 USD (true here: free credits,
no payments), and not-written blog routes carry no BlogPosting because
there is no article to describe. The og-banner ImageObject honestly
credits Deemos — the hotlinked banner is their asset (the t53 pattern);
license/acquireLicensePage point at this clone's real /legal/terms.
Breadcrumb shapes follow the reference per family (features: Home →
page; use-cases: Home → Use Cases → page; help: Help Center → topic →
article; blog: Blog → category → post) with one deliberate fix: the
reference's tool breadcrumb labels its first crumb "Tools" while
linking to "/" — a reference bug not worth cloning.

**Every family route now spreads familyMetadata()** (src/lib/seo.ts):
og:type/site_name/title/description/url/image/image:alt, the twitter
large-image card, and an absolute self-canonical; og:image is the
reference's own og-banner URL everywhere (no per-page CDN mirroring);
help/blog prose requests og:type article. The root layout gains
metadataBase + the homepage card + self-canonical; the locale pages
keep their EN-original canonicals (t66 contract, unchanged).

robots.txt mirrors the reference's rule list verbatim (inert rules for
paths this clone never shipped — /workspace, /vendor, /draco… — are
kept for parity and harm nothing) and points at the absolute
landing-sitemap-index.xml.

Copy discipline (24 new tests → 415 / 31 suites): builder-shape
assertions per family (the six-node homepage graph, the nine-block
feature set with HowTo/FAQ counts equal to the def, the seven-block
use-case Service set, the five-block tool set, Article dateModified =
the registry's real updated stamp, BlogPosting only for written
routes); breadcrumb resolution and absolute URLs; the 90-child index
shape with both index files byte-identical and every child present with
>0 absolute-loc URLs; the 7,070/1,095 totals; the pinned alternate
censuses; robots rules pinned; renderer + route wiring asserted at
source level. Build SSGs all 7,099 pages in ~63s; local smoke on the
prerendered HTML confirms the JSON-LD script tags and OG/canonical
tags land in the served HTML. Lint clean.

## 48. t68 — the marketing homepage: landing at `/`, studio at /workspace/rodin

Recon 2026-10-31 of the live reference found the clone's oldest
architectural shortcut still un-reconciled: the reference serves a full
SSR marketing page at `/` (title "Hyper3D Rodin - Best AI 3D Model
Generator", ~400KB Astro HTML) and the studio at /workspace/rodin, while
this clone mounted the studio at `/` and redirected /workspace/rodin → /
(the t53 "single-page app" note). The reference also ships a
returning-visitor fast path: an inline landing script that
`location.replace('/workspace' + search + hash)`-es any browser carrying
workspace-visit markers — the `hyper3d_workspace_visited` cookie (1yr,
SameSite=Lax), sessionStorage `hyper3dWorkspaceVisited`, or localStorage
`hyper3dWorkspaceVisitedAt` / `token`+`user_uuid` / `BASE_URL` /
`CURRENT_ROLE` — with `?bypass=true` as the escape hatch; the workspace
shell's own head script stamps those three markers on every visit. The
orphaned site-header/site-footer components (built in the visual-clone
era, never imported) were waiting for exactly this surface.

**The URL shape now matches the reference.** `/` renders the marketing
page (MarketingHome); /workspace/rodin is a real route rendering
Hyper3DApp plus the marker script (src/lib/workspace-visit.ts reproduces
both reference scripts in behavior — same keys, same five bounce
conditions, same bypass param, same '/workspace' target — reformatted,
not byte-copied); /workspace redirects to /workspace/rodin; /signup,
/register, /workspace/signup, /workspace/register and the /r/:code,
/a/:code referral links now carry their params into
/workspace/rodin?auth=signup[&referral_code=…] and the studio consumes
them exactly as before (verified: the sign-up panel opens). The old
/workspace/rodin → / rule is gone. One honest note: the bounce's auth
branch checks localStorage keys this clone never writes (its session is
an httpOnly cookie, invisible to JS), so here the bounce fires on the
visit markers — a signed-in user has, by definition, visited the studio
and carries them.

**The marketing page is the reference's section stack, honest copy.**
Header (logo + Free 7-Day Trial/Subscribe pill + Products ▾ / Features ▾
/ API / Pricing / Resources ▾ + Discord + Login + 12-language picker —
every dropdown entry routing to a real clone page: the 18-feature tree
incl. the 7 nested omnicraft pages, the 12 use-cases, the 21 styles,
blog, 3d-prompts, pricing, help, and the 11 locale routes; plug-ins keep
the reference's external docs.deemos.dev targets) → hero ("Create 3D
Models / The Easy Way" + Start Creating + the 8-chip row; ControlNet
chips are demo chrome per decision #15, the mode chips link to their
feature pages) → the embedded demo card (mode pills, the + entry, the
3D Editing card, Gen-2.5 + Select Effort popover wired to the real
EFFORTS table — the same five tiers and ~s times the studio runs — and
a GENERATE pill that routes into the real studio; nothing fakes a
pipeline) → the 17-name trust row as grayscale wordmarks (Acer, Bambu,
…, UCB — the reference's own partner row, names only, no affiliation
implied) → "Every Creative Idea Takes 3D Shape" (6 cards deep-linking
image-to-3d, text-to-3d, chatavatar, ai-texture-generator, /omnicraft,
and the features index) → "Flexible 3D Controls" (BANG / Partial Edit /
3D ControlNet — each linking its real article or the studio — plus the
"+ =" ControlNet demo trio and the Free Retry / Smart Low-Poly cards
with their credit and LOD facts) → "How It Works" (3 steps, export
formats drawn from EXPORT_FORMATS) → "Built for Your 3D Pipeline" (API
Platform, 3D Platform Add-On → the reference's own add-on docs, and the
enterprise block rendered with reference-only honesty: the four SSO
cards say "Reference-only — not in this clone", the three big cards
describe what this codebase actually does, and the whole section links
the honest enterprise article) → the "Imagine It. Shape It." CTA band →
the five-column footer with the reference's real link map (PRODUCT →
ChatAvatar/Rodin→studio/OmniCraft→hdri; FEATURES 5; TOOLS 9 incl.
/tools/viewer and /tools/converter; PLUG-INS 8 external; LEGAL 3), the
"Ask AI about us" row (the reference's five assistant links with their
prefilled prompt), the socials as the reference's own external accounts,
the © 2026 Hyper3D Clone line (Deemos's © line is theirs, not ours to
claim), and the 12-language selector as real locale routes.

**125 studio CTAs across 16 content libraries** that said
`href: "/"` ("Open the studio", "Generate a … Model", "Start Creating",
…) now resolve through the exported STUDIO_PATH constant — the studio
address lives in exactly one place. The locale router pages' studio
back-link and explore CTA and the convertor tool's empty-state link were
repointed the same way. Breadcrumbs that mean "Home" still say `/` —
that is now the landing page, which is what the reference's breadcrumbs
mean too.

**SEO follows the reference's split.** The landing page carries the
reference homepage's card (title, description, og:image = their agentic
banner, hotlinked per the t53 pattern) and the six-node @graph — which
is where the reference serves it; the studio route keeps the long
workspace title and stays robots-disallowed (robots.txt already mirrors
the reference's `Disallow: /workspace`, so no sitemap or robots change).
homeGraph gained the two fields the reference's graph carries and this
clone's code honestly supports: WebSite.inLanguage (en + the 11 localized
trees) and WebApplication.featureList naming the six formats the
exporters really write.

Copy discipline (18 new tests → 433 / 32 suites): the URL shape and
redirect table pinned at source level; both scripts' marker keys, five
conditions, bypass param and replace-target asserted; the @graph's six
nodes, 12 locales and featureList; every header/footer/marketing href
resolving against the real registries (features, use-cases, styles,
help, tools, locales); the 17 trust names; the honest-enterprise
wording; the demo card's EFFORTS reuse. Build SSGs 7,100 pages in ~63s
(7,099 + the studio route). Local smoke: / serves the marketing HTML
with the bounce script, graph and card; /workspace/rodin serves the
studio with the marker script and the long title; /workspace, /signup
and /r/:code land where the reference's equivalents land; the browser
bounce round-trips exactly (visit studio → / forwards to
/workspace/rodin; ?bypass=true stays), the sign-up deep-link opens the
panel, mobile 375px has no horizontal scroll, and VLM review of all
four page bands plus the mobile shot reports a clean render with the
reference's full section stack. Lint clean.

## 49. t69 — the 3D prompt library: 444 routes, 36 written, 367 honestly marked

Recon 2026-10-31 of the live reference (recon/3d-prompts-tree.md) found
the last large un-cloned surface: /3d-prompts is a 444-route tree — a
17-page index (24 cards per page, 19 on the last = 403 cards, all
unique), 403 detail routes, and 11 model hubs under
/3d-prompts/models/ plus 13 hub pagination pages (gpt-6-astra /2…/11
for its 252 members, claude-fable-5.1 /2…/4 for 83). The hubs' crawled
memberships total 421 and match the reference's own claimed counts
exactly (its index cards say "Explore N 3D prompt examples created
with <Model>"). The entries themselves are community submissions:
externally attributed X posts with the creator's screenshots and dates,
indexed by the third-party LLM the prompt was written FOR. The
reference keeps the entire tree OUT of its sitemaps — static-en carries
the bare /3d-prompts only — and the clone mirrors that (pinned by
test; zero sitemap edits).

t69 reproduces all 444 routes with the two-tier honesty contract (the
t65 pattern, at prompt scale). New modules: prompts-types.ts (the
contract), prompts-registry-data.ts (GENERATED by
scripts/gen-prompts-registry.py from scripts/prompts-cards.json, the
extracted live crawl — 403 slugs in pagination order, 421 memberships,
hub page counts, the reference's own card titles as route display
names; regenerate, never hand-edit), prompts-registry.ts (families,
display names, model association, the catalog order, pagination math,
hub math, census — computed at module load), prompts-content-a/b/c.ts
(the 36 written prompt pages), three renderers (prompt-page.tsx for
details, prompts-page.tsx rewritten as the index, prompt-hub.tsx),
and four routes (/3d-prompts, /3d-prompts/[slug] dispatching numeric
pagination 2..17 + details, /3d-prompts/models/[model](/[page])).

**The census, computed and test-pinned: 36 written / 367 community /
421 memberships.** Written pages get the reference's anatomy —
breadcrumb, H1, RUNS HERE + mode + group chips, the prompt in a mono
box with the real copy island, keywords, the "Make your next
creation." CTA, optimization tips as H3 notes, related links, and
CreativeWork + BreadcrumbList JSON-LD. Community routes get the honest
page: the COMMUNITY PROMPT — NOT REPRODUCED banner, the reason (the
reference's entry is an externally attributed community submission;
this clone has no community gallery and does not reproduce community
content), the reference-index facts (model association kept as route
data), and nearest real links — no prompt box, no keywords, no tips,
no CreativeWork, all pinned by tests at source level.

**The 36 written prompts are original and anchor to code.** Subjects
chosen from the reference's own route names where this clone's studio
genuinely delivers: characters (rabbit archer, mascot from a logo,
concept-art character, printable figure, hero robot, mech, temple
guardian, dragon diorama, hide-and-seek, character cards), props
(drone, LOD pod, F1 car, printable ship kit, shogi set, keyboard,
robotic hand, energy core, soda-bottle starship, ocean liner),
environments (temple canyon, pagoda city, voxel islands ×2, bubble
bay, anime street, station concourse, watermill village, forest,
island mansion), and nature/dioramas (cherry tree, mango tree, Seoul
miniature, onboarding diorama, ship in a bottle, campfire). Craft
notes quote the real effort tiers verbatim (Extreme-Low 4 s …
Extreme-High 80 s — all five second-marks test-pinned), the 1-credit
confirm, free previews, redo passes, the 21 style pages, the PBR
temperature slider, the six exporters, and the WorldGen boundary;
"interactive/animated/simulation" route names get their honest
boundary note (generation is geometry and texture; motion belongs to
the runtime). The t62 index content (the studio's own example prompts
with copy buttons, the three how-to steps) is absorbed into the
reference's section stack as the "featured examples" band; the t62
honest note was rewritten for t69 reality (no community content
reproduced; hubs are parity, not a filter; creator reviews are
external links, no embeds).

**Model hubs are honest inversions.** Each hub states that its model
is a third-party chat model from the reference's taxonomy, that this
clone's generator is its own pipeline, and lists the member routes as
status rows (24 per page, the reference's own pagination math — astra
10×24+12 across 11 pages). The index's "See the prompts become
working 3D" band keeps the reference's six external YouTube creator
reviews as clearly-labeled external links (their titles and blurbs,
links verbatim — the t53 external-asset pattern), and the model-hub
rail shows the 11 hubs with their claimed counts.

**Sitemap and SEO parity.** No sitemap changes (the reference's own
choice, pinned); familyMetadata spreads on all four routes; the index
serves CollectionPage + HowTo + BreadcrumbList, pages 2+ the "Page N"
CollectionPage pair, hubs CollectionPage + All-prompts breadcrumb —
the shapes recon observed, generated from the same defs the pages
render.

Copy discipline (27 new tests → 460 / 33 suites): the census and
slug-set parity pinned; every hub's membership == claimed count;
pagination math (24/page, 16×24+19, isPromptIndexPage boundaries: /1
and /18 404); written articles must have unique slugs/titles,
lowercase-comma prompts ≥40 chars, 3-6 keywords, 2-3 notes with
≥120-char bodies, 2-4 related links resolving against the real
registries (styles, use-cases, features, help, blog, the written
prompt set); all five effort second-marks and the 1-credit fact
appear in the notes; community rows carry no article; the community
renderer ships no copy button (source-pinned); sitemap absence pinned
(no /3d-prompts/ child in static-en, no prompts sitemap child);
JSON-LD builder shapes pinned; route files source params from the
registries; landing cross-links resolve through the new routes. Build
SSGs 7,543 pages (7,099 + 444) in ~71 s. Local smoke: every route
type 200 (index ×3, written, community, hubs ×3, hub pagination),
/3d-prompts/1, /18, /models, /models/<m>/1, /models/<m>/12, unknown
model and unknown slug all 404; served HTML carries the JSON-LD
blocks, the copy islands, 48 status chips on page 1, the 17-page
pagination, six external video cards and the 11-hub rail; VLM review
of all four page bands reports clean renders; mobile 375 px has no
horizontal scroll on index, hub, and detail. Lint clean.

## 50. t70 — the localized deep trees: served-but-not-sitemapped parity

Recon 2026-10-31 (recon/locale-deep-trees.md) found the last parity gap:
three surfaces the live reference SERVES under locale prefixes but never
lists in any sitemap — exactly the class of surface the t66 recon could
not see, because it derived the localized route sets from the sitemaps
alone. Probed live: (a) the ENTIRE 444-route 3D prompt library under
every locale prefix — the real localized index (ja title 無料の3Dプ
ロンプトと制作事例, full card grid with machine-translated community
titles), the 16 pagination pages, all 403 details, and the 11 model hubs
with the EN tree's own pagination math (astra /11 → 200, /12 → 404;
fable-5.1 /5 → 404; /1 and /18 → 404 everywhere); (b) the sub-category
matrix — all six slugs (the EN three plus the locale-only oddballs)
under ALL 11 locales, 66/66 probed 200, where the sitemaps list only a
seven-route subset for five locales; (c) the bare tools index in all 11
locales — and the EN bare /tools too (title "Free AI 3D Tools for Image
to 3D, Viewing and Conversion", H1 "Tools Matrix", exactly ten /tools
links), which the t64 recon had pinned as 404 from the sitemap's silence.
The reference's own canonical/hreflang behavior on these pages is
inconsistent (EN /tools self-canonical + 13 hreflang; EN prompt details
self-canonical + none; ja pagination canonical → the ja index) — the
clone keeps its t66 contract instead: localized pages canonicalize to
their EN originals and carry the 13-link hreflang set; the EN /tools
index mirrors the reference's own shape (self-canonical + hreflang, now
accurate since all 12 tools indexes exist).

**The serving/sitemap split is the design.** localePaths() (the
generated sitemap set, 5,975 routes) is untouched — gen-sitemap-split.ts
still reads it, its count pins still hold, and public/ is byte-identical
(ZERO sitemap change, mirroring the reference's own choice). The new
localeServingPaths() adds the computed deep trees — the 443 prompt
routes from the t69 registries (16 pagination + 403 catalog slugs + 11
hubs + 13 hub pages), the bare tools index, and the six-slug sub-category
matrix (SUBCATEGORY_SERVING_SLUGS, computed from SUBCATEGORY_PAGES +
LOCALE_ONLY_SUBCATEGORIES) — and localeStaticParams() now builds the
SSG params from it: 10,918 serving static params across the 11 locales
(5,975 + 4,943 new: 4,873 prompt routes + 11 tools indexes + 59 new
sub-category routes). The build SSGs 12,487 pages (7,543 + 4,944,
counting the EN /tools index) in ~117 s.

**The honesty contract is t66's, extended to prompt scale.** Tier 1 —
genuinely translated chrome — grows by twelve hand-written keys per
locale in i18n-messages.ts (index intro, pageOf/prev/next pagination,
written/community chips, row-tail labels, the community not-reproduced
banner, the model-hub parity banner with {model}/{count} slots); the
reference machine-translates its community card titles per locale
(炭酸飲料ボトルのロケット打ち上げ), and no machine-translated prose is
faked — the localized grids show the EN registry display names as route
data with lang="en" spans. Three new renderer views in locale-page.tsx:
the index (hero + 24-card grid + 1..17 pagination + notice card), the
community detail (localized banner + EN title + the reference-index
model association as an EN factual line), and the model hub (localized
parity banner + status rows + the reference's own hub pagination).
Written prompt routes resolve as plain t66 articles (EN title, works-here
chip, notice linking the EN original); the eleven generic t66 wrappers
at /{loc}/3d-prompts are upgraded to the real index render — same
routes, better pages.

**The EN /tools index is the clone's own honest page.** The reference's
link set (8 image-to routes + viewer + converter hubs) with the computed
census on every band (24/46/108 converter, 2/13 viewer, 6/8 image-to)
and pointers to the four tools that genuinely execute — computed from
the same registries the leaf pages read, so it cannot drift.

Copy discipline (7 new tests → 467 / 33 suites): the serving census
pinned per locale and in total (10,918); every locale carries the full
prompt library (all 403 slugs, 16 pagination pages, all hubs and hub
pages); the bare tools index and six-slug matrix pinned everywhere; the
SITEMAP set pinned untouched (per-locale counts, no 3d-prompts/ path, no
bare tools, the sub-category subset equal to the generated lists); the
split children on disk pinned free of every t70 surface (including the
EN /tools loc); boundary pins (/1, /18, bare /models, unknown
model/slug, astra /12, fable /5, unknown sub-category all 404 — the
reference's own math); the deep-tree def shapes pinned (index pages,
written→article with EN href, community entry, hub pages, locale-only
oddballs, the ten-link tools hub); every pack carries the twelve new
keys with {count}/{page}/{total}/{model} slots intact and prev ≠ next.
Two stale t66 pins were corrected with the recon as the reason: /{loc}/
tools and /{loc}/sub-categories/{en-slug} were pinned 404 from the
sitemap's silence — the live reference serves both. Local smoke: every
route type 200 (EN /tools; ja index + page 2 + zh page 17; written and
community details; ja hub + pt hub page 11; tools hub; the matrix
including ar/insects-bugs RTL); all boundaries 404; /ja/3d-prompts/2
canonicals to /3d-prompts/2 with the full 13-link hreflang set; EN
/tools self-canonicals with hreflang; ja index page 1 renders 24 cards
+ 16 pagination links. VLM review of six screenshots (EN tools index,
ja index, de community banner, ja hub, ar RTL sub-category, zh tools
hub) reports clean renders; mobile 375 px has no horizontal scroll on
all four new page types. Lint clean.

## 51. t71 — the omnicraft retirement and the content-preview surface

The reference's crawler surface moved (recon 2026-10-31, against the
90-child sitemap index pulled fresh): every child matched byte-for-byte
except static-en, which exchanged exactly seven lines — five omnicraft
locs out, two content-preview locs in. Probed live, the two halves of
that diff are one retirement and one arrival.

**The retirement.** The reference 301s its public OmniCraft landing tree
to marketing pages — /omnicraft, /omnicraft/hdri, /omnicraft/convertor
and /omnicraft/vector all land on /features/omnicraft/ai-hdri-generator,
/omnicraft/viewer on /tools/viewer, deep and unknown paths included —
and serves the working tools at /workspace/omnicraft/* (nine slugs,
probed 200: hdri, viewer, formatcon, vecto3d, mesh, enhancer, remix,
search, texture), under the robots-disallowed /workspace prefix, linked
from the homepage card and the tools pages. The clone mirrors the whole
move: next.config redirects with statusCode 301 and the reference's
exact targets (the t56 reverse redirects workspace → public landing are
gone with the tree); the toolbag registry keeps its nine-tool honesty
contract but re-pins the two live slugs the reference's workspace
actually uses (vecto3d, formatcon — the old vector/convertor were the
retired landing's own spellings) and omnicraftHref() now returns the
workspace URL; the toolbag index and per-tool routes moved from
src/app/omnicraft/* to src/app/workspace/omnicraft/*, noindex like
everything under the disallowed prefix; every internal link that pointed
at the public tree (footer, studio ×2, marketing home card, tools index
CTAs, tools matrix band, style cross-links, help/use-case/blog/
subcategory/prompts/features cross-links — 47 files) re-points directly
at the live targets, no redirect chains. The sitemap's five omnicraft
locs are gone from static-en and from the EN census (1,095 → 1,092
routes, 7,070 → 7,067 <url>).

**The arrival.** /content-preview is the reference's internal draft
preview host, and /content-preview/render its renderer — listed in
static-en (monthly / 0.5 / no lastmod / zero alternates) while the page
itself carries meta robots noindex, nofollow, the reference's own
split. The page is one status line plus an inline module implementing
a frozen postMessage protocol — ready (version 1) to its parent/opener,
render {id, mode, locale, slug, document} from allowed origins only,
rendered {id, unknownTypes, width, viewportWidth, height} after the
fetch, size on resize, error {id, status, message} on failure, refused
to everyone else — with the draft rendered into a sandboxed srcdoc
iframe (allow-scripts allow-same-origin allow-popups
allow-popups-to-escape-sandbox allow-forms) whose links open in new
tabs. The endpoint GETs 405 ("POST a preview document from
/content-preview."), POSTs from outside its own page 403 ("Previews
render only for the /content-preview page of this site." — keyed on
Sec-Fetch-Site), and flags unknown content types in an
X-Content-Preview-Unknown header, comma-separated and URL-encoded. The
clone implements the same observable contract honestly: the host
component speaks the same six messages against the same endpoint and
gates on exactly one allowed origin — the site it is served from, since
this clone has no admin console to allowlist; the render endpoint
mirrors the 405/403 gates and headers (cache-control private no-store,
x-robots-tag noindex nofollow, CSP frame-ancestors 'self') and renders
this clone's own honest block format — six renderable types (heading,
paragraph, list, quote, code, divider), everything else reported in the
unknown-types header and rendered as a plainly-marked placeholder,
malformed known blocks answered 400 rather than silently dropped, all
text escaped so a draft can never inject markup.

Copy discipline (24 new tests → 491 / 34 suites): the protocol
constants, gate wording, and render-path header pinned verbatim; the
six known block types, escaping, unknown-type reporting (unique,
first-appearance order), and malformed-document errors pinned; the
endpoint's 405/403/200/400 answers pinned including the
no-unknown-header-when-fully-known case; static-en pinned at 48 <url>
with both preview locs monthly/0.5/no-alternates/no-lastmod and zero
omnicraft locs; the EN census re-pinned 1,092 / 7,067 across 90
children; the two 301 tables pinned with the t56 reversals absent; the
registry pinned on vecto3d/formatcon with workspace hrefs. Local smoke:
all nine workspace tool routes render (four live + honest panels),
unknown slugs keep the honest panel, the five public URLs 301 to the
reference's exact targets, /content-preview answers 200 noindex with
the standalone status, GET /content-preview/render 405, and a curl POST
hits the 403 gate. Lint clean; the tsc baseline is unchanged.

**Post-deploy hardening (812bb5d).** The first production pass exposed
two real host bugs the unit pins could not see, both found by driving
the actual protocol in a browser and both now pinned by test: (1) the
status paragraph was never React-controlled — statusRef existed but the
JSX never attached it, so hydration rendered "Loading…" forever while
the reference's page swaps it for the standalone/waiting line; (2)
`event.source instanceof Window` is false for windows from another
realm, so a RENDER posted by the parent window was silently dropped —
the listener now duck-types the source and checks identity against the
collected editors, which is the check that actually matters. E2E
verified locally and in production: an editor page embeds
/content-preview, receives ready (version 1), posts a draft, and gets
back rendered with the unknown-types list and the live iframe size,
plus size events on resize; a draft without a document answers error
(status 400); the standalone line renders when no editor opened the
page. One build lesson recorded for the next reset: incremental
`next build` runs over a warm .next produced SSG HTML referencing a
chunk the build never wrote (the host's code 500'd) — rm -rf .next
before any standalone smoke after multi-patch sessions.
