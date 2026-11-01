/**
 * Blog related-cards — the "Keep reading" section (t81).
 *
 * Recon of the reference's 55 written-article counterparts: exactly 24
 * (the format/comparison/prompt-guide class) carry a related-card
 * section — "Keep reading", three cards, each an image (the target's
 * og:image hotlinked from the reference CDN, 1200×675 lazy) plus the
 * target's H1 and a ~155-char description snippet. The other 31
 * (platform/credits/account FAQ) have no related section at all. The
 * 24-slug set below is that probed fact, pinned.
 *
 * The clone's honest card (structure aligned, content its own):
 *  - image: the t77 registry value for the target route (the exact URL
 *    the target's own head serves as og:image), fallback banner.
 *  - alt: the target slug (the reference's own convention).
 *  - title: the destination's own on-page H1 (the clone's own headline
 *    for written targets, the derived topic title otherwise).
 *  - description: exactly the description the destination's own head
 *    serves (`referenceDescription` ?? the written article's own),
 *    truncated at 155 chars + "..." when longer — the reference's
 *    snippet length. Two reference cards deviate from their own
 *    og:description (recon: what-is-3d-rendering, free-ai-avatar-
 *    generator); the clone's rule is self-consistency instead.
 */

import { referenceDescription } from "./reference-descriptions";
import { referenceOgImage } from "./reference-og-images";
import { OG_BANNER_FALLBACK_URL } from "./schema-org";
import { findBlogEntry } from "./blog";

/** The 24 slugs whose reference counterpart ships the related-card
 * section (recon/t81/article-probe.json — probed, not assumed). */
export const KEEP_READING_SLUGS: ReadonlySet<string> = new Set([
  "3d-prompt-engineering",
  "3d-text-prompt-guide",
  "3mf-vs-stl",
  "fbx-vs-glb",
  "free-text-to-3d-model",
  "generate-3d-game-assets",
  "glb-vs-gltf",
  "how-to-convert-image-to-3d-model",
  "how-to-make-3d-models-with-ai",
  "hyper3d-review",
  "image-to-3d",
  "image-to-stl",
  "obj-vs-stl",
  "stl-vs-obj-vs-fbx",
  "text-to-3d-model",
  "text-to-stl",
  "what-is-3mf-file",
  "what-is-dxf-file",
  "what-is-fbx-file",
  "what-is-glb-file",
  "what-is-obj-file",
  "what-is-ply-file",
  "what-is-stl-file",
  "what-is-usdz",
]);

/** The reference's card snippet length: 155 chars + "...". */
export const CARD_SNIPPET_MAX = 155;

/** Truncate a description to the reference's card snippet shape. */
export function cardSnippet(description: string): string {
  return description.length > CARD_SNIPPET_MAX
    ? `${description.slice(0, CARD_SNIPPET_MAX)}...`
    : description;
}

/** A resolved related card. */
export interface RelatedCard {
  /** The target's og:image (t77 registry value; fallback banner). */
  image: string;
  /** The target slug — the reference's own img alt convention. */
  alt: string;
  /** The destination's own on-page H1. */
  title: string;
  /** The destination's head description, snippet-shaped. */
  description: string;
}

/** Resolve the card data for a /blog/{slug} related href. Returns
 * undefined when the href is not a catalog blog route. */
export function relatedCard(href: string): RelatedCard | undefined {
  if (!href.startsWith("/blog/")) return undefined;
  const slug = href.slice("/blog/".length);
  const entry = findBlogEntry(slug);
  if (!entry) return undefined;
  const own = entry.family === "written" ? entry.article?.description : undefined;
  const description = referenceDescription(href) ?? own;
  if (!description) return undefined;
  return {
    image: referenceOgImage(href) ?? OG_BANNER_FALLBACK_URL,
    alt: slug,
    title: entry.title,
    description: cardSnippet(description),
  };
}
