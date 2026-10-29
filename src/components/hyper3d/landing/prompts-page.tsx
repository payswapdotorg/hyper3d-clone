import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { CopyPromptButton } from "@/components/hyper3d/landing/copy-prompt-button";
import type { PromptsPageDef, PromptExample } from "@/lib/landing-types";
import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "./landing-shared";

/**
 * /3d-prompts renderer — mirrors the reference's hub anatomy (recon
 * 2026-10-30: featured examples band, prompt cards, "how to use a 3D
 * prompt" steps) with prompts that genuinely work in this clone's
 * text-to-3D studio. Prompt text renders in a mono box with a
 * copy-to-clipboard button — the one piece of client JS on the page,
 * and it is real: clipboard write, no toast theater. Categories group
 * the cards; the closing note states plainly what the reference has
 * that this clone does not.
 */

const CATEGORY_LABEL: Record<PromptExample["category"], string> = {
  characters: "Characters",
  props: "Props & products",
  environments: "Environments",
  stylized: "Stylized",
};

function PromptCard({ example }: { example: PromptExample }) {
  return (
    <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black tracking-tight text-white/85">{example.title}</span>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
          {CATEGORY_LABEL[example.category]}
        </span>
      </div>
      <PromptCopyBox prompt={example.prompt} />
      <p className="mt-3 text-xs leading-relaxed text-white/50">
        <Lightbulb className="mr-1 inline size-3 text-amber-300/70" aria-hidden="true" />
        {example.why}
      </p>
    </li>
  );
}

/** Prompt text in a mono box + the client-side copy island. */
function PromptCopyBox({ prompt }: { prompt: string }) {
  return (
    <div className="mt-3 flex items-stretch gap-2">
      <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-200/90">
        {prompt}
      </code>
      <CopyPromptButton prompt={prompt} />
    </div>
  );
}

export function PromptsPageView({ page }: { page: PromptsPageDef }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <LandingTopBar label="3D Prompts" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={page.hero} />

        {/* featured — the studio's own examples */}
        <section className="mt-10">
          <LandingSectionHeading>{page.featuredHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 lg:grid-cols-3">
            {page.featured.map((example) => (
              <PromptCard key={example.title} example={example} />
            ))}
          </ul>
        </section>

        {/* the wider example grid */}
        <section className="mt-12">
          <LandingSectionHeading>{page.examplesHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.examples.map((example) => (
              <PromptCard key={example.title} example={example} />
            ))}
          </ul>
        </section>

        {/* how to use a 3D prompt */}
        <section className="mt-12">
          <LandingSectionHeading>{page.stepsHeading}</LandingSectionHeading>
          <ol className="mt-4 grid gap-4 lg:grid-cols-3">
            {page.steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <p className="flex items-center gap-2 text-sm font-black tracking-tight text-white/85">
                  <span className="flex size-6 items-center justify-center rounded-full border border-violet-400/40 bg-violet-400/10 font-mono text-xs text-violet-200">
                    {index + 1}
                  </span>
                  {step.title}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-white/50">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* the honest note */}
        <section className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
          <h4 className="text-sm font-black tracking-tight text-amber-200/90">
            What this page is not
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{page.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.noteLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                {link.label}
              </Link>
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
