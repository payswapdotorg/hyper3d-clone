import { describe, it, expect, vi } from "vitest";
import {
  NeuralEngineError,
  NEURAL_ENGINE_BASE,
  NEURAL_LIVE_NUM_CHUNKS,
  buildShapeGenerationBody,
  createSseParser,
  extractFaceCount,
  extractMeshInfo,
  generateNeuralMesh,
} from "./neural-client";

/* ------------------------- mock infrastructure ------------------------- */

const MESH_BYTES = new Uint8Array([0x67, 0x6c, 0x54, 0x66, 1, 2, 3, 4]); // "glTf"-ish blob

/** Build a Response whose body streams the given SSE text chunks. */
function sseResponse(chunks: string[], opts: { neverClose?: boolean } = {}): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
      if (!opts.neverClose) controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function blobResponse(bytes: Uint8Array): Response {
  return new Response(bytes.slice().buffer, { status: 200 });
}

const HAPPY_SSE = [
  ": heartbeat 1728000000.0\n\n",
  "event: generating\n",
  'data: ["thinking"]\n\n',
  "event: complete\n",
  'data: [[{"path":"/tmp/gradio/abc/white_mesh.glb","orig_name":"white_mesh.glb","meta":{"_type":"gradio.FileData"}}], "<iframe…/>", "{\\"number_of_faces\\": 264118}", 1234]\n\n',
].join("");

interface CallLog {
  url: string;
  init: RequestInit | undefined;
}

/** Scripted fetch used by every test — NO network is ever touched. */
function happyFetch(calls: CallLog[]): typeof fetch {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    const href = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
    calls.push({ url: href, init });
    if (href.endsWith("/upload")) {
      return jsonResponse(["/tmp/gradio/abc/reference.png"]);
    }
    if (href.endsWith("/call/shape_generation")) {
      return jsonResponse({ event_id: "evt-123" });
    }
    if (href.includes("/call/shape_generation/evt-123")) {
      return sseResponse([HAPPY_SSE]);
    }
    if (href.includes("/file=/tmp/gradio/abc/white_mesh.glb")) {
      return blobResponse(MESH_BYTES);
    }
    throw new Error(`unexpected fetch in mock: ${href}`);
  }) as unknown as typeof fetch;
}

const BASE_INPUT = {
  image: new Blob(["fakepng"], { type: "image/png" }),
  seed: 1234,
};

/* ------------------------------ tests ------------------------------ */

describe("neural-client (all network mocked)", () => {
  it("uploads the reference via multipart POST /upload and uses the returned path", async () => {
    const calls: CallLog[] = [];
    const result = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: happyFetch(calls) });
    const upload = calls.find((c) => c.url.endsWith("/upload"));
    expect(upload).toBeTruthy();
    expect(upload?.init?.method).toBe("POST");
    expect(upload?.init?.body).toBeInstanceOf(FormData);
    const call = calls.find((c) => c.url.endsWith("/call/shape_generation"));
    const body = JSON.parse(String(call?.init?.body)) as { data: unknown[] };
    expect((body.data[0] as { path: string }).path).toBe("/tmp/gradio/abc/reference.png");
    expect(result.meshBytes.byteLength).toBe(MESH_BYTES.byteLength);
  });

  it("names the upload by the bytes' real type — the engine dispatches on the extension", async () => {
    // 2026-10-19 production incident: JPEG bytes uploaded as reference.png
    // made the engine's image loader die instantly (SSE `event: error` in
    // 0.66s) — the hidden failure behind every browser neural fallback.
    const cases: Array<[string, string]> = [
      ["image/jpeg", "reference.jpg"],
      ["image/jpg", "reference.jpg"],
      ["image/webp", "reference.webp"],
      ["image/png", "reference.png"],
    ];
    for (const [type, want] of cases) {
      const calls: CallLog[] = [];
      await generateNeuralMesh({
        ...BASE_INPUT,
        image: new Blob(["x"], { type }),
        fetchImpl: happyFetch(calls),
      });
      const upload = calls.find((c) => c.url.endsWith("/upload"));
      const form = upload?.init?.body as FormData;
      const file = form.get("files") as File;
      expect(`${type} -> ${file.name}`).toBe(`${type} -> ${want}`);
    }
  });

  it("sends the exact verified shape_generation payload (param order + defaults)", () => {
    const body = buildShapeGenerationBody({ imagePath: "/tmp/x/i.png", seed: 42 });
    expect(body.data).toEqual([
      { path: "/tmp/x/i.png", meta: { _type: "gradio.FileData" } },
      null,
      null,
      null,
      null,
      30, // steps
      5.0, // guidance_scale
      42, // seed
      256, // octree_resolution
      true, // check_box_rembg
      NEURAL_LIVE_NUM_CHUNKS, // num_chunks
      false, // randomize_seed
    ]);
  });

  it("maps multiview images onto the mv_image_front/back/left/right slots", () => {
    const body = buildShapeGenerationBody({
      imagePath: "/tmp/x/main.png",
      viewPaths: { front: "/tmp/x/f.png", right: "/tmp/x/r.png" },
      seed: 7,
      numChunks: 8000,
    });
    const data = body.data as unknown[];
    expect((data[1] as { path: string }).path).toBe("/tmp/x/f.png");
    expect(data[2]).toBeNull(); // back — not supplied
    expect(data[3]).toBeNull(); // left — not supplied
    expect((data[4] as { path: string }).path).toBe("/tmp/x/r.png");
    expect(data[10]).toBe(8000);
  });

  it("uploads each extra view and fills the matching engine slot", async () => {
    const calls: CallLog[] = [];
    const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      calls.push({ url: href, init });
      if (href.endsWith("/upload")) {
        const form = init?.body as FormData;
        const file = form.get("files") as File;
        return jsonResponse([`/tmp/gradio/abc/${file.name}`]);
      }
      if (href.endsWith("/call/shape_generation")) {
        // Capture the payload to assert slots afterwards.
        return jsonResponse({ event_id: "evt-123" });
      }
      if (href.includes("/call/shape_generation/evt-123")) return sseResponse([HAPPY_SSE]);
      if (href.includes("/file=")) return blobResponse(MESH_BYTES);
      throw new Error(`unexpected fetch: ${href}`);
    }) as unknown as typeof fetch;

    await generateNeuralMesh({
      ...BASE_INPUT,
      views: [
        { direction: "back", blob: new Blob(["b"]) },
        { direction: "left", blob: new Blob(["l"]) },
      ],
      fetchImpl: fetch,
    });

    const call = calls.find((c) => c.url.endsWith("/call/shape_generation"));
    const body = JSON.parse(String(call?.init?.body)) as { data: unknown[] };
    expect((body.data[1] as { path: string } | null)).toBeNull(); // front not supplied
    expect((body.data[2] as { path: string }).path).toContain("reference"); // back slot
    expect((body.data[3] as { path: string }).path).toBeTruthy();
    expect(body.data[4]).toBeNull(); // right not supplied
  });

  it("extracts the mesh URL from the complete payload (path form) and fetches /file= URL", async () => {
    const calls: CallLog[] = [];
    const result = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: happyFetch(calls) });
    expect(result.meshInfo.url).toBe(`${NEURAL_ENGINE_BASE}/file=/tmp/gradio/abc/white_mesh.glb`);
    const meshCall = calls.find((c) => c.url.includes("/file=/tmp/gradio/abc/white_mesh.glb"));
    expect(meshCall).toBeTruthy();
    expect(result.meshBytes).toEqual(MESH_BYTES);
    expect(result.faceCount).toBe(264118);
  });

  it("extracts an absolute mesh URL when the engine returns one", () => {
    const info = extractMeshInfo(
      [[{ url: "https://example-cdn.dev/mesh.glb", orig_name: "white_mesh.glb" }]],
      NEURAL_ENGINE_BASE,
    );
    expect(info?.url).toBe("https://example-cdn.dev/mesh.glb");
    const none = extractMeshInfo([["no mesh here"]], NEURAL_ENGINE_BASE);
    expect(none).toBeNull();
  });

  it("parses SSE incrementally: heartbeats skipped, events dispatched in order", () => {
    const events: { event: string; data: string }[] = [];
    let heartbeats = 0;
    const parser = createSseParser((m) => events.push(m), () => {
      heartbeats += 1;
    });
    parser.push(": heartbeat 1\n: heartbeat 2\nevent: gene");
    parser.push("rating\ndata: [\"x\"]\n\nevent: complete\ndata: [1,2]\n\n");
    parser.end();
    expect(heartbeats).toBe(2);
    expect(events).toEqual([
      { event: "generating", data: '["x"]' },
      { event: "complete", data: "[1,2]" },
    ]);
  });

  it("SSE event: error rejects with NeuralEngineError carrying the payload", async () => {
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/call/shape_generation")) return jsonResponse({ event_id: "e1" });
      if (href.includes("/call/shape_generation/e1")) {
        return sseResponse(["event: error\ndata: [null]\n\n"]);
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    const nerr = err as NeuralEngineError;
    expect(nerr.stage).toBe("stream");
    expect(nerr.message).toContain("error event");
    expect(nerr.payload).toEqual([null]);
  });

  it("stall guard: quiet stream aborts with a stall error (no terminal hang)", async () => {
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/call/shape_generation")) return jsonResponse({ event_id: "e2" });
      if (href.includes("/call/shape_generation/e2")) {
        // One heartbeat, then silence forever (never closes).
        return sseResponse([": keepalive\n\n"], { neverClose: true });
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch, stallMs: 80 }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    expect((err as NeuralEngineError).stage).toBe("stream");
    expect((err as NeuralEngineError).message).toContain("stalled");
  });

  it("external AbortSignal (user Cancel) rejects as a cancel", async () => {
    const controller = new AbortController();
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/call/shape_generation")) return jsonResponse({ event_id: "e3" });
      if (href.includes("/call/shape_generation/e3")) {
        return sseResponse(["event: generating\ndata: []\n\n"], { neverClose: true });
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const pending = generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch, stallMs: 10_000, signal: controller.signal });
    await new Promise((r) => setTimeout(r, 60));
    controller.abort();
    const err = await pending.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    expect((err as NeuralEngineError).message).toContain("canceled");
  });

  it("call failures surface the HTTP status through NeuralEngineError (stage call)", async () => {
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/call/shape_generation")) {
        return jsonResponse({ detail: "GPU quota exceeded" }, 429);
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    expect((err as NeuralEngineError).stage).toBe("call");
    expect((err as NeuralEngineError).message).toContain("429");
  });

  it("streams end-to-end through the event_id URL and report progress events", async () => {
    const progress: string[] = [];
    const calls: CallLog[] = [];
    const result = await generateNeuralMesh({
      ...BASE_INPUT,
      fetchImpl: happyFetch(calls),
      onProgress: (e) => {
        if (e.type === "stage") progress.push(`stage:${e.stage}`);
        if (e.type === "sse") progress.push(`sse:${e.event}`);
        if (e.type === "heartbeat") progress.push("heartbeat");
      },
    });
    expect(result.seed).toBe(1234);
    expect(progress).toEqual(
      expect.arrayContaining([
        "stage:upload",
        "stage:call",
        "stage:stream",
        "sse:generating",
        "heartbeat",
        "stage:mesh",
      ]),
    );
    // The SSE GET uses the event_id returned by the call response.
    expect(calls.some((c) => c.url.endsWith("/call/shape_generation/evt-123"))).toBe(true);
    expect(extractFaceCount(null)).toBeUndefined();
  });
});
