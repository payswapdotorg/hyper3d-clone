/**
 * t72 — the workspace tab routes: the research library, the story
 * collection, and the dedicated login route. Every pin mirrors behavior
 * probed on the reference on 2026-10-31 (recon notes in DECISIONS.md
 * #52): the real tab URLs under /workspace/rodin/tab/*, the per-tab
 * <title>s, the unknown-tab fallback, the two papers' bibliographic
 * constants (ACM DOIs, public video embeds), and the story surface's
 * program numbers (20% cash / 40% credits / $1.50 per Credit / 2-Credit
 * signups / 13th-of-month payouts / $50 minimum / 8-day credit delay).
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WORKSPACE_ROOT,
  WORKSPACE_TAB_ROUTES,
  WORKSPACE_TAB_STATIC_PARAMS,
  WORKSPACE_TAB_TITLES,
  tabFromPathname,
  tabFromSegments,
} from "./workspace-tabs";
import {
  RESEARCH_PAPERS,
  researchBilibiliEmbed,
  researchYouTubeEmbed,
} from "./research-papers";
import {
  AFFILIATE_PROGRAMS,
  CASH_PAYOUT_MINIMUM_USD,
  CREDIT_USD_RATE,
  SOCIAL_POST_REWARD_CREDITS,
  STORY_BONUS_STATES,
  STORY_REFERRAL_PLATFORMS,
} from "./story-programs";

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

/* ------------------------------------------------- the tab route table */

describe("t72 workspace tab routing", () => {
  it("the three tabs resolve to the reference's real URLs", () => {
    expect(WORKSPACE_ROOT).toBe("/workspace/rodin");
    expect(WORKSPACE_TAB_ROUTES).toEqual({
      asset: "/workspace/rodin",
      story: "/workspace/rodin/tab/story",
      research: "/workspace/rodin/tab/research",
    });
  });

  it("the per-tab titles are the reference's served <title>s", () => {
    expect(WORKSPACE_TAB_TITLES.asset).toBe(
      "Rodin AI - Free AI 3D Model Generator For Everyone | Instantly Create Stunning 3D Assets, 3D Models, and 3D Objects - Create 3D Designs Powered by AI | Hyper3D",
    );
    expect(WORKSPACE_TAB_TITLES.story).toBe("Rodin - User Stories Collection | Hyper3D");
    expect(WORKSPACE_TAB_TITLES.research).toBe("Rodin - Research Library | Hyper3D");
  });

  it("pathname parsing maps the three routes and falls back for unknowns", () => {
    expect(tabFromPathname("/workspace/rodin")).toBe("asset");
    expect(tabFromPathname("/workspace/rodin/tab/story")).toBe("story");
    expect(tabFromPathname("/workspace/rodin/tab/research")).toBe("research");
    // the reference's client router serves the default view for unknown
    // tabs (probed /workspace/rodin/tab/unknownxyz → default view + title)
    expect(tabFromPathname("/workspace/rodin/tab/unknownxyz")).toBe("asset");
    expect(tabFromPathname("/workspace/rodin/tab/story/extra")).toBe("asset");
    expect(tabFromPathname("/workspace/login")).toBe("asset");
    expect(tabFromPathname(null)).toBe("asset");
    expect(tabFromPathname("")).toBe("asset");
  });

  it("segment parsing matches the catch-all param shape", () => {
    expect(tabFromSegments(undefined)).toBe("asset");
    expect(tabFromSegments([])).toBe("asset");
    expect(tabFromSegments(["tab", "story"])).toBe("story");
    expect(tabFromSegments(["tab", "research"])).toBe("research");
    expect(tabFromSegments(["tab", "nope"])).toBe("asset");
    expect(tabFromSegments(["story"])).toBe("asset");
    expect(tabFromSegments(["tab", "story", "x"])).toBe("asset");
  });

  it("the optional catch-all pre-renders exactly the three known tabs", () => {
    // `{ tab: [] }` is the bare /workspace/rodin — the shape Next 16
    // requires for the optional catch-all root (an empty {} entry
    // silently produces NO prerendered paths, verified during t72)
    expect(WORKSPACE_TAB_STATIC_PARAMS).toEqual([
      { tab: [] },
      { tab: ["tab", "story"] },
      { tab: ["tab", "research"] },
    ]);
  });

  it("the studio nav renders the reference's tab row from the route table", () => {
    const studio = read("../components/hyper3d/studio/studio.tsx");
    for (const tab of Object.keys(WORKSPACE_TAB_ROUTES)) {
      expect(studio).toContain(`href={WORKSPACE_TAB_ROUTES.${tab}}`);
    }
    // multi-line JSX: label text wrapped in the Link body
    for (const label of ["ASSET", "EXPLORE", "Story", "Research"]) {
      expect(studio).toMatch(new RegExp(`>\\s*${label}\\s*</Link>`));
    }
    // the tab follows the URL, not component state
    expect(studio).toContain("tabFromPathname(pathname)");
    // the retired t48 in-page story toggle is gone
    expect(studio).not.toContain("storyOpen");
    expect(studio).not.toContain("StoryFeed");
  });

  it("the marketing header links Story/Research at the tab routes and Login at /workspace/login", () => {
    const header = read("../components/hyper3d/site-header.tsx");
    expect(header).toContain('{ label: "Story", href: WORKSPACE_TAB_ROUTES.story }');
    expect(header).toContain('{ label: "Research", href: WORKSPACE_TAB_ROUTES.research }');
    expect(header).toContain('href="/workspace/login"');
  });

  it("the marketing hero CTA lands on the reference's login route", () => {
    const home = read("../components/hyper3d/landing/marketing-home.tsx");
    expect(home.match(/href="\/workspace\/login"/g)?.length).toBe(2);
  });
});

/* ------------------------------------------------ the route files wiring */

describe("t72 workspace route files", () => {
  it("the optional catch-all serves the studio with per-tab metadata", () => {
    const page = read("../app/workspace/rodin/[[...tab]]/page.tsx");
    expect(page).toContain("WORKSPACE_TAB_STATIC_PARAMS");
    expect(page).toContain("WORKSPACE_TAB_TITLES[resolved]");
    expect(page).toContain("WORKSPACE_MARKER_SCRIPT");
    expect(page).toContain("<Hyper3DApp />");
  });

  it("the login route opens the shell in login view with the default title", () => {
    const page = read("../app/workspace/login/page.tsx");
    expect(page).toContain('initialView="login"');
    expect(page).toContain("WORKSPACE_TAB_TITLES.asset");
    expect(page).toContain("WORKSPACE_MARKER_SCRIPT");
  });

  it("the app shell redirects sessions from the login route into the studio", () => {
    const shell = read("../components/hyper3d/app-shell.tsx");
    expect(shell).toContain('initialView?: "login"');
    expect(shell).toContain('router.replace(WORKSPACE_TAB_ROUTES.asset)');
  });

  it("no workspace route leaks into any sitemap (robots-disallowed parity)", () => {
    const staticEn = read("../../public/landing-sitemap-static-en.xml");
    expect(staticEn.includes("/workspace/")).toBe(false);
    const robots = read("../../public/robots.txt");
    expect(robots).toContain("Disallow: /workspace");
  });
});

/* --------------------------------------------- the research library */

describe("t72 research library registry", () => {
  it("carries the reference's two papers (CLAY 2024, CAST 2025)", () => {
    expect(RESEARCH_PAPERS.map((p) => p.id)).toEqual(["clay", "cast"]);
  });

  it("CLAY — the 2024 SIGGRAPH Best Paper Honorable Mention, real DOI and videos", () => {
    const clay = RESEARCH_PAPERS[0];
    expect(clay.title).toBe(
      "CLAY: A controllable large-scale generative model for creating high-quality 3d assets",
    );
    expect(clay.badges).toEqual(["3D", "Generative AI", "SIGGRAPH Best Paper Honorable Mentioned"]);
    expect(clay.year).toBe("2024");
    expect(clay.venue).toEqual(["ACM SIGGRAPH", "ACM Transactions on Graphics (TOG)"]);
    expect(clay.featured).toBe(true);
    expect(clay.doiUrl).toBe("https://dl.acm.org/doi/10.1145/3658146");
    expect(clay.youtubeId).toBe("cloVLY6lWdI");
    expect(clay.bilibiliBvid).toBe("BV17vV6zZEU3");
    // the reference's carousel cycles six CLAY figures
    expect(clay.figures).toEqual(["x1", "x3", "ga3", "overview", "PBR", "control_short_V3"]);
  });

  it("CAST — the 2025 SIGGRAPH Best Paper, real DOI and videos", () => {
    const cast = RESEARCH_PAPERS[1];
    expect(cast.title).toBe("CAST: Component-aligned 3d scene reconstruction from an rgb image");
    expect(cast.badges).toEqual(["3D", "Generative AI", "World Model", "SIGGRAPH Best Paper"]);
    expect(cast.year).toBe("2025");
    expect(cast.venue).toEqual(["ACM SIGGRAPH", "ACM Transactions on Graphics (TOG)"]);
    expect(cast.doiUrl).toBe("https://dl.acm.org/doi/10.1145/3730840");
    expect(cast.youtubeId).toBe("UL5nSyg2Aps");
    expect(cast.bilibiliBvid).toBe("BV1T3bGzvEGF");
    expect(cast.figures).toEqual(["teaser", "pipeline1", "gallery_small"]);
  });

  it("abstracts are the papers' own quoted text (probed from the cards)", () => {
    expect(RESEARCH_PAPERS[0].abstract).toContain(
      "we introduce CLAY, a 3D geometry and material generator",
    );
    expect(RESEARCH_PAPERS[1].abstract).toContain(
      "Component-Aligned 3D Scene Reconstruction from a Single RGB Image",
    );
  });

  it("connection notes are clone wording and never claim this clone runs the papers", () => {
    for (const paper of RESEARCH_PAPERS) {
      expect(paper.connectionNote).toContain("reference");
      expect(paper.connectionNote.toLowerCase()).not.toContain("this clone");
    }
  });

  it("the embed builders reproduce the reference's player URLs", () => {
    expect(researchYouTubeEmbed(RESEARCH_PAPERS[0])).toBe(
      "https://www.youtube.com/embed/cloVLY6lWdI",
    );
    expect(researchBilibiliEmbed(RESEARCH_PAPERS[0])).toBe(
      "https://player.bilibili.com/player.html?bvid=BV17vV6zZEU3",
    );
    expect(researchYouTubeEmbed(RESEARCH_PAPERS[1])).toBe(
      "https://www.youtube.com/embed/UL5nSyg2Aps",
    );
    expect(researchBilibiliEmbed(RESEARCH_PAPERS[1])).toBe(
      "https://player.bilibili.com/player.html?bvid=BV1T3bGzvEGF",
    );
  });

  it("the library component embeds the real players and opens the DOIs in new tabs", () => {
    const lib = read("../components/hyper3d/studio/research-library.tsx");
    expect(lib).toContain("researchYouTubeEmbed(paper)");
    expect(lib).toContain("researchBilibiliEmbed(paper)");
    expect(lib).toContain('target="_blank"');
    expect(lib).toContain('rel="noopener noreferrer"');
    expect(lib).toContain('aria-label="Previous research image"');
    expect(lib).toContain('aria-label="Next research image"');
    expect(lib).toContain('aria-label="Play research video on YouTube"');
    expect(lib).toContain('aria-label="Play research video on Bilibili"');
    expect(lib).toContain('aria-label="Open research PDF"');
    expect(lib).toContain("Show More ...");
  });
});

/* --------------------------------------------- the story collection */

describe("t72 story collection programs", () => {
  it("the bonus tracker shows the reference's three states", () => {
    expect(STORY_BONUS_STATES).toEqual(["Pending", "Approved", "Rejected"]);
  });

  it("the social referral lists the reference's six platforms and 1-Credit reward", () => {
    expect(STORY_REFERRAL_PLATFORMS).toEqual(["YouTube", "X", "Ins", "Reddit", "Bilibili", "Xiaohongshu"]);
    expect(SOCIAL_POST_REWARD_CREDITS).toBe(1);
  });

  it("the two affiliate programs carry the reference's real numbers", () => {
    expect(AFFILIATE_PROGRAMS.map((p) => p.id)).toEqual(["cash", "credit"]);
    const [cash, credit] = AFFILIATE_PROGRAMS;
    expect(cash.name).toBe("Cash Rewards");
    expect(cash.rewardRatePercent).toBe(20);
    expect(credit.name).toBe("Credit Rewards");
    expect(credit.rewardRatePercent).toBe(40);
    for (const program of AFFILIATE_PROGRAMS) {
      expect(program.signupCredits).toBe(2);
      expect(program.signupCreditsMonthlyCap).toBe(10);
      expect(program.terms.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("the cash program's payout terms carry the probed schedule", () => {
    const cash = AFFILIATE_PROGRAMS[0];
    expect(cash.terms.some((t) => t.includes("13th of each month"))).toBe(true);
    expect(cash.terms.some((t) => t.includes("$50"))).toBe(true);
    expect(cash.terms.some((t) => t.includes("$120 Business Plan"))).toBe(true);
    expect(cash.terms.some((t) => t.includes("$24 cash reward"))).toBe(true);
    expect(CASH_PAYOUT_MINIMUM_USD).toBe(50);
  });

  it("the credit program's terms carry the $1.50 rate and 8-day delay", () => {
    const credit = AFFILIATE_PROGRAMS[1];
    expect(credit.terms.some((t) => t.includes("$1.50 per Credit"))).toBe(true);
    expect(credit.terms.some((t) => t.includes("8 days after the transaction"))).toBe(true);
    expect(credit.terms.some((t) => t.includes("32 Credits"))).toBe(true);
    expect(CREDIT_USD_RATE).toBe(1.5);
  });

  it("the story component keeps the honest wiring (real referral link, honest claims)", () => {
    const story = read("../components/hyper3d/studio/story-collection.tsx");
    // a signed-in user's REAL clone referral link (the t53 /r/<code> route)
    expect(story).toContain("/r/${user.referral_code}");
    // the claim flow says honestly that nothing further happens
    expect(story).toContain("Post moderation is not operated by this clone");
    // the bonus tracker states its honest zeros
    expect(story).toContain("Story submission and moderation are not operated by this clone");
    expect(story).toContain("Log in to get your affiliate link.");
    expect(story).toContain("Payment History");
    expect(story).toContain("No payment records yet");
    expect(story).toContain("Paste the link here");
    expect(story).toContain("Claim Now");
    // the retired t48 announcement-card feed is gone
    expect(story).not.toContain("Share @ Discord");
  });

  it("the retired t48 story-feed file is gone from the tree", () => {
    expect(existsSync(join(__dirname, "../components/hyper3d/studio/story-feed.tsx"))).toBe(false);
    expect(existsSync(join(__dirname, "../components/hyper3d/studio/story-collection.tsx"))).toBe(true);
    expect(existsSync(join(__dirname, "../components/hyper3d/studio/research-library.tsx"))).toBe(true);
  });
});
