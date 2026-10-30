/**
 * Sub-category page content (t63) — the three pages the reference's
 * English sitemap ships (landing-sitemap-sub-categories-en.xml, recon
 * 2026-10-30: dark-fantasy, nsfw-content, roblox — no index page).
 *
 * Copy discipline (same as every tree): the reference's section
 * structure is reproduced, never its text. The reference's numbers
 * ("Wizards & Magic Users 88 models", "843 models") are marketplace
 * counts that have no meaning here — they are replaced by honest
 * statements of what is real, anchored to the imported constants the
 * tests assert (EXPORT_FORMATS, INITIAL_BALANCE/STANDARD_COST).
 */

import type { SubCategoryPageDef } from "./subcategory-types";

export const DARK_FANTASY_PAGE: SubCategoryPageDef = {
  slug: "dark-fantasy",
  name: "Dark Fantasy",
  title: "Dark Fantasy 3D Models",
  description:
    "No tagged dark-fantasy collection exists in this clone. Generate dark-fantasy 3D models with the real prompt-steered studio instead — honest status on the page.",
  subline:
    "The reference site curates a tagged dark-fantasy marketplace. This clone has no marketplace, no tags and no model counts — it has a real generator that steers toward dark-fantasy silhouettes and palettes, and this page says exactly where that stops.",
  status: "generatable",
  statusChip: "GENERATABLE HERE",
  statusPanel: {
    summary:
      "The dark-fantasy collection is not here, but the theme is genuinely steerable in the real studio — through prompt words, palette colors and proportions, not through a style-lock.",
    works: [
      "Dark-fantasy silhouettes (spires, horns, tattered cloaks, ornate hilts) are steered by prompt vocabulary over the real shape grammar — boxes, spheres, cylinders, cones, tori, lathes and extrudes.",
      "Moody palettes are real: per-part color, metalness and roughness are actual MeshStandardMaterial parameters, so bone-pale, rusted-iron and oxblood reads land in the mesh itself.",
      "Every generated asset exports for real — GLB, GLTF, FBX, OBJ, STL and USDZ — for scene assembly in Blender, Unity or any DCC.",
      "The community gallery in the studio shows what users actually generated here, with likes and search over your own tasks.",
    ],
    limits: [
      "No tagged marketplace: there are no dark-fantasy tag pages, no per-asset download cards and no model counts — the collection this page is named after does not exist here.",
      "Materials are parameters, not baked dark-fantasy texture sets — no grime maps, no sculpted detail, no albedo/normal PBR maps; a DCC pass finishes that layer.",
      "No style-lock: prompt words steer the look, they do not enforce it — two runs from the same prompt differ.",
      "No hosted marketplace terms per asset — usage here is governed by this clone's legal center only.",
    ],
  },
  browseTitle: "Browse by Tag",
  browseIntro:
    "Not here. The reference's tag system — chips like Roblox Avatar or Mythical Creatures under /tags/ routes — does not exist in this clone. The real ways to browse are the style pages and the community gallery.",
  browseLinks: [
    { label: "Gothic style", href: "/styles/gothic" },
    { label: "Fantasy style", href: "/styles/fantasy" },
    { label: "Medieval style", href: "/styles/medieval" },
    { label: "All 21 styles", href: "/styles" },
    { label: "Community gallery (studio)", href: "/" },
  ],
  featuredTitle: "Featured Free Dark Fantasy 3D Models",
  featuredBody:
    "Not here. This clone has no tagged asset grid, no per-model pages and no free-download counts — the reference's \"Featured Free\" row is a marketplace feature, and a fake one here would be a lie. The real equivalents: generate the asset you need, or inspect any GLB you already have in the local Model Viewer.",
  featuredLinks: [
    { label: "Generate one now", href: "/" },
    { label: "Model Viewer (local GLB inspection)", href: "/omnicraft/viewer" },
    { label: "How text-to-3D works", href: "/features/text-to-3d" },
  ],
  generateTitle: "Generate Custom Dark Fantasy 3D Models",
  generateBody:
    "Need a specific dark-fantasy prop — a grave lantern, a ruin gate, a cursed chalice? Open the studio, describe it (e.g. \"a tall gothic gate, blackened iron, pointed arch, rusted bands\"), and generate. A standard generation costs 1 credit at Confirm and every account starts with 50; previews are free and a canceled Confirm is refunded.",
  generateCta: { label: "Generate and Download", href: "/" },
  generateSecondary: { label: "Image-to-3D instead", href: "/features/image-to-3d" },
  alsoIn: {
    title: "Also in Fantasy & Mythology",
    intro:
      "The reference groups dark fantasy under a Fantasy & Mythology parent with sibling collections and model counts. Those collections are not here — the real siblings are this clone's style and use-case pages.",
    links: [
      { label: "Fantasy", href: "/styles/fantasy" },
      { label: "Gothic", href: "/styles/gothic" },
      { label: "Medieval", href: "/styles/medieval" },
      { label: "Character design use case", href: "/use-cases/character-design" },
      { label: "Game development use case", href: "/use-cases/game-development" },
    ],
  },
  relatedTitle: "You May Also Like",
  relatedIntro:
    "Related real routes in this clone — other collection pages, styles and workflows, not marketplace categories.",
  relatedLinks: [
    { label: "Roblox 3D Models", href: "/sub-categories/roblox" },
    { label: "Stylized style", href: "/styles/stylized" },
    { label: "Organic style", href: "/styles/organic" },
    { label: "Animation use case", href: "/use-cases/animation" },
    { label: "NFT creation use case", href: "/use-cases/nft-creation" },
  ],
  faqTitle: "Free Dark Fantasy 3D Models FAQ",
  faq: [
    {
      q: "Are there free dark-fantasy models to download here?",
      a: "No. There is no model library and no downloads page — this clone generates models rather than hosting them. Generation is metered in credits: every account starts with 50, previews are free, and a standard Confirm costs 1 credit (agentic runs cost 10).",
    },
    {
      q: "How do I choose a dark-fantasy asset for a scene?",
      a: "Start from the silhouette: describe the shape in the prompt (spired, hunched, blade-like), then steer the mood with palette colors and per-part metalness and roughness. Inspect the result at the distance and lighting you plan to use — a thumbnail never shows how a silhouette reads in-scene.",
    },
    {
      q: "Does the collection include game-ready or rigged models?",
      a: "No. Nothing here is rigged — exports are static meshes in GLB, GLTF, FBX, OBJ, STL and USDZ, with parameter materials rather than baked PBR sets. Rigging and texture finishing happen in your DCC.",
    },
    {
      q: "What governs reuse of what I generate?",
      a: "This clone's own legal center — Terms of Use, Copyright & License and the Fulfillment Policy. There are no per-asset license pages because there are no per-asset pages.",
    },
  ],
  closingTitle: "Generate the dark-fantasy asset you actually need",
  closingBody:
    "Skip the marketplace browsing: describe the prop, confirm the preview, download the mesh. The studio is the real thing this page can offer.",
  closingCta: { label: "Open the studio", href: "/" },
  cta: { label: "Generate a Dark Fantasy Model", href: "/" },
  ctaSecondary: { label: "See the Gothic style page", href: "/styles/gothic" },
};

export const NSFW_CONTENT_PAGE: SubCategoryPageDef = {
  slug: "nsfw-content",
  name: "NSFW",
  title: "NSFW 3D Model Collection",
  description:
    "There is no NSFW 3D model collection in this clone — no tags, no previews, no NSFW mode. This page says so plainly and points at the real generator and legal center.",
  subline:
    "The reference site ships a browsable NSFW collection with tag groups and per-model terms. This clone has none of it — no NSFW collection, no NSFW tags, no NSFW generation mode — and this page exists to say that honestly instead of implying otherwise.",
  status: "absent",
  statusChip: "NOT HERE",
  statusPanel: {
    summary:
      "The entire category is absent: no NSFW collection, no NSFW tags, no NSFW mode. The generator is a general-purpose procedural 3D engine, and that is the whole truth.",
    works: [
      "General-purpose 3D generation is real: text prompts and image references steer everyday objects, characters, props and scenes.",
      "The community gallery shows general 3D work generated in the studio — with likes, and search over your own tasks.",
      "Usage is governed by this clone's real legal center: Terms of Use, Copyright & License, Privacy, Refund and Fulfillment documents.",
      "The help center's scam-safety article lists the official links for this project, so you can tell this clone's real surfaces from imitations.",
    ],
    limits: [
      "No NSFW collection: there is no browsable set of NSFW assets, no tag groups, and no per-model preview pages.",
      "No NSFW tags: the gallery is not tag-filterable at all, and no NSFW vocabulary exists anywhere in this clone's UI.",
      "No NSFW mode: the generator has no content-category switch — it is one general-purpose procedural engine.",
      "No per-asset licenses: the reference's per-model usage terms do not map here because per-model pages do not exist.",
    ],
  },
  browseTitle: "Browse by Tag",
  browseIntro:
    "Not here — and not only for NSFW: this clone has no tag system of any kind, under any route. The real browsing surfaces are the styles tree and the studio gallery.",
  browseLinks: [
    { label: "All 21 styles", href: "/styles" },
    { label: "Community gallery (studio)", href: "/" },
    { label: "Features overview", href: "/features" },
  ],
  featuredTitle: "Featured Free NSFW 3D Models",
  featuredBody:
    "Not here. There is no NSFW asset grid to feature — no cards, no counts, no previews. Faking a featured row on a page whose subject does not exist in this clone would be the least honest thing on the site. The real things on offer are the general-purpose generator and the gallery of general 3D work.",
  featuredLinks: [
    { label: "Open the studio", href: "/" },
    { label: "What the generator really does", href: "/features/text-to-3d" },
    { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
  ],
  generateTitle: "Generate Custom 3D Models",
  generateBody:
    "The generate button on the reference's NSFW page routes to the same Rodin generator everything else uses — and so does this one, with the difference that this clone says it directly: the studio here is a general-purpose procedural generator (1 credit per standard Confirm, 50 credits to start, 10 for agentic runs), not an NSFW source.",
  generateCta: { label: "Generate and Download", href: "/" },
  generateSecondary: { label: "Read the Terms of Use", href: "/legal/terms" },
  relatedTitle: "You May Also Like",
  relatedIntro:
    "Real routes that neighbor this page's honest subject — the legal and help surfaces that govern content and safety here.",
  relatedLinks: [
    { label: "Terms of Use", href: "/legal/terms" },
    { label: "Copyright & License", href: "/legal/copyright-license" },
    { label: "Official links & scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
    { label: "Dark Fantasy 3D Models", href: "/sub-categories/dark-fantasy" },
    { label: "Roblox 3D Models", href: "/sub-categories/roblox" },
  ],
  faqTitle: "NSFW 3D Models FAQ",
  faq: [
    {
      q: "Is there an NSFW model collection on this site?",
      a: "No. There is no NSFW collection, no NSFW tag group and no NSFW browsing surface anywhere in this clone — this page is the only mention, and it exists to say the category is absent.",
    },
    {
      q: "Does the generator have an NSFW mode?",
      a: "No. The generator is a general-purpose procedural 3D engine — text prompts and image references steer everyday geometry. There is no content-category switch, no NSFW vocabulary in the UI, and no separate pipeline.",
    },
    {
      q: "Where are the usage terms for what I generate?",
      a: "In the legal center — one set of documents (Terms of Use, Copyright & License, Fulfillment) governs everything generated here. There are no per-asset license pages, because there are no per-asset pages.",
    },
    {
      q: "How do I report a problem or verify this site is genuine?",
      a: "Use the help center's scam-safety article — it lists this project's official links. The help center also states plainly that there is no live chat and no ticket queue here, so verify links before you trust them.",
    },
  ],
  closingTitle: "The honest version of this page",
  closingBody:
    "No collection to browse, no mode to enable. If you need general 3D generation, the studio is real and waiting; if you needed NSFW content, this clone is simply not that.",
  closingCta: { label: "Open the studio", href: "/" },
  cta: { label: "Open the studio", href: "/" },
  ctaSecondary: { label: "Read the Terms of Use", href: "/legal/terms" },
};

export const ROBLOX_PAGE: SubCategoryPageDef = {
  slug: "roblox",
  name: "Roblox",
  title: "Roblox 3D Models",
  description:
    "No tagged Roblox collection exists in this clone. Generate game-flavored 3D models with the real studio instead — six export formats, honest limits stated on the page.",
  subline:
    "The reference site stacks a Roblox tag over a marketplace of game assets. This clone has no Roblox tag, no marketplace and no platform-specific mesh validation — it has a real generator whose low-poly output fits game workflows, and this page states exactly where the guarantees stop.",
  status: "generatable",
  statusChip: "GENERATABLE HERE",
  statusPanel: {
    summary:
      "The Roblox collection is not here, but game-flavored generation is real: low-poly steering works, exports include FBX and OBJ, and the rest is Roblox Studio's own import tooling — which this page neither controls nor promises.",
    works: [
      "Game-ready steering is real: the low-poly and voxel style pages document prompt patterns that keep meshes simple — flat palettes, chunky proportions, minimal ornament.",
      "Exports include FBX and OBJ among the six real formats (GLB, GLTF, FBX, OBJ, STL, USDZ) — formats game toolchains commonly accept.",
      "The local Model Viewer inspects any GLB you already have — no upload, no account, entirely in your browser.",
      "The Format Convertor re-exports your own generated tasks across the six real formats.",
    ],
    limits: [
      "No Roblox tag and no marketplace: no per-asset cards, no download counts, no Roblox-themed collection to browse.",
      "No Roblox-specific validation: nothing here checks mesh complexity, scale, textures or naming against Roblox Studio's requirements — test imports in your own Studio project.",
      "No polycount slider and no LOD generation: the controls do not exist in this clone; simplify or decimate in your DCC if a mesh comes out too dense.",
      "No import-compatibility promise: whether Roblox Studio accepts a mesh is Roblox Studio's decision, and this page does not claim otherwise.",
    ],
  },
  browseTitle: "Browse by Tag",
  browseIntro:
    "Not here. The reference's tag chips (Roblox Avatar, Game Avatar, Robloxian) live under /tags/ routes that do not exist in this clone. The real game-adjacent browsing is the styles tree and the game-development use case.",
  browseLinks: [
    { label: "Low Poly style", href: "/styles/low-poly" },
    { label: "Voxel style", href: "/styles/voxel" },
    { label: "Game development use case", href: "/use-cases/game-development" },
    { label: "All 21 styles", href: "/styles" },
    { label: "Community gallery (studio)", href: "/" },
  ],
  featuredTitle: "Featured Free Roblox 3D Models",
  featuredBody:
    "Not here. There is no Roblox asset grid, no free-download row and no per-model pages — a Roblox tag over a marketplace this clone does not have would be a fake. The real equivalents: generate the prop yourself in low-poly style, or inspect what you already have in the local Model Viewer.",
  featuredLinks: [
    { label: "Generate one now", href: "/" },
    { label: "Low Poly style guide", href: "/styles/low-poly" },
    { label: "Model Viewer (local GLB inspection)", href: "/omnicraft/viewer" },
  ],
  generateTitle: "Generate Custom Roblox 3D Models",
  generateBody:
    "Need a specific prop for a Roblox project — a sword, a tree, a shop stall? Open the studio and describe it plainly (e.g. \"a small wooden market stall, striped canopy, low poly, flat colors\"). A standard generation costs 1 credit at Confirm, accounts start with 50, and the result exports as FBX or OBJ alongside four other real formats. Whether Roblox Studio accepts the mesh is its own import tooling's call — test before you build a scene around it.",
  generateCta: { label: "Generate and Download", href: "/" },
  generateSecondary: { label: "Game development use case", href: "/use-cases/game-development" },
  alsoIn: {
    title: "Also in Gaming",
    intro:
      "The reference groups Roblox under a Gaming parent with sibling collections (D&D & Tabletop, Game Props, Retro & Classic…) and model counts. Those collections are not here — the real siblings are this clone's style and use-case pages.",
    links: [
      { label: "Low Poly", href: "/styles/low-poly" },
      { label: "Voxel", href: "/styles/voxel" },
      { label: "Pixel Art (finish in DCC)", href: "/styles/pixel-art" },
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Animation use case", href: "/use-cases/animation" },
    ],
  },
  relatedTitle: "You May Also Like",
  relatedIntro:
    "Related real routes in this clone — other collection pages, styles and workflows, not marketplace categories.",
  relatedLinks: [
    { label: "Dark Fantasy 3D Models", href: "/sub-categories/dark-fantasy" },
    { label: "NSFW 3D Model Collection", href: "/sub-categories/nsfw-content" },
    { label: "Cartoon style", href: "/styles/cartoon" },
    { label: "Format Convertor tool", href: "/omnicraft/convertor" },
    { label: "3D printing use case", href: "/use-cases/3d-printing" },
  ],
  faqTitle: "Free Roblox 3D Models FAQ",
  faq: [
    {
      q: "Are these models ready to import into Roblox Studio?",
      a: "No promise is made here. Nothing in this clone validates a mesh against Roblox Studio's requirements — check the file format (FBX and OBJ are among the six real exports), mesh complexity, scale and textures yourself, then test the asset in your own Studio project before depending on it.",
    },
    {
      q: "How should I choose a model for my Roblox project?",
      a: "Start from the shape and style you described in the prompt — steer flat colors and chunky proportions for a game read, export, and adjust mesh or textures in your DCC if your scene needs it. There is no polycount slider and no LOD generation here.",
    },
    {
      q: "Can I get free Roblox models to download?",
      a: "No. There is no model library here — generation is the product. Previews are free, every account starts with 50 credits, and a standard Confirm costs 1 credit (agentic runs cost 10).",
    },
    {
      q: "Do you support Roblox-specific formats or mesh limits?",
      a: "No. The exporters ship GLB, GLTF, FBX, OBJ, STL and USDZ — nothing Roblox-specific. Mesh limits are Roblox Studio's business, and simplification happens in your DCC, not in this clone.",
    },
  ],
  closingTitle: "Generate the game prop you actually need",
  closingBody:
    "Describe it, confirm the preview, export FBX or OBJ, and let Roblox Studio's own import tooling make the final call. The studio is the real thing this page can offer.",
  closingCta: { label: "Open the studio", href: "/" },
  cta: { label: "Generate a Game Prop", href: "/" },
  ctaSecondary: { label: "See the Low Poly style page", href: "/styles/low-poly" },
};
