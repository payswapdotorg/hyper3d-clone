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

  // 64x64 solid PNG — small but legal for every vision model (a 1x1 pixel
  // is rejected by qwen-vl with a 400 image-size error).
  const PROBE_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAeklEQVR4nO3PUQkAIBTAwNfJCsY3lCH8OITBAtzmrP11wwUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWPHYBO8UxLSaOK4IAAAAASUVORK5CYII=";
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
            { type: "image_url", image_url: { url: `data:image/png;base64,${PROBE_IMAGE}` } },
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
