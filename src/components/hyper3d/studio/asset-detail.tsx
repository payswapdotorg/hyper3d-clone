"use client";

/**
 * Asset detail — the reference's gallery-tile detail view
 * (UX-recon 2026-10-22, agent-walked): clicking a Featured tile on the
 * reference opens /workspace/rodin/{uuid} — a large light card over the
 * workspace:
 *  - header: author avatar + name, link (Copy link) + heart (like) actions
 *  - left: large square preview
 *  - right rail:
 *      · Geometry — tag chips (model, effort, descriptive tags)
 *      · Material — thumbnail, prompt text, "PBR Temperature" control
 *      · Pack — Sim-Ready / usdz toggles, format checkboxes
 *        (.obj .fbx .glb .usdz .stl), resolution 2K/4K
 *      · footer actions: Send + gradient Download
 *
 * Honest wiring: this clone's Featured tiles are its own demo renders —
 * Download really downloads the render file; like/copy/link actions give
 * the reference-parity toast; format toggles are local card state.
 */
import { useEffect, useState } from "react";
import { Check, Heart, Link2, Loader2, Send, Thermometer } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface AssetDetailData {
  src: string;
  title: string;
  author: string;
  likes: number;
  model: string;
  effort: string;
  tags: string[];
  prompt: string;
  /** Task 48: the DB task uuid — present when the tile came from the live
   *  gallery (likes become real). */
  uuid?: string;
}

const FORMATS = [".obj", ".fbx", ".glb", ".usdz", ".stl"] as const;

export function AssetDetail({
  asset,
  onClose,
  onToggleLike,
}: {
  asset: AssetDetailData;
  onClose: () => void;
  /** Task 48: real like toggle (POST /api/task/:uuid/like, resolved by the
   *  studio — returns the authoritative liked/count or null on failure). */
  onToggleLike?: (asset: AssetDetailData) => Promise<{ liked: boolean; num_like: number } | null>;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(asset.likes);
  const [likeBusy, setLikeBusy] = useState(false);
  const [formats, setFormats] = useState<string[]>([".glb"]);
  const [simReady, setSimReady] = useState(true);
  const [usdz, setUsdz] = useState(false);
  const [resolution, setResolution] = useState<"2K" | "4K">("4K");
  const [temp, setTemp] = useState(50);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const download = async () => {
    setDownloading(true);
    try {
      const res = await fetch(asset.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${asset.title.toLowerCase().replace(/\s+/g, "-")}${formats[0] ?? ".png"}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started", { description: `${asset.title} — demo render (${formats.join(" ")} selected)` });
    } catch {
      toast.error("Download failed", { description: "The demo render could not be fetched." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${asset.title} by ${asset.author}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[2050] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-8"
    >
      <div className="flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[26px] bg-[#f4f2f5] shadow-2xl">
        {/* header — author + like/copy actions (reference: light card, dark text) */}
        <div className="flex items-center gap-3 border-b border-black/8 px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#2a222e] text-sm font-bold text-white">
            {asset.author.replace("Rodin ", "").slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1c1b22]">{asset.title}</p>
            <p className="truncate text-xs text-[#1c1b22]/60">{asset.author}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Copy link"
              onClick={() => {
                void navigator.clipboard?.writeText(`${window.location.origin}/#${asset.title.toLowerCase().replace(/\s+/g, "-")}`);
                toast.info("Copy link", { description: "Asset link copied — demo assets are local to this clone." });
              }}
              className="flex size-9 items-center justify-center rounded-full bg-black/[0.06] text-[#1c1b22]/70 transition-colors hover:bg-black/10"
            >
              <Link2 className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={liked ? "Unlike" : "Like"}
              aria-pressed={liked}
              disabled={likeBusy}
              onClick={async () => {
                /* Task 48: real toggle when the studio provides the backend
                 * (DB-backed tile); local-only flip otherwise. */
                if (!onToggleLike) {
                  setLiked((v) => !v);
                  return;
                }
                setLikeBusy(true);
                const res = await onToggleLike(asset);
                setLikeBusy(false);
                if (res) {
                  setLiked(res.liked);
                  setLikes(res.num_like);
                }
              }}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-colors",
                liked ? "bg-[#ff5f7e]/15 text-[#ff5f7e]" : "bg-black/[0.06] text-[#1c1b22]/70 hover:bg-black/10",
              )}
            >
              <Heart className={cn("size-4", liked && "fill-[#ff5f7e]")} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Close asset detail"
              onClick={onClose}
              className="ml-1 flex size-9 items-center justify-center rounded-full bg-black/[0.06] text-xl leading-none text-[#1c1b22]/70 transition-colors hover:bg-black/10"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1.05fr_1fr]">
          {/* preview */}
          <div className="relative min-h-[280px] bg-[#e8e4ec] md:min-h-[420px]">
            <img src={asset.src} alt={`${asset.title} — demo render preview`} className="absolute inset-0 h-full w-full object-cover" />
          </div>

          {/* details rail */}
          <div className="flex flex-col gap-4 p-5">
            {/* Geometry */}
            <section aria-label="Geometry">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1b22]/50">Geometry</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[asset.model, asset.effort, ...asset.tags].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#1c1b22]/12 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1c1b22]/75">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Material */}
            <section aria-label="Material">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1b22]/50">Material</h3>
              <div className="mt-2 flex gap-3 rounded-xl bg-white p-3">
                <img src={asset.src} alt="" aria-hidden="true" className="size-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#1c1b22]/60">PROMPT</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#1c1b22]">{asset.prompt}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Thermometer className="size-3.5 shrink-0 text-[#1c1b22]/50" aria-hidden="true" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      aria-label="PBR Temperature"
                      className="h-1 w-24 accent-[#7c5ca8]"
                    />
                    <span className="text-[10px] font-semibold text-[#1c1b22]/55">{temp < 34 ? "Cool" : temp > 66 ? "Warm" : "Neutral"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pack */}
            <section aria-label="Pack">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1b22]/50">Pack</h3>
              <div className="mt-2 space-y-2.5 rounded-xl bg-white p-3">
                <div className="flex flex-wrap gap-4">
                  {(
                    [
                      ["Sim-Ready", simReady, setSimReady] as const,
                      ["usdz", usdz, setUsdz] as const,
                    ]
                  ).map(([label, val, set]) => (
                    <button
                      key={label}
                      type="button"
                      role="switch"
                      aria-checked={val}
                      onClick={() => set(!val)}
                      className="flex items-center gap-2 text-xs font-semibold text-[#1c1b22]/80"
                    >
                      <span
                        className={cn(
                          "relative h-4 w-7 rounded-full transition-colors",
                          val ? "bg-[#7c5ca8]" : "bg-[#1c1b22]/15",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 size-3 rounded-full bg-white transition-all",
                            val ? "left-3.5" : "left-0.5",
                          )}
                        />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="checkbox"
                      aria-checked={formats.includes(f)}
                      onClick={() => setFormats((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]))}
                      className="flex items-center gap-1.5 font-mono text-[11px] text-[#1c1b22]/75"
                    >
                      <span
                        className={cn(
                          "flex size-3.5 items-center justify-center rounded-[4px] border",
                          formats.includes(f) ? "border-[#7c5ca8] bg-[#7c5ca8]" : "border-[#1c1b22]/25",
                        )}
                      >
                        {formats.includes(f) && <Check className="size-2.5 text-white" aria-hidden="true" />}
                      </span>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#1c1b22]/55">Resolution</span>
                  {(["2K", "4K"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResolution(r)}
                      aria-pressed={resolution === r}
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold transition-colors",
                        resolution === r ? "bg-[#1c1b22] text-white" : "bg-black/[0.06] text-[#1c1b22]/65",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-black/8 px-5 py-3.5">
          <button
            type="button"
            onClick={() => toast.info("Send", { description: "Sending to external tools is reference-parity chrome in this clone." })}
            className="flex h-10 items-center gap-2 rounded-full border border-[#1c1b22]/20 px-5 text-sm font-bold text-[#1c1b22]/80 transition-colors hover:border-[#1c1b22]/40"
          >
            <Send className="size-3.5" aria-hidden="true" /> Send
          </button>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(112.97deg,#8b5cf6,#ec4899)] px-6 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
