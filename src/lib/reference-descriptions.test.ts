import { describe, expect, it } from "vitest";

import { REFERENCE_TITLES } from "./reference-titles";
import {
  REFERENCE_DESCRIPTIONS,
  referenceDescription,
} from "./reference-descriptions";

/**
 * t76 — the byte-faithful reference meta-description registry, pinned.
 *
 * Recon 2026-10-31 (recon/t76/full-description-probe.py): every URL in
 * the t75 census (the reference's 90-child landing-sitemap tree, minus
 * its one 405, plus the twelve served-not-sitemapped /tools indexes —
 * 7,079 URLs) was probed live; 7,077 carried a meta description. The
 * probe also verified the reference's og:description equals the meta
 * description on every single one (0 mismatches in 7,077), so wiring
 * the pinned string once covers the meta, OG, and twitter surfaces.
 *
 * The registry boundary is exact and pinned both ways below:
 *   registry == title registry - /content-preview
 * /content-preview is the one title-registry path the reference serves
 * (HTTP 200) with NO meta description at all — this clone keeps its own
 * honest page description there. /content-preview/render stays the t75
 * 405 exclusion and was never in either registry.
 */

describe("reference-descriptions registry (t76)", () => {
  it("pins the full probe census: 7,077 descriptions", () => {
    expect(Object.keys(REFERENCE_DESCRIPTIONS)).toHaveLength(7077);
  });

  it("every key is an absolute internal path", () => {
    for (const key of Object.keys(REFERENCE_DESCRIPTIONS)) {
      expect(key.startsWith("/")).toBe(true);
      expect(key.includes("//")).toBe(false);
      expect(key === "/" || !key.endsWith("/")).toBe(true);
    }
  });

  it("no empty strings — every pinned description is real copy", () => {
    for (const value of Object.values(REFERENCE_DESCRIPTIONS)) {
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("registry == title registry minus /content-preview (the reference serves 200 there but ships no description)", () => {
    const titles = new Set(Object.keys(REFERENCE_TITLES));
    const descs = new Set(Object.keys(REFERENCE_DESCRIPTIONS));
    expect(titles.size).toBe(7078);
    expect(descs.size).toBe(7077);

    const missing = [...titles].filter((p) => !descs.has(p));
    expect(missing).toEqual(["/content-preview"]);

    const extra = [...descs].filter((p) => !titles.has(p));
    expect(extra).toEqual([]);
  });

  it("the two honest exclusions resolve undefined", () => {
    expect(referenceDescription("/content-preview")).toBeUndefined();
    expect(referenceDescription("/content-preview/render")).toBeUndefined();
  });

  it("resolves and misses cleanly", () => {
    expect(referenceDescription("/pricing")).toBe(
      "Compare Free, Creator, Business, and Enterprise plans for Rodin AI 3D generation, API access, ChatAvatar, and OmniCraft workflows.",
    );
    expect(referenceDescription("/definitely-not-a-route")).toBeUndefined();
    expect(referenceDescription("")).toBeUndefined();
  });

  it("the homepage description is the reference's own landing copy", () => {
    expect(referenceDescription("/")).toBe(
      "Rodin generates high-quality 3D assets that are nearly production-ready for supported workflows.",
    );
  });

  it("pinned descriptions are never sliced: the longest runs 296 chars", () => {
    const voxel = referenceDescription("/fr/styles/voxel");
    expect(voxel?.length).toBe(296);
    expect(voxel?.endsWith("les améliorations OmniCraft sont optionnelles.")).toBe(true);
  });

  it("exactly 106 pinned descriptions exceed the 180-char template slice", () => {
    const long = Object.values(REFERENCE_DESCRIPTIONS).filter(
      (d) => d.length > 180,
    );
    expect(long).toHaveLength(106);
  });

  it("pins the reference's own literal backslash quirks byte-for-byte", () => {
    expect(
      referenceDescription(
        "/blog/best-graphics-settings-for-uncharted-legacy-of-thieves-collection-on-pc",
      ),
    ).toBe(
      "Enhance your UNCHARTED\\u2122: Legacy experience on PC with our guide\\ \\ to optimizing graphics.",
    );
  });

  it("pins the reference's own mid-word truncations byte-for-byte", () => {
    // The reference truncates some long article descriptions mid-word
    // with a literal "..." — their served string, pinned as served.
    expect(
      referenceDescription(
        "/help/articles/are-credits-deducted-when-a-generation-fails",
      )?.endsWith("verify task status and Wallet History befor..."),
    ).toBe(true);
    expect(
      referenceDescription("/help/articles/connect-hyper3d-rodin-mcp-to-ai-agents"),
    ).toBe(
      "Connect Rodin MCP to a compatible AI client, authorize the correct workspace, submit generation requests, monitor progress, download results, and troublesho...",
    );
  });

  it("descriptions carry real human translations per locale", () => {
    expect(referenceDescription("/zh")).toBe(
      "Rodin 可为受支持的工作流生成高质量、几乎达到生产就绪状态的 3D 资产。",
    );
    expect(referenceDescription("/de/tools")).toBe(
      "Entdecken Sie Hyper3D-Tools für Bild-zu-3D-Formate, Online-3D-Viewer und Modellkonvertierung im Browser.",
    );
    expect(referenceDescription("/ja/blog/3d-animation-pipeline-ja")).toBe(
      "3D animation pipeline を最初から最後まで探ります。このガイドでは、Blender のようなソフトウェアを対象に、コンセプトから最終レンダリングまでのすべての段階を解説します。",
    );
  });
});

describe("reference-descriptions spot pins — one per family, drift exemplars (t76)", () => {
  it.each([
    [
      "/3d-prompts",
      "Explore free 3D prompts for GPT, Claude and Kimi. Browse Blender models, Three.js projects and games, then adapt an example for your next build.",
    ],
    [
      "/event/chroma-awards",
      "Create 3D assets for games, film, and advertising with Hyper3D. Claim one month of Creator Plan, valued at $30, and redeem by Dec 31, 2026.",
    ],
    [
      "/switch",
      "Moving from Tripo or Meshy? Check your profile and get up to 6 months of Hyper3D free, then 50% off for 12 months. Takes about a minute.",
    ],
    [
      "/switch/makerworld",
      "MakerWorld model count determines your offer: 10 or fewer: $1 Creator; 11–50: 3 months free; 51+: 6 months free.",
    ],
    [
      "/help",
      "Find answers, product guidance, billing details, and API resources for Hyper3D and Rodin.",
    ],
    [
      "/help/features",
      "Common questions about Hyper3D features and creative workflows.",
    ],
    [
      "/features",
      "Explore Hyper3D features for AI 3D model generation, image-to-3D, text-to-3D, textures, visual references, video, API workflows, viewing, and conversion.",
    ],
    [
      "/features/ai-image-generator",
      "Create AI images from text prompts with Hyper3D. Generate 3D-ready references for concept art, product visuals, game assets, and image-to-3D workflows.",
    ],
    [
      "/features/text-to-3d",
      "Generate 3D models from text prompts with Hyper3D's AI text to 3D generator. Create textured assets for games, AR, products, and 3D printing.",
    ],
    [
      "/features/worldgen",
      "Turn images into editable 3D worlds with WorldGen by Hyper3D. Generate complete scenes or individual objects using manual selection or AI segmentation.",
    ],
    [
      "/tools",
      "Explore Hyper3D tools for image to 3D formats, online 3D viewing, and browser-based model conversion.",
    ],
    [
      "/tools/converter",
      "Convert 3D model files online for free. Preview GLB, OBJ, FBX, STL, USDZ, 3MF, and image-to-3D workflows in your browser with Hyper3D.",
    ],
    [
      "/tools/converter/3ds/to/dae",
      "Convert 3DS to DAE online for free. Process locally with Hyper3D, preview the 3D model, and download results for Blender, Unity, Unreal, or printing.",
    ],
    [
      "/tools/viewer/stp",
      "Open STP files online with Hyper3D Viewer. Preview CAD review 3D models locally with no software install.",
    ],
    [
      "/use-cases",
      "Explore Hyper3D AI 3D use cases for game assets, product models, AR experiences, 3D printing, engineering, animation, and more.",
    ],
    [
      "/use-cases/3d-printing",
      "Rodin turns photos or prompts into watertight, 3D-printing-ready meshes for high-quality FDM and resin workflows.",
    ],
    [
      "/styles",
      "Explore AI 3D model generator pages by visual style, from low poly and voxel to photorealistic, cartoon, fantasy, and hand-painted assets.",
    ],
    [
      "/styles/anime",
      "Turn character sheets or prompts into high-quality anime-style 3D models with strong silhouette fidelity, clean topology, PBR materials, and flexible export.",
    ],
    [
      "/legal",
      "Find Hyper3D privacy, terms, refund, fulfillment, and copyright licensing documents in one place.",
    ],
    [
      "/legal/privacy",
      "Learn how Hyper3D collects, uses, stores, and protects personal data across our websites, apps, and services.",
    ],
    [
      "/sub-categories/roblox",
      "Explore Roblox-themed 3D models and compare asset previews. Check mesh details, available formats, and usage terms before preparing a model for Roblox Studio.",
    ],
    [
      "/blog",
      "A dedicated Hyper3D blog hub for product notes, workflow ideas, and practical 3D creation updates.",
    ],
    [
      "/blog/2d-image-to-3d-model",
      "Learn to convert any 2d image to 3d model with AI. Our guide reviews the top tools and techniques to turn your photos into usable 3D assets in minutes.",
    ],
    [
      "/blog/zbrush-alternative",
      "Looking for a ZBrush alternative? Discover the best free AI-powered sculpting tools to create stunning 3D models without the high cost. Try them now!",
    ],
    [
      "/zh/help",
      "查找有关 Hyper3D 和 Rodin 的产品指南、账单说明、API 资源与常见问题答案。",
    ],
    [
      "/zh/features/ai-image-generator",
      "使用 Hyper3D 从文本提示创建 AI 图像。生成用于概念艺术、产品视觉、游戏资产和图像到3D工作流程的3D就绪参考。",
    ],
    [
      "/zh/styles/anime",
      "将角色设定图或提示词转化为高质量动漫风格 3D 模型，具备高轮廓忠实度、干净拓扑、PBR 材质与灵活导出能力。",
    ],
    [
      "/zh/use-cases/3d-printing",
      "Rodin 将照片或提示词转化为水密、3D 打印就绪的网格，用于高质量 FDM 和树脂打印工作流。",
    ],
    [
      "/zh/tools/converter/3ds/to/dae",
      "免费在线将 3DS 转换为 DAE。在浏览器本地处理文件，预览 3D 模型，并下载适用于 Blender、Unity 或 Unreal 的结果。",
    ],
    [
      "/zh/tools",
      "探索 Hyper3D 免费 AI 3D 工具，支持图片转 3D 格式、在线 3D 查看和浏览器模型转换，适用于创作、游戏、AR 和 3D 打印工作流。",
    ],
    [
      "/fr/help",
      "Trouvez des réponses, des guides produit, la facturation et les ressources API pour Hyper3D et Rodin.",
    ],
    [
      "/zh/blog/2d-image-to-3d-model-zh",
      "了解如何借助 AI 将任何 2D 图像转换为 3D 模型。我们的指南将评测顶级工具与技术，帮助你在几分钟内把照片变成可用的 3D 资产。",
    ],
  ] as const)("pins %s", (path, description) => {
    expect(REFERENCE_DESCRIPTIONS[path]).toBe(description);
    expect(referenceDescription(path)).toBe(description);
  });
});
