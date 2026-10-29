/**
 * Style page types — the /styles tree's contract (t60).
 *
 * Mirrors the reference's style page anatomy (recon 2026-10-29 of
 * hyper3d.ai/styles/low-poly: hero + "in three steps" + a deep-dive band +
 * "What makes a model read as [style]" cards + "[style] prompt recipes that
 * work" + FAQ + "Explore more AI 3D styles" matrix + closing CTA), with this
 * clone's honesty contract on top.
 *
 * What "style" means HERE (the levers that are real, src/lib):
 *  - Prompt steering: style words travel through the spec — shape
 *    vocabulary (box/sphere/cylinder/cone/torus/lathe/extrude), palette
 *    colors, per-part color/metalness/roughness, proportions/transforms,
 *    and segment counts on the segmented primitives. Nothing ENFORCES a
 *    style; the prompt steers it.
 *  - Materials are per-part MeshStandardMaterial PARAMETERS (color /
 *    metalness / roughness — mesh-builder.ts buildMaterial), never baked
 *    texture-map sets.
 *  - Exports are real (GLB/GLTF/OBJ/STL/USDZ/FBX).
 *
 * Status semantics for styles:
 *  - "live":    the style's core character is expressible through those
 *               real levers — prompt-steered geometry, palette, and
 *               proportions land the look within what procedural
 *               primitives can express, and the export row is real.
 *  - "partial": the style's core character depends on a capability this
 *               clone lacks (baked textures, a toon shading model,
 *               scan-grade photoreal materials). The mesh and the loop
 *               are real; the LOOK is finished in your DCC — the page
 *               says so, it does not imply it.
 */

export type StyleStatus = "live" | "partial";

export interface StyleStep {
  title: string;
  body: string;
}

/** "What makes a model read as [style]" — the style-craft cards. */
export interface StyleSignal {
  title: string;
  body: string;
}

/** A copy-paste-able studio prompt plus what to honestly expect from it. */
export interface StyleRecipe {
  title: string;
  prompt: string;
  note: string;
}

export interface StyleFaq {
  q: string;
  a: string;
}

export interface StyleCrossLink {
  label: string;
  href: string;
}

export interface StyleCta {
  label: string;
  href: string;
}

export interface StylePageDef {
  /** Path segment under /styles/ (reference sitemap order). */
  slug: string;
  /** Short name for nav/cards, e.g. "Low Poly". */
  name: string;
  /** Page H1 (reference pattern: "AI Low Poly 3D Model Generator"). */
  title: string;
  /** Meta description (<=180 chars). */
  description: string;
  /** Hero subline under the H1. */
  subline: string;
  /** live | partial — see type doc. */
  status: StyleStatus;
  /** Chip label shown in the header ("STEERABLE HERE" / "LIMITED HERE"). */
  statusChip: string;
  /** The honest status panel. */
  statusPanel: {
    /** One-sentence verdict. */
    summary: string;
    /** What genuinely works in this clone. */
    works: string[];
    /** What is different here vs the reference page. */
    limits: string[];
  };
  /** The "…in three steps" section. */
  stepsTitle: string;
  steps: StyleStep[];
  /** "What makes a model read as [style]" — style-craft cards. */
  signalsTitle: string;
  signals: StyleSignal[];
  /** "[Style] prompt recipes that work" — real prompts + honest notes. */
  recipesTitle: string;
  recipes: StyleRecipe[];
  /** FAQ (native <details> — server component). */
  faqTitle: string;
  faq: StyleFaq[];
  /** Cross-links: sibling styles + relevant use-cases/features/tools. */
  crossLinksTitle: string;
  crossLinks: StyleCrossLink[];
  /** Closing CTA band. */
  closingTitle: string;
  closingBody: string;
  closingCta: StyleCta;
  /** Hero CTAs. */
  cta: StyleCta;
  ctaSecondary?: StyleCta;
}
