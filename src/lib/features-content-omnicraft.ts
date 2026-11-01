/**
 * OmniCraft feature pages (reference sitemap slugs): 3d-mesh-editor,
 * 3d-model-search-engine, ai-hdri-generator, ai-image-enhancer,
 * ai-image-remix, ai-texture-generator, svg-to-3d-converter.
 *
 * Status mirrors the OmniCraft tool registry (src/lib/omnicraft.ts) —
 * live tools deep-link to their real /omnicraft/{slug} pages, the rest
 * describe the reference's feature and state plainly what this clone
 * ships instead.
 */
import type { FeaturePageDef } from "./features-types";
import { STUDIO_PATH } from "./studio-path";

export const OMNICRAFT_FEATURE_PAGES: FeaturePageDef[] = [
  {
    slug: "omnicraft/ai-hdri-generator",
    name: "AI HDRI Generator",
    title: "AI HDRI Generator and skybox creator",
    subline:
      "Turn a prompt or reference image into a seamless 360 skybox, preview it in the browser, and export PNG panoramas for lighting and backdrops.",
    status: "live",
    statusChip: "LIVE — LOCAL & DETERMINISTIC",
    statusNote:
      "This clone's HDRI generator is real and runs entirely in your browser: a prompt-seeded procedural engine (same prompt → same sky, forever), with time/weather/palette keywords pinning the result and sliders always winning. Night skies genuinely darken, stars have size variety, clouds come from seam-free periodic noise, and a dropped reference image's palette is extracted in-browser. 2K and 4K PNG downloads are both free here — the reference gates its 8K pack behind a credit unlock; this clone ships PNG up to 4K and does not fake the .exr/depth tier.",
    cta: { label: "Create an HDRI Skybox", href: "/workspace/omnicraft/hdri" },
    ctaSecondary: { label: "See the toolbag", href: "/workspace/omnicraft" },
    stepsTitle: "Prompt to Skybox in Three Steps",
    stepsIntro: "Everything runs locally — describe a world or drop an image, spin the preview, export.",
    steps: [
      {
        title: "Type a Prompt or Drop an Image",
        body: "Describe the HDRI in the tool's prompt box — time of day, weather, palette — or drag in any reference image and let its extracted colors drive the sky.",
      },
      {
        title: "Spin the 360° Preview",
        body: "The panorama loads onto a proper panorama sphere (mirrored so azimuths match reality) with the camera aimed at the sun — drag to look around, and check lighting from any angle.",
      },
      {
        title: "Export PNG Panoramas",
        body: "Download 2K or 4K equirectangular PNGs, both free, straight from the browser — deterministic seeds mean you can always regenerate the exact same sky.",
      },
    ],
    benefitsTitle: "Why Use This Clone's HDRI Generator?",
    benefitsIntro: "The honest strengths of the procedural engine that actually runs here.",
    benefits: [
      {
        title: "Deterministic Seeds",
        body: "Same prompt → same sky, forever — reproducible environments for pipelines and versioned scenes.",
      },
      {
        title: "Physical Night Behavior",
        body: "As the sun drops below the horizon the palette genuinely darkens and a star field with size variety appears — verified, not painted on.",
      },
      {
        title: "Local and Private",
        body: "Generation happens in your browser; reference images are never uploaded.",
      },
      {
        title: "Palette from Any Image",
        body: "Drop a photo and its 4-bit-bucketed palette pins the sky's colors — in-browser quantization, no server round-trip.",
      },
      {
        title: "Free Exports",
        body: "2K and 4K PNG downloads cost nothing here; the reference's 8K/HDR/depth pack is documented as not faked.",
      },
    ],
    useCasesTitle: "AI Skyboxes for Every 3D Pipeline",
    useCasesIntro: "Where procedural skies pay off.",
    useCases: [
      {
        tag: "Game development",
        title: "Game Worlds",
        body: "Wrap levels in a consistent sky, block in mood and time of day before final art lands.",
      },
      {
        tag: "E-commerce renders",
        title: "Product & Studio Renders",
        body: "Surround products with outdoor backdrops and consistent horizons for render lighting.",
      },
      {
        tag: "VR/AR",
        title: "VR & Immersive Spaces",
        body: "A seamless 360 panorama is the fastest way to give a VR scene a horizon — previewed in the browser exactly the way users will look around it.",
      },
      {
        tag: "Concept art",
        title: "Concept & Look Development",
        body: "Explore lighting moods in minutes, regenerate variations on the same prompt, and keep seeds for the directions you like.",
      },
    ],
    techCards: {
      title: "The Engine Behind the Skies — What Actually Runs Here",
      intro:
        "No AI image model is involved: this generator is a deterministic procedural engine (src/lib/hdri.ts), and these are its real stages — the same facts the status panel above states, card by card.",
      cards: [
        {
          title: "Prompt → Parameters, by Keyword",
          body: "The prompt is parsed for time-of-day, weather, and palette keywords that pin real engine parameters — a time word sets the sun's elevation, a weather word moves cloud density and sharpness, palette words swap the sky's three gradient colors. Unmatched dimensions fall back to seeded values, never random ones.",
        },
        {
          title: "Seeded, Reproducible Skies",
          body: "The prompt string hashes through FNV-1a into a mulberry32 PRNG that fills every unpinned parameter — so the same prompt has produced the identical sky on every run since the tool shipped, and always will. Versioned scenes can pin an environment by words alone.",
        },
        {
          title: "Seam-Free Periodic Noise Clouds",
          body: "Clouds come from periodic value noise summed in fractal octaves (fBm) that wraps exactly at the panorama seam — no visible stitch line at the 360° joint, verified rather than hoped. Density and sharpness respond to both the prompt's weather words and the sliders.",
        },
        {
          title: "Physical Night and Image Palettes",
          body: "As the sun drops below the horizon the gradient genuinely deepens — zenith more than horizon, so twilight keeps its glow band — and a size-varied star field appears. Dropped reference images get real in-browser analysis: colors are bucketed at 4 bits per channel and assigned to zenith, horizon, and sun tint by luma. Image analysis, not AI.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "About this clone's generator, honestly.",
    faq: [
      {
        q: "What is the AI HDRI Generator here?",
        a: "A browser tool in the OmniCraft toolbag that turns a text prompt or reference image into a seamless 360° panorama via a deterministic procedural engine, previews it as a skybox in a live 3D viewer, and exports PNG panoramas.",
      },
      {
        q: "What inputs does it accept?",
        a: "A prompt (with time/weather/palette keywords doing real pinning), optional style notes, or any dropped reference image — the image's palette is extracted locally.",
      },
      {
        q: "How deterministic is it?",
        a: "Completely: the prompt seeds an FNV-1a hash and mulberry32 PRNG, so the same prompt yields the identical sky on every regeneration, forever.",
      },
      {
        q: "What exactly is in the download?",
        a: "Equirectangular PNG panoramas at 2K and 4K, standard 2:1 aspect ratio. The reference's 8K zip with hdr.exr and depth.png is not reproduced — and this page won't pretend it is.",
      },
      {
        q: "Is it free?",
        a: "Yes — generation, preview, and both PNG tiers are free in this clone. The reference charges at most 1 credit to unlock its 8K pack; that tier simply doesn't exist here.",
      },
      {
        q: "Can I check reflections before exporting?",
        a: "Yes — the preview uses the canonical panorama sphere mapping with the camera aimed at the sun, so the lighting you inspect is the lighting you get.",
      },
      {
        q: "What if I don't like the result?",
        a: "Adjust the prompt or sliders (sliders always win over keywords) and regenerate — no cost, no upload, instant.",
      },
      {
        q: "Is there a community gallery or sky filters here?",
        a: "No — the reference's page advertises a gallery of shared HDRIs with filters, and that surface is not reproduced in this clone. Your skies regenerate deterministically from their prompts instead: keep the prompt, keep the sky.",
      },
      {
        q: "How is this different from the reference's 8K pack?",
        a: "The reference unlocks an 8K PNG plus hdr.exr and depth.png behind a credit. This clone exports 2K and 4K equirectangular PNGs, both free, and does not ship the .exr or depth tiers — the gap is stated, not papered over.",
      },
    ],
    crossLinksTitle: "Explore more OmniCraft tools",
    crossLinksIntro: "The other browser tools in the toolbag.",
    crossLinks: [
      { label: "SVG to 3D Converter", href: "/features/omnicraft/svg-to-3d-converter" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Ready to Build Your Own Sky?",
    closingBody: "Type one sentence, spin the sphere, and export the panorama — all locally.",
    closingCta: { label: "Open the HDRI Generator", href: "/workspace/omnicraft/hdri" },
    group: "omnicraft",
    indexBlurb: "Live: deterministic procedural skyboxes, PNG to 4K, fully local.",
  },
  {
    slug: "omnicraft/svg-to-3d-converter",
    name: "SVG to 3D Converter",
    title: "SVG to 3D converter — vectors into models",
    subline:
      "Drop an SVG, get an extruded 3D model: depth, bevel, and curve control with live colors, previewed in the browser and exported as GLB.",
    status: "live",
    statusChip: "LIVE — LOCAL",
    statusNote:
      "This is the real 'Vector to 3D' tool from this clone's toolbag under its feature-page name: SVGLoader parses your file, ExtrudeGeometry builds the solid, and depth/bevel/curve sliders reshape it live. The preview streams the exact GLB the downloads serve — normalized (centered, uniformly scaled) by translation rather than mutation, a distinction the tests pin down.",
    cta: { label: "Convert an SVG", href: "/workspace/omnicraft/vecto3d" },
    ctaSecondary: { label: "See the toolbag", href: "/workspace/omnicraft" },
    stepsTitle: "Vector to Model in Three Steps",
    stepsIntro: "The whole path runs locally — no upload, no server.",
    steps: [
      {
        title: "Drop Your SVG",
        body: "Any SVG with paths and shapes parses through the same SVGLoader the studio trusts; fill colors carry into the material palette.",
      },
      {
        title: "Tune Depth, Bevel, and Curves",
        body: "Sliders reshape the extrusion live — depth for solidity, bevel for edge character, curve resolution for smoothness.",
      },
      {
        title: "Preview and Export GLB",
        body: "The 3D preview shows the exact bytes the download serves — normalization centers and uniformly scales the model so exports match the preview one-to-one.",
      },
    ],
    benefitsTitle: "Why Convert Vectors to 3D Here?",
    benefitsIntro: "What the local pipeline actually gives you.",
    benefits: [
      {
        title: "WYSIWYG Exports",
        body: "The preview streams the exact GLB the download button serves — tested byte-for-byte, not eyeballed.",
      },
      {
        title: "Live Sliders",
        body: "Depth, bevel, and curve resolution reshape the solid in real time; undo is just dragging back.",
      },
      {
        title: "Colors Travel",
        body: "SVG fills become material colors in the model, so brand assets keep their palette.",
      },
      {
        title: "Local and Private",
        body: "Your SVG never leaves the browser — the tool runs entirely client-side.",
      },
    ],
    useCasesTitle: "Who Converts SVGs to 3D?",
    useCasesIntro: "Where extruded vectors shine.",
    useCases: [
      {
        tag: "Branding",
        title: "Logos into 3D",
        body: "Turn a logo into an extruded sign or badge for motion graphics and product shots.",
      },
      {
        tag: "3D Printing",
        title: "Badge and Keychain Making",
        body: "Vector art with depth makes clean printable solids — export via the Format Convertor to STL.",
      },
      {
        tag: "Game development",
        title: "Stylized Props",
        body: "Flat art assets become chunky game props with bevel character.",
      },
    ],
    techCards: {
      title: "Extrusion Depth and Bevel You Control — the Real Sliders",
      intro:
        "The reference's controls section, mirrored by this tool's actual slider set — every range below is the engine's real clamp, not marketing rounding.",
      cards: [
        {
          title: "Geometry",
          body: "Depth runs 0.05 to 4 in 0.05 steps for solidity; bevel size runs 0 to 0.5 in 0.01 steps and switches off entirely for hard extrusions; curve detail sets path tessellation from 4 to 32 segments for smoothing intricate splines. Every slider reshapes the solid live — undo is dragging back.",
        },
        {
          title: "Materials",
          body: "Each SVG path's fill color carries into its material, and a six-swatch palette restyles the whole model in one click. Flat-color materials by design — no texture synthesis is claimed, because none runs: the color you pick is the color the exporter writes.",
        },
        {
          title: "Lighting",
          body: "The preview runs the studio's standard viewer lighting so forms read clearly while you tune. This clone ships no dedicated lighting rig for vector extrusions, and this card says so instead of pretending — form and color are what you control; illumination is presentation.",
        },
        {
          title: "Export",
          body: "All six of the pipeline's standard formats, through the same exporter every studio model flows through. Normalization centers and uniformly scales the solid by translation rather than mutation — so the previewed model and the downloaded bytes agree exactly, a distinction the tests pin.",
        },
      ],
    },
    exportTypes: {
      title: "Every Format the Exporter Serves",
      intro:
        "The download row offers exactly the pipeline's standard six — the same list the API page documents, generated from the same constant by the same exporter.",
      formats: [
        { name: "glb", note: "The default preview format — the exact bytes the 3D view streams while you tune." },
        { name: "gltf", note: "The JSON twin for pipelines that diff or post-process the document." },
        { name: "fbx", note: "DCC interchange for Maya, Blender, Unity, and Unreal, hierarchy intact." },
        { name: "obj", note: "The plain-triangle classic with its material sidecar — the safest hand-off." },
        { name: "stl", note: "Straight to slicing: extruded vector art is printable by construction." },
        { name: "usdz", note: "Apple's AR package — drop the extruded solid into an iOS quick-look scene." },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "About this clone's converter.",
    faq: [
      {
        q: "What does the converter produce?",
        a: "An extruded solid from each SVG path — with per-path colors, controllable depth and bevel, exported as standard GLB.",
      },
      {
        q: "Does the preview match the export?",
        a: "Exactly — the preview streams the same GLB bytes the download serves, and the tests assert it.",
      },
      {
        q: "Is my file uploaded anywhere?",
        a: "No — parsing, extrusion, and export all run in your browser; the SVG never leaves your machine.",
      },
      {
        q: "What about complex multi-path SVGs?",
        a: "Each path extrudes with its fill color; curve resolution is tunable for smoothing intricate splines.",
      },
      {
        q: "Can I print the result?",
        a: "Yes — take the GLB through the Format Convertor to STL for slicing, or export STL directly from the tool's own download row.",
      },
      {
        q: "What do the sliders actually control?",
        a: "Depth (0.05–4) sets how far the vector extrudes, bevel size (0–0.5) rounds the edge character and can be disabled entirely, and curve detail (4–32) sets how finely splines are tessellated — every value in the engine's real clamp range.",
      },
      {
        q: "Which export formats does the converter serve?",
        a: "All six standard formats — GLB, GLTF, FBX, OBJ, STL, and USDZ — through the same exporter pipeline as studio models, with the preview showing the exact GLB the download serves.",
      },
      {
        q: "Does it cost credits?",
        a: "No — the tool is entirely local and free; nothing about it touches the wallet. The reference's 'Free to All' pitch is one point where the clone matches it exactly.",
      },
    ],
    crossLinksTitle: "Explore more OmniCraft tools",
    crossLinksIntro: "The other browser tools in the toolbag.",
    crossLinks: [
      { label: "AI HDRI Generator", href: "/features/omnicraft/ai-hdri-generator" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Vectors Were Never Flat",
    closingBody: "Drop an SVG, add depth, export GLB — locally in under a minute.",
    closingCta: { label: "Open Vector to 3D", href: "/workspace/omnicraft/vecto3d" },
    group: "omnicraft",
    indexBlurb: "Live: SVG in, extruded GLB out — local and byte-exact.",
  },
  {
    slug: "omnicraft/ai-texture-generator",
    name: "AI Texture Generator",
    title: "AI Texture Generator",
    subline:
      "The reference paints textures onto uploaded models with generative AI. This clone does not wire a texture model — this page states the honest equivalent.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "Texture generation needs a generative image model applied to mesh UVs — this clone wires none. The honest equivalent that exists here: the studio's material redo (neural engine, in-browser re-paint of task palettes) and the planned vertex colors every generated task carries. If you need painted PBR textures, that feature belongs to the reference's toolbag, not this clone.",
    cta: null,
    ctaSecondary: { label: "See the toolbag", href: "/workspace/omnicraft" },
    stepsTitle: "How the Reference's Texture Generator Works",
    stepsIntro: "The product this page documents the absence of.",
    steps: [
      {
        title: "Upload a Model",
        body: "The reference's tool accepts your mesh and reads its UV layout.",
      },
      {
        title: "Prompt the Texture",
        body: "A text prompt describes the surface — material, wear, style — and the generative model paints it onto the UV map.",
      },
      {
        title: "Download Textured Mesh",
        body: "The output returns as a textured mesh ready for engines and renderers.",
      },
    ],
    benefitsTitle: "What Generative Texturing Adds",
    benefitsIntro: "Why the reference ships it — and what exists here instead.",
    benefits: [
      {
        title: "Prompt-Driven Surfaces",
        body: "Material direction in words ('rusted iron, oil stains') instead of hours in a substance tool.",
      },
      {
        title: "UV-Aware Application",
        body: "Paint lands on the mesh where it belongs — the hard part of naive image projection.",
      },
      {
        title: "The Honest Local Path",
        body: "This clone's generated models already carry planned palettes and materials, and the studio's material redo repaints a finished task without regenerating geometry.",
      },
      {
        title: "What Does Not Exist Here",
        body: "No texture-painting model, no UV painting on uploaded meshes — and no mockup pretending otherwise.",
      },
    ],
    promptExamples: {
      title: "One Model, Any Material Direction — the Reference's Demo Looks",
      intro:
        "The reference's texture page sells material direction with six named looks (Retro Tin Robot, Carved Pumpkin, Painted Wood, Sci-Fi Robot, Blue Toy Robot, Sci-Fi Armor). These cards mirror that section's shape — and none of them paints anything here.",
      cards: [
        {
          prompt: "retro tin robot, brushed metal panels with worn edges and riveted seams",
          note: "The reference's material direction: prompt in, painted PBR out. Not here — no texture-painting model is wired into this clone, and this card will not pretend otherwise. The nearest real path is generating with a metal-leaning palette in the studio and refining it with material redo.",
        },
        {
          prompt: "carved pumpkin, matte organic surface with cut marks and candle glow",
          note: "On the reference, this prompt repaints a mesh's UVs in minutes. Here the honest equivalent is picking palette words at generation time — the studio plans materials into the model — and accepting flat-color surfaces instead of painted detail.",
        },
        {
          prompt: "sci-fi armor, gunmetal plating with panel lines and subtle decals",
          note: "Nothing in this clone turns these words into a texture; that transformation belongs to the reference's generative stack. What such words DO influence here is the palette and material planning of a freshly generated model — never a repaint of an uploaded mesh.",
        },
      ],
    },
    useCasesTitle: "Who Uses a Texture Generator",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Game development",
        title: "Rapid Material Passes",
        body: "Block in believable surfaces on greybox assets fast.",
      },
      {
        tag: "This clone",
        title: "Material Redo Instead",
        body: "The studio's redo path repaints a generated task's palette in-browser — the closest real capability.",
      },
      {
        tag: "Product renders",
        title: "Finish Variants",
        body: "The reference iterates finishes (matte, brushed, patina) on the same mesh.",
      },
    ],
    techCards: {
      title: "The Reference's Production Controls — Stated as Its Features",
      intro:
        "The reference's page carries five control sections (production controls, Gen-2.5 speed presets, fine-tuning, version history, pack export). This clone ships none of them — these cards document what is being measured against, and where the local boundary runs.",
      cards: [
        {
          title: "Production Controls, Not a Black Box",
          body: "The reference exposes strength sliders and masking so art direction survives automation. Here there is no texture generation to control — the honest levers are the studio's generation-time palette planning and material redo on finished tasks, both stated on this page.",
        },
        {
          title: "Native Speed Presets",
          body: "The reference's Gen-2.5 engine advertises speed tiers per texture generation. This clone's material work is synchronous and browser-local — material redo applies instantly — so a speed preset would be solving a problem this side does not have.",
        },
        {
          title: "Version History Built In",
          body: "On the reference, every texture iteration is kept and diffable. The closest real thing here is the task history: every generated model stays openable, re-exportable, and re-paintable from the studio rail — but uploaded meshes have no version thread at all.",
        },
        {
          title: "Pack Exactly What You Need",
          body: "The reference exports curated texture packs per model. This clone's exports carry the model's planned materials and vertex colors in GLB/GLTF — a real, smaller thing — and generated PBR map packs are not among them, stated plainly.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can this clone paint textures on my model?",
        a: "No. The toolbag lists Texture Generator as not-in-clone with this exact reason; there is no generative texture model wired here.",
      },
      {
        q: "What can I do instead?",
        a: "Generate with the studio (planned palettes and materials arrive with the model), or use material redo to repaint a finished task.",
      },
      {
        q: "Do exports here include materials?",
        a: "Yes — GLB/GLTF exports carry the planned materials and vertex colors the viewer shows.",
      },
      {
        q: "Will texture generation be added?",
        a: "Only if it can be real. Until then this page is the truthful record of the gap.",
      },
      {
        q: "What are the reference's named material directions?",
        a: "Six demo looks on its page — Retro Tin Robot, Carved Pumpkin, Painted Wood, Sci-Fi Robot, Blue Toy Robot, and Sci-Fi Armor — each a prompt-painted PBR pass. They are the reference's demo content, documented here as its feature, not as a local capability.",
      },
      {
        q: "Does material redo count as texturing?",
        a: "No — redo repaints a generated task's palette in-browser without regenerating geometry. It is a real color-material lever, but it is not prompt-painted PBR on arbitrary UVs, and that distinction is the whole point of this page.",
      },
      {
        q: "Do any exports here include texture maps?",
        a: "No. GLB and GLTF exports carry planned materials and vertex colors — colors on vertices, not painted image maps. No PBR channel sets ship from this clone today.",
      },
      {
        q: "Why keep a page for a feature that does not exist here?",
        a: "Nav parity with honesty: the reference's toolbag lists Texture Generator, so this route resolves — to the truth about what runs here and the nearest real paths, never to a mockup that fakes the paint.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real material-adjacent surfaces here.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Materials Yes, Painted Textures No",
    closingBody: "Generated models here carry real materials and palettes — texture painting stays reference-only.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "omnicraft",
    indexBlurb: "Reference-only: generative UV painting; studio material redo is the equivalent.",
  },
  {
    slug: "omnicraft/ai-image-enhancer",
    name: "AI Image Enhancer",
    title: "AI Image Enhancer",
    subline:
      "The reference upscales and enhances reference images before they feed generation. This clone passes images through at uploaded fidelity — this page is the honest record.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "Image enhancement needs a generative upscaler, which this clone does not wire: uploads reach the generation pipeline at exactly the fidelity you provide. If you need upscaling before generation, enhance the image elsewhere first — the studio will consume it happily. This page exists so the toolbag's five-tool gap list stays linkable and truthful.",
    cta: null,
    ctaSecondary: { label: "See the toolbag", href: "/workspace/omnicraft" },
    stepsTitle: "What the Reference's Enhancer Does",
    stepsIntro: "The product this page documents the absence of.",
    steps: [
      {
        title: "Upload a Low-Res Image",
        body: "Small, soft, or noisy reference images go in — old catalog shots, phone photos, thumbnails that would otherwise be unusable.",
      },
      {
        title: "Generative Upscale",
        body: "The reference's model reconstructs detail rather than merely interpolating pixels.",
      },
      {
        title: "Enhanced Reference Out",
        body: "The sharper image feeds image-to-3D with more signal to caption and model.",
      },
    ],
    benefitsTitle: "Why Enhancement Sits Before Generation",
    benefitsIntro: "The reference's reasoning — and this clone's stance.",
    benefits: [
      {
        title: "Better Inputs, Better Models",
        body: "Generation quality tracks reference quality; enhancement raises the ceiling before the engine runs.",
      },
      {
        title: "Detail Reconstruction",
        body: "Generative upscale invents plausible detail — different in kind from sharpening filters.",
      },
      {
        title: "This Clone's Stance",
        body: "Pass-through at uploaded fidelity: no silent resampling, no fake enhancement step, no pretend upscaler.",
      },
      {
        title: "The Workaround",
        body: "Enhance images with a dedicated tool first, then upload — the pipeline accepts any resolution you bring.",
      },
    ],
    useCasesTitle: "Who Uses an Image Enhancer",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Image to 3D",
        title: "Salvaging Small References",
        body: "Old catalogs and thumbnails become usable generation inputs.",
      },
      {
        tag: "This clone",
        title: "Pre-Enhance Elsewhere",
        body: "Bring already-sharp images; the captioning and generation here will meet them at full quality.",
      },
      {
        tag: "Archives",
        title: "Legacy Asset Rescue",
        body: "The reference revitalizes archive scans for modern pipelines.",
      },
    ],
    techCards: {
      title: "The Reference's Enhancement Controls — the Feature Set This Clone Declines to Fake",
      intro:
        "The reference's page documents its control set twice over under two headings (one of which reads 'Why Choose Hyper3D for AI Video Generation?' on the image enhancer page — a template quirk of the reference itself, faithfully noted). None of it runs here; the cards below record what is being measured against.",
      cards: [
        {
          title: "Three Output Tiers",
          body: "The reference's enhancer upscales to tiered resolutions with a credit cost per tier. This clone's uploads pass through at exactly the fidelity you provide — no tiers, no upscale, no charge — because no upscaler model is wired here at all.",
        },
        {
          title: "Exact Ranges, Sane Defaults",
          body: "The reference states its supported input and output ranges explicitly, which is good practice and worth mirroring as documentation. The equivalent honest range statement here: any resolution you upload is accepted and consumed unmodified at that resolution, in either direction.",
        },
        {
          title: "Multi-Image Sidebar Queue",
          body: "A batch surface for enhancing several references in sequence — a real workflow feature of the reference's tool. This clone has no enhancement queue because it has no enhancement step; images flow straight into captioning and generation as uploaded.",
        },
        {
          title: "Part of the OmniCraft Suite",
          body: "True on the reference, and true here too — with a different toolbox: this clone's OmniCraft toolbag is four live local tools (HDRI, Vector to 3D, Model Viewer, Format Convertor), and this page is one of the five stated gaps between the two toolbags.",
        },
        {
          title: "Real Detail Recovery, Not Just Resizing",
          body: "The reference's core claim: its model reconstructs plausible detail instead of interpolating pixels. That is generative upscaling, and it is precisely the capability this clone does not have — interpolating and calling it enhancement would be the dishonest version of this page.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Does this clone upscale images?",
        a: "No — and it never silently downsamples either. Images pass through at exactly the uploaded fidelity.",
      },
      {
        q: "Can I still use low-res references?",
        a: "Yes; the captioner reads them and generation proceeds — just with less signal than a sharper image would carry.",
      },
      {
        q: "Is there any image processing at all here?",
        a: "One real piece: the HDRI generator extracts palettes from dropped images locally. That is color quantization, not enhancement.",
      },
      {
        q: "Where is the gap acknowledged in the app?",
        a: "On the OmniCraft toolbag page — the Image Enhancer card carries this exact note.",
      },
      {
        q: "What are the reference's output tiers?",
        a: "Its enhancer serves tiered upscale resolutions with per-tier credit pricing. Here there are no tiers because there is no upscaler — uploads keep exactly the resolution you bring, and nothing is silently resampled in either direction.",
      },
      {
        q: "Why does the reference's page mention video generation?",
        a: "Because its own section heading does — 'Why Choose Hyper3D for AI Video Generation?' appears on the image enhancer page in the reference's template. It is the reference's quirk, recorded here for fidelity; this clone's enhancer gap and video gap are separate pages.",
      },
      {
        q: "Does pass-through hurt generation quality?",
        a: "It removes a convenience, not a guarantee: the captioner reads whatever fidelity you upload. If a reference is too soft, enhance it with a dedicated tool first — the studio will consume the sharper file happily.",
      },
      {
        q: "Is enhancement on the roadmap?",
        a: "Only in the same sense as every gap on this site: if a real upscaler ever ships, this page's status flips with it. Until then the page is the truthful record, per the toolbag's honesty contract.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real image-adjacent surfaces here.",
    crossLinks: [
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "AI Image Remix", href: "/features/omnicraft/ai-image-remix" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Your Pixels, Unmangled",
    closingBody: "No upscaler here — but nothing quietly degrades your references either.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "omnicraft",
    indexBlurb: "Reference-only: generative upscaling; uploads pass through at full fidelity.",
  },
  {
    slug: "omnicraft/ai-image-remix",
    name: "AI Image Remix",
    title: "AI Image Remix",
    subline:
      "The reference re-imagines an image with a prompt — style transfer as a tool. This clone ships no image-to-image model, and this page says so.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "Image remix is a pure image-to-image feature of the reference's separate toolbag: reference in, prompt applied, re-imagined image out. No honest local equivalent exists in this clone — the image surfaces here read images (captioning, palette extraction) rather than repaint them. When a generative image model joins this clone, so will this page's status; until then it stays truthful.",
    cta: null,
    ctaSecondary: { label: "See the toolbag", href: "/workspace/omnicraft" },
    stepsTitle: "What the Reference's Remix Does",
    stepsIntro: "The product this page documents the absence of.",
    steps: [
      {
        title: "Reference Image In",
        body: "Any image seeds the composition — a product photo, a location shot, or concept art you own.",
      },
      {
        title: "Prompt Applied",
        body: "A text direction re-imagines the image — style, era, setting — while keeping the subject recognizable.",
      },
      {
        title: "Remixed Image Out",
        body: "The output serves as a fresh reference for further generation or direct use.",
      },
    ],
    benefitsTitle: "Why Remix Sits in a 3D Toolbag",
    benefitsIntro: "The reference's reasoning.",
    benefits: [
      {
        title: "Reference Variation",
        body: "One good photo becomes a family of directions — night version, stylized version, era swap.",
      },
      {
        title: "Pre-Generation Exploration",
        body: "Find the art direction in 2D (cheap) before committing to 3D (expensive).",
      },
      {
        title: "What Exists Here",
        body: "Nothing image-to-image. The HDRI engine re-imagines skies from prompts, but that is generation, not remixing your image.",
      },
      {
        title: "What Stays Honest",
        body: "No mockup, no placeholder canvas pretending to remix — the toolbag card states the gap plainly.",
      },
    ],
    promptExamples: {
      title: "Three References, One Prompt, One Scene — the Reference's Remix Shape",
      intro:
        "The reference's remix takes up to three images and a prompt that points at each. These cards mirror that grammar — as the description of a feature that does not run here.",
      cards: [
        {
          prompt: "put the cabin from @1 into the snowy ridge of @2, keep @3's dusk lighting",
          note: "A faithful example of the reference's multi-reference grammar — and nothing like it executes here. No image-to-image model is wired into this clone; the honest neighbors are prompt polish for wording and ControlNet constraints for shaping the next generation.",
        },
        {
          prompt: "re-imagine @1 as a hand-painted style guide cover, keep the composition",
          note: "On the reference, this returns a re-imagined bitmap in seconds. Here it returns nothing — there is no repaint path of any kind. The closest real transformation of an image this clone offers is the HDRI tool's palette extraction, which reads colors and writes no new image.",
        },
        {
          prompt: "merge @1's product with @2's studio backdrop, cleaner shadows than either",
          note: "Reference-only capability, stated as such: merging two images into a new one is generative image work this clone does not do. What you can do is bring an already-remixed image in as a generation reference — the pipeline accepts any image you own.",
        },
      ],
    },
    useCasesTitle: "Who Uses Image Remix",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Art direction",
        title: "Direction Families",
        body: "Generate night/rain/retro variants of one location photo for lookdev.",
      },
      {
        tag: "This clone",
        title: "Prompt Direction Instead",
        body: "The studio's prompt polish and ControlNet constraints steer generation directly — the closest real lever.",
      },
      {
        tag: "Marketing",
        title: "Ad Variants",
        body: "The reference spins one hero shot into campaign variants.",
      },
    ],
    techCards: {
      title: "Real Controls Behind Every Remix — the Reference's, Attributed",
      intro:
        "Four control cards anchor the reference's remix page. None of the four runs here — each card says what it is on the reference and what the local truth is instead.",
      cards: [
        {
          title: "Multi-Reference Gen Mode",
          body: "The reference composes from up to three input images under one prompt, with per-image addressing. This clone's generation reads one reference image at a time — image-to-3D captions it — and there is no multi-image composition mode to document.",
        },
        {
          title: "Conversational Edit Mode",
          body: "On the reference, follow-up prompts refine the remix in a conversation. The studio here has a real prompt-polish step before generation, but no conversational editing of any output — bitmap or mesh — exists in this clone.",
        },
        {
          title: "Turbo Gen References",
          body: "A fast-draft tier for cheap iteration on the reference's side of the fence. The nearest real speed story here is the fast engine track on 3D generation with its own watchdog fallback — a different feature, honestly labeled as such.",
        },
        {
          title: "3D-Ready Style Presets",
          body: "The reference ships presets tuned so remixed images work as generation references. This clone's style steering lives in the styles tree — real prompt recipes with honest status chips — rather than image presets feeding a repaint loop that does not exist.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can this clone remix images?",
        a: "No — image-to-image generation is not wired here. This is one of the five toolbag gaps stated on the OmniCraft page.",
      },
      {
        q: "What is the closest real thing?",
        a: "Prompt-driven HDRI generation (new skies from words) and prompt polish (rewriting ideas) — different mechanics, honest neighbors.",
      },
      {
        q: "Can I remix elsewhere and bring the result here?",
        a: "Yes — any remixed image uploads as a generation reference like any other image.",
      },
      {
        q: "Why does this page exist?",
        a: "Link parity with honesty: the nav lists AI Image Remix, so the route resolves to the truth.",
      },
      {
        q: "What is the reference's remix grammar?",
        a: "Up to three reference images plus one prompt that addresses them individually — merge backdrops, swap styles, keep subjects. The prompt cards above mirror it so the shape of the missing feature is documented, not just its absence.",
      },
      {
        q: "Could the HDRI tool remix my photo?",
        a: "No — the HDRI generator reads a dropped image's palette to seed a procedural sky; it never outputs a modified version of your image. Reading pixels and repainting them are different capabilities, and only the first exists here.",
      },
      {
        q: "What happens if I upload a remixed image?",
        a: "Exactly what happens with any image: the captioner reads it and image-to-3D models from it. Remixing elsewhere and generating here is a fully supported path — the nearest real workflow this page can offer.",
      },
      {
        q: "How many toolbag gaps are there?",
        a: "Five stated gaps between the reference's toolbag and this clone's: Texture Generator, Image Enhancer, Image Remix, Rodin Search, and the Mesh Editor's hosted suite. Each has an honest page like this one; the four live tools have real tool pages.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real neighbors of remixing.",
    crossLinks: [
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "AI Image Generator", href: "/features/ai-image-generator" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Remix Stays Reference-Only",
    closingBody: "The levers that ARE real here: prompt polish, ControlNet constraints, and prompt-seeded skies.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "omnicraft",
    indexBlurb: "Reference-only: prompt-driven image-to-image; no local equivalent.",
  },
  {
    slug: "omnicraft/3d-model-search-engine",
    name: "3D Model Search Engine",
    title: "3D Model Search Engine",
    subline:
      "The reference's Rodin Search indexes models across the web. This clone has no web-wide index — this page records the gap and points at what search exists here.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "Rodin Search is a web-wide 3D model index — nothing in this clone honestly reproduces it. The search that DOES exist here is over your own work: the studio's history rail and task list let you find and reopen every task you have generated. This page keeps the reference's feature visible without pretending a global index runs here.",
    cta: null,
    ctaSecondary: { label: "See your task history", href: STUDIO_PATH },
    stepsTitle: "What the Reference's Search Engine Does",
    stepsIntro: "The product this page documents the absence of.",
    steps: [
      {
        title: "Query the Whole Web",
        body: "Rodin Search indexes model sources across the internet, not one library.",
      },
      {
        title: "Filter and Inspect",
        body: "Results filter by format, license, and source, with in-browser previews.",
      },
      {
        title: "Feed the Pipeline",
        body: "Found models become references and assets inside the reference's tools.",
      },
    ],
    benefitsTitle: "Why a Model Search Engine Matters",
    benefitsIntro: "The reference's reasoning — and the local truth.",
    benefits: [
      {
        title: "Don't Generate What Exists",
        body: "Search before generating — a found mesh is often better and always cheaper.",
      },
      {
        title: "License Clarity",
        body: "The reference surfaces licensing so pipeline choices stay legal.",
      },
      {
        title: "What Exists Here",
        body: "Search over your own generated history: the task rail, task list endpoint, and the Convertor's task picker all query your real tasks.",
      },
      {
        title: "What Does Not",
        body: "No web index, no third-party sources, no license filter — and no search box pretending otherwise.",
      },
    ],
    promptExamples: {
      title: "Describe It, Don't Keyword It — the Reference's Query Style",
      intro:
        "The reference's search pitch is semantic: describe the asset you want in plain words. These query cards mirror that style — as the grammar of an index that does not run here.",
      cards: [
        {
          prompt: "a low-poly wooden chair that fits a cozy farming game",
          note: "A semantic query the reference's index would answer with matching meshes. This clone has no web-wide index — no search box pretends otherwise. The nearest real path with this intent is text-to-3D: the compiler reads exactly this kind of description and builds a scene from it.",
        },
        {
          prompt: "hard-surface ammo crate, worn military green, game-ready scale",
          note: "Style-and-constraint language like this is search input on the reference and generation input here. Describing the asset you want and letting the studio build it is the honest local substitute for finding it — a different verb, and no index behind it.",
        },
        {
          prompt: "stylized treasure chest similar to this model, but lower poly",
          note: "Search-by-model — feeding a mesh to find kin — is one of the reference's three doors. It does not exist here; what this clone reads from images and models is for generation, and no similarity index ever forms.",
        },
      ],
    },
    useCasesTitle: "Who Uses a Model Search Engine",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Game development",
        title: "Asset Sourcing",
        body: "Find existing props before budgeting generation time.",
      },
      {
        tag: "This clone",
        title: "Your Own Library",
        body: "Reopen, re-export, or redo any task you have made — history here is searchable and permanent.",
      },
      {
        tag: "Prototyping",
        title: "Speed",
        body: "The reference's pitch is minutes-to-asset; search beats generation when it fits.",
      },
    ],
    techCards: {
      title: "Ask by Text, Image, or Model — the Reference's Three Doors",
      intro:
        "The reference's search accepts three query modalities. This clone's surfaces read text and images for a different purpose — generation — and the honest mapping is card by card.",
      cards: [
        {
          title: "Ask With Text",
          body: "On the reference, a description queries a web-wide model index. Here, a description compiles: the text-to-3D prompt path parses plain-language scenes into strict specs and builds them. Your words build an asset instead of finding one.",
        },
        {
          title: "Ask With Image",
          body: "The reference matches uploaded images against its index. This clone's image reading is generation-side: image-to-3D captions a reference and models from it, and the HDRI tool extracts palettes. No reverse-image model search exists here.",
        },
        {
          title: "Ask With Model",
          body: "Feeding a mesh to find similar meshes is the reference's third door. Nothing in this clone indexes similarity between models — the Model Viewer opens any local GLB for inspection, which is reading, not searching.",
        },
        {
          title: "What Search Actually Runs Here",
          body: "Search over your own work, for real: the studio's history rail, the task-list endpoint behind it, and the Format Convertor's task picker all query the tasks you have generated. The scope is your library — the reference's scope is the web.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can I search the web for models here?",
        a: "No. This clone has no web-wide index; the toolbag card says exactly this.",
      },
      {
        q: "What search exists?",
        a: "Search over your own tasks — the history rail, the task list API, and the Convertor's picker cover everything you have generated.",
      },
      {
        q: "Can I use models I find elsewhere?",
        a: "Yes — the Model Viewer opens any local GLB/GLTF file, and remote URLs preview too. Nothing is uploaded.",
      },
      {
        q: "Is the gap permanent?",
        a: "A web-wide index is out of scope for this clone by construction — it is data, not code, that the reference owns.",
      },
      {
        q: "What are the reference's three search modalities?",
        a: "Text queries, image queries, and model queries — 'Ask by Text, Image, or Model' is its page's own headline. This clone reads text and images for generation only, never for retrieval; no modality here feeds an index.",
      },
      {
        q: "Why does the page pitch 'describe it, don't keyword it'?",
        a: "Because semantic description is the reference's query style — its index understands 'a low-poly wooden chair' as a concept. Documented here as its feature; the same descriptive language finds its real use in this clone's generation prompts.",
      },
      {
        q: "Can the task history really replace search?",
        a: "It replaces the part of search that matters for your own assets: every generated task stays openable, re-exportable, and redoable from the rail. It cannot find the world's models — that gap is the page's reason to exist.",
      },
      {
        q: "Will a web index ever run here?",
        a: "No — by construction. The reference's index is data it owns and crawls; this clone is code you run. The honest ceiling for local search is your own library, and that ceiling is already reached.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real library surfaces here.",
    crossLinks: [
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "API", href: "/features/api" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Your Library, Fully Searchable",
    closingBody: "No web index here — but every task you generate stays findable, openable, and exportable.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "omnicraft",
    indexBlurb: "Reference-only: web-wide model index; your own task history is searchable here.",
  },
  {
    slug: "omnicraft/3d-mesh-editor",
    name: "3D Mesh Editor",
    title: "3D Mesh Editor",
    subline:
      "The reference hosts a full mesh editing suite. This clone covers the honest subset — orientation, material redo, proportion constraints — and says where editing stops.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY (SUBSET IN STUDIO)",
    statusNote:
      "The reference's Mesh Editor is a hosted editing suite with mesh-level operations. This clone's studio covers the subset that generation actually needs: re-orient a finished task, redo its materials, and pin proportions via ControlNet on the next run. Vertex-level surgery, remeshing, and boolean ops are out of scope — this page is the boundary marker, in public.",
    cta: null,
    ctaSecondary: { label: "See the studio subset", href: STUDIO_PATH },
    stepsTitle: "What the Reference's Mesh Editor Does",
    stepsIntro: "The product this page measures the clone against.",
    steps: [
      {
        title: "Hosted Mesh Ops",
        body: "Vertex, edge, and face level operations in the browser against uploaded meshes.",
      },
      {
        title: "Repair and Cleanup",
        body: "The suite fixes the unglamorous problems — non-manifold geometry, holes, normals.",
      },
      {
        title: "Prepare for Use",
        body: "Edited meshes flow straight into export and engine pipelines.",
      },
    ],
    benefitsTitle: "Where the Studio Subset Stops",
    benefitsIntro: "What editing exists here, honestly enumerated.",
    benefits: [
      {
        title: "Orientation Is Real",
        body: "Stand your generated model upright properly — the studio's orientation control adjusts and persists it.",
      },
      {
        title: "Material Redo Is Real",
        body: "Repaint a finished task's palette without regenerating geometry.",
      },
      {
        title: "Proportion Control Is Real",
        body: "ControlNet constraints (bbox, voxel silhouette) wrap the NEXT generation to the shape you drew — prevention, not repair.",
      },
      {
        title: "Mesh Surgery Is Not",
        body: "No vertex editing, no remesh, no booleans. The Model Viewer inspects any mesh but does not modify it.",
      },
    ],
    useCasesTitle: "Who Needs Which Editor?",
    useCasesIntro: "Matching need to surface.",
    useCases: [
      {
        tag: "This clone",
        title: "Generation-Touch Editing",
        body: "Orient, repaint, re-proportion — the edits a generated asset usually needs before export.",
      },
      {
        tag: "Reference",
        title: "Full Repair Work",
        body: "Rescuing broken third-party meshes is the hosted editor's job.",
      },
      {
        tag: "Inspection",
        title: "Look Before You Leap",
        body: "The Model Viewer opens any GLB locally for a full inspection pass — read-only by design.",
      },
    ],
    techCards: {
      title: "Optional Creative Control for Every Surface — Suite vs Subset",
      intro:
        "The reference's mesh editor promises sculpting, painting, masking, and remeshing on any mesh. This clone's editing surface is smaller and real — the four cards below hold both halves honestly.",
      cards: [
        {
          title: "Sculpting",
          body: "The reference hosts brush-based sculpting in the browser. Nothing sculpts here: the studio's model viewer rotates, inspects, and swaps material views, and geometry stays byte-identical from import to export — read-only by design, stated by design.",
        },
        {
          title: "Painting and Masking",
          body: "Vertex-color painting and region masks are reference-suite features. The closest real lever here is material redo — repaint a generated task's palette without touching geometry — which is a color pass, not surface painting.",
        },
        {
          title: "Remeshing and Repair",
          body: "The reference's repair pass fixes non-manifold geometry, holes, and normals on demand. This clone performs no mesh surgery of any kind; if a third-party mesh is broken, inspect it locally in the viewer and repair it in a real DCC.",
        },
        {
          title: "The Subset That Is Real",
          body: "Orientation adjustments that persist through every export, material redo on finished tasks, and ControlNet bbox/voxel constraints that shape the NEXT generation — prevention rather than repair. Three real levers, enumerated without inflation.",
        },
      ],
    },
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can I edit vertices here?",
        a: "No — the studio's edit surface is orientation, materials, and next-run constraints. Vertex surgery is the reference's suite, not this clone's.",
      },
      {
        q: "Can I fix a broken mesh I found elsewhere?",
        a: "Inspect it locally in the Model Viewer, but repair tools are not implemented here.",
      },
      {
        q: "Can I re-orient and re-export?",
        a: "Yes — orientation changes persist with the task and flow into every export format.",
      },
      {
        q: "Why state the boundary publicly?",
        a: "Because the toolbag's honesty contract applies site-wide: every listed tool either works here or says exactly why not.",
      },
      {
        q: "What does the reference's suite actually do?",
        a: "Hosted mesh-level operations — sculpt, paint, mask, remesh, repair — against uploaded meshes, per its page's own anatomy. Documented here as its feature set; nothing in this clone performs mesh-level surgery.",
      },
      {
        q: "What exactly can I edit on a generated model?",
        a: "Three things, all real: orientation (persists into every export format), materials (palette redo without regenerating geometry), and proportions of the next run (ControlNet constraints drawn before generation). Vertex positions are not on the list.",
      },
      {
        q: "Is the Model Viewer an editor?",
        a: "No — it is an inspector. It opens any local GLB/GLTF (and remote URLs) with material and wireframe views, and modifies nothing. Calling inspection 'editing' would be the kind of inflation this site exists to avoid.",
      },
      {
        q: "Why offer ControlNet instead of repair?",
        a: "Because generation-time prevention is what this clone's pipeline can do honestly: bbox and voxel constraints wrap the model you are about to make. Repairing an arbitrary mesh is a different capability with a different owner — the reference's.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "The real editing-adjacent surfaces.",
    crossLinks: [
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Toolbag home", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Edit What Generation Needs",
    closingBody: "Orient, repaint, constrain — the honest subset, done for real in the studio.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "omnicraft",
    indexBlurb: "Reference-only: hosted mesh surgery; studio covers orient/repaint/constrain.",
  },
];
