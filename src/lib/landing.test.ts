import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import { EXPORT_FORMATS } from "./exporters";
import { featureSlugs } from "./features";
import { LANDING_PRICING_PAGE, LANDING_PROMPTS_PAGE, landingRoutes, REFERENCE_LANDING_ROUTES, SWITCH_PAGES, EVENT_PAGES } from "./landing";
import { legalSlugs } from "./legal";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { findStylePage } from "./styles";
import { findUseCasePage } from "./use-cases";
import { findHelpArticle, findHelpCategory } from "./help";
import { findPromptEntry, isPromptIndexPage } from "./prompts-registry";
import { STUDIO_PATH } from "./studio-path";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The clone's genuinely live OmniCraft tool routes. */
const LIVE_TOOL_ROUTES = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
  (t) => `/workspace/omnicraft/${t.slug}`,
);

/** Every route a landing page may cross-link to — same resolver family
 * as help.test.ts, plus the five landing routes themselves (t62). */
function isKnownRoute(href: string): boolean {
  const base = href.split(/[?#]/)[0];
  if (base === "/" || base === "" || base === STUDIO_PATH) return true; // studio root
  if (
    base === "/help" ||
    base === "/features" ||
    base === "/workspace/omnicraft" ||
    base === "/legal" ||
    base === "/use-cases" ||
    base === "/styles" ||
    base === "/pricing" ||
    base === "/3d-prompts" ||
    base === "/switch"
  )
    return true;
  if (base.startsWith("/3d-prompts/")) {
    // t69: the prompt library — index pagination pages (2..17) and the
    // 403 detail routes from the registry.
    if (/^\d+$/.test(base.slice("/3d-prompts/".length))) {
      return isPromptIndexPage(base.slice("/3d-prompts/".length));
    }
    return findPromptEntry(base.slice("/3d-prompts/".length)) !== undefined;
  }
  if (base.startsWith("/help/articles/")) {
    return findHelpArticle(base.slice("/help/articles/".length)) !== undefined;
  }
  if (base.startsWith("/help/")) {
    return findHelpCategory(base.slice("/help/".length)) !== undefined;
  }
  if (base.startsWith("/workspace/omnicraft/")) return LIVE_TOOL_ROUTES.includes(base);
  if (base.startsWith("/features/")) return featureSlugs().includes(base.slice("/features/".length));
  if (base.startsWith("/legal/")) return legalSlugs().includes(base.slice("/legal/".length));
  if (base.startsWith("/use-cases/")) {
    return findUseCasePage(base.slice("/use-cases/".length)) !== undefined;
  }
  if (base.startsWith("/styles/")) {
    return findStylePage(base.slice("/styles/".length)) !== undefined;
  }
  if (base.startsWith("/switch/") || base.startsWith("/event/")) {
    return landingRoutes().includes(base);
  }
  return false;
}

/** Flatten the pricing page for content assertions. */
function pricingText(): string {
  const page = LANDING_PRICING_PAGE;
  return [
    page.description,
    String(page.hero.subhead),
    ...page.onlyPlan.features,
    ...page.absentTiers.flatMap((t) => [t.name, t.referencePrice, t.why, t.nearest.label]),
    ...page.priceList.flatMap((r) => [r.action, r.cost, r.detail ?? ""]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
    page.closing.body,
  ].join("\n");
}

/** Flatten the prompts page for content assertions. */
function promptsText(): string {
  const page = LANDING_PROMPTS_PAGE;
  return [
    page.description,
    String(page.hero.subhead),
    ...page.featured.flatMap((p) => [p.title, p.prompt, p.why]),
    ...page.examples.flatMap((p) => [p.title, p.prompt, p.why]),
    ...page.steps.flatMap((s) => [s.title, s.body]),
    page.note,
    page.closing.body,
  ].join("\n");
}

/** Flatten a switch page for content assertions. */
function switchText(slug: string): string {
  const page = SWITCH_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`no switch page ${slug}`);
  return [
    page.description,
    String(page.hero.subhead),
    ...page.offerPoints.flatMap((p) => [p.referencePromise, p.hereStatus]),
    ...page.table.flatMap((r) => [r.action, r.cost, r.detail ?? ""]),
    ...page.realItems.flatMap((i) => [i.title, i.body]),
    ...page.faqs.flatMap((f) => [f.question, f.answer]),
    page.closing.body,
  ].join("\n");
}

describe("landing registry — reference parity (t62)", () => {
  it("exactly covers the reference's five standalone landing routes", () => {
    expect(landingRoutes().sort()).toEqual([...REFERENCE_LANDING_ROUTES].sort());
    expect(landingRoutes()).toHaveLength(5);
  });

  it("the switch tree is index + makerworld, nothing invented", () => {
    expect(SWITCH_PAGES.map((p) => p.slug).sort()).toEqual(["index", "makerworld"]);
    expect(SWITCH_PAGES.map((p) => p.route)).toEqual(["/switch", "/switch/makerworld"]);
  });

  it("the event tree is chroma-awards only, with no /event index", () => {
    expect(EVENT_PAGES.map((p) => p.slug)).toEqual(["chroma-awards"]);
    expect(EVENT_PAGES.map((p) => p.route)).toEqual(["/event/chroma-awards"]);
    expect(landingRoutes().includes("/event")).toBe(false);
  });
});

describe("pricing page — honest anti-pricing (t62)", () => {
  it("states there are no plans, no subscriptions, and no payment processing", () => {
    const text = pricingText();
    expect(text).toContain("no pricing tiers");
    expect(text).toContain("no subscription to cancel");
    expect(text).toContain("no purchase flow");
    expect(text).toContain("no payment processing");
  });

  it("quotes the real metering numbers that match the imported constants", () => {
    const text = pricingText();
    expect(text).toContain(`${INITIAL_BALANCE} credits`);
    expect(text).toContain(`${STANDARD_COST} credit`);
    expect(text).toContain(`${AGENTIC_COST} credits`);
    // the codebase's own free-preview rule, verbatim from credits.ts
    expect(text).toContain("previews free");
  });

  it("lists all six real export formats by name", () => {
    const text = pricingText();
    for (const format of EXPORT_FORMATS) {
      expect(text).toContain(format.toUpperCase());
    }
  });

  it("shows the reference's four paid tiers once each, marked absent", () => {
    const names = LANDING_PRICING_PAGE.absentTiers.map((t) => t.name);
    expect(names).toEqual(["Creator", "Business", "Enterprise", "Education"]);
    for (const tier of LANDING_PRICING_PAGE.absentTiers) {
      expect(tier.why).toMatch(/no .*(plan|tier|program|verification|deployment)/i);
    }
  });

  it("the price list says you cannot buy more credits", () => {
    const buyRow = LANDING_PRICING_PAGE.priceList.find((r) => r.action === "Buy more credits");
    expect(buyRow?.cost).toBe("you can't");
    expect(buyRow?.detail).toContain("no payment processor");
  });

  it("answers at least four pricing questions honestly", () => {
    expect(LANDING_PRICING_PAGE.faqs.length).toBeGreaterThanOrEqual(4);
    const noAnswers = LANDING_PRICING_PAGE.faqs.filter((f) =>
      f.answer.match(/^No[.\u2014]|^You cannot\./),
    );
    expect(noAnswers.length).toBeGreaterThanOrEqual(3);
  });
});

describe("3d-prompts page — real prompts for the real studio (t62)", () => {
  it("features the studio's own placeholder prompts, verbatim", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    for (const example of LANDING_PROMPTS_PAGE.featured) {
      expect(studio, example.title).toContain(example.prompt);
    }
  });

  it("ships at least a dozen example prompts across the four categories", () => {
    expect(LANDING_PROMPTS_PAGE.examples.length).toBeGreaterThanOrEqual(12);
    const categories = new Set(LANDING_PROMPTS_PAGE.examples.map((e) => e.category));
    expect([...categories].sort()).toEqual(["characters", "environments", "props", "stylized"]);
    for (const example of LANDING_PROMPTS_PAGE.examples) {
      expect(example.prompt.length).toBeGreaterThanOrEqual(20);
      expect(example.why.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("every prompt is lowercase-comma prose — the shape the prompt box expects", () => {
    for (const example of [...LANDING_PROMPTS_PAGE.featured, ...LANDING_PROMPTS_PAGE.examples]) {
      expect(example.prompt).toMatch(/^[a-z]/);
      expect(example.prompt).toContain(",");
    }
  });

  it("the three how-to steps name the real costs and the real export set", () => {
    const steps = LANDING_PROMPTS_PAGE.steps.map((s) => s.body).join("\n");
    expect(LANDING_PROMPTS_PAGE.steps).toHaveLength(3);
    expect(steps).toContain(`${STANDARD_COST} credit`);
    expect(steps).toContain("GLB");
    expect(steps).toContain("STL");
  });

  it("the note states what is absent: no community content, hubs are parity, no embeds (t69)", () => {
    const note = LANDING_PROMPTS_PAGE.note;
    expect(note).toContain("no community content is reproduced");
    expect(note).toContain("not a filter");
    expect(note).toContain("no video embeds");
  });

  it("the copy button is a real client island with a real clipboard write", () => {
    const island = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "landing", "copy-prompt-button.tsx"),
      "utf8",
    );
    expect(island).toContain('"use client"');
    expect(island).toContain("navigator.clipboard");
    // and the server page imports it rather than inlining a handler
    const view = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "landing", "prompts-page.tsx"),
      "utf8",
    );
    expect(view).not.toContain('"use client"');
    expect(view).toContain("CopyPromptButton");
  });
});

describe("switch pages — offers honestly absent (t62)", () => {
  it("/switch opens with the no-offer verdict", () => {
    const text = switchText("index");
    expect(String(SWITCH_PAGES[0].hero.subhead)).toContain("There is no switch offer here");
    expect(text).toContain("no profile-link checker");
    expect(text).toContain("no subscriptions");
  });

  it("/switch/makerworld opens with the no-program verdict", () => {
    const makerworld = SWITCH_PAGES.find((p) => p.slug === "makerworld");
    expect(makerworld).toBeDefined();
    expect(String(makerworld?.hero.subhead)).toContain("no such program");
    expect(switchText("makerworld")).toContain("no model-count tiers");
  });

  it("every offer point on both pages is marked Not here", () => {
    for (const page of SWITCH_PAGES) {
      expect(page.offerPoints.length).toBeGreaterThanOrEqual(4);
      for (const point of page.offerPoints) {
        expect(point.hereStatus).toMatch(/^Not here\.|^The one part/);
      }
    }
  });

  it("the makerworld table keeps the print claims honest", () => {
    const makerworld = SWITCH_PAGES.find((p) => p.slug === "makerworld");
    const table = makerworld?.table ?? [];
    const stlRow = table.find((r) => r.action === "STL export");
    expect(stlRow?.cost).toMatch(/^Yes/);
    expect(EXPORT_FORMATS).toContain("stl");
    const polyRow = table.find((r) => r.action.includes("10 million faces"));
    expect(polyRow?.cost).toBe("No");
    expect(switchText("makerworld")).toMatch(/no polycount slider/i);
    expect(switchText("makerworld")).toContain("No polycount targeting");
  });

  it("both pages cross-link to each other and to the price list", () => {
    const switchView = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "landing", "switch-page.tsx"),
      "utf8",
    );
    expect(switchView).toContain('href="/switch/makerworld"');
    expect(switchView).toContain('href="/switch"');
    expect(switchView).toContain('href="/pricing"');
  });
});

describe("event page — partnership honestly absent (t62)", () => {
  it("states there is no partnership, no codes, no deadline", () => {
    const event = EVENT_PAGES[0];
    const text = String(event.hero.subhead);
    expect(text).toContain("no partnership");
    expect(text).toContain("no redemption codes");
    expect(text).toContain("no deadline");
  });

  it("inverts all four of the reference's event promises", () => {
    const event = EVENT_PAGES[0];
    expect(event.absentPromises).toHaveLength(4);
    for (const promise of event.absentPromises) {
      expect(promise.hereReality).toMatch(/^(There is no|There are no|This clone is backed)/);
    }
  });

  it("the FAQ answers the affiliation question with a plain No", () => {
    const affiliation = EVENT_PAGES[0].faqs.find((f) =>
      f.question.includes("affiliated with the Chroma Awards"),
    );
    expect(affiliation).toBeDefined();
    expect(affiliation?.answer.startsWith("No.")).toBe(true);
  });
});

describe("landing wiring — footer, sitemap, routes, cross-links", () => {
  it("every CTA and cross-link on all five pages resolves to a real route", () => {
    const hrefs: string[] = [];
    for (const page of [LANDING_PRICING_PAGE, LANDING_PROMPTS_PAGE, ...SWITCH_PAGES, ...EVENT_PAGES]) {
      hrefs.push(page.hero.primaryCta.href);
      if (page.hero.secondaryCta) hrefs.push(page.hero.secondaryCta.href);
      if ("closing" in page) hrefs.push(page.closing.cta.href);
    }
    for (const tier of LANDING_PRICING_PAGE.absentTiers) hrefs.push(tier.nearest.href);
    for (const link of LANDING_PROMPTS_PAGE.noteLinks) hrefs.push(link.href);
    hrefs.push(LANDING_PRICING_PAGE.onlyPlan.cta.href);
    for (const workflow of EVENT_PAGES[0].workflows) hrefs.push(workflow.href);
    for (const href of hrefs) {
      expect(isKnownRoute(href), href).toBe(true);
    }
  });

  it("public/landing-sitemap-static-en.xml lists all five landing routes with absolute URLs", () => {
    // t67: the monolith became a 90-child sitemap index; the landing routes
    // (pricing / prompts / switch / event) live in the static family child.
    const xml = readFileSync(
      join(process.cwd(), "public", "landing-sitemap-static-en.xml"),
      "utf8",
    );
    for (const route of landingRoutes()) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
    // 46 reference routes + content-preview ×2 − the five retired omnicraft
    // locs (t71: the reference removed them and 301s the routes) = 48
    expect(xml.match(/<url>/g)?.length).toBe(48);
  });

  it("the studio footer's PRODUCT column links Pricing to the real page", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain(`["Pricing", "/pricing"]`);
    expect(studio).not.toContain(`stubToast("Pricing")`);
  });

  it("the SSG routes source their params from the registry, not literals", () => {
    const switchRoute = readFileSync(
      join(process.cwd(), "src", "app", "switch", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(switchRoute).toContain("generateStaticParams");
    expect(switchRoute).toContain("SWITCH_PAGES");
    expect(switchRoute).not.toMatch(/slug:\s*["']makerworld["']/);

    const eventRoute = readFileSync(
      join(process.cwd(), "src", "app", "event", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(eventRoute).toContain("generateStaticParams");
    expect(eventRoute).toContain("EVENT_PAGES");
    expect(eventRoute).not.toMatch(/slug:\s*["']chroma-awards["']/);
  });
});
