/**
 * Use-case content A — the reference sitemap's first 6 pages
 * (3d-printing, animation, automotive-design, character-design,
 * e-commerce, game-development), honestly rewritten for this clone.
 *
 * Facts every "works" claim is tethered to (src/lib):
 *  - Text→3D and image→3D generation really run (ZAI LLM/VLM paced
 *    pipeline; poster is a true rasterization of the built mesh).
 *  - Exports are real, byte-verified: GLB, GLTF, OBJ, STL, USDZ + ASCII
 *    FBX 7.3 (exporters.ts / exporters-fbx.ts) — the full reference row.
 *  - Materials are per-part PBR *parameters* (color / metalness /
 *    roughness — mesh-builder.ts buildMaterial), NOT baked texture-map
 *    sets. Pages must not claim albedo/normal map images.
 *  - No polycount slider, no LODs, no rigging/skeleton, no pose picker.
 */
import type { UseCasePageDef } from "./use-case-types";
import { STUDIO_PATH } from "./studio-path";

export const USE_CASE_PAGES_A: UseCasePageDef[] = [
  {
    slug: "3d-printing",
    name: "3D Printing",
    title: "AI 3D Model Generator for 3D Printing",
    description:
      "Turn a photo or a prompt into a printable mesh and export real STL — concept models, props, and parts, honestly scoped for FDM and resin workflows.",
    subline:
      "From description to slicer-ready STL in one pipeline — real export bytes, honest about what the mesh is.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The full loop works in this clone: describe or upload, generate the mesh, download a real STL.",
      works: [
        "Image-to-3D and text-to-3D generation run the real paced pipeline.",
        "STL export is real, byte-verified, and sliced from the same geometry you previewed.",
        "OBJ, GLB, GLTF, USDZ, and ASCII FBX are also one click away when a print becomes a model.",
      ],
      limits: [
        "Meshes are built from assembled closed primitives (concept-grade), not scan- or CAD-grade solids.",
        "No polycount or LOD control — you print the mesh the pipeline built.",
        "For casting or structural parts, verify wall thickness and clearances in your slicer first — the page will not pretend the mesh is engineering-verified.",
      ],
    },
    stepsTitle: "Photo to printable asset in three steps",
    steps: [
      {
        title: "Start from an image or a prompt",
        body: "Drop a reference photo or describe the object — a prop, a figurine concept, a bracket shape. The pipeline reads either input.",
      },
      {
        title: "Get a closed, textured mesh",
        body: "Generation assembles closed primitives into a single watertight-by-construction mesh with per-part material parameters.",
      },
      {
        title: "Export STL and slice",
        body: "Download the STL — the exact bytes the exporter produced for the geometry you saw — and open it in your slicer.",
      },
    ],
    benefitsTitle: "Built for desktop-printing workflows",
    benefits: [
      {
        title: "Real STL, not a render",
        body: "The download is a genuine STL serialization of the built mesh — the poster preview and the print input come from the same geometry.",
      },
      {
        title: "Closed primitives",
        body: "The mesh builder assembles closed boxes, spheres, and cylinders into one object, so the slicer sees manifold input for concept prints.",
      },
      {
        title: "Six export formats",
        body: "STL for the slicer, GLB/GLTF for the web, OBJ and FBX for DCC tools, USDZ for AR — all real exporters, all byte-verified.",
      },
      {
        title: "Deterministic reruns",
        body: "Pin the seed and the same prompt rebuilds the same mesh — useful when you iterate on print orientation or sizing.",
      },
    ],
    cardsTitle: "What makers print with it",
    cards: [
      {
        title: "Tabletop miniatures & terrain",
        body: "Prompt a creature or a ruined tower, export STL, and scale it in the slicer for your table.",
      },
      {
        title: "Cosplay props & wearables",
        body: "Concept volumes for props you will finish by hand — honest output for honest finishing work.",
      },
      {
        title: "Functional fixtures (concept-grade)",
        body: "Draft enclosures and brackets to check fit-by-eye before you model the real part in CAD.",
      },
      {
        title: "Casting masters (verify first)",
        body: "Ring blanks and pendant drafts print fine; for lost-wax casting, check wall thickness and sprue attachment yourself.",
      },
    ],
    faqTitle: "3D printing questions, answered",
    faq: [
      {
        q: "Is the STL really printable?",
        a: "The STL is a true serialization of a mesh built from closed primitives, which slicers accept. It is concept-grade — not an engineering-verified solid — so treat it like a draft you inspect before committing filament.",
      },
      {
        q: "Can I control the polycount before printing?",
        a: "No. This clone does not expose a polycount slider or LOD generation; the mesh arrives at the resolution the pipeline built. You can decimate in your DCC tool after exporting OBJ or FBX.",
      },
      {
        q: "What about 3MF?",
        a: "Not offered. The export row here is GLB, GLTF, OBJ, STL, USDZ, and FBX — stated plainly rather than padded.",
      },
      {
        q: "Does it generate texture maps for resin color prints?",
        a: "No. Materials are per-part parameters (color, metalness, roughness), not baked texture-map images. The color information lives in the mesh export, not in separate map files.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Jewelry Design", href: "/use-cases/jewelry-design" },
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Your next print starts as one prompt",
    closingBody:
      "Describe it, generate it, export the STL, and slice it — the whole loop works right here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "animation",
    name: "Animation",
    title: "AI 3D Models for Animation",
    description:
      "Generate mesh assets for animation shots from text or images and export them clean — with the honest caveat that rigging is not part of this clone.",
    subline:
      "Meshes and exports for your shots are real here; skeletons and rigs are not — and this page says so up front.",
    status: "partial",
    statusChip: "PARTIAL HERE",
    statusPanel: {
      summary:
        "You can generate and export animation-ready geometry here, but the rigging half of the reference's workflow does not exist in this clone.",
      works: [
        "Text-to-3D and image-to-3D generation produce real meshes with per-part material parameters.",
        "FBX, OBJ, GLB, GLTF, USDZ, STL exports — all real, all byte-verified, ready to import into your DCC.",
        "Deterministic reruns with a pinned seed, so revisions of a prop stay consistent.",
      ],
      limits: [
        "No rigging: no skeleton, no skinning, no A-pose/T-pose picker — the reference's rigging-ready claims do not apply here.",
        "No baked texture maps; materials are per-part PBR parameters (color/metalness/roughness).",
        "No polycount or LOD controls for animation budgets — decimate in your DCC after export.",
      ],
    },
    stepsTitle: "From still image to exportable mesh",
    steps: [
      {
        title: "Feed it the concept",
        body: "A character sheet, a prop sketch, or plain text — the pipeline reads the image through a vision model or the prompt directly.",
      },
      {
        title: "Let it build the mesh",
        body: "Generation assembles closed primitives into a single textured-parameter mesh, paced through visible stages.",
      },
      {
        title: "Export and rig it yourself",
        body: "Take FBX or OBJ into Blender/Maya and add the rig there — that part of the workflow is yours, honestly.",
      },
    ],
    benefitsTitle: "What you actually get",
    benefits: [
      {
        title: "Clean single-mesh output",
        body: "One object, closed primitives, per-part materials — a sane starting point for your own rigging pass.",
      },
      {
        title: "Real FBX and OBJ",
        body: "The ASCII FBX 7.3 exporter bakes world transforms and layer normals/UVs/colors, so imports land where you expect.",
      },
      {
        title: "Iterate with seeds",
        body: "Same prompt + same seed = same mesh, so a revised shot can reuse a consistent prop.",
      },
      {
        title: "Poster = truth",
        body: "The preview poster is a rasterization of the actual built geometry — what you approve is what you export.",
      },
    ],
    cardsTitle: "Where the meshes fit",
    cards: [
      {
        title: "Background & set props",
        body: "Objects that never touch a rig: furniture, signage, debris, hero-set dressing.",
      },
      {
        title: "Concept maquettes",
        body: "Block-in volumes for previz shots, exported as GLB for quick scene assembly in engine viewers.",
      },
      {
        title: "Environment dressing in bulk",
        body: "Generate a shelf of props per prompt variation and export the keepers.",
      },
      {
        title: "Matte-painting reference",
        body: "A quick 3D volume to paint over — the USDZ export even drops into AR reference views.",
      },
    ],
    faqTitle: "Animation workflow questions, clearly answered",
    faq: [
      {
        q: "Are these models rigging-ready?",
        a: "No — and we will not pretend otherwise. This clone produces clean meshes with per-part materials, but no skeletons, skinning, or pose selection. Rig in your DCC tool after export; the FBX/OBJ output is structured for that handoff.",
      },
      {
        q: "Can I get PBR texture maps for lookdev?",
        a: "Not here. Materials are per-part parameters (color, metalness, roughness) baked into the export — there are no separate albedo/normal map images to download.",
      },
      {
        q: "What formats should I use for animation?",
        a: "FBX or OBJ into your DCC, GLB for engine previz, USDZ for AR reference. All six formats (including GLTF and STL) are real exports in this clone.",
      },
      {
        q: "Do revisions stay consistent?",
        a: "With the seed pinned, yes — the same prompt rebuilds the same mesh. Change the seed or the prompt and you get a new take.",
      },
    ],
    crossLinksTitle: "Keep the pipeline moving",
    crossLinks: [
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "Refund Policy", href: "/legal/refund" },
    ],
    closingTitle: "Generate the mesh; bring the rig",
    closingBody:
      "Half of this workflow is real here — the geometry half. The rigging half stays in your DCC, and now you know exactly where the line sits.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text to 3D details", href: "/features/text-to-3d" },
  },
  {
    slug: "automotive-design",
    name: "Automotive Design",
    title: "AI 3D Car Model Generator for Automotive Design",
    description:
      "Generate concept-volume 3D car models from sketches or prompts and iterate in minutes — honest, concept-grade output with real multi-format export.",
    subline:
      "Sketch-speed concept volumes for theme exploration — exported as real OBJ, FBX, GLB, or STL.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The loop works: sketch or prompt in, concept volume out, real exports for your review pipeline.",
      works: [
        "Image-to-3D turns a sketch or photo into a concept mesh through the real vision pipeline.",
        "Prompt iteration with pinned seeds keeps a theme comparable across takes.",
        "OBJ / FBX into your DCC, GLB for web configurator drafts, STL for printed scale studies — all real exporters.",
      ],
      limits: [
        "Output is concept-volume grade — not Class-A surfacing, not engineering geometry.",
        "Materials are per-part PBR parameters, not automotive paint texture maps.",
        "No polycount control or LODs for scene budgets.",
      ],
    },
    stepsTitle: "From sketch to 3D car concept",
    steps: [
      {
        title: "Upload a sketch or photo",
        body: "A napkin proportion sketch is enough — the vision model reads it and the pipeline builds a volume interpretation.",
      },
      {
        title: "Get a textured volume model",
        body: "The mesh arrives as closed assembled geometry with per-part color, metalness, and roughness — body, glass, wheels as separate parts.",
      },
      {
        title: "Export for the review",
        body: "OBJ or FBX for the surfacing team, GLB for the web configurator draft, STL for the scale model on the desk.",
      },
    ],
    benefitsTitle: "Concept iteration at sketch speed",
    benefits: [
      {
        title: "Minutes, not days",
        body: "A paced pipeline run turns a sketch into reviewable geometry in the time a theme meeting takes to schedule.",
      },
      {
        title: "Comparable takes",
        body: "Pin the seed across prompt variants and the differences you see are the differences you wrote.",
      },
      {
        title: "Six real export lanes",
        body: "GLB, GLTF, OBJ, STL, USDZ, FBX — the full row, byte-verified, no fake buttons.",
      },
      {
        title: "AR design reviews",
        body: "USDZ export drops the concept into Quick Look for walk-around conversations.",
      },
    ],
    cardsTitle: "Where generated car models fit",
    cards: [
      {
        title: "Theme exploration",
        body: "Volume and proportion studies before any surfacing budget is spent.",
      },
      {
        title: "Configurator drafts",
        body: "GLB concepts for early web walkthroughs — replace with production models when they exist.",
      },
      {
        title: "Wheels & trim props",
        body: "Accessory and trim concepts exported as OBJ for detail work.",
      },
      {
        title: "Printed scale studies",
        body: "STL exports for desk scale models — concept-grade, honestly labeled.",
      },
    ],
    faqTitle: "AI car model generator FAQ",
    faq: [
      {
        q: "Can I get production-ready car surfaces?",
        a: "No. This clone's automotive output is concept-volume grade: proportion and theme exploration. Class-A surfacing, panel gaps, and engineering geometry remain the job of your CAD stack.",
      },
      {
        q: "Does it export FBX?",
        a: "Yes — a real ASCII FBX 7.3 with world-transform baking and layer normals/UVs/colors, alongside GLB, GLTF, OBJ, STL, and USDZ.",
      },
      {
        q: "Can I control the mesh density?",
        a: "Not in this clone. There is no polycount slider; export OBJ or FBX and decimate in your DCC if the review scene needs it.",
      },
      {
        q: "Will the same sketch give the same car?",
        a: "With the seed pinned, yes — the pipeline is deterministic per (prompt, seed). Change the seed for a new interpretation.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "HDRI Generator", href: "/omnicraft/hdri" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Generate your first 3D car concept",
    closingBody:
      "Upload the sketch, watch the volume take shape, export it for the room — the concept loop works here, honestly scoped.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
  },
  {
    slug: "character-design",
    name: "Character Design",
    title: "AI 3D Character Generator: Concept Art to 3D Model",
    description:
      "Turn character art or prompts into 3D character meshes with per-part materials — real exports, honest about poses and rigging staying in your DCC.",
    subline:
      "From character sheet to 3D mesh in one run — stylized or grounded, exported clean, rigging left where it belongs.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "Generating character meshes from sheets or prompts works here end to end, with real exports.",
      works: [
        "Image-to-3D reads character sheets through the real vision pipeline; text-to-3D takes prompts.",
        "Stylized or grounded takes by prompt direction, with seed-pinned reruns for consistency.",
        "GLB / GLTF / OBJ / STL / USDZ / FBX exports — all real, all byte-verified.",
      ],
      limits: [
        "No A-pose/T-pose selection and no rigging — poses and skeletons are DCC work here.",
        "Materials are per-part PBR parameters; no baked skin/texture maps.",
        "No polycount targeting for game budgets.",
      ],
    },
    stepsTitle: "How to generate a 3D character from an image",
    steps: [
      {
        title: "Feed it the character sheet",
        body: "Front view, turnaround, or a single loose drawing — the vision model captions it and the pipeline builds from what it saw.",
      },
      {
        title: "Let it build the mesh",
        body: "Closed primitives assemble into a single character mesh with parts for torso, head, limbs, and props.",
      },
      {
        title: "Finish with materials, then export",
        body: "Per-part color, metalness, and roughness land in the export — take FBX or OBJ into your DCC to rig.",
      },
    ],
    benefitsTitle: "Stylized, realistic, or in between",
    benefits: [
      {
        title: "Direction by prompt",
        body: "Push the take stylized, grounded, toy-like, or grim by wording — the LLM shapes the build spec from your language.",
      },
      {
        title: "Same character, new skin",
        body: "Pin the seed and vary the style words to get consistent volumes under different skins.",
      },
      {
        title: "Poster you can trust",
        body: "The approval poster is rendered from the built geometry itself — the export matches what you saw.",
      },
      {
        title: "Whole export row",
        body: "Six formats, including ASCII FBX 7.3 for DCC import and USDZ for AR previews of the design.",
      },
    ],
    cardsTitle: "Character work that fits this pipeline",
    cards: [
      {
        title: "Stylized & toon casts",
        body: "Silhouette-first designs where clean volumes matter more than skin detail.",
      },
      {
        title: "Mascots & brand characters",
        body: "Prompt the mascot, export GLB for the website's viewer, USDZ for the AR cameo.",
      },
      {
        title: "Creature concepts",
        body: "Body-plan explorations from text, iterated with pinned seeds.",
      },
      {
        title: "Customization dummies",
        body: "Base volumes to test outfit colorways via per-part material parameters.",
      },
    ],
    faqTitle: "AI 3D character generator FAQ",
    faq: [
      {
        q: "Can I choose an A-pose or T-pose?",
        a: "No. This clone has no pose picker; the character arrives in the pose the pipeline built. Re-pose in your DCC after FBX/OBJ export.",
      },
      {
        q: "Are the characters rigged?",
        a: "No — there is no skeleton or skinning in this clone. The mesh and materials are real; the rig is deliberately your half of the workflow, and we say so rather than imply otherwise.",
      },
      {
        q: "Do I get texture maps for the skin?",
        a: "You get per-part material parameters (color, metalness, roughness) baked into the export, not separate texture-map images. Paint maps in your DCC if the shot needs them.",
      },
      {
        q: "How do I keep one character consistent across takes?",
        a: "Pin the seed and keep the prompt stable — the pipeline is deterministic for (prompt, seed). Change either and you get a new take.",
      },
      {
        q: "What does a character generation cost?",
        a: "1 credit standard, 10 agentic, first task free; engine-tier tasks charge exactly 1 credit at Confirm & Export — the pay-by-result gate is real here.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Animation", href: "/use-cases/animation" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "NFT Creation", href: "/use-cases/nft-creation" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
    ],
    closingTitle: "Your next character starts as one image",
    closingBody:
      "Drop the sheet, generate the mesh, export it clean — the character loop works here, with the rigging line drawn honestly.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
  },
  {
    slug: "e-commerce",
    name: "E-commerce",
    title: "3D Product Models for E-commerce",
    description:
      "Turn product photos into 3D product models and export real GLB for store viewers and USDZ for AR Quick Look — no scan rig, no studio.",
    subline:
      "Catalog shots in, web-ready GLB and AR USDZ out — the format row your storefront accepts, as real exports.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The product-photo-to-model loop works here: upload the shot, generate, export GLB or USDZ.",
      works: [
        "Image-to-3D reads catalog shots through the real vision pipeline.",
        "GLB for web product viewers and USDZ for AR Quick Look — both real, byte-verified exports.",
        "OBJ, FBX, STL, GLTF also available when a channel needs them.",
      ],
      limits: [
        "Materials are per-part PBR parameters (color/metalness/roughness) — no baked studio-quality texture maps.",
        "No retopology or polycount targeting for viewer budgets.",
        "Geometry is a clean concept interpretation of the photo, not a photogrammetry scan.",
      ],
    },
    stepsTitle: "How to make 3D product models for e-commerce",
    steps: [
      {
        title: "Upload your catalog shot",
        body: "One product photo on a plain background reads best — the vision model captions shapes and parts from it.",
      },
      {
        title: "The pipeline builds mesh and materials",
        body: "Closed primitives assemble into the product volume with per-part color and finish parameters.",
      },
      {
        title: "Export for your storefront",
        body: "GLB for the web viewer, USDZ for Quick Look — download and deploy; both files are the real exporter output.",
      },
    ],
    benefitsTitle: "Formats your storefront actually accepts",
    benefits: [
      {
        title: "GLB, the web default",
        body: "One file, binary, viewer-ready — the export is the same geometry the poster preview showed.",
      },
      {
        title: "USDZ for Quick Look",
        body: "AR product placement on iPhone without a scan rig or a studio pipeline.",
      },
      {
        title: "PBR parameters that read as product",
        body: "Matte plastics to glossy metal via per-part roughness and metalness — simple products land surprisingly well.",
      },
      {
        title: "The long tail of formats",
        body: "OBJ, FBX, STL, GLTF for marketplaces, DCC touch-ups, and print catalogs — the full row is real.",
      },
    ],
    cardsTitle: "One workflow, every aisle",
    cards: [
      {
        title: "Furniture & home goods",
        body: "Lamps, stools, shelving — volumetric products that interpret cleanly from photos.",
      },
      {
        title: "Footwear, bags & accessories",
        body: "Silhouette-first products for viewer spins; fine stitching stays a photo's job.",
      },
      {
        title: "Consumer electronics",
        body: "Device volumes with glass/metal parameter mixes for configurator drafts.",
      },
      {
        title: "Jewelry & watches",
        body: "Small metal forms — pair the GLB viewer with the STL print path from the jewelry use case.",
      },
    ],
    faqTitle: "Product photo to 3D, answered",
    faq: [
      {
        q: "Do I get PBR texture maps for photoreal viewers?",
        a: "No — materials here are per-part parameters (color, metalness, roughness), not baked albedo/normal map images. For many hard-line products that reads well; for photoreal fabric and texture detail, keep your photography.",
      },
      {
        q: "Is the GLB optimized for web budgets?",
        a: "It is a real, clean export but there is no polycount targeting in this clone. If your viewer has a hard budget, decimate after export (OBJ/FBX round-trip) — the page won't pretend we remeshed it for you.",
      },
      {
        q: "Can it handle a whole catalog?",
        a: "One product per task, batched by you. Generation is metered (1 credit standard / 10 agentic, first task free), so cost scales honestly with how many you run.",
      },
      {
        q: "What about AR on the web?",
        a: "USDZ covers Quick Look on iOS; GLB covers WebXR and web viewers. Both exports are real and tested byte-for-byte.",
      },
    ],
    crossLinksTitle: "Explore other AI 3D workflows",
    crossLinks: [
      { label: "Jewelry Design", href: "/use-cases/jewelry-design" },
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Ship your first 3D product model",
    closingBody:
      "One photo in, GLB and USDZ out — the storefront loop works here, honestly scoped.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
  },
  {
    slug: "game-development",
    name: "Game Development",
    title: "AI 3D Asset Generator for Games",
    description:
      "Turn concept art or prompts into game-asset meshes and export GLB, FBX, OBJ and more for Unity and Unreal — real exports, honestly scoped.",
    subline:
      "Concept to engine in one pipeline — prop meshes with per-part materials, exported in the formats engines import.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The asset loop works here: prompt or concept art in, mesh out, real engine-format exports.",
      works: [
        "Text-to-3D and image-to-3D generate prop and environment meshes through the real pipeline.",
        "GLB and GLTF for web/engine, ASCII FBX 7.3 and OBJ for DCC round-trips, STL for print, USDZ for AR — the full real row.",
        "Seed-pinned reruns keep a prop consistent across revision passes.",
      ],
      limits: [
        "No polycount slider and no LOD generation — engine budgeting happens after export.",
        "Materials are per-part PBR parameters; no baked albedo/normal maps.",
        "Meshes are concept-grade assembled volumes, not AAA hero assets.",
      ],
    },
    stepsTitle: "Concept to engine in three steps",
    steps: [
      {
        title: "Start from concept art or a prompt",
        body: "Drop the concept piece or write the prop — crate, lamp post, ruined shrine — either input drives the build.",
      },
      {
        title: "Get a textured, closed mesh",
        body: "Closed primitives assemble into one mesh with per-part color, metalness, and roughness for blockout-to-dressed range.",
      },
      {
        title: "Export for your engine",
        body: "GLB into Unity or a web build, FBX/OBJ into Unreal or Blender for a dress pass — real bytes, every format.",
      },
    ],
    benefitsTitle: "What the pipeline actually gives you",
    benefits: [
      {
        title: "Real export row",
        body: "GLB, GLTF, OBJ, STL, USDZ, FBX — six genuine exporters, byte-verified, no dead buttons.",
      },
      {
        title: "Deterministic revisions",
        body: "Pin the seed and the prop rebuilds identically — swap the prompt words to iterate, keep the seed to refine.",
      },
      {
        title: "Poster is the mesh",
        body: "The preview is a rasterization of the built geometry — art review sees exactly what exports.",
      },
      {
        title: "Fast blockout volume",
        body: "Greybox-grade geometry in minutes for layout passes, then dress with real assets where it counts.",
      },
    ],
    cardsTitle: "One pipeline, every asset class",
    cards: [
      {
        title: "Props & set dressing",
        body: "The bread and butter — prompt a shelf of dressing, export the keepers.",
      },
      {
        title: "Environment pieces",
        body: "Rock formations, ruins, street furniture as concept volumes; pair with the HDRI tool for skies.",
      },
      {
        title: "Kitbash seeds",
        body: "Generate modular-ish parts to kitbash in Blender after FBX export.",
      },
      {
        title: "Prototyping stand-ins",
        body: "Placeholder meshes that read better than capsules during playtests.",
      },
    ],
    faqTitle: "AI 3D asset generator for games: FAQ",
    faq: [
      {
        q: "Can I set a target polygon count or generate LODs?",
        a: "No — this clone exposes neither. The mesh arrives at pipeline resolution; decimate or build LOD chains in your DCC after exporting OBJ or FBX. The reference's polycount controls are on its feature list, not ours, and we say so.",
      },
      {
        q: "Do exports include PBR maps?",
        a: "No. Materials are per-part parameters (color, metalness, roughness) carried in the mesh export — there are no separate texture-map images. Games needing map sets should treat output as blockout/base geometry.",
      },
      {
        q: "FBX for Unreal and Unity?",
        a: "Yes — a real ASCII FBX 7.3 with world-transform baking and layer normals/UVs/colors. GLB and GLTF are also first-class for web and Unity imports.",
      },
      {
        q: "Is the output game-ready?",
        a: "It is engine-importable and clean by construction (closed primitives, single mesh), but concept-grade in fidelity. Call it blockout-to-indie range, honestly.",
      },
      {
        q: "How is generation billed?",
        a: "Credits: 1 per standard task, 10 per agentic, first task free. Engine-tier (pay-by-result) tasks generate and preview free, then charge exactly 1 credit at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Animation", href: "/use-cases/animation" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "HDRI Generator", href: "/omnicraft/hdri" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Generate your first game asset",
    closingBody:
      "Prompt it, preview the true poster, export for the engine — the asset loop works here with the scope stated plainly.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
  },
];
