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
  ChevronDown,
  Coins,
  Compass,
  Dices,
  Download,
  Eye,
  Gem,
  Globe,
  Grid3x3,
  Heart,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  Lock,
  Palette,
  Pause,
  PencilRuler,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Triangle,
  Type,
  Upload,
  UserRound,
  Video,
  Wand2,
  X,
  Zap,
  Box,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "../smart-image";
import { EffortModal } from "./effort-modal";
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
} from "@/lib/direction-picker";
import { exportModel } from "@/lib/exporters";
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

/* Featured gallery tiles (reference ASSET section) — this clone's own demo
 * renders, honestly labelled. */
const FEATURED_TILES: { src: string; title: string; author: string; likes: number; hue: string }[] = [
  { src: "/images/gallery-mech.png", title: "Scout Mech", author: "Rodin Gen-2.5", likes: 48, hue: "#b98acf" },
  { src: "/images/gallery-helmet.png", title: "Legion Helmet", author: "Rodin Gen-2.5", likes: 35, hue: "#d2b6df" },
  { src: "/images/gallery-drone.png", title: "Cargo Drone", author: "Rodin Gen-1.5", likes: 27, hue: "#ca6650" },
  { src: "/images/gallery-creature.png", title: "Reef Creature", author: "Rodin Gen-2.5", likes: 41, hue: "#e6765d" },
  { src: "/images/gallery-sword.png", title: "Rune Blade", author: "Rodin Gen-1.5", likes: 22, hue: "#ecc16c" },
  { src: "/images/gallery-potions.png", title: "Potion Shelf", author: "Rodin Gen-2.5", likes: 31, hue: "#9e76ac" },
  { src: "/images/gallery-bike.png", title: "Trail Bike", author: "Rodin Gen-1.5", likes: 19, hue: "#d67830" },
  { src: "/images/gallery-chest.png", title: "Traveler Chest", author: "Rodin Gen-2.5", likes: 26, hue: "#c9b7cf" },
];

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
  onClose,
}: {
  initial: StudioInitial;
  user: UserInfo | null;
  onNeedAuth: (intent: string) => void;
  onSessionRefresh: () => void;
  onClose: () => void;
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
  const [redoBusy, setRedoBusy] = useState<"geometry" | "material" | null>(null);

  const [prompt, setPrompt] = useState(initial.prompt);
  const [upload, setUpload] = useState<{ dataUrl: string; name: string; file: File } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [caption, setCaption] = useState<CaptionResult | null>(null);

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

  const handleFile = useCallback(
    async (file: File) => {
      if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) {
        toast.error("Unsupported image", { description: "Use .png, .jpg or .webp reference images." });
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setUpload({ dataUrl, name: file.name, file });
      setCaption(null);
      setAnalyzing(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/task/rodin_mesh_image_process", { method: "POST", body: form });
        if (!res.ok) throw new Error(`analysis failed (${res.status})`);
        const result = (await res.json()) as CaptionResult;
        setCaption(result);
        if (result.prompt) setPrompt(result.prompt);
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
    [],
  );

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
      const promptText = prompt.trim();
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
    [user, prompt, upload, mode, agentic, agenticAvailable, neuralTier, tier, seed, lockSeed, extraViews, genVersion, legacyMode, material, isPrivate, creationMode, effectiveEffort, startPolling, runNeuralPipeline, onNeedAuth, onSessionRefresh],
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
     instead of the three-pane dashboard. */
  const emptyStudio = !viewerUrl && !card && !generating && !creating && !analyzing;

  /* floating tool panel on the empty landing (materials / presets / quality /
     directions) — the reference hides these behind icon rails + popovers */
  const [toolPanel, setToolPanel] = useState<null | "materials" | "presets" | "quality" | "directions">(null);

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
  const costChipLabel = !user
    ? "Sign in to start"
    : mine.length === 0
      ? "1 Credit"
      : agentic
        ? "10 Credits"
        : "1 Credit";

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex flex-col h3d-studio-bg" role="dialog" aria-label="Rodin Studio workspace">
      {/* reference top bar — HYPER3D + Subscribe (hover → 7-Day Trial) left,
          Add On / API / MCP&CLI / Login + globe right (DOM-extracted look). */}
      <header className="relative z-20 flex h-[81px] shrink-0 items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-white" aria-label="HYPER3D">
            <Boxes className="size-6" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">HYPER3D</span>
          </span>
          <button
            type="button"
            onClick={() =>
              toast.info("Subscribe", {
                description:
                  "The reference's paid tiers are not part of this clone — the demo wallet already covers every feature here (first generation free).",
              })
            }
            className="group relative flex h-[37px] w-[139px] items-center justify-center rounded-[30px] border border-white/15 bg-white/5 text-lg font-semibold transition-colors hover:border-white/25"
            aria-label="Subscribe (demo notice)"
          >
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-100 transition-opacity group-hover:opacity-0">
              Subscribe
            </span>
            <span className="h3d-grad-text-warm absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              7-Day Trial
            </span>
          </button>
        </div>
        <nav className="flex items-center gap-6" aria-label="Workspace">
          <button
            type="button"
            onClick={() =>
              toast.info("Add On", { description: "Add-ons live outside this clone's scope — the workspace itself is fully wired." })
            }
            className="hidden text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white xl:block"
          >
            Add On
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
            onClick={() =>
              toast.info("MCP&CLI", { description: "Not implemented in this clone — honest stub, same position as the reference." })
            }
            className="hidden text-lg font-semibold text-[#b0b0b0] transition-colors hover:text-white md:block"
          >
            MCP&amp;CLI
          </button>
          <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden="true" />
          {user ? (
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                <Coins className="size-3.5 text-h3d-gold" aria-hidden="true" />
                <span className="text-sm text-white">{user.balance}</span>
                <span className="text-[11px] text-white/40">credits</span>
              </span>
              <span
                className="flex size-9 items-center justify-center rounded-full border border-h3d-violet/50 bg-h3d-violet/20 text-sm font-semibold text-white"
                title={user.email}
              >
                {user.email.slice(0, 1).toUpperCase()}
              </span>
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
          <Globe className="size-[18px] text-[#b0b0b0] transition-colors hover:text-white" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close workspace and return to the landing page"
            title="Close workspace"
            className="flex size-9 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* atmosphere — the reference's three fixed gradient blobs (DOM-extracted
          geometry + gradients, blur(100px)) behind everything. */}
      <div className="h3d-blob z-0" style={{ left: "51%", top: "25%", width: 403, height: 403, background: "rgba(210, 181, 223, 0.34)" }} aria-hidden="true" />
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
              {(["Avatar", "3D", "Video"] as const).map((t) => (
                <button
                  key={t}
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
                  )}
                  aria-current={t === "3D" ? "page" : undefined}
                >
                  {t}
                  {t === "Video" && <ChevronDown className="size-3" aria-hidden="true" />}
                </button>
              ))}
            </nav>

            {/* hero — the reference's own animated SVG wordmark + version tabs + quotes */}
            <div className="mt-10 flex flex-col items-center sm:mt-[53px]">
              <RodinWordmark className="h-[49px] w-[213px] sm:h-[78px] sm:w-[356px] md:h-[85px] md:w-[391px] lg:h-[93px] lg:w-[427px]" />
              <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Generator version">
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
                    title={v.note}
                    className={cn(
                      "flex items-center gap-1.5 px-1 text-[12.8px] font-bold transition-colors",
                      genVersion === v.id ? "text-white" : "text-white/30 hover:text-white/70",
                    )}
                  >
                    {v.label}
                    {v.id === "gen-2.5" && <span className="ml-0.5 size-[5px] rounded-full bg-[#e65a4e]" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <div className="mt-[7px] flex flex-col items-center gap-1 text-sm text-[#cfcfcf]">
                <span>The best way to understand is to create.</span>
                <span>What I cannot create, I do not understand.</span>
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

              {/* the 180×180 input card (radius 20, black/18) */}
              <div className="relative h-[180px] w-[180px] overflow-hidden rounded-[20px] border border-white/8 bg-black/[0.18]">
                <p className="pt-3 text-center text-base font-bold text-white">
                  {mode === "editing-3d" ? "3D Editing" : mode === "worldgen" ? "WorldGen" : "Image to 3D"}
                </p>
                {GENERATING_MODES.includes(mode) ? (
                  mode === "image-to-3d" && !upload ? (
                    <label
                      htmlFor="workspace-upload"
                      className="absolute inset-x-0 bottom-[38px] top-[42px] flex cursor-pointer flex-col items-center justify-center gap-3 transition-colors hover:bg-white/[0.03]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) void handleFile(file);
                      }}
                    >
                      <span className="relative size-10" aria-hidden="true">
                        <span className="absolute left-1/2 top-1/2 h-[5px] w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                        <span className="absolute left-1/2 top-1/2 h-10 w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
                      </span>
                    </label>
                  ) : mode === "text-to-3d" ? (
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the item you want to generate..."
                      aria-label="Prompt"
                      className="absolute inset-x-2 bottom-[42px] top-[42px] resize-none bg-transparent text-sm text-[#ebebeb] outline-none placeholder:text-white/30"
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <img src={upload?.dataUrl} alt="Uploaded reference" className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/60 py-1.5 text-[10px] text-white/80 backdrop-blur-sm">
                        {analyzing ? (
                          <>
                            <Loader2 className="size-3 animate-spin" aria-hidden="true" /> analyzing…
                          </>
                        ) : (
                          "click ＋ to replace"
                        )}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="absolute inset-x-3 bottom-[42px] top-[42px] flex items-center justify-center rounded-lg border border-dashed border-white/12 px-3 text-center text-[10px] leading-relaxed text-white/45">
                    {mode === "editing-3d"
                      ? "Coming soon in this clone — mesh editing is a stub (honest)."
                      : "Coming soon in this clone — WorldGen scenes are a stub (honest)."}
                  </div>
                )}
                {/* image/text toggle pill (lilac glass, gradient text) */}
                {GENERATING_MODES.includes(mode) && (
                  <button
                    type="button"
                    onClick={() => setMode(mode === "image-to-3d" ? "text-to-3d" : "image-to-3d")}
                    className="absolute bottom-3 left-1/2 flex h-[30px] w-[168px] -translate-x-1/2 items-center justify-center rounded-[17px] bg-[#d2b6df]/15 text-base font-bold backdrop-blur-[60px] transition-colors hover:bg-[#d2b6df]/25"
                  >
                    <span className="h3d-grad-text-warm">
                      {mode === "image-to-3d" ? "Text to Image/3D" : "Image to 3D"}
                    </span>
                  </button>
                )}
              </div>
              <input
                id="workspace-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = "";
                }}
              />

              {/* right tools rail — circular icon buttons (28px, white/8): two
                  live tools + two reference ControlNet slots with honest stubs */}
              <div className="flex gap-2 sm:absolute sm:-right-[46px] sm:top-1/2 sm:-translate-y-1/2 sm:flex-col">
                <button
                  type="button"
                  aria-label="Material pass"
                  title="Material"
                  onClick={() => setToolPanel(toolPanel === "materials" ? null : "materials")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    toolPanel === "materials" && "bg-white/20",
                  )}
                >
                  <Palette className="size-3.5 text-white/80" aria-hidden="true" />
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
                <button
                  type="button"
                  aria-label="Material pass"
                  title="Material"
                  onClick={() => setToolPanel(toolPanel === "materials" ? null : "materials")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    toolPanel === "materials" && "bg-white/20",
                  )}
                >
                  <Palette className="size-3.5 text-white/80" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Prompt presets and seed"
                  title="Presets"
                  onClick={() => setToolPanel(toolPanel === "presets" ? null : "presets")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15",
                    toolPanel === "presets" && "bg-white/20",
                  )}
                >
                  <Sparkles className="size-3.5 text-white/80" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Bounding Box Control — not implemented in this clone"
                  title="Bounding Box Control (reference ControlNet — stub)"
                  onClick={() =>
                    toast.info("Bounding Box Control", {
                      description: "A reference ControlNet input — not implemented in this clone (honest stub; the slot exists for visual parity).",
                    })
                  }
                  className="flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15"
                >
                  <Box className="size-3.5 text-white/80" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Voxel ControlNet — not implemented in this clone"
                  title="Voxel ControlNet (reference ControlNet — stub)"
                  onClick={() =>
                    toast.info("Voxel ControlNet", {
                      description: "A reference ControlNet input — not implemented in this clone (honest stub; the slot exists for visual parity).",
                    })
                  }
                  className="flex size-7 items-center justify-center rounded-full bg-white/8 transition-colors hover:bg-white/15"
                >
                  <Grid3x3 className="size-3.5 text-white/80" aria-hidden="true" />
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

            {/* GENERATE cluster — private lock + glass capsule w/ blurred
                terracotta→lilac glow + quality/batch/cost chips */}
            <div className="mt-[38px] flex items-center gap-3">
              <button
                type="button"
                aria-pressed={isPrivate}
                title={isPrivate ? "Private — hidden from the gallery" : "Public — visible in the gallery"}
                onClick={() => setIsPrivate(!isPrivate)}
                className={cn(
                  "flex size-[60px] items-center justify-center rounded-full border transition-colors",
                  isPrivate
                    ? "border-[#e6765d]/60 bg-[#e6765d]/15"
                    : "border-white/12 bg-white/[0.04] hover:border-white/25",
                )}
              >
                <Lock className={cn("size-[18px]", isPrivate ? "text-[#e6765d]" : "text-white/70")} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={creating || generating || analyzing}
                className="group relative flex h-[68px] w-[206px] items-center justify-center rounded-full h3d-generate-capsule shadow-[0_0_44px_rgba(202,102,80,0.22),0_0_70px_rgba(185,138,207,0.18)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
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
                {creating || generating || analyzing ? (
                  <span className="relative z-10 flex items-center gap-2 text-lg font-bold text-white/60">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Working…
                  </span>
                ) : (
                  <>
                    <span className="relative z-10 text-lg font-bold text-white transition-opacity group-hover:opacity-0">
                      GENERATE
                    </span>
                    <span className="h3d-grad-text-warm absolute inset-0 z-10 flex items-center justify-center text-lg font-bold opacity-0 transition-opacity group-hover:opacity-100">
                      {generateHoverLabel}
                    </span>
                  </>
                )}
              </button>
              <div className="flex flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={() =>
                    genVersion === "gen-2.5" ? setEffortModalOpen(true) : setToolPanel(toolPanel === "quality" ? null : "quality")
                  }
                  className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                  title="Quality / effort"
                >
                  <span className="h3d-grad-text-warm">{qualityChipLabel}</span>
                  <ChevronDown className="size-3 text-white/50" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Batch is a Business plan feature", {
                      description: `The reference gates fast-mode batch (up to ${BATCH_MAX} variations/run) to the Business plan — this clone keeps batch 1, same honest gate.`,
                      duration: 8000,
                    })
                  }
                  className="flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:border-white/25"
                  aria-label="Batch size — Business plan feature"
                >
                  <Link2 className="size-3" aria-hidden="true" />
                  x1
                </button>
                <span className="text-[11px] font-semibold text-white/80">{costChipLabel}</span>
              </div>
              {/* gen-1.5 quality panel (Default / Speedy) */}
              {toolPanel === "quality" && genVersion === "gen-1.5" && (
                <div className="absolute mt-2 flex gap-1 rounded-xl border border-white/10 bg-[#1c1a20]/95 p-1.5 backdrop-blur-xl">
                  {LEGACY_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={legacyMode === m.id}
                      onClick={() => {
                        setLegacyMode(m.id);
                        setToolPanel(null);
                      }}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                        legacyMode === m.id ? "h3d-mode-active text-white" : "text-white/60 hover:text-white",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* controls row — reference look: Zap + Agentic Mode/OFF text ·
                ‹ version › pill · Gem + quality */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button
                type="button"
                aria-pressed={agentic}
                disabled={!agenticAvailable}
                onClick={() => setAgentic(!agentic)}
                title={agenticAvailable ? "Toggle agentic generation" : "Gen-2.5 line only"}
                className={cn(
                  "flex items-center gap-2",
                  agenticAvailable ? "cursor-pointer" : "cursor-default opacity-40",
                )}
              >
                <Zap className={cn("size-4", agentic ? "text-[#e6765d]" : "text-white/50")} aria-hidden="true" />
                <span className="text-sm font-semibold text-white/95">Agentic Mode</span>
                <span className="text-[11px] font-medium text-white/60">{agentic ? "ON" : "OFF"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = genVersion === "gen-2.5" ? "gen-1.5" : "gen-2.5";
                  setGenVersion(next);
                  if (next === "gen-1.5") setAgentic(false);
                }}
                title="Switch generator version"
                className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-sm font-bold text-white transition-colors hover:border-white/25"
              >
                <ChevronDown className="size-3 rotate-90 text-white/50" aria-hidden="true" />
                {GEN_VERSIONS.find((v) => v.id === genVersion)?.label}
                <ChevronDown className="size-3 -rotate-90 text-white/50" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  genVersion === "gen-2.5" ? setEffortModalOpen(true) : setToolPanel(toolPanel === "quality" ? null : "quality")
                }
                title="Quality"
                className="flex items-center gap-1.5 text-sm text-white/90"
              >
                <Gem className="size-3.5 text-[#ecc16c]" aria-hidden="true" />
                {qualityChipLabel}
                {agentic && <span className="text-[11px] text-[#c9b7cf]">· 5 min</span>}
              </button>
              {genVersion === "gen-1.5" && !agentic && (
                <span className="text-[11px] text-white/45">standard pipeline</span>
              )}
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

          {/* ASSET section — tabs, Featured pill, search/filter, gallery grid */}
          <section className="mx-auto mt-14 w-full max-w-[1280px] px-6 pb-20 md:px-20" aria-label="Assets">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <h2 className="text-[26px] font-bold leading-none text-white">ASSET</h2>
              <button
                type="button"
                onClick={() => toast.info("EXPLORE", { description: "The community feed is reference-parity chrome — this clone shows the Featured demo set." })}
                className="text-[26px] font-bold leading-none text-white/40 transition-colors hover:text-white/70"
              >
                EXPLORE
              </button>
              <div className="ml-auto flex items-center gap-3">
                <span className="flex h-[38px] w-[106px] items-center justify-center rounded-[39px] border border-[#e6765d] text-base text-[#cfcfcf]">
                  Featured
                </span>
                <button
                  type="button"
                  aria-label="Search assets"
                  onClick={() => toast.info("Search", { description: "Search is reference-parity chrome in this clone." })}
                  className="flex size-[38px] items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Search className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Filter", { description: "Featured sort only — reference-parity chrome." })}
                  className="flex h-[38px] items-center gap-1.5 rounded-full border border-white/12 px-4 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
                >
                  Filter <ChevronDown className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-white/35">
              Featured — demo renders from this clone's own gallery (the reference's community feed is not part of the clone).
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {FEATURED_TILES.map((tile) => (
                <figure
                  key={tile.src}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"
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
                    onClick={() => toast.info("Likes", { description: "Likes are reference-parity chrome — counters are demo values." })}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white/70 opacity-0 backdrop-blur-sm transition-opacity hover:text-[#ff6b6b] group-hover:opacity-100"
                  >
                    <Heart className="size-3.5" aria-hidden="true" />
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
          </section>
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

          {/* effort — Gen-2.5: five efforts; Gen-1.5: Default / Speedy */}
          {genVersion === "gen-1.5" ? (
            <div className="space-y-2.5">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Mode</Label>
              <div
                className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
                role="radiogroup"
                aria-label="Generation mode (Gen-1.5)"
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
                    <span className="block font-mono text-[9px] text-white/40">{m.blurb}</span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[9px] text-white/30">Gen-1.5 V1.2 maps Default→Medium, Speedy→Low effort.</p>
            </div>
          ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Thinking Effort</Label>
              <button
                type="button"
                className="min-h-9 font-mono text-[11px] text-h3d-violet underline-offset-2 hover:underline"
                onClick={() => setEffortModalOpen(true)}
              >
                {effortInfo.label} · ~{effortInfo.seconds}s
              </button>
            </div>
            <Slider
              value={[effortIndex < 0 ? 2 : effortIndex]}
              min={0}
              max={EFFORTS.length - 1}
              step={1}
              onValueChange={([v]) => setEffort(EFFORTS[v].id)}
              aria-label="Thinking effort"
              className="py-2 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-h3d-purple [&_[data-slot=slider-range]]:bg-h3d-purple"
            />
            <div className="flex justify-between font-mono text-[9px] uppercase text-white/40">
              {EFFORTS.map((e) => (
                <span key={e.id}>{e.id === "extreme-low" ? "XLow" : e.id === "extreme-high" ? "XHigh" : e.label}</span>
              ))}
            </div>
          </div>
          )}

          {/* upload (image mode) */}
          {mode === "image-to-3d" && (
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Input image</Label>
              {upload ? (
                <div className="relative overflow-hidden rounded-xl border border-white/12">
                  <img
                    src={upload.dataUrl}
                    alt="Uploaded reference image"
                    className="h-36 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 size-8 border border-white/15 bg-black/60 hover:bg-black/80"
                    aria-label="Remove uploaded image"
                    onClick={() => {
                      setUpload(null);
                      setCaption(null);
                    }}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                  {analyzing && (
                    <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/70 px-3 py-2 font-mono text-[10px] text-h3d-violet backdrop-blur-sm">
                      <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      rodin_mesh_image_process · analyzing reference…
                    </span>
                  )}
                </div>
              ) : (
                <label
                  ref={dragRef}
                  htmlFor="studio-upload"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center transition-colors hover:border-h3d-purple/50 hover:bg-h3d-purple/6"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleFile(file);
                  }}
                >
                  <Upload className="size-5 text-h3d-purple" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/75">Drop an image or click to upload</span>
                  <span className="font-mono text-[10px] text-white/35">.png · .jpg · .webp — auto-captioned by the vision model</span>
                </label>
              )}
              <input
                id="studio-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
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
                  <span className="font-mono text-[10px] text-white/45">
                    {caption.components.length} components · {caption.form}
                  </span>
                </div>
              )}

              {/* direction picker — 11 reference labels, optional extra views (Quality tier) */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                    Extra views <span className="text-white/30">(optional · pose-free)</span>
                  </p>
                  <span className="font-mono text-[10px] text-white/35">{extraViews.length}/4</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {VIEW_DIRECTIONS.map((dir) => {
                    const existing = extraViews.find((v) => v.direction === dir);
                    const engineFed = ENGINE_SLOT_OF[dir] !== null;
                    return existing ? (
                      <div key={dir} className="group relative">
                        <img
                          src={existing.dataUrl}
                          alt={`${DIRECTION_LABELS[dir]} view`}
                          className="h-12 w-full rounded-md border border-h3d-purple/50 object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 rounded-b-md bg-black/70 px-1 py-0.5 text-center font-mono text-[8px] uppercase text-white/80">
                          {DIRECTION_SHORT[dir]}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${DIRECTION_LABELS[dir]} view`}
                          onClick={() => setExtraViews((vs) => vs.filter((v) => v.direction !== dir))}
                          className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                        >
                          <X className="size-2.5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <label
                        key={dir}
                        className={cn(
                          "flex h-12 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-white/40 transition-colors hover:border-h3d-purple/50 hover:text-white/70",
                          engineFed ? "border-white/15" : "border-white/10",
                        )}
                        title={`Add a ${DIRECTION_LABELS[dir]} view${engineFed ? " (fed to the neural engine's " + ENGINE_SLOT_OF[dir] + " slot)" : " (recorded on the task card; no engine slot)"}`}
                      >
                        <Plus className="size-3" aria-hidden="true" />
                        <span className="font-mono text-[8px] uppercase">{DIRECTION_SHORT[dir]}</span>
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
                <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-white/30">
                  11 reference labels (F/FL/FR/L/UP/R/BL/B/BR/DN/?). Front·Back·Left·Right feed the
                  engine directly; diagonal/up/down are recorded on the task card. Unknown (?) is the
                  reference default — skip freely, one image is enough.
                </p>
              </div>
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
    </div>
  );
}
