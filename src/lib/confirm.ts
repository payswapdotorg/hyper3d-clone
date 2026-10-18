/**
 * Pay-by-result confirm gate — the ONLY place a pay_by_result task's user
 * is charged. Generation and preview are free; "Confirm & Export" debits
 * exactly CONFIRM_COST credits, atomically, at most once per task.
 *
 * Atomicity: everything happens inside one Prisma interactive transaction
 * (single-writer SQLite serializes competing confirms; the confirmedAt
 * re-check inside the transaction makes a double-charge impossible).
 */
import { db } from "./db";

export const CONFIRM_COST = 1;

export type ConfirmOutcome =
  | { status: "confirmed"; charged: number; balance: number }
  | { status: "already_confirmed"; charged: 0; balance: number }
  | { status: "insufficient"; balance: number; required: number };

export async function confirmTaskCharge(taskId: string, userId: string): Promise<ConfirmOutcome> {
  return db.$transaction(async (tx) => {
    // Re-read INSIDE the transaction: a concurrent confirm that committed
    // first is visible here and short-circuits this one.
    const task = await tx.task.findUnique({ where: { id: taskId }, select: { confirmedAt: true } });
    if (!task) throw new Error(`confirmTaskCharge: task ${taskId} vanished mid-transaction`);

    if (task.confirmedAt) {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { balance: true } });
      return { status: "already_confirmed", charged: 0, balance: user?.balance ?? 0 };
    }

    const user = await tx.user.findUnique({ where: { id: userId }, select: { balance: true } });
    const balance = user?.balance ?? 0;
    if (balance < CONFIRM_COST) {
      // Floor at 0 — never allow a negative balance, never mutate on failure.
      return { status: "insufficient", balance, required: CONFIRM_COST };
    }

    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: CONFIRM_COST } },
    });
    await tx.task.update({
      where: { id: taskId },
      data: { confirmedAt: new Date(), creditsSpent: CONFIRM_COST },
    });
    await tx.creditEntry.create({
      data: {
        userId,
        delta: -CONFIRM_COST,
        reason: "confirm_export",
        taskId,
      },
    });

    return { status: "confirmed", charged: CONFIRM_COST, balance: balance - CONFIRM_COST };
  });
}
