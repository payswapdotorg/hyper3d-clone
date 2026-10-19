/**
 * Neural engine client — browser-direct REST access to the free public
 * tencent/Hunyuan3D-2.1 HuggingFace Space (recon/engine-probe.md, verified
 * recipe). Runs CLIENT-SIDE (CORS-verified origin) so every user spends
 * their own anonymous ZeroGPU IP quota — never proxied through the server
 * (shared egress IP = shared drained pool + function timeouts).
 *
 * Flow (all against https://tencent-hunyuan3d-2-1.hf.space — gradio 4.44,
 * sse_v3, no api prefix. The legacy /call/<api_name> HTTP route on this
 * space ACCEPTS the job then kills it instantly with `event: error,
 * data: null` — verified live 2026-10-19 via raw REST while gradio_client
 * (queue protocol) succeeded from the same IP minutes apart — so the
 * client speaks the QUEUE protocol gradio_client itself uses):
 *   1. POST /upload (multipart `files`) → ["/tmp/gradio/<hash>/img.jpg"]
 *   2. POST /queue/join {"data":[image, mvF, mvB, mvL, mvR, steps,
 *      guidance_scale, seed, octree_resolution, rembg, num_chunks,
 *      randomize_seed], "fn_index": <resolved from /config>,
 *      "session_hash": <uuid>} → {"event_id": "..."}
 *   3. GET  /queue/data?session_hash=… — SSE stream; each `data:` line is a
 *      JSON queue message; `:` lines are heartbeats; success terminates
 *      with {"msg":"process_completed","output":{"data":[…]}} and
 *      failures carry {"msg":"error"|"unexpected_error","message":…}
 *      (real text — e.g. the ZeroGPU quota reason — flows to the user)
 *   4. Fetch the mesh GLB from the completed payload's `/file=` URL
 *
 * Robustness rules:
 *   - stall guard: no stream activity for `stallMs` (default 75s) → abort →
 *     NeuralEngineError (the caller falls back to the Fast engine honestly)
 *   - SSE `event: error` → NeuralEngineError carrying the raw payload
 *   - every stage is cancellable through an AbortSignal
 *
 * No eval/Function, no secrets, nothing paid. The module is isomorphic
 * (Node tests mock fetch; the browser passes the real one).
 */

export const NEURAL_ENGINE_BASE = "https://tencent-hunyuan3d-2-1.hf.space";

/** Stall guard: abort the neural path when the SSE stream goes quiet. */
export const NEURAL_STALL_MS = 75_000;

/** Engine parameter defaults from the verified probe recipe. */
export const NEURAL_DEFAULT_STEPS = 30;
export const NEURAL_DEFAULT_GUIDANCE_SCALE = 5.0;
export const NEURAL_DEFAULT_OCTREE_RESOLUTION = 256;

/**
 * num_chunks: 50000 for the live viewer mesh (usable quality, ~1-2MB);
 * 8000 for the stored/history copy (≤2MB guarantee). Both values verified
 * against the engine's decimation behavior.
 */
export const NEURAL_LIVE_NUM_CHUNKS = 50_000;
export const NEURAL_STORED_NUM_CHUNKS = 8_000;

/** Hard cap for a mesh persisted on a task row. */
export const NEURAL_MAX_STORED_BYTES = 2 * 1024 * 1024;

export type NeuralStage = "upload" | "call" | "stream" | "mesh";

export type ViewDirection = "front" | "back" | "left" | "right";

/** Error carrying the stage it died at + the raw SSE payload when present. */
export class NeuralEngineError extends Error {
  constructor(
    message: string,
    public readonly stage: NeuralStage,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "NeuralEngineError";
  }
}

export interface NeuralViewImage {
  direction: ViewDirection;
  blob: Blob;
}

export type NeuralProgressEvent =
  | { type: "stage"; stage: NeuralStage; message: string }
  | { type: "sse"; event: string; data?: unknown }
  | { type: "heartbeat" };

export interface NeuralGenerateInput {
  /** Main reference image (the texture/material source). */
  image: Blob;
  /** Optional extra views, mapped onto mv_image_front/back/left/right. */
  views?: NeuralViewImage[];
  /** 0..65535; shown on the task card for reproducibility. */
  seed: number;
  numChunks?: number;
  steps?: number;
  guidanceScale?: number;
  octreeResolution?: number;
  /** check_box_rembg — engine-side background removal. */
  removeBackground?: boolean;
  baseUrl?: string;
  /** Injectable for tests (all network mocked) — never hits the space. */
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  stallMs?: number;
  onProgress?: (event: NeuralProgressEvent) => void;
}

export interface NeuralMeshInfo {
  url: string;
  path?: string;
  origName?: string;
}

export interface NeuralResult {
  meshBytes: Uint8Array;
  meshInfo: NeuralMeshInfo;
  seed: number;
  /** faces reported by the engine's mesh_stats, when parseable. */
  faceCount?: number;
}

/* ------------------------------ payload shape ------------------------------ */

export interface FileData {
  path: string;
  meta: { _type: "gradio.FileData" };
  orig_name?: string;
  url?: string | null;
}

export function fileData(path: string, origName?: string): FileData {
  const data: FileData = { path, meta: { _type: "gradio.FileData" } };
  if (origName) data.orig_name = origName;
  return data;
}

/** An uploaded engine file: the tmp path + the name it was uploaded under. */
interface EngineFile {
  path: string;
  origName?: string;
}

/**
 * Exact `data` array for the queue/join call — the verified parameter order
 * (image, mv_image_front, mv_image_back, mv_image_left, mv_image_right,
 * steps, guidance_scale, seed, octree_resolution, check_box_rembg,
 * num_chunks, randomize_seed). orig_name rides along on every file: the
 * engine's components use the ORIGINAL name's suffix to pick the format
 * they save/cast to (gradio_client sends it too — parity with the
 * proven-good reference client).
 */
export function buildShapeGenerationBody(input: {
  image: EngineFile;
  views?: Partial<Record<ViewDirection, EngineFile>>;
  steps?: number;
  guidanceScale?: number;
  seed: number;
  octreeResolution?: number;
  removeBackground?: boolean;
  numChunks?: number;
}): { data: unknown[] } {
  const views = input.views ?? {};
  return {
    data: [
      // Slot 0 is a hidden gradio `state` component (verified live from
      // /config: 13 inputs — state, Image, F, B, L, R, steps, guidance,
      // seed, octree, rembg, chunks, randomize). The old 12-item /call
      // payload died on exactly this: "didn't receive enough input values
      // (needed: 13, got 12)".
      null,
      fileData(input.image.path, input.image.origName),
      views.front ? fileData(views.front.path, views.front.origName) : null,
      views.back ? fileData(views.back.path, views.back.origName) : null,
      views.left ? fileData(views.left.path, views.left.origName) : null,
      views.right ? fileData(views.right.path, views.right.origName) : null,
      input.steps ?? NEURAL_DEFAULT_STEPS,
      input.guidanceScale ?? NEURAL_DEFAULT_GUIDANCE_SCALE,
      input.seed,
      input.octreeResolution ?? NEURAL_DEFAULT_OCTREE_RESOLUTION,
      input.removeBackground ?? true,
      input.numChunks ?? NEURAL_LIVE_NUM_CHUNKS,
      false, // randomize_seed — determinism is user-controlled via the seed field
    ],
  };
}

/* ------------------------------ SSE parsing ------------------------------ */

export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Incremental SSE line parser (pure): feed decoded text chunks, receive
 * complete messages. Comment/heartbeat lines (starting with `:`) are skipped
 * as messages but reported through onHeartbeat so callers can track
 * liveness.
 */
export function createSseParser(onMessage: (message: SseMessage) => void, onHeartbeat?: () => void) {
  let buffer = "";
  let event = "";
  let dataLines: string[] = [];

  const dispatch = () => {
    if (event !== "" || dataLines.length > 0) {
      onMessage({ event: event || "message", data: dataLines.join("\n") });
    }
    event = "";
    dataLines = [];
  };

  const handleLine = (line: string) => {
    if (line === "") {
      dispatch();
      return;
    }
    if (line.startsWith(":")) {
      onHeartbeat?.();
      return;
    }
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      return;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
      return;
    }
    // Unknown field — ignored per SSE spec.
  };

  return {
    push(chunk: string) {
      buffer += chunk;
      let index = buffer.indexOf("\n");
      while (index >= 0) {
        const line = buffer.slice(0, index).replace(/\r$/, "");
        buffer = buffer.slice(index + 1);
        handleLine(line);
        index = buffer.indexOf("\n");
      }
    },
    /** Flush any trailing partial line at stream end. */
    end() {
      if (buffer.length > 0) {
        handleLine(buffer.replace(/\r$/, ""));
        buffer = "";
      }
      dispatch();
    },
  };
}

/* ------------------------------ mesh extraction ------------------------------ */

interface MeshLike {
  path?: unknown;
  url?: unknown;
  orig_name?: unknown;
}

function isMeshLike(value: unknown): value is MeshLike {
  if (typeof value !== "object" || value === null) return false;
  const v = value as MeshLike;
  const name = typeof v.orig_name === "string" ? v.orig_name.toLowerCase() : "";
  const path = typeof v.path === "string" ? v.path.toLowerCase() : "";
  const url = typeof v.url === "string" ? v.url.toLowerCase() : "";
  return name.endsWith(".glb") || path.endsWith(".glb") || url.endsWith(".glb");
}

/**
 * Extract the mesh file info from the SSE `complete` payload. The payload is
 * the endpoint's return array — typically [file, html, mesh_stats, seed] —
 * but the exact nesting varies with gradio versions, so this walks the value
 * and returns the first .glb-carrying object.
 */
export function extractMeshInfo(completeData: unknown, baseUrl: string): NeuralMeshInfo | null {
  const found = deepFind(completeData, isMeshLike, 0) as MeshLike | null;
  if (!found) return null;
  const path = typeof found.path === "string" ? found.path : undefined;
  const url = typeof found.url === "string" ? found.url : undefined;
  const origName = typeof found.orig_name === "string" ? found.orig_name : undefined;
  if (url && /^https?:\/\//i.test(url)) return { url, path, origName };
  if (path) return { url: meshFileUrl(baseUrl, path), path, origName };
  return null;
}

function meshFileUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/file=${path}`;
}

function deepFind(value: unknown, predicate: (v: unknown) => boolean, depth: number): unknown | null {
  if (depth > 8) return null;
  if (predicate(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = deepFind(item, predicate, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }
  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const found = deepFind(item, predicate, depth + 1);
      if (found !== null) return found;
    }
  }
  return null;
}

/** Parse the engine's mesh_stats string for the face count, when possible. */
export function extractFaceCount(completeData: unknown): number | undefined {
  const stats = deepFind(
    completeData,
    (v) => typeof v === "string" && v.includes("number_of_faces"),
    0,
  );
  if (typeof stats !== "string") return undefined;
  const match = /"number_of_faces"\s*:\s*(\d+)/.exec(stats);
  return match ? Number(match[1]) : undefined;
}

/* ------------------------------ stream reader ------------------------------ */

interface StreamOutcome {
  completed?: unknown;
  errorPayload?: unknown;
}

async function consumeSseStream(
  response: Response,
  options: {
    stallMs: number;
    signal: AbortSignal;
    stage: NeuralStage;
    onProgress?: (event: NeuralProgressEvent) => void;
  },
): Promise<StreamOutcome> {
  const { stallMs, signal, stage } = options;
  if (!response.body) {
    // Non-streaming response — parse whole body as one SSE text block.
    const text = await response.text();
    return parseSseText(text, options.onProgress);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const outcome: StreamOutcome = {};
  let stalled = false;

  let lastActivity = Date.now();
  const cancelStream = () => {
    void reader.cancel().catch(() => undefined);
  };
  // External cancel (user hits Cancel): stop reading; the read loop exits
  // and the signal.aborted check below throws the cancel error.
  const onExternalAbort = () => cancelStream();
  signal.addEventListener("abort", onExternalAbort, { once: true });

  const watchdog = setInterval(
    () => {
      if (Date.now() - lastActivity > stallMs) {
        stalled = true;
        cancelStream();
      }
    },
    Math.max(50, Math.floor(stallMs / 4)),
  );

  const parser = createSseParser(
    (message) => {
      // Queue protocol: every data line is a JSON queue message
      // ({"msg": "...", ...}). `:` comment lines are heartbeats handled
      // by the second callback below.
      const qmsg = safeJson(message.data);
      const kind =
        qmsg !== null && typeof qmsg === "object" && "msg" in qmsg
          ? String((qmsg as { msg: unknown }).msg)
          : null;
      if (kind === "process_completed") {
        const output = (qmsg as { output?: { data?: unknown; error?: unknown } }).output;
        if (output !== null && typeof output === "object" && typeof output.error === "string" && output.error.length > 0) {
          // Gradio surfaces handler failures INSIDE a completed event —
          // e.g. the ZeroGPU quota text (verified live: output.error =
          // "'You have exceeded your ZeroGPU quota (90s requested vs. 77s
          // left)…'"). Treat as an error so the real reason reaches the user.
          outcome.errorPayload = { msg: "error", message: output.error };
        } else if (output !== null && typeof output === "object" && "data" in output) {
          outcome.completed = output.data;
        } else {
          outcome.completed = qmsg;
        }
      } else if (
        kind === "error" ||
        kind === "unexpected_error" ||
        kind === "queue_full" ||
        kind === "process_interrupted"
      ) {
        outcome.errorPayload = qmsg;
      } else {
        // send_data / process_starts / progress / process_generating / log —
        // activity that keeps the stall guard fed; surfaced for the UI.
        options.onProgress?.({ type: "sse", event: kind ?? "message", data: qmsg });
      }
    },
    () => {
      lastActivity = Date.now();
      options.onProgress?.({ type: "heartbeat" });
    },
  );

  let streamError: unknown = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      lastActivity = Date.now();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
    parser.push(decoder.decode());
    parser.end();
  } catch (err) {
    streamError = err;
  } finally {
    clearInterval(watchdog);
    signal.removeEventListener("abort", onExternalAbort);
    try {
      await reader.cancel();
    } catch {
      /* already closed */
    }
  }

  if (stalled) {
    throw new NeuralEngineError(
      `neural engine stalled: no stream activity for ${stallMs}ms`,
      stage,
    );
  }
  if (signal.aborted) {
    throw new NeuralEngineError("neural generation canceled", stage);
  }
  if (streamError) {
    throw new NeuralEngineError(
      `neural stream failed: ${streamError instanceof Error ? streamError.message : String(streamError)}`,
      stage,
    );
  }
  if (outcome.errorPayload !== undefined) {
    // Queue errors carry the REAL reason in .message (e.g. the ZeroGPU
    // quota text) — surface it so the honest fallback tells the user why.
    const q = outcome.errorPayload as { message?: unknown };
    const detail =
      typeof q?.message === "string" && q.message.length > 0
        ? `: ${q.message.slice(0, 220)}`
        : "";
    throw new NeuralEngineError(`neural engine reported an error event${detail}`, stage, outcome.errorPayload);
  }
  if (outcome.completed === undefined) {
    throw new NeuralEngineError("neural stream ended without a terminal event", stage);
  }
  return outcome;
}

function parseSseText(text: string, onProgress?: (event: NeuralProgressEvent) => void): StreamOutcome {
  const outcome: StreamOutcome = {};
  const parser = createSseParser(
    (message) => {
      if (message.event === "complete") outcome.completed = safeJson(message.data);
      else if (message.event === "error") outcome.errorPayload = safeJson(message.data);
      else onProgress?.({ type: "sse", event: message.event, data: safeJson(message.data) });
    },
    () => onProgress?.({ type: "heartbeat" }),
  );
  parser.push(text);
  parser.end();
  return outcome;
}

function safeJson(raw: string): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

/* ------------------------------ upload ------------------------------ */

/**
 * The upload filename's extension MUST match the bytes' real type: the
 * engine's server dispatches on the filename extension, and mismatched
 * bytes die instantly in its image loader (observed live: JPEG bytes named
 * reference.png → upload 200 → SSE `event: error` in 0.66s — the failure
 * behind EVERY browser-side neural fallback since the engine shipped;
 * the free instant error also never reaches the GPU, so quota probes kept
 * passing while the UI kept failing).
 */
function uploadName(blob: Blob): string {
  if (blob.type === "image/jpeg" || blob.type === "image/jpg") return "reference.jpg";
  if (blob.type === "image/webp") return "reference.webp";
  return "reference.png";
}

async function uploadFile(
  input: { baseUrl: string; fetchImpl: typeof fetch; signal: AbortSignal },
  blob: Blob,
  stage: NeuralStage,
): Promise<{ path: string; name: string }> {
  const form = new FormData();
  const name = uploadName(blob);
  form.append("files", blob, name);
  const response = await input.fetchImpl(`${input.baseUrl}/upload`, {
    method: "POST",
    body: form,
    signal: input.signal,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new NeuralEngineError(
      `upload failed (${response.status}) ${detail.slice(0, 200)}`,
      stage,
    );
  }
  const paths = (await response.json()) as unknown;
  if (!Array.isArray(paths) || typeof paths[0] !== "string") {
    throw new NeuralEngineError("upload returned an unexpected payload", stage, paths);
  }
  return { path: paths[0], name };
}

/* ------------------------------ main entry ------------------------------ */

/**
 * Resolve the fn_index of /shape_generation from the space's /config
 * (dependencies[].api_name) — the queue/join protocol addresses functions by
 * INDEX, not by name. Cached per page load; falls back to the live-verified
 * index (2 on tencent-hunyuan3d-2.1.hf.space, gradio 4.44) when /config is
 * unreachable or the shape has changed beyond recognition.
 */
const KNOWN_SHAPE_FN_INDEX = 2;
let cachedShapeFnIndex: number | null = null;

/** Test hook: forget the cached fn_index so a fresh /config is consulted. */
export function resetEngineFnIndexCache(): void {
  cachedShapeFnIndex = null;
}

async function resolveShapeFnIndex(
  input: { baseUrl: string; fetchImpl: typeof fetch; signal: AbortSignal },
): Promise<number> {
  if (cachedShapeFnIndex !== null) return cachedShapeFnIndex;
  try {
    const res = await input.fetchImpl(`${input.baseUrl}/config`, { signal: input.signal });
    if (res.ok) {
      const cfg = (await res.json()) as {
        dependencies?: Array<{ id?: unknown; api_name?: unknown }>;
      };
      const deps = Array.isArray(cfg?.dependencies) ? cfg.dependencies : [];
      for (let i = 0; i < deps.length; i += 1) {
        const api = deps[i]?.api_name;
        if (api === "shape_generation" || api === "/shape_generation") {
          const id = deps[i]?.id;
          cachedShapeFnIndex = typeof id === "number" ? id : i;
          return cachedShapeFnIndex;
        }
      }
    }
  } catch {
    // /config unreachable or unparseable — the known index is the fallback.
  }
  return KNOWN_SHAPE_FN_INDEX;
}

function randomSessionHash(): string {
  const c = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `sess-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Generate a mesh with the free neural engine. Rejects with
 * NeuralEngineError on any failure — the caller decides the fallback. Never
 * resolves with a fabricated mesh.
 */
export async function generateNeuralMesh(input: NeuralGenerateInput): Promise<NeuralResult> {
  const baseUrl = (input.baseUrl ?? NEURAL_ENGINE_BASE).replace(/\/$/, "");
  // Bind to globalThis: a bare `fetch` reference called as `fetchImpl(...)`
  // runs with this=undefined in strict-mode ES modules, which Chrome rejects
  // with "Failed to execute 'fetch' on 'Window': Illegal invocation" — the
  // exact failure that silently forced every browser neural run to fallback.
  const fetchImpl = input.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const stallMs = input.stallMs ?? NEURAL_STALL_MS;
  const onProgress = input.onProgress;
  const signal = input.signal ?? new AbortController().signal;

  onProgress?.({ type: "stage", stage: "upload", message: "Uploading reference to the neural engine…" });
  const image = await uploadFile({ baseUrl, fetchImpl, signal }, input.image, "upload");

  const viewFiles: Partial<Record<ViewDirection, EngineFile>> = {};
  for (const view of input.views ?? []) {
    onProgress?.({
      type: "stage",
      stage: "upload",
      message: `Uploading ${view.direction} view…`,
    });
    viewFiles[view.direction] = await uploadFile({ baseUrl, fetchImpl, signal }, view.blob, "upload");
  }

  onProgress?.({ type: "stage", stage: "call", message: "Queuing shape generation…" });
  const fnIndex = await resolveShapeFnIndex({ baseUrl, fetchImpl, signal });
  const sessionHash = randomSessionHash();
  const body = buildShapeGenerationBody({
    image: { path: image.path, origName: image.name },
    views: viewFiles,
    steps: input.steps,
    guidanceScale: input.guidanceScale,
    seed: input.seed,
    octreeResolution: input.octreeResolution,
    removeBackground: input.removeBackground,
    numChunks: input.numChunks,
  });
  const joinResponse = await fetchImpl(`${baseUrl}/queue/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      data: body.data,
      fn_index: fnIndex,
      session_hash: sessionHash,
    }),
    signal,
  });
  if (!joinResponse.ok) {
    const detail = await joinResponse.text().catch(() => "");
    throw new NeuralEngineError(
      `shape_generation join failed (${joinResponse.status}) ${detail.slice(0, 200)}`,
      "call",
    );
  }
  const joinBody = (await joinResponse.json()) as { event_id?: unknown };
  if (typeof joinBody.event_id !== "string" || joinBody.event_id.length === 0) {
    throw new NeuralEngineError("queue/join returned no event_id", "call", joinBody);
  }

  onProgress?.({ type: "stage", stage: "stream", message: "Generating geometry (Hunyuan3D-2.1)…" });
  const streamResponse = await fetchImpl(
    `${baseUrl}/queue/data?session_hash=${encodeURIComponent(sessionHash)}`,
    { signal },
  );
  if (!streamResponse.ok) {
    throw new NeuralEngineError(
      `queue stream request failed (${streamResponse.status})`,
      "stream",
    );
  }
  const outcome = await consumeSseStream(streamResponse, { stallMs, signal, stage: "stream", onProgress });

  const meshInfo = extractMeshInfo(outcome.completed, baseUrl);
  if (!meshInfo) {
    throw new NeuralEngineError("complete payload carried no mesh file", "stream", outcome.completed);
  }

  onProgress?.({ type: "stage", stage: "mesh", message: "Downloading generated mesh…" });
  const meshResponse = await fetchImpl(meshInfo.url, { signal });
  if (!meshResponse.ok) {
    throw new NeuralEngineError(`mesh download failed (${meshResponse.status})`, "mesh");
  }
  const meshBytes = new Uint8Array(await meshResponse.arrayBuffer());
  if (meshBytes.byteLength === 0) {
    throw new NeuralEngineError("mesh download returned empty bytes", "mesh");
  }

  return {
    meshBytes,
    meshInfo,
    seed: input.seed,
    faceCount: extractFaceCount(outcome.completed),
  };
}

/** Attribution copy surfaced in the workspace footer (honesty requirement). */
export const NEURAL_ATTRIBUTION =
  "Quality engine: tencent/Hunyuan3D-2.1 (free public demo on HuggingFace Space) — availability is not guaranteed; the Fast engine is always available as fallback.";
