# Hyper3D Clone — educational product clone

A faithful clone of https://hyper3d.ai (Hyper3D Rodin — AI 3D model generator) built as a Next.js 16 app.

Intelligence for the clone was produced with **REA** ([morluto/rea](https://github.com/morluto/rea) — "Reverse Engineer Anything"): `rea-agents@6.5.0 analyze-javascript-application` ran over the captured site bundle (21 JS files, 378,403 AST nodes, 758 findings, 96.5 MB Evidence), yielding the spec that drove this build: nav/sitemap map, exact 13-section homepage order, pricing tiers, API contract, and design tokens.

## Run

```bash
bun install        # or npm/pnpm install
bun run dev        # http://localhost:3000
```

## What's inside

- Single-route landing page — 13 sections in the original's exact order (hero with interactive generator demo, features, ControlNet showcase, how-it-works, pipeline wall, enterprise, gallery, why-choose, workflows, research, FAQ, pricing, footer)
- Full-screen **Studio** overlay: three.js viewer (orbit controls, purple rim lighting, Shaded/Wireframe/Normal), generation pipeline simulation, ControlNet selectors, thinking-effort levels, history
- Working `POST /api/generate` — server-side AI image generation (z-ai-web-dev-sdk) producing real "generated model renders"
- Mock auth matching the original's client contract (localStorage `token`/`user_uuid`, `hyper3d-auth-change` event), credits wallet, 7-day-trial pill
- Exact pricing tiers (Free / Creator / Business / Enterprise / Education) with monthly/yearly toggle and Compare Plans table
- Dark design language: `#121317` background, purple `#4a00e0 → #8584ff` accents, Poppins / Inter / IBM Plex Mono

Educational clone for evaluation purposes. Not affiliated with Deemos / Hyper3D.
