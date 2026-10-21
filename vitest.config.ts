import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./scripts/vitest-global-setup.ts"],
    env: {
      // Dedicated SQLite test database — absolute path so the Prisma CLI
      // (global setup) and the runtime client resolve the SAME file; wiped on
      // every run. Never point tests at the dev database. Must match the
      // default computed in scripts/vitest-global-setup.ts.
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? `file:${fileURLToPath(new URL("./db/test.db", import.meta.url))}`,
      SESSION_SECRET: "test-session-secret",
    },
    // Sequential test files: suites share one sqlite file safely.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 90_000,
  },
});
