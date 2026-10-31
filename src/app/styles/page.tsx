import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle } from "lucide-react";

import { STYLE_GROUPS, STYLE_PAGES, findStylePage } from "@/lib/styles";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { cn } from "@/lib/utils";
import { familyMetadata } from "@/lib/seo";

/**
 * /styles — the index ("Style Matrix", mirroring the reference index's
 * heading), with this clone's status chip per card and grouped bands
 * that name the honest delivery mode of each family.
 */
export const metadata: Metadata = {
  title: referenceTitle("/styles") ?? "AI 3D Style Generator Matrix",
  description: referenceDescription("/styles") ??
    "Explore AI 3D model generator pages by visual style — low poly, voxel, anime, photorealistic and more — each stating plainly what steers generation in this clone.",
  ...familyMetadata({ title: referenceCardTitle("/styles") ?? "AI 3D Style Generator Matrix", description: referenceDescription("/styles") ?? "Explore AI 3D model generator pages by visual style — low poly, voxel, anime, photorealistic and more — each stating plainly what steers generation in this clone.", path: "/styles" }),
};

export default function StylesIndexPage() {
  const liveCount = STYLE_PAGES.filter((p) => p.status === "live").length;
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
        <h1 className="text-sm font-bold text-white">Styles</h1>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">Style Matrix</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Free AI 3D style generator matrix. Start with the right visual style — {liveCount} of{" "}
            {STYLE_PAGES.length} styles steer generation here through real levers (prompt-steered
            geometry, flat parameter materials, real exports); the texture-dependent four say
            plainly where they stop.
          </p>
        </section>

        {STYLE_GROUPS.map((group) => (
          <section key={group.title} className="mt-10">
            <h3 className="text-lg font-black tracking-tight">{group.title}</h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.slugs.map((slug) => {
                const page = findStylePage(slug);
                if (!page) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/styles/${slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
                    >
                      <span className="flex items-center gap-2">
                        {page.status === "live" ? (
                          <CheckCircle2 className="size-4 text-emerald-400/80" aria-hidden="true" />
                        ) : (
                          <MinusCircle className="size-4 text-amber-400/80" aria-hidden="true" />
                        )}
                        <span className="text-sm font-black tracking-tight text-white group-hover:text-violet-100">
                          {page.name}
                        </span>
                        <span
                          className={cn(
                            "ml-auto rounded-full border px-2 py-0.5 text-[9px] font-bold",
                            page.status === "live"
                              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                              : "border-amber-400/25 bg-amber-400/10 text-amber-300",
                          )}
                        >
                          {page.statusChip}
                        </span>
                      </span>
                      <span className="mt-2 flex-1 text-xs leading-relaxed text-white/50">
                        {page.subline}
                      </span>
                      <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                        {page.status === "live"
                          ? "Prompt-steered + real exports"
                          : "Mesh real — look finishes in your DCC"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="mt-10 text-center text-xs leading-relaxed text-white/35">
          Styles steer the same generation the{" "}
          <Link href="/features" className="text-white/60 underline-offset-2 hover:underline">
            feature pages
          </Link>{" "}
          document, in the workflows the{" "}
          <Link href="/use-cases" className="text-white/60 underline-offset-2 hover:underline">
            use-case pages
          </Link>{" "}
          map — all under the{" "}
          <Link href="/legal/refund" className="text-white/60 underline-offset-2 hover:underline">
            refund policy
          </Link>
          &rsquo;s credit paths.
        </p>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Every style page states what actually steers generation in this clone — no exceptions.
      </footer>
    </div>
  );
}
