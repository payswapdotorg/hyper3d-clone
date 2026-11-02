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
      {
        q: "Can I convert my export without leaving the browser?",
        a: "Yes — the OmniCraft Format Convertor is a live tool here: take the GLB you exported and convert it into the other real formats in-browser. The reference's convert-in-the-browser card is genuinely mirrored by a working tool.",
      },
      {
        q: "How high-fidelity is a jewelry model here?",
        a: "Concept-grade, honestly: clean closed volumes with metal-and-stone parameter reads, not a jewelry CAD file. The reference's high-fidelity claim is its product — here the fidelity ceiling is a castable draft you verify before the burnout.",
      },
      {
        q: "Where is the gallery of finished pieces?",
        a: "There is none, and there won't be a faked one — no photo pipeline runs behind this clone. The poster preview is a real rasterization of the built geometry; that is the only preview truth offered.",
      },
      {
        q: "What about client trust badges and testimonials?",
        a: "The reference carries a trusted-by-creators band; this clone deliberately does not mirror it, because testimonials we cannot verify would be claims we cannot back. The status panel at the top of this page is the whole trust story.",
      },
    ],
    crossLinksTitle: "Related features and use cases",
    crossLinks: [
      { label: "3D Printing", href: "/use-cases/3d-printing" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "SVG to 3D", href: "/workspace/omnicraft/vecto3d" },
    ],
    closingTitle: "Model the next commission",
    closingBody:
      "Sketch in, STL out, verify before the burnout — the jewelry loop works here, scoped for the bench.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Image-to-3D details", href: "/features/image-to-3d" },
    techCards: {
      title: "Castable STL for lost-wax printing",
      intro:
        "The reference's castable band, card by card, carried honestly: what genuinely runs here, and where the bench takes over. The reference's gallery and trusted-by bands are deliberately unmirrored — no images or testimonials this clone cannot back.",
      cards: [
        {
          title: "Watertight for jewelry workflows",
          body: "The mesh builder unions closed primitives — band, bezel, stone volumes — into a single object with no open boundaries, so the slicer sees manifold wax-ready input rather than a repair project. Concept-grade, stated on the label.",
        },
        {
          title: "3D-printing-ready STL, with a checklist",
          body: "The STL download is a genuine serialization of the poster-approved geometry. Printing-ready means the shape prints; casting-ready means you have checked wall thickness, sprue placement, and shrink compensation in your slicer and CAD first.",
        },
        {
          title: "Convert formats in the browser",
          body: "The OmniCraft Format Convertor is live here — take the GLB into the tool and convert to the other real formats without leaving the browser. The one reference tool-card this clone can mirror with working code, not a promise.",
        },
        {
          title: "High-fidelity, honestly scoped",
          body: "The reference's high-fidelity models card is its claim. Here the ceiling is a clean concept draft with yellow-gold metalness and glassy stone parameters — enough to sell the commission, with the fidelity pass remaining in jewelry CAD.",
        },
      ],
    },
    exportTypes: {
      title: "The export row a bench actually gets",
      intro:
        "The reference's castable band names STL and format conversion. This clone's exporter serves exactly these six formats — STL leads the lost-wax lane, and the Format Convertor covers in-browser turns.",
      formats: [
        { name: "glb", note: "The client-review format — send the piece to a web viewer (the OmniCraft Model Viewer is live here) and turn it on a phone at the counter." },
        { name: "gltf", note: "The readable JSON twin — diffable when a commission's revisions need a paper trail." },
        { name: "fbx", note: "ASCII FBX 7.3 into jewelry CAD via DCC round-trip — the route to sizing and stone work." },
        { name: "obj", note: "The universal hand-off — most CAD packages open OBJ as a mesh reference for the fidelity pass." },
        { name: "stl", note: "The lost-wax lane. Real bytes from the poster-approved geometry — print the wax draft, verify, then cast." },
        { name: "usdz", note: "Quick Look on iOS — show the client the piece on their own hand before the wax is printed." },
      ],
    },
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
      {
        q: "Is the output really \"nearly production-ready\"?",
        a: "No — and the reference's own spec sheet phrase stays the reference's. Here the output is a concept-volume mesh: closed, clean, and honest for reviews and check prints, with no dimensions, tolerances, or parametric features. CAD is the next step, not a synonym.",
      },
      {
        q: "Can I review models without a CAD license?",
        a: "Yes — export GLB and open it in the OmniCraft Model Viewer (live tool) or any web viewer, and rotate the part in the meeting. USDZ even drops it into Quick Look on the bench phone.",
      },
      {
        q: "How do check prints fit the loop?",
        a: "Export STL and print the handle, housing, or fixture concept for a fit-by-eye check before CAD time is spent. The shape is slicer-ready; ergonomics verdicts belong to the hand that holds it.",
      },
      {
        q: "Does the pipeline remember my part across revisions?",
        a: "Deterministically, not conversationally: pin the seed and the same description rebuilds the same concept mesh. There is no persistent project memory — the (prompt, seed) pair is the memory.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D use cases",
    crossLinks: [
      { label: "3D Printing", href: "/use-cases/3d-printing" },
      { label: "Automotive Design", href: "/use-cases/automotive-design" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Bring your next concept to the review",
    closingBody:
      "Describe it, generate it, export it — the engineering-concept loop works here, accuracy limits stated.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
    techCards: {
      title: "The spec-sheet claims, answered",
      intro:
        "The reference's spec sheet leads with claims — output grade, format lanes, watertightness. This band answers each claim with what genuinely runs here, card by card.",
      cards: [
        {
          title: "\"Nearly production-ready\", answered",
          body: "The reference's spec sheet says nearly production-ready; this clone says concept-volume grade. Closed single mesh, per-part material reads, minutes from description — and no dimensions, tolerances, or GD&T anywhere in the output.",
        },
        {
          title: "OBJ / FBX — into your DCC",
          body: "Real lanes: ASCII FBX 7.3 with transforms and layers baked, OBJ with material references — the interchange pair that carries the concept into Blender, Maya, or a CAD mesh reference. Both byte-verified exporters.",
        },
        {
          title: "STL — watertight for the slicer",
          body: "Closed-primitive construction means manifold input for check prints: fit-by-eye fixtures, ergonomics handles, trade-show stand-ins. The engineering-verification half stays yours, and the page says so.",
        },
        {
          title: "GLB reviews, USDZ on the bench",
          body: "Browser reviews run on the real GLB export — no CAD license needed to look — and USDZ drops the same geometry into Quick Look for AR on the bench. Two more genuine lanes from one build.",
        },
      ],
    },
    exportTypes: {
      title: "The export row on the spec sheet",
      intro:
        "The reference's spec sheet lists its format lanes; this clone's exporter serves exactly these six, every one a real exporter — the spec sheet below is the one that runs.",
      formats: [
        { name: "glb", note: "Browser reviews — rotate the concept in the meeting with the OmniCraft Model Viewer, no CAD license needed." },
        { name: "gltf", note: "The readable twin — diffable when a review's revision history matters." },
        { name: "fbx", note: "ASCII FBX 7.3 into DCC tools — the round-trip lane for a dress pass before CAD." },
        { name: "obj", note: "The CAD mesh-reference lane — most packages open OBJ directly as reference geometry." },
        { name: "stl", note: "Check prints — real slicer input for fit-by-eye and ergonomics fixtures." },
        { name: "usdz", note: "AR on the bench — Quick Look the part on the shop-floor phone." },
      ],
    },
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
      {
        q: "How do LODs work for distant props?",
        a: "They don't — no LOD generation in this clone. Build or decimate LOD chains in your DCC after export, the same honest path as the polycount budget. The reference's optional LODs card is its product.",
      },
      {
        q: "Can I match my platform's style guide across props?",
        a: "Per-prop, yes — pin the seed family and keep the palette keywords stable so the shelf reads as one set. Platform-wide style enforcement is your art direction; the pipeline's promise is determinism, not taste.",
      },
      {
        q: "Where do skies and lighting come from?",
        a: "The OmniCraft HDRI generator is live here — prompt-seeded procedural skies with real PNG downloads. It pairs with the mesh pipeline: props from the studio, skies from the tool, both real.",
      },
      {
        q: "What about avatar rigs and wearables?",
        a: "Wearables and hand props export as static meshes — no rigging in this clone. Your avatar pipeline takes the FBX/OBJ and does the fitting; the animation use case covers where that line sits.",
      },
    ],
    crossLinksTitle: "More pipelines, same generator",
    crossLinks: [
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "VR/AR", href: "/use-cases/vr-ar" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Stock your world",
    closingBody:
      "Prompt the props, export the GLB, import to the platform — the world-stocking loop works here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Text-to-3D details", href: "/features/text-to-3d" },
    promptExamples: {
      title: "Prompts that stock a world",
      intro:
        "The reference's page promises everything a world needs. These cards are that shelf, honestly: each prompt compiles here, and each note says what the import actually lands as.",
      cards: [
        {
          prompt: "a night market stall: striped canopy, hanging lanterns, crate displays, flat-color palette",
          note: "Compiles a closed single mesh — dressing that reads at event scale. Pin the seed and the stall family stays consistent; import the GLB straight into the world builder.",
        },
        {
          prompt: "an avatar hand prop: ornate lantern, warm glass panels, brass frame, chunky proportions",
          note: "Arrives as a static mesh — no rigging here, so your avatar pipeline does the fitting. 'Chunky proportions' keeps the read at avatar scale, where fine detail dies anyway.",
        },
        {
          prompt: "a seasonal re-skin: the same market stall, winter palette — deep reds, snow caps, ice lanterns",
          note: "The re-skin mechanic is real: same seed, new palette keywords, same silhouette re-skinned. And the sky for the season comes from the live HDRI generator, not the mesh pipeline.",
        },
      ],
    },
    techCards: {
      title: "Target polygon count & optional LODs — the honest status",
      intro:
        "The reference's page carries this band twice; here it is answered once, plainly: the budget levers are not in this clone — the consistency levers are — and the optimization path is written down.",
      cards: [
        {
          title: "No budget slider, no LOD ladder",
          body: "Neither target polycount nor LOD generation exists in this clone — the reference's controls are its product. The mesh imports at the resolution the pipeline built, and the page says so instead of shipping a fake optimize button.",
        },
        {
          title: "The optimization path, stated",
          body: "Export GLB for the platform, or OBJ/FBX for a DCC pass, and decimate to the budget on your side. It is one extra honest step — and it is yours, which is exactly what the page is for.",
        },
        {
          title: "Seed-locked re-skins",
          body: "Seasonal swaps are the reference's pitch and this clone's strength: pin the seed, change the color words, and the same prop re-skins with the same silhouette. Deterministic, repeatable, no drift.",
        },
        {
          title: "Skies from the live HDRI tool",
          body: "Environment lighting pairs with the OmniCraft HDRI generator — a real in-browser tool with prompt-seeded procedural skies and PNG downloads. Environments & skyboxes is a two-tool workflow here, both halves real.",
        },
      ],
    },
    exportTypes: {
      title: "The export row a world platform gets",
      intro:
        "The reference's format story is GLB-first with flexible export — this clone's exporter serves exactly these six, GLB leading, all byte-verified. No KTX2 or Draco packing on the GLB; plain and honest.",
      formats: [
        { name: "glb", note: "The platform currency — one binary file with materials and vertex colors, imported by virtually every world builder." },
        { name: "gltf", note: "The readable twin for platforms and pipelines that want the text form of the same asset." },
        { name: "fbx", note: "ASCII FBX 7.3 — the DCC round-trip lane when a prop needs an edit pass before import." },
        { name: "obj", note: "The universal hand-off — legacy importers of any age open it." },
        { name: "stl", note: "When an event prop needs a physical twin — real bytes for the slicer." },
        { name: "usdz", note: "Quick Look on iOS — preview the prop in the room before it goes into the world." },
      ],
    },
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
      {
        q: "What actually happens on mint day?",
        a: "The asset half happens here: you export the per-tier GLB/USDZ files, real bytes from the seed-locked base. The chain half — contract, mint, reveal — is your pipeline; this clone has no wallet, no minting, and no button pretending otherwise.",
      },
      {
        q: "How do I keep the base mesh identical across tiers?",
        a: "Pin one seed for the whole ladder and vary only the material words per tier. Collectors compare finishes, not geometry drift — determinism is the rarity ladder's backbone here.",
      },
      {
        q: "Can holders view the NFT in AR?",
        a: "Yes, with the real USDZ export — drop it into Quick Look on iOS, no custom app. The GLB twin covers web and marketplace viewers; both lanes come from the same geometry.",
      },
      {
        q: "What about the physical edition tier?",
        a: "STL export is real — the printed-tier path is genuinely open: download, slice, print. Quality is concept-grade, honestly the same ceiling as the 3D-printing use case.",
      },
    ],
    crossLinksTitle: "AI 3D workflows beyond NFT art",
    crossLinks: [
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Copyright License", href: "/legal/copyright-license" },
    ],
    closingTitle: "Your first 3D collectible is one prompt away",
    closingBody:
      "Concept it, generate it, export the GLB — the asset half of the drop works here; the chain half stays yours.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "Output license terms", href: "/legal/copyright-license" },
    promptExamples: {
      title: "Rarity-ladder prompts",
      intro:
        "The reference's rarity ladder is the page's own idea — one base mesh, a ladder of finishes. These cards are the ladder, compiled honestly: one seed, three skins, stated gaps.",
      cards: [
        {
          prompt: "a vinyl-toy mascot: round guardian spirit, stubby limbs, sealed eyes, matte finish",
          note: "The Common tier — the base mesh the whole ladder hangs from. Pin this prompt's seed; every tier below reuses it so collectors compare finishes, never geometry drift.",
        },
        {
          prompt: "the same guardian spirit, wooden-toy skin: warm oak tones, visible grain read, carved feel",
          note: "The Uncommon tier is a re-skin: same seed, new material words. The 'wooden grain' arrives as parameter reads — color and roughness — not a scanned wood texture, and no map images ship.",
        },
        {
          prompt: "the same guardian spirit, legendary edition: polished chrome, glowing seams, dark core",
          note: "The Legendary tier is the same trick at full gloss — metalness high, emissive-look core. Export GLB per tier and the drop's files are real bytes; minting them stays your half.",
        },
      ],
    },
    techCards: {
      title: "What happens on mint day",
      intro:
        "The reference's own heading, answered with the clone's honest split: the asset half runs here, the chain half never did — and the page says exactly where the line sits.",
      cards: [
        {
          title: "The asset half, ready",
          body: "Per-tier exports are real: GLB for marketplaces, USDZ for holder AR, STL for the printed tier — all six formats live, all byte-verified. The files are the drop's assets, generated from the seed-locked base.",
        },
        {
          title: "The chain half, yours",
          body: "No wallet, no contract deploy, no mint button, no reveal mechanic — nothing on this clone touches a chain, and nothing pretends to. Your mint pipeline consumes the exported files; that is the whole interface.",
        },
        {
          title: "Rarity as parameters",
          body: "Tiers differ by per-part material parameters — color, metalness, roughness — not by separate texture files. The ladder is honest and cheap to walk: same seed, new words, new finish.",
        },
        {
          title: "No marketplace wiring",
          body: "There is no marketplace integration, listing feed, or sales analytics here — the reference's downstream cards stay its product. The export row plus your pipeline is the entire shipping surface.",
        },
      ],
    },
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
      {
        q: "How do I hit a frame budget?",
        a: "You don't, at generation time — no polycount targeting or LODs here. Export OBJ or FBX, decimate to budget in your DCC, then bring the GLB back. The reference's optimization card is its product; the honest path is written on this page.",
      },
      {
        q: "Can I convert formats without a DCC?",
        a: "Yes — the OmniCraft Format Convertor is live here: turn the GLB into the other real formats in-browser. It is the no-DCC lane for platform format juggling.",
      },
      {
        q: "How do I light a WebXR scene?",
        a: "The OmniCraft HDRI generator is live here — prompt a sky (sunset, starfield, storm) and download a real PNG environment map for your scene's lighting. Skies and props from the same toolchain.",
      },
      {
        q: "Do exports survive at arm's length?",
        a: "Per-part metalness and roughness reads hold up at AR scale, where flat decals fall apart. Fine surface detail beyond parameter materials is not here — hero-grade texturing stays your DCC pass.",
      },
    ],
    crossLinksTitle: "Related use cases and tools",
    crossLinks: [
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Put a model in the room",
    closingBody:
      "Generate the mesh, export GLB and USDZ, light it with a generated sky — the AR/VR loop works here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Open the studio", href: STUDIO_PATH },
    ctaSecondary: { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
    promptExamples: {
      title: "Prompts that build scenes",
      intro:
        "The reference's page sells scenes, not just props — a night sky from one sentence, surfaces that hold up close. These cards compile both halves honestly, with the real tools named.",
      cards: [
        {
          prompt: "a night sky for a WebXR campfire scene: deep indigo gradient, low starfield, faint horizon glow",
          note: "This one compiles in the live HDRI generator, not the mesh pipeline — prompt-seeded procedural skies with real PNG downloads. The tool is linked from this page and genuinely runs in the browser.",
        },
        {
          prompt: "an AR furniture try-on: a low-slung lounge chair, cream boucle fabric read, warm walnut legs, chunky silhouette",
          note: "The boucle read is a roughness-and-color parameter mix, not a woven texture image — parameters carry it at room scale, where flat decals fall apart anyway. The chunky silhouette reads in AR, and USDZ drops the chair into Quick Look for the placement moment.",
        },
        {
          prompt: "a training-scene prop: safety helmet with visor, workshop bench clamp, high-visibility palette",
          note: "AR work-instruction drafts — concept meshes with high-read palettes. Export GLB for the web scene, USDZ for the phone; the instruction logic is your platform's half.",
        },
      ],
    },
    techCards: {
      title: "Frame rate is the real art director",
      intro:
        "The reference's own heading — and the honest place to say what this clone does and does not do about budgets. The art director is real; the budget buttons are not.",
      cards: [
        {
          title: "Budgets are yours, stated plainly",
          body: "No polycount targeting, no LOD chains, no Draco/KTX2 compression in this clone — the optimization pass happens after export in your DCC. The page refuses to ship an optimize button it cannot back.",
        },
        {
          title: "What already runs lean",
          body: "Closed-primitive meshes import clean and single, per-part parameters ride in-file, and GLB lands plain and uncompressed — predictable inputs for your budget math, with no hidden remesh surprises.",
        },
        {
          title: "Skies from one sentence",
          body: "The reference's card is mirrored by a live tool here: the OmniCraft HDRI generator builds prompt-seeded procedural skies — sunset, starfield, storm — with real PNG downloads for scene lighting.",
        },
        {
          title: "Convert without leaving the browser",
          body: "The OmniCraft Format Convertor is live: turn the GLB into the other real formats in-browser — the no-DCC lane the reference's card promises, delivered as working code.",
        },
      ],
    },
    exportTypes: {
      title: "The full export row for AR/VR pipelines",
      intro:
        "The reference's band leads with GLB and USDZ; this clone's exporter serves all six below — the AR/VR pair first-class, every lane a genuine exporter, no compression packing pretended.",
      formats: [
        { name: "glb", note: "WebXR and web viewers — the web's 3D default, one binary file with materials in place." },
        { name: "gltf", note: "The readable twin — for pipelines that post-process or diff scene assets." },
        { name: "fbx", note: "Unity and Unreal round-trips when a scene needs a DCC pass first — ASCII FBX 7.3." },
        { name: "obj", note: "The universal fallback every engine importer opens." },
        { name: "stl", note: "Physical twins for training props and fixtures — real bytes for the slicer." },
        { name: "usdz", note: "Apple Quick Look — the AR lane that puts the model in the room on iOS." },
      ],
    },
  },
];
