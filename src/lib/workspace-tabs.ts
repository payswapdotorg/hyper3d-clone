/**
 * Workspace tab routing (t72) — the reference routes its Rodin workspace
 * tabs as real URLs (probed live 2026-10-31, agent-walked):
 *
 *   /workspace/rodin               → ASSET (the studio's default view)
 *   /workspace/rodin/tab/story     → EXPLORE · Story  ("Rodin - User Stories Collection | Hyper3D")
 *   /workspace/rodin/tab/research  → Research          ("Rodin - Research Library | Hyper3D")
 *
 * Unknown /tab/* segments fall back to the default view on the reference
 * (its SPA shell serves 200 and the client router renders the studio —
 * probed /workspace/rodin/tab/unknownxyz → default view + default title),
 * so the parser does the same instead of 404.
 *
 * The workspace stays robots-disallowed (robots.txt `Disallow: /workspace`,
 * reference parity), so none of these routes enter any sitemap.
 */

export type WorkspaceTab = "asset" | "story" | "research";

export const WORKSPACE_ROOT = "/workspace/rodin";

export const WORKSPACE_TAB_ROUTES: Record<WorkspaceTab, string> = {
  asset: WORKSPACE_ROOT,
  story: `${WORKSPACE_ROOT}/tab/story`,
  research: `${WORKSPACE_ROOT}/tab/research`,
};

/** The reference's <title> for each tab (probed 2026-10-31). */
export const WORKSPACE_TAB_TITLES: Record<WorkspaceTab, string> = {
  asset:
    "Rodin AI - Free AI 3D Model Generator For Everyone | Instantly Create Stunning 3D Assets, 3D Models, and 3D Objects - Create 3D Designs Powered by AI | Hyper3D",
  story: "Rodin - User Stories Collection | Hyper3D",
  research: "Rodin - Research Library | Hyper3D",
};

/**
 * Derive the workspace tab from a pathname. Anything under
 * /workspace/rodin/tab/<unknown> resolves to the default "asset" view
 * (reference fallback), as does the bare root itself.
 */
export function tabFromPathname(pathname: string | null | undefined): WorkspaceTab {
  if (!pathname) return "asset";
  const path = pathname.split("?")[0].replace(/\/+$/, "");
  if (path === WORKSPACE_ROOT) return "asset";
  if (path === WORKSPACE_TAB_ROUTES.story) return "story";
  if (path === WORKSPACE_TAB_ROUTES.research) return "research";
  return "asset";
}

/**
 * The static path segments for the optional catch-all route
 * (src/app/workspace/rodin/[[...tab]]/page.tsx): the three tabs the
 * reference actually serves, pre-rendered; any other /tab/* combination
 * renders on demand into the default view (dynamicParams).
 */
export const WORKSPACE_TAB_STATIC_PARAMS: { tab?: string[] }[] = [
  // `{ tab: [] }` is the bare /workspace/rodin (optional catch-all root)
  { tab: [] },
  { tab: ["tab", "story"] },
  { tab: ["tab", "research"] },
];

/** Map catch-all segments (["tab","story"] | undefined) to a tab. */
export function tabFromSegments(segments: string[] | undefined): WorkspaceTab {
  if (!segments || segments.length === 0) return "asset";
  if (segments.length === 2 && segments[0] === "tab" && segments[1] === "story") return "story";
  if (segments.length === 2 && segments[0] === "tab" && segments[1] === "research") return "research";
  return "asset";
}
