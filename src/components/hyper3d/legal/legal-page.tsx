import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import type { LegalDocDef } from "@/lib/legal-types";

/**
 * Shared renderer for every /legal/[slug] document — follows the clone's
 * public-page family (feature-page.tsx / OmniCraft pages): dark studio
 * styling (#0f0f12 / violet accents), breadcrumb top bar, hero, and a
 * per-document table of contents. Server component throughout; anchors are
 * native ids so TOC links work without any client JS.
 *
 * Legal anatomy (reference recon 2026-10-29): numbered-section documents
 * with a TOC, cross-links to sibling documents, and an index ("Legal
 * Center") — mirrored here with this clone's own honest text.
 */

export function LegalPage({ doc, siblings }: { doc: LegalDocDef; siblings: LegalDocDef[] }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar — same family as the feature pages */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/legal"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Legal Center
        </Link>
        <span className="text-white/20" aria-hidden="true">
          /
        </span>
        <h1 className="text-sm font-bold text-white">{doc.name}</h1>
        <span className="ml-auto rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-white/40">
          Updated {doc.updated}
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* TOC — sticky on desktop, plain list on mobile */}
        <nav
          aria-label="On this page"
          className="h-fit rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:sticky lg:top-6"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">
            On this page
          </p>
          <ul className="mt-3 space-y-1.5">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1 text-xs leading-snug text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-white/5 pt-3 text-[11px] leading-relaxed text-white/35">
            The other documents:
          </p>
          <ul className="mt-2 space-y-1.5">
            {siblings
              .filter((s) => s.slug !== doc.slug)
              .map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/legal/${s.slug}`}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/45 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <FileText className="size-3 shrink-0" aria-hidden="true" />
                    {s.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        {/* document body */}
        <article className="min-w-0">
          <section className="border-b border-white/10 pb-8">
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl">{doc.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              {doc.description}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/35">
              Last updated: {doc.updated}
            </p>
          </section>

          <div className="mt-8 space-y-10">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6">
                <h3 className="text-lg font-black tracking-tight sm:text-xl">
                  {section.heading}
                </h3>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i} className="max-w-3xl text-sm leading-relaxed text-white/60">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-4 max-w-3xl space-y-2">
                    {section.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] p-3 text-sm leading-relaxed text-white/60"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-400/70"
                          aria-hidden="true"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* cross-links */}
          <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white/70">
              Legal Center
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              This document is one of five. The others cover the rest of the relationship with
              this service.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {siblings
                .filter((s) => s.slug !== doc.slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/legal/${s.slug}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/70 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/legal"
                  className="inline-flex min-h-9 items-center rounded-full border border-violet-400/40 bg-violet-400/15 px-3 text-xs font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
                >
                  All documents
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        These are this clone&apos;s own legal documents — they describe what this deployment
        actually does, including its limitations, rather than the reference product&apos;s terms.
      </footer>
    </div>
  );
}
