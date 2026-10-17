/**
 * Server-side AI client access. z-ai-web-dev-sdk is ONLY ever imported
 * here (server code) — never from a client component. The client objects
 * are created lazily and cached; tests replace them via vi.mock of this
 * module, and nothing else in the app touches the SDK directly.
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

type ZaiInstance = Awaited<ReturnType<typeof ZAI.create>>;

let zaiPromise: Promise<ZaiInstance> | null = null;

async function getZai(): Promise<ZaiInstance> {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

export async function getChatClient(): Promise<ChatClient> {
  const zai = await getZai();
  return {
    create: (body) => zai.chat.completions.create(body as never),
  };
}

export async function getVisionClient(): Promise<VisionClient> {
  const zai = await getZai();
  return {
    createVision: (body) => zai.chat.completions.createVision(body as never),
  };
}

/** Reset cached clients (test seam). */
export function resetZai(): void {
  zaiPromise = null;
}
