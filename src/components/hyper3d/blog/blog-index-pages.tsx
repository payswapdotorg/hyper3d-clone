import Link from "next/link";
import { ChevronLeft, ChevronRight, Rss } from "lucide-react";

import type { BlogArticleDef, BlogCategory, BlogEntry } from "@/lib/blog-types";
import { BLOG_CENSUS, BLOG_PAGE_COUNT, BLOG_PAGE_SIZE } from "@/lib/blog-registry";
import { BLOG_CATEGORIES, findBlogCategory } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { blogIndexJsonLd, blogPageJsonLd, blogCategoryJsonLd } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

/**
 * Renderers for the blog front page, the twenty pagination pages, and the
 * twelve category hubs. The index mirrors the reference's anatomy (category
 * hub strip, featured cards, "All Articles" list with pagination) with the
 * clone's honesty contract on top: the census chips and the per-row status
 * dots say which routes carry articles and which are honestly marked.
 */

function FamilyDot({ family }: { family: BlogEntry["family"] }) {
  const meta = {
    written: "bg-emerald-400",
    "reference-news": "bg-white/40",
    "core-filler": "bg-amber-400/70",
    "off-scope": "bg-white/25",
    "game-filler": "bg-white/20",
  }[family];
  return <span className={cn("inline-block size-1.5 shrink-0 rounded-full", meta)} aria-hidden="true" />;
}

function familyLabel(family: BlogEntry["family"]): string {
  return {
    written: "Written here",
    "reference-news": "Reference news — not reproduced",
    "core-filler": "Real 3D topic — not written yet",
    "off-scope": "Off-scope SEO — not written",
    "game-filler": "Game-guide SEO — not reproduced",
  }[family];
}

function ArticleCard({ def }: { def: BlogArticleDef }) {
  const cat = findBlogCategory(def.category);
  return (
    <Link
      href={`/blog/${def.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/35 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2">
        <FamilyDot family="written" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
          {cat?.name ?? def.category}
        </span>
      </div>
      <h3 className="mt-2.5 text-sm font-black leading-snug tracking-tight text-white/90 transition-colors group-hover:text-violet-200">
        {def.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/50">{def.description}</p>
      <p className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-wider text-white/30">{def.date}</p>
    </Link>
  );
}

function CatalogRow({ entry }: { entry: BlogEntry }) {
  return (
    <li>
      <Link
        href={`/blog/${entry.slug}`}
        className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]"
      >
        <FamilyDot family={entry.family} />
        <span
          className={cn(
            "truncate text-sm",
            entry.family === "written" ? "font-bold text-white/85" : "text-white/45",
          )}
          title={familyLabel(entry.family)}
        >
          {entry.title}
        </span>
        {entry.family === "written" ? (
          <span className="ml-auto shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            WRITTEN
          </span>
        ) : (
          <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/25">
            {entry.family === "game-filler"
              ? "game SEO"
              : entry.family === "core-filler"
                ? "not written"
                : entry.family === "reference-news"
                  ? "their news"
                  : "off-scope"}
          </span>
        )}
      </Link>
    </li>
  );
}

function Pagination({ page }: { page: number }) {
  const pages: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(BLOG_PAGE_COUNT, page + 2); i++) pages.push(i);
  return (
    <nav aria-label="Blog pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={page === 2 ? "/blog" : `/blog/page/${page - 1}`}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Newer
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={p === 1 ? "/blog" : `/blog/page/${p}`}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex min-h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-bold transition-colors",
            p === page
              ? "border-violet-400/40 bg-violet-400/15 text-violet-100"
              : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-white",
          )}
        >
          {p}
        </Link>
      ))}
      {page < BLOG_PAGE_COUNT && (
        <Link
          href={`/blog/page/${page + 1}`}
          className="flex min-h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          Older
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}

function BlogHeader() {
  return (
    <header className="border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white">
          ← Hyper3D
        </Link>
        <span className="text-white/20" aria-hidden="true">/</span>
        <span className="text-xs font-bold text-white">Blog</span>
        <Link
          href="/blog/rss.xml"
          className="ml-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-white/50 transition-colors hover:border-white/30 hover:text-white"
        >
          <Rss className="size-3" aria-hidden="true" />
          RSS
        </Link>
      </div>
    </header>
  );
}

function CensusChips() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
        {BLOG_CENSUS.written} written here
      </span>
      <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1 text-xs font-bold text-amber-200/80">
        {BLOG_CENSUS.coreFiller} real 3D topics, not written
      </span>
      <span className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/55">
        {BLOG_CENSUS.gameFiller} game-guide routes, not reproduced
      </span>
      <span className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/55">
        {BLOG_CENSUS.referenceNews} reference news + {BLOG_CENSUS.offScope} off-scope, marked
      </span>
    </div>
  );
}

/** The blog front page: /blog (= pagination page 1). */
export function BlogIndexPage({
  featured,
  pageEntries,
  page,
}: {
  featured: BlogArticleDef[];
  pageEntries: BlogEntry[];
  page: number;
}) {
  // t67: CollectionPage + BreadcrumbList on the blog front page.
  const jsonLd = blogIndexJsonLd();
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <BlogHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        {/* hero — the editorial policy */}
        <section className="max-w-3xl">
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            The Blog, With the Receipts Attached
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            The reference site&apos;s blog catalogs {BLOG_CENSUS.total} article routes. This clone keeps every
            route — full sitemap parity — and writes the subset it can write honestly: {BLOG_CENSUS.written}{" "}
            articles whose every claim is anchored to code that runs here. The other{" "}
            {BLOG_CENSUS.total - BLOG_CENSUS.written} routes ({BLOG_CENSUS.gameFiller} of them game-guide SEO
            for third-party titles) are served as marked pages that say what they are and why they were not
            written. A blog you can audit beats a blog you can skim.
          </p>
          <div className="mt-5">
            <CensusChips />
          </div>
        </section>

        {/* category hubs */}
        <section className="mt-10">
          <h2 className="text-lg font-black tracking-tight">Topics</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:border-violet-400/35 hover:bg-white/[0.04]"
              >
                <p className="text-xs font-black tracking-tight text-white/85">{cat.name}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-white/40">{cat.blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* featured written */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-black tracking-tight">Latest articles</h2>
            <Link href="/blog/page/2" className="text-xs font-bold text-violet-300 hover:text-violet-200">
              View all →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((def) => (
              <ArticleCard key={def.slug} def={def} />
            ))}
          </div>
        </section>

        {/* all articles (paginated) */}
        <section id="all-articles" className="mt-12 scroll-mt-16">
          <h2 className="text-lg font-black tracking-tight">All articles</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/40">
            The full catalog, {BLOG_PAGE_SIZE} per page — written articles first (newest first), then the
            reference&apos;s news, the unwritten 3D topics, and the game-guide farm. Status dots say which is
            which.
          </p>
          <ul className="mt-4 divide-y divide-white/5">
            {pageEntries.map((entry) => (
              <CatalogRow key={entry.slug} entry={entry} />
            ))}
          </ul>
          <Pagination page={page} />
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        {BLOG_CENSUS.written} written articles · {BLOG_CENSUS.total} routes kept for parity · no filler prose,
        ever.
      </footer>
    </div>
  );
}

/** A pagination page: /blog/page/[page] (pages 2..N). */
export function BlogListPage({ pageEntries, page }: { pageEntries: BlogEntry[]; page: number }) {
  // t67: CollectionPage + breadcrumb for the pagination pages.
  const jsonLd = blogPageJsonLd(page);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <BlogHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <section id="all-articles" className="scroll-mt-16">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">All articles</h1>
            <span className="text-xs font-bold uppercase tracking-wider text-white/30">
              Page {page} of {BLOG_PAGE_COUNT}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            {BLOG_CENSUS.total} catalog routes, {BLOG_PAGE_SIZE} per page. Written articles carry the WRITTEN
            badge; everything else is an honestly marked route.
          </p>
          <ul className="mt-6 divide-y divide-white/5">
            {pageEntries.map((entry) => (
              <CatalogRow key={entry.slug} entry={entry} />
            ))}
          </ul>
          <Pagination page={page} />
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Status dots are computed from the registry — the census cannot drift from the data.
      </footer>
    </div>
  );
}

/** A category hub: /blog/category/[slug]. */
export function BlogCategoryPage({
  category,
  written,
  entries,
}: {
  category: BlogCategory;
  written: BlogArticleDef[];
  entries: BlogEntry[];
}) {
  const cat = findBlogCategory(category);
  // t67: CollectionPage + breadcrumb for the topic hubs.
  const jsonLd = cat ? blogCategoryJsonLd(cat) : [];
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {jsonLd.map((block, i) => (
        <JsonLd key={i} data={block} />
      ))}
      <BlogHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">Topic</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{cat?.name ?? category}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{cat?.blurb}</p>
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            The reference curates about a dozen articles per hub; this one lists the computed census for the
            topic — {written.length} written here, {entries.length - written.length} marked routes.
          </p>
        </section>

        {written.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-black tracking-tight">Written here</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {written.map((def) => (
                <ArticleCard key={def.slug} def={def} />
              ))}
            </div>
          </section>
        )}

        {entries.length > written.length && (
          <section className="mt-12">
            <h2 className="text-lg font-black tracking-tight">The rest of the topic&apos;s catalog</h2>
            <ul className="mt-4 divide-y divide-white/5">
              {entries
                .filter((e) => e.family !== "written")
                .map((entry) => (
                  <CatalogRow key={entry.slug} entry={entry} />
                ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <Link
            href="/blog"
            className="inline-flex min-h-10 items-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            ← All topics
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Category assignment is computed from topic keywords — game-guides stay uncategorized, as on the
        reference.
      </footer>
    </div>
  );
}
