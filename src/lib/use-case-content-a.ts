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
      {
        q: "Can I print at a specific scale?",
        a: "Not directly — there is no unit scaler in this clone. Export the STL and set the scale in your slicer, which is where print sizing belongs anyway (and where your printer's calibration lives).",
      },
      {
        q: "How watertight is \"watertight\", exactly?",
        a: "Watertight by construction: the mesh builder unions closed primitives into a single object with no open boundaries, which is what slicers want as input. It is still a concept-grade mesh, not an engineering-verified solid — the label means exactly what it says.",
      },
      {
        q: "Why is there no gallery of finished prints?",
        a: "Because there is no photo pipeline behind this clone to produce one honestly. The studio's poster preview is a real rasterization of the built geometry — that is the only preview truth on offer, and a gallery of prints we cannot show would be a claim we cannot back.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Jewelry Design", href: "/use-cases/jewelry-design" },
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Your next print starts as one prompt",
    closingBody:
      "Describe it, generate it, export the STL, and slice it — the whole loop works right here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
    promptExamples: {
      title: "Prompt recipes for the print queue",
      intro:
        "The reference's page walks makers from a prompt to a printed part. These cards are the same walk, honestly labeled: each prompt compiles here, and each note says what actually comes out.",
      cards: [
        {
          prompt: "a tabletop miniature: a squat stone golem sentinel on a 32mm round base, shield on the left arm",
          note: "Compiles into a closed single mesh you can export as STL and scale in the slicer. Concept-grade detail — the slicer sees manifold assembled primitives, not sculpted micro-detail, so prime it or finish by hand for table quality.",
        },
        {
          prompt: "a cosplay shoulder pauldron, faceted low-poly style, one wearable shell with a strap lip",
          note: "Builds a printable concept volume for prop finishing — sand, prime, and paint the print. The faceted style prints cleanly because the geometry is closed primitives unioned into one shell, not a scanned organic surface.",
        },
        {
          prompt: "a desk cable clip: low arch with a slot, chamfered edges, thumb-flat base",
          note: "A draft fixture to check fit-by-eye — the honest path to real brackets. Print it, test the fit, then model the final part in CAD with proper wall thickness and clearances; this clone will not pretend the draft is the part.",
        },
      ],
    },
    techCards: {
      title: "Watertight or it doesn't print",
      intro:
        "The reference's own heading, and the one claim this clone can make from first principles. Here is how watertight actually happens here, card by card — with the reference's other print controls marked where they are absent.",
      cards: [
        {
          title: "Watertight by construction",
          body: "The mesh builder unions closed boxes, spheres, cylinders, and the rest of the primitive vocabulary into a single object with no open boundaries — a slicer sees manifold input, not a repair project. That is the whole trick, stated plainly.",
        },
        {
          title: "The polycount lever the reference has",
          body: "The reference's Target Polygon Count & Optional LODs controls are not in this clone — you print the mesh the pipeline built, at the resolution it was built. If the file is heavy for your printer, decimate in your DCC after OBJ or FBX export; no slider here pretends otherwise.",
        },
        {
          title: "One mesh, materials per part",
          body: "Materials are per-part PBR parameters — color, metalness, roughness — so color rides inside the GLB and OBJ exports rather than in separate map files. STL carries the shape alone; resin color prints need your slicer's own painting tools.",
        },
        {
          title: "Cast with your own checklist",
          body: "Ring blanks and pendant drafts print fine as concept volumes. Lost-wax casting is on you and your bench: wall thickness, sprue placement, and shrink compensation are slicer-and-foundry decisions this page will not fake confidence about.",
        },
      ],
    },
    exportTypes: {
      title: "The export row a print workflow actually gets",
      intro:
        "The reference's page promises STL, 3MF and OBJ. This clone's exporter serves exactly these six formats — 3MF is not among them, stated plainly rather than padded, and STL is the one your slicer eats.",
      formats: [
        { name: "glb", note: "The web/AR twin of your print — send it to a viewer (the OmniCraft Model Viewer is live here) to check proportions before committing filament." },
        { name: "gltf", note: "The readable JSON twin of GLB — diffable in version control when print revisions need a paper trail." },
        { name: "fbx", note: "ASCII FBX 7.3 into DCC tools — the route to an edited or decimated copy before reprinting." },
        { name: "obj", note: "The universal geometry hand-off — most slicers open OBJ directly, material references intact." },
        { name: "stl", note: "The slicer format. Real bytes serialized from the same geometry the poster previewed — no render-to-mesh swaps between preview and download." },
        { name: "usdz", note: "Drop the model into Quick Look on iOS to sanity-check scale in the room before printing it for real." },
      ],
    },
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
      {
        q: "What can I edit without leaving the browser?",
        a: "The studio's honest subset: the orientation popup re-aims the mesh, per-part material parameters can be re-set and re-run, and ControlNet constraints steer proportions before generation. A hosted sculpt/paint/remesh editor is not in this clone.",
      },
      {
        q: "Does the FBX import cleanly into Blender or Maya?",
        a: "The exporter is ASCII FBX 7.3 with world transforms baked and layer normals/UVs/colors included — imports land where you expect, scene-ready for dressing. Rig-ready only after your own pass, since no skeleton ships.",
      },
      {
        q: "How does this compare to the reference's rigging-ready pitch?",
        a: "Plainly: the reference sells nearly-ready-to-use rigged assets. Here you get the geometry half — clean meshes, real six-format exports, deterministic reruns — and the rigging half stays in your DCC. The split is the page's whole honesty contract.",
      },
      {
        q: "Can I check the mesh before export?",
        a: "Yes, twice: the poster preview is a true rasterization of the built geometry, and the OmniCraft Model Viewer (live tool) opens the exported result in the browser. What you approve is what exports.",
      },
    ],
    crossLinksTitle: "Keep the pipeline moving",
    crossLinks: [
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Refund Policy", href: "/legal/refund" },
    ],
    closingTitle: "Generate the mesh; bring the rig",
    closingBody:
      "Half of this workflow is real here — the geometry half. The rigging half stays in your DCC, and now you know exactly where the line sits.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text to 3D details", href: "/features/text-to-3d" },
    promptExamples: {
      title: "Prompt recipes for shot assets",
      intro:
        "The reference's page is built around characters, props, and set dressing. These cards are that anatomy, honestly translated: what each prompt compiles into here, and where the rigging line sits.",
      cards: [
        {
          prompt: "a roadside diner booth set: two bench seats, laminate table, chrome leg, ketchup bottle on the table",
          note: "Background set dressing that never touches a rig — generate, export GLB for previz, and dress the shot. Pin the seed and retakes rebuild the same booth, so the edit stays continuous.",
        },
        {
          prompt: "a hero prop: brass pocket telescope, three-drawer body, ringed eyepiece, worn metal finish",
          note: "Props the rig touches need clean geometry more than bones — this compiles a single closed mesh with per-part brass parameters for your own FK parenting in DCC. No skeleton ships from here, ever.",
        },
        {
          prompt: "a previz city block: six mixed-height towers, rooftop water tanks, street-level storefronts",
          note: "Block-in volumes for previz — generate per-block variations and bulk-export the keepers. Concept-grade by design; matte-paint over them freely and let the animatic carry the fidelity.",
        },
      ],
    },
    techCards: {
      title: "Mesh inspection and creative editing — the real subset",
      intro:
        "The reference's page pitches its hosted OmniCraft mesh editor for inspection and creative edits. This clone's honest subset lives in the studio itself — here is exactly what exists and what does not.",
      cards: [
        {
          title: "Orientation, for real",
          body: "The studio's orientation popup re-aims the generated mesh before export — the same control the reference's editor sells for turning a model upright. It runs on the real geometry, not a faked preview.",
        },
        {
          title: "Material redo, for real",
          body: "Per-part material parameters — color, metalness, roughness — can be re-set and re-run in the studio: a repaint pass without leaving the pipeline. It is parameters, not texture-map painting, and it says so.",
        },
        {
          title: "Aspect constraints, for real",
          body: "ControlNet spatial constraints (bounding-box, voxel, and point-cloud modes) steer proportions before generation — the closest thing here to layout-directed editing, and it is wired into the real build.",
        },
        {
          title: "The hosted editor is not here",
          body: "The reference's sculpt/paint/mask/remesh suite is not in this clone — no tabbed editor page pretends otherwise. The mesh route stays generate, inspect, export, then edit in the DCC of your choice.",
        },
      ],
    },
    exportTypes: {
      title: "Formats the animation half actually ships",
      intro:
        "The reference's page promises High-Quality FBX or GLB. This clone's exporter serves exactly these six — all byte-verified — and the rigging half stays in your DCC either way.",
      formats: [
        { name: "glb", note: "Engine previz and quick scene assembly — one binary file with materials and vertex colors, straight into most viewers." },
        { name: "gltf", note: "The JSON twin — handy when a previz pipeline wants to post-process or diff scene documents." },
        { name: "fbx", note: "ASCII FBX 7.3 with world transforms and layer normals/UVs/colors baked — the DCC hand-off for your own rigging pass." },
        { name: "obj", note: "The neutral geometry hand-off — every rigger's fallback import, openable anywhere." },
        { name: "stl", note: "Maquette printing — block-in volumes for desk reference while you rig the hero asset." },
        { name: "usdz", note: "AR reference views on iPhone — check silhouette and proportion in the room before the shot." },
      ],
    },
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
      {
        q: "Can I get PBR texture maps for lookdev?",
        a: "Not here — materials are per-part parameters (color, metalness, roughness) carried inside the mesh export. There are no separate map images to download; the reference's PBR maps card is its product, not this clone's.",
      },
      {
        q: "Can I configure trim variants in one model?",
        a: "Not in one file — generate each variant as its own task with its own pinned seed, so the variants stay comparable. Deterministic reruns keep the theme family consistent where it matters.",
      },
      {
        q: "How do AR walkarounds work?",
        a: "Export USDZ and open it in Quick Look on iOS — real bytes, in the room, at whatever scale your viewer applies. There is no hosted AR showroom page here; the file is the showroom.",
      },
      {
        q: "Does it ship clean topology and mesh controls?",
        a: "Clean by construction — closed primitives unioned into a single mesh. Mesh controls are not here: no polycount slider, no remesh, no topology brush. Decimate after OBJ/FBX export in your DCC; the reference's controls card stays its product.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Generate your first 3D car concept",
    closingBody:
      "Upload the sketch, watch the volume take shape, export it for the room — the concept loop works here, honestly scoped.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
    promptExamples: {
      title: "Concept prompts that iterate",
      intro:
        "The reference's pitch is theme exploration at sketch speed — the loop here is fast because it is deterministic and seeded. These cards are the iteration mechanics, honestly labeled.",
      cards: [
        {
          prompt: "a roadster concept: long hood, swept fenders, open cockpit, wire wheels, low stance",
          note: "Compiles a closed concept volume — proportion and stance read clearly, surfacing stays concept-grade. Re-run with the seed pinned and vary only the wheel or fender words to compare takes side by side.",
        },
        {
          prompt: "an off-road theme: raised suspension, boxy cabin, roof rack with spares, chunky all-terrain tires",
          note: "Theme families arrive as separate tasks, not parametric reskins of one car — each prompt is a fresh compile. Pin a seed per theme and the theme stays itself across revision passes.",
        },
        {
          prompt: "a streamliner study: teardrop canopy, skirted rear wheels, polished bare metal finish",
          note: "The polished-metal read is per-part metalness and roughness parameters in the export — visual concept material, not a Class-A surface. Take OBJ into CAD when the theme wins the meeting.",
        },
      ],
    },
    exportTypes: {
      title: "Exports that fit automotive pipelines",
      intro:
        "The reference's six-card band, mirrored with this clone's real six. Its PBR texture maps card has no twin here — materials are parameters, not baked maps, and every lane below is a genuine exporter.",
      formats: [
        { name: "glb", note: "Configurator drafts and web reviews — one binary file with materials in place, straight into a viewer." },
        { name: "gltf", note: "The readable twin of GLB — diffable when a configurator pipeline post-processes the concept." },
        { name: "fbx", note: "Surfacing reference into Maya or Blender — ASCII FBX 7.3 with transforms and layers intact." },
        { name: "obj", note: "The neutral interchange for CAD-adjacent tools — geometry with material references, openable anywhere." },
        { name: "stl", note: "Scale-model studies for the desk — real bytes sliced from the reviewed geometry." },
        { name: "usdz", note: "AR design reviews on iPhone — Quick Look walkarounds of the concept volume, straight from the export row." },
      ],
    },
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
      {
        q: "How do I steer stylized versus realistic?",
        a: "Style lives in the prompt's keyword palettes — 'faceted low-poly', 'chunky toy proportions', 'flat-color palette' compile visibly different builds. 'Realistic' reads as per-part PBR parameters; hero-grade map sets are not here.",
      },
      {
        q: "Can I re-skin one character for a lineup?",
        a: "Yes, deterministically — pin the seed and change only the palette or outfit keywords: same silhouette, new skin. Change the seed instead and you get a new take, not a variant.",
      },
      {
        q: "What is the fastest path to a posed character?",
        a: "Export FBX or OBJ and pose in your DCC — there is no pose picker or skeleton here, so the pose pass is yours by design. The character-design loop ends honestly at clean, rigged-by-you geometry.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "Animation", href: "/use-cases/animation" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "NFT Creation", href: "/use-cases/nft-creation" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
    ],
    closingTitle: "Your next character starts as one image",
    closingBody:
      "Drop the sheet, generate the mesh, export it clean — the character loop works here, with the rigging line drawn honestly.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
    promptExamples: {
      title: "Character prompts that compile",
      intro:
        "The reference's page sells stylized, realistic, and in-between from one sheet. These cards show the same range honestly: keyword palettes do the styling, and every note says where the pipeline's reach ends.",
      cards: [
        {
          prompt: "a stylized scout: hooded cloak, crossbody satchel, lantern on the belt, faceted low-poly style",
          note: "Keyword palettes steer the style for real — 'faceted low-poly' compiles flat, chunky forms with clean silhouettes. Export GLB for the engine, or FBX for your own rig pass; no skeleton ships either way.",
        },
        {
          prompt: "a shopkeeper character: apron, rolled sleeves, friendly slouch, chunky toy proportions",
          note: "Proportion keywords like 'chunky toy' push silhouette, not topology — the mesh stays closed primitives under the read. Parent and pose in DCC when the lineup needs a pose.",
        },
        {
          prompt: "a knight, flat-color palette: steel plate, crimson tabard, closed helm, grounded stance",
          note: "The same knight re-skins deterministically — new palette keywords, same seed, same silhouette. Variant sheets for your lineup without geometry drift between takes.",
        },
      ],
    },
    techCards: {
      title: "Stylized, realistic, or in between — the honest controls",
      intro:
        "The reference sells style bands and a Sim Ready panel (pose, polycount, LODs). This clone's style levers are prompt keywords and material parameters; the gaps are stated where they sit.",
      cards: [
        {
          title: "Stylized and toon, by keyword",
          body: "Style lives in the prompt: 'faceted low-poly', 'chunky toy proportions', 'flat-color palette' are honored by the compiler's keyword palettes — the real style lever here, and it compounds with the seed for consistent families.",
        },
        {
          title: "Game-ready realism, by parameters",
          body: "'Realistic' reads as per-part PBR parameters — color, metalness, roughness — carried inside the export. Engines read them fine; baked map sets for close-up hero shots are not produced here.",
        },
        {
          title: "Same character, new skin",
          body: "Pin the seed, change the palette keywords: the same silhouette re-skinned. The reference's outfit-variant card, done deterministically — collectors compare skins, not geometry drift.",
        },
        {
          title: "The Sim Ready panel is not here",
          body: "No A-pose/T-pose picker, no target polycount, no LOD ladder — the reference's panel is its product, not this clone's. Export, decimate, and pose in your DCC; that path is stated instead of faked.",
        },
      ],
    },
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
      {
        q: "Do I need a photo studio for input?",
        a: "No — one clear catalog shot on a plain background is enough for the image door, or describe the product and skip photography entirely. The vision pass reads either input into the same spec compiler.",
      },
      {
        q: "Can customers view the models in AR?",
        a: "Yes, with the real USDZ export — open it in Quick Look on iOS, no custom app needed. GLB covers web viewers. What this clone does not have is a hosted AR showroom page; the files are the experience.",
      },
      {
        q: "Does it connect to my store platform?",
        a: "No — there is no platform integration, plugin, or product feed in this clone. Export the files and wire them into your storefront yourself; the pipeline ends honestly at real bytes.",
      },
      {
        q: "Will the model match the photo exactly?",
        a: "No — output is a concept-grade model of the photographed product: closed primitives with per-part materials, faithful to proportions and palette, not a photogrammetry reconstruction. For fabric and texture detail, keep your photography.",
      },
    ],
    crossLinksTitle: "Explore other AI 3D workflows",
    crossLinks: [
      { label: "Jewelry Design", href: "/use-cases/jewelry-design" },
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Ship your first 3D product model",
    closingBody:
      "One photo in, GLB and USDZ out — the storefront loop works here, honestly scoped.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
    techCards: {
      title: "The product page is your new showroom",
      intro:
        "The reference's showroom pitch, honest edition — the loop that actually runs here, card by card, with the platform gaps marked where they sit.",
      cards: [
        {
          title: "Catalog shot to model",
          body: "Upload the photo you already shot; the vision pass captions shapes and parts into the spec compiler and the mesh builds paced and visible. No rebooking the studio, no turntable rig — one frame reads fine.",
        },
        {
          title: "Deterministic catalog consistency",
          body: "Pin the seed and the same shot rebuilds the same model — the consistency a catalog needs across re-exports, fixes, and channel variants. Change the seed only when you want a new interpretation.",
        },
        {
          title: "Quick Look on product pages",
          body: "USDZ export is real: drop the file into an iOS Quick Look context and the product sits in the customer's room. The web twin is GLB in any viewer — both lanes ship from the same geometry.",
        },
        {
          title: "No marketplace integration",
          body: "There is no Shopify bridge, plugin directory, or marketplace feed in this clone — the files are yours to take and the storefront plumbing is yours to build. Stated plainly rather than papered over with a fake connect button.",
        },
      ],
    },
    exportTypes: {
      title: "Every format the exporter row actually ships",
      intro:
        "The reference's format band names four storefront lanes. This clone's exporter serves all six below — real bytes, byte-verified — with the PBR maps lane honestly absent (materials are parameters, not baked maps).",
      formats: [
        { name: "glb", note: "Web product viewers — one binary file with materials and vertex colors, the default for storefront 3D." },
        { name: "gltf", note: "The JSON twin for pipelines that post-process or diff product models between channel versions." },
        { name: "fbx", note: "DCC interchange for hero-shot retouching — ASCII FBX 7.3 with transforms intact." },
        { name: "obj", note: "The universal geometry exchange — legacy tools of any age open it." },
        { name: "stl", note: "When a product needs a physical twin — real bytes for the slicer, straight from the reviewed geometry." },
        { name: "usdz", note: "Apple Quick Look on product pages — the AR try-it-in-the-room moment, straight from the export row." },
      ],
    },
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
      {
        q: "Can it build a whole modular kit in one go?",
        a: "One task builds one mesh (within the compiler's 2-12 object span). Kits arrive piece by piece — pin a seed per piece for a consistent family, then assemble and dress the kit in your DCC.",
      },
      {
        q: "Do characters and creatures work for games?",
        a: "As static meshes, yes — clean closed geometry with per-part materials, no skeleton. Rig in your DCC after FBX/OBJ export; the character-design use case covers the honest path in detail.",
      },
      {
        q: "How do skyboxes and lighting fit in?",
        a: "The OmniCraft HDRI generator is live here — prompt-seeded procedural skies with real PNG downloads for your engine's lighting. It is a separate in-browser tool from the mesh pipeline, cross-linked below.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Animation", href: "/use-cases/animation" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Generate your first game asset",
    closingBody:
      "Prompt it, preview the true poster, export for the engine — the asset loop works here with the scope stated plainly.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
    promptExamples: {
      title: "Prompt recipes for the asset pipeline",
      intro:
        "The reference's page promises one pipeline for every asset class. These cards are that promise, honestly scoped: each prompt compiles through the real spec compiler, and each note says where fidelity lands.",
      cards: [
        {
          prompt: "a modular dungeon wall segment: stone blocks, arched top, torch sconce, flat-color palette",
          note: "Compiles a closed single mesh — kit-ready proportions via keyword palettes. Re-run with the seed pinned so the wall set stays consistent, then decimate in your DCC to hit the engine budget (no polycount slider here).",
        },
        {
          prompt: "a market stall prop: striped awning, crate display, hanging lantern, chunky proportions",
          note: "'Chunky proportions' is the real silhouette lever — keywords push the read, not the topology. Export GLB straight into the engine, or FBX for a dress pass first.",
        },
        {
          prompt: "a creature concept: squat moss golem, glowing eyes, bark plates, low-poly style",
          note: "The compiler builds within its 2-12 object span — this golem lands as one closed mesh. No LOD ladder ships; the budget pass is your DCC's, and the creature-design fidelity ceiling is concept-grade.",
        },
      ],
    },
    techCards: {
      title: "Target polygon count, strong silhouette",
      intro:
        "The reference's own band on budgets and silhouettes, answered honestly: the budget lever is not here — the silhouette lever is — and the path to budgets is stated instead of faked.",
      cards: [
        {
          title: "The silhouette is real",
          body: "Chunky, readable shapes are exactly what closed-primitive assembly does well — keyword palettes push proportions the way a prop silhouette wants, and the deterministic seed keeps the read stable across revisions.",
        },
        {
          title: "The polycount slider is not",
          body: "No target-polycount control and no LOD generation in this clone — the reference's budget card is its product, not ours. Export OBJ or FBX and decimate in your DCC; that is the honest budget path and it is written on the page.",
        },
        {
          title: "Kit consistency by seed",
          body: "Pin the seed per kit piece and revisions rebuild identically — modular sets that do not drift between re-exports. Cross-piece consistency is your art direction; per-piece consistency is the pipeline's promise.",
        },
        {
          title: "Materials travel inside",
          body: "Per-part PBR parameters ride in the GLB and OBJ exports — no separate map sets to manage. Flat-color and keyword-palette styles read as intended in-engine; hero-grade texturing is your DCC pass.",
        },
      ],
    },
  },
];
