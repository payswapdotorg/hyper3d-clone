"use client";

/**
 * ControlNet editor modal — the reference's three spatial-conditioning tabs
 * (2026-10-28 live recon: "Bounding Box ControlNet / Voxel ControlNet /
 * Point Cloud ControlNet", W×H×L inputs defaulting to 100/100/100, "Rotate
 * the model for better results" hint).
 *
 * Every control the user touches changes a value the engine consumes
 * (aspect / fill / anchors — see lib/controlnet.ts); nothing here is
 * decorative. The Bounding Box tab carries the reference's W×H×L inputs;
 * the Voxel tab is a toggleable front-view grid; the Point Cloud tab is a
 * click-to-place canvas. A live readout shows the derived constraint and
 * the planner hint that will ride along with the prompt.
 */
import { useMemo, useState } from "react";
import { Box, Boxes, ChartScatter, Grid3X3, RotateCw, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  deriveConstraints,
  constraintPromptLine,
  VOXEL_GRID,
  POINT_GRID,
  type ControlnetMode,
  type ControlnetState,
} from "@/lib/controlnet";

const TABS: { id: ControlnetMode; label: string; icon: typeof Box }[] = [
  { id: "bbox", label: "Bounding Box ControlNet", icon: Box },
  { id: "voxel", label: "Voxel ControlNet", icon: Grid3X3 },
  { id: "pointcloud", label: "Point Cloud ControlNet", icon: ChartScatter },
];

/**
 * Draft editor — mounted fresh on every dialog open (initializer reads the
 * committed state; no setState-in-effect sync needed). Unmounted on close,
 * so an aborted edit never leaks into the studio.
 */
function ControlnetEditor({
  initialTab,
  state,
  onApply,
  onClose,
}: {
  initialTab: ControlnetMode;
  state: ControlnetState | null;
  onApply: (state: ControlnetState | null) => void;
  onClose: () => void;
}) {
  // Editor draft — committed to the studio only on Apply.
  const [tab, setTab] = useState<ControlnetMode>(state?.mode ?? initialTab);
  const [w, setW] = useState(state?.mode === "bbox" ? state.w : 100);
  const [h, setH] = useState(state?.mode === "bbox" ? state.h : 100);
  const [l, setL] = useState(state?.mode === "bbox" ? state.l : 100);
  const [cells, setCells] = useState<Record<string, true>>(
    state?.mode === "voxel" ? state.cells : {},
  );
  const [points, setPoints] = useState<Record<string, true>>(
    state?.mode === "pointcloud" ? state.points : {},
  );

  const draft: ControlnetState = useMemo(
    () => (tab === "bbox" ? { mode: "bbox", w, h, l } : tab === "voxel" ? { mode: "voxel", cells } : { mode: "pointcloud", points }),
    [tab, w, h, l, cells, points],
  );
  const derived = deriveConstraints(draft);

  const numField = (label: string, value: number, set: (v: number) => void, max = 200) => (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-center font-mono text-[11px] uppercase tracking-wider text-h3d-muted">{label}</span>
      <input
        type="number"
        min={1}
        max={max}
        step={1}
        value={Number.isFinite(value) ? value : 100}
        onChange={(e) => {
          const v = Number(e.target.value);
          set(Number.isFinite(v) ? v : 100);
        }}
        className="h-11 rounded-lg border border-white/12 bg-black/40 text-center font-mono text-lg font-semibold text-white outline-none transition-colors focus:border-h3d-purple/60"
        aria-label={`${label} dimension`}
      />
    </label>
  );

  const toggleKey = (map: Record<string, true>, key: string): Record<string, true> => {
    const next = { ...map };
    if (next[key]) delete next[key];
    else next[key] = true;
    return next;
  };

  const clearTab = () => {
    if (tab === "voxel") setCells({});
    if (tab === "pointcloud") setPoints({});
    if (tab === "bbox") { setW(100); setH(100); setL(100); }
  };

  return (
    <div className="space-y-5">
      {/* tabs (reference panel wording) */}
      <div role="tablist" aria-label="ControlNet mode" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                tab === t.id
                  ? "border-h3d-purple/60 bg-h3d-purple/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white",
              )}
            >
              <t.icon className="size-3.5" aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
          {/* editor surface */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            {tab === "bbox" && (
              <div className="space-y-4">
                <p className="text-sm text-white/70">
                  Set the box the object should fill — wide and flat, tall and slim, or deep.
                </p>
                <div className="flex gap-3">
                  {numField("W", w, setW)}
                  {numField("H", h, setH)}
                  {numField("L", l, setL)}
                </div>
                {/* live proportion preview — a scaled rectangle mirroring W:H (front face) */}
                <div className="flex h-36 items-center justify-center" aria-hidden="true">
                  <div
                    className="rounded-md border-2 border-h3d-violet/70 bg-h3d-violet/12"
                    style={{
                      width: `${Math.max(14, Math.min(100, (w / 200) * 190))}px`,
                      height: `${Math.max(10, Math.min(100, (h / 200) * 120))}px`,
                      boxShadow: `${((l / 200) * 26).toFixed(1)}px ${((l / 200) * 14).toFixed(1)}px 0 -2px rgba(154, 106, 240, 0.25)`,
                    }}
                  />
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-white/40">
                  <RotateCw className="size-3" aria-hidden="true" />
                  Turn the preview or tweak dimensions for better results.
                </p>
              </div>
            )}

            {tab === "voxel" && (
              <div className="space-y-3">
                <p className="text-sm text-white/70">
                  Toggle cells to mark where the silhouette lives — its bounds set the shape.
                </p>
                <div
                  role="grid"
                  aria-label="Voxel editor, front view"
                  className="mx-auto grid w-fit gap-[3px] rounded-lg border border-white/10 bg-black/40 p-2"
                  style={{ gridTemplateColumns: `repeat(${VOXEL_GRID}, 26px)` }}
                >
                  {Array.from({ length: VOXEL_GRID * VOXEL_GRID }, (_, i) => {
                    const x = i % VOXEL_GRID;
                    const y = Math.floor(i / VOXEL_GRID);
                    const key = `${x},${y}`;
                    const on = Boolean(cells[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        role="gridcell"
                        aria-label={`cell ${x},${y}${on ? " marked" : ""}`}
                        aria-selected={on}
                        onClick={() => setCells((m) => toggleKey(m, key))}
                        className={cn(
                          "size-[26px] rounded-[4px] border transition-colors",
                          on
                            ? "border-h3d-violet/70 bg-h3d-violet/40"
                            : "border-white/8 bg-white/[0.03] hover:border-white/25 hover:bg-white/10",
                        )}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-[11px] text-white/40">
                  {Object.keys(cells).length} / {VOXEL_GRID * VOXEL_GRID} cells marked
                </p>
              </div>
            )}

            {tab === "pointcloud" && (
              <div className="space-y-3">
                <p className="text-sm text-white/70">
                  Click to drop anchor points tracing the outline you want.
                </p>
                <div
                  role="grid"
                  aria-label="Point cloud editor, front view"
                  className="mx-auto grid w-fit gap-[2px] rounded-lg border border-white/10 bg-black/40 p-2"
                  style={{ gridTemplateColumns: `repeat(${POINT_GRID}, 13px)` }}
                >
                  {Array.from({ length: POINT_GRID * POINT_GRID }, (_, i) => {
                    const x = i % POINT_GRID;
                    const y = Math.floor(i / POINT_GRID);
                    const key = `${x},${y}`;
                    const on = Boolean(points[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        role="gridcell"
                        aria-label={`slot ${x},${y}${on ? " anchored" : ""}`}
                        aria-selected={on}
                        onClick={() => setPoints((m) => toggleKey(m, key))}
                        className={cn(
                          "size-[13px] rounded-full border transition-colors",
                          on
                            ? "border-h3d-gold/80 bg-h3d-gold/70"
                            : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/15",
                        )}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-[11px] text-white/40">
                  {Object.keys(points).length} anchors placed
                </p>
              </div>
            )}
          </div>

          {/* derived-constraint readout (what the engine actually receives) */}
          <aside className="space-y-3" aria-label="Derived engine constraint">
            <div className="h3d-glass rounded-2xl p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">Engine receives</p>
              {derived ? (
                <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-white/80">
                  <li className="flex justify-between gap-2">
                    <span className="text-white/50">Proportions</span>
                    <span className="font-mono">
                      {derived.aspect.map((a) => Math.round(a)).join(" × ")}
                    </span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-white/50">Occupancy</span>
                    <span className="font-mono">{Math.round(derived.fill * 100)}%</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-white/50">Anchors</span>
                    <span className="font-mono">{derived.anchors}</span>
                  </li>
                </ul>
              ) : (
                <p className="mt-2.5 text-[12.5px] text-white/50">
                  Nothing yet — mark the {tab === "bbox" ? "dimensions" : tab === "voxel" ? "cells" : "points"} and the
                  constraint appears here.
                </p>
              )}
              {derived && (
                <p className="mt-3 rounded-lg border border-white/8 bg-black/30 px-3 py-2 font-mono text-[10.5px] leading-relaxed text-white/60">
                  {constraintPromptLine(derived)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearTab}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Clear this tab
            </button>
          </aside>
        </div>

        {/* footer actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onApply(null)}
            className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Remove constraint
          </button>
          <button
            type="button"
            disabled={!derived}
            onClick={() => {
              if (derived) onApply(draft);
              onClose();
            }}
            className={cn(
              "rounded-full px-6 py-2.5 text-sm font-bold text-white transition-opacity",
              derived
                ? "h3d-gradient-primary hover:opacity-90"
                : "cursor-not-allowed bg-white/10 opacity-50",
            )}
          >
            Apply constraint
          </button>
        </div>
    </div>
  );
}

export function ControlnetModal({
  open,
  onOpenChange,
  initialTab,
  state,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab: ControlnetMode;
  /** Current constraint state (null = none applied yet). */
  state: ControlnetState | null;
  /** Apply the edited state (null clears the constraint). */
  onApply: (state: ControlnetState | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h3d-glass-strong max-h-[90vh] overflow-y-auto border-white/15 bg-[#1e1b24]/95 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Boxes className="size-5 text-h3d-violet" aria-hidden="true" />
            ControlNet — spatial constraints
          </DialogTitle>
          <DialogDescription>
            Draw the volume your object should live in. The engine receives its proportions,
            occupancy, and silhouette detail — generation is shaped to fit.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ControlnetEditor
            initialTab={initialTab}
            state={state}
            onApply={onApply}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
