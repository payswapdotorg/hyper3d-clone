/**
 * Credit ledger — the single source of truth for balance accounting.
 *
 * Rules (per work order):
 *  - new users start with 50 credits
 *  - agentic generation costs 10 credits
 *  - standard generation costs 1 credit
 *  - a user's FIRST task is a free preview (0 credits)
 *  - an insufficient balance throws InsufficientCreditsError and the
 *    balance is never allowed to go negative
 *
 * The ledger is storage-agnostic: production wires it to Prisma
 * (see src/lib/ledger.ts) while unit tests run it on an in-memory store.
 */

export const INITIAL_BALANCE = 50;
export const AGENTIC_COST = 10;
export const STANDARD_COST = 1;

export type TaskType = "RodinAgentic" | "RodinStandard";

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly balance: number,
  ) {
    super(
      `insufficient credits: balance ${balance} cannot cover a spend of ${amount} (user ${userId})`,
    );
    this.name = "InsufficientCreditsError";
  }
}

export interface LedgerEntry {
  userId: string;
  delta: number;
  reason: string;
  taskId?: string;
}

export interface LedgerStore {
  getBalance(userId: string): Promise<number | null>;
  setBalance(userId: string, balance: number): Promise<void>;
  addEntry(entry: LedgerEntry): Promise<void>;
  entriesOf(userId: string): Promise<(LedgerEntry & { createdAt: Date; taskId?: string | null })[]>;
}

/** In-memory store for unit tests. */
export class InMemoryLedgerStore implements LedgerStore {
  private balances = new Map<string, number>();
  private entries: (LedgerEntry & { createdAt: Date; taskId?: string | null })[] = [];

  async getBalance(userId: string): Promise<number | null> {
    return this.balances.get(userId) ?? null;
  }

  async setBalance(userId: string, balance: number): Promise<void> {
    this.balances.set(userId, balance);
  }

  async addEntry(entry: LedgerEntry): Promise<void> {
    this.entries.push({ ...entry, createdAt: new Date() });
  }

  async entriesOf(userId: string): Promise<(LedgerEntry & { createdAt: Date; taskId?: string | null })[]> {
    return this.entries.filter((e) => e.userId === userId);
  }
}

/** Price a task given its type and how many tasks the user already has. */
export function computeTaskCost(input: { type: TaskType; taskCount: number }): number {
  if (input.taskCount <= 0) return 0; // first task = free preview
  return input.type === "RodinAgentic" ? AGENTIC_COST : STANDARD_COST;
}

export class CreditLedger {
  constructor(private readonly store: LedgerStore) {}

  /** Open an account for a new user with the initial balance. */
  async openAccount(userId: string): Promise<number> {
    const existing = await this.store.getBalance(userId);
    if (existing !== null) return existing;
    await this.store.setBalance(userId, INITIAL_BALANCE);
    return INITIAL_BALANCE;
  }

  async balanceOf(userId: string): Promise<number | null> {
    return this.store.getBalance(userId);
  }

  async entriesOf(userId: string): Promise<(LedgerEntry & { createdAt: Date })[]> {
    return this.store.entriesOf(userId);
  }

  /**
   * Spend `amount` credits. Throws InsufficientCreditsError (without any
   * mutation) when the balance cannot cover the spend — the balance can
   * never go negative. Zero-amount spends (free preview) always succeed.
   */
  async spend(input: { userId: string; amount: number; reason: string; taskId?: string }): Promise<number> {
    const { amount, userId, reason, taskId } = input;
    const current = (await this.store.getBalance(userId)) ?? 0;
    if (amount > current) {
      throw new InsufficientCreditsError(userId, amount, current);
    }
    const next = current - amount;
    await this.store.setBalance(userId, next);
    // `+ 0` normalizes -0 to 0 so zero-amount (free preview) entries read cleanly.
    await this.store.addEntry({ userId, delta: -amount + 0, reason, taskId });
    return next;
  }

  async grant(input: { userId: string; amount: number; reason: string }): Promise<number> {
    const current = (await this.store.getBalance(input.userId)) ?? 0;
    const next = current + input.amount;
    await this.store.setBalance(input.userId, next);
    await this.store.addEntry({ userId: input.userId, delta: input.amount, reason: input.reason });
    return next;
  }
}
