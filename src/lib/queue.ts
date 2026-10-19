/**
 * In-process job runner: takes an enqueued task through
 * created→queued→processing→DonePreview (or failed), paced by effort with
 * agentic-style status messages, then persists the generated spec, renders
 * the poster and records usage.
 *
 * The generation engine is injectable (setEngine) so tests can run the full
 * pipeline without the network; pacing can be disabled (setPacing) so tests
 * complete immediately.
 */
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { buildScene } from "./mesh-builder";
import { renderPoster } from "./render-preview";
import { getProvider } from "./providers";
import { TaskMachine, isComplete } from "./task-machine";
import { safeParseSceneSpec, type SceneSpec } from "./spec";
import type { Prisma } from "@prisma/client";

export type EffortId = "extreme-low" | "low" | "medium" | "high" | "extreme-high";

export const EFFORTS: { id: EffortId; label: string; seconds: number; paceMs: number; blurb: string }[] = [
  { id: "extreme-low", label: "Extreme-Low", seconds: 4, paceMs: 4_000, blurb: "Fastest drafts, minimal refinement" },
  { id: "low", label: "Low", seconds: 9, paceMs: 9_000, blurb: "Quick iterations with basic detail" },
  { id: "medium", label: "Medium", seconds: 20, paceMs: 20_000, blurb: "Balanced quality and turnaround" },
  { id: "high", label: "High", seconds: 40, paceMs: 40_000, blurb: "Detailed geometry and materials" },
  { id: "extreme-high", label: "Extreme-High", seconds: 80, paceMs: 80_000, blurb: "Maximum fidelity, full pass" },
];

export function effortPaceMs(effort: string | undefined): number {
  return EFFORTS.find((e) => e.id === effort)?.paceMs ?? 20_000;
}

/** Agentic-style status messages, mirroring the real product's pills. */
export const AGENTIC_MESSAGES: string[] = [
  "I'm taking a closer look at your reference. I'm following the outer edge of the object to understand its shape.",
  "I'm acquiring attachment heights in relation to the main body.",
  "I'm reviewing the layout from a wider view to lock the proportions.",
  "I'm refining the silhouette before committing to the final geometry.",
  "I'm checking surface continuity and part alignment against the reference.",
  "I'm finalizing the mesh and preparing your preview.",
];

const STANDARD_MESSAGES: string[] = [
  "Analyzing your prompt and blocking out the base shape…",
  "Generating geometry and refining proportions…",
  "Applying materials and palette…",
  "Finalizing the mesh and preparing your preview…",
];

export interface EngineInput {
  id: string;
  type: string;
  prompt: string;
  effort: string;
  imageBase64?: string;
  imageMime?: string;
}

export interface EngineOutput {
  spec: SceneSpec;
  usage: { used_tokens: number };
}

export type TaskEngine = (input: EngineInput) => Promise<EngineOutput>;

/* ------------------------------ engine DI ------------------------------ */

let currentEngine: TaskEngine | null = null;
let pacingEnabled = true;

/** Default engine: the provider pipeline (ProviderA / env-keyed ProviderB). */
const defaultEngine: TaskEngine = async (input) => {
  const provider = getProvider();
  const result = await provider.generate({
    prompt: input.prompt,
    imageBase64: input.imageBase64,
    imageMime: input.imageMime,
  });
  return { spec: result.spec, usage: { used_tokens: result.usage.used_tokens } };
};

export function setEngine(engine: TaskEngine | null): void {
  currentEngine = engine;
}

export function setPacing(enabled: boolean): void {
  pacingEnabled = enabled;
}

/* ------------------------------ file layout ------------------------------ */
/* Deployment adaptation: posters/inputs are persisted as Prisma Bytes
 * (Task.posterBytes / Task.inputBytes) so the pipeline has zero filesystem
 * dependencies — identical behavior on a laptop and on a serverless host
 * (Vercel) with an ephemeral disk. */

/* ------------------------------ runner ------------------------------ */

const running = new Set<string>();

export interface EnqueueOptions {
  imageBase64?: string;
  imageMime?: string;
  /** Skip artificial pacing — serverless resume path (complete fast). */
  fast?: boolean;
}

/** Awaited pipeline run — for after() callers that must carry the pipeline
 * to completion inside the invocation's lifetime (serverless safety:
 * a bare fire-and-forget run can be frozen mid-flight when the platform
 * suspends the process after the response, wedging the task forever). */
export async function runPipelineNow(taskId: string, options: EnqueueOptions = {}): Promise<void> {
  if (running.has(taskId)) return;
  running.add(taskId);
  try {
    await runTask(taskId, options);
  } finally {
    running.delete(taskId);
  }
}

/** Fire-and-forget: run the generation pipeline for a task row. */
export function enqueue(taskId: string, options: EnqueueOptions = {}): void {
  void runPipelineNow(taskId, options).catch(() => undefined);
}

async function updateSettings(taskId: string, mutate: (settings: Record<string, unknown>) => void): Promise<void> {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return;
  const settings = { ...((task.settings as Record<string, unknown> | null) ?? {}) };
  mutate(settings);
  await db.task.update({
    where: { id: taskId },
    data: { settings: settings as unknown as Prisma.InputJsonValue },
  });
}

async function runTask(taskId: string, options: EnqueueOptions): Promise<void> {
  const startedAt = Date.now();
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || isComplete(task.userState as never) || task.userState === "failed") return;

  const machine = new TaskMachine(task.userState as never);
  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  const effort = typeof settings.effort === "string" ? settings.effort : "medium";
  // Serverless deployment adaptation: cap the artificial effort pacing so a
  // single maxDuration-bounded invocation (Vercel) can carry the whole
  // pipeline; local/standalone keeps the faithful pace. The resume path
  // (options.fast) skips pacing entirely — the task already lived through
  // its pacing window before its invocation died.
  const serverless = typeof process !== "undefined" && Boolean(process.env.VERCEL);
  const paceMs = options.fast ? 0 : serverless ? Math.min(effortPaceMs(effort), 40_000) : effortPaceMs(effort);
  const messages = task.type === "RodinAgentic" ? AGENTIC_MESSAGES : STANDARD_MESSAGES;

  // Self-healing image inputs (serverless resume): the reference image is
  // persisted on the task row (inputBytes), so a resumed run rebuilds the
  // engine inputs from storage instead of relying on the original request.
  const imageBase64 =
    options.imageBase64 ?? (task.inputBytes ? Buffer.from(task.inputBytes).toString("base64") : undefined);
  const imageMime =
    options.imageMime ?? (typeof settings.input_mime === "string" ? settings.input_mime : undefined);

  /** Finalize: poster render + DonePreview persist (idempotent by state). */
  const finalize = async (spec: SceneSpec, usedTokens: number, wallStart: number): Promise<void> => {
    // Render the poster from the real geometry.
    const group = buildScene(spec);
    const poster = renderPoster(group);

    const elapsedSeconds = Math.max(0.05, (Date.now() - wallStart) / 1000);
    const usage = {
      elapsed_seconds: Number(elapsedSeconds.toFixed(3)),
      used_tokens: usedTokens,
    };
    if (machine.can("DonePreview")) machine.to("DonePreview");
    machine.recordUsage(usage);

    await db.task.update({
      where: { id: taskId },
      data: {
        previewImageUrl: `/api/task/${taskId}/preview`,
        modelUrl: `/api/task/${taskId}/export?format=glb`,
        videoUrl: null, // documented deviation: no turntable webm in the clone
        usage: usage as unknown as Prisma.InputJsonValue,
        userState: "DonePreview",
        generationUuid: randomUUID(),
        generateTime: new Date(),
        posterBytes: new Uint8Array(poster), // blob-in-DB (serverless-safe): Prisma Bytes field takes Uint8Array
        // engine2 stamp: a server-run completion of a neural task is by
        // definition a fallback run (the neural path is client-driven and
        // POSTs its mesh via /mesh, which sets engineUsed itself); fast-tier
        // tasks stamp "fast" for the card badge. Legacy tasks stay null.
        engineUsed: settings.engine === "neural" || settings.engine === "fast" ? "fast" : null,
      },
    });
    await updateSettings(taskId, (s) => {
      delete s.progress;
    });
  };

  try {
    // Re-entry safe (serverless freeze recovery): a resumed task may already
    // sit in queued/processing — only advance states the machine allows.
    if (machine.can("queued")) {
      machine.to("queued");
      await db.task.update({ where: { id: taskId }, data: { userState: "queued" } });
    }
    if (machine.can("processing")) {
      machine.to("processing");
      await db.task.update({ where: { id: taskId }, data: { userState: "processing", step: "ModelGenerate" } });
    }

    // COMPLETION-RESUME: a previous invocation already persisted the
    // generated spec (spec-first persistence below) but died before
    // finalizing. Finish from the stored spec — deterministic, no re-billing
    // of the AI pipeline. used_tokens was parked in settings.spec_tokens.
    if (task.spec) {
      const stored = safeParseSceneSpec(task.spec);
      if (stored.ok) {
        await finalize(
          stored.spec,
          typeof settings.spec_tokens === "number" ? settings.spec_tokens : 0,
          startedAt,
        );
        return;
      }
      // A stored spec that no longer validates is a genuine bug; fall
      // through to a fresh engine run rather than failing the task.
    }

    // Progress ticker: paced messages while the engine works. `at` is the
    // liveness heartbeat consumed by resumeStaleTask (serverless recovery).
    let ticker: ReturnType<typeof setInterval> | null = null;
    const tick = async () => {
      const elapsed = Date.now() - startedAt;
      const ratio = paceMs > 0 ? elapsed / paceMs : Infinity;
      const percent = Math.min(95, Math.round(ratio * 100));
      const messageIndex = Math.min(messages.length - 1, Math.floor(ratio * messages.length));
      await updateSettings(taskId, (s) => {
        s.progress = { message: messages[messageIndex], percent, at: Date.now() };
      });
    };

    const engine = currentEngine ?? defaultEngine;
    const enginePromise = engine({
      id: taskId,
      type: task.type,
      prompt: task.prompt,
      effort,
      imageBase64,
      imageMime,
    });

    if (pacingEnabled && paceMs > 0) {
      await tick();
      ticker = setInterval(() => {
        void tick();
      }, Math.max(400, paceMs / (messages.length + 2)));
    } else {
      await updateSettings(taskId, (s) => {
        s.progress = { message: messages[0], percent: 5, at: Date.now() };
      });
      // Liveness heartbeat for un-paced (fast/resume) runs: without an `at`
      // refresh a live resumed pipeline looks stale to another instance's
      // resumeStaleTask after RESUME_STALE_MS and gets double-run.
      ticker = setInterval(() => {
        void updateSettings(taskId, (s) => {
          if (s.progress && typeof s.progress === "object") {
            (s.progress as { at?: number }).at = Date.now();
          }
        });
      }, 2_000);
    }

    const pacingPromise = new Promise<void>((resolve) => {
      if (!pacingEnabled || paceMs <= 0) return resolve();
      const remaining = Math.max(0, paceMs - (Date.now() - startedAt));
      setTimeout(resolve, remaining);
    });

    const [engineResult] = await Promise.all([
      enginePromise.then((r) => ({ ok: true as const, r })).catch((err: unknown) => ({ ok: false as const, err })),
      pacingPromise,
    ]);

    if (ticker) clearInterval(ticker);

    if (!engineResult.ok) {
      machine.to("failed");
      await db.task.update({
        where: { id: taskId },
        data: {
          userState: "failed",
          error: engineResult.err instanceof Error ? engineResult.err.message : "generation failed",
        },
      });
      return;
    }

    // Validate the engine's spec defensively (providers already validate,
    // but the runner is the last line of defense before persisting).
    const parsed = safeParseSceneSpec(engineResult.r.spec);
    if (!parsed.ok) {
      machine.to("failed");
      await db.task.update({
        where: { id: taskId },
        data: { userState: "failed", error: `invalid spec: ${parsed.error}` },
      });
      return;
    }
    const spec = parsed.spec;

    // Spec-first persistence: the moment the spec validates it is written to
    // the task row (with used_tokens parked in settings), so a frozen/killed
    // serverless invocation can complete the task from storage on the next
    // poll — see COMPLETION-RESUME above.
    await db.task.update({
      where: { id: taskId },
      data: { spec: spec as unknown as Prisma.InputJsonValue },
    });
    await updateSettings(taskId, (s) => {
      s.spec_tokens = engineResult.r.usage.used_tokens;
    });

    await finalize(spec, engineResult.r.usage.used_tokens, startedAt);
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    try {
      if (machine.can("failed")) {
        machine.to("failed");
        await db.task.update({ where: { id: taskId }, data: { userState: "failed", error: message } });
      }
    } catch {
      /* best effort */
    }
  }
}

/* --------------------------- serverless resume --------------------------- */

const RESUME_STALE_MS = 10_000;

/**
 * Serverless freeze recovery — called by the task-card poll. A live
 * pipeline heartbeats settings.progress.at every ~1-3s; a task stuck in a
 * non-terminal state with a stale (or absent) heartbeat means its
 * invocation died (Vercel function freeze/eviction). Drive it to completion
 * here: runTask re-reads the row and either finishes from the stored spec
 * (spec-first persistence) or re-runs the engine with self-healed image
 * inputs. `fast` skips the artificial pacing — the task already lived
 * through its pacing window.
 *
 * Local dev: same-process `running` guard makes this a no-op while the
 * original enqueue is alive. Serverless: two instances may briefly race on
 * a dead task; both converge on the same deterministic spec/poster (bounded
 * double engine call, last-write-wins) — documented in DECISIONS.md.
 */
export async function resumeStaleTask(taskId: string): Promise<void> {
  // NOTE (2026-10-19 freeze fix): do NOT early-return on the in-memory
  // `running` set. A serverless invocation whose fire-and-forget pipeline
  // was frozen mid-run (process suspended, not exited — the finally never
  // runs) keeps the task in its `running` set forever, and every card poll
  // served by that warm instance silently skipped recovery (observed live:
  // a fallback task wedged in "processing" for hours despite ~500 polls,
  // resume_count never even incremented). The DB heartbeat below is the
  // only liveness signal that is trustworthy across instances.
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task || isComplete(task.userState as never) || task.userState === "failed") return;
  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  // engine2 (2026-10-18 race fix): neural tasks are CLIENT-DRIVEN — the
  // browser runs the free Hunyuan3D-2.1 pipeline and POSTs the painted mesh.
  // The server must NEVER steal them via stale-resume: the neural engine's
  // quiet SSE phases regularly exceed RESUME_STALE_MS, which raced a lathe
  // run into DonePreview and discarded the client's mesh POST. The ONLY
  // legit server run for a neural task is the explicit /fallback route,
  // which sets settings.fallback_reason before enqueueing.
  if (settings.engine === "neural" && typeof settings.fallback_reason !== "string") {
    return;
  }
  const progress = settings.progress as { at?: unknown } | undefined;
  const at = typeof progress?.at === "number" ? progress.at : 0;
  if (Date.now() - at < RESUME_STALE_MS) return; // actively progressing
  // Resume-attempt cap (2026-10-18): a task whose invocations keep dying
  // (wedged AI call, connection exhaustion) must fail VISIBLY after 3
  // resume attempts instead of looping forever in a wedged state.
  const resumeCount = typeof settings.resume_count === "number" ? settings.resume_count : 0;
  if (resumeCount >= 3) {
    await db.task.update({
      where: { id: taskId },
      data: {
        userState: "failed",
        error: "Generation kept stalling — please try again (AI backend or database was unreachable).",
      },
    });
    return;
  }
  await db.task.update({
    where: { id: taskId },
    data: {
      settings: {
        ...settings,
        resume_count: resumeCount + 1,
        // Claim the resume with a fresh heartbeat so a concurrent resume
        // on another instance (within RESUME_STALE_MS) sees a live
        // pipeline and skips instead of double-running.
        progress: { ...(progress ?? {}), at: Date.now() },
      } as never,
    },
  });
  // Carry the pipeline inside THIS invocation's after() window — a bare
  // enqueue() is fire-and-forget and can be frozen before completion
  // (the exact wedge observed on 2026-10-19).
  await runPipelineNow(taskId, { fast: true });
}
