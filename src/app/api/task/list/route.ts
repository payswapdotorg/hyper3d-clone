import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildCompactCard, TASK_BLOB_OMIT } from "@/lib/task-serializer";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gallery list.
 *  ?filter=mine (auth) | featured (public)
 *  Task 48 backend audit — the featured branch backs the landing ASSET
 *  gallery and supports the reference's real controls:
 *  ?q=<text>      — case-insensitive search across title/prompt/tags
 *  ?sort=featured (default: curated oldest-first) | latest | liked
 *  ?limit=<1..50> + ?offset=<n> — Load More pagination
 *
 * Response shape: a bare array for legacy callers (the dashboard rail's
 * `filter=featured` / `filter=mine` fetches); the { items, total, has_more }
 * envelope whenever any gallery param (q/sort/limit/offset) is present.
 */
export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get("filter") ?? "featured";
  await ensureSeeded();

  if (filter === "mine") {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const tasks = await db.task.findMany({
      where: { userId: user.id, isFeatured: false },
      orderBy: { createdAt: "desc" },
      take: 50,
      omit: TASK_BLOB_OMIT,
    });
    return NextResponse.json(tasks.map(buildCompactCard));
  }

  // ---- featured (public gallery) ----
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const sortParam = req.nextUrl.searchParams.get("sort") ?? "featured";
  const sort: "featured" | "latest" | "liked" =
    sortParam === "latest" || sortParam === "liked" ? sortParam : "featured";
  const limitRaw = Number(req.nextUrl.searchParams.get("limit") ?? 16);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50) : 16;
  const offsetRaw = Number(req.nextUrl.searchParams.get("offset") ?? 0);
  const offset = Number.isFinite(offsetRaw) ? Math.max(Math.trunc(offsetRaw), 0) : 0;
  const galleryCall =
    req.nextUrl.searchParams.has("q") ||
    req.nextUrl.searchParams.has("sort") ||
    req.nextUrl.searchParams.has("limit") ||
    req.nextUrl.searchParams.has("offset");

  // The featured set is small (seeded + curated); fetch it whole and filter
  // in memory so search is case-insensitive across title/prompt/tags (SQLite
  // Prisma `contains` has no insensitive mode).
  let rows = await db.task.findMany({
    where: { isFeatured: true, isPrivate: false },
    orderBy: { createdAt: "asc" },
    omit: TASK_BLOB_OMIT,
  });
  if (q) {
    rows = rows.filter((t) => {
      const title = (t.title ?? "").toLowerCase();
      const prompt = t.prompt.toLowerCase();
      const tags = Array.isArray(t.tags) ? (t.tags as unknown[]).map(String) : [];
      return title.includes(q) || prompt.includes(q) || tags.some((tag) => tag.toLowerCase().includes(q));
    });
  }
  if (sort === "latest") rows = [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  else if (sort === "liked") rows = [...rows].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));

  if (!galleryCall) {
    return NextResponse.json(rows.slice(0, 16).map(buildCompactCard));
  }

  const page = rows.slice(offset, offset + limit).map(buildCompactCard);
  return NextResponse.json({
    items: page,
    total: rows.length,
    has_more: offset + page.length < rows.length,
  });
}
