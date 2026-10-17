import { describe, it, expect } from "vitest";
import { TaskMachine, type TaskState } from "@/lib/task-machine";

describe("task state machine", () => {
  it("walks the happy path created→queued→processing→DonePreview→done", () => {
    const machine = new TaskMachine();
    expect(machine.state).toBe("created");

    machine.to("queued");
    expect(machine.state).toBe("queued");

    machine.to("processing");
    expect(machine.state).toBe("processing");
    expect(machine.step).toBe("ModelGenerate");

    machine.to("DonePreview");
    expect(machine.state).toBe("DonePreview");

    machine.to("done");
    expect(machine.state).toBe("done");
  });

  it("marks failed as a terminal state", () => {
    const machine = new TaskMachine();
    machine.to("queued");
    machine.to("processing");
    machine.to("failed");
    expect(machine.state).toBe("failed");
    expect(() => machine.to("done")).toThrow();
    expect(() => machine.to("processing")).toThrow();
  });

  it("rejects illegal transitions", () => {
    const cases: [TaskState, TaskState][] = [
      ["created", "processing"],
      ["created", "DonePreview"],
      ["created", "done"],
      ["queued", "DonePreview"],
      ["queued", "done"],
      ["processing", "done"],
      ["processing", "queued"],
      ["DonePreview", "processing"],
      ["DonePreview", "queued"],
      ["done", "failed"],
      ["done", "queued"],
      ["failed", "queued"],
    ];
    for (const [from, to] of cases) {
      const machine = new TaskMachine(from);
      expect(machine.state).toBe(from);
      expect(() => machine.to(to), `from ${from} to ${to} must throw`).toThrow();
    }
  });

  it("allows failing from any live state", () => {
    for (const from of ["created", "queued", "processing"] as TaskState[]) {
      const machine = new TaskMachine(from);
      machine.to("failed");
      expect(machine.state).toBe("failed");
    }
  });

  it("self-reports legal next states", () => {
    const machine = new TaskMachine();
    expect(machine.can("queued")).toBe(true);
    expect(machine.can("failed")).toBe(true);
    expect(machine.can("done")).toBe(false);
  });

  it("records usage {elapsed_seconds, used_tokens} and rejects negative values", () => {
    const machine = new TaskMachine();
    machine.to("queued").to("processing").to("DonePreview");
    machine.recordUsage({ elapsed_seconds: 12.5, used_tokens: 807808 });
    expect(machine.usage).toEqual({ elapsed_seconds: 12.5, used_tokens: 807808 });

    expect(() => machine.recordUsage({ elapsed_seconds: -1, used_tokens: 10 })).toThrow();
    expect(() => machine.recordUsage({ elapsed_seconds: 1, used_tokens: -5 })).toThrow();
    // The rejected write did not clobber the recorded usage.
    expect(machine.usage).toEqual({ elapsed_seconds: 12.5, used_tokens: 807808 });
  });
});
