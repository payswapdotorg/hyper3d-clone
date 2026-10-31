/**
 * The content-preview contract (t71) — the clone's honest version of the
 * reference's internal draft-preview surface.
 *
 * Recon 2026-10-31 (hyper3d.ai/content-preview, 200, listed in static-en
 * together with /content-preview/render; both noindex):
 *  - The page is a small postMessage host: on load it tells its
 *    parent/opener `h3d-content-preview:ready` (version 1); an allowed
 *    origin may send `h3d-content-preview:render` with
 *    {mode, locale, slug, document}; the host POSTs the document to
 *    /content-preview/render, renders the returned HTML in a sandboxed
 *    srcdoc iframe, and reports `h3d-content-preview:rendered` with the
 *    iframe size plus the unknown content types the endpoint flagged in
 *    its X-Content-Preview-Unknown response header. Size changes stream
 *    back as `...:size`; failures as `...:error` {id, status, message};
 *    disallowed origins get `...:refused`.
 *  - The reference's allowed origin is its own admin console
 *    (admin.hyper3d.com, read from a data attribute on <html>). This
 *    clone has no admin console, so its preview host allows exactly one
 *    origin: the site it is served from — any same-origin editor can
 *    drive the protocol, nothing else.
 *  - GET /content-preview/render → 405 "POST a preview document from
 *    /content-preview."; a POST that does not come from the site's own
 *    pages (Sec-Fetch-Site) → 403 "Previews render only for the
 *    /content-preview page of this site." Both mirrored verbatim.
 *
 * The reference's draft-document format is locked away behind that gate;
 * this module defines the clone's own honest block format instead — six
 * renderable block types, everything else reported as unknown exactly
 * like the reference's header protocol (rendered as an honest
 * placeholder, never faked).
 */

/* ------------------------------------------------------------------ */
/* The wire protocol (mirrors the reference's frozen message names)    */
/* ------------------------------------------------------------------ */

export const PREVIEW_MESSAGE_PREFIX = "h3d-content-preview:" as const;

export const PREVIEW_MESSAGES = {
  ready: `${PREVIEW_MESSAGE_PREFIX}ready`,
  render: `${PREVIEW_MESSAGE_PREFIX}render`,
  rendered: `${PREVIEW_MESSAGE_PREFIX}rendered`,
  size: `${PREVIEW_MESSAGE_PREFIX}size`,
  error: `${PREVIEW_MESSAGE_PREFIX}error`,
  refused: `${PREVIEW_MESSAGE_PREFIX}refused`,
} as const;

/** The render endpoint the host POSTs drafts to (the reference's own path). */
export const PREVIEW_RENDER_PATH = "/content-preview/render";

/** Response header carrying the unknown content types (the reference's own). */
export const PREVIEW_UNKNOWN_HEADER = "X-Content-Preview-Unknown";

/** GET → 405 body, the reference's own wording. */
export const PREVIEW_METHOD_MESSAGE = "POST a preview document from /content-preview.";

/** Cross-site POST → 403 body, the reference's own wording. */
export const PREVIEW_GATE_MESSAGE = "Previews render only for the /content-preview page of this site.";

/** The honest standalone status when no editor opened the page. */
export const PREVIEW_STANDALONE_MESSAGE =
  "Open this page from an editor to preview a draft — this host speaks the content-preview postMessage protocol to its parent window.";

/** The status shown while an embedded host waits for its editor. */
export const PREVIEW_WAITING_MESSAGE = "Waiting for the editor…";

/* ------------------------------------------------------------------ */
/* The draft document model (this clone's own honest format)           */
/* ------------------------------------------------------------------ */

export interface PreviewRenderRequest {
  mode?: unknown;
  locale?: unknown;
  slug?: unknown;
  document?: unknown;
}

interface RenderedDoc {
  html: string;
  unknownTypes: string[];
}

/** Text blocks carry a single string; lists carry string items. */
type KnownBlock =
  | { type: "heading"; text: string; level?: number }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string }
  | { type: "code"; text: string }
  | { type: "divider" };

const KNOWN_TYPES = new Set(["heading", "paragraph", "list", "quote", "code", "divider"]);

export function isKnownPreviewBlockType(type: string): boolean {
  return KNOWN_TYPES.has(type);
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function renderBlock(block: Record<string, unknown>): string | null {
  switch (block.type) {
    case "heading": {
      const text = asText(block.text);
      if (text === null) return null;
      const level =
        typeof block.level === "number" && block.level >= 2 && block.level <= 4
          ? Math.floor(block.level)
          : 2;
      return `<h${level}>${esc(text)}</h${level}>`;
    }
    case "paragraph": {
      const text = asText(block.text);
      if (text === null) return null;
      return `<p>${esc(text)}</p>`;
    }
    case "list": {
      const items = Array.isArray(block.items)
        ? block.items.map((i) => asText(i)).filter((i): i is string => i !== null)
        : null;
      if (items === null || items.length === 0) return null;
      const tag = block.ordered === true ? "ol" : "ul";
      return `<${tag}>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
    }
    case "quote": {
      const text = asText(block.text);
      if (text === null) return null;
      return `<blockquote><p>${esc(text)}</p></blockquote>`;
    }
    case "code": {
      const text = asText(block.text);
      if (text === null) return null;
      return `<pre><code>${esc(text)}</code></pre>`;
    }
    case "divider":
      return "<hr>";
    default:
      return null;
  }
}

/**
 * Render a posted draft document to a self-contained HTML document for
 * the sandboxed preview iframe. Known blocks render; a block whose type
 * is not known renders as an honest placeholder line AND is reported in
 * `unknownTypes` — exactly the signal the reference's
 * X-Content-Preview-Unknown header carries to its editor.
 */
export function renderPreviewDocument(request: PreviewRenderRequest): RenderedDoc {
  const doc = request.document;
  const mode = asText(request.mode);
  const locale = asText(request.locale);
  const slug = asText(request.slug);

  if (typeof doc !== "object" || doc === null || !Array.isArray((doc as { blocks?: unknown }).blocks)) {
    throw new PreviewDocumentError("The document must be an object with a blocks array.");
  }
  const blocks = (doc as { blocks: unknown[] }).blocks;

  const unknownTypes: string[] = [];
  const seen = new Set<string>();
  const body: string[] = [];

  for (const raw of blocks) {
    if (typeof raw !== "object" || raw === null) {
      throw new PreviewDocumentError("Every block must be an object with a type string.");
    }
    const block = raw as Record<string, unknown>;
    if (typeof block.type !== "string") {
      throw new PreviewDocumentError("Every block must be an object with a type string.");
    }
    const rendered = renderBlock(block);
    if (rendered !== null) {
      body.push(rendered);
      continue;
    }
    // A KNOWN type that did not render is a malformed block — the editor
    // gets an explicit 400, never a silent drop.
    if (KNOWN_TYPES.has(block.type)) {
      throw new PreviewDocumentError(`The ${block.type} block is malformed.`);
    }
    if (!seen.has(block.type)) {
      seen.add(block.type);
      unknownTypes.push(block.type);
    }
    body.push(
      `<p class="unknown">Unrendered block: <code>${esc(block.type)}</code> — not a block type this preview knows.</p>`,
    );
  }

  const headerBits: string[] = ["Draft preview"];
  if (mode) headerBits.push(`mode: ${mode}`);
  if (locale) headerBits.push(`locale: ${locale}`);
  if (slug) headerBits.push(`slug: ${slug}`);

  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex, nofollow">',
    "<title>Draft preview</title>",
    "<style>",
    "  :root { color-scheme: light dark; }",
    "  body { margin: 0; padding: 16px; font: 14px/1.6 system-ui, sans-serif; color: #1a1a1f; background: #fff; }",
    "  header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #dedee6; margin-bottom: 14px; font: 11px/1.2 system-ui, sans-serif; color: #71717e; }",
    "  header b { color: #1a1a1f; }",
    "  h2, h3, h4 { line-height: 1.3; margin: 18px 0 8px; }",
    "  p { margin: 8px 0; }",
    "  blockquote { margin: 10px 0; padding: 6px 12px; border-left: 3px solid #b9b9c6; color: #4c4c57; }",
    "  pre { overflow-x: auto; padding: 10px; background: #f2f2f7; border-radius: 8px; font: 12px/1.5 ui-monospace, monospace; }",
    "  hr { border: 0; border-top: 1px solid #dedee6; margin: 16px 0; }",
    "  .unknown { color: #8a6d1a; background: #fdf6e3; border: 1px solid #ecdfb1; border-radius: 8px; padding: 6px 10px; font-size: 12px; }",
    "  @media (prefers-color-scheme: dark) {",
    "    body { color: #ececf2; background: #131318; }",
    "    header { border-color: #2c2c36; } header b { color: #ececf2; }",
    "    pre { background: #1c1c24; }",
    "    hr { border-color: #2c2c36; }",
    "  }",
    "</style>",
    "</head>",
    "<body>",
    `<header><b>${esc(headerBits[0])}</b>${headerBits.slice(1).map((b) => `<span>${esc(b)}</span>`).join("")}</header>`,
    ...body,
    "</body>",
    "</html>",
  ].join("\n");

  return { html, unknownTypes };
}

/** A malformed draft — the render endpoint answers 400 with the reason. */
export class PreviewDocumentError extends Error {}

/* ------------------------------------------------------------------ */
/* The fetch gate                                                      */
/* ------------------------------------------------------------------ */

/**
 * The reference's render endpoint serves only requests made by its own
 * /content-preview page; anything else gets the 403 gate message. The
 * browser fetch from that page carries Sec-Fetch-Site: same-origin, so
 * the clone keys the gate on exactly that header — same-origin page
 * fetches pass, curl and cross-site posts do not.
 */
export function isPreviewFetchAllowed(headers: Headers): boolean {
  return headers.get("sec-fetch-site") === "same-origin";
}
