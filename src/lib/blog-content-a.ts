/**
 * Blog content A — the four platform overviews plus the full credits &
 * billing set (12 of the 55 written articles).
 *
 * Every number in here is a constant the metering code actually uses:
 * INITIAL_BALANCE 50 / STANDARD_COST 1 / AGENTIC_COST 10 (src/lib/credits.ts),
 * CONFIRM_COST 1 at the pay-by-result gate (src/lib/confirm.ts), and the
 * refund rules from the cancel route. The signup grant is the same
 * INITIAL_BALANCE the sign-up route imports (t65 anchor fix).
 */
import type { BlogArticleDef } from "./blog-types";
import { STUDIO_PATH } from "./studio-path";

export const BLOG_ARTICLES_A: BlogArticleDef[] = [
  {
    slug: "what-is-hyper3d",
    title: "What Is Hyper3D? An Honest Self-Introduction",
    category: "insights",
    description:
      "What Hyper3D is in this codebase: a working text/image-to-3D studio, real exporters, a credit ledger — and a stated list of what it is not.",
    date: "2026-10-30",
    status: "live",
    answer:
      "Hyper3D is an AI 3D-generation workspace: you describe an object or show it a picture, and a task pipeline turns that into a mesh you can preview, confirm, and export in six real formats. That sentence is true of the reference site and of this clone — the honest version adds which parts are real here and which are reference-only.",
    sections: [
      {
        heading: "The short version, anchored in code",
        paragraphs: [
          "Every claim in this article maps to a module in this codebase. The studio runs two live generation modes — Text to 3D and Image to 3D — over a paced task pipeline (created, queued, processing, then a preview you can inspect before spending anything). Confirming a result costs exactly 1 credit for a standard run, 10 for an agentic run, and a new account starts with 50 credits. The export step is not a mock: it writes real GLB, glTF, ASCII FBX, OBJ, binary STL, and USDZ bytes through the three.js exporter family.",
          "Around the studio sit the OmniCraft tools — a texture generator, image enhancer and remix, HDRI generator, 3D model search, an SVG-to-3D converter, a local mesh editor, a browser-only model viewer, and a format convertor. Each one states its own contract on its own page, including the ones that honestly say what they do not do.",
        ],
      },
      {
        heading: "What Hyper3D is not, here",
        paragraphs: [
          "This clone deliberately does not implement everything the reference advertises. There is no WorldGen pipeline (the tab exists and says so), no avatar-specialized workspace with auto-rigging, no payment processing of any kind, and no CAD support anywhere in the exporters. The blog you are reading is itself part of the honesty contract: of the 778 article routes the reference sitemap lists, 55 are written here and the rest are marked pages that explain what they are.",
          "The philosophy is simple and test-enforced: a page may state anything it can anchor to code that runs here, and anything it cannot anchor gets labeled as reference-only rather than faked. That is the difference between a clone and a content farm.",
        ],
      },
      {
        heading: "Where to check every claim",
        paragraphs: [
          "The fastest verification path: open the studio, generate from a text prompt, and watch the balance chip. Creating and previewing costs nothing; the Confirm & Export button is the only place a standard charge lands. Then export the same task twice in two formats and open the files in any viewer — the bytes are real, which is the whole point.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is this the same product as hyper3d.ai?",
        a: "It is an honest clone of that site's surface: the routes, the studio affordances, and the credit contract are reproduced; the parts that would require fabricating content or claiming unimplemented features are explicitly labeled instead of implied.",
      },
      {
        q: "What does a generation cost?",
        a: "Creating a task and watching its preview is free. Confirm & Export costs exactly 1 credit for a standard run and 10 for an agentic run. Every account starts with 50 credits, and nothing in the ledger ages.",
      },
      {
        q: "Which export formats are real?",
        a: "Six: GLB, glTF, FBX (ASCII), OBJ, STL (binary), and USDZ. The exporter writes standards-compliant bytes for each — the format pages in this blog document them one by one.",
      },
    ],
    related: [
      { label: "Open the studio", href: STUDIO_PATH },
      { label: "Feature pages", href: "/features" },
      { label: "OmniCraft tools", href: "/workspace/omnicraft" },
      { label: "Credit cost article", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
    ],
  },
  {
    slug: "what-features-does-hyper3d-have",
    title: "What Features Does Hyper3D Have? The Enumerated Truth",
    category: "insights",
    description:
      "The full feature census of this workspace: two live generation modes, four OmniCraft surfaces, six export formats, MCP — each with its real status.",
    date: "2026-10-29",
    status: "live",
    answer:
      "The implemented set: Text to 3D, Image to 3D (with a VLM caption step you can edit), a confirm-gated credit flow, six real export formats, an MCP connect modal, and the OmniCraft toolbag. The reference-only set: WorldGen, an avatar workspace, video generation, plug-ins, and every plan tier. Both lists are exact.",
    sections: [
      {
        heading: "Live: generation and the meter around it",
        paragraphs: [
          "Two generation modes run real pipelines. Text to 3D takes a prompt (with one-click presets and an optional prompt-polish step) and builds a mesh through the server pipeline. Image to 3D accepts one reference image in .png, .jpg, or .webp, runs a vision model to draft a caption you can edit, and proceeds from there. Both share the same paced queue and both respect the ControlNet spatial constraints (bounding box, voxel, pointcloud) if you set them.",
          "The meter around generation is the part most clones fake and this one runs: a ledger with per-entry reasons (free_preview, standard_generation, agentic_generation, confirm_export, cancel_refund), an atomic confirm gate that cannot double-charge, and an insufficient-balance path that returns 402 without touching your balance.",
        ],
      },
      {
        heading: "Live: the toolbag and the formats",
        paragraphs: [
          "OmniCraft ships four real generators (texture, image enhancer, image remix, HDRI) plus a 3D model search, an SVG-to-3D converter that runs a true local conversion, a mesh editor, a model viewer that parses files in your browser and never uploads them, and a format convertor. The convertor's honest scope: it re-exports tasks you generated here across the six formats — it is not an arbitrary-file upload service, and its pages say so.",
          "Six export formats are written by real exporters: GLB, glTF, FBX, OBJ, STL, USDZ. There is no CAD support anywhere — no DXF or 3MF writer exists in this codebase, and the format pages for those say exactly that.",
        ],
      },
      {
        heading: "Reference-only: stated, not implied",
        paragraphs: [
          "The WorldGen tab exists in the studio and answers honestly that it is not implemented. There is no avatar workspace (one general studio instead), no AI video generator, no image generator beyond the remix tool, and none of the DCC plug-ins. The pricing page is a single honest row: $0, 50 credits at signup, 1 credit per standard confirm — because there is no billing code to describe.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does the studio support image input for generation?",
        a: "Yes — Image to 3D takes one .png/.jpg/.webp reference image; optional additional views are a reference-only affordance. Text to 3D works from the prompt alone.",
      },
      {
        q: "Is there an API?",
        a: "The task pipeline is an HTTP API (create task, poll progress, fetch exports), and the MCP connect modal hands agents a copy-ready config for it. What the reference additionally ships — hosted MCP auth, SDKs, marketplace listings — is out of scope here.",
      },
      {
        q: "What about WorldGen and the avatar workspace?",
        a: "WorldGen has a tab and a feature page and no pipeline. Avatars use the same general studio; the specialized rig-and-blendshape workspace is reference-only and its feature page says so.",
      },
    ],
    related: [
      { label: "All feature pages", href: "/features" },
      { label: "MCP feature page", href: "/features/mcp" },
      { label: "Format convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Beginner's guide", href: "/blog/how-to-use-hyper3d-beginners-guide" },
    ],
  },
  {
    slug: "hyper3d-review",
    title: "Hyper3D Reviewed by Its Own Codebase",
    category: "insights",
    description:
      "A review that can only say what the code does: real pipelines, real exporters, real ledger — scored against the reference's advertised surface.",
    date: "2026-10-28",
    status: "live",
    answer:
      "Reviewed against its own source: generation works, the meter is honest to the credit, exports are real bytes, and roughly a third of the reference's advertised surface is implemented — with the unimplemented third labeled on every page rather than hidden.",
    sections: [
      {
        heading: "What earns the score",
        paragraphs: [
          "A review usually means someone kicked the tires. This one means someone read the tires' source. The strongest part of this workspace is the metering: the confirm gate runs inside a database transaction with a re-check that makes a double-charge structurally impossible, and the cancel path distinguishes pay-by-result tasks (never charged, nothing to refund) from legacy charged tasks (refunded in full). Most products do not get this right; this clone does, and its tests pin it.",
          "The second strength is export honesty. Six formats, real bytes, one format (SVG to 3D) running a genuine local conversion. The model viewer parses in the browser, shows a live triangle count, and never uploads your file — a privacy claim backed by the absence of any upload code path.",
        ],
      },
      {
        heading: "What costs the score",
        paragraphs: [
          "The unimplemented third is real and must be counted against it: no WorldGen, no avatar workspace, no video or general image generation, no plug-ins, no CAD. The blog — this blog — ships 55 written articles out of 778 catalog routes, which is an honest ratio but still a ratio. And there is no payment rail at all, so anyone needing commercial terms needs the reference, not this.",
          "The prose style is another deduction for some readers: every page insists on telling you what it cannot do. That is the point of the project, but it makes the marketing copy read like an audit — because it is one.",
        ],
      },
    ],
    faqs: [
      {
        q: "Who is this for?",
        a: "Developers who want to study or fork a complete, honest AI-3D workspace: real task pipeline, real ledger, real exporters, and a large static-content tree that demonstrates how to clone a surface without cloning its claims.",
      },
      {
        q: "Would this replace the reference for production work?",
        a: "No — and it does not claim to. The reference runs hosted models, payments, and an avatar workspace; this clone runs a local-quality pipeline with a $0 price and states the gap on every relevant page.",
      },
    ],
    related: [
      { label: "Feature census", href: "/blog/what-features-does-hyper3d-have" },
      { label: "Pricing, honestly", href: "/pricing" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    slug: "how-to-use-hyper3d-beginners-guide",
    title: "How to Use Hyper3D: A Beginner's Guide That Runs",
    category: "insights",
    description:
      "First five minutes in the studio: sign up, write a prompt or drop an image, preview for free, confirm for one credit, export in six formats.",
    date: "2026-10-27",
    status: "live",
    answer:
      "Sign up (you get 50 credits), pick Text to 3D or Image to 3D, describe or upload, watch the free preview, then Confirm & Export — that is the 1-credit moment — and download in any of six formats. Everything else in the studio is optional.",
    sections: [
      {
        heading: "Minute one: the account",
        paragraphs: [
          "Sign-up is an email and an 8-plus-character password; the password is hashed with scrypt and you land signed in. Your balance chip will read 50 — that is the same INITIAL_BALANCE constant every credit article here cites, granted by the sign-up route itself. There is no email verification step, no plan to choose, and nothing to pay.",
        ],
      },
      {
        heading: "Minutes two to four: your first preview",
        paragraphs: [
          "In Text to 3D, type what you want — 'a low-poly wooden chair, three legs, sanded' beats 'chair' — or click a preset to seed a prompt. In Image to 3D, drop one .png/.jpg/.webp reference; a vision model drafts a caption from it that you can edit before generating. Pick an effort tier if you care about speed versus detail, then generate. The pipeline paces itself; your preview appears when it finishes.",
          "The preview is free — creating tasks and watching previews never debits, on any account, ever. If you dislike the result, redo it or walk away; the only charge in the whole flow is the next button.",
        ],
      },
      {
        heading: "Minute five: confirm and export",
        paragraphs: [
          "Confirm & Export is the metered moment: exactly 1 credit for a standard run (10 if you ran the agentic tier). It is idempotent — clicking it twice cannot double-charge; the second click just reports the first outcome. After confirming, export in GLB, glTF, FBX, OBJ, STL, or USDZ. The OmniCraft model viewer will open any of them locally in your browser if you want a second opinion before downloading.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need to pay anything to try it?",
        a: "No. There is no payment surface in this codebase at all. The 50-credit signup grant covers 50 standard confirms, and previews are always free.",
      },
      {
        q: "Why did my preview cost zero credits?",
        a: "Because the pay-by-result flow charges at Confirm & Export, not at creation. The only exception in the whole codebase is the legacy creation-charged path, which refunds in full if canceled.",
      },
      {
        q: "What image formats can I upload?",
        a: ".png, .jpg, and .webp, one reference image. Anything else — video, multi-view sets, arbitrary 3D files — is not an input surface here.",
      },
    ],
    related: [
      { label: "Open the studio", href: STUDIO_PATH },
      { label: "Prompt guide", href: "/blog/3d-text-prompt-guide" },
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Help: getting started", href: "/help/getting-started" },
    ],
  },
  {
    slug: "how-many-credits-does-each-hyper3d-generation-cost",
    title: "How Many Credits Does a Generation Cost? The Constants",
    category: "insights",
    description:
      "The complete price list from the metering source: 50 at signup, 0 to preview, 1 per standard confirm, 10 per agentic run, refunds on cancel.",
    date: "2026-10-26",
    status: "live",
    answer:
      "One number per line, straight from src/lib/credits.ts and confirm.ts: a new account starts with 50 credits; creating and previewing costs 0; Confirm & Export costs exactly 1 credit for a standard run and 10 credits for an agentic run; a canceled charge is refunded in full; nothing expires.",
    sections: [
      {
        heading: "The constants, and where each one lives",
        paragraphs: [
          "INITIAL_BALANCE is 50 — the sign-up route imports it and grants it directly, so the balance you see is the constant itself, not a copy of it. STANDARD_COST is 1 and AGENTIC_COST is 10; computeTaskCost returns one of those (or 0 for a first free preview on the legacy path). The pay-by-result gate charges CONFIRM_COST — 1 — inside a single database transaction, with a re-check that makes a second confirm a no-op rather than a second charge.",
          "That is the entire price list. There is no per-format surcharge, no download fee, no private-task fee (the first ten private tasks are free, like every account's), and no tier where any of these numbers change — because there are no tiers.",
        ],
      },
      {
        heading: "When you are actually charged",
        paragraphs: [
          "The ledger records every debit with a reason string, and there are exactly four that reduce your balance: standard_generation (1), agentic_generation (10), confirm_export (1, pay-by-result), and nothing else — every other entry type (free_preview, cancel_refund, grants) either costs 0 or adds credits back. If a balance ever moves for a reason not in that list, it is a bug, and the test suite treats it as one.",
          "The insufficient path is a 402 with your balance and the required amount in the body; your balance is never touched by a failed attempt and can never go negative — the ledger throws before that.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the first generation free?",
        a: "On the pay-by-result flow every preview is free and only Confirm & Export charges, so 'first' is not special there. On the legacy creation-charged path, literally the first task is a 0-credit free preview — computeTaskCost returns 0 when your task count is zero.",
      },
      {
        q: "Do OmniCraft tools cost credits?",
        a: "No. The OmniCraft surfaces — texture, enhancer, remix, HDRI, search, SVG-to-3D, mesh editor, model viewer, convertor — are local/free tooling and never touch the ledger. The convertor re-exports tasks you already confirmed; the export itself costs nothing extra.",
      },
      {
        q: "What happens if I confirm with a low balance?",
        a: "The gate returns 'insufficient' with your balance and the required credit count; your balance is unchanged. You can still preview — generation and preview remain free regardless of balance.",
      },
    ],
    related: [
      { label: "Credit history", href: "/blog/how-to-check-hyper3d-credit-history" },
      { label: "Failure charges", href: "/blog/are-credits-deducted-when-a-generation-fails" },
      { label: "Cancel refunds", href: "/blog/are-credits-returned-after-canceling-a-generation" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
  {
    slug: "how-much-do-hyper3d-plans-cost",
    title: "How Much Do Hyper3D Plans Cost? There Are None",
    category: "insights",
    description:
      "The honest pricing article: no Free/Creator/Business tiers exist here, no dollars are charged anywhere, and the only balance is the 50-credit signup grant.",
    date: "2026-10-25",
    status: "live",
    answer:
      "This workspace has no plans at all: no Free, no Creator, no Business, no monthly allowance, no credit packs. The pricing page is one honest row — $0, with the 50-credit signup grant and the 1/10 credit costs — because there is no billing code behind any other row to describe.",
    sections: [
      {
        heading: "Why the pricing page is one row",
        paragraphs: [
          "The reference sells three tiers with monthly allowances and add-on packs. Reproducing those rows here would mean printing prices for code that does not exist — no checkout, no subscription state, no allowance refresher, no invoice. The honest equivalent is to say what does exist: an account costs nothing to open, arrives with 50 credits, previews are always free, and standard confirms cost 1 credit each. That is the whole commercial surface, and it fits in a sentence because it is the whole truth.",
          "The event pages here make the same point from another angle: a 'free month of Creator' would be comping a plan this codebase cannot even represent, so those pages say the nearest real thing is the standing 50 credits at signup, which expire never.",
        ],
      },
      {
        heading: "What the money-like objects actually are",
        paragraphs: [
          "Credits here are a ledger abstraction, not a currency: integers with reasons and timestamps, stored per user, mutable only through four well-defined operations. There is no conversion rate to dollars, no pack to buy, and no way for the balance to go negative. If you need commercial terms, volume, or an SLA, the honest answer is the reference product — this clone states that on its enterprise-support page too.",
          "For completeness, the numbers that do exist: every account starts with 50 credits, a standard confirm costs 1 credit, and an agentic run costs 10 credits. That is the entire price list a plan page would otherwise decorate.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I buy more credits when the 50 run out?",
        a: "No — there is no purchase path in this codebase. The purchase article in this blog explains why and what the nearest honest alternatives are (the free OmniCraft tools and the always-free previews).",
      },
      {
        q: "What happens to my credits if a plan existed and I changed it?",
        a: "Hypothetical questions get honest answers: the what-happens-to-credits-when-changing-plans article exists in this catalog and explains why its answer is 'not applicable here' rather than a made-up proration story.",
      },
    ],
    related: [
      { label: "Pricing page", href: "/pricing" },
      { label: "Buying credits", href: "/blog/how-to-purchase-hyper3d-credits" },
      { label: "Do credits expire", href: "/blog/do-hyper3d-credits-expire" },
    ],
  },
  {
    slug: "how-to-check-hyper3d-credit-history",
    title: "How to Check Your Credit History",
    category: "insights",
    description:
      "Your live balance is one glance away in the studio; the full per-entry ledger exists in the database — here is exactly how much of it you can see today.",
    date: "2026-10-24",
    status: "partial",
    answer:
      "Balance: real-time, in the studio header — it is the exact value the ledger stores. Full history: every debit and grant is recorded in the credit-entry table with a reason and timestamp — the same ledger that starts every account with 50 credits and charges 1 credit per standard confirm and 10 credits per agentic run — but this clone does not yet surface a page listing your entries. The honest status is partial, and this article does not pretend a history screen exists.",
    sections: [
      {
        heading: "What you can see right now",
        paragraphs: [
          "Open the studio: the balance chip in the header is the user row from the database, not a cache — refresh after any charge and it moves in step. After a Confirm & Export, the toast states the charge, your remaining balance, and thanks you; after an insufficient attempt, the error states the required amount and your current balance. Those two moments plus the header cover most of what a history page would tell you.",
        ],
      },
      {
        heading: "What is recorded but not shown",
        paragraphs: [
          "Under the balance, the ledger keeps an append-only entry log — every account starts with an open-account grant, and each metered event appends a row: free_preview, standard_generation, agentic_generation, confirm_export, or cancel_refund, each with its delta, timestamp, and task id where relevant. That log is queryable through the ledger module and is what a history feature would render.",
          "The gap is the rendering, not the data: no route currently returns your entry list to the browser. When that page ships, it will be a straightforward read of entriesOf — the same call the tests already exercise. Until then, claiming a history screen would be exactly the kind of unanchored claim this project refuses to make.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is my balance accurate immediately after a charge?",
        a: "Yes — the confirm gate updates balance and entry in one transaction, and the studio re-reads it after the response. There is no eventual-consistency window for your own credits.",
      },
      {
        q: "Can I export my credit history?",
        a: "Not from the UI today. The data model supports it (entries carry timestamps and task ids), so the feature is one read route away — stated as a gap, not shipped as a claim.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Help: credit topic", href: "/help/credit" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
  },
  {
    slug: "how-to-purchase-hyper3d-credits",
    title: "How to Purchase Hyper3D Credits: You Can't, and Why",
    category: "insights",
    description:
      "There is no checkout, no pack, and no price in this codebase. The honest guide to what that means and what to do when the 50 run out.",
    date: "2026-10-23",
    status: "not-in-clone",
    answer:
      "There is no way to buy credits here — no checkout route, no payment provider, no pack SKUs, no price list. The reference sells credit packs; this clone has a ledger and no billing. When your balance runs low, the honest options are below.",
    sections: [
      {
        heading: "Why there is no buy button",
        paragraphs: [
          "A purchase flow is more than a button: it needs a provider integration, an order record, a fulfillment path, a refund policy, and a reconciliation story. None of that exists in this codebase, and the project's rule is that a page cannot describe code that is not there. So this article — which the reference catalog lists because their version is a checkout walkthrough — is instead an honest statement of absence plus the real alternatives.",
        ],
      },
      {
        heading: "What to do instead",
        paragraphs: [
          "Three real paths. First, previews are always free: you can generate and inspect without a balance at all, and only confirming costs. Second, the OmniCraft toolbag is credit-free: textures, HDRI skies, image enhancement and remix, SVG-to-3D, the mesh editor, the model viewer, and format re-export never touch the ledger. Third, if you need paid volume, the reference product is the honest destination — this clone's commercial surface is deliberately $0.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will purchases ever be supported?",
        a: "Not by this project's own rule: any payment rail would need real credentials, real liability, and a real operator. A demo clone pretending to take money would be the least honest thing it could do.",
      },
      {
        q: "My balance is 1 and I want an agentic run (10 credits). Options?",
        a: "Agentic runs need the full 10 credits. Standard runs need 1 credit. Everything else — previews, OmniCraft, exports of already-confirmed tasks — costs nothing, and the starting 50 credits are the only inflow.",
      },
    ],
    related: [
      { label: "Plans cost article", href: "/blog/how-much-do-hyper3d-plans-cost" },
      { label: "OmniCraft (free tools)", href: "/workspace/omnicraft" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
  {
    slug: "do-hyper3d-credits-expire",
    title: "Do Hyper3D Credits Expire? Never",
    category: "insights",
    description:
      "The ledger has no aging, no monthly reset, and no allowance refresher — an honest look at why the answer is a flat no.",
    date: "2026-10-22",
    status: "live",
    answer:
      "No. Nothing in the credit code ages a balance: there is no expiry timestamp, no monthly reset job, and no allowance window. A credit sitting in your account is the same integer tomorrow, next month, and next year.",
    sections: [
      {
        heading: "What the code actually does with time",
        paragraphs: [
          "The ledger's time-awareness begins and ends with timestamps on entries — created for audit, never consulted for decay. Balances change through exactly four operations (grant, spend at creation on the legacy path, the confirm charge, refunds), and none of them looks at the clock. There is no cron, no TTL, and no 'valid until' anywhere in the schema.",
          "This is also why the event pages here can say the 50-credit signup grant 'expires never' with a straight face: it is not a marketing promise, it is the absence of expiry code. A subscription allowance would be different — allowances reset — but there are no subscriptions here to reset.",
        ],
      },
      {
        heading: "How to verify it yourself",
        paragraphs: [
          "The check is the same one the tests run: read a balance, wait any amount of time, read it again — the integer is untouched unless a metered event moved it. Every credit article in this blog quotes the same numbers because they all read the same constants: 50 credits at signup, 1 credit per standard confirm, 10 credits per agentic run, and time nowhere in the formula.",
          "That last clause is the entire article, honestly stated: the words 'expire', 'reset', and 'renew' do not appear in the metering code, because the concepts do not exist in it.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does the 50-credit signup grant expire?",
        a: "No — it is an ordinary balance credit with no expiry semantics. The only thing that reduces the starting 50 credits is your own standard (1 credit) and agentic (10 credits) charges.",
      },
      {
        q: "Do credits reset monthly?",
        a: "No. There is no monthly cycle in this codebase — no allowance, no refresh date, nothing to reset. Your balance is a running total that only moves when you generate.",
      },
      {
        q: "Is there any event that ages my balance?",
        a: "No — account-level operations never rewrite the running total either. If a balance moved without a standard (1 credit), agentic (10 credits), or refund entry behind it, that would be a bug, and the ledger tests treat it as one.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Plans article", href: "/blog/how-much-do-hyper3d-plans-cost" },
      { label: "Credit history", href: "/blog/how-to-check-hyper3d-credit-history" },
    ],
  },
  {
    slug: "are-credits-deducted-when-a-generation-fails",
    title: "Are Credits Deducted When a Generation Fails?",
    category: "insights",
    description:
      "Failure paths and the ledger: pay-by-result tasks were never charged, legacy charges are refunded in full, and the balance can never go negative.",
    date: "2026-10-21",
    status: "live",
    answer:
      "No. On the pay-by-result flow a failed task was never charged — the only charge is Confirm & Export (1 credit standard, 10 credits agentic), which happens after you have seen a good preview. On the legacy creation-charged path, a failed task's charge is refunded in full. Either way, failure costs you zero of your credits — the starting 50 credits included.",
    sections: [
      {
        heading: "The two paths, both failure-safe",
        paragraphs: [
          "Path one, pay-by-result: the pipeline creates the task, processes it, and delivers a preview; the meter starts only when you press Confirm & Export on a result you can see. A failure happens before that gate, so there is nothing to deduct — the task row is marked failed with the engine's error message and the ledger never hears about it.",
          "Path two, legacy creation-charged (still reachable through the API for compatibility): the charge lands at creation. If the pipeline then fails — an invalid spec, an engine error — the cancel/failure handling refunds the full creditsSpent and resets the row's spend to zero, with a cancel_refund entry in the log. The refund is a grant back, so the arithmetic is exact, not approximate.",
        ],
      },
      {
        heading: "Why this is trustworthy",
        paragraphs: [
          "Because it is pinned: the test suite includes a task that fails after a charge and asserts the balance is made whole, and an insufficient-balance case that asserts the balance is untouched by the attempt. The failure article in the Help Center covers the user-facing symptoms; this one covers the money, and they agree because they both read the same routes.",
        ],
      },
    ],
    faqs: [
      {
        q: "What if the preview looks bad rather than failing outright?",
        a: "Bad-looking previews are free too — you can redo or abandon without confirming. The 1-credit charge exists only on the confirm side of a preview you decided to keep.",
      },
      {
        q: "Can a failure leave me with a negative balance?",
        a: "No. The ledger throws before any spend that would cross zero, and refunds only ever add. Negative balances are structurally impossible here.",
      },
    ],
    related: [
      { label: "Why generations fail", href: "/blog/why-did-my-hyper3d-generation-fail" },
      { label: "Cancel refunds", href: "/blog/are-credits-returned-after-canceling-a-generation" },
      { label: "Help: troubleshooting", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
    ],
  },
  {
    slug: "are-credits-returned-after-canceling-a-generation",
    title: "Are Credits Returned After Canceling a Generation?",
    category: "insights",
    description:
      "Cancel semantics from the cancel route: pay-by-result tasks have nothing to refund, legacy charged tasks are refunded in full — with the receipt entries.",
    date: "2026-10-20",
    status: "live",
    answer:
      "Yes, in the only case where there is anything to return: if you cancel a legacy task that was charged at creation, the full amount is granted back as cancel_refund. If you cancel a pay-by-result run, nothing is deducted because nothing was charged — the cancel response says so explicitly. For scale: the amounts in play are 1 credit per standard confirm and 10 credits per agentic run, against the 50 credits every account starts with.",
    sections: [
      {
        heading: "What the cancel button actually does",
        paragraphs: [
          "Canceling marks the task failed with 'Canceled by user' as the error string — an honest tombstone rather than a silent delete. It refuses to touch completed tasks (409) and treats already-failed tasks as a no-op success. If the task carries creditsSpent — which on this codebase means the legacy creation-charged path — the route refunds exactly that amount through a ledger grant, resets the row's spend counter to zero, and returns the refunded figure in the JSON.",
          "For the pay-by-result tasks the studio creates today, creditsSpent is zero until you confirm, and canceling an unconfirmed task refunds nothing because nothing was taken. The studio's cancel toast states it plainly: no credits were used.",
        ],
      },
      {
        heading: "Why the refund is exact, not approximate",
        paragraphs: [
          "The refund is a grant of precisely the creditsSpent value stored on the task row — the same integer the original charge wrote, re-applied as a new ledger entry with the cancel_refund reason. Nothing prorates, nothing rounds, and nothing consults elapsed time; a canceled task returns exactly what it took, whether you cancel two seconds or two hours in.",
          "That symmetry is what makes the meter auditable: every credit that leaves your balance has a reason string, and every credit that returns has one too. The test suite pins both directions — a charge that lands, and a refund that makes the balance whole again.",
        ],
      },
    ],
    faqs: [
      {
        q: "What if I cancel right after confirming?",
        a: "Confirmed tasks are complete (409 on cancel). The confirm charge is for the export you unlocked — the export and re-exports of that task stay available and cost nothing further.",
      },
      {
        q: "Where would I see the refund?",
        a: "In your balance immediately, and in the ledger as a cancel_refund entry. The history-rendering gap is documented in the credit-history article — the data is written even where the UI has not caught up.",
      },
    ],
    related: [
      { label: "Failure charges", href: "/blog/are-credits-deducted-when-a-generation-fails" },
      { label: "Credit costs", href: "/blog/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Credit history", href: "/blog/how-to-check-hyper3d-credit-history" },
    ],
  },
  {
    slug: "what-happens-to-credits-when-changing-plans",
    title: "What Happens to Credits When Changing Plans?",
    category: "insights",
    description:
      "The reference prorates allowances across Free/Creator/Business tiers. Here there are no tiers, so the honest answer is 'not applicable' — with the numbers.",
    date: "2026-10-19",
    status: "not-in-clone",
    answer:
      "Not applicable: there are no plans to change between. No Free/Creator/Business tiers exist in this codebase, no allowance to prorate, no upgrade or downgrade path. Your balance is one number — the 50 credits you started with, minus 1 credit per standard confirm and 10 credits per agentic run — and it survives every 'change' because there is nothing to change.",
    sections: [
      {
        heading: "Why this route still exists",
        paragraphs: [
          "The reference sitemap lists this article because their version answers a real question for paying customers. This clone keeps the route — full sitemap parity is the project's rule — and answers it the only honest way: by describing the actual billing surface. One tier, $0, no checkout, no plan column on the user row, no proration math to explain. The most truthful proration story in the world cannot be written about code that does not exist.",
          "The nearest real question is 'what happens to my credits over time', and that one has a real answer in the expiry article: nothing happens, ever. Credits here are a running total, not a subscription benefit.",
        ],
      },
      {
        heading: "The arithmetic that replaces proration",
        paragraphs: [
          "For readers who want the number-shaped answer anyway, here is the whole model: open an account and the ledger grants 50 credits; every standard Confirm & Export subtracts 1 credit; every agentic run subtracts 10 credits; refunds add back exactly what a canceled legacy task took; and no plan event — because no plan event exists — ever touches the total. There is no monthly statement because there is no month in the math.",
          "That is also why this article can be short without being thin: the honest answer to its title is one sentence long, and everything after it is just showing the arithmetic that makes the sentence true.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there any way my balance resets?",
        a: "Only by your own charges. No reset, cycle, or plan event exists in the code. Even account-level operations never rewrite the running total.",
      },
      {
        q: "If plans were added, would credits carry over?",
        a: "That would be a product decision with no current answer — and this project does not publish speculative roadmaps as if they were features.",
      },
    ],
    related: [
      { label: "Plans article", href: "/blog/how-much-do-hyper3d-plans-cost" },
      { label: "Expiry article", href: "/blog/do-hyper3d-credits-expire" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
];
