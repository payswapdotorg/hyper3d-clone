import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Vitest global setup: push the Prisma schema to the dedicated SQLite test
 * database (db/test.db) before any suite runs, wiping any previous file so
 * every run starts clean. The URL is computed from cwd (NOT from .env — the
 * globalSetup process does not receive vitest's test.env, and Prisma's CLI
 * would otherwise auto-load the DEV .env and wipe the dev database). Must
 * resolve to the same absolute file vitest.config.ts injects into workers.
 *
 * (Recovery build note: the Postgres/Neon TEST_DATABASE_URL flavor lives in
 * git history — this branch runs the SQLite flavor, matching the sandbox's
 * Prisma setup; prisma/schema.postgres.prisma keeps the deployment flavor.)
 */
export default function vitestGlobalSetup() {
  const url = process.env.TEST_DATABASE_URL ?? `file:${join(process.cwd(), "db", "test.db")}`;
  if (!url.startsWith("file:")) {
    throw new Error(
      "TEST_DATABASE_URL must be a SQLite file: URL for this flavor — " +
        "it is wiped on every test run, never point it at a database you care about.",
    );
  }
  const raw = url.slice("file:".length);
  const file = raw.startsWith("/") ? raw : join(process.cwd(), raw);
  rmSync(file, { force: true });
  execSync(
    "node_modules/.bin/prisma db push --skip-generate --accept-data-loss --schema=prisma/schema.prisma",
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
  console.log(`[vitest-global-setup] test database ready (SQLite at ${file})`);
}
