/**
 * Story tab program constants (t72) — the reference's
 * /workspace/rodin/tab/story surface, probed live 2026-10-31
 * (agent-walked, DOM-extracted).
 *
 * The reference's story tab is an earn surface: a story-sharing bonus
 * tracker (pending / approved / rejected), an Affiliate Partner section
 * with two programs (cash rewards via PayPal, credit rewards), and a
 * social-post referral claim. The program parameters below are the
 * reference's real published numbers (probed from its terms lists);
 * the term lines themselves are this clone's own wording carrying the
 * same numbers — the panels honestly note that this clone does not
 * operate the programs (no payouts, no moderation queue).
 */

/** Story-sharing bonus tracker states (reference order). */
export const STORY_BONUS_STATES = ["Pending", "Approved", "Rejected"] as const;

/** The platforms the reference's social referral panel lists. */
export const STORY_REFERRAL_PLATFORMS = [
  "YouTube",
  "X",
  "Ins",
  "Reddit",
  "Bilibili",
  "Xiaohongshu",
] as const;

export interface AffiliateProgram {
  id: "cash" | "credit";
  /** Card headline (reference: "Cash Rewards" / "Credit Rewards"). */
  name: string;
  /** One-line program summary shown above the terms. */
  summary: string;
  /** The reward rate as a percent of the referred user's first monthly purchase. */
  rewardRatePercent: number;
  /** Credits both sides receive instantly on signup. */
  signupCredits: number;
  /** Monthly cap on signup-bonus credits for the referrer. */
  signupCreditsMonthlyCap: number;
  /** Terms rendered in the card's details list (clone wording, reference numbers). */
  terms: string[];
}

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: "cash",
    name: "Cash Rewards",
    summary: "20% of the user's first-month fee as a cash reward + 2 Credits registration reward each!",
    rewardRatePercent: 20,
    signupCredits: 2,
    signupCreditsMonthlyCap: 10,
    terms: [
      "Users who sign up through your referral link receive 2 Credits, and you also receive 2 Credits, credited instantly.",
      "You can earn up to 10 Credits per calendar month from sign-up bonuses.",
      "You receive a 20% cash reward (rounded down) from each referred user's first monthly subscription purchase.",
      "Example: if they purchase a $120 Business Plan, you receive a $24 cash reward.",
      "Cash reward payments are processed around the 13th of each month: transactions completed on or before the 5th are paid out on the 13th of the same month; later transactions are paid out on the 13th of the following month.",
      "Each payout must exceed $50 — smaller amounts carry over to the next payout cycle until the total passes $50.",
      "Keep your PayPal account details correct so payments can reach you.",
    ],
  },
  {
    id: "credit",
    name: "Credit Rewards",
    summary:
      "40% Credits Reward upon a referred user's complete first monthly subscription purchase + 2 Credits registration reward each!",
    rewardRatePercent: 40,
    signupCredits: 2,
    signupCreditsMonthlyCap: 10,
    terms: [
      "Users who sign up through your referral link receive 2 Credits, and you also receive 2 Credits, credited instantly.",
      "You can earn up to 10 Credits per calendar month from sign-up bonuses.",
      "You earn 40% of the credits (rounded down) from each referred user's first monthly subscription purchase.",
      "Credits are calculated on the original price at a rate of $1.50 per Credit.",
      "Example: if they purchase a $120 Business Plan, you receive 32 Credits ($120 ÷ $1.50 × 40% = 32 Credits).",
      "Credits are automatically added to your account 8 days after the transaction completes.",
    ],
  },
];

/** The credit valuation rate the credit-reward program uses. */
export const CREDIT_USD_RATE = 1.5;

/** The minimum payout amount that clears each cash cycle. */
export const CASH_PAYOUT_MINIMUM_USD = 50;

/** The credit reward for each approved social-post recommendation. */
export const SOCIAL_POST_REWARD_CREDITS = 1;
