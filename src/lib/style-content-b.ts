/**
 * Style content B — the reference sitemap's middle 7 style pages
 * (hand-painted, industrial, isometric, low-poly, medieval, minimalist,
 * modern), honestly rewritten for this clone.
 *
 * Facts every claim is tethered to (src/lib):
 *  - Materials are per-part MeshStandardMaterial parameters
 *    (mesh-builder.ts buildMaterial) — color / metalness / roughness.
 *    NOT baked texture maps; no page may claim painted textures.
 *  - Segment counts on sphere/cylinder/cone/torus/lathe respond to
 *    prompt steering — but there is NO polycount slider, NO LODs,
 *    NO decimation step.
 *  - Exports are real: GLB, GLTF, OBJ, STL, USDZ, ASCII FBX.
 */
import type { StylePageDef } from "./style-types";

export const STYLE_PAGES_B: StylePageDef[] = [
  {
    slug: "hand-painted",
    name: "Hand-Painted",
    title: "AI Hand-Painted 3D Model Generator",
    description:
      "Generate hand-painting-ready 3D models from a prompt — clean meshes and blockout palettes here, with the painted texture pass honestly left to your DCC.",
    subline:
      "The brushwork that defines hand-painted style is texture art — this clone generates the mesh and palette blockout, and says where the painting starts.",
    status: "partial",
    statusChip: "LIMITED HERE",
    statusPanel: {
      summary:
        "Hand-painted is a texture-painting style, and this clone bakes no textures — the mesh and palette blockout are real, the paint is yours.",
      works: [
        "Clean closed meshes — the right canvas for painting — export for real as OBJ or FBX.",
        "Blockout palettes land as flat parameter colors, giving you a value-structure starting point.",
        "Proportions and silhouettes steer from the prompt — the shapes that hand-painted art needs to be readable.",
      ],
      limits: [
        "No texture painting, no baked maps — the brushwork itself happens in Blender, Substance, or 3D-Coat after export.",
        "No brush-style materials — what you see are flat parameter colors, a stand-in for values, not the final art.",
        "No painted shadow shapes or edge highlights — those signature strokes are your painting pass.",
      ],
    },
    stepsTitle: "Prompt to paintable mesh in three steps",
    steps: [
      {
        title: "Block out the subject",
        body: "Describe the prop with silhouette in mind — 'readable fantasy barrel with iron bands' steers shapes that survive painting.",
      },
      {
        title: "Generate the mesh and value blockout",
        body: "You get closed geometry with flat palette colors — an honest value structure to paint over.",
      },
      {
        title: "Export and paint",
        body: "Export OBJ or FBX, unwrap and paint in your tool of choice — that is where the style is made.",
      },
    ],
    signalsTitle: "What makes a model read as hand-painted",
    signals: [
      {
        title: "The paint IS the style",
        body: "Hand-painted reads through brush strokes, value ramps, and rim lights — all texture work downstream of the mesh you generate here.",
      },
      {
        title: "Readable silhouettes",
        body: "Painting forgives less than rendering — strong, simple outlines are what the blockout here is genuinely good at.",
      },
      {
        title: "Value structure first",
        body: "Hand-painted palettes are deliberate value stacks; the flat blockout colors give you that stack to refine.",
      },
      {
        title: "Low texture-frequency geometry",
        body: "Painted art prefers clean low-detail meshes — 'no surface detail' steering produces exactly the canvas painters want.",
      },
    ],
    recipesTitle: "Paintable prompt recipes",
    recipes: [
      {
        title: "Fantasy prop canvas",
        prompt:
          "fantasy potion bottle with cork, round bulb body and slender neck, deep green glass with warm wood cork, clean simple forms, no surface detail",
        note: "'No surface detail' keeps the mesh paintable — detail belongs in the strokes, not the geometry.",
      },
      {
        title: "Storybook cottage",
        prompt:
          "storybook cottage, boxy walls with chunky chimney and simple pitched roof, cream walls with warm timber accents, readable silhouette, minimal parts",
        note: "A clean blockout with a two-material palette is the classic hand-painted starting point.",
      },
      {
        title: "Weapon canvas",
        prompt:
          "adventurer axe, thick blade with simple wrapped handle, steel and leather two-tone blockout, strong readable outline, chunky proportions",
        note: "The value blockout (steel bright, leather dark) maps directly onto how painters light this prop.",
      },
      {
        title: "Environment chunk",
        prompt:
          "stone well with wooden roof frame, circular stone base in cool gray with warm wood posts, chunky readable forms, no fine detail",
        note: "Environment chunks paint fast when the mesh is this simple — one silhouette, two materials.",
      },
    ],
    faqTitle: "Hand-painted 3D generator FAQ",
    faq: [
      {
        q: "Does this clone paint textures?",
        a: "No — there is no texture baking of any kind. Materials are flat per-part parameters (color, metalness, roughness). The painted look is created in your painting tool after a real OBJ/FBX export.",
      },
      {
        q: "Then why use it for hand-painted work?",
        a: "Because painting needs a good mesh: clean closed forms, readable silhouettes, and a sensible value blockout. That is exactly what generates here — the canvas, honestly labeled.",
      },
      {
        q: "Do the colors help or mislead?",
        a: "They help as value structure — treat the flat palette as your underpainting values, then replace it entirely with your painted maps in your DCC.",
      },
      {
        q: "Which export should I pick for painting?",
        a: "OBJ or FBX into Blender, Substance Painter, or 3D-Coat. Both are byte-verified here and carry the mesh and palette.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Cel-Shaded", href: "/styles/cel-shaded" },
      { label: "Stylized", href: "/styles/stylized" },
      { label: "Fantasy", href: "/styles/fantasy" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Generate the canvas; paint the style",
    closingBody:
      "The mesh half of hand-painted work is real here — the brushwork is one honest export away in your painting tool.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Paintable Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "industrial",
    name: "Industrial",
    title: "AI Industrial 3D Model Generator",
    description:
      "Generate industrial 3D models from a prompt — hard-surface assemblies with real metalness parameters, pipes, crates, and machinery blockouts in six export formats.",
    subline:
      "Industrial is the hard-surface home game — boxes, cylinders, and pipes with genuine metalness and roughness parameters doing the sheen.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Industrial suits this clone unusually well: the vocabulary is hard-surface primitives and the materials have real metalness/roughness parameters.",
      works: [
        "Machinery blockouts — chassis, pipe runs, frames, and crates — assemble from placed primitives with real tolerances.",
        "Metal sheen is a genuine parameter: 'brushed steel', 'galvanized', 'matte powder-coat' steer real metalness and roughness values.",
        "Exports serve engineering-adjacent workflows: STL for fixture prints, OBJ/FBX for CAD-adjacent DCC work, GLB for web configurators.",
      ],
      limits: [
        "Concept-grade, not CAD — no parametric features, fillets, threads, or tolerances; for production parts use real CAD.",
        "No greebles, panel lines, or bolts — surface detail is a DCC texture or geometry pass after export.",
        "No moving assemblies — joints are visual placement, not kinematics.",
      ],
    },
    stepsTitle: "Prompt to industrial blockout in three steps",
    steps: [
      {
        title: "Specify the machine",
        body: "Function first: 'a conveyor module with rollers and a drive housing' — industrial prompts reward concrete mechanism language.",
      },
      {
        title: "Generation assembles the hardware",
        body: "Frames, cylinders, and housings place with real transforms; the palette steels and safety-colors itself per part.",
      },
      {
        title: "Export for the workflow",
        body: "STL for printed fixtures, OBJ/FBX into DCC tools, GLB for web configurators — all real bytes from the previewed mesh.",
      },
    ],
    signalsTitle: "What makes a model read as industrial",
    signals: [
      {
        title: "Function-first forms",
        body: "Industrial shapes declare their purpose — housings protect, rollers convey, frames carry. Mechanism language steers that honestly.",
      },
      {
        title: "Material truth",
        body: "The sheen difference between galvanized and powder-coat is real here — metalness and roughness are literal parameters on each part.",
      },
      {
        title: "Safety-color discipline",
        body: "Steel grays with one safety yellow or orange accent is the industrial palette signature — one parameter color does it.",
      },
      {
        title: "Rhythmic repetition",
        body: "Pipe runs, roller arrays, and vent slats repeat with spacing — repetition words place sibling primitives with matched transforms.",
      },
    ],
    recipesTitle: "Industrial prompt recipes that work",
    recipes: [
      {
        title: "Pipe run",
        prompt:
          "industrial pipe run, three parallel horizontal pipes with flange rings and valve blocks, brushed steel palette with one safety-orange valve, sturdy mounts",
        note: "Flanges are toruses on cylinders — the rhythm of repetition carries the read.",
      },
      {
        title: "Factory module",
        prompt:
          "factory conveyor module, low frame with five evenly spaced rollers, drive housing at one end, galvanized steel with matte black frame, functional proportions",
        note: "'Evenly spaced' is steering language the spec honors — sibling primitives at matched intervals.",
      },
      {
        title: "Robot arm blockout",
        prompt:
          "industrial robot arm blockout, heavy base, two arm segments with joint cylinders, simple gripper, safety yellow and matte black two-tone, honest proportions",
        note: "Joints are placed cylinders, not kinematics — a blockout for layout and concept review.",
      },
      {
        title: "Shipping crate",
        prompt:
          "industrial shipping crate, ribbed box with corner brackets and simple latch plate, weathered steel gray with one stenciled-look dark panel",
        note: "'Stenciled-look' is a flat darker part — real stenciling is texture work in your DCC.",
      },
    ],
    faqTitle: "Industrial 3D model generator FAQ",
    faq: [
      {
        q: "Is this suitable for engineering documentation?",
        a: "As concept blockouts, yes — for fit reviews by eye and layout planning. It is not CAD: no parametric features, threads, fillets, or tolerances. For production, model the real part in CAD (see the mechanical-engineering use case).",
      },
      {
        q: "Do the metals actually look metallic?",
        a: "Yes — metalness and roughness are real MeshStandardMaterial parameters, so brushed versus powder-coat reads honestly in the viewer and the exports.",
      },
      {
        q: "Can I get bolts, rivets, and panel lines?",
        a: "Not from the generator — those are surface detail. Export OBJ or FBX and add them in your DCC; the underlying forms are correct.",
      },
      {
        q: "Does it do assemblies with moving parts?",
        a: "No kinematics — parts are placed in a static arrangement. The blockout communicates the mechanism; motion is your tool's job.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Modern", href: "/styles/modern" },
      { label: "Minimalist", href: "/styles/minimalist" },
      { label: "Retro", href: "/styles/retro" },
      { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Your next machine blockout starts as one prompt",
    closingBody:
      "Specify the mechanism, generate the hardware, export the mesh — the industrial loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate an Industrial Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "isometric",
    name: "Isometric",
    title: "AI Isometric 3D Model Generator",
    description:
      "Generate isometric-ready 3D assets from a prompt — compact square footprints and chunky forms designed for iso cameras, exportable for games and web scenes.",
    subline:
      "Isometric is a camera discipline expressed in the asset — compact footprints, chunky forms, no wasted backside. That steering is real here.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Isometric-ready means footprint discipline and chunky readable forms — both are real prompt-steered geometry here.",
      works: [
        "Compact square footprints and chunky proportions steer directly — the asset-level half of isometric design.",
        "Diagonal-rotation presentation words place the object at a 45-degree read for previewing.",
        "GLB export drops these into web isometric scenes with flat parameter colors intact.",
      ],
      limits: [
        "The viewer is a perspective camera — true orthographic isometric projection is your engine or DCC view, not this preview.",
        "No tile-grid or snapping system — footprint discipline is steered by wording, not enforced by a grid.",
        "No auto-backside-culling design pass — prompt for readable-all-around or accept a designed front.",
      ],
    },
    stepsTitle: "Prompt to isometric asset in three steps",
    steps: [
      {
        title: "Design for the grid",
        body: "'Compact square footprint', 'one tile wide', 'chunky readable forms' — the footprint language that iso games need.",
      },
      {
        title: "Generate the asset",
        body: "The spec keeps proportions chunky and self-contained — exactly the discipline isometric scenes reward.",
      },
      {
        title: "Export into your scene",
        body: "GLB for web iso scenes, OBJ/FBX for engine work — then set your engine's camera to orthographic.",
      },
    ],
    signalsTitle: "What makes an asset read as isometric",
    signals: [
      {
        title: "Footprint discipline",
        body: "Iso assets live on tiles — compact square bases mean they sit in grids without colliding neighbors.",
      },
      {
        title: "Chunk at distance",
        body: "Isometric cameras shrink detail — oversized silhouettes and thick proportions keep assets readable at tile scale.",
      },
      {
        title: "All-around readability",
        body: "Four facings, one asset: symmetric or rotationally-clean designs avoid a 'wrong side' in rotated scenes.",
      },
      {
        title: "Flat-topped lighting logic",
        body: "Iso art lights from a fixed quarter — flat parameter colors hold up under engine lighting without baked shadows.",
      },
    ],
    recipesTitle: "Isometric prompt recipes that work",
    recipes: [
      {
        title: "Iso cottage",
        prompt:
          "isometric cottage, compact square footprint one tile wide, boxy walls with chunky pitched roof and chimney, two-color palette of cream walls and warm red roof, chunky door block",
        note: "'One tile wide' is the steering phrase that keeps the footprint honest for grid scenes.",
      },
      {
        title: "Iso shop stall",
        prompt:
          "isometric market stall, square base with striped awning suggested as alternating colored bands, chunky counter, crate props, bright two-tone palette",
        note: "Stripes are alternating part colors — honest, and they read perfectly at iso scale.",
      },
      {
        title: "Iso server rack",
        prompt:
          "isometric server rack, tall slim box one tile wide with front panel blocks and one glowing indicator cube, matte dark gray with mint accent",
        note: "The indicator is a flat bright color — real emission is engine lighting added after export.",
      },
      {
        title: "Iso garden plot",
        prompt:
          "isometric garden plot, square raised bed with soil layer and three chunky vegetable forms, terracotta frame with greens, compact footprint",
        note: "Chunky vegetables over detail — the iso camera forgives simplicity and punishes thin geometry.",
      },
    ],
    faqTitle: "Isometric 3D model generator FAQ",
    faq: [
      {
        q: "Does the preview use an isometric camera?",
        a: "No — the studio viewer is a perspective camera. The assets are isometric-ready (compact footprints, chunky forms); set your engine or DCC to orthographic for the true iso look.",
      },
      {
        q: "Can I snap assets to a grid?",
        a: "There is no grid system here — footprint discipline comes from prompt wording like 'one tile wide'. In your engine, snapping is trivial since the assets are compact.",
      },
      {
        q: "Are these good for mobile games?",
        a: "Yes — chunky low-detail geometry with flat colors is exactly what mobile iso scenes want, and GLB exports carry the palette in the mesh.",
      },
      {
        q: "Do the assets have backside detail?",
        a: "Unless you prompt for all-around readability, expect a designed front. Prompt 'readable from all sides' when the asset will rotate.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Voxel", href: "/styles/voxel" },
      { label: "Flat", href: "/styles/flat" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
    ],
    closingTitle: "Your next tile asset starts as one prompt",
    closingBody:
      "Mind the footprint, keep it chunky, export the mesh — the isometric loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate an Isometric Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "low-poly",
    name: "Low Poly",
    title: "AI Low Poly 3D Model Generator",
    description:
      "Generate low-poly-style 3D models from a prompt — chunky faceted forms, flat palettes, and real exports. No polycount slider here, and the page says so.",
    subline:
      "The low-poly read — chunky forms, flat colors, strong silhouettes — steers genuinely from a prompt. The polycount itself is what it is; this page is honest about that.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Low-poly reads through chunky geometry and flat palettes, both real here — but there is no polycount slider, no LODs, and no decimation step.",
      works: [
        "'Low poly' steering drops segment counts and simplifies assemblies — chunky faceted forms generate for real.",
        "Flat two-to-four-color palettes are the low-poly default and land as per-part parameter colors.",
        "Six real exports — GLB, GLTF, OBJ, STL, USDZ, FBX — carry these meshes anywhere.",
      ],
      limits: [
        "No polycount slider, no target polygon count, no LOD generation — the mesh arrives at the resolution the prompt steered, not a number you set.",
        "No decimation or remesh step — budget-matching beyond prompt steering is a DCC pass after export.",
        "Flat shading as a material toggle is not exposed — the faceted look comes from low-segment geometry, and true flat-shaded normals are your DCC's one-click.",
      ],
    },
    stepsTitle: "Prompt to low-poly model in three steps",
    steps: [
      {
        title: "Steer the geometry low",
        body: "'Low poly', 'chunky', 'few segments', 'simple forms' — wording that drops segment counts and keeps assemblies minimal.",
      },
      {
        title: "Generation builds the chunk",
        body: "Spheres arrive with fewer segments, silhouettes stay strong, and the flat palette assigns across parts deterministically.",
      },
      {
        title: "Export and budget in your DCC",
        body: "Export OBJ or FBX, then decimate or flat-shade to your exact budget — the generator gets you the style, your DCC sets the number.",
      },
    ],
    signalsTitle: "What makes a model read as low poly",
    signals: [
      {
        title: "Silhouette over surface",
        body: "Low poly spends its triangles on the outline — the fox's ears, the axe's notch. 'Strong silhouette' steering serves exactly that.",
      },
      {
        title: "Flat palette discipline",
        body: "Three or four flats, no gradients — the palette field delivers that natively as parameter colors.",
      },
      {
        title: "Chunky geometry",
        body: "Few-segment spheres and cylinders look faceted and intentional — 'chunky', 'blocky', 'simple' wording steers the segment counts down.",
      },
      {
        title: "Budget honesty",
        body: "The style is about triangle budgets, and budgets are numbers — the honest place to set an exact number is a decimation pass in your DCC after export.",
      },
    ],
    recipesTitle: "Low poly prompt recipes that work",
    recipes: [
      {
        title: "Low poly fox",
        prompt:
          "low poly fox, chunky faceted body with big triangular ears and thick tail, warm autumn palette of four flat colors, strong silhouette, simple forms",
        note: "'Four flat colors' is a real palette spec — the parts share the autumn palette deterministically.",
      },
      {
        title: "Desert archway",
        prompt:
          "low poly desert ruin archway, chunky sandstone blocks, flat three-tone sand palette, strong readable outline, modular kit piece feel",
        note: "Chunky-block wording keeps the assembly coarse — the faceted read comes from the geometry itself.",
      },
      {
        title: "Delivery drone",
        prompt:
          "low poly delivery drone, chunky central body with four simple arm pods, two-tone gray and orange palette, readable at distance, no small details",
        note: "'No small details' prevents greeble creep — the distance-readable look depends on it.",
      },
      {
        title: "Alpine cottage",
        prompt:
          "low poly alpine cottage, chunky walls with oversized pitched roof and snow cap block, compact footprint, three-color palette of cream brown and white",
        note: "Pairs naturally with the isometric page — the footprint wording travels across both styles.",
      },
    ],
    faqTitle: "Low poly 3D model generator FAQ",
    faq: [
      {
        q: "Can I set a target polygon count or generate LODs?",
        a: "No — this clone exposes no polycount slider and no LOD generation. The mesh arrives at the resolution your prompt steered. Export OBJ or FBX and decimate in your DCC to hit an exact budget; that is the honest workflow.",
      },
      {
        q: "Do the models come out flat-shaded?",
        a: "The faceted look comes from genuinely low-segment geometry. A hard flat-shaded normal pass is one click in your DCC after export — this generator does not expose it as a toggle.",
      },
      {
        q: "Why does low poly work so well here?",
        a: "Because the style's carriers — chunky geometry, flat palettes, strong silhouettes — are exactly the levers that exist: segment-count steering and flat parameter colors.",
      },
      {
        q: "What is the difference between low poly and voxel?",
        a: "Low poly means few triangles and faceted shading on continuous meshes; voxel builds from stacked cubes. This generator steers low poly through segment counts; see the voxel page for the honest cube-stacking story.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Voxel", href: "/styles/voxel" },
      { label: "Pixel Art", href: "/styles/pixel-art" },
      { label: "Isometric", href: "/styles/isometric" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Your next chunky model starts as one prompt",
    closingBody:
      "Steer it low, pick the flats, export the mesh — the low-poly style loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Low Poly Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "medieval",
    name: "Medieval",
    title: "AI Medieval 3D Model Generator",
    description:
      "Generate medieval 3D models from a prompt — keeps, taverns, siege gear, and arms from real primitives with honest blockout fidelity, in six export formats.",
    subline:
      "Medieval is stone, timber, and iron — cylinders, boxes, and cones at chunky scale, which is precisely this generator's vocabulary.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Medieval props and architecture are native here: keeps, towers, wagons, and arms are chunky primitive assemblies with honest blockout fidelity.",
      works: [
        "Castle architecture — keeps, towers, walls with crenellation blocks — generates from placed primitives.",
        "Siege gear and wagons — trebuchets, carts, ballista frames — as static blockouts with real proportions.",
        "STL export serves the tabletop side: printed towers and terrain from the same previewed geometry.",
      ],
      limits: [
        "Crenellations and timber framing come out as simple repeated blocks — fine ornament is a DCC pass.",
        "No working mechanisms — the trebuchet arm is placed geometry, not a hinge with physics.",
        "No carved stone or wood-grain textures — the palette carries the material read (stone gray, timber brown) as flat colors.",
      ],
    },
    stepsTitle: "Prompt to medieval piece in three steps",
    steps: [
      {
        title: "Describe the structure",
        body: "Keep, gatehouse, trebuchet, round shield — plus materials: 'weathered stone with timber accents' sets the palette.",
      },
      {
        title: "Generation builds it",
        body: "Towers stack cylinders, roofs cap as cones, crenellations repeat small blocks — real placed geometry throughout.",
      },
      {
        title: "Export for your purpose",
        body: "STL for printed terrain, GLB for web scenes, OBJ/FBX for DCC finishing — all byte-verified.",
      },
    ],
    signalsTitle: "What makes a model read as medieval",
    signals: [
      {
        title: "Stone, timber, iron",
        body: "The three-material palette is the medieval signature — three flat parameter colors doing the entire period read.",
      },
      {
        title: "Vertical defense",
        body: "Towers, keeps, and gatehouses reach up with thick bases — stacked verticals are the vocabulary's strength.",
      },
      {
        title: "Chunky utilitarian forms",
        body: "Medieval objects are heavy and functional — 'sturdy', 'thick', 'weathered' steering produces that honestly.",
      },
      {
        title: "Repetition as ornament",
        body: "Crenellations, arrow slits, and timber braces are repeated simple forms — repetition words place them rhythmically.",
      },
    ],
    recipesTitle: "Medieval prompt recipes that work",
    recipes: [
      {
        title: "Stone keep",
        prompt:
          "medieval stone keep, tall square tower with corner turrets and simple crenellation blocks, weathered gray stone with timber door housing, massive base",
        note: "Crenellations are repeated small boxes along the top rim — rhythm stands in for ornament.",
      },
      {
        title: "Trebuchet blockout",
        prompt:
          "medieval trebuchet blockout, sturdy timber frame with long throwing arm and counterweight box, leather-brown and iron-gray palette, honest static pose",
        note: "'Static pose' is honest — the arm is placed, not hinged; motion is your engine's job.",
      },
      {
        title: "Tavern sign",
        prompt:
          "medieval tavern sign, hanging wooden board on wrought iron bracket, carved-look simple emblem suggested as a shield shape, timber brown with one painted red panel",
        note: "The emblem is geometry — a shield-shaped part carrying one flat color, honestly un-carved.",
      },
      {
        title: "Round shield",
        prompt:
          "medieval round shield, wide disc with raised central boss and simple rim band, steel gray with faded red face panel, sturdy proportions",
        note: "Boss and rim are placed primitives on the disc — the layered read is real geometry.",
      },
    ],
    faqTitle: "Medieval 3D model generator FAQ",
    faq: [
      {
        q: "Can it make full castles?",
        a: "As blockout assemblies — a keep with turrets and crenellation blocks reads at game scale. Fine window tracery and stone-course detail are your DCC pass after export.",
      },
      {
        q: "Do the trebuchets actually work?",
        a: "No — mechanisms are static placed geometry. The blockout communicates proportions and silhouette; animation and physics are engine-side.",
      },
      {
        q: "Is it good for tabletop wargaming?",
        a: "Yes — that is a sweet spot. Towers, terrain, and props print well as STL, and chunky forms survive handling and paint.",
      },
      {
        q: "How does medieval differ from the fantasy page?",
        a: "Overlapping vocabulary, different accent — medieval stays historical (stone, timber, siege), fantasy adds the impossible (crystals, runes, wizardry). Same honest blockout contract either way.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Gothic", href: "/styles/gothic" },
      { label: "Fantasy", href: "/styles/fantasy" },
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "3D Printing", href: "/use-cases/3d-printing" },
    ],
    closingTitle: "Your next keep starts as one prompt",
    closingBody:
      "Stack the tower, repeat the crenellations, export the mesh — the medieval loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Medieval Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "minimalist",
    name: "Minimalist",
    title: "AI Minimalist 3D Model Generator",
    description:
      "Generate minimalist 3D models from a prompt — few forms, restrained palettes, and calm proportions from real primitives. The style this vocabulary expresses most cleanly.",
    subline:
      "Minimalism is subtraction — few parts, restrained palette, generous negative space. Simple primitives at calm proportions deliver it honestly.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Minimalist is a natural fit: the generator's primitives at restrained palettes are exactly the style's raw material.",
      works: [
        "'Minimal', 'single form', 'two colors' steering keeps assemblies to their essential parts.",
        "The lathe primitive revolves smooth single-body silhouettes — the minimalist vase is native geometry here.",
        "Exports carry the calm into any context: GLB for web, OBJ/FBX for DCC, STL for printed objects.",
      ],
      limits: [
        "No subtle blend curves or lofted transitions between primitives — joins are honest abutments, which suits minimalism but is worth knowing.",
        "No matte-finish rendering tricks — roughness is a real parameter, but studio-grade soft lighting is your render pass.",
        "No boolean-smoothed single-mesh output — assemblies keep their part boundaries (visible in wireframe).",
      ],
    },
    stepsTitle: "Prompt to minimalist object in three steps",
    steps: [
      {
        title: "Choose less",
        body: "One form or two, one or two colors, one idea — 'a single lathe form, bone white, no accents' is a complete minimalist prompt.",
      },
      {
        title: "Generate the object",
        body: "The spec honors restraint — few parts, clean transforms, flat palette. The preview is the honest object.",
      },
      {
        title: "Export with intent",
        body: "GLB for a quiet web accent, STL for a printed object, OBJ/FBX for product-adjacent work.",
      },
    ],
    signalsTitle: "What makes a model read as minimalist",
    signals: [
      {
        title: "Part count as a statement",
        body: "Minimalism starts at subtraction — one to three parts is the discipline, and 'minimal parts' wording enforces it.",
      },
      {
        title: "Palette restraint",
        body: "One color, or one plus a neutral. Flat parameter colors make that discipline literal.",
      },
      {
        title: "Proportion calm",
        body: "Nothing shouts: balanced ratios, quiet symmetry or a single deliberate offset. Transform steering handles both.",
      },
      {
        title: "The lathe is the minimalist primitive",
        body: "A revolved profile is one continuous form — vases, cups, and pillars come out genuinely smooth.",
      },
    ],
    recipesTitle: "Minimalist prompt recipes that work",
    recipes: [
      {
        title: "Single-form vase",
        prompt:
          "minimalist vase, single smooth lathe form with gentle curve, matte bone white, no pattern, no additional parts, quiet proportions",
        note: "The lathe spline smoothing is real geometry — the curve is genuinely continuous, not faked by shading.",
      },
      {
        title: "Desk object",
        prompt:
          "minimalist desk object, one cube and one sphere in deliberate offset balance, matte charcoal with single brass sphere accent, museum mood",
        note: "One accent on one part — the deliberate-offset wording steers an asymmetric but calm composition.",
      },
      {
        title: "Geometric ring",
        prompt:
          "minimalist ring form, single torus with one small sphere mounted, brushed steel finish, no ornament, calm proportions",
        note: "A two-part object that prints beautifully in STL as a statement piece.",
      },
      {
        title: "Paperweight",
        prompt:
          "minimalist paperweight, one low wide cylinder with a perfectly centered small dome, matte slate gray, single material, no contrast",
        note: "'No contrast' is a real restraint phrase — it keeps the palette to exactly one parameter color.",
      },
    ],
    faqTitle: "Minimalist 3D model generator FAQ",
    faq: [
      {
        q: "Why does minimalism work so well here?",
        a: "The style asks for exactly what the vocabulary supplies — simple forms, flat colors, clean transforms — with no textures, no ornaments, and no surface detail required.",
      },
      {
        q: "Can I get soft studio renders?",
        a: "The viewer gives an honest preview with real lighting; studio-grade soft-box renders are your DCC's render pass after exporting OBJ or FBX.",
      },
      {
        q: "Are the forms one continuous mesh?",
        a: "Assemblies keep part boundaries — a cube-and-sphere piece is two parts. Single-body pieces come from the lathe primitive, which revolve smoothly as one form.",
      },
      {
        q: "Is minimalist the same as flat style?",
        a: "Close cousins — minimalist is about form count and proportion, flat about color treatment. The two pages lean their respective levers.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Flat", href: "/styles/flat" },
      { label: "Abstract", href: "/styles/abstract" },
      { label: "Modern", href: "/styles/modern" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "3D Printing", href: "/use-cases/3d-printing" },
    ],
    closingTitle: "Your next quiet object starts as one prompt",
    closingBody:
      "Choose less, generate the form, export the object — minimalism is honest by construction here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Minimalist Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "modern",
    name: "Modern",
    title: "AI Modern 3D Model Generator",
    description:
      "Generate modern 3D models from a prompt — clean product-ish forms, neutral palettes, and genuine material parameters, exportable for product and web contexts.",
    subline:
      "Modern is clean lines, neutral palettes, and honest materials — clean primitives with real metalness and roughness deliver it.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Modern's clean forms and neutral material discipline map onto real controls: simple assemblies, flat palettes, genuine metalness/roughness.",
      works: [
        "Product-adjacent blockouts — lamps, speakers, furniture — with clean proportions and quiet palettes.",
        "Material honesty: 'matte polymer', 'anodized aluminum', 'oiled walnut' steer real parameter values per part.",
        "GLB exports these into product pages and configurators with colors intact — a real e-commerce path.",
      ],
      limits: [
        "Concept-grade product design — no CAD features, draft angles, or manufacturability; those belong in real CAD tools.",
        "No fabric, grain, or soft-goods surfaces — those texture reads are your DCC's material pass after export.",
        "No perfect lofts or blends between primitives — modern forms stay honest assemblies of clean parts.",
      ],
    },
    stepsTitle: "Prompt to modern object in three steps",
    steps: [
      {
        title: "Specify the product language",
        body: "'Clean', 'quiet', 'matte', 'neutral with one accent' — modern is decided by restraint words plus a material story.",
      },
      {
        title: "Generate the object",
        body: "Clean primitive assemblies with real proportions; the palette keeps to neutrals plus the named accent.",
      },
      {
        title: "Export for the context",
        body: "GLB for web product displays, USDZ for AR try-out, OBJ/FBX for DCC material passes.",
      },
    ],
    signalsTitle: "What makes a model read as modern",
    signals: [
      {
        title: "Neutral palette discipline",
        body: "Grays, bones, and blacks with at most one accent — flat parameter colors carry that cleanly.",
      },
      {
        title: "Material honesty",
        body: "Modern design respects materials, and here materials are literal: metalness and roughness parameters per part, no fake textures.",
      },
      {
        title: "Confident simple geometry",
        body: "One strong form, a quiet second — 'clean', 'simple', 'uncluttered' steering keeps the assembly honest.",
      },
      {
        title: "Function visible",
        body: "Modern objects show what they do — a lamp is clearly a lamp. Concrete-object prompts read best.",
      },
    ],
    recipesTitle: "Modern prompt recipes that work",
    recipes: [
      {
        title: "Desk lamp",
        prompt:
          "modern desk lamp, slim cylinder base with one angled arm and cone shade, matte black with brass joint accent, quiet proportions, clean forms",
        note: "The brass accent is one part with raised metalness and lowered roughness — a real parameter read.",
      },
      {
        title: "Speaker",
        prompt:
          "modern bluetooth speaker, single rounded cylinder with fabric-look dark top cap and small aluminum base ring, matte charcoal palette, clean simple forms",
        note: "'Fabric-look' stays honest — it is a flat dark color here; real weave is your DCC texture pass.",
      },
      {
        title: "Side table",
        prompt:
          "modern side table, round top disc on three slim angled legs, oiled walnut brown top with matte black legs, calm proportions, minimal parts",
        note: "Three legs repeat with rotation symmetry — a clean assembly the spec places reliably.",
      },
      {
        title: "Planter",
        prompt:
          "modern planter, low wide cylinder with perfect rim and one interior soil disc, matte terracotta with cream exterior, no ornament",
        note: "Two colors, two parts, zero fuss — the export drops straight into a web scene as GLB.",
      },
    ],
    faqTitle: "Modern 3D model generator FAQ",
    faq: [
      {
        q: "Is this suitable for product design work?",
        a: "For concept and presentation contexts — blockouts with clean proportions and honest material parameters. Manufacturable parts need real CAD; see the e-commerce use case for where these models genuinely fit.",
      },
      {
        q: "Do the material reads hold up?",
        a: "Metalness and roughness are real MeshStandardMaterial parameters, so metal-versus-matte reads honestly. Complex reads — fabric weave, wood grain, soft-touch polymer — are texture passes in your DCC.",
      },
      {
        q: "Can I use these on a product page?",
        a: "Yes — GLB exports carry the palette and geometry into web viewers, a genuinely real path from prompt to product display.",
      },
      {
        q: "How does modern differ from minimalist?",
        a: "Modern allows more parts and richer material contrast; minimalist subtracts harder. Both pages use the same honest levers differently.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Minimalist", href: "/styles/minimalist" },
      { label: "Industrial", href: "/styles/industrial" },
      { label: "Flat", href: "/styles/flat" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next clean object starts as one prompt",
    closingBody:
      "Keep it quiet, name the materials, export the object — the modern loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Modern Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
];
