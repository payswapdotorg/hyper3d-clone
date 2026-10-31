/**
 * t73 — the homepage's second half + the contact dock's question list.
 *
 * Recon 2026-10-31 (fresh pull, agent-walked + static-HTML diff): the
 * reference homepage does not end at the "Imagine It. Shape It." CTA —
 * four more sections follow before the footer, all missing from this
 * clone's t68 landing:
 *
 *   "Why Choose Hyper3D?"            (5 benefit cards)
 *   "Built for Every 3D Workflow"    (4 clickable use-case cards)
 *   "Research-Backed 3D Generation"  (Learn More → the research tab)
 *   "Frequently Asked Questions"     (8-question accordion + a
 *                                     "Still have questions?" link to
 *                                     /workspace/contact-us)
 *
 * The FAQ's closing link is what exposed the second drift: the
 * reference serves /workspace/contact-us (probed 200; this clone 404'd)
 * — its studio shell with the right-hand "Chat with us" dock opened:
 * a Live Chat Support panel and a scrollable Popular Questions list of
 * 21 real questions (agent-walked, the full list below verbatim in
 * topic).
 *
 * Copy discipline: section headings, card titles, question texts and
 * link targets mirror the reference's factual structure; every prose
 * answer is this clone's own and is anchored to what this codebase
 * really ships — EXPORT_FORMATS, FORMAT_USES, the credit constants
 * (INITIAL_BALANCE 50, STANDARD_COST 1, AGENTIC_COST 10), the effort
 * tiers, and the honest "no payments exist here" billing stance.
 */

import { EXPORT_FORMATS, FORMAT_USES } from "./hyper3d";
import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import { WORKSPACE_TAB_ROUTES } from "./workspace-tabs";

/* ------------------------------------------------------ why choose */

export interface WhyChooseCard {
  title: string;
  body: string;
}

/** The reference's five benefit cards (titles factual, bodies ours). */
export const WHY_CHOOSE_CARDS: WhyChooseCard[] = [
  {
    title: "High-Fidelity 3D",
    body: "Generation builds detailed geometry with clean topology and per-part PBR materials — the mesh you preview is the mesh you export.",
  },
  {
    title: "One-Click Simplicity",
    body: "One reference image is enough to draft most objects. A text prompt alone works too; extra views are optional guidance, never a requirement.",
  },
  {
    title: "Multiple Export Formats",
    body: `Every confirmed model exports in all ${EXPORT_FORMATS.length} formats this codebase actually writes — ${EXPORT_FORMATS.join(", ")} — mapped to their real workflows.`,
  },
  {
    title: "Lightning-Fast Results",
    body: "The effort dial spans Extreme-Low (~4s) to Extreme-High (~80s) — pick seconds or fidelity per generation, and redo for free until it's right.",
  },
  {
    title: "Free to Start",
    body: `New accounts start with ${INITIAL_BALANCE} credits, previews are always free, and a standard confirm costs ${STANDARD_COST} credit (agentic ${AGENTIC_COST}) — nothing is charged while you draft.`,
  },
];

/* ------------------------------------------------------- workflows */

export interface WorkflowCard {
  title: string;
  body: string;
  /** The reference's own href per card (probed, 2026-10-31). */
  href: string;
}

/** The reference's four clickable workflow cards — href mapping exact. */
export const WORKFLOW_CARDS: WorkflowCard[] = [
  {
    title: "Game Developers",
    body: "Concept art and reference images become props, environment pieces, and optimized models — the game-development page maps what runs here onto Unity, Unreal, WebGL, and UGC pipelines.",
    href: "/use-cases/game-development",
  },
  {
    title: "Product Teams",
    body: "Product photos become 3D models for interactive pages, marketing renders, and 360° previews — the e-commerce page covers the real photo-to-mesh path and its honest limits.",
    href: "/use-cases/e-commerce",
  },
  {
    title: "Architecture & Education",
    body: "Visual references become architecture elements, teaching models, and presentation assets — the 3D-printing page documents the STL path that actually exports from this studio.",
    href: "/use-cases/3d-printing",
  },
  {
    title: "Artists & 3D Printing",
    body: "Characters, props, collectibles, and stylized assets — the stylized style page is the reference's own destination for this card, and it states which style pages run live here.",
    href: "/styles/stylized",
  },
];

/* -------------------------------------------------------- research */

/** The research section's single CTA — the reference's own target. */
export const RESEARCH_LEARN_MORE_HREF = WORKSPACE_TAB_ROUTES.research;

export const RESEARCH_INTRO =
  "Hyper3D combines controllable 3D generation, reconstruction, and production workflows shaped by research behind Rodin, CLAY, and CAST.";

/* ------------------------------------------------------------- FAQ */

export interface HomeFaqItem {
  question: string;
  answer: string;
}

/** The reference homepage's eight FAQ topics, our honest answers. */
export const HOME_FAQS: HomeFaqItem[] = [
  {
    question: "What makes Hyper3D useful for 3D generation?",
    answer: `It turns text prompts or reference images into 3D assets with clean topology and per-part PBR materials. Previews are free, redos are free, and a standard confirm costs ${STANDARD_COST} credit — agentic runs ${AGENTIC_COST} — so drafting costs nothing until you keep a result.`,
  },
  {
    question: "What kind of image works best with Hyper3D?",
    answer: "For image-to-3D, one reference image of the subject is enough. Resolution, framing, background, and lighting are capture choices you can tune for clarity — they shape the result, they are not submission requirements.",
  },
  {
    question: "Can I optionally use more than one image?",
    answer: "Yes, optionally. Rodin works from a single image without a prescribed pose or camera angle; additional views simply add visual guidance for geometry and texture when you have them.",
  },
  {
    question: "What can I export from Hyper3D?",
    answer: `The six formats this codebase really writes: ${EXPORT_FORMATS.map((f) => `${f} (${FORMAT_USES[f]})`).join(", ")}. The exporters run locally in the studio — what you download is the mesh you previewed.`,
  },
  {
    question: "Can Hyper3D models be used in commercial projects?",
    answer: "That is a licensing question, so it has a legal answer rather than a marketing one: the terms of use page states what this clone grants, and every export you confirm is yours to use within those terms.",
  },
  {
    question: "How can I improve the quality of my generated 3D model?",
    answer: "Three honest levers: raise the effort tier (Extreme-Low ~4s to Extreme-High ~80s trades time for fidelity), give the clearest reference you have, and add extra views when available. Redos are free, so comparing tiers costs nothing.",
  },
  {
    question: "Is Hyper3D only for artists, or can developers use it too?",
    answer: "Both. Artists get the studio surface — prompt, constrain, preview, export. Developers get the documented API surface (generation, task state, exports) on the API feature page, honest about which routes run here.",
  },
  {
    question: "What can I do after generating a model with Hyper3D?",
    answer: "Export it for the workflow you built it for — printing (STL), engines (FBX), web and AR (GLB/GLTF), Apple AR (USDZ), or general editing (OBJ) — or re-run it free until the draft is worth confirming.",
  },
];

/** The FAQ's closing CTA — the reference's own route (probed 200). */
export const FAQ_STILL_HAVE_QUESTIONS_HREF = "/workspace/contact-us";

/* ------------------------------------------- the contact dock's FAQ */

export interface PopularQuestion {
  question: string;
  answer: string;
  /** A real help-center article when one covers the topic. */
  helpHref?: string;
}

/**
 * The contact dock's Popular Questions list — the reference's full
 * 21-question scroll (agent-walked 2026-10-31, question texts verbatim
 * in topic), each answered by this clone honestly and linked to the
 * real help article where one exists.
 */
export const POPULAR_QUESTIONS: PopularQuestion[] = [
  {
    question: "How can I contact you?",
    answer: "There is no support inbox behind this clone — no tickets, no live chat. The honest channels are the help center (33 articles that state exactly what works) and the legal pages.",
    helpHref: "/help/articles/how-to-get-support-from-hyper3d",
  },
  {
    question: "My education email did not pass verification. What should I do?",
    answer: "Nothing — this clone has no education verification, no edu tiers, and no email gate of any kind. Any email address signs up with the same 50 starting credits.",
    helpHref: "/help/articles/how-much-do-hyper3d-plans-cost",
  },
  {
    question: "Credits Management and Usage — Q3: Can credits be refunded?",
    answer: "There is nothing to refund: no payment ever changes hands here. The one automatic credit return is real — canceling a creation-charged task returns its credits in full through the ledger.",
    helpHref: "/help/articles/how-to-request-a-hyper3d-refund",
  },
  {
    question: 'Why does the bot say "Subscription not found"?',
    answer: "No bot here can say that — this clone has no subscription machinery to find. The pricing page documents the credit system that actually runs: 50 credits at signup, 1 or 10 per confirm.",
    helpHref: "/help/articles/how-much-do-hyper3d-plans-cost",
  },
  {
    question: "Data Protection and User Privacy Policies — Q1: Does the platform train AI using user-uploaded data?",
    answer: "No. Generation runs as a local pipeline over your inputs; nothing uploads to a training set. The privacy policy states what data exists (an account row and a task history) and where it stays.",
    helpHref: "/help/articles/official-hyper3d-links-and-scam-safety",
  },
  {
    question: "Commercial Use and Legal Guidelines — Q2: Are there any content restrictions?",
    answer: "The terms of use page is the binding answer: it states the accept-use boundaries for this clone. Beyond that, the studio simply generates what you ask it to from your own inputs.",
    helpHref: "/help/articles/official-hyper3d-links-and-scam-safety",
  },
  {
    question: "Why have my membership benefits (subscription plan) not been activated even though my payment was successful?",
    answer: "No payment can succeed here — there is no checkout, no processor, and no card on file. If a page asked you for payment in this clone's name, it was not this clone; the scam-safety article covers that.",
    helpHref: "/help/articles/official-hyper3d-links-and-scam-safety",
  },
  {
    question: "Data Protection and User Privacy Policies — Q2: Will anyone else be able to see my model after I set it to Private?",
    answer: "Tasks live in your own task history behind your session — there is no public gallery fed by generations, so 'Private' is the default and only state.",
    helpHref: "/help/articles/how-to-check-hyper3d-credit-history",
  },
  {
    question: "How long does it take to receive my refund?",
    answer: "There are no refunds to wait for, because there are no payments. The refund policy page says exactly this in legal language, plus the one automatic credit return that does exist.",
    helpHref: "/help/articles/how-to-request-a-hyper3d-refund",
  },
  {
    question: "What are the differences between subscription plans?",
    answer: "There are no subscription plans — the credit ledger is the entire billing model. Every account: 50 credits at signup, 1 per standard confirm, 10 per agentic, no tiers, no cycle.",
    helpHref: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost",
  },
  {
    question: "How can I use a redemption code?",
    answer: "You cannot — redemption codes do not exist in this codebase. Nothing here can be redeemed, purchased, or gifted; credits arrive only as the signup grant.",
    helpHref: "/help/articles/how-to-purchase-hyper3d-credits",
  },
  {
    question: "Generated Models: Privacy and Visibility Options — Q1: Can I delete a generated model?",
    answer: "Your task history is yours: tasks stay in your history with their specs and exports, and the account they belong to can be managed from its own settings.",
    helpHref: "/help/articles/are-credits-returned-after-canceling-a-generation",
  },
  {
    question: "Commercial Use and Legal Guidelines — Q1: Can I use generated assets for commercial purposes?",
    answer: "Within the terms of use, yes — the assets you confirm and export are yours, and the terms page is the single honest source for what that grant covers.",
    helpHref: "/help/articles/official-hyper3d-links-and-scam-safety",
  },
  {
    question: "How can I cancel my subscription or stop auto-renewal?",
    answer: "There is nothing to cancel: no subscription, no auto-renewal, no billing cycle. The pricing page documents the pay-per-confirm model that replaces all of it.",
    helpHref: "/help/articles/what-happens-to-credits-when-changing-plans",
  },
  {
    question: "Is there a free trial available?",
    answer: "Better than a trial — the whole drafting loop is permanently free: previews and redos cost nothing, and the 50-credit signup grant covers 50 standard confirms before you would ever need to think about credits again.",
    helpHref: "/help/articles/how-to-purchase-hyper3d-credits",
  },
  {
    question: "How can I view or download my invoices?",
    answer: "There are no invoices — no payment has ever been processed by this codebase, so there is nothing to bill, receipt, or download. The credit history page shows the real ledger: grants and spends.",
    helpHref: "/help/articles/how-to-check-hyper3d-credit-history",
  },
  {
    question: "Credits Management and Usage — Q1: Will my credits expire?",
    answer: "No. The ledger keeps a plain per-account balance with no TTL, no rollover window, and no monthly reset. Credits leave exactly one way: you spend them on confirms.",
    helpHref: "/help/articles/do-hyper3d-credits-expire",
  },
  {
    question: "Credits Management and Usage — Q2: How can I buy extra credits?",
    answer: "You cannot buy credits — there is no store, no pack, no checkout. The signup grant (50) is the only source, which is why every page states the per-confirm costs plainly.",
    helpHref: "/help/articles/how-to-purchase-hyper3d-credits",
  },
  {
    question: "How can I upgrade or downgrade my subscription plan?",
    answer: "There are no plans to move between — one flat credit model serves every account. Questions about the real product's tiers belong to the reference site, not this clone.",
    helpHref: "/help/articles/how-much-do-hyper3d-plans-cost",
  },
  {
    question: "Why can’t I cancel my subscription renewal immediately?",
    answer: "Because there is no renewal: nothing renews, nothing bills, nothing recurs. The cancel-refund path that does exist here is the task-level one — cancel before confirm and the charged credits return in full.",
    helpHref: "/help/articles/are-credits-returned-after-canceling-a-generation",
  },
  {
    question: "What is your refund policy?",
    answer: "The legal page answers this one in full: no payments exist, so no refunds can; the single automatic exception — canceling a creation-charged task returns its credits — runs through the ledger, not a request form.",
    helpHref: "/help/articles/how-to-request-a-hyper3d-refund",
  },
];

/** The dock's "Live Chat Support" away card — honest, no backend. */
export const LIVE_CHAT_STATUS = {
  away: "We are away at the moment",
  back: "We will be back as soon as possible",
} as const;
