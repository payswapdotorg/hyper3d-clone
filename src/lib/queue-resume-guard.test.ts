import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * engine2 race regression (2026-10-18): neural tasks are CLIENT-DRIVEN.
 * resumeStaleTask must never steal one — the neural engine's quiet SSE
 * phases (upload → stream → mesh) regularly exceed RESUME_STALE_MS, and a
 * server-side lathe resume raced DonePreview in ahead of the client's
 * mesh POST, silently discarding the neural result.
 */

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ db: mockDb }));

import { resumeStaleTask } from "./queue";

function task(overrides: Record<string, unknown>) {
  return {
    id: "t",
    userState: "queued",
    settings: {},
    ...overrides,
  } as never;
}

describe("resumeStaleTask neural guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.task.update.mockResolvedValue({} as never);
  });

  it("never resumes a client-driven neural task with a stale heartbeat", async () => {
    mockDb.task.findUnique.mockResolvedValue(
      task({ settings: { engine: "neural", progress: { at: 0 } } }),
    );
    await resumeStaleTask("t1");
    expect(mockDb.task.update).not.toHaveBeenCalled();
  });

  it("never resumes a neural task before its first heartbeat either", async () => {
    mockDb.task.findUnique.mockResolvedValue(task({ userState: "created", settings: { engine: "neural" } }));
    await resumeStaleTask("t2");
    expect(mockDb.task.update).not.toHaveBeenCalled();
  });

  it("resumes a neural task that explicitly requested the fast fallback", async () => {
    mockDb.task.findUnique.mockResolvedValue(
      task({
        userState: "created",
        settings: { engine: "neural", fallback_reason: "stall guard fired", progress: { at: 0 } },
      }),
    );
    await resumeStaleTask("t3");
    expect(mockDb.task.update).toHaveBeenCalled();
  });

  it("still resumes fast-tier tasks with stale heartbeats", async () => {
    mockDb.task.findUnique.mockResolvedValue(
      task({ userState: "processing", settings: { engine: "fast", progress: { at: 0 } } }),
    );
    await resumeStaleTask("t4");
    expect(mockDb.task.update).toHaveBeenCalled();
  });

  it("still resumes legacy (engine-less) tasks with stale heartbeats", async () => {
    mockDb.task.findUnique.mockResolvedValue(
      task({ userState: "processing", settings: { progress: { at: 0 } } }),
    );
    await resumeStaleTask("t5");
    expect(mockDb.task.update).toHaveBeenCalled();
  });
});
