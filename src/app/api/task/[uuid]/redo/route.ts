import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { runPipelineNow } from "@/lib/queue";
import { REDO_QUOTAS } from "@/lib/hyper3d";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redo endpoints (reference task-card surface: "Redo Geometry ×20 /
 * Redo Material ×6", quota-gated by plan).
 *
 *   kind="geometry" — server-side: creates a NEW task that copies the
 *   source task's prompt/effort/engine/settings/input image with a fresh
 *   seed, decrements the geometry quota, and (for fast-engine tasks) kicks
 *   the server pipeline. Neural tasks stay client-driven: the studio re-runs
 *   the neural pipeline against the returned uuid.
 *
 *   kind="material" — decrements the material quota and returns ok; the
 *   actual re-paint is client-side (the studio re-paints the stored mesh
 *   from the reference image and re-POSTs it to /mesh). Only offered for
 *   tasks that have both a reference image and a stored mesh — honest
 *   gating in the UI.
 *
 * Redos are free (a redo is a new free preview under pay-by-result; the
 * reference gates them by quota, not by credits).
 */
const RedoSchema = z.object({
  kind: z.enum(["geometry", "material"]),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { uuid } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = RedoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const { kind } = parsed.data;

  const source = await db.task.findUnique({
    where: { id: uuid },
    omit: { posterBytes: true, meshBytes: true },
  });
  if (!source || source.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Quota check + decrement (read-modify-write on preferences JSON).
  const prefs = (user.preferences && typeof user.preferences === "object" ? user.preferences : {}) as Record<string, unknown>;
  const redoPrefs = (prefs.redo && typeof prefs.redo === "object" ? prefs.redo : {}) as Record<string, number>;
  const left = kind === "geometry"
    ? (redoPrefs.geometry ?? REDO_QUOTAS.geometry)
    : (redoPrefs.material ?? REDO_QUOTAS.material);
  if (left <= 0) {
    return NextResponse.json(
      { error: "redo_quota_exhausted", kind, left: 0 },
      { status: 402 },
    );
  }
  const nextPrefs = {
    ...prefs,
    redo: { ...redoPrefs, [kind]: left - 1 },
  } as unknown as Prisma.InputJsonObject;
  await db.user.update({ where: { id: user.id }, data: { preferences: nextPrefs } });

  if (kind === "material") {
    if (!source.inputBytes && !source.inputImageUrl) {
      // restore quota — material redo needs a reference image
      await db.user
        .update({ where: { id: user.id }, data: { preferences: prefs as unknown as Prisma.InputJsonObject } })
        .catch(() => undefined);
      return NextResponse.json(
        { error: "material_redo_needs_reference", detail: "Material redo re-paints from the reference image — available on image-driven runs." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, kind, left: left - 1, task_uuid: uuid });
  }

  // ---- geometry redo: clone the task with a fresh seed ----
  const settings = (source.settings && typeof source.settings === "object" ? source.settings : {}) as Record<string, unknown>;
  const newSeed = Math.floor(Math.random() * 65536);
  const newId = randomUUID();
  const imageBase64 = source.inputBytes ? Buffer.from(source.inputBytes).toString("base64") : undefined;
  const nextSettings = {
    ...settings,
    seed: newSeed,
    redo_of: uuid,
    ...(source.engine !== undefined ? { pay_by_result: true } : {}),
  } as unknown as Prisma.InputJsonObject;
  await db.task.create({
    data: {
      id: newId,
      userId: user.id,
      type: source.type,
      prompt: source.prompt,
      step: "ModelGenerate",
      userState: "created",
      inputImageUrl: source.inputBytes ? `/api/task/${newId}/input` : source.inputImageUrl,
      settings: nextSettings,
      ...(source.engine ? { engine: source.engine } : {}),
      seed: newSeed,
      ...(source.inputBytes ? { inputBytes: source.inputBytes } : {}),
      ...(source.spec !== undefined && source.spec !== null ? { spec: source.spec } : {}),
    },
  });

  // Fast/legacy tasks run the server pipeline; neural tasks stay
  // client-driven (the studio re-runs the pipeline against the new uuid).
  if (source.engine !== "neural") {
    const imageMime = (settings.input_mime as string | undefined) ?? undefined;
    const kick = () => runPipelineNow(newId, { imageBase64, imageMime });
    if (typeof process !== "undefined" && process.env.VERCEL) {
      const { after } = await import("next/server");
      after(kick);
    } else {
      void kick();
    }
  }

  return NextResponse.json({
    ok: true,
    kind,
    left: left - 1,
    task_uuid: newId,
    seed: newSeed,
    engine: source.engine,
    ...(source.engine === "neural" ? { client_pipeline: true } : {}),
  });
}
