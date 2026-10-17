/**
 * Image captioning — the clone's implementation of the real product's
 * rodin_mesh_image_process auto-caption step (blueprint §2 step 2).
 *
 * The uploaded image is sent to the vision model with a system prompt that
 * demands STRICT JSON: {caption_prompt, components[], palette[], form}.
 * Whatever comes back is funneled through `parseCaptionOutput`, which
 * sanitizes every field and degrades to a deterministic safe fallback when
 * the model misbehaves — generation NEVER fails because of captioning.
 */
import { getVisionClient, type VisionClient } from "./ai-clients";
import { PRIMITIVE_TYPES, type PrimitiveType } from "./spec";

export type { VisionClient };

export interface CaptionComponent {
  primitive: PrimitiveType;
  params: Record<string, number | [number, number][]>;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

export interface CaptionResult {
  prompt: string;
  components: CaptionComponent[];
  palette: string[];
  form: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const FALLBACK_RESULT: CaptionResult = {
  prompt: "A simple 3D object. simple geometry.",
  components: [
    {
      primitive: "box",
      params: { width: 1.2, height: 1.2, depth: 1.2 },
      position: [0, 0, 0],
    },
  ],
  palette: ["#8a8f98", "#c0c4cc"],
  form: "simple-blocky",
};

const CAPTION_SYSTEM_PROMPT = `You are a 3D reconstruction assistant. Analyze the image and reply with ONLY strict JSON (no markdown, no commentary) shaped exactly like:
{
  "caption_prompt": "<one-sentence description of the object, ending with '. simple geometry.'>",
  "components": [
    { "primitive": "<box|sphere|cylinder|cone|torus|lathe|extrude>",
      "params": { <primitive params, e.g. "radius": 1, "width": 1, "height": 1, "depth": 1, "points": [[x,y],...], "shape": [[x,y],...]> },
      "position": [x, y, z],
      "scale": 1,
      "rotation": [0, 0, 0],
      "color": "#RRGGBB"
    }
  ],
  "palette": ["#RRGGBB", "..."],
  "form": "<rounded-organic|angular-hard-surface|tall-slender|flat-wide|simple-blocky>"
}
Rules: 2 to 8 components, each sized 0.05..4 units, positions within -4..4; use cylinders/cones for limbs and stems, spheres/lathe for bodies, boxes/extrude for bases and panels; palette 2..5 hex colors sampled from the object.`;

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

function asVec3(value: unknown): [number, number, number] | undefined {
  if (Array.isArray(value) && value.length === 3) {
    const nums = value.map(asFiniteNumber);
    if (nums.every((n): n is number => n !== undefined)) return [nums[0], nums[1], nums[2]];
  }
  return undefined;
}

function asScale(value: unknown): number | [number, number, number] | undefined {
  const num = asFiniteNumber(value);
  if (num !== undefined) return num;
  return asVec3(value);
}

function sanitizeParams(value: unknown): Record<string, number | [number, number][]> {
  const result: Record<string, number | [number, number][]> = {};
  if (typeof value !== "object" || value === null) return result;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const num = asFiniteNumber(raw);
    if (num !== undefined) {
      result[key] = num;
      continue;
    }
    if (Array.isArray(raw)) {
      const pairs: [number, number][] = [];
      for (const item of raw) {
        if (Array.isArray(item) && item.length === 2) {
          const a = asFiniteNumber(item[0]);
          const b = asFiniteNumber(item[1]);
          if (a !== undefined && b !== undefined) pairs.push([a, b]);
        }
      }
      if (pairs.length > 0) result[key] = pairs;
    }
  }
  return result;
}

function sanitizeComponent(value: unknown): CaptionComponent | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const primitive = (
    typeof raw.primitive === "string" && PRIMITIVE_TYPES.includes(raw.primitive as PrimitiveType)
      ? raw.primitive
      : "box"
  ) as PrimitiveType;
  const params = sanitizeParams(raw.params);
  if (Object.keys(params).length === 0) {
    // Give sanitized components a valid minimal param set for their primitive.
    params[primitive === "sphere" || primitive === "cone" || primitive === "torus" ? "radius" : "width"] = 1;
    if (primitive === "box" || primitive === "extrude") params.height = 1;
    if (primitive === "box" || primitive === "extrude") params.depth = 1;
    if (primitive === "cone" || primitive === "cylinder") params.height = 1;
  }
  const component: CaptionComponent = { primitive, params };
  const position = asVec3(raw.position);
  if (position) component.position = position;
  const scale = asScale(raw.scale);
  if (scale !== undefined) component.scale = scale;
  const rotation = asVec3(raw.rotation);
  if (rotation) component.rotation = rotation;
  if (typeof raw.color === "string" && HEX_RE.test(raw.color)) component.color = raw.color;
  return component;
}

function maybeJson(raw: string): unknown {
  const text = raw.trim();
  if (!text) return null;
  // Strip markdown code fences when present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(candidate);
  } catch {
    // Last resort: extract the first {...} block.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Parse a raw VLM response payload (string content or already-decoded
 * object) into a CaptionResult. Always returns something valid — malformed
 * output degrades to the deterministic fallback.
 */
export function parseCaptionOutput(raw: unknown): CaptionResult {
  let obj: unknown = raw;
  if (typeof raw === "string") {
    obj = maybeJson(raw);
  }
  if (typeof obj !== "object" || obj === null) return { ...FALLBACK_RESULT, components: FALLBACK_RESULT.components.map((c) => ({ ...c, params: { ...c.params } })) };

  const data = obj as Record<string, unknown>;
  const promptRaw = data.caption_prompt ?? data.prompt;
  const prompt = typeof promptRaw === "string" && promptRaw.trim().length > 0 ? promptRaw.trim().slice(0, 2000) : FALLBACK_RESULT.prompt;

  const components: CaptionComponent[] = Array.isArray(data.components)
    ? (data.components.map(sanitizeComponent).filter((c): c is CaptionComponent => c !== null).slice(0, 8))
    : [];
  const finalComponents = components.length > 0 ? components : FALLBACK_RESULT.components.map((c) => ({ ...c, params: { ...c.params } }));

  const palette = Array.isArray(data.palette)
    ? (data.palette.filter((p): p is string => typeof p === "string" && HEX_RE.test(p)).slice(0, 8))
    : [];
  const finalPalette = palette.length > 0 ? palette : [...FALLBACK_RESULT.palette];

  const formRaw = data.form;
  const form = typeof formRaw === "string" && formRaw.trim().length > 0 ? formRaw.trim().slice(0, 80) : FALLBACK_RESULT.form;

  return { prompt, components: finalComponents, palette: finalPalette, form };
}

function extractContent(response: unknown): string | null {
  if (typeof response !== "object" || response === null) return null;
  const choices = (response as { choices?: unknown[] }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    // Multimodal-style content blocks: concatenate the text parts.
    return content
      .map((block) => (typeof block === "object" && block !== null ? (block as { text?: unknown }).text : null))
      .filter((t): t is string => typeof t === "string")
      .join("\n");
  }
  return null;
}

/**
 * Caption an uploaded image via the vision model. `client` is injectable
 * for tests; production uses the shared ZAI vision client.
 */
export async function analyzeImage(
  input: { imageBase64: string; mime?: string },
  client?: VisionClient,
): Promise<CaptionResult> {
  const mime = input.mime && input.mime.startsWith("image/") ? input.mime : "image/png";
  const dataUrl = `data:${mime};base64,${input.imageBase64}`;
  try {
    // Client resolution inside the guard: when no vision backend is
    // available at all (no .z-ai-config, no OPENROUTER_API_KEY), degrade to
    // the deterministic fallback instead of failing the generation.
    const vision = client ?? (await getVisionClient());
    const response = await vision.createVision({
      model: "glm-4.5v",
      messages: [
        { role: "system", content: CAPTION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Caption this reference image for 3D reconstruction as the strict JSON described." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = extractContent(response);
    if (content === null) return structuredCloneSafe(FALLBACK_RESULT);
    return parseCaptionOutput(content);
  } catch {
    return structuredCloneSafe(FALLBACK_RESULT);
  }
}

function structuredCloneSafe(result: CaptionResult): CaptionResult {
  return {
    prompt: result.prompt,
    components: result.components.map((c) => ({
      ...c,
      params: { ...c.params },
      position: c.position ? [...c.position] : undefined,
      rotation: c.rotation ? [...c.rotation] : undefined,
    })),
    palette: [...result.palette],
    form: result.form,
  };
}
