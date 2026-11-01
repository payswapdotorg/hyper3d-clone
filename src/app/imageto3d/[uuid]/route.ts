import { NextResponse, type NextRequest } from "next/server";

import { isUuidShape } from "@/lib/workspace-shell-routes";

/**
 * /imageto3d/[uuid] — the root-level imageto3d alias (t82, probed
 * 2026-11-01): the reference enforces the shell's own uuid shape
 * server-side here —
 *
 *   /imageto3d/{36-char hex-dash uuid}  301 → /workspace/imageto3d/{uuid}
 *                                         (case preserved, UPPERCASE ok)
 *   /imageto3d/{anything else}           404
 *   /imageto3d/{uuid}/extra (deeper)     404 (the alias is one segment)
 *
 * A Route Handler rather than a next.config redirect because the
 * redirect table cannot regex-validate the segment; the bare
 * /imageto3d → /features/image-to-3d alias is static and lives in
 * next.config.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  if (!isUuidShape(uuid)) {
    return new NextResponse(null, { status: 404 });
  }
  const url = request.nextUrl.clone();
  url.pathname = `/workspace/imageto3d/${uuid}`;
  return NextResponse.redirect(url, 301);
}
