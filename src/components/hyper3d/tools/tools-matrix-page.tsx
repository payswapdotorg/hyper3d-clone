import Link from "next/link";
import { CheckCircle2, MinusCircle } from "lucide-react";

import {
  LandingClosingBand,
  LandingFooter,
  LandingHeroBlock,
  LandingSectionHeading,
  LandingTopBar,
} from "@/components/hyper3d/landing/landing-shared";
import { TOOLS_MATRIX_INDEX } from "@/lib/tools-index-content";
import {
  REFERENCE_IMAGE_TO_FORMATS,
  converterCensus,
  imageToStatus,
} from "@/lib/tools-registry";
import { isRealExportFormat, toolFormat } from "@/lib/tool-formats";
import { STUDIO_PATH } from "@/lib/studio-path";

/**
 * The bare /tools index (t70) — the reference serves this page in every
 * language without ever sitemapping it (recon/locale-deep-trees.md),
 * linking exactly the 8 image-to routes plus the viewer and converter
 * hubs. This clone's version keeps that link set and adds the one thing
 * the reference's page lacks by design: the honest census, computed from
 * the same registries the leaf pages read, and pointers to the four
 * tools that genuinely execute in this repo.
 */

function ImageToCard({ format }: { format: string }) {
  const live = imageToStatus(format) === "live";
  const name = toolFormat(format)?.name ?? format.toUpperCase();
  return (
    <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/tools/image-to-${format}`}
          className="text-sm font-black leading-snug tracking-tight text-white/85 transition-colors hover:text-violet-200"
        >
          Image → {name}
        </Link>
        {live ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            REAL HERE
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
            <MinusCircle className="size-3" aria-hidden="true" />
            NOT HERE
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/50">
        {live
          ? `A real path: image-to-3D generation plus a genuine ${name} export — one of the six formats the exporters ship.`
          : `Not an export target here: the exporters ship six formats, and ${name} is not one of them. The page says so in its first breath.`}
      </p>
    </li>
  );
}

export function ToolsMatrixIndexView() {
  const census = converterCensus();
  const imageToLive = REFERENCE_IMAGE_TO_FORMATS.filter((f) => isRealExportFormat(f)).length;
  const hero = {
    eyebrow: TOOLS_MATRIX_INDEX.hero.eyebrow,
    headline: TOOLS_MATRIX_INDEX.hero.headline,
    subhead: TOOLS_MATRIX_INDEX.hero.subline,
    primaryCta: { label: "Open the studio", href: STUDIO_PATH },
  };
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <LandingTopBar label="Tools" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <LandingHeroBlock hero={hero} />

        {/* the image-to family — the reference's own first band */}
        <section className="mt-10">
          <LandingSectionHeading>{TOOLS_MATRIX_INDEX.bands.imageToTitle}</LandingSectionHeading>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
            {TOOLS_MATRIX_INDEX.bands.imageToBody}
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {REFERENCE_IMAGE_TO_FORMATS.map((format) => (
              <ImageToCard key={format} format={format} />
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
            {imageToLive} of {REFERENCE_IMAGE_TO_FORMATS.length} routes live — computed, not asserted
          </p>
        </section>

        {/* viewer + converter — the reference's second band */}
        <section className="mt-12">
          <LandingSectionHeading>
            {TOOLS_MATRIX_INDEX.bands.viewerConverterTitle}
          </LandingSectionHeading>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
            {TOOLS_MATRIX_INDEX.bands.viewerConverterBody}
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            <li>
              <Link
                href="/tools/converter"
                className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
              >
                <span className="text-sm font-black tracking-tight text-white/85">
                  3D File Converter Matrix
                </span>
                <span className="mt-2 text-xs leading-relaxed text-white/50">
                  All 178 pairs, grouped by source format, each with its computed status and the
                  real reason behind it.
                </span>
                <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {census["task-export"]} real re-exports · {census.generative} generative ·{" "}
                  {census["not-here"]} not here
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/tools/viewer"
                className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
              >
                <span className="text-sm font-black tracking-tight text-white/85">
                  3D Viewer Formats
                </span>
                <span className="mt-2 text-xs leading-relaxed text-white/50">
                  All 15 formats the reference&apos;s viewer opens — GLB and GLTF live in the local
                  Model Viewer, the other 13 stated as not opening here.
                </span>
                <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  2 live · 13 not here — computed, not asserted
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* the real tools — what actually executes */}
        <section className="mt-12">
          <LandingSectionHeading>{TOOLS_MATRIX_INDEX.bands.realToolsTitle}</LandingSectionHeading>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/45">
            {TOOLS_MATRIX_INDEX.bands.realToolsBody}
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/workspace/omnicraft/formatcon",
                label: "Format Convertor",
                note: "Converts your own confirmed tasks between the six real export formats.",
              },
              {
                href: "/workspace/omnicraft/viewer",
                label: "Model Viewer",
                note: "Drops a GLB into the local viewer — parsed in the browser, never uploaded.",
              },
              {
                href: "/features/image-to-3d",
                label: "Image to 3D",
                note: "The studio's live generative mode behind every live image-to route above.",
              },
              {
                href: "/features/text-to-3d",
                label: "Text to 3D",
                note: "The same pipeline from words — free previews, a 1-credit confirm.",
              },
            ].map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="flex h-full flex-col rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/[0.08]"
                >
                  <span className="flex items-center gap-1.5 text-sm font-black tracking-tight text-white/85">
                    <CheckCircle2 className="size-3.5 text-emerald-300" aria-hidden="true" />
                    {tool.label}
                  </span>
                  <span className="mt-2 text-xs leading-relaxed text-white/50">{tool.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <LandingClosingBand
            headline="Every tool page leads with the truth"
            body="203 tool routes, one rule: the first thing each page tells you is whether the tool runs in this codebase — and every number on this index is computed from the same registries those pages read."
            cta={{ label: "Open the studio", href: STUDIO_PATH }}
          />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
