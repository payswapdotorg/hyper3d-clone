import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { LEGAL_DOCUMENTS } from "@/lib/legal";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { familyMetadata } from "@/lib/seo";

/**
 * /legal — the reference's "Legal Center" index (recon 2026-10-29: a short
 * intro + the five documents). Same public-page family as /features.
 */
export const metadata: Metadata = {
  title: referenceTitle("/legal") ?? "Legal Center",
  description:
    "This service's privacy policy, terms of service, refund policy, copyright license, and fulfillment policy in one place.",
  ...familyMetadata({ title: referenceCardTitle("/legal") ?? "Legal Center", description: "This service's privacy policy, terms of service, refund policy, copyright license, and fulfillment policy in one place.", path: "/legal" }),
};

export default function LegalIndexPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
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
        <h1 className="text-sm font-bold text-white">Legal Center</h1>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">Legal Center</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            This service&apos;s legal documents in one place. They are this clone&apos;s own
            documents: written for what this deployment actually does — its credits, its
            pipeline, its limitations — not copied from the reference product.
          </p>
        </section>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {LEGAL_DOCUMENTS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/legal/${doc.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
              >
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-violet-300/80" aria-hidden="true" />
                  <span className="text-sm font-black tracking-tight text-white group-hover:text-violet-100">
                    {doc.name}
                  </span>
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-white/50">
                  {doc.description}
                </span>
                <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {doc.sections.length} sections · updated {doc.updated}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs leading-relaxed text-white/35">
          Looking for what works and what does not? The{" "}
          <Link href="/features" className="text-white/60 underline-offset-2 hover:underline">
            feature pages
          </Link>{" "}
          carry the same honesty contract.
        </p>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        These documents describe this clone&apos;s actual behavior, including its limitations.
      </footer>
    </div>
  );
}
