"use client";

/**
 * Story collection (t72) — the reference's /workspace/rodin/tab/story
 * content area, probed live 2026-10-31 (agent-walked, DOM-extracted).
 * The surface is an earn page, not a post feed anymore (the t48
 * announcement-card feed is retired with this task — the reference now
 * renders, top to bottom):
 *
 *  - "Story-sharing bonus" tracker — Pending / Approved / Rejected counts
 *  - "Affiliate Partner" section — two program cards (Cash Rewards via
 *    PayPal, Credit Rewards) with the reference's real published numbers
 *    (20% / 40% / $1.50 per Credit / 2-Credit signups / 13th-of-month
 *    payouts / $50 minimum / 8-day credit delay) plus Payment History
 *  - social-post referral — "Recommend Rodin-related posts for bonus
 *    credits!", six platform chips, paste-a-link + Claim Now
 *
 * Honest wiring: the bonus tracker reads all zeros (this clone runs no
 * story moderation queue); a signed-in user's Invite panel shows their
 * REAL clone referral link (/r/<code> — the t53 deep link, real route);
 * PayPal / payouts / claim moderation are not operated by this clone and
 * say so when used. Program numbers come from src/lib/story-programs.ts.
 */

import { useState } from "react";
import { Check, ChevronDown, Copy, Link2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { UserInfo } from "@/lib/use-session";
import {
  AFFILIATE_PROGRAMS,
  SOCIAL_POST_REWARD_CREDITS,
  STORY_BONUS_STATES,
  STORY_REFERRAL_PLATFORMS,
} from "@/lib/story-programs";

function BonusTracker() {
  return (
    <section
      className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[50px]"
      aria-label="Story-sharing bonus"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-white">Story-sharing bonus</h3>
        <p className="text-xs text-white/50">Check your Story-sharing bonus here!</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {STORY_BONUS_STATES.map((state) => (
          <div
            key={state}
            className="rounded-[18px] border border-white/8 bg-black/30 px-4 py-3 text-center"
          >
            <span className="font-mono text-2xl font-bold text-white">00</span>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
              {state}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/40">
        Story submission and moderation are not operated by this clone — the counters stay at zero,
        honestly.
      </p>
    </section>
  );
}

function ProgramCard({
  program,
  signedIn,
  referralLink,
  onNeedAuth,
}: {
  program: (typeof AFFILIATE_PROGRAMS)[number];
  signedIn: boolean;
  referralLink: string | null;
  onNeedAuth: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <article
      className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[50px]"
      aria-label={`${program.name} program`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-white">{program.name}</h3>
        <button
          type="button"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-[#d2b6df] transition-colors hover:text-white"
        >
          See details <ChevronDown className={cn("size-3.5 transition-transform", detailsOpen && "rotate-180")} aria-hidden="true" />
        </button>
      </div>
      <p className="text-[13px] leading-relaxed text-white/65">{program.summary}</p>

      {detailsOpen && (
        <ul className="space-y-1.5 rounded-[18px] border border-white/8 bg-black/25 p-4 text-[12px] leading-relaxed text-white/55">
          {program.terms.map((term) => (
            <li key={term} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-[#d2b6df]" aria-hidden="true" />
              <span>{term}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] border border-white/8 bg-black/30 px-4 py-3 text-center">
          <span className="font-mono text-xl font-bold text-white">{signedIn ? "0" : "-"}</span>
          <p className="mt-1 text-[11px] font-semibold text-white/50">Sign up</p>
        </div>
        <div className="rounded-[18px] border border-white/8 bg-black/30 px-4 py-3 text-center">
          <span className="font-mono text-xl font-bold text-white">{signedIn ? "0" : "-"}</span>
          <p className="mt-1 text-[11px] font-semibold text-white/50">{program.name}</p>
        </div>
      </div>

      {program.id === "cash" && (
        <button
          type="button"
          onClick={() =>
            toast.info("PayPal payouts are not operated by this clone", {
              description: "The reference's cash-reward program has no counterpart here.",
            })
          }
          className="w-fit text-xs font-semibold text-white/55 underline-offset-2 transition-colors hover:text-white hover:underline"
        >
          PayPal account
        </button>
      )}

      <div className="rounded-[18px] border border-white/8 bg-black/25 p-4">
        {signedIn && referralLink ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
              Your referral link (real)
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-full border border-white/10 bg-[#3a3a42] px-4 py-2 font-mono text-xs text-[#c4b0f0]">
                {referralLink}
              </code>
              <button
                type="button"
                aria-label="Copy referral link"
                onClick={() => {
                  void navigator.clipboard?.writeText(referralLink);
                  toast.success("Referral link copied");
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Copy className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-white/40">
              Signups through this link carry your code into the clone's real referral capture —
              reward payouts are not operated here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <p className="text-[13px] text-white/60">Log in to get your affiliate link.</p>
            <button
              type="button"
              onClick={onNeedAuth}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[linear-gradient(97deg,#a78bfa_0%,#818cf8_100%)] px-5 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              <Users className="size-3.5" aria-hidden="true" /> Invite
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-white/8 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Payment History</p>
        <p className="mt-1 text-xs text-white/50">No payment records yet</p>
      </div>
    </article>
  );
}

function SocialReferral() {
  const [link, setLink] = useState("");

  return (
    <section
      className="rounded-[24px] border border-[#d2b6df]/25 bg-[linear-gradient(160deg,rgba(210,182,223,0.10),rgba(236,193,108,0.05))] p-6 backdrop-blur-[50px]"
      aria-label="Social referral"
    >
      <h3 className="text-base font-bold text-white">Recommend Rodin-related posts for bonus credits!</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-white/60">
        Earn {SOCIAL_POST_REWARD_CREDITS} Credit for every Rodin-related post you recommend after moderation!
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STORY_REFERRAL_PLATFORMS.map((platform) => (
          <span
            key={platform}
            className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/70"
          >
            {platform}
          </span>
        ))}
      </div>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const value = link.trim();
          if (!value) {
            toast.info("Paste the link here first");
            return;
          }
          setLink("");
          toast.info("Claim received — nothing further happens", {
            description: "Post moderation is not operated by this clone, so no credit is awarded.",
          });
        }}
      >
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste the link here"
          aria-label="Paste the link here"
          className="h-11 min-w-0 flex-1 rounded-full border border-white/12 bg-[#3a3a42] px-5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-sm font-bold text-[#17181c] transition-opacity hover:opacity-90"
        >
          <Sparkles className="size-3.5" aria-hidden="true" /> Claim Now
        </button>
      </form>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-white/50">
        <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
        Share any Rodin content — even if it's not yours! Share More, Earn More!
      </p>
    </section>
  );
}

export function StoryCollection({
  user,
  onNeedAuth,
}: {
  user: UserInfo | null;
  onNeedAuth: () => void;
}) {
  const signedIn = Boolean(user);
  const referralLink =
    user?.referral_code && typeof window !== "undefined"
      ? `${window.location.origin}/r/${user.referral_code}`
      : null;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-10 md:px-20" aria-label="Story collection">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-[26px] font-bold leading-none text-white">STORY</h2>
        <p className="text-sm text-white/50">
          Share stories, invite friends, recommend posts — the reference's earn surface, honestly
          mirrored.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-5">
        <BonusTracker />

        {/* Affiliate Partner section header (reference: avatars + counters) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">Affiliate Partner</h3>
            <span aria-hidden="true" className="text-[#d2b6df]">➜</span>
          </div>
          <p className="text-[13px] text-white/55">
            Invite others to join Rodin <span className="text-white/80">while earning for yourself!</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Already Invited", "Cash Rewards", "Credit Rewards"].map((label) => (
            <div
              key={label}
              className="rounded-[18px] border border-white/8 bg-black/30 px-4 py-3 text-center"
            >
              <span className="font-mono text-xl font-bold text-white">-</span>
              <p className="mt-1 text-[11px] font-semibold text-white/50">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {AFFILIATE_PROGRAMS.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              signedIn={signedIn}
              referralLink={referralLink}
              onNeedAuth={onNeedAuth}
            />
          ))}
        </div>

        <SocialReferral />

        {/* Rodin Tips card (kept from the reference story area) */}
        <section className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-[50px]">
          <h3 className="text-base font-bold text-white">Rodin Tips</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Tutorial", "Official", "English", "中文", "Other Languages"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  toast.info(chip, { description: "The reference's tips channel is not part of this clone." })
                }
                className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            Redos are free, but confirmation costs credits. Drink water to speed up generation!
          </p>
        </section>
      </div>
    </section>
  );
}
