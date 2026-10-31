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
    ],
    related: [
      { label: "Do credits expire?", href: "/help/articles/do-hyper3d-credits-expire" },
      { label: "Plans (none)", href: "/help/articles/how-much-do-hyper3d-plans-cost" },
      { label: "Checking your balance", href: "/help/articles/how-to-check-hyper3d-credit-history" },
    ],
    updated: "2026-10-30",
  },
];
