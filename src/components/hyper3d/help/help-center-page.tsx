import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, MinusCircle, XCircle } from "lucide-react";

import { HelpSearch, type HelpSearchItem } from "@/components/hyper3d/help/help-search";
import type { HelpArticleDef, HelpStatus } from "@/lib/help-types";
import { HELP_CATEGORIES, HELP_ARTICLES, POPULAR_HELP_SLUGS, helpArticlesByCategory } from "@/lib/help";
import { cn } from "@/lib/utils";
import { helpIndexJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * /help — the Help Center index, mirroring the reference's anatomy (recon
 * 2026-10-30 of hyper3d.ai/help): a hero line, a working search box, a
 * "Popular articles" band, "Browse by topic" with the six category cards,
 * and the closing support block. The reference's block is "Live Chat
 * Support"; this clone's honest equivalent states there is no live chat
 * and routes to the support article — a fake chat window would be a lie
 * with a timeout, so the block tells the truth instead.
 */

const STATUS_ICON: Record<HelpStatus, React.ComponentType<{ className?: string }>> = {
  live: CheckCircle2,
  partial: MinusCircle,
  "not-in-clone": XCircle,
};

const STATUS_CHIP: Record<HelpStatus, string> = {
  live: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  partial: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  "not-in-clone": "border-white/20 bg-white/[0.05] text-white/60",
};

const STATUS_LABEL: Record<HelpStatus, string> = {
  live: "WORKS HERE",
  partial: "PARTIAL HERE",
  "not-in-clone": "NOT IN THIS CLONE",
};

function ArticleRow({ article }: { article: HelpArticleDef }) {
  const Icon = STATUS_ICON[article.status];
  return (
    <li>
      <Link
        href={`/help/articles/${article.slug}`}
        className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
      >
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            article.status === "live" && "text-emerald-400/80",
            article.status === "partial" && "text-amber-400/80",
            article.status === "not-in-clone" && "text-white/40",
          )}
          aria-hidden="true"
        />
        <span className="flex-1">
          <span className="block text-sm font-bold text-white/85 group-hover:text-violet-100">
            {article.title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-white/50">
            {article.description}
          </span>
        </span>
        <span
          className={cn(
            "hidden shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold sm:inline-flex",
            STATUS_CHIP[article.status],
          )}
        >
          {STATUS_LABEL[article.status]}
        </span>
      </Link>
    </li>
  );
}

export function HelpCenterPage() {
  const searchItems: HelpSearchItem[] = HELP_ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    categorySlug: a.category,
    categoryName: HELP_CATEGORIES.find((c) => c.slug === a.category)?.name ?? a.category,
    status: a.status,
  }));

  const popular = POPULAR_HELP_SLUGS.map((slug) => HELP_ARTICLES.find((a) => a.slug === slug)).filter(
    (a): a is HelpArticleDef => Boolean(a),
  );

  const liveCount = HELP_ARTICLES.filter((a) => a.status === "live").length;
  const partialCount = HELP_ARTICLES.filter((a) => a.status === "partial").length;
  const absentCount = HELP_ARTICLES.filter((a) => a.status === "not-in-clone").length;

  // t67: breadcrumb + CollectionPage on the help center index.
  const jsonLd = helpIndexJsonLd();

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
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
        <h1 className="text-sm font-bold text-white">Help Center</h1>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {/* hero */}
        <section className="text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
            The answers for your questions about this workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {HELP_ARTICLES.length} articles across six topics, each stating the codebase&apos;s
            real behavior: {liveCount} describe things that fully work here, {partialCount} partial
            surfaces, and {absentCount} honest absences with the nearest real path named.
          </p>
        </section>

        {/* search */}
        <section aria-label="Search articles" className="mt-8">
          <HelpSearch items={searchItems} />
        </section>

        {/* popular articles */}
        <section className="mt-12">
          <h3 className="text-lg font-black tracking-tight sm:text-xl">Popular articles</h3>
          <ul className="mt-4 space-y-2">
            {popular.map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
          </ul>
        </section>

        {/* browse by topic */}
        <section className="mt-12">
          <h3 className="text-lg font-black tracking-tight sm:text-xl">Browse by topic</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map((category) => {
              const articles = helpArticlesByCategory(category.slug);
              const live = articles.filter((a) => a.status === "live").length;
              return (
                <li key={category.slug}>
                  <Link
                    href={`/help/${category.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
                  >
                    <span className="text-sm font-black tracking-tight text-white group-hover:text-violet-100">
                      {category.name}
                    </span>
                    <span className="mt-2 flex-1 text-xs leading-relaxed text-white/50">
                      {category.blurb}
                    </span>
                    <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                      {articles.length} {articles.length === 1 ? "article" : "articles"} ·{" "}
                      {live} live
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* support block — the reference's "Live Chat Support", honestly */}
        <section className="mt-12 rounded-2xl border border-white/12 bg-white/[0.03] p-6 text-center sm:p-8">
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="size-4 text-white/50" aria-hidden="true" />
            <h3 className="text-lg font-black tracking-tight">Support</h3>
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            There is no live chat behind this clone — no widget, no queue, no agent on the other
            end. The honest support surfaces are these articles, the legal pages, and the status
            lines on every feature, style and use-case page.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/help/articles/how-to-get-support-from-hyper3d"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              How support works here
            </Link>
            <Link
              href="/legal/terms"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              Terms of service
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Help articles answer with the codebase&apos;s real behavior — works here, partial here, or
        not in this clone. No middle ground.
      </footer>
    </div>
  );
}
