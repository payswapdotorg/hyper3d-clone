import { headers } from "next/headers";

import { buildBlogRssXml } from "@/lib/blog";

/**
 * /blog/rss.xml — RSS 2.0, written articles only (a feed is a promise of
 * items that exist). The channel description states the honest scope; the
 * origin is derived from the request so locs are correct in every
 * environment.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "hyper3d-clone.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const xml = buildBlogRssXml(`${proto}://${host}`);
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
