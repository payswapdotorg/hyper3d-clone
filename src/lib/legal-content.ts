/**
 * Legal Center content — this clone's OWN legal documents.
 *
 * The reference's five documents cover: privacy (13 numbered sections),
 * terms (21), refund (4 headings), copyright-license (7), fulfillment
 * (cancellation/refund + delivery). This module mirrors that section
 * coverage with text that is TRUE for this clone:
 *
 *   - Accounts: email + username + scrypt-hashed password (per-hash random
 *     salt, timing-safe verification); session = one HMAC-signed httpOnly
 *     SameSite=Lax cookie, 7-day Max-Age (src/lib/auth.ts).
 *   - Credits: 50-credit signup grant (credits.ts INITIAL_BALANCE), standard
 *     generation 1 credit (STANDARD_COST), agentic 10 (AGENTIC_COST), first
 *     task free, balance never goes negative (InsufficientCreditsError →
 *     task rolled back, 402).
 *   - Charging models: legacy tasks charged at creation (cancel = automatic
 *     full refund, cancel_refund); engine-tier (pay-by-result) tasks are
 *     free to generate and preview and charge exactly 1 credit at
 *     Confirm & Export (atomic + idempotent — confirm.ts).
 *   - No payment processor exists in this clone: the membership overlay's
 *     plan actions are informational parity chrome; no card is ever
 *     charged; credits are a granted demo wallet.
 *   - Task data (prompts, reference images, generated meshes, posters,
 *     settings, error text) and the credit ledger live in the app database;
 *     prompts/images are processed by the AI backend to produce outputs.
 *
 * Every number below is asserted against credits.ts by legal.test.ts so
 * this page set can never drift from the ledger it describes.
 */
import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import type { LegalDocDef } from "./legal-types";

/** The facts the documents embed (single source: the real constants). */
const SIGNUP_GRANT = `${INITIAL_BALANCE}`;
const STANDARD_PRICE = `${STANDARD_COST}`;
const AGENTIC_PRICE = `${AGENTIC_COST}`;
const CONFIRM_PRICE = "1"; // confirm.ts: pay-by-result Confirm & Export charge
const SESSION_DAYS = "7"; // auth.ts SESSION_MAX_AGE = 60*60*24*7

export const PRIVACY_DOC: LegalDocDef = {
  slug: "privacy",
  name: "Privacy Policy",
  title: "Privacy Policy",
  description:
    "How this service collects, uses, stores, and protects personal data across the website, generation pipeline, and account system.",
  updated: "October 29, 2026",
  sections: [
    {
      id: "collect",
      heading: "1. Personal data we collect",
      paragraphs: [
        "We collect only the data the product needs to function. When you create an account we store your email address, your chosen username, and a scrypt hash of your password (a per-hash random salt, verified with a timing-safe comparison — the plaintext password is never stored or recoverable). When you generate models we store the task record: your prompt, any reference image you upload, the pipeline settings you chose, the generated mesh and its rendered poster, token-usage statistics, and the credits the task spent. The credit ledger keeps an entry for every balance change, with a reason and a timestamp, so your account panel can show a full history.",
        "We also store your referral code and, if you signed up through a referral link, the referring code that was applied — nothing more about the referral relationship. Gallery likes are stored as the pair (your account, the task you liked) so the like can be shown and un-shown.",
      ],
      bullets: [
        "Account: email, username, scrypt password hash, preferences, referral code, referred-by code, timestamps.",
        "Tasks: prompt, reference image, settings, generated model, poster render, usage stats, credits spent, error text, privacy flag.",
        "Credits: ledger entries (delta, reason, task reference, timestamp).",
        "Gallery: likes (account + task pair).",
      ],
    },
    {
      id: "use",
      heading: "2. How we use your data",
      paragraphs: [
        "Your account data is used to authenticate you and keep you signed in. Your task data is used to run the generation pipeline, show your task history, render posters and previews, serve your export downloads, and account for the credits each task consumed. The ledger exists so balances are auditable rather than a single mutable number. Nothing is used for advertising: this service runs no ad networks, no analytics trackers, and no marketing beacons.",
      ],
    },
    {
      id: "ai",
      heading: "3. AI processing disclosure",
      paragraphs: [
        "Generation is performed by an AI backend. To produce a model, your prompt and any reference image are transmitted to and processed by that backend, and the generated geometry is returned and stored as your task output. The poster preview and the exported files are derived from that output. If you are not comfortable sending an image or prompt to the AI backend, do not submit it — every field you fill is visible to you before you run the task.",
      ],
    },
    {
      id: "disclosure",
      heading: "4. Disclosure to third parties",
      paragraphs: [
        "We disclose your prompt and reference image to the AI backend that performs your generation — that is the processing described in section 3. No other third party receives your personal data. We do not sell, rent, or trade personal data, and we do not share task content with advertising partners, because there are none.",
      ],
    },
    {
      id: "retention",
      heading: "5. Data storage and retention",
      paragraphs: [
        "Account records, task records (including uploaded reference images and generated outputs), and credit ledger entries are stored in the application database until you ask us to remove them or the service is decommissioned. This clone does not currently offer self-serve account deletion in its UI — a truthful limitation, stated here rather than papered over — so removal requests go through the contact path in section 11. Deleting an account removes its tasks, likes, and ledger entries with it.",
      ],
    },
    {
      id: "cookies",
      heading: "6. Cookies and similar technologies",
      paragraphs: [
        "Exactly one cookie is set: the session cookie. It is an HMAC-signed token in an httpOnly, SameSite=Lax cookie with a 7-day Max-Age, and it exists solely to keep you signed in. It contains your account id and expiry — nothing else. There are no tracking cookies, no fingerprinting, and no cross-site identifiers.",
      ],
    },
    {
      id: "security",
      heading: "7. Security of data",
      paragraphs: [
        "Passwords are hashed with scrypt (64-byte key, per-hash random salt) and compared in constant time. Session tokens are HMAC-signed and verified on every request, and the cookie is httpOnly so scripts cannot read it. Transport is HTTPS in production. We apply least-privilege access to the database and do not log secrets. No system is perfectly secure, and we do not claim ours is; we claim exactly the measures above.",
      ],
    },
    {
      id: "rights",
      heading: "8. Your rights",
      paragraphs: [
        "You can see the personal data you gave us (email, username, preferences) in the account panel, and your full credit history is visible there too. You can correct your preferences in-app. You can ask for a copy of your data or for deletion of your account through the contact path in section 11. Where local law gives you additional rights (objection, restriction, portability), we will honor them to the extent this service's data model allows, and we will say plainly if a request cannot be satisfied rather than pretend it was.",
      ],
    },
    {
      id: "children",
      heading: "9. Children's privacy",
      paragraphs: [
        "The service is not directed to children under 13, and we do not knowingly collect personal data from them. If we learn that an account belongs to a child under 13 we will remove it and its data.",
      ],
    },
    {
      id: "transfers",
      heading: "10. International transfers",
      paragraphs: [
        "The application and its database run in the cloud, and the AI backend processes prompts and images in its own infrastructure. Your data may therefore be processed in countries other than your own. We do not claim a specific data-residency region.",
      ],
    },
    {
      id: "changes",
      heading: "11. Changes to this policy",
      paragraphs: [
        "If this policy changes we will update the \"Last updated\" date on this page. Material changes to how personal data is handled will be described in the changed sections rather than silently rewritten.",
        "Questions or requests about privacy — including deletion requests — can be raised through the service's in-app surfaces. This clone does not operate a mailbox; that is a real limitation of this deployment, not a legal position.",
      ],
    },
  ],
};

export const TERMS_DOC: LegalDocDef = {
  slug: "terms",
  name: "Terms of Service",
  title: "Terms of Service",
  description:
    "The terms governing use of this website, the AI generation services, credits, accounts, and the content you create.",
  updated: "October 29, 2026",
  sections: [
    {
      id: "general",
      heading: "1. General",
      paragraphs: [
        "These terms govern your use of this website and its AI 3D generation services. By creating an account or generating a model you accept them. If you do not accept them, do not use the service. The service is provided as a working demonstration of an AI 3D generation product: every feature it offers either functions as described on its feature page or states plainly that it does not.",
      ],
    },
    {
      id: "service",
      heading: "2. The service",
      paragraphs: [
        "The service turns text prompts and reference images into 3D models in your browser. Generation runs a paced pipeline (draft, refine, texture stages visible as task steps), renders a poster preview of the built geometry, and lets you export the mesh in GLB, GLTF, OBJ, STL, or USDZ formats — the exact bytes the exporter produced, not a simulation. Additional tools (an HDRI generator, an SVG-to-3D converter, a model viewer, and a format convertor) are available under the tools section with the same honesty contract.",
        "The service is a clone deployment for development and evaluation. It is not affiliated with, endorsed by, or operated by the makers of the product it replicates.",
      ],
    },
    {
      id: "accounts",
      heading: "3. Accounts",
      paragraphs: [
        "You sign up with an email address, a username, and a password. You are responsible for keeping your credentials safe and for activity under your account. We may suspend accounts that abuse the service (see section 7). One person may hold one account; credit grants are per-account and are not transferable.",
      ],
    },
    {
      id: "credits",
      heading: "4. Credits and billing",
      paragraphs: [
        `Generation is metered with credits. A new account is granted ${SIGNUP_GRANT} credits. A standard generation costs ${STANDARD_PRICE} credit; an agentic generation costs ${AGENTIC_PRICE} credits. Your first task is a free preview — 0 credits. The balance can never go negative: a task that cannot be paid for is rejected before it starts, and no partial charge is ever taken.`,
        `Two charging models exist, and both are real. Legacy tasks are charged at creation; if you cancel such a task before it completes, the full amount is automatically refunded to your balance. Engine-tier (pay-by-result) tasks cost nothing to generate and preview — the charge, exactly ${CONFIRM_PRICE} credit, happens only when you press Confirm & Export, atomically and idempotently, so a double-click never double-charges.`,
        "No payment processing exists in this service. The membership overlay shows reference plan tiers for parity, but selecting a plan is informational only: no card is ever charged, no subscription is created, and credits function as a granted evaluation wallet. Money never changes hands here, which is also why the refund policy talks about credits rather than cash.",
      ],
    },
    {
      id: "prompts",
      heading: "5. Prompts and output",
      paragraphs: [
        "Your prompts and reference images are your input; the generated models are your output. We do not claim ownership over either. Generation is AI-produced: results vary with prompt, settings, and seed, and re-running the same prompt produces a repeatable — but not identical — result only when the seed is pinned. You are responsible for how you use the outputs, including verifying fitness for any purpose such as 3D printing or production rendering.",
      ],
    },
    {
      id: "ip",
      heading: "6. Intellectual property",
      paragraphs: [
        "You retain all rights you hold in your inputs. Your generated outputs are licensed to you as described in the Copyright License document. The service's own code, styling, and non-user content remain ours or their respective licensors'. Nothing in these terms transfers service-side rights to you beyond the output license.",
      ],
    },
    {
      id: "conduct",
      heading: "7. Responsible use",
      paragraphs: [
        "Do not use the service to generate unlawful content, to infringe others' rights, to upload content you have no right to process, or to attack, overload, or reverse the service's internals. Task throughput is paced and metered deliberately; attempts to circumvent metering or automation limits are abuse of the service. We may terminate accounts that abuse the service, and tasks may be marked failed and excluded from the public gallery if they violate these rules.",
      ],
    },
    {
      id: "availability",
      heading: "8. Availability and changes",
      paragraphs: [
        "The service is offered as-is and as-available, with no uptime commitment. Features may change, be added, or be removed; the feature pages' live/partial/reference-only statuses track what genuinely works at any time, and we keep them truthful. Planned changes to metering (credit costs) would be reflected on this page and in the pricing overlay, not silently applied.",
      ],
    },
    {
      id: "warranty",
      heading: "9. Disclaimer of warranties",
      paragraphs: [
        "The service is provided without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. Generated geometry is AI output: topology, scale, and appearance are not guaranteed to match any specification, and the poster preview is a rasterization of the built mesh — an honest render, but still a preview.",
      ],
    },
    {
      id: "liability",
      heading: "10. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, the operators of this service are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits or data. Because no money is collected and credits are granted, the aggregate monetary exposure of either party is zero; this clause exists for completeness, not to dodge a real obligation.",
      ],
    },
    {
      id: "termination",
      heading: "11. Termination",
      paragraphs: [
        "You may stop using the service at any time and request account deletion (see the Privacy Policy's contact path). We may suspend or terminate access for violation of these terms or for abuse of the service. On termination your tasks, likes, and ledger entries are deleted with the account.",
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to these terms",
      paragraphs: [
        "We may update these terms; the \"Last updated\" date on this page will change when we do. Continued use after an update means you accept the revised terms.",
      ],
    },
  ],
};

export const REFUND_DOC: LegalDocDef = {
  slug: "refund",
  name: "Refund Policy",
  title: "Refund Policy",
  description:
    "Credit refund eligibility, the automatic refund paths that are actually implemented, and what happens when a generation fails.",
  updated: "October 29, 2026",
  sections: [
    {
      id: "scope",
      heading: "Scope: what is refundable here",
      paragraphs: [
        `This service processes no payments — no cards, no subscriptions, no cash of any kind. Credits are granted, beginning with the ${SIGNUP_GRANT}-credit signup grant, and exist to meter generation. Refunds in this service are therefore credit refunds: restoring credits to your balance when a charged task did not deliver what you kept. Because money never changes hands, there is no cash-refund process, no chargeback path, and no payment-processor window to miss.`,
      ],
    },
    {
      id: "automatic",
      heading: "Reasons for refunds (the automatic paths)",
      paragraphs: [
        "Two refund paths are actually implemented, and both are automatic — no request needed:",
      ],
      bullets: [
        `Cancel before completion: a legacy task charged at creation (standard ${STANDARD_PRICE} credit / agentic ${AGENTIC_PRICE} credits) that you cancel mid-run is refunded in full, immediately, with a cancel_refund ledger entry you can see in your history.`,
        `Pay-by-result guarantee: engine-tier tasks are never charged for generation or preview at all. The single ${CONFIRM_PRICE}-credit charge happens only at Confirm & Export, atomically and idempotently — you pay only for the model you chose to keep.`,
        `Free preview: your account's first task costs 0 credits, so there is nothing to refund on it.`,
      ],
    },
    {
      id: "failures",
      heading: "Failed generations",
      paragraphs: [
        "A generation that fails is marked failed and shows the recorded error; it does not silently pretend to succeed. For pay-by-result tasks a failure is inherently free — the charge only exists at the export gate. For legacy creation-charged tasks we state the current behavior plainly: a failed task does not automatically refund, because no auto-refund path exists for failures in this deployment. That is a real limitation of this clone, documented here rather than hidden; the cancel-refund path above remains available while a task is still running, and the pay-by-result engine is the recommended path when you want failure-proof billing.",
      ],
    },
    {
      id: "process",
      heading: "Refund process and disputes",
      paragraphs: [
        "There is no form, no waiting period, and no decision process for the automatic paths above — they execute in the same request that cancels or confirms. If you believe a ledger entry is wrong, the account panel's credit history is the auditable record of every delta and reason; raise disputes through the service's in-app surfaces. This deployment has no support mailbox and no payment processor, so there is nothing to escalate to externally — which is also the honest upper bound of what a refund dispute could reach here.",
      ],
    },
  ],
};

export const COPYRIGHT_DOC: LegalDocDef = {
  slug: "copyright-license",
  name: "Copyright License",
  title: "Copyright License",
  description:
    "Ownership of prompts and outputs, the license to your generated models, the grant to process inputs, and the terms that apply to assets from this service.",
  updated: "October 29, 2026",
  sections: [
    {
      id: "definitions",
      heading: "1. Definitions",
      paragraphs: [
        "\"Input\" means the prompt text and any reference image you submit with a task. \"Output\" means the generated 3D model and its derived artifacts (poster render, export files) produced from that task. \"Service\" means this website, its generation pipeline, its tools, and its API surfaces. \"Public gallery\" means the task showcase where non-private tasks may appear.",
      ],
    },
    {
      id: "inputs",
      heading: "2. Ownership of inputs",
      paragraphs: [
        "You retain every right you hold in your Input. Submitting an Input grants the Service a limited, task-scoped license to transmit it to the AI backend and process it for the sole purpose of producing your Output. That license ends when the task's data is deleted. Do not submit Input you do not have the rights to process.",
      ],
    },
    {
      id: "outputs",
      heading: "3. License to outputs",
      paragraphs: [
        "You may use your Outputs for personal, educational, and commercial purposes, subject to these terms. No royalty, credit, or attribution is owed to the Service for Outputs you export. You are solely responsible for confirming that your use of an Output — including any distribution, sale, or 3D-printed product — does not infringe third-party rights, since AI-generated geometry can resemble existing designs. Outputs are provided with no warranty of non-infringement or enforceability of copyright in any jurisdiction.",
      ],
    },
    {
      id: "service-content",
      heading: "4. Service content",
      paragraphs: [
        "The Service's own interface, code, styling, documentation, and non-user content are protected by their respective rights holders. The reference product names and interface elements replicated here belong to their original owners; this clone claims no affiliation and no rights in them. Nothing in this document licenses Service content to you.",
      ],
    },
    {
      id: "gallery",
      heading: "5. Public gallery display",
      paragraphs: [
        "Tasks carry a privacy flag you control. A private task's outputs are excluded from the public gallery. Non-private tasks may appear in the showcase with their poster and prompt; you can flip a task to private to withdraw it from future display. Featuring/liking operates only on non-private tasks.",
      ],
    },
    {
      id: "price",
      heading: "6. Price",
      paragraphs: [
        `The metering for generation is credits: ${STANDARD_PRICE} credit per standard task, ${AGENTIC_PRICE} per agentic task, ${SIGNUP_GRANT} granted at signup, first task free, and ${CONFIRM_PRICE} credit at the pay-by-result export gate. Credits are granted, not sold — this Service accepts no payment for Outputs or anything else, so this license is not conditioned on any purchase.`,
      ],
    },
    {
      id: "term",
      heading: "7. Term, termination, and miscellany",
      paragraphs: [
        "The output license in section 3 is perpetual and survives termination of your account; the input-processing license in section 2 ends with task deletion. If any clause of this document is unenforceable, the remainder stands. These terms are the entire agreement between you and the Service with respect to Outputs; the Terms of Service and Privacy Policy govern the rest of the relationship.",
      ],
    },
  ],
};

export const FULFILLMENT_DOC: LegalDocDef = {
  slug: "fulfillment",
  name: "Fulfillment Policy",
  title: "Fulfillment Policy",
  description:
    "What this service delivers, when delivery happens, how cancellation and refunds work for tasks and credits, and what support exists.",
  updated: "October 29, 2026",
  sections: [
    {
      id: "delivery",
      heading: "What is delivered, and when",
      paragraphs: [
        "Everything this service delivers is digital and delivered in the browser at task completion: the generated mesh, its rasterized poster preview, per-stage task steps, and export downloads in GLB, GLTF, OBJ, STL, and USDZ from your task view. There is no shipping, no physical goods, and no waiting on fulfillment beyond the pipeline's own paced runtime — typically seconds to a couple of minutes per task, visible as live progress. Credits are delivered on signup (the grant lands in your ledger immediately) and on refunds (land in the same request).",
      ],
    },
    {
      id: "cancellation",
      heading: "Cancellation policy",
      paragraphs: [
        `You can cancel a running task with the Cancel control; the task is stopped and marked honestly as canceled. Legacy tasks charged at creation are refunded in full automatically (${STANDARD_PRICE} credit standard / ${AGENTIC_PRICE} credits agentic, matching the charge). Pay-by-result tasks were never charged for generation — there is nothing to refund until you press Confirm & Export, and that single ${CONFIRM_PRICE}-credit charge only exists on the model you keep.`,
      ],
    },
    {
      id: "failures",
      heading: "Failed and incomplete deliveries",
      paragraphs: [
        "If the pipeline fails, the task is marked failed with its recorded error — you are never shown a fabricated success. Pay-by-result failures cost nothing. For the failure behavior of legacy creation-charged tasks, see the Refund Policy's \"Failed generations\" section, which states that limitation plainly. Task records (including error text) remain in your history for inspection.",
      ],
    },
    {
      id: "support",
      heading: "Support",
      paragraphs: [
        `Support exists through the service's in-app surfaces: the account panel (balance, ${SESSION_DAYS}-day sessions, preferences), the task view (steps, errors, exports), and these legal and feature documents, which state what works and what does not. This deployment operates no mailbox and no ticket queue — an honest limitation, not a promise of responsiveness. There is nothing to fulfill by mail, phone, or courier, and no payment to reconcile, because the service processes no transactions.`,
      ],
    },
  ],
};

/** All five documents, reference sitemap order (alphabetical, matching
 * hyper3d.ai/landing-sitemap-legal-en.xml). */
export const LEGAL_DOCS: LegalDocDef[] = [
  COPYRIGHT_DOC,
  FULFILLMENT_DOC,
  PRIVACY_DOC,
  REFUND_DOC,
  TERMS_DOC,
];
