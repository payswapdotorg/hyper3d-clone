/**
 * Server-side AI client access. The SDK/HTTP clients are ONLY ever imported
 * here (server code) — never from a client component.
 *
 * Backend selection (first available wins):
 *  1. ZAI (z-ai-web-dev-sdk) — the platform backend. Available where a
 *     .z-ai-config exists (project/home//etc), e.g. the build sandbox;
 *     absent on serverless deployments (Vercel).
 *  2. Bailian (Alibaba Model Studio) — OpenAI-compatible live backend for
 *     off-platform deployments, activated by BAILIAN_API_KEY (defaults:
 *     intl endpoint, qwen-plus text / qwen3-vl-plus vision — the pairing
 *     validated live on 2026-10-18: 5.5s apple caption with lathe profile +
 *     sampled palette; see DECISIONS.md).
 *  3. OpenRouter — same OpenAI-compatible shape, activated by
 *     OPENROUTER_API_KEY (models via OPENROUTER_TEXT_MODEL /
 *     OPENROUTER_VISION_MODEL). Kept as the tertiary chain link — a funded
 *     OpenRouter key takes over automatically when Bailian is absent.
 *  4. Neither → clients throw; callers degrade to their deterministic
 *     fallbacks (generation never hard-fails).
 *
 * The client objects are created lazily and cached; tests replace them via
 * vi.mock of this module, and nothing else in the app touches the SDK or
 * the network directly.
 */
import ZAI from "z-ai-web-dev-sdk";

export interface ChatClient {
  create(body: { messages: { role: string; content: string }[]; [key: string]: unknown }): Promise<unknown>;
}

export interface VisionClient {
  createVision(body: {
    model: string;
    messages: unknown[];
    [key: string]: unknown;
  }): Promise<unknown>;
}

type Backend = { chat: ChatClient; vision: VisionClient; kind: "zai" | "bailian" | "openrouter" };

let backendPromise: Promise<Backend> | null = null;

/* --------------------------- OpenRouter adapter --------------------------- */

export interface OpenRouterOptions {
  apiKey: string;
  baseUrl?: string;
  textModel?: string;
  visionModel?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULT_TEXT_MODEL = "meta-llama/llama-3.3-70b-instruct";
const DEFAULT_VISION_MODEL = "deepseek/deepseek-v4-flash-vision-exp";

export const BAILIAN_DEFAULT_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
export const BAILIAN_DEFAULT_TEXT_MODEL = "qwen-plus";
export const BAILIAN_DEFAULT_VISION_MODEL = "qwen3-vl-plus";

/**
 * Pure adapter (unit-tested): maps the shared ChatClient/VisionClient
 * interfaces onto OpenRouter's OpenAI-compatible chat-completions endpoint.
 * Unknown request fields (e.g. the platform SDK's `thinking` switch) are
 * dropped; the model slug is injected/overridden by the configured models.
 */
export function createOpenRouterClients(options: OpenRouterOptions): { chat: ChatClient; vision: VisionClient } {
  const apiKey = options.apiKey;
  const baseUrl = (options.baseUrl ?? "https://openrouter.ai/api/v1").replace(/\/$/, "");
  const textModel = options.textModel ?? DEFAULT_TEXT_MODEL;
  const visionModel = options.visionModel ?? DEFAULT_VISION_MODEL;
  const doFetch = options.fetchImpl ?? fetch;

  const post = async (
    model: string,
    body: { messages: unknown[]; [key: string]: unknown },
    defaultCap = 1024,
  ): Promise<unknown> => {
    const requestFor = (maxTokens: number): { url: string; init: RequestInit } => {
      const sanitized: Record<string, unknown> = {
        model,
        messages: body.messages,
        // Always cap completions: OpenRouter pre-authorizes max_tokens
        // against the key's credit budget — an unset max_tokens (the model's
        // full context, e.g. 32768) is rejected with 402 on credit-limited
        // keys even though the actual completion is only a few hundred
        // tokens.
        max_tokens: maxTokens,
      };
      if (typeof body.temperature === "number") sanitized.temperature = body.temperature;
      return {
        url: `${baseUrl}/chat/completions`,
        init: {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(sanitized),
          // Hard request timeout: a hung AI call must reject (and surface)
          // instead of wedging the pipeline until the serverless invocation
          // is evicted — the silent-freeze failure mode seen 2026-10-18.
          signal: AbortSignal.timeout(45_000),
        },
      };
    };
    const cap =
      typeof body.max_tokens === "number" && body.max_tokens > 0 ? body.max_tokens : defaultCap;

    let response = await doFetch(requestFor(cap).url, requestFor(cap).init);

    // Credit-budget adaptation: on 402 "can only afford N tokens", retry
    // once within the key's exact remaining budget — SceneSpec/caption
    // completions are a few hundred tokens, so a smaller cap usually fits.
    if (response.status === 402) {
      const detail = await response.text().catch(() => "");
      const afford = /can only afford (\d+)/.exec(detail);
      const n = afford ? parseInt(afford[1], 10) : 0;
      if (n >= 200 && n < cap) {
        console.error(`[ai-clients] openrouter ${model} credit-capped (requested ${cap}, budget ${n}) — retrying within budget`);
        const retry = requestFor(n);
        response = await doFetch(retry.url, retry.init);
      }
    }

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 300);
      console.error(`[ai-clients] openrouter ${model} responded ${response.status}: ${detail}`);
      // Carry a bounded slice of the provider's error body in the thrown
      // message: healthz ?probe=vision is the only surface where production
      // failures become diagnosable (runtime logs are not readable on the
      // hobby plan), and a bare status code answered nothing.
      throw new Error(`openrouter ${model} responded ${response.status}: ${detail.slice(0, 200)}`);
    }
    return (await response.json()) as unknown;
  };

  return {
    chat: {
      create: (body) => post(textModel, body),
    },
    vision: {
      // The caller passes a platform model slug ("glm-4.5v") — the adapter
      // deliberately overrides it with the configured OpenRouter vision
      // model. Caption completions are small (~300 tokens); a tighter
      // default cap reduces 402 credit rejections on budget-limited keys.
      createVision: (body) => post(visionModel, body, 512),
    },
  };
}

/**
 * Bailian adapter — reuses the OpenAI-compatible transport with Bailian's
 * intl compatible-mode endpoint and the qwen model pairing. The 402
 * credit-cap retry inside the transport is a no-op on Bailian (different
 * error semantics), so the reuse is safe.
 */
export function createBailianClients(options: Omit<OpenRouterOptions, "baseUrl" | "textModel" | "visionModel"> & Partial<Pick<OpenRouterOptions, "baseUrl" | "textModel" | "visionModel">>): {
  chat: ChatClient;
  vision: VisionClient;
} {
  return createOpenRouterClients({
    ...options,
    baseUrl: options.baseUrl ?? BAILIAN_DEFAULT_BASE_URL,
    textModel: options.textModel ?? BAILIAN_DEFAULT_TEXT_MODEL,
    visionModel: options.visionModel ?? BAILIAN_DEFAULT_VISION_MODEL,
  });
}

/* ------------------------------ backends ------------------------------ */

async function zaiBackend(): Promise<Backend> {
  const zai = await ZAI.create();
  return {
    kind: "zai",
    chat: {
      create: (body) => zai.chat.completions.create(body as never),
    },
    vision: {
      createVision: (body) => zai.chat.completions.createVision(body as never),
    },
  };
}

function bailianBackend(): Backend {
  const apiKey = process.env.BAILIAN_API_KEY ?? process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("no bailian backend: BAILIAN_API_KEY not set");
  }
  const clients = createBailianClients({
    apiKey,
    baseUrl: process.env.BAILIAN_BASE_URL,
    textModel: process.env.BAILIAN_TEXT_MODEL,
    visionModel: process.env.BAILIAN_VISION_MODEL,
  });
  return { kind: "bailian", ...clients };
}

function openRouterBackend(): Backend {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("no AI backend available: no .z-ai-config, no BAILIAN_API_KEY and no OPENROUTER_API_KEY");
  }
  const clients = createOpenRouterClients({
    apiKey,
    baseUrl: process.env.OPENROUTER_BASE_URL,
    textModel: process.env.OPENROUTER_TEXT_MODEL,
    visionModel: process.env.OPENROUTER_VISION_MODEL,
  });
  return { kind: "openrouter", ...clients };
}

async function getBackend(): Promise<Backend> {
  if (!backendPromise) {
    let zaiError: unknown = null;
    // NOTE: bailianBackend()/openRouterBackend() are SYNCHRONOUS — they
    // throw when their key is absent and return a plain Backend otherwise.
    // Returning them from the catch callback resolves the outer promise;
    // never call .catch() on their (non-Promise) results.
    backendPromise = zaiBackend().catch((err: unknown) => {
      zaiError = err;
      // Bailian first (operator-provisioned live key), OpenRouter as the
      // tertiary link — a funded OpenRouter key keeps the chain alive if
      // Bailian is ever absent or revoked.
      try {
        return bailianBackend();
      } catch (bailianErr: unknown) {
        if (!process.env.OPENROUTER_API_KEY) {
          return Promise.reject(bailianErr);
        }
        try {
          return openRouterBackend();
        } catch (openRouterErr: unknown) {
          return Promise.reject(
            new Error(
              `bailian: ${String(bailianErr instanceof Error ? bailianErr.message : bailianErr)}; openrouter: ${String(openRouterErr instanceof Error ? openRouterErr.message : openRouterErr)}`,
            ),
          );
        }
      }
    });
    void zaiError; // surfaced through the per-call error guards below
    // A total failure (no backend at all) must not be negatively cached —
    // callers catch per-call and fall back deterministically; the next
    // generation attempt retries backend resolution. Log loudly: a silent
    // backend loss means every generation degrades to fallback specs.
    backendPromise = backendPromise.catch((err: unknown) => {
      console.error(
        `[ai-clients] backend resolution failed (zai/bailian/openrouter): ${String(err instanceof Error ? err.message : err)}`,
      );
      backendPromise = null;
      throw err;
    });
  }
  return backendPromise;
}

/** Ops probe: which AI backends are configured in this runtime (no secrets). */
export async function backendStatus(): Promise<{
  backend: "zai" | "bailian" | "openrouter" | "none";
  zaiConfigPresent: boolean;
  bailianKeyPresent: boolean;
  openRouterKeyPresent: boolean;
}> {
  const bailianKeyPresent = Boolean(process.env.BAILIAN_API_KEY ?? process.env.DASHSCOPE_API_KEY);
  const openRouterKeyPresent = Boolean(process.env.OPENROUTER_API_KEY);
  try {
    const backend = await getBackend();
    return { backend: backend.kind, zaiConfigPresent: backend.kind === "zai", bailianKeyPresent, openRouterKeyPresent };
  } catch {
    let zaiConfigPresent = false;
    try {
      await zaiBackend();
      zaiConfigPresent = true;
    } catch {
      zaiConfigPresent = false;
    }
    return { backend: "none", zaiConfigPresent, bailianKeyPresent, openRouterKeyPresent };
  }
}

export async function getChatClient(): Promise<ChatClient> {
  const backend = await getBackend();
  return backend.chat;
}

export async function getVisionClient(): Promise<VisionClient> {
  const backend = await getBackend();
  return backend.vision;
}

/** Reset cached clients (test seam). */
export function resetZai(): void {
  backendPromise = null;
}
