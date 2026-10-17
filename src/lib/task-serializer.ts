/**
 * Task row → API shapes. `buildTaskCard` mirrors the blueprint §4 task-card
 * JSON verbatim in structure (task_uuid, type, prompt, step, image_url,
 * video_url, usage, settings, model_preview_info, versions, user_state…).
 */
import type { Task, User } from "@prisma/client";

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

export function buildTaskCard(task: Task, author: Pick<User, "id" | "username" | "email">): Record<string, unknown> {
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

export function buildCompactCard(task: Task): Record<string, unknown> {
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
  };
}

export function buildHistory(task: Task): Record<string, unknown> | null {
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
