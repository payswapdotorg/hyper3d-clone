/**
 * t74 — the workspace entry routes: the reference's five remaining
 * /workspace URLs, probed live 2026-10-31 (agent-walked + curl):
 *
 *   /workspace/register      200 · default workspace <title> · signup panel
 *   /workspace/subscribe     200 · "Pricing | Hyper3D" · pricing overlay
 *   /workspace/api-dashboard 200 · "API Dashboard | Hyper3D" · studio view
 *                             for guests (the dashboard panel is auth-gated)
 *   /workspace/chatavatar    200 · the ChatAvatar product (V0.7 Beta)
 *   /workspace/video         200 · the Image-to-Video product
 *
 * Found by diffing every internal href of both served homepages: the
 * reference's landing links twelve /workspace URLs this clone did not
 * (five routes that 404'd/redirected, plus eight OmniCraft tool links
 * that live inside the reference's hidden workspace rail in its served
 * HTML — the t71 tool routes already existed, only the links were
 * missing). This module is the single source of truth for the five
 * routes' slugs, probed titles, and link census, shared by the route
 * files, the marketing header/footer wiring, and the tests.
 *
 * Titles are the reference's own client-set <title>s, byte-faithful.
 * None of these routes enter any sitemap — /workspace is
 * robots-disallowed (robots.txt `Disallow: /workspace`, reference
 * parity), so the sitemap census is unchanged by t74.
 */

import { WORKSPACE_TAB_TITLES } from "./workspace-tabs";

export type WorkspaceEntryView =
  | "register"
  | "subscribe"
  | "api-dashboard"
  | "chatavatar"
  | "video";

export interface WorkspaceEntryRoute {
  slug: string;
  path: string;
  /** The reference's client-set <title>, probed 2026-10-31. */
  title: string;
  view: WorkspaceEntryView;
}

/** The register route serves the default workspace title (probed). */
export const WORKSPACE_ENTRY_ROUTES: WorkspaceEntryRoute[] = [
  {
    slug: "register",
    path: "/workspace/register",
    title: WORKSPACE_TAB_TITLES.asset,
    view: "register",
  },
  {
    slug: "subscribe",
    path: "/workspace/subscribe",
    title: "Pricing | Hyper3D",
    view: "subscribe",
  },
  {
    slug: "api-dashboard",
    path: "/workspace/api-dashboard",
    title: "API Dashboard | Hyper3D",
    view: "api-dashboard",
  },
  {
    slug: "chatavatar",
    path: "/workspace/chatavatar",
    title:
      "ChatAvatar - 3D Avatar Creator: Design & Create Custom 3D Avatars, Facial Assets, ChatAvatars, Personalized 3D Characters & Digital Identity Solutions In Seconds | Hyper3D",
    view: "chatavatar",
  },
  {
    slug: "video",
    path: "/workspace/video",
    title:
      "Free Text to Video AI That Turns Prompts Into Polished Scenes - Generate Ads Videos, Explainers, Product Demos, and Social Clips With Cinematic Motion, 3D Depth, and Smart Pacing with Text | Hyper3D",
    view: "video",
  },
];

export function workspaceEntryBySlug(slug: string): WorkspaceEntryRoute | undefined {
  return WORKSPACE_ENTRY_ROUTES.find((r) => r.slug === slug);
}

/* ------------------------------------------------------------------ *
 * The hidden workspace rail (the reference's served-HTML link census)
 *
 * The reference's landing statically ships its full workspace chrome —
 * hidden — including the product/tool rail whose hrefs crawlers see:
 *
 *   ChatAvatar → /workspace/chatavatar
 *   Rodin      → /workspace/rodin
 *   Video      → /workspace/video
 *   + the nine OmniCraft tools (texture, enhancer, remix, hdri, search,
 *     vecto3d, mesh, viewer, formatcon — the t71 registry's own slugs)
 *
 * t74 ships the same rail, hidden the same way, so the clone's served
 * homepage carries the reference's /workspace link set (the t73
 * mega-menu lesson: markup in the served HTML, CSS-hidden until
 * needed).
 * ------------------------------------------------------------------ */

export interface RailLink {
  label: string;
  href: string;
  /** Honest note for tools this clone does not implement (title attr). */
  note?: string;
}

export const WORKSPACE_RAIL_PRODUCTS: RailLink[] = [
  { label: "ChatAvatar", href: "/workspace/chatavatar" },
  { label: "Rodin", href: "/workspace/rodin" },
  { label: "Video", href: "/workspace/video" },
];

/* ------------------------------------------------------------------ *
 * The ChatAvatar product surface (probed 2026-10-31, agent-walked)
 * ------------------------------------------------------------------ */

/** The reference's ChatAvatar version + tagline (observed chrome). */
export const CHATAVATAR_VERSION = "V0.7 (Beta)";
export const CHATAVATAR_TAGLINE =
  "Progressive Generation of Animatable 3D Faces under Text/Image Guidance";
export const CHATAVATAR_TIP =
  "A clear portrait with bright lighting and no shadows works best.";

/**
 * The reference's public Featured rail, observed 2026-10-31 — real
 * usernames, like counts, and prompt titles from its gallery, pinned as
 * reference chrome (the t73 Popular Questions pattern: the list is the
 * reference's own public content, reproduced so the surface matches;
 * every card here is honestly labeled as the reference's).
 */
export interface ChatAvatarFeaturedCard {
  user: string;
  likes: number;
  title?: string;
}

export const CHATAVATAR_FEATURED: ChatAvatarFeaturedCard[] = [
  { user: "wow", likes: 396 },
  { user: "Logan", likes: 181, title: "joker" },
  { user: "Barhoun Jad", likes: 159, title: "a muscular cat with human anatomy" },
  { user: "eEhyQx", likes: 226, title: "Diana, Princess of Wales" },
  { user: "eEhyQx", likes: 156, title: "The Hulk" },
  { user: "Jackson Andre", likes: 618 },
  { user: "LaFauci Colby", likes: 393 },
  { user: "ashu43d", likes: 269 },
  { user: "Thế Thọ Nguyễn", likes: 231 },
  { user: "gustafsson jimmy", likes: 342 },
  { user: "utop", likes: 161 },
  { user: "yijowey220", likes: 503 },
  { user: "digdogdog", likes: 82 },
  { user: "leribo5749", likes: 116 },
  { user: "Arbor-ring", likes: 165 },
  { user: "ren chunsheng", likes: 296 },
  { user: "Foutz Eli", likes: 54 },
];

/* ------------------------------------------------------------------ *
 * The Video product surface (probed 2026-10-31, agent-walked)
 * ------------------------------------------------------------------ */

export const VIDEO_UPLOAD_HINT = "JPG, PNG, WebP (max 10MB)";
export const VIDEO_RESOLUTIONS = ["720p"] as const;
export const VIDEO_DURATIONS = ["5"] as const;
export const VIDEO_CREDIT_COST = 0.5;
export const VIDEO_EMPTY_STATE_HEADING = "No Videos Yet";
export const VIDEO_EMPTY_STATE_BODY =
  "Generate your first video using the form on the left. Your videos will appear here.";

/** The reference's video-workspace left rail, honestly mapped to this
 * clone's real routes (every href resolves; not-in-clone items say so
 * in their title). */
export const VIDEO_RAIL: { group: string; links: RailLink[] }[] = [
  { group: "All Assets", links: [{ label: "All Assets", href: "/workspace/rodin" }] },
  {
    group: "Image",
    links: [
      { label: "Text to Image", href: "/features/ai-image-generator" },
      {
        label: "Image Editing",
        href: "/features/omnicraft/ai-image-remix",
        note: "This clone has no standalone image editor — Remix is the closest real surface.",
      },
      { label: "Image Enhancer", href: "/workspace/omnicraft/enhancer" },
    ],
  },
  {
    group: "Video",
    links: [
      { label: "Text to Video", href: "/features/ai-video-generator" },
      { label: "Image to Video", href: "/workspace/video" },
      {
        label: "Transition",
        href: "/features/ai-video-generator",
        note: "No separate transition tool in this clone — the video feature page covers the honest state.",
      },
    ],
  },
];
