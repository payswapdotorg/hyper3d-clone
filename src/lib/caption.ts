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
  /** Set when the vision chain degraded to the deterministic fallback —
   * carries the real cause (bounded) so production failures are diagnosable
   * from the API response instead of only from unreadable runtime logs. */
  degraded?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const FALLBACK_RESULT: CaptionResult = {
  prompt: "A simple 3D object. simple geometry.",
  components: [
    {
      // Neutral rounded pebble (lathe silhouette) — reads as a deliberate
      // placeholder rather than a bug when the vision backend is offline.
      primitive: "lathe",
      params: { points: [[0, 0], [0.42, 0.1], [0.62, 0.42], [0.66, 0.72], [0.52, 1.02], [0.28, 1.18], [0, 1.26]] },
      position: [0, 0, 0],
      scale: 1.1,
    },
  ],
  palette: ["#a8adb8", "#8d93a0"],
  form: "rounded-organic",
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
Reconstruction rules:
- FIRST identify what the object IS, then build it: an apple is a lathe body with dimples plus a thin cylinder stem; a mug is a lathe body plus a torus handle; a table is boxes plus cylinder legs.
- Organic bodies (fruit, vases, bottles, cups, lamps, character torsos): use "lathe" with a silhouette points array of 8..14 [x, y] pairs [[0, 0], [x, y], ..., [0, top]] — x is the profile radius at height y. Round fruit profiles: height ≈ 0.85..1.05 of the max width (an apple is slightly wider than tall), smooth curvature, small dimples at top and bottom. This revolve profile is how real organic silhouettes are reconstructed; prefer it over spheres.
- ATTACHMENT MATH (critical): attachments start at the body surface, never buried or floating. If the body's profile reaches top y = 1.2 and the stem is 0.3 tall, the stem's position y = 1.2 + 0.3/2 = 1.35. Same logic for legs under a body and handles beside a body.
- Stems, handles, legs, limbs, spouts: cylinders or cones attached per the math above. STEMS ARE THIN: radius 0.03..0.06 (never a wide disk); handles/legs proportionate to the body.
- Hard-surface parts (panels, bases, screens, wings): boxes or extrudes.
- Colors: sample the ACTUAL colors from the image per component (e.g. a red apple body #C1121F with a brown-green stem), not generic ones.
- 2 to 8 components; each sized 0.05..4 units; positions within -4..4; palette 2..5 hex colors from the object; ground-level composition (main body starting at y=0).
Worked example (red apple): {"caption_prompt":"A red apple with a short stem. simple geometry.","components":[{"primitive":"lathe","params":{"points":[[0,0],[0.45,0.05],[0.72,0.25],[0.85,0.55],[0.8,0.85],[0.62,1.05],[0.3,1.14],[0,1.15]]},"position":[0,0,0],"scale":1,"rotation":[0,0,0],"color":"#C1121F"},{"primitive":"cylinder","params":{"radius":0.055,"height":0.3},"position":[0,1.3,0],"scale":1,"rotation":[0,0,0],"color":"#6B8E23"}],"palette":["#C1121F","#6B8E23"],"form":"rounded-organic"}`;

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
    if (content === null) {
      console.error("[caption] vision response carried no content:", JSON.stringify(response).slice(0, 300));
      return { ...structuredCloneSafe(FALLBACK_RESULT), degraded: `vision response carried no content: ${JSON.stringify(response).slice(0, 200)}` };
    }
    const parsed = parseCaptionOutput(content);
    if (parsed.prompt === FALLBACK_RESULT.prompt) {
      // The model answered but the answer did not parse into the caption
      // schema — surface a preview of the raw answer for diagnosis.
      console.error("[caption] unparseable vision answer:", content.slice(0, 300));
      return { ...parsed, degraded: `unparseable vision answer: ${content.slice(0, 200)}` };
    }
    return parsed;
  } catch (err) {
    // Degrade silently to the deterministic fallback (generation must never
    // fail), but surface the real cause: in the runtime log AND on the result
    // (degraded field) — silent catches made production caption failures
    // undiagnosable.
    const cause = err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 300) : String(err).slice(0, 300);
    console.error("[caption] vision chain failed — degrading to fallback:", cause);
    return { ...structuredCloneSafe(FALLBACK_RESULT), degraded: cause };
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
