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
  Coins,
  Dices,
  Download,
  Eye,
  Globe,
  Image as ImageIcon,
  Layers,
  Loader2,
  Palette,
  Pause,
  PencilRuler,
  Plus,
  RotateCw,
  Sparkles,
  Triangle,
  Type,
  Upload,
  Video,
  Wand2,
  X,
  Zap,
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
     render the controls as a centered floating card (like the reference
     /workspace/rodin landing) instead of the three-pane dashboard. */
  const emptyStudio = !viewerUrl && !card && !generating && !creating && !analyzing;

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex flex-col h3d-studio-bg" role="dialog" aria-label="Rodin Studio workspace">
      {/* studio header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#16121c]/75 px-4 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg h3d-gradient-primary">
            <Boxes className="size-4 text-white" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-white">
              HYPER3D<span className="text-h3d-purple">.AI</span>
            </p>
            <p className="font-mono text-[10px] text-h3d-muted">rodin / workspace</p>
          </div>
          <span className="ml-1 hidden rounded-full border border-h3d-purple/40 bg-h3d-purple/15 px-2.5 py-1 font-mono text-[10px] font-medium text-h3d-violet sm:inline-flex">
            {GEN_VERSION}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 md:flex">
              <Coins className="size-3.5 text-h3d-gold" aria-hidden="true" />
              <span className="font-mono text-xs text-white">{user.balance}</span>
              <span className="text-[10px] text-h3d-muted">credits</span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10"
            onClick={onClose}
            aria-label="Close studio and return to the landing page"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exit Studio</span>
          </Button>
        </div>
      </header>

      {/* body */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden",
          emptyStudio && "items-center p-4 sm:p-6 lg:flex-col lg:justify-center",
        )}
      >
        {/* reference hero — massive headline above the floating card (empty state only) */}
        {emptyStudio && (
          <div className="mb-5 shrink-0 text-center">
            <h1 className="font-display text-6xl font-bold tracking-tight text-white sm:text-7xl">Rodin</h1>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.24em] text-h3d-violet">Gen-2.5 · Agent-Ready</p>
            <p className="mt-2 text-sm text-h3d-muted">The best way to understand is to create.</p>
          </div>
        )}
        {/* ---------- left sidebar (or centered card when empty) ---------- */}
        <aside
          className={cn(
            "h3d-scroll w-full shrink-0 space-y-5",
            emptyStudio
              ? "mx-auto my-auto w-full max-w-[560px] rounded-3xl border border-white/10 bg-[#1e1b24]/80 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-6 lg:max-h-[calc(100vh-12.5rem)] lg:w-[560px] lg:overflow-y-auto"
              : "border-b border-white/8 p-4 sm:p-5 lg:w-[330px] lg:overflow-y-auto lg:border-b-0 lg:border-r",
          )}
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

      {/* ---------- asset rail ---------- */}
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
