import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// The VLM/LLM clients are mocked — network is never touched.
vi.mock("@/lib/ai-clients", () => {
  const fakeVision = {
    createVision: vi.fn(async () => ({
      choices: [{ message: { content: JSON.stringify({ caption_prompt: "A red apple. simple geometry.", components: [{ primitive: "sphere", params: { radius: 1 }, color: "#c62828" }], palette: ["#c62828"], form: "rounded-organic" }) } }],
    })),
  };
  return {
    getVisionClient: async () => fakeVision,
    getChatClient: async () => ({ create: vi.fn() }),
  };
});

import { POST as createTaskRoute } from "@/app/api/task/route";
import { POST as confirmRoute } from "@/app/api/task/[uuid]/confirm/route";
import { GET as exportRoute } from "@/app/api/task/[uuid]/export/route";
import { POST as meshRoute } from "@/app/api/task/[uuid]/mesh/route";
import { setEngine, setPacing, type TaskEngine } from "@/lib/queue";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { parseSceneSpec } from "@/lib/spec";
import { jsonRequest, routeCtx, signInAs, resetDb, BASE } from "@/lib/testing/api";

const FAKE_SPEC = parseSceneSpec({
  name: "Test Apple",
  palette: ["#c62828"],
  objects: [{ type: "sphere", params: { radius: 1 }, material: { color: "#c62828" } }],
});

const fakeEngine: TaskEngine = async () => ({ spec: FAKE_SPEC, usage: { used_tokens: 10 } });

/** A real (tiny) GLB for the mesh upload path — built with the stock exporter. */
async function tinyGlb(): Promise<string> {
  const { exportModel } = await import("@/lib/exporters");
  const THREE = await import("three");
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: "#c62828" }));
  const result = await exportModel(mesh, "glb");
  return Buffer.from(result.bytes).toString("base64");
}

/** Create an engine-tagged (pay-by-result) task and return its uuid. */
async function createNeuralTask(cookie: string, overrides: Record<string, unknown> = {}): Promise<string> {
  const res = await createTaskRoute(
    jsonRequest(`${BASE}/api/task`, "POST", {
      type: "RodinStandard",
      prompt: "neural apple",
      engine: "neural",
      seed: 1234,
      image: `data:image/png;base64,${Buffer.from("fakepng").toString("base64")}`,
      ...overrides,
    }, cookie),
  );
  expect(res.status).toBe(200);
  const body = (await res.json()) as { uuid: string };
  return body.uuid;
}

describe("credits / confirm-gate (pay-by-result)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb();
    await ensureSeeded({ posters: false });
    setPacing(false);
    setEngine(fakeEngine);
  });

  it("preview is free: engine-tagged task creation charges 0 credits", async () => {
    const { cookie, userId } = await signInAs();
    const before = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const uuid = await createNeuralTask(cookie);

    const task = await db.task.findUniqueOrThrow({ where: { id: uuid } });
    expect(task.creditsSpent).toBe(0);
    expect((task.settings as Record<string, unknown>).pay_by_result).toBe(true);
    expect(task.engine).toBe("neural");
    expect(task.seed).toBe(1234);
    expect(task.confirmedAt).toBeNull();

    const after = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(after.balance).toBe(before.balance); // nothing deducted
    const entries = await db.creditEntry.findMany({ where: { userId, taskId: uuid } });
    expect(entries).toHaveLength(0); // no charge event at all
  });

  it("Confirm & Export charges EXACTLY 1 credit — atomically, once, ledger recorded", async () => {
    const { cookie, userId } = await signInAs();
    const uuid = await createNeuralTask(cookie);
    const balanceBefore = (await db.user.findUniqueOrThrow({ where: { id: userId } })).balance;

    const res = await confirmRoute(
      jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, `h3d_session=x`),
      routeCtx({ uuid }),
    );
    expect(res.status).toBe(401); // auth required

    const ok = await confirmRoute(jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, cookie), routeCtx({ uuid }));
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { confirmed: boolean; charged: number; balance: number };
    expect(body.charged).toBe(1);

    const after = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(after.balance).toBe(balanceBefore - 1); // exactly one credit
    const task = await db.task.findUniqueOrThrow({ where: { id: uuid } });
    expect(task.confirmedAt).not.toBeNull();
    expect(task.creditsSpent).toBe(1);
    const entries = await db.creditEntry.findMany({ where: { userId, taskId: uuid } });
    expect(entries).toHaveLength(1);
    expect(entries[0].delta).toBe(-1);
    expect(entries[0].reason).toBe("confirm_export");
  });

  it("a second confirm never double-charges (idempotent)", async () => {
    const { cookie, userId } = await signInAs();
    const uuid = await createNeuralTask(cookie);
    const first = await confirmRoute(jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, cookie), routeCtx({ uuid }));
    expect(first.status).toBe(200);
    const second = await confirmRoute(jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, cookie), routeCtx({ uuid }));
    expect(second.status).toBe(200);
    const body = (await second.json()) as { already_confirmed: boolean };
    expect(body.already_confirmed).toBe(true);

    const after = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(after.balance).toBe(49); // 50 - 1, still
    const entries = await db.creditEntry.findMany({ where: { userId, taskId: uuid } });
    expect(entries).toHaveLength(1);
  });

  it("a zero balance floors at 0: confirm returns 402 and the task stays unconfirmed", async () => {
    const { createTestUser } = await import("@/lib/testing/api");
    const user = await createTestUser({ email: "broke-neural@example.com", balance: 0 });
    const { POST: signIn } = await import("@/app/api/auth/sign-in/route");
    const signInRes = await signIn(jsonRequest(`${BASE}/api/auth/sign-in`, "POST", { email: user.email, password: user.password }));
    const cookie = (signInRes.headers.getSetCookie?.()[0] ?? "").split(";")[0];

    const uuid = await createNeuralTask(cookie);
    const res = await confirmRoute(jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, cookie), routeCtx({ uuid }));
    expect(res.status).toBe(402);
    const body = (await res.json()) as { error: string; balance: number; required: number };
    expect(body.error).toBe("insufficient_credits");

    const after = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.balance).toBe(0); // floor — never negative
    const task = await db.task.findUniqueOrThrow({ where: { id: uuid } });
    expect(task.confirmedAt).toBeNull();
    const entries = await db.creditEntry.findMany({ where: { userId: user.id } });
    expect(entries).toHaveLength(0);
  });

  it("exports are gated: 402 confirmation_required before confirm, 200 after", async () => {
    const { cookie } = await signInAs();
    const uuid = await createNeuralTask(cookie);
    // Complete the neural task by posting the generated mesh.
    const glb = await tinyGlb();
    const meshRes = await meshRoute(
      jsonRequest(`${BASE}/api/task/${uuid}/mesh`, "POST", { mesh: glb, engineUsed: "neural" }, cookie),
      routeCtx({ uuid }),
    );
    expect(meshRes.status).toBe(200);

    const gated = await exportRoute(new NextRequest(`${BASE}/api/task/${uuid}/export?format=glb`), routeCtx({ uuid }));
    expect(gated.status).toBe(402);
    const gateBody = (await gated.json()) as { error: string };
    expect(gateBody.error).toBe("confirmation_required");

    await confirmRoute(jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, cookie), routeCtx({ uuid }));
    const open = await exportRoute(new NextRequest(`${BASE}/api/task/${uuid}/export?format=glb`), routeCtx({ uuid }));
    expect(open.status).toBe(200);
    expect(open.headers.get("content-type")).toContain("model/gltf-binary");
    const bytes = new Uint8Array(await open.arrayBuffer());
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it("the stored neural mesh serves byte-identical GLB through the mesh route (preview stays free)", async () => {
    const { cookie } = await signInAs();
    const uuid = await createNeuralTask(cookie);
    const glbBytes = Buffer.from(await tinyGlb(), "base64");
    await meshRoute(
      jsonRequest(`${BASE}/api/task/${uuid}/mesh`, "POST", { mesh: glbBytes.toString("base64"), engineUsed: "neural" }, cookie),
      routeCtx({ uuid }),
    );

    const { GET as meshGet } = await import("@/app/api/task/[uuid]/mesh/route");
    const res = await meshGet(new NextRequest(`${BASE}/api/task/${uuid}/mesh`), routeCtx({ uuid }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("model/gltf-binary");
    const served = Buffer.from(await res.arrayBuffer());
    expect(served.equals(glbBytes)).toBe(true);

    const task = await db.task.findUniqueOrThrow({ where: { id: uuid } });
    expect(task.engineUsed).toBe("neural");
    expect(task.userState).toBe("DonePreview");
  });

  it("confirm rejects non-pay-by-result tasks (already paid at creation) and non-owners", async () => {
    const { cookie } = await signInAs();
    // A standard task (old billing: charged at creation) — 400 on confirm.
    const standard = await createTaskRoute(
      jsonRequest(`${BASE}/api/task`, "POST", { type: "RodinStandard", prompt: "standard", effort: "extreme-low" }, cookie),
    );
    const standardUuid = ((await standard.json()) as { uuid: string }).uuid;
    const res = await confirmRoute(
      jsonRequest(`${BASE}/api/task/${standardUuid}/confirm`, "POST", {}, cookie),
      routeCtx({ uuid: standardUuid }),
    );
    expect(res.status).toBe(400);

    // Non-owner confirm → 403, no charge.
    const { createTestUser, sessionCookieFrom } = await import("@/lib/testing/api");
    const other = await createTestUser({ email: "other@example.com", balance: 50 });
    const { POST: signIn } = await import("@/app/api/auth/sign-in/route");
    const signInRes = await signIn(jsonRequest(`${BASE}/api/auth/sign-in`, "POST", { email: other.email, password: other.password }));
    const otherCookie = sessionCookieFrom(signInRes);
    const uuid = await createNeuralTask(cookie);
    const forbidden = await confirmRoute(
      jsonRequest(`${BASE}/api/task/${uuid}/confirm`, "POST", {}, otherCookie),
      routeCtx({ uuid }),
    );
    expect(forbidden.status).toBe(403);
    const otherAfter = await db.user.findUniqueOrThrow({ where: { id: other.id } });
    expect(otherAfter.balance).toBe(50);
    const task = await db.task.findUniqueOrThrow({ where: { id: uuid } });
    expect(task.confirmedAt).toBeNull();
  });
});
