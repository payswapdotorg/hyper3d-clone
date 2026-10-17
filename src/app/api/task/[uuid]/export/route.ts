import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exportModel, EXPORT_FORMATS, type ExportFormat } from "@/lib/exporters";
import { buildScene } from "@/lib/mesh-builder";
import { normalizedClone } from "@/lib/render-preview";
import { safeParseSceneSpec } from "@/lib/spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real model download: ?format=glb|gltf|obj|stl|usdz — builds the scene
 * from the stored spec and streams standards-compliant bytes produced by
 * the three.js exporters.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const format = req.nextUrl.searchParams.get("format") ?? "glb";

  if (!EXPORT_FORMATS.includes(format as ExportFormat)) {
    return NextResponse.json(
      { error: "invalid_format", supported: EXPORT_FORMATS },
      { status: 400 },
    );
  }

  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = safeParseSceneSpec(task.spec);
  if (!parsed.ok) {
    return NextResponse.json({ error: "task_not_complete", user_state: task.userState }, { status: 409 });
  }

  const group = buildScene(parsed.spec);
  const model = normalizedClone(group);
  const result = await exportModel(model, format as ExportFormat);

  return new NextResponse(result.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": result.contentType,
      "content-length": String(result.bytes.byteLength),
      "content-disposition": `attachment; filename="${task.id}.${result.ext}"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
