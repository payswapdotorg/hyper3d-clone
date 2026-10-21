/**
 * Task lifecycle state machine, mirroring the observed Rodin flow:
 *   created → queued → processing (step "ModelGenerate") → DonePreview → done
 *   any live state → failed (terminal)
 *
 * Usage {elapsed_seconds, used_tokens} is recorded alongside completion.
 * Illegal transitions throw — the queue runner is the only writer in
 * production, so a throw means a genuine bug, not a user error.
 */

export type TaskState = "created" | "queued" | "processing" | "DonePreview" | "done" | "failed";

export interface TaskUsage {
  elapsed_seconds: number;
  used_tokens: number;
}

const LEGAL_TRANSITIONS: Record<TaskState, TaskState[]> = {
  created: ["queued", "failed"],
  queued: ["processing", "failed"],
  processing: ["DonePreview", "failed"],
  DonePreview: ["done"],
  done: [],
  failed: [],
};

export const TERMINAL_STATES: TaskState[] = ["done", "failed"];

export class TaskMachine {
  private current: TaskState;
  private currentStep: string | null = null;
  private recordedUsage: TaskUsage | null = null;

  constructor(initial: TaskState = "created") {
    this.current = initial;
    if (initial === "processing") this.currentStep = "ModelGenerate";
  }

  get state(): TaskState {
    return this.current;
  }

  /** Pipeline step label; "ModelGenerate" once generation started (blueprint §4). */
  get step(): string | null {
    return this.currentStep;
  }

  get usage(): TaskUsage | null {
    return this.recordedUsage;
  }

  can(next: TaskState): boolean {
    return LEGAL_TRANSITIONS[this.current].includes(next);
  }

  to(next: TaskState): this {
    if (!this.can(next)) {
      throw new Error(`illegal task transition: ${this.current} → ${next}`);
    }
    this.current = next;
    if (next === "processing") this.currentStep = "ModelGenerate";
    return this;
  }

  recordUsage(usage: TaskUsage): this {
    if (!Number.isFinite(usage.elapsed_seconds) || usage.elapsed_seconds < 0) {
      throw new Error(`elapsed_seconds must be a non-negative finite number`);
    }
    if (!Number.isFinite(usage.used_tokens) || usage.used_tokens < 0) {
      throw new Error(`used_tokens must be a non-negative finite number`);
    }
    this.recordedUsage = { ...usage };
    return this;
  }
}

/** True when the task has a finished model available for viewing/export. */
export function isComplete(state: TaskState): boolean {
  return state === "DonePreview" || state === "done";
}
