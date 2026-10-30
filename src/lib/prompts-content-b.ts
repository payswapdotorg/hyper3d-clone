/**
 * Written prompt articles, part 2 — props, objects & products, then the
 * first environments (t69). Same contract as part 1: original prompts
 * that run in this clone's studio, craft notes anchored to code that
 * runs here, and no reproduction of the reference's community content.
 */

import type { PromptArticleDef } from "./prompts-types";

export const PROMPT_ARTICLES_B: PromptArticleDef[] = [
  {
    slug: "corporate-interceptor-drone-asset-2095176360238915978",
    title: "Corporate Interceptor Drone",
    description:
      "A written prompt page: a game-ready drone asset prompt with notes on game-asset qualifiers, PBR temperature, and the export formats engines actually eat.",
    blurb:
      "The game-asset qualifier is a real instruction to the planner — this drone prompt shows what it buys you and which export the engine wants.",
    prompt:
      "a corporate security interceptor drone, quad tilt-rotor, matte black polymer shell, red sensor ring, stowed landing skids, game asset",
    keywords: ["drone", "game asset", "hard surface", "sci-fi"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Stowed parts are a decimation instruction",
        body: "'Stowed landing skids' tells the planner not to model deployed mechanics — hinges, struts, clearance — that a game asset would never show. Every part you declare stowed or absent is face budget returned to the silhouette. Game engines eat FBX; the Web eats GLB; both come out of the same single-credit confirm.",
      },
      {
        title: "One accent color, one accent light",
        body: "The red sensor ring is the only saturated thing in the prompt on purpose — a single accent read survives compression, LODs, and dark scenes; two accents halve each other. The PBR temperature slider in the viewer then decides whether the black polymer reads as glossy ceramic or worn ABS before you commit.",
      },
      {
        title: "Effort tiers for hard surface",
        body: "Hard-surface subjects reward the Medium-to-High band (20 to 40 seconds): the tilt-rotor pylons and sensor ring are where cheap passes collapse into blobs. Watch the preview at Medium first — if the ring reads as a torus and the pylons as boxes, that is the signal to escalate rather than to re-prompt.",
      },
    ],
    related: [
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Generate game assets (article)", href: "/blog/generate-3d-game-assets" },
      { label: "Mech blueprint prompt (written)", href: "/3d-prompts/mech-robot-blueprint-set-2082760534500188606" },
    ],
  },
  {
    slug: "lod-ready-assault-pod-spaceship-2095126622319845478",
    title: "LOD-Ready Assault Pod",
    description:
      "A written prompt page: a drop-pod prompt with the honest LOD story — what the planner can promise about decimation and what remains your job.",
    blurb:
      "A drop-pod prompt with the LOD honesty: one clean silhouette generation, decimation as a real pass, and no auto-LOD chain here.",
    prompt:
      "a military assault drop pod, truncated cone hull, ablative heat shield skirt, four impact legs, olive drab hull with stencil markings",
    keywords: ["spaceship", "lod", "game asset", "military"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "The honest LOD chain",
        body: "This pipeline generates one mesh and can decimate it — there is no automatic LOD chain that emits four levels of detail on export. If the pod needs LOD1 through LOD3, decimate in your DCC after export, or generate a deliberately low-poly variant with a second prompt ('same drop pod, low-poly, game asset') — the style page for low-poly carries the recipe notes.",
      },
      {
        title: "Stencil markings instead of panel lines",
        body: "Panel-line geometry is where face budgets die. 'Stencil markings' moves the visual interest onto the texture stage — markings are albedo work, nearly free — while the hull stays a clean truncated cone that decimates gracefully. Hard-surface prompts that plan for decimation read better after it.",
      },
      {
        title: "One generation, two honest variants",
        body: "The pod's deployed and stowed states are two prompts, not one scene. Generate the flight variant, confirm it, then run the landed variant with the legs splayed and the skirt scorched — each is a standard single-credit task, and previews for both are free before either is confirmed.",
      },
    ],
    related: [
      { label: "Low-poly style page", href: "/styles/low-poly" },
      { label: "Topology and LODs (help)", href: "/help/articles/control-topology-polycount-and-lods" },
      { label: "Interceptor drone prompt (written)", href: "/3d-prompts/corporate-interceptor-drone-asset-2095176360238915978" },
    ],
  },
  {
    slug: "formula-one-car-in-blender-2096125193580113957",
    title: "Formula-One Racer",
    description:
      "A written prompt page: an open-wheel racer prompt about livery-first thinking, with notes on surface verbs and the automotive-design use case.",
    blurb:
      "Livery first, aero second: the F1 prompt that works names the paint scheme before the wing package and lets the planner fill in the rest.",
    prompt:
      "a formula-one race car, low slung nose with stacked front wing, halo safety hoop, glossy silver livery with a single teal stripe, slick tires",
    keywords: ["vehicle", "racing", "livery", "automotive"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Livery is the cheapest identity",
        body: "'Glossy silver with a single teal stripe' is six words that make the car yours. Livery clauses are pure texture-stage work — they cost no geometry, they survive decimation, and they read at any distance. Every vehicle prompt should carry one livery clause before any aero clause.",
      },
      {
        title: "Surface verbs beat part lists",
        body: "'Low slung nose' is a surface verb; it steers proportion. A front-wing element list (endplates, flaps, cascades) would steer nothing — the planner does not know current regulations. Name three reads (nose, halo, slicks) and let the silhouette carry the class.",
      },
      {
        title: "The automotive use case is the honest companion",
        body: "The automotive-design use case page walks the whole path — block-out here, surfacing in your DCC, visualization after — and says plainly which stages this studio does not do. A car prompt here buys you a stylized, presentation-grade shell, not a panel-gapped CAD model; keeping that boundary in mind makes the output land better.",
      },
    ],
    related: [
      { label: "Automotive design use case", href: "/use-cases/automotive-design" },
      { label: "Modern style page", href: "/styles/modern" },
      { label: "Photorealistic style page", href: "/styles/photorealistic" },
    ],
  },
  {
    slug: "printable-uss-enterprise-cad-assembly-2095641163441254676",
    title: "Printable Ship Assembly",
    description:
      "A written prompt page: a printable model-ship kit prompt — saucer, hull, nacelles — with the honest CAD-assembly and print notes.",
    blurb:
      "A printable kit prompt that leans on sub-part names instead of CAD booleans — plus the honest note on where assemblies really happen.",
    prompt:
      "a science-fiction exploration starship kit, saucer section with raised bridge dome, cigar-shaped engineering hull, two slender engine nacelles on pylons, display base",
    keywords: ["3d printing", "starship", "kit", "assembly"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Sub-part names do the assembly work",
        body: "Saucer, engineering hull, nacelles, pylons: the planner knows these shapes as units, so the model arrives already blocked like a kit. That is the honest ceiling here — a true CAD assembly with mated joints and tolerances is a CAD-tool job; STL export from this studio gives you the parts fused as one mesh unless you generate them as separate tasks.",
      },
      {
        title: "One kit, four generations",
        body: "The print-maker's move: generate the saucer, hull, and nacelles as separate single-mesh tasks — each preview is free, each confirm is one credit — then assemble in your slicer where you control joint pins and clearances. Four honest generations beat one fused guess.",
      },
      {
        title: "The display base is the print trick",
        body: "'Display base' in the prompt gives the model a flat printable footing — the cheapest stability any printed kit can have. The slicer repair pass is still yours to run: watertightness is never promised by this pipeline, and the printing use case page says so in the same words.",
      },
    ],
    related: [
      { label: "3D printing use case", href: "/use-cases/3d-printing" },
      { label: "Printable action figure (written)", href: "/3d-prompts/articulated-printable-action-figure-2095481098201387287" },
      { label: "What is STL", href: "/blog/what-is-stl" },
    ],
  },
  {
    slug: "rotatable-3d-shogi-board-2096579856133947507",
    title: "Shogi Board and Pieces",
    description:
      "A written prompt page: a board-game set prompt — one material language across board and pieces — with notes on repeat-shape sets and honest rotation.",
    blurb:
      "A board-game set as one generation: shared material language across the board and pieces, five-sided wedge prompts, and a live viewer you can actually spin.",
    prompt:
      "a traditional shogi board with scattered playing pieces, plain cypress wood board with carved grid lines, wedge-shaped pieces with ink characters, one piece mid-move",
    keywords: ["board game", "shogi", "wood", "set"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Shared material language unifies a set",
        body: "Board and pieces both being cypress is what makes the set read as one object. Set prompts fail when each element brings its own material story — pick one material for the whole set and let shape differentiate the parts.",
      },
      {
        title: "The mid-move piece is the narrative clause",
        body: "'One piece mid-move' is this prompt's story beat — a single tilted wedge implies a game in progress, the same trick as the hide-and-seek diorama's while-clause. Sets with one disturbed element photograph like scenes; sets in perfect rows photograph like inventory.",
      },
      {
        title: "Rotation is real here",
        body: "The live viewer spins the confirmed model with real drag — no turntable video, but genuine 360 inspection before you trust the carve work. Ink characters on the wedges will be texture-stage suggestion rather than calligraphy; that is an honest limit worth knowing before you print.",
      },
    ],
    related: [
      { label: "Minimalist style page", href: "/styles/minimalist" },
      { label: "Organic style page", href: "/styles/organic" },
      { label: "Keyboard prompt (written)", href: "/3d-prompts/editable-3d-keyboard-animation-2095111032171876470" },
    ],
  },
  {
    slug: "editable-3d-keyboard-animation-2095111032171876470",
    title: "Product Keyboard",
    description:
      "A written prompt page: a hero product shot prompt for a keyboard — with notes on product-page geometry, e-commerce use, and honest 'editable' scope.",
    blurb:
      "A product-presentation prompt: one hero angle, one material pair, and an honest note that 'editable' here means redo passes, not parametric CAD.",
    prompt:
      "a premium mechanical keyboard at a three-quarter hero angle, machined aluminum case, warm beige keycaps with dark legends, one keycap mid-press",
    keywords: ["product", "keyboard", "e-commerce", "hero shot"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "The hero angle belongs in the prompt",
        body: "'Three-quarter hero angle' steers the poster render, the preview, and the model's implied front — product shots live and die on this angle, so claim it early. The mid-press keycap is the narrative clause again: one moving part makes a static product feel handled.",
      },
      {
        title: "Aluminum and keycaps are the material pair",
        body: "Machined aluminum against matte plastic is the classic product-material contrast — hard against soft, precise against fuzzy. Two materials is the ceiling for product prompts; a third (backlighting, cable, desk surface) dilutes the pair that sells the shot.",
      },
      {
        title: "Editable, honestly",
        body: "The route name promises an editable keyboard; what this studio offers is redo passes — geometry and material regeneration with their own quotas — on a generated mesh, not parametric editability where key count is a slider. Generate the 60-percent version and the full-size version as two prompts; that is the honest path to variants.",
      },
    ],
    related: [
      { label: "E-commerce use case", href: "/use-cases/e-commerce" },
      { label: "Modern style page", href: "/styles/modern" },
      { label: "Shogi set prompt (written)", href: "/3d-prompts/rotatable-3d-shogi-board-2096579856133947507" },
    ],
  },
  {
    slug: "interactive-3d-robotic-hand-simulation-2081475055536820506",
    title: "Robotic Hand Study",
    description:
      "A written prompt page: an engineering-study prompt for a robotic hand — articulation as geometry, and the honest boundary where simulation starts.",
    blurb:
      "An engineering-study prompt: knuckle blocks and tendon channels read as designed articulation — and the simulation itself is honestly not part of this pipeline.",
    prompt:
      "an engineering-study robotic hand, palm block with visible servo housings, three-segment fingers, exposed tendon cables, matte graphite finish",
    keywords: ["robotics", "engineering", "hard surface", "study"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Articulation as visible geometry",
        body: "Servo housings, three-segment fingers, tendon cables — articulation named as parts reads as mechanical truth, which is what an engineering study wants. The same hand prompted as 'robotic hand with posable fingers' reads as a toy. In hard-surface prompts, parts beat adjectives.",
      },
      {
        title: "Where simulation honestly starts",
        body: "The reference's version of this route is an interactive simulation. This studio generates, previews, and exports; there is no physics, no motor control, and no wiring diagram. The mechanical-engineering use case page draws the same boundary — block-out and study here, kinematics in your own stack after a GLB or FBX export.",
      },
      {
        title: "Graphite finish is a drawing decision",
        body: "'Matte graphite' makes the render read like a technical illustration rather than a product shot — it suppresses specular noise so the segmentation geometry photographs cleanly. For study prompts, matte finishes are the default; gloss belongs to product prompts.",
      },
    ],
    related: [
      { label: "Mechanical engineering use case", href: "/use-cases/mechanical-engineering" },
      { label: "Industrial style page", href: "/styles/industrial" },
      { label: "Hero robot prompt (written)", href: "/3d-prompts/detailed-robot-through-blender-automation-2094909825561805003" },
    ],
  },
  {
    slug: "interactive-dual-ring-energy-core-2096551010089263181",
    title: "Dual-Ring Energy Core",
    description:
      "A written prompt page: a game pickup prop — nested rotating rings around a glowing core — with notes on emissive reads and honest glow.",
    blurb:
      "The energy-core pickup: nested rings, one emissive read, and the honest note that the rotation is your engine's job, not the generator's.",
    prompt:
      "a floating energy-core artifact, two counter-rotating segmented rings around a glowing sphere core, brushed dark metal ring segments, cyan emissive core",
    keywords: ["game pickup", "emissive", "artifact", "prop"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "One emissive read per prop",
        body: "The cyan core is the only glowing thing in the prompt; the rings are deliberately dark metal. Emissive contrast works like color accents — one glow carries the prop, two glows halve it. The texture stage places the emissive mask; the PBR temperature slider decides how hot it reads in the preview.",
      },
      {
        title: "Counter-rotation is an instruction to your engine",
        body: "'Counter-rotating' describes intent, and the generated mesh is static — the rings arrive as separate-enough geometry that your engine can parent and spin them after an FBX or GLB import. This prompt page says that plainly: motion is a runtime job, and the export is where the handoff happens.",
      },
      {
        title: "Pickups survive cheap passes",
        body: "Game pickups are silhouette-plus-glow subjects: they land at Low effort (about 9 seconds) because their reads are large. Escalate to Medium only if the ring segmentation matters for the spin illusion — the free preview exists to answer exactly that question before the confirm.",
      },
    ],
    related: [
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Soda-bottle starship prompt (written)", href: "/3d-prompts/soda-bottle-starship-kitchen-launch" },
      { label: "Generate game assets (article)", href: "/blog/generate-3d-game-assets" },
    ],
  },
  {
    slug: "ancient-temple-above-a-glowing-canyon-2095012880383099339",
    title: "Temple Above a Glowing Canyon",
    description:
      "A written prompt page: a vertical environment prompt — temple, cliff, and one light source — with notes on environment scale cues and the WorldGen boundary.",
    blurb:
      "An environment prompt taught as a stack: one monument, one landform, one light — and a note on when to graduate to WorldGen instead.",
    prompt:
      "an ancient cliff-top temple above a glowing canyon, weathered stone terraces descending the cliff face, lantern-lit arches, warm light rising from the canyon floor",
    keywords: ["environment", "temple", "canyon", "atmosphere"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Environments stack, objects list",
        body: "This prompt stacks three layers vertically — temple, terraces, canyon glow — instead of listing contents. Stacking gives the planner a composition to lay out; listing gives it a shopping bag. The single most reliable environment-prompt move is converting every 'and' into a spatial relation.",
      },
      {
        title: "The light source is the subject",
        body: "'Warm light rising from the canyon floor' names where the light comes from, and that decision shapes the terraces, the arches, and the mood more than any masonry clause. Environments with an unnamed light source render as gray kits; environments with one stated source render as places.",
      },
      {
        title: "The WorldGen boundary, again, on purpose",
        body: "This generation is one composed diorama-scale mesh — a backdrop, not a walkable world. When you need to move through the canyon, that is WorldGen mode with its creation pills (Build Myself, Generate Objects), and it is a different task with its own preview. One intent per generation is the rule this whole file keeps repeating.",
      },
    ],
    related: [
      { label: "WorldGen feature", href: "/features/worldgen" },
      { label: "Jungle guardian prompt (written)", href: "/3d-prompts/jungle-temple-and-giant-vanara-guardian-2095729606066348290" },
      { label: "Gothic style page", href: "/styles/gothic" },
    ],
  },
  {
    slug: "floating-japanese-pagoda-city-2094886088963690607",
    title: "Floating Pagoda City",
    description:
      "A written prompt page: a vertical city prompt about rhythm and repetition — tiered roofs, stacked islands — with notes on architectural rhythm.",
    blurb:
      "A floating city built from rhythm rather than inventory: tiered pagoda roofs, stacked rock islands, and one ribbon of water tying the stack together.",
    prompt:
      "a floating city of tiered Japanese pagodas stacked on separate rock islands, red lacquered bridges connecting the tiers, a thin waterfall falling off the lowest island",
    keywords: ["floating city", "pagoda", "rhythm", "fantasy"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Repetition is the cheap grandeur",
        body: "'Tiered pagodas stacked on separate rock islands' asks for rhythm — the same architectural unit repeated at descending scales. Repeated units are how environment prompts get scale and grandeur without listing buildings; the planner composes the rhythm, you supply the unit.",
      },
      {
        title: "The waterfall is the gravity clause",
        body: "A floating city needs one thing falling to sell the floating. 'A thin waterfall falling off the lowest island' anchors the whole stack against gravity — the same single-narrative-clause trick as the mid-move shogi piece, doing structural work in an environment prompt.",
      },
      {
        title: "Bridges are the connective read",
        body: "Red bridges between tiers do two jobs: they connect the composition so the islands read as one city, and their saturated red is the accent color against wood-and-rock neutrals. Environment prompts want exactly one connective accent; more and the city reads as confetti.",
      },
    ],
    related: [
      { label: "Voxel island prompt (written)", href: "/3d-prompts/floating-voxel-island-2094899802588713418" },
      { label: "Fantasy style page", href: "/styles/fantasy" },
      { label: "Isometric style page", href: "/styles/isometric" },
    ],
  },
  {
    slug: "floating-voxel-island-2094899802588713418",
    title: "Floating Voxel Island",
    description:
      "A written prompt page: the voxel-island staple as a lesson in palette discipline — one green band, one earth band, one accent — for the voxel style.",
    blurb:
      "The voxel island, taught as palette discipline: grass band, earth band, one crystal accent — plus how the voxel style page sharpens the look.",
    prompt:
      "a floating voxel island, grass top layer over a tapering dirt-and-stone base, roots hanging beneath, a single glowing crystal embedded in the side, blocky stepped edges",
    keywords: ["voxel", "floating island", "palette", "stylized"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Three bands, one accent",
        body: "Grass, dirt-and-stone, crystal: the palette is three bands plus one glow, and that restraint is why voxel islands read instantly. Voxel art lives and dies on palette discipline — at this block size, every extra color is noise. The voxel style page carries the fuller recipe for prompting this look.",
      },
      {
        title: "Stepped edges are the style clause",
        body: "'Blocky stepped edges' is what makes the island voxel rather than merely low-poly — the steps are the style. Style clauses like this one are worth more than any detail clause; they change every surface at once.",
      },
      {
        title: "The hanging roots sell the float",
        body: "Roots beneath a floating island are the gravity clause — the thing falling (or hanging, here) that makes the float believable. Pair it with the crystal glow as the single accent and the island is complete: band, band, accent, gravity, style. Five clauses, one icon.",
      },
    ],
    related: [
      { label: "Voxel style page", href: "/styles/voxel" },
      { label: "Living island prompt (written)", href: "/3d-prompts/aerie-a-living-voxel-island-2095493630421340200" },
      { label: "Low-poly style page", href: "/styles/low-poly" },
    ],
  },
  {
    slug: "aerie-a-living-voxel-island-2095493630421340200",
    title: "A Living Voxel Island",
    description:
      "A written prompt page: the difference between a voxel island and a living one — habitat clauses, wind clauses, and population restraint.",
    blurb:
      "What separates a living island from a floating block: one habitat clause, one wind clause, and exactly two residents — population discipline in prompts.",
    prompt:
      "a living voxel island habitat, wind-bent voxel trees clustered on the windward side, a small pond with stepping stones, two grazing animals, birds circling above",
    keywords: ["voxel", "habitat", "living world", "ecology"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Habitat clauses make it living",
        body: "Wind-bent trees on the windward side, a pond with stepping stones: habitat clauses are ecology named as geometry. They imply weather, water, and time — the three ingredients that turn a sculpture into a world — without asking for any of them abstractly.",
      },
      {
        title: "Two residents is the population ceiling",
        body: "Two grazing animals, birds circling: a populated scene wants exactly one ground read and one sky read. More creatures and the planner starts trading habitat geometry for bodies — the island stops being a habitat and becomes a crowd.",
      },
      {
        title: "The living world wants WorldGen",
        body: "A habitat this described is a diorama today and a walkable world tomorrow — and tomorrow is the WorldGen mode, whose creation pills decide how much of the scene it assembles for you. The boundary this file keeps naming is the honest one: diorama scale here, world scale there.",
      },
    ],
    related: [
      { label: "Voxel island prompt (written)", href: "/3d-prompts/floating-voxel-island-2094899802588713418" },
      { label: "WorldGen feature", href: "/features/worldgen" },
      { label: "Organic style page", href: "/styles/organic" },
    ],
  },
];
