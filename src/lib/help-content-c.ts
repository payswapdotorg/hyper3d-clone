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
      {
        heading: "Inspect the 360-degree preview",
        paragraphs: [
          "The tool renders the sky as an equirectangular preview you can read like any environment map: horizon line, sun position, cloud bands. The clouds are seam-free by construction — periodic fBm noise, so the left edge meets the right edge exactly — and the same prompt with the same seed produces the same sky byte-for-byte, which makes 'inspect, tweak, re-inspect' a deterministic loop rather than a slot machine.",
        ],
      },
      {
        heading: "Understand the package",
        paragraphs: [
          "What you actually receive: a PNG environment map in your chosen size — 2K (2048×1024) or 4K (4096×2048) — downloaded straight from the browser, with the seed in the filename so a sky you liked is a sky you can reproduce. That is the entire package, stated at its real size: no EXR, no 8K tier, no layered materials — the reference's richer HDRI packs are its product's deliverables, and this clone says so rather than implying parity.",
        ],
      },
    ],
    faq: [
      {
        q: "Which sizes can I export?",
        a: "Two: 2K PNG (2048 by 1024) and 4K PNG (4096 by 2048). Both are plain PNG environment maps downloaded from the browser — the size list in the tool is the complete list.",
      },
      {
        q: "Is this AI-generated?",
        a: "No — the engine is procedural: prompt keywords pin concrete parameters (sky colors, sun tint, cloud density) through a deterministic hash and seeded noise. It is honest math, and the tool labels itself that way.",
      },
      {
        q: "Does it cost credits?",
        a: "Zero. The tool runs locally in your browser, never touches the credit ledger, and works the same with a fresh 50-credit account or a drained one.",
      },
      {
        q: "Can I reproduce a sky I liked?",
        a: "Yes — the same prompt with the same seed regenerates the identical image, and the download filename carries the seed so you can note it or share it.",
      },
      {
        q: "What is an HDRI for, honestly at this resolution?",
        a: "Environment lighting and backdrops in a DCC — a 2K or 4K equirectangular PNG is plenty for lighting a scene or compositing a sky. Ultra-detailed reflection probes at 8K are the reference product's territory, and the tool states the gap instead of faking it.",
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
      {
        heading: "Preview before committing",
        paragraphs: [
          "The one editing-shape idea this clone fully implements is the reference's best one: nothing is locked in until you have seen it. Generation ends at a free preview you can orbit, wireframe and re-orient; the charge fires only at your confirm; and the material pass can be re-run on a free preview before any of that. The whole product is a preview-before-commit machine — the editing suite around it is what did not cross over.",
        ],
      },
      {
        heading: "Choose the editing intent",
        paragraphs: [
          "The reference's intent picker (modify geometry, adjust materials, refine parts) reduces here to the two real redo lanes: a geometry redo re-runs generation, and a material redo re-runs the flat parameter pass — both free under pay-by-result, with small per-task quotas. There is no intent vocabulary beyond that because there are no editing operations beyond that, and the panel's own labels say what they do.",
        ],
      },
      {
        heading: "Open 3D Editing and upload the model",
        paragraphs: [
          "The reference's first step — opening its 3D Editing surface and uploading a mesh — is the step that cannot start here: no editing surface exists, and generation input is a prompt or a reference image, never an uploaded model. The honest nearest action is to generate the asset here (if it does not exist yet), export it, and do the uploading into a DCC — which is the same shape of round-trip with the tools that can actually honor it.",
        ],
      },
      {
        heading: "Add a reference only when it clarifies the edit",
        paragraphs: [
          "Good advice from the reference, still true here in the one place it applies: Image to 3D accepts a primary reference plus direction-tagged extra views, and the same discipline governs both — add the image that resolves genuine ambiguity (the hidden back, the true proportions), not more angles of what is already visible. Where the reference applies this to edits, here it applies to generation; the principle transfers, the edit surface does not.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I upload a model to edit here?",
        a: "No — generation starts from a prompt or a reference image, not from an uploaded mesh. The OmniCraft Model Viewer can load and inspect your GLB/GLTF files, but inspection is all it does.",
      },
      {
        q: "What exactly is the material redo?",
        a: "A re-run of the flat parameter material pass on a task — free under pay-by-result, quota-limited per task (a handful of material redos). It changes the parameter materials, not the geometry, and never touches your balance.",
      },
      {
        q: "Can I at least rotate before export?",
        a: "Yes — the orientation control re-poses the model before export so it lands upright in your DCC, and the export article covers the related scale checks.",
      },
      {
        q: "Is Parts or Refine coming?",
        a: "Nothing in this codebase says so, and no page here will hint otherwise. The honest path for part-level edits is the DCC after export — the article's whole point.",
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
      {
        heading: "Sculpt and inspect geometry",
        paragraphs: [
          "Sculpting is not here — no brushes, no masks, no remesh — and this clone will not render a fake sculpt panel. Inspection is real and useful though: the studio viewer checks your generated meshes (orbit, wireframe, normal modes, orientation), and the OmniCraft Model Viewer loads any GLB or GLTF — file or URL — locally in your browser, so round-tripping an export for a final look before DCC work costs nothing and uploads nothing.",
          "The actual sculpting belongs to Blender, ZBrush or equivalent, after export. That division — generate and inspect here, sculpt there — is the honest workflow this help center keeps repeating because it is the true one.",
        ],
      },
      {
        heading: "Import a mesh or start from a primitive",
        paragraphs: [
          "The reference's two doors into its mesh editor, answered for this clone: importing a mesh is real for inspection only — the Model Viewer takes your GLB or GLTF from a file or a URL and renders it locally, never uploading it anywhere. Starting from a primitive is not a thing here at all: there is no primitive-pad sculpting surface, and generation's primitives live inside the spec pipeline where the prompt steers them, not on an editable canvas.",
        ],
      },
    ],
    faq: [
      {
        q: "Does the OmniCraft grid include a mesh editor?",
        a: "It lists one — the reference's Mesh Editor — marked not-in-clone with the explanation. Listed because the reference has it; marked because this codebase does not implement it.",
      },
      {
        q: "Can the Model Viewer edit anything?",
        a: "No — it loads and inspects (orbit, material modes, turntable stats). The file never leaves your browser, and no edit is possible in it, by design.",
      },
      {
        q: "What is the nearest real path for sculpting?",
        a: "Export from here in your DCC's preferred format and sculpt there. The six formats exist precisely so the round-trip is easy.",
      },
      {
        q: "Will the Mesh Editor be implemented?",
        a: "No claim, no roadmap, no teaser — the grid's not-in-clone label is the current truth, and this article exists so the label needs no interpreting.",
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
      {
        heading: "Model appears white or untextured",
        paragraphs: [
          "Expected behavior, by design: this clone ships flat parameter materials, not baked texture maps, so a model in a viewer that ignores material parameters renders plain. The color and finish vocabulary lives in the spec's material parameters — export GLB or FBX to carry them — and any real texturing happens in your DCC after export. The styles pages flag exactly which looks are texture-dependent for this reason.",
        ],
      },
      {
        heading: "Scale or orientation is incorrect",
        paragraphs: [
          "Orientation is fixable before export: the studio's orientation control re-poses the model so it lands upright where you import it. On scale, know the units: the spec clamps dimensions between 0.05 and 4, so a model that imports tiny or huge is carrying its real spec dimensions into a tool with different units — check the receiving tool's unit assumption first, then rescale there. Re-exporting never changes the numbers; the stored model is the truth.",
        ],
      },
      {
        heading: "Download or import fails",
        paragraphs: [
          "The export route's own rules, in order: the task must be confirmed (a preview is not a purchasable artifact — exports unlock at confirm), and the format must be one of the six real ones — anything else is rejected before a byte is served. Within those rules, the download is the stored model serialized by real exporters; if an import fails in your DCC, try GLB first (the most widely accepted of the six) before suspecting the file.",
        ],
      },
    ],
    faq: [
      {
        q: "Which format should I hand Blender, Unity or a slicer?",
        a: "Blender and Unity take GLB or FBX happily; slicers want STL; AR on Apple devices wants USDZ; the web favors GLB or GLTF. All six serialize the same stored mesh — pick by destination, not by quality.",
      },
      {
        q: "Where are the texture maps in the download?",
        a: "There are none to download — flat parameter materials are the design, not a packaging error. The export carries geometry and parameter materials; painting is downstream work.",
      },
      {
        q: "Can I re-download later without paying again?",
        a: "Yes — once a task is confirmed, its export stays available from the stored model. The single 1-credit charge is the whole cost of the artifact, not a per-download fee.",
      },
      {
        q: "Why is my export refused?",
        a: "Two possible rules: the task is not confirmed yet, or the format string is not one of the six. Both refusals are the export route enforcing its stated contract — finish the preview-to-confirm step or fix the format name.",
      },
      {
        q: "Do different formats have different geometry?",
        a: "No — same stored model, same geometry, six serializations. Differences you see after import come from the receiving tool's import settings, not from this side of the round-trip.",
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
      {
        heading: "Choose the destination tool",
        paragraphs: [
          "The real destinations, honestly mapped: the Format Convertor converts your own generated tasks across the six formats — it lists your completed tasks and serves the same bytes the studio would. The Model Viewer loads any GLB or GLTF from a file or URL, entirely locally, for inspection. Neither feeds an external file back into generation: the task pipeline starts from a prompt or a reference image, never from an uploaded mesh.",
          "For everything else — decimation, rigging, scene assembly — the destination is your DCC, and the six export formats exist precisely to make that hand-off clean.",
        ],
      },
      {
        heading: "Usage Notes",
        paragraphs: [
          "The reference's closing notes column, answered with this clone's real constraints: the convertor needs a signed-in session because it lists your tasks (nothing about your data leaves that loop — it serves the same stored model back to you); the viewer runs entirely in your browser and forgets your file when you close the tab; and no tool here accepts an upload into the generation pipeline, so 'import' never means 'becomes a task'. If a workflow needs a mesh to become another mesh, that round-trip runs through your DCC, not through these tools.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I import an OBJ or FBX to convert it here?",
        a: "No — the Format Convertor converts your generated tasks, not uploaded files. Generation input is a prompt or a reference image; there is no mesh-ingestion path in this codebase.",
      },
      {
        q: "What can the Model Viewer open?",
        a: "GLB and GLTF, from a local file or a URL. Loading is local — the file never leaves your browser — and the viewer inspects (orbit, material modes, turntable stats) rather than edits.",
      },
      {
        q: "Does the convertor re-encode my model?",
        a: "It serves the same stored model serialized per format — the same source of truth the studio's own export button uses, not a lossy re-encode.",
      },
      {
        q: "Is there any file size limit?",
        a: "The pipeline's own input cap is the relevant one — reference images up to a few megabytes. Exported models are the size the geometry makes them; no artificial output cap exists on the six formats.",
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
      {
        heading: "Inspect the edited result",
        paragraphs: [
          "There are no edits here to inspect, so the honest version of this section is about the round-trip: after you edit the exported mesh in your DCC, this clone's inspection surfaces still work on the original — the studio viewer on the task, the OmniCraft Model Viewer on any GLB/GLTF you point it at (including your edited file, loaded locally). Comparing the edited file against the original preview is the practical QA loop, and it costs nothing and uploads nothing.",
        ],
      },
      {
        heading: "Tips for Partial Editing",
        paragraphs: [
          "The honest tips, for the workflow that actually exists: export GLB for the cleanest round-trip (it carries the parameter materials), make the local edit in your DCC, and keep the original file untouched beside the edit so the diff is always yours to see. Re-inspect the edited mesh in the Model Viewer — a local load, nothing uploaded — before it goes anywhere important. Those three habits deliver everything partial editing would deliver here, without pretending a feature exists to deliver it.",
        ],
      },
      {
        heading: "Use BANG or Parts for component structure",
        paragraphs: [
          "The reference's structural tools — BANG's decomposition, the Parts system for named components — are absent here, and the honest structural levers that exist are upstream: the spec composes 2 to 12 objects with their own transforms, so a multi-part asset is genuinely buildable by describing its parts in the prompt. What is not buildable is the after-the-fact split — a generated mesh exports as one coherent model, and the part-level surgery happens in a DCC where selection and separation are real operations.",
        ],
      },
      {
        heading: "Use Partial Edit for a local change",
        paragraphs: [
          "The reference's partial edit changes one region of an existing model without regenerating the rest; here the local change is either a re-prompt (whole-model regeneration, free until confirm) or an export-then-edit in a DCC (truly local, fully under your control). There is no in-between, and stating that plainly is more useful than a fake middle path — the FAQ below covers which to pick.",
        ],
      },
    ],
    faq: [
      {
        q: "What is BANG, in one sentence?",
        a: "The reference's decomposition feature — explode an asset into parts, edit the parts, recombine. None of it exists here: assets export whole, and part-level work belongs to your DCC.",
      },
      {
        q: "Can I get a multi-part asset at least?",
        a: "Yes — the Text to 3D spec carries 2 to 12 objects with their own transforms, so a composition genuinely has parts. What it lacks is per-part editing after generation — the parts are mesh-level composition, not editable scene nodes.",
      },
      {
        q: "What is the nearest path to a partial edit?",
        a: "Export, edit locally in a DCC, re-inspect. The loop is honest and free on the inspection side — the Model Viewer loads your edited GLB without uploading it anywhere.",
      },
      {
        q: "Do any pages here pretend otherwise?",
        a: "No — the mode picker labels these features not implemented, the feature pages carry the not-in-clone verdict, and this article is the long-form version of the same statement.",
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
      {
        heading: "Turn on Agentic Mode before generation",
        paragraphs: [
          "The toggle is real and the placement is the reference's: on the image-to-3D path with Gen-2.5 selected, the agentic option unlocks and the task leaves as an agentic-tier run (a distinct task type in the request). The price difference is stated up front — 10 credits at confirm instead of 1 — and the preview is still free, so you can compare an agentic result against a standard one before either charge happens.",
        ],
      },
      {
        heading: "Know when to use manual controls",
        paragraphs: [
          "The honest split: manual is the standard tier with your own prompt and reference image — full control, 1 credit, exactly what you asked for. Agentic is the heavier pass on the same input — more pipeline for the engine to reconcile, 10 credits. When you know precisely what you want (a specific silhouette, a clean prop), manual is cheaper and more predictable; when you want the heavier pass's interpretation, agentic is the lane. Neither is an autonomous agent that goes off and does your project.",
        ],
      },
    ],
    faq: [
      {
        q: "What does the 10 credits actually buy?",
        a: "The agentic-tier pipeline on the image-to-3D path — a heavier generation pass than the standard one, charged at confirm like everything else. The preview is free, so the comparison against a 1-credit run costs nothing.",
      },
      {
        q: "Which modes allow agentic?",
        a: "Image to 3D with Gen-2.5 selected — that is where the toggle unlocks. Text to 3D and Gen-1.5 runs are always standard-tier priced.",
      },
      {
        q: "Is agentic an AI agent that works autonomously?",
        a: "No — despite the name, it is a generation tier, not a persona: one heavier pass over your input, no autonomous loop, no agent deciding things for you. The name is the reference's; the behavior here is priced and described honestly.",
      },
      {
        q: "Can I switch tiers mid-task?",
        a: "No — the tier is part of the task at creation. Run both tiers side by side as separate tasks if you want the comparison; previews are free, so only the keepers cost anything.",
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
      {
        heading: "Enterprise inquiry or ordinary product support?",
        paragraphs: [
          "The reference's triage question — is this an enterprise conversation or ordinary product support? — has a flat answer here: neither lane exists. Ordinary questions are answered by this help center's self-service articles, and enterprise conversations belong on the reference site's channels, because the thing they would be about (volume commitments, SLAs, admin tooling) is not implemented in this codebase even slightly.",
        ],
      },
      {
        heading: "What happens after you make contact",
        paragraphs: [
          "Nothing, because there is no contact to make: no inbox, no form, no team, no CRM behind this clone. The honest chain is short — you are reading the support surface right now, and every question this clone can answer is either in these 33 articles or in the legal documents. For the real product, its own site's contact paths are the real ones; this clone does not relay anything to anyone.",
        ],
      },
      {
        heading: "When to contact the Enterprise team",
        paragraphs: [
          "The reference lists its triggers — volume commitments, custom SLAs, security reviews, procurement — and each one is a reason this clone cannot be the destination: a volume commitment needs something to buy in volume, an SLA needs an operator behind it, a security review needs an organization to review, and procurement needs an invoice. Every trigger assumes the enterprise machinery this codebase deliberately does not contain, so the honest trigger list here is empty, and the reference's list is the accurate map of what is missing.",
        ],
      },
      {
        heading: "Include these details in your request",
        paragraphs: [
          "If the request is going to the real product's enterprise team, the reference's advice stands: bring the company context, the expected scale, the timeline, and the compliance requirements. If the question is about this clone, the equivalent details are already in reach — which page, which claim, which behavior — because every claim on every page here is anchored to the codebase and answerable from these articles without anyone needing to ask you for more.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there any SLA at all?",
        a: "None — no uptime commitment, no support response target, no contractual anything. This clone is a demonstration workspace, and pretending to an SLA would break its first rule.",
      },
      {
        q: "Can I get volume pricing for a team?",
        a: "There is no pricing of any kind to scale — one free tier, 50 credits per account. Teams can each have accounts; that is the entire 'team plan' here.",
      },
      {
        q: "Where should a procurement conversation go?",
        a: "To the reference product, if it is about real commercial generation at scale. Nothing in this clone can be procured — there is nothing to buy and no one to invoice.",
      },
      {
        q: "Who answers for this clone?",
        a: "The pages themselves — every answer here is anchored to the codebase's real constants and routes, which is the only authority this clone claims.",
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
