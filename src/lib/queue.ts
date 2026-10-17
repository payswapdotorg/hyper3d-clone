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
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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

export function generatedDir(taskId: string): string {
  return path.join(process.cwd(), "db", "generated", taskId);
}

async function writePoster(taskId: string, png: Uint8Array): Promise<void> {
  const dir = generatedDir(taskId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "poster.png"), png);
}

/* ------------------------------ runner ------------------------------ */

const running = new Set<string>();

export interface EnqueueOptions {
  imageBase64?: string;
  imageMime?: string;
}

/** Fire-and-forget: run the generation pipeline for a task row. */
export function enqueue(taskId: string, options: EnqueueOptions = {}): void {
  if (running.has(taskId)) return;
  running.add(taskId);
  void runTask(taskId, options).finally(() => running.delete(taskId));
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
  const paceMs = effortPaceMs(effort);
  const messages = task.type === "RodinAgentic" ? AGENTIC_MESSAGES : STANDARD_MESSAGES;

  try {
    machine.to("queued");
    await db.task.update({ where: { id: taskId }, data: { userState: "queued" } });

    machine.to("processing");
    await db.task.update({ where: { id: taskId }, data: { userState: "processing", step: "ModelGenerate" } });

    // Progress ticker: paced messages while the engine works.
    let ticker: ReturnType<typeof setInterval> | null = null;
    const tick = async () => {
      const elapsed = Date.now() - startedAt;
      const percent = Math.min(95, Math.round((elapsed / paceMs) * 100));
      const messageIndex = Math.min(messages.length - 1, Math.floor((elapsed / paceMs) * messages.length));
      await updateSettings(taskId, (s) => {
        s.progress = { message: messages[messageIndex], percent };
      });
    };

    const engine = currentEngine ?? defaultEngine;
    const enginePromise = engine({
      id: taskId,
      type: task.type,
      prompt: task.prompt,
      effort,
      imageBase64: options.imageBase64,
      imageMime: options.imageMime,
    });

    if (pacingEnabled) {
      await tick();
      ticker = setInterval(() => {
        void tick();
      }, Math.max(400, paceMs / (messages.length + 2)));
    } else {
      await updateSettings(taskId, (s) => {
        s.progress = { message: messages[0], percent: 5 };
      });
    }

    const pacingPromise = new Promise<void>((resolve) => {
      if (!pacingEnabled) return resolve();
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

    // Render the poster from the real geometry.
    const group = buildScene(spec);
    const poster = renderPoster(group);
    await writePoster(taskId, poster);

    const elapsedSeconds = Math.max(0.05, (Date.now() - startedAt) / 1000);
    const usage = {
      elapsed_seconds: Number(elapsedSeconds.toFixed(3)),
      used_tokens: engineResult.r.usage.used_tokens,
    };
    machine.to("DonePreview");
    machine.recordUsage(usage);

    await db.task.update({
      where: { id: taskId },
      data: {
        spec: spec as unknown as Prisma.InputJsonValue,
        previewImageUrl: `/api/task/${taskId}/preview`,
        modelUrl: `/api/task/${taskId}/export?format=glb`,
        videoUrl: null, // documented deviation: no turntable webm in the clone
        usage: usage as unknown as Prisma.InputJsonValue,
        userState: "DonePreview",
        generationUuid: randomUUID(),
        generateTime: new Date(),
      },
    });
    await updateSettings(taskId, (s) => {
      delete s.progress;
    });
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
