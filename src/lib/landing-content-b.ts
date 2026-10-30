/**
 * /3d-prompts content — the real example-prompt hub (t62).
 *
 * Reference recon (2026-10-30, hyper3d.ai/3d-prompts): a hero, a
 * "featured examples" band of working projects, prompt cards organized
 * by the AI model that wrote them (GPT / Claude / Sonnet / Opus / Kimi)
 * with author and date, YouTube embeds of prompts-become-3D, a
 * "prompts for games, worlds and simulations" cross-link band, and a
 * three-step "how to use a 3D prompt" section.
 *
 * This clone's honest equivalent: every example below is a real prompt
 * you can paste into the text-to-3D studio at the root of this site —
 * two of the featured ones are literally the placeholder examples the
 * studio ships in its prompt box. There is no community gallery, no
 * model-name filter, and no video embed here, and the page says so in
 * the note; what is real instead is the prompt-polish endpoint that
 * rewrites rough prompts, the four generation modes, and the 21 style
 * pages with their own recipe notes.
 */

import type { PromptsPageDef } from "./landing-types";
import { STUDIO_PATH } from "./studio-path";

export const PROMPTS_PAGE: PromptsPageDef = {
  route: "/3d-prompts",
  title: "3D Prompts",
  description:
    "Free example prompts that work with this clone's text-to-3D studio: characters, props, environments, and stylized looks — copy one, paste it in, generate.",
  hero: {
    eyebrow: "3D PROMPTS",
    headline: "Prompts that work here",
    subhead:
      "Real example prompts for the text-to-3D studio at the root of this site. Copy one, paste it into the prompt box, and generate — previews render before any credit moves, and Confirm & Export costs 1 credit. Edit any prompt to make it yours; the studio's polish button rewrites a rough idea into a tighter one.",
    primaryCta: { label: "Open the studio", href: STUDIO_PATH },
    secondaryCta: { label: "How text-to-3D works", href: "/features/text-to-3d" },
  },
  featuredHeading: "Featured — the studio's own examples",
  featured: [
    {
      title: "Sci-fi cargo drone",
      prompt: "a rugged sci-fi cargo drone, matte panels, worn metal, red accents",
      category: "props",
      why: "The default text-to-3D example the studio ships — subject, surface, wear, and one accent color in one sentence.",
    },
    {
      title: "Floating island village",
      prompt: "a floating island village, waterfalls, rope bridges",
      category: "environments",
      why: "The studio's WorldGen example: an environment named as a scene, not an object, so the planner lays out composition instead of a single mesh.",
    },
    {
      title: "Refinement pass",
      prompt: "split into parts, refine the hilt, add gold trim",
      category: "characters",
      why: "The editing-mode example: the same prompt box takes revision instructions for a model you already generated.",
    },
  ],
  examplesHeading: "More prompts to start from",
  examples: [
    {
      title: "Wandering knight",
      prompt:
        "a wandering knight, weathered armor, travel cloak, low-poly game asset",
      category: "characters",
      why: "Names the use as a game asset so the planner favors clean, game-ready proportions.",
    },
    {
      title: "Courier robot",
      prompt:
        "a courier robot with saddlebags, rounded shell, matte paint",
      category: "characters",
      why: "One clear silhouette plus one signature prop keeps the generated read legible from every angle.",
    },
    {
      title: "Hardcover stack",
      prompt:
        "a stack of hardcover books, cloth spines, gold foil titles",
      category: "props",
      why: "Stacks test the planner's sense of gravity — describe the pile, not each book.",
    },
    {
      title: "Film camera",
      prompt:
        "a vintage film camera, leather strap, brass trim",
      category: "props",
      why: "Material contrast (leather, brass) gives the texture stage something to bite into.",
    },
    {
      title: "Ceramic mug",
      prompt: "a ceramic coffee mug, matte glaze, game asset",
      category: "props",
      why: "The shortest complete prompt: object, material, use. Start here, then add detail one noun at a time.",
    },
    {
      title: "Desert ruins",
      prompt:
        "desert canyon ruins, wind-carved stone, late afternoon light",
      category: "environments",
      why: "Light and time of day steer the poster render, not the geometry — but they make the preview sing.",
    },
    {
      title: "Overgrown station",
      prompt:
        "an abandoned train station, ivy on the platform, morning fog",
      category: "environments",
      why: "Decay cues (ivy, fog, abandoned) push the planner toward broken symmetry instead of a clean kit.",
    },
    {
      title: "Alpine watchtower",
      prompt:
        "a stone watchtower on an alpine ridge, snow, storm light",
      category: "environments",
      why: "Architecture plus terrain in one prompt — the planner composes the tower against the ridge.",
    },
    {
      title: "Voxel dinosaur",
      prompt: "a voxel dinosaur, blocky silhouette, flat colors",
      category: "stylized",
      why: "Asks for the look by name. The voxel style page has the honest recipe notes for this direction.",
    },
    {
      title: "Low-poly racer",
      prompt: "a low-poly race car, flat shading, bright livery",
      category: "stylized",
      why: "Flat shading is a geometry-and-material direction the planner can honor from the prompt alone.",
    },
    {
      title: "Anime katana",
      prompt: "an anime-style katana, lacquered scabbard, gold guard",
      category: "stylized",
      why: "Style plus two materials: enough for a stylized read without a style-lock promise this clone can't make.",
    },
    {
      title: "Pixel-art potion",
      prompt: "a pixel-art potion bottle, chunky silhouette, limited palette",
      category: "stylized",
      why: "Limited-palette prompts keep the texture stage from fighting the silhouette.",
    },
  ],
  stepsHeading: "How to use a 3D prompt",
  steps: [
    {
      title: "Start from a working prompt",
      body: "Copy one of the cards above — each is written for the planner this studio actually runs. The featured three are the studio's own placeholder examples, so they are guaranteed to fit the prompt box's intent.",
    },
    {
      title: "Make the idea yours",
      body: "Swap the subject, the material, or the look — one change at a time so you can see what the planner did with it. If your draft is rough, the polish button next to the prompt box rewrites it with spelling and phrasing fixed, in your language, keeping every detail you named.",
    },
    {
      title: "Generate, then export",
      body: "Generate and study the free preview from every angle. When it is right, Confirm & Export debits 1 credit and hands you GLB, GLTF, FBX, OBJ, STL, or USDZ — the exact geometry the viewer previewed. Cancel a running task and the credit comes back.",
    },
  ],
  note: "What this page is not: the reference sorts its prompts by the AI model that wrote them, shows community authors and dates, and embeds YouTube videos of prompts becoming 3D. None of that exists here — there is no community gallery, no model-name filter, and no video embed. What is real instead: the prompt-polish endpoint behind the polish button, four generation modes (text-to-3D, image-to-3D, editing, WorldGen), and 21 style pages whose recipe notes tell you exactly how far each look can be pushed from the prompt alone.",
  noteLinks: [
    { label: "Browse the styles", href: "/styles" },
    { label: "Image to 3D", href: "/features/image-to-3d" },
    { label: "WorldGen", href: "/features/worldgen" },
  ],
  closing: {
    headline: "The next prompt is yours",
    body: "Steal a card above or write a fresh one — the preview is free, and the worst outcome is a refund away.",
    cta: { label: "Open the studio", href: STUDIO_PATH },
  },
};
