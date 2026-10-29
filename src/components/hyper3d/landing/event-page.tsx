import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";

import type { EventPageDef } from "@/lib/landing-types";
import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "./landing-shared";

/**
 * /event/[slug] renderer — mirrors the reference's event-page anatomy
 * (recon 2026-10-30 of hyper3d.ai/event/chroma-awards: an offer hero, a
 * redemption note, a sign-in section, workflow cross-links, a backer
 * list, FAQ) with every promise inverted into its honest status and the
 * workflow picker re-pointed at this clone's real feature pages.
 * Server component throughout.
 */
export function EventPageView({ page }: { page: EventPageDef }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <LandingTopBar label={`Event / ${page.title}`} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={page.hero} />

        {/* the reference's promises, answered */}
        <section className="mt-10">
          <LandingSectionHeading>{page.promisesHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.absentPromises.map((promise) => (
              <li
                key={promise.referencePromise}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-white/75">{promise.referencePromise}</p>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
                    <X className="size-3" aria-hidden="true" />
                    NOT HERE
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{promise.hereReality}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* the real workflow picker */}
        <section className="mt-12">
          <LandingSectionHeading>{page.workflowsHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.workflows.map((workflow) => (
              <li key={workflow.href + workflow.label}>
                <Link
                  href={workflow.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black tracking-tight text-white/85 group-hover:text-violet-100">
                      {workflow.label}
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 text-white/30 group-hover:text-violet-200"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-white/50">
                    {workflow.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <LandingSectionHeading>Event FAQ</LandingSectionHeading>
          <div className="mt-4 space-y-2">
            {page.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 open:border-violet-400/30"
              >
                <summary className="cursor-pointer list-none text-sm font-bold text-white/85 marker:hidden [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12">
          <LandingClosingBand
            headline={page.closing.headline}
            body={page.closing.body}
            cta={page.closing.cta}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
