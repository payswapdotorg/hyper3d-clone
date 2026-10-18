import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NEURAL_MAX_STORED_BYTES } from "@/lib/neural-client";
import { renderPoster, normalizedClone } from "@/lib/render-preview";
import { buildScene } from "@/lib/mesh-builder";
import { exportModel } from "@/lib/exporters";
import { safeParseSceneSpec } from "@/lib/spec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GLB_MAGIC = 0x46546c67;

const MeshPostSchema = z.object({
  /** base64 of the painted neural GLB (≤2MB, decimated num_chunks=8000). */
  mesh: z.string().min(8).max(3_500_000),
  engineUsed: z.literal("neural").default("neural"),
  /** Optional client-rendered poster PNG (WebGL canvas) — used only when the
   * server-side software raster of the same mesh fails. */
  poster: z.string().max(3_500_000).optional(),
  /** Caption palette color for the server-side poster shading. */
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  faceCount: z.number().int().nonnegative().max(50_000_000).optional(),
  seed: z.number().int().min(0).max(65535).optional(),
  elapsedSeconds: z.number().finite().positive().max(3600).optional(),
});

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

/** Render a poster from the neural mesh (real geometry, software raster). */
async function posterFromMesh(
  meshBytes: Uint8Array,
  color: string | undefined,
): Promise<Uint8Array | null> {
  try {
    const scene = await parseGlbScene(meshBytes);
    if (color) {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          if (material && "color" in material) {
            (material as THREE.MeshStandardMaterial).color = new THREE.Color(color);
          }
        }
      });
    }
    return renderPoster(normalizedClone(scene));
  } catch {
    return null; // honest fallback — no fabricated posters
  }
}

/**
 * POST — persist the neural result the BROWSER generated (client-direct
 * engine calls keep per-user IP quota; the server never proxies the space).
 * Marks the task DonePreview (preview free — charging happens only at
 * confirm). Idempotent overwrite until confirmed.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (task.userId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const settings = (task.settings as Record<string, unknown> | null) ?? {};
  if (settings.engine !== "neural") {
    return NextResponse.json({ error: "not_neural_task" }, { status: 400 });
  }
  if (task.confirmedAt) {
    return NextResponse.json({ error: "already_confirmed" }, { status: 409 });
  }
  if (task.userState === "failed") {
    return NextResponse.json({ error: "task_failed" }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = MeshPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }

  const meshBytes = new Uint8Array(Buffer.from(parsed.data.mesh, "base64"));
  if (meshBytes.byteLength === 0) {
    return NextResponse.json({ error: "empty_mesh" }, { status: 400 });
  }
  if (meshBytes.byteLength > NEURAL_MAX_STORED_BYTES) {
    return NextResponse.json(
      { error: "mesh_too_large", limit: NEURAL_MAX_STORED_BYTES, size: meshBytes.byteLength },
      { status: 413 },
    );
  }
  const view = new DataView(meshBytes.buffer, meshBytes.byteOffset, meshBytes.byteLength);
  if (view.byteLength >= 4 && view.getUint32(0, true) !== GLB_MAGIC) {
    return NextResponse.json({ error: "not_a_glb" }, { status: 400 });
  }

  // Poster: server-side software raster of the REAL mesh; client poster as
  // fallback; none at all if both fail (preview then relies on the viewer).
  let posterBytes: Uint8Array | null = null;
  try {
    posterBytes = await posterFromMesh(meshBytes, parsed.data.color);
  } catch {
    posterBytes = null;
  }
  if (!posterBytes && parsed.data.poster) {
    try {
      const candidate = new Uint8Array(Buffer.from(parsed.data.poster, "base64"));
      if (candidate.byteLength > 8 && candidate[0] === 0x89 && candidate[1] === 0x50) {
        posterBytes = candidate;
      }
    } catch {
      posterBytes = null;
    }
  }

  const elapsed =
    parsed.data.elapsedSeconds ??
    Math.max(0.05, (Date.now() - task.createdAt.getTime()) / 1000);

  const nextSettings: Record<string, unknown> = {
    ...settings,
    pay_by_result: true,
    mesh_faces: parsed.data.faceCount ?? null,
    mesh_bytes: meshBytes.byteLength,
  };
  delete nextSettings.progress;

  await db.task.update({
    where: { id: uuid },
    data: {
      meshBytes,
      engineUsed: "neural",
      posterBytes: posterBytes ? new Uint8Array(posterBytes) : null,
      previewImageUrl: posterBytes ? `/api/task/${uuid}/preview` : null,
      modelUrl: `/api/task/${uuid}/mesh`,
      videoUrl: null,
      usage: { elapsed_seconds: Number(elapsed.toFixed(3)), used_tokens: 0 },
      userState: "DonePreview",
      step: "ModelGenerate",
      generationUuid: randomUUID(),
      generateTime: new Date(),
      seed: parsed.data.seed ?? task.seed ?? null,
      settings: nextSettings,
    },
  });

  return NextResponse.json({
    task_uuid: uuid,
    user_state: "DonePreview",
    engine_used: "neural",
    mesh_bytes: meshBytes.byteLength,
    poster: posterBytes ? `/api/task/${uuid}/preview` : null,
  });
}

/**
 * GET — the FREE preview mesh (never gated by the confirm gate): serves the
 * stored neural GLB, or for spec-backed tasks builds the GLB from the stored
 * spec. This is what the studio viewer loads; downloads go through the gated
 * export endpoint.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await ctx.params;
  const task = await db.task.findUnique({ where: { id: uuid } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (task.meshBytes && task.meshBytes.length > 0) {
    const bytes = new Uint8Array(task.meshBytes);
    return new NextResponse(bytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "content-type": "model/gltf-binary",
        "content-length": String(bytes.byteLength),
        "cache-control": "private, max-age=60",
      },
    });
  }

  // Spec-backed task: build the GLB from the stored spec (same bytes the
  // export endpoint produces for it).
  const parsedSpec = safeParseSceneSpec(task.spec);
  if (!parsedSpec.ok) {
    return NextResponse.json({ error: "task_not_complete", user_state: task.userState }, { status: 409 });
  }
  const model = normalizedClone(buildScene(parsedSpec.spec));
  const result = await exportModel(model, "glb");
  return new NextResponse(result.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": result.contentType,
      "content-length": String(result.bytes.byteLength),
      "cache-control": "private, max-age=60",
    },
  });
}
