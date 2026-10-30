import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import type { HelpArticleDef, HelpCategoryDef, HelpStatus } from "@/lib/help-types";
import { HELP_CATEGORIES, HELP_STATUS_META } from "@/lib/help";
import { cn } from "@/lib/utils";
import { helpCategoryJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * Shared renderer for every /help/[category] hub — the reference's topic
 * page pattern: a topic heading with its blurb, then that topic's articles
 * as a list of question cards with this clone's three-way status chip.
 * The hub also names the other topics for cross-navigation, mirroring the
 * reference's "Browse by topic" persistence.
 */

const STATUS_META: Record<HelpStatus, { chip: string; icon: React.ComponentType<{ className?: string }> }> = {
  live: { chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
  partial: { chip: "border-amber-400/25 bg-amber-400/10 text-amber-300", icon: MinusCircle },
  "not-in-clone": { chip: "border-white/20 bg-white/[0.05] text-white/60", icon: XCircle },
};

function StatusChip({ status }: { status: HelpStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold",
        meta.chip,
      )}
      title={HELP_STATUS_META[status].label}
    >
      <Icon className="size-3" aria-hidden="true" />
      {HELP_STATUS_META[status].chip}
    </span>
  );
}

export function HelpCategoryPage({
  category,
  articles,
}: {
  category: HelpCategoryDef;
  articles: HelpArticleDef[];
}) {
  const liveCount = articles.filter((a) => a.status === "live").length;
  const partialCount = articles.filter((a) => a.status === "partial").length;
  const absentCount = articles.filter((a) => a.status === "not-in-clone").length;
  // t67: breadcrumb + CollectionPage for the topic hubs.
  const jsonLd = helpCategoryJsonLd(category);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/help"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Help Center
        </Link>
        <span className="text-white/20" aria-hidden="true">
          /
        </span>
        <h1 className="text-sm font-bold text-white">{category.name}</h1>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {/* topic hero */}
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{category.name}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {category.blurb}
          </p>
          <p className="mt-4 text-xs font-bold text-white/35">
            {articles.length} {articles.length === 1 ? "article" : "articles"} · {liveCount} work
            here · {partialCount} partial · {absentCount} not in this clone
          </p>
        </section>

        {/* article list */}
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/help/articles/${article.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="text-sm font-black tracking-tight text-white group-hover:text-violet-100">
                    {article.title}
                  </span>
                  <StatusChip status={article.status} />
                </span>
                <span className="mt-2 flex-1 text-xs leading-relaxed text-white/50">
                  {article.answer}
                </span>
                <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  Updated {article.updated}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* other topics */}
        <section className="mt-12">
          <h3 className="text-lg font-black tracking-tight">Other topics</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {HELP_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/help/${c.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/70 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Every article in this hub states the codebase&apos;s real behavior — no exceptions.
      </footer>
    </div>
  );
}
