/**
 * Server-side AI client access. The SDK/HTTP clients are ONLY ever imported
 * here (server code) — never from a client component.
 *
 * Backend selection (first available wins):
 *  1. ZAI (z-ai-web-dev-sdk) — the platform backend. Available where a
 *     .z-ai-config exists (project/home//etc), e.g. the build sandbox;
 *     absent on serverless deployments (Vercel).
 *  2. OpenRouter — real LLM + VLM for off-platform deployments, activated
 *     by OPENROUTER_API_KEY (models via OPENROUTER_TEXT_MODEL /
 *     OPENROUTER_VISION_MODEL — see DECISIONS.md). OpenAI-compatible
 *     /chat/completions; text and vision share the endpoint.
 *  3. Neither → clients throw; callers degrade to their deterministic
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

type Backend = { chat: ChatClient; vision: VisionClient; kind: "zai" | "openrouter" };

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
      throw new Error(`openrouter ${model} responded ${response.status}`);
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

function openRouterBackend(): Backend {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("no AI backend available: no .z-ai-config and no OPENROUTER_API_KEY");
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
    backendPromise = zaiBackend().catch((err: unknown) => {
      zaiError = err;
      return openRouterBackend();
    });
    // A total failure (no backend at all) must not be negatively cached —
    // callers catch per-call and fall back deterministically; the next
    // generation attempt retries backend resolution. Log loudly: a silent
    // backend loss means every generation degrades to fallback specs.
    backendPromise = backendPromise.catch((err: unknown) => {
      console.error(
        `[ai-clients] backend resolution failed — zai: ${String(zaiError instanceof Error ? zaiError.message : zaiError)}; fallback: ${String(err instanceof Error ? err.message : err)}`,
      );
      backendPromise = null;
      throw err;
    });
  }
  return backendPromise;
}

/** Ops probe: which AI backends are configured in this runtime (no secrets). */
export async function backendStatus(): Promise<{
  backend: "zai" | "openrouter" | "none";
  zaiConfigPresent: boolean;
  openRouterKeyPresent: boolean;
}> {
  const openRouterKeyPresent = Boolean(process.env.OPENROUTER_API_KEY);
  try {
    const backend = await getBackend();
    return { backend: backend.kind, zaiConfigPresent: backend.kind === "zai", openRouterKeyPresent };
  } catch {
    let zaiConfigPresent = false;
    try {
      await zaiBackend();
      zaiConfigPresent = true;
    } catch {
      zaiConfigPresent = false;
    }
    return { backend: "none", zaiConfigPresent, openRouterKeyPresent };
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
