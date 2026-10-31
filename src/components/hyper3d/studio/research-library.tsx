"use client";

/**
 * Research library (t72) — the reference's /workspace/rodin/tab/research
 * content area, probed live 2026-10-31 (agent-walked, DOM-extracted):
 * one card per published paper (CLAY 2024, CAST 2025), each a
 * 800×320 flex-row glass card — media carousel left (358px, rounded-18,
 * prev/next arrows), badge chips top-right, copy block at left-47%
 * (title, one-line note, Featured/year/venue chips, abstract with
 * Show More/Less), and a links row (YouTube dialog, Bilibili dialog,
 * PDF → ACM DOI in a new tab).
 *
 * Honest rendering: the figure slides are labeled placeholder art (the
 * clone does not copy the reference's CDN images); the video dialogs
 * embed the same public YouTube/Bilibili videos; the PDF buttons open
 * the papers' real ACM Digital Library pages. Titles, venues, awards,
 * links, and quoted abstracts come from src/lib/research-papers.ts.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Play, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  RESEARCH_PAPERS,
  researchBilibiliEmbed,
  researchYouTubeEmbed,
  type ResearchPaper,
} from "@/lib/research-papers";

/* Deterministic per-paper art hues so each carousel keeps a stable
   identity without shipping any reference imagery. */
const PAPER_HUES: Record<string, string> = {
  clay: "#8a9bf0",
  cast: "#5fb5a5",
};

function PaperCard({ paper }: { paper: ResearchPaper }) {
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [video, setVideo] = useState<"youtube" | "bilibili" | null>(null);
  const hue = PAPER_HUES[paper.id] ?? "#8a9bf0";

  const prev = () => setSlide((s) => (s - 1 + paper.figures.length) % paper.figures.length);
  const next = () => setSlide((s) => (s + 1) % paper.figures.length);

  return (
    <article
      className="rodin-research-card relative flex w-full flex-row items-center gap-5 rounded-[24px] bg-[rgba(255,255,255,0.05)] p-2 backdrop-blur-[50px]"
      aria-label={`Research paper: ${paper.title}`}
    >
      {/* media carousel — the reference cycles the paper's figure set */}
      <div className="rodin-research-card-media relative h-[304px] w-[358px] shrink-0 overflow-hidden rounded-[18px] max-sm:h-[220px] max-sm:w-full">
        {paper.figures.map((figure, i) => (
          <div
            key={figure}
            aria-hidden={i !== slide}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300",
              i === slide ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            style={{
              background: `linear-gradient(150deg, ${hue}30 0%, rgba(23,24,28,0.9) 60%), radial-gradient(ellipse at 30% 20%, ${hue}26, transparent 65%)`,
            }}
          >
            <span className="text-lg font-black tracking-[0.35em] text-white/30">FIG</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-4 py-1.5 font-mono text-xs text-white/70">
              {figure}
            </span>
          </div>
        ))}
        {/* slide counter */}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[11px] text-white/70">
          {slide + 1}/{paper.figures.length}
        </span>
        <button
          type="button"
          aria-label="Previous research image"
          onClick={prev}
          disabled={paper.figures.length < 2}
          className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Next research image"
          onClick={next}
          disabled={paper.figures.length < 2}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/80 transition-colors hover:bg-black/70 hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* badge chips — top-right, probed order */}
      <div className="absolute right-[12px] top-[12px] flex max-w-[52%] flex-row flex-wrap justify-end gap-1.5">
        {paper.badges.map((badge) => (
          <span
            key={badge}
            className={cn(
              "rounded-full px-2.5 py-1 text-[12px] font-semibold",
              badge.startsWith("SIGGRAPH")
                ? "bg-[#e8c66f]/20 text-[#e8c66f]"
                : "bg-white/8 text-white/70",
            )}
          >
            {badge}
          </span>
        ))}
      </div>

      {/* copy block — left-47% / w-[50.4%] on the reference card */}
      <div className="rodin-research-card-copy ml-1 flex h-[235px] w-full max-w-[52%] flex-col max-lg:max-w-none">
        <h3 className="pr-2 text-[17px] font-bold leading-snug text-white">{paper.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{paper.connectionNote}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          {paper.featured && (
            <span className="rounded-full bg-[#d2b6df]/20 px-2.5 py-1 text-[#d2b6df]">Featured</span>
          )}
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-white/70">{paper.year}</span>
          {paper.venue.map((v) => (
            <span key={v} className="rounded-full bg-white/8 px-2.5 py-1 text-white/70">
              {v}
            </span>
          ))}
        </div>
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/55">
          <span className="font-semibold text-white/70">Abstract — </span>
          {expanded ? paper.abstract : `${paper.abstract.slice(0, 180)}…`}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 w-fit text-left text-[12px] font-semibold text-[#d2b6df] transition-colors hover:text-white"
        >
          {expanded ? "Show Less" : "Show More ..."}
        </button>

        {/* links row — YouTube dialog · Bilibili dialog · PDF (new tab) */}
        <div className="mt-auto flex flex-row items-center gap-4">
          <button
            type="button"
            aria-label="Play research video on YouTube"
            onClick={() => setVideo("youtube")}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
          >
            <Play className="size-3.5" aria-hidden="true" /> YouTube
          </button>
          <button
            type="button"
            aria-label="Play research video on Bilibili"
            onClick={() => setVideo("bilibili")}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
          >
            <Play className="size-3.5" aria-hidden="true" /> Bilibili
          </button>
          <a
            href={paper.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open research PDF"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
          >
            <FileText className="size-3.5" aria-hidden="true" /> PDF
          </a>
        </div>
      </div>

      {/* video dialog — the reference's own player modal shape */}
      {video && (
        <div
          className="fixed inset-0 z-[21020] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${paper.title} — video`}
          onClick={() => setVideo(null)}
        >
          <div
            className="rodin-research-video-dialog relative w-[min(960px,92vw)] overflow-hidden rounded-[24px] border border-white/12 bg-[#17181c] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <span className="truncate text-sm font-bold text-white">{paper.title}</span>
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setVideo(null)}
                className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={video === "youtube" ? researchYouTubeEmbed(paper) : researchBilibiliEmbed(paper)}
                title={`${paper.title} — ${video === "youtube" ? "YouTube" : "Bilibili"} video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export function ResearchLibrary() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-10 md:px-20" aria-label="Research library">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-[26px] font-bold leading-none text-white">RESEARCH</h2>
        <p className="text-sm text-white/50">
          Published papers behind the reference product — geometry, materials, and scene-level 3D.
        </p>
      </header>
      <div className="mt-6 flex flex-col gap-5">
        {RESEARCH_PAPERS.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </section>
  );
}
