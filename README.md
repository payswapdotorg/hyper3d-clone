# Hyper3D Clone — real 3D generation (educational product clone)

A functional clone of https://hyper3d.ai (Hyper3D Rodin — AI 3D model
generator by Deemos) built as a Next.js 16 app. This is the **functional**
build: image-to-3D and text-to-3D actually generate real 3D geometry that
you can view in-browser and export as industry model files.

Intelligence for the original visual clone was produced with **REA**
([morluto/rea](https://github.com/morluto/rea) — "Reverse Engineer
Anything"): `rea-agents@6.5.0 analyze-javascript-application` over the
captured site bundle (21 JS files, 378,403 AST nodes, 758 findings,
96.5 MB Evidence). The functional pipeline was specified from a live,
logged-in recon of the real product's workspace (network-captured API
contract, task-card shapes, credits ledger, pricing — see
[`recon/API-BLUEPRINT.md`](recon/API-BLUEPRINT.md)).

## Run

```bash
bun install          # or npm/pnpm install
cp .env.example .env # DATABASE_URL (sqlite) + SESSION_SECRET
bun run db:push      # create the schema
bun run dev          # http://localhost:3000
```

Sign in from the site header (email + password — the clone's lightweight
stand-in for the original's Google OAuth) and you start with a 50-credit
wallet, exactly like the real product's trial.

## What actually works

- **Image to 3D** — upload an image in the Studio, the pipeline captions it
  (vision model), plans a scene, builds real mesh geometry (deterministic
  three.js-based mesh builder — no eval), renders a true preview poster of
  that geometry (software rasterizer), and stores the result.
- **Text to 3D** — same pipeline from a text prompt (LLM scene planning →
  deterministic mesh build).
- **Real exports** — every finished model exports to **GLB, GLTF, OBJ, STL
  and USDZ** with byte-verified, spec-compliant files (magic headers,
  structure checks) via the stock three.js exporters.
- **3D viewer** — orbit controls, shaded / wireframe / normal-modes, turntable
  of the model you just generated.
- **Task system** — the real product's API contract mirrored: task cards
  (`/api/task/card/:uuid`), task history, task list, usage/credits per task,
  agentic progress messages while generating.
- **Credits wallet** — 50 credits on sign-up, 1 credit per standard
  generation, 10 per agentic generation, first task free — persisted in a
  Prisma/SQLite ledger.
- **Agentic mode** — image-to-3D with the agentic power toggle, effort-level
  modal (5 levels), paced progress messages mirroring the real product's
  agentic run.
- Pricing tiers (Free / Creator / Business / Enterprise / Education) with
  monthly/yearly toggle, and the full 13-section marketing homepage in the
  original's exact order.

3D Editing and WorldGen tabs render honest "coming soon in this clone"
states — nothing is faked. The old fake `/api/generate` route (which
returned a 2D image) was deleted.

## Architecture

```
image/text → caption (VLM) or prompt (LLM) → SceneSpec (zod-validated JSON)
  → deterministic mesh builder (three.js geometry, no eval)
  → exporters (GLB/GLTF/OBJ/STL/USDZ) + software-rasterized poster
  → Prisma task records + credits ledger
  → Studio viewer (three.js) + task rail (history)
```

- `src/lib/spec.ts` — SceneSpec schema (the interchange contract)
- `src/lib/mesh-builder.ts` — deterministic geometry construction
- `src/lib/exporters.ts` — real model-file exports
- `src/lib/task-machine.ts`, `src/lib/queue.ts` — task lifecycle
- `src/lib/credits.ts`, `src/lib/ledger.ts` — wallet + ledger
- `src/lib/caption.ts`, `src/lib/ai-clients.ts` — VLM captioning / LLM planning
- `src/app/api/*` — the mirrored API surface (task, user, auth)
- 8 vitest suites (67 tests) — TDD contract for all of the above

External mesh providers (Meshy/Tripo/Hyper3D) are supported through an
env-gated adapter (`MESHY_API_KEY` / `TRIPO_API_KEY` / `HYPER3D_API_KEY`);
without keys the built-in pipeline carries everything.

## Tests

```bash
bun run test    # 8 vitest suites, 67 tests
```

See [`DECISIONS.md`](DECISIONS.md) for the documented deviations from the
real product (poster rasterizer instead of WebGL, HMAC cookie auth instead
of Google OAuth, files-on-disk instead of signed CDN URLs, …).

Educational clone for evaluation purposes. Not affiliated with Deemos /
Hyper3D.
