/**
 * Research library registry (t72) — the reference's /workspace/rodin/tab/research
 * surface, probed live 2026-10-31 (agent-walked, DOM-extracted).
 *
 * The registry pins the papers' real bibliographic constants — titles,
 * venues, years, award badges, ACM DOI links, and the public YouTube /
 * Bilibili video IDs the reference's own player dialogs embed. The figure
 * slide labels mirror the paper figures the reference's carousels cycle
 * (storage keys probed); this clone renders them as labeled placeholder
 * art instead of copying the reference's CDN images.
 *
 * Copy discipline: paper titles, venues, awards, and links are facts.
 * Abstracts are quoted bibliographic text from the published papers
 * (attributed on the card, as any research library does). The one-line
 * connection notes are this clone's own honest wording — they describe
 * the reference product's relationship to the research, never this
 * clone's pipeline (which is a deterministic mesh builder, not CLAY).
 */

export interface ResearchPaper {
  /** Stable id (also the card's React key). */
  id: string;
  /** Award / topic badges shown at the card's top-right (probed order). */
  badges: string[];
  /** The published paper's title. */
  title: string;
  /** Clone-written one-liner connecting the paper to the reference product. */
  connectionNote: string;
  /** Venue chips under the title (probed order). */
  featured: boolean;
  year: string;
  venue: string[];
  /** Quoted abstract text from the published paper. */
  abstract: string;
  /** Carousel slide labels mirroring the reference's figure set. */
  figures: string[];
  /** Public YouTube video the reference's dialog embeds. */
  youtubeId: string;
  /** Public Bilibili video the reference's dialog embeds (bvid). */
  bilibiliBvid: string;
  /** ACM Digital Library DOI page the PDF button opens. */
  doiUrl: string;
}

export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "clay",
    badges: ["3D", "Generative AI", "SIGGRAPH Best Paper Honorable Mentioned"],
    title: "CLAY: A controllable large-scale generative model for creating high-quality 3d assets",
    connectionNote:
      "The published foundation-model research behind the reference product's generation pipeline.",
    featured: true,
    year: "2024",
    venue: ["ACM SIGGRAPH", "ACM Transactions on Graphics (TOG)"],
    abstract:
      "In the realm of digital creativity, our potential to craft intricate 3D worlds from imagination is often hampered by the limitations of existing digital tools, which demand extensive expertise and efforts. To narrow this disparity, we introduce CLAY, a 3D geometry and material generator designed to effortlessly transform human imagination into intricate 3D digital structures.",
    figures: ["x1", "x3", "ga3", "overview", "PBR", "control_short_V3"],
    youtubeId: "cloVLY6lWdI",
    bilibiliBvid: "BV17vV6zZEU3",
    doiUrl: "https://dl.acm.org/doi/10.1145/3658146",
  },
  {
    id: "cast",
    badges: ["3D", "Generative AI", "World Model", "SIGGRAPH Best Paper"],
    title: "CAST: Component-aligned 3d scene reconstruction from an rgb image",
    connectionNote:
      "Scene-level 3D reconstruction research from the same lab, pointing at the reference's WorldGen direction.",
    featured: true,
    year: "2025",
    venue: ["ACM SIGGRAPH", "ACM Transactions on Graphics (TOG)"],
    abstract:
      "Recovering high-quality 3D scenes from a single RGB image is a challenging task in computer graphics. Current methods often struggle with domain-specific limitations or low-quality object generation. To address these, we propose CAST (Component-Aligned 3D Scene Reconstruction from a Single RGB Image), a novel method for 3D scene reconstruction and recovery.",
    figures: ["teaser", "pipeline1", "gallery_small"],
    youtubeId: "UL5nSyg2Aps",
    bilibiliBvid: "BV1T3bGzvEGF",
    doiUrl: "https://dl.acm.org/doi/10.1145/3730840",
  },
];

/** The embed URL builder for the reference's YouTube video dialog (same source). */
export function researchYouTubeEmbed(paper: ResearchPaper): string {
  return `https://www.youtube.com/embed/${paper.youtubeId}`;
}

/** The embed URL builder for the reference's Bilibili video dialog (same source). */
export function researchBilibiliEmbed(paper: ResearchPaper): string {
  return `https://player.bilibili.com/player.html?bvid=${paper.bilibiliBvid}`;
}
