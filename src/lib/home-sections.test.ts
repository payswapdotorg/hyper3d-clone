import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { EXPORT_FORMATS } from "./hyper3d";
import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import { findHelpArticle, HELP_ARTICLE_SLUGS } from "./help";
import { findStylePage, STYLE_SLUGS } from "./styles";
import { findUseCasePage, USE_CASE_SLUGS } from "./use-cases";
import { WORKSPACE_TAB_ROUTES } from "./workspace-tabs";
import {
  FAQ_STILL_HAVE_QUESTIONS_HREF,
  HOME_FAQS,
  LIVE_CHAT_STATUS,
  POPULAR_QUESTIONS,
  RESEARCH_INTRO,
  RESEARCH_LEARN_MORE_HREF,
  WHY_CHOOSE_CARDS,
  WORKFLOW_CARDS,
} from "./home-sections";

/**
 * t73 — the homepage's second half + the contact dock's question list.
 *
 * Recon 2026-10-31 (static-HTML diff of the reference homepage +
 * agent-walking /workspace/contact-us): four sections were missing
 * after the CTA band, and the FAQ's closing link exposed a route this
 * clone 404'd. These tests pin the data contracts, the honest-copy
 * invariants, and the wiring that renders both surfaces.
 */

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

const marketingSrc = read("../components/hyper3d/landing/marketing-home.tsx");
const headerSrc = read("../components/hyper3d/site-header.tsx");

/* ------------------------------------------------------ why choose */

describe("t73 Why Choose Hyper3D? — the reference's five benefit cards", () => {
  it("carries exactly the reference's five titles, in order", () => {
    expect(WHY_CHOOSE_CARDS.map((c) => c.title)).toEqual([
      "High-Fidelity 3D",
      "One-Click Simplicity",
      "Multiple Export Formats",
      "Lightning-Fast Results",
      "Free to Start",
    ]);
  });

  it("anchors the export and credit claims to the real constants", () => {
    const exportCard = WHY_CHOOSE_CARDS.find((c) => c.title === "Multiple Export Formats");
    for (const f of EXPORT_FORMATS) {
      expect(exportCard?.body).toContain(f);
    }
    const freeCard = WHY_CHOOSE_CARDS.find((c) => c.title === "Free to Start");
    expect(freeCard?.body).toContain(`${INITIAL_BALANCE} credits`);
    expect(freeCard?.body).toContain(`${STANDARD_COST} credit`);
    expect(freeCard?.body).toContain(`${AGENTIC_COST}`);
  });

  it("every card body is substantive (no empty benefit)", () => {
    for (const card of WHY_CHOOSE_CARDS) {
      expect(card.body.length).toBeGreaterThanOrEqual(80);
    }
  });
});

/* ------------------------------------------------------- workflows */

describe("t73 Built for Every 3D Workflow — the four clickable cards", () => {
  it("carries the reference's four titles with its exact href mapping", () => {
    expect(WORKFLOW_CARDS.map((c) => [c.title, c.href])).toEqual([
      ["Game Developers", "/use-cases/game-development"],
      ["Product Teams", "/use-cases/e-commerce"],
      ["Architecture & Education", "/use-cases/3d-printing"],
      ["Artists & 3D Printing", "/styles/stylized"],
    ]);
  });

  it("every href resolves to a page this clone really serves", () => {
    for (const card of WORKFLOW_CARDS) {
      const resolved =
        (card.href.startsWith("/use-cases/") && findUseCasePage(card.href.replace("/use-cases/", ""))) ||
        (card.href.startsWith("/styles/") && findStylePage(card.href.replace("/styles/", "")));
      expect(resolved).toBeTruthy();
    }
    expect(USE_CASE_SLUGS).toContain("game-development");
    expect(USE_CASE_SLUGS).toContain("e-commerce");
    expect(USE_CASE_SLUGS).toContain("3d-printing");
    expect(STYLE_SLUGS).toContain("stylized");
  });
});

/* -------------------------------------------------------- research */

describe("t73 Research-Backed 3D Generation — the CTA target", () => {
  it("Learn More lands on the research tab route (t72)", () => {
    expect(RESEARCH_LEARN_MORE_HREF).toBe(WORKSPACE_TAB_ROUTES.research);
    expect(RESEARCH_LEARN_MORE_HREF).toBe("/workspace/rodin/tab/research");
  });

  it("the intro names the real research line (Rodin, CLAY, CAST)", () => {
    expect(RESEARCH_INTRO).toContain("Rodin");
    expect(RESEARCH_INTRO).toContain("CLAY");
    expect(RESEARCH_INTRO).toContain("CAST");
  });
});

/* ------------------------------------------------------------- FAQ */

describe("t73 the homepage FAQ — the reference's eight questions, answered honestly", () => {
  it("carries exactly eight items", () => {
    expect(HOME_FAQS).toHaveLength(8);
  });

  it("mirrors the reference's eight question topics, in order", () => {
    expect(HOME_FAQS[0].question).toContain("What makes Hyper3D useful for 3D generation?");
    expect(HOME_FAQS[1].question).toContain("What kind of image works best");
    expect(HOME_FAQS[2].question).toContain("more than one image");
    expect(HOME_FAQS[3].question).toContain("What can I export");
    expect(HOME_FAQS[4].question).toContain("commercial projects");
    expect(HOME_FAQS[5].question).toContain("improve the quality");
    expect(HOME_FAQS[6].question).toContain("artists, or can developers");
    expect(HOME_FAQS[7].question).toContain("after generating a model");
  });

  it("the export answer names every format the exporters really write", () => {
    const exportFaq = HOME_FAQS[3];
    for (const f of EXPORT_FORMATS) {
      expect(exportFaq.answer).toContain(f);
    }
  });

  it("the pricing-flavored answers stay anchored to the real credit model", () => {
    expect(HOME_FAQS[0].answer).toContain(`${STANDARD_COST} credit`);
    expect(HOME_FAQS[0].answer).toContain(`${AGENTIC_COST}`);
    expect(HOME_FAQS[5].answer).toContain("Extreme-Low");
    expect(HOME_FAQS[5].answer).toContain("Extreme-High");
  });

  it("honest-copy invariant: no FAQ answer invents a support channel or a payment", () => {
    for (const item of HOME_FAQS) {
      expect(item.answer).not.toMatch(/(?:your|our) (?:support team|live chat|invoice)/i);
      expect(item.answer).not.toMatch(/(?:refund|charge|bill) you/i);
    }
  });

  it("the closing CTA points at the reference's contact route", () => {
    expect(FAQ_STILL_HAVE_QUESTIONS_HREF).toBe("/workspace/contact-us");
  });
});

/* --------------------------------------- the contact dock's FAQ list */

describe("t73 Popular Questions — the dock's 21-question scroll", () => {
  it("carries the reference's full list (21 items, probed 2026-10-31)", () => {
    expect(POPULAR_QUESTIONS).toHaveLength(21);
  });

  it("pins the reference's question texts verbatim (a representative slice)", () => {
    const questions = POPULAR_QUESTIONS.map((q) => q.question);
    expect(questions).toContain("How can I contact you?");
    expect(questions).toContain(
      "My education email did not pass verification. What should I do?",
    );
    expect(questions).toContain("Credits Management and Usage — Q3: Can credits be refunded?");
    expect(questions).toContain(
      "Data Protection and User Privacy Policies — Q1: Does the platform train AI using user-uploaded data?",
    );
    expect(questions).toContain("How can I use a redemption code?");
    expect(questions).toContain("Is there a free trial available?");
    expect(questions).toContain("What is your refund policy?");
    expect(questions).toContain(
      "Why can’t I cancel my subscription renewal immediately?",
    );
  });

  it("every question ends with a question mark", () => {
    for (const q of POPULAR_QUESTIONS) {
      expect(q.question.endsWith("?")).toBe(true);
    }
  });

  it("every helpHref resolves to a real help-center article", () => {
    for (const q of POPULAR_QUESTIONS) {
      if (!q.helpHref) continue;
      expect(q.helpHref.startsWith("/help/articles/")).toBe(true);
      const slug = q.helpHref.replace("/help/articles/", "");
      expect(HELP_ARTICLE_SLUGS).toContain(slug);
      expect(findHelpArticle(slug)).toBeTruthy();
    }
  });

  it("honest-copy invariant: billing questions get the no-payments truth, never a process", () => {
    const billing = POPULAR_QUESTIONS.filter((q) =>
      /refund|subscription|invoice|redemption|plan|bot/i.test(q.question),
    );
    expect(billing.length).toBeGreaterThanOrEqual(10);
    for (const q of billing) {
      expect(q.answer).toMatch(/no payment|nothing to (?:refund|cancel|wait for)|there (?:are|is) no|cannot|no store|no subscription|no bot|has no/i);
      expect(q.answer).not.toMatch(/(?:your|the) (?:invoice|payment method|billing cycle)/i);
    }
  });

  it("the Live Chat away card carries the reference's two status lines", () => {
    expect(LIVE_CHAT_STATUS.away).toBe("We are away at the moment");
    expect(LIVE_CHAT_STATUS.back).toBe("We will be back as soon as possible");
  });
});

/* ----------------------------------------------------- the wiring */

describe("t73 wiring — the landing renders its second half", () => {
  it("the four section headings render, in the reference's order", () => {
    /* search after the component body starts — the file's doc comment
       names the same sections (and would shadow the order check). */
    const body = marketingSrc.slice(marketingSrc.indexOf("export function MarketingHome"));
    const order = [
      "Imagine It.",
      "Why Choose Hyper3D?",
      "Built for Every 3D Workflow",
      "Research-Backed 3D Generation",
      "Frequently Asked Questions",
    ];
    let last = -1;
    for (const heading of order) {
      const idx = body.indexOf(heading);
      expect(idx).toBeGreaterThan(last);
      last = idx;
    }
  });

  it("the FAQ renders as the reference's accordion (details/summary)", () => {
    expect(marketingSrc).toContain("HOME_FAQS.map");
    expect(marketingSrc).toContain("<details");
    expect(marketingSrc).toContain("<summary");
  });

  it("the FAQ's closing link uses the pinned contact route", () => {
    expect(marketingSrc).toContain("FAQ_STILL_HAVE_QUESTIONS_HREF");
    expect(marketingSrc).toContain("Chat with our team.");
  });

  it("the workflow cards and why-choose cards render from the registries", () => {
    expect(marketingSrc).toContain("WORKFLOW_CARDS.map");
    expect(marketingSrc).toContain("WHY_CHOOSE_CARDS.map");
    expect(marketingSrc).toContain("RESEARCH_LEARN_MORE_HREF");
    expect(marketingSrc).toContain("RESEARCH_INTRO");
  });
});

describe("t73 wiring — the header's mega-menu ships in the served HTML", () => {
  it("the three dropdown panels render unconditionally (no closed-state null)", () => {
    expect(headerSrc).toContain('<NavPanel open={open === "products"}>');
    expect(headerSrc).toContain('<NavPanel open={open === "features"} wide>');
    expect(headerSrc).toContain('<NavPanel open={open === "resources"} wide>');
    expect(headerSrc).not.toContain("{open === \"products\" ?");
    expect(headerSrc).not.toContain("{open === \"features\" ?");
    expect(headerSrc).not.toContain("{open === \"resources\" ?");
  });

  it("NavPanel hides closed panels with CSS, not by unmounting", () => {
    expect(headerSrc).toContain("open: boolean");
    expect(headerSrc).toContain('open ? "" : "hidden"');
  });
});
