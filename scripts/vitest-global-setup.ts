import { execSync } from "node:child_process";

/**
 * Vitest global setup: push the Prisma schema to the dedicated test database
 * (db/test.db) before any suite runs. The generated client itself is produced
 * by `bunx prisma generate` during project setup / dev.sh, not here.
 */
export default function vitestGlobalSetup() {
  const url = "file:../db/test.db";
  execSync(
    "node_modules/.bin/prisma db push --skip-generate --accept-data-loss --schema=prisma/schema.prisma",
    {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
      stdio: "inherit",
    },
  );
  console.log(`[vitest-global-setup] test database ready (${url})`);
}
