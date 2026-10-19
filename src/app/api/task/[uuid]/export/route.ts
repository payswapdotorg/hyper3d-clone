import { NextRequest, NextResponse } from "next/server";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { db } from "@/lib/db";
import { TASK_BLOB_OMIT } from "@/lib/task-serializer";
import { exportModel, EXPORT_FORMATS, type ExportFormat } from "@/lib/exporters";
import { buildScene } from "@/lib/mesh-builder";
import { normalizedClone } from "@/lib/render-preview";
import { safeParseSceneSpec } from "@/lib/spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Real model download: ?format=glb|gltf|obj|stl|usdz.
 *
 * Pay-by-result tasks (engine2): gated behind the confirm gate — a 402 with
 * `confirmation_required` until the user has confirmed (exactly 1 credit).
 * After confirmation:
 *   - neural tasks serve the stored meshBytes for glb and convert the stored
 *     GLB into the other formats server-side (GLTFLoader + stock exporters);
 *   - spec-backed tasks build the scene from the stored spec.
 * Legacy tasks (billed at creation) were never gated — unchanged behavior.
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

  const task = await db.task.findUnique({
    where: { id: uuid },
    // Blob-drag guard: this route needs meshBytes + spec, but never the
    // poster or input images — don't drag them over the wire.
    omit: { ...TASK_BLOB_OMIT, meshBytes: false },
  });
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  if (settings.pay_by_result === true && !task.confirmedAt) {
    return NextResponse.json(
      {
        error: "confirmation_required",
        task_uuid: uuid,
        detail: "Preview is free — confirm the result (1 credit) to unlock exports.",
      },
      { status: 402 },
    );
  }

  const headers = (bytes: Uint8Array, contentType: string, ext: string) => ({
    "content-type": contentType,
    "content-length": String(bytes.byteLength),
    "content-disposition": `attachment; filename="${task.id}.${ext}"`,
    "cache-control": "public, max-age=3600",
  });

  // Neural result: serve the stored GLB directly / re-export other formats
  // from the parsed GLB (same mesh the preview showed — byte-faithful).
  if (task.meshBytes && task.meshBytes.length > 0) {
    const meshBytes = new Uint8Array(task.meshBytes);
    if (format === "glb") {
      return new NextResponse(meshBytes as unknown as BodyInit, {
        status: 200,
        headers: headers(meshBytes, "model/gltf-binary", "glb"),
      });
    }
    try {
      const scene = await parseGlbScene(meshBytes);
      const model = normalizedClone(scene);
      const result = await exportModel(model, format as ExportFormat);
      return new NextResponse(result.bytes as unknown as BodyInit, {
        status: 200,
        headers: headers(result.bytes, result.contentType, result.ext),
      });
    } catch (err) {
      return NextResponse.json(
        { error: "mesh_export_failed", detail: err instanceof Error ? err.message : "conversion failed" },
        { status: 500 },
      );
    }
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
    headers: headers(result.bytes, result.contentType, result.ext),
  });
}

/** Load a GLB's scene from raw bytes (server-side, embedded data only). */
async function parseGlbScene(bytes: Uint8Array): Promise<THREE.Object3D> {
  const loader = new GLTFLoader();
  const buffer = bytes.slice().buffer as ArrayBuffer;
  return new Promise<THREE.Object3D>((resolve, reject) => {
    loader.parse(
      buffer,
      "",
      (gltf) => resolve(gltf.scene as unknown as THREE.Object3D),
      (err) => reject(err instanceof Error ? err : new Error(String(err))),
    );
  });
}
