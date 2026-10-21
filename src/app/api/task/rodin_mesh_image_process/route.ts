import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/caption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Image auto-caption — the clone's rodin_mesh_image_process (blueprint §2
 * step 2). Accepts a multipart form with the image file (field "file" or
 * "image") and returns a structured CaptionResult plus the blueprint's
 * fidelity fields. Real VLM call server-side; never faked.
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = (form.get("file") ?? form.get("image")) as File | null;
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size > 8_000_000) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type && file.type.startsWith("image/") ? file.type : "image/png";
  const result = await analyzeImage({ imageBase64: bytes.toString("base64"), mime });

  return NextResponse.json({
    ...result,
    height: 8,
    allow_face_enhance: true,
    default_face_enhance: false,
    is_multiview: false,
    num_multiview: 0,
    bbox: [],
  });
}
