import { execSync } from "node:child_process";

/**
 * Vitest global setup: push the Prisma schema to the dedicated Postgres test
 * database (TEST_DATABASE_URL — e.g. a scratch Neon database) before any
 * suite runs. The generated client itself is produced by
 * `bunx prisma generate` during project setup / postinstall, not here.
 */
export default function vitestGlobalSetup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is required (dedicated Postgres test database, e.g. Neon). " +
        "It is wiped on every test run — never point it at a database you care about.",
    );
  }
  execSync(
    "node_modules/.bin/prisma db push --skip-generate --accept-data-loss --schema=prisma/schema.prisma",
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
  console.log("[vitest-global-setup] test database ready (Postgres)");
}
