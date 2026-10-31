import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocalePageView } from "@/components/hyper3d/i18n/locale-page";
import { hreflangFor, isLocale } from "@/lib/i18n";
import { LOCALE_MESSAGES, fillCount } from "@/lib/i18n-messages";
import { localeStaticParams, resolveLocalePage } from "@/lib/i18n-pages";
import { PROMPT_CENSUS, PROMPT_PAGE_COUNT } from "@/lib/prompts-registry";
import { referenceDescription } from "@/lib/reference-descriptions";
import { referenceCardTitle, referenceTitle } from "@/lib/reference-titles";
import { referenceOgImage } from "@/lib/reference-og-images";
import { OG_BANNER_FALLBACK_URL, SITE_ORIGIN } from "@/lib/schema-org";

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

/**
 * The served <title> for a localized page (t75): the reference's own
 * byte-faithful title when the path is pinned in the registry (the
 * sitemap-censused locale tree plus the twelve /{locale}/tools indexes),
 * else the honest template title below — the deep served-but-not-
 * sitemapped routes keep their template titles.
 */
function localizedTitle(locale: string, path: string): string | undefined {
  if (!isLocale(locale)) return undefined;
  const pinned = referenceTitle(`/${locale}${path === "" ? "" : `/${path}`}`);
  if (pinned) return pinned;
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
  const title = localizedTitle(locale, path);
  // t75: the reference's locale pages ship full link-preview cards —
  // og:title is the <title> minus the " | Hyper3D" suffix (registry card
  // title), og:url is the locale page's own URL. The canonical stays the
  // English original with the 13-link hreflang set (the t66 contract).
  const localePath = `/${locale}${path === "" ? "" : `/${path}`}`;
  // t76: a censused locale path serves the reference's own localized
  // meta description, pinned byte-faithfully (full length — 106 pinned
  // descriptions run past the 180-char slice this clone's templates
  // use); every other route keeps the honest localized template copy.
  const description =
    referenceDescription(localePath) ??
    localizedDescription(locale, path)?.slice(0, 180);
  const cardTitle =
    referenceCardTitle(localePath) ?? title ?? `${locale} · Hyper3D`;
  // t77: a censused locale path serves the reference's own og:image,
  // pinned byte-faithfully (the same URL serves og:image and
  // twitter:image on the reference — 0 mismatches in the probe);
  // every other route keeps the honest shared banner. The alt is the
  // card title — exactly the reference's og:image:alt on every censused
  // page (the t75 title minus " | Hyper3D").
  const image =
    referenceOgImage(localePath) ?? OG_BANNER_FALLBACK_URL;
  const def = isLocale(locale) ? resolveLocalePage(locale, path) : null;
  const cardType: "website" | "article" =
    def?.kind === "article" ? "article" : "website";
  return {
    title,
    description,
    openGraph: {
      type: cardType,
      siteName: "Hyper3D",
      title: cardTitle,
      description,
      url: `${SITE_ORIGIN}${localePath}`,
      images: [{ url: image, alt: cardTitle }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@DeemosTech",
      title: cardTitle,
      description,
      images: [{ url: image, alt: cardTitle }],
    },
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
