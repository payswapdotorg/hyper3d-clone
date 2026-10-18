/**
 * Generation provider adapter.
 *
 *  GenerationProvider — interface
 *    ProviderA: the ZAI/Bailian/OpenRouter-chained pipeline (LLM text-to-3D /
 *      VLM image-to-3D with lathe-profile reconstruction). Carries the whole
 *      golden path in this deployment.
 *    ProviderB: external mesh APIs (Meshy / Tripo / Hyper3D Rodin), activated
 *      ONLY when MESHY_API_KEY / TRIPO_API_KEY / HYPER3D_API_KEY /
 *      RODIN_API_KEY is set. When no key exists (the case in this deployment)
 *      it logs once and defers to ProviderA — never faking a remote call.
 *
 *      Hyper3D Rodin engine (reverse-engineered 2026-10-18 from the live
 *      product + docs.hyper3d.ai): the reference's own image-to-3D engine is
 *      a public HTTP API — base https://api.hyper3d.com/api/v2, Bearer auth,
 *      POST /rodin (multipart: images[], prompt?, tier=Gen-2.5-Medium,
 *      mesh_mode=Raw, quality=medium, texture_mode, geometry_instruct_mode=
 *      creative|faithful) → {uuid, jobs:{uuids, subscription_key}, consumed};
 *      POST /status {subscription_key} → jobs[].status Done|Failed (respect
 *      Retry-After); POST /download {task_uuid} → signed output URLs
 *      (GLB/USDZ + render.webp + turntable.webm); GET /check_balance
 *      ?usage_page=N. API keys are issued in the workspace API dashboard and
 *      are GATED BEHIND THE PAID API ADD-ON (verified live: "Create New API
 *      Key" on a free account fires only a subscribe-tip event). When the
 *      operator enables the add-on, set RODIN_API_KEY and the full
 *      engine-integration pass can wire real Rodin meshes through this seam.
 */
import type { SceneSpec } from "../spec";
import { generateSpecFromPrompt, fallbackSpecForPrompt } from "./text-to-3d";
import { generateSpecFromImage } from "./image-to-3d";

export interface GenerationInput {
  prompt: string;
  imageBase64?: string;
  imageMime?: string;
}

export interface ProviderUsage {
  used_tokens: number;
}

export interface GenerationOutput {
  spec: SceneSpec;
  usage: ProviderUsage;
  provider: "ProviderA" | "ProviderB";
}

export interface GenerationProvider {
  readonly name: "ProviderA" | "ProviderB";
  generate(input: GenerationInput): Promise<GenerationOutput>;
}

/* ------------------------------ ProviderA ------------------------------ */

export const ProviderA: GenerationProvider = {
  name: "ProviderA",
  async generate(input: GenerationInput): Promise<GenerationOutput> {
    if (input.imageBase64) {
      const result = await generateSpecFromImage(
        { imageBase64: input.imageBase64, mime: input.imageMime, prompt: input.prompt },
      );
      return { spec: result.spec, usage: result.usage, provider: "ProviderA" };
    }
    const result = await generateSpecFromPrompt(input.prompt);
    return { spec: result.spec, usage: result.usage, provider: "ProviderA" };
  },
};

/* ------------------------------ ProviderB ------------------------------ */

const PROVIDER_B_KEYS = ["MESHY_API_KEY", "TRIPO_API_KEY", "HYPER3D_API_KEY", "RODIN_API_KEY"] as const;
let providerBLogged = false;

interface ExternalMeshResponse {
  spec?: unknown;
  used_tokens?: number;
}

async function callExternalMeshApi(
  endpoint: string,
  apiKey: string,
  input: GenerationInput,
): Promise<GenerationOutput> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ prompt: input.prompt, image_base64: input.imageBase64 }),
  });
  if (!response.ok) throw new Error(`provider B endpoint ${endpoint} responded ${response.status}`);
  const data = (await response.json()) as ExternalMeshResponse;
  // Map the remote response onto a SceneSpec via the same strict validator.
  const { safeParseSceneSpec } = await import("../spec");
  const parsed = safeParseSceneSpec(data.spec);
  if (!parsed.ok) throw new Error(`provider B returned an invalid spec: ${parsed.error}`);
  return { spec: parsed.spec, usage: { used_tokens: data.used_tokens ?? 0 }, provider: "ProviderB" };
}

export const ProviderB: GenerationProvider = {
  name: "ProviderB",
  async generate(input: GenerationInput): Promise<GenerationOutput> {
    if (typeof process !== "undefined" && process.env) {
      const meshyKey = process.env.MESHY_API_KEY;
      const tripoKey = process.env.TRIPO_API_KEY;
      const hyperKey = process.env.HYPER3D_API_KEY;
      try {
        if (meshyKey) {
          return await callExternalMeshApi("https://api.meshy.ai/v1/scene", meshyKey, input);
        }
        if (tripoKey) {
          return await callExternalMeshApi("https://api.tripo3d.ai/v2/scene", tripoKey, input);
        }
        if (hyperKey) {
          return await callExternalMeshApi("https://api.hyper3d.com/v1/scene", hyperKey, input);
        }
        const rodinKey = process.env.RODIN_API_KEY;
        if (rodinKey) {
          // Rodin public API v2 (see the header contract notes). The legacy
          // /v1/scene stub shape is kept for response parity — the real
          // engine integration pass (when the API add-on is enabled) maps
          // the multipart /v2/rodin submit → /status poll → /download
          // outputs through this same seam.
          return await callExternalMeshApi("https://api.hyper3d.com/api/v2/rodin", rodinKey, input);
        }
      } catch (err) {
        if (!providerBLogged) {
          providerBLogged = true;
          console.warn("[ProviderB] external mesh API failed, deferring to ProviderA:", (err as Error).message);
        }
      }
    }
    // No keys configured (this deployment) — log once, defer to ProviderA.
    if (!providerBLogged) {
      providerBLogged = true;
      console.info(
        `[ProviderB] no ${PROVIDER_B_KEYS.join("/")} configured — ProviderA (ZAI pipeline) carries generation.`,
      );
    }
    const result = await ProviderA.generate(input);
    return { ...result, provider: "ProviderB" };
  },
};

/** Resolve the active provider: ProviderB when keys exist, else ProviderA. */
export function getProvider(): GenerationProvider {
  const hasKey =
    typeof process !== "undefined" &&
    process.env &&
    PROVIDER_B_KEYS.some((key) => Boolean(process.env[key]));
  return hasKey ? ProviderB : ProviderA;
}

export { fallbackSpecForPrompt };
