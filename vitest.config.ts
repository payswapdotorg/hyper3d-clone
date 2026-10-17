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
      // Dedicated Postgres test database (TEST_DATABASE_URL, e.g. Neon).
      // Falls back to the dev URL's host so `bun run test` fails loudly if unset.
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://TEST_DATABASE_URL-required",
      SESSION_SECRET: "test-session-secret",
    },
    // Sequential test files: suites share one sqlite file safely.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 90_000,
  },
});
