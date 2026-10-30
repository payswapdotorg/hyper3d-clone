import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle, Sparkles, XCircle } from "lucide-react";

import type {
  ToolLink,
  ToolPageDef,
  ToolStatus,
} from "@/lib/tool-types";
import { cn } from "@/lib/utils";
import { toolJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * Shared renderer for every /tools leaf page (t64) — the same family as
 * style-page.tsx, subcategory-page.tsx and landing-shared.tsx: dark
 * studio background (#0f0f12), violet accents, server component
 * throughout, honest status panel, native <details> FAQ.
 *
 * Status colors follow the tree conventions: live = emerald,
 * generative = amber (a real path of a different kind), not-here = rose.
 * Sections render as numbered steps, card grids, or link chips depending
 * on which field the content builder filled.
 */

const STATUS_META: Record<
  ToolStatus,
  { chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  live: {
    chip: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300",
    icon: CheckCircle2,
  },
  "task-export": {
    chip: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300",
    icon: CheckCircle2,
  },
  generative: {
    chip: "bg-amber-400/10 border-amber-400/25 text-amber-300",
    icon: Sparkles,
  },
  "not-here": {
    chip: "bg-rose-400/10 border-rose-400/25 text-rose-300",
    icon: XCircle,
  },
};

function StatusChip({ status, label }: { status: ToolStatus; label: string }) {
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

function LinkChips({ links }: { links: ToolLink[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
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
  );
}

const STATUS_BORDER: Record<ToolStatus, string> = {
  live: "border-emerald-400/20 bg-emerald-400/[0.04]",
  "task-export": "border-emerald-400/20 bg-emerald-400/[0.04]",
  generative: "border-amber-400/20 bg-amber-400/[0.04]",
  "not-here": "border-rose-400/20 bg-rose-400/[0.04]",
};

export function ToolPageView({ def }: { def: ToolPageDef }) {
  // t67: the reference tool-page set — WebApplication, breadcrumb, FAQ,
  // HowTo, ItemList.
  const jsonLd = toolJsonLd(def);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      {/* top bar — every leaf links back to the converter matrix (the
          tree's hub), the same real route the cross-links use */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/tools/converter"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Converter matrix
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
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <CtaButton href={def.cta.href} label={def.cta.label} primary />
            {def.ctaSecondary && (
              <CtaButton href={def.ctaSecondary.href} label={def.ctaSecondary.label} />
            )}
          </div>
        </section>

        {/* honest status panel */}
        <section
          aria-label="Clone status"
          className={cn("mt-10 rounded-2xl border p-5", STATUS_BORDER[def.status])}
        >
          <div className="flex items-center gap-2">
            <StatusChip status={def.status} label={def.statusChip} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/35">
              status in this clone
            </span>
          </div>
          <p className="mt-3 text-sm font-bold text-white/85">{def.statusPanel.summary}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                Works here
              </p>
              <ul className="mt-2 space-y-1.5">
                {def.statusPanel.works.map((item) => (
                  <li key={item} className="flex gap-2 text-xs leading-relaxed text-white/60">
                    <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-400/70" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80">
                Limits here
              </p>
              <ul className="mt-2 space-y-1.5">
                {def.statusPanel.limits.map((item) => (
                  <li key={item} className="flex gap-2 text-xs leading-relaxed text-white/60">
                    <MinusCircle className="mt-0.5 size-3 shrink-0 text-amber-400/70" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* flexible sections: steps (numbered), cards (grid), links (chips) */}
        {def.sections.map((section) => (
          <section key={section.title} className="mt-12">
            <h3 className="text-xl font-black tracking-tight sm:text-2xl">{section.title}</h3>
            {section.intro && (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/50">
                {section.intro}
              </p>
            )}
            {section.steps && (
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {section.steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <span className="inline-flex size-6 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/10 text-[11px] font-black text-violet-200">
                      {i + 1}
                    </span>
                    <p className="mt-3 text-sm font-black tracking-tight">{step.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/50">{step.body}</p>
                  </li>
                ))}
              </ol>
            )}
            {section.cards && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {section.cards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <p className="text-sm font-black tracking-tight">{card.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/50">{card.body}</p>
                  </div>
                ))}
              </div>
            )}
            {section.links && <LinkChips links={section.links} />}
          </section>
        ))}

        {/* FAQ */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.faqTitle}</h3>
          <div className="mt-5 space-y-2.5">
            {def.faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-white/80 marker:content-none">
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
          <LinkChips links={def.crossLinks} />
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
        Tool pages follow the reference&apos;s structure with an honest status line — every
        conversion described here either runs, generates, or says plainly that it does not exist.
      </footer>
    </div>
  );
}
