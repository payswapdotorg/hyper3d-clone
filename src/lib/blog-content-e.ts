/**
 * Blog content E — the ten core workflow articles (of the 55 written).
 *
 * These teach the generation workflows end to end, anchored to the two live
 * studio modes, the free-preview/1-credit-confirm metering, the six real
 * exporters, and the OmniCraft surfaces. Where a workflow step would
 * require an unimplemented surface, the article says which surface and
 * gives the nearest real path.
 */
import type { BlogArticleDef } from "./blog-types";

export const BLOG_ARTICLES_E: BlogArticleDef[] = [
  {
    slug: "image-to-3d",
    title: "Image to 3D: The Reference-Driven Flow",
    category: "image-to-3d",
    description:
      "One image in, a caption you can edit, a free preview, a 1-credit confirm — the complete image-to-3D workflow with its real constraints.",
    date: "2026-10-30",
    status: "live",
    answer:
      "Drop one .png/.jpg/.webp, edit the caption a vision model drafts from it, generate, inspect the free preview, then confirm for 1 credit and export in six formats. That is image to 3D here — one reference image (not multi-view sets), reference-driven (the caption is the control surface), and metered only at the export you choose to keep.",
    sections: [
      {
        heading: "The flow, with its honest constraints",
        paragraphs: [
          "The input surface is one image in three formats: png, jpg, webp. The first pipeline step is a vision caption — the model looks at your reference and writes what it sees into the prompt box, and that draft is editable text: correct its reading before generating, because the mesh follows the caption as much as the pixels. Multi-view input (the reference's optional extra images for extra control) is not implemented here, and the drop zone states so rather than implying it.",
          "After generation, the preview is free and full-featured: rotate it, compare the silhouette to your reference, and either redo (free) or confirm. Confirm & Export is the single charge — 1 credit standard, 10 for the agentic type — atomic and idempotent. Exports and re-exports in GLB, glTF, FBX, OBJ, STL, USDZ cost nothing further.",
        ],
      },
      {
        heading: "What makes a good reference",
        paragraphs: [
          "One clear object, plain background, even light — the vision caption faithfully describes clutter too, and the mesh faithfully contains what the caption says. Photos of real objects work; drawings work; busy scenes produce busy meshes unless you crop to the subject first.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many images can I use?",
        a: "One reference image. Optional additional views are a reference-only affordance here — stated on the feature page and in the drop zone.",
      },
      {
        q: "Does it cost anything to try?",
        a: "No: creation and preview are free on every account; the charge exists only at Confirm & Export. The 50-credit signup grant covers fifty standard confirms.",
      },
    ],
    related: [
      { label: "Image to 3D feature page", href: "/features/image-to-3d" },
      { label: "Convert an image (how-to)", href: "/blog/how-to-convert-image-to-3d-model" },
      { label: "Image to STL", href: "/blog/image-to-stl" },
    ],
  },
  {
    slug: "text-to-3d-model",
    title: "Text to 3D Model: From Prompt to Mesh",
    category: "text-to-3d",
    description:
      "The complete text-to-3D workflow: prompt craft, presets, effort tiers, ControlNet silhouettes, free previews, and the 1-credit confirm.",
    date: "2026-10-29",
    status: "live",
    answer:
      "Type what you want, generate, inspect the free preview, confirm for exactly 1 credit, export in six formats. Text to 3D is the studio's most direct mode: the prompt is the entire input surface, and everything around it — presets, effort tiers, ControlNet silhouettes — exists to make that one input land better.",
    sections: [
      {
        heading: "The input surface and its helpers",
        paragraphs: [
          "The prompt box accepts up to a couple thousand characters, and structure beats length: object, then material, then modifiers ('a low-poly wooden chair, three legs, sanded'). One-click presets seed a prompt plus a suggested effort tier from known-good shapes, and a prompt-polish step can tidy phrasing before generation if you want the API's help.",
          "ControlNet constraints are the spatial half of prompting: block a bounding box, voxel volume, or point cloud before generating, and the mesh fills the envelope you drew. It is the honest version of 'make it about this tall' — a constraint the pipeline provably respects, visible in the result.",
        ],
      },
      {
        heading: "Iteration is free; confirmation is not",
        paragraphs: [
          "The affordable loop: draft at low effort, read the preview, refine the prompt, rerun — previews and redos never touch the balance. When a preview is worth keeping, Confirm & Export is the 1-credit moment (10 for agentic), idempotent by transaction. After that the task is exportable forever in six formats, re-exporting through the convertor for free.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long are prompts typically?",
        a: "A structured sentence or two. Long prompts are not penalized, but concrete nouns and stated style outperform adjectives stacked on a vague object.",
      },
      {
        q: "Can I lock the shape while changing the look?",
        a: "Set a ControlNet silhouette for the shape, steer materials in the prompt, and rerun — that combination is the closest thing to style transfer here, and it is all real pipeline input.",
      },
    ],
    related: [
      { label: "Text to 3D feature page", href: "/features/text-to-3d" },
      { label: "Prompt guide", href: "/blog/3d-text-prompt-guide" },
      { label: "Text to STL", href: "/blog/text-to-stl" },
    ],
  },
  {
    slug: "free-text-to-3d-model",
    title: "Free Text to 3D: What 'Free' Honestly Means Here",
    category: "text-to-3d",
    description:
      "Previews are always free, the signup grant is 50 credits, and no payment exists anywhere — the honest accounting of a 'free' text-to-3D tool.",
    date: "2026-10-28",
    status: "live",
    answer:
      "Free here means three specific, code-backed things: creating and previewing text-to-3D tasks costs zero credits on every account; every new account starts with 50 credits (fifty standard confirms); and there is no payment surface anywhere — nothing to buy, no trial to expire. The meter starts only at a confirm you choose to make.",
    sections: [
      {
        heading: "The actual price structure",
        paragraphs: [
          "Articles titled 'free text to 3D' usually mean a comparison of freemium tiers. This one can be shorter and stranger: the entire commercial surface is one tier at $0, the grant is 50 credits at signup (it never expires — no aging code exists), and the only debits are 1 per standard confirm and 10 per agentic run. Previews, redos, OmniCraft tools, and post-confirm exports all cost nothing, by construction rather than by promotion.",
          "The reference's article compares tools by their free tiers; the honest comparison from here is structural: this pipeline meters at results, not attempts, so the 'free' boundary is exactly where the value boundary is — you pay (in credits) for the mesh you keep.",
        ],
      },
      {
        heading: "What the 50 credits buy, in real units",
        paragraphs: [
          "Fifty standard confirms — fifty meshes you previewed, liked, and exported. Five agentic runs. Any mix of the two. Every preview that led to those confirms: free, however many it took. The OmniCraft toolbag — HDRI skies, SVG-to-3D, the model viewer, the format convertor — free on top, because local and procedural tools have no marginal cost to meter.",
          "When the grant runs out, the boundary stays honest: generation and preview keep working (they were never metered), confirms stop until credits exist again, and nothing expires or resets. There is no 'free trial ended' email because there is no trial and no email — just a running total that reached zero, stated on the pricing page in exactly those terms.",
        ],
      },
    ],
    faqs: [
      {
        q: "What happens when the 50 credits run out?",
        a: "Previews stay free and OmniCraft stays free; confirms stop until credits exist again. There is no purchase path — the buying-credits article explains why, honestly.",
      },
      {
        q: "Is there a trial that ends?",
        a: "No time-based trial exists — no expiry code, no countdown, no card on file. The grant is a standing balance, not a promotional window.",
      },
    ],
    related: [
      { label: "Text to 3D feature page", href: "/features/text-to-3d" },
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
  {
    slug: "text-to-stl",
    title: "Text to STL: Prompt to Printable File",
    category: "3d-printing",
    description:
      "The print-bound pipeline: prompt the object, preview free, confirm for 1 credit, export binary STL that slicers accept directly.",
    date: "2026-10-27",
    status: "live",
    answer:
      "Describe the object, generate, confirm, export binary STL — the whole print-bound path is real here, and the STL bytes are standards-compliant (80-byte header, triangle count, 50 bytes per triangle) so a slicer rejection means a slicer problem, not a file problem. Print prep itself — orientation, supports, slicing — lives in your slicer, as it should.",
    sections: [
      {
        heading: "Prompting for printability",
        paragraphs: [
          "Slicers forgive less than renderers: overhangs need supports, tiny features can vanish below nozzle resolution, and wall thickness matters more than surface detail. Prompt accordingly — 'a sturdy desk organizer, solid base, thick walls, no thin fins' prints; 'an intricate filigree dragon' becomes a support-removal ritual. Higher effort tiers buy detail that matters visually; printability is mostly a geometry decision you make in the prompt.",
          "Units are the classic trap: the pipeline outputs dimensionless mesh geometry, and slicers interpret it in millimeters. The export is what it is; scale to taste in the slicer's uniform-scale field — honest advice, because no button here claims to know your printer's units.",
        ],
      },
      {
        heading: "The export and what follows",
        paragraphs: [
          "Confirmed tasks export binary STL directly, and the convertor re-emits STL from any confirmed task later for free. In the slicer: orient for strength (load-bearing surfaces flat), add supports where geometry demands, and slice. For colors or multi-part structure in the file itself, 3MF is the format — this codebase does not write it, and the 3MF articles cover the honest slicer-side path.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does the STL include a base or supports?",
        a: "No — the export is the generated geometry. Bases, supports, and brims are slicer-side decisions; no hidden geometry ships in the file.",
      },
      {
        q: "Why is my file dense with triangles?",
        a: "Higher-effort generations produce denser meshes, and STL stores 50 bytes a triangle. If the next tool chokes, that is a decimation need — this codebase ships no decimator, stated as a gap.",
      },
    ],
    related: [
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
      { label: "Image to STL", href: "/blog/image-to-stl" },
      { label: "3MF vs STL", href: "/blog/3mf-vs-stl" },
    ],
  },
  {
    slug: "image-to-stl",
    title: "Image to STL: Photo to Printable Mesh",
    category: "3d-printing",
    description:
      "Photo in, caption edited, mesh generated, binary STL out — the honest image-to-print pipeline with its printability caveats.",
    date: "2026-10-26",
    status: "live",
    answer:
      "The path is real and short: upload the photo (.png/.jpg/.webp), fix the vision caption's reading of it, generate, inspect the free preview, confirm (1 credit), export binary STL. The honest caveat is the same as any image-to-mesh path: a photo shows a surface, not a thickness — the back of the object is the pipeline's inference, and printability is your geometry call.",
    sections: [
      {
        heading: "From photo to caption to mesh",
        paragraphs: [
          "The vision step is the quality lever: it drafts a description of your reference, and editing that description is how you correct it ('matte ceramic, not glossy plastic') before generation. Photos of single objects on plain backgrounds produce the cleanest captions and the cleanest meshes; a busy scene gets faithfully captioned as a busy scene.",
          "For print, the same prompt-level rules from text-to-STL apply after the caption: state sturdiness, avoid whisper-thin features, expect the unseen back face to be inferred. Preview is free — use it to check silhouette and obvious mass before the single credit.",
        ],
      },
      {
        heading: "The photo-to-print checklist",
        paragraphs: [
          "Crop to one object before uploading — the vision step captions whatever is in frame, and a countertop plus mug plus hand becomes all three in the mesh. Check the caption's material reading before generating; matte versus glossy changes surface behavior in the slicer's rendering if not its toolpaths. Preview the silhouette against the photo (free), confirm (1 credit), export binary STL, and do orientation, supports, and scale in the slicer — the printer-side steps this pipeline deliberately does not pretend to own.",
          "The meter never moves before the confirm: a bad photo costs nothing but a rerun, the 50-credit grant is untouched by abandoned attempts, and the agentic tier (10 credits) exists for the API path if an agent is driving the loop. Print prep is slicer work; the mesh is this side of the handoff.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I print a lithophane from a photo here?",
        a: "A lithophane is a heightmap trick — thickness encoding brightness — which is a different geometry pipeline than object reconstruction. This codebase generates object meshes; the lithophane topic page in this catalog is an honest status page, not a converter.",
      },
      {
        q: "Which STL flavor do I get?",
        a: "Binary STL, written directly by the exporter — the format slicers prefer over the ASCII variant.",
      },
    ],
    related: [
      { label: "Image to 3D", href: "/blog/image-to-3d" },
      { label: "Text to STL", href: "/blog/text-to-stl" },
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
    ],
  },
  {
    slug: "how-to-convert-image-to-3d-model",
    title: "How to Convert an Image to a 3D Model — Actually",
    category: "image-to-3d",
    description:
      "The five real steps: pick the reference, edit the caption, constrain the silhouette, preview free, then the 1-credit confirm and export.",
    date: "2026-10-25",
    status: "live",
    answer:
      "Five steps, all real: choose one clean reference image; edit the vision model's caption of it; optionally block the silhouette with a ControlNet; generate and inspect the free preview; confirm for 1 credit and export in the format your next tool wants. 'Conversion' is the marketing word — this is generation guided by a reference, and knowing that changes how you use it.",
    sections: [
      {
        heading: "Steps one to three: input quality",
        paragraphs: [
          "Pick the reference like a photographer: one object, plain background, even light, the object's defining silhouette visible. Then treat the caption as the real control surface — the vision model describes what it sees, and your edits ('the handle is on the left', 'matte finish') steer the mesh as much as the pixels do. If shape fidelity matters, draw a bounding-box ControlNet: the mesh then fills the envelope you set rather than guessing scale.",
        ],
      },
      {
        heading: "Steps four and five: preview, then pay",
        paragraphs: [
          "Generate and look before spending anything — previews are free, every time, and rotation plus silhouette comparison catches most misses. Redo with an adjusted caption if needed (also free). When the preview earns it: Confirm & Export, the single 1-credit moment, then export GLB for the web, OBJ for editing, STL for printing, FBX or USDZ as the destination demands. Re-exports and format changes later cost nothing through the convertor.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this a conversion or a generation?",
        a: "Generation guided by a reference — the tools tree's converter pages make the same distinction test-enforced ('generation, not conversion'), because the pipeline synthesizes a new mesh rather than lifting one from the pixels.",
      },
      {
        q: "What about CAD drawings as input?",
        a: "The input surface is images of objects for caption-driven generation, not precision drawing interpretation. A photo of a blueprint will be captioned as 'a blueprint' and meshed as a flat drawing — not reconstructed into geometry.",
      },
    ],
    related: [
      { label: "Image to 3D", href: "/blog/image-to-3d" },
      { label: "Prompt guide", href: "/blog/3d-text-prompt-guide" },
      { label: "Format convertor", href: "/workspace/omnicraft/formatcon" },
    ],
  },
  {
    slug: "3d-text-prompt-guide",
    title: "The 3D Text Prompt Guide: Structure That Lands",
    category: "prompt-guide",
    description:
      "How to write prompts the mesh pipeline rewards: object-material-modifier structure, style anchors, spatial constraints, and iteration habits.",
    date: "2026-10-24",
    status: "live",
    answer:
      "The prompt shape that works here: object first, materials second, modifiers third — 'a low-poly wooden chair, three legs, sanded' — plus a ControlNet silhouette when shape fidelity matters and cheap low-effort drafts while you iterate. Previews are free, so the affordable habit is draft-riff-confirm, not one perfect prompt.",
    sections: [
      {
        heading: "The four slots of a good 3D prompt",
        paragraphs: [
          "Object: the concrete noun, singular, specific ('a watchtower' not 'a building'). Material: how it looks and feels ('weathered sheet metal', 'sanded oak') — this drives both geometry density and the material pass. Modifiers: count, proportion, wear, era ('three legs', 'tapered', 'mid-century'). Style anchor: the aesthetic frame ('low poly', 'stylized', 'photorealistic') — and note the styles tree here catalogs twenty-one of those anchors as deep-linkable starting points.",
          "What burns credits without burning quality: stacking adjectives on a vague object ('amazing epic awesome sword') — the pipeline has no idea what makes a sword epic, but it knows exactly what 'a curved scimitar, engraved guard, blued steel' means.",
        ],
      },
      {
        heading: "Iteration: the free part of the craft",
        paragraphs: [
          "Draft at low effort (fast, free previews), read what comes back, and adjust one slot at a time — object first (is it the right thing?), then silhouette (ControlNet if wrong), then materials. Redos are free. The single credit should feel like a signature on finished work, not a gamble. When a result is close but text keeps missing it, the reference-image path is the honest alternative: a photo steers harder than prose.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long should a prompt be?",
        a: "One to three structured sentences. The box accepts more; the pipeline rewards structure over volume.",
      },
      {
        q: "Do presets exist?",
        a: "Yes — one-click prompt presets seed a known-good prompt plus a suggested effort tier, and the styles tree deep-links aesthetic anchors. Start there, edit, iterate.",
      },
    ],
    related: [
      { label: "Prompt engineering (deeper)", href: "/blog/3d-prompt-engineering" },
      { label: "Styles tree", href: "/styles" },
      { label: "Text to 3D", href: "/blog/text-to-3d-model" },
    ],
  },
  {
    slug: "3d-prompt-engineering",
    title: "3D Prompt Engineering: Beyond the Basics",
    category: "prompt-guide",
    description:
      "Prompt engineering for mesh pipelines: constraint stacking, negative space by omission, budgeting effort tiers, and steering with references.",
    date: "2026-10-23",
    status: "live",
    answer:
      "3D prompt engineering differs from image-prompt engineering because the output must survive rotation: every unseen angle is a claim your prompt made or left blank. The advanced toolkit here: constraint stacking (prompt + ControlNet silhouette), omission as design (say what should NOT exist by not inviting it), effort-tier budgeting across an iteration session, and reference-image steering when prose plateaus.",
    sections: [
      {
        heading: "Constraint stacking",
        paragraphs: [
          "The prompt steers identity and materials; the ControlNet constrains space. Stacked, they answer the two failure modes of pure-prompt generation — right object, wrong proportions (fix: bounding box or voxel envelope) and right object, wrong mass distribution (fix: point-cloud hint). A prompt says 'what', a constraint says 'where and how big', and the pipeline respects both, visibly.",
        ],
      },
      {
        heading: "Omission, effort budgeting, and reference steering",
        paragraphs: [
          "Mesh pipelines fill unspecified angles with inference — so omission is a real tool: 'a mug' invites an invented back; 'a mug, cylindrical, plain back' directs it. Budget effort like money: low tiers for the idea phase, one high tier for the keeper — previews are free at every tier, so the expensive pass should be the last pass. And when three prompt revisions still miss, switch modality: drop a reference image and edit the caption — a photo steers silhouette harder than any adjective stack.",
          "The honest limit of all of it: prompt engineering here is deterministic steering of a real pipeline, not incantation. Every technique above is verifiable in one free preview loop, which is exactly how you should adopt it.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are there magic keywords?",
        a: "No — there are load-bearing nouns and materials, which behave reliably because they describe geometry and surfaces. Keyword superstitions from image prompting mostly do not transfer.",
      },
      {
        q: "How do I keep a style consistent across objects?",
        a: "Repeat the same style anchor phrase verbatim across prompts, and check the styles tree for the anchor's catalog page — consistency comes from identical framing, not from style tokens.",
      },
    ],
    related: [
      { label: "Prompt guide (basics)", href: "/blog/3d-text-prompt-guide" },
      { label: "Generation settings", href: "/blog/choose-rodin-model-and-generation-settings" },
      { label: "Styles tree", href: "/styles" },
    ],
  },
  {
    slug: "how-to-make-3d-models-with-ai",
    title: "How to Make 3D Models with AI: The Honest Landscape",
    category: "workflow",
    description:
      "Three real routes into AI 3D — text-driven, image-driven, agent-driven — what each is genuinely good at, and where this pipeline draws its lines.",
    date: "2026-10-22",
    status: "live",
    answer:
      "AI 3D model-making has three honest routes: text-driven (prompt describes, pipeline synthesizes — best for idea-first work), image-driven (a reference steers, a caption translates — best for reproducing something you can see), and agent-driven (an MCP-connected agent generates mid-task — best for pipelines). All three run here; picking between them is picking input modality, not picking quality.",
    sections: [
      {
        heading: "Choosing the input modality",
        paragraphs: [
          "Text when the object exists only in your head: structure the prompt (object, material, modifiers), constrain the silhouette if proportions matter, and iterate on free previews. Image when the object exists in front of you: one clean photo, an editable caption between the pixels and the mesh, and silhouette-checking in the free preview. Agent when a program should do it: the MCP modal hands an agent the task pipeline, and its generations land in the same history with the same metering.",
          "The routes share the honest meter: creation and preview free, 1 credit per standard confirm, 10 for the agentic type, six export formats, no hidden surcharges. Whichever door you enter, you pay for results, not attempts.",
        ],
      },
      {
        heading: "What AI mesh-making is not",
        paragraphs: [
          "It is not CAD: no parametric features, no engineering precision — the DXF article covers that boundary. It is not scanning: no photogrammetry from image sets here — the PLY article covers that world. And it is not a print pipeline: it produces the mesh; orientation, supports, and slicing belong to slicer software. Knowing the boundaries is what makes the tool usable rather than disappointing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which route is best for beginners?",
        a: "Text-driven, using presets: the feedback loop is fastest and every iteration is a free preview. Image-driven is the second stop when prose stops steering.",
      },
      {
        q: "Can I mix routes?",
        a: "Constantly: draft by text, refine with a reference image, hand the keeper to an agent pipeline via the API — the task history and formats are shared across all three.",
      },
    ],
    related: [
      { label: "Text to 3D", href: "/blog/text-to-3d-model" },
      { label: "Image to 3D", href: "/blog/image-to-3d" },
      { label: "MCP article", href: "/blog/connect-hyper3d-rodin-mcp-to-ai-agents" },
    ],
  },
  {
    slug: "generate-3d-game-assets",
    title: "Generating 3D Game Assets: The Pipeline That's Real",
    category: "game-development",
    description:
      "Prop-first generation, GLB for engines, STL for physical merch, and the honest notes on topology and optimization that asset pages skip.",
    date: "2026-10-21",
    status: "live",
    answer:
      "The real workflow for game-bound assets: generate props (the strongest fit — single objects with clear silhouettes), export GLB for engine ingestion (or FBX where the pipeline expects it), and let the engine's importer handle materials. The honest engineering notes — topology, LODs, draw calls — are below, including which of them this codebase does and does not do for you.",
    sections: [
      {
        heading: "What generates well for games",
        paragraphs: [
          "Props and set dressing: barrels, crates, statues, tools — single objects, definite silhouettes, style-anchored prompts ('low poly', 'stylized', 'hand-painted') that match your art direction. The styles tree catalogs twenty-one aesthetic anchors and deep-links each into the generator, which is the fastest way to hold a consistent look across a batch.",
          "Characters and complex rigged objects are the harder class — this pipeline outputs static meshes with materials, not rigs, so character work means generating the sculpt and rigging in your DCC. Environment kits are best approached as many prop generations rather than one scene generation (WorldGen-style scene reconstruction is reference-only here).",
        ],
      },
      {
        heading: "The engineering notes asset roundups skip",
        paragraphs: [
          "Topology: game meshes want clean edge flow; generated meshes are mesh-first, so expect to retopologize hero assets in a DCC — the topology topic page in this catalog marks the deep version of this honestly. LODs: this codebase ships no decimator, so LOD chains are built in your DCC or engine tooling from the exported mesh. Formats: GLB is the engine-friendly default (one file, materials included); FBX covers the Autodesk-shaped importers. Batch economics: previews are free, so generating variants and picking winners is the cheap loop; each keeper is 1 credit.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I fill a whole level this way?",
        a: "Prop by prop, yes — and the free-preview loop makes variant exploration cheap. Scene-level generation (one image to a whole world) is the reference's WorldGen and is not implemented here.",
      },
      {
        q: "Which export for Unity or Unreal?",
        a: "GLB imports cleanly into both modern toolchains; FBX where a specific importer expects it. Confirm once, then re-export either format for free through the convertor.",
      },
    ],
    related: [
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Styles tree", href: "/styles" },
      { label: "GLB explainer", href: "/blog/what-is-glb-file" },
    ],
  },
];
