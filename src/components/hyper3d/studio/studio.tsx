"use client";

/**
 * Rodin Studio — wired to the REAL backend.
 *
 * Image to 3D (Quality tier): upload → VLM caption (editable prompt +
 * palette) → optional F/B/L/R extra views + seed → GENERATE (engine:
 * neural, pay-by-result — preview free, confirm to export costs 1 credit) →
 * client-direct neural run (tencent/Hunyuan3D-2.1 free Space, CORS-open;
 * progress + elapsed + cancel; stall/error → automatic Fast-engine
 * fallback with an honest toast) → client-side texture painting (COLOR_0)
 * → mesh POST (≤2MB decimated) → poster + task-card polling → GLB viewer →
 * confirm gate → REAL exports (GLB/GLTF/OBJ/STL/USDZ + Turntable WebM).
 *
 * Fast tier / Text to 3D: the proven server pipeline (caption/LLM → lathe
 * mesh), 1 credit at creation (first task free). 3D Editing / WorldGen:
 * honest "coming soon" states — no fake generation.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Boxes,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Coins,
  Compass,
  Dices,
  Download,
  Eye,
  Gem,
  Globe,
  Heart,
  Image as ImageIcon,
  Instagram,
  Layers,
  Linkedin,
  Loader2,
  Lock,
  LockOpen,
  MessageCircle,
  Menu,
  Palette,
  Pause,
  PencilRuler,
  Plus,
  RotateCw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Triangle,
  Twitch,
  Twitter,
  Trash2,
  Type,
  Upload,
  UserRound,
  Users,
  Video,
  Wand2,
  X,
  Youtube,
  Zap,
  Box,
  Grip,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "../smart-image";
import { AssetDetail, type AssetDetailData } from "./asset-detail";
import { EffortModal } from "./effort-modal";
import { McpConnectModal } from "./mcp-connect-modal";
import { ControlnetModal } from "./controlnet-modal";
import { deriveConstraints, type ControlnetMode, type ControlnetState } from "@/lib/controlnet";
import { ModelSelectionPopover } from "./model-selection-popover";
import { PricingOverlay } from "./pricing-overlay";
import {
  CookiePreferencesOverlay,
  ALL_PREFS,
  type CookiePrefs,
} from "./cookie-preferences-overlay";
import { StoryFeed } from "./story-feed";
import { OrientationPopup } from "./orientation-popup";
import { PresetsModal, presetHint, type PresetGeometry } from "./presets-modal";
import { TaskRail, type RailTask } from "./task-rail";
import type { UserInfo } from "@/lib/use-session";
import type { CaptionResult } from "@/lib/caption";
import {
  BATCH_MAX,
  CREATION_MODES,
  EFFORTS,
  EXPORT_FORMATS,
  FORMAT_USES,
  GEN_VERSION,
  GEN_VERSIONS,
  GENERATING_MODES,
  GEN_MODES,
  LEGACY_MODES,
  MATERIALS,
  PROMPT_PRESETS,
  REDO_QUOTAS,
  nameForPrompt,
  redoLabel,
  type CreationModeId,
  type EffortId,
  type GenMode,
  type GenVersionId,
  type LegacyModeId,
  type MaterialId,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";
import type { TextureMode } from "./model-viewer";
import {
  NEURAL_ATTRIBUTION,
  NEURAL_MAX_STORED_BYTES,
  NeuralEngineError,
  generateNeuralMesh,
  type ViewDirection,
} from "@/lib/neural-client";
import { paintVertexColors, type PaintSource } from "@/lib/texture-paint";
import {
  DIRECTION_LABELS,
  DIRECTION_SHORT,
  ENGINE_SLOT_OF,
  IMAGE_LABELS,
  VIEW_DIRECTIONS,
  type ViewDirection as PickerDirection,
} from "@/lib/direction-picker";
import { exportModel } from "@/lib/exporters";
import { OMNICRAFT_TOOLS } from "@/lib/omnicraft";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";
import * as THREE from "three";

const ModelViewer = dynamic(() => import("./model-viewer").then((m) => m.ModelViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-h3d-purple" aria-label="Loading 3D viewer" />
    </div>
  ),
});
type ModelViewerHandle = import("./model-viewer").ModelViewerHandle;

const MODE_ICONS: Record<GenMode, React.ComponentType<{ className?: string }>> = {
  "image-to-3d": ImageIcon,
  "text-to-3d": Type,
  "editing-3d": PencilRuler,
  worldgen: Globe,
};

const PROMPT_PLACEHOLDERS: Record<GenMode, string> = {
  "image-to-3d": "Describe the object in your image — the caption fills this in automatically…",
  "text-to-3d": "a rugged sci-fi cargo drone, matte panels, worn metal, red accents…",
  "editing-3d": "split into parts, refine the hilt, add gold trim…",
  worldgen: "a floating island village, waterfalls, rope bridges…",
};

/** One thumbnail card in the reference upload strip. */
type StripImageEntry = {
  id: string;
  dataUrl: string;
  name: string;
  file: File;
  direction: PickerDirection;
};

const TEXTURE_MODES: { id: TextureMode; label: string }[] = [
  { id: "shaded", label: "Shaded" },
  { id: "wireframe", label: "Wireframe" },
  { id: "normal", label: "Normal" },
];

/** Live-viewer chunk budget: 50k chunks keeps the painted GLB comfortably
 * under the 2MB storage cap in practice; a simplify pass is the safety net. */
const NEURAL_LIVE_CHUNKS = 50_000;

/** Read a File into the RGBA PaintSource the texture painter samples. */
async function imageToPaintSource(file: File): Promise<PaintSource> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.drawImage(bmp, 0, 0);
  const data = ctx.getImageData(0, 0, bmp.width, bmp.height);
  bmp.close();
  return { width: data.width, height: data.height, rgba: data.data };
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Decimate every mesh in place until the scene stays under `maxFaces`.
 * ASYNC + vertex-space (three r186 meshopt): SimplifyModifier.modify() is
 * async and its count is the number of VERTICES TO REMOVE. Two live-found
 * bugs fixed here (2026-10-19, first REAL neural mesh): the old synchronous
 * assign put a Promise into m.geometry (GLTFExporter: "geometry.getAttribute
 * is not a function"), and the old math passed a FACE delta as the vertex
 * removal count — 205k faces = 103k verts, "remove 191k verts" collapsed
 * the mesh to 0 faces.
 */
async function simplifySceneTo(root: THREE.Object3D, maxFaces: number): Promise<void> {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  const facesOf = (g: THREE.BufferGeometry) =>
    Math.floor((g.index ? g.index.count : g.attributes.position?.count ?? 0) / 3);
  const vertsOf = (g: THREE.BufferGeometry) => g.getAttribute("position")?.count ?? 0;
  const total = meshes.reduce((n, m) => n + facesOf(m.geometry), 0);
  if (total <= maxFaces) return;
  // A closed triangle mesh carries ~2 faces per vertex, so scaling each
  // mesh's vertex count by maxFaces/totalFaces lands the scene near the
  // face budget (14k faces ≈ 7k verts ≈ ~350KB GLB — comfortably under the
  // 2MB stored cap).
  const ratio = Math.min(1, maxFaces / Math.max(1, total));
  const mod = new SimplifyModifier();
  for (const m of meshes) {
    const verts = vertsOf(m.geometry);
    if (verts < 8) continue;
    const keepVerts = Math.max(4, Math.floor(verts * ratio));
    try {
      m.geometry = (await mod.modify(m.geometry, Math.max(0, verts - keepVerts))) as THREE.BufferGeometry;
    } catch {
      /* keep the original geometry on simplify failure */
    }
  }
}

function parseGlbBytes(bytes: Uint8Array): Promise<THREE.Group> {
  const buf = bytes.slice().buffer;
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(
      buf,
      "",
      (gltf) => resolve(gltf.scene as THREE.Group),
      (err) => reject(err instanceof Error ? err : new Error(String(err))),
    );
  });
}

interface TaskCard {
  task_uuid: string;
  type: string;
  prompt: string;
  step: string;
  user_state: string;
  image_url: string | null;
  video_url: string | null;
  usage: { elapsed_seconds: number; used_tokens: number };
  settings: Record<string, unknown>;
  progress?: { message: string; percent: number } | null;
  error?: string | null;
  generate_time?: string | null;
}

/* ------------------------------------------------------------------ */
/* Reference-clone pieces (DOM-extracted from hyper3d.ai/workspace/rodin,
 * 2026-10-21 recon): the animated Rodin SVG wordmark and the Featured
 * gallery tiles. */
const RODIN_WORDMARK_PATH =
  "M22.1133 48.8711V63.9883H26.4492C29.3398 63.9883 31.3906 64.5547 32.6016 65.6875C33.8516 66.7812 34.4766 68.2266 34.4766 70.0234C34.4766 71.7812 33.8516 73.2266 32.6016 74.3594C31.3906 75.4531 29.3398 76 26.4492 76H8.22656C5.33594 76 3.26562 75.4531 2.01562 74.3594C0.804688 73.2266 0.199219 71.7617 0.199219 69.9648C0.199219 68.207 0.824219 66.7812 2.07422 65.6875C3.32422 64.5547 5.375 63.9883 8.22656 63.9883H10.1016V16.9961H8.22656C5.33594 16.9961 3.26562 16.4492 2.01562 15.3555C0.804688 14.2227 0.199219 12.7578 0.199219 10.9609C0.199219 9.16406 0.804688 7.71875 2.01562 6.625C3.26562 5.49219 5.33594 4.92578 8.22656 4.92578L35.4141 4.98438C43.8906 4.98438 50.4531 7.09375 55.1016 11.3125C59.7891 15.4922 62.1328 20.5898 62.1328 26.6055C62.1328 30.3555 61.0391 33.7734 58.8516 36.8594C56.6641 39.9062 53.3633 42.6211 48.9492 45.0039C51.4883 47.2305 54.2031 50.082 57.0938 53.5586C58.8906 55.7852 61.3125 59.2617 64.3594 63.9883C67.4062 63.9883 69.418 64.3008 70.3945 64.9258C72.1523 66.1367 73.0312 67.8359 73.0312 70.0234C73.0312 71.7812 72.4258 73.2266 71.2148 74.3594C70.0039 75.4531 67.9531 76 65.0625 76H58.207C48.4805 60.9609 40.4141 51.918 34.0078 48.8711H22.1133ZM22.1133 36.8594H31.4883C34.9648 36.8594 38.0703 36.332 40.8047 35.2773C44.4766 33.8711 46.9375 32.3867 48.1875 30.8242C49.4766 29.2617 50.1211 27.7188 50.1211 26.1953C50.1211 23.9297 48.9102 21.8398 46.4883 19.9258C44.0664 17.972 40.5312 16.9961 35.8828 16.9961H22.1133V36.8594ZM137.777 50.3945C137.777 55.0039 136.488 59.4766 133.91 63.8125C131.371 68.1094 127.562 71.5469 122.484 74.125C117.445 76.6641 112.172 77.9336 106.664 77.9336C101.195 77.9336 95.9609 76.6836 90.9609 74.1836C85.9609 71.6445 82.1523 68.207 79.5352 63.8711C76.918 59.5352 75.6094 55.0039 75.6094 50.2773C75.6094 45.4727 76.9375 40.7656 79.5938 36.1562C82.25 31.5078 86.0586 27.8555 91.0195 25.1992C96.0195 22.543 101.234 21.2148 106.664 21.2148C112.133 21.2148 117.387 22.582 122.426 25.3164C127.504 28.0117 131.332 31.6641 133.91 36.2734C136.488 40.8438 137.777 45.5508 137.777 50.3945ZM125.766 50.4531C125.766 46.5859 124.379 43.0312 121.605 39.7891C117.816 35.4141 112.836 33.2266 106.664 33.2266C101.234 33.2266 96.7031 34.9648 93.0703 38.4414C89.4375 41.918 87.6211 45.9414 87.6211 50.5117C87.6211 54.2617 89.457 57.7773 93.1289 61.0586C96.8008 64.3008 101.312 65.9219 106.664 65.9219C112.055 65.9219 116.586 64.3008 120.258 61.0586C123.93 57.7773 125.766 54.2422 125.766 50.4531ZM206.215 0.00390625V63.9883H208.266C211.117 63.9883 213.168 64.5547 214.418 65.6875C215.668 66.7812 216.293 68.2266 216.293 70.0234C216.293 71.7812 215.668 73.2266 214.418 74.3594C213.207 75.4531 211.156 76 208.266 76H194.203V73.0703C191.469 74.6719 188.598 75.8828 185.59 76.7031C182.621 77.5234 179.535 77.9336 176.332 77.9336C167.309 77.9336 160.043 75.3359 154.535 70.1406C149.027 64.9062 146.273 58.4023 146.273 50.6289C146.273 42.5039 149.164 35.5703 154.945 29.8281C160.727 24.0859 167.777 21.2148 176.098 21.2148C179.223 21.2148 182.289 21.7031 185.297 22.6797C188.305 23.6172 191.273 25.043 194.203 26.957V12.0156H192.152C189.262 12.0156 187.191 11.4688 185.941 10.375C184.73 9.24219 184.125 7.79688 184.125 6.03906C184.125 4.24219 184.73 2.79688 185.941 1.70312C187.191 0.570313 189.262 0.00390625 192.152 0.00390625H206.215ZM194.203 50.9805C194.203 46.0195 192.465 41.8203 188.988 38.3828C185.512 34.9453 181.254 33.2266 176.215 33.2266C171.215 33.2266 166.977 34.9453 163.5 38.3828C160.023 41.8203 158.285 45.9609 158.285 50.8047C158.285 55.2188 159.848 58.8516 162.973 61.7031C166.098 64.5156 170.512 65.9219 176.215 65.9219C181.879 65.9219 186.293 64.5156 189.457 61.7031C192.621 58.8516 194.203 55.2773 194.203 50.9805ZM255.023 0.00390625V12.7188H240.727V0.00390625H255.023ZM256.664 22.7969V63.9883H271.078C273.969 63.9883 276.02 64.5547 277.23 65.6875C278.48 66.7812 279.105 68.2266 279.105 70.0234C279.105 71.7812 278.48 73.2266 277.23 74.3594C276.02 75.4531 273.969 76 271.078 76H230.238C227.348 76 225.277 75.4531 224.027 74.3594C222.816 73.2266 222.211 71.7617 222.211 69.9648C222.211 68.207 222.816 66.7812 224.027 65.6875C225.277 64.5547 227.348 63.9883 230.238 63.9883H244.652V34.8086H234.984C232.133 34.8086 230.082 34.2617 228.832 33.168C227.582 32.0352 226.957 30.5703 226.957 28.7734C226.957 27.0156 227.562 25.5898 228.773 24.4961C230.023 23.3633 232.094 22.7969 234.984 22.7969H256.664ZM310.629 22.7969V26.8398C312.816 24.9648 315.219 23.5586 317.836 22.6211C320.492 21.6836 323.363 21.2148 326.449 21.2148C333.559 21.2148 339.184 23.4219 343.324 27.8359C346.605 31.3516 348.246 35.9609 348.246 41.6641V63.9883C350.785 63.9883 352.66 64.5547 353.871 65.6875C355.082 66.7812 355.688 68.2266 355.688 70.0234C355.688 71.7812 355.062 73.2266 353.812 74.3594C352.602 75.4531 350.551 76 347.66 76H336.82C333.93 76 331.859 75.4531 330.609 74.3594C329.398 73.2266 328.793 71.7617 328.793 69.9648C328.793 68.207 329.398 66.7812 330.609 65.6875C331.82 64.5547 333.695 63.9883 336.234 63.9883V41.3125C336.234 38.6953 335.531 36.7812 334.125 35.5703C332.289 34.0078 329.535 33.2266 325.863 33.2266C323.09 33.2266 320.648 33.7734 318.539 34.8672C316.469 35.9219 313.832 38.1875 310.629 41.6641V63.9883C313.715 63.9883 315.707 64.2812 316.605 64.8672C318.52 66.0391 319.477 67.7578 319.477 70.0234C319.477 71.7812 318.852 73.2266 317.602 74.3594C316.391 75.4531 314.34 76 311.449 76H297.797C294.906 76 292.836 75.4531 291.586 74.3594C290.375 73.2266 289.77 71.7617 289.77 69.9648C289.77 67.7773 290.707 66.0781 292.582 64.8672C293.52 64.2812 295.531 63.9883 298.617 63.9883V34.8086C296.078 34.8086 294.203 34.2422 292.992 33.1094C291.781 31.9766 291.176 30.5312 291.176 28.7734C291.176 27.0156 291.781 25.5898 292.992 24.4961C294.242 23.3633 296.312 22.7969 299.203 22.7969H310.629Z";

/** The reference's own Rodin wordmark: one SVG path, stroke-draws in then
 * fills white (see .rodin-title-animation in globals.css). Sizes match the
 * reference's responsive classes. */
function RodinWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 356 78"
      fill="none"
      aria-hidden="true"
      className={className}
      role="presentation"
    >
      <path className="rodin-title-animation" d={RODIN_WORDMARK_PATH} />
    </svg>
  );
}

/* Add On icon — the reference cross-fades the seven DCC-tool marks
 * (blender/unreal/unity/godot/c4d/maya/omniverse) every 2s with a 500ms
 * scale(1↔0.35)+fade ease-in-out transition. DOM-measured 2026-10-23
 * (Task 49): 2000ms per icon, 7-icon cycle; active img scale(1) opacity 1,
 * inactive scale(0.35) opacity 0. */
const ADD_ON_ICONS = [
  "blender-mark.svg",
  "unreal-mark.svg",
  "unity-mark.svg",
  "godot-mark.svg",
  "c4d-mark.svg",
  "maya-mark.svg",
  "omniverse-mark.svg",
] as const;

function AddOnIconCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % ADD_ON_ICONS.length), 2000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="relative block h-[22px] w-[24px] overflow-hidden">
      {ADD_ON_ICONS.map((src, i) => (
        <img
          key={src}
          src={`/images/${src}`}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[1px] m-0 block h-[20px] w-[24px] border-0"
          style={{
            imageRendering: "-webkit-optimize-contrast",
            opacity: i === idx ? 1 : 0,
            transform: `scale(${i === idx ? 1 : 0.35}) translateZ(0)`,
            transformOrigin: "center center",
            transition: "opacity 500ms ease-in-out, transform 500ms ease-in-out",
          }}
        />
      ))}
    </span>
  );
}

/* Hero tip pool — the reference rotates operational tips through the quote
 * slot (agent-walked recon: Feynman default, then the tip pool its DOM
 * carries). */
const HERO_TIPS: string[] = [
  "The best way to understand is to create. What I cannot create, I do not understand.",
  "Redos are free, but confirmation costs credits.",
  "Drink water to speed up generation!",
  "Best balance of quality and speed? Default Mode.",
  "RGBA image? Click to use alpha channel!",
  "Remix or enhance input images before generation.",
  "Tired of generating? Search assets by text or image!",
  "Use OmniCraft HDRI Generation for 8K panoramas and HDRI.",
  "We support 5 languages now!",
  "Business subscriptions have cheaper Credits per unit.",
  "Many OmniCraft features run locally — no uploads required.",
  "Upload your model → Get textures in OmniCraft.",
];

/* Featured gallery tiles (reference ASSET section) — Task 48: these are
 * now the seed of the DB-backed gallery (identical instant paint; replaced
 * by /api/task/list rows on mount). The uuid matches the seeded gallery
 * task so likes/sort/search work before and after the fetch lands. */
const TILE_UUIDS = [
  "seed-g01-mech",
  "seed-g02-helmet",
  "seed-g03-drone",
  "seed-g04-creature",
  "seed-g05-sword",
  "seed-g06-potions",
  "seed-g07-bike",
  "seed-g08-chest",
] as const;

const FEATURED_TILES: { src: string; title: string; author: string; likes: number; hue: string; model: string; effort: string; tags: string[]; prompt: string }[] = [
  { src: "/images/gallery-mech.png", title: "Scout Mech", author: "Rodin Gen-2.5", likes: 48, hue: "#b98acf", model: "Gen-2.5", effort: "High", tags: ["complex", "game-ready", "character"], prompt: "a rugged scout mech with matte panels, worn metal and lilac accents" },
  { src: "/images/gallery-helmet.png", title: "Legion Helmet", author: "Rodin Gen-2.5", likes: 35, hue: "#d2b6df", model: "Gen-2.5", effort: "High", tags: ["hard-surface", "game-ready", "prop"], prompt: "a ornate legion helmet with gold trim and battle scratches" },
  { src: "/images/gallery-drone.png", title: "Cargo Drone", author: "Rodin Gen-1.5", likes: 27, hue: "#ca6650", model: "Gen-1.5", effort: "Default", tags: ["hard-surface", "prop"], prompt: "a cargo drone with red accents and worn metal" },
  { src: "/images/gallery-creature.png", title: "Reef Creature", author: "Rodin Gen-2.5", likes: 41, hue: "#e6765d", model: "Gen-2.5", effort: "Medium", tags: ["organic", "character", "textured"], prompt: "a reef creature with coral growths and bioluminescent spots" },
  { src: "/images/gallery-sword.png", title: "Rune Blade", author: "Rodin Gen-1.5", likes: 22, hue: "#ecc16c", model: "Gen-1.5", effort: "Default", tags: ["hard-surface", "prop", "game-ready"], prompt: "a rune blade with glowing engravings and gold hilt" },
  { src: "/images/gallery-potions.png", title: "Potion Shelf", author: "Rodin Gen-2.5", likes: 31, hue: "#9e76ac", model: "Gen-2.5", effort: "Medium", tags: ["stylized", "prop", "set-dressing"], prompt: "a wooden potion shelf with glass bottles and corked vials" },
  { src: "/images/gallery-bike.png", title: "Trail Bike", author: "Rodin Gen-1.5", likes: 19, hue: "#d67830", model: "Gen-1.5", effort: "Default", tags: ["vehicle", "hard-surface"], prompt: "a trail bike with knobby tires and orange frame" },
  { src: "/images/gallery-chest.png", title: "Traveler Chest", author: "Rodin Gen-2.5", likes: 26, hue: "#c9b7cf", model: "Gen-2.5", effort: "Low", tags: ["prop", "stylized", "game-ready"], prompt: "a traveler chest with iron bands and carved wood" },
];

/** Task 48: the gallery item the UI renders (static tile or DB row). */
interface GalleryItem {
  uuid: string;
  src: string;
  title: string;
  author: string;
  likes: number;
  hue: string;
  model: string;
  effort: string;
  tags: string[];
  prompt: string;
  liked?: boolean;
}

const tileToGalleryItem = (tile: (typeof FEATURED_TILES)[number], i: number): GalleryItem => ({
  uuid: TILE_UUIDS[i],
  src: tile.src,
  title: tile.title,
  author: tile.author,
  likes: tile.likes,
  hue: tile.hue,
  model: tile.model,
  effort: tile.effort,
  tags: tile.tags,
  prompt: tile.prompt,
});

/** Compact-card row from /api/task/list → gallery item. */
const rowToGalleryItem = (row: Record<string, unknown>): GalleryItem => {
  const g = (row.gallery ?? {}) as Record<string, unknown>;
  const genVersion = typeof g.gen_version === "string" ? g.gen_version : "gen-2.5";
  return {
    uuid: String(row.task_uuid ?? ""),
    src: typeof g.image === "string" ? g.image : String(row.image_url ?? ""),
    title: typeof g.title === "string" ? g.title : String(row.prompt ?? "").slice(0, 40),
    author: genVersion === "gen-1.5" ? "Rodin Gen-1.5" : "Rodin Gen-2.5",
    likes: typeof g.likes === "number" ? g.likes : 0,
    hue: typeof g.hue === "string" ? g.hue : "#b98acf",
    model: genVersion === "gen-1.5" ? "Gen-1.5" : "Gen-2.5",
    effort: typeof g.effort === "string" ? g.effort : "medium",
    tags: Array.isArray(g.tags) ? (g.tags as unknown[]).map(String) : [],
    prompt: String(row.prompt ?? ""),
  };
};

/** Reference-parity footer link — honest chrome (the reference's external
 * destinations are not part of this clone). */
const stubToast = (label: string) => () =>
  toast.info(label, { description: "Reference-parity chrome — not part of this clone." });

/** Cookie notice persistence key (the reference shows its cookie card on
 * first visit; accepting stores the choice). */
const COOKIE_OK_KEY = "h3d-clone-cookie-ok";

export interface StudioInitial {
  prompt: string;
  mode: GenMode;
  effort: EffortId;
  nonce: number;
}

export function Studio({
  initial,
  user,
  onNeedAuth,
  onSessionRefresh,
  onSignOut,
}: {
  initial: StudioInitial;
  user: UserInfo | null;
  onNeedAuth: (intent: string) => void;
  onSessionRefresh: () => void;
  onSignOut: () => void;
}) {
  const [mode, setMode] = useState<GenMode>(initial.mode);
  const [agentic, setAgentic] = useState(false);
  const [effort, setEffort] = useState<EffortId>(initial.effort);
  const [effortModalOpen, setEffortModalOpen] = useState(false);
  const [agenticModalShown, setAgenticModalShown] = useState(false);

  /* ---- workspace parity options (reference surface, 2026-10-20) ---- */
  const [genVersion, setGenVersion] = useState<GenVersionId>("gen-2.5");
  const [legacyMode, setLegacyMode] = useState<LegacyModeId>("default");
  const [material, setMaterial] = useState<MaterialId>("pbr");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creationMode, setCreationMode] = useState<CreationModeId>("generate-objects");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [mcpConnectOpen, setMcpConnectOpen] = useState(false);
  /* ControlNet spatial constraint (reference affordance, 2026-10-28):
     derived aspect/fill/anchors ride with every generation while applied. */
  const [controlnet, setControlnet] = useState<ControlnetState | null>(null);
  const [controlnetOpen, setControlnetOpen] = useState(false);
  const [controlnetTab, setControlnetTab] = useState<ControlnetMode>("bbox");

  /* ---- interaction parity (UX-recon 2026-10-22, agent-walked on the live
   * reference): Subscribe → full membership overlay; gallery tile → asset
   * detail; EXPLORE → story feed; rotating hero tips; chat widget ---- */
  const [pricingOpen, setPricingOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<AssetDetailData | null>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  /* card sub-tab flavor for image mode (reference: Remix Gen / Turbo Gen
   * pills stacked at the card's bottom-right; Remix = remix-your-idea
   * caption, Turbo = Single image / Multi-view toggle) */
  const [imageTab, setImageTab] = useState<"remix" | "turbo">("remix");
  const [multiView, setMultiView] = useState(false);
  const [editingTab, setEditingTab] = useState<"parts" | "refine" | "modify">("parts");

  /* ---- Task 48 backend audit: the ASSET gallery is DB-backed — real
     search (?q=), sort (?sort=), pagination (Load More) and likes
     (POST /api/task/:uuid/like) through /api/task/list. FEATURED_TILES
     stays as the instant paint; the fetch replaces it with live rows. ---- */
  const [gallery, setGallery] = useState<GalleryItem[]>(FEATURED_TILES.map(tileToGalleryItem));
  const [galleryQ, setGalleryQ] = useState("");
  const [gallerySort, setGallerySort] = useState<"featured" | "latest" | "liked">("featured");
  const [galleryOffset, setGalleryOffset] = useState(0);
  const [galleryHasMore, setGalleryHasMore] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const refreshGallery = useCallback(
    async (opts?: { q?: string; sort?: "featured" | "latest" | "liked"; append?: boolean }) => {
      const q = opts?.q ?? galleryQ;
      const sort = opts?.sort ?? gallerySort;
      const offset = opts?.append ? galleryOffset + 8 : 0;
      setGalleryLoading(true);
      try {
        const params = new URLSearchParams({ filter: "featured", q, sort, limit: "8", offset: String(offset) });
        const res = await fetch(`/api/task/list?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { items: unknown[]; total: number; has_more: boolean };
        const page = data.items.map((r) => rowToGalleryItem(r as Record<string, unknown>));
        setGallery((prev) => (opts?.append ? [...prev, ...page] : page));
        setGalleryOffset(offset);
        setGalleryHasMore(data.has_more);
      } catch {
        /* non-fatal — the static paint stays */
      } finally {
        setGalleryLoading(false);
      }
    },
    [galleryQ, gallerySort, galleryOffset],
  );

  /* Initial gallery fetch (once) — q/sort/append refetches pass explicit
   * opts through refreshGallery; this mount effect only replaces the static
   * paint with the live DB rows. */
  useEffect(() => {
    void refreshGallery();
  }, []);

  /* Like toggle (Task 48): optimistic on the tile, confirmed by the API,
     reverted on failure; guests gate behind the sign-in panel. */
  const toggleLike = async (item: GalleryItem) => {
    if (!user) {
      onNeedAuth("Sign in to like assets.");
      return;
    }
    setGallery((prev) =>
      prev.map((g) => (g.uuid === item.uuid ? { ...g, liked: !g.liked, likes: g.likes + (g.liked ? -1 : 1) } : g)),
    );
    try {
      const res = await fetch(`/api/task/${item.uuid}/like`, { method: "POST" });
      if (!res.ok) throw new Error("like failed");
      const data = (await res.json()) as { liked: boolean; num_like: number };
      setGallery((prev) => prev.map((g) => (g.uuid === item.uuid ? { ...g, liked: data.liked, likes: data.num_like } : g)));
    } catch {
      setGallery((prev) => prev.map((g) => (g.uuid === item.uuid ? { ...g, liked: item.liked, likes: item.likes } : g)));
      toast.error("Could not update like", { description: "Please try again." });
    }
  };

  /* the reference rotates a tip pool in the hero quote slot (recon
   * innerText pool: Feynman default + operational tips) */
  useEffect(() => {
    const t = window.setInterval(() => setTipIndex((i) => (i + 1) % HERO_TIPS.length), 6000);
    return () => window.clearInterval(t);
  }, []);
  const [redoBusy, setRedoBusy] = useState<"geometry" | "material" | null>(null);

  const [prompt, setPrompt] = useState(initial.prompt);
  const [upload, setUpload] = useState<{ dataUrl: string; name: string; file: File } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [caption, setCaption] = useState<CaptionResult | null>(null);

  /* ---- reference upload-strip state (UX-recon 2026-10-22): images line up
     LEFT of the + entry card, each with a per-image direction popup and a
     hover remix button. The strip is the single upload source of truth;
     `upload`/`extraViews` stay derived from it. ---- */
  const [stripImages, setStripImages] = useState<StripImageEntry[]>([]);
  const [oriPopupFor, setOriPopupFor] = useState<string | null>(null);
  const [remixFor, setRemixFor] = useState<string | null>(null);
  const [remixText, setRemixText] = useState("");
  const [remixStyle, setRemixStyle] = useState<string | null>(null);
  /* reference option-picking state: shared Model Selection popover,
     GENERATE-row Presets modal, batch upsell tooltip, prompt polish */
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [refPresetsOpen, setRefPresetsOpen] = useState(false);
  const [presetGeometry, setPresetGeometry] = useState<PresetGeometry>("Detailed");
  const [captionOverride, setCaptionOverride] = useState(false);
  const [batchTip, setBatchTip] = useState(false);
  const [polishing, setPolishing] = useState(false);

  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [card, setCard] = useState<TaskCard | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [polys, setPolys] = useState(0);
  const [textureMode, setTextureMode] = useState<TextureMode>("shaded");
  const [autoRotate, setAutoRotate] = useState(true);

  const [mine, setMine] = useState<RailTask[]>([]);
  const [featured, setFeatured] = useState<RailTask[]>([]);
  const [rail, setRail] = useState<"featured" | "mine">(user ? "mine" : "featured");
  const [creating, setCreating] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragRef = useRef<HTMLLabelElement>(null);
  const viewerRef = useRef<ModelViewerHandle | null>(null);
  const [turntableRecording, setTurntableRecording] = useState(false);

  /* ---- engine2: tier / seed / views / neural progress / confirm ---- */
  const [tier, setTier] = useState<"quality" | "fast">("quality");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 65536));
  const [lockSeed, setLockSeed] = useState(false);
  const [extraViews, setExtraViews] = useState<
    { direction: import("@/lib/direction-picker").ViewDirection; dataUrl: string; file: File }[]
  >([]);
  const [neuralBusy, setNeuralBusy] = useState(false);
  const [neuralMessage, setNeuralMessage] = useState<string | null>(null);
  const [neuralElapsed, setNeuralElapsed] = useState(0);
  const neuralAbortRef = useRef<AbortController | null>(null);
  const [confirming, setConfirming] = useState(false);
  /** Latest stored neural mesh bytes (for client-side material redo). */
  const lastMeshBytesRef = useRef<Uint8Array | null>(null);

  /** Neural engine = Gen-2.5 Quality tier only. Gen-1.5 runs the standard
   * pipeline (honest product-line difference), and Agentic is Gen-2.5-only. */
  const neuralTier = genVersion === "gen-2.5" && mode === "image-to-3d" && !agentic && tier === "quality";
  const agenticAvailable = genVersion === "gen-2.5";
  const effectiveEffort: EffortId =
    genVersion === "gen-1.5" ? (LEGACY_MODES.find((m) => m.id === legacyMode)?.effort ?? "medium") : effort;
  const redoQuota = {
    geometry: user?.redo?.geometry ?? REDO_QUOTAS.geometry,
    material: user?.redo?.material ?? REDO_QUOTAS.material,
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ---------------- data loading ---------------- */

  const refreshMine = useCallback(async () => {
    if (!user) {
      setMine([]);
      return;
    }
    try {
      const res = await fetch("/api/task/list?filter=mine", { cache: "no-store" });
      if (!res.ok) return;
      setMine((await res.json()) as RailTask[]);
    } catch {
      /* non-fatal */
    }
  }, [user]);

  const refreshFeatured = useCallback(async () => {
    try {
      const res = await fetch("/api/task/list?filter=featured", { cache: "no-store" });
      if (!res.ok) return;
      setFeatured((await res.json()) as RailTask[]);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    void refreshMine();
    void refreshFeatured();
  }, [refreshMine, refreshFeatured]);

  /* ---------------- upload + caption ---------------- */

  /* strip mirror for async handlers (avoids stale closures) */
  const stripRef = useRef<StripImageEntry[]>([]);
  stripRef.current = stripImages;

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  /* Reference upload-strip flow (UX-recon 2026-10-22): the + entry accepts
     MULTIPLE files at once; each lands as its own 172px thumbnail card in
     the strip to the LEFT of the + entry (which always stays). The first
     image is the primary reference — the caption analysis runs on it and
     fills the prompt (unless Caption Override is on). No view switch: the
     landing cluster persists through analysis, exactly like the reference. */
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => /^image\/(png|jpeg|jpg|webp)$/.test(f.type));
      if (list.length === 0) {
        toast.error("Unsupported image", { description: "Use .png, .jpg or .webp reference images." });
        return;
      }
      const wasEmpty = stripRef.current.length === 0;
      const next = [...stripRef.current];
      for (const file of list.slice(0, 8 - stripRef.current.length)) {
        const dataUrl = await readFileAsDataUrl(file);
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          dataUrl,
          name: file.name,
          file,
          direction: "unknown",
        });
      }
      setStripImages(next);
      if (!wasEmpty) return; // extra views: no caption re-run
      const file = next[0]?.file;
      if (!file) return;
      setCaption(null);
      setAnalyzing(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/task/rodin_mesh_image_process", { method: "POST", body: form });
        if (!res.ok) throw new Error(`analysis failed (${res.status})`);
        const result = (await res.json()) as CaptionResult;
        setCaption(result);
        if (result.prompt && !captionOverride) setPrompt(result.prompt);
        toast.success("Reference analyzed", {
          description: result.prompt,
        });
      } catch (err) {
        toast.error("Image analysis failed", {
          description: err instanceof Error ? err.message : "The vision model did not respond.",
        });
      } finally {
        setAnalyzing(false);
      }
    },
    [captionOverride],
  );

  /* strip → derived upload/extraViews (the GENERATE pipeline keeps its
     existing shape: images[0] = primary, the rest = direction-tagged views) */
  useEffect(() => {
    const first = stripImages[0];
    setUpload(first ? { dataUrl: first.dataUrl, name: first.name, file: first.file } : null);
    setExtraViews(
      stripImages
        .slice(1)
        .filter((v) => v.direction !== "unknown")
        .map((v) => ({ direction: v.direction, dataUrl: v.dataUrl, file: v.file })),
    );
  }, [stripImages]);

  /* prompt polish — the reference prompt card's "correct" button (real LLM
     call through /api/task/prompt_polish) */
  const polishPrompt = useCallback(async () => {
    if (!prompt.trim() || polishing) return;
    setPolishing(true);
    try {
      const res = await fetch("/api/task/prompt_polish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`polish failed (${res.status})`);
      const body = (await res.json()) as { prompt: string; corrected: boolean };
      setPrompt(body.prompt);
      toast.success(body.corrected ? "Prompt corrected" : "Prompt already clean", {
        description: body.corrected ? body.prompt : "No spelling or grammar changes needed.",
      });
    } catch {
      toast.error("Could not correct the prompt", { description: "The language model did not respond." });
    } finally {
      setPolishing(false);
    }
  }, [prompt, polishing]);

  /* ---------------- generation ---------------- */

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (uuid: string) => {
      stopPolling();
      setActiveTask(uuid);
      setCard(null);
      setViewerUrl(null);
      setViewerReady(false);
      setRail(user ? "mine" : "featured");

      const tick = async () => {
        try {
          const res = await fetch(`/api/task/card/${uuid}`, { cache: "no-store" });
          if (!res.ok) return;
          const next = (await res.json()) as TaskCard;
          setCard(next);
          if (next.user_state === "DonePreview" || next.user_state === "done" || next.user_state === "failed") {
            stopPolling();
            if (next.user_state === "failed") {
              toast.error("Generation failed", { description: next.error ?? "The pipeline could not finish." });
            } else {
              const s = (next.settings ?? {}) as {
                pay_by_result?: boolean;
                confirmed?: boolean;
                engine_used?: string;
              };
              const gated = s.pay_by_result === true && s.confirmed !== true;
              if (!gated) {
                setViewerUrl(`/api/task/${uuid}/export?format=glb`);
              }
              // gated tasks keep the in-session blob mesh (neural runs) or
              // the poster preview (fallback runs) until confirmed.
              const engineNote =
                s.engine_used === "neural"
                  ? "neural engine"
                  : s.engine_used === "fast"
                    ? "fast engine"
                    : GEN_VERSION;
              toast.success("Model ready", {
                description: `${nameForPrompt(next.prompt)} · ${next.usage?.elapsed_seconds?.toFixed(1)}s · ${engineNote}`,
              });
            }
            void refreshMine();
            onSessionRefresh();
          }
        } catch {
          /* transient — keep polling */
        }
      };

      void tick();
      pollRef.current = setInterval(() => void tick(), 800);
    },
    [stopPolling, refreshMine, onSessionRefresh, user],
  );

  const postProgress = useCallback(
    async (uuid: string, message: string, percent?: number, stage?: string) => {
      try {
        await fetch(`/api/task/${uuid}/progress`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message, ...(percent !== undefined ? { percent } : {}), ...(stage ? { stage } : {}) }),
        });
      } catch {
        /* progress heartbeats are best-effort */
      }
    },
    [],
  );

  /** Client-direct neural pipeline (Quality tier): free Hunyuan3D-2.1 run,
   * in-browser texture painting, ≤2MB decimated storage POST. Falls back
   * to the server Fast engine on any stall/error — honestly, with a toast. */
  const runNeuralPipeline = useCallback(
    async (uuid: string, seedUsed: number) => {
      if (!upload) return;
      const ac = new AbortController();
      neuralAbortRef.current = ac;
      setNeuralBusy(true);
      setNeuralElapsed(0);
      setNeuralMessage("Contacting the neural engine…");
      const t0 = performance.now();
      const timer = setInterval(() => setNeuralElapsed((performance.now() - t0) / 1000), 500);
      const finish = () => {
        clearInterval(timer);
        setNeuralBusy(false);
        setNeuralMessage(null);
        neuralAbortRef.current = null;
      };
      try {
        await postProgress(uuid, "Contacting the neural engine…", 5, "upload");
        // Map the 11 reference direction labels onto the engine's four
        // mv_image slots (first-in-reading-order wins per slot; the rest stay
        // recorded on the task card as image_labels).
        const engineViews: { direction: ViewDirection; blob: File }[] = [];
        const takenSlots = new Set<ViewDirection>();
        for (const v of extraViews) {
          const slot = ENGINE_SLOT_OF[v.direction] as ViewDirection | null;
          if (!slot || takenSlots.has(slot)) continue;
          takenSlots.add(slot);
          engineViews.push({ direction: slot, blob: v.file });
        }
        const result = await generateNeuralMesh({
          image: upload.file,
          views: engineViews,
          seed: seedUsed,
          numChunks: NEURAL_LIVE_CHUNKS,
          signal: ac.signal,
          onProgress: (e) => {
            if (e.type === "stage") {
              setNeuralMessage(e.message);
              void postProgress(uuid, e.message, e.stage === "upload" ? 15 : e.stage === "stream" ? 40 : 60, e.stage);
            }
          },
        });

        setNeuralMessage(material === "none" ? "Skipping texture pass (material: none)…" : "Painting texture from your image…");
        await postProgress(uuid, material === "none" ? "Skipping texture pass…" : "Painting texture from your image…", 72, "paint");
        const root = await parseGlbBytes(result.meshBytes);
        if (material !== "none") {
          const source = await imageToPaintSource(upload.file);
          paintVertexColors(root, source, { palette: caption?.palette ?? [] });
        }

        setNeuralMessage("Saving your model…");
        await postProgress(uuid, "Saving your model…", 88, "save");
        let stored = (await exportModel(root, "glb")).bytes;
        if (stored.length > NEURAL_MAX_STORED_BYTES) {
          await simplifySceneTo(root, 14_000);
          stored = (await exportModel(root, "glb")).bytes;
        }
        lastMeshBytesRef.current = stored;
        const elapsedSeconds = (performance.now() - t0) / 1000;
        const mr = await fetch(`/api/task/${uuid}/mesh`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            mesh: uint8ToBase64(stored),
            engineUsed: "neural",
            ...(result.faceCount !== undefined ? { faceCount: result.faceCount } : {}),
            seed: seedUsed,
            elapsedSeconds,
            ...(caption?.palette?.[0] ? { color: caption.palette[0] } : {}),
          }),
        });
        if (!mr.ok) throw new Error(`mesh save failed (${mr.status})`);
        // Free 3D preview from the in-session painted mesh — exports stay
        // gated behind the confirm gate (pay-by-result).
        setViewerUrl(URL.createObjectURL(new Blob([stored.buffer as ArrayBuffer], { type: "model/gltf-binary" })));
        toast.success("Neural mesh ready", {
          description: `Hunyuan3D-2.1 · ${(elapsedSeconds).toFixed(1)}s${result.faceCount ? ` · ~${result.faceCount.toLocaleString("en-US")} faces` : ""} — preview is free, confirm to export.`,
        });
      } catch (err) {
        const aborted = ac.signal.aborted || (err instanceof DOMException && err.name === "AbortError");
        if (aborted) {
          void fetch(`/api/task/${uuid}/cancel`, { method: "POST" }).catch(() => undefined);
          stopPolling();
          setActiveTask(null);
          setCard(null);
          setViewerUrl(null);
          toast.info("Neural run canceled", { description: "No credits were used." });
          void refreshMine();
        } else {
          const reason = err instanceof NeuralEngineError ? err.message : err instanceof Error ? err.message : "unknown";
          void postProgress(uuid, `Neural engine unavailable (${reason.slice(0, 80)}) — switching to the Fast engine…`, 40, "fallback");
          try {
            const fr = await fetch(`/api/task/${uuid}/fallback`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ reason: reason.slice(0, 280) }),
            });
            if (!fr.ok) throw new Error(`fallback failed (${fr.status})`);
            toast.warning("Neural engine busy — using the Fast engine", {
              description: "The free neural engine is unavailable right now (quota/queue). Your model is being generated with the always-available Fast engine instead. Press Generate to retry the neural engine.",
              duration: 9000,
            });
          } catch {
            toast.error("Generation failed", { description: reason });
          }
        }
      } finally {
        finish();
      }
    },
    [upload, extraViews, caption, material, postProgress, stopPolling, refreshMine],
  );

  const cancelNeural = useCallback(() => {
    neuralAbortRef.current?.abort();
  }, []);

  const createTask = useCallback(
    async (effortForTask?: EffortId) => {
      if (!user) {
        onNeedAuth("Sign in to generate — your first preview is free.");
        return;
      }
      /* Presets modal wiring (reference GENERATE-row Presets): a non-default
         geometry preset appends its style hint to the prompt — honest,
         prompt-driven behavior recorded on the task card. */
      const base = prompt.trim();
      const hint = presetGeometry !== "Detailed" ? presetHint(presetGeometry) : null;
      const promptText = hint ? (base ? `${base}, ${hint}` : `A 3D object, ${hint}`) : base;
      if (!promptText && !upload) {
        toast.error("Add a prompt", { description: "Describe what Rodin should build, or upload a reference image." });
        return;
      }
      if (mode === "image-to-3d" && !upload) {
        toast.info("Add at least one image to start", {
          description: "Image to 3D works from a reference — drop a .png/.jpg/.webp above.",
        });
        return;
      }

      setCreating(true);
      const useNeural = neuralTier;
      const seedUsed = lockSeed ? seed : Math.floor(Math.random() * 65536);
      if (!lockSeed) setSeed(seedUsed);
      try {
        const res = await fetch("/api/task", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type: agentic && agenticAvailable ? "RodinAgentic" : "RodinStandard",
            prompt: promptText || "A 3D object from the uploaded reference.",
            effort: effortForTask ?? effectiveEffort,
            ...(upload ? { image: upload.dataUrl } : {}),
            ...(useNeural || tier === "fast"
              ? { engine: useNeural ? "neural" : "fast", seed: seedUsed }
              : {}),
            ...(useNeural && extraViews.length > 0
              ? {
                  mvImages: extraViews.map((v) => v.dataUrl),
                  imageLabels: extraViews.map((v) => IMAGE_LABELS[v.direction]),
                }
              : {}),
            // workspace parity options
            genVersion,
            ...(genVersion === "gen-1.5" ? { legacyMode } : {}),
            material,
            isPrivate,
            ...(mode === "worldgen" ? { creationMode } : {}),
            // ControlNet spatial constraint (derived aspect/fill/anchors)
            ...(controlnet ? { controlnet: deriveConstraints(controlnet) ?? undefined } : {}),
          }),
        });
        if (res.status === 401) {
          onNeedAuth("Sign in to generate — your first preview is free.");
          return;
        }
        if (res.status === 402) {
          const body = (await res.json()) as { balance?: number; required?: number };
          toast.error("Out of credits", {
            description: `This generation needs ${body.required ?? (agentic ? 10 : 1)} credits — your balance is ${body.balance ?? 0}.`,
          });
          onSessionRefresh();
          return;
        }
        if (!res.ok) throw new Error(`create failed (${res.status})`);
        const body = (await res.json()) as { uuid: string };
        startPolling(body.uuid);
        if (useNeural) {
          void runNeuralPipeline(body.uuid, seedUsed);
        } else {
          toast.success(agentic && agenticAvailable ? "Agentic task started" : "Task queued", {
            description: `${EFFORTS.find((e) => e.id === (effortForTask ?? effectiveEffort))?.label} effort · uuid ${body.uuid.slice(0, 8)}…`,
          });
        }
      } catch (err) {
        toast.error("Could not start generation", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setCreating(false);
      }
    },
    [user, prompt, upload, mode, agentic, agenticAvailable, neuralTier, tier, seed, lockSeed, extraViews, genVersion, legacyMode, material, isPrivate, creationMode, controlnet, effectiveEffort, startPolling, runNeuralPipeline, onNeedAuth, onSessionRefresh],
  );

  /** Pay-by-result confirm gate: charges exactly 1 credit, unlocks exports. */
  const handleConfirm = useCallback(async () => {
    if (!activeTask || confirming) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/task/${activeTask}/confirm`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        confirmed?: boolean;
        already_confirmed?: boolean;
        charged?: number;
        balance?: number;
        required?: number;
      };
      if (res.status === 402) {
        toast.error("Out of credits", {
          description: `Confirming needs ${body.required ?? 1} credit — your balance is ${body.balance ?? 0}. Generation and preview remain free.`,
        });
        onSessionRefresh();
        return;
      }
      if (!res.ok) throw new Error(`confirm failed (${res.status})`);
      toast.success("Confirmed — exports unlocked", {
        description: `${body.charged ?? 1} credit · ${body.balance ?? user?.balance ?? "—"} left · thank you!`,
      });
      onSessionRefresh();
      const cardRes = await fetch(`/api/task/card/${activeTask}`, { cache: "no-store" });
      if (cardRes.ok) setCard((await cardRes.json()) as TaskCard);
      setViewerUrl(`/api/task/${activeTask}/export?format=glb`);
      void refreshMine();
    } catch (err) {
      toast.error("Could not confirm", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setConfirming(false);
    }
  }, [activeTask, confirming, onSessionRefresh, refreshMine, user]);

  /** Reference task-card redos, quota-gated: geometry re-generates with a
   * fresh seed (a new free-preview task), material re-paints the stored
   * mesh from the reference image client-side and re-POSTs it. */
  const handleRedo = useCallback(
    async (kind: "geometry" | "material") => {
      if (!activeTask || redoBusy) return;
      setRedoBusy(kind);
      try {
        const res = await fetch(`/api/task/${activeTask}/redo`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          task_uuid?: string;
          seed?: number;
          engine?: string;
          client_pipeline?: boolean;
          left?: number;
          error?: string;
          detail?: string;
        };
        if (res.status === 402) {
          toast.error(kind === "geometry" ? "Geometry redos used up" : "Material redos used up", {
            description: "The redo quota for this plan is exhausted.",
          });
          return;
        }
        if (res.status === 409) {
          toast.info("Material redo needs a reference image", {
            description: body.detail ?? "Material redo re-paints from the reference image.",
          });
          return;
        }
        if (!res.ok || !body.ok) throw new Error(body.error ?? `redo failed (${res.status})`);

        if (kind === "geometry" && body.task_uuid) {
          toast.success("Redoing geometry", {
            description: `Fresh seed ${body.seed ?? "—"} · free preview · ${body.left} geometry redos left`,
          });
          startPolling(body.task_uuid);
          if (body.client_pipeline) {
            if (body.seed !== undefined) setSeed(body.seed);
            void runNeuralPipeline(body.task_uuid, body.seed ?? seed);
          }
        } else if (kind === "material") {
          // Client-side re-paint of the in-session mesh from the reference.
          const stored = lastMeshBytesRef.current;
          const ref = upload?.file ?? null;
          if (!stored || !ref) {
            toast.info("Material redo needs the live mesh", {
              description: "Generate with the neural engine in this session, then redo the material — the re-paint runs in your browser.",
            });
            return;
          }
          const root = await parseGlbBytes(stored);
          const source = await imageToPaintSource(ref);
          paintVertexColors(root, source, { palette: caption?.palette ?? [] });
          const bytes = (await exportModel(root, "glb")).bytes;
          lastMeshBytesRef.current = bytes;
          const mr = await fetch(`/api/task/${activeTask}/mesh`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              mesh: uint8ToBase64(bytes),
              engineUsed: "neural",
              seed,
              elapsedSeconds: 1,
            }),
          });
          if (!mr.ok) throw new Error(`mesh re-save failed (${mr.status})`);
          setViewerUrl(URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "model/gltf-binary" })));
          toast.success("Material redone", {
            description: `Re-painted from your reference image · ${body.left} material redos left`,
          });
          const cardRes = await fetch(`/api/task/card/${activeTask}`, { cache: "no-store" });
          if (cardRes.ok) setCard((await cardRes.json()) as TaskCard);
        }
        onSessionRefresh();
        void refreshMine();
      } catch (err) {
        toast.error("Redo failed", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setRedoBusy(null);
      }
    },
    [activeTask, redoBusy, startPolling, runNeuralPipeline, upload, caption, seed, onSessionRefresh, refreshMine],
  );

  const handleGenerate = useCallback(() => {
    if (creating) return;
    if (!GENERATING_MODES.includes(mode)) {
      toast.info("Coming soon in this clone", {
        description: `${GEN_MODES.find((m) => m.id === mode)?.label} is not implemented here yet — Image and Text to 3D are live.`,
      });
      return;
    }
    if (!user) {
      onNeedAuth("Sign in to generate — your first preview is free.");
      return;
    }
    if (agentic && !agenticModalShown) {
      setEffortModalOpen(true);
      return;
    }
    void createTask(effort);
  }, [creating, mode, user, agentic, agenticModalShown, effort, createTask, onNeedAuth]);

  /* ---------------- turntable export ---------------- */

  const recordTurntable = useCallback(async () => {
    if (!viewerRef.current || !activeTask || turntableRecording) return;
    setTurntableRecording(true);
    try {
      const blob = await viewerRef.current.recordTurntable();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTask}-turntable.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Turntable WebM downloaded", {
        description: `${card ? nameForPrompt(card.prompt) : "model"}-turntable.webm — one full orbit of your model, recorded from the live viewer.`,
      });
    } catch (err) {
      toast.error("Turntable recording failed", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setTurntableRecording(false);
    }
  }, [activeTask, turntableRecording, card]);

  /* ---------------- rail selection ---------------- */

  const openRailTask = useCallback((task: RailTask) => {
    stopPolling();
    setActiveTask(task.task_uuid);
    setViewerReady(false);
    void fetch(`/api/task/card/${task.task_uuid}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((c) => {
        if (!c) return;
        const next = c as TaskCard;
        setCard(next);
        const s = (next.settings ?? {}) as { pay_by_result?: boolean; confirmed?: boolean };
        if (s.pay_by_result === true && s.confirmed !== true) {
          // Pay-by-result tasks preview via the poster until confirmed.
          setViewerUrl(null);
        } else {
          setViewerUrl(`/api/task/${task.task_uuid}/export?format=glb`);
        }
      });
  }, [stopPolling]);

  /* ---------------- derived ---------------- */

  const generating = Boolean(activeTask && card && (card.user_state === "queued" || card.user_state === "processing"));
  const complete = Boolean(card && (card.user_state === "DonePreview" || card.user_state === "done"));
  const cardSettings = (card?.settings ?? {}) as {
    pay_by_result?: boolean;
    confirmed?: boolean;
    engine_used?: string;
    fallback_reason?: string;
    seed?: number;
  };
  const needsConfirm = Boolean(complete && cardSettings.pay_by_result === true && cardSettings.confirmed !== true);
  const effortIndex = EFFORTS.findIndex((e) => e.id === effort);
  const effortInfo = EFFORTS[effortIndex >= 0 ? effortIndex : 2];
  const generateLabel = !user
    ? "GENERATE"
    : mine.length === 0
      ? "GENERATE Free Preview"
      : agentic
        ? "GENERATE 10 Credits"
        : "GENERATE 1 Credit";

  const railTasks = rail === "mine" ? mine : featured;
  const modelName = card ? nameForPrompt(card.prompt) : "No model yet";

  /* Reference-style empty state: nothing generated yet, nothing in flight —
     render the controls as the reference /workspace/rodin landing (scrollable
     hero + 180px input card cluster + GENERATE capsule + ASSET gallery)
     instead of the three-pane dashboard. NOTE (UX-recon 2026-10-22): image
     analysis no longer flips the view — the reference keeps the landing
     cluster with the thumbnail strip while the caption runs in the
     background; only real generation work switches to the dashboard. */
  const emptyStudio = !viewerUrl && !card && !generating && !creating;

  /* floating tool panel on the empty landing (materials / presets / quality /
     directions) — the reference hides these behind icon rails + popovers */
  const [toolPanel, setToolPanel] = useState<null | "materials" | "presets" | "quality" | "directions">(null);

  /* cookie consent card (reference guest chrome) — shown until accepted;
     the banner's Preferences action opens the reference's granular
     "Manage cookie preferences" modal (t47 recon capture 20) instead of
     silently saving essential-only */
  const [cookieOk, setCookieOk] = useState(true);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  useEffect(() => {
    try {
      if (!window.localStorage.getItem(COOKIE_OK_KEY)) setCookieOk(false);
    } catch {
      /* private mode — skip the card */
    }
  }, []);
  const saveCookiePrefs = useCallback((prefs: CookiePrefs) => {
    try {
      window.localStorage.setItem(COOKIE_OK_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
    setCookiePrefsOpen(false);
    setCookieOk(true);
  }, []);

  /* chips + hover-swap labels for the reference GENERATE cluster */
  const qualityChipLabel =
    genVersion === "gen-1.5"
      ? (LEGACY_MODES.find((m) => m.id === legacyMode)?.label ?? "Default")
      : effortInfo.label;
  const generateHoverLabel = !user
    ? "Sign In"
    : mine.length === 0
      ? "Free Preview"
      : agentic
        ? "10 Credits"
        : "1 Credit";

  /* ---------------- render ---------------- */

  return (
    <div id="main-content" className="fixed inset-0 z-50 flex flex-col h3d-studio-bg" aria-label="Rodin Studio workspace">
      {/* reference top bar — HYPER3D (the reference's own logo mark) + dark
          Subscribe pill (hover → gradient 7-Day Trial) left, Add On (with the
          reference's orange mark) / API / MCP&CLI / Login + globe right
          (DOM-extracted: default pill = rgba(255,255,255,0.08) "Subscribe",
          hover swaps to the linear-gradient(112.97deg, #9EC9FF, #FFAEB0)
          7-Day Trial state). */}
      <header className="relative z-20 flex h-[81px] shrink-0 items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-white" aria-label="HYPER3D">
            <img src="/images/hyper3d-logo.png" alt="" aria-hidden="true" className="h-[24px] w-auto sm:h-[28px] md:h-[32px]" />
            <span className="text-xl font-bold tracking-tight">HYPER3D</span>
          </span>
          <button
            type="button"
            onClick={() => setPricingOpen(true)}
            aria-label="Subscribe — membership plans"
            className="group relative flex h-[37px] w-[139px] items-center justify-center rounded-[30px] border border-white/15 bg-white/[0.08] text-lg font-semibold transition-colors hover:border-white/25"
          >
            {/* the reference's guest default is data-state=trial — gradient
                "7-Day Trial" visible, hover swaps to "Subscribe" (measured
                live 2026-10-23: trial label fades+scale(0.78) out, sub
                label fades in; Task 49 flipped the earlier inverted pair) */}
            <span className="absolute inset-0 flex items-center justify-center rounded-[30px] bg-[linear-gradient(112.97deg,#9ec9ff_4.67%,#ffaeb0_96%)] text-lg font-bold text-[#17181c] transition-[opacity,transform] duration-300 ease-in-out group-hover:scale-[0.78] group-hover:opacity-0">
              7-Day Trial
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
              Subscribe
            </span>
          </button>
        </div>
        <nav className="flex items-center gap-6" aria-label="Workspace">
          <button
            type="button"
            onClick={() =>
              toast.info("Add On", { description: "Add-ons live outside this clone's scope — the workspace itself is fully wired." })
            }
            className="hidden items-center gap-1 text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white xl:block"
          >
            <span className="mt-[2px]">Add On</span>
            {/* the reference's add-on mark — a 7-icon DCC-tool carousel
                (Task 49: replaced the static approximation with the
                DOM-measured cross-fade behavior + real assets) */}
            <AddOnIconCarousel />
          </button>
          <button
            type="button"
            onClick={() =>
              toast.info("API", { description: "This clone's own REST API (/api/task/*) powers the workspace end-to-end." })
            }
            className="hidden text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white md:block"
          >
            API
          </button>
          <button
            type="button"
            onClick={() => setMcpConnectOpen(true)}
            aria-label="Connect Hyper3D MCP"
            className="hidden text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white md:block"
          >
            Connect Hyper3D MCP
          </button>
          <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden="true" />
          {user ? (
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                <Coins className="size-3.5 text-h3d-gold" aria-hidden="true" />
                <span className="text-sm text-white">{user.balance}</span>
                <span className="text-[11px] text-white/40">credits</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  toast.info(`Signed in as ${user.email}`, {
                    description: "Demo account — the clone's own auth.",
                    action: { label: "Sign out", onClick: () => void onSignOut() },
                  })
                }
                className="flex size-9 items-center justify-center rounded-full border border-h3d-violet/50 bg-h3d-violet/20 text-sm font-semibold text-white transition-colors hover:border-h3d-violet"
                title={user.email}
              >
                {user.email.slice(0, 1).toUpperCase()}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onNeedAuth("Sign in to generate — your first preview is free.")}
              className="flex items-center gap-1.5 text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Login
            </button>
          )}
          <Globe className="size-[18px] cursor-pointer text-[#b0b0b0] transition-colors hover:text-white" aria-label="Language" />
        </nav>
      </header>

      {/* atmosphere — the reference's three fixed gradient blobs (DOM-extracted
          geometry + gradients, blur(100px)) behind everything. */}
      <div className="h3d-blob z-0" style={{ left: "51%", top: "25%", width: 403, height: 403, background: "rgba(210, 181, 223, 0.26)" }} aria-hidden="true" />
      <div
        className="h3d-blob z-0"
        style={{
          left: "15%",
          top: "8%",
          width: 677,
          height: 677,
          backgroundImage: "linear-gradient(309.02deg, rgba(158, 118, 172, 0.52) 16.79%, rgba(214, 120, 48, 0.52) 93.35%)",
        }}
        aria-hidden="true"
      />
      <div
        className="h3d-blob z-0"
        style={{
          left: "57%",
          top: "44%",
          width: 346,
          height: 346,
          backgroundImage: "linear-gradient(132.64deg, rgba(255, 217, 142, 0.4) 42.55%, rgba(214, 120, 48, 0.4) 79.55%)",
        }}
        aria-hidden="true"
      />

      {/* body — the reference's scrollable workspace landing when empty; the
          proven three-pane dashboard once a task exists / work is in flight. */}
      {emptyStudio ? (
        <div className="h3d-scroll relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-4">
            {/* subnav — Avatar / 3D / Video text tabs in a glass pill (3D active, as the reference) */}
            <nav className="mt-[19px] flex items-center gap-7 rounded-full border border-white/10 bg-black/25 px-6 py-2.5 backdrop-blur-md" aria-label="Product line">
              {/* zoom-probed 2026-10-22: the reference's pill ends with a
                  three-line menu icon after Video */}
              <span className="contents" aria-hidden="false">
              {(["Avatar", "3D", "Video"] as const).map((t) => {
                const drop =
                  t === "Avatar"
                    ? "Image Text/Image to 3D Avatar"
                    : t === "3D"
                      ? "Image 3D Large Model"
                      : "Image Video Generators";
                return (
                <span key={t} className="group relative">
                <button
                  type="button"
                  onClick={
                    t === "3D"
                      ? undefined
                      : () =>
                          toast.info(`${t} workspace`, {
                            description: "This clone implements the 3D workspace — Avatar and Video are reference-parity labels only.",
                          })
                  }
                  className={cn(
                    "flex items-center gap-1 text-sm font-bold transition-colors",
                    t === "3D" ? "cursor-default text-white" : "text-white/50 hover:text-white/80",
                    t === "Video" && "group",
                  )}
                  aria-current={t === "3D" ? "page" : undefined}
                >
                  {/* DOM-probed 2026-10-22: the reference's Video tab has no
                      chevron — it remix-swaps Video → Image on hover */}
                  {t === "Video" ? (
                    <span className="relative inline-flex h-[1em] w-[52px] items-center justify-center">
                      <span className="absolute inset-0 text-center transition-opacity group-hover:opacity-0">Video</span>
                      <span className="absolute inset-0 text-center opacity-0 transition-opacity group-hover:opacity-100">Image</span>
                      {/* two of four VLM passes see a small red "new" dot on
                          the reference's Video tab (likely a pseudo-element) */}
                      <span className="absolute -right-1 top-0 size-[5px] rounded-full bg-[#e65a4e] transition-opacity group-hover:opacity-0" aria-hidden="true" />
                    </span>
                  ) : (
                    t
                  )}
                </button>
                {/* hover dropdown (reference nav_show: per-tab tool description,
                    248px glass card under the tab) */}
                <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[248px] -translate-x-1/2 rounded-[18px] border border-white/10 bg-[#17181c]/95 p-3 text-center text-xs font-semibold text-white/75 opacity-0 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  {drop}
                </span>
                </span>
                );
              })}
              </span>
              <span className="group relative">
                <button
                  type="button"
                  aria-label="Workspace menu"
                  onClick={() => toast.info("Menu", { description: "Reference-parity chrome — the 3D workspace is fully wired in this clone." })}
                  className="text-white/50 transition-colors hover:text-white/85"
                >
                  <Menu className="size-4" aria-hidden="true" />
                </button>
                {/* OmniCraft grid dropdown (reference nav_show on the menu icon:
                    tool grid + Add-On DCC description). t56: driven by the shared
                    registry — live tools route to /omnicraft/{slug}, the rest state
                    honestly why they are not in this clone. */}
                <span className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-[300px] rounded-[18px] border border-white/10 bg-[#17181c]/95 p-3.5 opacity-0 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <span className="block text-[11px] font-bold text-white/85">OmniCraft｜Toolbag for 3D</span>
                  <span className="mt-2 grid grid-cols-2 gap-1">
                    {OMNICRAFT_TOOLS.map((tool) =>
                      tool.status === "live" ? (
                        <a
                          key={tool.slug}
                          href={`/omnicraft/${tool.slug}`}
                          title={tool.blurb}
                          className="truncate rounded-lg bg-white/[0.05] px-2 py-1.5 text-[10px] font-semibold text-white/65 transition-colors hover:bg-violet-400/15 hover:text-white"
                        >
                          {tool.name}
                        </a>
                      ) : (
                        <span
                          key={tool.slug}
                          title={tool.note}
                          className="truncate rounded-lg bg-white/[0.03] px-2 py-1.5 text-[10px] font-semibold text-white/30"
                        >
                          {tool.name}
                        </span>
                      ),
                    )}
                  </span>
                  <span className="mt-2.5 block text-[10px] leading-relaxed text-white/45">
                    Add-On lets you use almost all Rodin features in DCC software.
                  </span>
                </span>
              </span>
            </nav>

            {/* hero — the reference's own animated SVG wordmark + version tabs + quotes */}
            <div className="mt-10 flex flex-col items-center sm:mt-[53px]">
              <RodinWordmark className="h-[49px] w-[213px] sm:h-[78px] sm:w-[356px] md:h-[85px] md:w-[391px] lg:h-[93px] lg:w-[427px]" />
              <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Generator version">
                {/* DOM truth (2026-10-22 probe): the reference hides the
                    Gen-1.5 V1.2 tab (parent opacity 0) — only the active
                    Gen-2.5 Agent-Ready tab + red "new" dot is visible. */}
                <span
                  className="flex items-center gap-1.5 px-1 text-[12.8px] font-bold text-white"
                  title={GEN_VERSIONS.find((v) => v.id === genVersion)?.note}
                >
                  {GEN_VERSIONS.find((v) => v.id === genVersion)?.label ?? "Gen-2.5 Agent-Ready"}
                  <span className="ml-0.5 size-[5px] rounded-full bg-[#e65a4e]" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-[7px] flex min-h-[36px] w-full max-w-[560px] flex-col items-center justify-center gap-1 px-4 text-center text-sm text-[#cfcfcf]">
                {/* rotating tip slot (agent-walked recon: the reference rotates
                    its operational tip pool here; Feynman is the default) */}
                <span key={tipIndex} className="animate-in fade-in duration-700">
                  {HERO_TIPS[tipIndex].length > 62
                    ? HERO_TIPS[tipIndex].split(". ").map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 ? "." : ""}
                          {i === 0 && arr.length > 1 ? <br /> : null}
                        </span>
                      ))
                    : HERO_TIPS[tipIndex]}
                </span>
              </div>
            </div>

            {/* card cluster — left mode rail + 180px input card + right tools rail */}
            <div className="relative mt-8 flex flex-col items-center gap-3 sm:mt-[34px] sm:flex-row sm:items-center sm:gap-0">
              {/* left mode rail (glass, 74px, attached to the card's left edge) */}
              <div className="flex gap-1.5 rounded-xl bg-white/[0.043] p-1.5 backdrop-blur-2xl sm:absolute sm:-left-[86px] sm:top-1/2 sm:-translate-y-1/2 sm:flex-col">
                {(
                  [
                    { id: "rodin", label: "Image to 3D", icon: ImageIcon, gen: true },
                    { id: "editing-3d", label: "3D Editing", icon: PencilRuler, gen: false },
                    { id: "worldgen", label: "WorldGen", icon: Globe, gen: false },
                  ] as const
                ).map((m) => {
                  const active =
                    m.id === "rodin" ? GENERATING_MODES.includes(mode) : mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMode(m.id === "rodin" ? "image-to-3d" : (m.id as GenMode))}
                      className={cn(
                        "flex h-10 w-[67px] flex-col items-center justify-center gap-0.5 rounded-[9px] transition-colors",
                        active ? "h3d-mode-active text-white" : "text-white/56 hover:text-white/85",
                      )}
                    >
                      <m.icon className="size-[15px]" aria-hidden="true" />
                      <span className="text-[9.5px] font-medium leading-none">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* upload strip (UX-recon 2026-10-22): uploaded images line up as
                  172px thumbnail cards to the LEFT of the + entry card (which
                  always stays) — the reference's multi-image layout. Click a
                  thumbnail → direction popup; hover → teal→yellow gradient
                  remix button (reference newrodin_imgBtn). */}
              {mode === "image-to-3d" && stripImages.length > 0 && (
                <div className="flex items-center gap-2 sm:mr-2">
                  {stripImages.map((img, i) => (
                    <div
                      key={img.id}
                      className="group relative h-[160px] w-[160px] shrink-0 cursor-pointer overflow-hidden rounded-[19px] bg-black/20 backdrop-blur-md md:h-[172px] md:w-[172px]"
                    >
                      <button
                        type="button"
                        aria-label={`Image ${i + 1} — ${DIRECTION_LABELS[img.direction]} view. Select the direction of this image.`}
                        onClick={() => setOriPopupFor(img.id)}
                        className="absolute inset-0 h-full w-full cursor-pointer"
                      />
                      <img
                        src={img.dataUrl}
                        alt={`${img.name} — ${DIRECTION_LABELS[img.direction]} view`}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      />
                      {/* direction chip (bottom-left, shows once a direction is picked) */}
                      {img.direction !== "unknown" && (
                        <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                          {DIRECTION_LABELS[img.direction]}
                        </span>
                      )}
                      {/* caption-analysis pulse on the primary image (subtle —
                          the reference keeps the landing quiet) */}
                      {i === 0 && analyzing && (
                        <span className="pointer-events-none absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/65 backdrop-blur-sm">
                          <Loader2 className="size-3 animate-spin text-white/85" aria-label="Analyzing reference" />
                        </span>
                      )}
                      {/* remix button (reference: 24px circle, teal→yellow gradient) */}
                      <button
                        type="button"
                        aria-label={`Remix image ${i + 1}`}
                        title="Remix"
                        onClick={() => {
                          setRemixFor(img.id);
                          setRemixText("");
                          setRemixStyle(null);
                        }}
                        className="absolute right-[5px] top-[5px] flex size-6 items-center justify-center rounded-full bg-[linear-gradient(126.18deg,rgba(0,216,213,1)_1.15%,rgba(255,211,37,1)_92.97%)] opacity-0 shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-opacity hover:brightness-110 focus:opacity-100 group-hover:opacity-100"
                      >
                        <Sparkles className="size-3 text-[#17181c]" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* the 180×180 input card (radius 20) — DOM-probed 2026-10-22:
                  the reference's content field reads near-black (deeper than
                  the old black/18), so the blobs don't lift it. Header row has
                  the mode icon beside the label (reference modeMenuIcon).
                  In image mode the + zone ALWAYS stays (the images live in
                  the strip to the left — reference behavior). */}
              <div className="relative h-[180px] w-[180px] shrink-0 overflow-hidden rounded-[20px] border border-white/8 bg-black/45">
                <p className="flex items-center justify-center gap-1.5 pt-3 text-center text-base font-bold text-white">
                  {(() => {
                    const ModeIcon = mode === "editing-3d" ? PencilRuler : mode === "worldgen" ? Globe : mode === "text-to-3d" ? Type : ImageIcon;
                    return <ModeIcon className="size-4 text-white/80" aria-hidden="true" />;
                  })()}
                  {mode === "editing-3d" ? "3D Editing" : mode === "worldgen" ? "WorldGen" : mode === "text-to-3d" ? "Text to 3D" : "Image to 3D"}
                </p>
                {GENERATING_MODES.includes(mode) ? (
                  mode === "text-to-3d" ? (
                    <>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the item you want to generate..."
                        aria-label="Prompt"
                        className="absolute inset-x-2 bottom-[42px] top-[42px] resize-none bg-transparent text-sm text-[#ebebeb] outline-none placeholder:text-white/30"
                      />
                      {/* correct button — the reference prompt card's
                          spell/grammar fix (real LLM call) */}
                      <button
                        type="button"
                        onClick={() => void polishPrompt()}
                        disabled={!prompt.trim() || polishing}
                        className="absolute bottom-[46px] right-2 flex items-center gap-1 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
                      >
                        {polishing ? (
                          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="size-3" aria-hidden="true" />
                        )}
                        correct
                      </button>
                    </>
                  ) : (
                    <label
                      htmlFor="workspace-upload"
                      className="absolute inset-x-0 bottom-[38px] top-[42px] flex cursor-pointer flex-col items-center justify-center gap-1.5 transition-colors hover:bg-white/[0.03]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) void handleFiles(files);
                      }}
                    >
                      <span className="relative size-10" aria-hidden="true">
                        <span className="absolute left-1/2 top-1/2 h-[5px] w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                        <span className="absolute left-1/2 top-1/2 h-10 w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                      </span>
                      {/* sub-tab flavor (reference: Remix Gen = "Remix Images
                          with your idea", Turbo Gen = Single image / Multi-view
                          + Upload photos from any angle) */}
                      {mode === "image-to-3d" && imageTab === "remix" && (
                        <span className="text-[8.5px] leading-tight text-white/45">Remix Images with your idea</span>
                      )}
                      {mode === "image-to-3d" && imageTab === "turbo" && (
                        <>
                          <span className="flex items-center gap-1">
                            {(["Single image", "Multi-view"] as const).map((v, i) => (
                              <span
                                key={v}
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMultiView(i === 1);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMultiView(i === 1);
                                  }
                                }}
                                className={cn(
                                  "rounded-full px-1.5 py-0.5 text-[8px] font-bold transition-colors",
                                  (i === 1) === multiView ? "bg-white/85 text-[#17181c]" : "bg-white/[0.08] text-white/60",
                                )}
                              >
                                {v}
                              </span>
                            ))}
                          </span>
                          <span className="text-[8px] leading-tight text-white/40">Upload photos from any angle</span>
                        </>
                      )}
                    </label>
                  )
                ) : (
                  <div className="absolute inset-x-2.5 bottom-[42px] top-[42px] flex flex-col items-center justify-center gap-2 text-center">
                    {mode === "editing-3d" ? (
                      <>
                        {/* reference 3D Editing card: upload custom reference
                            image if needed + Supports .obj .fbx .glb +
                            Parts/Refine/Modify tabs + Frontview hint */}
                        <label htmlFor="workspace-upload" className="flex cursor-pointer flex-col items-center gap-1.5" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files; if (f && f.length > 0) void handleFiles(f); }}>
                          <span className="relative size-8" aria-hidden="true">
                            <span className="absolute left-1/2 top-1/2 h-[4px] w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                            <span className="absolute left-1/2 top-1/2 h-8 w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                          </span>
                          <span className="text-[9px] leading-tight text-white/55">Upload custom reference image if needed</span>
                          <span className="font-mono text-[8.5px] text-white/40">Supports .obj .fbx .glb</span>
                        </label>
                        <div className="flex items-center gap-1" role="tablist" aria-label="Editing operation">
                          {(["parts", "refine", "modify"] as const).map((op) => (
                            <button
                              key={op}
                              type="button"
                              role="tab"
                              aria-selected={editingTab === op}
                              onClick={() => setEditingTab(op)}
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[9px] font-bold capitalize transition-colors",
                                editingTab === op ? "bg-[#d2b6df]/25 text-white" : "text-white/50 hover:text-white/80",
                              )}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                        <span className="text-[8px] leading-tight text-white/40">View selection affects the editing results.</span>
                      </>
                    ) : (
                      <>
                        {/* reference WorldGen card: Upload a scene image +
                            Pick objects + Creation Mode pills (Build Myself /
                            Generate Objects / Complete Scene disabled) */}
                        <label htmlFor="workspace-upload" className="flex cursor-pointer flex-col items-center gap-1.5" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files; if (f && f.length > 0) void handleFiles(f); }}>
                          <span className="relative size-8" aria-hidden="true">
                            <span className="absolute left-1/2 top-1/2 h-[4px] w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                            <span className="absolute left-1/2 top-1/2 h-8 w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                          </span>
                          <span className="text-[9px] leading-tight text-white/55">Upload a scene image.</span>
                        </label>
                        <div className="flex flex-col items-center gap-1">
                          {(
                            [
                              { id: "build-myself", label: "Build Myself", sub: "Manual", on: false },
                              { id: "generate-objects", label: "Generate Objects", sub: "AI Assist", on: true },
                              { id: "complete-scene", label: "Complete Scene", sub: "Full AI", on: false, disabled: true },
                            ] as const
                          ).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              disabled={c.disabled}
                              onClick={() => c.id !== "complete-scene" && setCreationMode(c.id)}
                              className={cn(
                                "flex w-[150px] items-center justify-between rounded-lg px-2 py-1 text-left transition-colors",
                                c.disabled ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.05]",
                                creationMode === c.id && !c.disabled && "bg-white/[0.07]",
                              )}
                            >
                              <span className="text-[9px] font-bold text-white/85">{c.label}</span>
                              <span className="text-[8px] text-white/45">{c.sub}</span>
                            </button>
                          ))}
                        </div>
                        <span className="text-[8px] text-white/40">Pick objects.</span>
                      </>
                    )}
                  </div>
                )}
                {/* image/text toggle pill (lilac glass, gradient text) + the
                    reference's Remix Gen / Turbo Gen sub-pills stacked at the
                    card's bottom-right (DOM-probed: 73×21 / 70×21 at the pill
                    row's right end) */}
                {GENERATING_MODES.includes(mode) && (
                  <>
                    {mode === "image-to-3d" && (
                      <span className="absolute bottom-[34px] right-1.5 z-10 flex flex-col gap-1">
                        {(["remix", "turbo"] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            aria-pressed={imageTab === tab}
                            onClick={() => setImageTab(tab)}
                            className={cn(
                              "h-[18px] rounded-full px-2 text-[8.5px] font-bold backdrop-blur-md transition-colors",
                              imageTab === tab
                                ? "bg-[#d2b6df]/30 text-white"
                                : "bg-[#d2b6df]/10 text-white/55 hover:text-white/85",
                            )}
                          >
                            {tab === "remix" ? "Remix Gen" : "Turbo Gen"}
                          </button>
                        ))}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "image-to-3d" ? "text-to-3d" : "image-to-3d")}
                      className="absolute bottom-3 left-1/2 flex h-[30px] w-[168px] -translate-x-1/2 items-center justify-center rounded-[17px] bg-[#d2b6df]/15 text-base font-bold backdrop-blur-[60px] transition-colors hover:bg-[#d2b6df]/25"
                    >
                      <span className="h3d-grad-text-warm">
                        {mode === "image-to-3d" ? "Text to Image/3D" : "Image to 3D"}
                      </span>
                    </button>
                  </>
                )}
              </div>
              <input
                id="workspace-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) void handleFiles(files);
                  e.target.value = "";
                }}
              />

              {/* right tools rail — circular icon buttons (28px, white/8):
                  the reference's icon set (wand with a red notification dot,
                  cube, group, stack) with honest wiring — two live tools +
                  two reference ControlNet slots with honest stubs */}
              <div className="flex gap-2 sm:absolute sm:-right-[46px] sm:top-1/2 sm:-translate-y-1/2 sm:flex-col">
                <button
                  type="button"
                  aria-label="Material pass"
                  title="Material"
                  onClick={() => setToolPanel(toolPanel === "materials" ? null : "materials")}
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    toolPanel === "materials" && "bg-white/20",
                  )}
                >
                  <Wand2 className="size-3.5 text-white/80" aria-hidden="true" />
                  {/* DOM-probed 2026-10-22: the reference's wand badge is a
                      red-orange circle carrying the number 1 */}
                  <span className="absolute -right-1 -top-1 flex size-[13px] items-center justify-center rounded-full bg-[#f0552e] text-[8px] font-bold leading-none text-white" aria-hidden="true">
                    1
                  </span>
                </button>
                {mode === "image-to-3d" && upload && (
                  <button
                    type="button"
                    aria-label="Extra views — pick the four optional reference angles"
                    title="Extra views (optional)"
                    onClick={() => setToolPanel(toolPanel === "directions" ? null : "directions")}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                      toolPanel === "directions" && "bg-white/20",
                    )}
                  >
                    <Compass className="size-3.5 text-white/80" aria-hidden="true" />
                  </button>
                )}
                {/* ControlNet rail (reference: three spatial-conditioning
                    affordances — Bounding Box / Voxel / Point Cloud). All
                    three open the real constraint editor; the applied
                    constraint is shown by the active highlight. */}
                <button
                  type="button"
                  aria-label={`Bounding Box ControlNet${controlnet ? " — constraint applied" : ""}`}
                  title="Bounding Box ControlNet"
                  onClick={() => {
                    setControlnetTab("bbox");
                    setControlnetOpen(true);
                  }}
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    controlnet?.mode === "bbox" && "bg-white/20",
                  )}
                >
                  <Box className="size-3.5 text-white/80" aria-hidden="true" />
                  {controlnet?.mode === "bbox" && (
                    <span className="absolute -right-1 -top-1 size-[7px] rounded-full bg-h3d-violet" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Voxel ControlNet${controlnet ? " — constraint applied" : ""}`}
                  title="Voxel ControlNet"
                  onClick={() => {
                    setControlnetTab("voxel");
                    setControlnetOpen(true);
                  }}
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    controlnet?.mode === "voxel" && "bg-white/20",
                  )}
                >
                  <Users className="size-3.5 text-white/80" aria-hidden="true" />
                  {controlnet?.mode === "voxel" && (
                    <span className="absolute -right-1 -top-1 size-[7px] rounded-full bg-h3d-violet" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Point Cloud ControlNet${controlnet ? " — constraint applied" : ""}`}
                  title="Point Cloud ControlNet"
                  onClick={() => {
                    setControlnetTab("pointcloud");
                    setControlnetOpen(true);
                  }}
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    controlnet?.mode === "pointcloud" && "bg-white/20",
                  )}
                >
                  <Grip className="size-3.5 text-white/80" aria-hidden="true" />
                  {controlnet?.mode === "pointcloud" && (
                    <span className="absolute -right-1 -top-1 size-[7px] rounded-full bg-h3d-violet" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Prompt presets and seed"
                  title="Prompt presets and seed"
                  onClick={() => setToolPanel(toolPanel === "presets" ? null : "presets")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    toolPanel === "presets" && "bg-white/20",
                  )}
                >
                  <Layers className="size-3.5 text-white/80" aria-hidden="true" />
                </button>
              </div>

              {/* floating tool panels (glass, anchored right of the cluster) */}
              {toolPanel && (
                <div className="absolute left-full top-0 z-30 ml-4 w-64 rounded-xl border border-white/10 bg-[#1c1a20]/90 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:top-1/2 sm:-translate-y-1/2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      {toolPanel === "directions" ? "Extra views" : toolPanel === "materials" ? "Material" : "Presets"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setToolPanel(null)}
                      aria-label="Close panel"
                      className="flex size-6 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </div>
                  {toolPanel === "materials" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {MATERIALS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          aria-pressed={material === m.id}
                          onClick={() => setMaterial(m.id)}
                          className={cn(
                            "rounded-lg px-2 py-2 text-left text-xs transition-colors",
                            material === m.id ? "h3d-mode-active text-white" : "text-white/60 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <span className="block font-semibold">{m.label}</span>
                          <span className="block text-[9px] text-white/40">{m.blurb}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {toolPanel === "presets" && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {PROMPT_PRESETS.slice(0, 6).map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setPrompt(p.prompt);
                              if (mode === "image-to-3d") setMode("text-to-3d");
                            }}
                            className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/70 transition-colors hover:border-white/25 hover:text-white"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={65535}
                          value={seed}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setSeed(Number.isFinite(n) ? Math.max(0, Math.min(65535, Math.floor(n))) : 0);
                            setLockSeed(true);
                          }}
                          aria-label="Seed"
                          className="h-8 min-w-0 flex-1 rounded-lg border border-white/12 bg-white/5 px-2 text-xs text-white/85"
                        />
                        <button
                          type="button"
                          aria-pressed={lockSeed}
                          title={lockSeed ? "Seed locked — click to randomize" : "Seed randomizes — click to lock"}
                          onClick={() => setLockSeed(!lockSeed)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-lg border border-white/12 bg-white/5",
                            lockSeed && "border-[#e6765d]/60 bg-[#e6765d]/15",
                          )}
                        >
                          <Dices className={cn("size-3.5", lockSeed ? "text-[#e6765d]" : "text-white/50")} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}
                  {toolPanel === "directions" && (
                    <div className="space-y-2">
                      <p className="text-[10px] leading-relaxed text-white/45">
                        Optional extra views (pose-free). Engine slots: front always used; extra angles refine the mesh.
                      </p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {VIEW_DIRECTIONS.map((dir) => {
                          const existing = extraViews.find((v) => v.direction === dir);
                          const engineFed = ENGINE_SLOT_OF[dir] !== null;
                          return existing ? (
                            <div key={dir} className="relative">
                              <img
                                src={existing.dataUrl}
                                alt={`${DIRECTION_LABELS[dir]} view`}
                                className="h-12 w-full rounded-md border border-[#b98acf]/60 object-cover"
                              />
                              <button
                                type="button"
                                aria-label={`Remove ${DIRECTION_LABELS[dir]} view`}
                                onClick={() => setExtraViews((views) => views.filter((v) => v.direction !== dir))}
                                className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-black/70 text-white/80"
                              >
                                <X className="size-2.5" aria-hidden="true" />
                              </button>
                              <span className="absolute inset-x-0 bottom-0 rounded-b-md bg-black/70 px-0.5 py-0.5 text-center text-[7px] uppercase text-white/80">
                                {DIRECTION_SHORT[dir]}
                              </span>
                            </div>
                          ) : (
                            <label
                              key={dir}
                              className={cn(
                                "flex h-12 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-[8px] uppercase tracking-wide transition-colors",
                                engineFed
                                  ? "border-white/20 text-white/60 hover:border-[#b98acf]/60 hover:text-white"
                                  : "border-white/8 text-white/25",
                              )}
                              title={engineFed ? `Add the ${DIRECTION_LABELS[dir]} view` : "Decorative slot — the engine takes 4 base angles"}
                            >
                              <Plus className="size-3" aria-hidden="true" />
                              {DIRECTION_SHORT[dir]}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (!file) return;
                                  if (extraViews.length >= 4) {
                                    toast.info("Up to 4 extra views", { description: "The engine takes 1 main image + up to 4 views (5 total)." });
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const dataUrl = String(reader.result);
                                    setExtraViews((vs) => [
                                      ...vs.filter((v) => v.direction !== dir),
                                      { direction: dir, dataUrl, file },
                                    ]);
                                  };
                                  void reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* caption palette strip (image mode, after vision analysis) */}
            {mode === "image-to-3d" && caption && caption.palette.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {caption.palette.slice(0, 6).map((hex) => (
                  <span key={hex} title={hex} className="size-3.5 rounded-full border border-white/25" style={{ backgroundColor: hex }} />
                ))}
                <span className="text-[10px] text-white/45">
                  {caption.components.length} components · {caption.form}
                </span>
              </div>
            )}

            {/* GENERATE capsule — DOM-probed 2026-10-22: the reference's
                206x68 glass capsule stands ALONE (no lock, no flanking
                quality/batch chips — those live in the controls row below) */}
            <div className="relative mt-[38px] flex items-center justify-center gap-[54px]">
              {/* DOM-probed 2026-10-22 (single-instant band scan): the
                  reference DOES flank the capsule — a bare ~21x20 lock icon
                  60px left, and a ×1 chip + link + 29px settings icon right
                  (they are IMGs, which is why the svg-only probes missed them). */}
              <button
                type="button"
                aria-pressed={isPrivate}
                title={isPrivate ? "Private — hidden from the gallery" : "Public — visible in the gallery"}
                onClick={() => setIsPrivate(!isPrivate)}
                className="flex size-5 items-center justify-center transition-opacity hover:opacity-70"
              >
                {isPrivate ? (
                  <Lock className="size-5 text-[#e6765d]" aria-hidden="true" />
                ) : (
                  <LockOpen className="size-5 text-white/55" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={creating || generating || analyzing}
                className="group relative flex h-[68px] w-[206px] items-center justify-center rounded-full h3d-generate-capsule shadow-[0_0_58px_rgba(202,102,80,0.3),0_0_96px_rgba(185,138,207,0.25)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
                aria-label={generateHoverLabel}
              >
                <span
                  className={cn(
                    "h3d-generate-glow absolute left-1/2 top-1/2 h-[39px] w-[164px] -translate-x-1/2 -translate-y-1/2",
                    (creating || generating || analyzing) && "h-5 w-[100px] opacity-50",
                    "group-hover:h-[30px] group-hover:w-[130px]",
                  )}
                  aria-hidden="true"
                />
                {creating || generating ? (
                  <span className="relative z-10 flex items-center gap-2 text-lg font-bold text-white/60">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Working…
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "relative z-10 text-lg font-bold text-white transition-opacity group-hover:opacity-0",
                        analyzing && "opacity-50",
                      )}
                    >
                      GENERATE
                    </span>
                    <span className="h3d-grad-text-warm pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-lg font-bold opacity-0 transition-opacity group-hover:opacity-100">
                      {generateHoverLabel}
                    </span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-3">
                {/* batch chip — reference opens the upsell tooltip
                    "Unlock 5x and 10x tiers with Business Plan" on click */}
                <span className="relative">
                  <button
                    type="button"
                    aria-label="Batch size"
                    aria-expanded={batchTip}
                    onClick={() => setBatchTip((v) => !v)}
                    onBlur={() => setBatchTip(false)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white/50 transition-colors hover:text-white/85"
                  >
                    ×1
                    <ChevronRight className="size-3" aria-hidden="true" />
                  </button>
                  {batchTip && (
                    <>
                      <span className="fixed inset-0 z-20" onClick={() => setBatchTip(false)} aria-hidden="true" />
                      <span
                        role="tooltip"
                        className="absolute bottom-full left-1/2 z-30 mb-2 w-[224px] -translate-x-1/2 rounded-xl border border-white/12 bg-[#1c1a20]/95 p-3 text-center text-[11px] leading-snug text-white/75 backdrop-blur-xl"
                      >
                        Unlock <span className="font-semibold text-white">5x and 10x</span> tiers
                        with{" "}
                        <span className="font-semibold text-[#ff9d9d] underline underline-offset-2">Business Plan</span>
                        <span className="mt-1 block text-[10px] text-white/40">
                          This clone keeps batch ×1 — every generation is full quality.
                        </span>
                      </span>
                    </>
                  )}
                </span>
                {/* Presets — the reference GENERATE-row Presets modal
                    (Geometry pills + Prompt + Caption Override) */}
                <button
                  type="button"
                  onClick={() => setRefPresetsOpen(true)}
                  title="Presets"
                  className="flex items-center gap-1 text-[11px] font-semibold text-white/50 transition-colors hover:text-white/85"
                >
                  <SlidersHorizontal className="size-3" aria-hidden="true" />
                  Presets
                </button>
                {/* settings icon — opens the shared Model Selection popover
                    (reference: all three pickers open the same panel) */}
                <button
                  type="button"
                  onClick={() => setModelPopoverOpen(true)}
                  title="Generation settings"
                  aria-label="Generation settings"
                  className="flex size-[29px] items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings className="size-[18px]" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* controls row — DOM-probed 2026-10-22 (single-instant band scan,
                full parent-chain visibility): the reference's VISIBLE row is
                exactly three controls — [bot icon + OFF pill] · ‹ Gen-2.5 › ·
                [diamond + High + chevron]. UX-recon 2026-10-22: the ‹Gen-2.5›
                pill and the effort pill BOTH open the shared Model Selection
                popover; picking applies immediately and closes (no confirm);
                the Agentic pill gates guests behind the sign-in panel. */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <button
                type="button"
                aria-pressed={agentic}
                aria-label="Agentic Mode"
                disabled={!agenticAvailable}
                onClick={() => {
                  if (!user) {
                    onNeedAuth("Sign in to use Agentic Mode — Vibe Modeling lets AI plan and build.");
                    return;
                  }
                  setAgentic(!agentic);
                }}
                title={agenticAvailable ? "Toggle agentic generation (Vibe Modeling — let AI plan and build)" : "Gen-2.5 line only"}
                className={cn(
                  "flex items-center gap-2",
                  agenticAvailable ? "cursor-pointer" : "cursor-default opacity-40",
                )}
              >
                <Bot className={cn("size-5", agentic ? "text-[#e6765d]" : "text-white/50")} aria-hidden="true" />
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    agentic ? "bg-[#e6765d]/20 text-[#e6765d]" : "bg-white/8 text-white/70",
                  )}
                >
                  {agentic ? "ON" : "OFF"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModelPopoverOpen(true)}
                title="Model Selection"
                className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm font-bold text-white transition-colors hover:border-white/25"
              >
                <ChevronDown className="size-3 rotate-90 text-white/50" aria-hidden="true" />
                {genVersion === "gen-2.5" ? "Gen-2.5" : "Gen-1.5"}
                <ChevronDown className="size-3 -rotate-90 text-white/50" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setModelPopoverOpen(true)}
                title="Quality"
                className="flex items-center gap-1.5 text-sm text-white/90"
              >
                <Gem className="size-3.5 text-[#ecc16c]" aria-hidden="true" />
                {qualityChipLabel}
                <ChevronDown className="size-3.5 text-white/50" aria-hidden="true" />
              </button>
            </div>

            {neuralBusy && (
              <div className="mt-4 flex w-full max-w-md items-center gap-2 rounded-lg border border-[#b98acf]/30 bg-[#b98acf]/10 px-3 py-2">
                <Loader2 className="size-3.5 shrink-0 animate-spin text-[#b98acf]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-white/85">{neuralMessage ?? "Working…"}</p>
                  <p className="text-[10px] text-white/40">{neuralElapsed.toFixed(1)}s · Hunyuan3D-2.1</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelNeural}
                  className="h-8 shrink-0 border-white/15 bg-white/5 px-2.5 text-[10px] text-white/75"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* ASSET section — DOM-probed 2026-10-22: row 1 = ASSET (bold) +
              EXPLORE (muted) + search/Filter right; row 2 = Featured pill
              below-left; no Share button. Gallery grid, Load More.
              UX-recon (agent-walked): EXPLORE swaps to the story feed
              (reference routes /tab/story); tile click opens the asset
              detail (reference /workspace/rodin/{uuid}). */}
          <section className="mx-auto mt-14 w-full max-w-[1280px] px-6 pb-20 md:px-20" aria-label="Assets">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <h2 className={cn("text-[26px] font-bold leading-none", storyOpen ? "text-white/40" : "text-white")}>ASSET</h2>
              <button
                type="button"
                onClick={() => {
                  setStoryOpen(true);
                  if (typeof document !== "undefined") document.querySelector(".h3d-scroll")?.scrollTo({ top: 0 });
                }}
                aria-pressed={storyOpen}
                className={cn("text-[26px] font-bold leading-none transition-colors", storyOpen ? "text-white" : "text-white/40 hover:text-white/70")}
              >
                EXPLORE
              </button>
              <div className="ml-auto flex items-center gap-3">
                {/* Task 48: real search — click reveals the input (reference
                    behavior); Enter/clear submits to ?q= on the gallery list */}
                {searchOpen ? (
                  <form
                    className="relative"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setGalleryQ(searchDraft.trim());
                      setFilterOpen(false);
                      void refreshGallery({ q: searchDraft.trim() });
                    }}
                  >
                    <input
                      autoFocus
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      onBlur={() => {
                        if (!searchDraft.trim()) setSearchOpen(false);
                      }}
                      placeholder="Search assets by text"
                      aria-label="Search assets by text"
                      className="h-[38px] w-56 rounded-full border border-white/20 bg-black/40 pl-9 pr-8 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
                    />
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                    {searchDraft && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                          setSearchDraft("");
                          setGalleryQ("");
                          void refreshGallery({ q: "" });
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </form>
                ) : (
                  <button
                    type="button"
                    aria-label="Search assets"
                    onClick={() => setSearchOpen(true)}
                    className="flex size-[38px] items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Search className="size-4" aria-hidden="true" />
                  </button>
                )}
                {/* Task 48: real sort — Featured (curated) / Latest / Most
                    Liked, served by ?sort= on the gallery list */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={filterOpen}
                    aria-haspopup="menu"
                    onClick={() => setFilterOpen((o) => !o)}
                    className="flex h-[38px] items-center gap-1.5 rounded-full border border-white/12 px-4 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
                  >
                    Filter <ChevronDown className={cn("size-3.5 transition-transform", filterOpen && "rotate-180")} aria-hidden="true" />
                  </button>
                  {filterOpen && (
                    <div
                      role="menu"
                      aria-label="Sort gallery"
                      className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-[18px] border border-white/10 bg-[#17181c]/95 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                      {([
                        ["featured", "Featured"],
                        ["latest", "Latest"],
                        ["liked", "Most Liked"],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={gallerySort === value}
                          onClick={() => {
                            setGallerySort(value);
                            setFilterOpen(false);
                            void refreshGallery({ sort: value });
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                            gallerySort === value ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          {label}
                          {gallerySort === value && <Check className="size-3.5 text-[#d2b6df]" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* story feed (reference EXPLORE) vs Featured gallery */}
            {storyOpen ? (
              <StoryFeed
                onBack={() => {
                  setStoryOpen(false);
                  if (typeof document !== "undefined") document.querySelector(".h3d-scroll")?.scrollTo({ top: 0 });
                }}
              />
            ) : (
              <>
            <div className="mt-3">
              <span className="flex h-[38px] w-[106px] items-center justify-center rounded-[39px] border border-[#e6765d] text-base text-[#cfcfcf]">
                {gallerySort === "featured" ? "Featured" : gallerySort === "latest" ? "Latest" : "Most Liked"}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {/* OmniCraft promo tile (reference: 300×126 promo card inside the
                  gallery grid — toolbag upsell with per-tool pricing chips) */}
              <aside
                aria-label="OmniCraft promo"
                className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(210,182,223,0.10),rgba(23,24,28,0.6))] p-3.5"
              >
                <div>
                  <p className="text-sm font-bold text-white">OmniCraft｜Toolbag for 3D</p>
                  <div className="mt-3 space-y-1.5">
                    {[
                      ["Texture Generator", "Free Trial"],
                      ["Image Enhancer", "Free to all"],
                      ["Image Remix", "Free to Subscriber"],
                      ["HDRI Generation", "Free Trial"],
                    ].map(([tool, tag]) => (
                      <p key={tool} className="flex items-center justify-between text-[10px]">
                        <span className="text-white/70">{tool}</span>
                        <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[8.5px] font-bold text-[#d2b6df]">{tag}</span>
                      </p>
                    ))}
                  </div>
                </div>
                {/* t56: the toolbag is now real in this clone (/omnicraft) —
                    the reference's pricing chips stay as parity chrome, and the
                    CTA routes to the honest tool grid instead of a stub toast. */}
                <a
                  href="/omnicraft"
                  aria-label="Open the OmniCraft toolbag"
                  className="flex h-8 w-full items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#17181c] transition-colors hover:bg-white/90"
                >
                  Try OmniCraft
                </a>
              </aside>
              {gallery.map((tile) => (
                <figure
                  key={tile.uuid}
                  className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-colors hover:border-white/20"
                  onClick={() =>
                    setDetailAsset({
                      uuid: tile.uuid,
                      src: tile.src,
                      title: tile.title,
                      author: tile.author,
                      likes: tile.likes,
                      model: tile.model,
                      effort: tile.effort,
                      tags: tile.tags,
                      prompt: tile.prompt,
                    })
                  }
                >
                  <img
                    src={tile.src}
                    alt={`${tile.title} — demo render`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    aria-label={`Like ${tile.title}`}
                    aria-pressed={Boolean(tile.liked)}
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleLike(tile);
                    }}
                    className={cn(
                      "absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:text-[#ff6b6b] group-hover:opacity-100",
                      tile.liked ? "opacity-100 text-[#ff6b6b]" : "text-white/70 opacity-0",
                    )}
                  >
                    <Heart className={cn("size-3.5", tile.liked && "fill-[#ff6b6b]")} aria-hidden="true" />
                  </button>
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <span
                      className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-black/80"
                      style={{ backgroundColor: tile.hue }}
                      aria-hidden="true"
                    >
                      {tile.author.slice(6, 7)}
                    </span>
                    <span className="text-xs text-white">{tile.author}</span>
                    <span className="ml-auto text-[11px] text-white/70">{tile.likes} likes</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            {/* Task 48: real pagination — Load More appends the next page
                (?limit=8&offset=+8); the pill hides when has_more is false */}
            {gallery.length === 0 && !galleryLoading ? (
              <p className="mt-14 text-center text-sm text-white/50" role="status">
                {galleryQ ? `No assets match “${galleryQ}”.` : "No assets yet."}
              </p>
            ) : (
              <div className="mt-8 flex justify-center">
                {galleryHasMore && (
                  <button
                    type="button"
                    disabled={galleryLoading}
                    onClick={() => void refreshGallery({ append: true })}
                    className="flex h-[47px] w-[157px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
                  >
                    {galleryLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                    Load More
                  </button>
                )}
              </div>
            )}
              </>
            )}
          </section>

          {/* footer — the reference's own page footer (brand + email + socials,
              PRODUCT / FEATURES / PLUG-INS / LEGAL columns, Deemos copyright) */}
          <footer className="border-t border-white/8 bg-black/40 px-6 pb-10 pt-14 md:px-20">
            <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-10 md:grid-cols-5">
              <div className="col-span-2 md:col-span-1">
                <span className="flex items-center gap-2 text-white" aria-label="HYPER3D">
                        <img src="/images/hyper3d-logo.png" alt="" aria-hidden="true" className="h-[24px] w-auto sm:h-[28px] md:h-[32px]" />
                  <span className="text-xl font-bold tracking-tight">HYPER3D</span>
                </span>
                <p className="mt-3 text-sm text-white/45">hello@deemos.com</p>
                <div className="mt-4 flex items-center gap-4 text-white/50">
                  <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="transition-colors hover:text-white">
                    <Twitter className="size-4" aria-hidden="true" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="transition-colors hover:text-white">
                    <Youtube className="size-4" aria-hidden="true" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-white">
                    <Linkedin className="size-4" aria-hidden="true" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-white">
                    <Instagram className="size-4" aria-hidden="true" />
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord" className="transition-colors hover:text-white">
                    <MessageCircle className="size-4" aria-hidden="true" />
                  </a>
                  <a href="https://twitch.tv" target="_blank" rel="noreferrer" aria-label="Twitch" className="transition-colors hover:text-white">
                    <Twitch className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
              {(
                [
                  {
                    heading: "PRODUCT",
                    links: [
                      ["Rodin", () => toast.info("Rodin", { description: "You are in it — the Rodin workspace." })],
                      ["ChatAvatar", () => toast.info("ChatAvatar", { description: "A separate reference product — not part of this clone." })],
                    ],
                  },
                  {
                    heading: "FEATURES",
                    links: [
                      ["Text to 3D", () => toast.info("Text to 3D", { description: "Available in the workspace — switch the input card to text mode." })],
                      ["Image to 3D", () => toast.info("Image to 3D", { description: "The workspace's default mode — drop an image on the input card." })],
                      ["AI Video Generator", () => toast.info("AI Video Generator", { description: "Reference-parity chrome — not part of this clone." })],
                      ["AI Image Generator", () => toast.info("AI Image Generator", { description: "Reference-parity chrome — not part of this clone." })],
                      ["OmniCraft", () => toast.info("OmniCraft", { description: "A separate reference product — not part of this clone." })],
                    ],
                  },
                  {
                    heading: "PLUG-INS",
                    links: [
                      ["Blender", stubToast("Blender")],
                      ["Unreal", stubToast("Unreal")],
                      ["Unity", stubToast("Unity")],
                      ["Godot", stubToast("Godot")],
                      ["C4D", stubToast("C4D")],
                      ["Maya", stubToast("Maya")],
                      ["OV/Isaac", stubToast("OV/Isaac")],
                    ],
                  },
                  {
                    heading: "LEGAL",
                    links: [
                      ["Privacy", stubToast("Privacy")],
                      ["Terms", stubToast("Terms")],
                    ],
                  },
                ] as { heading: string; links: [string, () => void][] }[]
              ).map((col) => (
                <nav key={col.heading} aria-label={col.heading}>
                  <h3 className="text-xs font-bold tracking-widest text-white/80">{col.heading}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map(([label, onClick]) => (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={onClick}
                          className="text-sm text-white/45 transition-colors hover:text-white/85"
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <p className="mx-auto mt-12 w-full max-w-[1280px] border-t border-white/8 pt-6 text-xs text-white/35">
              © 2026 Deemos Corporation. All rights reserved.
            </p>
          </footer>
        </div>
      ) : (
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* ---------- left sidebar (dashboard) ---------- */}
        <aside
          className="h3d-scroll w-full shrink-0 space-y-5 border-b border-white/8 p-4 sm:p-5 lg:w-[330px] lg:overflow-y-auto lg:border-b-0 lg:border-r"
          aria-label="Generation controls"
        >
          {/* version selector (reference workspace header) */}
          <fieldset>
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Version</legend>
            <div
              className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
              role="radiogroup"
              aria-label="Generator version"
            >
              {GEN_VERSIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={genVersion === v.id}
                  onClick={() => {
                    setGenVersion(v.id);
                    if (v.id === "gen-1.5") setAgentic(false);
                  }}
                  className={cn(
                    "min-h-11 rounded-lg px-2 text-center transition-colors",
                    genVersion === v.id ? "bg-h3d-purple/25 text-white" : "text-white/50 hover:text-white",
                  )}
                >
                  <span className="block text-xs font-semibold">{v.label}</span>
                  <span className="block font-mono text-[9px] text-white/40">{genVersion === v.id ? v.note : "\u00a0"}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Mode</legend>
            <div className="space-y-1.5">
              {GEN_MODES.map((m) => {
                const Icon = MODE_ICONS[m.id];
                const active = mode === m.id;
                const live = GENERATING_MODES.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                      active
                        ? "border-h3d-purple/55 bg-h3d-purple/12 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white",
                    )}
                  >
                    <Icon className={cn("size-4.5 shrink-0", active && "text-h3d-purple")} />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {m.label}
                        {!live && (
                          <span className="rounded border border-h3d-gold/40 px-1 font-mono text-[8px] uppercase text-h3d-gold">
                            soon
                          </span>
                        )}
                      </span>
                      {active && <span className="block text-[11px] leading-tight text-h3d-muted">{m.hint}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* agentic toggle (Gen-2.5 only — agentic shipped with the 2.5 line) */}
          {agenticAvailable ? (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Zap className={cn("size-4", agentic ? "text-h3d-gold" : "text-white/40")} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-white">Agentic Mode</p>
                  <p className="font-mono text-[10px] text-h3d-muted">
                    {agentic ? "10 credits · effort picker on generate" : "0.5–1 credit · fast pass"}
                  </p>
                </div>
              </div>
              <Switch
                checked={agentic}
                onCheckedChange={setAgentic}
                aria-label="Toggle agentic generation mode"
                className="data-[state=checked]:bg-h3d-purple"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 opacity-60">
              <Zap className="size-4 text-white/30" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-white/60">Agentic Mode</p>
                <p className="font-mono text-[10px] text-white/35">Gen-2.5 line only — switch the version to enable</p>
              </div>
            </div>
          )}

          {/* effort / quality — the same picker surface as the reference's
              Model Selection popover (segmented control, no engine jargon) */}
          {genVersion === "gen-1.5" ? (
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-h3d-muted">Quality</Label>
              <div
                className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
                role="radiogroup"
                aria-label="Gen-1.5 quality"
              >
                {LEGACY_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={legacyMode === m.id}
                    onClick={() => setLegacyMode(m.id)}
                    className={cn(
                      "min-h-11 rounded-lg px-2 text-center transition-colors",
                      legacyMode === m.id ? "bg-h3d-purple/25 text-white" : "text-white/50 hover:text-white",
                    )}
                  >
                    <span className="block text-xs font-semibold">{m.label}</span>
                    <span className="block text-[9px] text-white/40">{m.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-h3d-muted">Thinking Effort</Label>
              <button
                type="button"
                className="min-h-9 text-[11px] font-semibold text-h3d-violet underline-offset-2 hover:underline"
                onClick={() => setModelPopoverOpen(true)}
              >
                {effortInfo.label} · ~{effortInfo.seconds}s
              </button>
            </div>
            <div
              role="radiogroup"
              aria-label="Thinking effort"
              className="grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-black/25 p-1"
            >
              {EFFORTS.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={effortIndex === i}
                  onClick={() => setEffort(e.id)}
                  title={e.blurb}
                  className={cn(
                    "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 transition-colors",
                    effortIndex === i ? "bg-[#8b5cf6]/45 text-white" : "bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span className="text-center text-[9.5px] font-semibold leading-tight">
                    {e.id === "extreme-low" ? "XLow" : e.id === "extreme-high" ? "XHigh" : e.label}
                  </span>
                  <span className="text-[9px] text-white/40">~{e.seconds}s</span>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* upload strip summary (image mode) — the strip is the single
              upload source; each chip re-opens its direction popup */}
          {mode === "image-to-3d" && (
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-h3d-muted">Input images</Label>
              {stripImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stripImages.map((img, i) => (
                    <div key={img.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => setOriPopupFor(img.id)}
                        className="block h-[72px] w-[72px] overflow-hidden rounded-xl border border-white/15 transition-colors hover:border-white/35"
                        title={`${img.name} — ${DIRECTION_LABELS[img.direction]} view. Click to set the direction.`}
                        aria-label={`Image ${i + 1}, ${DIRECTION_LABELS[img.direction]} view. Select the direction of this image.`}
                      >
                        <img src={img.dataUrl} alt={`${img.name} — ${DIRECTION_LABELS[img.direction]} view`} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center text-[9px] font-semibold text-white/85 backdrop-blur-sm">
                          {DIRECTION_LABELS[img.direction]}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove image ${i + 1}`}
                        onClick={() => setStripImages((imgs) => imgs.filter((x) => x.id !== img.id))}
                        className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full border border-white/20 bg-black/85 text-white/85 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        <X className="size-2.5" aria-hidden="true" />
                      </button>
                      {i === 0 && analyzing && (
                        <span className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-full bg-black/70">
                          <Loader2 className="size-2.5 animate-spin text-white/85" aria-label="Analyzing reference" />
                        </span>
                      )}
                    </div>
                  ))}
                  <label
                    htmlFor="studio-upload"
                    className="flex h-[72px] w-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 text-white/40 transition-colors hover:border-h3d-purple/50 hover:text-white/70"
                    title="Add another view"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="text-[9px] font-medium">Add view</span>
                  </label>
                </div>
              ) : (
                <label
                  ref={dragRef}
                  htmlFor="studio-upload"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center transition-colors hover:border-h3d-purple/50 hover:bg-h3d-purple/6"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) void handleFiles(files);
                  }}
                >
                  <Upload className="size-5 text-h3d-purple" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/75">Drop images or click to upload</span>
                  <span className="text-[10px] text-white/35">.png · .jpg · .webp — the first image is auto-captioned</span>
                </label>
              )}
              <input
                id="studio-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) void handleFiles(files);
                  e.target.value = "";
                }}
              />
              {caption && caption.palette.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2">
                  <Palette className="size-3.5 text-h3d-purple" aria-hidden="true" />
                  {caption.palette.slice(0, 6).map((hex) => (
                    <span
                      key={hex}
                      title={hex}
                      className="size-4 rounded-full border border-white/25"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <span className="text-[10px] text-white/45">
                    {caption.components.length} components · {caption.form}
                  </span>
                </div>
              )}
              <p className="text-[10px] leading-relaxed text-white/35">
                Click a thumbnail to set its direction — Unknown is fine, one image is enough.
              </p>
            </div>
          )}

          {/* creation mode (WorldGen tab — reference selector) */}
          {mode === "worldgen" && (
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Creation Mode</Label>
              <div className="space-y-1.5" role="radiogroup" aria-label="Creation mode">
                {CREATION_MODES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={creationMode === c.id}
                    onClick={() => setCreationMode(c.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all",
                      creationMode === c.id
                        ? "border-h3d-purple/55 bg-h3d-purple/12 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/65 hover:border-white/20 hover:text-white",
                    )}
                  >
                    <Layers className={cn("size-4 shrink-0", creationMode === c.id && "text-h3d-purple")} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{c.label}</span>
                      <span className="block truncate font-mono text-[10px] text-white/40">{c.blurb}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* prompt + presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="studio-prompt" className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                Prompt {upload && <span className="text-white/35">(optional guidance)</span>}
              </Label>
              <button
                type="button"
                aria-expanded={presetsOpen}
                onClick={() => setPresetsOpen((v) => !v)}
                className="flex min-h-9 items-center gap-1 font-mono text-[11px] text-h3d-violet underline-offset-2 hover:underline"
              >
                <Sparkles className="size-3" aria-hidden="true" /> Presets
              </button>
            </div>
            {presetsOpen && (
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPrompt(p.prompt);
                      setEffort(p.effort);
                      setPresetsOpen(false);
                      toast.success(`Preset applied — ${p.label}`, { description: `${p.effort} effort suggested.` });
                    }}
                    className="min-h-9 rounded-full border border-white/12 bg-white/[0.04] px-2.5 font-mono text-[10px] text-white/75 transition-colors hover:border-h3d-purple/50 hover:bg-h3d-purple/12 hover:text-white"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <Textarea
              id="studio-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={PROMPT_PLACEHOLDERS[mode]}
              rows={4}
              className="resize-none border-white/12 bg-white/4 text-sm placeholder:text-white/40"
            />
          </div>

          {/* material selector (reference Gen-2.5 API surface) */}
          <div className="space-y-2">
            <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Material</Label>
            <div
              className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
              role="radiogroup"
              aria-label="Material pass"
            >
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={material === m.id}
                  onClick={() => setMaterial(m.id)}
                  title={m.blurb}
                  className={cn(
                    "min-h-11 rounded-lg px-1 text-center transition-colors",
                    material === m.id ? "bg-h3d-purple/25 text-white" : "text-white/50 hover:text-white",
                  )}
                >
                  <span className="block text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="font-mono text-[9px] text-white/30">
              {MATERIALS.find((m) => m.id === material)?.blurb}
              {material === "none" && " — the neural pipeline skips its texture pass."}
            </p>
          </div>

          {/* engine tier + seed + generate */}
          <div className="space-y-2 pt-1">
            {mode === "image-to-3d" && !agentic && (
              <div
                className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1"
                role="radiogroup"
                aria-label="Engine tier"
              >
                {([
                  { id: "quality", label: "Quality", hint: "neural · ~1-2 min" },
                  { id: "fast", label: "Fast", hint: "lathe · ~15s" },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={tier === t.id}
                    onClick={() => setTier(t.id)}
                    className={cn(
                      "flex min-h-11 flex-1 flex-col items-center justify-center rounded-lg px-2 transition-colors",
                      tier === t.id ? "bg-h3d-purple/25 text-white" : "text-white/50 hover:text-white",
                    )}
                  >
                    <span className="text-xs font-semibold">{t.label}</span>
                    <span className="font-mono text-[9px] text-white/40">{t.hint}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="studio-seed"
                className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-h3d-muted"
              >
                <Dices className="size-3.5" aria-hidden="true" />
                Seed
              </Label>
              <input
                id="studio-seed"
                type="number"
                min={0}
                max={65535}
                value={seed}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSeed(Number.isFinite(n) ? Math.max(0, Math.min(65535, Math.floor(n))) : 0);
                  setLockSeed(true);
                }}
                className="h-10 min-w-0 flex-1 rounded-lg border border-white/12 bg-white/4 px-2.5 font-mono text-xs text-white/85 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={lockSeed ? "Seed locked — click to randomize each run" : "Seed randomizes each run — click to lock"}
                aria-pressed={lockSeed}
                title={lockSeed ? "Locked — click to randomize" : "Random each run — click to lock"}
                onClick={() => {
                  if (lockSeed) {
                    setLockSeed(false);
                  } else {
                    setLockSeed(true);
                  }
                }}
                className={cn("size-10 shrink-0 border-white/12 bg-white/4", lockSeed && "border-h3d-purple/60 bg-h3d-purple/15")}
              >
                <Dices className={cn("size-4", lockSeed ? "text-h3d-purple" : "text-white/50")} aria-hidden="true" />
              </Button>
            </div>
            {/* private task + batch size (reference input-card rows) */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <Eye className={cn("size-4 shrink-0", isPrivate ? "text-h3d-purple" : "text-white/40")} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Private</p>
                  <p className="truncate font-mono text-[10px] text-h3d-muted">
                    {isPrivate ? "hidden from the public gallery" : "visible in the gallery (default)"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                aria-label="Toggle private task"
                className="data-[state=checked]:bg-h3d-purple"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                toast.info("Batch is a Business plan feature", {
                  description: `The reference gates fast-mode batch (up to ${BATCH_MAX} variations/run, pay only for what you download) to the Business plan — the Free workspace keeps batch size 1, as does this clone (honest gate).`,
                  duration: 8000,
                })
              }
              className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-left opacity-70 transition-colors hover:border-white/20"
              aria-label="Batch size — Business plan feature"
            >
              <span className="flex items-center gap-2">
                <Layers className="size-4 text-white/35" aria-hidden="true" />
                <span className="text-sm font-medium text-white/70">Batch size 1</span>
              </span>
              <span className="rounded border border-h3d-gold/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-h3d-gold">Business</span>
            </button>
            {neuralBusy && (
              <div className="flex items-center gap-2 rounded-lg border border-h3d-purple/30 bg-h3d-purple/8 px-3 py-2">
                <Loader2 className="size-3.5 shrink-0 animate-spin text-h3d-purple" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-white/85">{neuralMessage ?? "Working…"}</p>
                  <p className="font-mono text-[10px] text-white/40">{neuralElapsed.toFixed(1)}s · Hunyuan3D-2.1</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelNeural}
                  className="h-8 shrink-0 border-white/15 bg-white/5 px-2.5 font-mono text-[10px] text-white/75"
                >
                  Cancel
                </Button>
              </div>
            )}
            {user && mine.length === 0 && (
              <p className="rounded-lg border border-h3d-gold/30 bg-h3d-gold/10 px-3 py-2 font-mono text-[11px] text-h3d-gold">
                Free preview — your first generation charges no credits
              </p>
            )}
            {/* ControlNet applied-state chip (working sidebar): the constraint
                stays editable while the empty-state input cluster is hidden —
                reopen the editor or remove it from here. */}
            {controlnet && (
              <button
                type="button"
                onClick={() => {
                  setControlnetTab(controlnet.mode);
                  setControlnetOpen(true);
                }}
                aria-label={`ControlNet constraint applied, ${(() => { const c = deriveConstraints(controlnet); return c ? c.aspect.map((a) => Math.round(a)).join(" × ") : ""; })()} — click to edit`}
                className="flex w-full items-center gap-2 rounded-xl border border-h3d-violet/40 bg-h3d-violet/10 px-3 py-2 text-left transition-colors hover:border-h3d-violet/70"
              >
                <Box className="size-4 shrink-0 text-h3d-violet" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-white/85">ControlNet applied</span>
                  <span className="block font-mono text-[10px] text-white/45">
                    {(() => {
                      const c = deriveConstraints(controlnet);
                      return c ? `${c.aspect.map((a) => Math.round(a)).join(" × ")} · ${Math.round(c.fill * 100)}% · ${c.anchors} anchor${c.anchors === 1 ? "" : "s"}` : "";
                    })()}
                  </span>
                </span>
                <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                  Edit
                </span>
              </button>
            )}
            <Button
              className="relative h-12 w-full overflow-hidden rounded-full h3d-gradient-primary text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(217,70,239,0.35)] hover:opacity-90"
              onClick={handleGenerate}
              disabled={creating || generating || analyzing}
            >
              {creating || generating || analyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Working…
                </>
              ) : (
                <>
                  <Wand2 className="size-4" /> {generateLabel}
                </>
              )}
            </Button>
            <p className="text-center font-mono text-[10px] text-white/35">
              {user
                ? `${user.balance} credits in wallet · agentic = 10 credits`
                : "sign in to generate — first preview is free"}
            </p>
          </div>
        </aside>

        {/* ---------- center: viewer ---------- */}
        <main
          className={cn("flex min-w-0 flex-1 flex-col lg:overflow-hidden", emptyStudio && "hidden")}
          aria-label="3D viewer and render"
        >
          <div className="relative min-h-[52vh] flex-1 lg:min-h-0">
            {GENERATING_MODES.includes(mode) ? (
              <ModelViewer
                ref={viewerRef}
                url={viewerUrl}
                textureMode={textureMode}
                autoRotate={autoRotate}
                onStats={setPolys}
                onLoaded={setViewerReady}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6">
                <div className="h3d-glass max-w-md rounded-2xl p-6 text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-xl h3d-gradient-primary">
                    {mode === "worldgen" ? <Globe className="size-6 text-white" aria-hidden="true" /> : <PencilRuler className="size-6 text-white" aria-hidden="true" />}
                  </span>
                  <h2 className="font-display mt-4 text-lg font-semibold text-white">
                    {GEN_MODES.find((m) => m.id === mode)?.label} — coming soon in this clone
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-h3d-muted">
                    This build implements the real Image-to-3D and Text-to-3D pipelines. {mode === "worldgen" ? "World generation" : "Part-based editing"} is
                    documented as a deviation and is intentionally not faked here.
                  </p>
                </div>
              </div>
            )}

            {/* texture modes + auto-rotate overlays (only when a model is live) */}
            {viewerUrl && GENERATING_MODES.includes(mode) && (
              <>
                <div className="absolute left-3 top-3 flex gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
                  {TEXTURE_MODES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={textureMode === t.id}
                      onClick={() => setTextureMode(t.id)}
                      className={cn(
                        "min-h-9 rounded-full px-3 text-xs font-medium transition-colors",
                        textureMode === t.id ? "bg-h3d-purple/25 text-white" : "text-white/55 hover:text-white",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label={autoRotate ? "Pause auto-rotate" : "Resume auto-rotate"}
                  aria-pressed={autoRotate}
                  onClick={() => setAutoRotate((v) => !v)}
                  className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/75 backdrop-blur-md transition-colors hover:text-white"
                >
                  {autoRotate ? <Pause className="size-4" aria-hidden="true" /> : <RotateCw className="size-4" aria-hidden="true" />}
                </button>
              </>
            )}

            {/* model meta chip */}
            {viewerUrl && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
                <Boxes className="size-3.5 text-h3d-purple" aria-hidden="true" />
                <span className="max-w-40 truncate font-display text-xs font-semibold text-white sm:max-w-56">
                  {modelName}
                </span>
                {polys > 0 && (
                  <span className="hidden items-center gap-1 font-mono text-[10px] text-h3d-muted sm:flex">
                    <Triangle className="size-2.5 fill-h3d-purple/60 text-h3d-purple/60" aria-hidden="true" />
                    {polys.toLocaleString("en-US")} tris
                  </span>
                )}
              </div>
            )}

            {/* agentic progress overlay */}
            {generating && card && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                role="status"
                aria-live="polite"
              >
                <div className="h3d-glass-strong mx-4 w-full max-w-sm rounded-2xl p-5 sm:p-6">
                  <p className="font-display text-base font-semibold text-white">Generating your model</p>
                  <p className="mt-1 font-mono text-[11px] text-h3d-muted">
                    {card.type === "RodinAgentic" ? "Gen-2.5 Agentic" : "Gen-2.5 Standard"} · {effortInfo.label} effort · ~{effortInfo.seconds}s
                  </p>
                  <p className="mt-4 min-h-10 rounded-xl border border-h3d-purple/30 bg-h3d-purple/8 px-3 py-2.5 text-sm leading-snug text-h3d-violet">
                    {card.progress?.message ?? "I'm starting on your reference…"}
                  </p>
                  <div className="mt-5">
                    <Progress
                      value={card.progress?.percent ?? 5}
                      className="h-2 [&_[data-slot=progress-indicator]]:h3d-gradient-primary"
                    />
                    <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-h3d-muted">
                      <span>{card.progress?.percent ?? 5}%</span>
                      <span>step · {card.step}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ---------- right panel ---------- */}
        {/* NOTE: this aside must be a DIRECT child of the body flex-row (a
            sibling of <main>), not nested inside it — nested, its 1200px+
            shrink-0 content stacked under the viewer and crushed the
            flex-basis-0 viewer to 0px on lg screens. */}
        <aside
          className={cn(
            "h3d-scroll w-full shrink-0 space-y-4 border-t border-white/8 p-4 sm:p-5 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l",
            emptyStudio && "hidden",
          )}
          aria-label="Model details and export"
        >
            <div className="h3d-glass rounded-2xl p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Task</p>
              <h3 className="font-display mt-1.5 truncate text-lg font-semibold text-white">{modelName}</h3>
              <dl className="mt-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">state</dt>
                  <dd className="text-h3d-violet">{card?.user_state ?? "idle"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">version</dt>
                  <dd className="text-h3d-violet">{GEN_VERSION}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">elapsed</dt>
                  <dd className="text-white/80">{card?.usage?.elapsed_seconds?.toFixed(1) ?? "—"}s</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">tokens</dt>
                  <dd className="text-white/80">{card?.usage?.used_tokens?.toLocaleString("en-US") ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/40">triangles</dt>
                  <dd className="text-white/80">{viewerReady ? polys.toLocaleString("en-US") : "—"}</dd>
                </div>
                {cardSettings.engine_used && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/40">engine</dt>
                    <dd
                      className={cn(
                        "font-mono",
                        cardSettings.engine_used === "neural" ? "text-h3d-violet" : "text-h3d-gold",
                      )}
                    >
                      {cardSettings.engine_used}
                      {cardSettings.fallback_reason ? " (fallback)" : ""}
                    </dd>
                  </div>
                )}
                {typeof cardSettings.seed === "number" && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-white/40">seed</dt>
                    <dd className="text-white/80">{cardSettings.seed}</dd>
                  </div>
                )}
              </dl>
            </div>

            {complete && card?.image_url && (
              <div className="h3d-glass rounded-2xl p-4">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Server render</p>
                <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <SmartImage
                    src={card.image_url}
                    alt="Server-rendered poster of the generated model"
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/35">
                  Rasterized server-side from the exported geometry.
                </p>
              </div>
            )}

            <div className="h3d-glass rounded-2xl p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Export</p>
              {needsConfirm ? (
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-h3d-gold/30 bg-h3d-gold/8 p-3">
                    <p className="text-sm font-medium text-white/90">Preview is free — confirm to export</p>
                    <p className="mt-1 font-mono text-[10px] leading-relaxed text-white/45">
                      Pay-by-result: generation and the 3D preview cost nothing. Confirming charges
                      exactly 1 credit and unlocks all downloads for this model.
                    </p>
                  </div>
                  <Button
                    className="h-12 w-full h3d-gradient-primary text-sm font-bold text-white"
                    onClick={() => void handleConfirm()}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Confirming…
                      </>
                    ) : (
                      <>
                        <Coins className="size-4" aria-hidden="true" /> Confirm & Export — 1 credit
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {EXPORT_FORMATS.map((f) => (
                      <Button
                        key={f}
                        variant="outline"
                        size="sm"
                        className="min-h-11 border-white/12 bg-white/4 font-mono text-xs font-medium text-white/85 hover:border-h3d-purple/50 hover:bg-h3d-purple/12"
                        disabled={!complete}
                        title={complete ? `${f} — ${FORMAT_USES[f]}` : "Available when the model is ready"}
                        onClick={() => {
                          if (!activeTask) return;
                          const a = document.createElement("a");
                          a.href = `/api/task/${activeTask}/export?format=${f.toLowerCase()}`;
                          a.download = `${activeTask}.${f.toLowerCase()}`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          toast.success(`Downloading ${f}`, {
                            description: `${modelName}.${f.toLowerCase()} — real file from the export endpoint.`,
                          });
                        }}
                      >
                        <Download className="size-3.5 text-h3d-purple" aria-hidden="true" />
                        {f}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 min-h-11 w-full border-white/12 bg-white/4 font-mono text-xs font-medium text-white/85 hover:border-h3d-purple/50 hover:bg-h3d-purple/12"
                    disabled={!complete || !viewerReady || turntableRecording}
                    title={complete ? "Turntable WebM — one full orbit recorded from the live viewer" : "Available when the model is ready"}
                    onClick={() => void recordTurntable()}
                  >
                    {turntableRecording ? <Loader2 className="size-3.5 animate-spin text-h3d-purple" aria-hidden="true" /> : <Video className="size-3.5 text-h3d-purple" aria-hidden="true" />}
                    {turntableRecording ? "Recording orbit…" : "Turntable · WebM"}
                  </Button>
                </>
              )}

              {/* redos (reference task-card surface, quota-gated) */}
              {complete && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 border-white/12 bg-white/4 font-mono text-[11px] font-medium text-white/85 hover:border-h3d-purple/50 hover:bg-h3d-purple/12"
                    disabled={redoBusy !== null || redoQuota.geometry <= 0}
                    title={redoQuota.geometry > 0 ? "Re-generate the geometry with a fresh seed — a new free preview" : "Geometry redo quota exhausted"}
                    onClick={() => void handleRedo("geometry")}
                  >
                    {redoBusy === "geometry" ? <Loader2 className="size-3.5 animate-spin text-h3d-purple" aria-hidden="true" /> : <RotateCw className="size-3.5 text-h3d-purple" aria-hidden="true" />}
                    {redoLabel("geometry", redoQuota.geometry)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11 border-white/12 bg-white/4 font-mono text-[11px] font-medium text-white/85 hover:border-h3d-purple/50 hover:bg-h3d-purple/12"
                    disabled={redoBusy !== null || redoQuota.material <= 0 || !lastMeshBytesRef.current || !upload}
                    title={
                      lastMeshBytesRef.current && upload
                        ? "Re-paint the material from your reference image (in-browser)"
                        : "Material redo runs in-browser on the live neural mesh — generate with the neural engine in this session first"
                    }
                    onClick={() => void handleRedo("material")}
                  >
                    {redoBusy === "material" ? <Loader2 className="size-3.5 animate-spin text-h3d-purple" aria-hidden="true" /> : <Palette className="size-3.5 text-h3d-purple" aria-hidden="true" />}
                    {redoLabel("material", redoQuota.material)}
                  </Button>
                </div>
              )}
              {!complete && (
                <p className="mt-2 font-mono text-[10px] text-white/35">Exports unlock when the preview is ready.</p>
              )}
            </div>

            <div className="h3d-glass rounded-2xl p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Cost</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/85">
                  <Coins className="size-4 text-h3d-gold" aria-hidden="true" />
                  {neuralTier
                    ? "Free preview · 1 credit on confirm"
                    : agentic
                      ? "10 credits / agentic"
                      : mine.length === 0
                        ? "Free preview"
                        : "1 credit / standard"}
                </span>
                {user && (
                  <span className="rounded-full h3d-gradient-primary px-2.5 py-1 font-mono text-[10px] font-semibold text-white">
                    {user.balance} left
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-h3d-muted">
                {user
                  ? "Quality (neural) generations are pay-by-result: preview free, 1 credit to export. Standard generations cost 1 credit; Agentic Mode costs 10."
                  : "Guests can browse — sign in to generate (first preview is free)."}
              </p>
              <p className="mt-2 border-t border-white/8 pt-2 font-mono text-[9px] leading-relaxed text-white/30">
                {NEURAL_ATTRIBUTION}
              </p>
            </div>
          </aside>
      </div>
      )}

      {/* ---------- asset rail (dashboard state only — the empty landing has
          its own ASSET section in the page flow) ---------- */}
      {!emptyStudio && (
      <footer
        className="h3d-scroll flex h-[108px] shrink-0 items-center gap-4 overflow-x-auto border-t border-white/8 bg-[#16121c]/70 px-4 backdrop-blur-md"
        aria-label="Task gallery"
      >
        <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/4 p-1" role="tablist" aria-label="Gallery filter">
          {(["mine", "featured"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={rail === tab}
              className={cn(
                "min-h-9 rounded-lg px-3 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
                rail === tab ? "bg-h3d-purple/20 text-white" : "text-white/50 hover:text-white",
              )}
              onClick={() => setRail(tab)}
            >
              {tab === "mine" ? "Asset" : "Explore"}
            </button>
          ))}
        </div>
        <TaskRail
          rail={rail}
          tasks={railTasks}
          activeTaskId={activeTask}
          onSelect={openRailTask}
          onRefresh={() => (rail === "mine" ? void refreshMine() : void refreshFeatured())}
        />
      </footer>
      )}

      {/* Model Selection popover — the reference's shared option picker
          (controls-row pills + settings icon all open this one panel;
          picking applies immediately, no confirm step) */}
      {modelPopoverOpen && (
        <ModelSelectionPopover
          genVersion={genVersion}
          effort={effort}
          legacyMode={legacyMode}
          onPickEffort={(e) => {
            setEffort(e);
            setGenVersion("gen-2.5");
            setModelPopoverOpen(false);
          }}
          onPickLegacy={(m) => {
            setLegacyMode(m);
            setGenVersion("gen-1.5");
            setAgentic(false);
            setModelPopoverOpen(false);
          }}
          onClose={() => setModelPopoverOpen(false)}
        />
      )}

      {/* orientation popup — per-image direction picker (strip thumbnails) */}
      {oriPopupFor && stripImages.find((i) => i.id === oriPopupFor) && (
        <OrientationPopup
          imageLabel={stripImages.find((i) => i.id === oriPopupFor)!.name}
          direction={stripImages.find((i) => i.id === oriPopupFor)!.direction}
          onPick={(dir) => {
            setStripImages((imgs) => imgs.map((i) => (i.id === oriPopupFor ? { ...i, direction: dir } : i)));
            setOriPopupFor(null);
          }}
          onClose={() => setOriPopupFor(null)}
        />
      )}

      {/* Presets modal — the reference GENERATE-row Presets panel
          (mounted only while open) */}
      {refPresetsOpen && (
        <PresetsModal
          onClose={() => setRefPresetsOpen(false)}
          prompt={prompt}
          onPromptChange={setPrompt}
          captionOverride={captionOverride}
          onCaptionOverrideChange={setCaptionOverride}
          geometry={presetGeometry}
          onGeometryChange={setPresetGeometry}
          onGenerate={() => handleGenerate()}
        />
      )}

      {/* remix modal — the reference per-image Remix panel (compact): style
          pills + free-text edit; Replace/Append are prompt-driven (honest —
          the reference image is kept, the style/text feeds generation) */}
      {remixFor && stripImages.find((i) => i.id === remixFor) && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setRemixFor(null)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Remix"
            className="fixed left-1/2 top-1/2 z-[91] flex w-[min(339px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-[25px] border-2 border-white/12 bg-[rgba(255,255,255,0.05)] p-4 pt-3 backdrop-blur-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Remix</h2>
              <button
                type="button"
                aria-label="Close remix"
                onClick={() => setRemixFor(null)}
                className="flex size-6 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[17px]">
              <img
                src={stripImages.find((i) => i.id === remixFor)!.dataUrl}
                alt="Reference to remix"
                className="h-[150px] w-full object-cover"
              />
              <button
                type="button"
                aria-label="Remove this image"
                title="Remove this image"
                onClick={() => {
                  setStripImages((imgs) => imgs.filter((i) => i.id !== remixFor));
                  setRemixFor(null);
                }}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/85 hover:text-white"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
            <input
              value={remixText}
              onChange={(e) => setRemixText(e.target.value)}
              placeholder="You can enter text to edit this image..."
              aria-label="Remix instructions"
              className="h-10 w-full rounded-full border border-white/12 bg-black/30 px-4 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/30"
            />
            <div className="flex flex-wrap gap-1.5">
              {["Back-view", "Side-view", "Clay", "Anime", "Brick", "Voxel", "Toy", "Fuse"].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={remixStyle === s}
                  onClick={() => setRemixStyle(remixStyle === s ? null : s)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
                    remixStyle === s
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemixFor(null)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-[12px] font-semibold text-white/75 transition-colors hover:bg-white/10"
              >
                Append
              </button>
              <button
                type="button"
                onClick={() => {
                  const tag = [remixText.trim(), remixStyle].filter(Boolean).join(", ");
                  if (tag) setPrompt((p) => (p.trim() ? `${p.trim()}, ${tag}` : tag));
                  setRemixFor(null);
                  toast.success("Remix applied", {
                    description: "The style and instructions now guide the generation — the reference image stays unchanged.",
                  });
                }}
                className="rounded-full bg-[linear-gradient(126.18deg,#00d8d5_1.15%,#ffd325_92.97%)] px-4 py-1.5 text-[12px] font-bold text-[#17181c] transition-opacity hover:opacity-90"
              >
                Replace
              </button>
            </div>
            <p className="text-center text-[10px] leading-snug text-white/35">
              Styles apply to the generation prompt — the reference image is kept as-is.
            </p>
          </div>
        </>
      )}

      {/* effort modal (blueprint §2.3) */}
      <EffortModal
        open={effortModalOpen}
        onOpenChange={(open) => setEffortModalOpen(open)}
        onSelect={(selected) => {
          setEffort(selected);
          setAgenticModalShown(true);
          setEffortModalOpen(false);
          void createTask(selected);
        }}
      />

      {/* Connect Hyper3D MCP modal (topbar affordance, 2026-10-27 recon) */}
      <McpConnectModal open={mcpConnectOpen} onOpenChange={(open) => setMcpConnectOpen(open)} />

      {/* ControlNet constraint editor (reference's three spatial-conditioning
          tabs — Bounding Box / Voxel / Point Cloud, 2026-10-28 recon) */}
      <ControlnetModal
        open={controlnetOpen}
        onOpenChange={(open) => setControlnetOpen(open)}
        initialTab={controlnetTab}
        state={controlnet}
        onApply={(next) => {
          setControlnet(next);
          if (next) {
            const c = deriveConstraints(next);
            if (c) {
              toast.success("ControlNet constraint applied", {
                description: `Proportions ${c.aspect.map((a) => Math.round(a)).join(" × ")} · ${Math.round(c.fill * 100)}% occupancy · ${c.anchors} anchor${c.anchors === 1 ? "" : "s"} — shaping the next generation.`,
              });
            }
          } else {
            toast.info("ControlNet constraint removed", {
              description: "Generations run unconstrained again.",
            });
          }
        }}
      />

      {/* floating Feedback button (reference bottom-right chrome — the cookie
          card overlays it until accepted, exactly like the reference guest).
          UX-recon (agent-walked): the reference's Feedback opens a chat
          widget — "Chat with us" / "Notifications" tabs + message form. */}
      <button
        type="button"
        onClick={() => setChatOpen((v) => !v)}
        aria-expanded={chatOpen}
        aria-label="Feedback — chat with us"
        className="absolute bottom-6 right-6 z-30 flex h-12 items-center gap-2 rounded-full border border-white/12 bg-[#221d27]/90 px-5 text-sm font-semibold text-white/85 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors hover:border-white/30 hover:text-white"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Feedback
      </button>

      {/* chat widget (reference: Feedback → Chat with us / Notifications
          tabs + message form w/ Submit) */}
      {chatOpen && (
        <div
          role="dialog"
          aria-label="Chat with us"
          className="absolute bottom-20 right-6 z-40 flex w-[300px] flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[#17181c]/95 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <div className="flex border-b border-white/10" role="tablist" aria-label="Support">
            {(["Chat with us", "Notifications"] as const).map((t, i) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={i === 0}
                className={cn(
                  "flex-1 py-2.5 text-xs font-bold transition-colors",
                  i === 0 ? "border-b-2 border-[#d2b6df] text-white" : "text-white/50 hover:text-white/80",
                )}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setChatOpen(false)}
              className="px-3 text-white/50 transition-colors hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3.5">
            <p className="text-[11px] leading-relaxed text-white/55">
              Hi! This clone's support channel is this honest notice — the workspace itself is fully wired.
            </p>
            <textarea
              aria-label="Message"
              placeholder="Type your message…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-white/25"
            />
            <button
              type="button"
              onClick={() =>
                toast.info("Chat with us", { description: "The reference's live chat is not part of this clone — feedback stays local." })
              }
              className="h-9 rounded-full bg-[linear-gradient(112.97deg,#9ec9ff_4.67%,#ffaeb0_96%)] text-xs font-bold text-[#17181c]"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* membership pricing overlay (reference: Subscribe → full-screen view) */}
      {pricingOpen && <PricingOverlay onClose={() => setPricingOpen(false)} />}

      {/* asset detail overlay (reference: gallery tile click → asset view) */}
      {detailAsset && (
        <AssetDetail
          asset={detailAsset}
          onClose={() => setDetailAsset(null)}
          onToggleLike={
            detailAsset.uuid && user
              ? async (a) => {
                  try {
                    const res = await fetch(`/api/task/${a.uuid}/like`, { method: "POST" });
                    if (!res.ok) throw new Error("like failed");
                    const data = (await res.json()) as { liked: boolean; num_like: number };
                    /* keep the gallery tile in sync with the detail view */
                    setGallery((prev) =>
                      prev.map((g) => (g.uuid === a.uuid ? { ...g, liked: data.liked, likes: data.num_like } : g)),
                    );
                    setDetailAsset((prev) => (prev ? { ...prev, likes: data.num_like } : prev));
                    return data;
                  } catch {
                    toast.error("Could not update like", { description: "Please try again." });
                    return null;
                  }
                }
              : undefined
          }
        />
      )}

      {/* cookie preferences card (reference guest state — white card with the
          reference's purple top glow, deep-violet #4A00E0 Accept all /
          outline Preferences, centered title, bottom-right) */}
      {!cookieOk && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="absolute bottom-6 right-6 z-40 w-[340px] overflow-hidden rounded-2xl bg-white p-5 text-[#1f2023] shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
        >
          <span
            className="absolute inset-x-0 top-0 h-[4px] bg-[linear-gradient(103.48deg,#4a00e0_6.45%,#4a00e0_107.33%)] shadow-[0_0_14px_rgba(74,0,224,0.55)]"
            aria-hidden="true"
          />
          <p className="text-center text-base font-bold">Cookie preferences</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#4a4b52]">
            We use essential cookies to keep Hyper3D working and optional cookies to understand usage, improve the
            experience, and support relevant marketing.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => saveCookiePrefs(ALL_PREFS)}
              className="h-[38px] flex-1 rounded-lg bg-[#4a00e0] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={() => setCookiePrefsOpen(true)}
              className="h-[38px] flex-1 rounded-lg border border-[#c9c9cf] bg-white text-sm font-semibold text-[#1f2023] transition-colors hover:bg-[#f4f4f6]"
            >
              Preferences
            </button>
          </div>
        </div>
      )}

      {/* granular cookie preferences modal (reference: banner Preferences →
          "Manage cookie preferences" — Essential locked + Analytics /
          Personalization / Advertising toggles + Essential only / Save
          preferences actions) */}
      {cookiePrefsOpen && (
        <CookiePreferencesOverlay
          initialPrefs={ALL_PREFS}
          onSave={saveCookiePrefs}
          onClose={() => setCookiePrefsOpen(false)}
        />
      )}
    </div>
  );
}
