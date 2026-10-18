import { NextRequest, NextResponse } from "next/server";
import { backendStatus, getVisionClient } from "@/lib/ai-clients";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Ops probe (no secrets): which AI backend is live in this runtime and
 * whether the database answers. Used to verify serverless deployments.
 *
 * ?probe=vision additionally performs a MINIMAL live vision completion and
 * reports the raw error string on failure — the caption chain degrades to
 * its deterministic fallback silently by design (generation must never
 * fail), so this probe is the only place the real failure cause surfaces.
 */
export async function GET(req: NextRequest) {
  const [ai, dbOk] = await Promise.all([
    backendStatus().catch(() => ({
      backend: "none" as const,
      zaiConfigPresent: false,
      bailianKeyPresent: false,
      openRouterKeyPresent: false,
    })),
    db.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
  ]);

  if (req.nextUrl.searchParams.get("probe") !== "vision") {
    return NextResponse.json({ ai, db: { reachable: dbOk } });
  }

  // 1x1 transparent PNG — the smallest possible legal vision payload.
  const pixel =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  let vision: { ok: boolean; error?: string; contentPreview?: string; latencyMs?: number };
  const t0 = Date.now();
  try {
    const client = await getVisionClient();
    const response = await client.createVision({
      model: "glm-4.5v",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Reply with the single word: ok" },
            { type: "image_url", image_url: { url: `data:image/png;base64,${pixel}` } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = (response as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message
      ?.content;
    const text = typeof content === "string" ? content : JSON.stringify(content ?? null);
    vision = { ok: true, contentPreview: text.slice(0, 80), latencyMs: Date.now() - t0 };
  } catch (err) {
    vision = {
      ok: false,
      error: err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 400) : String(err).slice(0, 400),
      latencyMs: Date.now() - t0,
    };
  }
  return NextResponse.json({ ai, db: { reachable: dbOk }, vision });
}
