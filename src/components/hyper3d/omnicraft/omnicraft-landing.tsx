"use client";

/**
 * OmniCraft toolbag landing — the reference's nine-tool grid, honestly
 * labeled: live tools link to their real pages, the rest state plainly why
 * they are not part of this clone (DECISIONS.md #34 ethos — a dead-but-pretty
 * grid is worse than an honest one).
 */
import Link from "next/link";
import { ArrowLeft, Boxes, Cpu, Sparkles } from "lucide-react";
import { OMNICRAFT_TOOLS } from "@/lib/omnicraft";

export function OmniCraftLanding() {
  const live = OMNICRAFT_TOOLS.filter((t) => t.status === "live").length;

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
        <h1 className="text-sm font-bold text-white">OmniCraft｜Toolbag for 3D</h1>
        <span className="ml-auto rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
          {live} of {OMNICRAFT_TOOLS.length} tools live in this clone
        </span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            OmniCraft<span className="text-white/30">｜</span>Toolbag for 3D
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            Local-first 3D utilities around your models — skyboxes, conversions, inspection and vector extrusion,
            running in your browser wherever honestly possible. Add-On lets you use almost all Rodin features in DCC
            software.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OMNICRAFT_TOOLS.map((tool) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm font-bold ${tool.status === "live" ? "text-white" : "text-white/55"}`}>
                    {tool.name}
                  </span>
                  {tool.status === "live" ? (
                    tool.local ? (
                      <span
                        className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300"
                        title="Runs entirely in your browser — nothing is uploaded."
                      >
                        <Cpu className="size-2.5" aria-hidden="true" />
                        LOCAL
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-full border border-violet-400/25 bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">
                        <Sparkles className="size-2.5" aria-hidden="true" />
                        LIVE
                      </span>
                    )
                  ) : (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-bold text-white/35">
                      NOT IN CLONE
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">{tool.blurb}</p>
                {tool.status === "not-in-clone" && tool.note && (
                  <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-relaxed text-white/30">
                    {tool.note}
                  </p>
                )}
                {tool.status === "live" && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-violet-300">
                    Open tool →
                  </span>
                )}
              </>
            );
            return (
              <li key={tool.slug}>
                {tool.status === "live" ? (
                  <Link
                    href={`/workspace/omnicraft/${tool.slug}`}
                    className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-400/[0.06]"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4" title={tool.note}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        The reference&apos;s OmniCraft is a separate product with AI-powered tools; this clone ships the subset that
        can be real — every listed tool either works here or says honestly why it does not.
      </footer>
    </div>
  );
}

/** Honest panel for reference tools that are not part of this clone. */
export function NotInClonePanel({ name, note }: { name: string; note: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0f0f12] p-8 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#17181c]/80 p-6 text-center">
        <Boxes className="mx-auto size-10 text-white/25" aria-hidden="true" />
        <h1 className="mt-3 text-lg font-bold text-white/85">{name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/50">{note}</p>
        <p className="mt-4 text-xs text-white/35">
          The reference implements this in its separate toolbag — this clone does not pretend to.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/workspace/omnicraft"
            className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            ← Toolbag
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200 transition-colors hover:bg-violet-400/20"
          >
            Back to studio
          </Link>
        </div>
      </div>
    </div>
  );
}
