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
import { STUDIO_PATH } from "./studio-path";

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
    cta: { label: "Start Creating", href: STUDIO_PATH },
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
        body: "Sign-up grants a 50-credit wallet; text-to-3D tasks cost real credits through the same confirm-first gate the reference uses.",
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
    promptExamples: {
      title: "Text to 3D Prompt Examples",
      intro:
        "Copy-paste prompts for this clone's own compiler path — every note says what really happens here. The rules cited are the pipeline's actual constraints, not marketing copy.",
      cards: [
        {
          prompt: "A red fresh apple with a short stem, simple geometry",
          note: "The compiler's own documented example: the palette rule maps 'red apple' to reds, browns, and greens, and the spec lands as a two-object build (sphere fruit, cylinder stem). If the model output ever fails validation, the deterministic fallback builds a 4-object pedestal scene from the same keyword palette — generation never hard-fails.",
        },
        {
          prompt: "A brass table lamp: cylinder base, slim pole, cone shade",
          note: "Naming primitives pays off — the spec vocabulary is exactly box, sphere, cylinder, cone, torus, lathe, and extrude, so shape words steer the build directly. Dimensions land in the 0.05–4 range the validator enforces.",
        },
        {
          prompt: "A ceramic mug with a torus handle, glossy teal glaze",
          note: "Material words ('glossy', 'matte', 'brass', 'glaze') set metalness and roughness on the generated materials; color words feed the palette the whole scene shares.",
        },
        {
          prompt: "A tiny market stall: box table, four crates, striped awning",
          note: "Multi-object scenes are the point — a spec may carry 2 to 12 objects with their own transforms, composed ground-level so it reads well from the 3/4 camera angle.",
        },
      ],
    },
    techCards: {
      title: "AI Technology Behind Text to 3D Model Generation",
      intro:
        "The reference reconstructs meshes with a neural generator. This clone's real path is different and fully visible: a language model compiles your prompt into a strict scene spec, and deterministic code builds the mesh. Both are real — only one of them is neural.",
      cards: [
        {
          title: "Prompt → Strict SceneSpec",
          body: "The text-to-3D provider sends your prompt to a chat model under a strict system contract: output ONLY a SceneSpec JSON document. Whatever comes back is validated against a strict schema — unknown keys or out-of-range numbers are rejected, not guessed at.",
        },
        {
          title: "A Real Primitive Vocabulary",
          body: "A spec composes 2–12 objects from seven primitive types — box, sphere, cylinder, cone, torus, lathe, extrude — with per-object transforms, materials, and a scene-wide palette. That vocabulary is the whole geometry engine's input language.",
        },
        {
          title: "Keyword Palettes, Deterministic Fallback",
          body: "Colors come from the prompt's own keywords, and when a model response fails validation the pipeline falls back to a deterministic spec built from the same palette — so a task always produces geometry instead of an error page.",
        },
        {
          title: "From Spec to Six Formats",
          body: "The mesh builder turns the spec into real geometry, and the exporter serves it in the same six formats the studio offers everywhere: GLB, glTF, FBX, OBJ, STL, and USDZ — generated from the task's stored spec on demand.",
        },
      ],
    },
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
        a: "Sign-up grants a 50-credit wallet. Tasks charge through the same confirm-first pay-by-result gate the reference uses — you see the cost before you commit.",
      },
      {
        q: "Can I export text to 3D models as STL, GLB, OBJ, or FBX?",
        a: "All five export formats (GLB, GLTF, OBJ, FBX, STL, USDZ) are produced from the task's real spec, and the download is byte-checked against the viewer preview.",
      },
      {
        q: "How long can my prompt be?",
        a: "Prompts are accepted up to 2000 characters. The task card in the studio shows the exact prompt text that was compiled, and the token usage the compilation consumed is recorded on the task's usage block.",
      },
      {
        q: "Can I make the same model twice?",
        a: "Yes — tasks accept a 0–65535 seed. The same prompt with the same seed reproduces the same result on the deterministic path; a different seed varies it. Both are plain fields on the task you create.",
      },
      {
        q: "What happens if the model returns something invalid?",
        a: "Nothing catastrophic — the validator rejects it and the pipeline falls back to a deterministic spec built from your prompt's keyword palette. You still get a previewable, exportable model; the task history records what happened.",
      },
      {
        q: "Are my prompts private?",
        a: "Tasks can be marked private, which excludes them from the featured and public gallery. Your history is yours either way — visible only to your signed-in session.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The other generation surfaces this clone ships.",
    crossLinks: [
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "ControlNet constraints", href: "/#how-it-works" },
      { label: "API", href: "/features/api" },
      { label: "MCP", href: "/features/mcp" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
    ],
    closingTitle: "Try the Text to 3D Generator Today",
    closingBody:
      "One sentence in, an exportable model out — with real ControlNet shape control when you need it.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
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
    cta: { label: "Start Creating", href: STUDIO_PATH },
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
    researchNote: {
      title: "Built on award-winning 3D research",
      body: "That sentence is the reference's story, and it is true of the reference: Hyper3D's Rodin engines come out of published, award-winning 3D reconstruction research, and the company presents that lineage on this very page. It is not this clone's story. This site is a product-surface reimplementation — the page you are reading documents the reference's shape and this codebase's own real behavior, and nothing here descends from the reference's research, inherits its models, or shares its lineage. No awards, no papers — just working code, stated plainly.",
    },
    techCards: {
      title: "The AI Behind Image to 3D Here",
      intro:
        "The reference's page lists its neural stages: image understanding, 3D reconstruction, texture generation. This clone's real pipeline is shorter and fully inspectable — these are the stages that actually run when you press generate.",
      cards: [
        {
          title: "Image Understanding — Real Vision Captioning",
          body: "Your upload goes to a real vision model through the image-analysis endpoint, which returns the editable caption the input card shows. That caption — not a black box — is what drives the rest of the pipeline, so you can correct it before spending anything.",
        },
        {
          title: "Reconstruction — Spec-Driven, Not Neural",
          body: "The standard path compiles the caption into a strict scene spec and builds mesh from it deterministically. There is no neural reconstruction on this path — that is the reference's stage, not this clone's. The optional neural engine tier exists for organic meshes, pay-by-result at confirm.",
        },
        {
          title: "Shape Control via ControlNet",
          body: "Draw a bounding box or paint voxels before generating, and the task carries the constraint — aspect, fill, anchors — into the spec planner. Point-cloud mode is part of the same schema. The editors are real and their state is what the API receives.",
        },
        {
          title: "Multiview and the Fast Fallback",
          body: "Up to four extra view images can refine a neural task — the direction picker exists to choose them. And if the neural tier stalls, a watchdog falls back to the fast in-house path after 75 seconds rather than leaving you on a spinner.",
        },
      ],
    },
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
        a: "Standard generation costs credits from your wallet (50 at sign-up); the neural path shows its exact price on a confirm-first gate before charging.",
      },
      {
        q: "Is the neural reconstruction the same as the reference's?",
        a: "No — and the page says so rather than implying it. The reference's image-to-3D is a research-lineage neural reconstructor. This clone's standard path is spec-driven geometry from a caption; the optional neural tier is a different real engine, offered pay-by-result. Fidelity claims beyond that would be fiction.",
      },
      {
        q: "Can I use a drawing or sketch instead of a photo?",
        a: "Yes — the vision model captions sketches as readily as photographs, and concept-art blocking is one of the page's own use cases. The caption is editable, so you can correct the model's reading of a stylized drawing before generating.",
      },
      {
        q: "What happens if generation stalls?",
        a: "The pipeline has a real watchdog: a neural task that stalls for 75 seconds falls back to the fast in-house path automatically. The task's history entry shows which engine actually produced the result — nothing is silently retried.",
      },
      {
        q: "How do ControlNet constraints reach the model?",
        a: "The bbox and voxel editors produce a constraint object — mode, aspect ratio triple, fill, anchor count — that rides on the task itself. The API page documents the exact schema; the editors are just a friendly way to produce it.",
      },
      {
        q: "How large can my uploads be?",
        a: "A reference image is accepted up to 8 megabytes, as a data URL or bare base64 — the same envelope the task schema enforces on the wire. Multiview images are capped at four extras of 4 megabytes each, which is generous for view shots and deliberately not for photo libraries.",
      },
      {
        q: "Where does my reference image live afterwards?",
        a: "On the task row itself — the upload is stored with the task record and served back through the task's own input route, so history entries keep their reference images meaningful. The Model Viewer tool is the contrast case: fully local, nothing uploaded.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "Sibling generation surfaces in this clone.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "WorldGen", href: "/features/worldgen" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "MCP", href: "/features/mcp" },
    ],
    closingTitle: "One Image Is Enough",
    closingBody: "Upload a reference, check the caption, generate — and export in all five formats.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
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
    ctaSecondary: { label: "See what the studio does ship", href: STUDIO_PATH },
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
    researchNote: {
      title: "Built on award-winning 3D research",
      body: "The reference's WorldGen engine, like its object generators, descends from published, award-winning 3D reconstruction research — that is the reference's story and it is true of the reference. This clone shares none of it: no research lineage, no trained world model, no scene-decomposition network. What this codebase actually has is a spec-driven single-asset pipeline, documented plainly on the pages you can click from here. The research sentence stays on the page because the reference has it — attributed to the reference, not borrowed for this clone.",
    },
    techCards: {
      title: "Understands Physics, Ready to Edit — There, Not Here",
      intro:
        "The reference's own WorldGen section promises physical understanding and editable objects. Stated as the reference's claims, with this clone's reality next to each one:",
      cards: [
        {
          title: "There: Scene Decomposition",
          body: "The reference separates a scene photo into independent objects with real physical relationships — a table supports a vase, floors catch shadows. One upload becomes many editable meshes.",
        },
        {
          title: "Here: One Task, One Coherent Asset",
          body: "This clone's pipeline generates a single asset per task — a spec of 2 to 12 primitives with transforms and materials, composed by the planner from a prompt or caption. Multi-object world decomposition from a photo is not implemented.",
        },
        {
          title: "There: Physics-Aware Placement",
          body: "The reference's engine reasons about support, occlusion, and contact between the objects it reconstructs, which is what makes its worlds editable rather than a fused blob.",
        },
        {
          title: "Here: Explicit Transforms, No Physics",
          body: "Objects in this clone's specs carry explicit position, rotation, and scale — ground-level composition is a prompt-level convention the planner follows, not simulated physics. Nothing here pretends otherwise.",
        },
      ],
    },
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
      {
        q: "How many objects can this clone's spec hold?",
        a: "A scene spec composes 2 to 12 primitives — enough for a prop with parts, a small diorama-scale build, or a display composition. It is an asset vocabulary, not a world vocabulary; the count is the pipeline's real rule.",
      },
      {
        q: "Could I chain tasks to fake a world?",
        a: "You can generate several assets and arrange them yourself in your DCC — every export is a standard format that imports cleanly. What you cannot get here is the reference's one-shot scene understanding from a single photo, and chaining tasks does not change that.",
      },
      {
        q: "Why keep a page for a feature that is not here?",
        a: "Because the reference's sitemap has it and the clone's job is honest parity: the route exists, states the gap in the first screen, and points at the nearest real paths instead of parking a fake demo on the URL.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real, working surfaces closest to WorldGen's intent.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
    ],
    closingTitle: "Single Assets, Done Honestly",
    closingBody:
      "While WorldGen is not here, the studio's single-asset pipeline is real end to end — try it with a scene object.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
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
    cta: { label: "Open the Studio that uses it", href: STUDIO_PATH },
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
    codeExamples: {
      title: "API Examples — Real Calls to This Clone's Own Endpoints",
      intro:
        "The reference's page shows example calls against its key-based product. These blocks are the same shape pointed at THIS clone's real session-cookie API — swap the origin for wherever this app is served and they run as written. Every route below exists in the codebase and is asserted by the test suite.",
      blocks: [
        {
          label: "1. Sign in and keep the session cookie",
          code: "curl -c jar.txt -X POST http://localhost:3000/api/auth/sign-in \\n  -H 'content-type: application/json' \\n  -d '{\"email\":\"you@example.com\",\"password\":\"your-password\"}'\n\n# 200 {\"ok\":true}  — the httpOnly session cookie lands in jar.txt",
        },
        {
          label: "2. Create a generation task",
          code: "curl -b jar.txt -X POST http://localhost:3000/api/task \\n  -H 'content-type: application/json' \\n  -d '{\n    \"type\": \"RodinStandard\",\n    \"prompt\": \"A red fresh apple, simple geometry\",\n    \"effort\": \"medium\",\n    \"seed\": 4242\n  }'\n\n# 200 {\"task_uuid\":\"…\"}  — type, prompt, effort, seed are the real schema fields",
        },
        {
          label: "3. Poll progress, then fetch the export",
          code: "curl -b jar.txt http://localhost:3000/api/task/$UUID/progress\n\n# 200 {\"task_uuid\":…, \"user_state\":…, \"progress\":{\"percent\":…, \"stage\":…}}\n\ncurl -b jar.txt -OJ http://localhost:3000/api/task/$UUID/export?format=glb\n\n# also: /api/healthz for the AI + DB reachability probe",
        },
      ],
    },
    exportTypes: {
      title: "Supported Outputs — The Real Six",
      intro:
        "The reference's page lists its output types. This clone's exporter serves exactly these six formats, generated from the task's stored spec on demand — the same constants the studio's export picker uses, pinned by tests.",
      formats: [
        { name: "glb", note: "The default web delivery format — binary glTF with materials and vertex colors in one file. What the in-page viewer previews is what the GLB contains." },
        { name: "gltf", note: "The JSON twin of GLB — human-readable, diff-friendly, and handy for pipelines that want to post-process the document." },
        { name: "fbx", note: "Binary FBX for DCC interchange — imports into Unity, Unreal, Maya, and Blender with the scene hierarchy intact." },
        { name: "obj", note: "The universal geometry exchange — plain mesh data with material references. The safest hand-off to tools of any age." },
        { name: "stl", note: "Print-ready solid geometry for slicers. No materials in STL — the shape is the product." },
        { name: "usdz", note: "Apple's AR package — drop the file into a quick-look context on iOS and the model appears in the room." },
      ],
    },
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
      {
        q: "Do the example calls need an API key?",
        a: "No — this clone authenticates with the same httpOnly session cookie the browser uses. Sign in once, keep the cookie jar, and every call above works. That is the entire difference from the reference's key-based product, and it is why there is no key issuance here.",
      },
      {
        q: "Which request fields does a task actually accept?",
        a: "The real schema: type (RodinAgentic or RodinStandard), prompt up to 2000 characters, effort from extreme-low to extreme-high, optional image, settings height, ControlNet constraint, engine (neural or fast), seed 0–65535, up to four multiview images, genVersion, legacyMode, material pass, isPrivate, creationMode, and image labels. Anything else is rejected with the validator's own messages.",
      },
      {
        q: "What do the credit numbers look like on the wire?",
        a: "A new account is granted 50 credits; standard confirm-and-export costs 1, the agentic tier 10. Creation and preview are free — the charge lands only when you confirm, and the wallet ledger records every grant and spend with a reason.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The surfaces that sit on this API.",
    crossLinks: [
      { label: "MCP", href: "/features/mcp" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Format Convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
    ],
    closingTitle: "The API That Runs This Studio Is Real",
    closingBody:
      "Browse the network tab while you generate — every task, poll, and export on this site is this clone's own HTTP surface.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
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
    ctaSecondary: { label: "See what the studio does ship", href: STUDIO_PATH },
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
    techCards: {
      title: "Built for Complete Avatar Creation — The Reference's Pitch, Mirrored Honestly",
      intro:
        "The reference's page sells one-shot complete avatars: parts assembled into a rigged, speaking character. That is the reference's real product. Next to each claim, what this codebase actually has — because a mirror that fakes the pitch would be a lie.",
      cards: [
        {
          title: "There: One Prompt, One Whole Avatar",
          body: "The reference's ChatAvatar assembles hair, face, clothing, and accessories into a complete character from a prompt or image — positioned as a single-step persona factory.",
        },
        {
          title: "Here: Character Assets, Not Rigged Avatars",
          body: "This clone's pipeline produces static character assets — a spec-built model with materials and six-format exports. There is no rigging, no blend shapes, no speaking mouth: the t59 status contract says animation is partial with rigging absent, stated.",
        },
        {
          title: "There: Chat-Native Presentation",
          body: "The reference ships avatars inside a conversational product surface, where the character answers — a different product class from an asset generator.",
        },
        {
          title: "Here: The Nearest Real Paths",
          body: "For character work today: the text-to-3D compiler with character prompts, the 3D prompt catalog's character section, and any DCC for rigging the exported mesh. Those are the working routes — they are what this page links to.",
        },
      ],
    },
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
      {
        q: "Can I at least get a character mesh to rig myself?",
        a: "Yes — that is the honest working path. The studio's text-to-3D and image-to-3D produce exportable meshes in all six formats; rigging happens in your DCC afterwards. The exports are standard files that import cleanly into Blender, Maya, or Unity.",
      },
      {
        q: "Does the reference's ChatAvatar licensing apply here?",
        a: "No. The reference grants explicit commercial avatar licensing for its generated characters. This clone has no avatar product, so no avatar license exists here either — what you generate through the general studio is covered by this site's own terms, not the reference's.",
      },
      {
        q: "Where do the reference's avatar prompts live here?",
        a: "The 3D prompt catalog's character sections carry real, copy-paste prompts that work with this clone's compiler — style words, material words, and composition guidance, each with honest notes about what the result will and will not be.",
      },
      {
        q: "Will avatars ever ship in this clone?",
        a: "Only as a real implementation with rigging behind it. Until then this page stays a documented gap with working alternatives — the same rule every reference-only page here follows.",
      },
      {
        q: "What does the reference's avatar output actually include?",
        a: "Per its own page: assembled avatar parts, rigging for animation, and a licensing posture for commercial use — a complete persona product, not an asset generator. That inventory is the honest yardstick for why this clone's page reads so differently.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "The general generation surfaces that do exist here.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "WorldGen", href: "/features/worldgen" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
    ],
    closingTitle: "Characters Yes, Avatar Product No",
    closingBody:
      "The general studio can still make a character asset from text or image — just without the avatar-specific pipeline.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
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
    ctaSecondary: { label: "See the HDRI generator", href: "/workspace/omnicraft/hdri" },
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
    promptExamples: {
      title: "Prompt Examples for Better AI Images — Shaped for the Reference, Honest About Here",
      intro:
        "The reference's page teaches image prompting. These cards follow its recipe — subject, style, lighting, composition — because that is what the section is for. Read the notes first: none of these produce a bitmap in this clone, and each card says what the nearest real thing here actually is.",
      cards: [
        {
          prompt: "A weathered brass telescope on an oak desk, warm rim lighting, shallow depth of field, product photography",
          note: "Subject, material, lighting, medium — the reference's own formula for a clean product shot. Here there is no text-to-image model; the honest path is generating the telescope itself as a 3D asset with exactly those material words, then lighting it in your renderer.",
        },
        {
          prompt: "Isometric fantasy workshop, soft pastel palette, clean vector lines, game UI banner",
          note: "Style-led prompts like this one belong to a bitmap generator. In this clone the honest neighbors are the styles tree's steerable recipes (prompt-steered geometry, flat parameter materials) and the HDRI generator for the lighting half of the art direction.",
        },
        {
          prompt: "Low-poly island diorama, flat shading, three-tone palette, rotating turnaround reference",
          note: "A prompt that is really an art direction for 3D. That half is real here: the compiler path builds low-poly geometry with flat palettes, exports it in six formats, and your turnaround is a viewer orbit — no bitmap required.",
        },
      ],
    },
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
      {
        q: "What is the honest workflow that replaces this feature?",
        a: "Generate or source imagery elsewhere if you need bitmaps, then use it here: upload as an image-to-3D reference (real captioning, real generation), or extract a palette for the HDRI generator's procedural skies. This clone's image skills are reading and lighting, not painting.",
      },
      {
        q: "Do the prompt recipes on this page work anywhere here?",
        a: "The material, style, and composition vocabulary transfers to the 3D prompt catalog and the styles recipes — those are real, tested prompts for the compiler path. The bitmap half of each recipe needs an actual image generator, which this clone does not wire.",
      },
      {
        q: "Is the HDRI generator the same as an image generator?",
        a: "No, and it does not pretend to be: it builds procedural environment maps from a seed and palette in your browser — real images, but of sky, for lighting. Not prompt-to-art. The OmniCraft page documents its exact knobs.",
      },
      {
        q: "Could an image generator be wired into this clone later?",
        a: "Technically the provider layer could host one — the same wiring the text and vision models use. Until a real model sits behind it, this page stays a documented gap with the working neighbors listed, which is the site-wide rule for reference-only features.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real image-adjacent surfaces here.",
    crossLinks: [
      { label: "HDRI Generator", href: "/workspace/omnicraft/hdri" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
      { label: "AI Image Enhancer", href: "/features/omnicraft/ai-image-enhancer" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
    ],
    closingTitle: "The Real Image Surface Here Is HDRI",
    closingBody: "Prompt a sky, get a 360° environment — locally, deterministically, free.",
    closingCta: { label: "Open the HDRI Generator", href: "/workspace/omnicraft/hdri" },
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
    ctaSecondary: { label: "See the live 3D preview instead", href: STUDIO_PATH },
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
    promptExamples: {
      title: "Better Prompts for AI Video Generation — The Reference's Craft, Stated Honestly",
      intro:
        "The reference's section teaches motion prompting: camera move, subject action, mood. The craft transfers — to wherever you render. In this clone there is no video model to receive it, and every note below says what the real substitute is.",
      cards: [
        {
          prompt: "Slow orbital camera around a matte ceramic vase, studio softbox lighting, seamless backdrop, 10-second loop",
          note: "Camera move first, then subject, then lighting — the reference's own ordering for a clean product loop. Here that exact shot is the studio's real-time viewer: orbit the generated vase, export GLB, and any renderer turns the same move into footage.",
        },
        {
          prompt: "Turntable rotation of a low-poly game asset, flat three-tone palette, constant speed, transparent background",
          note: "The turntable is the classic asset reel shot. The honest pipeline here: generate the asset with those palette words, let the viewer spin it at constant speed, and screen-record or re-render from the exported mesh.",
        },
        {
          prompt: "Push-in on a brass desk lamp, shallow focus racking from shade to switch, warm practical glow",
          note: "Racking focus and push-ins are camera language for a video model — nothing in this clone consumes them. What is real: the lamp itself generates from exactly those material words, and USDZ takes it into AR where your phone's camera does the moving.",
        },
      ],
    },
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
      {
        q: "What is the fastest real path from prompt to motion here?",
        a: "Generate the asset, orbit it in the live preview, and screen-record for a scratch clip — or export GLB or FBX into Blender, Unreal, or Unity and render a finished one. USDZ puts the model in AR where the physical camera supplies the motion for free.",
      },
      {
        q: "Does the video prompt vocabulary work at all here?",
        a: "The subject, material, and palette words feed the 3D compiler directly — they shape what generates. The camera directions orbit, push-in, rack describe shots, not geometry; they are guidance for whatever renders the footage, and this clone has no renderer to guide.",
      },
      {
        q: "Is a video export planned?",
        a: "Not as a stub. If motion ever ships here it will be a real render path with stated capabilities — the same bar every other feature page on this site is held to.",
      },
      {
        q: "Why does an asset generator keep a video page at all?",
        a: "Because the reference sells the two side by side — its AI Media suite pairs the image and video generators with the 3D tools, and its footer links them from every page. This clone mirrors the structure and states the difference: the 3D half is real here, the video half is the reference's.",
      },
    ],
    crossLinksTitle: "What this clone ships instead",
    crossLinksIntro: "Real surfaces adjacent to motion.",
    crossLinks: [
      { label: "Text to 3D", href: "/features/text-to-3d" },
      { label: "Model Viewer", href: "/workspace/omnicraft/viewer" },
      { label: "AI Image Generator", href: "/features/ai-image-generator" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
    ],
    closingTitle: "No Video Here — But Your Model Moves Today",
    closingBody: "Drag, spin, and orbit the real preview, then export into a renderer that makes motion.",
    closingCta: { label: "Open the Studio", href: STUDIO_PATH },
    group: "ai-media",
    indexBlurb: "Reference-only: prompt-to-video suite; the live 3D preview is the honest substitute.",
  },
];
