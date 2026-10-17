/**
 * Text-to-3D provider: prompt → LLM → strict SceneSpec JSON.
 *
 * Layers of defense against bad model output:
 *  1. strict system prompt ("output ONLY SceneSpec JSON")
 *  2. zod validation via safeParseSceneSpec
 *  3. one retry that feeds the validation error back to the model
 *  4. deterministic primitive fallback (rounded-box composition whose
 *     palette is derived from prompt keywords) — generation never hard-fails
 *
 * Token usage from the chat responses is recorded for the task's usage block.
 */
import type { ChatClient } from "../ai-clients";
import { getChatClient } from "../ai-clients";
import { safeParseSceneSpec, type SceneSpec } from "../spec";

export interface ProviderUsage {
  used_tokens: number;
}

export interface ProviderResult {
  spec: SceneSpec;
  usage: ProviderUsage;
}

const SYSTEM_PROMPT = `You are a 3D asset compiler. Output ONLY a SceneSpec JSON document (no markdown, no commentary, no code fences) describing a 3D asset of the user's prompt.

SceneSpec shape:
{
  "name": "<short asset name>",
  "palette": ["#RRGGBB", ...2..5 colors],
  "objects": [
    { "type": "box|sphere|cylinder|cone|torus|lathe|extrude",
      "params": {
        box: {width,height,depth} | sphere: {radius,widthSegments?,heightSegments?} |
        cylinder: {radiusTop?,radiusBottom?,height,radialSegments?} | cone: {radius,height} |
        torus: {radius,tube,radialSegments?,tubularSegments?} |
        lathe: {points:[[x,y],...at least 2]} | extrude: {shape:[[x,y],...at least 3], depth}
      },
      "transform": { "position": [x,y,z], "rotation": [rx,ry,rz], "scale": 1 | [sx,sy,sz] },
      "material": { "color": "#RRGGBB", "metalness": 0..1, "roughness": 0..1, "opacity": 0..1 }
    }
  ]
}
Hard rules: 2..12 objects; every dimension and radius in 0.05..4; positions within -4..4; rotations in radians; no keys beyond the documented ones — unknown keys or out-of-range numbers are rejected; use a ground-level composition (y >= 0 for bases) that reads well from a 3/4 camera; prefer descriptive palettes matching the prompt (e.g. red apple → reds, browns, greens).`;

const KEYWORD_PALETTES: { keywords: string[]; palette: string[] }[] = [
  { keywords: ["red", "apple", "cherry", "ruby", "strawberry"], palette: ["#c62828", "#8e2b26", "#6d4c41", "#43a047"] },
  { keywords: ["blue", "azure", "ocean", "sky", "cyan"], palette: ["#1e88e5", "#1565c0", "#90caf9", "#263238"] },
  { keywords: ["green", "leaf", "forest", "emerald", "plant"], palette: ["#2e7d32", "#43a047", "#81c784", "#33691e"] },
  { keywords: ["gold", "golden", "brass", "trophy", "crown"], palette: ["#c9a227", "#8d6e1f", "#ffd76b", "#5d4037"] },
  { keywords: ["silver", "steel", "chrome", "metal", "robot"], palette: ["#90a4ae", "#607d8b", "#cfd8dc", "#37474f"] },
  { keywords: ["purple", "violet", "amethyst", "magic", "crystal"], palette: ["#7b1fa2", "#9c27b0", "#ce93d8", "#4a148c"] },
  { keywords: ["orange", "amber", "copper", "rust"], palette: ["#ef6c00", "#ff9800", "#bf360c", "#ffe0b2"] },
  { keywords: ["wood", "wooden", "oak", "crate", "barrel"], palette: ["#8d6e63", "#5d4037", "#a1887f", "#3e2723"] },
];

function paletteForPrompt(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  for (const entry of KEYWORD_PALETTES) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.palette;
  }
  return ["#607d8b", "#90a4ae", "#cfd8dc", "#37474f"];
}

/**
 * Deterministic fallback: a rounded composition of primitives colored from
 * the prompt's keyword palette. Used when the LLM never produces a valid spec.
 */
export function fallbackSpecForPrompt(prompt: string): SceneSpec {
  const palette = paletteForPrompt(prompt);
  return {
    name: prompt.split(/\s+/).slice(0, 4).join(" ") || "Fallback Asset",
    palette,
    objects: [
      {
        type: "sphere",
        params: { radius: 1, widthSegments: 24, heightSegments: 16 },
        transform: { position: [0, 1.05, 0], scale: [1, 0.92, 1] },
        material: { color: palette[0], metalness: 0.08, roughness: 0.45 },
      },
      {
        type: "cylinder",
        params: { radiusTop: 0.55, radiusBottom: 0.75, height: 0.35, radialSegments: 24 },
        transform: { position: [0, 0.175, 0] },
        material: { color: palette[1] ?? palette[0], metalness: 0.2, roughness: 0.6 },
      },
      {
        type: "torus",
        params: { radius: 1.45, tube: 0.06, radialSegments: 12, tubularSegments: 48 },
        transform: { position: [0, 1.05, 0], rotation: [Math.PI / 2, 0, 0] },
        material: { color: palette[2] ?? palette[0], metalness: 0.6, roughness: 0.3 },
      },
      {
        type: "cone",
        params: { radius: 0.18, height: 0.6, radialSegments: 12 },
        transform: { position: [0.35, 1.9, 0.1], rotation: [0.2, 0, -0.35] },
        material: { color: palette[3] ?? palette[0], metalness: 0.1, roughness: 0.5 },
      },
    ],
  };
}

function extractContent(response: unknown): string | null {
  if (typeof response !== "object" || response === null) return null;
  const choices = (response as { choices?: unknown[] }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  if (typeof message?.content === "string") return message.content;
  return null;
}

function extractTokens(response: unknown): number | null {
  if (typeof response !== "object" || response === null) return null;
  const usage = (response as { usage?: { total_tokens?: unknown; prompt_tokens?: unknown; completion_tokens?: unknown } }).usage;
  const total = usage?.total_tokens;
  if (typeof total === "number" && Number.isFinite(total)) return Math.round(total);
  const promptTokens = usage?.prompt_tokens;
  const completionTokens = usage?.completion_tokens;
  if (typeof promptTokens === "number" && typeof completionTokens === "number") {
    return Math.round(promptTokens + completionTokens);
  }
  return null;
}

function maybeJson(raw: string): unknown {
  const text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(candidate);
  } catch {
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
 * Generate a SceneSpec from a text prompt. One retry with error feedback,
 * then the deterministic fallback. `chat` is injectable for tests.
 */
export async function generateSpecFromPrompt(
  prompt: string,
  chat?: ChatClient,
): Promise<ProviderResult> {
  let usedTokens = 0;
  let client = chat;

  const attempt = async (userContent: string): Promise<{ content: string | null; tokens: number | null }> => {
    // Client resolution inside the caller's try: when no chat backend is
    // available at all (no .z-ai-config, no OPENROUTER_API_KEY), the error
    // is caught below and the deterministic fallback runs instead.
    client = client ?? (await getChatClient());
    const response = await client.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      thinking: { type: "disabled" },
    });
    return { content: extractContent(response), tokens: extractTokens(response) };
  };

  try {
    let result = await attempt(`Create a 3D asset of: ${prompt}`);
    if (result.tokens !== null) usedTokens += result.tokens;

    if (result.content) {
      const parsed = safeParseSceneSpec(maybeJson(result.content));
      if (parsed.ok) return { spec: parsed.spec, usage: { used_tokens: usedTokens } };
      // One retry with the validation error fed back.
      result = await attempt(
        `Your previous reply was rejected by the SceneSpec validator:\n${parsed.error}\n\nOutput ONLY a corrected SceneSpec JSON for a 3D asset of: ${prompt}`,
      );
      if (result.tokens !== null) usedTokens += result.tokens;
      if (result.content) {
        const retry = safeParseSceneSpec(maybeJson(result.content));
        if (retry.ok) return { spec: retry.spec, usage: { used_tokens: usedTokens } };
      }
    }
  } catch {
    // Network/model failure → deterministic fallback below.
  }

  return { spec: fallbackSpecForPrompt(prompt), usage: { used_tokens: usedTokens } };
}
