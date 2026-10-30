import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, MinusCircle, Rss, XCircle } from "lucide-react";

import type { BlogArticleDef, BlogEntry, BlogFamily, BlogStatus } from "@/lib/blog-types";
import { BLOG_CENSUS } from "@/lib/blog-registry";
import { findBlogCategory } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * Shared renderer for every /blog/[slug] page — written articles get the
 * full anatomy (breadcrumb, lede, "On this page" TOC, sections, FAQ
 * details, related chips); not-written routes get the honest status page:
 * family banner, the computed reason, what the reference serves, and the
 * nearest real links. No fake prose anywhere — a not-written page never
 * renders a TOC or an FAQ.
 */

const STATUS_META: Record<BlogStatus, { chip: string; icon: React.ComponentType<{ className?: string }> }> = {
  live: { chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", icon: CheckCircle2 },
  partial: { chip: "border-amber-400/25 bg-amber-400/10 text-amber-300", icon: MinusCircle },
  "not-in-clone": { chip: "border-white/20 bg-white/[0.05] text-white/60", icon: XCircle },
};

const FAMILY_META: Record<Exclude<BlogFamily, "written">, { banner: string; label: string }> = {
  "game-filler": {
    banner: "border-white/12 bg-white/[0.03] text-white/70",
    label: "NOT WRITTEN HERE — GAME-GUIDE SEO",
  },
  "core-filler": {
    banner: "border-amber-400/20 bg-amber-400/[0.04] text-amber-200/80",
    label: "NOT WRITTEN HERE — A REAL 3D TOPIC, ON THE CATALOG",
  },
  "reference-news": {
    banner: "border-white/12 bg-white/[0.03] text-white/70",
    label: "NOT WRITTEN HERE — REFERENCE COMPANY NEWS",
  },
  "off-scope": {
    banner: "border-white/12 bg-white/[0.03] text-white/70",
    label: "NOT WRITTEN HERE — NOT EVEN A 3D TOPIC",
  },
};

function StatusChip({ status }: { status: BlogStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const label = status === "live" ? "WORKS HERE" : status === "partial" ? "PARTIAL HERE" : "NOT IN THIS CLONE";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
        meta.chip,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

function BlogTopBar({ category }: { category?: string }) {
  const cat = category ? findBlogCategory(category) : undefined;
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
      <Link
        href="/blog"
        className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Blog
      </Link>
      {cat && (
        <>
          <span className="text-white/20" aria-hidden="true">
            /
          </span>
          <Link
            href={`/blog/category/${cat.slug}`}
            className="text-xs font-bold text-white/60 transition-colors hover:text-white"
          >
            {cat.name}
          </Link>
        </>
      )}
      <Link
        href="/blog/rss.xml"
        className="ml-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-bold text-white/50 transition-colors hover:border-white/30 hover:text-white"
      >
        <Rss className="size-3" aria-hidden="true" />
        RSS
      </Link>
    </header>
  );
}

/** The written-article page. */
export function BlogArticlePage({ def }: { def: BlogArticleDef }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <BlogTopBar category={def.category} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* head */}
        <section>
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{def.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/30">{def.date}</span>
            <StatusChip status={def.status} />
          </div>
        </section>

        {/* the lede */}
        <section
          aria-label="The short version"
          className={cn(
            "mt-6 rounded-2xl border p-5",
            def.status === "live" && "border-violet-400/25 bg-violet-400/[0.05]",
            def.status === "partial" && "border-amber-400/25 bg-amber-400/[0.04]",
            def.status === "not-in-clone" && "border-white/12 bg-white/[0.03]",
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">The short version</p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">{def.answer}</p>
        </section>

        {/* on this page */}
        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">On this page</p>
          <ol className="mt-2 space-y-1.5">
            {def.sections.map((section, i) => (
              <li key={section.heading} className="text-sm">
                <a
                  href={`#section-${i}`}
                  className="text-white/60 transition-colors hover:text-violet-200"
                >
                  <span className="mr-2 font-mono text-[11px] text-white/30">{i + 1}.</span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* body */}
        {def.sections.map((section, i) => (
          <section key={section.heading} id={`section-${i}`} className="mt-10 scroll-mt-20">
            <h2 className="text-lg font-black tracking-tight sm:text-xl">{section.heading}</h2>
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="text-sm leading-relaxed text-white/60">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-lg font-black tracking-tight">FAQ</h2>
          <div className="mt-4 space-y-2">
            {def.faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 open:border-violet-400/25"
              >
                <summary className="cursor-pointer list-none text-sm font-bold text-white/80 transition-colors group-open:text-violet-200">
                  {faq.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* related */}
        <section className="mt-12">
          <h2 className="text-lg font-black tracking-tight">Related</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {def.related.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/70 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* category CTA */}
        <section className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-6 text-center sm:p-8">
          <h2 className="text-lg font-black tracking-tight sm:text-xl">Put it to work</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            Previews are free, the first good result costs one credit, and every claim in this article is
            checkable in the studio.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-4 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              Open the studio
            </Link>
            <Link
              href="/blog"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              All articles
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Written articles carry this clone&apos;s own copy, anchored to code that runs here — {BLOG_CENSUS.written}{" "}
        of {BLOG_CENSUS.total} catalog routes.
      </footer>
    </div>
  );
}

/** The computed reason paragraphs for each not-written family. */
function fillerBody(entry: BlogEntry): string[] {
  switch (entry.family) {
    case "game-filler":
      return [
        `This route exists on the reference site as one of its ${BLOG_CENSUS.gameFiller} game-guide articles — AI-generated tips, builds, mods, walkthroughs, and lore posts targeting long-tail searches for third-party games. This clone does not reproduce them: writing “best weapons” lists or achievement walkthroughs for games its authors have not played and cannot verify is exactly the content-farm practice this project exists to expose, and the reference's own versions show the tells — boilerplate “ethical considerations” sections, invented mod lists for games with no mod support, and keyword phrases repeated mid-sentence.`,
        "What is real here instead: game-development-adjacent work that this codebase actually supports — generating original 3D game assets from text or a reference image, exporting them in engine-ready formats, and lighting scenes with the local HDRI generator. The links below are the honest destinations.",
      ];
    case "core-filler":
      return [
        `This is a real 3D-domain topic — one of the ${BLOG_CENSUS.coreFiller} catalog articles this clone has not written. The honest reasons, in order: this project only publishes articles whose every claim can be anchored to code that runs here or to verified public facts, and an editorial team of zero has not gotten to this topic yet. The reference's version is AI-generated filler — keyword phrases repeated mid-sentence, comparison tables assembled for search ranking, and “first-hand experience” sections written by no one.`,
        "When this article gets written here, it will be written for real, and this page will stop existing in this form. Until then the nearest honest reading is the written set — same catalog, same honesty contract — linked below.",
      ];
    case "reference-news":
      return [
        "This route is one of the reference company's own news posts — a product launch, a case study, a partnership announcement, a hackathon. A clone has no company news: no launches to announce, no case studies to celebrate, no partnerships to disclose. Republishing the reference's announcements as if they were this project's would be fabrication, so the route is kept — the reference sitemap lists it, and parity is the rule — and honestly marked instead.",
        "The nearest real stories here are the platform articles: what this codebase is, what it costs, and how its meter works. Those are linked below.",
      ];
    case "off-scope":
      return [
        "The reference published this article as adjacent-search bait: PDF conversion, soundboards, GPU overclocking utilities, upscaler troubleshooting — topics with nothing to do with 3D generation, farmed for their search volume. This clone's scope is 3D generation and its honest tooling, so there is nothing to write; the route is kept for parity and marked for what it is.",
        "The real scope — two generation modes, six export formats, the OmniCraft toolbag, and the 55 written articles — starts one link away.",
      ];
    default:
      return [];
  }
}

/** The nearest-real links for a not-written route, computed per family. */
function fillerLinks(entry: BlogEntry): { label: string; href: string }[] {
  const base: { label: string; href: string }[] = [
    { label: "All articles", href: "/blog" },
    { label: "The studio", href: "/" },
  ];
  switch (entry.family) {
    case "game-filler":
      return [
        { label: "Generate game assets (article)", href: "/blog/generate-3d-game-assets" },
        { label: "Game development use case", href: "/use-cases/game-development" },
        ...base,
      ];
    case "core-filler": {
      const cat = entry.category;
      if (cat) {
        return [
          { label: `Category: ${findBlogCategory(cat)?.name ?? cat}`, href: `/blog/category/${cat}` },
          { label: "What is Hyper3D", href: "/blog/what-is-hyper3d" },
          ...base,
        ];
      }
      return [{ label: "What is Hyper3D", href: "/blog/what-is-hyper3d" }, ...base];
    }
    case "reference-news":
      return [
        { label: "What is Hyper3D", href: "/blog/what-is-hyper3d" },
        { label: "Honest review", href: "/blog/hyper3d-review" },
        ...base,
      ];
    case "off-scope":
      return [
        { label: "What is Hyper3D", href: "/blog/what-is-hyper3d" },
        { label: "Feature census", href: "/blog/what-features-does-hyper3d-have" },
        ...base,
      ];
    default:
      return base;
  }
}

/** The honest not-written page. */
export function BlogFillerPage({ entry }: { entry: BlogEntry }) {
  const meta = FAMILY_META[entry.family as Exclude<BlogFamily, "written">];
  const body = fillerBody(entry);
  const links = fillerLinks(entry);
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <BlogTopBar category={entry.category} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {/* head */}
        <section>
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">{entry.title}</h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/30">
            Route /blog/{entry.slug} — kept for reference-sitemap parity
          </p>
        </section>

        {/* the banner */}
        <section aria-label="Article status" className={cn("mt-6 rounded-2xl border p-5", meta.banner)}>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <FileText className="size-3.5" aria-hidden="true" />
            {meta.label}
          </p>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">
            This article was not written for this clone, and nothing on this page pretends otherwise. Here is
            exactly what this route is, and what to read instead.
          </p>
        </section>

        {/* the honest body */}
        <div className="mt-8 space-y-4">
          {body.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-white/60">
              {paragraph}
            </p>
          ))}
        </div>

        {/* what the reference serves */}
        <p className="mt-8 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 font-mono text-xs leading-relaxed text-white/55">
          On the reference site: an AI-generated article on this topic exists at this URL. Here: one of{" "}
          {BLOG_CENSUS.total - BLOG_CENSUS.written} catalog routes served honestly as not-written, against{" "}
          {BLOG_CENSUS.written} articles this clone actually wrote.
        </p>

        {/* nearest real */}
        <section className="mt-12">
          <h2 className="text-lg font-black tracking-tight">Read instead</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/70 transition-colors hover:border-violet-400/40 hover:text-violet-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
        Not-written pages carry no article body, no TOC, and no FAQ — by design, and pinned by tests.
      </footer>
    </div>
  );
}
