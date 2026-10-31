/**
 * t71 — the content-preview surface: the host page, the render endpoint,
 * and the sitemap split that lists both. Every pin mirrors behavior
 * probed on the reference on 2026-10-31 (recon notes in
 * DECISIONS.md #51): the noindex host page, the 405/403 gates, the
 * X-Content-Preview-Unknown protocol, the monthly/0.5/no-alternates
 * sitemap entries, and the OmniCraft retirement that freed the five
 * locs the two preview URLs now occupy.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PREVIEW_GATE_MESSAGE,
  PREVIEW_MESSAGES,
  PREVIEW_METHOD_MESSAGE,
  PREVIEW_RENDER_PATH,
  PREVIEW_STANDALONE_MESSAGE,
  PREVIEW_UNKNOWN_HEADER,
  isKnownPreviewBlockType,
  isPreviewFetchAllowed,
  renderPreviewDocument,
  PreviewDocumentError,
} from "./content-preview";
import { GET, POST } from "../app/content-preview/render/route";

const read = (p: string) => readFileSync(join(__dirname, p), "utf8");
const SITE_ORIGIN = "https://hyper3d-clone.vercel.app";

/* --------------------------------------------------------- the protocol */

describe("t71 content-preview protocol constants", () => {
  it("the six message names are the reference's frozen wire protocol", () => {
    expect(PREVIEW_MESSAGES).toEqual({
      ready: "h3d-content-preview:ready",
      render: "h3d-content-preview:render",
      rendered: "h3d-content-preview:rendered",
      size: "h3d-content-preview:size",
      error: "h3d-content-preview:error",
      refused: "h3d-content-preview:refused",
    });
  });

  it("the render path and unknown-types header are the reference's own", () => {
    expect(PREVIEW_RENDER_PATH).toBe("/content-preview/render");
    expect(PREVIEW_UNKNOWN_HEADER).toBe("X-Content-Preview-Unknown");
  });

  it("the gate and method messages are the reference's exact wording", () => {
    expect(PREVIEW_METHOD_MESSAGE).toBe("POST a preview document from /content-preview.");
    expect(PREVIEW_GATE_MESSAGE).toBe(
      "Previews render only for the /content-preview page of this site.",
    );
    expect(PREVIEW_STANDALONE_MESSAGE).toContain("postMessage");
  });

  it("the host component speaks the protocol against the render path", () => {
    const host = read("../components/hyper3d/content-preview/content-preview-host.tsx");
    expect(host).toContain("PREVIEW_MESSAGES.ready");
    expect(host).toContain("version: 1");
    expect(host).toContain("PREVIEW_MESSAGES.render");
    expect(host).toContain("PREVIEW_MESSAGES.rendered");
    expect(host).toContain("PREVIEW_MESSAGES.size");
    expect(host).toContain("PREVIEW_MESSAGES.error");
    expect(host).toContain("PREVIEW_MESSAGES.refused");
    expect(host).toContain("PREVIEW_RENDER_PATH");
    // the sandboxed srcdoc iframe, the reference's own attribute set
    expect(host).toContain("allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms");
    // the origin gate: this clone allows exactly its own origin
    expect(host).toContain("const allowed = window.location.origin");
    // the status element is React-controlled (ref attached — a hydration
    // that never updates the line would silently say "Loading…" forever)
    expect(host).toContain('role="status" ref={statusRef}');
    expect(host).toContain("PREVIEW_STANDALONE_MESSAGE");
    expect(host).toContain("PREVIEW_WAITING_MESSAGE");
  });

  it("the host page is noindex with the reference's title", () => {
    const page = read("../app/content-preview/page.tsx");
    expect(page).toContain('"Content preview | Hyper3D"');
    expect(page).toContain("index: false");
    expect(page).toContain("follow: false");
  });
});

/* --------------------------------------------------------- the renderer */

describe("t71 renderPreviewDocument — the honest block format", () => {
  it("renders every known block type", () => {
    const { html, unknownTypes } = renderPreviewDocument({
      mode: "blog",
      locale: "en",
      slug: "draft-post",
      document: {
        blocks: [
          { type: "heading", text: "A heading", level: 3 },
          { type: "paragraph", text: "Some prose." },
          { type: "list", items: ["one", "two"], ordered: true },
          { type: "list", items: ["alpha", "beta"] },
          { type: "quote", text: "A quoted line." },
          { type: "code", text: "console.log(1)" },
          { type: "divider" },
        ],
      },
    });
    expect(unknownTypes).toEqual([]);
    expect(html).toContain("<h3>A heading</h3>");
    expect(html).toContain("<p>Some prose.</p>");
    expect(html).toContain("<ol><li>one</li><li>two</li></ol>");
    expect(html).toContain("<ul><li>alpha</li><li>beta</li></ul>");
    expect(html).toContain("<blockquote><p>A quoted line.</p></blockquote>");
    expect(html).toContain("<pre><code>console.log(1)</code></pre>");
    expect(html).toContain("<hr>");
    // self-contained srcdoc document with the honest context header
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("mode: blog");
    expect(html).toContain("locale: en");
    expect(html).toContain("slug: draft-post");
    expect(html).toContain('name="robots" content="noindex, nofollow"');
  });

  it("escapes text — a draft can never inject markup into the preview", () => {
    const { html } = renderPreviewDocument({
      document: { blocks: [{ type: "paragraph", text: "<script>alert(1)</script>" }] },
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("reports unknown block types once, in first-appearance order, and renders honest placeholders", () => {
    const { html, unknownTypes } = renderPreviewDocument({
      document: {
        blocks: [
          { type: "paragraph", text: "before" },
          { type: "video-embed", url: "https://example.com/v.mp4" },
          { type: "video-embed", url: "https://example.com/v2.mp4" },
          { type: "3d-model", slug: "apple" },
        ],
      },
    });
    expect(unknownTypes).toEqual(["video-embed", "3d-model"]);
    expect(html).toContain("Unrendered block: <code>video-embed</code>");
    expect(html).toContain("Unrendered block: <code>3d-model</code>");
    expect(isKnownPreviewBlockType("video-embed")).toBe(false);
    expect(isKnownPreviewBlockType("paragraph")).toBe(true);
  });

  it("a block that is a known type but malformed (missing text) is an error, not a silent drop", () => {
    expect(() =>
      renderPreviewDocument({ document: { blocks: [{ type: "paragraph", text: 42 }] } }),
    ).toThrow(PreviewDocumentError);
    expect(() =>
      renderPreviewDocument({ document: { blocks: [{ type: "list", items: "nope" }] } }),
    ).toThrow(PreviewDocumentError);
  });

  it("rejects documents that are not objects with a blocks array", () => {
    expect(() => renderPreviewDocument({ document: null })).toThrow(PreviewDocumentError);
    expect(() => renderPreviewDocument({ document: "text" })).toThrow(PreviewDocumentError);
    expect(() => renderPreviewDocument({ document: { blocks: "not-an-array" } })).toThrow(
      PreviewDocumentError,
    );
    expect(() => renderPreviewDocument({ document: { blocks: [42] } })).toThrow(
      PreviewDocumentError,
    );
    expect(() => renderPreviewDocument({ document: { blocks: [{ text: "no type" }] } })).toThrow(
      PreviewDocumentError,
    );
  });
});

/* --------------------------------------------------------- the endpoint */

describe("t71 POST /content-preview/render — the observable contract", () => {
  it("GET answers 405 with the reference's own body", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(await response.text()).toBe(PREVIEW_METHOD_MESSAGE);
    expect(response.headers.get("allow")).toBe("POST");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("a POST without same-origin fetch metadata hits the 403 gate, message verbatim", async () => {
    const request = new Request("https://hyper3d-clone.vercel.app/content-preview/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: { blocks: [] } }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(await response.text()).toBe(PREVIEW_GATE_MESSAGE);
  });

  it("a cross-site POST is gated too, and the gate keys on Sec-Fetch-Site alone", () => {
    expect(isPreviewFetchAllowed(new Headers({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isPreviewFetchAllowed(new Headers({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isPreviewFetchAllowed(new Headers({}))).toBe(false);
  });

  const sameOriginPost = (body: string) =>
    new Request("https://hyper3d-clone.vercel.app/content-preview/render", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Sec-Fetch-Site": "same-origin" },
      body,
    });

  it("a same-origin POST renders the draft and flags unknown types in the header", async () => {
    const response = await POST(
      sameOriginPost(
        JSON.stringify({
          mode: "help",
          locale: "en",
          slug: "what-is-hyper3d",
          document: {
            blocks: [
              { type: "heading", text: "Draft" },
              { type: "paragraph", text: "Body text." },
              { type: "gallery", images: [] },
            ],
          },
        }),
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get(PREVIEW_UNKNOWN_HEADER)).toBe(encodeURIComponent("gallery"));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("content-security-policy")).toBe("frame-ancestors 'self'");
    const html = await response.text();
    expect(html).toContain("<h2>Draft</h2>");
    expect(html).toContain("<p>Body text.</p>");
    expect(html).toContain("Unrendered block: <code>gallery</code>");
  });

  it("a fully-known draft answers with no unknown-types header at all", async () => {
    const response = await POST(
      sameOriginPost(
        JSON.stringify({ document: { blocks: [{ type: "paragraph", text: "ok" }] } }),
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get(PREVIEW_UNKNOWN_HEADER)).toBeNull();
  });

  it("malformed bodies answer 400 with the honest reason", async () => {
    const notJson = sameOriginPost("not json");
    const bad = await POST(notJson);
    expect(bad.status).toBe(400);
    expect(await bad.text()).toBe("The request body must be JSON.");
    const array = sameOriginPost(JSON.stringify([1, 2, 3]));
    const response = await POST(array);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("The request body must be a JSON object.");
    const noBlocks = sameOriginPost(JSON.stringify({ document: { } }));
    const r2 = await POST(noBlocks);
    expect(r2.status).toBe(400);
    expect(await r2.text()).toBe("The document must be an object with a blocks array.");
  });
});

/* --------------------------------------------------------- the sitemap split */

describe("t71 static-en — the content-preview locs in, the omnicraft locs out", () => {
  const staticXml = readFileSync(
    join(process.cwd(), "public", "landing-sitemap-static-en.xml"),
    "utf8",
  );

  it("lists both preview URLs with the reference's monthly/0.5 and zero alternates", () => {
    for (const path of ["/content-preview", "/content-preview/render"]) {
      const entry = staticXml.match(
        new RegExp(`<url><loc>${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${path}</loc>[^<]*<changefreq>[^<]*</changefreq><priority>[^<]*</priority>(<xhtml:link[^>]*>)*</url>`),
      );
      expect(entry, path).toBeTruthy();
      expect(entry![0]).toContain("<changefreq>monthly</changefreq>");
      expect(entry![0]).toContain("<priority>0.5</priority>");
      expect(entry![0]).not.toContain("xhtml:link");
      expect(entry![0]).not.toContain("<lastmod>");
    }
  });

  it("carries no omnicraft loc anymore — the tree is retired like the reference's", () => {
    expect(staticXml).not.toContain("/omnicraft");
    expect(staticXml.match(/<url>/g)?.length).toBe(48);
  });

  it("the split children on disk are free of the retired tree", () => {
    const sitemapIndex = readFileSync(join(process.cwd(), "public", "sitemap.xml"), "utf8");
    expect(sitemapIndex).not.toContain("/omnicraft");
    expect(sitemapIndex.match(/<sitemap>/g)?.length).toBe(90);
  });
});

/* --------------------------------------------------------- the retirement */

describe("t71 the OmniCraft retirement — 301s to the reference's exact targets", () => {
  const nextConfig = read("../../next.config.ts");

  it("/omnicraft/viewer 301s to the viewer hub", () => {
    expect(nextConfig).toContain('source: "/omnicraft/viewer"');
    expect(nextConfig).toContain('destination: "/tools/viewer"');
    expect(nextConfig).toMatch(/source: "\/omnicraft\/viewer",\s*destination: "\/tools\/viewer",[^}]*statusCode: 301/);
  });

  it("every other retired URL 301s to the HDRI feature page", () => {
    expect(nextConfig).toMatch(
      /source: "\/omnicraft\/:tool\*",\s*destination: "\/features\/omnicraft\/ai-hdri-generator",\s*statusCode: 301/,
    );
  });

  it("the t56 reverse redirects (workspace → public landing) are gone", () => {
    expect(nextConfig).not.toContain('destination: "/omnicraft"');
    expect(nextConfig).not.toContain('destination: "/omnicraft/:tool"');
  });

  it("the toolbag registry points at the reference's workspace slugs", () => {
    const registry = read("./omnicraft.ts");
    expect(registry).toContain('slug: "vecto3d"');
    expect(registry).toContain('slug: "formatcon"');
    expect(registry).not.toContain('slug: "vector"');
    expect(registry).not.toContain('slug: "convertor"');
    expect(registry).toContain("return `/workspace/omnicraft/${slug}`;");
  });

  it("the workspace toolbag routes exist where the reference serves them", () => {
    const index = read("../app/workspace/omnicraft/page.tsx");
    expect(index).toContain("OmniCraftLanding");
    const tool = read("../app/workspace/omnicraft/[tool]/page.tsx");
    expect(tool).toContain("OmniCraftToolRouter");
    expect(tool).toContain("index: false");
  });
});
