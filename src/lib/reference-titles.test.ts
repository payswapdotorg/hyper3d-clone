import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  REFERENCE_TITLES,
  referenceCardTitle,
  referenceTitle,
  TITLE_SUFFIX,
} from "./reference-titles";

/**
 * t75 — the byte-faithful reference <title> registry, pinned.
 *
 * Recon 2026-10-31: every URL in the reference's own landing-sitemap
 * tree (90 children, 7,067 URLs, 12 locales x 8 families) was probed
 * live; 7,066 carried a title. The one miss is /content-preview/render,
 * which the reference itself answers with HTTP 405 to a plain GET while
 * this clone serves its own page — so the registry intentionally has no
 * entry there and the route keeps its template title.
 *
 * The registry boundary is exact and pinned both ways below:
 *   registry == (sitemap paths - /content-preview/render) + 12 /tools
 * where the twelve bare /tools indexes (EN + 11 locales) are the
 * separately-probed served-but-not-sitemapped extension (the t70 gap).
 */

/** This clone's production origin (the sitemap locs' absolute base). */
const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/** The reference's one probe miss — served here, 405 there. */
const REFERENCE_405_PATH = "/content-preview/render";

/** The twelve served-but-not-sitemapped /tools indexes. */
const TOOLS_INDEX_PATHS = [
  "/tools",
  "/ar/tools",
  "/de/tools",
  "/es/tools",
  "/fr/tools",
  "/it/tools",
  "/ja/tools",
  "/ko/tools",
  "/pt/tools",
  "/ru/tools",
  "/tr/tools",
  "/zh/tools",
] as const;

/** The twelve brand-first homepages with no " | Hyper3D" suffix. */
const HOMEPAGE_PATHS = [
  "/",
  "/ar",
  "/de",
  "/es",
  "/fr",
  "/it",
  "/ja",
  "/ko",
  "/pt",
  "/ru",
  "/tr",
  "/zh",
] as const;

function sitemapPaths(): string[] {
  const dir = join(process.cwd(), "public");
  const paths: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.startsWith("landing-sitemap-") || !name.endsWith(".xml")) continue;
    if (name === "landing-sitemap-index.xml") continue;
    const xml = readFileSync(join(dir, name), "utf-8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      paths.push(m[1].replace(SITE_ORIGIN, "") || "/");
    }
  }
  return paths;
}

describe("reference-titles registry (t75)", () => {
  it("pins the full probe census: 7,078 titles", () => {
    expect(Object.keys(REFERENCE_TITLES)).toHaveLength(7078);
  });

  it("every key is an absolute internal path", () => {
    for (const key of Object.keys(REFERENCE_TITLES)) {
      expect(key.startsWith("/")).toBe(true);
      expect(key.includes("//")).toBe(false);
      expect(key === "/" || !key.endsWith("/")).toBe(true);
    }
  });

  it("7,066 titles carry the suffix; exactly the twelve homepages do not", () => {
    const keys = Object.keys(REFERENCE_TITLES);
    const suffixed = keys.filter((k) => REFERENCE_TITLES[k].endsWith(TITLE_SUFFIX));
    const bare = keys.filter((k) => !REFERENCE_TITLES[k].endsWith(TITLE_SUFFIX));
    expect(suffixed).toHaveLength(7066);
    expect([...bare].sort()).toEqual([...HOMEPAGE_PATHS].sort());
  });

  it("every homepage is the brand-first pattern, byte-faithful", () => {
    expect(REFERENCE_TITLES["/"]).toBe("Hyper3D Rodin - Best AI 3D Model Generator");
    expect(REFERENCE_TITLES["/zh"]).toBe("Hyper3D Rodin - 最佳 AI 3D 模型生成器");
    expect(REFERENCE_TITLES["/ar"]).toBe(
      "Hyper3D Rodin - أفضل مولد نماذج ثلاثية الأبعاد بالذكاء الاصطناعي",
    );
  });

  it("registry == sitemap minus the reference's own 405, plus the twelve /tools indexes", () => {
    const sm = new Set(sitemapPaths());
    expect(sm.size).toBe(7067);
    const reg = new Set(Object.keys(REFERENCE_TITLES));
    expect(reg.size).toBe(7078);

    const missing = [...sm].filter((p) => !reg.has(p));
    expect(missing).toEqual([REFERENCE_405_PATH]);

    const extra = [...reg].filter((p) => !sm.has(p));
    expect(extra.sort()).toEqual([...TOOLS_INDEX_PATHS].sort());
  });

  it("referenceTitle resolves and misses cleanly", () => {
    expect(referenceTitle("/pricing")).toBe("Pricing Plans for AI 3D Generation | Hyper3D");
    expect(referenceTitle("/definitely-not-a-route")).toBeUndefined();
    expect(referenceTitle("")).toBeUndefined();
  });

  it("referenceCardTitle strips the suffix; homepages pass through; unknown is undefined", () => {
    expect(referenceCardTitle("/pricing")).toBe("Pricing Plans for AI 3D Generation");
    expect(referenceCardTitle("/zh")).toBe("Hyper3D Rodin - 最佳 AI 3D 模型生成器");
    expect(referenceCardTitle("/definitely-not-a-route")).toBeUndefined();
  });
});

describe("reference-titles spot pins — one per family, drift exemplars (t75)", () => {
  it.each([
    ["/3d-prompts", "Free 3D Prompts & Examples | Hyper3D"],
    ["/event/chroma-awards", "Chroma Awards: AI 3D for Games, Film & Ads | Hyper3D"],
    ["/switch", "Switch from Tripo or Meshy: Up to 6 Months Free | Hyper3D"],
    ["/switch/makerworld", "Hyper3D for MakerWorld Creators | Hyper3D"],
    ["/help", "Help Center | Hyper3D"],
    ["/help/features", "Features | Hyper3D"],
    [
      "/help/articles/are-credits-deducted-when-a-generation-fails",
      "Are Credits Deducted When a Generation Fails | Hyper3D",
    ],
    [
      "/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents",
      "Connect Hyper3D Rodin Mcp to Ai Agents | Hyper3D",
    ],
    [
      "/features",
      "AI 3D Features for Image to 3D, Text to 3D and Creative Pipelines | Hyper3D",
    ],
    ["/features/ai-image-generator", "AI Image Generator: Text to 3D-Ready Images | Hyper3D"],
    ["/features/text-to-3d", "Text to 3D Model Generator - Create 3D from Prompts | Hyper3D"],
    ["/features/worldgen", "WorldGen: AI 3D World Generator from Images | Hyper3D"],
    ["/tools/converter", "Free 3D Model Converter Online | Hyper3D"],
    ["/tools/converter/3ds/to/dae", "Free 3DS to DAE Converter Online | Hyper3D"],
    ["/tools/converter/jpg/to/ply", "Free JPG to PLY Converter Online | Hyper3D"],
    ["/tools/viewer/stp", "Free STP Viewer Online | Hyper3D"],
    ["/tools/viewer/usdz", "Free USDZ Viewer Online | Hyper3D"],
    ["/tools", "Free AI 3D Tools for Image to 3D, Viewing and Conversion | Hyper3D"],
    ["/use-cases", "AI 3D Use Cases for Games, Commerce, AR and 3D Printing | Hyper3D"],
    ["/use-cases/3d-printing", "AI 3D Model Generator for 3D Printing – Image to STL | Hyper3D"],
    ["/use-cases/nft-creation", "3D NFT Creator — Generate 3D NFT Art with AI | Hyper3D"],
    ["/styles", "Free AI 3D Style Generator Matrix | Hyper3D"],
    ["/styles/anime", "AI Anime 3D Model Generator — Characters & Figures | Hyper3D"],
    ["/styles/medieval", "Medieval 3D Models – AI Generator for Props & Buildings | Hyper3D"],
    ["/legal", "Legal Center | Hyper3D"],
    ["/legal/privacy", "Privacy Policy | Hyper3D"],
    ["/sub-categories/roblox", "Roblox 3D Models & Asset Previews | Hyper3D"],
    ["/sub-categories/nsfw-content", "NSFW 3D Model Collection & Previews | Hyper3D"],
    ["/blog", "Blog | Hyper3D"],
    ["/blog/2d-image-to-3d-model", "2D Image to 3D Model: How AI Makes it Easy (2026) | Hyper3D"],
    ["/blog/zbrush-alternative", "Best ZBrush Alternative? Free AI Sculpting Tools (2026) | Hyper3D"],
    [
      "/blog/how-to-optimize-your-setup-for-automobilista-2-best-hardware-and-settings",
      "Optimizing Automobilista 2: Top Hardware and Settings Tips | Hyper3D",
    ],
    ["/zh/3d-prompts", "免费 3D 提示词与创作案例 | Hyper3D"],
    ["/zh/help", "帮助中心 | Hyper3D"],
    ["/zh/features/ai-image-generator", "AI 图像生成器：文本转3D就绪图像 | Hyper3D"],
    ["/zh/styles/anime", "AI 动漫 3D 模型生成器 — 角色与手办 | Hyper3D"],
    ["/zh/legal/privacy", "隐私政策 | Hyper3D"],
    ["/zh/use-cases/3d-printing", "面向 3D 打印的 AI 3D 模型生成器 – 图片转 STL | Hyper3D"],
    ["/zh/tools/converter/3ds/to/dae", "免费 3DS 转 DAE 在线转换器 | Hyper3D"],
    ["/zh/tools", "免费 AI 3D 工具：图片转 3D、查看与转换 | Hyper3D"],
    ["/de/tools", "Kostenlose KI-3D-Tools für Bild zu 3D, Viewer und Konvertierung | Hyper3D"],
    ["/fr/help", "Centre d’aide | Hyper3D"],
    ["/tr/3d-prompts", "Ücretsiz 3D İstemleri ve Örnekleri | Hyper3D"],
    ["/ru/help", "Справочный центр | Hyper3D"],
    ["/ko/3d-prompts", "무료 3D 프롬프트와 제작 사례 | Hyper3D"],
    ["/pt/help", "Central de Ajuda | Hyper3D"],
    [
      "/zh/blog/2d-image-to-3d-model-zh",
      "2D 图像转 3D 模型：AI 如何让它变得简单（2026） | Hyper3D",
    ],
    [
      "/ja/blog/3d-animation-pipeline-ja",
      "3D Animation Pipeline：ステップごとの完全ガイド（2026） | Hyper3D",
    ],
  ] as const)("pins %s", (path, title) => {
    expect(REFERENCE_TITLES[path]).toBe(title);
    expect(referenceTitle(path)).toBe(title);
  });
});
