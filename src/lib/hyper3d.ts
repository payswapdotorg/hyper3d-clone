/**
 * Hyper3D clone — shared types, constants and copy.
 * All strings/tiers/numbers sourced from /home/z/h3d-capture/PRODUCT_FACTS.md.
 */

export type GenMode =
  | "image-to-3d"
  | "text-to-3d"
  | "remix-gen"
  | "turbo-gen"
  | "editing-3d";

export const GEN_MODES: { id: GenMode; label: string; hint: string }[] = [
  { id: "image-to-3d", label: "Image to 3D", hint: "One image is enough for most objects" },
  { id: "text-to-3d", label: "Text to 3D", hint: "From text prompt to 3D object — instantly" },
  { id: "remix-gen", label: "Remix Gen", hint: "Blend references into a new asset" },
  { id: "turbo-gen", label: "Turbo Gen", hint: "Draft results in seconds" },
  { id: "editing-3d", label: "3D Editing", hint: "Parts / Refine / Modify on .obj .fbx .glb" },
];

export type ControlNetId = "bbox" | "voxel" | "pointcloud";

export const CONTROLNETS: { id: ControlNetId; label: string; blurb: string }[] = [
  { id: "bbox", label: "Bounding Box", blurb: "Block out the silhouette first" },
  { id: "voxel", label: "Voxel", blurb: "Coarse volumetric structure" },
  { id: "pointcloud", label: "PointCloud", blurb: "Sparse points to full surface" },
];

export type EffortId = "extreme-low" | "low" | "medium" | "high" | "extreme-high";

export const EFFORTS: { id: EffortId; label: string; seconds: number; demoMs: number }[] = [
  { id: "extreme-low", label: "Extreme-Low", seconds: 4, demoMs: 4000 },
  { id: "low", label: "Low", seconds: 9, demoMs: 7000 },
  { id: "medium", label: "Medium", seconds: 20, demoMs: 10000 },
  { id: "high", label: "High", seconds: 40, demoMs: 14000 },
  { id: "extreme-high", label: "Extreme-High", seconds: 80, demoMs: 20000 },
];

export const EXPORT_FORMATS = ["GLB", "GLTF", "FBX", "OBJ", "STL", "USDZ"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const FORMAT_USES: Record<(typeof EXPORT_FORMATS)[number], string> = {
  GLB: "Web & AR",
  GLTF: "Web & AR",
  FBX: "Engines",
  OBJ: "Editing",
  STL: "Printing",
  USDZ: "Apple AR",
};

export const GEN_VERSION = "Gen-2.5";

export const PIPELINE_STAGES = [
  "Understanding prompt",
  "Generating geometry",
  "Retopology",
  "PBR texturing",
] as const;

/* ------------------------------ nav data ------------------------------ */

export const NAV_PRODUCTS = [
  { label: "Rodin", desc: "The flagship 3D generator — text, image, ControlNets.", icon: "box" },
  { label: "ChatAvatar", desc: "Text or image to 3D avatars with commercial licensing.", icon: "smile" },
] as const;

export const NAV_FEATURES_MAIN = [
  { label: "Image To 3D", desc: "One image is enough for Rodin to generate most objects.", icon: "image" },
  { label: "Text To 3D", desc: "From text prompt to 3D object — instantly.", icon: "type" },
  { label: "WorldGen", desc: "Turn images into editable 3D worlds.", icon: "globe" },
  { label: "API", desc: "Plug our creative AI into your app or workflow.", icon: "code" },
  { label: "MCP", desc: "Connect AI agents to Hyper3D 3D generation tools.", icon: "plug" },
] as const;

export const NAV_AI_MEDIA = [
  { label: "AI Video Generator", icon: "film" },
  { label: "AI Image Generator", icon: "palette" },
] as const;

export const NAV_OMNICRAFT = [
  { label: "AI Image Remix", icon: "shuffle" },
  { label: "AI Image Enhancer", icon: "wand" },
  { label: "AI Texture Generator", icon: "grid" },
  { label: "AI HDRI Generator", icon: "sun" },
  { label: "3D Model Search Engine", icon: "search" },
  { label: "SVG to 3D Converter", icon: "pen" },
  { label: "3D Mesh Editor", icon: "edit" },
] as const;

export const NAV_USE_CASES = [
  "3D Printing",
  "Animation",
  "Game Development",
  "Automotive Design",
  "NFT Creation",
  "E-Commerce",
  "VR / AR",
  "Character Design",
  "Metaverse",
  "Jewelry Design",
  "Mechanical Engineering",
] as const;

export const NAV_STYLES = [
  "Abstract",
  "Anime",
  "Cartoon",
  "Cel-Shaded",
  "Fantasy",
  "Flat",
  "Gothic",
  "Hand-Painted",
  "Industrial",
  "Isometric",
  "Low-Poly",
  "Medieval",
  "Minimalist",
  "Modern",
  "Organic",
  "Photorealistic",
  "Pixel Art",
  "Realistic",
  "Retro",
  "Stylized",
  "Voxel",
] as const;

export const LOCALES = [
  "English",
  "中文",
  "Deutsch",
  "日本語",
  "한국어",
  "Русский",
  "Português",
  "Français",
  "Español",
  "العربية",
  "Türkçe",
  "Italiano",
] as const;

export const DCC_TOOLS = [
  "Blender",
  "Unity",
  "Unreal",
  "Godot",
  "Maya",
  "3ds Max",
  "Omniverse",
  "C4D",
  "ComfyUI",
] as const;

export const TRUST_LOGOS = [
  "NVIDIA",
  "Google DeepMind",
  "Tencent",
  "NetEase",
  "Supercell",
  "Meta",
  "Shutterstock",
  "Replicate",
  "fal.ai",
  "UC Berkeley",
  "MIT",
] as const;

/* ------------------------------ gallery ------------------------------ */

export const GALLERY_MODELS = [
  { src: "/images/gallery-helmet.png", title: "Sci-Fi Helmet", polys: "28,540 tris", tag: "Image to 3D" },
  { src: "/images/gallery-sword.png", title: "Runeblade Sword", polys: "19,204 tris", tag: "Text to 3D" },
  { src: "/images/gallery-drone.png", title: "Recon Drone", polys: "34,120 tris", tag: "Turbo Gen" },
  { src: "/images/gallery-mech.png", title: "Heavy Mech", polys: "48,960 tris", tag: "ControlNet" },
  { src: "/images/gallery-chest.png", title: "Loot Chest", polys: "12,880 tris", tag: "Image to 3D" },
  { src: "/images/gallery-bike.png", title: "Cyber Bike", polys: "52,300 tris", tag: "Text to 3D" },
  { src: "/images/gallery-potions.png", title: "Potion Shelf", polys: "8,640 tris", tag: "Smart Low-Poly" },
  { src: "/images/gallery-creature.png", title: "Void Creature", polys: "41,020 tris", tag: "Remix Gen" },
] as const;

export const GALLERY_FALLBACK_IMAGES = GALLERY_MODELS.map((m) => m.src);

/* ------------------------------ pricing ------------------------------ */

export type BillingCycle = "monthly" | "yearly";

export interface PricingPlan {
  id: string;
  name: string;
  monthly: number | null;
  yearly: number | null;
  tagline: string;
  popular?: boolean;
  cta: string;
  creditsLabel: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "Start creating and pay only when you confirm results.",
    cta: "Start for Free",
    creditsLabel: "Pay-per-result · $1.5/credit",
    features: [
      "Generate free before confirmation",
      "Basic text & image to 3D",
      "Export from legacy models",
      "10 private assets",
      "Public gallery publishing",
      "Pay-by-result workflow",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    monthly: 30,
    yearly: 24,
    tagline: "For creators shipping assets every week.",
    popular: true,
    cta: "Get Creator",
    creditsLabel: "30 credits/mo · ≈60 models/mo",
    features: [
      "Multi-image to 3D",
      "Smart Low-Poly",
      "HD Texture + Custom Texture",
      "Baked normals from high-poly",
      "Redos — Geometry ×20 / Material ×6",
      "HDRI Generator free 8K",
      "Unlimited private assets",
      "Free Creator-tier image & video models",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthly: 120,
    yearly: 96,
    tagline: "For teams and production pipelines.",
    cta: "Get Business",
    creditsLabel: "208 credits/mo · ≈416 models/mo",
    features: [
      "Everything in Creator",
      "Full API access — 120/240 RPM",
      "High-Poly Quads",
      "Redos — Geometry ×50 / Material ×15",
      "Nano Banana 2 · Veo 3.1 · Seedance X30",
      "ChatAvatar commercial license",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: null,
    yearly: null,
    tagline: "For production teams that need security, deployment, and custom support.",
    cta: "Talk to Sales",
    creditsLabel: "Custom usage & deployment",
    features: [
      "Custom usage, deployment, and support terms",
      "Custom annual agreements available",
      "Dedicated support & onboarding",
    ],
  },
];

export interface CompareRow {
  label: string;
  values: [string, string, string, string];
}

export const COMPARE_ROWS: CompareRow[] = [
  { label: "Price", values: ["$0", "$30/mo · $24/mo yearly", "$120/mo · $96/mo yearly", "Let's Talk"] },
  { label: "Credits", values: ["Pay-per-result · $1.5/credit", "30/mo · 360/yr", "208/mo", "Custom"] },
  { label: "Est. models / month", values: ["Pay as you go", "≈60", "≈416", "Custom"] },
  { label: "Per-credit price", values: ["$1.5", "$1 monthly · $0.8 yearly", "$0.58 monthly · $0.46 yearly", "Custom"] },
  { label: "Generate free before confirm", values: ["✓", "✓", "✓", "✓"] },
  { label: "Multi-image to 3D", values: ["—", "✓", "✓", "✓"] },
  { label: "Smart Low-Poly", values: ["—", "✓", "✓", "✓"] },
  { label: "HD + Custom Texture", values: ["—", "✓", "✓", "✓"] },
  { label: "Redos (Geometry / Material)", values: ["—", "×20 / ×6", "×50 / ×15", "Custom"] },
  { label: "API access", values: ["—", "—", "120 RPM · 240 RPM higher tiers", "Custom"] },
  { label: "High-Poly Quads", values: ["—", "—", "✓", "✓"] },
  { label: "Media models", values: ["—", "Seedream + defaults", "Nano Banana 2 · Veo 3.1 · Seedance X30", "Custom"] },
  { label: "ChatAvatar commercial license", values: ["—", "—", "✓", "✓"] },
  { label: "Private assets", values: ["10", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Team management", values: ["—", "—", "✓", "✓"] },
];

export const PRICING_FAQS = [
  {
    q: "What is a credit?",
    a: "One credit confirms one generated model. Generation and preview are free — you only spend a credit when you keep a result. On Free, direct credits cost $1.5 each.",
  },
  {
    q: "How does pay-per-result work on the Free plan?",
    a: "You can generate and preview at no cost. When you are happy with a result, confirm it to export — that is the only moment you pay. Unwanted results cost nothing.",
  },
  {
    q: "What happens when I run out of monthly credits?",
    a: "Creator and Business plans can add credit packs on top of the monthly allowance (30–240 credits/mo for Creator, 208–2,080 for Business), or simply wait for the next cycle.",
  },
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes. Yearly billing saves 20% on both the plan price and any credit packs — Creator drops to $24/mo ($288/yr) and Business to $96/mo ($1,152/yr).",
  },
  {
    q: "Is there an education discount?",
    a: "Yes. Verified students, educators, classrooms, and learning programs get education pricing — use the “Verify education” card to apply.",
  },
  {
    q: "Can I use generated models commercially?",
    a: "Creator and above include unlimited export and any-use licensing, so assets can ship in commercial games, products, and client work. The public gallery is optional.",
  },
];

/* ------------------------------ FAQ ------------------------------ */

export const FAQS = [
  {
    q: "How useful is an AI 3D model generator?",
    a: "Very. Rodin compresses hours of box-modeling and retopology into minutes. It is strongest for props, hard-surface concepts, and iterating silhouettes; final hero assets may still need a light cleanup pass in your DCC.",
  },
  {
    q: "What kinds of images work best for Image to 3D?",
    a: "Clear, well-lit views of a single object on a plain background work best. There is no prescribed pose or camera angle, and additional views are optional — they simply add visual detail when you want extra control.",
  },
  {
    q: "Do I need to upload multiple images?",
    a: "No — one image is enough for Rodin to generate most objects. Multi-image to 3D is available on Creator and above for when you want more visual detail.",
  },
  {
    q: "Which export formats are supported?",
    a: "GLB and GLTF for web and AR, FBX for engines like Unity and Unreal, OBJ for editing, STL for 3D printing, and USDZ for Apple AR.",
  },
  {
    q: "Can I use the models commercially?",
    a: "Yes. On Creator and above, generated assets are yours to use in commercial projects with unlimited export, and Business adds a ChatAvatar commercial license.",
  },
  {
    q: "How do I get the best quality results?",
    a: "Write concrete prompts — subject, style, materials. Use a ControlNet (Bounding Box, Voxel, or PointCloud) to lock the silhouette, and pick a higher thinking effort for hero assets. Redos let you retry geometry or materials separately.",
  },
  {
    q: "Is Hyper3D useful for artists as well as developers?",
    a: "Both. Artists get a fast sketch-to-3D loop with per-part refinement; developers get an API at 120/240 RPM, an MCP server, and plug-ins for Blender, Unity, Unreal, Godot, Maya, 3ds Max, C4D, Omniverse, and ComfyUI.",
  },
  {
    q: "What can I do with my models after generation?",
    a: "Preview textures and materials, refine geometry with 3D Editing, export to your DCC or engine, publish to the public gallery, or keep everything private in your workspace.",
  },
];

/* ------------------------------ studio ------------------------------ */

export interface HistoryEntry {
  id: string;
  prompt: string;
  mode: GenMode;
  effort: EffortId;
  archetype: string;
  seed: number;
  createdAt: number;
  renderUrl?: string;
  fallback?: boolean;
}

export const STUDIO_HISTORY_KEY = "hyper3d-history";
export const CREDITS_KEY = "hyper3d-credits";
export const INITIAL_CREDITS = 30;

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export const ARCHETYPES = ["torus-knot", "ico-cluster", "crystal", "gear-stack"] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export function archetypeForPrompt(prompt: string): Archetype {
  return ARCHETYPES[hashString(prompt.toLowerCase().trim()) % ARCHETYPES.length];
}

export function nameForPrompt(prompt: string): string {
  const words = prompt
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 3);
  if (words.length === 0) return "Untitled Model";
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
