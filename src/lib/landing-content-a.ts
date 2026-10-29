/**
 * /pricing content — the honest anti-pricing page (t62).
 *
 * Reference recon (2026-10-30, hyper3d.ai/pricing): five plan cards
 * (Free $0 / Creator $30 / Business $120 / Enterprise custom / Education),
 * a monthly-yearly toggle, a feature comparison table, a pricing FAQ, and
 * a closing CTA. This clone reproduces the page's anatomy with its own
 * text and one honest twist: there is nothing to sell, so the "plan grid"
 * is a single real card, the comparison table is the real price list, and
 * the paid tiers appear exactly once — marked absent, with the nearest
 * real path named.
 *
 * Every number below is the codebase's own: 50 credits at signup, 1
 * credit per standard Confirm & Export, 10 for agentic, first task
 * previews free, cancel refunds, six export formats (see credits.ts and
 * exporters.ts — the tests import the same constants and assert the
 * strings on this page match them).
 */

import type { PricingPageDef } from "./landing-types";

export const PRICING_PAGE: PricingPageDef = {
  route: "/pricing",
  title: "Pricing",
  description:
    "The honest price list for this clone of Hyper3D: no plans, no subscriptions, no payment processing. 50 credits at signup, 1 credit per standard Confirm & Export, 10 per agentic generation.",
  hero: {
    eyebrow: "PRICING",
    headline: "One plan. Zero dollars.",
    subhead:
      "This clone has no pricing tiers because it has nothing to sell. Every account starts with 50 credits, previews are free, and Confirm & Export costs 1 credit. There is no checkout, no card form, and no subscription to cancel — the only billing surface in the codebase is the credit meter.",
    primaryCta: { label: "Open the studio", href: "/" },
    secondaryCta: { label: "How credits work", href: "/help/credit" },
  },
  onlyPlan: {
    name: "Every account",
    price: "$0",
    period: "forever",
    note: "The only plan that exists here — the one you already have",
    features: [
      "50 credits the moment you sign up",
      "First generation previews free — 0 credits",
      "1 credit at Confirm & Export for a standard task",
      "10 credits for an agentic generation",
      "Cancel a running task and the credits come back",
      "Six export formats: GLB, GLTF, FBX, OBJ, STL, USDZ",
      "No card, no checkout, no auto-renewal",
    ],
    cta: { label: "Start generating", href: "/" },
  },
  absentTiersHeading: "The tiers that are not here",
  absentTiers: [
    {
      name: "Creator",
      referencePrice: "$30 / month at the reference",
      why: "No Creator plan exists in this clone — no subscription engine, no tier table, nothing to bill. The studio's full generation surface is already in the free account.",
      nearest: { label: "The 50 credits every account starts with", href: "/help/credit" },
    },
    {
      name: "Business",
      referencePrice: "$120 / month at the reference",
      why: "There is no Business tier, no seats, and no marketplace here. The API-shaped routes that do exist (/api/task, /api/user) answer the studio's own frontend.",
      nearest: { label: "The task API reference page", href: "/features/api" },
    },
    {
      name: "Enterprise",
      referencePrice: "Custom, at the reference",
      why: "No sales contact, no on-prem deployment, no SSO, no custom fine-tuning. The help center's enterprise article says the same thing in more words.",
      nearest: {
        label: "The honest enterprise article",
        href: "/help/articles/how-to-get-hyper3d-enterprise-support",
      },
    },
    {
      name: "Education",
      referencePrice: "Verified pricing, at the reference",
      why: "No education verification, no student or classroom program. Accounts here are email and password — there is nothing to verify against and nothing to discount.",
      nearest: { label: "The same 50 credits as everyone else", href: "/help/getting-started" },
    },
  ],
  priceListHeading: "The real price list",
  priceList: [
    {
      action: "Create an account",
      cost: "$0 — 50 credits",
      detail: "Email and password only; the balance lands immediately",
    },
    {
      action: "Generate a preview",
      cost: "0 credits",
      detail: "The first task previews free; every task shows its poster before you commit",
    },
    {
      action: "Confirm & Export (standard)",
      cost: "1 credit",
      detail: "Charged once per task at the confirm gate — the viewer's export button",
    },
    {
      action: "Agentic generation",
      cost: "10 credits",
      detail: "The multi-step agent tier of the same metering",
    },
    {
      action: "Cancel a running task",
      cost: "refunded",
      detail: "Cancellation returns the spend to your balance; failures never debit",
    },
    {
      action: "Buy more credits",
      cost: "you can't",
      detail: "There is no purchase flow, no payment processor, and no top-up endpoint",
    },
    {
      action: "Export a confirmed model",
      cost: "0 credits extra",
      detail: "GLB, GLTF, FBX, OBJ, STL, USDZ — included in the confirm charge",
    },
  ],
  faqs: [
    {
      question: "Is there a paid tier of any kind?",
      answer:
        "No. The account model has exactly one shape: email and password, 50 credits at signup, and the metering rules above. There is no upgrade button anywhere in the studio because there is nothing to upgrade to.",
    },
    {
      question: "Can I buy more credits when the 50 run out?",
      answer:
        "You cannot. There is no purchase flow and no payment processing in this clone — the billing code that exists is a credit ledger that debits and refunds, nothing more. The help center's billing articles say the same thing in more words.",
    },
    {
      question: "What happens when my balance hits zero?",
      answer:
        "New generations stop starting — the task API refuses with a 402 and the studio shows the same state. Nothing charges you, nothing duns you, and your finished models stay in your history. Failed generations and cancellations keep their side of the bargain the whole way down.",
    },
    {
      question: "Do you offer education, team, or volume pricing?",
      answer:
        "No. The reason is the same as every other tier: there is no price to adjust. The reference's education and enterprise programs belong to the reference's business, and cloning their offer text without their billing stack would just be a promise this codebase cannot keep.",
    },
    {
      question: "Where do the real numbers live?",
      answer:
        "In the codebase, not in marketing: the credit constants are 50 at signup, 1 per standard task, 10 per agentic task, and the confirm gate is the only place a standard charge happens. This page quotes them verbatim, and so does the credit category of the help center.",
    },
  ],
  closing: {
    headline: "The free way to find out is to generate something",
    body: "Open the studio, describe an object, and watch the preview render before a single credit moves. That is the entire sales funnel.",
    cta: { label: "Open the studio", href: "/" },
  },
};
