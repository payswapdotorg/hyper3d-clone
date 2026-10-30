import Link from "next/link";
import { ArrowLeft, Globe, MinusCircle } from "lucide-react";

import { LOCALE_CODES, LOCALE_NAMES, localeDir, type LocaleCode } from "@/lib/i18n";
import { LOCALE_MESSAGES, fillCount, localeHeadline } from "@/lib/i18n-messages";
import { STUDIO_PATH } from "@/lib/studio-path";
import { LOCALE_SUBCATEGORY_SLUGS } from "@/lib/i18n-locale-data";
import type { LocaleFamilyKey, LocaleLink, LocalePageDef, LocaleStatus } from "@/lib/i18n-pages";
import {
  PROMPT_CENSUS,
  PROMPT_PAGE_COUNT,
  promptPage,
  promptHubPage,
  promptHubMembers,
} from "@/lib/prompts-registry";
import type { PromptEntry, PromptHubInfo } from "@/lib/prompts-types";
import { cn } from "@/lib/utils";

/**
 * The shared localized renderer (t66). Three page kinds, one honesty
 * contract (DECISIONS.md #46): the chrome — top bar, family labels, hub
 * intros, status chips, notices, switcher, footer — is genuinely
 * translated (i18n-messages.ts, hand-written); the long-form content
 * stays English, and every deep page says so in the locale's own language
 * and links the English original. Never machine-translated prose.
 *
 * One deliberate deviation: <html lang> stays "en" (the root layout is
 * shared with the EN tree and the studio app), so each page scopes its
 * content with a lang/dir wrapper — Arabic runs RTL inside it — and ships
 * the full 13-link hreflang alternate set in <head>.
 */

/* ------------------------------------------------------------------ chrome */

function LocaleTopBar({
  locale,
  familyLabel,
  familyHref,
  path,
}: {
  locale: LocaleCode;
  familyLabel?: string;
  familyHref?: string;
  path: string;
}) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
      <Link
        href={STUDIO_PATH}
        className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {messages.studio}
      </Link>
      <span className="text-white/20" aria-hidden="true">
        /
      </span>
      <h1 className="text-sm font-bold text-white">
        {familyHref && familyLabel ? (
          <Link href={familyHref} className="transition-colors hover:text-violet-200">
            {familyLabel}
          </Link>
        ) : (
          "Hyper3D"
        )}
      </h1>
      <div className="ms-auto">
        <LanguageSwitcher locale={locale} path={path} />
      </div>
    </header>
  );
}

function LanguageSwitcher({ locale, path }: { locale: LocaleCode; path: string }) {
  const messages = LOCALE_MESSAGES[locale];
  const clean = path === "" ? "" : `/${path}`;
  return (
    <details className="relative">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-medium text-white/70 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
        <Globe className="size-3.5" aria-hidden="true" />
        {messages.switcher.label}
      </summary>
      <div className="h3d-scroll absolute end-0 z-20 mt-1 max-h-80 w-44 overflow-y-auto rounded-xl border border-white/12 bg-[#1c1c22] p-1 shadow-xl">
        <Link
          href={clean || "/"}
          className="flex min-h-9 items-center rounded-lg px-3 text-xs text-white/75 transition-colors hover:bg-white/8 hover:text-white"
        >
          {messages.switcher.english}
        </Link>
        {LOCALE_CODES.map((code) => (
          <Link
            key={code}
            href={`/${code}${clean}`}
            className={cn(
              "flex min-h-9 items-center rounded-lg px-3 text-xs transition-colors hover:bg-white/8 hover:text-white",
              code === locale ? "font-bold text-violet-300" : "text-white/75",
            )}
          >
            {LOCALE_NAMES[code].native}
          </Link>
        ))}
      </div>
    </details>
  );
}

function LocaleFooter({ locale }: { locale: LocaleCode }) {
  return (
    <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-3 text-center text-[11px] leading-relaxed text-white/35">
      {LOCALE_MESSAGES[locale].footer}
    </footer>
  );
}

/* -------------------------------------------------------------- dispatcher */

export function LocalePageView({
  locale,
  path,
  def,
}: {
  locale: LocaleCode;
  path: string;
  def: LocalePageDef;
}) {
  const dir = localeDir(locale);
  if (def.kind === "home") {
    return (
      <div
        lang={locale}
        dir={dir}
        className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white"
      >
        <LocaleTopBar locale={locale} path="" />
        <HomeView locale={locale} />
        <LocaleFooter locale={locale} />
      </div>
    );
  }
  if (def.kind === "prompts-index") {
    return (
      <div
        lang={locale}
        dir={dir}
        className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white"
      >
        <LocaleTopBar locale={locale} familyLabel={familyLabelFor(locale, "prompts")} familyHref={`/${locale}/3d-prompts`} path={path} />
        <PromptsIndexView locale={locale} page={def.page} />
        <LocaleFooter locale={locale} />
      </div>
    );
  }
  if (def.kind === "prompt-community") {
    return (
      <div
        lang={locale}
        dir={dir}
        className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white"
      >
        <LocaleTopBar locale={locale} familyLabel={familyLabelFor(locale, "prompts")} familyHref={`/${locale}/3d-prompts`} path={path} />
        <PromptCommunityView locale={locale} entry={def.entry} />
        <LocaleFooter locale={locale} />
      </div>
    );
  }
  if (def.kind === "prompt-hub") {
    return (
      <div
        lang={locale}
        dir={dir}
        className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white"
      >
        <LocaleTopBar locale={locale} familyLabel={familyLabelFor(locale, "prompts")} familyHref={`/${locale}/3d-prompts`} path={path} />
        <PromptHubLocaleView locale={locale} hub={def.hub} page={def.page} />
        <LocaleFooter locale={locale} />
      </div>
    );
  }
  const familyLabel = familyLabelFor(locale, def.family);
  const familyHref = familyHrefFor(locale, def.family, def);
  return (
    <div
      lang={locale}
      dir={dir}
      className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white"
    >
      <LocaleTopBar
        locale={locale}
        familyLabel={familyLabel}
        familyHref={familyHref}
        path={path}
      />
      {def.kind === "hub" ? <HubView locale={locale} def={def} /> : null}
      {def.kind === "article" ? <ArticleView locale={locale} def={def} /> : null}
      {def.kind === "locale-only" ? <LocaleOnlyView locale={locale} def={def} /> : null}
      <LocaleFooter locale={locale} />
    </div>
  );
}

function familyLabelFor(locale: LocaleCode, family: LocaleFamilyKey): string {
  return LOCALE_MESSAGES[locale].families[family];
}

function familyHrefFor(
  locale: LocaleCode,
  family: LocaleFamilyKey,
  def: LocalePageDef,
): string | undefined {
  if (def.kind === "hub") return hubSelfHref(locale, def.family);
  switch (family) {
    case "pricing":
      return `/${locale}/pricing`;
    case "prompts":
      return `/${locale}/3d-prompts`;
    case "switch":
      return `/${locale}/switch`;
    case "help":
      return `/${locale}/help`;
    case "features":
      return `/${locale}/features`;
    case "tools":
      // t70: the bare tools index exists in every locale now
      return `/${locale}/tools`;
    case "styles":
      return `/${locale}/styles`;
    case "useCases":
      return `/${locale}/use-cases`;
    case "legal":
      return `/${locale}/legal`;
    case "subCategories":
      return LOCALE_SUBCATEGORY_SLUGS[locale].length > 0
        ? `/${locale}/sub-categories/${LOCALE_SUBCATEGORY_SLUGS[locale][0]}`
        : undefined;
    case "blog":
      return `/${locale}/blog`;
    default:
      return undefined;
  }
}

function hubSelfHref(locale: LocaleCode, family: LocaleFamilyKey): string | undefined {
  switch (family) {
    case "help":
      return `/${locale}/help`;
    case "features":
      return `/${locale}/features`;
    case "tools":
      return `/${locale}/tools`;
    case "styles":
      return `/${locale}/styles`;
    case "useCases":
      return `/${locale}/use-cases`;
    case "legal":
      return `/${locale}/legal`;
    case "blog":
      return `/${locale}/blog`;
    default:
      return undefined;
  }
}

/* -------------------------------------------------------------------- home */

function HomeView({ locale }: { locale: LocaleCode }) {
  const messages = LOCALE_MESSAGES[locale];
  const directory: { href: string; label: string }[] = [
    { href: `/${locale}/pricing`, label: messages.families.pricing },
    { href: `/${locale}/3d-prompts`, label: messages.families.prompts },
    { href: `/${locale}/switch`, label: messages.families.switch },
    { href: `/${locale}/help`, label: messages.families.help },
    { href: `/${locale}/features`, label: messages.families.features },
    { href: `/${locale}/tools`, label: messages.families.tools },
    { href: `/${locale}/styles`, label: messages.families.styles },
    { href: `/${locale}/use-cases`, label: messages.families.useCases },
    { href: `/${locale}/legal`, label: messages.families.legal },
    { href: `/${locale}/blog`, label: messages.families.blog },
  ];
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <section className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
          {messages.home.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
          {localeHeadline(messages, locale)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          {messages.home.subhead}
        </p>
        <div className="mt-6">
          <Link
            href={STUDIO_PATH}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
          >
            {messages.home.explore}
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-black tracking-tight text-white/85">{messages.studio}</h3>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {directory.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-3 text-center text-xs font-bold text-white/75 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04] hover:text-violet-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/* --------------------------------------------------------------------- hub */

function HubView({
  locale,
  def,
}: {
  locale: LocaleCode;
  def: Extract<LocalePageDef, { kind: "hub" }>;
}) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
          {messages.home.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
          {familyLabelFor(locale, def.family)}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          {fillCount(messages.hub.intro, def.count)}
        </p>
        <div className="mt-6">
          <Link
            href={def.enHref}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
          >
            {messages.hub.browse}
          </Link>
        </div>
      </section>

      {def.links.length > 0 ? (
        <section className="mt-8">
          <ul className="grid gap-2 sm:grid-cols-2">
            {def.links.map((link: LocaleLink) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-bold text-white/75 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04] hover:text-violet-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8">
          <NoticeCard locale={locale} enHref={def.enHref} />
        </section>
      )}
    </main>
  );
}

/* ----------------------------------------------------------------- article */

function ArticleView({
  locale,
  def,
}: {
  locale: LocaleCode;
  def: Extract<LocalePageDef, { kind: "article" }>;
}) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip locale={locale} status={def.status} />
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl" lang="en">
          {def.title}
        </h2>
      </section>

      <section className="mt-8">
        <NoticeCard locale={locale} enHref={def.enHref} />
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30">
          {messages.parity}
        </p>
      </section>
    </main>
  );
}

function LocaleOnlyView({
  locale,
  def,
}: {
  locale: LocaleCode;
  def: Extract<LocalePageDef, { kind: "locale-only" }>;
}) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl" lang="en">
          {def.title}
        </h2>
      </section>
      <section className="mt-8">
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-6 text-center sm:p-8">
          <h3 className="text-lg font-black tracking-tight text-amber-200">
            {messages.localeOnly.title}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/60">
            {messages.localeOnly.body}
          </p>
          <div className="mt-5">
            <Link
              href={`/${locale}`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/10 px-5 text-sm font-bold text-amber-100 transition-colors hover:bg-amber-400/20"
            >
              {messages.families.subCategories} — {LOCALE_NAMES[locale].native}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30">
          {messages.parity}
        </p>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ notice */

function NoticeCard({ locale, enHref }: { locale: LocaleCode; enHref: string }) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[0.08] to-transparent p-6 text-center sm:p-8">
      <h3 className="text-lg font-black tracking-tight text-white">{messages.notice.title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
        {messages.notice.body}
      </p>
      <div className="mt-5">
        <Link
          href={enHref}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
        >
          {messages.notice.cta}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- prompt library */

/** One catalog card: the EN route title + the localized status chip.
 * Card bodies stay EN (tier-2: no machine-translated prose). */
function PromptCatalogCard({ locale, entry }: { locale: LocaleCode; entry: PromptEntry }) {
  const messages = LOCALE_MESSAGES[locale];
  const written = entry.family === "written";
  return (
    <li className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/${locale}/3d-prompts/${entry.slug}`}
          className="text-sm font-black leading-snug tracking-tight text-white/85 transition-colors hover:text-violet-200"
          lang="en"
        >
          {entry.title}
        </Link>
        {written ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            {messages.prompts.writtenChip}
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/60">
            <MinusCircle className="size-3" aria-hidden="true" />
            {messages.prompts.communityChip}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/50" lang="en">
        {written
          ? entry.article!.blurb
          : "A community prompt entry on the reference site — kept as an honestly marked route; no prompt, author, or screenshot is reproduced here."}
      </p>
    </li>
  );
}

/** The shared 1..17 pagination nav with localized prev/next labels. */
function PromptPaginationNav({ locale, page }: { locale: LocaleCode; page: number }) {
  const messages = LOCALE_MESSAGES[locale];
  const href = (n: number) => (n === 1 ? `/${locale}/3d-prompts` : `/${locale}/3d-prompts/${n}`);
  return (
    <nav aria-label="Prompt library pages" className="mt-8 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          {messages.prompts.prev}
        </Link>
      ) : null}
      {Array.from({ length: PROMPT_PAGE_COUNT }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-2 text-xs font-bold text-violet-100"
              : "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
          }
        >
          {n}
        </Link>
      ))}
      {page < PROMPT_PAGE_COUNT ? (
        <Link
          href={href(page + 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          {messages.prompts.next}
        </Link>
      ) : null}
    </nav>
  );
}

/** The localized prompt-library index — page 1 and the 2..17 pagination
 * pages. The card grid carries EN route data (titles are the registry's
 * display names, never machine translations); the chrome — intro,
 * chips, pagination, notice — is genuinely translated. */
function PromptsIndexView({ locale, page }: { locale: LocaleCode; page: number }) {
  const messages = LOCALE_MESSAGES[locale];
  const entries = promptPage(page);
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
          {messages.home.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
          {messages.families.prompts}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          {fillCount(messages.prompts.indexIntro, PROMPT_CENSUS.total)}
        </p>
        {page > 1 ? (
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/30">
            {messages.prompts.pageOf
              .replace("{page}", String(page))
              .replace("{total}", String(PROMPT_PAGE_COUNT))}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <PromptCatalogCard key={entry.slug} locale={locale} entry={entry} />
          ))}
        </ul>
        <PromptPaginationNav locale={locale} page={page} />
      </section>

      <section className="mt-10">
        <NoticeCard locale={locale} enHref={page === 1 ? "/3d-prompts" : `/3d-prompts/${page}`} />
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30">
          {messages.parity}
        </p>
      </section>
    </main>
  );
}

/** The localized community-route page: the not-reproduced banner in the
 * locale's own language, the EN title as route data, the reference-index
 * model association, and the links to what is real. */
function PromptCommunityView({ locale, entry }: { locale: LocaleCode; entry: PromptEntry }) {
  const messages = LOCALE_MESSAGES[locale];
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl" lang="en">
          {entry.title}
        </h2>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white/30">
          /{locale}/3d-prompts/{entry.slug}
        </p>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 text-center sm:p-8">
          <h3 className="text-lg font-black tracking-tight text-white">
            {messages.prompts.communityTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">
            {messages.prompts.communityBody}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/3d-prompts"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-5 text-sm font-bold text-violet-100 transition-colors hover:bg-violet-400/25"
            >
              {messages.notice.cta}
            </Link>
            <Link
              href={`/${locale}/3d-prompts`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-5 text-sm font-bold text-white/75 transition-colors hover:border-white/30 hover:text-white"
            >
              {messages.families.prompts} — {LOCALE_NAMES[locale].native}
            </Link>
          </div>
        </div>
        {entry.models.length > 0 ? (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30" lang="en">
            Reference route · indexed under {entry.models.join(" + ")} ·{" "}
            {PROMPT_CENSUS.community} not-reproduced routes vs {PROMPT_CENSUS.written} written here
          </p>
        ) : null}
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30">
          {messages.parity}
        </p>
      </section>
    </main>
  );
}

/** The localized model hub — honest inversion in the locale's language,
 * member rows with EN titles and localized status chips, the reference's
 * own per-hub pagination math. */
function PromptHubLocaleView({
  locale,
  hub,
  page,
}: {
  locale: LocaleCode;
  hub: PromptHubInfo;
  page: number;
}) {
  const messages = LOCALE_MESSAGES[locale];
  const members = promptHubPage(hub, page);
  const allMembers = promptHubMembers(hub);
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <section className="border-b border-white/10 pb-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-300/80">
          {messages.home.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          <span lang="en">{hub.name}</span> · {messages.families.prompts}
        </h2>
        {page > 1 ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/30">
            {messages.prompts.pageOf
              .replace("{page}", String(page))
              .replace("{total}", String(hub.pages))}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-8">
          <h3 className="text-sm font-black tracking-tight text-white/85">
            {messages.prompts.hubTitle}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {messages.prompts.hubBody
              .replace("{model}", hub.name)
              .replace("{count}", String(hub.claimed))}
          </p>
        </div>
      </section>

      <section className="mt-8" aria-label={`${hub.name} prompt routes`}>
        <ul className="space-y-2">
          {members.map((entry) => {
            const written = entry.family === "written";
            return (
              <li
                key={entry.slug}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <Link
                  href={`/${locale}/3d-prompts/${entry.slug}`}
                  className="text-sm font-bold text-white/80 transition-colors hover:text-violet-200"
                  lang="en"
                >
                  {entry.title}
                </Link>
                {written ? (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    {messages.prompts.writtenChip}
                  </span>
                ) : (
                  <span className="rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-white/55">
                    {messages.prompts.communityChip}
                  </span>
                )}
                <span className="ms-auto text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {written ? messages.prompts.writtenLabel : messages.prompts.communityLabel}
                </span>
              </li>
            );
          })}
        </ul>

        {hub.pages > 1 ? (
          <nav
            aria-label={`${hub.name} hub pages`}
            className="mt-8 flex flex-wrap items-center gap-2"
          >
            {page > 1 ? (
              <Link
                href={
                  page - 1 === 1
                    ? `/${locale}/3d-prompts/models/${hub.slug}`
                    : `/${locale}/3d-prompts/models/${hub.slug}/${page - 1}`
                }
                className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                {messages.prompts.prev}
              </Link>
            ) : null}
            {Array.from({ length: hub.pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={
                  n === 1
                    ? `/${locale}/3d-prompts/models/${hub.slug}`
                    : `/${locale}/3d-prompts/models/${hub.slug}/${n}`
                }
                aria-current={n === page ? "page" : undefined}
                className={
                  n === page
                    ? "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-400/15 px-2 text-xs font-bold text-violet-100"
                    : "inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
                }
              >
                {n}
              </Link>
            ))}
            {page < hub.pages ? (
              <Link
                href={`/${locale}/3d-prompts/models/${hub.slug}/${page + 1}`}
                className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                {messages.prompts.next}
              </Link>
            ) : null}
          </nav>
        ) : null}
        <p className="mt-4 text-[11px] leading-relaxed text-white/30" lang="en">
          {allMembers.length} member routes · {hub.pages} page{hub.pages > 1 ? "s" : ""} · 24 per
          page (the reference&apos;s own pagination math)
        </p>
      </section>

      <section className="mt-10">
        <NoticeCard locale={locale} enHref={`/3d-prompts/models/${hub.slug}`} />
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/30">
          {messages.parity}
        </p>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------- status chip */

function StatusChip({
  locale,
  status,
}: {
  locale: LocaleCode;
  status?: LocaleStatus;
}) {
  if (!status) return null;
  const messages = LOCALE_MESSAGES[locale];
  let label: string;
  let className: string;
  if (status.kind === "help") {
    if (status.status === "live") {
      label = messages.status.works;
      className = "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    } else if (status.status === "partial") {
      label = messages.status.partial;
      className = "border-amber-400/25 bg-amber-400/10 text-amber-300";
    } else {
      label = messages.status.absent;
      className = "border-white/20 bg-white/[0.05] text-white/60";
    }
  } else if (status.kind === "blog") {
    label = messages.blogFamily[status.family];
    if (status.family === "written") {
      className = "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    } else if (status.family === "reference-news") {
      className = "border-sky-400/25 bg-sky-400/10 text-sky-300";
    } else if (status.family === "core-filler") {
      className = "border-violet-400/25 bg-violet-400/10 text-violet-300";
    } else if (status.family === "game-filler") {
      className = "border-amber-400/25 bg-amber-400/10 text-amber-300";
    } else {
      className = "border-white/20 bg-white/[0.05] text-white/60";
    }
  } else {
    if (status.status === "live") {
      label = messages.status.works;
      className = "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    } else if (status.status === "not-here") {
      label = messages.status.absent;
      className = "border-white/20 bg-white/[0.05] text-white/60";
    } else {
      label = messages.status.partial;
      className = "border-amber-400/25 bg-amber-400/10 text-amber-300";
    }
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
        className,
      )}
    >
      {label}
    </span>
  );
}
