/**
 * Blog prose — inline links inside written-article paragraphs (t81).
 *
 * Recon of the reference's article bodies: its paragraphs carry inline
 * hyperlinks (2-9 per article on the format/comparison class, 0-3 on the
 * platform/credits class) pointing at its own routes — viewers,
 * converters, workspace tabs, features, use-cases, blog cross-links.
 * This clone's paragraphs were plain strings; the link structure is the
 * t81 dimension, the copy stays this clone's own.
 *
 * Authoring syntax: markdown-lite — `[label](href)`, nothing else (no
 * nesting, no other markdown). Internal hrefs (starting with "/") render
 * as next/link; external http(s) hrefs render as plain anchors with
 * `target="_blank" rel="noopener noreferrer nofollow"` — the reference's
 * own attribute set on its external prose links. The parser is total:
 * any string without link syntax round-trips as a single text run.
 */

/** One run of a parsed paragraph — either plain text or a link. */
export type ProseRun =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string; external: boolean };

/** The link pattern — `[label](href)`. Labels may not contain brackets;
 * hrefs may not contain whitespace or parens (they are authored as
 * site-relative paths or absolute https URLs, never parenthesised). */
const LINK_RE = /\[([^\][]+)\]\(([^()\s]+)\)/g;

/** Parse one paragraph string into runs. Total and order-preserving. */
export function parseProse(paragraph: string): ProseRun[] {
  const runs: ProseRun[] = [];
  let last = 0;
  for (const m of paragraph.matchAll(LINK_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) runs.push({ kind: "text", text: paragraph.slice(last, idx) });
    const href = m[2];
    runs.push({
      kind: "link",
      text: m[1],
      href,
      external: /^https?:\/\//i.test(href) || href.startsWith("mailto:"),
    });
    last = idx + m[0].length;
  }
  if (last < paragraph.length) runs.push({ kind: "text", text: paragraph.slice(last) });
  return runs;
}

/** Extract every inline-link href in a paragraph (for content tests). */
export function proseHrefs(paragraph: string): string[] {
  return parseProse(paragraph)
    .filter((r): r is Extract<ProseRun, { kind: "link" }> => r.kind === "link")
    .map((r) => r.href);
}

/** Count inline links in a paragraph (for content tests). */
export function proseLinkCount(paragraph: string): number {
  return proseHrefs(paragraph).length;
}
