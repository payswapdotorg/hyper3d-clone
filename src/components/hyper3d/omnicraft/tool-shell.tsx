"use client";

/**
 * Shared OmniCraft tool shell — the reference's tool pages
 * (/workspace/omnicraft/*) put a compact top bar (product breadcrumb, tool
 * title, free/local badge) above a controls-left / viewport-right split.
 * This shell reproduces that layout so each tool only ships its own logic.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolShell({
  title,
  tagline,
  local,
  badge,
  controls,
  viewport,
  footer,
}: {
  title: string;
  tagline: string;
  local: boolean;
  badge?: string;
  controls: ReactNode;
  viewport: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link
          href="/workspace/omnicraft"
          className="flex items-center gap-1.5 text-xs font-bold text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          OmniCraft
        </Link>
        <span className="text-white/20" aria-hidden="true">
          /
        </span>
        <h1 className="text-sm font-bold text-white">{title}</h1>
        <p className="hidden min-w-0 flex-1 truncate text-xs text-white/45 md:block">{tagline}</p>
        <span className="ml-auto flex items-center gap-2">
          {local && (
            <span
              className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
              title="Runs entirely in your browser — nothing is uploaded."
            >
              <Cpu className="size-3" aria-hidden="true" />
              Runs locally
            </span>
          )}
          {badge && (
            <span
              className="flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-300"
              title="Free in this clone."
            >
              <Sparkles className="size-3" aria-hidden="true" />
              {badge}
            </span>
          )}
        </span>
      </header>

      {/* body: controls | viewport */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 overflow-y-auto border-b border-white/10 bg-[#14151a] p-4 lg:w-[320px] lg:border-b-0 lg:border-r">
          {controls}
        </aside>
        <main className="relative min-h-[420px] flex-1 overflow-hidden">
          {viewport}
        </main>
      </div>

      {footer && (
        <footer className="border-t border-white/10 bg-[#17181c]/70 px-4 py-2 text-[11px] leading-relaxed text-white/40">
          {footer}
        </footer>
      )}
    </div>
  );
}

/** Section heading inside the controls column. */
export function ControlSection({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/50">{title}</h2>
        {hint && <p className="mt-0.5 text-[11px] leading-snug text-white/35">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

/** Slider row with a live value readout. */
export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-semibold text-white/70">{label}</span>
        <span className="font-mono text-[10px] text-white/45">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-400"
      />
    </label>
  );
}

/** Small ghost button used across the tools. */
export function GhostButton({
  children,
  onClick,
  disabled,
  title,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/75 transition-colors",
        "hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/[0.04]",
        className,
      )}
    >
      {children}
    </button>
  );
}
