/**
 * Help Center content, part C — Features, second half (7) + Enterprise (1).
 * Reference sitemap parity (recon 2026-10-30).
 *
 * Honesty anchors used in this module (all real code facts):
 *  - OmniCraft: 4 of 9 tools live (HDRI, Vector to 3D, Model Viewer,
 *    Format Convertor); Mesh Editor is honestly "not-in-clone"
 *  - the HDRI engine is 100% procedural and local — prompt keywords
 *    (time-of-day, weather, palette) + seeded PRNG, sliders always win,
 *    same prompt → same sky, PNG up to 4K
 *  - EXPORT_FORMATS = GLB, GLTF, FBX, OBJ, STL, USDZ (real bytes, three.js
 *    exporters server-side)
 *  - the export route rejects bad formats and unfinished tasks
 *  - RodinAgentic tasks cost AGENTIC_COST = 10 credits
 *  - no enterprise tier, no admin console, no SLAs anywhere
 */

import type { HelpArticleDef } from "./help-types";

export const HELP_ARTICLES_C: HelpArticleDef[] = [
  /* --------------------- Features, second half (7) ----------------------- */
  {
    slug: "create-hdri-skyboxes-with-omnicraft",
    title: "Creating HDRI skyboxes with OmniCraft",
    category: "features",
    description:
      "OmniCraft's HDRI Generation is live and fully local: prompt-seeded procedural skyboxes, a 360° preview, PNG up to 4K — honest about not being AI.",
    status: "live",
    answer:
      "Yes — HDRI Generation is one of OmniCraft's four live tools, and it runs entirely in your browser. Prompts seed a procedural sky (time-of-day, weather and palette keywords), sliders always win, the same prompt yields the same sky forever, and the equirectangular PNG exports up to 4K for environment lighting.",
    sections: [
      {
        heading: "How the engine really works (the honest part)",
        paragraphs: [
          "This tool is 100% procedural and local — there is no image-generation backend behind it, and the tool says so itself. Your prompt is parsed for the axes it mentions (sunset, overcast, a palette hint), every unmentioned axis is filled by a seeded random generator so the same prompt reproduces the same sky every time, and the manual sliders override whatever the prompt picked. Nothing uploads; nothing round-trips a server.",
          "The output is a real, usable HDRI source — horizon-crossing gradient, sun disc, clouds — rendered as an equirectangular PNG that environment lights will accept. It is simply not 'AI-generated', which is exactly the kind of distinction this clone refuses to blur.",
        ],
      },
      {
        heading: "Making one",
        paragraphs: [
          "The flow is deliberately small, and every step happens locally.",
        ],
        steps: [
          {
            title: "Open the HDRI tool",
            body: "From the OmniCraft grid — it's marked live, unlike five of its nine siblings.",
          },
          {
            title: "Describe the sky",
            body: "'golden-hour sunset with scattered clouds' — keywords steer, the rest is seeded.",
          },
          {
            title: "Adjust the sliders",
            body: "Sliders always win over the prompt; tune time-of-day and weather to taste.",
          },
          {
            title: "Export the PNG",
            body: "Up to 4K equirectangular, ready for environment lighting in Blender, Unity or Unreal.",
          },
        ],
        note: "Procedural, local, deterministic, free — no credits, no upload. It is not AI, and the tool doesn't pretend otherwise.",
      },
    ],
    related: [
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
      { label: "Feature overview", href: "/help/articles/what-features-does-hyper3d-have" },
      { label: "Importing into tools", href: "/help/articles/import-models-into-hyper3d-tools" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "edit-3d-models-in-rodin-workspace",
    title: "Editing 3D models in the Rodin workspace (the honest limits)",
    category: "features",
    description:
      "The workspace here is a generator and viewer, not an editor — no Parts, Refine or Modify. Material redo is real; everything else exports to a DCC.",
    status: "not-in-clone",
    answer:
      "The Rodin workspace in this clone is a generator and viewer, not a mesh editor: there are no Parts, Refine or Modify operations on arbitrary geometry. What editing exists is real but narrow — material-parameter redo on your generations and the viewer's display modes. Everything else exports to a DCC.",
    sections: [
      {
        heading: "What editing actually exists here",
        paragraphs: [
          "After a generation you can redo its material parameters — a real, quota-limited action on the studio's neural side — and inspect the mesh in shaded, wireframe or normal display. That is the full editing vocabulary: parameters on your own generations, and looking at them closely. The viewer is a lens, not a scalpel.",
        ],
      },
      {
        heading: "What the reference has that this doesn't",
        paragraphs: [
          "The reference workspace edits meshes directly — decomposing models into parts, refining regions, modifying selected areas on imported OBJ, FBX or GLB. None of that pipeline exists here: no part separation, no region selection, no editing of files you bring in. The honest workflow is the one this help center keeps repeating — export the mesh (GLB is the most faithful), edit in Blender, and keep this workspace for what it genuinely does: generating.",
        ],
        note: "Generate here, edit elsewhere. Material redo is real; Parts/Refine/Modify are not — and no page here implies otherwise.",
      },
    ],
    related: [
      { label: "OmniCraft Mesh Editor (also absent)", href: "/help/articles/edit-3d-models-with-omnicraft-mesh-editor" },
      { label: "BANG & partial edit (absent)", href: "/help/articles/use-bang-and-partial-edit" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
      { label: "Style pages", href: "/styles" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "edit-3d-models-with-omnicraft-mesh-editor",
    title: "Editing 3D models with the OmniCraft Mesh Editor (not in this clone)",
    category: "features",
    description:
      "The Mesh Editor tile is in the OmniCraft grid but honestly marked not-in-clone — no vertex editing ships here. The live grid: HDRI, Vector, Viewer, Convertor.",
    status: "not-in-clone",
    answer:
      "The Mesh Editor is not in this clone. Its tile is in the OmniCraft grid — all nine reference tools are listed — but it carries the honest 'not-in-clone' status with its reason, because a full in-browser vertex-editing UI is beyond what this codebase ships. Four of the nine tools are live; this isn't one of them.",
    sections: [
      {
        heading: "What the grid does instead of pretending",
        paragraphs: [
          "The OmniCraft grid lists all nine reference tools in the reference's order and marks exactly four as live: HDRI Generation, Vector to 3D, Model Viewer and the Format Convertor. The other five — Texture Generator, Image Enhancer, Image Remix, Rodin Search and the Mesh Editor — each carry a truthful note about why they aren't here. A dead-but-pretty tile would be worse than an honest one, so the tile says the truth on its own face.",
        ],
      },
      {
        heading: "The nearest real path for mesh editing",
        paragraphs: [
          "It's the same honest path as the workspace-editing article: export your generation as GLB, open it in Blender (free, and actually built for this), and edit vertices, topology and materials there. If what you wanted was format conversion or inspection rather than editing, the live Convertor and Viewer cover those without leaving the browser.",
        ],
        note: "Mesh Editor: listed, marked not-in-clone, explained. Editing lives in your DCC — the grid doesn't fake it.",
      },
    ],
    related: [
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
      { label: "Workspace editing limits", href: "/help/articles/edit-3d-models-in-rodin-workspace" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "fix-common-hyper3d-export-problems",
    title: "Fixing common export problems",
    category: "features",
    description:
      "The exporters ship real bytes in six formats; the failure points are task state and format choice. Real rules, real fixes, no folklore.",
    status: "live",
    answer:
      "The exporters here produce real files — GLB, GLTF, FBX, OBJ, STL and USDZ, generated server-side with real exporter code. The two failures you can actually hit: exporting before a task is finished (refused) and asking for a format outside those six (also refused). Everything else is usually an expectation to reset, and this article does the resetting honestly.",
    sections: [
      {
        heading: "The rules the export route enforces",
        paragraphs: [
          "Export unlocks at completion — asking earlier gets an honest refusal, because there is no mesh to serialize yet. The format list is closed: GLB, GLTF, FBX, OBJ, STL, USDZ — and asking for anything else is rejected rather than guessed at. Both refusals are the export route being correct, not flaky; retrying the same request will give the same answer until the underlying state changes.",
        ],
      },
      {
        heading: "The 'problems' that are actually the design",
        paragraphs: [
          "Missing textures: not a bug — materials here are flat parameters, so exports carry geometry and parameter materials, never baked PBR maps. If your DCC shows plain colors, that is the design working; paint in Blender if you need maps. Scale or orientation surprises: check the format — USDZ is the Quick Look-friendly one, STL is the printer-friendly one, GLB is the most faithful all-rounder for interchange.",
          "A download that will not start: confirm the task is actually complete (the button state tells you), confirm the format is one of the six, and confirm you are signed in on the account that owns the task — exports are per-owner, and that is a feature, not an obstacle.",
        ],
        note: "Six formats, real bytes, strict state rules. 'Missing textures' is the flat-parameter design, not a defect — and every page here says so.",
      },
    ],
    related: [
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
      { label: "Importing into tools", href: "/help/articles/import-models-into-hyper3d-tools" },
      { label: "3D printing use case", href: "/use-cases/3d-printing" },
      { label: "Fulfillment policy", href: "/legal/fulfillment" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "import-models-into-hyper3d-tools",
    title: "Importing models into the tools here (partially possible)",
    category: "features",
    description:
      "OmniCraft's Viewer and Convertor work with models generated in this workspace; importing arbitrary external files is not supported.",
    status: "partial",
    answer:
      "Partially. The OmniCraft Viewer and Format Convertor work with models this workspace generated — you can inspect and re-export your own tasks. Importing arbitrary external files (an OBJ from your hard drive) is not supported: there is no file-import path into these tools.",
    sections: [
      {
        heading: "What works",
        paragraphs: [
          "The Format Convertor operates on your task list: pick a model you generated here and re-export it across the six formats without regenerating anything. The Model Viewer inspects those same models with the display modes you know from the studio. Both are real, both are local, and neither spends credits — conversion and inspection are free actions in this clone.",
        ],
      },
      {
        heading: "What doesn't, and the honest workaround",
        paragraphs: [
          "There is no bring-your-own-mesh import: the tools' catalogs are your generations, not your file system. If you need to convert or inspect an external model, an external tool is the truthful answer — Blender imports and exports essentially everything this clone's exporters write, and more besides. We would rather point you there than imply an upload slot that does not exist.",
        ],
        note: "Tools operate on what you generate here. External-file import: not supported — use a DCC for that, by design.",
      },
    ],
    related: [
      { label: "OmniCraft toolbag", href: "/workspace/omnicraft" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
      { label: "Vector to 3D (SVG is the one import that IS live)", href: "/workspace/omnicraft/vecto3d" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "use-bang-and-partial-edit",
    title: "Using BANG and Partial Edit (not in this clone)",
    category: "features",
    description:
      "BANG decomposition, Parts and Partial Edit don't exist here — this clone generates whole single assets. Compose parts in your DCC instead.",
    status: "not-in-clone",
    answer:
      "BANG, Parts and Partial Edit are not in this clone. There is no decomposition into components and no region-level editing — generation here produces whole, single assets from a prompt or an image. Composing and part-editing are your DCC's job, and the export formats are built for that hand-off.",
    sections: [
      {
        heading: "What these features are (and why they're absent)",
        paragraphs: [
          "On the reference, BANG-style decomposition splits a generated model into separable components, and partial edit revises a selected region without touching the rest. Both need an editing substrate this codebase deliberately does not ship — the same missing layer behind the workspace-editing and Mesh Editor articles. One absent capability, three honest articles, zero mockups.",
        ],
      },
      {
        heading: "The real path to the same outcome",
        paragraphs: [
          "Generate the whole asset, export GLB, and separate or revise parts in Blender — where selection, separation and local edits are first-class operations. If your actual goal is a multi-part scene, generate the parts as separate assets (each with its own free preview and 1-credit confirm) and assemble them in your engine. More clicks than a one-button BANG, but every click is real.",
        ],
        note: "No BANG, no Parts, no Partial Edit. Whole assets out, DCC editing in — the honest division of labor.",
      },
    ],
    related: [
      { label: "Workspace editing limits", href: "/help/articles/edit-3d-models-in-rodin-workspace" },
      { label: "Mesh Editor (absent)", href: "/help/articles/edit-3d-models-with-omnicraft-mesh-editor" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "use-rodin-agentic-mode-for-image-to-3d",
    title: "Using Rodin Agentic Mode for image-to-3D (partial here)",
    category: "features",
    description:
      "Agentic runs exist here as a real tier at 10 credits with the Gen-2.5 agent-ready pipeline — but the reference's autonomous multi-step agent loop is not reproduced.",
    status: "partial",
    answer:
      "Partially. The agentic tier is real here: it's the Gen-2.5 'Agent-Ready' pipeline on the version picker, and an agentic task genuinely costs 10 credits against the standard 1. What is not reproduced is the reference's autonomous multi-step agent loop that plans and revises on its own — this clone's agentic run is a pricier, higher-effort generation pass, and we say so.",
    sections: [
      {
        heading: "What's real about agentic here",
        paragraphs: [
          "Pick Gen-2.5 Agent-Ready on the version picker and run an image-to-3D task: the task type is real (it's one of the two task types the metering code knows), the 10-credit price is real and enforced, and the run produces the same preview-then-confirm flow with the same six export formats. The effort ladder applies, the fallback behavior applies, and the ledger records the spend exactly as priced.",
        ],
      },
      {
        heading: "What 'agentic' honestly doesn't mean here",
        paragraphs: [
          "It does not mean an agent that decomposes your request, plans steps, calls tools and revises its own output — that autonomy is the reference's showcase, and reproducing it would mean pretending at a layer of intelligence this codebase does not contain. When you choose the agentic tier here, you are choosing the higher-cost, agent-ready pipeline's generation pass, and the credit difference is the whole of the difference. Better a small truth than a big theater.",
        ],
        note: "Agentic tier: real type, real 10-credit price, real pipeline. Autonomous agent loop: not here — the picker prices a pass, not a personality.",
      },
    ],
    related: [
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Image to 3D", href: "/help/articles/create-3d-models-from-images-with-rodin" },
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
    ],
    updated: "2026-10-30",
  },

  /* ---------------------------- Enterprise (1) ---------------------------- */
  {
    slug: "how-to-get-hyper3d-enterprise-support",
    title: "Getting enterprise support (not offered in this clone)",
    category: "enterprise",
    description:
      "There is no enterprise tier here — no custom deployment, no admin console, no SLAs. The honest notes: self-host the demo, or talk to the real product.",
    status: "not-in-clone",
    answer:
      "There is no enterprise offering in this clone: no custom deployment, no admin console, no dedicated support and no SLA — because there is no paid tier of any kind to enterprise-up from. The honest notes are short: this clone is a self-contained demonstration, and the real product's enterprise channel lives on the real site.",
    sections: [
      {
        heading: "What an enterprise tier would need (and why none of it is here)",
        paragraphs: [
          "Enterprise support implies an account with obligations: procurement, custom quotas, admin-managed seats, uptime commitments and someone accountable when they wobble. This codebase has a 50-credit signup grant, a 1-credit confirm and no payment surface whatsoever — there is nothing to attach an SLA to, and inventing enterprise language around a free demo would be the least honest page in this help center.",
        ],
      },
      {
        heading: "The two honest paths",
        paragraphs: [
          "If your interest is the mechanics: everything this clone does is inspectable — the credit ledger, the confirm gate, the exporters and the fallback chain are all in the codebase, which makes it a clean reference for how these systems fit together. If your interest is the actual product at enterprise scale: that conversation belongs to the real Hyper3D through its official site, which is the same place the scam-safety article sends every question that outgrows this clone.",
        ],
        note: "No enterprise tier, no SLAs, no admin console — and no page here will sell you one.",
      },
    ],
    related: [
      { label: "Support channels", href: "/help/articles/how-to-get-support-from-hyper3d" },
      { label: "Plans (none)", href: "/help/articles/how-much-do-hyper3d-plans-cost" },
      { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
      { label: "Terms of service", href: "/legal/terms" },
    ],
    updated: "2026-10-30",
  },
];
