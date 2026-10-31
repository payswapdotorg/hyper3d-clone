import { NextResponse } from "next/server";

import {
  PREVIEW_GATE_MESSAGE,
  PREVIEW_METHOD_MESSAGE,
  PREVIEW_UNKNOWN_HEADER,
  isPreviewFetchAllowed,
  PreviewDocumentError,
  renderPreviewDocument,
} from "@/lib/content-preview";

/**
 * POST /content-preview/render — the render half of the reference's
 * content-preview surface (recon 2026-10-31). The reference's endpoint:
 * GET → 405 "POST a preview document from /content-preview."; a POST that
 * does not originate from its own preview page → 403 "Previews render
 * only for the /content-preview page of this site." (keyed on the
 * browser's fetch metadata); successful renders answer with HTML plus
 * the X-Content-Preview-Unknown header listing the content types it
 * could not render. This clone mirrors the observable contract exactly
 * and renders its own honest block format (src/lib/content-preview.ts).
 *
 * The endpoint is listed in static-en (monthly / 0.5 / no alternates —
 * the reference's own values) while the page itself is noindex, exactly
 * the reference's own split.
 */

export async function GET(): Promise<NextResponse> {
  return new NextResponse(PREVIEW_METHOD_MESSAGE, {
    status: 405,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
      allow: "POST",
    },
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isPreviewFetchAllowed(request.headers)) {
    return new NextResponse(PREVIEW_GATE_MESSAGE, {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body must be JSON.");
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return badRequest("The request body must be a JSON object.");
  }

  try {
    const { html, unknownTypes } = renderPreviewDocument(payload as Record<string, unknown>);
    // The reference's header lists unknown types comma-separated with
    // each entry URL-encoded; the host page decodes them one by one.
    const unknownHeader = unknownTypes.map((t) => encodeURIComponent(t)).join(",");
    return new NextResponse(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex, nofollow",
        "content-security-policy": "frame-ancestors 'self'",
        "referrer-policy": "same-origin",
        "x-content-type-options": "nosniff",
        ...(unknownHeader ? { [PREVIEW_UNKNOWN_HEADER]: unknownHeader } : {}),
      },
    });
  } catch (error) {
    if (error instanceof PreviewDocumentError) {
      return badRequest(error.message);
    }
    throw error;
  }
}

function badRequest(message: string): NextResponse {
  return new NextResponse(message, {
    status: 400,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
