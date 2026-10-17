"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Boxes, Cuboid, ImagePlus, Sparkles, Star, Wand2, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "./smart-image";
import { Reveal } from "./reveal";
import {
  CONTROLNETS,
  EFFORTS,
  GEN_MODES,
  TRUST_LOGOS,
  type ControlNetId,
  type EffortId,
  type GenMode,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

export interface DemoGenerateRequest {
  prompt: string;
  mode: GenMode;
  effort: EffortId;
  controlNet: ControlNetId | null;
  free: boolean;
}

const PROMPT_PLACEHOLDERS: Record<GenMode, string> = {
  "image-to-3d": "a battle-worn knight helmet, ornate steel…",
  "text-to-3d": "a rugged sci-fi cargo drone, matte panels, worn metal…",
  "editing-3d": "split into parts, refine the hilt, add gold trim…",
  worldgen: "a floating island village, waterfalls, rope bridges…",
};

export function DemoPanel({
  onGenerate,
  className,
}: {
  onGenerate: (req: DemoGenerateRequest) => void;
  className?: string;
}) {
  const [mode, setMode] = useState<GenMode>("image-to-3d");
  const [controlNet, setControlNet] = useState<ControlNetId | null>("bbox");
  const [effort, setEffort] = useState<EffortId>("medium");
  const [prompt, setPrompt] = useState("");

  const fire = (free: boolean) => {
    const text = prompt.trim() || PROMPT_PLACEHOLDERS[mode].replace(/[…]/g, "");
    onGenerate({ prompt: text, mode, effort, controlNet, free });
  };

  return (
    <section
      aria-label="Interactive generator demo"
      className={cn(
        "h3d-glass-strong relative overflow-hidden rounded-2xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-5",
        className,
      )}
    >
      {/* panel header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg h3d-gradient-primary">
            <Wand2 className="size-4 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-white">Rodin Generator</p>
            <p className="font-mono text-[11px] text-h3d-muted">hyper3d.ai / workspace</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-h3d-purple/40 bg-h3d-purple/15 px-2.5 py-1 font-mono text-[11px] font-medium text-h3d-violet">
          <Sparkles className="size-3" aria-hidden="true" /> Gen-2.5
        </span>
      </div>

      {/* mode tabs */}
      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as GenMode)}
        className="w-full"
      >
        <div className="h3d-scroll overflow-x-auto pb-1">
          <TabsList
            aria-label="Generation mode"
            className="h-auto w-max gap-1 rounded-xl border border-white/8 bg-white/4 p-1"
          >
            {GEN_MODES.map((m) => (
              <TabsTrigger
                key={m.id}
                value={m.id}
                title={m.hint}
                className="min-h-9 rounded-lg px-2.5 text-xs font-medium text-white/65 transition-colors data-[state=active]:bg-white/12 data-[state=active]:text-white sm:px-3 sm:text-[13px]"
              >
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* image example (image mode) */}
      {mode === "image-to-3d" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-2.5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:size-18">
            <SmartImage
              src="/images/hero-robot.png"
              alt="Example input image — robot character"
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/85">
              <ImagePlus className="size-3.5 text-h3d-purple" aria-hidden="true" />
              Example image loaded
            </p>
            <p className="mt-0.5 truncate text-xs text-h3d-muted">
              One image is enough — additional views are optional.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden min-h-9 shrink-0 border-white/12 bg-white/4 text-xs sm:flex"
            onClick={() =>
              toast.info("Image upload", {
                description: "Dropzone lives in the Studio — open it to try the flow.",
              })
            }
          >
            Upload
          </Button>
        </div>
      )}

      {/* 3D editing ops note */}
      {mode === "editing-3d" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
          <p className="text-xs font-medium text-white/85">
            <Boxes className="mr-1.5 inline size-3.5 text-h3d-purple" aria-hidden="true" />
            Supports
            <span className="ml-1 font-mono text-[11px] text-h3d-violet">.obj .fbx .glb</span>
          </p>
          <div className="flex gap-1.5">
            {["Parts", "Refine", "Modify"].map((op) => (
              <span
                key={op}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] font-medium text-white/75"
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* controlnet selectors */}
      <fieldset className="mt-4">
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
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2 text-center transition-all",
                controlNet === c.id
                  ? "border-h3d-purple/60 bg-h3d-purple/15 text-white shadow-[0_0_16px_rgba(145,106,240,0.25)]"
                  : "border-white/10 bg-white/3 text-white/65 hover:border-white/25 hover:text-white",
              )}
              onClick={() => setControlNet(controlNet === c.id ? null : c.id)}
            >
              <span className="flex items-center gap-1 text-xs font-medium">
                <Cuboid className="size-3.5" aria-hidden="true" />
                {c.label}
              </span>
              <span className="hidden truncate text-[10px] text-h3d-muted sm:block">{c.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* effort selector */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="h3d-effort" className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
          Thinking Effort
        </Label>
        <Select value={effort} onValueChange={(v) => setEffort(v as EffortId)}>
          <SelectTrigger
            id="h3d-effort"
            className="h-11 w-full border-white/12 bg-white/4 text-sm"
            aria-label="Select thinking effort"
          >
            <SelectValue placeholder="Select effort" />
          </SelectTrigger>
          <SelectContent className="border-white/12 bg-[#1c1c22]">
            {EFFORTS.map((e) => (
              <SelectItem key={e.id} value={e.id} className="min-h-10">
                <Zap className="size-3.5 text-h3d-gold" aria-hidden="true" />
                {e.label}
                <span className="ml-auto font-mono text-xs text-h3d-muted">~{e.seconds}s</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* prompt */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="h3d-prompt" className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
          Prompt
        </Label>
        <Textarea
          id="h3d-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={PROMPT_PLACEHOLDERS[mode]}
          rows={2}
          className="min-h-11 resize-none border-white/12 bg-white/4 text-sm placeholder:text-white/40"
        />
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          className="relative h-12 flex-1 overflow-hidden h3d-gradient-primary text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(133,132,255,0.4)] hover:opacity-90"
          onClick={() => fire(false)}
        >
          GENERATE
        </Button>
        <Button
          variant="outline"
          className="h-12 border-white/15 bg-white/4 px-4 text-sm font-medium text-white/85 hover:bg-white/10"
          onClick={() => {
            fire(true);
            toast.info("Free preview", { description: "Opening the Studio — no credit will be charged." });
          }}
        >
          Free Preview
        </Button>
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-h3d-muted">
        1 credit per confirmed model · previews are always free
      </p>
    </section>
  );
}

export function Hero({ onGenerate }: { onGenerate: (req: DemoGenerateRequest) => void }) {
  return (
    <section id="hero" aria-label="Hero" className="relative overflow-hidden">
      <div className="h3d-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="h3d-grid-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-24 lg:pt-24">
        {/* left copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-h3d-purple/35 bg-h3d-purple/12 px-3 py-1.5 text-xs font-medium text-h3d-violet">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Rodin Gen-2.5 is live — controllable, production-ready 3D
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="font-display mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
              Create 3D Models
              <br />
              <span className="h3d-gradient-text">The Easy Way</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-h3d-muted sm:text-lg">
              Meet Hyper3D, the world&rsquo;s highest-quality, most controllable AI 3D model
              generator. Turn text prompts or images into detailed 3D assets in seconds — no 3D
              experience required.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="relative h-12 overflow-hidden rounded-full h3d-gradient-primary px-7 text-sm font-bold text-white shadow-[0_0_30px_rgba(133,132,255,0.45)] hover:opacity-90"
                onClick={() => onGenerate({ prompt: "", mode: "text-to-3d", effort: "medium", controlNet: null, free: false })}
              >
                Start Creating
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/4 px-7 text-sm font-semibold text-white/85 hover:bg-white/10"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                <span className="flex" aria-label="Trustpilot rating 4.1 out of 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i < 4 ? "fill-h3d-gold text-h3d-gold" : "fill-h3d-gold/40 text-h3d-gold/40",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                4.1/5 · trusted by creators and teams building real 3D assets
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRUST_LOGOS.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-white/6 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[11px] font-medium tracking-wide text-white/40 grayscale"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* right — interactive demo panel */}
        <Reveal delay={0.15} className="relative">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(133,132,255,0.18),transparent)] blur-2xl"
          />
          <DemoPanel onGenerate={onGenerate} className="relative" />
        </Reveal>
      </div>
    </section>
  );
}
