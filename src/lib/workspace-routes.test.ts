import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CHATAVATAR_FEATURED,
  CHATAVATAR_TAGLINE,
  CHATAVATAR_TIP,
  CHATAVATAR_VERSION,
  VIDEO_CREDIT_COST,
  VIDEO_EMPTY_STATE_BODY,
  VIDEO_EMPTY_STATE_HEADING,
  VIDEO_RAIL,
  VIDEO_UPLOAD_HINT,
  WORKSPACE_ENTRY_ROUTES,
  WORKSPACE_RAIL_PRODUCTS,
  workspaceEntryBySlug,
} from "./workspace-routes";
import { OMNICRAFT_TOOLS } from "./omnicraft";
import { WORKSPACE_TAB_TITLES } from "./workspace-tabs";
import { HELP_ROUTES } from "./help";

/**
 * t74 — the workspace entry routes: the reference's five remaining
 * /workspace URLs (/workspace/register, /workspace/subscribe,
 * /workspace/api-dashboard, /workspace/chatavatar, /workspace/video,
 * all probed live 2026-10-31) and the landing's served-HTML link census
 * (the hidden product/tool rail, the header CTAs, the footer's Product
 * column and Trustpilot block). Every href here must resolve to a route
 * this clone really serves; every pinned title is the reference's own
 * client-set <title>, byte-faithful.
 */

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

const registerPage = read("../app/workspace/register/page.tsx");
const subscribePage = read("../app/workspace/subscribe/page.tsx");
const apiDashboardPage = read("../app/workspace/api-dashboard/page.tsx");
const chatavatarPage = read("../app/workspace/chatavatar/page.tsx");
const videoPage = read("../app/workspace/video/page.tsx");
const appShellSrc = read("../components/hyper3d/app-shell.tsx");
const chatavatarSrc = read("../components/hyper3d/workspace/chatavatar-workspace.tsx");
const videoSrc = read("../components/hyper3d/workspace/video-workspace.tsx");
const shellSrc = read("../components/hyper3d/workspace/product-workspace-shell.tsx");
const headerSrc = read("../components/hyper3d/site-header.tsx");
const footerSrc = read("../components/hyper3d/site-footer.tsx");
const nextConfig = read("../../next.config.ts");
const robotsTxt = read("../../public/robots.txt");
const sitemapIndex = read("../../public/sitemap.xml");

/* --------------------------------------------- the five entry routes */

describe("t74 workspace entry routes — the reference's five URLs", () => {
  it("the five routes exist with the reference's slugs", () => {
    expect(WORKSPACE_ENTRY_ROUTES.map((r) => r.slug)).toEqual([
      "register",
      "subscribe",
      "api-dashboard",
      "chatavatar",
      "video",
    ]);
  });

  it("register serves the default workspace title (probed — no register-specific <title>)", () => {
    expect(workspaceEntryBySlug("register")?.title).toBe(WORKSPACE_TAB_TITLES.asset);
  });

  it("subscribe and api-dashboard serve their own probed titles", () => {
    expect(workspaceEntryBySlug("subscribe")?.title).toBe("Pricing | Hyper3D");
    expect(workspaceEntryBySlug("api-dashboard")?.title).toBe("API Dashboard | Hyper3D");
  });

  it("chatavatar serves the reference's long product title, byte-faithful", () => {
    expect(workspaceEntryBySlug("chatavatar")?.title).toBe(
      "ChatAvatar - 3D Avatar Creator: Design & Create Custom 3D Avatars, Facial Assets, ChatAvatars, Personalized 3D Characters & Digital Identity Solutions In Seconds | Hyper3D",
    );
  });

  it("video serves the reference's long product title, byte-faithful", () => {
    expect(workspaceEntryBySlug("video")?.title).toBe(
      "Free Text to Video AI That Turns Prompts Into Polished Scenes - Generate Ads Videos, Explainers, Product Demos, and Social Clips With Cinematic Motion, 3D Depth, and Smart Pacing with Text | Hyper3D",
    );
  });

  it("the three studio-shell routes mount the app with their entry view + the visit markers", () => {
    for (const [src, view] of [
      [registerPage, "register"],
      [subscribePage, "subscribe"],
      [apiDashboardPage, "api-dashboard"],
    ] as const) {
      expect(src).toContain("Hyper3DApp");
      expect(src).toContain(`initialView="${view}"`);
      expect(src).toContain("WORKSPACE_MARKER_SCRIPT");
    }
  });

  it("the two product routes mount their own workspace + the visit markers", () => {
    expect(chatavatarPage).toContain("ChatAvatarWorkspace");
    expect(chatavatarPage).toContain("WORKSPACE_MARKER_SCRIPT");
    expect(videoPage).toContain("VideoWorkspace");
    expect(videoPage).toContain("WORKSPACE_MARKER_SCRIPT");
  });

  it("the register route is a real route now — the 307 shortcut is gone from the redirect table", () => {
    expect(nextConfig).not.toContain(
      '{ source: "/workspace/register", destination: "/workspace/rodin?auth=signup", permanent: false }',
    );
    // the public alias still lands on the new route
    expect(nextConfig).toContain(
      '{ source: "/register", destination: "/workspace/register", permanent: false }',
    );
    // the referral short links land on the register route with their code
    expect(nextConfig).toContain(
      '{ source: "/r/:code", destination: "/workspace/register?referral_code=:code", permanent: false }',
    );
    expect(nextConfig).toContain(
      '{ source: "/a/:code", destination: "/workspace/register?referral_code=:code", permanent: false }',
    );
  });

  it("the app-shell carries the entry-view wiring", () => {
    expect(appShellSrc).toContain('initialView?: "login" | "contact" | WorkspaceEntryView');
    // register opens the sign-up panel; subscribe opens the overlay
    expect(appShellSrc).toContain('initialView === "register" ? "signup" : "signin"');
    expect(appShellSrc).toContain('pricingInitiallyOpen={initialView === "subscribe"}');
    // api-dashboard: the honest word for signed-in users, no fake dashboard
    expect(appShellSrc).toContain('initialView === "api-dashboard"');
  });
});

/* --------------------------------------- the hidden workspace rail */

describe("t74 served-HTML link census — the hidden workspace rail", () => {
  it("the rail lists the reference's three products with real routes", () => {
    expect(WORKSPACE_RAIL_PRODUCTS.map((p) => p.href)).toEqual([
      "/workspace/chatavatar",
      "/workspace/rodin",
      "/workspace/video",
    ]);
  });

  it("the header ships the hidden rail with all 12 links (3 products + 9 tools)", () => {
    expect(headerSrc).toContain("hidden rail");
    expect(headerSrc).toContain("WORKSPACE_RAIL_PRODUCTS.map");
    expect(headerSrc).toContain("OMNICRAFT_TOOLS.map");
    // every rail href resolves against the real registries
    const railHrefs = [
      ...WORKSPACE_RAIL_PRODUCTS.map((p) => p.href),
      ...OMNICRAFT_TOOLS.map((t) => `/workspace/omnicraft/${t.slug}`),
    ];
    expect(railHrefs).toHaveLength(12);
    for (const href of railHrefs) {
      expect(href.startsWith("/workspace/")).toBe(true);
    }
  });

  it("the header's guest CTAs match the reference's own hrefs", () => {
    // the subscribe pill (both links) → /workspace/subscribe
    expect(headerSrc.match(/href="\/workspace\/subscribe"/g)?.length).toBe(2);
    // the "Sign up for free" CTA → /workspace/register
    expect(headerSrc).toContain("Sign up for free");
    expect(headerSrc).toContain('href="/workspace/register"');
    // the Products menu links ChatAvatar at its workspace route
    expect(headerSrc).toContain('{ label: "ChatAvatar", href: "/workspace/chatavatar"');
  });

  it("the header's auth-only actions ship hidden for guests (reference parity)", () => {
    // the reference's h3d-header-auth-only chrome: Workspace + API dashboard
    expect(headerSrc).toMatch(/href=\{STUDIO_PATH\}\s*\n\s*className="hidden"/);
    expect(headerSrc).toMatch(/href="\/workspace\/api-dashboard"\s*\n\s*className="hidden"/);
  });

  it("the footer's Product column links the reference's own targets", () => {
    expect(footerSrc).toContain('{ label: "ChatAvatar", href: "/workspace/chatavatar" }');
    expect(footerSrc).toContain('{ label: "OmniCraft", href: "/workspace/omnicraft/hdri" }');
  });

  it("the footer's Trustpilot block links the reference's real review page", () => {
    expect(footerSrc).toContain(
      'const TRUSTPILOT_URL = "https://www.trustpilot.com/review/hyper3d.ai"',
    );
    expect(footerSrc).toContain(
      'const TRUSTPILOT_RATING_LABEL = "Rated 4.5 out of 5 on Trustpilot"',
    );
    // five stars, honestly labeled as the reference's own
    expect(footerSrc).toContain("{[0, 1, 2, 3, 4].map((i) => (");
  });
});

/* ------------------------------------------ the ChatAvatar surface */

describe("t74 ChatAvatar surface — the reference's product chrome, honest wiring", () => {
  it("the probed chrome is pinned (version, tagline, tip)", () => {
    expect(CHATAVATAR_VERSION).toBe("V0.7 (Beta)");
    expect(CHATAVATAR_TAGLINE).toBe(
      "Progressive Generation of Animatable 3D Faces under Text/Image Guidance",
    );
    expect(CHATAVATAR_TIP).toBe(
      "A clear portrait with bright lighting and no shadows works best.",
    );
  });

  it("the Featured gallery is the reference's observed set (17 cards, real likes)", () => {
    expect(CHATAVATAR_FEATURED).toHaveLength(17);
    // spot-pinned entries (observed 2026-10-31)
    expect(CHATAVATAR_FEATURED).toContainEqual({ user: "wow", likes: 396 });
    expect(CHATAVATAR_FEATURED).toContainEqual({
      user: "eEhyQx",
      likes: 226,
      title: "Diana, Princess of Wales",
    });
    // every card carries a non-negative like count
    for (const card of CHATAVATAR_FEATURED) {
      expect(card.likes).toBeGreaterThanOrEqual(0);
      expect(card.user.trim().length).toBeGreaterThan(0);
    }
  });

  it("the surface reproduces the reference's cards + honest gates", () => {
    expect(chatavatarSrc).toContain("Drag &amp; drop or choose images to upload");
    expect(chatavatarSrc).toContain("Describe the Avatar you want to create");
    expect(chatavatarSrc).toContain("Generate from Text");
    expect(chatavatarSrc).toContain("Featured");
    // the honest capability note points at the real studio
    expect(chatavatarSrc).toContain("no avatar is produced");
    expect(chatavatarSrc).toContain("/workspace/rodin");
    // the header's Plug-in action keeps the reference's add-on docs target
    expect(chatavatarSrc).toContain("https://docs.deemos.dev/addon");
  });

  it("the shared product shell wires the reference's rail products", () => {
    expect(shellSrc).toContain('href="/workspace/subscribe"');
    expect(shellSrc).toContain('href="/workspace/login"');
    expect(shellSrc).toContain("WORKSPACE_RAIL_PRODUCTS.map");
    expect(shellSrc).toContain("OMNICRAFT_TOOLS.map");
  });
});

/* ---------------------------------------------- the Video surface */

describe("t74 Video surface — the reference's product chrome, honest wiring", () => {
  it("the probed constants are pinned (upload hint, credit cost, empty state)", () => {
    expect(VIDEO_UPLOAD_HINT).toBe("JPG, PNG, WebP (max 10MB)");
    expect(VIDEO_CREDIT_COST).toBe(0.5);
    expect(VIDEO_EMPTY_STATE_HEADING).toBe("No Videos Yet");
    expect(VIDEO_EMPTY_STATE_BODY).toBe(
      "Generate your first video using the form on the left. Your videos will appear here.",
    );
  });

  it("the left asset rail keeps the reference's groups with honest, resolvable hrefs", () => {
    expect(VIDEO_RAIL.map((g) => g.group)).toEqual(["All Assets", "Image", "Video"]);
    const labels = VIDEO_RAIL.flatMap((g) => g.links.map((l) => l.label));
    expect(labels).toEqual([
      "All Assets",
      "Text to Image",
      "Image Editing",
      "Image Enhancer",
      "Text to Video",
      "Image to Video",
      "Transition",
    ]);
    // every href resolves to a route this clone really serves
    const realRoutes = new Set<string>(["/workspace/rodin", "/workspace/video", "/workspace/omnicraft/enhancer"]);
    for (const g of VIDEO_RAIL) {
      for (const l of g.links) {
        expect(
          realRoutes.has(l.href) || l.href.startsWith("/features/"),
          `video rail href ${l.href}`,
        ).toBe(true);
      }
    }
  });

  it("the surface reproduces the reference's form + honest gates", () => {
    expect(videoSrc).toContain("Image to Video");
    expect(videoSrc).toContain("Click to upload or drag and drop");
    expect(videoSrc).toContain("Describe your video in detail...");
    expect(videoSrc).toContain("Sound Effect");
    expect(videoSrc).toContain("Generate Video");
    // the honest empty state says no video will ever appear here
    expect(videoSrc).toContain("no video is rendered");
    expect(videoSrc).toContain("/workspace/rodin");
  });
});

/* -------------------------------------- crawler discipline (no drift) */

describe("t74 crawler discipline — workspace stays out of every sitemap", () => {
  it("robots.txt keeps the /workspace disallow (reference parity)", () => {
    expect(robotsTxt).toContain("Disallow: /workspace");
  });

  it("the sitemap index census is unchanged by t74 (90 children, no workspace URLs)", () => {
    const locs = sitemapIndex.match(/<loc>[^<]+<\/loc>/g) ?? [];
    expect(locs).toHaveLength(90);
    expect(sitemapIndex).not.toContain("/workspace/register");
    expect(sitemapIndex).not.toContain("/workspace/chatavatar");
    expect(sitemapIndex).not.toContain("/workspace/video");
  });

  it("no entry-route page ships indexable robots metadata", () => {
    for (const src of [registerPage, subscribePage, apiDashboardPage, chatavatarPage, videoPage]) {
      // the disallowed prefix is enforced by robots.txt, like the reference;
      // none of these pages claim to be sitemap material
      expect(src).not.toMatch(/robots:\s*\{\s*index:\s*true/);
    }
  });

  it("the help-center routes the contact page links stay intact (t73 regression guard)", () => {
    // the product shell's contact dock routes to the t73 surface
    expect(shellSrc).toContain('href="/workspace/contact-us"');
    // and the help registry still backs it
    expect(HELP_ROUTES.length).toBeGreaterThan(0);
  });
});
