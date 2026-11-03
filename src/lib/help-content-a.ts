/**
 * Help Center content, part A — Getting Started (6) + Account Settings (2)
 * + Billing (4). Reference sitemap parity (landing-sitemap-static-en.xml,
 * recon 2026-10-30): those are the categories' exact article sets.
 *
 * Honesty anchors used in this module (all real code facts):
 *  - new accounts start with 50 credits (credits.ts INITIAL_BALANCE)
 *  - standard generation costs 1 credit at Confirm & Export
 *    (credits.ts STANDARD_COST / confirm.ts CONFIRM_COST)
 *  - there is NO payment processing anywhere in this codebase
 *  - auth is email + password, scrypt hashes, HMAC-signed httpOnly
 *    session cookie, 7-day lifetime (auth.ts)
 *  - canceling a creation-charged task refunds creditsSpent in full
 *    (cancel route, ledger reason "cancel_refund")
 *  - no password-reset flow exists (only sign-in / sign-up / sign-out routes)
 */

import type { HelpArticleDef } from "./help-types";

export const HELP_ARTICLES_A: HelpArticleDef[] = [
  /* ------------------------- Getting Started (6) ------------------------- */
  {
    slug: "what-is-hyper3d",
    title: "What is Hyper3D (this workspace, honestly)?",
    category: "getting-started",
    description:
      "What this Hyper3D workspace actually is: a self-contained text-to-3D and image-to-3D generator with real mesh exports, stated plainly.",
    status: "live",
    answer:
      "This workspace turns a text prompt or a reference image into a real 3D mesh you can preview for free and export in six formats. Every capability described in this help center either runs in this codebase or is marked as not existing here — nothing in between.",
    sections: [
      {
        heading: "What actually runs here",
        paragraphs: [
          "The core loop is real and end-to-end: you describe a model with text or upload a reference image, the pipeline builds a mesh, you inspect the preview in the studio viewer, and you export the result as GLB, GLTF, FBX, OBJ, STL or USDZ — real files with real bytes, generated server-side by the exporters this codebase ships.",
          "Generation is pay-by-result. Creating a task and watching its preview costs 0 credits; pressing Confirm & Export charges exactly 1 credit for a standard run. A new account starts with 50 credits, and the ledger records every grant and spend so the balance you see is the balance the code keeps.",
        ],
      },
      {
        heading: "What this site is not",
        paragraphs: [
          "It is a clone of hyper3d.ai's workspace built as an honest demonstration: same layout family and surface structure, but its own engine, its own copy, and its own limits. Where the reference has features this codebase does not implement — mesh editors, scene builders, baked textures — the corresponding pages here say so plainly instead of imitating them.",
          "There is also no payment processing, no subscription tiers, and no support team behind it. Anything that asks you for money while claiming to represent this site is, by definition, a scam, because there is nothing to buy.",
        ],
      },
      {
        heading: "Where to go next",
        paragraphs: [
          "The beginner's guide walks a first model from sign-up to download in five steps. If you want the full inventory of what works and what does not, the feature overview article lists it, and the feature pages carry the same status contract page by page.",
        ],
        steps: [
          {
            title: "Create an account",
            body: "Email and password only — you start with 50 credits and no card is ever requested.",
          },
          {
            title: "Generate a first model",
            body: "Open the studio, type a prompt or drop a reference image, and generate. The preview is free.",
          },
          {
            title: "Confirm and export",
            body: "Happy with the preview? Confirm & Export spends 1 credit and unlocks the six-format download.",
          },
        ],
      },
      {
        heading: "What can you create with Hyper3D?",
        paragraphs: [
          "The honest creation set: single assets and small multi-object compositions — the underlying spec carries between 2 and 12 objects with their own transforms, so a mug on a desk or a small diorama is in range, while a full scene is not. Hard-surface props, stylized characters as static meshes, and prompt-steered looks (low poly, voxel, flat-color) all work; the styles pages document exactly which levers steer geometry here.",
          "What you cannot create: rigged or animated avatars, baked PBR texture maps (materials are flat parameters), editable scene graphs, or photo-real scans — none of those pipelines exist in this codebase, and every page that touches them says so instead of implying otherwise.",
        ],
      },
      {
        heading: "How does the workflow work?",
        paragraphs: [
          "Describe what you want with a text prompt, or upload a reference image and let the vision stage caption it into the same spec language. The engine turns that spec into a mesh — the neural tier runs the full pass and falls back to the fast tier automatically if it stalls, so a slow run still delivers — and the preview lands in the viewer where you can orbit it, switch to wireframe or normal display, and re-orient it before committing.",
          "When the preview is worth keeping, Confirm & Export charges 1 credit (10 for an agentic-tier run) and unlocks the six download formats. Every step before that button is free, and the ledger records the one charge it makes.",
        ],
      },
      {
        heading: "More than a 3D generator",
        paragraphs: [
          "The reference pitches itself as more than a generator — an editing suite, a scene builder, a community. Here the honest 'more' is a different list: ControlNet-style spatial constraints you can draw before generating, an MCP connect sheet that documents how to point an AI agent at the real service, four local OmniCraft tools that run without spending anything, and a credit ledger whose every movement carries a machine-readable reason.",
          "That is the whole inventory of 'more' — and it is deliberately stated at its real size rather than padded with features the codebase cannot back.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need an account to use this?",
        a: "Browsing every page — features, styles, use-cases, legal, this help center — needs no account. Generating models does, because credits and task history are per-account. Sign-up is email and password only.",
      },
      {
        q: "How much does one model cost?",
        a: "Nothing to create and preview, exactly 1 credit at Confirm & Export for a standard run, 10 for an agentic-tier run. New accounts start with 50 credits, and failed or canceled tasks never reach the charge.",
      },
      {
        q: "Can I edit my model after generating it?",
        a: "Inside this clone: re-orient it, re-run the material pass, or regenerate with a refined prompt — all before or instead of confirming. Real mesh editing belongs to a DCC like Blender after you export; the workspace-editing article covers the boundary.",
      },
      {
        q: "Is this the real Hyper3D product?",
        a: "No. It is an unaffiliated clone with its own engine, copy and limits, built as an honest demonstration. The real product lives at hyper3d.ai — the links-and-scam-safety article carries the full disclosure.",
      },
      {
        q: "What happens if a generation fails?",
        a: "Nothing is charged. Failure happens before the confirm step, and a stalled neural run falls back to the fast tier automatically rather than failing you outright. The failure article walks the real causes.",
      },
    ],
    related: [
      { label: "Beginner's guide", href: "/help/articles/how-to-use-hyper3d-beginners-guide" },
      { label: "Feature overview", href: "/help/articles/what-features-does-hyper3d-have" },
      { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
      { label: "Terms of service", href: "/legal/terms" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-use-hyper3d-beginners-guide",
    title: "How to use Hyper3D — a beginner's guide",
    category: "getting-started",
    description:
      "Create your first 3D model here in five steps: sign up, prompt or upload, preview free, confirm for 1 credit, export in six formats.",
    status: "live",
    answer:
      "Sign up with email and password (you get 50 credits), open the studio, describe a model with a text prompt or a reference image, watch the free preview, then press Confirm & Export to spend 1 credit and download the mesh in six formats. That is the whole loop.",
    sections: [
      {
        heading: "Your first model, start to finish",
        paragraphs: [
          "The studio keeps the reference's layout: generation controls on the left, the live viewer at the center, and the credit balance in the top bar. Two generation modes are live here — Text to 3D and Image to 3D; the other entries in the mode picker are labeled honestly as not implemented yet.",
        ],
        steps: [
          {
            title: "Create an account",
            body: "Sign-up takes an email and a password. Passwords are stored as scrypt hashes and your session lives in an httpOnly cookie for 7 days.",
          },
          {
            title: "Describe your model",
            body: "Type a prompt (subject, form, a few adjectives) or switch to Image to 3D and upload one reference image. The prompt card's polish button fixes typos before you generate.",
          },
          {
            title: "Generate and watch the preview",
            body: "Generation runs the engine and lands on a preview you can orbit in the viewer with shaded, wireframe and normal display modes. This stage costs 0 credits.",
          },
          {
            title: "Confirm & Export",
            body: "If you like the preview, confirm it — exactly 1 credit for a standard run — and the export buttons unlock.",
          },
          {
            title: "Download",
            body: "Export as GLB, GLTF, FBX, OBJ, STL or USDZ and drop the file straight into Blender, Unity, Unreal or a slicer.",
          },
        ],
      },
      {
        heading: "What things cost (the real numbers)",
        paragraphs: [
          "A new account starts with 50 credits. A standard generation charges 1 credit, and only at the confirm step — never at creation, so a failed or abandoned generation costs nothing. An agentic-tier run costs 10 credits. OmniCraft's local tools (HDRI generation, Vector to 3D, the viewer, the format convertor) do not spend credits at all.",
          "If your balance cannot cover a charge, the request is refused with a 402 and your balance never goes negative.",
        ],
      },
      {
        heading: "Beginner tips that are actually true here",
        paragraphs: [
          "Prompts that name a single clear subject with a few form adjectives preview fastest and cheapest. If you need a specific style — low poly, voxel, pixel-art looks — the styles pages explain exactly which levers steer geometry here and which do not exist (there is no polycount slider, for example).",
          "If a neural run stalls, the server falls back to the Fast tier automatically and stamps the task with the fallback reason — you still get a model, and you still have not been charged until you confirm.",
        ],
        note: "The preview is always free. The only mandatory spend is the 1-credit confirm — skip it and nothing is deducted.",
      },
      {
        heading: "Choose Image to 3D or Text to 3D",
        paragraphs: [
          "Use Image to 3D when the appearance already exists: a product photo, a concept sketch, a screenshot of a prop. The vision stage captions the image and builds the spec from what it actually sees, so the silhouette you care about is the one you get. Use Text to 3D when you know the shape in words — subject, form, a few adjectives — and want the compiler to compose it.",
          "The reference also offers a 'generate an image first' lane between the two; that middle stage does not exist here. The honest split is two doors: image in or prompt in, and both end at the same free preview and the same 1-credit confirm.",
        ],
      },
      {
        heading: "Add Textures to Your Model",
        paragraphs: [
          "Here is the step that works differently: this clone does not paint or bake textures. Materials are flat parameters — the color and finish vocabulary the spec carries — so a model renders with clean flat shading rather than mapped detail. That is a stated design boundary, not a missing feature you were promised somewhere.",
          "The honest workflow for real texture work: export the mesh (GLB or FBX carry the material parameters; OBJ plus a DCC works too), then paint in Blender, Substance, or your tool of choice. The styles pages note which looks are texture-dependent and therefore finish outside this clone.",
        ],
      },
    ],
    faq: [
      {
        q: "How long does a generation take?",
        a: "One of five effort levels: from roughly 4 seconds on the fastest draft level to about 80 seconds on the highest. The server paces queue work so tasks cannot hang, and a stalled neural run falls back to the fast tier automatically.",
      },
      {
        q: "Can I retry if the result is wrong?",
        a: "Yes, freely — retries cost 0 because the charge only fires at Confirm & Export. Refine the prompt (the polish button fixes typos first), regenerate, and only confirm the keep-worthy result.",
      },
      {
        q: "Which export format should I pick?",
        a: "GLB for web viewers and configurators, FBX or OBJ for DCCs and game engines, STL for slicers, USDZ for AR on Apple devices, GLTF when you need the text-based form. All six come from the same stored model — the export article covers the details.",
      },
      {
        q: "Is there a batch mode?",
        a: "No — one task per generate press. Presets can make repeat inputs faster to set up, but each generation is its own task with its own preview.",
      },
      {
        q: "Do I lose my credits if I just look around?",
        a: "No. Looking is free: previews, wireframes, re-orientation and re-runs never touch the balance. The only spend is your own confirm press — 1 credit standard, 10 agentic.",
      },
    ],
    related: [
      { label: "Text to 3D in practice", href: "/help/articles/create-3d-models-from-text-with-rodin" },
      { label: "Image to 3D in practice", href: "/help/articles/create-3d-models-from-images-with-rodin" },
      { label: "Credit costs in detail", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "All features", href: "/features" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "what-features-does-hyper3d-have",
    title: "What features does Hyper3D have?",
    category: "getting-started",
    description:
      "The honest feature inventory: text-to-3D, image-to-3D, ControlNet constraints, the MCP connect sheet, four live OmniCraft tools and six export formats.",
    status: "live",
    answer:
      "Live here: text-to-3D, image-to-3D, prompt polishing, ControlNet-style spatial constraints, the MCP connect sheet, four of OmniCraft's nine tools (HDRI, Vector to 3D, Model Viewer, Format Convertor), six real export formats and the credit ledger. Not here: workspace mesh editing, scene generation, baked textures, LODs and every payment feature.",
    sections: [
      {
        heading: "The live feature set",
        paragraphs: [
          "Generation: Text to 3D and Image to 3D produce real meshes through the engine pipeline, with a free preview stage and a 1-credit confirm. The prompt card includes a polish action (a real server-side spell/grammar fix). ControlNet-style spatial constraints let you pin where geometry should sit before you generate.",
          "Tooling: the OmniCraft grid lists the reference's nine tools and marks exactly four as live — HDRI Generation (procedural, prompt-seeded skyboxes, fully local), Vector to 3D (SVG extrusion), Model Viewer and the Format Convertor. Exports cover GLB, GLTF, FBX, OBJ, STL and USDZ with real bytes from real exporters.",
        ],
      },
      {
        heading: "What is deliberately absent",
        paragraphs: [
          "There is no workspace editor (no Parts, Refine or Modify), no scene builder, no BANG decomposition or partial edit, no baked PBR texture maps — materials are flat parameters here — and no polycount or LOD controls. The mode picker shows those entries with an honest 'not implemented here yet' instead of pretending.",
          "There is also no purchase flow, no plans, no live chat and no support team. Each absence has its own help article saying exactly that, because a help center that invents features would be worse than none.",
        ],
        note: "Every feature page in /features carries the same three-way status: works here, partial here, or not in this clone.",
      },
      {
        heading: "Rodin Text to 3D",
        paragraphs: [
          "The prompt is the steering surface: the compiler turns it into a strict scene spec — 2 to 12 objects, every dimension clamped between 0.05 and 4 — and rejects anything out of range rather than guessing. When a prompt is too vague for the model to answer, a deterministic fallback composition runs so you always see something inspectable, and re-prompting is free.",
        ],
      },
      {
        heading: "Rodin Image to 3D",
        paragraphs: [
          "Upload a reference image (PNG, JPEG or WebP) and the vision stage captions it into the same spec language — the pipeline the reference calls rodin_mesh_image_process, running here with its own engine. The preview is free, the confirm is 1 credit, and the upload strip accepts up to eight images with the first as the primary view.",
        ],
      },
      {
        heading: "Mesh, material, and texture controls",
        paragraphs: [
          "The honest subset: ControlNet-style constraints (bounding box, voxel and point-cloud) pin where geometry sits before generation, the orientation control re-poses the preview before export, and the material pass re-runs flat parameter materials as a free redo. There is no sculpting, no texture painting and no part-level editing — those stay in your DCC.",
        ],
      },
      {
        heading: "Preview, refine, and export",
        paragraphs: [
          "The viewer orbits, switches between shaded, wireframe and normal display modes, and shows turntable stats. Refining means re-prompting or re-running the material pass — both free — and exporting means six real formats (GLB, GLTF, FBX, OBJ, STL, USDZ) served from the stored model only after you confirm.",
        ],
      },
      {
        heading: "OmniCraft creative tools",
        paragraphs: [
          "Four of the nine listed tools are live: HDRI generation (procedural, deterministic, 2K/4K PNG), Vector to 3D (SVG extrusion with real slider clamps), the Model Viewer (loads any GLB/GLTF locally) and the Format Convertor (your tasks across the six formats). All four run without spending credits.",
        ],
      },
      {
        heading: "ChatAvatar",
        paragraphs: [
          "Not in this clone: there is no portrait-to-avatar pipeline, no rigs, no blendshapes. The nearest real path is Text to 3D with a concrete character description, which produces a static mesh you can rig in a DCC afterwards.",
        ],
      },
      {
        heading: "API and add-ons",
        paragraphs: [
          "There is no public REST API product with keys here — the studio runs on this codebase's own routes, which is a different thing. The one add-on surface that exists is the MCP connect sheet: it documents the real service's endpoint and CLI so an AI agent can be pointed at the real Hyper3D, stated as that and nothing more.",
        ],
      },
    ],
    faq: [
      {
        q: "Which generation modes actually work?",
        a: "Text to 3D and Image to 3D, end to end. Every other entry in the mode picker renders with an honest 'not implemented here yet' label instead of pretending to run.",
      },
      {
        q: "Does this clone have textures?",
        a: "No baked texture maps — materials are flat parameters with a color and finish vocabulary. The 'model appears white or untextured' entry in the export-problems article explains why that is design, not defect.",
      },
      {
        q: "Is there an API I can call?",
        a: "Not a public one. The MCP connect sheet documents the real service's endpoint for agent integration; everything else runs inside this clone's own web routes.",
      },
      {
        q: "What is the full feature breakdown?",
        a: "The /features tree: eighteen pages plus an index, each carrying the same three-way status you see here, with per-surface detail — the API page's curl blocks, the ControlNet page's real constraints, and so on.",
      },
      {
        q: "Do the OmniCraft tools cost credits?",
        a: "No. All four live tools run locally in the browser and never touch the credit ledger — the ledger only moves on generation confirms.",
      },
    ],
    related: [
      { label: "Feature pages", href: "/features" },
      { label: "Style pages", href: "/styles" },
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
      { label: "Choosing generation settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "does-hyper3d-support-languages-besides-english",
    title: "Does Hyper3D support languages besides English?",
    category: "getting-started",
    description:
      "No — this clone is English-only. The interface, help center and legal pages render in one language and there is no language switcher.",
    status: "not-in-clone",
    answer:
      "No. This clone is English-only: the studio interface, this help center and the legal pages all render in English, and there is no language switcher anywhere in the UI — multilingual support is not in this clone. The reference site ships several localized versions; this build intentionally does not.",
    sections: [
      {
        heading: "What is English-only",
        paragraphs: [
          "Every surface you can reach — the studio, the feature, style, use-case and legal pages, and these help articles — is written in English. There is no locale layer in the codebase, no translated routes, and no regional sitemap variants, so the answer to 'can I switch to another language' is simply no.",
        ],
      },
      {
        heading: "What still works regardless of language",
        paragraphs: [
          "The mechanics do not care about language: account creation, credit metering, the free-preview-to-confirm flow and all six export formats behave identically no matter what you type. Prompts are passed through to the pipeline as-is; there is no evidence this build's engine understands one language better than another, so we claim nothing either way.",
        ],
        note: "If you need the multilingual product, that is the reference site's territory — this clone does not reproduce it and does not pretend to.",
      },
      {
        heading: "Change the website language",
        paragraphs: [
          "There is nothing to change: no language switcher renders anywhere in this clone, and every route — studio, features, styles, use-cases, blog, legal, help — serves English. The reference ships a dozen locales, including localized blog trees and regional sitemaps; reproducing that surface is a deliberate non-goal here, so the honest answer to 'where is the switcher' is that it does not exist.",
        ],
      },
      {
        heading: "Workspace and generated content",
        paragraphs: [
          "Two practical notes for non-English speakers. First, prompts are passed to the pipeline as-is — nothing rejects a non-English prompt — but the compiler's keyword vocabulary is English tokens, so English prompts steer the spec far more predictably. Second, models have no language: the mesh, its materials and the six export formats are language-agnostic once generated.",
        ],
      },
      {
        heading: "Language coverage can vary",
        paragraphs: [
          "The reference's caveat — coverage varying across its surfaces — has a blunter version here: coverage is uniformly English because there is nothing for it to vary across. There is no partially-translated corner of this clone, no locale that lags another, and no beta language hiding behind a flag — which also means there is no 'check whether your language is supported yet' step to advise, because the answer is the same on every page.",
        ],
      },
      {
        heading: "If a translation is missing or unclear",
        paragraphs: [
          "The reference routes this to its translators; here the honest route is different. If an English article is unclear, the underlying facts are always checkable in the codebase's own surfaces — the studio states prices and states before you commit, and every claim in these articles is anchored to a real constant or route. If you need the product in your language, that need is real and the reference site is the honest answer for it — this clone will not fake a translation layer it does not have.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I write my prompt in another language?",
        a: "You can type it, and nothing will reject it — but the spec compiler's keyword palettes are English tokens, so an English prompt steers the geometry far more reliably. A non-English prompt usually lands closer to the deterministic fallback composition.",
      },
      {
        q: "Is a translated interface coming?",
        a: "Nothing in this codebase suggests that: there is no locale layer, no message catalog and no localized route tree. If you need the multilingual product today, the reference site is the honest destination.",
      },
      {
        q: "Are the legal pages available in other languages?",
        a: "No — the five legal documents render in English only, same as every other surface in this clone.",
      },
      {
        q: "Does search work in other languages?",
        a: "The help center search matches the English titles and descriptions the articles are written in — searching in another language will honestly return no matching articles.",
      },
    ],
    related: [
      { label: "What is Hyper3D", href: "/help/articles/what-is-hyper3d" },
      { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-get-support-from-hyper3d",
    title: "How to get support from Hyper3D",
    category: "getting-started",
    description:
      "There is no support team behind this clone — the honest equivalents are this help center and the legal pages. No tickets, no live chat.",
    status: "partial",
    answer:
      "There is no support team, ticket queue or live chat behind this clone. The honest equivalents are this help center (33 articles that state exactly what works), the legal pages, and — for the real product — the reference site's own channels.",
    sections: [
      {
        heading: "What 'support' honestly means here",
        paragraphs: [
          "This is a self-contained demonstration clone, so the support surfaces are the ones this codebase actually renders: the help center you are reading, the legal documents (terms, privacy, refund and delivery policies), and the status lines on every feature, style and use-case page. Those pages are written to answer the common questions truthfully rather than to route you to a human.",
        ],
      },
      {
        heading: "What does not exist here",
        paragraphs: [
          "No email support inbox is wired to this build, there is no ticket system, no live chat widget, and no SLA of any kind. The 'Live Chat Support' block on the help index says exactly this rather than opening a chat that leads nowhere. That is deliberate: a fake chat window would be a lie with a timeout.",
          "If your question is about the real Hyper3D product — accounts, purchases, API keys on the real service — it has to go through the reference site's channels, because this clone shares nothing with those accounts.",
        ],
      },
      {
        heading: "Start with self-service resources",
        paragraphs: [
          "The self-service inventory, stated at its real size: these 33 help articles, the five legal documents, and the status contracts on every /features, /styles and /use-cases page. The studio's own surfaces carry the operational answers too — the pricing overlay shows the real credit prices, the MCP modal documents the agent connection, and the mode picker labels what is not implemented.",
          "For 'why did my task do X' questions, the most reliable resource is the behavior itself: previews are free, retries are free, and the ledger's reasons are documented in the credit articles — so you can verify most answers experimentally at zero cost.",
        ],
      },
      {
        heading: "Include useful details in a support request",
        paragraphs: [
          "There is no request box here, so this section is the honest inversion: if you are filing a support request against the real product, include the details that make it answerable — the task id, the exact prompt or reference image, the settings you chose, and what you expected versus what rendered. The same discipline is what makes a question answerable anywhere, including in this help center's search box.",
        ],
      },
      {
        heading: "Contact product and account support",
        paragraphs: [
          "There is no product or account support to contact here, and the honest details matter: no inbox receives anything, no ticket queue exists anywhere in this codebase, and no human reads anything you type into this clone beyond the code that processes it. Account trouble specifically has exactly the two options the account-settings articles state — the session's remaining lifetime, or a fresh account.",
        ],
      },
      {
        heading: "API and community questions",
        paragraphs: [
          "Two honest splits. API questions about the real service — the endpoint the MCP sheet documents — belong to that service's own documentation and channels, because the endpoint is theirs and this clone is not in the loop. Community questions have no community here: no forum, no Discord, no gallery comments exist in this clone — the gallery shows featured models and records likes, and that is the whole of its social surface.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there live chat?",
        a: "No. The help index carries the reference's chat-block shape with honest content instead: no widget, no queue, no agent. The support article routes to the surfaces that genuinely answer.",
      },
      {
        q: "Can I email someone about this clone?",
        a: "No support inbox is wired to this build. The pages you are reading are the support surface, and they are deliberately complete about the codebase's real behavior.",
      },
      {
        q: "Where do bug reports go?",
        a: "There is no public tracker for this clone. For the real product, the reference site's own channels are the path — this clone shares nothing with those accounts.",
      },
      {
        q: "What about the MCP service's support?",
        a: "The endpoint documented in the connect sheet belongs to the real Hyper3D service — questions about it, including access and keys, belong with that service's own documentation and channels, not here.",
      },
    ],
    related: [
      { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
      { label: "Enterprise support (not offered here)", href: "/help/articles/how-to-get-hyper3d-enterprise-support" },
      { label: "Refund policy", href: "/legal/refund" },
      { label: "Terms of service", href: "/legal/terms" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "official-hyper3d-links-and-scam-safety",
    title: "Official Hyper3D links and scam safety",
    category: "getting-started",
    description:
      "This clone is not affiliated with the real Hyper3D. The one rule that makes scam-detection trivial here: nothing can ever be purchased, so any payment request is a scam.",
    status: "live",
    answer:
      "This site is a self-contained clone and is not affiliated with the real Hyper3D or its company. The one safety rule that matters here: nothing in this clone can ever be purchased — no credits, no plans, nothing — so anyone asking you for payment 'for this site' is scamming you by definition.",
    sections: [
      {
        heading: "What this site is (the disclosure)",
        paragraphs: [
          "The workspace you are using reproduces hyper3d.ai's layout family with its own engine, its own copy and its own limits. It keeps the reference's surface structure so the clone is a faithful demonstration, and it states its status plainly everywhere — including here. Treat hyper3d.ai as the official site for the real product, its documentation and its accounts.",
          "Two public connection facts borrowed from the real service appear in the MCP connect sheet (the endpoint api.hyper3d.com and the CLI package name). Those are the only places this clone points at the real service, and only as documentation of how to connect an AI agent to it.",
        ],
      },
      {
        heading: "Scam safety, the version that is actually checkable",
        paragraphs: [
          "Because this codebase has no payment processing at all, the usual scam heuristic — 'were you asked to pay?' — becomes a hard rule: no legitimate page here can ever ask for a card, a wallet, a top-up or a subscription, because there is nothing to buy. Credits arrive only as the 50-credit signup grant, and they are only spent by your own confirm actions.",
          "The same rule protects you outside this site: if a page or person claims to sell credits, plans or priority access 'for the Hyper3D clone', that page is not this site and the person is not from it. Verify you are on the domain you expect, and treat any payment demand as the scam flag it is.",
        ],
        note: "No card. No wallet. No checkout. Any payment request in this clone's name is a scam — there is nothing to buy, by design.",
      },
      {
        heading: "How to recognize a suspicious page or message",
        paragraphs: [
          "The checkable rules, in order. Does the page ask for payment, a wallet connection, or a 'credit top-up'? It is not this site — no legitimate page here can, because the payment code does not exist. Does it claim urgency ('your credits expire tonight')? Credits never expire here. Does it arrive as a DM or email 'from the team'? There is no team and no outbound mail. Any one of those flags is conclusive.",
          "General hygiene still applies: type the domain yourself rather than trusting a link, treat login pages you reached from a message with suspicion, and remember the only credential this clone holds is your email-and-password account — nothing else exists to phish.",
        ],
      },
      {
        heading: "If you may have shared information with an impersonator",
        paragraphs: [
          "Work out what actually leaked. If it was this clone's password: no payment data is attached to any account here, so the worst case is task history — and since no password change or reset exists, the honest remedy is to abandon that account and sign up fresh. If you reused that password elsewhere, change it there immediately, because the reuse is the real exposure.",
          "If you sent money or connected a wallet to a page impersonating this clone: the transaction was with the impersonator's infrastructure, and your card provider or wallet's dispute process is the real path — this site cannot reverse, refund or investigate anything, and saying so plainly is more useful than pretending otherwise.",
        ],
      },
    ],
    faq: [
      {
        q: "What outbound links does this clone actually carry?",
        a: "Exactly two connection facts, both in the MCP connect sheet: the real service's endpoint (api.hyper3d.com) and its CLI package name. They document how to connect an agent to the real service — nothing here links to a store, a wallet or a payment page.",
      },
      {
        q: "Can credits be bought on some other site?",
        a: "No — not for this clone. Credits exist only inside this codebase's ledger and arrive only via the signup grant, so nobody anywhere can sell them to you.",
      },
      {
        q: "I saw a checkout page styled like this site. What was it?",
        a: "An impersonation. The layout family is public, but the real site has no checkout to copy — any payment surface wearing this skin is running on someone else's infrastructure.",
      },
      {
        q: "Will this site ever ask for my card?",
        a: "Never. There is no payment processor in the codebase, so no page, modal or message from this clone can process a card — that absence is the scam rule that makes every impersonation detectable.",
      },
    ],
    related: [
      { label: "What is Hyper3D", href: "/help/articles/what-is-hyper3d" },
      { label: "Plans (none exist here)", href: "/help/articles/how-much-do-hyper3d-plans-cost" },
      { label: "Support channels", href: "/help/articles/how-to-get-support-from-hyper3d" },
      { label: "Privacy policy", href: "/legal/privacy" },
    ],
    updated: "2026-10-30",
  },

  /* ------------------------ Account Settings (2) ------------------------- */
  {
    slug: "can-i-log-in-to-hyper3d-with-a-verification-code",
    title: "Can I log in with a verification code?",
    category: "account-settings",
    description:
      "No — sign-in here is email and password only, with scrypt password hashes and an httpOnly session cookie. No codes, OAuth or SSO.",
    status: "not-in-clone",
    answer:
      "No. The only login method this clone implements is email and password. There are no verification codes, no magic links, no OAuth and no SSO — the auth surface is exactly three routes: sign-up, sign-in and sign-out.",
    sections: [
      {
        heading: "How authentication really works here",
        paragraphs: [
          "You register with an email and a password. The password is never stored raw — it is hashed with scrypt (per-hash random salt, 64-byte key), and verification is a timing-safe comparison. On sign-in the server issues an HMAC-signed session cookie marked httpOnly with a 7-day lifetime, and every API route that needs identity reads that cookie from the request.",
        ],
      },
      {
        heading: "What is deliberately absent",
        paragraphs: [
          "There is no email delivery wired into auth, so nothing can send you a code or a link — which is exactly why verification-code login cannot exist here, and why the honest answer is no rather than a pretend flow. If a page asks you for a code 'to log into the clone', that page is not this clone.",
        ],
        note: "Email + password, scrypt-hashed, httpOnly 7-day session cookie. That is the entire auth story here.",
      },
      {
        heading: "When a verification code appears",
        paragraphs: [
          "It never does here. The sign-in form has exactly two fields, and the auth routes are exactly three — sign-up, sign-in, sign-out. There is no code-sending step anywhere in the pipeline, so any screen or message presenting a 'Hyper3D clone verification code' is describing a product that is not this one, and entering that code anywhere is handing it to whoever wrote the message.",
        ],
      },
      {
        heading: "If you cannot use your password",
        paragraphs: [
          "The honest options are the same two the reset article states: ride out the current session (the cookie lasts 7 days from issue), or create a fresh account — instant, free, its own 50 credits. There is no identity-verification path, no 'contact support to recover' path, and no social-login fallback to prove ownership with.",
        ],
      },
      {
        heading: "Choose the method linked to your account",
        paragraphs: [
          "The reference's step reduces to a single fact here: the method linked to your account is email-and-password, permanently, because no other method can be linked. There is no account settings page where a second factor could be attached, no provider to prefer, and no fallback to choose — which makes the question easy to answer and impossible to get wrong: type the email, type the password, or create the account if it does not exist yet.",
        ],
      },
      {
        heading: "Get help with the correct identity",
        paragraphs: [
          "The reference offers identity help through its support team; here the honest equivalent is smaller and self-serve: the two 'help' surfaces that exist are this help center's articles and the codebase's own behavior. If the wrong account seems to exist for your email, the practical checks are typos in the address, a different browser profile's saved credentials, and whether the account was ever created here at all — sign-up will happily make a new one either way.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I sign in with Google or GitHub?",
        a: "No — no OAuth provider is wired into this build. Email and password is the one and only credential pair, and the auth code has no hook where a provider would even plug in.",
      },
      {
        q: "Are magic links a thing here?",
        a: "No. Magic links need outbound email, and no email delivery is connected to this build's auth — which is the same reason verification codes and reset messages cannot exist.",
      },
      {
        q: "How long does a sign-in last?",
        a: "Seven days from issue, in an HMAC-signed httpOnly cookie. Sign-out clears it immediately; otherwise it simply lapses when its lifetime ends.",
      },
      {
        q: "Can I stay signed in on two devices?",
        a: "Yes — each device holds its own session cookie, and both remain valid for their own 7-day windows. Nothing here limits concurrent sessions.",
      },
    ],
    related: [
      { label: "Password reset (not offered)", href: "/help/articles/how-to-reset-hyper3d-password" },
      { label: "Privacy policy", href: "/legal/privacy" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-reset-hyper3d-password",
    title: "How to reset your password here (honestly: you can't)",
    category: "account-settings",
    description:
      "This clone has no password-reset flow — no reset emails exist. The honest options: keep the 7-day session, or start a fresh account with 50 credits.",
    status: "not-in-clone",
    answer:
      "This clone has no password-reset flow. Nothing in the codebase sends email, so there is no reset message to receive — if the password is lost, the account is unreachable once the session expires, and the honest path is a new account (which starts with its own 50 credits).",
    sections: [
      {
        heading: "Why there is no reset to walk through",
        paragraphs: [
          "A reset flow needs an outbound channel (email or SMS) plus a tokenized change form. This build has neither: the auth routes are exactly sign-in, sign-up and sign-out, and no outbound mail is wired anywhere. Rather than describe steps that do not exist, this article states the situation and the two things you can actually do.",
        ],
      },
      {
        heading: "Your two real options",
        paragraphs: [
          "First, a signed-in session lasts 7 days from issue — if you are still signed in, finish what you need before it lapses. Second, if the password is already lost, create a new account: signup is instant, grants 50 credits, and no payment was ever attached to the old one, so nothing of monetary value is stranded. Task history stays with the account that created it — that part is genuinely unrecoverable, and we say so.",
        ],
        note: "No reset emails exist here. A lost password means a new account — we would rather tell you that than fake a recovery flow.",
      },
      {
        heading: "If the message does not arrive",
        paragraphs: [
          "There is no message, and that is the point to be plain about: no reset email was ever sent, is being retried, or is sitting in a spam folder, because no email system is connected to this build's auth at all. If you are waiting for one, the wait has no end state — the honest move is to stop waiting and pick one of the two real options above.",
        ],
      },
      {
        heading: "When recovery still fails",
        paragraphs: [
          "The end state, stated without cushioning: the account is unreachable once the session lapses, its task history stays with it, and the fresh account starts from zero credits-wise (a new 50, not a transfer). Nothing of monetary value is lost — no payment was ever attached — but the work product is, and knowing that in advance is the only honest mitigation this clone can offer.",
        ],
      },
      {
        heading: "Google, GitHub, and SSO accounts",
        paragraphs: [
          "None exist here — no account in this clone was ever created through Google, GitHub or any SSO provider, because no provider integration exists. That matters for this article's question in a specific way: the reference's reset advice branches on 'which provider is your account linked to', and here the branch count is exactly one. Email and password is the only account type, so there is no provider-side reset to fall back on and no linked identity to recover through.",
        ],
      },
      {
        heading: "Can I switch from Google sign-in to email and password?",
        paragraphs: [
          "The reference gets this question because its accounts can start social and want to become password-based. Here the question has no object: there is no Google sign-in to switch away from, and every account is already email-and-password. The nearest real 'switch' is starting a second account — separate balance, separate history — which the changing-plans article covers honestly, including what it is not.",
        ],
      },
    ],
    faq: [
      {
        q: "Why is there no reset flow at all?",
        a: "Because the auth surface is deliberately three routes — sign-up, sign-in, sign-out — with no email delivery wired in. A reset flow needs an outbound channel plus tokenized forms; this build has neither, and stubbing them would fake a recovery that cannot happen.",
      },
      {
        q: "Can Google or SSO recover my account?",
        a: "No — no social or SSO identity is linked to any account here, so there is no second factor to prove ownership with. The email-and-password pair is the whole identity.",
      },
      {
        q: "Could support reset it for me?",
        a: "There is no support team and no inbox — and even if there were, the code exposes no administrative reset path for anyone to invoke.",
      },
      {
        q: "What happens to my generated models?",
        a: "They stay on the unreachable account's task history. Exports you already downloaded remain yours on disk — the files left the clone when you saved them — but nothing on the account itself transfers to a new one.",
      },
    ],
    related: [
      { label: "Login methods", href: "/help/articles/can-i-log-in-to-hyper3d-with-a-verification-code" },
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
    ],
    updated: "2026-10-30",
  },

  /* ----------------------------- Billing (4) ------------------------------ */
  {
    slug: "how-much-do-hyper3d-plans-cost",
    title: "How much do the plans cost? (There are none)",
    category: "billing",
    description:
      "No paid plans exist in this clone — one free tier, 50 credits at signup, and no payment processing anywhere. Here is the honest billing story.",
    status: "not-in-clone",
    answer:
      "There are no plans and no prices, because there is no payment processing in this codebase. The only tier is free: every account starts with 50 credits, standard generations cost 1 credit at confirm, and no card is ever requested.",
    sections: [
      {
        heading: "The one real tier",
        paragraphs: [
          "Every account is identical: 50 credits granted at signup, 1 credit per standard confirm, 10 for an agentic-tier run, and a ledger that records each movement. There is no upgrade path because there is nothing to upgrade to, no monthly allowance because there is no subscription, and no enterprise tier because there is no sales surface of any kind.",
        ],
      },
      {
        heading: "Why we refuse to invent prices",
        paragraphs: [
          "The reference product has a paid plan ladder; reproducing its pricing here would be a claim this codebase cannot honor — nothing could charge you those amounts even if you wanted to pay. So the billing category of this help center documents the absence instead: no plans, no purchases, no refunds to request, nothing to cancel. That is the whole truth of it.",
        ],
        note: "One free tier. 50 credits at signup. No cards, no checkout, no subscriptions — by design, not by oversight.",
      },
      {
        heading: "The reference's plan ladder (its prices, not this clone's)",
        paragraphs: [
          "For context, the reference product's own help article lists its ladder: Free at $0, Creator at $30 monthly or $280 yearly, Business at $120 monthly or $1,152 yearly, and Enterprise at custom pricing. Those are the reference's numbers on the reference's site — reproduced here only as attribution, because a price list on this clone would be a claim nothing in this codebase could honor: there is no checkout, no processor and no subscription engine to charge any of those amounts.",
          "Verify plan prices where they are real: on the reference's own pricing page, at the moment you are considering a purchase. This article will not mirror its future price changes, and does not need to — nothing here can sell you anything either way.",
        ],
      },
      {
        heading: "What to confirm before subscribing",
        paragraphs: [
          "Here, the confirmation list is short because the answer is no: there is nothing to subscribe to, no recurring charge to consent to, and no trial that converts. If a page asks you to 'confirm your subscription' for this clone, that page is an impersonation — the scam-safety article's rule applies verbatim.",
        ],
      },
      {
        heading: "Free: $0",
        paragraphs: [
          "The reference's first ladder band, answered in this clone's own terms: free is not the entry tier here — it is the only tier. Every account is the free account: the same 50-credit grant, the same 0-to-preview, the same 1-credit confirm, the same six formats, and no upsell ever arriving because there is nothing above it to sell. The number in this heading is the reference's own; the sentence under it is this clone's truth.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the cheapest plan here?",
        a: "There is only one tier and it is free: every account gets the same 50-credit grant at signup and the same prices after that — 0 to preview, 1 per standard confirm, 10 per agentic run.",
      },
      {
        q: "Is there a student or education discount?",
        a: "No — a discount needs a price, and there are no prices. The free tier already costs nothing, which is the floor any discount could reach.",
      },
      {
        q: "Will paid plans be added later?",
        a: "Nothing in this codebase suggests so: no payment processor, plan table or subscription engine exists here. This article documents the codebase as it is, and as it is there is nothing to buy.",
      },
      {
        q: "Where did I see prices for Hyper3D then?",
        a: "On the reference's site — its ladder (Free $0, Creator and Business tiers, custom Enterprise) belongs to it and is documented above as attribution, not as an offer from this clone.",
      },
    ],
    related: [
      { label: "Purchasing credits (not possible)", href: "/help/articles/how-to-purchase-hyper3d-credits" },
      { label: "Credit costs in detail", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Fulfillment policy", href: "/legal/fulfillment" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-purchase-hyper3d-credits",
    title: "How to purchase credits (you can't — here's why)",
    category: "billing",
    description:
      "Credits cannot be purchased in this clone: there is no checkout, no wallet and no card processing. Credits arrive only as the 50-credit signup grant.",
    status: "not-in-clone",
    answer:
      "You cannot purchase credits here. There is no checkout, no wallet page, no card form and no payment processor wired into this codebase — credits arrive exactly one way, as the 50-credit grant every new account receives at signup.",
    sections: [
      {
        heading: "The one way credits arrive",
        paragraphs: [
          "Account creation is the only credit faucet: the ledger opens your account with a 50-credit grant and records every later movement with a reason. That is the complete list of inflows. There is no top-up button, no promo code redemption and no bundle pricing, because any of those would imply a purchase path that does not exist.",
        ],
      },
      {
        heading: "If something asks you to pay for credits",
        paragraphs: [
          "It is not this site. Because the codebase genuinely contains zero payment surface, any page, link or person selling credits 'for the Hyper3D clone' fails the simplest possible check: the thing they claim to sell cannot be delivered by the site they claim to represent. Close the tab — the scam-safety article covers the full rule.",
        ],
        note: "50 credits at signup is the only inflow. Everything else is a spend — 1 per standard confirm, 10 per agentic run.",
      },
      {
        heading: "Purchase direct credits from Wallet",
        paragraphs: [
          "There is no Wallet page to purchase from — the reference's flow (open Wallet, pick a credit pack, pay) has no counterpart here because its second step cannot exist. The only screen that shows your balance is the studio's credit readout, and its only movement is the signup grant arriving and your own confirms leaving.",
        ],
      },
      {
        heading: "If purchased credits do not appear",
        paragraphs: [
          "Nothing can be purchased, so nothing can fail to appear — but the scam corollary matters: if you paid somewhere 'for clone credits' and nothing showed up, the money went to an impersonator's account, not to a delayed delivery pipeline. There is no support team here to open a ticket with; your card provider's dispute process is the real remedy, and the scam-safety article covers the pattern.",
        ],
      },
      {
        heading: "Get credits through a subscription",
        paragraphs: [
          "The reference's second inflow — a recurring plan that grants credits each cycle — has no analog here for the same root reason: a subscription needs a charger, and this codebase has none. The only scheduled credit event in this clone is nothing at all: no monthly grant, no renewal bonus, no anniversary credit. The 50 at signup is a one-time number, and every subsequent balance change is your own confirm or its refund.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there any top-up mechanism at all?",
        a: "No. The signup grant is the single inflow by design — no packs, no promo codes, no gift cards, no referral payouts. If a balance runs dry, a new account's grant is the honest equivalent.",
      },
      {
        q: "Can I buy credits for someone else's account?",
        a: "No — for the same reason you cannot buy them for your own: no payment surface exists, and balances are not transferable between accounts in any direction.",
      },
      {
        q: "What about gift cards or promo codes?",
        a: "They do not exist here. Any code a site or message asks you to redeem 'for Hyper3D clone credits' is an impersonation attempt — there is no redemption path in this codebase.",
      },
      {
        q: "Why does the balance never go up?",
        a: "Because it only moves two ways: the 50-credit grant at signup, and deductions at your own confirms. The ledger records every movement with a reason, so an unexplained rise or fall would itself be a bug worth noticing — it cannot happen.",
      },
    ],
    related: [
      { label: "Scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
      { label: "Do credits expire?", href: "/help/articles/do-hyper3d-credits-expire" },
      { label: "Plans (none)", href: "/help/articles/how-much-do-hyper3d-plans-cost" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-request-a-hyper3d-refund",
    title: "How to request a refund (and the one automatic refund)",
    category: "billing",
    description:
      "Nothing here can charge you, so there is nothing to refund — except the one automatic path: canceling a creation-charged task returns its credits in full.",
    status: "partial",
    answer:
      "There is nothing to request a refund for: this clone never takes payment, so no purchase can be refunded. The one automatic refund is real though — canceling a task that was charged at creation returns its credits in full, immediately, through the ledger.",
    sections: [
      {
        heading: "Why refund requests cannot exist here",
        paragraphs: [
          "A refund needs a payment, and there are none: no processor, no checkout, no card on file. The refund policy page says the same thing in legal language — the only money-like thing in this system is credits, and credits were never purchased, so 'refund' here can only ever mean giving credits back to a ledger that issued them for free.",
        ],
      },
      {
        heading: "The one refund that does happen automatically",
        paragraphs: [
          "Legacy tasks that were charged at creation time have a real refund path: pressing Cancel marks the task failed and grants back exactly the credits it spent, in full, recorded in the ledger with the reason 'cancel_refund'. Under the current pay-by-result flow there is nothing to return — creation costs 0 and the only charge happens at confirm, after you have seen the preview. Once a task is confirmed, cancel is refused (the API answers 'already complete') because the export is already yours.",
        ],
        note: "Cancel-before-confirm is the refund: charged credits return in full, automatically. Post-confirm there is nothing to undo — and no money was ever involved.",
      },
      {
        heading: "When a refund may be considered",
        paragraphs: [
          "The complete list, for this clone: a creation-charged task canceled before completion refunds its credits automatically — the ledger stamps it cancel_refund the moment the cancel lands, with no request, no review and no eligibility window. That is the only case, because it is the only case where credits were taken for something you did not keep.",
          "The reference's refund considerations — purchase disputes, processor fees, eligibility timing — have no analog here because no purchases exist. Its article answers its product's questions; this one answers this codebase's, and the two never overlap.",
        ],
      },
      {
        heading: "Timing and payment processor fees",
        paragraphs: [
          "The honest version of this section is short: there is no processor, so there are no fees to net out, and no settlement window to wait through. A cancel_refund entry is an integer moving back to your balance the instant the cancel is accepted — the ledger does not batch, hold or prorate anything.",
        ],
      },
      {
        heading: "If you disagree with the decision",
        paragraphs: [
          "The reference's appeal path runs through its support team; here there is no decision to appeal and no team to appeal to, and that is worth stating rather than skipping. The refund-like behavior in this clone is mechanical, not judgmental: cancel before confirm returns credits because the code says so, not because someone reviewed your case. If the mechanics ever seem wrong, the credit-history article's behavioral checks — watch the balance move by exactly the documented amount — are the honest dispute process, because the metering is deterministic and the ledger does not editorialize.",
        ],
      },
    ],
    faq: [
      {
        q: "How fast do refunds land?",
        a: "Immediately — the cancel and the ledger credit are the same transaction. There is no pending state, because there is no external settlement system for a refund to travel through.",
      },
      {
        q: "Are partial refunds possible?",
        a: "No. Refunds here are all-or-nothing by construction: a canceled creation-charged task returns exactly what it spent. There is no pro-rating because there is no partial delivery to value.",
      },
      {
        q: "Who do I contact about a wrong charge?",
        a: "Nobody needs contacting: charges only happen at your own confirm press, and the refusal case (402) names the required amount and your balance. If a number still looks wrong, the credit-history article walks what is and is not visible.",
      },
      {
        q: "Does the refund article ever apply to money?",
        a: "No — this codebase never takes any, so every sentence here is about credits: the ledger's integers going out at confirm and coming back at cancel. Money appears in this article only as the thing that provably never changed hands.",
      },
      {
        q: "What does the legal refund policy say?",
        a: "The same thing in legal language: no payments are taken, so nothing is refundable — except the automatic credit return on cancel, which the policy document describes alongside the ledger mechanics.",
      },
    ],
    related: [
      { label: "Canceling and credits", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Failed generations", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Refund policy", href: "/legal/refund" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "what-happens-to-credits-when-changing-plans",
    title: "What happens to credits when changing plans?",
    category: "billing",
    description:
      "Nothing — there are no plans to change. Your balance is a plain per-account number that persists until you spend it; no resets, no proration.",
    status: "not-in-clone",
    answer:
      "Nothing happens, because there are no plans to change. A balance here is a plain per-account number that persists until you spend it — no upgrade resets, no downgrade proration, no billing-cycle cliffs, because there is no billing at all.",
    sections: [
      {
        heading: "The closest real event to a plan change",
        paragraphs: [
          "Your balance lives in the ledger as an integer per account. It moves only two ways: the 50-credit signup grant adds to it, and your own confirm actions subtract from it. Nothing schedules a reset, nothing expires it, and nothing re-evaluates it against a tier — the concepts a plan change would invoke simply do not exist in this codebase.",
        ],
      },
      {
        heading: "What a second account is (and isn't)",
        paragraphs: [
          "Creating a second account is the nearest thing this clone has to a tier event: it is a fresh 50-credit grant and a separate balance, not a migration. Balances are not transferable between accounts, and tasks stay with the account that created them — so a second account is an addition, never a merge. We state that plainly because 'just make another account' is the kind of advice that sounds free until your task history is on the other one.",
        ],
        note: "No plans, no changes, no consequences. The balance persists until spent — that is the entire story.",
      },
      {
        heading: "Upgrading Your Subscription",
        paragraphs: [
          "There is no subscription to upgrade. The reference's upgrade semantics — prorated charges, immediate credit grants, tier-gated features — all assume a payment engine, and this codebase has none. The nearest real event is nothing at all: your balance, your formats and your features are identical on every account, forever, because there is only one tier.",
        ],
      },
      {
        heading: "Downgrades and Cancellations",
        paragraphs: [
          "No downgrades exist either, for the same reason. The word 'cancellation' does have a real meaning here, but it is per-task, not per-account: canceling a task before you confirm costs nothing and refunds any creation-time charge in full. Canceling an account — deleting it, pausing it, ending a billing cycle — is not a flow this codebase implements at all.",
        ],
      },
      {
        heading: "Need Help?",
        paragraphs: [
          "The reference closes its version of this article with a help pointer; this clone closes it with the honest inventory: the credit articles explain every movement a balance can make, the beginner's guide walks the whole loop, and the account articles cover the session-and-password facts. That is the complete help surface for plan questions — and since the answer to every plan question is 'there are no plans', it is also a complete answer.",
        ],
      },
    ],
    faq: [
      {
        q: "What happens to my credits at the end of a billing cycle?",
        a: "Nothing — there are no billing cycles. The balance is a plain per-account integer that persists until you spend it, with no date on it anywhere in the code.",
      },
      {
        q: "If I stop using the account, does anything change?",
        a: "No. The balance sits where you left it, and the expiry article covers the same fact: no inactivity rule, no decay, no dormant-account sweep exists here.",
      },
      {
        q: "Can I cancel my account?",
        a: "There is no account-deletion flow — the honest equivalent is signing out and not returning. Nothing bills you in the meantime, so an abandoned account costs exactly nothing.",
      },
      {
        q: "Is there any event that changes what my credits can buy?",
        a: "No — prices are constants in the code (1 standard, 10 agentic) and every account pays the same ones forever. There is no tier to move between, so nothing you do can reprice your balance.",
      },
      {
        q: "Do credits reset on a schedule?",
        a: "Never. The only movements are the signup grant and your own confirms; a reset would require scheduling logic that does not exist in this codebase.",
      },
    ],
    related: [
      { label: "Do credits expire?", href: "/help/articles/do-hyper3d-credits-expire" },
      { label: "Plans (none)", href: "/help/articles/how-much-do-hyper3d-plans-cost" },
      { label: "Checking your balance", href: "/help/articles/how-to-check-hyper3d-credit-history" },
    ],
    updated: "2026-10-30",
  },
];
