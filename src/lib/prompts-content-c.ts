/**
 * Written prompt articles, part 3 — remaining environments, then nature,
 * culture & dioramas (t69). Same contract as parts 1 and 2: original
 * prompts that run in this clone's studio, craft notes anchored to code
 * that runs here, and no reproduction of the reference's community
 * content.
 */

import type { PromptArticleDef } from "./prompts-types";

export const PROMPT_ARTICLES_C: PromptArticleDef[] = [
  {
    slug: "bubble-bay",
    title: "Bubble Bay",
    description:
      "A written prompt page: a coastal village prompt about soft palettes and shelter — curved forms, one harbor read, and a calm-water clause.",
    blurb:
      "A coastal village taught as a palette decision: curved timber houses, one sheltering harbor arm, and the calm-water clause that sets the whole mood.",
    prompt:
      "a small coastal village on a sheltered bay, rounded timber houses with sail-cloth canopies, a curved stone harbor arm, calm turquoise water, morning haze",
    keywords: ["coastal", "village", "palette", "calm"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Calm water is a geometry instruction",
        body: "'Calm turquoise water' tells the planner to model a flat reflective plane instead of surf — which quietly reshapes the whole bay: no breakers, no foam, no exposed rocks. Water clauses are among the highest-leverage words in environment prompts; name the water's state, not just its color.",
      },
      {
        title: "The harbor arm is the shelter read",
        body: "A curved harbor arm does compositional work — it embraces the village, closes the bay, and gives the eye a path in. Coastal prompts without a sheltering form render as houses accidentally near water; with one, they render as a village that chose its site.",
      },
      {
        title: "Soft palettes want soft light",
        body: "Morning haze plus turquoise is a low-contrast palette on purpose: it flatters rounded forms and hides texture-stage repetition across the houses. Save the hard light for hard geometry — the pairing of light verb to form verb is the last habit this file teaches.",
      },
    ],
    related: [
      { label: "Hand-painted style page", href: "/styles/hand-painted" },
      { label: "Watermill village prompt (written)", href: "/3d-prompts/mechanically-accurate-water-mill-village-2095123063352561815" },
      { label: "Anime street prompt (written)", href: "/3d-prompts/explorable-anime-style-japanese-street-2080834581247435102" },
    ],
  },
  {
    slug: "explorable-anime-style-japanese-street-2080834581247435102",
    title: "Anime Street at Dusk",
    description:
      "A written prompt page: the anime-street staple — signage density, dusk light, wet asphalt — with notes on the anime style page and honest explorability.",
    blurb:
      "The anime street taught honestly: vertical signage, dusk glow, wet asphalt — a backdrop you compose here and walk through only in your own engine.",
    prompt:
      "a narrow Japanese shopping street at dusk, layered vertical signboards with warm lit characters, awnings over closed shopfronts, wet asphalt reflecting the signage, power lines overhead",
    keywords: ["anime", "street", "dusk", "signage"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Vertical signage is the style engine",
        body: "Anime streets read through stacked vertical signs — they fill the frame above eye level, which is exactly where the style lives. 'Layered vertical signboards' buys the look more cheaply than any color clause; the anime style page has the fuller recipe for this whole aesthetic.",
      },
      {
        title: "Wet asphalt doubles your lighting",
        body: "Wet ground reflects the signage, which means every sign you place lights the street twice — the cheapest richness an evening scene can buy. Dusk plus wet asphalt plus warm signs is the complete three-word lighting plan; add nothing else.",
      },
      {
        title: "Explorable, honestly",
        body: "The route name promises a street you can explore; this generation is the street as a composed backdrop mesh. Walking it — camera, collision, ambient sound — happens in your engine after a GLB export, and the WorldGen mode is the step between when you want the scene assembled as a space rather than a view.",
      },
    ],
    related: [
      { label: "Anime style page", href: "/styles/anime" },
      { label: "Station concourse prompt (written)", href: "/3d-prompts/railway-station-concourse-2096226711222546461" },
      { label: "WorldGen feature", href: "/features/worldgen" },
    ],
  },
  {
    slug: "railway-station-concourse-2096226711222546461",
    title: "Station Concourse",
    description:
      "A written prompt page: an interior-environment prompt — vaulted roof, one point of motion, hard light — with notes on interior scale cues.",
    blurb:
      "An interior taught with exterior tools: vaulted glass roof, departures board as the light source, one moving train — and the scale cue that makes it grand.",
    prompt:
      "a grand railway station concourse, vaulted glass-and-iron roof, rows of kiosks along one wall, a departures board glowing above the platforms, one train waiting with doors open",
    keywords: ["interior", "station", "architecture", "scale"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Interiors need a roof clause",
        body: "'Vaulted glass-and-iron roof' is the prompt's ceiling — literally. Interior prompts without a roof clause render as building facades lying down; naming the roof turns the composition vertical and gives the light a direction to enter from.",
      },
      {
        title: "The departures board is the light source",
        body: "A glowing board above the platforms is this interior's named light — the same one-source rule as the canyon temple's rising glow. Interiors with an unnamed light render as gray boxes; one stated source (a board, a skylight, a window band) and every surface gets a story.",
      },
      {
        title: "One point of motion, always",
        body: "'One train waiting with doors open' is the narrative clause — the station is mid-departure. Environment prompts at their best hold exactly one implied next moment; this one holds it with a door.",
      },
    ],
    related: [
      { label: "Modern style page", href: "/styles/modern" },
      { label: "Isometric style page", href: "/styles/isometric" },
      { label: "Anime street prompt (written)", href: "/3d-prompts/explorable-anime-style-japanese-street-2080834581247435102" },
    ],
  },
  {
    slug: "mechanically-accurate-water-mill-village-2095123063352561815",
    title: "Watermill Village",
    description:
      "A written prompt page: a working-mechanism prompt — mill race, wheel, weir — with honest notes on where mechanical accuracy actually lives.",
    blurb:
      "A village built around a mechanism: mill race feeding an undershot wheel, weir upstream, launder feeding the trough — and the honest note that the gears stay still.",
    prompt:
      "a riverside village built around a working watermill, mill race channeling water to an undershot wooden wheel, stone weir upstream, launder carrying water to a stone trough, thatched mill house",
    keywords: ["watermill", "village", "mechanism", "rural"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Mechanism as composition",
        body: "The mill race, weir, and launder are the prompt's plumbing — they give the village a reason to be where it is and the eye a path to follow. A mechanism named as a water path composes itself; the same mill named as 'a watermill building' renders as a prop with a wheel glued on.",
      },
      {
        title: "Accuracy is in the water vocabulary",
        body: "'Undershot' is a real mill-engineering word and it does real compositional work — undershot wheels sit in the race, so the water level, wheel size, and race height all lock together. One correct technical term from the domain beats three adjectives about wood and stone.",
      },
      {
        title: "The wheel does not turn",
        body: "Mechanically accurate describes the geometry, not the motion: this pipeline generates a static mesh and exports it. The wheel spinning, the race flowing, the sound of the weir — all of that is your engine's runtime work after export, and this note says so in exactly the words the reference's version would not.",
      },
    ],
    related: [
      { label: "Robotic hand study (written)", href: "/3d-prompts/interactive-3d-robotic-hand-simulation-2081475055536820506" },
      { label: "Medieval style page", href: "/styles/medieval" },
      { label: "Bubble bay prompt (written)", href: "/3d-prompts/bubble-bay" },
    ],
  },
  {
    slug: "dense-procedural-forest-in-three-js-2096263046918197609",
    title: "Dense Forest Study",
    description:
      "A written prompt page: a forest prompt about layering and light — canopy, understory, one shaft — with notes on procedural honesty and tree variety.",
    blurb:
      "A forest taught as layers and one light shaft: canopy blocking, understory competing, a single sunbeam reaching the floor — plus the honest note on 'procedural'.",
    prompt:
      "a dense temperate forest study, layered canopy with mixed broadleaf and conifer, fern understory, one visible shaft of sunlight reaching a mossy clearing, fallen log",
    keywords: ["forest", "ecology", "light shaft", "layers"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Layer, then pierce",
        body: "Canopy, understory, clearing: the forest is named as three vertical layers, and the light shaft is what pierces them. The shaft is both the light source and the composition's spine — every good forest render has exactly one; forests with diffuse light render as green fog.",
      },
      {
        title: "Mixed species is the variety clause",
        body: "'Mixed broadleaf and conifer' beats naming tree species: it asks for silhouette variety — leaf shapes, trunk heights, branching habits — without a shopping list. The texture stage differentiates the mix; your prompt just has to license it.",
      },
      {
        title: "Procedural, honestly",
        body: "The route name promises a procedurally generated forest; this studio's forest is generated once, by the planner, as a composed mesh — no runtime seeding, no growth rules, no infinite walk. Scattering trees procedurally at runtime is your engine's job after export; the WorldGen mode is the nearest thing this pipeline offers to scene assembly.",
      },
    ],
    related: [
      { label: "Organic style page", href: "/styles/organic" },
      { label: "Cherry tree prompt (written)", href: "/3d-prompts/3d-cherry-blossom-tree-2080178541979664741" },
      { label: "WorldGen feature", href: "/features/worldgen" },
    ],
  },
  {
    slug: "futuristic-private-island-mansion-2094879208304685524",
    title: "Private Island Mansion",
    description:
      "A written prompt page: an architecture prompt about horizontals and glass — cantilevers, one infinity edge — with notes on luxury-palette restraint.",
    blurb:
      "Luxury architecture taught as restraint: long horizontal slabs, glass walls reflecting dusk, one infinity pool edge — and nothing else on the island.",
    prompt:
      "a futuristic private island mansion, stacked horizontal glass slabs cantilevered over the water, infinity pool merging with the sea horizon, palm landscaping, dusk sky",
    keywords: ["architecture", "mansion", "luxury", "horizontals"],
    mode: "text",
    group: "environments",
    notes: [
      {
        title: "Horizontals are the luxury grammar",
        body: "'Stacked horizontal glass slabs' is the whole architectural idea — long lines read as expense because they are structurally confident. Luxury architecture prompts want one strong horizontal gesture and vertical silence; add towers and the mansion becomes a hotel.",
      },
      {
        title: "The pool merge is the narrative clause",
        body: "'Infinity pool merging with the sea horizon' is the one moment that sells the design — water meeting water. It is also a light device: the pool doubles the dusk sky. One structural read plus one reflected read is the complete inventory of this scene.",
      },
      {
        title: "Dusk is the honest showroom hour",
        body: "Glass architecture photographs at dusk — interior warm, exterior blue — and the poster render agrees. This is one of the few subjects where the studio's single-camera, single-light preview is a genuine advantage rather than a limit: the hour this prompt names is the hour the render wants.",
      },
    ],
    related: [
      { label: "Modern style page", href: "/styles/modern" },
      { label: "Minimalist style page", href: "/styles/minimalist" },
      { label: "Bubble bay prompt (written)", href: "/3d-prompts/bubble-bay" },
    ],
  },
  {
    slug: "3d-cherry-blossom-tree-2080178541979664741",
    title: "Cherry Blossom Tree",
    description:
      "A written prompt page: a single-tree prompt about canopy shape and petal season — plus the seasonal window that makes the subject read.",
    blurb:
      "A single tree taught as a season and a silhouette: peak-bloom canopy, dark wet bark, one petal drift — the smallest complete environment prompt in this set.",
    prompt:
      "a mature cherry blossom tree at peak bloom, broad layered canopy of dense pink clusters, dark glossy bark with visible graft scar, a drift of fallen petals at the base",
    keywords: ["tree", "cherry blossom", "season", "silhouette"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "The season is the subject",
        body: "'Peak bloom' is a two-word decision that changes every surface: full pink canopy, petals on the ground, no leaves. Trees are seasonal machines; naming the week of the year is the highest-leverage clause a single-tree prompt can carry.",
      },
      {
        title: "The graft scar is the age clause",
        body: "Cherry trees in cultivation carry a graft line, and 'visible graft scar' is how a prompt asks for a tree that reads as real and maintained rather than sapling-perfect. One imperfection clause — a scar, a hollow, a lost limb — ages any organic subject honestly.",
      },
      {
        title: "Petals at the base close the loop",
        body: "The fallen-petal drift is this prompt's gravity clause and its narrative one: the bloom is already ending. Single-object prompts become small dioramas the moment the floor participates; this is the same rule as the shogi mid-move piece at tree scale.",
      },
    ],
    related: [
      { label: "Mango tree prompt (written)", href: "/3d-prompts/indian-mango-tree-in-speedtree-2096572429066006845" },
      { label: "Organic style page", href: "/styles/organic" },
      { label: "Forest study prompt (written)", href: "/3d-prompts/dense-procedural-forest-in-three-js-2096263046918197609" },
    ],
  },
  {
    slug: "indian-mango-tree-in-speedtree-2096572429066006845",
    title: "Mango Tree Study",
    description:
      "A written prompt page: a botany-honest tree prompt — fruit load, crown shape, monsoon light — with the honest note on 'SpeedTree' and external tools.",
    blurb:
      "A botany lesson as a prompt: mango crown shape, fruit load bending the limbs, monsoon-washed light — and the honest place of external tree tools in this workflow.",
    prompt:
      "a mature mango tree study, wide dome-shaped crown, heavy fruit load bending the outer limbs, glossy deep-green leaves, dappled light after monsoon rain",
    keywords: ["tree", "mango", "botany", "fruit"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "Fruit load is a geometry instruction",
        body: "'Bending the outer limbs' asks the planner to droop the branch tips under the fruit's weight — a growth fact that doubles as a silhouette decision. Botanical truth is the cheapest realism a tree prompt can buy: crown shape, fruit placement, and leaf gloss are all real, checkable facts.",
      },
      {
        title: "Dome crowns read from every angle",
        body: "Mango crowns are wide domes, and that shape is why this subject works as a single generation: a dome silhouette has no bad angle. Trees with strong leader trunks and one-sided crowns (like leaning riverside trees) need a stated camera to not look broken.",
      },
      {
        title: "The SpeedTree note",
        body: "The route name references an external tree-modeling tool. This studio generates the tree as a composed mesh with texture-stage foliage; per-leaf wind animation, LOD tuning, and seasonal variation are external-tool jobs after export. The honest workflow: generate here, take GLB or FBX into your tool of choice, rig the wind there.",
      },
    ],
    related: [
      { label: "Cherry tree prompt (written)", href: "/3d-prompts/3d-cherry-blossom-tree-2080178541979664741" },
      { label: "Organic style page", href: "/styles/organic" },
      { label: "What is GLB", href: "/blog/what-is-glb" },
    ],
  },
  {
    slug: "interactive-miniature-of-seoul-2096557555086725159",
    title: "Seoul Miniature",
    description:
      "A written prompt page: a city-in-miniature prompt about landmark anchoring and density banding — plus honest notes on 'interactive'.",
    blurb:
      "A city taught as a miniature: one anchor landmark, dense mid-rise banding, river stitching the halves — and the honest word about interactivity.",
    prompt:
      "a miniature city model of Seoul, one dominant communications tower landmark, dense mid-rise apartment blocks stepping up the hillsides, river cutting through the center with bridges, tiny cars on the arterial roads",
    keywords: ["miniature", "city", "landmark", "density"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "One anchor, then density",
        body: "The tower is the anchor read; everything else is banding — apartment blocks stepping up the hills. City prompts fail by naming ten landmarks (a tourist map) or none (a texture); one anchor plus one density rule is the miniature grammar. The river then stitches the halves together, which is what rivers actually do to cities.",
      },
      {
        title: "Miniature scale hides repetition",
        body: "'Tiny cars' and miniature scale together license the texture stage to repeat building facades — at model-railway scale, repetition reads as richness instead of laziness. This is the same protection the hide-and-seek diorama claimed; miniature is the most forgiving scale this file teaches.",
      },
      {
        title: "Interactive, honestly",
        body: "The route name promises an interactive miniature; the deliverable here is a static, high-density mesh you inspect in the live viewer — real drag, real zoom, one render. Pan-and-click interaction, districts filtering, day-night toggles: all runtime features you build after a GLB export, none of which this page pretends to ship.",
      },
    ],
    related: [
      { label: "Isometric style page", href: "/styles/isometric" },
      { label: "Pagoda city prompt (written)", href: "/3d-prompts/floating-japanese-pagoda-city-2094886088963690607" },
      { label: "Station concourse prompt (written)", href: "/3d-prompts/railway-station-concourse-2096226711222546461" },
    ],
  },
  {
    slug: "animated-onboarding-diorama-2096222790894661841",
    title: "Product Onboarding Diorama",
    description:
      "A written prompt page: a marketing diorama prompt — the product on a stage, one gesture toward use — with notes on presentation scale.",
    blurb:
      "A marketing diorama taught as staging: the product on a floating plinth, one user-object gesture, brand-neutral palette — the smallest product-story prompt.",
    prompt:
      "a product onboarding diorama, the device floating above a round plinth, three small orbiting icons around it, soft studio gradient background, neutral gray palette with one brand-color accent",
    keywords: ["diorama", "marketing", "product", "staging"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "The plinth is the story",
        body: "A floating plinth says this is the thing being presented — staging carries meaning the way habitat clauses did for the living island. Marketing prompts want exactly three reads: the product, the stage, the orbit. The orbiting icons gesture toward use without modeling a user.",
      },
      {
        title: "Neutral ground, one accent",
        body: "'Neutral gray palette with one brand-color accent' is the same accent discipline as the drone's sensor ring — at presentation scale it is even stricter. The accent should land on exactly one orbiting icon; two accents and the diorama stops reading as marketing and starts reading as confetti.",
      },
      {
        title: "Animation is downstream, as always",
        body: "The route name says animated; the studio's honest offer is the composed diorama and a live-viewer inspection. The orbit, the float bob, the icon pulses — runtime motion in your web page after a GLB export. This file's most-repeated sentence earns its repetition: generation is geometry and texture; motion belongs to the runtime.",
      },
    ],
    related: [
      { label: "E-commerce use case", href: "/use-cases/e-commerce" },
      { label: "Keyboard product prompt (written)", href: "/3d-prompts/editable-3d-keyboard-animation-2095111032171876470" },
      { label: "Minimalist style page", href: "/styles/minimalist" },
    ],
  },
  {
    slug: "living-voxel-ship-in-a-bottle-2095699049722581065",
    title: "Voxel Ship in a Bottle",
    description:
      "A written prompt page: the ship-in-a-bottle as a containment study — hull, sea disc, cork — with notes on glass prompts and display geometry.",
    blurb:
      "A containment study: voxel tall ship on a clay sea disc, corked glass bottle around it — the prompt-shape lesson is what you exclude from the bottle.",
    prompt:
      "a voxel tall ship sailing on a small clay sea disc, enclosed in a corked glass bottle, tiny iceberg on the horizon of the disc, wooden display stand beneath the bottle",
    keywords: ["voxel", "ship in a bottle", "containment", "display"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "The bottle is a framing device",
        body: "Everything inside the glass is the subject; everything outside (the stand) is presentation. Containment prompts — bottles, snow globes, terrariums — teach the cleanest division between content and chrome in this whole file, and the planner honors it: the bottle renders thin, the ship renders dense.",
      },
      {
        title: "The horizon iceberg is the size cue",
        body: "A tiny iceberg at the disc's edge is a scale object — it makes the sea read as an ocean in miniature rather than a puddle. Scale cues inside contained worlds need to be visible but small; one is enough, and this prompt spends its one on ice.",
      },
      {
        title: "Glass asks for a light hour",
        body: "The corked bottle's glass renders best against a dim surround — the studio's dusk-and-poster instincts apply. In the viewer, drop the PBR temperature a notch so the glass reads as material rather than as a lens flare; the export carries the albedo either way, in all six formats.",
      },
    ],
    related: [
      { label: "Voxel style page", href: "/styles/voxel" },
      { label: "Ocean liner prompt (written)", href: "/3d-prompts/titanic-the-last-light" },
      { label: "Voxel island prompt (written)", href: "/3d-prompts/floating-voxel-island-2094899802588713418" },
    ],
  },
  {
    slug: "campfire-scene-model-comparison",
    title: "Campfire Scene",
    description:
      "A written prompt page: the campfire as the smallest complete scene — fire, ring, one seated figure — with notes on comparing two generation styles honestly.",
    blurb:
      "The smallest complete scene in this set — fire, stone ring, one seated figure — and the honest way to compare two styles of the same campfire.",
    prompt:
      "a night campfire scene, low stone fire ring with active flames, one seated figure wrapped in a blanket facing the fire, log seat, pine litter on the ground, deep blue night behind",
    keywords: ["campfire", "night", "scene", "comparison"],
    mode: "text",
    group: "dioramas",
    notes: [
      {
        title: "Two light sources, one scene",
        body: "Firelight in front, deep blue night behind: this is the one exception to the one-source rule, because the contrast IS the subject. Paired light (warm near, cool far) is the classic two-source exception every lighting lesson eventually grants — and the poster render holds it well at night.",
      },
      {
        title: "The comparison workflow, honestly",
        body: "The route name promises a model comparison; the honest version is two generations of the same prompt with one clause changed — 'voxel campfire' against 'low-poly campfire', or Medium effort against High. Both previews are free; you confirm only the winner for its single credit. That is the whole comparison engine this studio ships, and it is enough.",
      },
      {
        title: "The seated figure closes the scene",
        body: "One wrapped figure facing the fire is the narrative clause — someone is being warmed. Scenes with fire and no one nearby render as hazards; the figure converts the fire from event to story. The blanket also hides anatomy, which is the cheapest way to put a figure in a scene at diorama scale.",
      },
    ],
    related: [
      { label: "Hide-and-seek diorama (written)", href: "/3d-prompts/chameleon-and-robot-hide-and-seek-game-2080392777515311115" },
      { label: "Low-poly style page", href: "/styles/low-poly" },
      { label: "Voxel style page", href: "/styles/voxel" },
    ],
  },
];
