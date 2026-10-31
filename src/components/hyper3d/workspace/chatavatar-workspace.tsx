"use client";

/**
 * ChatAvatar workspace (t74) — the reference's avatar product surface at
 * /workspace/chatavatar, probed live 2026-10-31 (agent-walked):
 *
 *   V0.7 (Beta)
 *   "Progressive Generation of Animatable 3D Faces under Text/Image
 *    Guidance"
 *   image upload card ("Drag & drop or choose images to upload",
 *   "A clear portrait with bright lighting and no shadows works best.")
 *   "Generate from Text" card ("Describe the Avatar you want to create")
 *   a Featured gallery of the reference's public avatar cards
 *
 * Honest wiring: this clone has no face-generation model. The Generate
 * action says so plainly (toast) and points at the real studio surface
 * that IS implemented (image-to-3D at /workspace/rodin). The Featured
 * gallery reproduces the reference's own public featured set (observed
 * 2026-10-31 — usernames, like counts, prompt titles) clearly labeled
 * as the reference's, because a clone gallery of avatars this clone
 * never generated would be a lie. The header's "Plug-in" action keeps
 * the reference's DCC add-on docs target (the footer plug-ins pattern).
 */

import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, ImagePlus, Type, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { ProductWorkspaceShell } from "./product-workspace-shell";
import {
  CHATAVATAR_FEATURED,
  CHATAVATAR_TAGLINE,
  CHATAVATAR_TIP,
  CHATAVATAR_VERSION,
} from "@/lib/workspace-routes";

function honestGenerateToast(kind: "image" | "text") {
  toast.info("ChatAvatar generation", {
    description:
      kind === "image"
        ? "The reference's animatable-face model is not part of this clone — no avatar is generated from your image. The honest equivalent that IS real here: the Rodin studio's image-to-3D."
        : "The reference's text-to-avatar model is not part of this clone — no avatar is generated from your prompt. The honest equivalent that IS real here: the Rodin studio's text-to-3D.",
  });
}

export function ChatAvatarWorkspace() {
  const [fromText, setFromText] = useState(false);
  const [prompt, setPrompt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <ProductWorkspaceShell
      activeProduct="ChatAvatar"
      secondaryAction={
        <a
          href="https://docs.deemos.dev/addon"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
          title="The reference's DCC add-on docs — external, honestly theirs."
        >
          Plug-in
        </a>
      }
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
        {/* version + tagline (the reference's own chrome) */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 font-mono text-[11px] font-bold text-violet-200">
            {CHATAVATAR_VERSION}
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
            {CHATAVATAR_TAGLINE.split(" under ")[0]}
          </h1>
          <p className="mt-1 text-sm text-white/50">under Text/Image Guidance</p>
        </div>

        {/* the two input modes (the reference's cards) */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {!fromText ? (
            <section
              aria-label="Generate from an image"
              className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center"
            >
              <ImagePlus className="size-8 text-white/35" aria-hidden="true" />
              <p className="text-sm font-semibold text-white/75">
                Drag &amp; drop or choose images to upload
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) honestGenerateToast("image");
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-400"
              >
                <UploadCloud className="size-4" aria-hidden="true" />
                Generate
              </button>
            </section>
          ) : (
            <section
              aria-label="Generate from text"
              className="flex min-h-[220px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-white/85">
                <Type className="size-4 text-violet-300" aria-hidden="true" />
                Describe the Avatar you want to create
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. A friendly barista with warm eyes and a linen apron"
                className="mt-3 w-full flex-1 resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/25 focus:border-violet-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => honestGenerateToast("text")}
                className="mt-3 self-end rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-400"
              >
                Generate
              </button>
            </section>
          )}

          {/* the mode switch (the reference's "Generate from Text" toggle) */}
          <section
            aria-label="Input mode"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Input mode
            </p>
            <div className="flex items-center gap-2" role="radiogroup" aria-label="Generation input">
              <button
                type="button"
                role="radio"
                aria-checked={!fromText}
                onClick={() => setFromText(false)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  !fromText
                    ? "border-violet-400/50 bg-violet-400/15 text-white"
                    : "border-white/10 text-white/60 hover:text-white"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={fromText}
                onClick={() => setFromText(true)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  fromText
                    ? "border-violet-400/50 bg-violet-400/15 text-white"
                    : "border-white/10 text-white/60 hover:text-white"
                }`}
              >
                Generate from Text
              </button>
            </div>
            <p className="max-w-[260px] text-xs leading-relaxed text-white/45">{CHATAVATAR_TIP}</p>
          </section>
        </div>

        {/* the honest capability note */}
        <p className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-200/80">
          Honest note: this clone reproduces the ChatAvatar surface, not its face-generation
          model. Nothing you upload or type here is sent anywhere, and no avatar is produced —
          the generation that IS real in this clone lives in the{" "}
          <Link href="/workspace/rodin" className="font-semibold underline underline-offset-2">
            Rodin studio
          </Link>
          .
        </p>

        {/* Featured — the reference's own public gallery, labeled as such */}
        <section aria-label="Featured avatars" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-white">Featured</h2>
            <p className="text-[11px] text-white/35">
              The reference&rsquo;s public featured set, observed 2026-10-31 — reproduced so the
              surface matches; this clone generates no avatars to feature.
            </p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CHATAVATAR_FEATURED.map((card, i) => (
              <li
                key={`${card.user}-${i}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div
                  aria-hidden="true"
                  className="flex h-28 items-center justify-center bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-transparent"
                >
                  <span className="font-display text-2xl font-bold text-white/25">
                    {card.user.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="px-3 py-2">
                  {card.title ? (
                    <p className="truncate text-xs font-semibold text-white/85" title={card.title}>
                      {card.title}
                    </p>
                  ) : (
                    <p className="truncate text-xs font-semibold text-white/85">{card.user}</p>
                  )}
                  <p className="mt-0.5 flex items-center justify-between text-[10px] text-white/40">
                    <span className="truncate">{card.user}</span>
                    <span className="ml-2 inline-flex shrink-0 items-center gap-1">
                      <Heart className="size-3 text-rose-300/70" aria-hidden="true" />
                      {card.likes} likes
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ProductWorkspaceShell>
  );
}
