/**
 * Idempotent seeding: the demo account (demo@hyper3d.clone / demo1234) and
 * a featured gallery of 8 real, spec-backed tasks. Posters are rendered
 * from the actual specs on first seed (deterministic, stored as
 * Task.posterBytes — blob-in-DB, serverless-safe).
 *
 * Seed task ids are fixed strings so re-seeding after test cleanup is
 * stable and stored posters remain valid.
 */
import { db } from "./db";
import { hashPassword } from "./auth";
import { buildScene } from "./mesh-builder";
import { renderPoster } from "./render-preview";
import { parseSceneSpec, type SceneSpec } from "./spec";

export const DEMO_EMAIL = "demo@hyper3d.clone";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_USERNAME = "demo creator";

interface FeaturedSeed {
  id: string;
  prompt: string;
  type: "RodinAgentic" | "RodinStandard";
  spec: unknown;
  usage: { elapsed_seconds: number; used_tokens: number };
  /** Task 48 backend audit: landing-gallery metadata (the 8 static-art
   *  tiles the UI previously hardcoded — now real DB rows with like counts,
   *  titles, tags and search/sort/pagination support). */
  gallery?: {
    title: string;
    tags: string[];
    likes: number;
    image: string; // static gallery art (/images/gallery-*.png)
    hue: string; // avatar-dot accent
    genVersion: "gen-1.5" | "gen-2.5";
    effort: string;
  };
  /** Controls featured sort order ("featured" = oldest first). */
  created?: string;
}

const SEED_TASKS: FeaturedSeed[] = [
  /* ---- Task 48: the 8 landing-gallery tiles as real DB rows (page 1 of the
   *  featured gallery — createdAt 2026-10-15 so they sort before the poster
   *  seeds; static art overrides keep the parity-verified visuals). ---- */
  {
    id: "seed-g01-mech",
    prompt: "a rugged scout mech with matte panels, worn metal and lilac accents",
    type: "RodinAgentic",
    gallery: { title: "Scout Mech", tags: ["complex", "game-ready", "character"], likes: 48, image: "/images/gallery-mech.png", hue: "#b98acf", genVersion: "gen-2.5", effort: "high" },
    created: "2026-10-15T09:00:00.000Z",
    spec: {
      name: "Scout Mech",
      palette: ["#455a64", "#607d8b", "#b98acf", "#90a4ae"],
      objects: [
        { type: "box", params: { width: 1.3, height: 1.5, depth: 0.9 }, transform: { position: [0, 1.35, 0] }, material: { color: "#455a64", metalness: 0.6, roughness: 0.4 } },
        { type: "box", params: { width: 0.55, height: 0.4, depth: 0.55 }, transform: { position: [0, 2.25, 0.12] }, material: { color: "#607d8b", metalness: 0.55, roughness: 0.35 } },
        { type: "box", params: { width: 0.5, height: 0.22, depth: 0.3 }, transform: { position: [0, 2.25, 0.5] }, material: { color: "#b98acf", metalness: 0.3, roughness: 0.35 } },
        { type: "cylinder", params: { radiusTop: 0.28, radiusBottom: 0.34, height: 1.0, radialSegments: 14 }, transform: { position: [0.45, 0.5, 0] }, material: { color: "#90a4ae", metalness: 0.5, roughness: 0.4 } },
        { type: "cylinder", params: { radiusTop: 0.28, radiusBottom: 0.34, height: 1.0, radialSegments: 14 }, transform: { position: [-0.45, 0.5, 0] }, material: { color: "#90a4ae", metalness: 0.5, roughness: 0.4 } },
      ],
    },
    usage: { elapsed_seconds: 512.2, used_tokens: 1584320 },
  },
  {
    id: "seed-g02-helmet",
    prompt: "a ornate legion helmet with gold trim and battle scratches",
    type: "RodinAgentic",
    gallery: { title: "Legion Helmet", tags: ["hard-surface", "game-ready", "prop"], likes: 35, image: "/images/gallery-helmet.png", hue: "#d2b6df", genVersion: "gen-2.5", effort: "high" },
    created: "2026-10-15T09:10:00.000Z",
    spec: {
      name: "Legion Helmet",
      palette: ["#546e7a", "#78909c", "#ecc16c", "#cfd8dc"],
      objects: [
        { type: "sphere", params: { radius: 0.85, widthSegments: 28, heightSegments: 18 }, transform: { position: [0, 1.15, 0], scale: [1, 0.92, 1.05] }, material: { color: "#546e7a", metalness: 0.55, roughness: 0.35 } },
        { type: "torus", params: { radius: 0.86, tube: 0.09, radialSegments: 12, tubularSegments: 40 }, transform: { position: [0, 1.05, 0], rotation: [Math.PI / 2 + 0.25, 0, 0] }, material: { color: "#ecc16c", metalness: 0.75, roughness: 0.25 } },
        { type: "box", params: { width: 0.16, height: 0.75, depth: 0.1 }, transform: { position: [0, 0.95, 0.82], rotation: [0.3, 0, 0] }, material: { color: "#ecc16c", metalness: 0.7, roughness: 0.3 } },
        { type: "cylinder", params: { radiusTop: 0.1, radiusBottom: 0.14, height: 0.6, radialSegments: 10 }, transform: { position: [0, 1.85, -0.15], rotation: [-0.35, 0, 0] }, material: { color: "#78909c", metalness: 0.5, roughness: 0.4 } },
      ],
    },
    usage: { elapsed_seconds: 380.7, used_tokens: 1210432 },
  },
  {
    id: "seed-g03-drone",
    prompt: "a cargo drone with red accents and worn metal",
    type: "RodinStandard",
    gallery: { title: "Cargo Drone", tags: ["hard-surface", "prop"], likes: 27, image: "/images/gallery-drone.png", hue: "#ca6650", genVersion: "gen-1.5", effort: "default" },
    created: "2026-10-15T09:20:00.000Z",
    spec: {
      name: "Cargo Drone",
      palette: ["#546e7a", "#90a4ae", "#e65a4e", "#cfd8dc"],
      objects: [
        { type: "box", params: { width: 1.7, height: 0.4, depth: 2.1 }, transform: { position: [0, 1.1, 0] }, material: { color: "#546e7a", metalness: 0.5, roughness: 0.45 } },
        { type: "box", params: { width: 1.1, height: 0.55, depth: 1.2 }, transform: { position: [0, 1.55, 0] }, material: { color: "#e65a4e", metalness: 0.4, roughness: 0.4 } },
        { type: "cylinder", params: { radiusTop: 0.09, radiusBottom: 0.09, height: 1.3, radialSegments: 10 }, transform: { position: [1.05, 1.1, 0.8], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#90a4ae", metalness: 0.55 } },
        { type: "cylinder", params: { radiusTop: 0.09, radiusBottom: 0.09, height: 1.3, radialSegments: 10 }, transform: { position: [-1.05, 1.1, 0.8], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#90a4ae", metalness: 0.55 } },
        { type: "cylinder", params: { radiusTop: 0.09, radiusBottom: 0.09, height: 1.3, radialSegments: 10 }, transform: { position: [1.05, 1.1, -0.8], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#90a4ae", metalness: 0.55 } },
        { type: "cylinder", params: { radiusTop: 0.09, radiusBottom: 0.09, height: 1.3, radialSegments: 10 }, transform: { position: [-1.05, 1.1, -0.8], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#90a4ae", metalness: 0.55 } },
      ],
    },
    usage: { elapsed_seconds: 88.4, used_tokens: 261120 },
  },
  {
    id: "seed-g04-creature",
    prompt: "a reef creature with coral growths and bioluminescent spots",
    type: "RodinAgentic",
    gallery: { title: "Reef Creature", tags: ["organic", "character", "textured"], likes: 41, image: "/images/gallery-creature.png", hue: "#e6765d", genVersion: "gen-2.5", effort: "medium" },
    created: "2026-10-15T09:30:00.000Z",
    spec: {
      name: "Reef Creature",
      palette: ["#e6765d", "#f0a68c", "#7ec8a9", "#d2b6df"],
      objects: [
        { type: "sphere", params: { radius: 0.95, widthSegments: 26, heightSegments: 18 }, transform: { position: [0, 0.95, 0], scale: [1.15, 0.85, 1] }, material: { color: "#e6765d", roughness: 0.5, metalness: 0.05 } },
        { type: "sphere", params: { radius: 0.32, widthSegments: 18, heightSegments: 14 }, transform: { position: [0.75, 1.5, 0.2] }, material: { color: "#f0a68c", roughness: 0.45 } },
        { type: "cone", params: { radius: 0.22, height: 0.85, radialSegments: 7 }, transform: { position: [-0.7, 1.7, -0.1], rotation: [0.1, 0.5, -0.15] }, material: { color: "#7ec8a9", roughness: 0.35 } },
        { type: "cone", params: { radius: 0.16, height: 0.6, radialSegments: 6 }, transform: { position: [0.45, 1.75, -0.35], rotation: [-0.12, 0.8, 0.1] }, material: { color: "#d2b6df", roughness: 0.3 } },
        { type: "sphere", params: { radius: 0.18, widthSegments: 14, heightSegments: 10 }, transform: { position: [-0.3, 0.55, 0.75] }, material: { color: "#7ec8a9", roughness: 0.25 } },
      ],
    },
    usage: { elapsed_seconds: 445.9, used_tokens: 1403392 },
  },
  {
    id: "seed-g05-sword",
    prompt: "a rune blade with glowing engravings and gold hilt",
    type: "RodinStandard",
    gallery: { title: "Rune Blade", tags: ["hard-surface", "prop", "game-ready"], likes: 22, image: "/images/gallery-sword.png", hue: "#ecc16c", genVersion: "gen-1.5", effort: "default" },
    created: "2026-10-15T09:40:00.000Z",
    spec: {
      name: "Rune Blade",
      palette: ["#cfd8dc", "#90a4ae", "#ecc16c", "#b98acf"],
      objects: [
        { type: "box", params: { width: 0.16, height: 2.6, depth: 0.05 }, transform: { position: [0, 1.85, 0], rotation: [0, 0, 0.06] }, material: { color: "#cfd8dc", metalness: 0.85, roughness: 0.2 } },
        { type: "cone", params: { radius: 0.13, height: 0.35, radialSegments: 4 }, transform: { position: [0.02, 3.24, 0], rotation: [0, Math.PI / 4, 0.06] }, material: { color: "#cfd8dc", metalness: 0.85, roughness: 0.2 } },
        { type: "box", params: { width: 0.65, height: 0.09, depth: 0.12 }, transform: { position: [0, 0.55, 0], rotation: [0, 0, 0.06] }, material: { color: "#ecc16c", metalness: 0.8, roughness: 0.25 } },
        { type: "cylinder", params: { radiusTop: 0.055, radiusBottom: 0.055, height: 0.55, radialSegments: 12 }, transform: { position: [0, 0.28, 0] }, material: { color: "#90a4ae", metalness: 0.7, roughness: 0.3 } },
        { type: "sphere", params: { radius: 0.11, widthSegments: 16, heightSegments: 12 }, transform: { position: [0, 0.02, 0] }, material: { color: "#b98acf", roughness: 0.2, metalness: 0.3 } },
      ],
    },
    usage: { elapsed_seconds: 74.6, used_tokens: 218048 },
  },
  {
    id: "seed-g06-potions",
    prompt: "a wooden potion shelf with glass bottles and corked vials",
    type: "RodinAgentic",
    gallery: { title: "Potion Shelf", tags: ["stylized", "prop", "set-dressing"], likes: 31, image: "/images/gallery-potions.png", hue: "#9e76ac", genVersion: "gen-2.5", effort: "medium" },
    created: "2026-10-15T09:50:00.000Z",
    spec: {
      name: "Potion Shelf",
      palette: ["#8d6e63", "#6d4c41", "#9e76ac", "#7ec8a9"],
      objects: [
        { type: "box", params: { width: 2.2, height: 0.12, depth: 0.7 }, transform: { position: [0, 1.0, 0] }, material: { color: "#8d6e63", roughness: 0.7 } },
        { type: "box", params: { width: 2.2, height: 0.12, depth: 0.7 }, transform: { position: [0, 1.9, 0] }, material: { color: "#8d6e63", roughness: 0.7 } },
        { type: "box", params: { width: 0.14, height: 2.3, depth: 0.7 }, transform: { position: [1.1, 1.15, 0] }, material: { color: "#6d4c41", roughness: 0.75 } },
        { type: "cylinder", params: { radiusTop: 0.14, radiusBottom: 0.17, height: 0.5, radialSegments: 14 }, transform: { position: [-0.55, 1.32, 0] }, material: { color: "#9e76ac", roughness: 0.15, opacity: 0.85 } },
        { type: "cylinder", params: { radiusTop: 0.12, radiusBottom: 0.15, height: 0.42, radialSegments: 14 }, transform: { position: [0.5, 2.17, 0] }, material: { color: "#7ec8a9", roughness: 0.15, opacity: 0.85 } },
      ],
    },
    usage: { elapsed_seconds: 398.1, used_tokens: 1247232 },
  },
  {
    id: "seed-g07-bike",
    prompt: "a trail bike with knobby tires and orange frame",
    type: "RodinStandard",
    gallery: { title: "Trail Bike", tags: ["vehicle", "hard-surface"], likes: 19, image: "/images/gallery-bike.png", hue: "#d67830", genVersion: "gen-1.5", effort: "default" },
    created: "2026-10-15T10:00:00.000Z",
    spec: {
      name: "Trail Bike",
      palette: ["#d67830", "#455a64", "#263238", "#cfd8dc"],
      objects: [
        { type: "torus", params: { radius: 0.62, tube: 0.2, radialSegments: 12, tubularSegments: 28 }, transform: { position: [0, 0.62, 0.95], rotation: [0, Math.PI / 2, 0] }, material: { color: "#263238", roughness: 0.9 } },
        { type: "torus", params: { radius: 0.62, tube: 0.2, radialSegments: 12, tubularSegments: 28 }, transform: { position: [0, 0.62, -0.95], rotation: [0, Math.PI / 2, 0] }, material: { color: "#263238", roughness: 0.9 } },
        { type: "box", params: { width: 0.12, height: 0.1, depth: 1.9 }, transform: { position: [0, 0.95, 0], rotation: [0.12, 0, 0] }, material: { color: "#d67830", metalness: 0.4, roughness: 0.4 } },
        { type: "box", params: { width: 0.5, height: 0.14, depth: 0.9 }, transform: { position: [0, 1.32, -0.35], rotation: [0.45, 0, 0] }, material: { color: "#455a64", metalness: 0.5, roughness: 0.4 } },
        { type: "cylinder", params: { radiusTop: 0.07, radiusBottom: 0.07, height: 0.7, radialSegments: 10 }, transform: { position: [0, 1.42, 0.55], rotation: [0.5, 0, 0] }, material: { color: "#cfd8dc", metalness: 0.6, roughness: 0.35 } },
      ],
    },
    usage: { elapsed_seconds: 96.2, used_tokens: 287744 },
  },
  {
    id: "seed-g08-chest",
    prompt: "a traveler chest with iron bands and carved wood",
    type: "RodinAgentic",
    gallery: { title: "Traveler Chest", tags: ["prop", "stylized", "game-ready"], likes: 26, image: "/images/gallery-chest.png", hue: "#c9b7cf", genVersion: "gen-2.5", effort: "low" },
    created: "2026-10-15T10:10:00.000Z",
    spec: {
      name: "Traveler Chest",
      palette: ["#8d6e63", "#5d4037", "#9e9e9e", "#ecc16c"],
      objects: [
        { type: "box", params: { width: 1.9, height: 1.0, depth: 1.1 }, transform: { position: [0, 0.5, 0] }, material: { color: "#8d6e63", roughness: 0.65 } },
        { type: "box", params: { width: 1.94, height: 0.34, depth: 1.14 }, transform: { position: [0, 1.2, 0], rotation: [0, 0, 0] }, material: { color: "#5d4037", roughness: 0.6 } },
        { type: "box", params: { width: 0.18, height: 1.36, depth: 1.14 }, transform: { position: [0.75, 0.68, 0] }, material: { color: "#9e9e9e", metalness: 0.6, roughness: 0.4 } },
        { type: "box", params: { width: 0.18, height: 1.36, depth: 1.14 }, transform: { position: [-0.75, 0.68, 0] }, material: { color: "#9e9e9e", metalness: 0.6, roughness: 0.4 } },
        { type: "box", params: { width: 0.3, height: 0.16, depth: 0.14 }, transform: { position: [0, 0.75, 0.58] }, material: { color: "#ecc16c", metalness: 0.75, roughness: 0.3 } },
      ],
    },
    usage: { elapsed_seconds: 302.5, used_tokens: 946176 },
  },
  /* ---- the original 8 poster-rendered seeds (page 2 of the featured
   *  gallery — real spec-backed scenes with poster renders). ---- */
  {
    id: "seed-0001-apple",
    prompt: "A red fresh apple. simple geometry.",
    type: "RodinAgentic",
    spec: {
      name: "Fresh Apple",
      palette: ["#c62828", "#8e2b26", "#6d4c41", "#43a047"],
      objects: [
        { type: "sphere", params: { radius: 1, widthSegments: 32, heightSegments: 24 }, transform: { position: [0, 1.02, 0], scale: [1, 0.94, 1] }, material: { color: "#c62828", roughness: 0.32, metalness: 0.02 } },
        { type: "cylinder", params: { radiusTop: 0.045, radiusBottom: 0.06, height: 0.55, radialSegments: 12 }, transform: { position: [0, 1.68, 0], rotation: [0.1, 0, 0.12] }, material: { color: "#6d4c41", roughness: 0.7 } },
        { type: "lathe", params: { points: [[0, 0], [0.3, 0.12], [0.22, 0.34], [0, 0.4]], segments: 16 }, transform: { position: [0.18, 1.9, 0.02], rotation: [0, 0.4, -0.6] }, material: { color: "#43a047", roughness: 0.45 } },
        { type: "torus", params: { radius: 1.42, tube: 0.045, radialSegments: 10, tubularSegments: 64 }, transform: { position: [0, 0.05, 0], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#8e2b26", metalness: 0.35, roughness: 0.4 } },
      ],
    },
    usage: { elapsed_seconds: 280.261, used_tokens: 807808 },
  },
  {
    id: "seed-0002-mug",
    prompt: "A ceramic coffee mug with a sturdy handle.",
    type: "RodinStandard",
    spec: {
      name: "Ceramic Mug",
      palette: ["#eeeeee", "#bdbdbd", "#ef6c00"],
      objects: [
        { type: "cylinder", params: { radiusTop: 0.72, radiusBottom: 0.58, height: 1.5, radialSegments: 32 }, transform: { position: [0, 0.75, 0] }, material: { color: "#eeeeee", roughness: 0.28, metalness: 0.04 } },
        { type: "cylinder", params: { radiusTop: 0.62, radiusBottom: 0.62, height: 0.1, radialSegments: 32 }, transform: { position: [0, 1.48, 0] }, material: { color: "#ef6c00", roughness: 0.35 } },
        { type: "torus", params: { radius: 0.42, tube: 0.11, radialSegments: 14, tubularSegments: 40 }, transform: { position: [0.82, 0.85, 0], rotation: [0, Math.PI / 2, 0] }, material: { color: "#eeeeee", roughness: 0.28 } },
        { type: "cylinder", params: { radiusTop: 0.58, radiusBottom: 0.72, height: 0.08, radialSegments: 32 }, transform: { position: [0, 0.04, 0] }, material: { color: "#bdbdbd", roughness: 0.4 } },
      ],
    },
    usage: { elapsed_seconds: 96.4, used_tokens: 284112 },
  },
  {
    id: "seed-0003-drone",
    prompt: "A rugged quad-rotor recon drone, matte panels, worn metal.",
    type: "RodinAgentic",
    spec: {
      name: "Recon Drone",
      palette: ["#455a64", "#78909c", "#cfd8dc", "#ffb300"],
      objects: [
        { type: "box", params: { width: 1.5, height: 0.42, depth: 1.9 }, transform: { position: [0, 1.0, 0] }, material: { color: "#455a64", metalness: 0.55, roughness: 0.45 } },
        { type: "box", params: { width: 0.5, height: 0.28, depth: 0.6 }, transform: { position: [0, 1.32, 0.55] }, material: { color: "#78909c", metalness: 0.6, roughness: 0.35 } },
        { type: "cylinder", params: { radiusTop: 0.09, radiusBottom: 0.09, height: 0.3, radialSegments: 12 }, transform: { position: [0, 1.32, -0.6] }, material: { color: "#cfd8dc", metalness: 0.7, roughness: 0.3 } },
        { type: "cylinder", params: { radiusTop: 0.07, radiusBottom: 0.07, height: 1.1, radialSegments: 10 }, transform: { position: [0.95, 1.05, 0.75], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#78909c", metalness: 0.5 } },
        { type: "cylinder", params: { radiusTop: 0.07, radiusBottom: 0.07, height: 1.1, radialSegments: 10 }, transform: { position: [-0.95, 1.05, 0.75], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#78909c", metalness: 0.5 } },
        { type: "cylinder", params: { radiusTop: 0.07, radiusBottom: 0.07, height: 1.1, radialSegments: 10 }, transform: { position: [0.95, 1.05, -0.75], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#78909c", metalness: 0.5 } },
        { type: "cylinder", params: { radiusTop: 0.07, radiusBottom: 0.07, height: 1.1, radialSegments: 10 }, transform: { position: [-0.95, 1.05, -0.75], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#78909c", metalness: 0.5 } },
        { type: "torus", params: { radius: 0.5, tube: 0.035, radialSegments: 10, tubularSegments: 36 }, transform: { position: [0.95, 1.05, 1.3], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#ffb300", metalness: 0.3, roughness: 0.5 } },
        { type: "torus", params: { radius: 0.5, tube: 0.035, radialSegments: 10, tubularSegments: 36 }, transform: { position: [-0.95, 1.05, 1.3], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#ffb300", metalness: 0.3, roughness: 0.5 } },
        { type: "torus", params: { radius: 0.5, tube: 0.035, radialSegments: 10, tubularSegments: 36 }, transform: { position: [0.95, 1.05, -1.3], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#ffb300", metalness: 0.3, roughness: 0.5 } },
        { type: "torus", params: { radius: 0.5, tube: 0.035, radialSegments: 10, tubularSegments: 36 }, transform: { position: [-0.95, 1.05, -1.3], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#ffb300", metalness: 0.3, roughness: 0.5 } },
      ],
    },
    usage: { elapsed_seconds: 412.9, used_tokens: 1240882 },
  },
  {
    id: "seed-0004-helmet",
    prompt: "A sci-fi pilot helmet with a tinted visor and neck guard.",
    type: "RodinAgentic",
    spec: {
      name: "Pilot Helmet",
      palette: ["#37474f", "#546e7a", "#80deea", "#263238"],
      objects: [
        { type: "sphere", params: { radius: 0.95, widthSegments: 32, heightSegments: 24 }, transform: { position: [0, 1.15, 0], scale: [1, 0.92, 1.05] }, material: { color: "#37474f", metalness: 0.4, roughness: 0.35 } },
        { type: "sphere", params: { radius: 0.78, widthSegments: 32, heightSegments: 24 }, transform: { position: [0, 1.05, 0.32], scale: [0.95, 0.72, 0.8] }, material: { color: "#80deea", metalness: 0.75, roughness: 0.12, opacity: 0.92 } },
        { type: "cylinder", params: { radiusTop: 0.62, radiusBottom: 0.78, height: 0.5, radialSegments: 24 }, transform: { position: [0, 0.32, 0] }, material: { color: "#546e7a", metalness: 0.45, roughness: 0.4 } },
        { type: "box", params: { width: 0.36, height: 0.14, depth: 0.5 }, transform: { position: [0, 1.62, 0.18] }, material: { color: "#263238", metalness: 0.5, roughness: 0.3 } },
        { type: "torus", params: { radius: 0.98, tube: 0.05, radialSegments: 10, tubularSegments: 48 }, transform: { position: [0, 1.15, 0], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#263238", metalness: 0.6, roughness: 0.25 } },
      ],
    },
    usage: { elapsed_seconds: 355.7, used_tokens: 1024400 },
  },
  {
    id: "seed-0005-sword",
    prompt: "A runeblade longsword with an engraved crossguard.",
    type: "RodinStandard",
    spec: {
      name: "Runeblade",
      palette: ["#cfd8dc", "#b0bec5", "#5d4037", "#7b1fa2"],
      objects: [
        { type: "box", params: { width: 0.22, height: 3.1, depth: 0.06 }, transform: { position: [0, 2.35, 0] }, material: { color: "#cfd8dc", metalness: 0.85, roughness: 0.18 } },
        { type: "cone", params: { radius: 0.14, height: 0.5, radialSegments: 4 }, transform: { position: [0, 4.05, 0], rotation: [0, Math.PI / 4, 0] }, material: { color: "#b0bec5", metalness: 0.85, roughness: 0.2 } },
        { type: "box", params: { width: 1.1, height: 0.14, depth: 0.22 }, transform: { position: [0, 0.78, 0] }, material: { color: "#5d4037", metalness: 0.3, roughness: 0.5 } },
        { type: "sphere", params: { radius: 0.12, widthSegments: 16, heightSegments: 12 }, transform: { position: [0.62, 0.78, 0] }, material: { color: "#7b1fa2", metalness: 0.2, roughness: 0.3, opacity: 0.9 } },
        { type: "sphere", params: { radius: 0.12, widthSegments: 16, heightSegments: 12 }, transform: { position: [-0.62, 0.78, 0] }, material: { color: "#7b1fa2", metalness: 0.2, roughness: 0.3, opacity: 0.9 } },
        { type: "cylinder", params: { radiusTop: 0.085, radiusBottom: 0.1, height: 1.35, radialSegments: 12 }, transform: { position: [0, 0.1, 0] }, material: { color: "#5d4037", roughness: 0.65 } },
        { type: "sphere", params: { radius: 0.16, widthSegments: 16, heightSegments: 12 }, transform: { position: [0, -0.62, 0] }, material: { color: "#7b1fa2", metalness: 0.35, roughness: 0.25 } },
      ],
    },
    usage: { elapsed_seconds: 88.2, used_tokens: 240512 },
  },
  {
    id: "seed-0006-chest",
    prompt: "A wooden loot chest with iron bands, lid slightly open.",
    type: "RodinStandard",
    spec: {
      name: "Loot Chest",
      palette: ["#8d6e63", "#5d4037", "#78909c", "#ffb300"],
      objects: [
        { type: "box", params: { width: 1.9, height: 0.85, depth: 1.2 }, transform: { position: [0, 0.42, 0] }, material: { color: "#8d6e63", roughness: 0.7 } },
        { type: "box", params: { width: 1.9, height: 0.55, depth: 1.2 }, transform: { position: [0, 1.12, -0.28], rotation: [-0.5, 0, 0] }, material: { color: "#5d4037", roughness: 0.65 } },
        { type: "box", params: { width: 0.16, height: 0.9, depth: 1.24 }, transform: { position: [0.6, 0.45, 0] }, material: { color: "#78909c", metalness: 0.7, roughness: 0.35 } },
        { type: "box", params: { width: 0.16, height: 0.9, depth: 1.24 }, transform: { position: [-0.6, 0.45, 0] }, material: { color: "#78909c", metalness: 0.7, roughness: 0.35 } },
        { type: "box", params: { width: 1.94, height: 0.14, depth: 0.18 }, transform: { position: [0, 0.5, 0.58] }, material: { color: "#78909c", metalness: 0.7, roughness: 0.35 } },
        { type: "box", params: { width: 0.3, height: 0.34, depth: 0.1 }, transform: { position: [0, 0.62, 0.62] }, material: { color: "#ffb300", metalness: 0.5, roughness: 0.3 } },
      ],
    },
    usage: { elapsed_seconds: 74.9, used_tokens: 198400 },
  },
  {
    id: "seed-0007-mech",
    prompt: "A heavy industrial mech with piston legs and shoulder pods.",
    type: "RodinAgentic",
    spec: {
      name: "Heavy Mech",
      palette: ["#455a64", "#607d8b", "#90a4ae", "#ff7043"],
      objects: [
        { type: "box", params: { width: 1.5, height: 1.6, depth: 0.95 }, transform: { position: [0, 2.2, 0] }, material: { color: "#455a64", metalness: 0.6, roughness: 0.4 } },
        { type: "box", params: { width: 0.6, height: 0.45, depth: 0.55 }, transform: { position: [0, 3.18, 0.18] }, material: { color: "#607d8b", metalness: 0.55, roughness: 0.35 } },
        { type: "sphere", params: { radius: 0.42, widthSegments: 20, heightSegments: 14 }, transform: { position: [0.95, 2.75, 0] }, material: { color: "#90a4ae", metalness: 0.65, roughness: 0.3 } },
        { type: "sphere", params: { radius: 0.42, widthSegments: 20, heightSegments: 14 }, transform: { position: [-0.95, 2.75, 0] }, material: { color: "#90a4ae", metalness: 0.65, roughness: 0.3 } },
        { type: "cylinder", params: { radiusTop: 0.16, radiusBottom: 0.16, height: 1.5, radialSegments: 12 }, transform: { position: [0.95, 2.75, 0.55], rotation: [Math.PI / 2 - 0.15, 0, 0] }, material: { color: "#607d8b", metalness: 0.7, roughness: 0.25 } },
        { type: "cylinder", params: { radiusTop: 0.16, radiusBottom: 0.16, height: 1.5, radialSegments: 12 }, transform: { position: [-0.95, 2.75, 0.55], rotation: [Math.PI / 2 - 0.15, 0, 0] }, material: { color: "#607d8b", metalness: 0.7, roughness: 0.25 } },
        { type: "cylinder", params: { radiusTop: 0.3, radiusBottom: 0.34, height: 1.0, radialSegments: 16 }, transform: { position: [0.45, 1.1, 0] }, material: { color: "#90a4ae", metalness: 0.5, roughness: 0.4 } },
        { type: "cylinder", params: { radiusTop: 0.3, radiusBottom: 0.34, height: 1.0, radialSegments: 16 }, transform: { position: [-0.45, 1.1, 0] }, material: { color: "#90a4ae", metalness: 0.5, roughness: 0.4 } },
        { type: "box", params: { width: 0.62, height: 0.4, depth: 0.8 }, transform: { position: [0.45, 0.2, 0.12] }, material: { color: "#455a64", metalness: 0.55, roughness: 0.45 } },
        { type: "box", params: { width: 0.62, height: 0.4, depth: 0.8 }, transform: { position: [-0.45, 0.2, 0.12] }, material: { color: "#455a64", metalness: 0.55, roughness: 0.45 } },
        { type: "box", params: { width: 0.5, height: 0.22, depth: 0.3 }, transform: { position: [0, 2.2, 0.55] }, material: { color: "#ff7043", metalness: 0.3, roughness: 0.35 } },
      ],
    },
    usage: { elapsed_seconds: 522.4, used_tokens: 1600240 },
  },
  {
    id: "seed-0008-crystal",
    prompt: "A cluster of glowing crystals on a stone base.",
    type: "RodinStandard",
    spec: {
      name: "Crystal Cluster",
      palette: ["#7b1fa2", "#9c27b0", "#ce93d8", "#37474f"],
      objects: [
        { type: "cone", params: { radius: 0.4, height: 2.4, radialSegments: 6 }, transform: { position: [0, 1.9, 0], rotation: [0.06, 0.4, 0.05] }, material: { color: "#9c27b0", roughness: 0.15, metalness: 0.1, opacity: 0.88 } },
        { type: "cone", params: { radius: 0.26, height: 1.6, radialSegments: 6 }, transform: { position: [0.62, 1.35, 0.2], rotation: [0.18, 0.8, -0.22] }, material: { color: "#7b1fa2", roughness: 0.15, opacity: 0.9 } },
        { type: "cone", params: { radius: 0.22, height: 1.1, radialSegments: 6 }, transform: { position: [-0.6, 1.1, -0.1], rotation: [-0.15, 0.3, 0.28] }, material: { color: "#ce93d8", roughness: 0.18, opacity: 0.92 } },
        { type: "cone", params: { radius: 0.15, height: 0.7, radialSegments: 6 }, transform: { position: [-0.3, 0.85, 0.5], rotation: [0.1, 1.2, -0.1] }, material: { color: "#7b1fa2", roughness: 0.2, opacity: 0.9 } },
        { type: "cylinder", params: { radiusTop: 1.05, radiusBottom: 1.25, height: 0.6, radialSegments: 9 }, transform: { position: [0, 0.3, 0] }, material: { color: "#37474f", roughness: 0.75, metalness: 0.15 } },
      ],
    },
    usage: { elapsed_seconds: 65.3, used_tokens: 172032 },
  },
];

export interface SeedOptions {
  /** Render poster PNGs (skipped in tests). */
  posters?: boolean;
}

/** Ensure the demo user + featured gallery exist. Idempotent + cheap. */
export async function ensureSeeded(options: SeedOptions = {}): Promise<void> {
  const posters = options.posters ?? true;

  let demo = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    demo = await db.user.create({
      data: {
        email: DEMO_EMAIL,
        username: DEMO_USERNAME,
        passwordHash: hashPassword(DEMO_PASSWORD),
        balance: 50,
        preferences: { rodin_generation_mode: "standard" },
        referralCode: "T9AAG055",
      },
    });
  }

  const featuredCount = await db.task.count({ where: { isFeatured: true } });
  if (featuredCount < SEED_TASKS.length) {
    for (const seed of SEED_TASKS) {
      const existing = await db.task.findUnique({ where: { id: seed.id } });
      if (existing) continue;
      const spec = parseSceneSpec(seed.spec) as SceneSpec;
      const created = new Date(seed.created ?? "2026-10-16T12:00:00.000Z");
      await db.task.create({
        data: {
          id: seed.id,
          userId: demo.id,
          type: seed.type,
          prompt: seed.prompt,
          step: "ModelGenerate",
          userState: "DonePreview",
          spec: spec as unknown as object,
          previewImageUrl: `/api/task/${seed.id}/preview`,
          modelUrl: `/api/task/${seed.id}/export?format=glb`,
          videoUrl: null,
          usage: seed.usage,
          settings: {
            height: 8,
            version: "v3",
            type: "model_generate",
            effort: seed.gallery?.effort ?? "medium",
            ...(seed.gallery ? { gen_version: seed.gallery.genVersion } : {}),
            ...(seed.gallery ? { gallery_hue: seed.gallery.hue } : {}),
          },
          creditsSpent: seed.type === "RodinAgentic" ? 10 : 0,
          isFeatured: true,
          generationUuid: `${seed.id}-gen-v3`,
          generateTime: created,
          createdAt: created,
          // Task 48 gallery metadata (landing tiles as real rows)
          ...(seed.gallery
            ? {
                title: seed.gallery.title,
                tags: seed.gallery.tags as unknown as object,
                likeCount: seed.gallery.likes,
                galleryImage: seed.gallery.image,
              }
            : {}),
        },
      });
    }
  }

  if (posters) {
    // Blob-in-DB (serverless-safe): render each featured poster once and
    // store it on the task row — no filesystem involved (a lambda's disk is
    // read-only/ephemeral, which is exactly what broke the first deploy).
    const rows = await db.task.findMany({
      where: { id: { in: SEED_TASKS.map((s) => s.id) } },
      select: { id: true, posterBytes: true },
    });
    const withPoster = new Set(
      rows.filter((r) => r.posterBytes && r.posterBytes.length > 0).map((r) => r.id),
    );
    for (const seed of SEED_TASKS) {
      if (withPoster.has(seed.id)) continue;
      const spec = parseSceneSpec(seed.spec) as SceneSpec;
      const png = renderPoster(buildScene(spec));
      await db.task.update({
        where: { id: seed.id },
        data: { posterBytes: new Uint8Array(png) },
      });
    }
  }
}
