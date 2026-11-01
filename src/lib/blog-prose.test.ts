import { describe, expect, it } from "vitest";

import { parseProse, proseHrefs, proseLinkCount } from "./blog-prose";
import { BLOG_ARTICLES } from "./blog-registry";
import {
  BLOG_ARTICLE_ROUTES,
  BLOG_CATEGORY_ROUTES,
  TOOL_ROUTES,
  isKnownRoute,
} from "./blog.test-helpers";
import { KEEP_READING_SLUGS } from "./blog-related";

describe("blog prose parser — the markdown-lite link syntax", () => {
  it("plain strings round-trip as a single text run", () => {
    expect(parseProse("no links here")).toEqual([{ kind: "text", text: "no links here" }]);
    expect(parseProse("")).toEqual([]);
  });

  it("parses one link with surrounding text, order-preserving", () => {
    expect(parseProse("see [the guide](/blog/guide) now")).toEqual([
      { kind: "text", text: "see " },
      { kind: "link", text: "the guide", href: "/blog/guide", external: false },
      { kind: "text", text: " now" },
    ]);
  });

  it("parses multiple links in one paragraph", () => {
    const runs = parseProse("[a](/x) and [b](/y)");
    expect(runs.filter((r) => r.kind === "link")).toHaveLength(2);
    expect(proseHrefs("[a](/x) and [b](/y)")).toEqual(["/x", "/y"]);
  });

  it("classifies internal vs external hrefs", () => {
    const runs = parseProse("[in](/features) [out](https://example.com) [mail](mailto:a@b.c)");
    const links = runs.filter((r): r is Extract<(typeof runs)[number], { kind: "link" }> => r.kind === "link");
    expect(links.map((l) => l.external)).toEqual([false, true, true]);
  });

  it("never emits empty text runs", () => {
    for (const run of parseProse("[a](/x)[b](/y) mid [c](/z)")) {
      if (run.kind === "text") expect(run.text.length).toBeGreaterThan(0);
    }
  });

  it("adjacent-link-only paragraphs parse without stray text", () => {
    expect(parseProse("[a](/x)[b](/y)")).toEqual([
      { kind: "link", text: "a", href: "/x", external: false },
      { kind: "link", text: "b", href: "/y", external: false },
    ]);
  });
});

describe("written-article inline links — the t81 content invariants", () => {
  it("every written article carries at least one inline prose link", () => {
    for (const def of BLOG_ARTICLES) {
      const n = def.sections.reduce((sum, s) => sum + s.paragraphs.reduce((m, p) => m + proseLinkCount(p), 0), 0);
      expect(n, `${def.slug} has zero inline links`).toBeGreaterThan(0);
    }
  });

  it("the 24 class-A articles (reference ships the related-card section) carry at least two", () => {
    for (const def of BLOG_ARTICLES) {
      if (!KEEP_READING_SLUGS.has(def.slug)) continue;
      const n = def.sections.reduce((sum, s) => sum + s.paragraphs.reduce((m, p) => m + proseLinkCount(p), 0), 0);
      expect(n, `${def.slug} (class A) has only ${n} inline links`).toBeGreaterThanOrEqual(2);
    }
  });

  it("every inline href points at a route that genuinely exists in this clone", () => {
    for (const def of BLOG_ARTICLES) {
      for (const section of def.sections) {
        for (const paragraph of section.paragraphs) {
          for (const href of proseHrefs(paragraph)) {
            expect(isKnownRoute(href), `${def.slug} → ${href}`).toBe(true);
          }
        }
      }
    }
  });

  it("inline blog links resolve to catalog entries (no dead cross-links)", () => {
    for (const def of BLOG_ARTICLES) {
      for (const section of def.sections) {
        for (const paragraph of section.paragraphs) {
          for (const href of proseHrefs(paragraph)) {
            if (href.startsWith("/blog/")) {
              const slug = href.slice("/blog/".length);
              expect(BLOG_ARTICLE_ROUTES.has(href), `${def.slug} → ${href}`).toBe(true);
              expect(slug, `${def.slug} → ${slug}`).toMatch(/^[a-z0-9-]+$/);
            }
          }
        }
      }
    }
  });

  it("inline links use the same route vocabulary the related chips use (no new families)", () => {
    const hrefs = new Set<string>();
    for (const def of BLOG_ARTICLES) {
      for (const section of def.sections) {
        for (const paragraph of section.paragraphs) {
          for (const href of proseHrefs(paragraph)) hrefs.add(href);
        }
      }
    }
    // spot-assert the families the reference's own prose links use, all present here
    expect([...hrefs].some((h) => h.startsWith("/tools/"))).toBe(true);
    expect([...hrefs].some((h) => h.startsWith("/workspace/omnicraft/"))).toBe(true);
    expect([...hrefs].some((h) => h.startsWith("/features/"))).toBe(true);
    expect([...hrefs].some((h) => h.startsWith("/blog/"))).toBe(true);
    // category routes exist for any stray category link
    expect(BLOG_CATEGORY_ROUTES.length).toBe(12);
    expect(TOOL_ROUTES.length).toBeGreaterThan(0);
  });
});
