import { describe, it, expect, vi } from "vitest";
import { db } from "@/lib/db";

/* Regression (t53 re-land): SQLite does not support
 * `ALTER TABLE … ADD COLUMN IF NOT EXISTS` — it is a SYNTAX error there,
 * not a "duplicate column" failure, so the original one-liner logged a
 * warning on every local cold start. The dialect-aware version probes
 * PRAGMA table_info on SQLite and uses IF NOT EXISTS only on Postgres. */

async function userColumns(): Promise<string[]> {
  const rows = (await db.$queryRawUnsafe('PRAGMA table_info("User")')) as { name?: string }[];
  return rows.map((r) => r.name ?? "");
}

describe("light-migrate (t53 referredByCode, dialect-safe)", () => {
  it("resolves cleanly and the column is present — no SQLite syntax error", async () => {
    const { ensureLightMigrations } = await import("@/lib/light-migrate");
    await expect(ensureLightMigrations()).resolves.toBeUndefined();
    expect(await userColumns()).toContain("referredByCode");
    // Idempotent: the second call is a per-process no-op (done flag).
    await expect(ensureLightMigrations()).resolves.toBeUndefined();
  });

  it("heals a pre-t53 database: re-adds the column when it is missing", async () => {
    // Simulate a database that predates the t53 ship.
    await db.$executeRawUnsafe('ALTER TABLE "User" DROP COLUMN "referredByCode"').catch(() => undefined);
    const dropped = !(await userColumns()).includes("referredByCode");
    if (!dropped) {
      // The engine's SQLite predates 3.35 (no DROP COLUMN) — the heal path
      // cannot be simulated here; the first test still covers the no-op path.
      return;
    }
    // Fresh module graph → done flag reset → the migration actually runs.
    vi.resetModules();
    const { ensureLightMigrations } = await import("@/lib/light-migrate");
    await expect(ensureLightMigrations()).resolves.toBeUndefined();
    expect(await userColumns()).toContain("referredByCode");
  });
});
