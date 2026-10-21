import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// The VLM/LLM clients are mocked for route tests — network is never touched.
vi.mock("@/lib/ai-clients", () => {
  const validCaption = {
    caption_prompt: "A red fresh apple. simple geometry.",
    components: [
      { primitive: "sphere", params: { radius: 1 }, position: [0, 0, 0], color: "#c62828" },
      {
        primitive: "cylinder",
        params: { radiusTop: 0.06, radiusBottom: 0.08, height: 0.7 },
        position: [0, 1.1, 0],
        color: "#6d4c41",
      },
    ],
    palette: ["#c62828", "#6d4c41", "#43a047"],
    form: "rounded-organic",
  };
  const fakeVision = {
    createVision: vi.fn(async () => ({
      choices: [{ message: { content: JSON.stringify(validCaption) } }],
    })),
  };
  return {
    getVisionClient: async () => fakeVision,
    getChatClient: async () => ({ create: vi.fn() }),
    __fakeVision: fakeVision,
  };
});

import { POST as createTaskRoute } from "@/app/api/task/route";
import { GET as taskCardRoute } from "@/app/api/task/card/[uuid]/route";
import { GET as taskHistoryRoute } from "@/app/api/task/history/[uuid]/route";
import { GET as taskListRoute } from "@/app/api/task/list/route";
import { GET as taskExportRoute } from "@/app/api/task/[uuid]/export/route";
import { POST as imageProcessRoute } from "@/app/api/task/rodin_mesh_image_process/route";
import { POST as getUserInfoRoute } from "@/app/api/user/get_info/route";
import { setEngine, setPacing, type TaskEngine } from "@/lib/queue";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { parseSceneSpec } from "@/lib/spec";
import {
  jsonRequest,
  multipartRequest,
  routeCtx,
  signInAs,
  createTestUser,
  resetDb,
  BASE,
} from "@/lib/testing/api";

const FAKE_SPEC = parseSceneSpec({
  name: "Test Apple",
  palette: ["#c62828", "#6d4c41"],
  objects: [
    { type: "sphere", params: { radius: 1 }, material: { color: "#c62828", roughness: 0.35 } },
    {
      type: "cylinder",
      params: { radiusTop: 0.06, radiusBottom: 0.08, height: 0.7 },
      transform: { position: [0, 1.1, 0] },
      material: { color: "#6d4c41" },
    },
  ],
});

const fakeEngine: TaskEngine = async () => ({
  spec: FAKE_SPEC,
  usage: { used_tokens: 1234 },
});

async function waitForState(taskId: string, state: string, timeoutMs = 15_000) {
  await vi.waitFor(
    async () => {
      const task = await db.task.findUnique({ where: { id: taskId } });
      expect(task?.userState).toBe(state);
    },
    { timeout: timeoutMs, interval: 100 },
  );
}

describe("API routes", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    await ensureSeeded({ posters: false });
    setPacing(false);
    setEngine(fakeEngine);
  });

  it("POST /api/task returns 401 without a session cookie", async () => {
    const res = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "a red apple" }),
    );
    expect(res.status).toBe(401);
  });

  it("POST /api/task creates a task, deducts credits and enqueues generation", async () => {
    const { cookie } = await signInAs();

    // First task for the demo user → free preview (0 credits).
    const res = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "a red apple", effort: "extreme-low" }, cookie),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { uuid: string; producer: string; job: { uuids: string[] } };
    expect(body.uuid).toBeTruthy();
    expect(body.producer).toBe("standard");
    expect(body.job.uuids[0]).toBe(body.uuid);

    const task = await db.task.findUnique({ where: { id: body.uuid } });
    expect(task).toBeTruthy();
    expect(task?.type).toBe("RodinStandard");
    expect(task?.prompt).toBe("a red apple");
    expect(task?.creditsSpent).toBe(0);

    const demo = await db.user.findUnique({ where: { email: "demo@hyper3d.clone" } });
    expect(demo?.balance).toBe(50); // free preview: nothing deducted

    const entries = await db.creditEntry.findMany({ where: { userId: demo!.id } });
    expect(entries.filter((e) => e.taskId === body.uuid)).toHaveLength(1);
    expect(entries.find((e) => e.taskId === body.uuid)?.delta).toBe(0);

    await waitForState(body.uuid, "DonePreview");
  });

  it("POST /api/task charges 1 credit for a standard second task", async () => {
    const { cookie } = await signInAs();
    const first = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "first" }, cookie),
    );
    const firstBody = (await first.json()) as { uuid: string };
    await waitForState(firstBody.uuid, "DonePreview");

    const second = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "second" }, cookie),
    );
    expect(second.status).toBe(200);
    const demo = await db.user.findUnique({ where: { email: "demo@hyper3d.clone" } });
    expect(demo?.balance).toBe(49);
  });

  it("POST /api/task returns 402 when the balance is insufficient", async () => {
    const user = await createTestUser({ email: "broke@example.com", balance: 1 });
    const res = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinAgentic", prompt: "big model" }, `h3d_session=bogus`),
    );
    // sanity: bogus cookie rejected first
    expect(res.status).toBe(401);

    // Sign the broke user in properly (their first task is free, so spend down manually).
    const { cookie } = await (async () => {
      const { POST: signIn } = await import("@/app/api/auth/sign-in/route");
      const r = await signIn(jsonRequest(`${BASE}/api/auth/sign-in`, "POST", { email: user.email, password: user.password }));
      const pair = (r.headers.getSetCookie?.()[0] ?? "").split(";")[0];
      return { cookie: pair };
    })();
    // Give them a task history so the free preview is consumed.
    await db.task.create({ data: { userId: user.id, type: "RodinStandard", prompt: "history", settings: { effort: "medium" } } });
    const res2 = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinAgentic", prompt: "big model" }, cookie),
    );
    expect(res2.status).toBe(402);
    const body = (await res2.json()) as { error: string };
    expect(body.error).toBe("insufficient_credits");
    // balance untouched
    const after = await db.user.findUnique({ where: { id: user.id } });
    expect(after?.balance).toBe(1);
  });

  it("GET /api/task/card/:uuid returns the blueprint §4 task-card shape", async () => {
    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinAgentic", prompt: "a red apple", effort: "extreme-low" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    await waitForState(uuid, "DonePreview");

    const res = await taskCardRoute(
      new NextRequest(`${BASE}/api/task/card/${uuid}`),
      routeCtx({ uuid }),
    );
    expect(res.status).toBe(200);
    const card = (await res.json()) as Record<string, unknown>;

    expect(card.task_uuid).toBe(uuid);
    expect(card.type).toBe("RodinAgentic");
    expect(card.prompt).toBe("a red apple");
    expect(card.step).toBe("ModelGenerate");
    expect(card.pending_jobs).toEqual([]);
    expect(typeof card.time).toBe("string");
    expect(card.author).toMatchObject({
      username: expect.any(String),
      user_uuid: expect.any(String),
    });
    expect(card.image_url).toEqual(expect.any(String));
    expect(card.video_url).toBeNull();
    const usage = card.usage as { elapsed_seconds: number; used_tokens: number };
    expect(typeof usage.elapsed_seconds).toBe("number");
    expect(typeof usage.used_tokens).toBe("number");
    expect(usage.used_tokens).toBe(1234);
    expect(card.settings).toMatchObject({ version: "v3", height: expect.any(Number) });
    expect(card.model_preview_info).toMatchObject({ model: expect.any(String) });
    expect(card.card_poster_info).toMatchObject({ preview_image: expect.any(String) });
    const versions = card.versions as Record<string, { model: string; preview_image: string; generation_uuid: string }>;
    expect(versions.v3).toBeTruthy();
    expect(versions.v3.model).toContain(uuid);
    expect(versions.v3.preview_image).toContain(uuid);
    expect(typeof versions.v3.generation_uuid).toBe("string");
    expect(card.user_state).toBe("DonePreview");
    expect(typeof card.generate_time).toBe("string");
  });

  it("GET /api/task/card/:uuid 404s for unknown tasks", async () => {
    const res = await taskCardRoute(
      new NextRequest(`${BASE}/api/task/card/nope`),
      routeCtx({ uuid: "nope" }),
    );
    expect(res.status).toBe(404);
  });

  it("GET /api/task/history/:uuid returns the version history shape", async () => {
    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "mug" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    await waitForState(uuid, "DonePreview");

    const res = await taskHistoryRoute(
      new NextRequest(`${BASE}/api/task/history/${uuid}`),
      routeCtx({ uuid }),
    );
    expect(res.status).toBe(200);
    const history = (await res.json()) as {
      v3: { model: string; preview_image: string; generation_time: string; generation_uuid: string; usage: unknown };
    };
    expect(history.v3).toBeTruthy();
    expect(history.v3.model).toContain(uuid);
    expect(history.v3.preview_image).toContain(uuid);
    expect(typeof history.v3.generation_time).toBe("string");
    expect(typeof history.v3.generation_uuid).toBe("string");
    expect(history.v3.usage).toBeTruthy();
  });

  it("GET /api/task/list returns the user's tasks for filter=mine (auth required)", async () => {
    const mineNoAuth = await taskListRoute(new NextRequest(`${BASE}/api/task/list?filter=mine`));
    expect(mineNoAuth.status).toBe(401);

    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "my model" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    await waitForState(uuid, "DonePreview");

    const res = await taskListRoute(
      new NextRequest(`${BASE}/api/task/list?filter=mine`, { headers: { cookie } }),
    );
    expect(res.status).toBe(200);
    const tasks = (await res.json()) as { task_uuid: string; prompt: string; image_url: string | null }[];
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.some((t) => t.task_uuid === uuid)).toBe(true);
  });

  it("GET /api/task/list returns featured tasks without auth", async () => {
    const res = await taskListRoute(new NextRequest(`${BASE}/api/task/list?filter=featured`));
    expect(res.status).toBe(200);
    const tasks = (await res.json()) as { task_uuid: string; prompt: string; image_url: string | null; is_featured: boolean }[];
    expect(tasks.length).toBeGreaterThanOrEqual(8);
    expect(tasks.every((t) => t.is_featured)).toBe(true);
    expect(tasks.every((t) => typeof t.image_url === "string")).toBe(true);
  });

  it("POST /api/task/rodin_mesh_image_process turns a multipart upload into a CaptionResult", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
    ]);
    const res = await imageProcessRoute(
      multipartRequest(`${BASE}/api/task/rodin_mesh_image_process`, {
        name: "apple.png",
        type: "image/png",
        bytes: pngHeader,
      }),
    );
    expect(res.status).toBe(200);
    const caption = (await res.json()) as {
      prompt: string;
      components: { primitive: string; params: Record<string, unknown> }[];
      palette: string[];
      form: string;
      height: number;
      allow_face_enhance: boolean;
      bbox: unknown[];
    };
    expect(caption.prompt).toBe("A red fresh apple. simple geometry.");
    expect(caption.components.length).toBeGreaterThanOrEqual(1);
    expect(caption.components[0].primitive).toBe("sphere");
    expect(caption.palette.every((p) => /^#[0-9a-fA-F]{6}$/.test(p))).toBe(true);
    // blueprint §2 fidelity fields
    expect(caption.height).toBe(8);
    expect(caption.allow_face_enhance).toBe(true);
    expect(caption.bbox).toEqual([]);
  });

  it("POST /api/task/rodin_mesh_image_process 400s without a file", async () => {
    const res = await imageProcessRoute(
      new NextRequest(`${BASE}/api/task/rodin_mesh_image_process`, {
        method: "POST",
        body: new FormData(),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("POST /api/user/get_info balance reflects the ledger", async () => {
    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "first" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    await waitForState(uuid, "DonePreview");
    await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "second" }, cookie),
    );

    const res = await getUserInfoRoute(jsonRequest(`${BASE}/api/user/get_info`, "POST", {}, cookie));
    expect(res.status).toBe(200);
    const info = (await res.json()) as { balance: number; email: string; preferences: Record<string, unknown> };
    expect(info.balance).toBe(49);
    expect(info.email).toBe("demo@hyper3d.clone");
    expect(info.preferences).toMatchObject({ rodin_generation_mode: expect.any(String) });
  });

  it("GET /api/task/:uuid/export?format=glb streams real GLB bytes", async () => {
    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "export me" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    await waitForState(uuid, "DonePreview");

    const res = await taskExportRoute(
      new NextRequest(`${BASE}/api/task/${uuid}/export?format=glb`),
      routeCtx({ uuid }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("model/gltf-binary");
    const bytes = new Uint8Array(await res.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint32(0, true)).toBe(0x46546c67);
  });

  it("GET /api/task/:uuid/export rejects bad formats and unfinished tasks", async () => {
    const { cookie } = await signInAs();
    const create = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "no spec yet" }, cookie),
    );
    const { uuid } = (await create.json()) as { uuid: string };
    // Task is still pending (fake engine may have completed by now — check state)
    const task = await db.task.findUnique({ where: { id: uuid } });
    if (task?.userState === "created" || task?.userState === "queued") {
      const res = await taskExportRoute(
        new NextRequest(`${BASE}/api/task/${uuid}/export?format=glb`),
        routeCtx({ uuid }),
      );
      expect(res.status).toBe(409);
    }
    await waitForState(uuid, "DonePreview");
    const bad = await taskExportRoute(
      new NextRequest(`${BASE}/api/task/${uuid}/export?format=ply`),
      routeCtx({ uuid }),
    );
    expect(bad.status).toBe(400);
    const missing = await taskExportRoute(
      new NextRequest(`${BASE}/api/task/unknown/export?format=glb`),
      routeCtx({ uuid: "unknown" }),
    );
    expect(missing.status).toBe(404);
  });

  it("accepts an input image on task creation and stores a reference URL", async () => {
    const { cookie } = await signInAs();
    const dataUrl = `data:image/png;base64,${Buffer.from("fakepng").toString("base64")}`;
    const res = await createTaskRoute(
      jsonRequest(
        `${BASE}/api/task`,
        "POST",
        { type: "RodinStandard", prompt: "from image", image: dataUrl },
        cookie,
      ),
    );
    expect(res.status).toBe(200);
    const { uuid } = (await res.json()) as { uuid: string };
    const task = await db.task.findUnique({ where: { id: uuid } });
    expect(task?.inputImageUrl).toBe(`/api/task/${uuid}/input`);
    await waitForState(uuid, "DonePreview");
  });
});
