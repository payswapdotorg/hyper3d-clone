import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

/**
 * Vitest global setup: push the Prisma schema to the dedicated SQLite test
 * database (db/test.db) before any suite runs, wiping any previous file so
 * every run starts clean. The generated client itself is produced by
 * `bunx prisma generate` during project setup / postinstall, not here.
 *
 * (Recovery build note: the Postgres/Neon TEST_DATABASE_URL flavor lives in
 * git history — this branch runs the SQLite flavor, matching the sandbox's
 * Prisma setup; prisma/schema.postgres.prisma keeps the deployment flavor.)
 */
export default function vitestGlobalSetup() {
  const url = process.env.TEST_DATABASE_URL ?? "file:db/test.db";
  if (!url.startsWith("file:")) {
    throw new Error(
      "TEST_DATABASE_URL must be a SQLite file: URL for this flavor — " +
        "it is wiped on every test run, never point it at a database you care about.",
    );
  }
  const file = url.replace("file:", "");
  rmSync(file, { force: true });
  execSync(
    "node_modules/.bin/prisma db push --skip-generate --accept-data-loss --schema=prisma/schema.prisma",
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
  console.log("[vitest-global-setup] test database ready (SQLite)");
}
