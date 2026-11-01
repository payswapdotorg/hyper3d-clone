import { describe, expect, it } from "vitest";

import { BLOG_ARTICLES } from "./blog-registry";
import { referenceOgImage } from "./reference-og-images";
import { referenceDescription } from "./reference-descriptions";
import { OG_BANNER_FALLBACK_URL } from "./schema-org";
import { CARD_SNIPPET_MAX, KEEP_READING_SLUGS, cardSnippet, relatedCard } from "./blog-related";

describe("the keep-reading class split (t81 recon)", () => {
  it("pins the 24 probed slugs whose reference counterpart ships the related-card section", () => {
    expect(KEEP_READING_SLUGS.size).toBe(24);
    for (const slug of KEEP_READING_SLUGS) {
      expect(BLOG_ARTICLES.some((a) => a.slug === slug), `${slug} is not a written article`).toBe(true);
    }
  });

  it("the split is the format/comparison/prompt class, not the platform/credits class", () => {
    // spot members from each side of the recon divide
    expect(KEEP_READING_SLUGS.has("what-is-glb-file")).toBe(true);
    expect(KEEP_READING_SLUGS.has("glb-vs-gltf")).toBe(true);
    expect(KEEP_READING_SLUGS.has("3d-text-prompt-guide")).toBe(true);
    expect(KEEP_READING_SLUGS.has("what-is-hyper3d")).toBe(false);
    expect(KEEP_READING_SLUGS.has("how-many-credits-does-each-hyper3d-generation-cost")).toBe(false);
    expect(KEEP_READING_SLUGS.has("how-to-reset-hyper3d-password")).toBe(false);
  });
});

describe("cardSnippet — the reference's 155+'...' snippet shape", () => {
  it("short descriptions pass through verbatim", () => {
    expect(cardSnippet("short")).toBe("short");
  });

  it("long descriptions cut at 155 chars and append three dots", () => {
    const d = "x".repeat(200);
    expect(cardSnippet(d)).toBe(`${"x".repeat(CARD_SNIPPET_MAX)}...`);
    expect(cardSnippet(d).length).toBe(158);
  });

  it("exactly-155 stays verbatim (the boundary)", () => {
    expect(cardSnippet("y".repeat(155))).toBe("y".repeat(155));
  });
});

describe("relatedCard — the honest card resolver", () => {
  it("resolves a not-written target: registry image, topic title, head description", () => {
    // what-is-glb-file's related links include the not-written OBJ sibling
    const card = relatedCard("/blog/what-is-obj-file")!;
    expect(card.image).toBe(referenceOgImage("/blog/what-is-obj-file"));
    expect(card.alt).toBe("what-is-obj-file");
    expect(card.title).toBeTruthy();
    expect(card.description).toBe(
      cardSnippet(referenceDescription("/blog/what-is-obj-file") ?? ""),
    );
  });

  it("resolves a written target with the clone's own on-page title", () => {
    const card = relatedCard("/blog/what-is-hyper3d")!;
    const own = BLOG_ARTICLES.find((a) => a.slug === "what-is-hyper3d")!;
    expect(card.title).toBe(own.title);
    expect(card.description).toBe(cardSnippet(referenceDescription("/blog/what-is-hyper3d") ?? own.description));
  });

  it("every written article's blog related links resolve to full cards", () => {
    for (const def of BLOG_ARTICLES) {
      for (const link of def.related) {
        if (!link.href.startsWith("/blog/") || link.href === "/blog") continue;
        const card = relatedCard(link.href);
        expect(card, `${def.slug} → ${link.href}`).toBeDefined();
        expect(card!.image).toMatch(/^https:\/\//);
        expect(card!.title.length).toBeGreaterThan(0);
        expect(card!.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("images are the t77 registry values (the destination's own og:image)", () => {
    for (const def of BLOG_ARTICLES) {
      for (const link of def.related) {
        const card = relatedCard(link.href);
        if (!card) continue;
        expect(card.image).toBe(referenceOgImage(link.href) ?? OG_BANNER_FALLBACK_URL);
      }
    }
  });

  it("non-blog hrefs and dead blog hrefs resolve to undefined (staying chips)", () => {
    expect(relatedCard("/pricing")).toBeUndefined();
    expect(relatedCard("/workspace/rodin")).toBeUndefined();
    expect(relatedCard("/blog/this-slug-does-not-exist")).toBeUndefined();
    expect(relatedCard("/blog")).toBeUndefined();
  });
});
