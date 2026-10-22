"use client";

/**
 * Orientation popup — the reference's per-image direction picker
 * (DOM-recon 2026-10-22, newrodin_oripopup__OgHAA):
 *
 *  - opened by clicking a thumbnail in the upload strip
 *  - 272px glass panel anchored at the strip's right edge: title
 *    "Select the direction of this image" (12px semibold), X close,
 *    3-column grid of 80×80 items (64px glyph + 11px label)
 *  - 11 options: Front Left / Front / Front Right / Left / UP / Right /
 *    Back Left / Back / Back Right / Down / Unknown — Unknown default-active
 *    with a border-[#fff] ring (reference default)
 *  - helper hint above: "Images that have been set with Direction will help
 *    the model understand your object."
 *  - picking a direction applies immediately (no confirm step)
 */
import { ArrowDownToLine, ArrowUpToLine, Navigation2, X } from "lucide-react";

import { DIRECTION_LABELS, type ViewDirection } from "@/lib/direction-picker";
import { cn } from "@/lib/utils";

/* compass rotations for the horizontal directions (Navigation2 points up) */
const ROTATIONS: Partial<Record<ViewDirection, string>> = {
  back: "rotate-0",
  "back-right": "rotate-45",
  right: "rotate-90",
  "front-right": "rotate-135",
  front: "rotate-180",
  "front-left": "-rotate-135",
  left: "-rotate-90",
  "back-left": "-rotate-45",
};

/* the reference's popup labels (UP upper-cased, Unknown last) */
const POPUP_ORDER: { dir: ViewDirection; label: string; className?: string }[] = [
  { dir: "front-left", label: "Front Left" },
  { dir: "front", label: "Front" },
  { dir: "front-right", label: "Front Right" },
  { dir: "left", label: "Left" },
  { dir: "up", label: "UP" },
  { dir: "right", label: "Right" },
  { dir: "back-left", label: "Back Left" },
  { dir: "back", label: "Back" },
  { dir: "back-right", label: "Back Right" },
  { dir: "down", label: "Down", className: "col-start-1 justify-self-center" },
  { dir: "unknown", label: "Unknown", className: "col-start-2 justify-self-center" },
];

function DirectionGlyph({ dir }: { dir: ViewDirection }) {
  const rot = ROTATIONS[dir];
  if (dir === "up") {
    return <ArrowUpToLine className="size-6 text-white/75" aria-hidden="true" />;
  }
  if (dir === "down") {
    return <ArrowDownToLine className="size-6 text-white/75" aria-hidden="true" />;
  }
  if (dir === "unknown") {
    return <span className="text-xl font-bold text-white/75" aria-hidden="true">?</span>;
  }
  return <Navigation2 className={cn("size-6 text-white/75", rot)} aria-hidden="true" />;
}

export function OrientationPopup({
  imageLabel,
  direction,
  onPick,
  onClose,
}: {
  imageLabel: string;
  direction: ViewDirection;
  onPick: (dir: ViewDirection) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* click-away layer */}
      <div className="fixed inset-0 z-[70]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label={`Select the direction of this image (${imageLabel})`}
        className="fixed left-1/2 top-1/2 z-[71] w-[292px] -translate-x-1/2 -translate-y-1/2 rounded-[19px] border border-white/12 bg-[rgba(28,26,32,0.92)] p-4 backdrop-blur-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        {/* helper hint (reference tooltip copy, shortened) */}
        <p className="mb-2 text-center text-[10.5px] leading-snug text-white/45">
          Images that have been set with Direction will help the model understand your object.
        </p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-left text-[12px] font-semibold text-white/95">
            Select the direction of this image
          </h3>
          <button
            type="button"
            aria-label="Close direction picker"
            onClick={onClose}
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:text-white"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </div>
        <div role="radiogroup" aria-label="Image direction" className="mt-3 grid grid-cols-3 gap-2">
          {POPUP_ORDER.map(({ dir, label, className }) => {
            const active = direction === dir;
            return (
              <button
                key={dir}
                type="button"
                role="radio"
                aria-checked={active}
                title={DIRECTION_LABELS[dir]}
                onClick={() => onPick(dir)}
                className={cn(
                  "flex h-[80px] w-[80px] flex-col items-center justify-center gap-1 rounded-[14px] border transition-colors",
                  className,
                  active
                    ? "border-white bg-white/[0.12]"
                    : "border-transparent bg-white/[0.05] hover:bg-white/[0.1]",
                )}
              >
                <DirectionGlyph dir={dir} />
                <span className="whitespace-nowrap text-[11px] font-medium leading-none text-white/70">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
