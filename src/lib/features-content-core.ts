/**
 * Core + AI-media feature page content (reference sitemap slugs):
 *   text-to-3d, image-to-3d, worldgen, api, chatavatar,
 *   ai-image-generator, ai-video-generator.
 *
 * Copy follows the reference feature-page anatomy (hero → 3 steps →
 * benefits → use cases → FAQ → cross-links → closing CTA), rewritten to
 * describe THIS clone truthfully where the feature is live, and describing
 * the reference's real feature with an honest status note where it is not.
 */
import type { FeaturePageDef } from "./features-types";

export const CORE_FEATURE_PAGES: FeaturePageDef[] = [
  {
    slug: "text-to-3d",
    name: "Text To 3D",
    title: "Text to 3D made easy",
    subline:
      "Create a 3D model from a text prompt with this clone of Hyper3D. Describe an object, prop, product, or printable idea and generate a textured 3D asset for games, AR, design, and 3D printing.",
    status: "live",
    statusChip: "LIVE IN THIS CLONE",
    statusNote:
      "The studio at the root of this site is the real text-to-3D surface: your prompt is planned into a scene spec by the AI backend, previewed as a rotatable poster render, and exported to GLB, OBJ, FBX, STL, or USDZ. Every generation you run here is a real task in your history — with real credits and a pay-by-result confirm gate where it applies.",
    cta: { label: "Start Creating", href: "/" },
    ctaSecondary: { label: "See How It Works", href: "/#how-it-works" },
    stepsTitle: "How to Generate a 3D Model from Text",
    stepsIntro:
      "Three steps in the studio, from sentence to exportable asset — no modeling software opened anywhere in the loop.",
    steps: [
      {
        title: "Write a Clear Text Prompt",
        body: "Describe the object, material, and intended use. The studio's planner turns props, characters, product concepts, collectibles, and printable models into a structured scene spec — and the prompt polish endpoint helps you tighten a vague idea first.",
      },
      {
        title: "Generate Geometry and Textures",
        body: "The AI backend interprets your prompt into 3D shape, proportions, surface detail, and materials, so you move from text to model without manual modeling. Optional ControlNet constraints can pin exact proportions, occupancy, or a voxel-marked silhouette before you generate.",
      },
      {
        title: "Preview, Refine, and Export",
        body: "Review the generated model in the real 3D viewer, redo materials or re-orient it, then export to GLB, OBJ, FBX, STL, or USDZ for real-time workflows or printing.",
      },
    ],
    benefitsTitle: "Why Choose This Clone for Text to 3D Generation?",
    benefitsIntro:
      "The honest strengths of what is actually running here — a full task pipeline, not a mockup.",
    benefits: [
      {
        title: "Prompt-Driven 3D Creation",
        body: "Start with natural language and generate a textured 3D model without opening Blender, Maya, or CAD software. The planner, queue, and viewer are all real code paths in this clone.",
      },
      {
        title: "Fast Creative Iteration",
        body: "Regenerate, polish the prompt, or redo materials on a finished task. The working-state sidebar keeps the full history rail one click away.",
      },
      {
        title: "Game, AR, and Print Ready",
        body: "Outputs export as GLB, OBJ, FBX, STL, and USDZ from the exact bytes the viewer previewed — the export tests byte-check this contract.",
      },
      {
        title: "Shape Control via ControlNet",
        body: "Draw a bounding box or mark voxels and the generated spec is proportion-wrapped to your constraint — measured from the real built extents, not faked.",
      },
      {
        title: "Free to Start",
        body: "Sign-up grants a 40-credit wallet; text-to-3D tasks cost real credits through the same confirm-first gate the reference uses.",
      },
    ],
    useCasesTitle: "Who Uses an AI Text to 3D Model Generator?",
    useCasesIntro: "The same audiences the reference serves — on this clone's real pipeline.",
    useCases: [
      {
        tag: "Game development",
        title: "Game Developers",
        body: "Turn text into props, weapons, and environment pieces, then export GLB straight into Unity, Godot, or Unreal.",
      },
      {
        tag: "E-commerce renders",
        title: "Product Designers",
        body: "Turn written briefs into 3D product concepts and stakeholder-ready poster renders.",
      },
      {
        tag: "3D Printing",
        title: "3D Printing Makers",
        body: "Generate figurines, tabletop parts, and ornaments, then export STL for slicing.",
      },
      {
        tag: "Concept art",
        title: "Artists & Creators",
        body: "Explore stylized directions quickly — every task stays in your history with its full spec.",
      },
    ],
    faqTitle: "Frequently Asked Questions About Text to 3D",
    faqIntro: "Questions the reference answers — answered here for what this clone actually does.",
    faq: [
      {
        q: "How should I describe the visual direction for text-to-3D?",
        a: "Name the object, its material, and the intended use — 'a ceramic coffee mug, matte glaze, game asset' beats 'mug'. The prompt polish endpoint can rewrite a rough idea into a tighter prompt before you spend credits.",
      },
      {
        q: "Can I generate low-poly game assets from text?",
        a: "Yes — ask for a low-poly or stylized direction in the prompt and the planner biases the scene spec toward simple primitives and flat palettes. The export is the exact geometry the viewer previewed.",
      },
      {
        q: "Does text to 3D work with Unity and Unreal Engine?",
        a: "Exports are standard GLB, FBX, and OBJ, which import directly into Unity, Unreal, Godot, and Blender. USDZ covers AR/quick-look workflows.",
      },
      {
        q: "Can text to 3D models include textures?",
        a: "Yes — generated models carry vertex colors and materials from the planned palette, and the studio's material redo can repaint a finished task without regenerating geometry.",
      },
      {
        q: "Is this clone free for text to 3D generation?",
        a: "Sign-up grants a 40-credit wallet. Tasks charge through the same confirm-first pay-by-result gate the reference uses — you see the cost before you commit.",
      },
      {
        q: "Can I export text to 3D models as STL, GLB, OBJ, or FBX?",
        a: "All five export formats (GLB, GLTF, OBJ, FBX, STL, USDZ) are produced from the task's real spec, and the download is byte-checked against the viewer preview.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The other generation surfaces this clone ships.",
    crossLinks: [
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "ControlNet constraints", href: "/#how-it-works" },
      { label: "API", href: "/features/api" },
      { label: "MCP", href: "/features/mcp" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Try the Text to 3D Generator Today",
    closingBody:
      "One sentence in, an exportable model out — with real ControlNet shape control when you need it.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "core",
    indexBlurb: "From text prompt to 3D object — instantly, with real exports.",
  },
  {
    slug: "image-to-3d",
    name: "Image To 3D",
    title: "Image to 3D generation",
    subline:
      "One image is enough to generate most objects. Upload a reference, let the vision model caption it into a prompt, and generate a textured 3D asset — with optional extra views when you want more control.",
    status: "live",
    statusChip: "LIVE IN THIS CLONE",
    statusNote:
      "The studio's image path is real: your uploaded image is captioned by the vision model into a prompt (the same rodin_mesh_image_process flow the reference exposes), then planned into a scene spec and previewed in the 3D viewer. The neural path streams the browser's mesh to the engine with pay-by-result confirmation.",
    cta: { label: "Start Creating", href: "/" },
    ctaSecondary: { label: "See How It Works", href: "/#how-it-works" },
    stepsTitle: "From Picture to Model in Three Steps",
    stepsIntro:
      "The image pipeline this clone actually runs — captioning, planning, export.",
    steps: [
      {
        title: "Upload a Reference Image",
        body: "Drop a JPG, PNG, or WebP. The studio accepts the same formats the reference's input card does, at uploaded fidelity — no silent downsampling.",
      },
      {
        title: "Automatic Image Analysis",
        body: "The vision model captions your image into a descriptive prompt ('A red fresh apple. simple geometry.' style), which you can edit before generating — the same auto-analysis step the reference fires on upload.",
      },
      {
        title: "Generate, Preview, and Export",
        body: "The captioned prompt drives the same planner, viewer, and five-format export pipeline as text-to-3D. The neural path additionally builds a real mesh from your image with a confirm-first credit charge.",
      },
    ],
    benefitsTitle: "Why Choose This Clone for Image to 3D?",
    benefitsIntro: "What the real pipeline gives you for turning pictures into models.",
    benefits: [
      {
        title: "Automatic Captioning",
        body: "The vision model writes the prompt from your image, so a photo alone is enough to start — you keep full editing control over the caption before spending credits.",
      },
      {
        title: "Optional ControlNet Constraints",
        body: "Mark proportions on your reference before generating — bounding boxes and voxel silhouettes wrap the result to the shape you drew.",
      },
      {
        title: "Neural Mesh Path",
        body: "Beyond the procedural pipeline, the neural path converts your image into a real high-detail mesh streamed from the browser, with pay-by-result pricing.",
      },
      {
        title: "Everything Stays in History",
        body: "Each image task keeps its reference, caption, spec, and poster render in your task rail — reopen or export any of it later.",
      },
    ],
    useCasesTitle: "Image to 3D for Every Pipeline",
    useCasesIntro: "Where a single reference image beats a paragraph of text.",
    useCases: [
      {
        tag: "E-commerce",
        title: "Product Photos to Models",
        body: "Turn catalog photos into AR-ready GLB/USDZ assets for product pages and quick-look previews.",
      },
      {
        tag: "Concept art",
        title: "Concept Art Blocking",
        body: "Recreate a sketch as real geometry, then iterate materials and proportions with ControlNet constraints.",
      },
      {
        tag: "3D Printing",
        title: "Photo to Printable",
        body: "Photograph a physical object, generate the model, and export STL for reprinting or remixing it.",
      },
    ],
    faqTitle: "Frequently Asked Questions About Image to 3D",
    faqIntro: "The reference's questions, answered for this clone's real behavior.",
    faq: [
      {
        q: "What image formats can I upload?",
        a: "JPG, PNG, and WebP — the same set the reference's input card accepts. Images are passed to the engine at their uploaded fidelity; this clone does not ship an upscaler.",
      },
      {
        q: "Do I have to write a prompt too?",
        a: "No — the vision model captions your image automatically. The caption is editable, and adding a short style note (material, era, palette) sharpens the result.",
      },
      {
        q: "Can multiple views improve the result?",
        a: "Yes, the same way as the reference: additional views refine detail. The studio's direction picker helps you choose which extra angles to supply.",
      },
      {
        q: "How is the neural path different?",
        a: "The standard path plans a clean scene spec from your image. The neural path builds a detailed organic mesh (the browser's artifact) and charges pay-by-result after you confirm.",
      },
      {
        q: "Are my uploads stored?",
        a: "Image tasks keep the reference with the task record so history stays meaningful. The Model Viewer tool, by contrast, is fully local and never uploads anything.",
      },
      {
        q: "What does it cost?",
        a: "Standard generation costs credits from your wallet (40 at sign-up); the neural path shows its exact price on a confirm-first gate before charging.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "Sibling generation surfaces in this clone.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "WorldGen", href: "/features/worldgen" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "MCP", href: "/features/mcp" },
    ],
    closingTitle: "One Image Is Enough",
    closingBody: "Upload a reference, check the caption, generate — and export in all five formats.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "core",
    indexBlurb: "One image is enough — auto-captioned, then generated.",
  },
  {
    slug: "worldgen",
    name: "WorldGen",
    title: "WorldGen — images into editable 3D worlds",
    subline:
      "The reference turns images into editable 3D worlds with independent objects and realistic physical relationships. This page describes that feature honestly — including what this clone ships instead.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "WorldGen is a full scene-composition product of the reference: it decomposes an image into multiple independent, editable objects with physical placement. This clone's studio generates single-asset scene specs (one task, one coherent object) — multi-object world decomposition is not implemented, and no page here will pretend otherwise. The closest real capability is the studio's spec system, which can hold several primitives in one model.",
    cta: null,
    ctaSecondary: { label: "See what the studio does ship", href: "/" },
    stepsTitle: "How WorldGen Works in the Reference",
    stepsIntro: "The reference's observed flow, for comparison with this clone's scope.",
    steps: [
      {
        title: "Upload a Scene Image",
        body: "The reference accepts a full scene — a room, a street, a landscape — rather than a single object cutout.",
      },
      {
        title: "Decomposition into Objects",
        body: "Its engine separates the scene into independent objects with real-world physical relationships: a table supports a vase, walls occlude a window.",
      },
      {
        title: "Editable World Output",
        body: "Each object can be selected, regenerated, or replaced inside an editable world — a composition tool, not a single-mesh generator.",
      },
    ],
    benefitsTitle: "What Makes WorldGen Distinct",
    benefitsIntro: "Why it is a product of its own in the reference — and out of scope here.",
    benefits: [
      {
        title: "Independent Objects",
        body: "A generated world is a scene graph, not one fused mesh — the property that makes editing meaningful.",
      },
      {
        title: "Physical Relationships",
        body: "Objects sit on, lean against, and occlude each other plausibly, which single-object generators do not model.",
      },
      {
        title: "Scene-Scale Input",
        body: "The input contract is a whole photograph of an environment, not a clean object shot.",
      },
      {
        title: "Iterative Refit",
        body: "Swap or regenerate individual objects without rebuilding the world around them.",
      },
    ],
    useCasesTitle: "What WorldGen Is For",
    useCasesIntro: "The reference's audiences for scene-level generation.",
    useCases: [
      {
        tag: "Game development",
        title: "Level Blocking",
        body: "Turn concept art of a location into a walkable greybox with individually editable props.",
      },
      {
        tag: "Virtual Production",
        title: "Set Reconstruction",
        body: "Rebuild a photographed set as a 3D environment you can relight and redress shot by shot.",
      },
      {
        tag: "VR/AR",
        title: "Scene Population",
        body: "Fill an AR scene with the objects a single reference photo contains.",
      },
    ],
    faqTitle: "Frequently Asked Questions About WorldGen",
    faqIntro: "Answered honestly for this clone.",
    faq: [
      {
        q: "Is WorldGen available in this clone?",
        a: "No. Multi-object world decomposition is not implemented here. The studio generates single coherent assets per task; the spec system can compose primitives, but not from a scene photo.",
      },
      {
        q: "What is the closest thing this clone has?",
        a: "The studio's text-to-3D with ControlNet constraints — you control proportions and silhouette of a single generated object. The procedural spec can include several primitives arranged by the planner.",
      },
      {
        q: "Will it be added?",
        a: "Only if it can be made real rather than decorative. This page exists so the link never pretends the feature is here when it is not.",
      },
      {
        q: "Where can I read the reference's version?",
        a: "On the reference site's WorldGen feature page and its workspace — this page documents the gap on purpose.",
      },
      {
        q: "Does the API cover WorldGen?",
        a: "The reference's API exposes world generation endpoints; this clone's API covers the task pipeline it actually implements (see the API feature page).",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real, working surfaces closest to WorldGen's intent.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "OmniCraft toolbag", href: "/omnicraft" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
    ],
    closingTitle: "Single Assets, Done Honestly",
    closingBody:
      "While WorldGen is not here, the studio's single-asset pipeline is real end to end — try it with a scene object.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "core",
    indexBlurb: "Reference-only: editable multi-object worlds — this clone generates single assets.",
  },
  {
    slug: "api",
    name: "API",
    title: "API — plug generation into your workflow",
    subline:
      "The reference exposes a REST API with keys, billing, and engine selection. This clone ships a smaller, real HTTP surface for its own studio — this page documents both, honestly.",
    status: "partial",
    statusChip: "PARTIAL — APP API ONLY",
    statusNote:
      "What is real here: the studio runs entirely on this clone's own HTTP API — session auth (sign-up/sign-in/sign-out), the task pipeline (create, progress, preview, confirm, export, redo, like, cancel, history, prompt polish, image analysis), user info, and a health check. What is not here: a public developer program — no API keys, no per-key billing, no engine/version selector. The endpoints below exist to serve the app, not to be a product.",
    cta: { label: "Open the Studio that uses it", href: "/" },
    ctaSecondary: { label: "Health endpoint", href: "/api/healthz" },
    stepsTitle: "The Reference's API in Three Steps",
    stepsIntro: "How the real product's developer flow works, for comparison.",
    steps: [
      {
        title: "Get an API Key",
        body: "The reference issues keys from the dashboard, tied to a billing plan and credit balance.",
      },
      {
        title: "POST a Generation",
        body: "Bearer-authenticated requests to api.hyper3d.com create rodin tasks — image-to-3D, text-to-3D, agentic modes — with engine and effort parameters.",
      },
      {
        title: "Poll and Fetch",
        body: "Task status endpoints stream progress; finished tasks return signed download URLs for meshes and textures on the file CDN.",
      },
    ],
    benefitsTitle: "What This Clone's API Actually Is",
    benefitsIntro: "The honest inventory of the HTTP surface running this app.",
    benefits: [
      {
        title: "Real Task Pipeline",
        body: "POST /api/task creates generations; progress, preview, confirm, export, redo, like, and cancel all exist as endpoints the studio calls.",
      },
      {
        title: "Session Auth",
        body: "Sign-up, sign-in, and sign-out with cookie sessions; the wallet and referral system ride on the same user records.",
      },
      {
        title: "Prompt Services",
        body: "Prompt polish and rodin_mesh_image_process (image captioning) are real endpoints the input card uses.",
      },
      {
        title: "Health Check",
        body: "GET /api/healthz reports AI backend and database reachability — the same probe this clone's deploy verification uses.",
      },
      {
        title: "What It Is Not",
        body: "No API keys, no public billing, no engine selector. If you need the developer product, that is the reference's API, not this clone's.",
      },
    ],
    useCasesTitle: "Who Is Each API For?",
    useCasesIntro: "Matching the right surface to the right need.",
    useCases: [
      {
        tag: "This clone",
        title: "Studying the App Architecture",
        body: "The API surface mirrors the reference's observed XHR contract (task lifecycle, image analysis, user info) — useful for understanding how the product hangs together.",
      },
      {
        tag: "Reference",
        title: "Building Products on Generation",
        body: "The reference's key-based API with credit billing is the real developer product for shipping apps that generate 3D.",
      },
      {
        tag: "Agents",
        title: "MCP Instead of REST",
        body: "For agentic access to this clone's tools, the MCP connect modal is the supported path — see the MCP feature page.",
      },
    ],
    faqTitle: "Frequently Asked Questions About the API",
    faqIntro: "Honest answers about what the endpoints here do and do not offer.",
    faq: [
      {
        q: "Can I get an API key for this clone?",
        a: "No — there is no key issuance. The HTTP API exists to serve the studio's own frontend. The reference's key-based API is the real developer product.",
      },
      {
        q: "Which endpoints exist?",
        a: "Session auth (sign-up/in/out), the task lifecycle (create, progress, preview, confirm, export, redo, like, cancel, card, history, list, prompt_polish, rodin_mesh_image_process), user get_info, and healthz.",
      },
      {
        q: "Is the request/response shape like the reference's?",
        a: "Deliberately close where observed — the task card, history, and image-analysis contracts follow the reference's API blueprint captured in recon.",
      },
      {
        q: "How do agents connect?",
        a: "Through the MCP endpoint documented in the studio's connect modal — that is this clone's story for programmatic access.",
      },
      {
        q: "Where do generated files come from?",
        a: "Exports are generated from the task's stored spec on demand and served through the export endpoint — no external CDN in this clone.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The surfaces that sit on this API.",
    crossLinks: [
      { label: "MCP", href: "/features/mcp" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
      { label: "OmniCraft toolbag", href: "/omnicraft" },
    ],
    closingTitle: "The API That Runs This Studio Is Real",
    closingBody:
      "Browse the network tab while you generate — every task, poll, and export on this site is this clone's own HTTP surface.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "core",
    indexBlurb: "Partial: the app's real task/auth endpoints; no public key program.",
  },
  {
    slug: "chatavatar",
    name: "ChatAvatar",
    title: "ChatAvatar — text and image to 3D avatars",
    subline:
      "The reference's dedicated avatar product turns text or images into 3D avatars with commercial licensing. This page describes that product honestly — this clone does not ship it.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "ChatAvatar is a separate workspace product of the reference (/workspace/chatavatar) with avatar-specific generation, rigging, and commercial licensing terms. This clone implements one studio — the Rodin-style general generator. Avatar-specialized pipelines (auto-rigging, blendshapes, avatar licensing) are not implemented, and the general studio is not a substitute for them.",
    cta: null,
    ctaSecondary: { label: "See what the studio does ship", href: "/" },
    stepsTitle: "How ChatAvatar Works in the Reference",
    stepsIntro: "The reference's observed avatar flow.",
    steps: [
      {
        title: "Describe or Upload",
        body: "A text description of a character, or reference images including face photos, seed the avatar generation.",
      },
      {
        title: "Avatar-Tuned Generation",
        body: "The engine generates humanoid topology with face enhancement options — the observed rodin_mesh_image_process parameters include allow_face_enhance for exactly this.",
      },
      {
        title: "Commercial-Ready Output",
        body: "The product's licensing terms cover commercial avatar use, which general-purpose generators do not automatically grant.",
      },
    ],
    benefitsTitle: "What an Avatar Product Adds",
    benefitsIntro: "Beyond what a general 3D generator covers.",
    benefits: [
      {
        title: "Humanoid Topology",
        body: "Avatar meshes come out rigged-or-riggable rather than as static organic blobs.",
      },
      {
        title: "Face Enhancement",
        body: "Optional face enhancement reconstructs likeness detail — a distinct model path from body geometry.",
      },
      {
        title: "Licensing Clarity",
        body: "Commercial avatar use is explicitly licensed, which matters for VTubing, games, and virtual presenters.",
      },
      {
        title: "Chat Integration",
        body: "The reference positions avatars alongside conversational products — a different surface than asset generation.",
      },
    ],
    useCasesTitle: "Who Uses ChatAvatar",
    useCasesIntro: "The reference's avatar audiences.",
    useCases: [
      {
        tag: "VTubing",
        title: "VTuber Personas",
        body: "Turn character art or descriptions into 3D personas for streaming.",
      },
      {
        tag: "Game development",
        title: "NPC Pipelines",
        body: "Populate games with generated humanoid background casts.",
      },
      {
        tag: "E-commerce",
        title: "Virtual Presenters",
        body: "Brand avatars for storefronts and marketing video.",
      },
    ],
    faqTitle: "Frequently Asked Questions About ChatAvatar",
    faqIntro: "Answered honestly for this clone.",
    faq: [
      {
        q: "Can this clone generate avatars?",
        a: "It can generate character-like single assets through the general studio — but no avatar-specific topology, rigging, face enhancement, or avatar licensing exists here.",
      },
      {
        q: "Why keep this page then?",
        a: "Route and content parity with honesty: the reference's nav links ChatAvatar, so the clone resolves the link and tells the truth about what is behind it.",
      },
      {
        q: "What would it take to implement?",
        a: "An avatar-tuned generation path with rigging output — out of scope for this clone's engine wiring.",
      },
      {
        q: "Is the face-enhance parameter real here?",
        a: "The image-analysis contract (including the allow_face_enhance field) is faithfully reproduced in this clone's API surface, but no avatar pipeline consumes it.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "The general generation surfaces that do exist here.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "WorldGen", href: "/features/worldgen" },
      { label: "OmniCraft toolbag", href: "/omnicraft" },
    ],
    closingTitle: "Characters Yes, Avatar Product No",
    closingBody:
      "The general studio can still make a character asset from text or image — just without the avatar-specific pipeline.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "core",
    indexBlurb: "Reference-only: dedicated avatar pipeline with commercial licensing.",
  },
  {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    title: "AI Image Generator",
    subline:
      "The reference generates images for art, design, and marketing alongside its 3D tools. This clone's image generation surface is narrower — this page states exactly where.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "The reference's AI Image Generator is a full text-to-image product in its AI Media suite. This clone wires no text-to-image model: the image surfaces that DO exist here are the studio's reference-image upload for image-to-3D, the vision captioning that reads your uploads, and the OmniCraft HDRI generator's real image-palette extraction. A general-purpose prompt-to-image tool is not among them.",
    cta: null,
    ctaSecondary: { label: "See the HDRI generator", href: "/omnicraft/hdri" },
    stepsTitle: "What the Reference's Image Generator Does",
    stepsIntro: "The product this page stands in for.",
    steps: [
      {
        title: "Prompt to Image",
        body: "Text prompts generate images in the reference's AI Media workspace, alongside its video generator.",
      },
      {
        title: "Styles and Iteration",
        body: "Style presets and regeneration loops refine art direction without leaving the browser.",
      },
      {
        title: "Feeds 3D Pipelines",
        body: "Generated images become reference inputs for image-to-3D — the media suite and the 3D suite interlock.",
      },
    ],
    benefitsTitle: "Why an Image Generator Sits Next to 3D Tools",
    benefitsIntro: "The reference's reasoning — and this clone's honest gaps.",
    benefits: [
      {
        title: "Reference Generation",
        body: "Making your own starting image beats hunting stock — then the 3D pipeline consumes it.",
      },
      {
        title: "Art Direction at Speed",
        body: "Iterating mood and palette in 2D is cheaper than iterating in 3D.",
      },
      {
        title: "What Exists Here Instead",
        body: "The HDRI generator produces real images (skyboxes) from prompts — procedurally, locally, deterministically. That is the honest image-generation surface in this clone.",
      },
      {
        title: "Vision, Not Generation",
        body: "This clone's models look at images (captioning for image-to-3D) rather than paint them — the reverse skill.",
      },
    ],
    useCasesTitle: "Who Uses an AI Image Generator",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Marketing",
        title: "Campaign Visuals",
        body: "Generate hero art and ad variants at volume.",
      },
      {
        tag: "Game development",
        title: "Concept Iteration",
        body: "Explore mood boards and key art before committing to 3D.",
      },
      {
        tag: "This clone",
        title: "Environment Lighting",
        body: "The honest equivalent here: prompt-seeded procedural skyboxes for lighting and backdrops.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can this clone generate images from prompts?",
        a: "Only one kind: HDRI skyboxes, procedurally and locally in your browser, with deterministic seeds. Not general-purpose text-to-image.",
      },
      {
        q: "Can I still use generated images with image-to-3D here?",
        a: "Yes — any image you make elsewhere uploads fine as a reference; the captioning and generation pipeline is real.",
      },
      {
        q: "Why is this page here at all?",
        a: "Parity with honesty: the nav and footer link it, so the route resolves to a truthful account instead of a dead toast.",
      },
      {
        q: "Is image enhancement available?",
        a: "No — see the Image Enhancer page for that gap; uploads pass through at original fidelity.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real image-adjacent surfaces here.",
    crossLinks: [
      { label: "HDRI Generator", href: "/omnicraft/hdri" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "AI Image Enhancer", href: "/features/omnicraft/ai-image-enhancer" },
      { label: "OmniCraft toolbag", href: "/omnicraft" },
    ],
    closingTitle: "The Real Image Surface Here Is HDRI",
    closingBody: "Prompt a sky, get a 360° environment — locally, deterministically, free.",
    closingCta: { label: "Open the HDRI Generator", href: "/omnicraft/hdri" },
    group: "ai-media",
    indexBlurb: "Reference-only: prompt-to-image suite; this clone's HDRI engine is the real image surface.",
  },
  {
    slug: "ai-video-generator",
    name: "AI Video Generator",
    title: "AI Video Generator",
    subline:
      "The reference's AI Media suite includes prompt-to-video generation for motion, ads, and social content. This clone ships no video generation — this page is the honest record of that gap.",
    status: "reference-only",
    statusChip: "REFERENCE-ONLY",
    statusNote:
      "The reference's video product lives at its video workspace and generates moving footage from prompts or images. Video generation requires dedicated motion models this clone does not wire — nothing on this site renders or serves generated video. The real 'moving picture' surface here is the studio's live 3D preview: draggable, auto-rotating, and fed by real generation progress.",
    cta: null,
    ctaSecondary: { label: "See the live 3D preview instead", href: "/" },
    stepsTitle: "What the Reference's Video Generator Does",
    stepsIntro: "The product this page documents the absence of.",
    steps: [
      {
        title: "Prompt or Image to Video",
        body: "The reference's video workspace turns prompts or images into short generated clips.",
      },
      {
        title: "Motion Direction",
        body: "Camera moves and subject motion are part of the prompt contract — motion is the product.",
      },
      {
        title: "Feeds 3D Showcases",
        body: "Generated video showcases 3D assets in motion — the media and 3D suites interlock there too.",
      },
    ],
    benefitsTitle: "Why Video Generation Matters",
    benefitsIntro: "What motion adds — and what the honest local equivalents are.",
    benefits: [
      {
        title: "Motion Sells Depth",
        body: "Turning and lighting a model shows form better than any still — which is why the studio's viewer auto-rotates.",
      },
      {
        title: "Content at Speed",
        body: "Ad and social variants in volume is the reference's pitch; that pipeline is not here.",
      },
      {
        title: "What Exists Here",
        body: "A real-time 3D preview you can drag, spin, and screenshot — plus GLB/USDZ exports that carry motion into AR and engines.",
      },
      {
        title: "What Does Not",
        body: "No video rendering, no prompt-to-motion, no clip library. This page exists so the link never implies otherwise.",
      },
    ],
    useCasesTitle: "Who Uses an AI Video Generator",
    useCasesIntro: "The reference's audiences.",
    useCases: [
      {
        tag: "Marketing",
        title: "Ad Motion",
        body: "Product clips for social funnels, cut from prompt variations of the same hero shot.",
      },
      {
        tag: "Pre-production",
        title: "Storyboards in Motion",
        body: "Animated previz for pitches — boards become rough footage before any 3D work is budgeted.",
      },
      {
        tag: "This clone",
        title: "Interactive Preview",
        body: "The honest substitute: your generated model, draggable in the browser right now.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqIntro: "Honest answers for this clone.",
    faq: [
      {
        q: "Can this clone generate video?",
        a: "No. No video model is wired; nothing here renders clips. The live 3D preview is the closest real experience.",
      },
      {
        q: "Can I export my 3D model for video work?",
        a: "Yes — GLB and FBX exports drop straight into Blender, Unreal, or Unity for rendering your own footage.",
      },
      {
        q: "Is AR/quick-look output available?",
        a: "Yes, USDZ export is real — models can be placed in AR viewers that support it.",
      },
      {
        q: "Why keep the page?",
        a: "The footer and nav of the reference link a video generator; this clone resolves that link with the truth instead of a dead toast.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real surfaces adjacent to motion.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/omnicraft/viewer" },
      { label: "AI Image Generator", href: "/features/ai-image-generator" },
      { label: "OmniCraft toolbag", href: "/omnicraft" },
    ],
    closingTitle: "No Video Here — But Your Model Moves Today",
    closingBody: "Drag, spin, and orbit the real preview, then export into a renderer that makes motion.",
    closingCta: { label: "Open the Studio", href: "/" },
    group: "ai-media",
    indexBlurb: "Reference-only: prompt-to-video suite; the live 3D preview is the honest substitute.",
  },
];
