import { db } from "./db";

/* t53: app-side light migration. The nullable "User.referredByCode" column
 * (referral apply-path) may be missing on a deployment whose database
 * predates the t53 ship — e.g. production Neon when the env-decrypt DDL path
 * is unavailable. Additive, idempotent, once per process; dialect-safe:
 * Postgres supports IF NOT EXISTS, SQLite (already migrated via db:push)
 * fails with "duplicate column" which we swallow.
 *
 * Lives in its own module so both lib/seed (ensureSeeded) and lib/auth
 * (getSessionUser) can run it first without an import cycle. */
let done = false;
export async function ensureLightMigrations(): Promise<void> {
  if (done) return;
  done = true;
  try {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByCode" TEXT`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already exists|duplicate column/i.test(msg)) {
      console.warn("[light-migration] referredByCode:", msg);
    }
  }
}
