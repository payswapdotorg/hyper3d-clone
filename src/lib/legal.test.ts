import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { AGENTIC_COST, INITIAL_BALANCE, STANDARD_COST } from "./credits";
import {
  LEGAL_DOCUMENTS,
  REFERENCE_LEGAL_SLUGS,
  legalBySlug,
  legalRoutes,
  legalSlugs,
} from "./legal";
import { OMNICRAFT_TOOLS } from "./omnicraft";

const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** Flatten a document's text for content assertions. */
function docText(slug: string): string {
  const doc = legalBySlug(slug);
  if (!doc) throw new Error(`no legal doc ${slug}`);
  return [
    doc.title,
    doc.description,
    ...doc.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])]),
  ].join("\n");
}

describe("legal registry — reference parity", () => {
  it("exactly covers the reference's 5 legal documents (+ index route)", () => {
    expect(legalSlugs().sort()).toEqual([...REFERENCE_LEGAL_SLUGS].sort());
    expect(LEGAL_DOCUMENTS).toHaveLength(5);
    expect(legalRoutes()).toEqual([
      "/legal",
      "/legal/copyright-license",
      "/legal/fulfillment",
      "/legal/privacy",
      "/legal/refund",
      "/legal/terms",
    ]);
  });

  it("has unique slugs and names", () => {
    expect(new Set(legalSlugs()).size).toBe(legalSlugs().length);
    expect(new Set(LEGAL_DOCUMENTS.map((d) => d.name)).size).toBe(LEGAL_DOCUMENTS.length);
  });

  it("resolves every slug through legalBySlug and nothing else", () => {
    for (const slug of REFERENCE_LEGAL_SLUGS) {
      expect(legalBySlug(slug)?.slug).toBe(slug);
    }
    expect(legalBySlug("privacy-extra")).toBeUndefined();
    expect(legalBySlug("")).toBeUndefined();
  });

  it("every document has a title, description, updated date, and real sections", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      expect(doc.title.length).toBeGreaterThan(3);
      expect(doc.description.length).toBeGreaterThan(40);
      expect(doc.description.length).toBeLessThanOrEqual(180);
      expect(doc.updated).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
      expect(doc.sections.length).toBeGreaterThanOrEqual(4);
      for (const section of doc.sections) {
        expect(section.heading.length).toBeGreaterThan(3);
        expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
        expect(section.id).toMatch(/^[a-z][a-z0-9-]*$/);
      }
    }
  });

  it("section anchor ids are unique within each document (TOC targets valid)", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size, doc.slug).toBe(ids.length);
    }
  });
});

describe("legal content — tethered to the real ledger (honesty contract)", () => {
  it("terms states the real credit numbers from credits.ts", () => {
    const terms = docText("terms");
    for (const needle of [`${INITIAL_BALANCE} credits`, `${STANDARD_COST} credit`, `${AGENTIC_COST} credits`]) {
      expect(terms.includes(needle), needle).toBe(true);
    }
    // the two charging models, in the doc's own words
    expect(terms).toContain("charged at creation");
    expect(terms).toContain("Confirm & Export");
    expect(terms).toContain("No payment processing exists");
  });

  it("refund documents the two implemented automatic refund paths", () => {
    const refund = docText("refund");
    expect(refund).toContain("cancel_refund");
    expect(refund).toContain("Confirm & Export");
    expect(refund).toContain(`${INITIAL_BALANCE}`); // scope mentions the signup grant
    // and states the failure limitation honestly instead of hiding it
    expect(refund).toContain("does not automatically refund");
  });

  it("privacy states the actual auth mechanics (scrypt, one httpOnly cookie, 7 days)", () => {
    const privacy = docText("privacy");
    expect(privacy).toContain("scrypt");
    expect(privacy).toContain("httpOnly");
    expect(privacy).toContain("SameSite=Lax");
    expect(privacy).toContain("7-day");
    // AI processing disclosure + no trackers
    expect(privacy).toContain("AI backend");
    expect(privacy).toContain("no analytics trackers");
  });

  it("copyright and fulfillment reference the same metering numbers", () => {
    const copyright = docText("copyright-license");
    expect(copyright).toContain(`${STANDARD_COST} credit per standard task`);
    expect(copyright).toContain(`${INITIAL_BALANCE} granted at signup`);
    const fulfillment = docText("fulfillment");
    expect(fulfillment).toContain(`${STANDARD_COST} credit standard`);
    expect(fulfillment).toContain("Cancel");
    expect(fulfillment).toContain("no payment");
  });
});

describe("legal wiring — footer, sitemap, routes", () => {
  it("public/sitemap.xml lists every legal route with absolute URLs", () => {
    const xml = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    for (const route of legalRoutes()) {
      expect(xml.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), route).toBe(true);
    }
  });

  it("the studio footer's LEGAL column routes to real pages (no toasts)", () => {
    const studio = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "studio", "studio.tsx"),
      "utf8",
    );
    expect(studio).toContain(`["Privacy", "/legal/privacy"]`);
    expect(studio).toContain(`["Terms", "/legal/terms"]`);
    expect(studio).not.toContain(`stubToast("Privacy")`);
    expect(studio).not.toContain(`stubToast("Terms")`);
  });

  it("the legal route's generateStaticParams source covers exactly the registry", () => {
    const route = readFileSync(
      join(process.cwd(), "src", "app", "legal", "[slug]", "page.tsx"),
      "utf8",
    );
    expect(route).toContain("legalSlugs()");
    expect(route).toContain("legalBySlug(slug)");
    expect(route).toContain("notFound()");
    // and the registry is the only slug source (no hardcoded literals)
    for (const slug of legalSlugs()) {
      expect(route.includes(`"${slug}"`), slug).toBe(false);
    }
  });

  it("legal slugs cannot collide with live OmniCraft tool routes", () => {
    const toolRoutes = OMNICRAFT_TOOLS.filter((t) => t.status === "live").map(
      (t) => `/omnicraft/${t.slug}`,
    );
    for (const route of legalRoutes()) {
      expect(toolRoutes, route).not.toContain(route);
    }
  });
});
