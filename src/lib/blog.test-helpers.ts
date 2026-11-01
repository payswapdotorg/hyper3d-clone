/**
 * Shared route-vocabulary helpers for blog content tests — one source of
 * truth for "does this href point at a route this clone genuinely
 * serves", used by both the related-chip checks (blog.test.ts) and the
 * inline prose-link checks (blog-prose.test.ts, t81).
 *
 * OmniCraft tool routes exist for ALL tools — not-in-clone tools render
 * an honest status page at their route, which is a real page, not a 404.
 * Same rule for the tools tree: every reference viewer/converter/image-to
 * route serves a page stating its real status.
 */

import { OMNICRAFT_TOOLS } from "./omnicraft";
import { USE_CASE_ROUTES } from "./use-cases";
import { HELP_ARTICLE_SLUGS } from "./help";
import { BLOG_CATALOG } from "./blog-registry";
import { BLOG_CATEGORIES } from "./blog";
import {
  REFERENCE_CONVERTER_PAIRS,
  REFERENCE_IMAGE_TO_FORMATS,
  REFERENCE_VIEWER_FORMATS,
} from "./tools-registry";
import { STUDIO_PATH } from "./studio-path";

export const TOOL_ROUTES = OMNICRAFT_TOOLS.map((t) => `/workspace/omnicraft/${t.slug}`);
export const BLOG_ARTICLE_ROUTES = new Set(BLOG_CATALOG.map((e) => `/blog/${e.slug}`));
export const BLOG_CATEGORY_ROUTES = BLOG_CATEGORIES.map((c) => `/blog/category/${c.slug}`);

/** The tools-tree routes (viewer / converter pairs / image-to). */
export const TOOLS_TREE_ROUTES: string[] = [
  "/tools/viewer",
  "/tools/converter",
  ...REFERENCE_VIEWER_FORMATS.map((f) => `/tools/viewer/${f}`),
  ...REFERENCE_CONVERTER_PAIRS.map(([from, to]) => `/tools/converter/${from}/to/${to}`),
  ...REFERENCE_IMAGE_TO_FORMATS.map((f) => `/tools/image-to-${f}`),
];

export function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "" || base === STUDIO_PATH) return true;
  if (BLOG_ARTICLE_ROUTES.has(base)) return true;
  if (BLOG_CATEGORY_ROUTES.includes(base) || base === "/blog") return true;
  if (
    base === "/pricing" ||
    base === "/help" ||
    base === "/workspace/omnicraft" ||
    ["/help/getting-started", "/help/account-settings", "/help/billing", "/help/credit", "/help/features", "/help/enterprise"].includes(base)
  )
    return true;
  if (TOOL_ROUTES.includes(base)) return true;
  if (TOOLS_TREE_ROUTES.includes(base)) return true;
  if (USE_CASE_ROUTES.includes(base)) return true;
  if (HELP_ARTICLE_SLUGS.some((s) => `/help/articles/${s}` === base)) return true;
  if (base.startsWith("/features/") || base === "/features") return true;
  if (base.startsWith("/styles") || base.startsWith("/use-cases") || base.startsWith("/legal")) return true;
  return false;
}
