# t86 recon — the omnicraft long tail of the features tree

Probed 2026-11-02 against the live reference (hyper3d.ai), continuing from
the t85 baseline (1053/54 green, 389d33d).

## The gap that picked this task

The t85 notes named the arc: "The omnicraft long tail (svg-to-3d 0.32,
ai-hdri 0.46, plus the five unprobed siblings) is the next task's scope —
same recipe, same section kinds." A fresh density probe
(scripts/t86-probe-omnicraft.py, 7 routes, reference vs the local
standalone build) confirmed every omnicraft sub-page below the 0.55 line —
the thinnest family remaining after t85 lifted the nine flagships:

| route | ref | clone | ratio |
|---|---|---|---|
| /features/omnicraft/ai-hdri-generator | 1598 | 737 | 0.46 |
| /features/omnicraft/svg-to-3d-converter | 1598 | 505 | 0.32 |
| /features/omnicraft/ai-texture-generator | 1752 | 475 | 0.27 |
| /features/omnicraft/ai-image-enhancer | 1578 | 448 | 0.28 |
| /features/omnicraft/ai-image-remix | 1673 | 449 | 0.27 |
| /features/omnicraft/3d-model-search-engine | 1544 | 456 | 0.30 |
| /features/omnicraft/3d-mesh-editor | 1373 | 450 | 0.33 |

## The reference's missing anatomy (per-page h2 dump)

The t86 anatomy dump (scripts/t86-anatomy.py) recorded each page's h2/h3
tree. The sections this clone's shared renderer never had:

- **ai-hdri-generator**: "Why Use Hyper3D's AI HDRI Generator?" h3 cards
  (360° Viewer / Flexible Input / Free Iteration / Gallery & Filters — the
  set appears twice in the reference's DOM, a carousel duplication).
- **svg-to-3d-converter**: "Extrusion Depth and Bevel You Control" h3
  cards (Geometry / Materials / Lighting / Export, also doubled) — the
  tool's controls section.
- **ai-texture-generator**: "One Model, Any Material Direction" (six named
  material cards: Retro Tin Robot, Carved Pumpkin, Painted Wood, Sci-Fi
  Robot, Blue Toy Robot, Sci-Fi Armor) plus FIVE control h2s ("Production
  Controls, Not a Black Box", "Native Gen-2.5 Speed Presets", "Fine-Tune
  Every Generation", "Version History Built In", "Pack Exactly What You
  Need").
- **ai-image-enhancer**: "Real Detail Recovery Not Just Resizing" +
  "Why Choose Hyper3D for AI Video Generation?" (the reference's own
  template quirk — a video heading on the image-enhancer page, with its
  control h3 set doubled: Tiers/Ranges/Queue/Suite +
  Tiers/Controls/Queue/Workflow).
- **ai-image-remix**: "Three References, One Prompt, One Scene" +
  "Real Controls Behind Every Remix" (Multi-Reference Gen Mode /
  Conversational Edit Mode / Turbo Gen References / 3D-Ready Style
  Presets).
- **3d-model-search-engine**: "Describe It, Don't Keyword It" (the
  semantic-query pitch) — the three modalities "Ask by Text, Image, or
  Model" already live in the page's h1/steps.
- **3d-mesh-editor**: "Optional Creative Control for Every Surface"
  (sculpt / paint / mask / remesh).

## The honest mirror — same recipe, same section kinds

No new renderer code: the t85 optional blocks render as-is. Everything is
registry content in features-content-omnicraft.ts, each kind on the pages
whose reference anatomy actually carries it (the t85 rule — mirror the
reference's own per-page shape, never pad):

1. **techCards ×7** — the engine/controls sections:
   - hdri (LIVE): the real procedural engine, card by card — keyword→
     parameter pinning, FNV-1a → mulberry32 seeded determinism, seam-free
     periodic fBm clouds, physical night + 4-bit-bucket image palettes —
     with the module named (src/lib/hdri.ts) and fs-pinned by tests.
   - svg (LIVE): the reference's Geometry/Materials/Lighting/Export card
     names carrying this tool's REAL slider clamps (depth 0.05–4, bevel
     0–0.5, curve 4–32, six-swatch palette) and the no-lighting-rig
     honesty where the reference's card overpromises.
   - texture/remix/search/mesh (REFERENCE-ONLY): the reference's own
     control sets stated as its features (Gen-2.5 presets, version
     history, pack export; multi-reference/conversational/turbo/presets;
     the three query doors; sculpt/paint/mask/remesh) with the local
     boundary in every card.
   - enhancer (REFERENCE-ONLY, 5 cards): the reference's tiered/range/
     queue/suite cards + "Real Detail Recovery" — including the video-
     heading quirk recorded faithfully as the reference's own template
     fact.
2. **promptExamples ×3** — the pages whose reference anatomy is
   prompt-shaped:
   - texture: the reference's six named material directions as three
     demo prompts (the reference's section title verbatim), every note
     stating the no-painting gap + nearest real path (palette-at-
     generation, material redo).
   - remix: the reference's @1/@2/@3 multi-reference grammar as three
     cards, notes stating no image-to-image exists here.
   - search: "Describe It, Don't Keyword It" as three semantic query
     cards, notes pointing at text-to-3D as the real path for exactly
     this language.
3. **exportTypes ×1** — svg: the tool's download row really serves all
   six EXPORT_FORMATS (the same constant the api page pins); format
   notes written SVG-specific, distinct from the api page's.
4. **FAQ floors** — every touched page ≥ 8 (hdri to 9; svg 5→8; the five
   reference-only pages 4→8), the new answers carrying the reference's
   own facts (the 8K pack contents, the named material directions, the
   three modalities, the quirk) and the local gaps.

## Honesty rules enforced by tests (4 new in features.test.ts)

- the hdri def names src/lib/hdri.ts (which must exist), FNV-1a and
  mulberry32 (both pinned against the engine source, including the
  0x01000193 FNV prime), the real 2K/4K tiers — and every sentence
  containing "8K" must be the reference's stated gap, never a claim;
- the svg def states the engine's real clamps (0.05 / 0.5 / 32), fs-
  pinned against src/lib/vector-to-3d.ts AND the tool's SliderRow
  min/max props in vector-tool.tsx — the page, the lib, and the UI
  cannot drift apart;
- every reference-only omnicraft page's techCards/promptExamples text
  attributes to "the reference";
- the enhancer def records the reference's video-heading quirk
  verbatim;
- the pre-existing t85 floors now run over the omnicraft slugs too:
  prompt cards ≥3 with ≥80-char honest notes (gap-stated on
  reference-only pages), tech cards ≥4 with ≥80-char bodies, FAQ ≥8,
  exportTypes === EXPORT_FORMATS, no 40-credit claims.

## Outcome

Shipped 2026-11-02. Density, before → after (same probe, same reference):

| route | before | after |
|---|---|---|
| /features/omnicraft/ai-hdri-generator | 0.46 | **0.67** |
| /features/omnicraft/svg-to-3d-converter | 0.32 | **0.58** |
| /features/omnicraft/ai-texture-generator | 0.27 | **0.60** |
| /features/omnicraft/ai-image-enhancer | 0.28 | **0.57** |
| /features/omnicraft/ai-image-remix | 0.27 | **0.60** |
| /features/omnicraft/3d-model-search-engine | 0.30 | **0.65** |
| /features/omnicraft/3d-mesh-editor | 0.33 | **0.58** |

All seven clear the 0.55 thin-flag line. The features tree is finished
as a family: 18/18 pages + index above the line after t85+t86.

Sections shipped: 7 techCards (4-5 cards each), 3 promptExamples (3
cards each), 1 exportTypes (six formats === EXPORT_FORMATS), FAQ floors
lifted to ≥8 on all seven pages. Zero renderer changes — the t85
optional blocks were already general.

One recon note for the record: the Flight payload of every page embeds
the themed 404 boundary (its "font-mono" 404 numeral), so grep-style
empty-shell checks must target rendered markers ("Here: ", "<pre"),
not class names — recorded in verify-served.py's comment.

Tests: 4 new — 1053→1057/54 suites green, lint clean, tsc 26 = baseline
(unchanged files).

Verification: standalone build served and checked by
recon/t86/verify-served.py — 56/56 (every new section rendered on its
page, the engine constants and slider ranges in the served HTML, the
six export cards, reference attribution + gap statements on all five
reference-only pages, the quirk, unknown slug 404, untouched mcp agent
page with no empty shells). VLM layout check on the three new layout
shapes (live techCards page, prompt-cards page, export-types grid):
NO DEFECTS ×3.

Vercel deploy attempted post-push; outcome below.

## Vercel deploy outcome (2026-11-02, post-push)

Pending — appended after the attempt.
