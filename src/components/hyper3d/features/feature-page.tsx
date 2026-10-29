import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed, MinusCircle } from "lucide-react";
import type { FeaturePageDef, FeatureStatus } from "@/lib/features-types";
import { cn } from "@/lib/utils";

/**
 * Shared renderer for every /features/[...slug] page — mirrors the
 * reference's feature-page anatomy (recon 2026-10-29): breadcrumb top bar,
 * hero with CTAs, a 3-step "how it works", a benefits grid, use-case cards,
 * an FAQ, sibling cross-links, and a closing CTA band.
 *
 * Server component throughout (the FAQ uses native <details>), matching the
 * clone's dark studio styling (#0f0f12 / violet accents) like the OmniCraft
 * pages. The honest status chip + panel is this clone's addition — the
 * reference has nothing to be honest about, this one does.
 */

const STATUS_META: Record<
  FeatureStatus,
  { chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  live: {
    chip: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300",
    icon: CheckCircle2,
  },
  partial: {
    chip: "bg-amber-400/10 border-amber-400/25 text-amber-300",
    icon: MinusCircle,
  },
  "reference-only": {
    chip: "bg-white/[0.03] border-white/10 text-white/40",
    icon: CircleDashed,
  },
};

function StatusChip({ status, label }: { status: FeatureStatus; label: string }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
        meta.chip,
      )}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

function CtaButton({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-bold transition-colors",
        primary
          ? "border border-violet-400/40 bg-violet-400/15 text-violet-100 hover:bg-violet-400/25"
          : "border border-white/15 bg-white/[0.04] text-white/75 hover:border-white/30 hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}

export function FeaturePage({ def }: { def: FeaturePageDef }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar — same family as the OmniCraft pages */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/features"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Features
        </Link>
        <span className="text-white/20" aria-hidden="true">
          /
        </span>
        <h1 className="text-sm font-bold text-white">{def.name}</h1>
        <span className="ml-auto">
          <StatusChip status={def.status} label={def.statusChip} />
        </span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {/* hero */}
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">{def.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {def.subline}
          </p>
          {(def.cta || def.ctaSecondary) && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {def.cta && <CtaButton href={def.cta.href} label={def.cta.label} primary />}
              {def.ctaSecondary && (
                <CtaButton href={def.ctaSecondary.href} label={def.ctaSecondary.label} />
              )}
            </div>
          )}
        </section>

        {/* honest status panel */}
        <section
          aria-label="Clone status"
          className={cn(
            "mt-10 rounded-2xl border p-5",
            def.status === "live" && "border-emerald-400/20 bg-emerald-400/[0.04]",
            def.status === "partial" && "border-amber-400/20 bg-amber-400/[0.04]",
            def.status === "reference-only" && "border-white/10 bg-white/[0.02]",
          )}
        >
          <div className="flex items-center gap-2">
            <StatusChip status={def.status} label={def.statusChip} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/35">
              status in this clone
            </span>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-white/60">{def.statusNote}</p>
        </section>

        {/* steps */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.stepsTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{def.stepsIntro}</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {def.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <span className="flex size-7 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 text-xs font-black text-violet-300">
                  {i + 1}
                </span>
                <h4 className="mt-3 text-sm font-bold text-white">{step.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* benefits */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.benefitsTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {def.benefitsIntro}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {def.benefits.map((b) => (
              <li key={b.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="text-sm font-bold text-white">{b.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* use cases */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.useCasesTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {def.useCasesIntro}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {def.useCases.map((u) => (
              <li key={u.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="inline-flex rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                  {u.tag}
                </span>
                <h4 className="mt-2.5 text-sm font-bold text-white">{u.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ — native details/summary, SSR-friendly and accessible */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.faqTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{def.faqIntro}</p>
          <div className="mt-6 space-y-2">
            {def.faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 open:bg-white/[0.045]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-white/85 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="text-white/30 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 border-t border-white/5 pt-2.5 text-xs leading-relaxed text-white/50">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* cross-links */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.crossLinksTitle}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
            {def.crossLinksIntro}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {def.crossLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/70 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* closing CTA */}
        <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6 text-center sm:p-8">
          <h3 className="text-lg font-black tracking-tight sm:text-xl">{def.closingTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            {def.closingBody}
          </p>
          <div className="mt-5">
            <CtaButton href={def.closingCta.href} label={def.closingCta.label} primary />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Feature pages follow the reference&apos;s structure with an honest status line — every feature
        described here either works in this clone or says plainly that it does not.
      </footer>
    </div>
  );
}
