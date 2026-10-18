"use client";

/**
 * Rodin Studio — wired to the REAL backend.
 *
 * Image to 3D: upload → /api/task/rodin_mesh_image_process (VLM caption,
 * editable prompt + palette) → GENERATE (credits: Free Preview first task,
 * then 1 credit; Agentic toggle ON = 10 credits + effort modal per
 * blueprint §2.3) → agentic progress pills while the job runs → task-card
 * polling → GLB viewer (GLTFLoader + OrbitControls) → REAL exports
 * (GLB/GLTF/OBJ/STL/USDZ) → Mine list.
 *
 * Text to 3D: same pipeline without the upload (prompt → LLM → spec).
 * 3D Editing / WorldGen: honest "coming soon in this clone" states — no
 * fake generation.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Boxes,
  Coins,
  Download,
  Globe,
  Image as ImageIcon,
  Loader2,
  Palette,
  Pause,
  PencilRuler,
  RotateCw,
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
  EFFORTS,
  EXPORT_FORMATS,
  FORMAT_USES,
  GEN_VERSION,
  GENERATING_MODES,
  GEN_MODES,
  nameForPrompt,
  type EffortId,
  type GenMode,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";
import type { TextureMode } from "./model-viewer";

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
              setViewerUrl(`/api/task/${uuid}/export?format=glb`);
              toast.success("Model ready", {
                description: `${nameForPrompt(next.prompt)} · ${next.usage?.elapsed_seconds?.toFixed(1)}s · ${GEN_VERSION}`,
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

  const createTask = useCallback(
    async (effortForTask: EffortId) => {
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
      try {
        const res = await fetch("/api/task", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type: agentic ? "RodinAgentic" : "RodinStandard",
            prompt: promptText || "A 3D object from the uploaded reference.",
            effort: effortForTask,
            ...(upload ? { image: upload.dataUrl } : {}),
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
        toast.success(agentic ? "Agentic task started" : "Task queued", {
          description: `${EFFORTS.find((e) => e.id === effortForTask)?.label} effort · uuid ${body.uuid.slice(0, 8)}…`,
        });
      } catch (err) {
        toast.error("Could not start generation", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setCreating(false);
      }
    },
    [user, prompt, upload, mode, agentic, startPolling, onNeedAuth, onSessionRefresh],
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
    setViewerUrl(`/api/task/${task.task_uuid}/export?format=glb`);
    setViewerReady(false);
    void fetch(`/api/task/card/${task.task_uuid}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((c) => {
        if (c) setCard(c as TaskCard);
      });
  }, [stopPolling]);

  /* ---------------- derived ---------------- */

  const generating = Boolean(activeTask && card && (card.user_state === "queued" || card.user_state === "processing"));
  const complete = Boolean(card && (card.user_state === "DonePreview" || card.user_state === "done"));
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

  /* ---------------- render ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121317]" role="dialog" aria-label="Rodin Studio workspace">
      {/* studio header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#141419]/90 px-4 sm:px-5">
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
      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* ---------- left sidebar ---------- */}
        <aside
          className="h3d-scroll w-full shrink-0 space-y-5 border-b border-white/8 p-4 sm:p-5 lg:w-[330px] lg:overflow-y-auto lg:border-b-0 lg:border-r"
          aria-label="Generation controls"
        >
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

          {/* agentic toggle */}
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

          {/* effort */}
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
            </div>
          )}

          {/* prompt */}
          <div className="space-y-2">
            <Label htmlFor="studio-prompt" className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
              Prompt {upload && <span className="text-white/35">(optional guidance)</span>}
            </Label>
            <Textarea
              id="studio-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={PROMPT_PLACEHOLDERS[mode]}
              rows={4}
              className="resize-none border-white/12 bg-white/4 text-sm placeholder:text-white/40"
            />
          </div>

          {/* generate */}
          <div className="space-y-2 pt-1">
            {user && mine.length === 0 && (
              <p className="rounded-lg border border-h3d-gold/30 bg-h3d-gold/10 px-3 py-2 font-mono text-[11px] text-h3d-gold">
                Free preview — your first generation charges no credits
              </p>
            )}
            <Button
              className="relative h-12 w-full overflow-hidden h3d-gradient-primary text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(133,132,255,0.4)] hover:opacity-90"
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
        <main className="flex min-w-0 flex-1 flex-col lg:overflow-hidden" aria-label="3D viewer and render">
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

          {/* ---------- right panel ---------- */}
          <aside
            className="h3d-scroll w-full shrink-0 space-y-4 border-t border-white/8 p-4 sm:p-5 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l"
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
              {!complete && (
                <p className="mt-2 font-mono text-[10px] text-white/35">Exports unlock when the preview is ready.</p>
              )}
            </div>

            <div className="h3d-glass rounded-2xl p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Cost</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/85">
                  <Coins className="size-4 text-h3d-gold" aria-hidden="true" />
                  {agentic ? "10 credits / agentic" : mine.length === 0 ? "Free preview" : "1 credit / standard"}
                </span>
                {user && (
                  <span className="rounded-full h3d-gradient-primary px-2.5 py-1 font-mono text-[10px] font-semibold text-white">
                    {user.balance} left
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-h3d-muted">
                {user
                  ? "First task is free. Standard generations cost 1 credit; Agentic Mode costs 10."
                  : "Guests can browse — sign in to generate (first preview is free)."}
              </p>
            </div>
          </aside>
        </main>
      </div>

      {/* ---------- asset rail ---------- */}
      <footer
        className="h3d-scroll flex h-[108px] shrink-0 items-center gap-4 overflow-x-auto border-t border-white/8 bg-[#141419]/80 px-4"
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
              {tab === "mine" ? "Mine" : "Featured"}
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
