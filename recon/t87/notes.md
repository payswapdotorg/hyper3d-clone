# t87 — the use-cases tree's body density

The t84 arc's third family: after t85 (features flagships) and t86 (features
omnicraft long tail) lifted the features tree above the 0.55 line, the
/use-cases tree sat at 0.35-0.43 per the t84-era probes. t87 ports the
proven t85/t86 recipe: three registry-driven optional sections added once to
the shared renderer, then registry content only — every page mirroring the
reference's OWN anatomy (recon/t87/t87-anatomy.py, h2/h3 dump of all 11
pages, 2026-11-02) with the clone's honesty contract on top.

## Density outcome (recon/t87/t87-probe-use-cases.py, standalone :3112 vs prod)

| route | ref | clone | ratio (was 0.35-0.43) |
|---|---|---|---|
| /use-cases/3d-printing | 1440 | 1326 | 0.92 |
| /use-cases/animation | 1252 | 1220 | 0.97 |
| /use-cases/automotive-design | 1447 | 967 | 0.67 |
| /use-cases/character-design | 1364 | 1022 | 0.75 |
| /use-cases/e-commerce | 1464 | 1006 | 0.69 |
| /use-cases/game-development | 1341 | 1046 | 0.78 |
| /use-cases/jewelry-design | 1506 | 1023 | 0.68 |
| /use-cases/mechanical-engineering | 1379 | 948 | 0.69 |
| /use-cases/metaverse | 1383 | 1112 | 0.80 |
| /use-cases/nft-creation | 1462 | 993 | 0.68 |
| /use-cases/vr-ar | 1454 | 1154 | 0.79 |

All 11 above 0.55; the two pages whose reference pages are leanest
(3d-printing 1440, animation 1252) cross 0.9 because their clone anatomy now
carries every band the reference carries plus the honesty panel.

## The per-page section map (tests pin it exactly)

- promptExamples x8 — where the reference's own door is prompt-shaped:
  3d-printing, animation, automotive-design, character-design,
  game-development, metaverse, nft-creation, vr-ar. NOT on e-commerce /
  jewelry / mechanical (their reference doors are image-led: catalog shot,
  sketch, bench photo) — "exactly the right pages", not everywhere.
- techCards x10 — every page whose reference carries an un-mirrored h2 band,
  verbatim-titled: "Watertight or it doesn't print" (3d-printing), "Mesh
  inspection and creative editing — the real subset" (animation), "Stylized,
  realistic, or in between — the honest controls" (character), "Target
  polygon count, strong silhouette" (game) + its metaverse twin, "Castable
  STL for lost-wax printing" (jewelry), "The spec-sheet claims, answered"
  (mechanical), "What happens on mint day" (nft), "Frame rate is the real
  art director" (vr-ar), "The product page is your new showroom"
  (e-commerce). NOT on automotive — its reference anatomy was already fully
  mirrored (benefits/steps/cards all present); the export band was its only
  gap.
- exportTypes x8 — the pages whose reference anatomy carries a format band:
  3d-printing ("STL, 3MF and OBJ export" h3 — 3MF gap stated in the intro,
  never "3MF export" phrased), animation ("High-Quality FBX or GLB Export"
  h3), automotive (the full six-card "Exports that fit automotive pipelines"
  h2), e-commerce ("Formats your storefront actually accepts" h2 — the clone
  block retitled since the benefits band already owns the reference title),
  jewelry, mechanical (spec-sheet lanes), metaverse, vr-ar. NOT on character
  / game / nft — their reference format content lives in steps and FAQ.
- FAQ floors: 4-5 -> >=8 on every page (44 new questions total).

## The honest decisions worth recording

1. The jewelry "Fresh from the Rodin gallery" and "Trusted by Creators"
   reference bands are deliberately UNMIRRORED — no photo pipeline and no
   verifiable testimonials exist here; faking either would break the clone's
   first rule. The FAQ says so outright ("no gallery... a gallery of prints
   we cannot show would be a claim we cannot back").
2. Animation's "Optional Mesh Inspection and Creative Editing with OmniCraft"
   is carried as the studio's REAL subset — orientation popup, material
   redo, ControlNet bbox/voxel/pointcloud — with the hosted sculpt/paint/
   remesh editor's absence stated; the mesh tool's registry note
   (src/lib/omnicraft.ts: "the studio already covers the honest subset")
   is the source of truth.
3. The reference's control claims are answered, never blurred: "Target
   Polygon Count & Optional LODs" (3d-printing/character/game/metaverse)
   each state the no-slider/no-LOD gap and the decimate-after-export path;
   "Sim Ready — Available Now" (character) and "nearly production-ready"
   (mechanical) are attributed to the reference with the local ceiling said.
4. exportTypes format cards === EXPORT_FORMATS (glb/gltf/fbx/obj/stl/usdz)
   per page, test-enforced — the reference's own use-notes ride on the real
   formats (OBJ/FBX surfacing, GLB configurators, USDZ walkarounds, STL
   scale studies), and the PBR-maps lane is stated as absent.
5. The live OmniCraft tools are the only tool names/routes the new content
   mentions: formatcon (jewelry/vr-ar/metaverse cards), hdri (vr-ar/
   metaverse/game), viewer (3d-printing/animation notes) — all LIVE_TOOL_
   ROUTES, test-enforced.
6. The credit metering appears nowhere in the new blocks (the 7 pre-existing
   compliant mentions are untouched); the 40-credit regression guard covers
   the tree.

## Verification record

- bun run test: 1067/1067 green, 54 suites (1057 -> 1067, +10 t87 tests:
  section map, prompt-card floors, tech-card floors, per-page EXPORT_FORMATS
  equality, FAQ floor, polycount gap on the 4 control pages, animation
  real-subset anchors, live-tool routes only, HDRI route wherever named,
  40-credit guard). pageText now flattens the three new blocks so the
  honesty contract (credits/maps/formats) covers them.
- lint: clean. tsc --noEmit: 26 errors = the pre-existing baseline.
- Standalone build, served on :3112: recon/t87/verify-served.py 135/135 —
  every new section title rendered on its page, all 48 export cards served,
  prompt cards mono-boxed with the "Here: " prefix (>=6 hits/page — the
  Flight payload duplicates rendered strings, so 3 visible cards = 6 hits;
  same recon note as t86: grep rendered markers, not class names), >=8 FAQ
  <details> per page, unknown slug 404, untouched features page
  (image-to-3d — researchNote only) with no empty shells, /use-cases index
  intact. (First run was 134/135: the regression page was initially
  text-to-3d, which legitimately carries t85 prompt cards — swapped.)
- VLM layout: NO DEFECTS x3 (3d-printing full-stack, jewelry tech+export,
  nft prompt+tech) — screenshots in download/t87-verify/.
- Vercel deploy attempt on the pushed commit (f70a2e7), both tokens, per
  the t80-t86 pattern: token-1 HTTP 402 resource_creation_blocked (fair-use
  block), token-2 HTTP 403 forbidden/invalidToken, live domain 402
  account-wide. Local build verification (135/135) is the record of note.

## Next (per the t84 arc)

/help bodies (0.44 per the t84-era probe — 33 articles + 6 hubs + index;
the same recipe applies, with the Help Center's THREE-WAY status contract
already in place from t61), then the arc's remaining thin families.
