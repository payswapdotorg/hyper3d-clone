/**
 * t89 deepening — module E: the generation-guide articles (image-to-stl /
 * how-to-make-3d-models-with-ai / free-text-to-3d-model /
 * generate-3d-game-assets), phase 1. These reference articles push tool
 * roundups and free-tier lists; the honest notes answer each band with the
 * real studio flow, the pinned cost structure, and the stated gaps —
 * including what free actually means here (free previews, free iteration,
 * 50-credit start; the confirmation is the only spend).
 */
import type { ReferenceBand } from "./blog-types";

export const BLOG_DEEPENING_E: { slug: string; referenceBands: ReferenceBand[] }[] = [
  {
    slug: "image-to-stl",
    referenceBands: [
      {
        title: "Image to STL Converter: Turn Any Photo Into Printable 3D",
        note: "Any photo is the reference's promise and this clone's first qualification: what actually runs here is image-conditioned generation — a primary photo (optionally plus up to four direction-tagged views, the schema-pinned contract) conditions a generative pipeline that produces a mesh, and the confirmed result exports binary STL for a slicer. Photos with readable silhouettes and honest lighting condition well; cluttered or ambiguous ones produce exactly the mush you would expect. The chain's costs are pinned: previews free, confirmation 1 credit standard or 10 agentic, 50 credits on signup — and the [printing use case](/use-cases/3d-printing) documents the whole road to the printer. The any-photo promise also deserves its boundary sentence: photos of objects the pipeline cannot see around — glass, mirrors, hair-fine structures — condition poorly, and the preview says so for free; the honest version of any is any photo whose silhouette reads.",
      },
      {
        title: "What is an Image to STL Converter and How Does It Work?",
        note: "Converter is again the reference's verb, kept and qualified: generation, not conversion — nothing decodes a photo into a mesh; the pipeline synthesizes geometry conditioned on it. That distinction is the honest user's main lever, because it locates where quality is decided: at input selection (clean silhouette, honest lighting, multiple tagged views when the object allows) and at the free preview (fidelity check before any spend), not at some conversion dial that does not exist. The STL the export writes is binary, triangle-only, watertight-by-construction on standard runs — and the slicer inherits the metering and the print judgment, exactly as [the printing article](/blog/what-is-stl-file) states. One more distinction the converter framing erases: a converter's output is deterministic — same input, same file — while a generator's output is conditioned, so the same photo yields plausible variation; that is why the seed lock exists and why re-submitting an ambiguous photo is a legitimate strategy rather than a defect. The honest workflow's three decision points, named so the converter framing cannot blur them: image selection (the only input lever), the free preview (the only quality gate before spend), and the slicer's settings (the only print lever) — everything between is the pipeline's business, and pretending to control it from outside is what converter marketing sells and this page refuses.",
      },
      {
        title: "Top Tools for Converting Images to STL Files",
        note: "The reference's roundup is its own market copy — recorded as attribution. The real, bounded tool list on this side: the studio's image tab (the generation door, multi-view input included), the export panel (binary STL from any confirmed task), the [format convertor](/workspace/omnicraft/formatcon) (re-exports your generated tasks among the six pinned formats — GLB, GLTF, FBX, OBJ, STL, USDZ; your tasks, not foreign uploads), and the [local viewer](/workspace/omnicraft/viewer) (GLB/GLTF inspection only; STL preview is a stated non-feature). Desktop slicers and MeshLab own the repair-and-prepare station. Every station named, every boundary stated — that is this codebase's version of a tools roundup. The station map, one line each: generation here (image door, multi-view schema), six-format export here (binary STL is the print lane), inspection split (GLB/GLTF in the local viewer, STL in the desktop tools), repair in MeshLab or the slicer, and print preparation wholly in the slicer — five stations, two inside this codebase, all named without overlap.",
      },
      {
        title: "My First-Hand Experience: Testing Image to STL Converters",
        note: "The reference narrates a testing marathon across converters, in the first person, written by no one — the standing template tell this project documents rather than imitates. The account available here is the pipeline's, verifiable by any user with a 50-credit starting account: submit a clean-silhouette photo, watch the task pace through created-queued-processing, read the free preview, reject free if the read is bad, confirm the good one for a single credit, export STL, and slice. The failure branch is documented with the same honesty in [the generation-failure article](/blog/why-did-my-hyper3d-generation-fail) — a write-up that only narrates success is a brochure. What the testing-marathon framing costs the reference in credibility, stated as method: a test report needs inputs, settings and outputs to be reproducible, and its narrated version offers none of the three — the substitute here is the reproducible sequence (clean photo in, free preview, one-credit confirm, STL out, slicer verdict), which any reader can re-run and compare against this page's claims.",
      },
      {
        title: "Objective Comparison of Image to STL Converters",
        note: "Objectivity, delivered as a spec sheet instead of a podium: this clone's row — input contract (primary plus up to four direction-tagged views, pinned in the API schema), preview cost (zero), confirmation cost (1 standard, 10 agentic), starting grant (50), cancel-during-processing (refunds), export set (six formats, test-pinned), enhancement pass (absent — images enter at uploaded fidelity, stated), painting pass (absent, stated). The reference's comparison table supplies whatever else it supplies — its claims, its authorship. The one dimension its tables never list and this page does: which claims are pinned by tests. The comparison dimension the spec sheet adds beyond the reference's table: refund behavior on failure — the credit returns when a task fails, and canceling during processing refunds — because a comparison that omits failure economics is comparing only the happy path, and the happy path is not where tools differ.",
      },
      {
        title: "Frequently Asked Questions (FAQ)",
        note: "Answered below with this clone's own questions — what any photo actually means (silhouette-readable ones), what a failed run costs (the credit returns), what the STL omits (color, units, materials), and how free iteration works (previews bill nothing, ever). Pinned answers only.",
      },
      {
        title: "Conclusion",
        note: "The reference restates its keywords; this clone restates its chain: photo in (plus tagged views when possible), free preview, one confirming credit, binary STL out, slicer-side judgment — and every number in that chain is a constant this codebase's tests anchor. The closing chain, one line each way: photo in with a readable silhouette, tagged views when the object allows, free preview, one confirming credit, binary STL out, slicer-side judgment — and every number in the chain is a constant this codebase's tests anchor, which is the only kind of closing sentence an honest converter article can sign.",
      },
    ],
  },
  {
    slug: "how-to-make-3d-models-with-ai",
    referenceBands: [
      {
        title: "How to Make 3D Models with AI: Step-by-Step",
        note: "The whole method, at the resolution this codebase can stand behind: describe or show, generate, inspect free, confirm once, export. The text door takes a prompt plus presets (Gen-2.5 / Gen-1.5, privacy, batch, lockable seed); the image door takes a primary photo plus up to four direction-tagged views. Both doors feed the same paced pipeline — created, queued, processing — and both land in the same free preview. Confirmation is the only spend: 1 credit standard, 10 agentic, with 50 to start. The [beginner's guide](/blog/how-to-use-hyper3d-beginners-guide) walks the identical flow with the real panels, and the two articles are kept consistent by the same honesty tests. The presets panel is the part of the method most guides skip: version, privacy, batch and the lockable seed are the only pre-generation decisions, and each is named here because each is pinned — a method that names its variables is reproducible in a way a vibes-based one is not.",
      },
      {
        title: "How to Make 3D Models with AI: How it Works",
        note: "The mechanism answer, honestly bounded: prompt- or image-conditioned mesh generation, stated behaviorally. This clone describes what runs — conditioning in, mesh with UVs and material assignment out, task pacing, preview, confirmation, six-format export — and declines to narrate neural internals it cannot demonstrate. The refusal is not coyness; it is the difference between a claim anchored to code and a claim borrowed from a paper. What IS demonstrated: the presets panel's real controls (version choice, privacy toggle, batch size, 0-65535 seed lock — UI-pinned), and the export panel's real byte writers (GLB, GLTF, ASCII FBX, OBJ, binary STL, USDZ — constant-pinned). One more working note the mechanism answer earns: the free preview is also the pipeline's honesty mechanism — it shows the actual mesh before any spend, which is why this codebase can state its boundaries without hedging, and why a reader testing the method should distrust any generator whose preview comes after the bill.",
      },
      {
        title: "Top AI 3D Model Generators Compared",
        note: "The reference's generator roundup — with its best-for tags and free-tier notes — is its own market copy, recorded as attribution rather than restated as knowledge. This clone's row in any comparison is the spec sheet: free previews (the iteration loop costs nothing), 1/10-credit confirmations, 50-credit start, cancel-refund during processing, six pinned export formats, and the stated gaps — no rigging on standard runs, no baked-PBR claims, no photorealism promises. The [feature census](/blog/what-features-does-hyper3d-have) carries the full inventory with the same contract. What this clone's row in that comparison carries that vendor tables never do: the honesty ledger itself — live, partial and not-in-clone verdicts per feature, each with a route — because a generator comparison that omits what a tool cannot do is an advertisement, and this codebase does not publish advertisements.",
      },
      {
        title: "My First-Hand Experience with Hyper3D",
        note: "The reference's experience band is the template this project exists to document — first-person product journeys written identically across its article farm by no one in particular. The experience this codebase can narrate is the one every user reproduces: a prompt or photo becomes a task, the preview renders at zero cost, a bad result is rejected free, a good one confirms for one credit, and the export writes bytes that open in MeshLab or a slicer. No anecdote is needed because every step is reproducible — and reproducibility, not narration, is the honesty standard here.",
      },
      {
        title: "How to Make 3D Models with AI: A Step-by-Step Workflow",
        note: "1) Pick the door: text (prompt + presets) or image (primary + up to four tagged views). 2) Draft real prompt language — shape, proportion, material — from the [styles recipes](/styles) rather than from vibes. 3) Submit and watch the task row pace. 4) Read the free preview like an art director: silhouette first, proportions second, detail last. 5) Iterate free — second and third attempts bill nothing. 6) Confirm the winner (1 standard, 10 agentic). 7) Export per destination — GLB or GLTF for the web, STL for print, OBJ or FBX for interchange, USDZ for AR, the full pinned set of six — and re-export other formats later from the same result. The workflow's economy: exactly one spend, at the moment of commitment. The workflow's cost anatomy, stated once so it never surprises: drafting and submitting are free, previews are free, rejection and revision are free, the confirmation is 1 credit standard or 10 agentic, exports are free from the confirmed result, and a new account starts with 50 credits — the entire method fits inside the starting grant with room for iteration.",
      },
      {
        title: "Common Use Cases and Applications",
        note: "The real ones, bounded: game assets from text or concept art ([game development](/use-cases/game-development) documents the loop); print parts and prototypes that end in a slicer ([3d printing](/use-cases/3d-printing) documents that loop); product-visualization stand-ins for shots and mockups; scene-blocking reference meshes for illustration; and the hobbyist's classic — turning a described object into a held object same-day. The exclusions, stated plainly: scan reconstruction (generation, not measurement), engineering-critical geometry (no accuracy contract), and rigged characters (no skeleton on standard runs — the animation pages say partial and mean it). One boundary worth its own sentence in any honest use-case list: nothing in this pipeline is an accuracy instrument — no dimension is guaranteed to a tolerance — so engineering and medical geometry are excluded by contract, not by caution.",
      },
      {
        title: "FAQ",
        note: "Answered below with this clone's own questions — costs, formats, failure refunds, the seed's meaning, the multi-view contract. Every answer names a mechanism or a constant; none of them needs a marketing voice.",
      },
    ],
  },
  {
    slug: "free-text-to-3d-model",
    referenceBands: [
      {
        title: "Free Text to 3D Model Tools: A Full Comparison for 2025",
        note: "The year-stamped free-roundup heading is the reference's own convention, captured verbatim. What free honestly means here, stated without a tier table: previews are free — every generation renders an inspectable preview before any billing; iteration is free — rejecting and re-submitting costs nothing; the starting grant is 50 credits, each standard confirmation costs 1, each agentic run 10; and cancellation during processing refunds. So a careful user's first several kept models cost exactly their confirmations and nothing else. That is the entire pricing story, it is the pricing story [the plans article](/blog/how-much-do-hyper3d-plans-cost) tells with the same constants, and no free-trial fine print exists to contradict it because there are no plans. The no-plans part of the story deserves its sentence: there is no subscription, no trial countdown, no watermark tier — the starting grant and the per-confirmation price are the entire pricing surface, and [the plans article](/blog/how-much-do-hyper3d-plans-cost) carries the same statement with the constants pinned.",
      },
      {
        title: "What is Text-to-3D and How Does It Work?",
        note: "Prompt-conditioned mesh generation, stated behaviorally: a prompt (plus preset controls — generation version, privacy, batch size, lockable 0-65535 seed) becomes a task; the pipeline produces a mesh with UVs and a material assignment; the preview is free; confirmation is the only spend; export serves the six pinned formats. This codebase's description stops at that resolution deliberately — the mechanism claims beyond it (diffusion this, latent that) belong to papers that demonstrate them, and a clone that repeats them is borrowing authority it did not earn. What is demonstrated instead: the UI controls and the export bytes, both pinned by tests.",
      },
      {
        title: "Top Free Text to 3D Model Tools Compared",
        note: "The reference's free-tier roundup — credits-per-month, watermarks, resolution caps across vendors — is its own copy, recorded as attribution. This clone's row, without a podium: previews free, iteration free, 50-credit start, 1/10-credit confirmations, cancel-refund, six formats, no watermark story (nothing is watermarked because nothing is metered that way), and the gaps stated rather than hidden — no rigging, no baked PBR, no photoreal promises. The comparison dimension that separates this page from the reference's roundups: every claim above is test-pinned to running code, including the 50/1/10 numbers the ledger enforces across the site.",
      },
      {
        title: "My First-Hand Experience with Hyper3D Rodin",
        note: "The reference's experience band — the same first-person template across its farm — is the tell this project documents. The substitute is the reproducible account: prompt in, task paced, preview rendered at zero cost, rejection free, confirmation one credit, export bytes that open in third-party tools. What makes the account honest is not modest phrasing but checkability: a reader with a fresh account can run the identical sequence and compare notes — [the credit mechanics article](/blog/how-many-credits-does-each-hyper3d-generation-cost) pins every number the sequence spends. One more free-tier fact that comparisons bury: cancellation during processing refunds the credit, so even the paid step is reversible up to the moment of completion — free turns out to be a gradient, and the gradient is stated rather than discovered.",
      },
      {
        title: "Step-by-Step Guide to Creating a 3D Model from Text",
        note: "1) Draft the prompt with real shape and material language; the [styles recipes](/styles) and the [3d-prompts tree](/3d-prompts) are the copy-paste shelf. 2) Set the presets: generation version, privacy, batch size, seed (lock it when you want repeatable conditioning). 3) Submit; the task paces through created, queued, processing. 4) Read the free preview — silhouette, proportions, then detail. 5) Iterate free until it is right; previews never bill. 6) Confirm once: 1 credit standard, 10 agentic. 7) Export GLB, GLTF, FBX, OBJ, STL or USDZ — the six pinned formats — and re-export any other later from the same confirmed result, free. The steps that cost nothing deserve their own numbering inside the list: drafting from the recipes shelf (free), submitting (free), previewing (free), rejecting and revising (free), and re-exporting other formats later (free) — the single metered moment is the confirmation, and a workflow that knows where its one spend sits is a workflow that iterates without anxiety.",
      },
      {
        title: "Common Use Cases for Text-to-3D Models",
        note: "Where text-to-3D genuinely earns its keep, per this codebase's own use-case documentation: rapid asset drafts for games ([game development](/use-cases/game-development)); print-bound parts and props ([3d printing](/use-cases/3d-printing)); visualization stand-ins for product and shot mockups; scene-blocking meshes for illustration and storyboarding; and the zero-to-held-object hobby loop. The boundary list travels with it: nothing here is scan reconstruction, engineering geometry, or rigged character work — and the pages that cover those adjacent topics say partial or not-in-clone and mean the words. The free framing earns one more honest use case of its own: evaluation — trying the text-to-3d door itself, on the reader's own prompts, costs the starting grant and nothing more, which makes this article's claims checkable for less than the price of the coffee consumed while checking them.",
      },
      {
        title: "FAQ",
        note: "Answered below with this clone's own questions — the cost of free (previews and iteration, exactly), the seed's behavior, failure refunds, the format set, and the no-plans pricing reality. Pinned constants throughout; template phrasing nowhere.",
      },
    ],
  },
  {
    slug: "generate-3d-game-assets",
    referenceBands: [
      {
        title: "How to Generate 3D Game Assets with AI (No Art Skills)",
        note: "The no-art-skills framing is the reference's hook, kept verbatim as its own; the honest version underneath is more precise: generation replaces modeling labor, not art judgment. The workflow that actually runs here: prompt the asset with shape, proportion and material language (the [styles recipes](/styles) carry working game-shaped prompts); generate through the paced pipeline; read the free preview like an art director; confirm once (1 credit standard, 10 agentic — new accounts start with 50); export for the engine — GLB for web and XR runtimes, FBX or OBJ for traditional engine import. The [game-development use case](/use-cases/game-development) documents the full loop with the same contract. The no-art-skills claim has an honest sibling: no modeling-time either — the pipeline replaces the modeling hours, and the engine's import dialog is the only manual step between prompt and project.",
      },
      {
        title: "Why Use AI to Generate 3D Game Assets?",
        note: "The real reasons, observed rather than pitched: iteration economics (previews are free, so a designer can explore five silhouettes before committing one credit), speed-to-stand-in (a described prop exists in the project same-minute instead of same-sprint), and scope reach for solo developers (the asset bench stops being the bottleneck on what the game can contain). What generation does not change, honestly: art direction still decides what is worth making; the engine's budget still constrains polycount and texture cost; and rigged characters remain out of scope on standard runs — the animation pages say partial and enumerate exactly what that means. One more honest reason the list should carry: consistency of economics — the cost of a generated asset does not scale with its complexity, so the fat prop and the thin prop cost the same confirmation, which changes what a small team dares to greenlight.",
      },
      {
        title: "Top AI Tools to Generate 3D Game Assets",
        note: "The reference's roundup with best-for tags is its market copy — recorded here as attribution, not adopted as this clone's knowledge. The local spec sheet instead: two real generation doors (text and image, the latter with the schema-pinned multi-view input), free previews and iteration, 1/10-credit confirmations with a 50-credit start, six pinned export formats — GLB, GLTF, FBX, OBJ, STL and USDZ, the same constant every export page pins — with GLB native for web runtimes, FBX ASCII and OBJ for DCC/engine interchange, STL for printed props, USDZ for AR sideshows; ControlNet constraints for bounding-box discipline, and the HDRI generator for lighting reference. Every line is a feature this codebase serves or a gap it states.",
      },
      {
        title: "My First-Hand Experience: Generating a 3D Asset with AI",
        note: "The reference narrates its asset-creation anecdote in the first person — the farm's standing template. The account that substitutes for it here is the reproducible one: prompt a prop, watch created-queued-processing, preview free, reject the mushy read free, confirm the good read for one credit, export GLB, drop it into the engine. Every sentence is a mechanism, every mechanism is pinned, and the sequence costs a reader with a fresh account exactly what the article says it costs — [the beginner's guide](/blog/how-to-use-hyper3d-beginners-guide) walks the same pipeline with the real panels named.",
      },
      {
        title: "Objective Comparison of AI 3D Asset Generation Tools",
        note: "Objectivity as a spec sheet, not a podium — this clone's row: input doors (text; image with primary plus up to four direction-tagged views), iteration cost (zero until confirmation), confirmation cost (1 standard, 10 agentic), starting grant (50), cancel-refund during processing, export set (six test-pinned formats), spatial control (ControlNet bounding-box and voxel constraints — real routes), lighting reference (local procedural HDRI to 4K PNG), and the stated gaps: no texture painting, no rigging, no baked PBR. The reference's comparison table carries whatever else it carries, under its own authorship; the difference in kind is that this row's every cell is anchored to running code. Two rows the spec sheet adds late but loudly: spatial control via ControlNet is a real differentiator (bounding-box, voxel and pointcloud constraint doors exist as routes here), and lighting reference via the local HDRI generator (procedural, seeded, PNG to 4K) covers the environment side of asset work without a single upload — both pinned, both stated with their boundaries.",
      },
      {
        title: "FAQ: Generating 3D Game Assets with AI",
        note: "Answered below with this clone's own questions: which formats feed which engines, what polycount control really exists (prompt-steered spec geometry and honest topology notes — no slider, stated), what rigging support means here (none on standard runs, said plainly), and what a failed generation costs (the credit returns). Template-free, mechanism-first.",
      },
      {
        title: "Conclusion",
        note: "The reference closes by restating its hook. This clone closes with the loop: prompt, preview free, confirm one credit, export six ways, engine-side — a loop whose every cost is a pinned constant and whose every boundary is a stated sentence, which is the only kind of conclusion an honest clone can sign. One closing line for the loop's every station: the prompt shelf, the free preview, the one-credit confirmation, the six-format export, and the engine that receives them — each either pinned here or named as external, which is the whole honesty contract applied to a workflow.",
      },
    ],
  },
];
