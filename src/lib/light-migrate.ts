import { db } from "./db";

/* t53: app-side light migration. The nullable "User.referredByCode" column
 * (referral apply-path) may be missing on a deployment whose database
 * predates the t53 ship — e.g. production Neon when the env-decrypt DDL path
 * is unavailable. Additive, idempotent, once per process; dialect-safe:
 * Postgres supports ADD COLUMN IF NOT EXISTS directly; SQLite does NOT
 * (it is a syntax error there, not a "duplicate column" failure), so on
 * SQLite we probe PRAGMA table_info first and add the column only when
 * absent.
 *
 * Lives in its own module so both lib/seed (ensureSeeded) and lib/auth
 * (getSessionUser) can run it first without an import cycle. */

/** SQLite URLs are `file:…` (or `:memory:`); Postgres/Neon are postgres://. */
function isSqlite(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("file:") || url.startsWith(":memory:");
}

async function ensureReferredByCode(): Promise<void> {
  if (isSqlite()) {
    const columns = (await db.$queryRawUnsafe('PRAGMA table_info("User")')) as { name?: string }[];
    const exists = columns.some((c) => c.name === "referredByCode");
    if (!exists) {
      await db.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "referredByCode" TEXT');
    }
  } else {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredByCode" TEXT`);
  }
}

let done = false;
export async function ensureLightMigrations(): Promise<void> {
  if (done) return;
  done = true;
  try {
    await ensureReferredByCode();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already exists|duplicate column/i.test(msg)) {
      console.warn("[light-migration] referredByCode:", msg);
    }
  }
}
