import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import { EXPORT_FORMATS } from "./exporters";
import { featureSlugs } from "./features";
import { legalSlugs } from "./legal";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { findStylePage } from "./styles";
import { findUseCasePage } from "./use-cases";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_CATEGORY_SLUGS,
  HELP_ROUTES,
  HELP_STATUS_META,
  POPULAR_HELP_SLUGS,
  REFERENCE_HELP_ARTICLES,
  REFERENCE_HELP_ARTICLE_SLUGS,
  findHelpArticle,
  findHelpCategory,
  helpArticlesByCategory,
} from "./help";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The clone's genuinely live OmniCraft tool routes. */
const LIVE_TOOL_ROUTES = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
  (t) => `/omnicraft/${t.slug}`,
);

/** Every route a help article may cross-link to, verified against the
 * registries that actually render those routes. */
function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "") return true; // studio root
  if (base === "/help" || base === "/features" || base === "/omnicraft" || base === "/legal")
    return true;
  if (base === "/use-cases" || base === "/styles") return true;
  if (base.startsWith("/help/articles/")) {
    return findHelpArticle(base.slice("/help/articles/".length)) !== undefined;
  }
  if (base.startsWith("/help/")) {
    return findHelpCategory(base.slice("/help/".length)) !== undefined;
  }
  if (base.startsWith("/omnicraft/")) return LIVE_TOOL_ROUTES.includes(base);
  if (base.startsWith("/features/")) return featureSlugs().includes(base.slice("/features/".length));
  if (base.startsWith("/legal/")) return legalSlugs().includes(base.slice("/legal/".length));
  if (base.startsWith("/use-cases/")) {
    return findUseCasePage(base.slice("/use-cases/".length)) !== undefined;
  }
  if (base.startsWith("/styles/")) {
    return findStylePage(base.slice("/styles/".length)) !== undefined;
  }
  return false;
}

/** Flatten an article's text for content assertions. */
function articleText(slug: string): string {
  const article = findHelpArticle(slug);
  if (!article) throw new Error(`no help article ${slug}`);
  return [
    article.title,
    article.description,
    article.answer,
    ...article.sections.flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.steps ?? []).flatMap((st) => [st.title, st.body]),
      ...(s.note ? [s.note] : []),
    ]),
  ].join("\n");
}

describe("help registry — reference parity", () => {
  it("exactly covers the reference's 33 articles and 6 topic hubs (+ index route)", () => {
    expect(HELP_ARTICLES.map((a) => a.slug).sort()).toEqual(
      [...REFERENCE_HELP_ARTICLE_SLUGS].sort(),
    );
    expect(HELP_ARTICLES).toHaveLength(33);
    expect(HELP_CATEGORY_SLUGS).toEqual([
      "getting-started",
      "account-settings",
      "billing",
      "credit",
      "features",
      "enterprise",
    ]);
    expect(HELP_ROUTES).toEqual([
      "/help",
      ...HELP_CATEGORIES.map((c) => `/help/${c.slug}`),
      ...HELP_ARTICLES.map((a) => `/help/articles/${a.slug}`),
    ]);
    expect(HELP_ROUTES).toHaveLength(40);
  });

  it("keeps the reference's own category membership for every article", () => {
    for (const ref of REFERENCE_HELP_ARTICLES) {
      const article = findHelpArticle(ref.slug);
      expect(article, ref.slug).toBeDefined();
      expect(article?.category, ref.slug).toBe(ref.category);
    }
    // per-category counts match the reference grouping (6/2/4/6/14/1)
    expect(helpArticlesByCategory("getting-started")).toHaveLength(6);
    expect(helpArticlesByCategory("account-settings")).toHaveLength(2);
    expect(helpArticlesByCategory("billing")).toHaveLength(4);
    expect(helpArticlesByCategory("credit")).toHaveLength(6);
    expect(helpArticlesByCategory("features")).toHaveLength(14);
    expect(helpArticlesByCategory("enterprise")).toHaveLength(1);
  });

  it("has unique slugs and resolves lookups (and nothing else)", () => {
    expect(new Set(HELP_ARTICLES.map((a) => a.slug)).size).toBe(33);
    for (const slug of REFERENCE_HELP_ARTICLE_SLUGS) {
      expect(findHelpArticle(slug)?.slug).toBe(slug);
    }
    expect(findHelpArticle("how-to-do-stuff")).toBeUndefined();
    expect(findHelpArticle("")).toBeUndefined();
    expect(findHelpCategory("getting-started")?.slug).toBe("getting-started");
    expect(findHelpCategory("articles")).toBeUndefined(); // /help/articles is not a hub
    expect(findHelpCategory("misc")).toBeUndefined();
  });

  it("every article has the full anatomy (title, description, answer, sections, related, updated)", () => {
    for (const article of HELP_ARTICLES) {
      expect(article.title.length, article.slug).toBeGreaterThan(8);
      expect(article.description.length, article.slug).toBeGreaterThan(40);
      expect(article.description.length, article.slug).toBeLessThanOrEqual(180);
      expect(article.answer.length, article.slug).toBeGreaterThanOrEqual(80);
      expect(article.sections.length, article.slug).toBeGreaterThanOrEqual(2);
      for (const section of article.sections) {
        expect(section.heading.length, article.slug).toBeGreaterThan(4);
        expect(section.paragraphs.length, article.slug).toBeGreaterThanOrEqual(1);
        for (const paragraph of section.paragraphs) {
          expect(paragraph.length, article.slug).toBeGreaterThan(60);
        }
        if (section.steps) {
          expect(section.steps.length, article.slug).toBeGreaterThanOrEqual(3);
        }
      }
      expect(article.related.length, article.slug).toBeGreaterThanOrEqual(2);
      expect(article.updated, article.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("help content — the honesty contract", () => {
  it("statuses: 13 live, 7 partial, 13 not-in-clone — the exact split", () => {
    const live = HELP_ARTICLES.filter((a) => a.status === "live").map((a) => a.slug).sort();
    const partial = HELP_ARTICLES.filter((a) => a.status === "partial").map((a) => a.slug).sort();
    const absent = HELP_ARTICLES.filter((a) => a.status === "not-in-clone").map((a) => a.slug).sort();
    expect(live).toEqual(
      [
        "what-is-hyper3d",
        "how-to-use-hyper3d-beginners-guide",
        "what-features-does-hyper3d-have",
        "official-hyper3d-links-and-scam-safety",
        "how-many-credits-does-each-hyper3d-generation-cost",
        "do-hyper3d-credits-expire",
        "are-credits-deducted-when-a-generation-fails",
        "are-credits-returned-after-canceling-a-generation",
        "why-did-my-hyper3d-generation-fail",
        "create-3d-models-from-images-with-rodin",
        "create-3d-models-from-text-with-rodin",
        "create-hdri-skyboxes-with-omnicraft",
        "fix-common-hyper3d-export-problems",
      ].sort(),
    );
    expect(partial).toEqual(
      [
        "how-to-get-support-from-hyper3d",
        "how-to-request-a-hyper3d-refund",
        "how-to-check-hyper3d-credit-history",
        "choose-rodin-model-and-generation-settings",
        "connect-hyper3d-rodin-mcp-to-ai-agents",
        "import-models-into-hyper3d-tools",
        "use-rodin-agentic-mode-for-image-to-3d",
      ].sort(),
    );
    expect(absent).toEqual(
      [
        "does-hyper3d-support-languages-besides-english",
        "can-i-log-in-to-hyper3d-with-a-verification-code",
        "how-to-reset-hyper3d-password",
        "how-much-do-hyper3d-plans-cost",
        "how-to-purchase-hyper3d-credits",
        "what-happens-to-credits-when-changing-plans",
        "control-topology-polycount-and-lods",
        "create-3d-avatars-with-chatavatar",
        "create-editable-scenes-with-hyper3d-worldgen",
        "edit-3d-models-in-rodin-workspace",
        "edit-3d-models-with-omnicraft-mesh-editor",
        "use-bang-and-partial-edit",
        "how-to-get-hyper3d-enterprise-support",
      ].sort(),
    );
  });

  it("every 'not-in-clone' article opens with the honest verdict, not a fake how-to", () => {
    for (const article of HELP_ARTICLES.filter((a) => a.status === "not-in-clone")) {
      expect(article.answer, article.slug).toMatch(
        /^(No\.|You can't|You cannot|There (is|are) no|This clone has no|Nothing|ChatAvatar|BANG|WorldGen|The (Rodin workspace|Mesh Editor))/i,
      );
      expect(article.answer, article.slug).toMatch(
        /not (in this clone|a |implemented|offered|exist)|no |does not|has no|cannot/i,
      );
    }
  });

  it("credit numbers match the real metering constants (50 / 1 / 10)", () => {
    const cost = articleText("how-many-credits-does-each-hyper3d-generation-cost");
    expect(cost).toContain(String(INITIAL_BALANCE));
    expect(cost).toContain(String(STANDARD_COST));
    expect(cost).toContain(String(AGENTIC_COST));
    expect(cost).toMatch(/free/i);
    // the agentic article states the real agentic price too
    const agentic = articleText("use-rodin-agentic-mode-for-image-to-3d");
    expect(agentic).toContain(String(AGENTIC_COST));
    // the beginner guide anchors the same numbers
    const guide = articleText("how-to-use-hyper3d-beginners-guide");
    expect(guide).toContain(String(INITIAL_BALANCE));
    expect(guide).toContain("1 credit");
  });

  it("failure and cancel semantics match the real routes", () => {
    const fail = articleText("are-credits-deducted-when-a-generation-fails");
    expect(fail).toMatch(/0 credits/i);
    expect(fail).toMatch(/pay-by-result/i);
    const cancel = articleText("are-credits-returned-after-canceling-a-generation");
    expect(cancel).toMatch(/in full/i);
    expect(cancel).toContain("409");
    const refund = articleText("how-to-request-a-hyper3d-refund");
    expect(refund).toMatch(/cancel_refund|in full/i);
  });

  it("auth articles state the real auth surface (no codes, no reset, scrypt, 7-day cookie)", () => {
    const codes = articleText("can-i-log-in-to-hyper3d-with-a-verification-code");
    expect(codes).toMatch(/email and password/i);
    expect(codes).toMatch(/scrypt/i);
    expect(codes).toMatch(/httpOnly/i);
    expect(codes).toMatch(/7-day|7 days/i);
    const reset = articleText("how-to-reset-hyper3d-password");
    expect(reset).toMatch(/no password-reset/i);
  });

  it("billing articles refuse to invent prices or payment paths", () => {
    const plans = articleText("how-much-do-hyper3d-plans-cost");
    expect(plans).toMatch(/no plans and no prices/i);
    expect(plans).toMatch(/no payment processing/i);
    const purchase = findHelpArticle("how-to-purchase-hyper3d-credits");
    expect(purchase?.answer).toMatch(/^You cannot/i);
    expect(articleText("how-to-purchase-hyper3d-credits")).toContain(String(INITIAL_BALANCE));
  });

  it("topology honesty: no polycount slider, no LOD claims", () => {
    const topo = articleText("control-topology-polycount-and-lods");
    expect(topo).toMatch(/no polycount slider/i);
    expect(topo).toMatch(/no LOD/i);
    const settings = articleText("choose-rodin-model-and-generation-settings");
    expect(settings).toMatch(/no polycount|polycount targets/i);
  });

  it("absent-feature articles say absent in their own text (mesh editor, worldgen, chatavatar, BANG, enterprise)", () => {
    expect(articleText("edit-3d-models-with-omnicraft-mesh-editor")).toMatch(/not-in-clone|not in this clone/i);
    expect(articleText("create-editable-scenes-with-hyper3d-worldgen")).toMatch(/not implemented/i);
    expect(articleText("create-3d-avatars-with-chatavatar")).toMatch(/does not exist|not implemented|no portrait-to-avatar/i);
    expect(articleText("use-bang-and-partial-edit")).toMatch(/not in this clone/i);
    expect(articleText("how-to-get-hyper3d-enterprise-support")).toMatch(/no enterprise (tier|offering)/i);
  });

  it("the HDRI article keeps the procedural-not-AI honesty", () => {
    const hdri = articleText("create-hdri-skyboxes-with-omnicraft");
    expect(hdri).toMatch(/procedural/i);
    expect(hdri).toMatch(/local/i);
    expect(hdri).toMatch(/not.*AI|no image-generation/i);
  });

  it("the language article answers English-only; the scam article states non-affiliation", () => {
    const lang = articleText("does-hyper3d-support-languages-besides-english");
    expect(lang).toMatch(/English-only/i);
    expect(articleText("official-hyper3d-links-and-scam-safety")).toMatch(/not affiliated/i);
  });

  it("format claims match the real exporter set, and the MCP endpoint is the modal's real one", () => {
    const exports = articleText("fix-common-hyper3d-export-problems");
    for (const format of EXPORT_FORMATS) {
      expect(exports, format).toContain(format.toUpperCase());
    }
    const mcp = articleText("connect-hyper3d-rodin-mcp-to-ai-agents");
    expect(mcp).toContain("api.hyper3d.com/api/mcp");
    const modal = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "mcp-connect-modal.tsx"),
      "utf8",
    );
    expect(modal).toContain("api.hyper3d.com/api/mcp");
  });

  it("OmniCraft cross-links only target LIVE tools (no dead tool pages)", () => {
    for (const article of HELP_ARTICLES) {
      for (const link of article.related) {
        if (link.href.startsWith("/omnicraft/")) {
          expect(LIVE_TOOL_ROUTES, `${article.slug} → ${link.href}`).toContain(link.href);
        }
      }
    }
  });

  it("every related link points at a route that genuinely exists", () => {
    for (const article of HELP_ARTICLES) {
      for (const link of article.related) {
        expect(isKnownRoute(link.href), `${article.slug} → ${link.href}`).toBe(true);
      }
    }
  });
});

describe("help wiring — footer, sitemap, routes", () => {
  it("public/landing-sitemap-static-en.xml lists all 40 help routes with absolute URLs", () => {
    // t67: help routes live in the static family child (reference partitioning).
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-static-en.xml"),
      "utf8",
    );
    for (const route of HELP_ROUTES) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    // 46 reference routes (home, prompts, event, help ×40, pricing, switch ×2)
    // + /omnicraft and the four live tools this clone adds = 51
    expect(xml.match(/<url>/g)?.length).toBe(51);
  });

  it("the studio footer's HELP column routes to real pages (no toasts)", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain(`heading: "HELP"`);
    expect(studio).toContain(`["Help Center", "/help"]`);
    expect(studio).toContain(`["Getting Started", "/help/getting-started"]`);
    expect(studio).toContain(`["Credit & billing", "/help/credit"]`);
    expect(studio).not.toContain(`stubToast("Help Center")`);
  });

  it("both SSG routes source their params from the registry, not literals", () => {
    const articleRoute = readFileSync(
      join(process.cwd(), "src", "app", "help", "articles", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(articleRoute).toContain("HELP_ARTICLE_SLUGS");
    expect(articleRoute).toContain("findHelpArticle(slug)");
    expect(articleRoute).toContain("notFound()");
    const categoryRoute = readFileSync(
      join(process.cwd(), "src", "app", "help", "[category]", "page.tsx"),
      "utf8",
    );
    expect(categoryRoute).toContain("HELP_CATEGORY_SLUGS");
    expect(categoryRoute).toContain("findHelpCategory(category)");
    expect(categoryRoute).toContain("notFound()");
    for (const slug of REFERENCE_HELP_ARTICLE_SLUGS) {
      expect(articleRoute.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("help routes cannot collide with the other content trees", () => {
    const others = ["/features", "/legal", "/omnicraft", "/use-cases", "/styles"];
    for (const route of HELP_ROUTES) {
      expect(others.some((p) => route.startsWith(p)), route).toBe(false);
    }
  });

  it("the index's popular band lists only real articles", () => {
    expect(POPULAR_HELP_SLUGS.every((slug) => findHelpArticle(slug) !== undefined)).toBe(true);
    expect(POPULAR_HELP_SLUGS).toHaveLength(6);
  });

  it("status chip labels stay in the three-way honesty vocabulary", () => {
    expect(HELP_STATUS_META.live.chip).toBe("WORKS HERE");
    expect(HELP_STATUS_META.partial.chip).toBe("PARTIAL HERE");
    expect(HELP_STATUS_META["not-in-clone"].chip).toBe("NOT IN THIS CLONE");
  });
});
