/**
 * Features tree registry — the reference's /features pages (sitemap truth,
 * 2026-10-29 recon of hyper3d.ai/landing-sitemap-features-en.xml: 19 pages:
 * 5 core + ChatAvatar + 2 AI media + API + MCP (+3 agent sub-pages) + 7
 * OmniCraft feature pages).
 *
 * Single source of truth shared by the /features index, the catch-all
 * /features/[...slug] route (rendered through the shared FeaturePage
 * component), the header/footer nav wiring, the sitemap, and the tests.
 *
 * Honesty contract (DECISIONS.md #34/#36 ethos): every page states plainly
 * whether the feature it describes is `live`, `partial`, or `reference-only`
 * in this clone. Reference-only pages still describe the reference's real
 * feature — plus a truthful note about what this clone has instead —
 * because a dead-but-pretty link farm is worse than an honest one.
 */
import { CORE_FEATURE_PAGES } from "./features-content-core";
import { MCP_FEATURE_PAGES } from "./features-content-mcp";
import { OMNICRAFT_FEATURE_PAGES } from "./features-content-omnicraft";
import type { FeaturePageDef } from "./features-types";

export type {
  FeaturePageDef,
  FeatureStatus,
  FeatureStep,
  FeatureBenefit,
  FeatureUseCase,
  FeatureFaq,
  FeatureCrossLink,
  FeatureCta,
} from "./features-types";

/** All 19 feature pages, reference sitemap order. */
export const FEATURE_PAGES: FeaturePageDef[] = [
  ...CORE_FEATURE_PAGES,
  ...MCP_FEATURE_PAGES,
  ...OMNICRAFT_FEATURE_PAGES,
];

export function featureBySlug(slug: string): FeaturePageDef | undefined {
  return FEATURE_PAGES.find((p) => p.slug === slug);
}

/** Slugs for generateStaticParams — each is the path under /features/. */
export function featureSlugs(): string[] {
  return FEATURE_PAGES.map((p) => p.slug);
}

/** The routes the /features tree exposes (for the sitemap + tests). */
export function featureRoutes(): string[] {
  return FEATURE_PAGES.map((p) => `/features/${p.slug}`);
}

export interface FeatureGroup {
  id: "core" | "ai-media" | "mcp" | "omnicraft";
  title: string;
  intro: string;
  pages: FeaturePageDef[];
}

/** Index groups — mirrors the reference /features index layout. */
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "core",
    title: "Core AI 3D features",
    intro:
      "The studio's generation surfaces — each page maps a reference feature to what this clone actually ships, honestly.",
    pages: CORE_FEATURE_PAGES.filter((p) => p.group === "core"),
  },
  {
    id: "ai-media",
    title: "AI media",
    intro: "The reference's image and video generation products — and this clone's honest gaps.",
    pages: CORE_FEATURE_PAGES.filter((p) => p.group === "ai-media"),
  },
  {
    id: "mcp",
    title: "MCP — agents",
    intro: "Connect AI agents to this clone's real pipeline through the MCP connect modal.",
    pages: MCP_FEATURE_PAGES,
  },
  {
    id: "omnicraft",
    title: "OmniCraft tools",
    intro:
      "Feature pages for the OmniCraft toolbag — live tools deep-link to their real pages, the rest state what the clone has instead.",
    pages: OMNICRAFT_FEATURE_PAGES,
  },
];

/**
 * Header/footer nav hrefs by the reference's exact nav labels. Present ONLY
 * where a real page exists (features tree, OmniCraft tool routes, studio) —
 * everything else stays a toast by design.
 */
export const FEATURE_NAV_HREFS: Record<string, string> = {
  "Image To 3D": "/features/image-to-3d",
  "Text To 3D": "/features/text-to-3d",
  WorldGen: "/features/worldgen",
  API: "/features/api",
  MCP: "/features/mcp",
  "AI Video Generator": "/features/ai-video-generator",
  "AI Image Generator": "/features/ai-image-generator",
  "AI Image Remix": "/features/omnicraft/ai-image-remix",
  "AI Image Enhancer": "/features/omnicraft/ai-image-enhancer",
  "AI Texture Generator": "/features/omnicraft/ai-texture-generator",
  "AI HDRI Generator": "/features/omnicraft/ai-hdri-generator",
  "3D Model Search Engine": "/features/omnicraft/3d-model-search-engine",
  "SVG to 3D Converter": "/features/omnicraft/svg-to-3d-converter",
  "3D Mesh Editor": "/features/omnicraft/3d-mesh-editor",
  ChatAvatar: "/features/chatavatar",
};

/** Footer "Features" column labels → real routes. */
export function featureNavHref(label: string): string | undefined {
  return FEATURE_NAV_HREFS[label];
}
