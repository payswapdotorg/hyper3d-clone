import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { LandingCta, LandingHero } from "@/lib/landing-types";

/**
 * Shared shell for the five standalone landing pages (t62): the same top
 * bar / hero / closing-band family as the feature, style, use-case and
 * help trees — dark studio background (#0f0f12), violet accents, server
 * component throughout. Individual pages render their own sections
 * between the hero and the closing band.
 */

export function LandingTopBar({ label }: { label: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Studio
      </Link>
      <span className="text-white/20" aria-hidden="true">
        /
      </span>
      <h1 className="text-sm font-bold text-white">{label}</h1>
    </header>
  );
}

export function LandingHeroBlock({ hero }: { hero: LandingHero }) {
  return (
    <section className="border-b border-white/10 pb-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
        {hero.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
        {hero.headline}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
        {hero.subhead}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <HeroCta cta={hero.primaryCta} primary />
        {hero.secondaryCta ? <HeroCta cta={hero.secondaryCta} /> : null}
      </div>
    </section>
  );
}

function HeroCta({ cta, primary }: { cta: LandingCta; primary?: boolean }) {
  const className = primary
    ? "inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
    : "inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white";
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

export function LandingClosingBand({
  headline,
  body,
  cta,
}: {
  headline: string;
  body: string;
  cta: LandingCta;
}) {
  return (
    <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[0.08] to-transparent p-6 text-center sm:p-8">
      <h3 className="text-lg font-black tracking-tight sm:text-xl">{headline}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">{body}</p>
      <div className="mt-5">
        <Link
          href={cta.href}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
      Every claim on this page is anchored to the codebase that ships it — no plans, no offers, no
      partnerships, and no exceptions.
    </footer>
  );
}

/** Section heading used by every landing renderer. */
export function LandingSectionHeading({ children }: { children: string }) {
  return <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">{children}</h3>;
}
