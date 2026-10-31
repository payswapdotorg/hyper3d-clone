import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, XCircle } from "lucide-react";

import {
  CONVERTER_INDEX,
  converterIndexGroups,
  viewerIndexFormats,
} from "@/lib/tools-index-content";
import { converterCensus } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

/**
 * The two /tools index pages (t64): the honest converter matrix
 * (/tools/converter — all 178 pairs, status-colored, grouped by source
 * format) and the honest viewer list (/tools/viewer — 15 formats).
 * Visual family: the clone's dark studio styling, same as tool-page.tsx.
 *
 * The census numbers in the header are computed from the registry, so
 * they cannot drift from the pages they summarize.
 */

const PAIR_CHIP: Record<string, string> = {
  "task-export": "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200/90 hover:bg-emerald-400/[0.12]",
  generative: "border-amber-400/30 bg-amber-400/[0.06] text-amber-200/90 hover:bg-amber-400/[0.12]",
  "not-here": "border-white/10 bg-white/[0.03] text-white/50 hover:border-rose-400/40 hover:text-rose-200/80",
};

const STATUS_ROW: Record<string, { label: string; className: string }> = {
  live: { label: "LIVE — local", className: "text-emerald-300" },
  "not-here": { label: "not here", className: "text-white/40" },
};

function IndexTopBar({ label, back }: { label: string; back: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
      <Link
        href={back}
        className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Studio
      </Link>
      <span className="text-white/20" aria-hidden="true">
        /
      </span>
      <h1 className="text-sm font-bold text-white">{label}</h1>
    </header>
  );
}

function CtaBand({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6 text-center sm:p-8">
      <h3 className="text-lg font-black tracking-tight sm:text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">{body}</p>
      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}

export function ConverterIndexView() {
  const groups = converterIndexGroups();
  const census = converterCensus();
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <IndexTopBar label="Converter matrix" back="/" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
            {CONVERTER_INDEX.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {CONVERTER_INDEX.subline}
          </p>
        </section>

        {/* the honest census */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/35">
            {CONVERTER_INDEX.censusIntro}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
              <p className="flex items-center gap-1.5 text-2xl font-black text-emerald-300">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                {census["task-export"]}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">pairs run for real</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
                Both sides among the six export formats — the live Format Convertor re-exports
                your generated tasks.
              </p>
            </div>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
              <p className="flex items-center gap-1.5 text-2xl font-black text-amber-300">
                <Sparkles className="size-5" aria-hidden="true" />
                {census.generative}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">pairs have a generative path</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
                Image in, generation, real export out — labeled as generation, not conversion.
              </p>
            </div>
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4">
              <p className="flex items-center gap-1.5 text-2xl font-black text-rose-300">
                <XCircle className="size-5" aria-hidden="true" />
                {census["not-here"]}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">pairs do not exist here</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
                No arbitrary upload, no CAD, no formats beyond the six — each page says why.
              </p>
            </div>
          </div>
        </section>

        {/* the matrix, grouped by source format */}
        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">
            All 178 pairs, by source format
          </h3>
          <div className="mt-6 space-y-6">
            {groups.map((group) => (
              <div
                key={group.from}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="text-sm font-black tracking-tight">
                  From {group.fromName}
                  <span className="ml-2 text-[11px] font-bold text-white/35">
                    {group.pairs.length} pair{group.pairs.length === 1 ? "" : "s"}
                  </span>
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.pairs.map((pair) => (
                    <li key={pair.href}>
                      <Link
                        href={pair.href}
                        title={pair.status}
                        className={cn(
                          "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-bold transition-colors",
                          PAIR_CHIP[pair.status],
                        )}
                      >
                        {pair.fromName} → {pair.toName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <CtaBand
          title="Start where it is real"
          body="The Format Convertor is the live tool behind every green pair — your generated tasks, six real formats, previews before export."
          href="/workspace/omnicraft/formatcon"
          label="Open the Format Convertor"
        />
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        The matrix reproduces the reference&apos;s converter routes with computed, honest statuses —
        green runs, amber generates, grey does not exist here.
      </footer>
    </div>
  );
}

export function ViewerIndexView() {
  const formats = viewerIndexFormats();
  const liveCount = formats.filter((f) => f.status === "live").length;
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <IndexTopBar label="Viewer formats" back="/tools/converter" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
            {CONVERTER_INDEX.viewerTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {CONVERTER_INDEX.viewerSubline}
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/35">
            The honest count
          </p>
          <p className="mt-3 text-sm font-bold text-white/85">
            {liveCount} of {formats.length} formats open in the local Model Viewer — the other{" "}
            {formats.length - liveCount} pages say why they do not.
          </p>
        </section>

        <section className="mt-12">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">
            All 15 viewer formats
          </h3>
          <ul className="mt-5 space-y-2">
            {formats.map((f) => (
              <li key={f.href}>
                <Link
                  href={f.href}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-violet-400/40"
                >
                  <span className="text-sm font-bold text-white/80">{f.name}</span>
                  <span
                    className={cn(
                      "text-[11px] font-black uppercase tracking-wider",
                      STATUS_ROW[f.status]?.className,
                    )}
                  >
                    {STATUS_ROW[f.status]?.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <CtaBand
          title="Inspect a GLB right now"
          body="The live Model Viewer parses GLB/GLTF in your browser — orbit, material modes, live triangle count. The file never leaves your device."
          href="/workspace/omnicraft/viewer"
          label="Open the Model Viewer"
        />
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Viewer pages reproduce the reference&apos;s routes with honest statuses — GLB and GLTF are
        live and local; everything else says plainly that it is not.
      </footer>
    </div>
  );
}
