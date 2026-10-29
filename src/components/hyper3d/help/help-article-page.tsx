import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import type { HelpArticleDef, HelpStatus } from "@/lib/help-types";
import { HELP_STATUS_META, findHelpCategory } from "@/lib/help";
import { cn } from "@/lib/utils";

/**
 * Shared renderer for every /help/articles/[slug] page — mirrors the
 * reference's article anatomy (breadcrumb, question H1, article body,
 * related links) with this clone's three-way honesty verdict on top:
 * a status chip, a "The short answer" box up front, and honest notes in
 * bordered mono boxes (same visual family as the styles tree's recipes).
 *
 * Every paragraph is this clone's own copy; the numbers in credit/billing
 * articles are the real constants the metering code uses.
 */

const STATUS_META: Record<HelpStatus, { chip: string; icon: React.ComponentType<{ className?: string }> }> = {
  live: { chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
  partial: { chip: "border-amber-400/25 bg-amber-400/10 text-amber-300", icon: MinusCircle },
  "not-in-clone": { chip: "border-white/20 bg-white/[0.05] text-white/60", icon: XCircle },
};

function StatusChip({ status }: { status: HelpStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const label = HELP_STATUS_META[status].chip;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
        meta.chip,
      )}
      title={HELP_STATUS_META[status].label}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function HelpArticlePage({ def }: { def: HelpArticleDef }) {
  const category = findHelpCategory(def.category);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar — same family as the feature/legal/use-case/style pages */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/help"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Help Center
        </Link>
        <span className="text-white/20" aria-hidden="true">
          /
        </span>
        <Link
          href={`/help/${def.category}`}
          className="text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          {category?.name ?? def.category}
        </Link>
        <span className="ml-auto">
          <StatusChip status={def.status} />
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* article head */}
        <section>
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            {def.title}
          </h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/30">
            Updated {def.updated}
          </p>
        </section>

        {/* the short answer */}
        <section
          aria-label="The short answer"
          className={cn(
            "mt-6 rounded-2xl border p-5",
            def.status === "live" && "border-violet-400/25 bg-violet-400/[0.05]",
            def.status === "partial" && "border-amber-400/25 bg-amber-400/[0.04]",
            def.status === "not-in-clone" && "border-white/12 bg-white/[0.03]",
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">
            The short answer
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">{def.answer}</p>
        </section>

        {/* body sections */}
        {def.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-lg font-black tracking-tight sm:text-xl">{section.heading}</h2>
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-white/60">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.steps && (
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
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
            {section.note && (
              <p className="mt-5 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 font-mono text-xs leading-relaxed text-white/55">
                {section.note}
              </p>
            )}
          </section>
        ))}

        {/* related */}
        <section className="mt-12">
          <h2 className="text-lg font-black tracking-tight">Related</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {def.related.map((link) => (
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

        {/* back to category */}
        <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6 text-center sm:p-8">
          <h2 className="text-lg font-black tracking-tight sm:text-xl">
            {category ? `More from ${category.name}` : "Keep reading"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            {category?.blurb}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href={`/help/${def.category}`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              Browse {category?.name ?? "the category"}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Open the studio
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Help articles answer with the codebase&apos;s real behavior — works here, partial here, or
        not in this clone. No middle ground.
      </footer>
    </div>
  );
}
