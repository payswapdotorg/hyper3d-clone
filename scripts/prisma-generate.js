#!/usr/bin/env node
/**
 * prisma-generate.js — dual-flavor client generation.
 *
 * The repo keeps two schema flavors:
 *   prisma/schema.prisma           — sqlite (local dev + vitest against db/test.db)
 *   prisma/schema.postgres.prisma  — postgresql (Vercel/Neon production)
 *
 * The client provider is baked in at generate time, so this script picks the
 * schema by the DATABASE_URL protocol: postgres:// / postgresql:// → the
 * postgres flavor, anything else (file:…) → sqlite. Vercel's build sets
 * DATABASE_URL from the project env, so the deployed client always matches
 * the deployment database. `bun run test` regenerates the sqlite flavor in
 * its global setup, so running tests does not break a dev-server client.
 */
const { execSync } = require("node:child_process");
const { existsSync } = require("node:fs");

const url = process.env.DATABASE_URL || "";
const schema = url.startsWith("postgres://") || url.startsWith("postgresql://")
  ? "prisma/schema.postgres.prisma"
  : "prisma/schema.prisma";

if (!existsSync(schema)) {
  console.error(`[prisma-generate] schema not found: ${schema}`);
  process.exit(1);
}

const bin = existsSync("node_modules/.bin/prisma")
  ? "node_modules/.bin/prisma"
  : "bunx prisma";

console.log(`[prisma-generate] DATABASE_URL protocol → ${schema}`);
execSync(`${bin} generate --schema=${schema}`, { stdio: "inherit" });
