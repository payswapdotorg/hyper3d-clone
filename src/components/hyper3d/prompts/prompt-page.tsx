import Link from "next/link";
import { CheckCircle2, FileText, Lightbulb, MinusCircle } from "lucide-react";

import { CopyPromptButton } from "@/components/hyper3d/landing/copy-prompt-button";
import {
  LandingClosingBand,
  LandingFooter,
  LandingSectionHeading,
  LandingTopBar,
} from "@/components/hyper3d/landing/landing-shared";
import { JsonLd } from "@/components/hyper3d/json-ld";
import { STUDIO_PATH } from "@/lib/studio-path";
import type { PromptEntry } from "@/lib/prompts-types";
import { PROMPT_CENSUS } from "@/lib/prompts-registry";
import { promptArticleJsonLd } from "@/lib/schema-org";

/**
 * Shared renderer for every /3d-prompts/[slug] detail page (t69).
 * Written routes get the reference's anatomy — breadcrumb, H1, chips,
 * the prompt in a mono box with a real copy island, keywords, the
 * studio CTA ("Make your next creation."), optimization tips as H3
 * notes, related links. Community routes get the honest not-reproduced
 * page: the banner, the computed reason, the reference-index facts,
 * and nearest real links. A community page never renders a prompt box,
 * keywords, or tips — there is nothing to fake, and tests pin that.
 */

const MODE_LABEL: Record<string, string> = {
  text: "Text to 3D",
  image: "Image to 3D",
  scene: "WorldGen scene",
};

const GROUP_LABEL: Record<string, string> = {
  characters: "Characters",
  props: "Props & products",
  environments: "Environments",
  dioramas: "Nature & dioramas",
};

/** The reference-index line: factual model association for this route. */
function ReferenceIndexLine({ entry }: { entry: PromptEntry }) {
  if (entry.models.length === 0) return null;
  return (
    <p className="mt-2 text-xs leading-relaxed text-white/40">
      On the reference site this route is indexed under{" "}
      <span className="font-bold text-white/60">{entry.models.join(" + ")}</span> — its community
      feed sorts prompts by the third-party model they were written for. This page is not that
      feed; the association is kept as route data.
    </p>
  );
}

/** The written prompt page. */
export function PromptArticlePage({ entry }: { entry: PromptEntry }) {
  const def = entry.article!;
  const jsonLd = promptArticleJsonLd(def);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <LandingTopBar label="3D Prompts" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* head */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold text-white/40">
          <Link href="/3d-prompts" className="transition-colors hover:text-white">
            All prompts
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/60">{GROUP_LABEL[def.group]}</span>
        </nav>
        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{def.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            RUNS IN THIS STUDIO
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
            {MODE_LABEL[def.mode]}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
            {GROUP_LABEL[def.group]}
          </span>
        </div>
        <ReferenceIndexLine entry={entry} />

        {/* the prompt */}
        <section className="mt-6" aria-label="Prompt">
          <LandingSectionHeading>Prompt</LandingSectionHeading>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{def.blurb}</p>
          <div className="mt-3 flex items-stretch gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-200/90">
              {def.prompt}
            </code>
            <CopyPromptButton prompt={def.prompt} />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">
            Copy it, paste it into the studio&apos;s prompt box, and generate — the preview renders
            before any credit moves; Confirm &amp; Export is 1 credit.
          </p>
        </section>

        {/* keywords */}
        <section className="mt-8" aria-label="Keywords">
          <LandingSectionHeading>Keywords</LandingSectionHeading>
          <ul className="mt-3 flex flex-wrap gap-2">
            {def.keywords.map((keyword) => (
              <li
                key={keyword}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs font-bold text-white/60"
              >
                {keyword}
              </li>
            ))}
          </ul>
        </section>

        {/* the studio CTA — the reference's "Make your next creation." */}
        <section className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6">
          <h3 className="text-sm font-black tracking-tight text-violet-100">Make your next creation.</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Every prompt on this page runs in this clone&apos;s studio: paste it in, watch the free
            preview, and confirm for one credit. The polish button rewrites a rough idea into a
            tighter prompt before you spend anything.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={STUDIO_PATH}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              Open the studio
            </Link>
            <Link
              href="/features/text-to-3d"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              How text-to-3D works
            </Link>
          </div>
        </section>

        {/* optimization tips */}
        <section className="mt-8" aria-label="Prompt optimization tips">
          <LandingSectionHeading>Prompt optimization tips</LandingSectionHeading>
          <div className="mt-3 space-y-3">
            {def.notes.map((note) => (
              <div key={note.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-white/85">
                  <Lightbulb className="size-3.5 text-amber-300/70" aria-hidden="true" />
                  {note.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{note.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* more ideas */}
        <section className="mt-8" aria-label="More ideas to explore">
          <LandingSectionHeading>More ideas to explore</LandingSectionHeading>
          <ul className="mt-3 flex flex-wrap gap-2">
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

        <div className="mt-10">
          <LandingClosingBand
            headline="Run it, then make it yours"
            body={`${PROMPT_CENSUS.written} of this library's ${PROMPT_CENSUS.total} routes carry prompts this clone actually wrote — every claim on them is checkable in the studio.`}
            cta={{ label: "Open the studio", href: STUDIO_PATH }}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

/** The honest not-reproduced page for a community route. */
export function PromptCommunityPage({ entry }: { entry: PromptEntry }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <LandingTopBar label="3D Prompts" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* head */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-bold text-white/40">
          <Link href="/3d-prompts" className="transition-colors hover:text-white">
            All prompts
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/60">Community prompt</span>
        </nav>
        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{entry.title}</h1>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/30">
          Route /3d-prompts/{entry.slug} — kept for reference-route parity
        </p>

        {/* the banner */}
        <section
          aria-label="Prompt status"
          className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] p-5"
        >
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70">
            <FileText className="size-3.5" aria-hidden="true" />
            COMMUNITY PROMPT — NOT REPRODUCED HERE
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">
            This route is one of the reference site&apos;s community prompt entries, and nothing on
            this page pretends otherwise.
          </p>
        </section>

        {/* the honest body */}
        <div className="mt-8 space-y-4">
          <p className="text-sm leading-relaxed text-white/60">
            On the reference site, this URL serves a community submission: a prompt somebody ran
            through a third-party chat model to build a 3D project, published with their own
            screenshots, their own external attribution, and a date. This clone has no community
            gallery, no submission flow, and no third-party models — and it does not reproduce the
            reference&apos;s community content. The route exists because parity is the rule; the
            page you are reading is what honesty requires instead of a fake.
          </p>
          <p className="text-sm leading-relaxed text-white/60">
            What is real one click away: {PROMPT_CENSUS.written} prompt pages this clone wrote for
            its own studio — original prompts with craft notes, each one runnable in the
            text-to-3D pipeline that ships in this codebase. The nearest of them are linked below.
          </p>
        </div>

        {/* the reference-index facts */}
        <p className="mt-8 flex items-start gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 font-mono text-xs leading-relaxed text-white/55">
          <MinusCircle className="mt-0.5 size-3.5 shrink-0 text-white/40" aria-hidden="true" />
          <span>
            On the reference site: a community prompt entry
            {entry.models.length > 0 ? ` indexed under ${entry.models.join(" + ")}` : ""}. Here: one
            of {PROMPT_CENSUS.community} routes served honestly as not-reproduced, against{" "}
            {PROMPT_CENSUS.written} prompts this clone actually wrote.
          </span>
        </p>

        {/* nearest real */}
        <section className="mt-10">
          <LandingSectionHeading>Use instead</LandingSectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "A written character prompt", href: "/3d-prompts/kana-pixel-rabbit-archer" },
              {
                label: "A written prop prompt",
                href: "/3d-prompts/corporate-interceptor-drone-asset-2095176360238915978",
              },
              {
                label: "A written environment prompt",
                href: "/3d-prompts/ancient-temple-above-a-glowing-canyon-2095012880383099339",
              },
              { label: "All prompts", href: "/3d-prompts" },
              { label: "The studio", href: STUDIO_PATH },
            ].map((link) => (
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

        <div className="mt-10">
          <LandingClosingBand
            headline="The prompts that do run here"
            body="The written set is one click away — copy a prompt, paste it into the studio, and watch the free preview before a single credit moves."
            cta={{ label: "Open the studio", href: STUDIO_PATH }}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
