import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocalePageView } from "@/components/hyper3d/i18n/locale-page";
import { hreflangFor, isLocale } from "@/lib/i18n";
import { LOCALE_MESSAGES, fillCount } from "@/lib/i18n-messages";
import { localeStaticParams, resolveLocalePage } from "@/lib/i18n-pages";

/**
 * /[locale]/[[...slug]] — the entire localized landing tree (t66) in one
 * optional catch-all: 5,975 routes across the reference's 11 non-English
 * locales, every param set coming from the generated locale route sets
 * (i18n-locale-data.ts) via generateStaticParams — no literals.
 *
 *   /{loc}                       — the locale home
 *   /{loc}/pricing | 3d-prompts | switch[/makerworld]
 *   /{loc}/help[/{hub}|/articles/{slug}]   — the help tree
 *   /{loc}/features/{slug}       — 19 pages (nested slugs verbatim)
 *   /{loc}/tools/…               — converter matrix, viewer, image-to
 *   /{loc}/use-cases | styles | legal/{slug}
 *   /{loc}/sub-categories/{slug} — per-locale sets incl. locale-only oddballs
 *   /{loc}/blog[/{slug-loc}]     — index + the locale-suffixed article set
 *
 * Anything the reference does not ship — /{loc}/event, /{loc}/omnicraft,
 * unknown slugs, unknown locales — 404s into the themed page. Each page
 * canonicalizes to its English original and carries the 13-link hreflang
 * alternate set (12 languages + x-default), the part search engines read.
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
  return `/${locale}`; // locale-only routes: canonical stays in-locale
}

function localizedDescription(locale: string, path: string): string | undefined {
  if (!isLocale(locale)) return undefined;
  const messages = LOCALE_MESSAGES[locale];
  const def = resolveLocalePage(locale, path);
  if (!def) return undefined;
  if (def.kind === "home") return messages.home.subhead;
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
