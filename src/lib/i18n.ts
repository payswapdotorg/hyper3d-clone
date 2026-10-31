/**
 * i18n core (t66): the locale registry and URL helpers for the localized
 * landing tree — the 11 non-English locales the reference ships
 * (landing-sitemap-index.xml recon 2026-10-30), each a prefix route
 * (`/zh`, `/de`, …) carrying the reference's own localized route sets
 * (see i18n-locale-data.ts, generated).
 *
 * The honesty contract is two-tier, decided in DECISIONS.md #46:
 *  - Tier 1 (genuinely translated): the page chrome — top bar, family
 *    labels, hub heroes, status chips, notices, CTAs, the language
 *    switcher. Hand-written per locale in i18n-messages.ts.
 *  - Tier 2 (honest router pages): long-form content stays English. Every
 *    localized deep page states, in the locale's own language, that the
 *    canonical text lives on the English page, and links there. No
 *    machine-translated prose is faked.
 *
 * One deviation is deliberate and documented: `<html lang>` stays "en"
 * (the root layout is shared with the EN tree and the studio app), while
 * every locale page scopes its content with a `lang`/`dir` wrapper and
 * ships the full 13-link hreflang alternate set in <head> — the part
 * search engines actually read.
 */

/** The reference's non-English locales, in sitemap-index order. */
export const LOCALE_CODES = [
  "zh",
  "de",
  "ja",
  "ko",
  "ru",
  "pt",
  "fr",
  "es",
  "ar",
  "tr",
  "it",
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

export function isLocale(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value);
}

/** Native names, matching the studio's decorative LOCALES list order. */
export const LOCALE_NAMES: Record<LocaleCode, { native: string; english: string }> = {
  zh: { native: "中文", english: "Chinese" },
  de: { native: "Deutsch", english: "German" },
  ja: { native: "日本語", english: "Japanese" },
  ko: { native: "한국어", english: "Korean" },
  ru: { native: "Русский", english: "Russian" },
  pt: { native: "Português", english: "Portuguese" },
  fr: { native: "Français", english: "French" },
  es: { native: "Español", english: "Spanish" },
  ar: { native: "العربية", english: "Arabic" },
  tr: { native: "Türkçe", english: "Turkish" },
  it: { native: "Italiano", english: "Italian" },
};

/** Arabic is the reference's only RTL locale. */
export function localeDir(locale: LocaleCode): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** `/zh/pricing`-style prefixing for a locale-unaware path (`/pricing`). */
export function localePath(locale: LocaleCode, path: string): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/** The locale-aware hreflang map for one page: EN (unprefixed) + the 11
 * localized prefixes, exactly the reference's 13-link set (12 languages +
 * x-default pointing at the English original).
 *
 * t79: the reference emits pt-BR (not pt) as the Portuguese hreflang on
 * every HTML <link rel="alternate"> — verified across the blog family
 * probe (recon/t79/heads.json) and the schema-org JSON-LD parity already
 * shipped. The map key mirrors the reference's own tag byte-for-byte. */
export function hreflangFor(path: string): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const map: Record<string, string> = { en: clean || "/" };
  for (const loc of LOCALE_CODES) {
    map[loc === "pt" ? "pt-BR" : loc] = `/${loc}${clean}`;
  }
  map["x-default"] = clean || "/";
  return map;
}

/** Locale blog slugs carry the reference's own `-{loc}` suffix:
 * `/zh/blog/what-is-glb-zh`. Stripping it recovers the EN catalog slug. */
export function blogBaseSlug(locale: LocaleCode, slug: string): string {
  const suffix = `-${locale}`;
  return slug.endsWith(suffix) ? slug.slice(0, -suffix.length) : slug;
}

/** The oddball the reference ships in zh/de/ja/ko/ru/fr/es: this one help
 * article is renamed `use-bang-and-partial-edit-{loc}` instead of keeping
 * the EN slug. Mirrored verbatim for route parity. */
export function helpArticleSlugFor(locale: LocaleCode, slug: string): string {
  if (slug === "use-bang-and-partial-edit") {
    // pt/ar/tr/it keep the plain slug — only these six rename it
    const renamed: readonly LocaleCode[] = ["zh", "de", "ja", "ko", "ru", "fr", "es"];
    if ((renamed as readonly string[]).includes(locale)) {
      return `${slug}-${locale}`;
    }
  }
  return slug;
}
