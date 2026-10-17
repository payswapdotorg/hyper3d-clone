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
      // Dedicated sqlite test database (resolved relative to prisma/schema.prisma).
      DATABASE_URL: "file:../db/test.db",
      SESSION_SECRET: "test-session-secret",
    },
    // Sequential test files: suites share one sqlite file safely.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 90_000,
  },
});
