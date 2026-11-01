/**
 * t82 — the workspace shell's uncensured route classes. Every pin
 * mirrors behavior probed on the reference on 2026-11-01
 * (recon/t82/notes.md): the root-level 301 aliases, the pre-paint
 * replace scripts (signup / referral / root / 404 / normalize), the
 * uuid shape rule (the reference shell's own regex), the two OAuth
 * guest views' probed copy, the imageto3d bare title, and the route
 * files that wire them.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  IMAGETO3D_BARE_TITLE,
  IMAGETO3D_LCP_SCRIPT,
  MCP_OAUTH_CONSENT_COPY,
  NOT_FOUND_REPLACE_SCRIPT,
  OAUTH_DEVICE_COPY,
  OAUTH_PRIVATE_FLAG_SCRIPT,
  RODIN_NORMALIZE_SCRIPT,
  SIGNUP_REPLACE_SCRIPT,
  UUID_SHAPE_RE,
  WORKSPACE_ROOT_REPLACE_SCRIPT,
  classifyRodinChild,
  classifyWorkspaceCatchall,
  isUuidShape,
  referralReplaceScript,
} from "./workspace-shell-routes";

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");

/* ---------------------------------------------- the uuid shape rule */

describe("t82 the uuid shape (the reference shell's own regex)", () => {
  it("accepts the probed live model uuid and canonical shapes", () => {
    expect(isUuidShape("0bb1d4a9-e701-4871-ace0-9491e775238e")).toBe(true);
    // the probed unknown-model probe uuid
    expect(isUuidShape("00000000-0000-4000-8000-000000000000")).toBe(true);
    // case-insensitive, like the reference (probed: UPPERCASE 301s)
    expect(isUuidShape("0BB1D4A9-E701-4871-ACE0-9491E775238E")).toBe(true);
  });

  it("rejects the shapes the reference 404s or routes elsewhere", () => {
    expect(isUuidShape("not-a-uuid")).toBe(false);
    expect(isUuidShape("xyz")).toBe(false);
    // 36 z's — non-hex (the reference's client 404s this, probed)
    expect(isUuidShape("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
    expect(isUuidShape("tab")).toBe(false);
    expect(isUuidShape("0bb1d4a9-e701-4871-ace0-9491e775238")).toBe(false);
    expect(isUuidShape("0bb1d4a9-e701-4871-ace0-9491e775238ee")).toBe(false);
    expect(isUuidShape("")).toBe(false);
  });

  it("the regex itself is the reference's, verbatim (quirks included)", () => {
    // 36 dashes is a "uuid" on the reference too — its own regex quirk
    expect(UUID_SHAPE_RE.test("------------------------------------")).toBe(true);
  });
});

/* -------------------------------------- the /workspace catch-all classifier */

describe("t82 the /workspace catch-all classifier", () => {
  it("the bare root replaces to the studio (probed)", () => {
    expect(classifyWorkspaceCatchall(undefined)).toEqual({ kind: "root" });
    expect(classifyWorkspaceCatchall([])).toEqual({ kind: "root" });
  });

  it("signup exactly (single segment) replaces to register — deeper falls through", () => {
    expect(classifyWorkspaceCatchall(["signup"])).toEqual({ kind: "signup" });
    // the reference's shell script is an exact-path rule; /workspace/signup/extra
    // renders the studio fallback instead (probed class)
    expect(classifyWorkspaceCatchall(["signup", "extra"])).toEqual({ kind: "studio" });
  });

  it("r|a referral shapes — code is the second segment, deeper segments ignored", () => {
    // the reference's shell script reads pathSegments[1..2] only
    expect(classifyWorkspaceCatchall(["r", "testcode"])).toEqual({
      kind: "referral",
      code: "testcode",
    });
    expect(classifyWorkspaceCatchall(["a", "testcode"])).toEqual({ kind: "referral", code: "testcode" });
    expect(classifyWorkspaceCatchall(["r", "testcode", "extra"])).toEqual({
      kind: "referral",
      code: "testcode",
    });
    // bare /workspace/r: the script stays quiet but the router still
    // replaces to register (probed) — same destination, folded here
    expect(classifyWorkspaceCatchall(["r"])).toEqual({ kind: "referral", code: undefined });
    expect(classifyWorkspaceCatchall(["a"])).toEqual({ kind: "referral", code: undefined });
  });

  it("everything unknown renders the studio view at the unknown URL (probed)", () => {
    expect(classifyWorkspaceCatchall(["foobar"])).toEqual({ kind: "studio" });
    expect(classifyWorkspaceCatchall(["xyz", "abc"])).toEqual({ kind: "studio" });
    expect(classifyWorkspaceCatchall(["settings"])).toEqual({ kind: "studio" });
    expect(classifyWorkspaceCatchall(["logout"])).toEqual({ kind: "studio" });
    expect(classifyWorkspaceCatchall(["b", "testcode"])).toEqual({ kind: "studio" });
  });
});

/* ------------------------------------ the /workspace/rodin child classifier */

describe("t82 the /workspace/rodin child classifier", () => {
  it("the root and the two canonical tabs keep their t72 views", () => {
    expect(classifyRodinChild(undefined)).toEqual({ kind: "studio" });
    expect(classifyRodinChild([])).toEqual({ kind: "studio" });
    expect(classifyRodinChild(["tab", "story"])).toEqual({ kind: "tab", tab: "story" });
    expect(classifyRodinChild(["tab", "research"])).toEqual({ kind: "tab", tab: "research" });
  });

  it("a single uuid-shaped segment is the model shape — studio view, URL stays", () => {
    expect(classifyRodinChild(["0bb1d4a9-e701-4871-ace0-9491e775238e"])).toEqual({
      kind: "model",
      uuid: "0bb1d4a9-e701-4871-ace0-9491e775238e",
    });
    expect(classifyRodinChild(["00000000-0000-4000-8000-000000000000"]).kind).toBe("model");
  });

  it("a single non-uuid segment replaces to /404 (probed twice on the reference)", () => {
    expect(classifyRodinChild(["xyz"])).toEqual({ kind: "not-found" });
    expect(classifyRodinChild(["zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"])).toEqual({
      kind: "not-found",
    });
    expect(classifyRodinChild(["tab"]).kind).toBe("not-found");
  });

  it("non-canonical multi-segment shapes normalize back to the studio root", () => {
    // probed: /workspace/rodin/tab/a/b → /workspace/rodin
    expect(classifyRodinChild(["tab", "a", "b"])).toEqual({ kind: "normalize-root" });
    expect(classifyRodinChild(["tab", "nope"])).toEqual({ kind: "normalize-root" });
    // probed: /workspace/rodin/xyz/abc → /workspace/rodin
    expect(classifyRodinChild(["xyz", "abc"])).toEqual({ kind: "normalize-root" });
    expect(classifyRodinChild(["tab", "story", "extra"])).toEqual({ kind: "normalize-root" });
  });
});

/* ------------------------------------------- the pre-paint replace scripts */

describe("t82 the pre-paint replace scripts", () => {
  it("the signup replace preserves search and hash (the shell script's rule)", () => {
    expect(SIGNUP_REPLACE_SCRIPT).toBe(
      'window.location.replace("/workspace/register"+(window.location.search||"")+(window.location.hash||""));',
    );
  });

  it("the referral replace sets the code with the shell script's merge semantics", () => {
    const script = referralReplaceScript("testcode");
    // URLSearchParams.set — the code wins over an existing query param
    expect(script).toContain('p.set("referral_code","testcode")');
    expect(script).toContain('new URLSearchParams(window.location.search)');
    expect(script).toContain('(window.location.hash||"")');
    expect(script).toContain('window.location.replace("/workspace/register"');
  });

  it("a bare r|a replace lands on the plain register URL (the router's rule)", () => {
    expect(referralReplaceScript(undefined)).toBe(
      'window.location.replace("/workspace/register"+(window.location.search||"")+(window.location.hash||""));',
    );
  });

  it("the root, 404, and normalize replaces are the probed one-liners", () => {
    expect(WORKSPACE_ROOT_REPLACE_SCRIPT).toContain(
      'window.location.replace("/workspace/rodin"',
    );
    expect(NOT_FOUND_REPLACE_SCRIPT).toBe('window.location.replace("/404");');
    expect(RODIN_NORMALIZE_SCRIPT).toBe('window.location.replace("/workspace/rodin");');
  });

  it("the imageto3d LCP script is the reference shell's own, verbatim", () => {
    expect(IMAGETO3D_LCP_SCRIPT).toContain(
      "imageto3d\\/([0-9a-f-]{36})(?:\\/)?$",
    );
    expect(IMAGETO3D_LCP_SCRIPT).toContain(
      '"https://file.hyper3d.com/"+a[1]+"/preview/render_basic.jpg"',
    );
    expect(IMAGETO3D_LCP_SCRIPT).toContain('data-initial-imageto3d-detail');
    expect(IMAGETO3D_LCP_SCRIPT).toContain('fetchpriority","high"');
    expect(IMAGETO3D_LCP_SCRIPT).toContain("__HYPER3D_INITIAL_LCP_IMAGE__=i");
  });

  it("the OAuth private-mode flag script", () => {
    expect(OAUTH_PRIVATE_FLAG_SCRIPT).toBe("window.__HYPER3D_PRIVATE_OAUTH__=true;");
  });
});

/* --------------------------------------------------- the OAuth view copy */

describe("t82 the OAuth guest views' probed copy", () => {
  it("the device view carries the DOM-extracted strings", () => {
    expect(OAUTH_DEVICE_COPY).toEqual({
      brandName: "Hyper3D",
      brandProduct: "Device authorization",
      eyebrow: "Device authorization",
      heading: "Unable to continue",
      description:
        "This authorization link is incomplete or invalid. Return to your terminal and start a new login request.",
      trustNote: "Only authorize devices and clients you trust.",
    });
  });

  it("the consent view carries the DOM-extracted strings", () => {
    expect(MCP_OAUTH_CONSENT_COPY).toEqual({
      brandName: "HYPER3D",
      brandProduct: "RODIN",
      eyebrow: "Client authorization",
      heading: "Authorization request is invalid",
      description: "Return to your client or terminal and start the connection again.",
      trustNote: "Only authorize clients you trust.",
    });
  });

  it("the imageto3d bare title is the probed short ChatAvatar title", () => {
    expect(IMAGETO3D_BARE_TITLE).toBe(
      "ChatAvatar - AI 3D Facial Assets Generator | Hyper3D",
    );
  });
});

/* ------------------------------------------------------ the route wiring */

describe("t82 the new route files", () => {
  const nextConfig = read("../../next.config.ts");

  it("the root aliases are the reference's 301s", () => {
    expect(nextConfig).toContain(
      '{ source: "/register", destination: "/workspace/register", statusCode: 301 }',
    );
    expect(nextConfig).toContain(
      '{ source: "/login", destination: "/workspace/login", statusCode: 301 }',
    );
    expect(nextConfig).toContain(
      '{ source: "/imageto3d", destination: "/features/image-to-3d", statusCode: 301 }',
    );
  });

  it("the referral short links are the reference's two-hop 301 shape", () => {
    expect(nextConfig).toContain(
      '{ source: "/r/:code", destination: "/workspace/r/:code", statusCode: 301 }',
    );
    expect(nextConfig).toContain(
      '{ source: "/r/:code/:rest*", destination: "/workspace/r/:code/:rest*", statusCode: 301 }',
    );
    expect(nextConfig).toContain(
      '{ source: "/a/:code", destination: "/workspace/a/:code", statusCode: 301 }',
    );
    expect(nextConfig).toContain(
      '{ source: "/a/:code/:rest*", destination: "/workspace/a/:code/:rest*", statusCode: 301 }',
    );
  });

  it("the retired rows are gone: /signup 404s, /workspace serves 200 + replace", () => {
    // the reference 404s /signup (its shell script never serves there)
    expect(nextConfig).not.toContain('source: "/signup"');
    // /workspace/signup is a real 200 + replace route now
    expect(nextConfig).not.toContain('source: "/workspace/signup"');
    // the t68 /workspace 302 is retired — the catch-all serves 200
    expect(nextConfig).not.toContain('source: "/workspace"');
    // the old direct-to-register referral rows are gone (re-probed)
    expect(nextConfig).not.toContain("/workspace/register?referral_code=:code");
    expect(nextConfig).not.toContain("destination: \"/workspace/rodin?auth=signup\"");
  });

  it("the root /imageto3d/[uuid] alias shape-checks before its 301", () => {
    const route = read("../app/imageto3d/[uuid]/route.ts");
    expect(route).toContain("isUuidShape(uuid)");
    expect(route).toContain("status: 404");
    expect(route).toContain("/workspace/imageto3d/${uuid}");
    expect(route).toContain("NextResponse.redirect(url, 301)");
  });

  it("the /workspace catch-all wires the three child behaviors", () => {
    const page = read("../app/workspace/[...rest]/page.tsx");
    expect(page).toContain("classifyWorkspaceCatchall");
    expect(page).toContain("SIGNUP_REPLACE_SCRIPT");
    expect(page).toContain("referralReplaceScript(view.code)");
    // the studio fallback at the unknown URL
    expect(page).toContain("<Hyper3DApp />");
    expect(page).toContain("WORKSPACE_TAB_TITLES.asset");
    // the mandatory-catch-all + bare-page split (the optional form
    // mis-shadowed two static routes under output:standalone — t82)
    expect(page).toContain("type CatchallParams = { rest: string[] }");
  });

  it("the bare /workspace root page replaces to the studio (the t68 302 retired)", () => {
    const root = read("../app/workspace/page.tsx");
    expect(root).toContain("WORKSPACE_ROOT_REPLACE_SCRIPT");
    expect(root).toContain("ShellRedirect");
    expect(existsSync(join(__dirname, "../app/workspace/[[...rest]]"))).toBe(false);
  });

  it("the shell-redirect body stamps the visit markers and the noscript notice", () => {
    const shell = read("../components/hyper3d/workspace/shell-redirect.tsx");
    expect(shell).toContain("WORKSPACE_MARKER_SCRIPT");
    expect(shell).toContain("You need to enable JavaScript to run this app.");
  });

  it("the imageto3d routes: bare = ChatAvatar view + short title; uuid = studio + LCP", () => {
    const bare = read("../app/workspace/imageto3d/page.tsx");
    expect(bare).toContain("IMAGETO3D_BARE_TITLE");
    expect(bare).toContain("<ChatAvatarWorkspace />");
    expect(bare).toContain("WORKSPACE_MARKER_SCRIPT");

    const uuidPage = read("../app/workspace/imageto3d/[uuid]/page.tsx");
    expect(uuidPage).toContain("IMAGETO3D_LCP_SCRIPT");
    expect(uuidPage).toContain("NOT_FOUND_REPLACE_SCRIPT");
    expect(uuidPage).toContain("<Hyper3DApp />");
    expect(uuidPage).toContain("WORKSPACE_TAB_TITLES.asset");
    expect(uuidPage).toContain("isUuidShape(uuid)");
  });

  it("the two OAuth surfaces render the probed guest views with no titles", () => {
    const device = read("../app/workspace/oauth/device/page.tsx");
    expect(device).toContain("OAUTH_DEVICE_COPY");
    expect(device).toContain("OAUTH_PRIVATE_FLAG_SCRIPT");
    // the private-mode meta, emitted server-side
    expect(device).toContain('{ referrer: "no-referrer" }');
    // no title — title: null suppresses the root layout's default
    expect(device).toContain("title: null");

    const consent = read("../app/workspace/mcp/oauth/consent/page.tsx");
    expect(consent).toContain("MCP_OAUTH_CONSENT_COPY");
    expect(consent).toContain("OAUTH_PRIVATE_FLAG_SCRIPT");
    expect(consent).toContain('{ referrer: "no-referrer" }');
    expect(consent).toContain("title: null");

    const view = read("../components/hyper3d/workspace/oauth-guest-view.tsx");
    expect(view).toContain("WORKSPACE_MARKER_SCRIPT");
    expect(view).toContain('bg-[#121317]');
    expect(view).toContain("rounded-[32px]");
    expect(view).toContain("circle cx=\"12\" cy=\"12\" r=\"10\"");
    // the shared component is parameterized by the probed copy
    expect(view).toContain("OAuthGuestViewCopy");
  });

  it("no workspace route leaks into any sitemap (robots-disallowed parity)", () => {
    const staticEn = read("../../public/landing-sitemap-static-en.xml");
    expect(staticEn.includes("/workspace/")).toBe(false);
  });
});
