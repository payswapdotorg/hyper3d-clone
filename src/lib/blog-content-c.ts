/**
 * Blog content C — the eleven product tutorials (of the 55 written
 * articles). Each one teaches the task the reference's title promises, and
 * each one states plainly whether that flow runs here, partially runs here,
 * or does not exist here — then gives the nearest honest path.
 *
 * Surface anchors: GEN_MODES/GENERATING_MODES (two live modes, hyper3d.ts),
 * efforts and materials and gen versions from the same module, the VLM
 * caption step on Image to 3D, the MCP connect modal (features-content-mcp),
 * and OmniCraft's four live tools (omnicraft.ts) with HDRI fully local.
 */
import type { BlogArticleDef } from "./blog-types";
import { STUDIO_PATH } from "./studio-path";

export const BLOG_ARTICLES_C: BlogArticleDef[] = [
  {
    slug: "create-3d-models-from-text-with-rodin",
    title: "Create 3D Models from Text, in This Studio",
    category: "text-to-3d",
    description:
      "The real text-to-3D flow: prompt (or preset), effort tier, free preview, then a 1-credit confirm — 'Rodin' is the reference's brand; here it's the studio's Text to 3D tab.",
    date: "2026-10-30",
    status: "live",
    answer:
      "Yes, and the whole flow is metered honestly: type a prompt (or seed one from a preset), pick an effort tier, generate a free preview, then Confirm & Export for exactly 1 credit. One naming note up front: 'Rodin' is the reference's generator brand — this clone ships the same workflow in the studio's Text to 3D tab and says so rather than borrowing the logo.",
    sections: [
      {
        heading: "Writing a prompt that lands",
        paragraphs: [
          "The pipeline rewards concrete nouns and stated style: 'a low-poly wooden chair, three legs, sanded' will beat 'chair' every time. Structure helps too — object first, then material, then modifiers. The studio ships one-click prompt presets (a prompt seed plus a suggested effort tier) so you can start from a known-good shape and edit from there, and a prompt-polish step exists if you want the API to tidy phrasing before generation.",
          "Spatial constraints are real here: set a ControlNet bounding box, voxel volume, or point cloud before generating and the result respects the silhouette you blocked out. It is the honest version of 'sculpt the vague idea in your head' — you draw the envelope, the mesh fills it.",
        ],
      },
      {
        heading: "Tiers, previews, and the one charge",
        paragraphs: [
          "Effort tiers trade speed for detail — from the fastest draft tier up through the maximum-fidelity pass — and the queue paces itself across them, so the preview lands when the work is done. Previews are free on every tier: creation and inspection never touch your balance. Confirm & Export is the single metered moment (1 credit standard, 10 if you ran the agentic type), and it is idempotent — a double click cannot double-charge.",
          "After confirming, export in any of the six real formats and re-export in others for free. A redo is also free: dislike the preview, rerun it, and the meter never moves.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this the same 'Rodin' the reference's article teaches?",
        a: "The workflow is cloned; the brand is not claimed. This clone's studio is a general generator (its own words on the ChatAvatar feature page), and text-to-3D here is the tab you are already in.",
      },
      {
        q: "How long does generation take?",
        a: "It scales with the effort tier — the fastest drafts land in seconds, the maximum-fidelity pass takes correspondingly longer. The pipeline is paced and its progress is visible on the task card.",
      },
    ],
    related: [
      { label: "Text to 3D feature page", href: "/features/text-to-3d" },
      { label: "Prompt guide", href: "/blog/3d-text-prompt-guide" },
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
  },
  {
    slug: "create-3d-models-from-images-with-rodin",
    title: "Create 3D Models from Images, with an Editable Caption Step",
    category: "image-to-3d",
    description:
      "Drop one .png/.jpg/.webp, let the vision model draft a caption, edit it, then generate — free preview, 1-credit confirm, six export formats.",
    date: "2026-10-29",
    status: "live",
    answer:
      "The image-to-3D flow is live: upload a single .png, .jpg, or .webp reference, and a vision model drafts a text caption from it that you can edit before generating — the caption box is the control surface, the image is the evidence. Preview free, confirm for 1 credit, export in six formats.",
    sections: [
      {
        heading: "Why there's an editable caption between your image and the mesh",
        paragraphs: [
          "Image generation here is reference-driven: the vision model looks at your picture and writes what it sees — object, materials, orientation cues — into the prompt box. That draft is editable text, which is the point: you can correct the model's reading ('that's brushed steel, not chrome') before a single cycle of generation runs. One image is enough for most objects; the reference's optional multi-view input is an affordance this clone does not implement, and the drop zone says so.",
          "Good inputs are boring inputs: one clear object, plain background, even lighting. The vision step will faithfully caption a cluttered desk too — 'a desk with a mug, cables, and...' — and the mesh will then faithfully contain all of it.",
        ],
      },
      {
        heading: "From caption to confirmed export",
        paragraphs: [
          "Generate, watch the paced pipeline, inspect the free preview (rotate it, check the silhouette against your reference), then Confirm & Export — the 1-credit moment, atomic and idempotent. Agentic-tier runs cost 10 and are the API's richer path; the studio's default is the standard tier. Exports land in GLB, glTF, FBX, OBJ, STL, or USDZ, and re-exports across formats cost nothing extra — including through the Format Convertor on any task in your history.",
        ],
      },
    ],
    faqs: [
      {
        q: "What image formats are accepted?",
        a: ".png, .jpg, and .webp — one reference image, up to the upload size cap. Other formats and multi-view sets are not input surfaces here.",
      },
      {
        q: "Does the uploaded image leave the server?",
        a: "The reference image is processed by the generation pipeline as input data for the caption and generation steps — that is what the flow is. The OmniCraft model viewer, by contrast, parses files purely locally and never uploads; different tool, different contract, each stated on its own page.",
      },
    ],
    related: [
      { label: "Image to 3D feature page", href: "/features/image-to-3d" },
      { label: "Convert an image (guide)", href: "/blog/how-to-convert-image-to-3d-model" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
  },
  {
    slug: "create-editable-scenes-with-hyper3d-worldgen",
    title: "WorldGen: Editable Scenes from Images — Not Here Yet",
    category: "workflow",
    description:
      "The reference's WorldGen turns one image into an editable 3D world with independent objects. This clone ships the tab and the honest status — no scene pipeline exists.",
    date: "2026-10-28",
    status: "not-in-clone",
    answer:
      "Not implemented. WorldGen — one scene image in, an editable 3D world out, with independent objects, physical relationships, and Gaussian-splat environments — does not exist in this codebase. The studio has a WorldGen tab; pressing it tells you the truth instead of pretending: Image and Text to 3D are the live modes.",
    sections: [
      {
        heading: "What the reference's version does",
        paragraphs: [
          "On the reference site, WorldGen is a scene-level generator: upload a picture of a room or street and receive a navigable 3D scene whose objects are separately editable, with realistic spatial relationships — a genuinely different product from single-object generation, and one whose pipeline (scene decomposition, per-object reconstruction, splat environments) this clone has not built. The feature page here describes that surface and marks every part of it reference-only.",
        ],
      },
      {
        heading: "The nearest honest paths today",
        paragraphs: [
          "Single objects from a scene image: crop the object you care about and use Image to 3D — the vision caption will describe what it sees and the mesh follows. Environments rather than objects: the HDRI generator builds 360° skies from a prompt, fully local, which lights a scene but does not reconstruct one. Both are real today; neither is WorldGen, and no page here will label them as if they were.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will WorldGen ship here?",
        a: "This project does not publish speculative roadmaps — the tab states today's truth, and today's truth is two live generation modes.",
      },
      {
        q: "What about the '3D Editing' tab?",
        a: "Also not a live generation mode here — the studio's editing surface is orientation, material redo, and spatial constraints on what you generate, not a hosted editor.",
      },
    ],
    related: [
      { label: "WorldGen feature page", href: "/features/worldgen" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "HDRI generator", href: "/workspace/omnicraft/hdri" },
    ],
  },
  {
    slug: "create-3d-avatars-with-chatavatar",
    title: "Creating 3D Avatars: What ChatAvatar Is and Isn't Here",
    category: "workflow",
    description:
      "ChatAvatar is the reference's avatar workspace with auto-rigging and blendshapes. This clone runs one general studio — the honest paths for avatar work.",
    date: "2026-10-27",
    status: "not-in-clone",
    answer:
      "The avatar-specialized workspace — portrait references in, rigged avatar with blendshapes out, avatar-specific commercial licensing — does not exist in this clone. There is one general studio, and its feature page for ChatAvatar says exactly that rather than borrowing the pipeline. The honest paths for avatar-adjacent work are below.",
    sections: [
      {
        heading: "Why one studio instead of two products",
        paragraphs: [
          "The reference splits general generation (Rodin) from avatar generation (ChatAvatar) because the avatar product carries its own pipeline — face topology, auto-rigging, blendshape sets — and its own licensing terms. This clone implements neither specialized pipeline, and its rule is that a page may not describe a pipeline that is not in the tree. So the ChatAvatar feature page is a status page: what the reference ships, what exists here (one general studio), and why the general studio is not a substitute for avatar work.",
        ],
      },
      {
        heading: "What you can honestly do today",
        paragraphs: [
          "Generate avatar-shaped objects: the general studio will happily build 'a stylized character bust, low poly' from text or a reference image — it is object generation, not a rigged avatar. Inspect what you generate: the model viewer, the mesh surface of confirmed tasks, and the six export formats all work on whatever you make. What you cannot do here: auto-rig it, get blendshapes, or claim avatar-specific licensing — those belong to the product that actually implements them.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use a portrait photo as the reference?",
        a: "As an image reference for object generation, yes — the vision caption will describe the face and the mesh follows the caption. That is a statue of a face, not an avatar rig, and this article will not blur the line.",
      },
      {
        q: "Where's the line between avatar and character generation?",
        a: "Rigging and blendshapes: a rigged, animatable face versus a static mesh. The former is the specialized pipeline that does not exist here.",
      },
    ],
    related: [
      { label: "ChatAvatar feature page", href: "/features/chatavatar" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model viewer", href: "/workspace/omnicraft/viewer" },
    ],
  },
  {
    slug: "create-hdri-skyboxes-with-omnicraft",
    title: "Creating HDRI Skyboxes with OmniCraft — Fully Local",
    category: "ai-texturing",
    description:
      "The live HDRI tool: prompt-seeded procedural skies, sliders that always win, reproducible output, equirectangular PNG up to 4K — and zero server calls.",
    date: "2026-10-26",
    status: "live",
    answer:
      "Live and entirely local: type a sky ('golden-hour sunset with scattered clouds'), let the seeded procedural engine fill the axes you didn't mention, adjust with sliders that always override the prompt, and export an equirectangular PNG up to 4K for environment lighting. The tool is honest about what it is — procedural, not AI-generated — and that honesty is on the page itself.",
    sections: [
      {
        heading: "How the sky engine actually works",
        paragraphs: [
          "Your prompt names axes — time of day, weather, palette hints — and a seeded generator fills in everything you left unsaid. The seeding is the contract: the same prompt produces the same sky forever, which makes HDRI work reproducible in a way 'roll a new sky' buttons never are. Sliders exist for every axis and always win over the prompt, so 'same prompt' never means 'no control'.",
          "The output is a real equirectangular environment map — horizon-crossing gradient, sun disc, cloud structure — the format environment lights ingest. Up to 4K PNG, rendered and exported in your browser. The 360° preview shows the horizon seam before you commit, because a seam you can see is a seam you can fix.",
        ],
      },
      {
        heading: "Where it fits a lighting workflow",
        paragraphs: [
          "An HDRI is the fastest way to light a scene believably: drop it into any renderer's environment slot and the gradient does the global illumination's work. Pair it with a generated model — export your confirmed task as GLB, load it in your renderer, and light it with your sky — for a two-asset pipeline that costs zero credits here (OmniCraft tools never touch the ledger).",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this AI-generated?",
        a: "No, and the tool says so itself: it is a seeded procedural engine. The prompt steers axes; it does not diffuse pixels. The distinction is stated on the tool page because blurring it would be the one dishonest thing an otherwise honest tool could do.",
      },
      {
        q: "Does it cost credits?",
        a: "No — none of the OmniCraft tools touch the credit ledger. The 50-credit grant is for generation confirms; skies are free.",
      },
    ],
    related: [
      { label: "HDRI tool", href: "/workspace/omnicraft/hdri" },
      { label: "Help: HDRI article", href: "/help/articles/create-hdri-skyboxes-with-omnicraft" },
      { label: "OmniCraft grid", href: "/workspace/omnicraft" },
    ],
  },
  {
    slug: "edit-3d-models-with-omnicraft-mesh-editor",
    title: "Editing 3D Models: The Mesh Editor Status",
    category: "workflow",
    description:
      "The reference's hosted mesh-editing suite is not implemented here. What editing IS real: orientation, material redo, spatial constraints — and where each lives.",
    date: "2026-10-25",
    status: "not-in-clone",
    answer:
      "The hosted mesh editor — a full sculpt-and-edit suite in the toolbag — is one of OmniCraft's not-in-clone surfaces here. The editing that IS real lives in the studio: orientation, material redo (a neural in-browser re-paint), and ControlNet spatial constraints on generation. This article maps each editing verb to its honest home.",
    sections: [
      {
        heading: "The editing verbs, sorted by where they live",
        paragraphs: [
          "Retexture: real — the studio's material redo re-paints a generated model's surface in the browser, and the material system (PBR, shaded, both, or none) is part of every generation. Reorient: real — the studio's controls cover the orientation affordances a generated object needs. Constrain shape: real — bounding box, voxel, and point-cloud ControlNets block the silhouette before generation rather than sculpting after it.",
          "Freeform sculpting, topology surgery, vertex-level editing: not here. That is the hosted mesh editor's territory, this clone covers the honest subset and says the rest is out of scope — the same statement the tool page makes, because they read the same registry.",
        ],
      },
      {
        heading: "Inspecting instead of editing",
        paragraphs: [
          "Sometimes 'editing' is really 'checking': the model viewer opens GLB, GLTF, OBJ, and STL locally — orbit, material modes, live triangle count — without uploading anything. It will not modify the mesh, but it will tell you whether the mesh you have is the mesh you want before you spend anything on the next step.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I import an external model and edit it here?",
        a: "Not into an editor. The viewer inspects local files; the convertor re-exports your own generated tasks. An upload-and-sculpt pipeline does not exist in this codebase.",
      },
      {
        q: "What's the closest thing to sculpting?",
        a: "Regenerating with constraints: block the silhouette with a ControlNet, or steer the prompt, and rerun — previews are free, so iteration is the affordable edit.",
      },
    ],
    related: [
      { label: "Mesh editor status page", href: "/workspace/omnicraft/mesh" },
      { label: "Model viewer", href: "/workspace/omnicraft/viewer" },
      { label: "Help: mesh editor article", href: "/help/articles/edit-3d-models-with-omnicraft-mesh-editor" },
    ],
  },
  {
    slug: "edit-3d-models-in-rodin-workspace",
    title: "The 'Rodin Workspace' Edit Flow, Translated Honestly",
    category: "workflow",
    description:
      "The reference's workspace article covers Parts, Refine, and Modify on uploaded OBJ/FBX/GLB. Here, the equivalents are studio-side and named for what they are.",
    date: "2026-10-24",
    status: "not-in-clone",
    answer:
      "'Rodin Workspace' — the reference's model-upload-and-edit surface with Parts, Refine, and Modify steps — is reference-only. This clone has no upload-and-edit workspace; the real editing verbs (material redo, orientation, spatial constraints) live in the studio on tasks you generate here, and this article translates the reference's tutorial into what actually runs.",
    sections: [
      {
        heading: "Translating the reference's steps",
        paragraphs: [
          "Upload OBJ/FBX/GLB for editing: not a surface here — the studio generates from prompts and images; the only file inputs are image references. 'Parts' (decompose into components) and 'Partial Edit' (revise a selected region): not implemented — the nearest honest move is regenerating with a tighter prompt or a ControlNet silhouette, which is a full-model edit, not a regional one. 'Refine' and 'Modify': map to the studio's material redo and the generation settings you can change between runs.",
          "That translation table is the whole honest content of this page: the reference's tutorial teaches buttons that do not exist here, and a clone that showed you those buttons would be lying with UI. Every verb that does exist is one click away in the studio, on your own generated tasks.",
        ],
      },
      {
        heading: "The pieces of the tutorial that DO work here",
        paragraphs: [
          "Credit where due: two steps of the reference's flow have real counterparts. 'Inspect before you commit' — the free preview loop, plus the local model viewer for any GLB/GLTF/OBJ/STL you already have. 'Export in the format the next tool wants' — six real formats off any confirmed task, free re-exports forever. Those two steps carry most of a real workspace's value, which is why they were built first and why the upload-and-edit surface was not faked around them.",
          "The metering follows the same shape: generation and preview free, Confirm & Export 1 credit standard and 10 credits agentic, from the 50 credits every account starts with. A tutorial that ends at the meter honestly is worth more than one that ends at a button that isn't there.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I at least view the OBJ/FBX/GLB I already have?",
        a: "Yes — the model viewer parses GLB, GLTF, OBJ, and STL locally in your browser, with orbit and material modes and a live triangle count. Viewing is real; editing is not.",
      },
      {
        q: "What about the BANG decomposition the reference teaches?",
        a: "Also reference-only — see the BANG and Partial Edit article in this blog for its honest status.",
      },
    ],
    related: [
      { label: "Mesh editor status", href: "/blog/edit-3d-models-with-omnicraft-mesh-editor" },
      { label: "BANG / Partial Edit", href: "/blog/use-bang-and-partial-edit" },
      { label: "Model viewer", href: "/workspace/omnicraft/viewer" },
    ],
  },
  {
    slug: "use-bang-and-partial-edit",
    title: "BANG and Partial Edit: Reference-Only, Explained",
    category: "workflow",
    description:
      "BANG separates a model into components; Partial Edit revises a selected region. Neither exists here — and the honest alternatives are full-model.",
    date: "2026-10-23",
    status: "not-in-clone",
    answer:
      "Not implemented. BANG (separating an asset into its component parts) and Partial Edit (revising a selected region while the rest stays untouched) are reference-workspace features with no counterpart in this codebase — there is no region selection and no per-part decomposition anywhere in the studio.",
    sections: [
      {
        heading: "What these features actually are",
        paragraphs: [
          "They are editing precision tools: BANG answers 'make the sword and the hand separate meshes', Partial Edit answers 'change just the collar'. Both require exactly the machinery this clone does not have — a selectable, decomposable mesh representation and a region-restricted regeneration path. The honest full-model equivalents: rerun with a prompt that emphasizes or removes the part you care about, or block the silhouette tighter with a ControlNet before generating.",
          "The export side stays real: a confirmed task exports in six formats, and per-part organization is something your DCC's outliner does better than any web editor anyway. What you lose here is the in-browser precision edit, and no amount of prompt engineering is a region mask — said plainly because pretending otherwise is how demos become lies.",
        ],
      },
      {
        heading: "The workflow that gets you 80% of the way",
        paragraphs: [
          "Decompose-later: generate the whole object here, export OBJ or GLB, and split it into parts in your DCC — one export, one outliner session, the same end state BANG produces, arrived at from a different direction. Region-edit-later: same move — edit in the DCC where region selection is a solved problem, and re-import for viewing here if you want a second opinion. The browser pipeline's job is fast generation and honest exports; the DCC's job is precision surgery.",
          "Is that as convenient as in-browser parts and partial edit? No — and this article would rather say that than sell you a button that isn't in the tree. Convenience claims are cheap; the 1-credit meter and the six real exporters are the expensive parts, and they are the parts that exist.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I select a region in the studio at all?",
        a: "No selection surface exists. Constraints shape the whole mesh; prompts steer the whole mesh; that is the granularity here.",
      },
      {
        q: "Is decomposition on any roadmap?",
        a: "This project states today's implementation and does not publish futures as features. Today: no BANG, no Partial Edit.",
      },
    ],
    related: [
      { label: "Workspace edit flow", href: "/blog/edit-3d-models-in-rodin-workspace" },
      { label: "Prompt engineering", href: "/blog/3d-prompt-engineering" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
  },
  {
    slug: "choose-rodin-model-and-generation-settings",
    title: "Choosing Generation Settings: What the Studio Exposes",
    category: "workflow",
    description:
      "The real settings surface: two generation versions, five effort tiers, four material modes, three ControlNets — and how they map to the reference's model picker.",
    date: "2026-10-22",
    status: "partial",
    answer:
      "The reference's 'choose your Rodin model' popover maps here to a smaller, real set: two generation versions (the standard pipeline and the agent-ready tier), five effort levels, four material modes, and three ControlNet constraint types. Every one of those is wired to the pipeline; what you don't get is the reference's per-model gallery of named checkpoints.",
    sections: [
      {
        heading: "The settings that exist",
        paragraphs: [
          "Generation version: the standard pipeline versus the agent-ready tier — the latter is where agentic tasks (the 10-credit type) live, and it exists to give agents the richer task surface the MCP modal advertises. Effort: five tiers from fastest draft to maximum fidelity; the queue paces each differently, so this is your speed/quality dial. Materials: PBR (full pass), shaded (baked color), all, or none — 'none' being the fastest because it skips texturing entirely. ControlNets: bounding box, voxel, or point cloud, set before generation to constrain the silhouette.",
          "All of that is live UI wired to the real task schema — change a setting and the next task carries it, visibly, on its own card, which is what makes the settings honest: they are not decoration over a fixed pipeline, they are inputs the pipeline provably reads.",
        ],
      },
      {
        heading: "What the reference's picker has that this doesn't",
        paragraphs: [
          "Named model checkpoints with per-model showcase galleries — the reference's marketing surface for 'which engine'. Here the engine story is shorter and stated once: the standard pipeline and the agent-ready tier, with effort and materials as the dials. A picker of named checkpoints would imply a model zoo this codebase does not contain, so the popover you get is the settings that actually exist.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which effort tier should I pick?",
        a: "Draft at the fast tiers, confirm at the higher ones: previews are free, so the affordable loop is quick low-effort looks followed by one high-effort run you actually confirm.",
      },
      {
        q: "What does 'agent-ready' change for me?",
        a: "As a studio user: it is the tier that hosts the agentic task type (10 credits) with its richer messaging cadence. As an agent operator: it is the surface the MCP modal hands over.",
      },
    ],
    related: [
      { label: "Agentic mode", href: "/blog/use-rodin-agentic-mode-for-image-to-3d" },
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
  },
  {
    slug: "use-rodin-agentic-mode-for-image-to-3d",
    title: "Agentic Mode for Generation: What It Is Here",
    category: "image-to-3d",
    description:
      "The agentic task type is real — 10 credits, richer progress cadence, agent-ready tier. The reference's autonomous multi-step image-to-3D is the part that isn't.",
    date: "2026-10-21",
    status: "partial",
    answer:
      "Partially real. The agentic task type exists in this codebase: it is the 10-credit generation tier, carried on the agent-ready version, with its own progress-message cadence in the queue — and the task API accepts an image alongside it, so image-plus-agentic is constructible. What does not exist is the reference's fully autonomous multi-step refinement loop; 'agentic' here names the tier and the agent surface, not a self-driving artist.",
    sections: [
      {
        heading: "What the agentic type actually does here",
        paragraphs: [
          "Create a RodinAgentic task and three things differ from standard: the charge (10 credits rather than 1 — on the pay-by-result flow this lands at confirm), the progress cadence (the queue emits the agentic message set, so the task card narrates more of the pipeline), and the tier's purpose — it exists so the MCP surface can hand agents a task type with a richer contract. Standard and agentic share the pipeline, the preview flow, and the export formats.",
        ],
      },
      {
        heading: "The honest boundary",
        paragraphs: [
          "The reference's article teaches an autonomous flow: drop an image, watch an agent plan and refine across multiple steps. Nothing here plans autonomously — the pipeline is one paced run from input to preview, and 'agentic' is the name of the tier and of the agent-facing contract, not of a loop. If an MCP-connected agent drives generations mid-conversation, the agency is the agent's; this codebase's contribution is the surface it drives. That is the honest version of the word, and it is worth keeping precise.",
        ],
      },
    ],
    faqs: [
      {
        q: "When would I choose agentic?",
        a: "When an agent is driving (the MCP path), or when you want the richer progress narration on a generation you intend to confirm. The trade is 10 credits versus 1 for the standard tier.",
      },
      {
        q: "Does agentic produce better meshes?",
        a: "It produces the same pipeline's output with a different task contract. Any quality claim beyond that would be unanchored, so this article doesn't make one.",
      },
    ],
    related: [
      { label: "MCP article", href: "/blog/connect-hyper3d-rodin-mcp-to-ai-agents" },
      { label: "Generation settings", href: "/blog/choose-rodin-model-and-generation-settings" },
      { label: "MCP feature page", href: "/features/mcp" },
    ],
  },
  {
    slug: "connect-hyper3d-rodin-mcp-to-ai-agents",
    title: "Connecting Agents over MCP: The Real Modal",
    category: "workflow",
    description:
      "The MCP connect modal is live: endpoint, tool surface, copy-ready config. An agent that speaks MCP drives the same pipeline the studio drives.",
    date: "2026-10-20",
    status: "live",
    answer:
      "Live. The studio's MCP connect modal exposes the endpoint, the tool surface, and a copy-ready connection config — drop it into any MCP-capable agent client and the agent can create tasks, poll progress, and fetch exports through the same API the studio UI uses. ('Rodin' in the route is the reference's naming, kept for parity; the modal here is this clone's real one.)",
    sections: [
      {
        heading: "The three-step connect",
        paragraphs: [
          "Open the connect modal from the studio (the /?mcp=1 deep link lands there directly). Copy the configuration it presents — it is formatted for agent clients' MCP server lists, not for humans to retype. Point your agent at it: connected agents create tasks, watch the same progress the task cards show, and pull exports in the six formats, landing results in the same task history the studio displays.",
          "The architecture point that makes this honest: MCP here is a window onto the one pipeline that exists, not a parallel API invented for agents. An agent's generations are ordinary tasks with ordinary metering — the 50-credit grant, 1-per-standard-confirm, 10-per-agentic — visible in the same history.",
        ],
      },
      {
        heading: "What the reference ships that this doesn't",
        paragraphs: [
          "Hosted MCP authentication, per-agent marketplace listings, and the fuller docs set — stated as gaps on the feature page, because the modal is the whole story here and it works. An agent with MCP support and a config block is one paste away from driving generation; everything beyond that surface is reference-only and labeled so.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which agents can connect?",
        a: "Anything that speaks the Model Context Protocol and accepts a server entry — the modal's config is the contract. Coding and chat agents are the common case.",
      },
      {
        q: "Do agent generations cost differently?",
        a: "No — agents hit the same pipeline and the same meter: 1 credit per standard confirm, 10 for the agentic type, from the same balance.",
      },
    ],
    related: [
      { label: "MCP feature page", href: "/features/mcp" },
      { label: "API feature page", href: "/features/api" },
      { label: "Agentic mode", href: "/blog/use-rodin-agentic-mode-for-image-to-3d" },
    ],
  },
];
