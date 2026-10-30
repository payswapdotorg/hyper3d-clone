import Link from "next/link";
import { Check, Sparkles, X } from "lucide-react";

import type { PricingPageDef } from "@/lib/landing-types";
import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "./landing-shared";
import { baselineJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * /pricing renderer — mirrors the reference's pricing anatomy (recon
 * 2026-10-30: a highlighted plan card grid, a tier list, a comparison
 * table, a pricing FAQ, a closing CTA) with the clone's honest
 * inversion: ONE real card ("Every account", $0), the reference's four
 * paid tiers shown once each marked absent, the comparison table
 * replaced by the real price list, and FAQ answers that match the help
 * center's billing articles. Server component; the FAQ uses native
 * <details> so no client JS is needed.
 */
export function PricingPageView({ page }: { page: PricingPageDef }) {
  // t67: baseline WebPage + breadcrumb for the pricing route.
  const jsonLd = baselineJsonLd(page.hero.headline, page.hero.eyebrow, "/pricing", [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <LandingTopBar label="Pricing" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={page.hero} />

        {/* the one plan card — the reference's highlighted-card slot */}
        <section className="mt-10" aria-label="The only plan">
          <div className="relative overflow-hidden rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-400/[0.12] via-white/[0.03] to-transparent p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-300" aria-hidden="true" />
              <span className="text-sm font-black tracking-tight text-violet-100">
                {page.onlyPlan.name}
              </span>
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {page.onlyPlan.price}
              </span>
              <span className="text-sm font-bold text-white/50">/ {page.onlyPlan.period}</span>
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/35">
              {page.onlyPlan.note}
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {page.onlyPlan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-emerald-400/80"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <Link
                href={page.onlyPlan.cta.href}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
              >
                {page.onlyPlan.cta.label}
              </Link>
            </div>
          </div>
        </section>

        {/* the tiers that are not here */}
        <section className="mt-12">
          <LandingSectionHeading>{page.absentTiersHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.absentTiers.map((tier) => (
              <li
                key={tier.name}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black tracking-tight text-white/80">
                    {tier.name}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
                    <X className="size-3" aria-hidden="true" />
                    NOT HERE
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/30">
                  {tier.referencePrice}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/50">{tier.why}</p>
                <p className="mt-3 text-xs text-white/45">
                  Nearest real thing:{" "}
                  <Link
                    href={tier.nearest.href}
                    className="font-bold text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
                  >
                    {tier.nearest.label}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* the real price list */}
        <section className="mt-12">
          <LandingSectionHeading>{page.priceListHeading}</LandingSectionHeading>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    What you do
                  </th>
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    What it costs here
                  </th>
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    The honest detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.priceList.map((row) => (
                  <tr key={row.action} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-bold text-white/80">{row.action}</td>
                    <td className="px-4 py-3 font-bold text-violet-200">{row.cost}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-white/50">
                      {row.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <LandingSectionHeading>Pricing FAQ</LandingSectionHeading>
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
