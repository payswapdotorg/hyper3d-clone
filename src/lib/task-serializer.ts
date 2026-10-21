/**
 * Task row → API shapes. `buildTaskCard` mirrors the blueprint §4 task-card
 * JSON verbatim in structure (task_uuid, type, prompt, step, image_url,
 * video_url, usage, settings, model_preview_info, versions, user_state…).
 */
import type { Prisma, User } from "@prisma/client";

/**
 * Blob-drag guard (2026-10-19 outage post-mortem): the Task table stores
 * three blob columns — posterBytes (~120KB), inputBytes (~100KB), meshBytes
 * (up to 2MB). Full-row queries on hot paths (list × up to 50 rows,
 * card/progress polls every ~2s, stale-resume on every card poll) dragged
 * those blobs from the database on every poll only to throw them away —
 * 8.4 GB of egress in 2 days exhausted the production database's free-tier
 * quota and hard-suspended it (sign-in 500s site-wide). Hot paths MUST
 * pass `omit: TASK_BLOB_OMIT` (or a narrower `select`) so blobs only cross
 * the wire in the routes that actually serve them (preview / input / mesh
 * / export).
 */
export const TASK_BLOB_OMIT = {
  posterBytes: true,
  inputBytes: true,
  meshBytes: true,
} satisfies Prisma.TaskOmit;

/**
 * Structural row type the serializers actually read — satisfied by full
 * Task rows and by blob-omitted rows alike, so hot routes can omit blobs
 * without casting.
 */
export interface TaskCardRow {
  id: string;
  type: string;
  prompt: string;
  step: string;
  userState: string;
  inputImageUrl: string | null;
  previewImageUrl: string | null;
  videoUrl: string | null;
  usage: unknown;
  settings: unknown;
  creditsSpent: number;
  isFeatured: boolean;
  isPrivate: boolean;
  error: string | null;
  generationUuid: string | null;
  generateTime: Date | null;
  engine: string | null;
  engineUsed: string | null;
  fallbackReason: string | null;
  seed: number | null;
  confirmedAt: Date | null;
  createdAt: Date;
}

type TaskUsage = { elapsed_seconds?: number; used_tokens?: number } | null;
type TaskSettings = Record<string, unknown> | null;

export interface ProgressInfo {
  message: string;
  percent: number;
}

export function isTaskComplete(userState: string): boolean {
  return userState === "DonePreview" || userState === "done";
}

function exportUrl(taskId: string, format: string): string {
  return `/api/task/${taskId}/export?format=${format}`;
}

export function buildTaskCard(task: TaskCardRow, author: Pick<User, "id" | "username" | "email">): Record<string, unknown> {
  const complete = isTaskComplete(task.userState);
  const usage = (task.usage as TaskUsage) ?? {};
  const settings = (task.settings as TaskSettings) ?? {};
  const progress = (settings.progress as ProgressInfo | undefined) ?? undefined;

  const settingsOut: Record<string, unknown> = {
    height: typeof settings.height === "number" ? settings.height : 8,
    version: "v3",
    type: "model_generate",
  };
  if (typeof settings.effort === "string") settingsOut.effort = settings.effort;

  // Engine2 passthrough: which engine the user picked (settings.engine),
  // which actually produced the mesh (engineUsed — "neural" vs the lathe
  // "fast" fallback), why it fell back, the seed, and confirm-gate state.
  if (typeof settings.engine === "string") settingsOut.engine = settings.engine;
  if (typeof settings.pay_by_result === "boolean") settingsOut.pay_by_result = settings.pay_by_result;
  if (task.engineUsed) settingsOut.engine_used = task.engineUsed;
  if (task.fallbackReason) settingsOut.fallback_reason = task.fallbackReason;
  if (typeof task.seed === "number" && task.seed !== 0) settingsOut.seed = task.seed;
  if (task.confirmedAt) settingsOut.confirmed = true;

  // Workspace-parity options (reference surface, 2026-10-20): product line,
  // legacy mode name, material pass, multiview image_labels, creation mode,
  // and the redo lineage — all stored at creation, surfaced on the card.
  if (typeof settings.gen_version === "string") settingsOut.gen_version = settings.gen_version;
  if (typeof settings.legacy_mode === "string") settingsOut.legacy_mode = settings.legacy_mode;
  if (typeof settings.material === "string") settingsOut.material = settings.material;
  if (Array.isArray(settings.image_labels)) settingsOut.image_labels = settings.image_labels;
  if (typeof settings.creation_mode === "string") settingsOut.creation_mode = settings.creation_mode;
  if (typeof settings.redo_of === "string") settingsOut.redo_of = settings.redo_of;
  if (typeof settings.mv_image_count === "number") settingsOut.mv_image_count = settings.mv_image_count;

  const versions = complete
    ? {
        v3: {
          model: exportUrl(task.id, "usdz"),
          preview_image: task.previewImageUrl ?? null,
          generation_time: task.generateTime?.toISOString() ?? null,
          generation_uuid: task.generationUuid ?? null,
          usage: {
            elapsed_seconds: usage.elapsed_seconds ?? 0,
            used_tokens: usage.used_tokens ?? 0,
          },
        },
      }
    : null;

  const card: Record<string, unknown> = {
    task_uuid: task.id,
    type: task.type,
    prompt: task.prompt,
    step: task.step,
    pending_jobs: [],
    time: task.createdAt.toISOString(),
    author: {
      username: author.username,
      user_uuid: author.id,
      email: author.email,
      avatar_url: null,
    },
    lisenced: false,
    is_private: task.isPrivate,
    is_hidden: false,
    is_featured: task.isFeatured,
    num_like: 0,
    is_like: false,
    image_url: task.previewImageUrl ?? null,
    video_url: task.videoUrl ?? null,
    usage: {
      elapsed_seconds: usage.elapsed_seconds ?? 0,
      used_tokens: usage.used_tokens ?? 0,
    },
    settings: settingsOut,
    model_preview_info: complete ? { model: exportUrl(task.id, "usdz") } : { model: null },
    card_poster_info: { preview_image: task.previewImageUrl ?? null },
    versions,
    user_state: task.userState,
    generate_time: task.generateTime?.toISOString() ?? null,
    error: task.error ?? null,
  };

  if (task.inputImageUrl) {
    card.agentic_generate_info = {
      input_image: { "0000.webp": task.inputImageUrl },
      capabilities: ["prompt_refine", "usdz", "blend", "source"],
      versions: complete ? (versions as { v3: unknown }).v3 : null,
    };
  }

  // Live progress (only surfaced while the pipeline is running).
  if (progress && (task.userState === "queued" || task.userState === "processing")) {
    card.progress = progress;
    settingsOut.progress = progress;
  }

  return card;
}

export function buildCompactCard(task: TaskCardRow): Record<string, unknown> {
  return {
    task_uuid: task.id,
    type: task.type,
    prompt: task.prompt,
    step: task.step,
    image_url: task.previewImageUrl ?? null,
    user_state: task.userState,
    time: task.createdAt.toISOString(),
    is_featured: task.isFeatured,
    is_private: task.isPrivate,
    // Engine2 history badges: engine badge, seed badge, credit badge.
    engine_used: task.engineUsed ?? (task.engine === "neural" ? "neural" : null),
    seed: typeof task.seed === "number" && task.seed !== 0 ? task.seed : null,
    credits_spent: task.creditsSpent,
    confirmed: Boolean(task.confirmedAt),
  };
}

export function buildHistory(task: TaskCardRow): Record<string, unknown> | null {
  if (!isTaskComplete(task.userState)) return null;
  const usage = (task.usage as TaskUsage) ?? {};
  return {
    v3: {
      model: exportUrl(task.id, "usdz"),
      preview_image: task.previewImageUrl ?? null,
      generation_time: task.generateTime?.toISOString() ?? null,
      generation_uuid: task.generationUuid ?? null,
      usage: {
        elapsed_seconds: usage.elapsed_seconds ?? 0,
        used_tokens: usage.used_tokens ?? 0,
      },
    },
  };
}
