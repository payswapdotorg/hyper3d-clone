/**
 * Prompt-library types — the /3d-prompts tree's contract (t69).
 *
 * Recon 2026-10-31 of hyper3d.ai/3d-prompts (recon/3d-prompts-tree.md):
 * 444 routes — a 17-page index (24 cards per page, 19 on the last), 403
 * detail routes, and 11 model hubs (+13 hub pagination pages) whose 421
 * memberships match the reference's own claimed counts exactly. The
 * reference's entries are community submissions: externally attributed
 * (X/Twitter), dated, screenshotted — a prompt somebody ran through a
 * third-party LLM (GPT-6 Astra, Claude Opus 5.5, Kimi K3 …) to build a
 * three.js/Blender project.
 *
 * This clone's honesty contract at prompt-library scale: all 403 detail
 * routes exist (route parity), a curated 36 of them carry prompt pages
 * this clone actually wrote — original prompts that run in its own
 * text-to-3D studio, with craft notes anchored to code that runs here —
 * and the remaining 367 are honestly marked pages that say what they are
 * (the reference's community content, not reproduced) and why. The model
 * hubs exist for parity too, and say plainly that they index the
 * reference's community prompts by the third-party LLM those prompts
 * were written FOR — a taxonomy this clone's own pipeline does not use.
 *
 * No sitemap change: the reference keeps the entire tree out of its
 * sitemaps (static-en carries /3d-prompts only), and this clone mirrors
 * that choice — pinned by test.
 */

/** Generation mode a written prompt exercises (real studio modes). */
export type PromptMode = "text" | "image" | "scene";

/** Subject grouping for the written set (index grouping + chips). */
export type PromptGroup =
  | "characters"
  | "props"
  | "environments"
  | "dioramas";

/** A prompt-craft note — why the prompt is shaped the way it is. */
export interface PromptNote {
  /** Note heading (rendered as an H3 like the reference's tips). */
  title: string;
  /** 2-4 sentences anchored to how this studio actually behaves. */
  body: string;
}

export interface PromptLink {
  label: string;
  href: string;
}

/** A written prompt page — the only detail routes with real content. */
export interface PromptArticleDef {
  /** Path segment under /3d-prompts/ (the reference route slug, verbatim). */
  slug: string;
  /** Page H1 — this clone's own headline for the subject. */
  title: string;
  /** Meta description (<=180 chars), this clone's own text. */
  description: string;
  /** The one-line card blurb (this clone's own, shown on index cards). */
  blurb: string;
  /** The prompt itself — original text that runs in this studio. */
  prompt: string;
  /** 3-6 keyword chips. */
  keywords: string[];
  /** Which real studio mode the prompt exercises. */
  mode: PromptMode;
  /** Subject group (index grouping + card chip). */
  group: PromptGroup;
  /** 2-3 craft notes (the "prompt optimization tips" band). */
  notes: PromptNote[];
  /** 2-4 cross-links to routes that genuinely exist here. */
  related: PromptLink[];
}

/**
 * Family of a detail route:
 *  - "written":   this clone wrote the prompt page (original prompt, real
 *                 craft notes, runnable in the studio).
 *  - "community": the reference's community submission at this URL — not
 *                 reproduced; served as an honestly marked page.
 */
export type PromptFamily = "written" | "community";

/** One row of the prompt catalog — every one of the 403 reference routes. */
export interface PromptEntry {
  /** The reference route slug. */
  slug: string;
  /** Computed family. */
  family: PromptFamily;
  /** The written article, when family === "written". */
  article?: PromptArticleDef;
  /** Display title — the article's headline, or the subject derived from
   * the slug for community rows. */
  title: string;
  /** The reference's model association(s) for this route (hub membership),
   * display-name order — factual route data, shown as indexed-under chips. */
  models: string[];
}

/** Display metadata for one of the 11 model hubs. */
export interface PromptHubInfo {
  /** Hub slug under /3d-prompts/models/. */
  slug: string;
  /** Display name (e.g. "GPT-6 Astra"). */
  name: string;
  /** The reference's own claimed count (its index card). */
  claimed: number;
  /** Membership as crawled (== claimed for every hub). */
  members: number;
  /** Hub pagination page count (astra 11, fable-5.1 4, the rest 1). */
  pages: number;
}

/** One external creator-review entry (the reference's own curation). */
export interface PromptVideoRef {
  /** The model label the reference files this review under. */
  model: string;
  /** Video title. */
  title: string;
  /** One-line blurb (the reference's own). */
  blurb: string;
  /** Creator display name. */
  creator: string;
  /** External watch URL (kept verbatim — external, not ours). */
  url: string;
}
