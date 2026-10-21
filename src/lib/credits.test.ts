import { describe, it, expect } from "vitest";
import {
  CreditLedger,
  InMemoryLedgerStore,
  InsufficientCreditsError,
  computeTaskCost,
  AGENTIC_COST,
  STANDARD_COST,
  INITIAL_BALANCE,
} from "@/lib/credits";

describe("credits ledger", () => {
  it("gives a new user the initial balance of 50 credits", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    const balance = await ledger.openAccount("user-1");
    expect(balance).toBe(INITIAL_BALANCE);
    expect(INITIAL_BALANCE).toBe(50);
    expect(await ledger.balanceOf("user-1")).toBe(50);
  });

  it("charges 10 credits for an agentic generation", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    await ledger.openAccount("user-1");
    expect(AGENTIC_COST).toBe(10);
    const balance = await ledger.spend({
      userId: "user-1",
      amount: AGENTIC_COST,
      reason: "agentic_generation",
      taskId: "task-1",
    });
    expect(balance).toBe(40);
    const entries = await ledger.entriesOf("user-1");
    expect(entries).toHaveLength(1);
    expect(entries[0].delta).toBe(-10);
    expect(entries[0].reason).toBe("agentic_generation");
    expect(entries[0].taskId).toBe("task-1");
  });

  it("charges 1 credit for a standard generation", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    await ledger.openAccount("user-1");
    expect(STANDARD_COST).toBe(1);
    const balance = await ledger.spend({
      userId: "user-1",
      amount: STANDARD_COST,
      reason: "standard_generation",
      taskId: "task-2",
    });
    expect(balance).toBe(49);
  });

  it("costs 0 credits for the first task (free preview)", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    await ledger.openAccount("user-1");
    const balance = await ledger.spend({
      userId: "user-1",
      amount: 0,
      reason: "free_preview",
      taskId: "task-0",
    });
    expect(balance).toBe(50);
    const entries = await ledger.entriesOf("user-1");
    expect(entries[0].delta).toBe(0);
  });

  it("computes task cost from type and prior task count", () => {
    expect(computeTaskCost({ type: "RodinStandard", taskCount: 0 })).toBe(0);
    expect(computeTaskCost({ type: "RodinStandard", taskCount: 1 })).toBe(1);
    expect(computeTaskCost({ type: "RodinStandard", taskCount: 5 })).toBe(1);
    expect(computeTaskCost({ type: "RodinAgentic", taskCount: 0 })).toBe(0);
    expect(computeTaskCost({ type: "RodinAgentic", taskCount: 1 })).toBe(10);
    expect(computeTaskCost({ type: "RodinAgentic", taskCount: 3 })).toBe(10);
  });

  it("throws InsufficientCreditsError and never lets the balance go negative", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    await ledger.openAccount("user-broke");
    await ledger.spend({ userId: "user-broke", amount: 49, reason: "drain", taskId: "t" });
    expect(await ledger.balanceOf("user-broke")).toBe(1);

    await expect(
      ledger.spend({ userId: "user-broke", amount: AGENTIC_COST, reason: "agentic_generation", taskId: "t2" }),
    ).rejects.toThrow(InsufficientCreditsError);

    // The failed spend must not mutate balance or write an entry.
    expect(await ledger.balanceOf("user-broke")).toBe(1);
    const entries = await ledger.entriesOf("user-broke");
    expect(entries).toHaveLength(1);

    // Even a fresh account cannot go negative: 10 > initial for a drained account.
    const ledger2 = new CreditLedger(new InMemoryLedgerStore());
    await ledger2.openAccount("u2");
    await ledger2.spend({ userId: "u2", amount: 50, reason: "drain-all", taskId: "t3" });
    expect(await ledger2.balanceOf("u2")).toBe(0);
    await expect(
      ledger2.spend({ userId: "u2", amount: 1, reason: "anything", taskId: "t4" }),
    ).rejects.toThrow(InsufficientCreditsError);
    expect(await ledger2.balanceOf("u2")).toBe(0);
  });

  it("grants credits with a positive entry", async () => {
    const ledger = new CreditLedger(new InMemoryLedgerStore());
    await ledger.openAccount("user-1");
    const balance = await ledger.grant({ userId: "user-1", amount: 25, reason: "top_up" });
    expect(balance).toBe(75);
    const entries = await ledger.entriesOf("user-1");
    expect(entries.at(-1)?.delta).toBe(25);
  });
});
