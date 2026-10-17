"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Boxes,
  Check,
  Circle,
  Coins,
  Download,
  FileDown,
  Image as ImageIcon,
  Loader2,
  Pause,
  RotateCw,
  Shuffle,
  Triangle,
  Type,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "../smart-image";
import {
  archetypeForPrompt,
  CONTROLNETS,
  EFFORTS,
  EXPORT_FORMATS,
  GALLERY_FALLBACK_IMAGES,
  GEN_MODES,
  GEN_VERSION,
  hashString,
  nameForPrompt,
  PIPELINE_STAGES,
  STUDIO_HISTORY_KEY,
  type ControlNetId,
  type EffortId,
  type GenMode,
  type HistoryEntry,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";
import type { TextureMode } from "./three-viewer";

const ThreeViewer = dynamic(() => import("./three-viewer").then((m) => m.ThreeViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-h3d-purple" aria-label="Loading 3D viewer" />
    </div>
  ),
});

const MODE_ICONS: Record<GenMode, React.ComponentType<{ className?: string }>> = {
  "image-to-3d": ImageIcon,
  "text-to-3d": Type,
  "remix-gen": Shuffle,
  "turbo-gen": Zap,
  "editing-3d": Boxes,
};

const PROMPT_PLACEHOLDERS: Record<GenMode, string> = {
  "image-to-3d": "Describe the object in your image — e.g. a battle-worn knight helmet, ornate steel…",
  "text-to-3d": "a rugged sci-fi cargo drone, matte panels, worn metal, red accents…",
  "remix-gen": "blend a katana with a vine plant, glowing edges, dark fantasy…",
  "turbo-gen": "a chunky low-poly treasure chest, stylized proportions…",
  "editing-3d": "split into parts, refine the hilt, add gold trim…",
};

export interface StudioInitial {
  prompt: string;
  mode: GenMode;
  effort: EffortId;
  controlNet: ControlNetId | null;
  freePreview: boolean;
  nonce: number;
}

interface StudioModel {
  archetype: ReturnType<typeof archetypeForPrompt>;
  seed: number;
  name: string;
}

const TEXTURE_MODES: { id: TextureMode; label: string }[] = [
  { id: "shaded", label: "Shaded" },
  { id: "wireframe", label: "Wireframe" },
  { id: "normal", label: "Normal" },
];

export function Studio({
  initial,
  authed,
  credits,
  guestAcknowledged,
  onRequestAuth,
  onConsumeCredit,
  onClose,
  resumeSignal = 0,
}: {
  initial: StudioInitial;
  authed: boolean;
  credits: number;
  guestAcknowledged: boolean;
  onRequestAuth: (intent: string, then: () => void) => void;
  onConsumeCredit: () => boolean;
  onClose: () => void;
  resumeSignal?: number;
}) {
  const [mode, setMode] = useState<GenMode>(initial.mode);
  const [controlNet, setControlNet] = useState<ControlNetId | null>(initial.controlNet);
  const [effort, setEffort] = useState<EffortId>(initial.effort);
  const [prompt, setPrompt] = useState(initial.prompt);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [model, setModel] = useState<StudioModel>(() =>
    initial.prompt.trim()
      ? {
          archetype: archetypeForPrompt(initial.prompt),
          seed: hashString(initial.prompt),
          name: nameForPrompt(initial.prompt),
        }
      : { archetype: "torus-knot", seed: 42, name: "Draft Preview" },
  );
  const [polys, setPolys] = useState(0);
  const [textureMode, setTextureMode] = useState<TextureMode>("shaded");
  const [autoRotate, setAutoRotate] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [freePreviewLeft, setFreePreviewLeft] = useState(initial.freePreview);

  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderFallback, setRenderFallback] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STUDIO_HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const persistHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      window.localStorage.setItem(STUDIO_HISTORY_KEY, JSON.stringify(entries));
    } catch {
      /* non-fatal */
    }
  }, []);

  /** Attach a late-arriving render URL to an already-persisted history entry. */
  const attachRenderToHistory = useCallback((entryId: string, url: string) => {
    setHistory((prev) => {
      if (!prev.some((h) => h.id === entryId)) return prev;
      const next = prev.map((h) => (h.id === entryId ? { ...h, renderUrl: url } : h));
      try {
        window.localStorage.setItem(STUDIO_HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* non-fatal */
      }
      return next;
    });
  }, []);

  /* ---------- generation ---------- */
  const runGeneration = useCallback(() => {
    if (generating) return;
    const promptText = prompt.trim() || PROMPT_PLACEHOLDERS[mode].replace(/[…]/g, "");
    const isPreview = freePreviewLeft;

    if (authed && !isPreview) {
      const ok = onConsumeCredit();
      if (!ok) {
        toast.error("Out of credits", {
          description: "Upgrade your plan or add a credit pack to keep generating.",
        });
        return;
      }
    }
    if (isPreview) setFreePreviewLeft(false);

    const effortInfo = EFFORTS.find((e) => e.id === effort) ?? EFFORTS[2];
    const entryId = `task_${Date.now().toString(36)}`;
    let renderUrlLocal: string | null = null;
    setGenerating(true);
    setProgress(0);
    setStage(0);
    setRenderUrl(null);
    setRenderFallback(false);
    setRenderLoading(true);

    /* fake pipeline over ~4–20s scaled by effort */
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / effortInfo.demoMs) * 100);
      setProgress(pct);
      setStage(Math.min(PIPELINE_STAGES.length - 1, Math.floor(pct / 25)));
      if (pct >= 100 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setGenerating(false);

        const nextModel: StudioModel = {
          archetype: archetypeForPrompt(promptText + mode),
          seed: hashString(promptText + mode + Date.now()),
          name: nameForPrompt(promptText),
        };
        setModel(nextModel);
        toast.success("Model ready", {
          description: `${nextModel.name} · ${GEN_VERSION} · ${effortInfo.label} effort`,
        });

        const entry: HistoryEntry = {
          id: entryId,
          prompt: promptText,
          mode,
          effort,
          archetype: nextModel.archetype,
          seed: nextModel.seed,
          createdAt: Date.now(),
          renderUrl: renderUrlLocal ?? undefined,
        };
        persistHistory([entry, ...history].slice(0, 10));
      }
    }, 90);

    /* real render fetch in parallel */
    const controller = new AbortController();
    abortRef.current = controller;
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, mode, effort }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("bad status");
        const data = (await res.json()) as { url: string; fallback?: boolean };
        renderUrlLocal = data.url;
        setRenderUrl(data.url);
        setRenderFallback(Boolean(data.fallback));
        attachRenderToHistory(entryId, data.url);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        const fallback =
          GALLERY_FALLBACK_IMAGES[hashString(promptText) % GALLERY_FALLBACK_IMAGES.length];
        renderUrlLocal = fallback;
        setRenderUrl(fallback);
        setRenderFallback(true);
        attachRenderToHistory(entryId, fallback);
      })
      .finally(() => setRenderLoading(false));
  }, [
    generating,
    prompt,
    mode,
    freePreviewLeft,
    authed,
    onConsumeCredit,
    effort,
    history,
    persistHistory,
    attachRenderToHistory,
  ]);

  const handleGenerate = () => {
    if (generating) return;
    if (!authed && !guestAcknowledged) {
      onRequestAuth(
        "Sign in to generate — or continue as a guest (previews stay free).",
        runGeneration,
      );
      return;
    }
    runGeneration();
  };

  const handleGenerateRef = useRef(handleGenerate);
  useEffect(() => {
    handleGenerateRef.current = handleGenerate;
  }, [handleGenerate]);

  /* Resume a gated generation after the sign-in dialog resolves. */
  useEffect(() => {
    if (resumeSignal > 0) handleGenerateRef.current();
  }, [resumeSignal]);

  const cancelGeneration = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    abortRef.current?.abort();
    setGenerating(false);
    setRenderLoading(false);
    toast.info("Generation cancelled");
  };

  const reopenHistory = (entry: HistoryEntry) => {
    setPrompt(entry.prompt);
    setMode(entry.mode);
    setEffort(entry.effort);
    setModel({ archetype: entry.archetype as StudioModel["archetype"], seed: entry.seed, name: nameForPrompt(entry.prompt) });
    setRenderUrl(entry.renderUrl ?? null);
    setRenderFallback(false);
    toast.info("Reopened from history", { description: nameForPrompt(entry.prompt) });
  };

  const clearHistory = () => {
    persistHistory([]);
    toast.info("History cleared");
  };

  const effortIndex = EFFORTS.findIndex((e) => e.id === effort);
  const effortInfo = EFFORTS[effortIndex >= 0 ? effortIndex : 2];

  const modeLabel = useMemo(
    () => GEN_MODES.find((m) => m.id === mode)?.label ?? "Text to 3D",
    [mode],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#121317]" role="dialog" aria-label="Rodin Studio workspace">
      {/* studio header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#141419]/90 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg h3d-gradient-primary">
            <Box className="size-4 text-white" aria-hidden="true" />
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
          {authed && (
            <span className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 md:flex">
              <Coins className="size-3.5 text-h3d-gold" aria-hidden="true" />
              <span className="font-mono text-xs text-white">{credits}</span>
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
          className="h3d-scroll w-full shrink-0 space-y-5 border-b border-white/8 p-4 sm:p-5 lg:w-[320px] lg:overflow-y-auto lg:border-b-0 lg:border-r"
          aria-label="Generation controls"
        >
          <fieldset>
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
              Mode
            </legend>
            <div className="space-y-1.5">
              {GEN_MODES.map((m) => {
                const Icon = MODE_ICONS[m.id];
                const active = mode === m.id;
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
                      <span className="block text-sm font-medium">{m.label}</span>
                      {active && <span className="block text-[11px] leading-tight text-h3d-muted">{m.hint}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
              ControlNet
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {CONTROLNETS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={controlNet === c.id}
                  title={c.blurb}
                  className={cn(
                    "min-h-11 rounded-xl border px-2 py-2 text-xs font-medium transition-all",
                    controlNet === c.id
                      ? "border-h3d-purple/60 bg-h3d-purple/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white",
                  )}
                  onClick={() => setControlNet(controlNet === c.id ? null : c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                Thinking Effort
              </Label>
              <span className="font-mono text-[11px] text-h3d-violet">
                {effortInfo.label} · ~{effortInfo.seconds}s
              </span>
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
                <span key={e.id}>
                  {e.id === "extreme-low"
                    ? "XLow"
                    : e.id === "extreme-high"
                      ? "XHigh"
                      : e.label}
                </span>
              ))}
            </div>
          </div>

          {mode === "image-to-3d" && (
            <div className="space-y-2">
              <Label className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                Input image
              </Label>
              {uploadPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-white/12">
                  <img
                    src={uploadPreview}
                    alt="Uploaded reference image"
                    className="h-36 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 size-8 border border-white/15 bg-black/60 hover:bg-black/80"
                    aria-label="Remove uploaded image"
                    onClick={() => setUploadPreview(null)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="studio-upload"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center transition-colors hover:border-h3d-purple/50 hover:bg-h3d-purple/6"
                >
                  <Upload className="size-5 text-h3d-purple" aria-hidden="true" />
                  <span className="text-xs font-medium text-white/75">
                    Drop an image or click to upload
                  </span>
                  <span className="font-mono text-[10px] text-white/35">
                    png · jpg · webp — preview only in clone
                  </span>
                </label>
              )}
              <input
                id="studio-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setUploadPreview(String(reader.result));
                    toast.success("Image loaded", { description: file.name });
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="studio-prompt" className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
              Prompt
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

          <div className="space-y-2 pt-1">
            {freePreviewLeft && (
              <p className="rounded-lg border border-h3d-gold/30 bg-h3d-gold/10 px-3 py-2 font-mono text-[11px] text-h3d-gold">
                Free preview — this generation charges no credit
              </p>
            )}
            <Button
              className="relative h-12 w-full overflow-hidden h3d-gradient-primary text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(133,132,255,0.4)] hover:opacity-90"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Wand2 className="size-4" /> GENERATE
                </>
              )}
            </Button>
            <p className="text-center font-mono text-[10px] text-white/35">
              1 credit per confirmed model · {authed ? `${credits} in wallet` : "guest mode"}
            </p>
          </div>
        </aside>

        {/* ---------- center: viewer ---------- */}
        <main className="flex min-w-0 flex-1 flex-col lg:overflow-hidden" aria-label="3D viewer and render">
          <div className="relative min-h-[52vh] flex-1 lg:min-h-0">
            <ThreeViewer
              archetype={model.archetype}
              seed={model.seed}
              textureMode={textureMode}
              autoRotate={autoRotate}
              onStats={setPolys}
            />

            {/* texture mode toggle */}
            <div className="absolute left-3 top-3 flex gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
              {TEXTURE_MODES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={textureMode === t.id}
                  onClick={() => setTextureMode(t.id)}
                  className={cn(
                    "min-h-9 rounded-full px-3 text-xs font-medium transition-colors",
                    textureMode === t.id
                      ? "bg-h3d-purple/25 text-white"
                      : "text-white/55 hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* auto-rotate toggle */}
            <button
              type="button"
              aria-label={autoRotate ? "Pause auto-rotate" : "Resume auto-rotate"}
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate((v) => !v)}
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/75 backdrop-blur-md transition-colors hover:text-white"
            >
              {autoRotate ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <RotateCw className="size-4" aria-hidden="true" />
              )}
            </button>

            {/* model meta chip */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
              <Box className="size-3.5 text-h3d-purple" aria-hidden="true" />
              <span className="max-w-40 truncate font-display text-xs font-semibold text-white sm:max-w-56">
                {model.name}
              </span>
              <span className="hidden items-center gap-1 font-mono text-[10px] text-h3d-muted sm:flex">
                <Triangle className="size-2.5 fill-h3d-purple/60 text-h3d-purple/60" aria-hidden="true" />
                {polys.toLocaleString("en-US")} tris
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] text-white/50">
              drag to orbit · scroll to zoom
            </div>

            {/* pipeline overlay */}
            {generating && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                role="status"
                aria-live="polite"
              >
                <div className="h3d-glass-strong mx-4 w-full max-w-sm rounded-2xl p-5 sm:p-6">
                  <p className="font-display text-base font-semibold text-white">
                    Generating your model
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-h3d-muted">
                    {effortInfo.label} effort · ~{effortInfo.seconds}s on the real engine (demo runs{" "}
                    {effortInfo.demoMs / 1000}s)
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {PIPELINE_STAGES.map((s, i) => (
                      <li key={s} className="flex items-center gap-3 text-sm">
                        {i < stage ? (
                          <Check className="size-4 text-h3d-purple" aria-hidden="true" />
                        ) : i === stage ? (
                          <Loader2 className="size-4 animate-spin text-h3d-violet" aria-hidden="true" />
                        ) : (
                          <Circle className="size-4 text-white/20" aria-hidden="true" />
                        )}
                        <span className={cn(i <= stage ? "text-white" : "text-white/35")}>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    <Progress value={progress} className="h-2 [&_[data-slot=progress-indicator]]:h3d-gradient-primary" />
                    <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-h3d-muted">
                      <span>{Math.round(progress)}%</span>
                      <span>{GEN_VERSION}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full min-h-10 text-xs text-white/60 hover:bg-white/8"
                    onClick={cancelGeneration}
                  >
                    Cancel generation
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* generated render panel */}
          {(renderLoading || renderUrl) && (
            <aside
              className="h3d-scroll shrink-0 border-t border-white/8 p-4 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l"
              aria-label="Generated render"
            >
              <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                <FileDown className="size-3.5" aria-hidden="true" />
                Generated render
              </p>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                {renderLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="size-6 animate-spin text-h3d-purple" aria-hidden="true" />
                    <span className="font-mono text-[11px] text-h3d-muted">
                      waiting for /api/generate…
                    </span>
                  </div>
                ) : (
                  renderUrl && (
                    <SmartImage
                      src={renderUrl}
                      alt="AI generated render of the 3D model"
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  )
                )}
                {renderFallback && !renderLoading && (
                  <span className="absolute left-2 top-2 rounded-md border border-h3d-gold/40 bg-black/60 px-2 py-1 font-mono text-[10px] text-h3d-gold backdrop-blur-sm">
                    fallback render
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/35">
                {renderFallback
                  ? "SDK image generation unavailable — showing a gallery fallback."
                  : "Rendered server-side via z-ai-web-dev-sdk."}
              </p>
            </aside>
          )}
        </main>

        {/* ---------- right panel ---------- */}
        <aside
          className="h3d-scroll w-full shrink-0 space-y-4 border-t border-white/8 p-4 sm:p-5 lg:w-[300px] lg:overflow-y-auto lg:border-t-0 lg:border-l"
          aria-label="Model details and export"
        >
          <div className="h3d-glass rounded-2xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Model</p>
            <h3 className="font-display mt-1.5 truncate text-lg font-semibold text-white">
              {model.name}
            </h3>
            <dl className="mt-3 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between gap-2">
                <dt className="text-white/40">version</dt>
                <dd className="text-h3d-violet">{GEN_VERSION}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/40">triangles</dt>
                <dd className="text-white/80">{polys.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/40">mode</dt>
                <dd className="truncate text-white/80">{modeLabel}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/40">effort</dt>
                <dd className="truncate text-white/80">{effortInfo.label}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-white/40">controlnet</dt>
                <dd className="text-white/80">
                  {CONTROLNETS.find((c) => c.id === controlNet)?.label ?? "none"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="h3d-glass rounded-2xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Export</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map((f) => (
                <Button
                  key={f}
                  variant="outline"
                  size="sm"
                  className="min-h-11 border-white/12 bg-white/4 font-mono text-xs font-medium text-white/85 hover:border-h3d-purple/50 hover:bg-h3d-purple/12"
                  onClick={() =>
                    toast.success(`Export queued — clone demo`, {
                      description: `${model.name}.${f.toLowerCase()} · ${GEN_VERSION} pipeline`,
                    })
                  }
                >
                  <Download className="size-3.5 text-h3d-purple" aria-hidden="true" />
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="h3d-glass rounded-2xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Cost</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-white/85">
                <Coins className="size-4 text-h3d-gold" aria-hidden="true" />
                1 credit / generation
              </span>
              {authed && (
                <span className="rounded-full h3d-gradient-primary px-2.5 py-1 font-mono text-[10px] font-semibold text-white">
                  {credits} left
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-h3d-muted">
              {authed
                ? "Previews are always free — credits are only spent on confirmed results."
                : "Guest mode: previews are free. Sign in to keep and export assets."}
            </p>
          </div>
        </aside>
      </div>

      {/* ---------- history strip ---------- */}
      <footer
        className="h3d-scroll flex h-[108px] shrink-0 items-center gap-3 overflow-x-auto border-t border-white/8 bg-[#141419]/80 px-4"
        aria-label="Generation history"
      >
        <div className="flex shrink-0 flex-col">
          <p className="font-mono text-[10px] uppercase tracking-wider text-h3d-muted">History</p>
          {history.length > 0 && (
            <button
              type="button"
              className="mt-1 min-h-9 text-left font-mono text-[10px] text-white/40 hover:text-white"
              onClick={clearHistory}
            >
              clear ({history.length}/10)
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="px-2 text-xs text-white/30">
            Your last 10 generations appear here — persisted locally.
          </p>
        ) : (
          <div className="flex gap-2.5">
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                className="group relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 text-left transition-colors hover:border-h3d-purple/50"
                onClick={() => reopenHistory(h)}
                aria-label={`Reopen ${nameForPrompt(h.prompt)}`}
              >
                {h.renderUrl ? (
                  <SmartImage
                    src={h.renderUrl}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1d1d28] to-[#17171b]">
                    <Box className="size-6 text-h3d-purple/50" aria-hidden="true" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-white/90">
                  {h.prompt}
                </span>
                <span className="absolute right-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] text-white/70 backdrop-blur-sm">
                  {GEN_MODES.find((m) => m.id === h.mode)?.label ?? h.mode}
                </span>
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
