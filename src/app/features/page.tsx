import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { FEATURE_GROUPS, FEATURE_PAGES } from "@/lib/features";
import { STATUS_CHIP_CLASS, STATUS_LABEL, statusOrder } from "@/components/hyper3d/features/status";
import { familyMetadata } from "@/lib/seo";

/**
 * /features index — the reference's "Features Matrix" page (recon
 * 2026-10-29: "AI 3D Features for Image to 3D and Creative Pipelines",
 * core features + supporting tools grid, "Start for free" CTA). Here each
 * card carries the honest clone-status chip.
 */
export const metadata: Metadata = {
  title: "Features — AI 3D features for image to 3D and creative pipelines",
  description:
    "Explore this Hyper3D clone's features: text-to-3D, image-to-3D, MCP agent access, and the OmniCraft toolbag — each page honest about what is live.",
  ...familyMetadata({ title: "Features — AI 3D features for image to 3D and creative pipelines", description: "Explore this Hyper3D clone's features: text-to-3D, image-to-3D, MCP agent access, and the OmniCraft toolbag — each page honest about what is live.", path: "/features" }),
};

export default function FeaturesIndexPage() {
  const live = FEATURE_PAGES.filter((p) => p.status === "live").length;

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
        <h1 className="text-sm font-bold text-white">Features</h1>
        <span className="ml-auto rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
          {live} of {FEATURE_PAGES.length} features live in this clone
        </span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
            Features matrix — AI 3D for image to 3D and creative pipelines
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Explore the feature surfaces of this Hyper3D clone: text-to-3D and image-to-3D
            generation, agent access over MCP, and the OmniCraft browser toolbag — every page
            honest about what is live, partial, or reference-only.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              Start for free
            </Link>
            <Link
              href="/workspace/omnicraft"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Open the toolbag
            </Link>
          </div>
        </section>

        {FEATURE_GROUPS.map((group) => (
          <section key={group.id} className="mt-12">
            <h3 className="text-xl font-black tracking-tight sm:text-2xl">{group.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{group.intro}</p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/features/${page.slug}`}
                    className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-400/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={
                          page.status === "reference-only"
                            ? "text-sm font-bold text-white/55"
                            : "text-sm font-bold text-white"
                        }
                      >
                        {page.name}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${STATUS_CHIP_CLASS[statusOrder(page.status)]}`}
                        title={page.statusChip}
                      >
                        {STATUS_LABEL[page.status]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/45">{page.indexBlurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-violet-300">
                      Read more →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        The reference&apos;s features index links marketing pages; this clone&apos;s matrix links the same
        structure — with each feature&apos;s real status stated on the card and the page itself.
      </footer>
    </div>
  );
}
