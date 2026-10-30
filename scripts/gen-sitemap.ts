/**
 * t66 sitemap generator: regenerates public/sitemap.xml with the localized
 * landing tree appended to the (byte-preserved) English section.
 *
 * Run with: bun scripts/gen-sitemap.ts
 *
 * Behavior:
 *  1. Reads the current sitemap and keeps every EN <url> entry verbatim
 *     (they carry hand-tuned per-family priorities from t57–t65).
 *  2. Sanity-asserts the EN loc set against the route registries —
 *     1,095 routes, every family present — and fails loudly on drift.
 *  3. Replaces (idempotently) any previously appended localized section
 *     with a fresh one built from the generated locale route sets:
 *     5,975 routes across the 11 non-EN locales.
 *  4. Writes the file back and prints the census.
 *
 * Locale priorities are deliberately lower than their EN originals:
 * localized pages are honest router pages whose content lives on the
 * English originals (canonical links point there), so home 0.7/weekly,
 * hubs 0.5/weekly, articles 0.3/monthly.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { LOCALE_CODES } from "../src/lib/i18n";
import { LOCALE_ROUTE_COUNTS } from "../src/lib/i18n-locale-data";
import { localePaths } from "../src/lib/i18n-pages";
import { landingRoutes } from "../src/lib/landing";
import { featureRoutes } from "../src/lib/features";
import { TOOLS_ROUTES } from "../src/lib/tools-registry";
import { USE_CASE_ROUTES } from "../src/lib/use-cases";
import { STYLE_ROUTES } from "../src/lib/styles";
import { legalRoutes } from "../src/lib/legal";
import { HELP_ROUTES } from "../src/lib/help";
import { SUBCATEGORY_ROUTES } from "../src/lib/subcategories";
import { BLOG_SITEMAP_LOCS } from "../src/lib/blog";
import { liveOmniCraftTools } from "../src/lib/omnicraft";

const ORIGIN = "https://hyper3d-clone.vercel.app";
const FILE = join(process.cwd(), "public", "sitemap.xml");

function expectedEnglishLocs(): string[] {
  const live = liveOmniCraftTools().map((t) => `/omnicraft/${t.slug}`);
  return [
    "/",
    ...landingRoutes(),
    "/features",
    ...featureRoutes(),
    "/omnicraft",
    ...live,
    ...TOOLS_ROUTES,
    ...USE_CASE_ROUTES,
    ...STYLE_ROUTES,
    ...legalRoutes(),
    ...HELP_ROUTES,
    ...SUBCATEGORY_ROUTES,
    ...BLOG_SITEMAP_LOCS,
  ];
}

function urlEntry(loc: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function isLocalizedLoc(loc: string): boolean {
  const path = loc.slice(ORIGIN.length);
  if (path === "/" ) return false;
  const first = path.replace(/^\//, "").split("/")[0];
  return (LOCALE_CODES as readonly string[]).includes(first);
}

async function main(): Promise<void> {
  const current = readFileSync(FILE, "utf8");

  // split off the existing localized section (idempotent re-runs)
  const head = current.slice(0, current.indexOf("<urlset"));
  const body = current.slice(current.indexOf("<urlset"));
  const openEnd = body.indexOf(">") + 1;
  const openTag = body.slice(0, openEnd);
  const entries = [...body.slice(openEnd).matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => m[0]);

  const englishEntries = entries.filter((e) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(e)?.[1] ?? "";
    return !isLocalizedLoc(loc);
  });

  // sanity: the EN section is exactly the registry-composed route set
  const englishLocs = englishEntries.map(
    (e) => (/loc>([^<]+)<\/loc>/.exec(e)?.[1] ?? "").slice(ORIGIN.length),
  );
  const expected = expectedEnglishLocs();
  const missing = expected.filter((p) => !englishLocs.includes(p));
  const extra = englishLocs.filter((p) => p !== "/" && !expected.includes(p));
  if (missing.length || extra.length || englishLocs.length !== expected.length) {
    console.error("EN sitemap drift detected — refusing to write:");
    if (missing.length) console.error("  missing:", missing.slice(0, 5));
    if (extra.length) console.error("  extra:", extra.slice(0, 5));
    console.error(`  counts: file ${englishLocs.length} vs registries ${expected.length}`);
    process.exit(1);
  }

  // append the localized section
  const localized: string[] = [];
  const census: Record<string, number> = {};
  for (const locale of LOCALE_CODES) {
    let count = 0;
    for (const path of localePaths(locale)) {
      const href = path === "" ? `/${locale}` : `/${locale}/${path}`;
      let changefreq = "monthly";
      let priority = "0.3";
      if (path === "") {
        changefreq = "weekly";
        priority = "0.7";
      } else if (
        path === "blog" ||
        path === "features" ||
        path === "help" ||
        path === "styles" ||
        path === "use-cases" ||
        path === "legal" ||
        path === "tools/converter" ||
        path === "tools/viewer" ||
        /^help\/[^/]+$/.test(path)
      ) {
        changefreq = "weekly";
        priority = "0.5";
      }
      localized.push(urlEntry(`${ORIGIN}${href}`, changefreq, priority));
      count += 1;
    }
    census[locale] = count;
    if (count !== LOCALE_ROUTE_COUNTS[locale]) {
      console.error(
        `locale ${locale}: sitemap count ${count} != route count ${LOCALE_ROUTE_COUNTS[locale]}`,
      );
      process.exit(1);
    }
  }

  const total = englishEntries.length + localized.length;
  const out = [
    head,
    openTag,
    ...englishEntries,
    ...localized,
    "</urlset>\n",
  ].join("\n");
  writeFileSync(FILE, out, "utf8");

  console.log(`wrote ${FILE}`);
  console.log(`EN entries: ${englishEntries.length} (byte-preserved)`);
  for (const locale of LOCALE_CODES) {
    console.log(`  ${locale}: ${census[locale]} localized routes`);
  }
  console.log(`total <url>: ${total}`);
}

await main();
