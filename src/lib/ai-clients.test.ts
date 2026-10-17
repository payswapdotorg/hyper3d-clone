import { describe, it, expect, vi, afterEach } from "vitest";
import { createOpenRouterClients } from "@/lib/ai-clients";

/**
 * OpenRouter adapter (pure) — the off-platform AI backend used when no
 * .z-ai-config exists (serverless deployments). The adapter must:
 *  - inject the configured text model and override the vision model slug
 *    (callers pass the platform slug, e.g. "glm-4.5v")
 *  - drop platform-only request fields (the `thinking` switch)
 *  - send the bearer key and hit {baseUrl}/chat/completions
 *  - surface non-OK responses as errors (callers degrade deterministically)
 */
describe("createOpenRouterClients", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubFetch() {
    const calls: { url: string; init: RequestInit }[] = [];
    const impl = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 });
    };
    const fn = vi.fn(impl);
    vi.stubGlobal("fetch", fn);
    return { calls, fn };
  }

  it("chat.create maps the request onto the configured text model", async () => {
    const { calls } = stubFetch();
    const clients = createOpenRouterClients({
      apiKey: "test-key",
      baseUrl: "https://example.test/v1",
      textModel: "test/text-model",
    });

    const result = (await clients.chat.create({
      messages: [{ role: "user", content: "hello" }],
      thinking: { type: "disabled" },
    })) as { choices: { message: { content: string } }[] };

    expect(result.choices[0].message.content).toBe("ok");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://example.test/v1/chat/completions");

    const init = calls[0].init;
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer test-key");
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");

    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.model).toBe("test/text-model");
    expect(body.messages).toEqual([{ role: "user", content: "hello" }]);
    // Platform-only fields are dropped, not forwarded.
    expect(body.thinking).toBeUndefined();
  });

  it("vision.createVision overrides the requested model slug", async () => {
    const { calls } = stubFetch();
    const clients = createOpenRouterClients({
      apiKey: "test-key",
      textModel: "test/text-model",
      visionModel: "test/vision-model",
    });

    await clients.vision.createVision({
      model: "glm-4.5v",
      messages: [{ role: "user", content: [{ type: "text", text: "describe" }] }],
    });

    const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    expect(body.model).toBe("test/vision-model");
    expect(Array.isArray(body.messages)).toBe(true);
  });

  it("forwards max_tokens and temperature when provided, defaults max_tokens otherwise", async () => {
    const { calls } = stubFetch();
    const clients = createOpenRouterClients({ apiKey: "k", textModel: "t/m" });

    await clients.chat.create({
      messages: [{ role: "user", content: "x" }],
      max_tokens: 512,
      temperature: 0.2,
      other_junk: true,
    });
    await clients.chat.create({ messages: [{ role: "user", content: "x" }] });

    const withCap = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    const defaulted = JSON.parse(String(calls[1].init.body)) as Record<string, unknown>;
    expect(withCap.max_tokens).toBe(512);
    expect(withCap.temperature).toBe(0.2);
    expect("other_junk" in withCap).toBe(false);
    // Unset max_tokens must default to a bounded cap — OpenRouter
    // pre-authorizes max_tokens against the key's credit budget, and an
    // unset value (model max) 402s on credit-limited keys.
    expect(defaulted.max_tokens).toBe(1024);
  });

  it("throws on non-OK responses so callers can degrade", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no credits", { status: 402 })),
    );
    const clients = createOpenRouterClients({ apiKey: "k", textModel: "t/m" });

    await expect(clients.chat.create({ messages: [{ role: "user", content: "x" }] })).rejects.toThrow(
      /openrouter t\/m responded 402/,
    );
  });

  it("defaults to the production text/vision models when unconfigured", async () => {
    const { calls } = stubFetch();
    const clients = createOpenRouterClients({ apiKey: "k" });
    await clients.chat.create({ messages: [{ role: "user", content: "x" }] });
    await clients.vision.createVision({ model: "glm-4.5v", messages: [] });

    const textBody = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
    const visionBody = JSON.parse(String(calls[1].init.body)) as Record<string, unknown>;
    expect(textBody.model).toBe("meta-llama/llama-3.3-70b-instruct");
    expect(visionBody.model).toBe("deepseek/deepseek-v4-flash-vision-exp");
  });
});
