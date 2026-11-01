# t85 recon — the features tree's body density

Probed 2026-11-02 against the live reference (hyper3d.ai), continuing from
the t84 baseline (1043/54 green, a41a575).

## The gap that picked this task

The t84 notes named the arc: "The remaining thin surfaces
(features/use-cases/styles/help/pricing bodies) are the next tasks' arc."
A fresh density probe (scripts/t85-probe-features.py, 11 routes, reference
vs the local standalone build) confirms the features family is the thinnest
flagship tree — every page below 0.55:

| route | ref | clone | ratio | gap |
|---|---|---|---|---|
| /features | 842 | 421 | 0.50 | +421 |
| /features/api | 2028 | 658 | 0.32 | +1370 |
| /features/mcp | 1660 | 607 | 0.37 | +1053 |
| /features/worldgen | 1390 | 557 | 0.40 | +833 |
| /features/text-to-3d | 1671 | 785 | 0.47 | +886 |
| /features/image-to-3d | 2144 | 665 | 0.31 | +1479 |
| /features/chatavatar | 1485 | 463 | 0.31 | +1022 |
| /features/ai-image-generator | 1496 | 469 | 0.31 | +1027 |
| /features/ai-video-generator | 1546 | 498 | 0.32 | +1048 |

(The omnicraft sub-pages are similarly thin — svg-to-3d 0.32,
ai-hdri 0.46 — they are the NEXT task's long tail, not this one's scope.
/features/agentic 404s on the reference too — not a gap. /imageto3d 301s
to /features/image-to-3d on both sides.)

## The reference's missing anatomy (per-page h2 dump)

Every reference feature page carries 1-3 sections this clone's shared
renderer never had (t85ref-*.html dumps):

- **image-to-3d** (2157w): "Built on award-winning 3D research" +
  "The AI Behind Hyper3D Rodin" (4 tech cards) + a much larger FAQ.
- **text-to-3d** (1680w): "Text to 3D Prompt Examples" (1323w!) +
  "AI Technology Behind Text to 3D Model Generation".
- **api** (2274w): three "Examples" code blocks (~1200w each) +
  "Export Types" + "Supported Outputs & Use Cases" + enterprise cards.
- **mcp** (1696w): "Integrate 3D generation into your daily work" +
  a large FAQ.
- **worldgen** (1405w): "Built on award-winning 3D research" +
  "Understands Physics, Ready to Edit".
- **chatavatar** (1492w): "Built for Complete Avatar Creation".
- **ai-image-generator** (1502w): "Prompt Examples for Better AI Images".
- **ai-video-generator** (1552w): "Better Prompts for AI Video Generation".
- **/features index** (849w): intro copy this clone's index lacks.

## The honest mirror — five optional section kinds on the registry

One renderer extension, registry-driven, each kind rendered only when a
page's def carries it (the shared-renderer convention, documented like
t84's heading-level note):

1. `promptExamples` — copy-paste prompt cards in bordered mono boxes
   (the t60 styles-recipes shape). LIVE pages (text-to-3d): prompts that
   the real compiler path handles, notes citing the real rules
   (2-12 objects, dims 0.05-4, keyword palettes, the deterministic
   fallback's actual 4-object build, the 6 export formats).
   REFERENCE-ONLY pages (ai-image/video-generator): prompts shaped for
   the reference's generator with the clone's nearest-real-path note —
   never faked as working here.
2. `techCards` — the reference's "The AI Behind…" / "Built for…" cards.
   LIVE pages: the clone's real pipeline stages (vision captioning via
   rodin_mesh_image_process, prompt→SceneSpec via the LLM compiler,
   ControlNet bbox/voxel/pointcloud, neural/fast engines, 75s stall→fast
   fallback, 4 multiview images). REFERENCE-ONLY pages: the reference's
   stages attributed to the reference + the clone's plain gap.
3. `researchNote` — the reference's "Built on award-winning 3D research"
   block: the reference's own credentials stated AS the reference's story,
   followed by this clone's plain statement (product-surface
   reimplementation, no research lineage, no neural reconstruction).
4. `codeExamples` — mono code blocks. api: real curl against the real
   routes (sign-in cookie, POST /api/task with the real CreateTaskSchema
   fields, GET progress, GET export) — every path fs-verified in tests.
   mcp: the modal's own constants (endpoint, CLI install, the paste-ready
   agent instruction) cross-anchored against mcp-connect-modal.tsx.
5. `exportTypes` — the api page's format cards pinned to EXPORT_FORMATS.

Plus FAQ expansions on all 9 pages (5-6 → 8-11 items each, honest
answers) and a status-chip legend on the /features index.

## Honesty rules enforced by tests

- every promptExample card carries a note ≥ 40 chars (the honest note is
  the point, the prompt is the demo);
- every /api/… path inside a codeExample block must exist under
  src/app/api (fs walk in the test);
- exportTypes names === EXPORT_FORMATS exactly;
- researchNote bodies contain the clone's no-research statement;
- the mcp codeExamples carry the modal's exact endpoint constant
  (source-pinned, the t61 pattern);
- FAQ floors: every touched page ≥ 8 items.

## Outcome

Shipped 2026-11-02. Density, before → after (same probe, same reference):

| route | before | after |
|---|---|---|
| /features | 0.50 | **0.69** |
| /features/api | 0.32 | **0.56** |
| /features/mcp | 0.37 | **0.64** |
| /features/worldgen | 0.40 | **0.67** |
| /features/text-to-3d | 0.47 | **0.80** |
| /features/image-to-3d | 0.31 | **0.58** |
| /features/chatavatar | 0.31 | **0.58** |
| /features/ai-image-generator | 0.31 | **0.59** |
| /features/ai-video-generator | 0.32 | **0.59** |

All nine clear the 0.55 thin-flag line. The omnicraft long tail
(svg-to-3d 0.32, ai-hdri 0.46, plus the five unprobed siblings) is the
next task's scope — same recipe, same section kinds.

Sections shipped: 3 promptExamples (text-to-3d 4 cards, ai-image/video
3 each), 2 researchNotes (image-to-3d, worldgen), 5 techCards rows
(text-to-3d, image-to-3d, worldgen, chatavatar, mcp — 4 cards each),
2 codeExamples (api 3 curl blocks against real routes; mcp 3 blocks
byte-pinned to the modal's constants), 1 exportTypes (six formats ===
EXPORT_FORMATS), FAQ floors lifted to ≥ 8 on every touched page, the
index legend + closing section.

Two incidental bugs fixed on the way:
1. **The stale 40-credit claims** — three places in the features tree
   said "40-credit wallet" / "40 at sign-up" while the metering constant
   is INITIAL_BALANCE = 50 (pinned by credits.test.ts since t58). All
   three now say 50, and a regression test forbids "40-credit"/"40
   credits"/"40 at sign-up" in any feature def.
2. **The reference-only gap-statement floor** — prompt cards on
   reference-only pages must state the gap (regex-pinned), so the
   prompt-example sections can never silently imply the bitmap/video
   generation works here.

Tests: 10 new (section anatomy per page, prompt-card honesty floors,
research disclaimer shape, tech-card substance, FAQ floors, the
40-credit guard, codeExample route paths fs-verified against
src/app/api with external URLs stripped, api schema fields, mcp blocks
pinned to the modal source, exportTypes === EXPORT_FORMATS) —
1053/54 suites green, lint clean, tsc 26 = baseline.

Verification: standalone build served and checked by
recon/t85/verify-served.py — 49/49 (every new section rendered on its
page, the real routes/fields/formats in the served HTML, the modal
constants, the index legend, unknown slug 404, untouched omnicraft page
no empty shells). VLM layout check on the three new layout shapes
(curl blocks, export grid, prompt cards): NO DEFECTS.

Vercel deploy attempted post-push; outcome recorded in the commit
notes (the t80-t84 account block persisted through this task).
