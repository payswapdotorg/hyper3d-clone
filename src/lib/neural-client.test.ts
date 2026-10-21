import { describe, it, expect } from "vitest";
import {
  NeuralEngineError,
  NEURAL_ENGINE_BASE,
  NEURAL_LIVE_NUM_CHUNKS,
  buildShapeGenerationBody,
  createSseParser,
  extractFaceCount,
  extractMeshInfo,
  generateNeuralMesh,
  resetEngineFnIndexCache,
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

/**
 * Queue-protocol stream (gradio sse_v1+): every data line is a JSON queue
 * message; heartbeats are `:` comment lines; the terminal success message
 * is {"msg":"process_completed","output":{"data":[…]}}.
 */
const HAPPY_QUEUE = [
  ": heartbeat 1728000000.0\n\n",
  'data: {"msg":"send_data"}\n\n',
  'data: {"msg":"process_starts"}\n\n',
  'data: {"msg":"progress","progress_data":[{"index":0,"desc":"shape","unit":"it","length":20}],"rank":0,"queue_size":1}\n\n',
  'data: {"msg":"process_generating"}\n\n',
  'data: {"msg":"process_completed","output":{"data":[[{"path":"/tmp/gradio/abc/white_mesh.glb","orig_name":"white_mesh.glb","meta":{"_type":"gradio.FileData"}}], "<iframe…/>", "{\\"number_of_faces\\": 264118}", 1234]}}\n\n',
].join("");

interface CallLog {
  url: string;
  init: RequestInit | undefined;
}

/** Minimal space /config with shape_generation at fn_index 2. */
const SPACE_CONFIG = {
  protocol: "sse_v3",
  version: "4.44.0",
  dependencies: [
    { id: 0, api_name: "load_image" },
    { id: 1, api_name: "generation_all" },
    { id: 2, api_name: "shape_generation" },
  ],
};

/** Scripted fetch used by every happy-path test — NO network is ever touched. */
function happyFetch(calls: CallLog[]): typeof fetch {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    const href = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
    calls.push({ url: href, init });
    if (href.endsWith("/upload")) {
      return jsonResponse(["/tmp/gradio/abc/reference.png"]);
    }
    if (href.endsWith("/config")) {
      return jsonResponse(SPACE_CONFIG);
    }
    if (href.endsWith("/queue/join")) {
      return jsonResponse({ event_id: "evt-123" });
    }
    if (href.includes("/queue/data")) {
      return sseResponse([HAPPY_QUEUE]);
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
  it("uploads, joins the queue and uses the completed payload's mesh path", async () => {
    resetEngineFnIndexCache();
    const calls: CallLog[] = [];
    const result = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: happyFetch(calls) });
    const upload = calls.find((c) => c.url.endsWith("/upload"));
    expect(upload).toBeTruthy();
    expect(upload?.init?.method).toBe("POST");
    expect(upload?.init?.body).toBeInstanceOf(FormData);
    const join = calls.find((c) => c.url.endsWith("/queue/join"));
    expect(join).toBeTruthy();
    const joinBody = JSON.parse(String(join?.init?.body)) as {
      data: unknown[];
      fn_index: number;
      session_hash: string;
    };
    expect(joinBody.fn_index).toBe(2);
    expect(typeof joinBody.session_hash).toBe("string");
    expect(joinBody.session_hash.length).toBeGreaterThan(8);
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

  it("sends the exact queue payload (leading state slot + param order + orig_name)", () => {
    const body = buildShapeGenerationBody({
      image: { path: "/tmp/x/main.png", origName: "main.png" },
      views: {
        front: { path: "/tmp/x/f.png", origName: "f.png" },
        right: { path: "/tmp/x/r.png", origName: "r.png" },
      },
      seed: 7,
      numChunks: 8000,
    });
    const data = body.data as unknown[];
    expect(data).toHaveLength(13); // /config-verified: 13 inputs incl. hidden state
    expect(data[0]).toBeNull(); // hidden gradio state component
    expect((data[1] as { path: string; orig_name: string }).path).toBe("/tmp/x/main.png");
    expect((data[1] as { orig_name: string }).orig_name).toBe("main.png");
    expect((data[2] as { path: string }).path).toBe("/tmp/x/f.png");
    expect(data[3]).toBeNull(); // back — not supplied
    expect(data[4]).toBeNull(); // left — not supplied
    expect((data[5] as { path: string }).path).toBe("/tmp/x/r.png");
    expect(data[6]).toBe(30); // steps default
    expect(data[7]).toBe(5.0); // guidance default
    expect(data[8]).toBe(7); // seed
    expect(data[9]).toBe(256); // octree default
    expect(data[10]).toBe(true); // rembg default
    expect(data[11]).toBe(8000);
    expect(data[12]).toBe(false); // randomize_seed
  });

  it("uploads each extra view and fills the matching engine slot", async () => {
    resetEngineFnIndexCache();
    const calls: CallLog[] = [];
    const fetch = happyFetch(calls);
    await generateNeuralMesh({
      ...BASE_INPUT,
      views: [
        { direction: "back", blob: new Blob(["b"]) },
        { direction: "left", blob: new Blob(["l"]) },
      ],
      fetchImpl: fetch,
    });

    const join = calls.find((c) => c.url.endsWith("/queue/join"));
    const joinBody = JSON.parse(String(join?.init?.body)) as { data: unknown[] };
    expect((joinBody.data[2] as { path: string } | null)).toBeNull(); // front not supplied
    expect((joinBody.data[3] as { path: string }).path).toContain("reference"); // back slot
    expect((joinBody.data[4] as { path: string }).path).toBeTruthy();
    expect(joinBody.data[5]).toBeNull(); // right not supplied
  });

  it("falls back to the known fn_index when /config is unreachable", async () => {
    resetEngineFnIndexCache();
    const calls: CallLog[] = [];
    const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      calls.push({ url: href, init });
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse({ error: "boom" }, 500);
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "evt-9" });
      if (href.includes("/queue/data")) return sseResponse([HAPPY_QUEUE]);
      if (href.includes("/file=")) return blobResponse(MESH_BYTES);
      throw new Error(`unexpected fetch: ${href}`);
    }) as unknown as typeof fetch;
    const result = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch });
    const join = calls.find((c) => c.url.endsWith("/queue/join"));
    const joinBody = JSON.parse(String(join?.init?.body)) as { fn_index: number };
    expect(joinBody.fn_index).toBe(2); // live-verified constant
    expect(result.meshBytes).toEqual(MESH_BYTES);
  });

  it("resolves fn_index from /config dependencies (index-addressed queue)", async () => {
    resetEngineFnIndexCache();
    const calls: CallLog[] = [];
    const fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      calls.push({ url: href, init });
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) {
        return jsonResponse({
          dependencies: [
            { id: 11, api_name: "other" },
            { id: 77, api_name: "shape_generation" },
          ],
        });
      }
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "evt-7" });
      if (href.includes("/queue/data")) return sseResponse([HAPPY_QUEUE]);
      if (href.includes("/file=")) return blobResponse(MESH_BYTES);
      throw new Error(`unexpected fetch: ${href}`);
    }) as unknown as typeof fetch;
    await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch });
    const join = calls.find((c) => c.url.endsWith("/queue/join"));
    const joinBody = JSON.parse(String(join?.init?.body)) as { fn_index: number };
    expect(joinBody.fn_index).toBe(77);
  });

  it("extracts the mesh URL from the completed payload (path form) and fetches /file= URL", async () => {
    resetEngineFnIndexCache();
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

  it("queue error messages surface the REAL reason (e.g. the ZeroGPU quota text)", async () => {
    resetEngineFnIndexCache();
    const quotaText =
      "You have exceeded your ZeroGPU quota (90s requested vs. 47s left). Try again in 12:47:26";
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse(SPACE_CONFIG);
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "e1" });
      if (href.includes("/queue/data")) {
        return sseResponse([`data: ${JSON.stringify({ msg: "error", message: quotaText })}\n\n`]);
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    const nerr = err as NeuralEngineError;
    expect(nerr.stage).toBe("stream");
    expect(nerr.message).toContain("error event");
    expect(nerr.message).toContain("ZeroGPU quota");
    expect(nerr.message).toContain("Try again in 12:47:26");
    expect((nerr.payload as { msg: string }).msg).toBe("error");
  });

  it("process_completed with output.error (gradio handler failure) surfaces the reason", async () => {
    resetEngineFnIndexCache();
    // Verified live: the space reports the ZeroGPU quota rejection as
    // {"msg":"process_completed","output":{"error":"'You have exceeded…'"}}
    // — a failure hiding inside a completed event.
    const quotaText = "'You have exceeded your ZeroGPU quota (90s requested vs. 77s left). Try again in 17:07:02'";
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse(SPACE_CONFIG);
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "e4" });
      if (href.includes("/queue/data")) {
        return sseResponse([
          `data: ${JSON.stringify({ msg: "process_starts" })}\n\n`,
          `data: ${JSON.stringify({ msg: "process_completed", output: { error: quotaText } })}\n\n`,
        ]);
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    const nerr = err as NeuralEngineError;
    expect(nerr.message).toContain("ZeroGPU quota");
    expect(nerr.message).toContain("17:07:02");
  });

  it("stall guard: quiet stream aborts with a stall error (no terminal hang)", async () => {
    resetEngineFnIndexCache();
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse(SPACE_CONFIG);
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "e2" });
      if (href.includes("/queue/data")) {
        // One heartbeat comment, then silence forever (never closes).
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
    resetEngineFnIndexCache();
    const controller = new AbortController();
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse(SPACE_CONFIG);
      if (href.endsWith("/queue/join")) return jsonResponse({ event_id: "e3" });
      if (href.includes("/queue/data")) {
        return sseResponse(['data: {"msg":"process_generating"}\n\n'], { neverClose: true });
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const pending = generateNeuralMesh({
      ...BASE_INPUT,
      fetchImpl: fetch,
      stallMs: 10_000,
      signal: controller.signal,
    });
    await new Promise((r) => setTimeout(r, 60));
    controller.abort();
    const err = await pending.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    expect((err as NeuralEngineError).message).toContain("canceled");
  });

  it("join failures surface the HTTP status through NeuralEngineError (stage call)", async () => {
    resetEngineFnIndexCache();
    const fetch = (async (url: string | URL | Request) => {
      const href = String(url);
      if (href.endsWith("/upload")) return jsonResponse(["/tmp/g/i.png"]);
      if (href.endsWith("/config")) return jsonResponse(SPACE_CONFIG);
      if (href.endsWith("/queue/join")) {
        return jsonResponse({ detail: "GPU quota exceeded" }, 429);
      }
      throw new Error("unexpected");
    }) as unknown as typeof fetch;
    const err = await generateNeuralMesh({ ...BASE_INPUT, fetchImpl: fetch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(NeuralEngineError);
    expect((err as NeuralEngineError).stage).toBe("call");
    expect((err as NeuralEngineError).message).toContain("429");
  });

  it("streams end-to-end through the queue and reports progress events", async () => {
    resetEngineFnIndexCache();
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
        "sse:process_starts",
        "sse:progress",
        "sse:process_generating",
        "heartbeat",
        "stage:mesh",
      ]),
    );
    // The stream GET carries the session_hash the join call generated.
    expect(calls.some((c) => c.url.includes("/queue/data?session_hash="))).toBe(true);
    expect(extractFaceCount(null)).toBeUndefined();
  });

  it("NEURAL_LIVE_NUM_CHUNKS stays within the engine's decimation contract", () => {
    expect(NEURAL_LIVE_NUM_CHUNKS).toBe(50_000);
  });
});
