import { NextResponse } from "next/server";
import { backendStatus } from "@/lib/ai-clients";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ops probe (no secrets): which AI backend is live in this runtime and
 * whether the database answers. Used to verify serverless deployments.
 */
export async function GET() {
  const [ai, dbOk] = await Promise.all([
    backendStatus().catch(() => ({ backend: "none" as const, zaiConfigPresent: false, openRouterKeyPresent: false })),
    db.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
  ]);
  return NextResponse.json({ ai, db: { reachable: dbOk } });
}
