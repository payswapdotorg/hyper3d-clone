/**
 * Style content A — the reference sitemap's first 7 style pages
 * (abstract, anime, cartoon, cel-shaded, fantasy, flat, gothic),
 * honestly rewritten for this clone.
 *
 * Facts every claim is tethered to (src/lib):
 *  - Text→3D and image→3D generation really run; the spec carries style
 *    words into shapes, palettes, proportions, and segment counts.
 *  - Materials are per-part MeshStandardMaterial parameters
 *    (mesh-builder.ts buildMaterial) — color / metalness / roughness.
 *    NOT baked texture maps; no page may claim albedo/normal map images.
 *  - Exports are real: GLB, GLTF, OBJ, STL, USDZ, ASCII FBX.
 *  - No polycount slider, no LODs, no style-lock, no toon shader,
 *    no texture baking, no dedicated voxel remesher.
 */
import type { StylePageDef } from "./style-types";

export const STYLE_PAGES_A: StylePageDef[] = [
  {
    slug: "abstract",
    name: "Abstract",
    title: "AI Abstract 3D Model Generator",
    description:
      "Generate abstract 3D forms from a prompt — balanced compositions of primitives, palettes, and proportions, honestly steerable and exportable in six real formats.",
    subline:
      "Non-representational 3D made from composed primitives — the vocabulary this generator builds from is a natural fit for abstract work.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Abstract is the style closest to this clone's native vocabulary: balanced compositions of real primitives with parameter materials.",
      works: [
        "Prompt-steered composition — symmetry, stacking, offsets, and repetition all travel through the spec into real transforms.",
        "Palettes are first-class: name a color story and the parts carry it as flat parameter colors.",
        "Every export is real — GLB, GLTF, OBJ, STL, USDZ, and FBX from the same geometry you previewed.",
      ],
      limits: [
        "No sculpted high-frequency surface detail — the vocabulary is boxes, spheres, cylinders, cones, toruses, lathes, and extrudes.",
        "Materials are per-part parameters (color/metalness/roughness), not baked texture maps, so grunge and patina live in your DCC.",
        "No procedural scattering or boolean fracturing — each object in the composition is placed by the spec.",
      ],
    },
    stepsTitle: "Prompt to abstract form in three steps",
    steps: [
      {
        title: "Describe the composition",
        body: "Name the mood, the palette, and the geometry — 'a balanced stack of offset slabs, matte charcoal and one brass accent'. The spec reads all three.",
      },
      {
        title: "Generation assembles the forms",
        body: "The pipeline composes closed primitives with real transforms — the poster preview is a true rasterization of the built mesh.",
      },
      {
        title: "Export and compose further",
        body: "Take GLB into a web scene, OBJ or FBX into your DCC, or STL if the piece becomes a physical sculpture.",
      },
    ],
    signalsTitle: "What makes a form read as abstract",
    signals: [
      {
        title: "Composition over subject",
        body: "Abstract work spends its attention on balance, rhythm, and tension between volumes — exactly what primitive placement and repetition express well.",
      },
      {
        title: "Palette as structure",
        body: "A restrained palette with one accent turns a stack of boxes into a statement; the palette field in the spec assigns flat parameter colors deterministically.",
      },
      {
        title: "Proportion carries meaning",
        body: "Tall-and-thin reads ambitious, wide-and-low reads grounded. Scale and transform words in the prompt steer those proportions directly.",
      },
      {
        title: "Surface honesty",
        body: "Matte, satin, or metallic sheen is a real per-part parameter here — roughness and metalness sliders of the MeshStandardMaterial, not texture tricks.",
      },
    ],
    recipesTitle: "Abstract prompt recipes that work",
    recipes: [
      {
        title: "Balanced monolith",
        prompt:
          "abstract sculpture, three stacked offset slabs decreasing in size, matte charcoal with a single polished brass sphere resting on top, museum plinth feel",
        note: "Stacking and offset language steers transforms; 'polished' raises metalness and drops roughness on that one part.",
      },
      {
        title: "Repeating rhythm",
        prompt:
          "abstract composition, a ring of nine identical thin cylinders leaning outward at the same angle, deep teal palette, uniform satin finish",
        note: "Repetition words produce sibling primitives with matched transforms — deterministic, so a rerun with the same seed rebuilds it exactly.",
      },
      {
        title: "Soft versus hard",
        prompt:
          "abstract contrast piece, one smooth rounded lathe form intersecting a cluster of sharp boxes, bone white against graphite, soft studio mood",
        note: "The lathe primitive revolves a profile through a smoothing spline — the smooth/rounded half is genuinely smooth geometry, not shading.",
      },
      {
        title: "Geometric totem",
        prompt:
          "abstract totem, alternating boxes and cones on a shared vertical axis, terracotta and sand two-color palette, flat matte finish, strong silhouette",
        note: "'Strong silhouette' steers proportion exaggeration; the two-color palette keeps the read graphic rather than busy.",
      },
    ],
    faqTitle: "Abstract 3D generator FAQ",
    faq: [
      {
        q: "Can I generate truly non-representational forms here?",
        a: "Yes — abstract work is where the primitive vocabulary is most at home. Compositions of boxes, spheres, cylinders, cones, toruses, lathe bodies, and extruded shapes are exactly what the spec assembles.",
      },
      {
        q: "Are the colors flat or textured?",
        a: "Colors are flat per-part parameters — color, metalness, and roughness on a MeshStandardMaterial. There are no baked texture maps here, which suits hard-edged abstract work; add grunge or gradients in your DCC.",
      },
      {
        q: "Will reruns give me the same sculpture?",
        a: "The build is deterministic: same prompt, same seed, same mesh. Pin the seed when you find a composition you like and iterate on the wording.",
      },
      {
        q: "Can I 3D-print an abstract piece?",
        a: "Yes — STL export is real and sliced from the same geometry you previewed. Intersecting primitives are concept-grade, so check overlapping walls in your slicer before committing material.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Minimalist", href: "/styles/minimalist" },
      { label: "Flat", href: "/styles/flat" },
      { label: "Modern", href: "/styles/modern" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
    ],
    closingTitle: "Your next abstract form starts as one prompt",
    closingBody:
      "Describe the balance, generate the composition, export the mesh — the whole loop works right here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate an Abstract Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "anime",
    name: "Anime",
    title: "AI Anime 3D Model Generator",
    description:
      "Generate anime-style 3D models from a prompt — chibi proportions, bold palettes, and clean silhouettes from real primitives, honestly scoped for figures and props.",
    subline:
      "Anime here means proportions and palette first — chibi-scale figures, mascot props, and mecha blockouts that read instantly in silhouette.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "The anime look this clone can genuinely deliver is proportion- and palette-driven — chibi figures, clean silhouettes, bold flat colors.",
      works: [
        "Proportion words steer real transforms — 'big head, small body' lands as actual geometry ratios.",
        "Bold anime palettes are real flat parameter colors, assigned deterministically across parts.",
        "Figure blockouts export for real — GLB for web showcases, OBJ/FBX for DCC finishing, STL for figures.",
      ],
      limits: [
        "No facial features or hair strands — the primitive vocabulary has no curves-for-faces; eyes and bangs are your DCC's job.",
        "Materials are per-part parameters, not cel-shaded toon materials — see the cel-shaded page for that honest limit.",
        "Not production anime characters: these are blockout-grade figures for concept, layout, and mascots.",
      ],
    },
    stepsTitle: "Prompt to anime-scale model in three steps",
    steps: [
      {
        title: "Name the character language",
        body: "Chibi, mascot, mecha, magical-prop — plus the palette. 'Chibi fox spirit, cream and coral palette' steers both proportions and colors.",
      },
      {
        title: "Generation builds the figure",
        body: "The spec composes a big sphere head over a compact body — the proportions are literal geometry, not camera tricks.",
      },
      {
        title: "Export and finish the face",
        body: "Take the mesh into your DCC for eyes and hair detail, or keep it faceless-mascot-clean and use it as-is.",
      },
    ],
    signalsTitle: "What makes a model read as anime",
    signals: [
      {
        title: "Proportion is the style",
        body: "Anime reads through ratio — oversized head, compact limbs, oversized props. Those ratios are real transform values the prompt steers.",
      },
      {
        title: "Bold, flat palette",
        body: "Two or three saturated flats with one pastel is the anime default; the palette field carries that as per-part parameter colors.",
      },
      {
        title: "Silhouette-first design",
        body: "If the outline reads — fox ears, a wing silhouette, a giant ribbon — the model reads. Strong-silhouette wording steers that.",
      },
      {
        title: "Props carry character",
        body: "Wands, swords, and mecha parts are where this vocabulary shines — hard-surface primitives with clean accents make convincing anime props.",
      },
    ],
    recipesTitle: "Anime prompt recipes that work",
    recipes: [
      {
        title: "Chibi companion",
        prompt:
          "chibi fox spirit figure, very large round head about half the total height, tiny rounded body, big triangular ears, cream and coral two-color palette, flat matte finish",
        note: "Half-the-height head wording is a real ratio; the ears are cones — the silhouette carries the style.",
      },
      {
        title: "Mascot robot",
        prompt:
          "round mascot robot, chunky cylindrical body, dome head, stubby arms, glossy white with sky-blue accents and one amber light, toy-like proportions",
        note: "'Glossy' drops roughness on the parameter material; toy-like keeps proportions honest to what primitives express.",
      },
      {
        title: "Magical girl wand",
        prompt:
          "magical girl wand prop, slender shaft with a five-pointed star topper, pearl white and rose gold palette, small ring detail under the star",
        note: "Props are this vocabulary's strength — the star is extruded flat geometry, the ring a torus.",
      },
      {
        title: "Mecha blockout",
        prompt:
          "mecha chassis blockout, broad chest block, narrow waist, stacked shoulder pads, gunmetal palette with one red accent panel, hard-surface edges, upright stance",
        note: "A blockout is the honest deliverable — panel lines, vents, and greebles belong to your DCC pass.",
      },
    ],
    faqTitle: "Anime 3D model generator FAQ",
    faq: [
      {
        q: "Can it make production anime characters?",
        a: "No — and it will not pretend to. It makes proportion-and-palette blockouts: chibi figures, mascots, and props with real geometry and real exports. Faces, hair strands, and fabric folds need your DCC.",
      },
      {
        q: "Are the materials toon-shaded?",
        a: "No. Materials are MeshStandardMaterial parameters — color, metalness, roughness. Cel shading is a shading model this clone does not have; the cel-shaded page states that plainly.",
      },
      {
        q: "Do the proportions really respond to the prompt?",
        a: "Yes — 'big head, small body' is implemented as literal transform scale on the parts. The style here is geometry, not a post-process.",
      },
      {
        q: "What about textures?",
        a: "There are no baked texture maps — anime flats suit parameter colors well, but any decal, blush, or eye texture is your finishing pass after exporting OBJ or FBX.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Cel-Shaded", href: "/styles/cel-shaded" },
      { label: "Cartoon", href: "/styles/cartoon" },
      { label: "Stylized", href: "/styles/stylized" },
      { label: "Character Design", href: "/use-cases/character-design" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next chibi starts as one prompt",
    closingBody:
      "Name the proportions, generate the figure, export the mesh — and give it a face in your DCC.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate an Anime Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "cartoon",
    name: "Cartoon",
    title: "AI Cartoon 3D Model Generator",
    description:
      "Generate cartoon-style 3D models from a prompt — bouncy proportions, bold flat colors, and chunky silhouettes from real primitives, with six real export formats.",
    subline:
      "Cartoon is exaggerated proportions plus bold flats — both are real levers here, which makes this style one of the most honest fits.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Cartoon lands well here because its core — exaggerated ratios, chunky shapes, bold flat colors — maps directly onto real spec controls.",
      works: [
        "Exaggeration words ('stubby', 'oversized', 'chunky') steer literal geometry proportions.",
        "Bold cartoon palettes are flat parameter colors — no textures needed for the look to read.",
        "Chunky silhouettes suit the primitive vocabulary: rounded bodies, stubby limbs, oversized props.",
      ],
      limits: [
        "No squash-and-stretch animation rig — the mesh is a static posed figure; cartoon motion is your animation tool's job.",
        "No painted texture details — outlines, patches, and faces are your DCC pass after a real export.",
        "No curved cartoon outlines (like inked contours) — the silhouette is geometry only.",
      ],
    },
    stepsTitle: "Prompt to cartoon prop in three steps",
    steps: [
      {
        title: "Describe the exaggeration",
        body: "'Stubby', 'oversized', 'chunky', 'bounce' — proportion words that steer real transforms. Add a two- or three-color palette.",
      },
      {
        title: "Generation builds the chunk",
        body: "The spec composes rounded primitives at exaggerated ratios — the cartoon read comes from the geometry itself.",
      },
      {
        title: "Export for your pipeline",
        body: "GLB for the web, OBJ or FBX for DCC finishing, STL if the prop becomes a toy print.",
      },
    ],
    signalsTitle: "What makes a model read as cartoon",
    signals: [
      {
        title: "Exaggerated ratio",
        body: "Cartoon is proportion pushed past plausibility — a hammer head five times its handle, arms shorter than shoes. Real transform values.",
      },
      {
        title: "Bold flats",
        body: "Two or three saturated colors, no gradients — exactly what flat parameter materials deliver.",
      },
      {
        title: "Rounded everything",
        body: "Cartoon shapes avoid hard chamfers; spheres, rounded lathes, and soft cones carry the look.",
      },
      {
        title: "Prop-first thinking",
        body: "Cartoon props (hammers, radios, teapots) read more easily than cartoon faces — lead with props while planning.",
      },
    ],
    recipesTitle: "Cartoon prompt recipes that work",
    recipes: [
      {
        title: "Bouncy sidekick",
        prompt:
          "cartoon blob sidekick character, round pear body, stubby legs, no neck, huge happy silhouette, bubblegum pink with white belly patch, glossy toy finish",
        note: "The pear body is a lathe profile; the white patch is a part color, not a texture — it reads because the palette is flat.",
      },
      {
        title: "Cartoon hammer",
        prompt:
          "cartoon mega hammer prop, oversized rounded rectangular head four times the handle width, slender handle, banana yellow head with mint handle, satin finish",
        note: "Four-times wording is a real ratio; exaggeration is the entire cartoon engine here.",
      },
      {
        title: "Toy robot",
        prompt:
          "cartoon toy robot, boxy body with dome head, tube arms with ball hands, two big button eyes suggested as dark spheres, cherry red and cream palette",
        note: "'Suggested as dark spheres' is the honest way to imply a face — geometry only, no painted features.",
      },
      {
        title: "Diner prop set",
        prompt:
          "cartoon diner prop set, chunky ketchup bottle, oversized burger stack, tall milkshake glass with one cherry, cherry red mint and cream palette, uniform finish",
        note: "Sets compose multiple objects — each is a separate placed primitive assembly, all sharing one palette.",
      },
    ],
    faqTitle: "Cartoon 3D model generator FAQ",
    faq: [
      {
        q: "Why does cartoon work so well here?",
        a: "Because the style's two carriers — exaggerated proportions and bold flat colors — are literal controls: transform scale and per-part parameter colors. No texture baking required.",
      },
      {
        q: "Can I get painted cartoon outlines?",
        a: "No — inked contour lines are a texture/render effect. Export OBJ or FBX and add outlines in your DCC; the silhouette geometry is already cartoon-correct.",
      },
      {
        q: "Can the models be animated?",
        a: "The meshes export cleanly, but there is no rigging, skeleton, or pose picker here. Rig in your animation tool after export.",
      },
      {
        q: "Are cartoon colors flat or textured?",
        a: "Flat parameter colors — which is genuinely the cartoon default anyway. Metalness and roughness are also real parameters if you want a satin or glossy toy finish.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Anime", href: "/styles/anime" },
      { label: "Stylized", href: "/styles/stylized" },
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next cartoon chunk starts as one prompt",
    closingBody:
      "Push the proportions, pick two flats, generate the prop — the loop runs end-to-end right here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Cartoon Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "cel-shaded",
    name: "Cel-Shaded",
    title: "AI Cel-Shaded 3D Model Generator",
    description:
      "Generate cel-shading-ready 3D models from a prompt — chunky silhouettes and flat palettes here, with the toon shading step honestly left to your DCC.",
    subline:
      "The mesh and palette can be generated here; the toon shading model itself is not in this clone — this page says exactly where the line sits.",
    status: "partial",
    statusChip: "LIMITED HERE",
    statusPanel: {
      summary:
        "Cel shading is a shading model, and this clone's materials are MeshStandardMaterial parameters — the silhouette and palette are real, the toon step is yours.",
      works: [
        "Chunky, high-contrast silhouettes — the geometric half of cel-shading — generate for real from a prompt.",
        "Flat two-tone palettes land as per-part parameter colors, ready for a toon shader to pick up.",
        "Exports are real: OBJ and FBX carry the mesh into Blender or Unity where toon shading actually exists.",
      ],
      limits: [
        "No toon/cel shading model — materials here are standard PBR parameters (color, metalness, roughness), not stepped light ramps.",
        "No ink outline pass — contour lines are a render-time effect your DCC or game engine provides.",
        "No painted shadow shapes — the characteristic hard shadow patches are texture work done after export.",
      ],
    },
    stepsTitle: "Prompt to cel-shading-ready mesh in three steps",
    steps: [
      {
        title: "Steer the silhouette",
        body: "Cel-shaded art lives on outline — 'bold silhouette, chunky shapes, two-tone palette' steers proportions and flats that a toon shader can carry.",
      },
      {
        title: "Generate the mesh and palette",
        body: "You get real geometry with flat parameter colors — the unlit half of the look, honestly delivered.",
      },
      {
        title: "Export, then shade in your tool",
        body: "Export OBJ or FBX, apply a toon shader in Blender (Eevee), Unity, or Unreal — that is where cel shading actually happens.",
      },
    ],
    signalsTitle: "What makes a model read as cel-shaded",
    signals: [
      {
        title: "The silhouette carries everything",
        body: "With flat light and no textures, the outline IS the design — the geometry half you can genuinely steer here.",
      },
      {
        title: "Two-tone palette discipline",
        body: "A base color plus one shadow-tone per material is the cel habit; flat parameter colors hand that palette to your toon shader intact.",
      },
      {
        title: "Chunky, closed forms",
        body: "Toon shading punishes messy topology patches — closed primitives assemble cleanly, which keeps stepped lighting well-behaved.",
      },
      {
        title: "Outlines are a render pass",
        body: "Inked contours come from inverted-hull or post-process outlines — engine features, not mesh properties. Expect to add them downstream.",
      },
    ],
    recipesTitle: "Cel-shading-ready prompt recipes",
    recipes: [
      {
        title: "Toon-ready creature",
        prompt:
          "bold chunky creature silhouette, round body, stubby limbs, thick tail, solid navy base with cream belly contrast, clean closed forms for toon shading",
        note: "Phrase the prompt for the geometry: the toon look itself arrives when your DCC shader steps the light.",
      },
      {
        title: "High-contrast prop",
        prompt:
          "comic hero sword prop, chunky blade with simple guard, two-tone steel and gold palette, strong readable outline, no surface detail",
        note: "'No surface detail' keeps the mesh toon-friendly — detail belongs to the shadow steps, not the geometry.",
      },
      {
        title: "Figure for outlines",
        prompt:
          "stylized figure blockout with oversized jacket silhouette, slim legs, big boots, red and charcoal flats, exaggerated outline-friendly proportions",
        note: "The outline pass (inverted hull) needs a clean closed mesh — that is exactly what closed primitives assemble into.",
      },
      {
        title: "Scene chunk",
        prompt:
          "toon-ready streetlamp prop, thick curved post, oversized lamp head, deep green with warm amber lamp accent, simple sturdy forms",
        note: "Scene props are the safest cel-shaded starts: one silhouette, two colors, zero texture dependency.",
      },
    ],
    faqTitle: "Cel-shaded 3D generator FAQ",
    faq: [
      {
        q: "Does this clone render with cel shading?",
        a: "No. The viewport and poster use standard PBR-style materials with color, metalness, and roughness parameters. Cel shading is a stepped-light shader you apply in Blender, Unity, Unreal, or Godot after a real export.",
      },
      {
        q: "Then what exactly do I get here?",
        a: "The half of cel-shading that is geometry: bold silhouettes, chunky forms, and flat two-tone palettes — plus byte-verified OBJ/FBX/GLB exports that drop straight into a toon pipeline.",
      },
      {
        q: "Are the flat colors textures?",
        a: "No — they are per-part material parameters, which is actually convenient: a toon shader overrides shading while your palette rides along in the mesh.",
      },
      {
        q: "Can I add ink outlines here?",
        a: "Not in this clone. Outlines are inverted-hull or post-process effects your engine provides; the mesh you export is outline-ready geometry.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Anime", href: "/styles/anime" },
      { label: "Cartoon", href: "/styles/cartoon" },
      { label: "Hand-Painted", href: "/styles/hand-painted" },
      { label: "Animation", href: "/use-cases/animation" },
      { label: "Game Development", href: "/use-cases/game-development" },
    ],
    closingTitle: "Generate the silhouette; shade it in your DCC",
    closingBody:
      "The geometry half of cel-shading is real here — the toon step is one honest export away in your tool of choice.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Cel-Ready Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "fantasy",
    name: "Fantasy",
    title: "AI Fantasy 3D Model Generator",
    description:
      "Generate fantasy 3D models from a prompt — towers, crystals, rune props, and creature blockouts from real primitives, exportable in six formats for games and worlds.",
    subline:
      "Fantasy props are primitive-friendly by nature — spires are cones, crystals are extruded shards, towers are cylinders with character.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Fantasy props and architecture are a strong fit: the vocabulary of cones, cylinders, and shards is literally the medieval-fantasy skyline.",
      works: [
        "Architecture prompts steer real assemblies — towers, arches, bridges, and ruins from placed primitives.",
        "Palettes carry the mood — 'crystal teal', 'warped obsidian' land as flat parameter colors across parts.",
        "Game-ready exports are real: GLB for web scenes, OBJ/FBX for engines, STL for printed terrain props.",
      ],
      limits: [
        "No sculpted ornament — gargoyles, filigree, and runes-as-geometry are your DCC's detail pass.",
        "Materials are per-part parameters, so no glowing emissive maps or enchanted PBR sets; 'glow' reads as color only.",
        "Creature blockouts, not creatures — anatomy and claws beyond the primitive vocabulary are finishing work.",
      ],
    },
    stepsTitle: "Prompt to fantasy prop in three steps",
    steps: [
      {
        title: "Name the artifact",
        body: "Tower, crystal cluster, rune sword, wizard's desk — plus palette mood. 'Weathered stone with gold trim' is two parameter colors away.",
      },
      {
        title: "Generation raises the structure",
        body: "Cylinders stack into towers, cones cap them, extruded shards tilt into crystal beds — real placed geometry.",
      },
      {
        title: "Export into your world",
        body: "GLB for web worlds, OBJ/FBX for Unity or Unreal, STL for printed dungeon props — all from the previewed mesh.",
      },
    ],
    signalsTitle: "What makes a model read as fantasy",
    signals: [
      {
        title: "Verticality",
        body: "Fantasy architecture reaches — towers, spires, and staffs. Stacked vertical assemblies are the primitive vocabulary's home turf.",
      },
      {
        title: "Material contrast",
        body: "Stone-and-gold, wood-and-steel, bone-and-teal: two-material discipline reads as fantasy instantly via parameter colors.",
      },
      {
        title: "The shard language",
        body: "Crystals and rune-blades are angled extrusions — sharp, tilted, clustered. 'Shard cluster' wording steers exactly that geometry.",
      },
      {
        title: "Scale suggestion",
        body: "An oversized door, a giant's goblet — scale words steer real proportions and the fantasy read follows.",
      },
    ],
    recipesTitle: "Fantasy prompt recipes that work",
    recipes: [
      {
        title: "Crystal cluster",
        prompt:
          "fantasy crystal cluster, five tilted shards of varying heights from a stone base, translucent teal palette with pale tips, sharp angular forms",
        note: "'Translucent' steers the opacity parameter — a real material value, though not refractive glass.",
      },
      {
        title: "Wizard tower",
        prompt:
          "wizard tower, tall cylinder body with cone roof, small balcony ring, arched doorway block at base, weathered slate blue with warm gold window accents",
        note: "The arch is blocky-by-honest — curve-accurate arches are a DCC pass; silhouette carries it meanwhile.",
      },
      {
        title: "Rune sword",
        prompt:
          "fantasy rune sword, broad blade with simple crossguard and round pommel, dark steel with pale bone grip, clean strong silhouette",
        note: "Runes-as-texture are absent — the silhouette and two-material discipline carry the fantasy read here.",
      },
      {
        title: "Dungeon entrance",
        prompt:
          "dungeon entrance ruin, two thick broken pillars flanking a low arch block, mossy stone palette with one glowing teal rune cube, chunky weathered forms",
        note: "The 'glowing' cube is a flat bright parameter color — honest glow (emissive/bloom) happens in your engine.",
      },
    ],
    faqTitle: "Fantasy 3D model generator FAQ",
    faq: [
      {
        q: "Can it make fantasy creatures?",
        a: "As blockouts — a wyvern silhouette or golem frame from primitives is real and exportable; scales, wings-membrane detail, and claws are your DCC pass.",
      },
      {
        q: "Do crystals come out translucent?",
        a: "Transparency is a real per-part opacity parameter, so shards can be see-through — but there is no refraction or internal glow; that is render work downstream.",
      },
      {
        q: "Are the props game-ready?",
        a: "They are concept-grade assemblies of closed primitives with real exports (GLB, OBJ, FBX) — good for grayscaling a level or as base meshes; LODs and collision are engine-side.",
      },
      {
        q: "Can I print fantasy terrain?",
        a: "Yes — STL is real and sliced from the same geometry. Chunky ruins and crystal clusters print well; slender shards need supports.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Medieval", href: "/styles/medieval" },
      { label: "Gothic", href: "/styles/gothic" },
      { label: "Stylized", href: "/styles/stylized" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "WorldGen", href: "/features/worldgen" },
    ],
    closingTitle: "Your next artifact starts as one prompt",
    closingBody:
      "Raise the tower, cluster the shards, export the mesh — the fantasy loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Fantasy Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "flat",
    name: "Flat",
    title: "AI Flat 3D Model Generator",
    description:
      "Generate flat-style 3D models from a prompt — solid parameter colors, no textures needed, the style this clone's material system delivers most natively.",
    subline:
      "Flat design wants solid colors and clean forms — which is precisely what per-part parameter materials are. This is the most native style here.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Flat is the most native style in this clone: its materials are already flat parameter colors, so nothing about the look is faked.",
      works: [
        "Solid per-part colors — the exact flat-design primitive — are the material system's default behavior.",
        "Clean geometric forms with restrained palettes steer directly from the prompt.",
        "Web-first exports are real: GLB and USDZ carry flat colors into sites and AR with zero texture dependency.",
      ],
      limits: [
        "No gradients or duotone shading — each part is one solid color; subtle ramps are your DCC's render.",
        "No 2D illustration linework — this is flat 3D, geometric solids, not vector art.",
        "No texture-based patterns — dots, stripes, and checks are finishing texture work after export.",
      ],
    },
    stepsTitle: "Prompt to flat model in three steps",
    steps: [
      {
        title: "Pick the palette discipline",
        body: "Two to four solids, one accent. 'Mustard, cream, and one coral accent' — flat design is palette architecture.",
      },
      {
        title: "Generate the clean forms",
        body: "Simple primitives with real proportions; the flat palette assigns deterministically across parts.",
      },
      {
        title: "Export anywhere",
        body: "GLB for the web, USDZ for AR, OBJ/FBX for further work — flat colors travel in the mesh itself.",
      },
    ],
    signalsTitle: "What makes a model read as flat",
    signals: [
      {
        title: "One color per part",
        body: "The discipline of flat design is refusing gradients — and per-part parameter colors are exactly one-color-per-part by construction.",
      },
      {
        title: "Restraint",
        body: "Few forms, few colors, generous negative space. 'Minimal', 'restrained', 'simple' keep the spec honest to that.",
      },
      {
        title: "Geometric confidence",
        body: "Flat 3D celebrates the primitive — a cylinder IS a cylinder, unashamed. The vocabulary here has no shame to hide.",
      },
      {
        title: "Accent math",
        body: "One saturated accent against neutrals is the flat signature — palette wording places that accent on the part you name.",
      },
    ],
    recipesTitle: "Flat prompt recipes that work",
    recipes: [
      {
        title: "Flat icon object",
        prompt:
          "flat style desk plant, simple cylinder pot in terracotta, three rounded leaves in one green, cream background-friendly proportions, no extra detail",
        note: "'No extra detail' is a real steering phrase — it keeps the assembly to its essential parts.",
      },
      {
        title: "Duotone vehicle",
        prompt:
          "flat style city car, rounded box body, simple cylinder wheels, cream body with one coral roof accent, satin uniform finish",
        note: "The coral roof is one part carrying one parameter color — flat by construction, not by texture.",
      },
      {
        title: "Isometric-ish room prop",
        prompt:
          "flat style reading nook prop, boxy armchair, simple floor lamp with cone shade, side table, three-color palette of sage cream and walnut",
        note: "Prop sets share one palette — the flat read survives multiple objects because every part stays solid.",
      },
      {
        title: "Abstract mark",
        prompt:
          "flat abstract mark, one torus and one sphere in balanced composition, indigo and paper white only, museum-clean mood",
        note: "Marks like this export to GLB and sit on landing pages — flat colors need no textures, so nothing breaks.",
      },
    ],
    faqTitle: "Flat 3D model generator FAQ",
    faq: [
      {
        q: "Why is flat the most native style here?",
        a: "Because the material system builds MeshStandardMaterial parameters — solid color, metalness, roughness — with no texture stage at all. Flat design's core constraint is already the engine's default.",
      },
      {
        q: "Can I get subtle gradients or soft shading?",
        a: "Each part is one solid color; light does shade it naturally in the viewer, but painted gradients and duotone ramps are texture work in your DCC after export.",
      },
      {
        q: "Do flat colors survive export?",
        a: "Yes — GLB, GLTF, OBJ, FBX, STL, and USDZ all carry per-part colors in the mesh file itself. No texture folder to lose.",
      },
      {
        q: "Is this the same as the minimalist style page?",
        a: "They overlap — flat is about color treatment, minimalist about form count. This page leans palette; the minimalist page leans geometry.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Minimalist", href: "/styles/minimalist" },
      { label: "Abstract", href: "/styles/abstract" },
      { label: "Modern", href: "/styles/modern" },
      { label: "E-commerce", href: "/use-cases/e-commerce" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Your next flat model starts as one prompt",
    closingBody:
      "Pick the solids, generate the forms, export with colors baked into the mesh — the flattest honest loop here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Flat Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
  {
    slug: "gothic",
    name: "Gothic",
    title: "AI Gothic 3D Model Generator",
    description:
      "Generate gothic 3D models from a prompt — spires, lanterns, ironwork, and tombs from real primitives with dark palettes, exportable in six formats.",
    subline:
      "Gothic is dark palette plus vertical drama — spires are cones, ironwork is toruses and cylinders, and the mood is a palette decision.",
    status: "live",
    statusChip: "STEERABLE HERE",
    statusPanel: {
      summary:
        "Gothic's carriers — dark restrained palettes, sharp vertical silhouettes, chunky iron — are all real levers in this clone.",
      works: [
        "Spires, pinnacles, and pointed forms are the cone/cylinder vocabulary — genuinely its home turf.",
        "Dark palettes with pale-stone accents land as flat parameter colors across the assembly.",
        "Exports are real: OBJ/FBX for DCC finishing, GLB for web scenes, STL for printed terrain pieces.",
      ],
      limits: [
        "No carved tracery or filigree — the fine ornament that defines real gothic is a DCC detail pass.",
        "Pointed arches come out blocky — the vocabulary has no true arch curve; silhouette implies it.",
        "No candlelight glow or emissive maps — lanterns read as shape and color, and your engine lights them.",
      ],
    },
    stepsTitle: "Prompt to gothic piece in three steps",
    steps: [
      {
        title: "Set the mood and palette",
        body: "'Weathered black stone, cold iron, one bone-pale accent' — gothic is decided at palette level before geometry.",
      },
      {
        title: "Generate the structure",
        body: "Spires, lanterns, gates, and tombs assemble from placed primitives — the vertical drama is real geometry.",
      },
      {
        title: "Export and light it",
        body: "Take OBJ or FBX into your DCC and let real lighting finish the mood — exports carry the shapes and palette.",
      },
    ],
    signalsTitle: "What makes a model read as gothic",
    signals: [
      {
        title: "Vertical reach",
        body: "Everything gothic aspires upward — spires, pinnacles, staffs. Stacked verticals are primitive-native.",
      },
      {
        title: "Dark restrained palette",
        body: "Near-black stone, cold iron gray, one pale accent — three parameter colors that do the entire mood.",
      },
      {
        title: "Ironwork rhythm",
        body: "Gates and lanterns repeat bars, rings, and points — toruses and thin cylinders placed with rhythm.",
      },
      {
        title: "Weight",
        body: "Gothic forms sit heavy — chunky bases, thick walls. 'Massive', 'heavy', 'weathered' steer that honestly.",
      },
    ],
    recipesTitle: "Gothic prompt recipes that work",
    recipes: [
      {
        title: "Cathedral spire",
        prompt:
          "gothic cathedral spire, tall octagonal tapered tower with pointed cone cap, small corner pinnacles, weathered dark slate with pale stone trim, massive base",
        note: "Pinnacles are small cones flanking a big one — the repetition reads as ornament without any carving.",
      },
      {
        title: "Iron lantern",
        prompt:
          "gothic iron lantern, ring handle on top, narrow cage body with pointed finial, warm amber glass panel suggested as solid color, cold black iron frame",
        note: "The amber panel is a flat bright parameter color — honest glow is your engine's light, added after export.",
      },
      {
        title: "Cemetery gate",
        prompt:
          "gothic cemetery gate section, vertical iron bars with spear tips, two heavier flanking posts with pointed caps, weathered iron palette, sturdy rhythm",
        note: "Spear tips are small cones on cylinder bars — rhythm and repetition carry the ironwork read.",
      },
      {
        title: "Tomb marker",
        prompt:
          "gothic tomb marker, heavy slab base with pointed arched top, small carved-look cross suggested as simple geometry, mossy dark stone with one pale inlay band",
        note: "'Suggested as simple geometry' is the honest phrase — the cross is primitive-built, not carved.",
      },
    ],
    faqTitle: "Gothic 3D model generator FAQ",
    faq: [
      {
        q: "Can it produce real gothic arches and tracery?",
        a: "Not the carved curves — arches come out as blocky silhouettes and ornament as repetition of simple forms. The vertical drama and dark palette are real; the filigree is your DCC pass.",
      },
      {
        q: "Do lanterns actually glow?",
        a: "No emissive materials here — the glass reads as a flat bright color. Real glow comes from a light in your engine or DCC after export.",
      },
      {
        q: "Is it good for tabletop terrain?",
        a: "Yes — gates, tombs, and spires print well as chunky STL pieces, and the geometry is closed primitives, which slicers like.",
      },
      {
        q: "What palettes work best?",
        a: "Near-black plus cold gray plus one pale accent is the reliable gothic triad — all flat parameter colors, assigned per part by the palette field.",
      },
      {
        q: "How much does it cost?",
        a: "Generation is metered with granted credits: 1 credit for a standard task, 10 for agentic, your first task free — and pay-by-result engine tasks charge exactly 1 credit only at Confirm & Export.",
      },
    ],
    crossLinksTitle: "Explore more AI 3D styles",
    crossLinks: [
      { label: "Medieval", href: "/styles/medieval" },
      { label: "Fantasy", href: "/styles/fantasy" },
      { label: "Industrial", href: "/styles/industrial" },
      { label: "Game Development", href: "/use-cases/game-development" },
      { label: "WorldGen", href: "/features/worldgen" },
    ],
    closingTitle: "Your next spire starts as one prompt",
    closingBody:
      "Set the dark palette, raise the spire, export the mesh — the gothic loop runs end-to-end here.",
    closingCta: { label: "Open the studio", href: "/" },
    cta: { label: "Generate a Gothic Model", href: "/" },
    ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
  },
];
