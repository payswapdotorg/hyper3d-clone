/**
 * Use-case content B — the reference sitemap's last 5 pages
 * (jewelry-design, mechanical-engineering, metaverse, nft-creation,
 * vr-ar), honestly rewritten for this clone. Same fact tethering as
 * use-case-content-a.ts.
 */
import type { UseCasePageDef } from "./use-case-types";
import { STUDIO_PATH } from "./studio-path";

export const USE_CASE_PAGES_B: UseCasePageDef[] = [
  {
    slug: "jewelry-design",
    name: "Jewelry Design",
    title: "AI Jewelry Design: 3D Jewelry Models from a Sketch",
    description:
      "Turn a ring sketch or photo into a 3D jewelry concept and export real STL for lost-wax printing — with casting-grade honesty about what to verify.",
    subline:
      "Sketch to castable-draft STL in one run — rings, pendants, earrings as concept models you verify before casting.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The jewelry loop works: sketch or photo in, concept mesh out, STL download for the printer.",
      works: [
        "Image-to-3D reads ring sketches and photos; text-to-3D takes descriptions with stone and metal cues.",
        "STL export is real and byte-verified — the same geometry the poster showed.",
        "Metal and stone reads via per-part metalness/roughness parameters; OBJ/FBX for CAD round-trips.",
      ],
      limits: [
        "Output is a casting *draft*: wall thickness, sprue attachment, and shrinkage are yours to verify in the slicer/CAD.",
        "No gem-cutting library or parametric ring sizer — the mesh is an interpretation, not a jewelry CAD file.",
        "Materials are parameters, not enamel/opal texture maps.",
      ],
    },
    stepsTitle: "From sketch to 3D jewelry model",
    steps: [
      {
        title: "Draw or photograph the piece",
        body: "A side-view ring sketch or a photo of a similar piece is enough input for the vision pipeline.",
      },
      {
        title: "Generate the concept mesh",
        body: "The build assembles band, bezel, and stone volumes with metal-and-stone material parameters.",
      },
      {
        title: "Export STL and prep the print",
        body: "Download the STL, check thickness and supports in your slicer, then print the wax draft.",
      },
    ],
    benefitsTitle: "Castable-draft, honestly labeled",
    benefits: [
      {
        title: "Real STL for lost-wax",
        body: "The export is a genuine STL serialization — from the poster-approved geometry to the printer input, no swaps.",
      },
      {
        title: "Minutes per concept",
        body: "Commission conversations get a printable draft while the client is still at the counter.",
      },
      {
        title: "Metal & stone parameters",
        body: "Yellow-gold metalness, satin-finish roughness, glassy stone parts — the reads that sell a concept render.",
      },
      {
        title: "Format Convertor next door",
        body: "The OmniCraft convertor turns your exported GLB into other real formats without leaving the browser.",
      },
    ],
    cardsTitle: "Every job on the bench",
    cards: [
      {
        title: "Rings",
        body: "Band + bezel + stone volume concepts from a sketch or a few words.",
      },
      {
        title: "Pendants & lockets",
        body: "Silhouette-first pieces — the format the pipeline interprets most cleanly.",
      },
      {
        title: "Earrings & small castings",
        body: "Draft pairs for symmetry checks before CAD commitment.",
      },
      {
        title: "Custom commissions",
        body: "Iterate the client's description with pinned seeds until the draft matches their words.",
      },
    ],
    faqTitle: "AI jewelry design, asked and answered",
    faq: [
      {
        q: "Is the STL really castable?",
        a: "It is a real STL of a closed-primitive concept mesh — printable and worth a wax draft. Casting-grade details (wall thickness minimums, sprue placement, shrink compensation) must be verified in your slicer and CAD; this page will not claim engineering verification it does not have.",
      },
      {
        q: "Can it size rings parametrically?",
        a: "No — there is no ring-sizer or parametric jewelry system in this clone. Export OBJ/FBX into your jewelry CAD for sizing.",
      },
      {
        q: "Does it model gem cuts?",
        a: "Stones arrive as simple glassy volumes, not faceted cuts. Swap in real gem geometry in CAD.",
      },
      {
        q: "How do I keep a client's iteration consistent?",
        a: "Pin the seed and adjust only the words that matter — the pipeline is deterministic for (prompt, seed).",
      },
    ],
    crossLinksTitle: "Related features and use cases",
    crossLinks: [
      { label: "3D Printing", href: "/use-cases/3d-printing" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
      { label: "SVG to 3D", href: "/omnicraft/vector" },
    ],
    closingTitle: "Model the next commission",
    closingBody:
      "Sketch in, STL out, verify before the burnout — the jewelry loop works here, scoped for the bench.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
  },
  {
    slug: "mechanical-engineering",
    name: "Mechanical Engineering",
    title: "AI 3D Model Generator for Engineering Concept Models",
    description:
      "Turn part photos, sketches, or prompts into mesh concept models for design reviews and check prints — honest spec sheet up front.",
    subline:
      "Concept meshes for reviews and check prints, with the accuracy limits stated on the label.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The concept-model loop works: photo/sketch/prompt in, mesh out, real exports for review and check prints.",
      works: [
        "Image-to-3D interprets part photos and sketches; text-to-3D takes functional descriptions.",
        "OBJ / FBX into DCC and CAD viewers, STL for check prints, GLB for browser reviews — all real.",
        "Deterministic reruns with pinned seeds for consistent review iterations.",
      ],
      limits: [
        "Not CAD: no parametric features, no dimensional accuracy, no GD&T — concept volume only.",
        "No polycount control; export and decimate if your viewer has a budget.",
        "Materials are per-part parameters, not engineering material libraries.",
      ],
    },
    stepsTitle: "From idea to concept model",
    steps: [
      {
        title: "Photograph or describe the part",
        body: "A bench photo, a whiteboard sketch, or a written description of the geometry you need to think about.",
      },
      {
        title: "Get a concept mesh",
        body: "The pipeline builds a closed, single-mesh interpretation with per-part material reads.",
      },
      {
        title: "Put it in the review",
        body: "GLB in the browser review, FBX/OBJ in the DCC, STL off the printer for an ergonomics check.",
      },
    ],
    benefitsTitle: "The spec sheet, up front",
    benefits: [
      {
        title: "Concept speed, honestly labeled",
        body: "Minutes from description to reviewable volume — and every page says exactly how far the fidelity goes.",
      },
      {
        title: "Check prints that fit",
        body: "STL export is real slicer input for fit-by-eye and ergonomics prints before CAD time is spent.",
      },
      {
        title: "Browser reviews",
        body: "GLB export opens in the OmniCraft viewer or any web viewer — no CAD license needed to look.",
      },
      {
        title: "Six real formats",
        body: "GLB, GLTF, OBJ, STL, USDZ, FBX — the whole row byte-verified, no stub buttons.",
      },
    ],
    cardsTitle: "Where the mesh earns its keep",
    cards: [
      {
        title: "Design exploration",
        body: "Volume studies for enclosures and brackets before the first CAD feature.",
      },
      {
        title: "Reviews that end on time",
        body: "A rotating GLB in the meeting beats three orthographic screenshots.",
      },
      {
        title: "Check prints & ergonomics",
        body: "Hand-fit prints of handle and housing concepts from STL.",
      },
      {
        title: "Training & manuals",
        body: "Simple exploded-concept meshes for assembly illustrations.",
      },
    ],
    faqTitle: "FAQ: AI 3D model generator for engineering",
    faq: [
      {
        q: "Is the output dimensionally accurate?",
        a: "No. This clone produces concept-volume meshes from photos, sketches, or prompts — no dimensions, tolerances, or parametric features. It is a thinking tool that precedes CAD, and it says so.",
      },
      {
        q: "Can I get the model into my CAD tool?",
        a: "Yes — OBJ and STL import into most CAD packages as mesh references; FBX round-trips through DCC tools first if you prefer.",
      },
      {
        q: "Does it know engineering materials?",
        a: "Materials are per-part PBR parameters (color/metalness/roughness) — visual reads, not material libraries with properties.",
      },
      {
        q: "What does a concept model cost in credits?",
        a: "1 credit standard, 10 agentic, first task free; pay-by-result engine tasks charge exactly 1 credit at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "3D Printing", href: "/use-cases/3d-printing" },
      { label: "Automotive Design", href: "/use-cases/automotive-design" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Bring your next concept to the review",
    closingBody:
      "Describe it, generate it, export it — the engineering-concept loop works here, accuracy limits stated.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
  },
  {
    slug: "metaverse",
    name: "Metaverse",
    title: "3D Assets for the Metaverse",
    description:
      "Generate props, accessories, and environment pieces for virtual worlds and export lightweight GLB — real bytes for platform imports.",
    subline:
      "Stock the world before the event — prompt the props, export the GLB, import to your platform.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The world-stocking loop works: prompt props in, real GLB out for platform import.",
      works: [
        "Text-to-3D generates props, accessories, and environment pieces through the real pipeline.",
        "GLB — the platform currency — is a real byte-verified export; GLTF when a platform wants the text form.",
        "Re-skins via per-part material parameters, deterministic with pinned seeds.",
      ],
      limits: [
        "No automatic remesh-to-poly-budget — platform budgeting happens after export.",
        "No glTF extension packing (KTX2/Draco) — plain GLB/GLTF output.",
        "Materials are parameters, not texture-map sets.",
      ],
    },
    stepsTitle: "From reference to world-ready",
    steps: [
      {
        title: "Start with what you have",
        body: "A prompt is enough; a reference photo of the prop works too through the vision pipeline.",
      },
      {
        title: "Get a textured mesh",
        body: "Closed-primitive geometry with per-part color and finish parameters — vendor stalls, signage, foliage concepts.",
      },
      {
        title: "Export GLB for the platform",
        body: "Download the GLB and import into your world builder — the bytes are the exporter's real output.",
      },
    ],
    benefitsTitle: "Everything a world needs",
    benefits: [
      {
        title: "GLB first",
        body: "The binary format virtually every world platform imports — exported for real here.",
      },
      {
        title: "Seasonal re-skins",
        body: "Pin the seed, change the color words — the same prop re-skinned for the holiday build.",
      },
      {
        title: "Environment pieces",
        body: "Skyboxes and lighting moods pair with the live HDRI generator next door in OmniCraft.",
      },
      {
        title: "Bulk drafting",
        body: "Generate a shelf of variations per prompt, keep the ones the world needs.",
      },
    ],
    cardsTitle: "What worlds get stocked with",
    cards: [
      {
        title: "Props & set dressing",
        body: "Market stalls, lamps, crates, signage — the dressing that makes a space feel built.",
      },
      {
        title: "Avatar accessories",
        body: "Hand props and wearables as concept meshes (rigging stays in your pipeline).",
      },
      {
        title: "Environment pieces",
        body: "Rocks, ruins, flora concepts — plus HDRI skies from the OmniCraft tool.",
      },
      {
        title: "Event builds",
        body: "Draft the pop-up event space props before the modeling budget lands.",
      },
    ],
    faqTitle: "Metaverse 3D models: straight answers",
    faq: [
      {
        q: "Can you remesh to my platform's poly budget?",
        a: "No — this clone has no automatic retopology or budget remeshing. Export GLB (or OBJ/FBX for a DCC pass) and optimize on your side; we state the limit instead of shipping a button that pretends.",
      },
      {
        q: "Are textures platform-ready (KTX2/Draco)?",
        a: "The GLB is plain, uncompressed, and honest — no KTX2 or Draco extension packing in this clone. Materials are per-part parameters rather than texture images.",
      },
      {
        q: "Can I get avatar-ready rigged meshes?",
        a: "No rigging here. Accessories and hand props export as static meshes; your avatar pipeline takes it from the FBX/OBJ export.",
      },
      {
        q: "What formats does the export row cover?",
        a: "GLB, GLTF, OBJ, STL, USDZ, and FBX — six real exporters, byte-verified.",
      },
    ],
    crossLinksTitle: "More pipelines, same generator",
    crossLinks: [
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "HDRI Generator", href: "/omnicraft/hdri" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Stock your world",
    closingBody:
      "Prompt the props, export the GLB, import to the platform — the world-stocking loop works here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
  },
  {
    slug: "nft-creation",
    name: "NFT Creation",
    title: "3D NFT Creator",
    description:
      "Generate 3D collectible concepts from prompts and export real GLB for marketplaces and AR — the minting stays yours, honestly.",
    subline:
      "One prompt to a 3D collectible concept, exported as the GLB marketplaces actually take.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The collectible loop works: prompt the concept, generate variants, export the GLB.",
      works: [
        "Text-to-3D turns character and collectible prompts into meshes with per-part materials.",
        "GLB export is real — the format most 3D NFT marketplaces ingest.",
        "Rarity-tier skins by prompt variants with pinned seeds for a consistent base mesh.",
      ],
      limits: [
        "No minting, no marketplace integration, no wallet — the on-chain half is entirely outside this clone.",
        "No baked texture-map sets; skins are per-part material parameters.",
        "No polycount targeting for marketplace limits.",
      ],
    },
    stepsTitle: "How to generate 3D NFT art",
    steps: [
      {
        title: "Feed it the concept",
        body: "Describe the collectible — base form, vibe, era. The LLM shapes the build spec from your words.",
      },
      {
        title: "Choose a variant",
        body: "Generate takes, keep the one with the silhouette; the poster shows the true geometry.",
      },
      {
        title: "Skin the rarity tiers",
        body: "Pin the seed, vary the material words — one base mesh, a ladder of finishes.",
      },
      {
        title: "Ship a lean GLB",
        body: "Export the GLB per tier and hand it to your mint pipeline — real bytes, no renders pretending to be models.",
      },
    ],
    benefitsTitle: "One base mesh, a whole rarity ladder",
    benefits: [
      {
        title: "Seed-locked consistency",
        body: "The base mesh rebuilds identically across tiers — collectors compare finishes, not geometry drift.",
      },
      {
        title: "GLB market-ready",
        body: "The export is the format marketplaces want, produced by a byte-verified exporter.",
      },
      {
        title: "AR flex included",
        body: "USDZ export drops the same collectible into Quick Look for holder reveals.",
      },
      {
        title: "Physical edition path",
        body: "STL export exists when the drop includes a printed physical tier.",
      },
    ],
    cardsTitle: "Where your 3D NFT goes next",
    cards: [
      {
        title: "Marketplace listing",
        body: "GLB upload to 3D-capable marketplaces — the model is the product, not a video loop.",
      },
      {
        title: "AR flex",
        body: "USDZ for holder AR moments without a custom app.",
      },
      {
        title: "Physical edition",
        body: "STL to the printer for the print-paired tier.",
      },
      {
        title: "Community variants",
        body: "Seed-pinned re-skins for community-designed rarities.",
      },
    ],
    faqTitle: "3D NFT questions, answered straight",
    faq: [
      {
        q: "Does this mint the NFT for me?",
        a: "No. This clone generates and exports the 3D asset; minting, contracts, wallets, and marketplace listing are entirely outside it — stated plainly rather than papered over with a fake button.",
      },
      {
        q: "Can I generate 10,000 variations?",
        a: "Not in one task. Generation is one mesh per task, metered with credits — 1 credit per standard task, 10 per agentic, first task free — so batch and attribute-assembly happen in your own pipeline. Seed-pinned reruns keep the base consistent while you vary the words.",
      },
      {
        q: "What file do marketplaces get?",
        a: "A real GLB (binary glTF) — plus GLTF, OBJ, STL, USDZ, and FBX if your pipeline wants them. All six exporters are genuine.",
      },
      {
        q: "Are skins separate texture files?",
        a: "No — skins are per-part material parameters (color, metalness, roughness) baked into each export. No albedo/normal map images ship from this clone.",
      },
    ],
    crossLinksTitle: "AI 3D workflows beyond NFT art",
    crossLinks: [
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "Copyright License", href: "/legal/copyright-license" },
    ],
    closingTitle: "Your first 3D collectible is one prompt away",
    closingBody:
      "Concept it, generate it, export the GLB — the asset half of the drop works here; the chain half stays yours.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Output license terms", href: "/legal/copyright-license" },
  },
  {
    slug: "vr-ar",
    name: "VR/AR",
    title: "3D Models for AR & VR",
    description:
      "Generate VR/AR asset meshes from photos or prompts and export real GLB for WebXR and USDZ for Quick Look — frame budget honestly yours.",
    subline:
      "GLB for WebXR, USDZ for Quick Look — the AR/VR format pair as real exports, and a live HDRI tool for the skies.",
    status: "live",
    statusChip: "WORKS HERE",
    statusPanel: {
      summary:
        "The AR/VR asset loop works: photo or prompt in, GLB/USDZ out — both real exports.",
      works: [
        "Text-to-3D and image-to-3D generate prop and environment meshes through the real pipeline.",
        "GLB for WebXR and USDZ for AR Quick Look — byte-verified exports, the exact pair AR/VR ships on.",
        "The OmniCraft HDRI generator makes real environment skies for your scenes, in-browser.",
      ],
      limits: [
        "No polycount/LOD control — device budgets are managed after export in your DCC.",
        "No KTX2/Draco packing on GLB; plain, honest output.",
        "Materials are per-part parameters, not PBR map sets; no rigging for hand interactions.",
      ],
    },
    stepsTitle: "How to make 3D models for AR and VR",
    steps: [
      {
        title: "Start from a photo or a prompt",
        body: "A product photo or a scene-prop description — either input drives the real pipeline.",
      },
      {
        title: "Optimize for VR and AR (your pass)",
        body: "The mesh exports clean and closed; decimate to your device budget in a DCC if needed — we won't pretend we did it.",
      },
      {
        title: "Export GLB for web, USDZ for Quick Look",
        body: "Both downloads are the exporter's real output for the geometry the poster showed.",
      },
    ],
    benefitsTitle: "GLB for WebXR, USDZ for Quick Look",
    benefits: [
      {
        title: "The AR/VR format pair",
        body: "GLB is the web's 3D default and USDZ is iOS AR's — both are genuine exports here.",
      },
      {
        title: "Skies from one sentence",
        body: "The live HDRI generator builds real equirect environments — sunset, starfield, storm — for your scene's lighting mood.",
      },
      {
        title: "Surfaces that hold up at arm's length",
        body: "Per-part metalness/roughness reads survive AR scale, where flat decals fall apart.",
      },
      {
        title: "FBX and OBJ for engines",
        body: "Round-trip through Unity or Unreal when a scene needs DCC work first — the whole row is real.",
      },
    ],
    cardsTitle: "Build the scene, not just the prop",
    cards: [
      {
        title: "AR product try-ons",
        body: "USDZ furniture and device meshes for Quick Look placement.",
      },
      {
        title: "WebXR scenes",
        body: "GLB props plus HDRI skies — the two exports AR/VR web scenes actually consume.",
      },
      {
        title: "VR walkthrough dressing",
        body: "Environment concept volumes for archviz-lite walkthroughs.",
      },
      {
        title: "Training & instruction",
        body: "Simple concept meshes for AR work-instruction drafts.",
      },
    ],
    faqTitle: "AR/VR asset questions, answered",
    faq: [
      {
        q: "Are the models optimized for mobile frame budgets?",
        a: "The meshes are clean single objects, but this clone offers no polycount targeting, LODs, or Draco/KTX2 compression. Optimize after export — the honest path beats a fake 'optimized' badge.",
      },
      {
        q: "Can I get rigged hands/interactables?",
        a: "No rigging in this clone. Static meshes export fine (GLB/USDZ/FBX/OBJ); interaction rigs are built in your engine.",
      },
      {
        q: "Does it make environment maps too?",
        a: "Yes — the OmniCraft HDRI generator is live here: prompt-seeded procedural skies with real 2K/4K PNG downloads for your scene lighting.",
      },
      {
        q: "What about USDZ on Android?",
        a: "USDZ is the iOS/Quick Look lane; Android AR and web viewers consume the GLB export. Both are real here — use the right lane per platform.",
      },
    ],
    crossLinksTitle: "Related use cases and tools",
    crossLinks: [
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "HDRI Generator", href: "/omnicraft/hdri" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Put a model in the room",
    closingBody:
      "Generate the mesh, export GLB and USDZ, light it with a generated sky — the AR/VR loop works here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "HDRI Generator", href: "/omnicraft/hdri" },
  },
];
