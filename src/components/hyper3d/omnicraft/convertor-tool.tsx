"use client";

/**
 * OmniCraft Format Convertor — the reference's tool for re-exporting models,
 * here wired to the clone's REAL six-format export pipeline. Lists your own
 * generated tasks (auth-gated), previews the exact GLB the export endpoint
 * serves, and downloads any of the six formats — the same bytes the studio's
 * export buttons produce, byte-for-byte.
 */
import { useCallback, useEffect, useState } from "react";
import { Boxes, Download, LogIn } from "lucide-react";
import { ControlSection, ToolShell } from "./tool-shell";
import { ModelViewer } from "@/components/hyper3d/studio/model-viewer";
import { EXPORT_FORMATS, type ExportFormat } from "@/lib/exporters";
import { STUDIO_PATH } from "@/lib/studio-path";
import { useSession } from "@/lib/use-session";

interface MineCard {
  task_uuid: string;
  prompt: string;
  title?: string | null;
  user_state: string;
  /** t56: top-level passthrough from buildCompactCard. */
  confirmed?: boolean;
  pay_by_result?: boolean;
  engine_used?: string | null;
  settings?: {
    pay_by_result?: boolean;
    confirmed?: boolean;
    engine_used?: string;
  } | null;
}

const EXPORTABLE_STATES = new Set(["done", "DonePreview"]);

export function ConvertorTool() {
  const { user, loading } = useSession();
  const [tasks, setTasks] = useState<MineCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/task/list?filter=mine", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`list failed: ${res.status}`);
        return (await res.json()) as MineCard[];
      })
      .then((rows) => {
        if (cancelled) return;
        setTasks(rows);
        setSelected(rows.find((t) => EXPORTABLE_STATES.has(t.user_state))?.task_uuid ?? rows[0]?.task_uuid ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tasks");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const refresh = useCallback(() => {
    setTasks(null);
    setError(null);
    // Refetch by toggling the effect: simplest honest reset.
    window.location.reload();
  }, []);

  const current = tasks?.find((t) => t.task_uuid === selected) ?? null;
  const complete = current ? EXPORTABLE_STATES.has(current.user_state) : false;
  // Confirm-first gate: compact cards carry confirmed/pay_by_result at the
  // top level (buildCompactCard); the settings object is a legacy fallback.
  const gated = Boolean(
    current &&
      (current.pay_by_result ?? current.settings?.pay_by_result) === true &&
      !(current.confirmed ?? current.settings?.confirmed),
  );

  const controls = (
    <>
      <ControlSection
        title="Your models"
        hint="Every task you have generated in this clone. Select one to convert."
      >
        {loading && <p className="text-xs text-white/45">Checking your session…</p>}
        {!loading && !user && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
            <p className="font-bold text-white/80">Sign in required</p>
            <p className="mt-1">
              The convertor lists <i>your</i> generated tasks, so it needs a session. Sign in at the
              studio — generation history syncs automatically.
            </p>
            <a
              href="/?auth=signin"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-[11px] font-bold text-violet-200 transition-colors hover:bg-violet-400/20"
            >
              <LogIn className="size-3.5" aria-hidden="true" />
              Open the studio to sign in
            </a>
          </div>
        )}
        {error && <p className="text-xs text-red-300/80">{error}</p>}
        {tasks && tasks.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
            <p className="font-bold text-white/80">No tasks yet</p>
            <p className="mt-1">Generate a model at the studio first — it will appear here for conversion.</p>
            <a href={STUDIO_PATH} className="mt-2 inline-block text-[11px] font-bold text-violet-300 hover:text-violet-200">
              Go to the studio →
            </a>
          </div>
        )}
        {tasks && tasks.length > 0 && (
          <ul className="space-y-1.5">
            {tasks.map((t) => {
              const tComplete = EXPORTABLE_STATES.has(t.user_state);
              return (
                <li key={t.task_uuid}>
                  <button
                    type="button"
                    onClick={() => setSelected(t.task_uuid)}
                    className={`flex w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-colors ${
                      selected === t.task_uuid
                        ? "border-violet-400/50 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    }`}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
                      {tComplete ? (
                        <img
                          src={`/api/task/${t.task_uuid}/preview`}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[9px] font-bold text-white/35">
                          {t.user_state}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-bold text-white/85">
                        {t.title || t.prompt || "Untitled task"}
                      </span>
                      <span className="block truncate text-[10px] text-white/40">
                        {tComplete ? "ready to convert" : t.user_state}
                        {t.engine_used ?? t.settings?.engine_used ? ` · ${t.engine_used ?? t.settings?.engine_used}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {tasks && tasks.length > 0 && (
          <button
            type="button"
            onClick={refresh}
            className="w-full text-[10px] font-bold text-white/40 underline-offset-2 hover:text-white/80 hover:underline"
          >
            refresh list
          </button>
        )}
      </ControlSection>

      <ControlSection
        title="Convert"
        hint={complete ? "Six real formats, converted from the same stored model the preview shows." : "Select a completed task to unlock conversion."}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {EXPORT_FORMATS.map((f: ExportFormat) => {
            const enabled = complete && !gated;
            return enabled ? (
              <a
                key={f}
                href={`/api/task/${selected}/export?format=${f}`}
                download
                className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-[11px] font-bold uppercase text-white/75 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-white"
                title={`Download ${f.toUpperCase()}`}
              >
                <Download className="size-3" aria-hidden="true" />
                {f}
              </a>
            ) : (
              <span
                key={f}
                aria-disabled="true"
                title={gated ? "Confirm this pay-by-result task first (studio → Confirm & Export)" : "Task not complete"}
                className="flex cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2 text-[11px] font-bold uppercase text-white/25"
              >
                <Download className="size-3" aria-hidden="true" />
                {f}
              </span>
            );
          })}
        </div>
        {gated && (
          <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-2 text-[11px] leading-relaxed text-amber-200/90">
            This is a pay-by-result task — confirm it in the studio (Confirm &amp; Export, exactly 1 credit) to
            unlock downloads here too. Same rule as the reference.
          </p>
        )}
      </ControlSection>
    </>
  );

  return (
    <ToolShell
      title="Format Convertor"
      tagline="Your generated models, in any of six formats — same pipeline as the studio's exports."
      local={false}
      badge="6 real formats"
      controls={controls}
      viewport={
        <div className="relative h-full w-full">
          {current && complete && !gated ? (
            <ModelViewer
              url={`/api/task/${current.task_uuid}/export?format=glb`}
              textureMode="shaded"
              autoRotate
              className="h-full w-full"
            />
          ) : current && complete && gated ? (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <Boxes className="mx-auto size-8 text-white/30" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-white/80">Preview held until confirmation</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  Pay-by-result tasks preview via their poster in the studio until you confirm — this convertor
                  follows the same rule instead of leaking the model early.
                </p>
                <img
                  src={`/api/task/${current.task_uuid}/preview`}
                  alt="Task poster"
                  className="mx-auto mt-3 max-h-40 rounded-lg border border-white/10 object-contain"
                />
              </div>
            </div>
          ) : current ? (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <p className="max-w-xs text-sm text-white/50">
                Task is <span className="font-bold text-white/75">{current.user_state}</span> — conversion unlocks
                when it reaches DonePreview.
              </p>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <p className="max-w-xs text-sm text-white/45">
                {user ? "Select a task from the list to preview and convert it." : "Sign in to list your tasks."}
              </p>
            </div>
          )}
        </div>
      }
      footer={
        <>
          Honest engine note: the preview streams the exact GLB the export endpoint serves, and each format button
          downloads a real conversion (GLTFExporter / OBJExporter / STLExporter / USDZExporter / ASCII FBX 7.3) of
          the same stored model — byte-identical to the studio&apos;s export buttons. Pay-by-result gating matches
          the reference&apos;s confirm-first rule.
        </>
      }
    />
  );
}
