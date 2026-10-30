import Link from "next/link";

import {
  LandingClosingBand,
  LandingFooter,
  LandingSectionHeading,
  LandingTopBar,
} from "@/components/hyper3d/landing/landing-shared";
import { JsonLd } from "@/components/hyper3d/json-ld";
import { STUDIO_PATH } from "@/lib/studio-path";
import type { PromptHubInfo } from "@/lib/prompts-types";
import { PROMPT_CENSUS, findPromptEntry } from "@/lib/prompts-registry";
import { promptHubJsonLd } from "@/lib/schema-org";
import { HUB_PAGE_SIZE } from "@/lib/prompts-registry";

/**
 * Model-hub renderer for /3d-prompts/models/<model>(/<page>) (t69).
 *
 * The reference's hubs index its community prompts by the third-party
 * chat model they were written FOR (GPT-6 Astra, Claude Opus 5.5,
 * Kimi K3 …). This clone's generator is its own pipeline, so the hub
 * exists for route parity and says so in its banner; the member routes
 * are listed with honest status rows — 24 per page, the reference's own
 * pagination math — and link to the same honest detail pages the main
 * catalog serves. No community card content is reproduced.
 */

function HubPaginationNav({ hub, page }: { hub: PromptHubInfo; page: number }) {
  if (hub.pages <= 1) return null;
  const href = (n: number) => (n === 1 ? `/3d-prompts/models/${hub.slug}` : `/3d-prompts/models/${hub.slug}/${n}`);
  return (
    <nav aria-label={`${hub.name} hub pages`} className="mt-8 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          Prev
        </Link>
      ) : null}
      {Array.from({ length: hub.pages }, (_, i) => i + 1).map((n) => (
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
      {page < hub.pages ? (
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

/** One member row — title, status, and the honest one-liner. */
function MemberRow({ slug }: { slug: string }) {
  const entry = findPromptEntry(slug);
  if (!entry) return null;
  const written = entry.family === "written";
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <Link
        href={`/3d-prompts/${entry.slug}`}
        className="text-sm font-bold text-white/80 transition-colors hover:text-violet-200"
      >
        {entry.title}
      </Link>
      {written ? (
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
          RUNS HERE
        </span>
      ) : (
        <span className="rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/55">
          NOT REPRODUCED
        </span>
      )}
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-white/30">
        {written ? "Written prompt" : "Community route"}
      </span>
    </li>
  );
}

export function PromptHubView({
  hub,
  page,
  memberSlugs,
}: {
  hub: PromptHubInfo;
  page: number;
  /** The member slugs for THIS page (already sliced by the route). */
  memberSlugs: string[];
}) {
  const jsonLd = promptHubJsonLd(hub);
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
          <span className="text-white/60">Models</span>
        </nav>
        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {hub.name} 3D Prompts
        </h1>
        {page > 1 ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/30">
            Page {page} of {hub.pages}
          </p>
        ) : null}

        {/* the honest banner */}
        <section
          aria-label="Hub status"
          className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] p-5"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
            REFERENCE-ONLY TAXONOMY — ROUTE PARITY
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">
            {hub.name} is one of the third-party chat models the reference&apos;s community prompts
            were written for. This clone&apos;s generator is its own pipeline — it does not run
            {hub.name.startsWith("GPT") ? " GPT" : hub.name.startsWith("Claude") ? " Claude" : hub.name.startsWith("Kimi") ? " Kimi" : " that"} — so this hub is a parity route, not a filter of this clone&apos;s prompts.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/50">
            The reference claims {hub.claimed} community entries under this model; its static
            surface serves all {hub.claimed}, which this registry mirrors exactly. None of their
            prompts, screenshots, or attribution is reproduced — every member route below leads to
            the same honest pages the main catalog serves, and the {PROMPT_CENSUS.written} prompts
            this clone wrote are mixed into the same catalog.
          </p>
        </section>

        {/* the member rows */}
        <section className="mt-8" aria-label={`${hub.name} prompt routes`}>
          <LandingSectionHeading>
            {hub.name} / 3D prompt examples
          </LandingSectionHeading>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            {hub.claimed} member routes · {hub.pages} page{hub.pages > 1 ? "s" : ""} ·{" "}
            {HUB_PAGE_SIZE} per page (the reference&apos;s own pagination math).
          </p>
          <ul className="mt-4 space-y-2">
            {memberSlugs.map((slug) => (
              <MemberRow key={slug} slug={slug} />
            ))}
          </ul>
          <HubPaginationNav hub={hub} page={page} />
        </section>

        {/* the real destinations */}
        <section className="mt-10 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6">
          <h3 className="text-sm font-black tracking-tight text-violet-100">
            The prompts that actually run here
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            This clone&apos;s {PROMPT_CENSUS.written} written prompts run in its own studio — text
            and image modes, free previews, a 1-credit confirm, six export formats. None of them
            needs a third-party chat model.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/3d-prompts"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              All prompts
            </Link>
            <Link
              href={STUDIO_PATH}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Open the studio
            </Link>
          </div>
        </section>

        <div className="mt-10">
          <LandingClosingBand
            headline="Model names are theirs; the studio is here"
            body="The reference's taxonomy belongs to its community feed. What runs in this codebase is one pipeline away — and every claim about it is checkable."
            cta={{ label: "Open the studio", href: STUDIO_PATH }}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
