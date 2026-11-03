/**
 * Help Center registry — the single source of truth for the /help tree,
 * shared by the index page, the category hubs, the article routes, the
 * studio footer wiring, the sitemap, and the tests. Same pattern as
 * features.ts (t57), legal.ts (t58), use-cases.ts (t59), styles.ts (t60).
 *
 * Reference sitemap truth (landing-sitemap-static-en.xml, recon
 * 2026-10-30): /help index + 6 category hubs + 33 articles at
 * /help/articles/[slug]. Category membership below is the reference's
 * own grouping (from hyper3d.ai/help's article JSON), captured verbatim.
 *
 * Honesty contract: 13 answers describe something that fully works here
 * ("live"), 7 describe a partially-working surface ("partial"), and 13
 * honestly document an absence ("not-in-clone") — every one of them
 * grounded in what the codebase really does, with the nearest real path
 * named when the answer is "no".
 */

import { HELP_ARTICLES_A } from "./help-content-a";
import { HELP_ARTICLES_B } from "./help-content-b";
import { HELP_ARTICLES_C } from "./help-content-c";
import type {
  HelpArticleDef,
  HelpCategoryDef,
  HelpCategoryGuide,
  HelpCategoryId,
  HelpFaqItem,
  HelpStatus,
} from "./help-types";

export type {
  HelpArticleDef,
  HelpCategoryDef,
  HelpCategoryGuide,
  HelpCategoryId,
  HelpFaqItem,
  HelpStatus,
  HelpSection,
  HelpStep,
  HelpLink,
} from "./help-types";

/** The reference's six topic hubs, in the reference's display order
 * (hyper3d.ai/help "Browse by topic", recon 2026-10-30). Each carries a
 * t88 guide: the topic's honest walkthrough plus its own FAQ band. */
export const HELP_CATEGORIES: HelpCategoryDef[] = [
  {
    slug: "getting-started",
    name: "Getting Started",
    blurb: "First models, the real price list, what this workspace is — and what it is not.",
    guide: {
      heading: "Starting here: the five-minute version",
      paragraphs: [
        "This topic walks the same ground a first session covers: what the workspace is, how a first model happens, what the feature inventory honestly contains, which languages render, where support lives, and how to tell this clone from the real thing. Four of its six articles describe surfaces that fully work here, one is partial, and one — the languages question — is a plain no with the reason stated.",
        "If you read only two things, read the beginner's guide (the whole loop in five steps, with the real prices: 50 credits at signup, 0 to preview, 1 to confirm) and the links-and-scam-safety article, because its one checkable rule — nothing here can ever be purchased — makes every impersonation attempt trivial to spot.",
      ],
      faq: [
        {
          q: "Do I need an account before anything works?",
          a: "The marketing pages, the help center and the legal documents render for anyone; generating models requires an account because credits are per-account. Sign-up is email and password only, and the 50-credit grant lands immediately.",
        },
        {
          q: "How long until my first model is ready?",
          a: "Generation runs one of five effort levels — from roughly 4 seconds on the fastest draft level to about 80 seconds on the highest — and the server paces queue work so a task cannot hang forever. The preview is what you inspect before spending anything.",
        },
        {
          q: "What is the fastest way to waste 50 credits?",
          a: "Confirming previews you have not inspected. The charge only fires at Confirm & Export, so orbit the preview, check the wireframe, and confirm only what is worth 1 credit. Failed and canceled tasks never reach the charge.",
        },
        {
          q: "Is any of this the real Hyper3D product?",
          a: "No — this is an unaffiliated clone that mirrors the reference's layout family with its own engine, copy and limits. The MCP connect sheet documents the real service's endpoint as a connection fact and nothing more.",
        },
      ],
    },
  },
  {
    slug: "account-settings",
    name: "Account Settings",
    blurb: "How sign-in really works here: email + password, scrypt hashes, a 7-day session cookie.",
    guide: {
      heading: "The whole account surface, stated once",
      paragraphs: [
        "Both articles in this topic answer 'no', and that is the honest inventory: the auth surface is exactly three routes — sign-up, sign-in, sign-out — with scrypt password hashes and an HMAC-signed httpOnly session cookie that lasts 7 days. There are no verification codes, no OAuth or SSO providers, no password-reset emails and no account settings page, because none of that is implemented in this clone.",
        "A 'no' here still comes with the two real facts that matter: a signed-in session keeps working for its full 7-day lifetime, and a lost password means starting a fresh account — instant, free, 50 credits, nothing financial stranded. The task history of the unreachable account is the one thing that genuinely cannot be recovered, and both articles say so plainly rather than pretending a recovery flow exists.",
        "Reading this topic before you lose a password is the whole trick: know that the session is the asset (finish real work inside its 7-day window), know that exports you already downloaded are yours on disk regardless of any account state, and know that no page, message or 'account recovery agent' can ever honestly ask you for a code, a payment or a remote session in this clone's name. Those three facts are the topic's entire operational surface.",
      ],
      faq: [
        {
          q: "Can I change my password while signed in?",
          a: "No — no change-password route exists either. The practical path is finishing what you need inside the current 7-day session, then signing up fresh when it lapses.",
        },
        {
          q: "Does anything here ever email me?",
          a: "No. No email delivery is wired into this build's auth at all, which is precisely why verification codes, magic links and reset messages cannot exist here.",
        },
        {
          q: "What identifies an account?",
          a: "The email address you signed up with, plus your scrypt-hashed password. There are no usernames, no linked social identities and no recovery phone number.",
        },
        {
          q: "Can I run two accounts side by side?",
          a: "Yes, in separate browser sessions — but they are fully separate: separate 50-credit balances, separate task history, no merging and no transfers between them.",
        },
        {
          q: "Does signing out on one device sign out everywhere?",
          a: "No — each device carries its own 7-day session cookie, and clearing one does not touch the others. Signing out where you are is still good hygiene on a shared machine.",
        },
        {
          q: "Why would a clone choose such a small auth surface?",
          a: "Because every surface it does not implement is a surface that cannot mislead you. Three routes, one credential pair, one cookie — small enough to state completely, which is exactly what these articles do.",
        },
      ],
    },
  },
  {
    slug: "billing",
    name: "Billing",
    blurb: "The honest billing story: one free tier, 50 credits at signup, and nothing to buy.",
    guide: {
      heading: "Billing, in one sentence and then in detail",
      paragraphs: [
        "There is nothing to buy. No plans exist, credits cannot be purchased, no payment processor of any kind is wired into this codebase, and the only credit inflow is the 50-credit grant every account receives at signup. Three of this topic's four articles are honest absences for exactly that reason, and the fourth — refunds — is partial because one real credit-return path does exist: canceling a creation-charged task refunds it in full, automatically, through the ledger.",
        "The reference product has a paid plan ladder, and its own help articles document those prices. This clone deliberately does not reproduce them as its own: a price list here would be a claim nothing in the codebase could honor, since no page can charge you anything. Where the reference's numbers are relevant context, the articles carry them attributed to the reference and never as an offer from this site.",
      ],
      faq: [
        {
          q: "What happens if I try to pay somehow?",
          a: "Nothing can happen, because there is no checkout to reach. Any page or message that claims to sell credits, plans or priority access 'for' this clone is by definition an impersonation — the scam-safety article covers the full rule.",
        },
        {
          q: "Is the 50-credit grant a one-time thing?",
          a: "Per account, yes: signup is the only inflow. New accounts are always available and always free, which is the nearest real thing to a top-up.",
        },
        {
          q: "Why does a refund article exist at all?",
          a: "Because the reference's help center has one, and because one credit refund is genuinely real here — cancel-before-confirm under the legacy flow returns the charged credits in full, recorded as 'cancel_refund' in the ledger. Money refunds cannot exist because no money was ever taken.",
        },
        {
          q: "Where are invoices or receipts?",
          a: "There are none, because there are no charges to document. The credit ledger — visible as your balance and its movement — is the only accounting this clone keeps.",
        },
      ],
    },
  },
  {
    slug: "credit",
    name: "Credit",
    blurb: "The metering rules that actually run: 0 to preview, 1 to confirm, 10 for agentic, refunds on cancel.",
    guide: {
      heading: "The credit system, end to end",
      paragraphs: [
        "This is the most 'works here' topic in the help center: five of its six articles describe live behavior. The rules are short — a new account opens at 50 credits, creating and previewing a task costs 0, Confirm & Export charges exactly 1 for a standard run and 10 for an agentic run, and failed or canceled tasks never reach the charge. The ledger records every movement with a reason, and the balance you see is the balance the code keeps.",
        "The one partial article is credit history: the balance and its movements are real and always visible, but the per-entry ledger surface is not rendered as its own page in this clone — the entries exist and the article says exactly where the line falls.",
      ],
      faq: [
        {
          q: "Can my balance go negative?",
          a: "No. A charge is refused with HTTP 402 when the balance cannot cover it, and the refusal names both the required amount and your current balance. Deductions only happen on successful confirms.",
        },
        {
          q: "Do credits from a failed retry come back?",
          a: "Nothing was taken in the first place — failure happens before the confirm step, and only the confirm step charges. Retrying is free until you decide to keep a result.",
        },
        {
          q: "What do the ledger reasons mean?",
          a: "Every movement carries a machine-readable reason: 'free_preview' entries are 0-cost bookkeeping, 'standard_generation' and 'agentic_generation' are confirm charges, and 'cancel_refund' is the automatic return. Those strings are the ones the code writes.",
        },
        {
          q: "Is there any way to earn extra credits?",
          a: "No — no rewards, no referrals that pay out credits, no promotional grants. The signup grant is the single inflow by design.",
        },
      ],
    },
  },
  {
    slug: "features",
    name: "Features",
    blurb: "Every feature surface, sorted into works-here / partial / not-in-clone — with the nearest real path.",
    guide: {
      heading: "Fourteen feature answers, one map",
      paragraphs: [
        "This topic is the help center's feature inventory, and it splits the same three ways the /features tree does. Fully live: text-to-3D and image-to-3D generation, the HDRI tool, export troubleshooting and the failure explainer. Partial: choosing models and settings (the picker, efforts and presets are real; several reference settings are not), the MCP connect sheet (real constants documenting the real service's endpoint), agentic mode (a real 10-credit tier that is not an autonomous agent), importing into tools (the viewer loads your GLB/GLTF, but nothing ingests arbitrary files into generation) and credit history.",
        "The rest are honest absences with the nearest real path named: topology and LOD control, ChatAvatar, WorldGen scene building, workspace mesh editing, the OmniCraft Mesh Editor, BANG and partial edit, and enterprise support. Each absence article explains what the feature is on the reference's product and what the closest working equivalent is here.",
      ],
      faq: [
        {
          q: "Which generation modes actually work?",
          a: "Text to 3D and Image to 3D, end to end: prompt or reference image in, real preview, 1-credit confirm, six-format export. The other entries in the mode picker render as honestly labeled, not implemented here.",
        },
        {
          q: "What can I do with a generated model inside this clone?",
          a: "Inspect it in the studio viewer (orbit, wireframe and normal-mapping display modes), re-orient it before export via the orientation control, re-run the material pass as a free redo, and export it in six formats. Anything beyond that — sculpting, part-level edits, texture painting — belongs to a DCC after export.",
        },
        {
          q: "Are the OmniCraft tools part of the paid product?",
          a: "There is no paid product. Four of the nine listed OmniCraft tools are live here — HDRI generation, Vector to 3D, the Model Viewer and the Format Convertor — and all of them run locally without spending credits.",
        },
        {
          q: "Where is the full per-feature breakdown?",
          a: "The /features tree: eighteen pages plus an index, each carrying the same three-way status contract as these articles, with the per-surface details these summaries skip.",
        },
      ],
    },
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    blurb: "Why there is no enterprise tier here, and where enterprise conversations actually belong.",
    guide: {
      heading: "One article, because that is the honest size",
      paragraphs: [
        "The reference's help center fields enterprise questions because its product has an enterprise tier. This clone has none — no SLAs, no admin console, no volume pricing, no sales contact, no support team — so the topic is one article that states the absence and redirects correctly: enterprise inquiries about the real product belong with the reference site's own channels, and everything else is answered by this help center's self-service articles.",
        "That single article is deliberately complete rather than padded: it lists what an enterprise tier would actually require this codebase to have, notes that none of it exists, and names the two honest paths depending on who is asking.",
        "The topic's practical value is triage: if a question mentions SLAs, invoicing, seat management, security review or volume commitments, it is an enterprise-shaped question and this clone is categorically the wrong destination — the article says so in one hop. If it mentions any of the three tiers of the three-way verdict instead, the answer lives somewhere in the other five topics, usually the features hub.",
      ],
      faq: [
        {
          q: "Can I get a team or shared workspace here?",
          a: "No. Accounts are individual and fully separate — separate balances, separate history, no sharing surface of any kind in this clone.",
        },
        {
          q: "Is there any volume or educational arrangement?",
          a: "No. There is no pricing of any kind — one free tier for everyone, which also means no discounts exist to negotiate.",
        },
        {
          q: "Who operates this clone?",
          a: "It is a self-contained demonstration clone, unaffiliated with the real Hyper3D company — the scam-safety article states the disclosure in full. Enterprise conversations about the real product belong on the reference site.",
        },
        {
          q: "Where does production work belong?",
          a: "If 'production' means real commercial generation at scale, that is the reference product's territory. This clone is a faithful, honest demonstration and states its limits everywhere.",
        },
        {
          q: "Can this clone host a client's production workload?",
          a: "No — no SLA, no uptime commitment, no operator behind it. Any workload whose failure would cost someone money belongs on infrastructure that promises something, which this clone deliberately does not.",
        },
        {
          q: "Is the enterprise article useful if I never need enterprise support?",
          a: "Yes, as a map of the boundary: it enumerates exactly what an enterprise tier would require, which doubles as a checklist of what this clone is not — useful context when comparing it against the real product.",
        },
      ],
    },
  },
];

/** The reference's help articles (landing-sitemap-static-en.xml,
 * captured 2026-10-30), grouped by the reference's own categories. */
export const REFERENCE_HELP_ARTICLES: { slug: string; category: HelpCategoryId }[] = [
  { slug: "what-is-hyper3d", category: "getting-started" },
  { slug: "how-to-use-hyper3d-beginners-guide", category: "getting-started" },
  { slug: "what-features-does-hyper3d-have", category: "getting-started" },
  { slug: "does-hyper3d-support-languages-besides-english", category: "getting-started" },
  { slug: "how-to-get-support-from-hyper3d", category: "getting-started" },
  { slug: "official-hyper3d-links-and-scam-safety", category: "getting-started" },

  { slug: "can-i-log-in-to-hyper3d-with-a-verification-code", category: "account-settings" },
  { slug: "how-to-reset-hyper3d-password", category: "account-settings" },

  { slug: "how-much-do-hyper3d-plans-cost", category: "billing" },
  { slug: "how-to-purchase-hyper3d-credits", category: "billing" },
  { slug: "how-to-request-a-hyper3d-refund", category: "billing" },
  { slug: "what-happens-to-credits-when-changing-plans", category: "billing" },

  { slug: "are-credits-deducted-when-a-generation-fails", category: "credit" },
  { slug: "are-credits-returned-after-canceling-a-generation", category: "credit" },
  { slug: "do-hyper3d-credits-expire", category: "credit" },
  { slug: "how-many-credits-does-each-hyper3d-generation-cost", category: "credit" },
  { slug: "how-to-check-hyper3d-credit-history", category: "credit" },
  { slug: "why-did-my-hyper3d-generation-fail", category: "credit" },

  { slug: "choose-rodin-model-and-generation-settings", category: "features" },
  { slug: "connect-hyper3d-rodin-mcp-to-ai-agents", category: "features" },
  { slug: "control-topology-polycount-and-lods", category: "features" },
  { slug: "create-3d-avatars-with-chatavatar", category: "features" },
  { slug: "create-3d-models-from-images-with-rodin", category: "features" },
  { slug: "create-3d-models-from-text-with-rodin", category: "features" },
  { slug: "create-editable-scenes-with-hyper3d-worldgen", category: "features" },
  { slug: "create-hdri-skyboxes-with-omnicraft", category: "features" },
  { slug: "edit-3d-models-in-rodin-workspace", category: "features" },
  { slug: "edit-3d-models-with-omnicraft-mesh-editor", category: "features" },
  { slug: "fix-common-hyper3d-export-problems", category: "features" },
  { slug: "import-models-into-hyper3d-tools", category: "features" },
  { slug: "use-bang-and-partial-edit", category: "features" },
  { slug: "use-rodin-agentic-mode-for-image-to-3d", category: "features" },

  { slug: "how-to-get-hyper3d-enterprise-support", category: "enterprise" },
];

/** All 33 articles (registry order = reference sitemap order within each
 * category, categories in the reference's display order). */
export const HELP_ARTICLES: HelpArticleDef[] = [
  ...HELP_ARTICLES_A,
  ...HELP_ARTICLES_B,
  ...HELP_ARTICLES_C,
];

/** The reference's article slugs alone (for parity tests). */
export const REFERENCE_HELP_ARTICLE_SLUGS: string[] = REFERENCE_HELP_ARTICLES.map((a) => a.slug);

export function findHelpArticle(slug: string): HelpArticleDef | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function findHelpCategory(slug: string): HelpCategoryDef | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

/** Slugs for the article route's generateStaticParams. */
export const HELP_ARTICLE_SLUGS: string[] = HELP_ARTICLES.map((a) => a.slug);

/** Category slugs for the hub route's generateStaticParams. */
export const HELP_CATEGORY_SLUGS: string[] = HELP_CATEGORIES.map((c) => c.slug);

/** The routes the help tree exposes (for the sitemap + tests):
 * index + 6 hubs + 33 articles. */
export const HELP_ROUTES: string[] = [
  "/help",
  ...HELP_CATEGORIES.map((c) => `/help/${c.slug}`),
  ...HELP_ARTICLES.map((a) => `/help/articles/${a.slug}`),
];

/** Articles grouped per category, in reference display order. */
export function helpArticlesByCategory(category: HelpCategoryId): HelpArticleDef[] {
  return HELP_ARTICLES.filter((a) => a.category === category);
}

/** The reference's "Popular articles" band on /help — this clone picks
 * six genuinely useful starters, all with live statuses. */
export const POPULAR_HELP_SLUGS: string[] = [
  "what-is-hyper3d",
  "how-to-use-hyper3d-beginners-guide",
  "how-many-credits-does-each-hyper3d-generation-cost",
  "create-3d-models-from-text-with-rodin",
  "why-did-my-hyper3d-generation-fail",
  "official-hyper3d-links-and-scam-safety",
];

/** Status chips for the three-way honesty verdict (same visual family as
 * the use-cases and styles trees). */
export const HELP_STATUS_META: Record<HelpStatus, { chip: string; label: string }> = {
  live: { chip: "WORKS HERE", label: "The answer describes something that fully works in this clone" },
  partial: { chip: "PARTIAL HERE", label: "Part of the answer is real here; the article says which part" },
  "not-in-clone": {
    chip: "NOT IN THIS CLONE",
    label: "The feature this article is about does not exist in this clone — the article says so and gives the nearest real path",
  },
};

/** t88: the /help index's "How to read these answers" band — the
 * three-way contract explained in prose, plus the index's own FAQ. */
export const HELP_READING_GUIDE: HelpCategoryGuide = {
  heading: "How to read these answers",
  paragraphs: [
                "Every article in this help center carries one of three verdicts. 'Works here' means the thing described runs in this codebase exactly as written — the numbers in it are the constants the code uses. 'Partial here' means part of the answer is real and part is not, and the article draws the line explicitly instead of blurring it. 'Not in this clone' means the feature does not exist here at all; those articles still earn their place by saying what the nearest working path is.",
                "The chip at the top of each article and each card row states the verdict before you click, the search box filters all 33 articles live in your browser, and the 'Last reviewed' stamp on every article is the date its facts were re-checked against the code. Answers here describe this clone only — for the real product's behavior, hyper3d.ai's own documentation is the source.",
  ],
  faq: [
    {
                        q: "Why do so many articles say 'no'?",
      a: "Because this clone implements a strict subset of the reference's surfaces, and a help center that invented the rest would be worse than none. Thirteen of the 33 articles document absences — each with the nearest real path named — so you never have to guess what is real.",
    },
    {
      q: "Where is the live chat?",
      a: "There is none — no widget, no queue, no agent. The reference's help center has a chat block; this clone's equivalent states the absence and routes you to these articles and the legal pages, because a fake chat window would be a lie with a timeout.",
    },
    {
      q: "How current are these answers?",
      a: "Each article carries its last-reviewed date, and every factual claim is anchored to a constant or route in the codebase — prices, session lifetimes, export formats and statuses come from the source, not from a marketing page.",
    },
    {
      q: "Can I search in another language?",
      a: "The search matches the English titles and descriptions these articles are written in — the entire clone is English-only, which its own article states plainly.",
    },
    {
      q: "Who is this help center for?",
      a: "Anyone using this workspace: first-time visitors, students, and evaluators comparing the clone against the real product. The three-way verdict on every page is designed for exactly that comparison.",
    },
  ],
};
