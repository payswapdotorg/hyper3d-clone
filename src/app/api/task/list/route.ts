import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildCompactCard, TASK_BLOB_OMIT } from "@/lib/task-serializer";
import { ensureSeeded } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Gallery list: ?filter=mine (auth) | featured (public). */
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

  const tasks = await db.task.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "asc" },
    take: 16,
    omit: TASK_BLOB_OMIT,
  });
  return NextResponse.json(tasks.map(buildCompactCard));
}
