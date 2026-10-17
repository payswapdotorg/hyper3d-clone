/**
 * Prisma-backed ledger store — production wiring for CreditLedger.
 * (Unit tests run the same CreditLedger against InMemoryLedgerStore.)
 */
import { db } from "./db";
import { CreditLedger, type LedgerEntry, type LedgerStore } from "./credits";

export class PrismaLedgerStore implements LedgerStore {
  async getBalance(userId: string): Promise<number | null> {
    const user = await db.user.findUnique({ where: { id: userId }, select: { balance: true } });
    return user?.balance ?? null;
  }

  async setBalance(userId: string, balance: number): Promise<void> {
    await db.user.update({ where: { id: userId }, data: { balance } });
  }

  async addEntry(entry: LedgerEntry): Promise<void> {
    await db.creditEntry.create({
      data: {
        userId: entry.userId,
        delta: entry.delta,
        reason: entry.reason,
        taskId: entry.taskId ?? null,
      },
    });
  }

  async entriesOf(userId: string): Promise<(LedgerEntry & { createdAt: Date; taskId?: string | null })[]> {
    const rows = await db.creditEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => ({
      userId: row.userId,
      delta: row.delta,
      reason: row.reason,
      taskId: row.taskId ?? undefined,
      createdAt: row.createdAt,
    }));
  }
}

export const ledger = new CreditLedger(new PrismaLedgerStore());
