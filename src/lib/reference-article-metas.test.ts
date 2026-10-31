import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { REFERENCE_DESCRIPTIONS } from "./reference-descriptions";
import {
  REFERENCE_ARTICLE_METAS,
  referenceArticleMeta,
} from "./reference-article-metas";

/**
 * t78 — the byte-faithful reference OpenGraph article-meta registry, pinned.
 *
 * Recon 2026-10-31 (recon/t78/meta-probe.py): every URL in the census
 * (7,079 URLs) was probed for the article namespace, correlated with
 * og:type. 3,358 pages carry all three article metas — every one a blog
 * article route (EN + 11 locale variants); 396 help articles serve
 * og:type=article but NO article metas (the reference emits the
 * namespace on blog articles only), and /content-preview serves no
 * og:type at all.
 */

const PROBE = JSON.parse(
  readFileSync(join(process.cwd(), "recon/t78/meta-probe.json"), "utf-8"),
) as {
  metas: Record<
    string,
    {
      robots?: string;
      fb?: string;
      og_type?: string;
      article?: Record<string, string>;
      rss?: boolean;
    }
  >;
  bad: { url: string; status: number }[];
};

describe("reference-article-metas registry (t78)", () => {
  it("pins the full probe census: 3,358 blog articles", () => {
    expect(Object.keys(REFERENCE_ARTICLE_METAS)).toHaveLength(3358);
  });

  it("every key is a blog article path (EN or locale-prefixed)", () => {
    for (const key of Object.keys(REFERENCE_ARTICLE_METAS)) {
      const m = /^\/[a-z]{2}(?:-[a-z]{2})?\/blog\/.+/.exec(key);
      expect(m ?? (key.startsWith("/blog/") ? key : null), key).not.toBeNull();
    }
  });

  it("every entry carries all three metas as real values", () => {
    for (const [path, a] of Object.entries(REFERENCE_ARTICLE_METAS)) {
      expect(a.published.length, `published on ${path}`).toBeGreaterThan(0);
      expect(a.modified.length, `modified on ${path}`).toBeGreaterThan(0);
      expect(a.author.length, `author on ${path}`).toBeGreaterThan(0);
    }
  });

  it("published and modified are ISO-8601 UTC timestamps", () => {
    const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    for (const [path, a] of Object.entries(REFERENCE_ARTICLE_METAS)) {
      expect(a.published, `published on ${path}`).toMatch(ISO);
      expect(a.modified, `modified on ${path}`).toMatch(ISO);
    }
  });

  it("the registry equals the raw probe capture entry-for-entry", () => {
    const probeArticles = {
      ...Object.fromEntries(
        Object.entries(PROBE.metas).filter(([, r]) => "article" in r),
      ),
    };
    expect(Object.keys(probeArticles)).toHaveLength(3358);
    for (const [path, rec] of Object.entries(probeArticles)) {
      const art = rec.article as Record<string, string>;
      expect(REFERENCE_ARTICLE_METAS[path]?.published).toBe(
        art["article:published_time"],
      );
      expect(REFERENCE_ARTICLE_METAS[path]?.modified).toBe(
        art["article:modified_time"],
      );
      expect(REFERENCE_ARTICLE_METAS[path]?.author).toBe(
        art["article:author"],
      );
    }
  });

  it("registry ⊂ description registry — every pinned article is a censused page", () => {
    for (const path of Object.keys(REFERENCE_ARTICLE_METAS)) {
      expect(REFERENCE_DESCRIPTIONS[path], path).toBeDefined();
    }
  });

  it("the author census pinned: four real bylines", () => {
    const counts = new Map<string, number>();
    for (const a of Object.values(REFERENCE_ARTICLE_METAS)) {
      counts.set(a.author, (counts.get(a.author) ?? 0) + 1);
    }
    expect(counts.get("Hyper3D")).toBe(3328);
    expect(counts.get("Hyper3D News")).toBe(11);
    expect(counts.get("joel")).toBe(12);
    expect(counts.get("Hyper3D Team")).toBe(7);
  });

  it("published census pinned: 3,331 distinct timestamps of 3,358", () => {
    const distinct = new Set(
      Object.values(REFERENCE_ARTICLE_METAS).map((a) => a.published),
    );
    expect(distinct.size).toBe(3331);
  });

  it("modified census pinned: 629 distinct; 2,640 pages share the global rebuild", () => {
    const all = Object.values(REFERENCE_ARTICLE_METAS).map((a) => a.modified);
    expect(new Set(all).size).toBe(629);
    expect(all.filter((m) => m === "2026-06-25T21:05:48.398Z")).toHaveLength(
      2640,
    );
  });

  it("resolves and misses cleanly", () => {
    expect(referenceArticleMeta("/definitely-not-a-route")).toBeUndefined();
    expect(referenceArticleMeta("")).toBeUndefined();
    expect(referenceArticleMeta("/blog")).toBeUndefined();
    expect(referenceArticleMeta("/pricing")).toBeUndefined();
  });

  it("the honest exclusions: help articles carry og:type=article but NO article metas", () => {
    // The probe verified all 396 help-article pages (33 articles × 12
    // locales) serve og:type=article with no article namespace at all.
    expect(
      referenceArticleMeta(
        "/help/articles/are-credits-deducted-when-a-generation-fails",
      ),
    ).toBeUndefined();
    expect(
      referenceArticleMeta("/zh/help/articles/how-to-purchase-hyper3d-credits"),
    ).toBeUndefined();
    // and pinned in the raw probe: the og:type is article, the namespace absent
    const probeHelp = PROBE.metas[
      "/help/articles/are-credits-deducted-when-a-generation-fails"
    ];
    expect(probeHelp.og_type).toBe("article");
    expect(probeHelp.article).toBeUndefined();
  });

  it("/content-preview serves no og:type at all (the t76/t77 exclusion holds here too)", () => {
    expect(PROBE.metas["/content-preview"].og_type).toBeUndefined();
    expect(PROBE.metas["/content-preview"].article).toBeUndefined();
  });
});

describe("the t78 raw-probe census — robots, fb-verify, og:type, RSS link (pinned)", () => {
  it("7,078 pages probed; the only miss is the 405", () => {
    expect(Object.keys(PROBE.metas)).toHaveLength(7078);
    expect(PROBE.bad).toEqual([
      { url: "https://hyper3d.ai/content-preview/render", status: 405 },
    ]);
  });

  it("robots: 'index, follow' on 7,077 pages; the one noindex is /content-preview", () => {
    const idx = Object.entries(PROBE.metas).filter(
      ([, r]) => r.robots === "index, follow",
    );
    expect(idx).toHaveLength(7077);
    expect(PROBE.metas["/content-preview"].robots).toBe("noindex, nofollow");
  });

  it("facebook-domain-verification: one constant token on 7,077 pages", () => {
    const withFb = Object.entries(PROBE.metas).filter(([_, r]) => r.fb);
    expect(withFb).toHaveLength(7077);
    for (const [, r] of withFb) {
      expect(r.fb).toBe("lu7584v1wtckhvpsboezn5jbytqgf8");
    }
  });

  it("og:type census: website 3,323 / article 3,754 / absent 1", () => {
    const counts = new Map<string, number>();
    for (const r of Object.values(PROBE.metas)) {
      const t = r.og_type ?? "(absent)";
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    expect(counts.get("website")).toBe(3323);
    expect(counts.get("article")).toBe(3754);
    expect(counts.get("(absent)")).toBe(1);
  });

  it("article namespace = og:type=article minus the 396 help articles", () => {
    const withArticle = Object.values(PROBE.metas).filter((r) => r.article);
    expect(withArticle).toHaveLength(3358);
    // 3,754 article-typed = 3,358 blog + 396 help
    expect(3358 + 396).toBe(3754);
  });

  it("the RSS alternate link ships on 3,370 pages, every one in the /blog family", () => {
    const rss = Object.entries(PROBE.metas).filter(([, r]) => r.rss);
    expect(rss).toHaveLength(3370);
    for (const [path] of rss) {
      const m = /^\/[a-z]{2}(?:-[a-z]{2})?\/blog(\/|$)/.exec(path);
      expect(m ?? (path.startsWith("/blog") ? path : null), path).not.toBeNull();
    }
  });

  it("the 12 locale blog indexes + 3,358 articles carry the link (3,370 total)", () => {
    const rssIndexes = Object.keys(PROBE.metas).filter(
      (p) => PROBE.metas[p].rss && /^\/[a-z]{2}(?:-[a-z]{2})?\/blog$|^\/blog$/.test(p),
    );
    expect(rssIndexes).toHaveLength(12);
    expect(rssIndexes).toContain("/blog");
    expect(rssIndexes).toContain("/zh/blog");
  });
});

describe("reference-article-metas spot pins (t78)", () => {
  it("an EN original with the global rebuild modified date", () => {
    expect(referenceArticleMeta("/blog/zbrush-alternative")).toEqual({
      published: "2026-02-09T23:58:37.285Z",
      modified: "2026-06-25T21:05:48.398Z",
      author: "Hyper3D",
    });
  });

  it("a locale variant with its own translation-moment published date", () => {
    expect(referenceArticleMeta("/zh/blog/2d-image-to-3d-model-zh")).toEqual({
      published: "2026-05-14T17:43:00.329Z",
      modified: "2026-06-25T21:05:48.398Z",
      author: "Hyper3D",
    });
  });

  it("the joel byline — the photo-to-3d-model family", () => {
    expect(referenceArticleMeta("/blog/photo-to-3d-model")?.author).toBe(
      "joel",
    );
    expect(referenceArticleMeta("/fr/blog/photo-to-3d-model-fr")?.author).toBe(
      "joel",
    );
  });

  it("the Hyper3D News byline — the announcement family", () => {
    expect(referenceArticleMeta("/blog/hyper3d-shutterstock")?.author).toBe(
      "Hyper3D News",
    );
    expect(
      referenceArticleMeta("/ar/blog/hyper3d-shutterstock-ar")?.author,
    ).toBe("Hyper3D News");
    expect(
      referenceArticleMeta("/blog/hyper3d-featured-nvidia-lowes-ai-3d-workflow")
        ?.author,
    ).toBe("Hyper3D News");
  });

  it("the Hyper3D Team byline — some locale variants of the NVIDIA feature", () => {
    expect(
      referenceArticleMeta("/de/blog/hyper3d-featured-nvidia-lowes-ai-3d-workflow-de")
        ?.author,
    ).toBe("Hyper3D Team");
    expect(
      referenceArticleMeta("/zh/blog/hyper3d-featured-nvidia-lowes-ai-3d-workflow-zh")
        ?.author,
    ).toBe("Hyper3D Team");
  });

  it("an article with its own per-article modified date (not the global rebuild)", () => {
    expect(referenceArticleMeta("/blog/stl-file-for-3d-printing")).toEqual({
      published: "2026-02-09T23:59:13.285Z",
      modified: "2026-06-25T20:31:11.088Z",
      author: "Hyper3D",
    });
  });
});
