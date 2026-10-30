import Link from "next/link";
import { CheckCircle2, Lightbulb, MinusCircle, Youtube } from "lucide-react";

import { CopyPromptButton } from "@/components/hyper3d/landing/copy-prompt-button";
import type { PromptsPageDef, PromptExample } from "@/lib/landing-types";
import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "./landing-shared";
import { JsonLd } from "@/components/hyper3d/json-ld";
import {
  PROMPT_CENSUS,
  PROMPT_HUBS,
  PROMPT_PAGE_COUNT,
  PROMPT_VIDEO_REFS,
  type PromptEntry,
} from "@/lib/prompts-registry";
import { promptsIndexJsonLd, promptsIndexPageJsonLd } from "@/lib/schema-org";

/**
 * /3d-prompts index renderer (t62 content absorbed by t69). Mirrors the
 * reference's section stack — hero, #prompt-library card grid with
 * pagination, the creator-review curation, the model-hub rail, the
 * studio's own example prompts ("Integrate 3D generation into your daily
 * work"), the three how-to steps, the honest note, the closing band.
 * Pages 2+ drop everything but the grid, exactly as the reference's do.
 *
 * Catalog cards are honest at both tiers: written routes show this
 * clone's own blurb and a RUNS HERE chip; community routes show the
 * reference's card title as route data plus a NOT REPRODUCED chip —
 * never a fabricated description, author, or date. Ordering is
 * written-first (the registry's honest order), not the reference's
 * date-sorted feed, and the page says so.
 */

const CATEGORY_LABEL: Record<PromptExample["category"], string> = {
  characters: "Characters",
  props: "Props & products",
  environments: "Environments",
  stylized: "Stylized",
};

/* ------------------------------------------------------------------ */
/* Catalog cards (the 403-route library)                              */
/* -------------------------------------------------------------------- */

function CatalogCard({ entry }: { entry: PromptEntry }) {
  const written = entry.family === "written";
  return (
    <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/3d-prompts/${entry.slug}`}
          className="text-sm font-black leading-snug tracking-tight text-white/85 transition-colors hover:text-violet-200"
        >
          {entry.title}
        </Link>
        {written ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            RUNS HERE
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
            <MinusCircle className="size-3" aria-hidden="true" />
            NOT REPRODUCED
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/50">
        {written
          ? entry.article!.blurb
          : "A community prompt entry on the reference site — kept as an honestly marked route; no prompt, author, or screenshot is reproduced here."}
      </p>
      <p className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
        {written ? `Written prompt · ${entry.article!.keywords[0]}` : `Reference route${entry.models.length > 0 ? ` · ${entry.models[0]}${entry.models.length > 1 ? " +" : ""}` : ""}`}
      </p>
    </li>
  );
}

function CatalogGrid({ entries }: { entries: PromptEntry[] }) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <CatalogCard key={entry.slug} entry={entry} />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination (17 pages, the reference's own math)                     */
/* -------------------------------------------------------------------- */

function PaginationNav({ page }: { page: number }) {
  const href = (n: number) => (n === 1 ? "/3d-prompts" : `/3d-prompts/${n}`);
  const numbers = Array.from({ length: PROMPT_PAGE_COUNT }, (_, i) => i + 1);
  return (
    <nav aria-label="Prompt library pages" className="mt-8 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          Prev
        </Link>
      ) : null}
      {numbers.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-2 text-xs font-bold text-violet-100"
              : "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
          }
        >
          {n}
        </Link>
      ))}
      {page < PROMPT_PAGE_COUNT ? (
        <Link
          href={href(page + 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* The reference's external curation + the model-hub rail              */
/* -------------------------------------------------------------------- */

function VideoRefsBand() {
  return (
    <section className="mt-12">
      <LandingSectionHeading>See the prompts become working 3D</LandingSectionHeading>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
        The reference&apos;s own creator-review curation, kept as external links — videos about
        third-party chat models, not this clone&apos;s engine, and not ours to claim.
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROMPT_VIDEO_REFS.map((video) => (
          <li key={video.url} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">{video.model}</p>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-start gap-1.5 text-sm font-bold leading-snug text-white/85 transition-colors hover:text-violet-200"
            >
              <Youtube className="mt-0.5 size-4 shrink-0 text-red-400/70" aria-hidden="true" />
              {video.title}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-white/45">{video.blurb}</p>
            <p className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
              {video.creator} · external
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HubRailBand() {
  return (
    <section className="mt-12">
      <LandingSectionHeading>3D prompts for games, worlds and simulations</LandingSectionHeading>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
        The reference indexes its community prompts by the third-party model they were written for —
        these are its eleven hubs, kept as parity routes and honestly inverted. This clone&apos;s
        prompts run in its own studio, not in a chat model.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PROMPT_HUBS.map((hub) => (
          <li key={hub.slug}>
            <Link
              href={`/3d-prompts/models/${hub.slug}`}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
            >
              <span className="text-sm font-black tracking-tight text-white/85">{hub.name}</span>
              <span className="mt-1 text-xs leading-relaxed text-white/45">
                The reference&apos;s {hub.claimed} community prompts filed under this model —
                route parity, honestly marked.
              </span>
              <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-violet-300/70">
                Hub route{hub.pages > 1 ? ` · ${hub.pages} pages` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The studio's own example prompts (the t62 content)                  */
/* -------------------------------------------------------------------- */

function StudioExampleCard({ example }: { example: PromptExample }) {
  return (
    <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black tracking-tight text-white/85">{example.title}</span>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
          {CATEGORY_LABEL[example.category]}
        </span>
      </div>
      <div className="mt-3 flex items-stretch gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-200/90">
          {example.prompt}
        </code>
        <CopyPromptButton prompt={example.prompt} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/50">
        <Lightbulb className="mr-1 inline size-3 text-amber-300/70" aria-hidden="true" />
        {example.why}
      </p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* The page renderers                                                   */
/* -------------------------------------------------------------------- */

/** Page 1 — the full stack (the reference's own section order). */
export function PromptsPageView({
  page,
  entries,
}: {
  page: PromptsPageDef;
  entries: PromptEntry[];
}) {
  const jsonLd = promptsIndexJsonLd(page.description, page.steps);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <LandingTopBar label="3D Prompts" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={page.hero} />

        {/* the library grid */}
        <section id="prompt-library" className="mt-10 scroll-mt-20">
          <LandingSectionHeading>3D prompt examples</LandingSectionHeading>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
            {PROMPT_CENSUS.total} routes — {PROMPT_CENSUS.written} prompts this clone wrote for its
            own studio (shown first), then the reference&apos;s community catalog, honestly marked.
            The reference orders its feed by date; this clone has no community dates and sorts by
            usefulness instead.
          </p>
          <CatalogGrid entries={entries} />
          <PaginationNav page={1} />
        </section>

        <VideoRefsBand />
        <HubRailBand />

        {/* the studio's own examples — the reference's "Integrate" band */}
        <section className="mt-12">
          <LandingSectionHeading>{page.featuredHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 lg:grid-cols-3">
            {page.featured.map((example) => (
              <StudioExampleCard key={example.title} example={example} />
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <LandingSectionHeading>{page.examplesHeading}</LandingSectionHeading>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.examples.map((example) => (
              <StudioExampleCard key={example.title} example={example} />
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

/** Pages 2+ — the grid and nothing else, exactly as the reference does. */
export function PromptIndexPageView({
  page,
  pageNumber,
  entries,
}: {
  page: PromptsPageDef;
  pageNumber: number;
  entries: PromptEntry[];
}) {
  const jsonLd = promptsIndexPageJsonLd(pageNumber, page.description);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <LandingTopBar label="3D Prompts" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <section id="prompt-library" className="scroll-mt-20">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
            3D PROMPTS / PAGE {pageNumber} OF {PROMPT_PAGE_COUNT}
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            3D prompt examples
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
            {PROMPT_CENSUS.total} routes across {PROMPT_PAGE_COUNT} pages — {PROMPT_CENSUS.written}{" "}
            written prompts first, then the reference&apos;s community catalog, honestly marked.
          </p>
          <CatalogGrid entries={entries} />
          <PaginationNav page={pageNumber} />
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
