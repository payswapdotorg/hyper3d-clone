/**
 * /switch, /switch/makerworld and /event/chroma-awards content (t62) —
 * the three "offer" pages of the reference, answered honestly.
 *
 * Reference recon (2026-10-30):
 *  - hyper3d.ai/switch — "Get up to 6 months of Hyper3D free" for Meshy
 *    or Tripo users: paste a profile link, verify with a bio code, pick
 *    Creator or Business at 50% off for 12 months; comparison table,
 *    testimonials, FAQ.
 *  - hyper3d.ai/switch/makerworld — MakerWorld creators get free months
 *    by published-model count (≤10 → $1 first month, 11–50 → 3 months,
 *    51+ → 6 months), bio-code verification, print-oriented feature
 *    highlights (watertight, color separation, up to 10M faces, STL).
 *  - hyper3d.ai/event/chroma-awards — a free month of Creator for Chroma
 *    Awards entrants, redeem-by date, backer list, workflow picker.
 *
 * None of that can be cloned honestly: this clone has no offers, no
 * verification flows, no plans to discount, and no event partnerships.
 * Each page reproduces the reference's structure (offer mechanics,
 * comparison table, FAQ, workflow cross-links) with this clone's own
 * text and inverts it: every promise is marked "not here," and the
 * nearest real path — a studio that costs nothing to try — is named.
 */

import type { EventPageDef, SwitchPageDef } from "./landing-types";
import { STUDIO_PATH } from "./studio-path";

/* ------------------------------------------------------------------ */
/* /switch — the Meshy/Tripo migration page, honestly                   */
/* -------------------------------------------------------------------- */

export const SWITCH_INDEX_PAGE: SwitchPageDef = {
  slug: "index",
  route: "/switch",
  title: "Switch",
  description:
    "The honest answer for Meshy and Tripo users: there is no switch offer in this clone — no free months, no discounts, and no subscriptions to discount. The studio is free to try.",
  hero: {
    eyebrow: "SWITCH",
    headline: "Switching from Meshy or Tripo?",
    subhead:
      "There is no switch offer here. This clone runs no migration program — no profile-link checker, no bio verification codes, no free months, no half-price year. There is also nothing a discount could apply to: the studio has no subscriptions at all. What it does have is a generator you can try for free, with every claim on its pages true of the codebase that ships them.",
    primaryCta: { label: "Open the studio", href: STUDIO_PATH },
    secondaryCta: { label: "The one real price list", href: "/pricing" },
  },
  offerHeading: "What the offer would need — and why none of it is here",
  offerPoints: [
    {
      referencePromise: "Paste your Meshy or Tripo profile link to check eligibility",
      hereStatus:
        "Not here. There is no offer checker, no eligibility table, and no profile parser. The text box on the reference's page is the front door of a billing system this clone does not have.",
    },
    {
      referencePromise: "Add a verification code to your profile bio to prove it is you",
      hereStatus:
        "Not here. No verification flow exists anywhere in this clone — accounts are email and password, and nothing asks you to prove what you use or where you came from.",
    },
    {
      referencePromise: "Up to 6 months free, then 50% off Creator or Business for 12 months",
      hereStatus:
        "Not here. There are no Creator or Business plans, no free-month ledger, and no discounted SKU. The only balance in this codebase is the 50-credit starting balance every account gets.",
    },
    {
      referencePromise: "Keep your old account; this is a migration, not a transfer",
      hereStatus:
        "The one part that is trivially true: nothing transfers here either. There is no import path for models made elsewhere — the studio generates from text and images, and that is the whole surface.",
    },
  ],
  tableHeading: "The reference's offer, answered honestly",
  table: [
    {
      action: "Up to 6 months free",
      cost: "No offer",
      detail: "There is no offer engine — and nothing here costs money to make free",
    },
    {
      action: "50% off for 12 months",
      cost: "No subscriptions",
      detail: "No plan exists to discount; the price list has one line and it is zero",
    },
    {
      action: "Profile-link verification",
      cost: "No verification",
      detail: "No code-in-bio flow, no eligibility check, no exceptions ledger",
    },
    {
      action: "Plan comparison table",
      cost: "One plan",
      detail: "Every account: 50 credits at signup, 1 credit per standard confirm, 10 per agentic",
    },
    {
      action: "Testimonials from switchers",
      cost: "No testimonials",
      detail: "No community exists here to quote — inventing switchers would be marketing fiction",
    },
  ],
  realHeading: "What is actually here instead",
  realItems: [
    {
      title: "A studio that costs nothing to try",
      body: "50 credits at signup, free previews before any charge, 1 credit at Confirm & Export, 10 for agentic. No card is ever asked for because no payment processor exists to send one to.",
    },
    {
      title: "Cancellations that refund",
      body: "Cancel a running task and the debited credits return to your balance; failed generations never debit at all. That is the entire money-back policy, and it is enforced in code rather than promised in copy.",
    },
    {
      title: "Exports in six formats",
      body: "GLB, GLTF, FBX, OBJ, STL, and USDZ — the exact geometry the viewer previewed, with no paywall between the preview and the file.",
    },
  ],
  faqs: [
    {
      question: "Can I move my Meshy or Tripo models into this studio?",
      answer:
        "No. There is no model import here — generation starts from a text prompt or an image you upload, and tasks live in your own history. Models made elsewhere have no path in, and pretending otherwise would be an import button that leads nowhere.",
    },
    {
      question: "Is there any discount for arriving from another tool?",
      answer:
        "No. Discounts are arithmetic on a price, and this clone has no price — no plans, no subscriptions, no checkout. Everyone gets the same 50 credits, which is the only differential pricing this codebase supports: none.",
    },
    {
      question: "Why does this page exist at all?",
      answer:
        "Because the reference has one at this URL, and this clone's sitemap mirrors the reference's. The route is real; the offer is not — so the page tells you that in its first line instead of inheriting a promise the codebase cannot keep.",
    },
  ],
  closing: {
    headline: "Skip the offer — just generate",
    body: "The reference needs a switch program because it sells something. This clone does not sell anything, so the studio's front door is already the best deal it will ever offer.",
    cta: { label: "Open the studio", href: STUDIO_PATH },
  },
};

/* ------------------------------------------------------------------ */
/* /switch/makerworld — the MakerWorld creator offer, honestly          */
/* -------------------------------------------------------------------- */

export const SWITCH_MAKERWORLD_PAGE: SwitchPageDef = {
  slug: "makerworld",
  route: "/switch/makerworld",
  title: "Switch from MakerWorld",
  description:
    "For MakerWorld creators: no offer, no model-count tiers, no bio codes — but a free studio that exports STL among six formats. The honest version of the reference's MakerWorld page.",
  hero: {
    eyebrow: "SWITCH / MAKERWORLD",
    headline: "MakerWorld creators: no offer, a free studio",
    subhead:
      "The reference's MakerWorld page grants free months by counting the models you publish. This clone has no such program — no model-count tiers, no bio verification, no $1 first month, and no plans to discount. What it has for print-minded creators is a generator that costs nothing to try and exports STL natively, with honest limits on everything the reference's print features claim.",
    primaryCta: { label: "Open the studio", href: STUDIO_PATH },
    secondaryCta: { label: "The 3D printing use case", href: "/use-cases/3d-printing" },
  },
  offerHeading: "The tiers that are not here",
  offerPoints: [
    {
      referencePromise: "10 or fewer published models: $1 for your first month",
      hereStatus:
        "Not here. There is no MakerWorld integration, no model counter, and no first-month pricing — nothing in this codebase reads your MakerWorld profile at all.",
    },
    {
      referencePromise: "11 to 50 published models: 3 months free",
      hereStatus:
        "Not here. The free-credit balance is a constant (50 credits), not a variable any offer engine adjusts.",
    },
    {
      referencePromise: "51 or more published models: 6 months free",
      hereStatus:
        "Not here. Same reason, one tier up: there is no subscription for free months to apply to.",
    },
    {
      referencePromise: "Add a verification code to your MakerWorld bio to claim it",
      hereStatus:
        "Not here. The only verification in this clone is the sign-in password check — scrypt hashes, a 7-day session cookie, and nothing that looks at profiles anywhere else.",
    },
  ],
  tableHeading: "The reference's print claims, answered honestly",
  table: [
    {
      action: "Watertight, manifold, print-ready output",
      cost: "Not promised",
      detail: "The exporter writes the mesh as-is; check the model in your slicer before committing filament",
    },
    {
      action: "Intelligent color separation for printing",
      cost: "Not here",
      detail: "No color-separation stage exists — textures ride along in the export, full stop",
    },
    {
      action: "Up to 10 million faces, 12K textures",
      cost: "No",
      detail: "No polycount slider and no LOD generation; the geometry is whatever the planner produced",
    },
    {
      action: "STL export",
      cost: "Yes — really",
      detail: "STL is one of the six real export formats, alongside GLB, GLTF, FBX, OBJ, USDZ",
    },
    {
      action: "21 style presets",
      cost: "Yes — really",
      detail: "21 style pages exist, each with honest recipe notes for prompting that look",
    },
  ],
  realHeading: "If you publish on MakerWorld, the real path is short",
  realItems: [
    {
      title: "Generate from text or an image",
      body: "Describe the printable object — or upload a photo of a reference — and preview the result free before any credit moves. Confirm & Export is 1 credit; agentic runs are 10.",
    },
    {
      title: "Export STL and slice it yourself",
      body: "The export gives you the exact geometry the viewer previewed, in STL among six formats. What it does not give you is print QA: watertightness, wall thickness, and manifold checks belong to your slicer, and the printing use-case page says so in the same words.",
    },
    {
      title: "Keep the honest expectations",
      body: "No polycount targeting, no color separation, no guaranteed printability. If a model needs exacting geometry for printing, treat the studio as the block-out step and finish it in your DCC — that workflow is the nearest real path, and it is written down instead of promised around.",
    },
  ],
  faqs: [
    {
      question: "How many free credits do I get as a MakerWorld creator?",
      answer:
        "The same 50 as everyone else. There is no creator program, no verified badge, and no bonus pool — the signup balance is a constant in the credits module, and this page does not get to change it.",
    },
    {
      question: "Can I sell what I generate here on MakerWorld?",
      answer:
        "The license question lives in the legal pages, not here: the terms document is the only authority on what you may do with exports. What is certain is that no commercial tier gates the export button — the same six formats come out of the same confirm gate for every account.",
    },
    {
      question: "Where is the honest printing guidance?",
      answer:
        "The 3D printing use-case page walks the whole path — prompt, preview, STL export, slicer checks — and the low-poly style page carries the no-polycount-slider note for anyone chasing a light mesh.",
    },
  ],
  closing: {
    headline: "No tiers, no codes — just a printable idea away",
    body: "Bring the object you want to publish, preview it for free, and export STL when it is right. That is the entire MakerWorld program this clone will ever run.",
    cta: { label: "Open the studio", href: STUDIO_PATH },
  },
};

/* ------------------------------------------------------------------ */
/* /event/chroma-awards — the event page, honestly                      */
/* -------------------------------------------------------------------- */

export const EVENT_CHROMA_AWARDS_PAGE: EventPageDef = {
  slug: "chroma-awards",
  route: "/event/chroma-awards",
  title: "Chroma Awards",
  description:
    "The honest Chroma Awards page: no partnership, no free month of a plan that does not exist, no redemption codes, no deadline. The studio is already free with 50 credits.",
  hero: {
    eyebrow: "EVENT / CHROMA AWARDS",
    headline: "For Chroma Awards creators: nothing to redeem",
    subhead:
      "The reference offers Chroma Awards entrants a free month of a paid plan, redeemed through the event's official site before a deadline. This clone has no partnership with the Chroma Awards or its backers, no plans to give a month of, no redemption codes, and no deadline. What it has is the thing the offer is a coupon for: a studio that is already free, with 50 credits on signup and no card ever requested.",
    primaryCta: { label: "Open the studio", href: STUDIO_PATH },
    secondaryCta: { label: "The one real price list", href: "/pricing" },
  },
  promisesHeading: "What the reference's event page promises — and what is true here",
  absentPromises: [
    {
      referencePromise: "A free month of the Creator plan (worth $30)",
      hereReality:
        "There is no Creator plan in this clone — no $30 tier, no month to comp, no billing to waive. The nearest real thing is the standing 50-credit signup balance, which is not event-limited and expires never.",
    },
    {
      referencePromise: "Redeem through the Chroma Awards official site by the deadline",
      hereReality:
        "There is no redemption path — no codes, no partner site, no cutoff date. The studio's front door is the only entry point, and it is open every day of the year because there is nothing to schedule.",
    },
    {
      referencePromise: "One offer per account, no stacking with active subscriptions",
      hereReality:
        "There are no offers and no subscriptions, so the limit writes itself: every account gets the same 50 credits, once, at signup. Nothing stacks because nothing exists to stack.",
    },
    {
      referencePromise: "Backed by the event's incubator and sponsor list",
      hereReality:
        "This clone is backed by nothing but its own codebase. Every capability claimed on any page here is enforced by modules you can read — credits, exports, auth — and no external organization endorses any of it.",
    },
  ],
  workflowsHeading: "Choose a real workflow instead",
  workflows: [
    {
      label: "Text to 3D",
      href: "/features/text-to-3d",
      blurb: "Describe the asset you have in mind and preview it free before a single credit moves.",
    },
    {
      label: "Image to 3D",
      href: "/features/image-to-3d",
      blurb: "Start from a photo or concept sketch — one image is enough, multiview is optional.",
    },
    {
      label: "Agentic mode",
      href: "/features/text-to-3d",
      blurb: "The multi-step tier that plans, generates, and iterates — 10 credits a run, with the same free preview.",
    },
    {
      label: "WorldGen",
      href: "/features/worldgen",
      blurb: "Scenes and environments instead of single objects — the fourth generation mode.",
    },
  ],
  faqs: [
    {
      question: "Is this clone affiliated with the Chroma Awards?",
      answer:
        "No. There is no affiliation, sponsorship, or contact of any kind. The page exists because the reference has one at this URL and this clone mirrors the reference's routes — with its own text, which starts by saying the affiliation does not exist.",
    },
    {
      question: "Can I get bonus credits for entering the event?",
      answer:
        "No. The signup balance is a constant — 50 credits for every account, event entrants included. There is no bonus pool because there is no pool at all, and no way to buy into one either.",
    },
    {
      question: "Where should event entries actually be made?",
      answer:
        "At the event's own official site, exactly as the reference's redemption note says — this studio has no submission flow, no jury, and no category list. What it has is the making part: generate, export, and carry the files wherever the entry form lives.",
    },
  ],
  closing: {
    headline: "The offer is nothing; the studio is still here",
    body: "No code, no deadline, no coupon stack. Just the same free studio every account gets — bring the entry idea and see how far 50 credits take it.",
    cta: { label: "Open the studio", href: STUDIO_PATH },
  },
};
