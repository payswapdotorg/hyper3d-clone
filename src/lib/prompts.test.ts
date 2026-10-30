import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  HUB_PAGE_SIZE,
  MODEL_DISPLAY_NAME,
  PROMPT_ARTICLES,
  PROMPT_CATALOG,
  PROMPT_CENSUS,
  PROMPT_HUBS,
  PROMPT_PAGE_COUNT,
  PROMPT_PAGE_SIZE,
  PROMPT_VIDEO_REFS,
  findPromptEntry,
  findPromptHub,
  isPromptIndexPage,
  promptHubMembers,
  promptHubPage,
  promptModels,
  promptPage,
} from "./prompts-registry";
import {
  REFERENCE_HUB_CLAIMED,
  REFERENCE_HUB_MEMBERS,
  REFERENCE_HUB_ORDER,
  REFERENCE_PROMPT_SLUGS,
  WRITTEN_PROMPT_SLUGS,
} from "./prompts-registry-data";
import { STYLE_PAGES } from "./styles";
import { EFFORTS, EXPORT_FORMATS } from "./hyper3d";
import {
  promptArticleJsonLd,
  promptHubJsonLd,
  promptsIndexJsonLd,
  promptsIndexPageJsonLd,
} from "./schema-org";

/* ------------------------------------------------------------------ */
/* The census — computed from the generated data, never hand-set       */
/* -------------------------------------------------------------------- */

describe("prompt registry — the 403-route census (t69)", () => {
  it("pins the tree: 403 details, 36 written, 367 community, 421 memberships", () => {
    expect(PROMPT_CENSUS.total).toBe(403);
    expect(PROMPT_CENSUS.written).toBe(36);
    expect(PROMPT_CENSUS.community).toBe(367);
    expect(PROMPT_CENSUS.memberships).toBe(421);
    expect(PROMPT_CATALOG).toHaveLength(403);
  });

  it("the registry slugs are unique — the reference route set exactly", () => {
    expect(new Set(REFERENCE_PROMPT_SLUGS).size).toBe(403);
    expect(PROMPT_CATALOG.every((e) => REFERENCE_PROMPT_SLUGS.includes(e.slug))).toBe(true);
  });

  it("the written set matches the curated data exactly", () => {
    expect(PROMPT_ARTICLES).toHaveLength(36);
    expect(new Set(PROMPT_ARTICLES.map((a) => a.slug)).size).toBe(36);
    expect(new Set(WRITTEN_PROMPT_SLUGS).size).toBe(36);
    for (const article of PROMPT_ARTICLES) {
      expect(REFERENCE_PROMPT_SLUGS).toContain(article.slug);
    }
  });

  it("every hub's crawled membership equals the reference's own claimed count", () => {
    expect(REFERENCE_HUB_ORDER).toHaveLength(11);
    for (const model of REFERENCE_HUB_ORDER) {
      expect(REFERENCE_HUB_MEMBERS[model], model).toHaveLength(REFERENCE_HUB_CLAIMED[model]);
    }
    const total = REFERENCE_HUB_ORDER.reduce((n, m) => n + REFERENCE_HUB_MEMBERS[m].length, 0);
    expect(total).toBe(421);
    // every membership points at a real route
    for (const model of REFERENCE_HUB_ORDER) {
      for (const slug of REFERENCE_HUB_MEMBERS[model]) {
        expect(REFERENCE_PROMPT_SLUGS).toContain(slug);
      }
    }
  });

  it("hub display info carries the crawled pagination (astra 11, fable-5.1 4, rest 1)", () => {
    expect(PROMPT_HUBS).toHaveLength(11);
    const astra = findPromptHub("gpt-6-astra")!;
    expect(astra.claimed).toBe(252);
    expect(astra.pages).toBe(11);
    const fable = findPromptHub("claude-fable-5.1")!;
    expect(fable.claimed).toBe(83);
    expect(fable.pages).toBe(4);
    for (const hub of PROMPT_HUBS) {
      if (hub.slug !== "gpt-6-astra" && hub.slug !== "claude-fable-5.1") {
        expect(hub.pages).toBe(1);
        expect(hub.claimed).toBeLessThanOrEqual(24);
      }
    }
    expect(MODEL_DISPLAY_NAME["gpt-6-astra"]).toBe("GPT-6 Astra");
    expect(MODEL_DISPLAY_NAME["kimi-k3"]).toBe("Kimi K3");
  });

  it("model association is factual route data for every entry", () => {
    for (const entry of PROMPT_CATALOG) {
      const models = promptModels(entry.slug);
      expect(models.length).toBeGreaterThanOrEqual(1);
      for (const model of models) {
        expect(Object.values(MODEL_DISPLAY_NAME)).toContain(model);
      }
    }
    // a known multi-model route
    expect(promptModels("ai-and-the-curious-girl").sort()).toEqual(["Claude Opus 5.5", "GPT-6 Sol"].sort());
  });
});

/* ------------------------------------------------------------------ */
/* Pagination math                                                     */
/* -------------------------------------------------------------------- */

describe("prompt pagination — the reference's own math", () => {
  it("16 × 24 + 19 = 403 across 17 pages", () => {
    expect(PROMPT_PAGE_SIZE).toBe(24);
    expect(PROMPT_PAGE_COUNT).toBe(17);
    expect(promptPage(1)).toHaveLength(24);
    expect(promptPage(17)).toHaveLength(19);
    expect(promptPage(18)).toEqual([]);
    expect(promptPage(0)).toEqual([]);
    // written-first: page 1 is all written prompts
    expect(promptPage(1).every((e) => e.family === "written")).toBe(true);
  });

  it("numeric slugs 2..17 are index pages; 1, 18, and names are not", () => {
    expect(isPromptIndexPage("2")).toBe(true);
    expect(isPromptIndexPage("17")).toBe(true);
    expect(isPromptIndexPage("1")).toBe(false);
    expect(isPromptIndexPage("18")).toBe(false);
    expect(isPromptIndexPage("0")).toBe(false);
    expect(isPromptIndexPage("battle-city-3d")).toBe(false);
    expect(isPromptIndexPage("models")).toBe(false);
  });

  it("hub pagination slices members at 24 per page (astra: 10 × 24 + 12)", () => {
    expect(HUB_PAGE_SIZE).toBe(24);
    const astra = findPromptHub("gpt-6-astra")!;
    expect(promptHubMembers(astra)).toHaveLength(252);
    expect(promptHubPage(astra, 1)).toHaveLength(24);
    expect(promptHubPage(astra, 11)).toHaveLength(12);
    expect(promptHubPage(astra, 12)).toEqual([]);
    expect(promptHubPage(astra, 0)).toEqual([]);
    const fable = findPromptHub("claude-fable-5.1")!;
    expect(promptHubPage(fable, 4)).toHaveLength(83 - 3 * 24);
  });
});

/* ------------------------------------------------------------------ */
/* The written articles — copy discipline                             */
/* -------------------------------------------------------------------- */

describe("written prompt articles — original prompts that run here", () => {
  it("every prompt is lowercase-comma prose — the shape the prompt box expects", () => {
    for (const article of PROMPT_ARTICLES) {
      expect(article.prompt, article.slug).toMatch(/^[a-z]/);
      expect(article.prompt, article.slug).toContain(",");
      expect(article.prompt.length).toBeGreaterThanOrEqual(40);
    }
  });

  it("titles, descriptions, and blurbs are this clone's own (unique, sized)", () => {
    const titles = new Set(PROMPT_ARTICLES.map((a) => a.title));
    expect(titles.size).toBe(36);
    for (const article of PROMPT_ARTICLES) {
      expect(article.description.length).toBeGreaterThanOrEqual(80);
      expect(article.description.length).toBeLessThanOrEqual(200);
      expect(article.blurb.length).toBeGreaterThanOrEqual(40);
    }
  });

  it("3-6 keywords, 2-3 notes with real bodies, 2-4 related links each", () => {
    for (const article of PROMPT_ARTICLES) {
      expect(article.keywords.length).toBeGreaterThanOrEqual(3);
      expect(article.keywords.length).toBeLessThanOrEqual(6);
      expect(article.notes.length).toBeGreaterThanOrEqual(2);
      expect(article.notes.length).toBeLessThanOrEqual(3);
      for (const note of article.notes) {
        expect(note.title.length).toBeGreaterThanOrEqual(10);
        expect(note.body.length).toBeGreaterThanOrEqual(120);
      }
      expect(article.related.length).toBeGreaterThanOrEqual(2);
      expect(article.related.length).toBeLessThanOrEqual(4);
    }
  });

  it("every related link resolves against the real route registries", () => {
    const styleSlugs = STYLE_PAGES.map((s) => s.slug);
    const writtenSlugs = new Set(WRITTEN_PROMPT_SLUGS);
    for (const article of PROMPT_ARTICLES) {
      for (const link of article.related) {
        const ok =
          /^\/features\/(text-to-3d|image-to-3d|worldgen|chatavatar|omnicraft\/ai-hdri-generator)$/.test(link.href) ||
          /^\/use-cases\/[a-z0-9-]+$/.test(link.href) ||
          /^\/styles\/[a-z0-9-]+$/.test(link.href) && styleSlugs.includes(link.href.slice("/styles/".length)) ||
          /^\/blog\/[a-z0-9-]+$/.test(link.href) ||
          /^\/help\/articles\/[a-z0-9-]+$/.test(link.href) ||
          /^\/3d-prompts\/[a-z0-9-]+$/.test(link.href) && writtenSlugs.has(link.href.slice("/3d-prompts/".length)) ||
          link.href === "/3d-prompts" ||
          link.href === "/blog/generate-3d-game-assets" ||
          link.href === "/blog/what-is-glb" ||
          link.href === "/blog/what-is-fbx" ||
          link.href === "/blog/what-is-stl";
        expect(ok, `${article.slug}: ${link.href}`).toBe(true);
      }
    }
  });

  it("craft notes anchor to the real studio facts (efforts, credits, exports, styles)", () => {
    const allNotes = PROMPT_ARTICLES.flatMap((a) => a.notes.map((n) => n.body)).join("\n");
    // the five real effort tiers' second-marks appear verbatim
    for (const effort of EFFORTS) {
      expect(allNotes).toContain(`${effort.seconds} second`);
    }
    expect(allNotes).toMatch(/1[- ]credit/);
    expect(allNotes).toContain("preview");
    for (const format of ["GLB", "FBX", "STL"]) {
      expect(allNotes).toContain(format);
    }
    expect(EXPORT_FORMATS).toContain("GLB");
    // style pages the notes point at exist
    expect(STYLE_PAGES.map((s) => s.slug)).toContain("voxel");
    expect(STYLE_PAGES.map((s) => s.slug)).toContain("low-poly");
  });

  it("the groups cover the four subjects with sane counts", () => {
    const groups = PROMPT_ARTICLES.reduce<Record<string, number>>((acc, a) => {
      acc[a.group] = (acc[a.group] ?? 0) + 1;
      return acc;
    }, {});
    expect(Object.keys(groups).sort()).toEqual(["characters", "dioramas", "environments", "props"]);
    expect(groups.characters).toBe(10);
    expect(groups.props).toBe(10);
    expect(groups.environments).toBe(10);
    expect(groups.dioramas).toBe(6);
    for (const article of PROMPT_ARTICLES) {
      expect(["text", "image", "scene"]).toContain(article.mode);
    }
  });
});

/* ------------------------------------------------------------------ */
/* The honest community pages                                          */
/* -------------------------------------------------------------------- */

describe("community routes — honestly not reproduced", () => {
  it("no community route carries an article def", () => {
    const written = new Set(WRITTEN_PROMPT_SLUGS);
    for (const entry of PROMPT_CATALOG) {
      if (entry.family === "community") {
        expect(entry.article).toBeUndefined();
        expect(written.has(entry.slug)).toBe(false);
        // a display title exists (the reference's card title as route data)
        expect(entry.title.length).toBeGreaterThan(0);
      }
    }
  });

  it("the community renderer never ships a prompt box — pinned at source level", () => {
    const view = readFileSync(
      join(process.cwd(), "src", "components", "hyper3d", "prompts", "prompt-page.tsx"),
      "utf8",
    );
    const communityFn = view.split("export function PromptCommunityPage")[1] ?? "";
    expect(communityFn).not.toContain("CopyPromptButton");
    expect(communityFn).not.toContain("data-copy-prompt");
    expect(communityFn).toContain("NOT REPRODUCED HERE");
    // and the written renderer does use the real copy island
    const writtenFn = view.split("export function PromptArticlePage")[1]?.split("export function PromptCommunityPage")[0] ?? "";
    expect(writtenFn).toContain("CopyPromptButton");
  });
});

/* ------------------------------------------------------------------ */
/* Sitemap parity — the tree stays OUT, as on the reference            */
/* -------------------------------------------------------------------- */

describe("sitemap parity — the reference keeps the tree unsitemapped", () => {
  it("static-en carries the bare /3d-prompts and zero child routes", () => {
    const xml = readFileSync(join(process.cwd(), "public", "landing-sitemap-static-en.xml"), "utf8");
    expect(xml).toContain("https://hyper3d-clone.vercel.app/3d-prompts</loc>");
    expect(xml).not.toMatch(/\/3d-prompts\/[a-z0-9]/);
  });

  it("no sitemap child file lists prompt routes — no prompts sitemap exists", () => {
    const index = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    expect(index).not.toContain("prompts");
    const staticIndex = readFileSync(join(process.cwd(), "public", "landing-sitemap-index.xml"), "utf8");
    expect(staticIndex).not.toContain("prompts");
  });
});

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                    */
/* -------------------------------------------------------------------- */

describe("prompt JSON-LD — CreativeWork only for written prompts", () => {
  const sample = PROMPT_ARTICLES[0];

  it("a written page carries CreativeWork + BreadcrumbList with real data", () => {
    const blocks = promptArticleJsonLd(sample);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]["@type"]).toBe("CreativeWork");
    expect(blocks[0].keywords).toBe(sample.keywords.join(", "));
    expect(blocks[0].url).toBe(`https://hyper3d-clone.vercel.app/3d-prompts/${sample.slug}`);
    expect(blocks[1]["@type"]).toBe("BreadcrumbList");
    expect(blocks[1].itemListElement[0].name).toBe("All prompts");
  });

  it("the index serves CollectionPage + a 3-step HowTo; pages 2+ the Page-N pair", () => {
    const steps = [{ title: "a", body: "b" }, { title: "c", body: "d" }, { title: "e", body: "f" }];
    const index = promptsIndexJsonLd("d", steps);
    expect(index.map((b) => b["@type"])).toEqual(["CollectionPage", "HowTo", "BreadcrumbList"]);
    expect(index[1].step).toHaveLength(3);
    const page2 = promptsIndexPageJsonLd(2, "d");
    expect(page2.map((b) => b["@type"])).toEqual(["CollectionPage", "BreadcrumbList"]);
    expect(page2[0].name).toContain("Page 2");
  });

  it("hubs serve CollectionPage + the All-prompts breadcrumb", () => {
    const blocks = promptHubJsonLd(findPromptHub("gpt-6-astra")!);
    expect(blocks.map((b) => b["@type"])).toEqual(["CollectionPage", "BreadcrumbList"]);
    expect(blocks[0].name).toContain("GPT-6 Astra");
    expect(blocks[0].description).toContain("252");
    expect(blocks[1].itemListElement).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------ */
/* The external curation                                               */
/* -------------------------------------------------------------------- */

describe("the reference's creator-review curation — external links only", () => {
  it("six entries, all external YouTube links, all labeled external", () => {
    expect(PROMPT_VIDEO_REFS).toHaveLength(6);
    for (const video of PROMPT_VIDEO_REFS) {
      expect(video.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      expect(video.model.length).toBeGreaterThan(0);
      expect(video.title.length).toBeGreaterThan(10);
      expect(video.blurb.length).toBeGreaterThan(40);
      expect(video.creator.length).toBeGreaterThan(2);
    }
  });
});

/* ------------------------------------------------------------------ */
/* Route wiring — params come from the registries                      */
/* -------------------------------------------------------------------- */

describe("route wiring — registries are the single source of truth", () => {
  const slugRoute = readFileSync(
    join(process.cwd(), "src", "app", "3d-prompts", "[slug]", "page.tsx"),
    "utf8",
  );
  const hubRoute = readFileSync(
    join(process.cwd(), "src", "app", "3d-prompts", "models", "[model]", "page.tsx"),
    "utf8",
  );
  const hubPageRoute = readFileSync(
    join(process.cwd(), "src", "app", "3d-prompts", "models", "[model]", "[page]", "page.tsx"),
    "utf8",
  );
  const indexView = readFileSync(
    join(process.cwd(), "src", "components", "hyper3d", "landing", "prompts-page.tsx"),
    "utf8",
  );

  it("the [slug] route dispatches from the registry and reserves models", () => {
    expect(slugRoute).toContain("findPromptEntry");
    expect(slugRoute).toContain("PROMPT_CATALOG");
    expect(slugRoute).toContain("PROMPT_RESERVED_SLUGS");
    expect(slugRoute).toContain("notFound()");
    expect(slugRoute).toContain("isPromptIndexPage");
  });

  it("the hub routes source members and page math from the generated data", () => {
    expect(hubRoute).toContain("findPromptHub");
    expect(hubRoute).toContain("REFERENCE_HUB_MEMBERS");
    expect(hubPageRoute).toContain("HUB_PAGE_SIZE");
    expect(hubPageRoute).toContain("n < 2");
    expect(hubPageRoute).toContain("n > hub.pages");
  });

  it("the index view stays a server component and reuses the real copy island", () => {
    expect(indexView).not.toContain('"use client"');
    expect(indexView).toContain("CopyPromptButton");
    expect(indexView).toContain("PROMPT_VIDEO_REFS");
    expect(indexView).toContain("PROMPT_HUBS");
    expect(indexView).toContain('id="prompt-library"');
  });

  it("findPromptEntry resolves a written, a community, and rejects an unknown slug", () => {
    expect(findPromptEntry("kana-pixel-rabbit-archer")?.family).toBe("written");
    expect(findPromptEntry("ai-and-the-curious-girl")?.family).toBe("community");
    expect(findPromptEntry("not-a-real-prompt")).toBeUndefined();
  });
});
