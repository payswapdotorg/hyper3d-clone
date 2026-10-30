import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocalePageView } from "@/components/hyper3d/i18n/locale-page";
import { hreflangFor, isLocale } from "@/lib/i18n";
import { LOCALE_MESSAGES, fillCount } from "@/lib/i18n-messages";
import { localeStaticParams, resolveLocalePage } from "@/lib/i18n-pages";
import { PROMPT_CENSUS, PROMPT_PAGE_COUNT } from "@/lib/prompts-registry";

/**
 * /[locale]/[[...slug]] — the entire localized landing tree in one
 * optional catch-all. t66 shipped the sitemap-listed set (5,975 routes);
 * t70 extends it to everything the live reference SERVES under locale
 * prefixes, sitemapped or not (recon/locale-deep-trees.md): the full
 * localized 3D prompt library (index + 16 pagination + 403 details + 11
 * model hubs + 13 hub pages per locale), the bare tools index, and the
 * six-slug sub-category matrix — 10,918 serving routes, all from the
 * generated/computed route sets via generateStaticParams, no literals.
 *
 *   /{loc}                       — the locale home
 *   /{loc}/pricing | 3d-prompts[/2../17|/{slug}|/models/{m}[/{p}]]
 *   /{loc}/switch[/makerworld] | help tree | features | tools[/…] 
 *   /{loc}/use-cases | styles | legal | sub-categories/{6 slugs} | blog
 *
 * Anything the reference does not serve — /{loc}/event, /{loc}/omnicraft,
 * /{loc}/3d-prompts/1, /18, unknown slugs, unknown locales — 404s into
 * the themed page. Localized pages canonicalize to their English
 * originals and carry the 13-link hreflang alternate set (locale-only
 * routes keep an in-locale canonical — the t66 contract, unchanged).
 */

export function generateStaticParams() {
  return localeStaticParams();
}

/** The English path a localized page mirrors (for canonical + hreflang). */
function englishPath(locale: string, slug: string[] | undefined): string | null {
  if (!isLocale(locale)) return null;
  const path = (slug ?? []).join("/");
  const def = resolveLocalePage(locale, path);
  if (!def) return null;
  if (def.kind === "home") return "/";
  if (def.kind === "hub") return def.enHref;
  if (def.kind === "article") return def.enHref;
  if (def.kind === "prompts-index") {
    return def.page === 1 ? "/3d-prompts" : `/3d-prompts/${def.page}`;
  }
  if (def.kind === "prompt-community") return `/3d-prompts/${def.entry.slug}`;
  if (def.kind === "prompt-hub") {
    return def.page === 1
      ? `/3d-prompts/models/${def.hub.slug}`
      : `/3d-prompts/models/${def.hub.slug}/${def.page}`;
  }
  return `/${locale}`; // locale-only routes: canonical stays in-locale
}

function localizedDescription(locale: string, path: string): string | undefined {
  if (!isLocale(locale)) return undefined;
  const messages = LOCALE_MESSAGES[locale];
  const def = resolveLocalePage(locale, path);
  if (!def) return undefined;
  if (def.kind === "home") return messages.home.subhead;
  if (def.kind === "prompts-index") {
    return fillCount(messages.prompts.indexIntro, PROMPT_CENSUS.total);
  }
  if (def.kind === "prompt-community") return messages.prompts.communityBody;
  if (def.kind === "prompt-hub") {
    return messages.prompts.hubBody
      .replace("{model}", def.hub.name)
      .replace("{count}", String(def.hub.claimed));
  }
  if (def.kind === "hub") return fillCount(messages.hub.intro, def.count);
  if (def.kind === "article") return messages.notice.body;
  return messages.localeOnly.body;
}

function localizedTitle(locale: string, path: string): string | undefined {
  if (!isLocale(locale)) return undefined;
  const messages = LOCALE_MESSAGES[locale];
  const def = resolveLocalePage(locale, path);
  if (!def) return undefined;
  if (def.kind === "home") return messages.meta.homeTitle;
  if (def.kind === "prompts-index") {
    const base = messages.families.prompts;
    return def.page === 1
      ? `${base} — Hyper3D`
      : `${base} · ${messages.prompts.pageOf
          .replace("{page}", String(def.page))
          .replace("{total}", String(PROMPT_PAGE_COUNT))} — Hyper3D`;
  }
  if (def.kind === "prompt-community") {
    return `${def.entry.title} — ${messages.families.prompts} — Hyper3D`;
  }
  if (def.kind === "prompt-hub") {
    return `${def.hub.name} · ${messages.families.prompts} — Hyper3D`;
  }
  const familyLabel = messages.families[def.family];
  if (def.kind === "hub") return `${familyLabel} — Hyper3D`;
  return `${def.title} — ${familyLabel} — Hyper3D`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const path = (slug ?? []).join("/");
  const enPath = englishPath(locale, slug);
  if (!enPath) return { title: "Page not found" };
  return {
    title: localizedTitle(locale, path),
    description: localizedDescription(locale, path)?.slice(0, 180),
    alternates: {
      canonical: enPath,
      languages: hreflangFor(enPath),
    },
  };
}

export default async function LocaleRoute({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const path = (slug ?? []).join("/");
  const def = resolveLocalePage(locale, path);
  if (!def) notFound();
  return <LocalePageView locale={locale} path={path} def={def} />;
}
