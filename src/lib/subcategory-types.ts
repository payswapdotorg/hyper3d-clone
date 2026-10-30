/**
 * Sub-category page types — the /sub-categories tree's contract (t63).
 *
 * Mirrors the reference's sub-category page anatomy (recon 2026-10-30 of
 * hyper3d.ai/sub-categories/{dark-fantasy,nsfw-content,roblox}): H1
 * "<Name> 3D Models" + browsing intro, "Browse by Tag" chips,
 * "Featured Free <Name> 3D Models" grid, "Generate Custom <Name> 3D
 * Models" CTA, "Also in <Parent Category>" sibling links, "You May Also
 * Like" related links, and a short FAQ — with this clone's honesty
 * contract on top.
 *
 * What a "sub-category" is at the reference: a tagged marketplace
 * collection — tag chips under /tags/*, asset cards with per-model pages
 * and usage terms, sibling collections with model counts ("Wizards &
 * Magic Users 88 models"). NONE of that exists in this clone; what is
 * real here is the prompt-steered generator (spec geometry, parameter
 * materials, six real export formats), the community gallery in the
 * studio, and the live OmniCraft tools (HDRI, Vector to 3D, Model
 * Viewer, Format Convertor).
 *
 * Status semantics:
 *  - "generatable": the collection itself is not here, but the theme is
 *    genuinely steerable through the real generator — the page says what
 *    works and hands you the studio.
 *  - "absent": the entire category does not exist here — no collection,
 *    no tags, no mode. The page exists only to say that honestly and
 *    point at what is real instead.
 */

export type SubCategoryStatus = "generatable" | "absent";

export interface SubCategoryLink {
  label: string;
  href: string;
}

export interface SubCategoryCta {
  label: string;
  href: string;
}

export interface SubCategoryFaq {
  q: string;
  a: string;
}

export interface SubCategoryPageDef {
  /** Path segment under /sub-categories/ (reference sitemap truth). */
  slug: string;
  /** Short name for the top bar, e.g. "Dark Fantasy". */
  name: string;
  /** Page H1 (reference pattern: "Dark Fantasy 3D Models"). */
  title: string;
  /** Meta description (<=180 chars), this clone's own honest text. */
  description: string;
  /** Hero subline under the H1. */
  subline: string;
  /** generatable | absent — see type doc. */
  status: SubCategoryStatus;
  /** Chip label in the header ("GENERATABLE HERE" / "NOT HERE"). */
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
  /** "Browse by Tag" — honest inversion: no /tags/* routes; real links. */
  browseTitle: string;
  browseIntro: string;
  browseLinks: SubCategoryLink[];
  /** "Featured Free <Name> 3D Models" — the honest "not here" panel. */
  featuredTitle: string;
  /** Must open "Not here." — the reference's asset grid is not faked. */
  featuredBody: string;
  featuredLinks: SubCategoryLink[];
  /** "Generate Custom <Name> 3D Models" — the REAL section. */
  generateTitle: string;
  generateBody: string;
  generateCta: SubCategoryCta;
  generateSecondary?: SubCategoryCta;
  /** "Also in <Parent>" — reference has it for 2 of 3 pages; optional. */
  alsoIn?: {
    title: string;
    intro: string;
    links: SubCategoryLink[];
  };
  /** "You May Also Like" — real routes only. */
  relatedTitle: string;
  relatedIntro: string;
  relatedLinks: SubCategoryLink[];
  /** FAQ (native <details> — server component). */
  faqTitle: string;
  faq: SubCategoryFaq[];
  /** Closing CTA band. */
  closingTitle: string;
  closingBody: string;
  closingCta: SubCategoryCta;
  /** Hero CTAs. */
  cta: SubCategoryCta;
  ctaSecondary?: SubCategoryCta;
}
