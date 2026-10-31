"use client";

/**
 * Video workspace (t74) — the reference's video product surface at
 * /workspace/video, probed live 2026-10-31 (agent-walked):
 *
 *   left asset rail: All Assets / Image (Text to Image, Image Editing,
 *     Image Enhancer) / Video (Text to Video, Image to Video, Transition)
 *   main card: "Image to Video" + description + Model (Default — Creator
 *     Limited Free) + Upload Image* ("Click to upload or drag and drop",
 *     "JPG, PNG, WebP (max 10MB)") + Prompt ("Describe your video in
 *     detail...") + Sound Effect switch + Resolution 720p + Duration 5 +
 *     "Generate Video  0.5 Credits"
 *   empty state: "No Videos Yet" / "Generate your first video using the
 *     form on the left. Your videos will appear here."
 *
 * Honest wiring: no video-generation backend exists in this clone —
 * Generate says so plainly (toast) and points at the real generation
 * surface (the Rodin studio). The rail items link this clone's real
 * routes (features pages / OmniCraft tool routes), with title notes on
 * the ones without a true equivalent.
 */

import { useRef, useState } from "react";
import Link from "next/link";
import { Clapperboard, UploadCloud, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { ProductWorkspaceShell } from "./product-workspace-shell";
import {
  VIDEO_CREDIT_COST,
  VIDEO_DURATIONS,
  VIDEO_EMPTY_STATE_BODY,
  VIDEO_EMPTY_STATE_HEADING,
  VIDEO_RAIL,
  VIDEO_RESOLUTIONS,
  VIDEO_UPLOAD_HINT,
} from "@/lib/workspace-routes";

export function VideoWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [soundEffect, setSoundEffect] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <ProductWorkspaceShell activeProduct="Video">
      <div className="flex min-h-0 flex-1 flex-col-reverse xl:flex-row">
        {/* the reference's left asset rail, honestly mapped */}
        <aside
          aria-label="Asset tools"
          className="w-full shrink-0 border-t border-white/10 bg-[#14151a] p-3 xl:w-[196px] xl:border-t-0 xl:border-r"
        >
          {VIDEO_RAIL.map((group) => (
            <nav key={group.group} aria-label={group.group} className="mb-3">
              {group.group === "All Assets" ? (
                group.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    title={l.note}
                    className="mb-2 block rounded-lg border border-violet-400/40 bg-violet-400/10 px-3 py-2 text-xs font-bold text-white"
                  >
                    {l.label}
                  </Link>
                ))
              ) : (
                <>
                  <p className="px-3 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                    {group.group}
                  </p>
                  <ul className="space-y-0.5">
                    {group.links.map((l) => {
                      const active = l.href === "/workspace/video" && l.label === "Image to Video";
                      return (
                        <li key={l.label}>
                          <Link
                            href={l.href}
                            title={l.note}
                            aria-current={active ? "page" : undefined}
                            className={`block truncate rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                              active
                                ? "bg-violet-400/15 text-white"
                                : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            {l.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </nav>
          ))}
        </aside>

        {/* the main surface: form + result area */}
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-8">
          <section aria-label="Image to Video form" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Clapperboard className="size-5 text-violet-300" aria-hidden="true" />
                  Image to Video
                </h1>
                <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/50">
                  Upload any image of your choice, tailor the storyline, adjust the pacing, and
                  define the stylistic tone to instantly create a vivid, cohesive video clip.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/50">
                Model: Default
                <span className="mt-0.5 block text-center text-[9px] font-medium text-violet-200/70">
                  Creator Limited Free
                </span>
              </span>
            </div>

            {/* upload */}
            <div className="mt-5">
              <p className="text-xs font-bold text-white/75">
                Upload Image<span className="text-rose-300">*</span>
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/30 px-4 py-7 text-center transition-colors hover:border-violet-400/40"
              >
                <UploadCloud className="size-7 text-white/35" aria-hidden="true" />
                <span className="text-sm font-semibold text-white/70">
                  Click to upload or drag and drop
                </span>
                <span className="text-[11px] text-white/35">{VIDEO_UPLOAD_HINT}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    toast.info("Image staged", {
                      description:
                        "Your image is only staged in this browser — the video model that would animate it is not part of this clone.",
                    });
                  }
                }}
              />
            </div>

            {/* prompt */}
            <div className="mt-4">
              <label htmlFor="video-prompt" className="text-xs font-bold text-white/75">
                Prompt
              </label>
              <textarea
                id="video-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your video in detail..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/25 focus:border-violet-400/50 focus:outline-none"
              />
            </div>

            {/* options row: sound / resolution / duration */}
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold text-white/75">
                  <Volume2 className="size-3.5 text-white/40" aria-hidden="true" />
                  Sound Effect
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEffect}
                  aria-label="Sound effect"
                  onClick={() => setSoundEffect((v) => !v)}
                  className={`mt-2 flex h-6 w-11 items-center rounded-full border transition-colors ${
                    soundEffect ? "border-violet-400/50 bg-violet-500/70" : "border-white/15 bg-white/10"
                  }`}
                >
                  <span
                    className={`ml-0.5 size-5 rounded-full bg-white transition-transform ${
                      soundEffect ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-white/75">Resolution</p>
                <div className="mt-2 flex gap-1.5">
                  {VIDEO_RESOLUTIONS.map((r) => (
                    <span
                      key={r}
                      className="rounded-lg border border-violet-400/50 bg-violet-400/15 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white/75">Duration</p>
                <div className="mt-2 flex gap-1.5">
                  {VIDEO_DURATIONS.map((d) => (
                    <span
                      key={d}
                      className="rounded-lg border border-violet-400/50 bg-violet-400/15 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="self-center text-[10px] text-white/35">seconds</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                toast.info("Video generation", {
                  description: `The reference's video model (and its ${VIDEO_CREDIT_COST}-credit cost) is not part of this clone — no video is rendered. The generation that IS real here lives in the Rodin studio.`,
                })
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-400"
            >
              Generate Video
              <span className="rounded-md bg-black/25 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-100">
                {VIDEO_CREDIT_COST} Credits
              </span>
            </button>
          </section>

          {/* the empty result area (the reference's honest guest state) */}
          <section
            aria-label="Your videos"
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center"
          >
            <h2 className="text-base font-bold text-white/80">{VIDEO_EMPTY_STATE_HEADING}</h2>
            <p className="max-w-sm text-xs leading-relaxed text-white/40">
              {VIDEO_EMPTY_STATE_BODY}
            </p>
            <p className="mt-3 max-w-md rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-[11px] leading-relaxed text-amber-200/80">
              Honest note: this clone reproduces the video surface, not the video model. No video
              will ever appear here — the real generation in this clone is 3D, in the{" "}
              <Link href="/workspace/rodin" className="font-semibold underline underline-offset-2">
                Rodin studio
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </ProductWorkspaceShell>
  );
}
