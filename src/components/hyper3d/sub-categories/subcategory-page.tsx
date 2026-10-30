import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import type {
  SubCategoryLink,
  SubCategoryPageDef,
  SubCategoryStatus,
} from "@/lib/subcategory-types";
import { cn } from "@/lib/utils";

/**
 * Shared renderer for every /sub-categories/[slug] page — mirrors the
 * reference's sub-category anatomy (recon 2026-10-30 of
 * /sub-categories/roblox): top bar, hero with CTAs, "Browse by Tag"
 * chips, a "Featured Free …" band, a "Generate Custom …" CTA section,
 * "Also in <Parent>" sibling links, "You May Also Like" chips, FAQ, and
 * a closing CTA band. Visual family: the clone's dark studio styling
 * (#0f0f12 / violet accents), same as style-page.tsx, use-case-page.tsx
 * and landing-shared.tsx.
 *
 * There is no /sub-categories index (the reference's sitemap ships none
 * — same as /event), so the top bar links back to the studio root, the
 * same convention landing-shared.tsx established for index-less trees.
 *
 * The "Featured Free …" band is the honest inversion: where the
 * reference grids out marketplace assets, this clone states plainly
 * that the collection is not here and links the real equivalents. The
 * status panel is this clone's addition over the reference — the same
 * contract as every tree.
 */

const STATUS_META: Record<
  SubCategoryStatus,
  { chip: string; icon: React.ComponentType<{ className?: string }> }
> = {
  generatable: {
    chip: "bg-emerald-400/10 border-emerald-400/25 text-emerald-300",
    icon: CheckCircle2,
  },
  absent: {
    chip: "bg-rose-400/10 border-rose-400/25 text-rose-300",
    icon: XCircle,
  },
};

function StatusChip({ status, label }: { status: SubCategoryStatus; label: string }) {
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

function LinkChips({ links }: { links: SubCategoryLink[] }) {
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

export function SubCategoryPageView({ def }: { def: SubCategoryPageDef }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar — index-less tree convention: back to the studio root */}
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
          className={cn(
            "mt-10 rounded-2xl border p-5",
            def.status === "generatable" && "border-emerald-400/20 bg-emerald-400/[0.04]",
            def.status === "absent" && "border-rose-400/20 bg-rose-400/[0.04]",
          )}
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

        {/* Browse by Tag — honest inversion */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.browseTitle}</h3>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/50">
            {def.browseIntro}
          </p>
          <LinkChips links={def.browseLinks} />
        </section>

        {/* Featured Free … — the honest "not here" band */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.featuredTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            {def.featuredBody}
          </p>
          <LinkChips links={def.featuredLinks} />
        </section>

        {/* Generate Custom … — the REAL section */}
        <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-5 sm:p-6">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.generateTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            {def.generateBody}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <CtaButton href={def.generateCta.href} label={def.generateCta.label} primary />
            {def.generateSecondary && (
              <CtaButton
                href={def.generateSecondary.href}
                label={def.generateSecondary.label}
              />
            )}
          </div>
        </section>

        {/* Also in <Parent> — sibling collections, honestly re-pointed */}
        {def.alsoIn && (
          <section className="mt-12">
            <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.alsoIn.title}</h3>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/50">
              {def.alsoIn.intro}
            </p>
            <LinkChips links={def.alsoIn.links} />
          </section>
        )}

        {/* You May Also Like */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">{def.relatedTitle}</h3>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/50">
            {def.relatedIntro}
          </p>
          <LinkChips links={def.relatedLinks} />
        </section>

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
        Sub-category pages follow the reference&apos;s structure with an honest status line — every
        collection described here either maps to a real surface in this clone or says plainly that
        it does not exist.
      </footer>
    </div>
  );
}
