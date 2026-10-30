import Link from "next/link";
import { X } from "lucide-react";

import type { SwitchPageDef } from "@/lib/landing-types";
import { baselineJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";
import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "./landing-shared";

/**
 * /switch and /switch/makerworld renderer — mirrors the reference's
 * offer-page anatomy (recon 2026-10-30: an offer hero, the claim steps,
 * a comparison table, a "why choose" band, testimonials, FAQ, CTA) with
 * every offer mechanic inverted into its honest status. The reference's
 * testimonials are dropped rather than faked — inventing switchers
 * would be marketing fiction, and the table says so in one row.
 * Server component throughout.
 */
export function SwitchPageView({ page }: { page: SwitchPageDef }) {
  const topBarLabel = page.slug === "makerworld" ? "Switch / MakerWorld" : "Switch";
  // t67: baseline WebPage + breadcrumb for the switch routes.
  const jsonLd = baselineJsonLd(page.hero.headline, page.hero.eyebrow, `/switch/${page.slug}`, [
    { name: "Home", path: "/" },
    { name: "Switch", path: "/switch" },
    { name: page.title, path: `/switch/${page.slug}` },
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <LandingTopBar label={topBarLabel} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={page.hero} />

        {/* the offer mechanics, inverted */}
        <section className="mt-10">
          <LandingSectionHeading>{page.offerHeading}</LandingSectionHeading>
          <ul className="mt-4 space-y-3">
            {page.offerPoints.map((point) => (
              <li
                key={point.referencePromise}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-white/75">{point.referencePromise}</p>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
                    <X className="size-3" aria-hidden="true" />
                    NOT HERE
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{point.hereStatus}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* the offer comparison table */}
        <section className="mt-12">
          <LandingSectionHeading>{page.tableHeading}</LandingSectionHeading>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    The reference's offer
                  </th>
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    Here
                  </th>
                  <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white/40">
                    The honest detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.table.map((row) => (
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

        {/* what is real instead */}
        <section className="mt-12">
          <LandingSectionHeading>{page.realHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 lg:grid-cols-3">
            {page.realItems.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <p className="text-sm font-black tracking-tight text-white/85">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* cross-links — the sibling switch page + the price list */}
        <section className="mt-10 flex flex-wrap gap-2">
          {page.slug === "makerworld" ? (
            <Link
              href="/switch"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              The Meshy / Tripo switch page
            </Link>
          ) : (
            <Link
              href="/switch/makerworld"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Coming from MakerWorld?
            </Link>
          )}
          <Link
            href="/pricing"
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            The one real price list
          </Link>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <LandingSectionHeading>Switch FAQ</LandingSectionHeading>
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
