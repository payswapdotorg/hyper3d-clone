/**
 * t82 — the two OAuth guest surfaces (/workspace/oauth/device and
 * /workspace/mcp/oauth/consent), server-rendered as the reference's
 * own guest error states (probed + DOM-extracted 2026-11-01,
 * recon/t82/notes.md): no <title> (the reference serves none), a
 * centered brand header, one card, one trust note. Both reference
 * views share the mcpOAuthConsent_* CSS — this component shares the
 * same layout, parameterized by the probed copy.
 *
 * Extracted reference design: page bg #121317, min-height 100dvh,
 * centered column; brand = 32px logo + 13px/600 name + 13px/500
 * muted product tag, 18px below; card 560px, bg #202024, border
 * 1px #36363a, radius 32px, padding 32px; icon = 40px circle,
 * bg rgba(238,145,136,.08), color #ee9188 (the lucide circle-alert);
 * eyebrow 11px/600 muted; H1 24px/600; description 13px/400 muted;
 * trust note 13px muted below the card.
 */

import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import type { OAuthGuestViewCopy } from "@/lib/workspace-shell-routes";

export function OAuthGuestView({ copy }: { copy: OAuthGuestViewCopy }) {
  return (
    <>
      {/* The shared-shell visit markers — every /workspace route on the
          reference stamps these, the OAuth surfaces included. */}
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <main
        className="flex min-h-dvh flex-col items-center justify-center bg-[#121317] px-6 py-16"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, Roboto, "Segoe UI", sans-serif' }}
      >
        {/* brand header — the reference's logo + name + product tag */}
        <header className="mb-[18px] flex items-center">
          <img
            src="/images/hyper3d-logo.png"
            alt=""
            aria-hidden="true"
            className="h-8 w-8"
          />
          <span className="ml-3 text-[13px] font-semibold text-[#f5f5f5]">
            {copy.brandName}
          </span>
          <span className="pl-[9px] text-[13px] font-medium text-[#a0a0a5]">
            {copy.brandProduct}
          </span>
        </header>

        {/* the error card */}
        <section
          aria-live="assertive"
          className="w-full max-w-[560px] rounded-[32px] border border-[#36363a] bg-[#202024] p-8"
        >
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-[rgba(238,145,136,0.08)] text-[#ee9188]">
            {/* the reference's lucide circle-alert, verbatim path */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <p className="mb-2 text-[11px] font-semibold text-[#a0a0a8]">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">
            {copy.heading}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#a6a6ad]">
            {copy.description}
          </p>
        </section>

        {/* the trust note below the card */}
        <p className="mt-4 text-[13px] text-[#a0a0a5]">{copy.trustNote}</p>
      </main>
    </>
  );
}
