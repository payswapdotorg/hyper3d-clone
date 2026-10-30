/**
 * Style content C — the reference sitemap's last 7 style pages
 * (organic, photorealistic, pixel-art, realistic, retro, stylized,
 * voxel), honestly rewritten for this clone.
 *
 * Facts every claim is tethered to (src/lib):
 *  - The lathe primitive revolves sparse profiles through a real
 *    Catmull-Rom spline into smooth organic silhouettes
 *    (mesh-builder.ts) — the organic page leans on this.
 *  - Materials are per-part MeshStandardMaterial parameters, NOT
 *    baked texture maps — photorealistic and pixel-art pages state
 *    that limit as their reason for "partial".
 *  - Voxel look comes from box primitives the spec stacks; there is
 *    no dedicated voxel remesher and no MagicaVoxel import.
 *  - Exports are real: GLB, GLTF, OBJ, STL, USDZ, ASCII FBX.
 */
import type { StylePageDef } from "./style-types";
import { STUDIO_PATH } from "./studio-path";

export const STYLE_PAGES_C: StylePageDef[] = [
  {
    slug: "organic",
    name: "Organic",
    title: "AI Organic 3D Model Generator",
    description:
      "Generate organic 3D models from a prompt — smooth revolved silhouettes via real spline smoothing, flowing palettes, and natural proportions, in six export formats.",
    subline:
      "Organic forms are genuinely smooth here: sparse profiles revolve through a real smoothing spline into continuous silhouettes.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "The organic half of this clone is real geometry — revolved lathe forms pass through a Catmull-Rom spline, so silhouettes come out smooth, not faceted.",
      works: [
        "Revolved silhouettes are spline-smoothed in the geometry itself — vases, stones, and pots are genuinely continuous forms.",
        "Earthy palettes and soft proportion words steer real per-part colors and transforms.",
        "Exports serve both directions: STL for printed organic objects, GLB/OBJ/FBX for digital scenes.",
      ],
      limits: [
        "No sculpting — surface bumps, dents, and anatomy are beyond the vocabulary; the smoothness is in the revolve, not in freeform clay.",
        "No displacement or normal-map detail — organic surface texture (pores, bark, scales) is your DCC texture pass.",
        "Assemblies abut rather than blend — multi-part organic shapes keep their part boundaries.",
      ],
    },
    stepsTitle: "Prompt to organic form in three steps",
    steps: [
      {
        title: "Describe the flow",
        body: "'Gentle revolved profile', 'smooth continuous curve', 'river-stone roundness' — flow words steer the lathe profile's control points.",
      },
      {
        title: "Generation revolves the form",
        body: "The profile passes through real spline smoothing — the silhouette is smooth geometry, not shading tricks.",
      },
      {
        title: "Export and texture if needed",
        body: "STL for printed objects, GLB/OBJ/FBX for scenes — add organic surface texture in your DCC if the piece needs pores or grain.",
      },
    ],
    signalsTitle: "What makes a model read as organic",
    signals: [
      {
        title: "Continuous silhouette",
        body: "Organic reads through unbroken curves — the lathe's spline smoothing delivers that as literal geometry.",
      },
      {
        title: "Earthy palette",
        body: "Moss, clay, bone, and river-grays — flat parameter colors that carry natural calm without any textures.",
      },
      {
        title: "Asymmetry within balance",
        body: "Nature avoids perfect symmetry; 'slightly asymmetric' or paired-but-offset wording steers believable imperfection.",
      },
      {
        title: "Proportion softness",
        body: "No hard 90-degree statements — 'rounded', 'low', 'generous curves' keep proportions organic.",
      },
    ],
    recipesTitle: "Organic prompt recipes that work",
    recipes: [
      {
        title: "Smooth vase",
        prompt:
          "organic vase, single smooth revolved profile with gentle belly curve and narrow neck, matte sage green, continuous surface, quiet proportions",
        note: "The revolve is spline-smoothed in the geometry — the belly curve is real continuous surface.",
      },
      {
        title: "River stones",
        prompt:
          "river stone stack, three smooth rounded stones in slightly offset balance, matte gray-blue palette with one warm stone, soft natural forms",
        note: "Offset stacking with smooth forms — the read is pure geometry, honest to the last pebble.",
      },
      {
        title: "Coral cluster",
        prompt:
          "stylized coral cluster, one smooth branching form with rounded tips on a stone base, matte terracotta with pale tips, organic proportions",
        note: "'Rounded tips' keeps the branching soft — sharp tips would read artificial.",
      },
      {
        title: "Plant pot",
        prompt:
          "organic plant pot, soft barrel profile with gentle taper and wide rim, matte bone white with terracotta interior disc, one continuous form",
        note: "The interior disc is a second part — the pot body itself is one continuous revolve.",
      },
    ],
    faqTitle: "Organic 3D model generator FAQ",
    faq: [
      {
        q: "Are the smooth curves real geometry or shading?",
        a: "Real geometry — revolved profiles pass through a Catmull-Rom spline before revolving, so sparse control points become genuinely smooth silhouettes. What you export is what you saw.",
      },
      {
        q: "Can it sculpt anatomy or creatures?",
        a: "No sculpting — the vocabulary is primitives plus smooth revolves. Creature blockouts with organic proportions are real; anatomy surface detail is your DCC pass.",
      },
      {
        q: "What about organic surface textures like pores or bark?",
        a: "Those are texture maps, and this clone bakes none — the surface is flat parameter color with real roughness. Export OBJ or FBX and texture in your DCC.",
      },
      {
        q: "Do multi-part organic shapes blend together?",
        a: "No — parts abut cleanly and keep their boundaries. Single-body pieces come from the lathe; assemblies are honest about being assemblies.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Minimalist", href: "/styles/minimalist" },
      { label: "Stylized", href: "/styles/stylized" },
      { label: "Realistic", href: "/styles/realistic" },
      { label: "3D Printing", href: "/use-cases/3d-printing" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next smooth form starts as one prompt",
    closingBody:
      "Describe the flow, revolve the profile, export the mesh — the organic loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate an Organic Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "photorealistic",
    name: "Photorealistic",
    title: "AI Photorealistic 3D Model Generator",
    description:
      "Generate photorealism-ready 3D models from a prompt — real geometry and honest proportions here, with the photoreal material and render pass stated plainly as yours.",
    subline:
      "Photorealism is a materials-and-rendering achievement — this clone generates the geometry half honestly and labels the rest.",
    status: "partial",
    statusChip: "LIMITED HERE",
    statusPanel: {
      summary:
        "Photoreal depends on baked PBR maps and a quality renderer; this clone has parameter materials and an honest preview — the finish is your DCC's.",
      works: [
        "Believable proportions and structure generate for real — the geometry half of photoreal work.",
        "Material parameters (color/metalness/roughness) give a correct first read for metal, matte, and gloss surfaces.",
        "OBJ and FBX exports carry clean closed meshes into Blender, Substance, or KeyShot where photoreal happens.",
      ],
      limits: [
        "No baked PBR map sets — no albedo, normal, or roughness texture images; materials are MeshStandardMaterial parameters only.",
        "No path-traced or studio renders — the preview is an honest lit viewport, not a photoreal render.",
        "No scanned or measured materials — photographic realism needs your material and lighting pipeline after export.",
      ],
    },
    stepsTitle: "Prompt to photoreal-ready mesh in three steps",
    steps: [
      {
        title: "Structure it right",
        body: "Photorealism punishes wrong proportions — describe the object precisely; the geometry is the half you keep from here.",
      },
      {
        title: "Generate with a correct first read",
        body: "Real material parameters give an honest first pass — metals read metal, mattes read matte, at blockout fidelity.",
      },
      {
        title: "Export and finish the realism",
        body: "Export OBJ or FBX, apply PBR map sets and studio lighting in your renderer — that pass is where photoreal is made.",
      },
    ],
    signalsTitle: "What makes a model read as photorealistic",
    signals: [
      {
        title: "It is mostly materials and light",
        body: "Photorealism lives in PBR maps, HDRI lighting, and render settings — texture and render work downstream of the mesh.",
      },
      {
        title: "Proportion precision",
        body: "The geometric half is unforgiving ratios — this is the part the prompt genuinely steers here.",
      },
      {
        title: "Surface micro-detail",
        body: "Scratches, grain, and fingerprints are texture maps — nothing here bakes them, and the page will not pretend otherwise.",
      },
      {
        title: "The honest split",
        body: "Think of this generator as a geometry author: it hands you a clean, correctly-proportioned mesh; the photograph part is your pipeline.",
      },
    ],
    recipesTitle: "Photoreal-ready prompt recipes",
    recipes: [
      {
        title: "Product hero mesh",
        prompt:
          "product-grade ceramic mug, precise cylinder with handle torus and inner cavity disc, even proportions, neutral gray body for material testing, no ornament",
        note: "A neutral-gray mesh is the classic PBR test canvas — the proportions are the kept value from here.",
      },
      {
        title: "Hardware subject",
        prompt:
          "desk hardware blockout, precise wrench form with clean jaws and pinned handle, correct proportions, steel-gray parameters, honest simple forms",
        note: "Metal parameters give a correct first read; real brushed-steel maps are your Substance pass.",
      },
      {
        title: "Furniture piece",
        prompt:
          "modern lounge chair blockout, correct seat-to-back ratio and leg placement, fabric-neutral gray parameters, precise proportions, clean assembly",
        note: "Furniture photoreal is fabric maps plus lighting — the ratio-true blockout is what survives from here.",
      },
      {
        title: "Nature subject",
        prompt:
          "smooth river stone, believable asymmetric form with accurate proportions, neutral gray for map testing, single continuous revolve",
        note: "A revolved stone with real asymmetry offsets — a small, honest geometry win for material tests.",
      },
    ],
    faqTitle: "Photorealistic 3D generator FAQ",
    faq: [
      {
        q: "Does this clone produce photorealistic renders?",
        a: "No. It produces correctly-proportioned meshes with honest material parameters, plus byte-verified exports. Photorealism needs baked PBR maps and a real renderer — Blender Cycles, KeyShot, V-Ray — after export.",
      },
      {
        q: "What do I actually get from the photoreal-ready pages?",
        a: "The geometry half: clean closed assemblies at believable proportions, with a material first-read (metal/matte/gloss) — the correct starting point for a PBR pass.",
      },
      {
        q: "Are there PBR texture maps?",
        a: "No — there are no baked textures of any kind. Materials are MeshStandardMaterial parameters: color, metalness, roughness per part. Every photoreal asset here needs its maps authored downstream.",
      },
      {
        q: "How is this different from the realistic style page?",
        a: "Realistic is the softer target — believable proportions and honest materials in the preview. Photorealistic is the hard target — indistinguishable from photography — and this page is explicit that the last mile is yours.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Realistic", href: "/styles/realistic" },
      { label: "Modern", href: "/styles/modern" },
      { label: "Hand-Painted", href: "/styles/hand-painted" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Generate the geometry; earn the photograph",
    closingBody:
      "Proportion-true meshes with honest parameters export for real — the photoreal pass is one honest step away in your renderer.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Photoreal-Ready Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "pixel-art",
    name: "Pixel Art",
    title: "AI Pixel Art 3D Model Generator",
    description:
      "Generate pixel-art-ready 3D models from a prompt — chunky simple meshes with flat palettes here, with the pixel texture pass honestly left to your tool.",
    subline:
      "Pixel art in 3D is low-resolution textures on simple meshes — the mesh half generates here; the pixels are your texture pass.",
    status: "partial",
    statusChip: "LIMITED HERE",
    statusPanel: {
      summary:
        "Pixel art's essence is baked low-res textures, and this clone bakes none — chunky meshes and flat palettes are real; the pixel look is yours.",
      works: [
        "Chunky, low-detail meshes — the right canvas for pixel-art texture work — generate for real.",
        "Restricted retro palettes land as flat parameter colors, giving your pixel pass a value map to start from.",
        "Exports are real: OBJ and FBX into your DCC or Aseprite-adjacent workflow, GLB for web scenes.",
      ],
      limits: [
        "No texture baking of any kind — no pixel grids, no sprite-style maps; the surface is flat parameter color.",
        "No UV-aware pixel tools — unwrapping and painting happen in your DCC after export.",
        "No 2D sprite output — this is 3D pixel-art prep (meshes for painted textures), not sprite generation.",
      ],
    },
    stepsTitle: "Prompt to pixel-ready mesh in three steps",
    steps: [
      {
        title: "Design for low resolution",
        body: "Chunky silhouettes, minimal parts, bold palette — the vocabulary that survives being textured at 32 pixels.",
      },
      {
        title: "Generate the chunky mesh",
        body: "Simple strong forms with flat retro palette colors — an honest blockout for pixel texturing.",
      },
      {
        title: "Export and pixel it",
        body: "Export OBJ or FBX, unwrap, and paint your low-res texture grid in your tool — that is where pixel art is made.",
      },
    ],
    signalsTitle: "What makes a model read as pixel art",
    signals: [
      {
        title: "The texture IS the style",
        body: "Pixel art is a texture discipline — deliberately low-resolution maps with hard pixel edges, authored after the mesh.",
      },
      {
        title: "Silhouettes at 32 pixels",
        body: "If the outline survives downscaling, the pixel pass works — chunky strong shapes are exactly that.",
      },
      {
        title: "Retro palette discipline",
        body: "Four to eight colors, hard limits — the flat parameter palette here maps onto that discipline as a value structure.",
      },
      {
        title: "Mesh honesty",
        body: "Low-poly chunky geometry under pixel textures is period-correct — and chunky is what this generator does natively.",
      },
    ],
    recipesTitle: "Pixel-ready prompt recipes",
    recipes: [
      {
        title: "Retro hero mesh",
        prompt:
          "chunky adventurer figure for pixel texturing, minimal blocky body with oversized head, strong readable silhouette, four-color palette of brown green cream and red, no fine detail",
        note: "'For pixel texturing' keeps the intent honest — the mesh is the canvas, the pixels are yours.",
      },
      {
        title: "Item drop",
        prompt:
          "chunky treasure chest for pixel texturing, simple box with lid block and small latch cube, bold brown and gold two-color palette, strong outline shape",
        note: "Item meshes at this simplicity texture beautifully at 16 or 32 pixels.",
      },
      {
        title: "Scene tile prop",
        prompt:
          "chunky pixel-ready tree, cylinder trunk with two stacked canopy blocks, three-green palette, minimal parts, strong silhouette at distance",
        note: "Stacked-canopy wording produces the layered blob read that pixel tree textures want.",
      },
      {
        title: "Enemy blob",
        prompt:
          "chunky slime enemy for pixel texturing, single rounded low form with two small dark eye cubes, one flat teal color, strong silhouette, minimal parts",
        note: "A one-color mesh plus eye geometry — the pixel pass adds expression the mesh honestly lacks.",
      },
    ],
    faqTitle: "Pixel art 3D generator FAQ",
    faq: [
      {
        q: "Does this clone generate pixel art textures?",
        a: "No — there is no texture baking at all, pixel or otherwise. Materials are flat parameter colors. The pixel look is authored in your texture tool after a real OBJ/FBX export.",
      },
      {
        q: "Can it output 2D sprites?",
        a: "No — this is 3D generation. The honest path to sprites: generate the chunky mesh, texture it low-res in your pixel tool, then capture or render as needed.",
      },
      {
        q: "Why generate a mesh for pixel art at all?",
        a: "Because 3D pixel art needs a canvas too: chunky silhouettes and correct proportions textured at low resolution. The blockout here is genuinely that canvas.",
      },
      {
        q: "How is this different from low poly or voxel?",
        a: "Low poly is faceted continuous geometry; voxel is stacked cubes; pixel art is painted low-res textures on simple meshes. This page is the texture-dependent one — hence partial here.",
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
      { label: "Retro", href: "/styles/retro" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Generate the canvas; paint the pixels",
    closingBody:
      "Chunky meshes and retro palettes export for real — the pixel pass is one honest export away in your texture tool.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Pixel-Ready Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "realistic",
    name: "Realistic",
    title: "AI Realistic 3D Model Generator",
    description:
      "Generate realistic 3D models from a prompt — believable proportions, honest materials, and real world-scale logic, with six byte-verified export formats.",
    subline:
      "Realistic here means believable proportions and honest materials — the softer, achievable cousin of photorealism, delivered without overclaiming.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Realistic — believable proportions, correct structure, honest material reads — is achievable with this clone's real levers, without claiming photography.",
      works: [
        "Real-world proportion words steer true geometry — objects that read correctly next to each other.",
        "Honest materials: metal reads metal, matte reads matte, via real metalness and roughness parameters.",
        "Six real exports carry the models into scenes, prints, and DCC passes — bytes verified.",
      ],
      limits: [
        "Believable, not photographic — no baked PBR maps, no studio renders; the photoreal page covers that honest ceiling.",
        "Surface detail is parameter-level — scratches, grain, and wear are your DCC texture pass.",
        "Blockout assemblies — parts abut cleanly rather than blending; fine mechanical detail is downstream.",
      ],
    },
    stepsTitle: "Prompt to realistic model in three steps",
    steps: [
      {
        title: "Ground it in the real",
        body: "Name the real object and its materials — 'a garden trowel, worn steel blade, oiled wood handle' — realism starts in the words.",
      },
      {
        title: "Generate with honest reads",
        body: "Proportions steer true; materials read as themselves — the preview shows the object as it honestly is.",
      },
      {
        title: "Export into context",
        body: "GLB for scenes, STL for prints, OBJ/FBX for detail passes — the mesh carries the realism you built.",
      },
    ],
    signalsTitle: "What makes a model read as realistic",
    signals: [
      {
        title: "Proportion truth",
        body: "Realism's spine is ratio — handle-to-blade, seat-to-back, rim-to-bowl. Proportion words steer those literally.",
      },
      {
        title: "Material honesty",
        body: "Real metalness and roughness per part mean surfaces read as their material — the honest foundation of realism.",
      },
      {
        title: "Scale logic",
        body: "Objects that coexist correctly — a mug beside a laptop — because the spec honors relative scale language.",
      },
      {
        title: "Restraint",
        body: "Real objects are quiet — no fantasy accents, no stylization pushes. Plain descriptive prompts read most realistic.",
      },
    ],
    recipesTitle: "Realistic prompt recipes that work",
    recipes: [
      {
        title: "Kitchen tool",
        prompt:
          "kitchen whisk, realistic proportions, slim handle with loop end and full wire balloon suggested as curved cage, brushed steel, honest simple forms",
        note: "'Suggested as curved cage' is honest — the whisk cage is simplified geometry, true to proportion.",
      },
      {
        title: "Furniture piece",
        prompt:
          "wooden dining chair, realistic proportions, four turned legs with rectangular back and seat, oiled walnut parameters, sturdy and plain",
        note: "Turned legs are lathe forms — genuinely revolved; the walnut is a flat color with honest roughness.",
      },
      {
        title: "Gadget blockout",
        prompt:
          "desk calculator, realistic proportions, slab body with raised display block and simple key grid, matte dark gray with lighter key tops, honest scale",
        note: "The key grid repeats small boxes — placement rhythm stands in for key detail honestly.",
      },
      {
        title: "Garden tool",
        prompt:
          "garden trowel, realistic proportions, tapered blade with riveted handle tang, worn steel with oiled wood grip, honest wear-free forms",
        note: "Rivets are tiny cylinders; 'wear-free' keeps the claim honest — wear is texture work downstream.",
      },
    ],
    faqTitle: "Realistic 3D model generator FAQ",
    faq: [
      {
        q: "How is realistic different from photorealistic here?",
        a: "Realistic = believable proportions and honest materials, achievable with this clone's real levers. Photorealistic = indistinguishable from photography, which needs baked maps and a real renderer — the photorealistic page marks that as partial.",
      },
      {
        q: "Do the models include surface wear and detail?",
        a: "Wear, scratches, and grain are texture maps — not baked here. The geometry and material parameters are true; the patina is your DCC pass.",
      },
      {
        q: "Are proportions actually reliable?",
        a: "Proportion language steers real transforms, and plain descriptive prompts (a chair, a trowel) land believable ratios — that is the style's core, delivered honestly.",
      },
      {
        q: "Which export keeps the most realism?",
        a: "GLB and USDZ carry colors and geometry into web/AR contexts intact; OBJ and FBX are the right start for DCC detail passes.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Photorealistic", href: "/styles/photorealistic" },
      { label: "Modern", href: "/styles/modern" },
      { label: "Organic", href: "/styles/organic" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
    ],
    closingTitle: "Your next believable object starts as one prompt",
    closingBody:
      "Ground it in the real, generate with honest materials, export the mesh — the realistic loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Realistic Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "retro",
    name: "Retro",
    title: "AI Retro 3D Model Generator",
    description:
      "Generate retro 3D models from a prompt — PSX-era chunk, CRT consoles, and arcade cabinets from low-segment primitives with period-correct palettes.",
    subline:
      "Retro is chunky geometry and limited palettes — the aesthetic of early 3D, which today's generator reaches by steering the same knobs down.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Retro-era looks — low segment counts, chunky forms, limited palettes — are exactly what steering-down produces here.",
      works: [
        "'Chunky', 'few segments', 'retro' wording drops geometry density — the PSX read is real geometry, not post-processing.",
        "Period palettes (sixteen-color discipline) land as flat parameter colors across parts.",
        "Exports serve retro pipelines: GLB for web toy boxes, OBJ/FBX for engine remakes, STL for printed keepsakes.",
      ],
      limits: [
        "No affine texture warping or CRT filters — the authentic wobble is a shader effect in your engine.",
        "No baked low-res textures — the retro surface detail is your texture pass after export.",
        "No dithering post-process — that is a render-stage effect, honestly out of scope here.",
      ],
    },
    stepsTitle: "Prompt to retro object in three steps",
    steps: [
      {
        title: "Dial the era",
        body: "'Chunky', 'low detail', 'few segments', plus a period palette — the two knobs that matter for the retro read.",
      },
      {
        title: "Generate the chunk",
        body: "Low-segment spheres and chunky boxes assemble — the geometry density IS the period look.",
      },
      {
        title: "Export and add the wobble",
        body: "Export GLB or OBJ, then add CRT/affine shaders in your engine for the full period illusion.",
      },
    ],
    signalsTitle: "What makes a model read as retro",
    signals: [
      {
        title: "Geometry density as era",
        body: "The 32-bit look was low polygon counts — chunky steering reproduces that density honestly in the mesh itself.",
      },
      {
        title: "Palette limits",
        body: "Sixteen colors, hard discipline — flat parameter palettes enforce that limit by construction.",
      },
      {
        title: "Chunk over detail",
        body: "Retro forms read by silhouette: the console, the cabinet, the chunky car — all primitive-friendly subjects.",
      },
      {
        title: "The wobble is downstream",
        body: "Affine warping, dithering, and scanlines are shader effects — your engine's pass, stated plainly.",
      },
    ],
    recipesTitle: "Retro prompt recipes that work",
    recipes: [
      {
        title: "Chunky console",
        prompt:
          "retro game console, chunky gray slab with simple cartridge slot and two button blocks, light gray with dark gray accents and one red power cube, period proportions",
        note: "The 90s console is peak primitive vocabulary — a slab, a slot, a few cubes.",
      },
      {
        title: "Retro car",
        prompt:
          "retro chunky car, boxy body with simple cylinder wheels and slab windows, two-tone teal and cream palette, few segments everywhere, strong silhouette",
        note: "'Few segments everywhere' is the honest retro knob — cylinder wheels arrive visibly faceted.",
      },
      {
        title: "CRT television",
        prompt:
          "retro CRT television, chunky box with slightly recessed dark screen slab and two knob cylinders, walnut-brown body with silver front, period proportions",
        note: "The screen is a flat dark part — the phosphor glow is your engine's emissive pass.",
      },
      {
        title: "Arcade cabinet",
        prompt:
          "retro arcade cabinet, tall chunky body with angled screen slab, simple control panel and button cubes, bold red and black two-color palette, honest scale",
        note: "Cabinet proportions steer reliably — the marquee art is texture work downstream.",
      },
    ],
    faqTitle: "Retro 3D model generator FAQ",
    faq: [
      {
        q: "Can I get authentic PSX texture wobble?",
        a: "The mesh half is real — chunky low-density geometry. The wobble (affine mapping), dithering, and scanlines are shader effects you add in your engine after export.",
      },
      {
        q: "Does it bake retro low-res textures?",
        a: "No — no textures are baked at all. Surfaces are flat parameter colors; pixel-style low-res texture work is your pass (see the pixel-art page for that honest split).",
      },
      {
        q: "Why is retro so compatible with this generator?",
        a: "Because the era's limits were low geometry density and small palettes — and steering segments down with flat palettes is exactly what the real controls here do.",
      },
      {
        q: "Can I use these for a remake or demake?",
        a: "Yes — GLB and OBJ exports drop into engines as placeholder or finished chunky assets; add period shaders for the full effect.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Pixel Art", href: "/styles/pixel-art" },
      { label: "Voxel", href: "/styles/voxel" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next chunk of nostalgia starts as one prompt",
    closingBody:
      "Dial the era, keep the palette small, export the mesh — the retro loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Retro Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "stylized",
    name: "Stylized",
    title: "AI Stylized 3D Model Generator",
    description:
      "Generate stylized 3D models from a prompt — deliberate exaggeration, coherent palettes, and readable silhouettes from real primitives, in six export formats.",
    subline:
      "Stylized is the honest umbrella — exaggeration with intent, palette with discipline, silhouette first. All three are real levers here.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Stylized work is the broadest fit: exaggeration, palette discipline, and silhouette focus are exactly this clone's real controls.",
      works: [
        "Exaggeration words steer literal proportions — the core stylized lever, honestly geometric.",
        "Coherent two-to-four-color palettes land as flat parameters, the stylized standard.",
        "Exports reach every stylized pipeline: GLB for web, OBJ/FBX for DCC finishing, STL for prints.",
      ],
      limits: [
        "No painted stylized textures — hand-painted surfaces are the hand-painted page's honest limit; here surfaces are flat parameters.",
        "Sculpt-level character detail is out of vocabulary — stylized blockouts, not finished characters.",
        "No style-lock — the style is steered by wording, not enforced by a dedicated model.",
      ],
    },
    stepsTitle: "Prompt to stylized model in three steps",
    steps: [
      {
        title: "Pick the exaggeration",
        body: "What gets pushed — proportions, palette, silhouette? 'Oversized sword, tiny hilt' is a complete stylized decision.",
      },
      {
        title: "Generate the push",
        body: "Exaggeration lands as real transform scale; the palette keeps the parts coherent and flat.",
      },
      {
        title: "Export and finish",
        body: "OBJ/FBX into your DCC for texture passes, or GLB straight into engines as flat-colored stylized assets.",
      },
    ],
    signalsTitle: "What makes a model read as stylized",
    signals: [
      {
        title: "Deliberate exaggeration",
        body: "Stylization is choosing what to lie about — bigger blade, rounder body, longer legs. Transform steering makes those lies geometric.",
      },
      {
        title: "Palette coherence",
        body: "Two to four flats that agree — the palette field assigns them deterministically across every part.",
      },
      {
        title: "Silhouette-first",
        body: "Stylized assets read in outline before detail — 'strong silhouette' wording steers exactly that priority.",
      },
      {
        title: "Honest blockouts",
        body: "Most stylized game art is blockout-plus-texture — this generator covers the blockout half genuinely.",
      },
    ],
    recipesTitle: "Stylized prompt recipes that work",
    recipes: [
      {
        title: "Stylized creature",
        prompt:
          "stylized forest spirit, round body with stubby limbs and oversized leaf-shaped head, sage and moss palette with cream belly, strong silhouette, chunky forms",
        note: "One exaggeration (the head) plus palette discipline — the stylized formula in a single prompt.",
      },
      {
        title: "Stylized tree",
        prompt:
          "stylized tree, thick tapered trunk with three chunky canopy blobs, autumn palette of rust gold and brown, exaggerated trunk-to-canopy ratio, strong silhouette",
        note: "Canopy blobs are spheres at varied scales — the exaggeration ratio is literal geometry.",
      },
      {
        title: "Stylized vehicle",
        prompt:
          "stylized delivery van, rounded boxy body with oversized wheels and tiny windows, mint and cream palette with one coral stripe part, toy-like proportions",
        note: "Oversized wheels are real scale values — the toy read comes from the ratio, honestly.",
      },
      {
        title: "Stylized weapon",
        prompt:
          "stylized greatsword, oversized broad blade with simple guard and wrapped grip, steel blue with bronze guard accent, exaggerated size ratio, strong outline",
        note: "The exaggeration is one transform decision — and it survives export into any engine.",
      },
    ],
    faqTitle: "Stylized 3D model generator FAQ",
    faq: [
      {
        q: "Is stylized the same as cartoon?",
        a: "Overlapping but broader — cartoon implies comedy proportions; stylized is any deliberate exaggeration with coherent discipline. This page is the umbrella; cartoon, anime, and low poly are its specific flavors.",
      },
      {
        q: "Does the generator enforce style consistency?",
        a: "No style-lock exists — the style is steered by wording and palette, not enforced by a dedicated model. Deterministic reruns with a pinned seed keep a style consistent across regenerations.",
      },
      {
        q: "Can I get painted stylized textures?",
        a: "Not here — surfaces are flat parameter colors. The hand-painted page covers that honest split: mesh here, paint in your DCC.",
      },
      {
        q: "Why does stylized fit this clone so well?",
        a: "Because stylized art's carriers — exaggeration, flat palettes, silhouette — are exactly the controls that exist here, no more and no less.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Cartoon", href: "/styles/cartoon" },
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Hand-Painted", href: "/styles/hand-painted" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Character Design", href: "/use-cases/character-design" },
    ],
    closingTitle: "Your next exaggeration starts as one prompt",
    closingBody:
      "Choose the push, hold the palette, export the mesh — the stylized loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Stylized Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "voxel",
    name: "Voxel",
    title: "AI Voxel 3D Model Generator",
    description:
      "Generate voxel-style 3D models from a prompt — cube-stacked forms from real box primitives with honest voxel palettes, exportable in six formats.",
    subline:
      "The voxel look is stacked cubes — and boxes are real vocabulary here. No dedicated voxel remesher exists; the stacking itself is the style.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Voxel reads through cube-stacked construction, which the spec genuinely places — though there is no dedicated voxel remesher or grid engine.",
      works: [
        "'Voxel' steering stacks box primitives into stepped forms — the look is real geometry, cube by cube.",
        "Voxel palettes (one flat color per material group) land as parameter colors on the cubes.",
        "GLB exports these into web voxel scenes; OBJ/FBX carries them into MagicaVoxel-adjacent pipelines.",
      ],
      limits: [
        "No dedicated voxel remesher — arbitrary meshes do not get voxelized; the look comes from box primitives the spec stacks.",
        "No MagicaVoxel import or .vox format — the export row is GLB, GLTF, OBJ, STL, USDZ, and FBX, stated plainly.",
        "No grid editor — cube counts and placements are steered by wording, not painted by hand.",
      ],
    },
    stepsTitle: "Prompt to voxel build in three steps",
    steps: [
      {
        title: "Think in cubes",
        body: "'Voxel style', 'blocky stacked cubes', 'stepped forms' — the wording that turns the assembly into cube stacks.",
      },
      {
        title: "Generation stacks the blocks",
        body: "Boxes place at stepped offsets with flat palette colors — the voxel read is literal geometry.",
      },
      {
        title: "Export the build",
        body: "GLB for web scenes, OBJ/FBX for DCC or engine work, STL for printed voxel keepsakes.",
      },
    ],
    signalsTitle: "What makes a model read as voxel",
    signals: [
      {
        title: "The cube is the unit",
        body: "Voxel means discrete stacked blocks — every surface a step, every volume a count. Box primitives deliver that literally.",
      },
      {
        title: "One color per material group",
        body: "Voxel palettes are flat and few — parameter colors assign across cube groups deterministically.",
      },
      {
        title: "Stepped silhouettes",
        body: "Stairs, not ramps — 'stepped', 'blocky' wording keeps the read voxel rather than smooth.",
      },
      {
        title: "Honest construction",
        body: "This is not a voxelized mesh — it is boxes placed as boxes. The distinction is stated because it is real.",
      },
    ],
    recipesTitle: "Voxel prompt recipes that work",
    recipes: [
      {
        title: "Voxel character",
        prompt:
          "voxel character, blocky stacked-cube body with cube head and stubby cube limbs, two-color palette of sky blue and cream, stepped silhouette, no smooth parts",
        note: "'No smooth parts' keeps every primitive a box — the discipline that makes the read.",
      },
      {
        title: "Voxel tree",
        prompt:
          "voxel tree, stacked cube trunk with three cube-cluster canopy steps, brown and two greens palette, chunky stepped silhouette, blocky proportions",
        note: "Canopy steps are cube clusters at descending sizes — a classic voxel build in real boxes.",
      },
      {
        title: "Voxel house",
        prompt:
          "voxel house, blocky cube walls with stepped roof blocks and one door cube, cream walls with terracotta roof palette, chunky stepped forms",
        note: "The stepped roof is literal stacked boxes at offsets — no wedges, honestly.",
      },
      {
        title: "Voxel terrain chunk",
        prompt:
          "voxel terrain chunk, stepped cube elevation in three layers with grass top cubes and dirt sides, green and brown palette, blocky platform feel",
        note: "Layer words produce elevation steps — a real platformer tile exported as GLB.",
      },
    ],
    faqTitle: "Voxel 3D model generator FAQ",
    faq: [
      {
        q: "Is there a dedicated voxel engine or remesher?",
        a: "No — no dedicated voxel remesher and no .vox format. The voxel look here is box primitives the spec stacks directly; meshes are not voxelized after the fact.",
      },
      {
        q: "Can I import MagicaVoxel files?",
        a: "No MagicaVoxel import — the export row is GLB, GLTF, OBJ, STL, USDZ, and FBX, stated plainly rather than padded.",
      },
      {
        q: "How does voxel differ from low poly?",
        a: "Low poly is faceted continuous geometry (few triangles); voxel is discrete stacked cubes (many boxes). Both generate here — with different honest steering words.",
      },
      {
        q: "Are the cubes individually editable after export?",
        a: "In your DCC, yes — the boxes are real separate placed primitives in the exported mesh, so selection and re-placement work naturally.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Isometric", href: "/styles/isometric" },
      { label: "Pixel Art", href: "/styles/pixel-art" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Metaverse", href: "/use-cases/metaverse" },
    ],
    closingTitle: "Your next build starts as one prompt",
    closingBody:
      "Think in cubes, stack the blocks, export the mesh — the voxel loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: STUDIO_PATH },
    cta: { label: "Generate a Voxel Model", href: STUDIO_PATH },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
];
