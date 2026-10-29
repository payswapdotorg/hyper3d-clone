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
import type { HelpArticleDef, HelpCategoryDef, HelpCategoryId, HelpStatus } from "./help-types";

export type {
  HelpArticleDef,
  HelpCategoryDef,
  HelpCategoryId,
  HelpStatus,
  HelpSection,
  HelpStep,
  HelpLink,
} from "./help-types";

/** The reference's six topic hubs, in the reference's display order
 * (hyper3d.ai/help "Browse by topic", recon 2026-10-30). */
export const HELP_CATEGORIES: HelpCategoryDef[] = [
  {
    slug: "getting-started",
    name: "Getting Started",
    blurb: "First models, the real price list, what this workspace is — and what it is not.",
  },
  {
    slug: "account-settings",
    name: "Account Settings",
    blurb: "How sign-in really works here: email + password, scrypt hashes, a 7-day session cookie.",
  },
  {
    slug: "billing",
    name: "Billing",
    blurb: "The honest billing story: one free tier, 50 credits at signup, and nothing to buy.",
  },
  {
    slug: "credit",
    name: "Credit",
    blurb: "The metering rules that actually run: 0 to preview, 1 to confirm, 10 for agentic, refunds on cancel.",
  },
  {
    slug: "features",
    name: "Features",
    blurb: "Every feature surface, sorted into works-here / partial / not-in-clone — with the nearest real path.",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    blurb: "Why there is no enterprise tier here, and where enterprise conversations actually belong.",
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
