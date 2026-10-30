/**
 * Help Center content, part B — Credit (6) + Features, first half (7).
 * Reference sitemap parity (recon 2026-10-30): these are the categories'
 * exact article sets, minus the ones in part C.
 *
 * Honesty anchors used in this module (all real code facts):
 *  - INITIAL_BALANCE 50 / STANDARD_COST 1 / AGENTIC_COST 10 (credits.ts)
 *  - confirm charges exactly CONFIRM_COST = 1, atomically, once
 *    (confirm.ts; second confirm answers "already_confirmed", charges 0)
 *  - task states: created → queued → processing → DonePreview → done|failed
 *  - neural abort reasons: SSE error, stall > 75s, fetch failure, quota —
 *    then the server Fast-tier fallback stamps engine_used="fast"
 *  - export route rejects bad formats and unfinished tasks
 *  - cancel: pay-by-result tasks were never charged; creation-charged
 *    tasks are refunded in full (ledger reason "cancel_refund");
 *    complete tasks answer 409 "already_complete"
 */

import type { HelpArticleDef } from "./help-types";
import { STUDIO_PATH } from "./studio-path";

export const HELP_ARTICLES_B: HelpArticleDef[] = [
  /* ------------------------------- Credit (6) ----------------------------- */
  {
    slug: "how-many-credits-does-each-hyper3d-generation-cost",
    title: "How many credits does each generation cost?",
    category: "credit",
    description:
      "The real price list: 50 credits at signup, 0 to create and preview, exactly 1 at Confirm & Export for standard runs, 10 for agentic runs.",
    status: "live",
    answer:
      "Creating a task and watching its preview costs 0 credits. Confirm & Export costs exactly 1 credit for a standard run and 10 for an agentic run, charged once. New accounts start with 50 credits, and OmniCraft's local tools cost nothing.",
    sections: [
      {
        heading: "The price list (from the code, not a pricing page)",
        paragraphs: [
          "The numbers in this article are the constants the metering code actually uses, which is why they are so refreshingly short: a new account is granted 50 credits at signup; a standard generation costs 1 credit; an agentic-tier generation costs 10 credits; and the first task's preview is free — under the pay-by-result flow every preview is free, because the charge only happens at confirm.",
          "Confirm is atomic and idempotent: it charges exactly 1 credit once, inside a single transaction, and a second confirm attempt answers 'already confirmed' and charges 0. Your balance never goes negative — an insufficient balance refuses the request with a 402 instead.",
        ],
      },
      {
        heading: "What never costs credits",
        paragraphs: [
          "OmniCraft's tools do not touch the ledger: HDRI Generation, Vector to 3D, the Model Viewer and the Format Convertor run without spending credits. Browsing, searching, liking featured models, polishing a prompt and watching progress are all free actions too.",
        ],
        note: "50 to start · 0 to preview · 1 per standard confirm · 10 per agentic run. Those four numbers are the entire pricing model.",
      },
    ],
    related: [
      { label: "Failed generations cost 0", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Do credits expire?", href: "/help/articles/do-hyper3d-credits-expire" },
      { label: "Purchasing credits (not possible)", href: "/help/articles/how-to-purchase-hyper3d-credits" },
      { label: "Beginner's guide", href: "/help/articles/how-to-use-hyper3d-beginners-guide" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "do-hyper3d-credits-expire",
    title: "Do credits expire?",
    category: "credit",
    description:
      "No — this clone has no expiry logic at all. Credits persist until spent; nothing schedules a lapse, a rollover or a monthly reset.",
    status: "live",
    answer:
      "No. Credits in this clone never expire: the ledger keeps a plain per-account balance, and nothing in the codebase schedules an expiry, a rollover window or a monthly reset. Credits leave your balance exactly one way — you spend them on confirms.",
    sections: [
      {
        heading: "What the code actually does",
        paragraphs: [
          "The balance is an integer per account, moved only by grants (your 50-credit signup) and spends (your confirm actions), each recorded as a ledger entry with a reason and timestamp. There is no TTL on entries, no cron that sweeps balances, and no subscription cycle that could reset an allowance — the entire concept of expiring credits has no place to attach in this codebase.",
        ],
      },
      {
        heading: "The honest caveats",
        paragraphs: [
          "Two limits are real, though neither is expiry. First, a balance is tied to its account and is not transferable — a second account means a second, separate 50-credit grant, not a merge. Second, if you delete your browser data you only lose the session cookie; the account and its balance stay intact behind the sign-in page, where a password you cannot remember becomes the real 'expiry' risk (the reset article covers that honestly).",
        ],
        note: "No expiry logic exists here. Spend them today or spend them next month — the ledger does not care.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Checking your balance", href: "/help/articles/how-to-check-hyper3d-credit-history" },
      { label: "Password reset (not offered)", href: "/help/articles/how-to-reset-hyper3d-password" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-check-hyper3d-credit-history",
    title: "How to check your credit history",
    category: "credit",
    description:
      "Your live balance is always in the studio top bar; a full per-entry history page is not exposed in this clone. Here is exactly what you can and can't see.",
    status: "partial",
    answer:
      "Your current balance is always visible in the studio top bar, fetched live from the account endpoint. A full per-entry credit history page is not exposed in this clone — the ledger records every grant and spend internally, but only balances and per-task spend are surfaced in the UI.",
    sections: [
      {
        heading: "What you can see",
        paragraphs: [
          "The studio top bar shows your balance and updates it after each task action, because it reads the same account endpoint the metering writes through. Every task card also shows what that task actually spent — a preview-stage task shows 0, a confirmed task shows its 1 (or 10) credit charge — so recent activity is reconstructable task by task from your list.",
        ],
      },
      {
        heading: "What you can't see (yet, or at all)",
        paragraphs: [
          "There is no wallet-history page: the ledger's individual entries — signup grants, confirm spends, cancel refunds — exist in the database and are asserted by the test suite, but no route renders them as a browsable list. That is a UI gap, not a data gap, and we would rather call it a gap than dress the task list up as an account statement.",
        ],
        note: "Balance: always visible. Per-entry ledger page: not rendered in this clone — the entries exist, the surface doesn't.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Cancel refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "are-credits-deducted-when-a-generation-fails",
    title: "Are credits deducted when a generation fails?",
    category: "credit",
    description:
      "No — creation is free and the charge only happens at confirm, after a successful preview. Failed generations cost 0 credits here.",
    status: "live",
    answer:
      "No. Under this clone's pay-by-result flow a generation is charged only at Confirm & Export — a step that only exists after a successful preview — so a failed generation costs 0 credits by construction. There is one legacy edge (creation-charged tasks) and it is covered below.",
    sections: [
      {
        heading: "Why failure cannot bill you",
        paragraphs: [
          "The task lifecycle runs created → queued → processing → DonePreview → done (or failed). The only charge point sits after DonePreview, at your explicit confirm, when the pipeline has already produced the model you are looking at. If the run dies before that — invalid input, engine error, your own cancel — the task ends in failed and the ledger never sees a spend from it. Failure and payment are sequential states, and failure comes first.",
        ],
      },
      {
        heading: "The neural-failure case that still delivers",
        paragraphs: [
          "When the in-browser neural run aborts (connection error, a stall past 75 seconds, quota), the honest fallback kicks in: the server runs the production-proven Fast tier instead, stamps the task with the fallback reason, and you still land on a preview — still 0 credits. You are never charged for watching a recovery happen.",
        ],
      },
      {
        heading: "The legacy edge, stated plainly",
        paragraphs: [
          "Older tasks in this system were charged at creation rather than at confirm. For those, a failure did not auto-refund — the honest recovery was Cancel, which returns the full amount (see the cancel article). No task created under the current flow carries this edge, and the refund article documents the automatic path.",
        ],
        note: "Failed generation, aborted neural run, canceled task — all of them cost 0 under the current flow. The 1-credit charge needs your confirm and a finished preview.",
      },
    ],
    related: [
      { label: "Canceling and refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "are-credits-returned-after-canceling-a-generation",
    title: "Are credits returned after canceling a generation?",
    category: "credit",
    description:
      "Yes where it matters: pay-by-result tasks were never charged, and creation-charged tasks are refunded in full on cancel. Post-confirm cancels are refused.",
    status: "live",
    answer:
      "Yes — in both cases that can occur. Pay-by-result tasks were never charged, so canceling them returns you to exactly zero spent; legacy tasks charged at creation are refunded in full, automatically, the moment you cancel. After a confirm, cancel is refused — the export is already yours.",
    sections: [
      {
        heading: "Cancel before confirm: nothing was taken",
        paragraphs: [
          "Canceling a running or preview-stage task marks it failed with an honest 'Canceled by user' error and touches no credits, because under pay-by-result the charge lives at confirm, which you never reached. The button gives the API a one-word story: canceled, spent 0.",
        ],
      },
      {
        heading: "Cancel a creation-charged (legacy) task: full refund",
        paragraphs: [
          "For tasks that were charged at creation, Cancel grants back exactly what was spent — in full, immediately — and the ledger records it with the reason 'cancel_refund' so the movement is auditable. The task flips to failed, its charge flips to zero, and your balance is made whole without a support request in sight.",
        ],
      },
      {
        heading: "After confirm: cancel is refused, on purpose",
        paragraphs: [
          "Once a task is complete or confirmed, the cancel endpoint answers 'already complete' with a 409 and changes nothing. The preview was delivered, the credit was spent on a real result, and the export remains available — undoing a delivered result would make the 1-credit promise meaningless.",
        ],
        note: "Pay-by-result cancel: 0 taken, 0 to return. Legacy cancel: refunded in full, automatically. Post-confirm: refused (409) — the model is yours.",
      },
    ],
    related: [
      { label: "Failed generations", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Refund article", href: "/help/articles/how-to-request-a-hyper3d-refund" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "why-did-my-hyper3d-generation-fail",
    title: "Why did my generation fail?",
    category: "credit",
    description:
      "The real failure modes: rejected inputs, neural aborts (with an automatic Fast-tier fallback), your own cancel, and true pipeline errors — and what each costs.",
    status: "live",
    answer:
      "Failures here come from four honest places: input the pipeline rejects, a neural run that aborts (connection error, stall past 75 seconds, quota — usually rescued by the automatic Fast-tier fallback), your own Cancel, or a true pipeline error. All of them cost 0 credits under the current flow.",
    sections: [
      {
        heading: "Reading what actually happened",
        paragraphs: [
          "A failed task carries its reason in the task's error field, and the common values are honest ones: 'Canceled by user' for your own cancels, fallback reasons like connection errors or stalls for neural aborts, and validation messages for rejected inputs. Start there — the status line on the card is the diagnosis, not a generic 'something went wrong'.",
        ],
      },
      {
        heading: "The neural abort that usually isn't fatal",
        paragraphs: [
          "The engine run happens in your browser, so it inherits your network's bad days. On an abort the server takes over with the production-proven Fast tier, stamps engine_used='fast' plus the fallback reason, and the task lands on a preview anyway. If your model arrived looking simpler than expected, check the engine tag — you got the fallback, and it still cost you nothing until you confirm.",
        ],
      },
      {
        heading: "A real troubleshooting pass",
        paragraphs: [
          "Most failures resolve in one of four moves, and none of them cost credits to try.",
        ],
        steps: [
          {
            title: "Check the input",
            body: "One clear subject for images, a specific prompt for text — the pipeline rejects what it cannot interpret, and the error says so.",
          },
          {
            title: "Check your balance",
            body: "A 402 means the ledger refused a charge; the balance top bar is the fastest check. (Creation itself is free — this fires at confirm.)",
          },
          {
            title: "Look at the engine tag",
            body: "engine_used='fast' with a fallback reason means the neural run aborted but the fallback delivered. Not a failure — a rescue.",
          },
          {
            title: "Generate again",
            body: "Retry is free: creation and preview cost 0, so a second attempt is the cheapest diagnostic this side of anywhere.",
          },
        ],
        note: "Failed tasks cost 0 under pay-by-result. Retry freely — the 1-credit charge cannot happen until a preview exists and you confirm it.",
      },
    ],
    related: [
      { label: "Failed generations & credits", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Cancel & refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },

  /* ---------------------- Features, first half (7) ----------------------- */
  {
    slug: "choose-rodin-model-and-generation-settings",
    title: "Choosing a model version and generation settings",
    category: "features",
    description:
      "The studio's real controls: two live modes (Text and Image to 3D), Gen-1.5 vs Gen-2.5 versions, five effort levels — and the settings that don't exist here.",
    status: "partial",
    answer:
      "The studio exposes the reference-shaped controls: a mode picker (Text to 3D and Image to 3D are live; Editing and WorldGen are marked 'not implemented here yet'), two model versions (Gen-1.5 speedy standard and Gen-2.5 agent-ready with five efforts), and viewer display modes. What it doesn't have: polycount targets, seeds or LOD switches.",
    sections: [
      {
        heading: "What the controls really steer",
        paragraphs: [
          "The mode picker is honest about reachability — 'Image and Text to 3D are live' is the interface's own wording for the two entries that run, and the other two entries stay visible but disabled with their reason. Model versions map to real pipelines: Gen-1.5 is the speedy standard path, Gen-2.5 is the agent-ready tier whose runs cost 10 credits instead of 1.",
          "Effort is a real, five-step dial — Extreme-Low through Extreme-High — that trades refinement time (4 seconds up to 80) for detail in the result. The viewer's shaded, wireframe and normal modes are display toggles for inspecting what you generated, not regeneration settings.",
        ],
      },
      {
        heading: "The settings that are not on the panel",
        paragraphs: [
          "There is no polycount slider, no face-count target, no LOD chain and no seed field — geometry here is prompt-steered and pipeline-built, not budgeted. The topology article explains why and what to do instead, and the styles pages state the same limit per style (the low-poly page says 'no polycount slider' in plain words).",
        ],
        note: "Two live modes, two versions, five efforts. No polycount, no LOD, no seeds — absence stated on the panel itself.",
      },
    ],
    related: [
      { label: "Topology & polycount", href: "/help/articles/control-topology-polycount-and-lods" },
      { label: "Agentic mode", href: "/help/articles/use-rodin-agentic-mode-for-image-to-3d" },
      { label: "Beginner's guide", href: "/help/articles/how-to-use-hyper3d-beginners-guide" },
      { label: "Low-poly style page", href: "/styles/low-poly" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "connect-hyper3d-rodin-mcp-to-ai-agents",
    title: "Connecting the MCP endpoint to AI agents",
    category: "features",
    description:
      "The studio's Connect Hyper3D MCP sheet is real: a public Streamable HTTP endpoint, a CLI install line and a paste-ready agent instruction.",
    status: "partial",
    answer:
      "The 'Connect Hyper3D MCP' sheet in the studio is real and gives you three copyable facts: the public Streamable HTTP endpoint (api.hyper3d.com/api/mcp), the CLI install command, and a paste-ready instruction that configures an AI agent to use it. The MCP server itself is the public Hyper3D service, not this clone's backend.",
    sections: [
      {
        heading: "What the sheet hands you",
        paragraphs: [
          "Open the modal from the top bar and you get the endpoint URL, the CLI one-liner (npm install --global @hyper3d/cli), and a compact agent instruction that tells a coding agent how to register the connection, authorize in the browser and verify the tool list. Everything on the sheet copies with one click, which is the entire job of a connect sheet.",
        ],
        steps: [
          {
            title: "Copy the agent instruction",
            body: "The sheet's instruction block names the connection, gives the Streamable HTTP URL and says OAuth — paste it into your agent's chat.",
          },
          {
            title: "Authorize in the browser",
            body: "The agent walks you through browser authorization against the real service; the sheet's hint text tells you to expect it.",
          },
          {
            title: "Verify the tools",
            body: "Ask the agent to list the available tools and whether a restart is required — the last line of the instruction asks for exactly that.",
          },
        ],
      },
      {
        heading: "The honest boundary",
        paragraphs: [
          "This clone's own backend is its task API, not an MCP server — the endpoint in the sheet belongs to the real Hyper3D service and knows nothing about your clone account or its 50 credits. The sheet exists here because the reference has the same affordance; what it configures lives on the real service, and we say so rather than imply this workspace is the MCP host.",
        ],
        note: "The sheet is this clone's; the MCP endpoint is the public Hyper3D service. Two different backends, one honest modal.",
      },
    ],
    related: [
      { label: "What is Hyper3D", href: "/help/articles/what-is-hyper3d" },
      { label: "Feature overview", href: "/help/articles/what-features-does-hyper3d-have" },
      { label: "API feature page", href: "/features/api" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "control-topology-polycount-and-lods",
    title: "Controlling topology, polycount and LODs (you can't here)",
    category: "features",
    description:
      "There is no polycount slider and no LOD generation in this clone — geometry is prompt-steered. The honest path: export and retopo in a DCC.",
    status: "not-in-clone",
    answer:
      "You can't — this clone has no polycount slider, no face-count targeting and no LOD generation. Geometry comes from the prompt-steered pipeline, and effort changes refinement time, not triangle budget. The honest path for topology control is exporting the mesh and retopologizing in Blender or your DCC of choice.",
    sections: [
      {
        heading: "What topology looks like here",
        paragraphs: [
          "Meshes are built by the generation pipeline from your prompt and settings — there is no decimation stage, no face-count parameter and no LOD chain anywhere in the code path. The effort dial (Extreme-Low to Extreme-High) changes how long the run refines, which changes detail, but at no point do you or the pipeline set a numeric triangle budget.",
        ],
      },
      {
        heading: "The honest workflow instead",
        paragraphs: [
          "If your target engine needs a specific budget or LOD set, treat this workspace as the generator and your DCC as the finisher: export GLB (the most faithful of the six formats), import into Blender, and use its remesher and decimate tools — then build your LOD chain there. The low-poly style page covers the same limit from the styling side and says 'no polycount slider' in exactly those words.",
        ],
        note: "No polycount slider. No face-count targeting. No LODs. Geometry is prompt-steered — budget it in your DCC, not here.",
      },
    ],
    related: [
      { label: "Low-poly style page", href: "/styles/low-poly" },
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
      { label: "Game development use case", href: "/use-cases/game-development" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-avatars-with-chatavatar",
    title: "Creating 3D avatars with ChatAvatar (not in this clone)",
    category: "features",
    description:
      "ChatAvatar isn't implemented here — the nearest honest path is a character-focused Text to 3D run, previewed free and exported the usual way.",
    status: "not-in-clone",
    answer:
      "ChatAvatar does not exist in this clone — there is no portrait-to-avatar pipeline and no avatar-specific rigging or blendshapes. The nearest honest path is a character-focused Text to 3D run: describe the character, preview free, confirm for 1 credit, export the mesh.",
    sections: [
      {
        heading: "What's missing, specifically",
        paragraphs: [
          "An avatar product needs a face-and-body pipeline tuned for humanoid proportions, plus the output niceties avatars imply (usable rigs, blendshapes, ready-made expressions). None of that is implemented here — the feature page for ChatAvatar in this clone states its own absence rather than showing a mockup that implies otherwise.",
        ],
      },
      {
        heading: "The nearest thing that IS real",
        paragraphs: [
          "Text to 3D runs end-to-end here and handles character subjects as happily as any other: a prompt like 'a friendly cartoon mascot character with a round head' previews in the studio viewer for free, and confirming spends the standard 1 credit for a six-format export. What you get is a static mesh with flat parameter materials — no rig, no blendshapes — and the character-design use-case page sets that expectation in the same words.",
        ],
        note: "No ChatAvatar, no rigs, no blendshapes here. Character meshes from Text to 3D are real — everything avatar-specific is not.",
      },
    ],
    related: [
      { label: "Text to 3D in practice", href: "/help/articles/create-3d-models-from-text-with-rodin" },
      { label: "ChatAvatar feature page", href: "/features/chatavatar" },
      { label: "Character design use case", href: "/use-cases/character-design" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-models-from-images-with-rodin",
    title: "Creating 3D models from images",
    category: "features",
    description:
      "Image to 3D is live here: upload one reference image, the caption chain reads it, the pipeline builds the mesh, preview free and 1-credit confirm.",
    status: "live",
    answer:
      "Yes — Image to 3D is live end-to-end. Upload a single reference image, the caption chain describes what it sees, the mesh pipeline builds the model, and you preview it free before the 1-credit confirm unlocks the usual six-format export.",
    sections: [
      {
        heading: "The real flow",
        paragraphs: [
          "The upload is a standard multipart form — the API route takes your file, stores a reference URL alongside the task, and runs the caption step that turns the image into a textual description the mesh builder can steer. What you see in the viewer afterward is the same orbit-able, shaded preview every generation produces, and the same confirm gate applies: nothing is charged while you look.",
        ],
        steps: [
          {
            title: "Pick a clean reference",
            body: "One subject, well-lit, minimal background clutter — the caption step can only describe what the image actually shows.",
          },
          {
            title: "Upload and generate",
            body: "Switch the mode picker to Image to 3D, drop the file, generate. Creation costs 0 credits.",
          },
          {
            title: "Preview, then decide",
            body: "Orbit the result in the viewer; if it's right, Confirm & Export spends 1 credit and enables the download buttons.",
          },
        ],
      },
      {
        heading: "The honest limits",
        paragraphs: [
          "This is a single-image pipeline: there is no multi-view consistency of the kind multi-camera products offer, so occluded backs are the pipeline's best inference, not a second photo's truth. Materials arrive as flat parameters rather than baked textures — the model exports with geometry and parameter materials, and painting happens in your DCC if you need more.",
        ],
        note: "One image in, one mesh out, 0 credits to look, 1 to keep. No multi-view capture, no baked textures — stated, not hidden.",
      },
    ],
    related: [
      { label: "Text to 3D", href: "/help/articles/create-3d-models-from-text-with-rodin" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
      { label: "Image to 3D feature page", href: "/features/image-to-3d" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-models-from-text-with-rodin",
    title: "Creating 3D models from text",
    category: "features",
    description:
      "Text to 3D is live here: prompt in, real mesh out — free preview, 1-credit confirm, six export formats, and a prompt-polish button that actually fixes typos.",
    status: "live",
    answer:
      "Yes — Text to 3D is the primary live loop. Type a prompt, generate, and preview the mesh free; Confirm & Export spends 1 credit and unlocks GLB, GLTF, FBX, OBJ, STL and USDZ. The prompt card even has a working polish button that fixes typos before you commit.",
    sections: [
      {
        heading: "The real flow",
        paragraphs: [
          "The prompt card sits in the studio's control panel: type a description, optionally polish it (a real server-side spell-and-grammar pass, the same 'correct' action the reference's prompt card has), pick your effort, and generate. The task runs the pipeline and lands on a preview you can orbit before any money-like commitment happens — which here means before the single 1-credit confirm.",
        ],
        steps: [
          {
            title: "Write a specific prompt",
            body: "Subject, form, a few adjectives — 'a rugged scout mech with matte panels' beats 'a robot' every time.",
          },
          {
            title: "Polish if you like",
            body: "The polish button cleans typos and grammar without changing your meaning; it returns the corrected prompt for you to approve.",
          },
          {
            title: "Generate, preview, confirm",
            body: "Watch the preview free, then Confirm & Export for 1 credit and download in any of the six formats.",
          },
        ],
      },
      {
        heading: "What 'from text' honestly means here",
        paragraphs: [
          "The prompt steers real geometry through this codebase's own pipeline — it is not a gateway to an external model farm, and there is no style-lock, seed or polycount control attached to it (the settings and topology articles say why). Materials come out as flat parameters; if you need a specific art style, the styles pages tell you which looks are steerable with prompts alone and which need finishing in a DCC.",
        ],
        note: "Prompt in, mesh out, preview free, 1 credit to keep it. The polish button is real — and so is every limit listed above.",
      },
    ],
    related: [
      { label: "Image to 3D", href: "/help/articles/create-3d-models-from-images-with-rodin" },
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Text to 3D feature page", href: "/features/text-to-3d" },
      { label: "Style pages", href: "/styles" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-editable-scenes-with-hyper3d-worldgen",
    title: "Creating editable scenes with WorldGen (not in this clone)",
    category: "features",
    description:
      "WorldGen is listed in the mode picker but marked 'not implemented here yet' — this clone generates single assets, not editable scenes.",
    status: "not-in-clone",
    answer:
      "WorldGen is not implemented in this clone. The mode appears in the picker for structural parity, but the interface itself marks it 'not implemented here yet' — this workspace generates single assets from text or one image, not multi-object editable scenes.",
    sections: [
      {
        heading: "What the picker shows vs what runs",
        paragraphs: [
          "The generation modes are Text to 3D (live), Image to 3D (live), 3D Editing and WorldGen (both honestly disabled). Keeping the full reference-shaped picker visible is deliberate: it shows the surface structure being cloned, and the disabled labels show where this codebase stops. No scene route, no scene serializer and no editable-scene format exist behind that entry.",
        ],
      },
      {
        heading: "The honest alternative",
        paragraphs: [
          "Compose instead of generating a scene: produce the individual assets (each with its own free preview and 1-credit confirm), export them, and assemble the scene in Blender, Unity or Unreal — where editing is real. The use-case pages for game development and VR/AR describe exactly this asset-by-asset workflow and its limits, so the expectation is set before you spend a credit.",
        ],
        note: "WorldGen: listed, disabled, labeled. Single assets are real; scenes are your DCC's job — and the picker says so.",
      },
    ],
    related: [
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/help/articles/create-3d-models-from-text-with-rodin" },
    ],
    updated: "2026-10-30",
  },
];
