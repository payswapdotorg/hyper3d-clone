/**
 * Image-to-3D provider: uploaded image → VLM caption (CaptionResult) →
 * SceneSpec. Mirrors the real product's rodin_mesh_image_process pipeline
 * (blueprint §2 step 2): the VLM decomposes the reference into components
 * with primitive/params/position/scale/rotation/color plus a palette, and
 * this module maps that structure 1:1 onto SceneSpec objects, applying the
 * palette to any component without an explicit color.
 */
import type { VisionClient } from "../ai-clients";
import { analyzeImage, type CaptionResult } from "../caption";
import { parseSceneSpec, type SceneSpec, type SceneObjectNode, PrimitiveNodeSpec } from "../spec";

export interface ProviderUsage {
  used_tokens: number;
}

export interface ProviderResult {
  spec: SceneSpec;
  usage: ProviderUsage;
}

/** Default primitive params when the caption omitted required numbers. */
function defaultParams(primitive: string): Record<string, number | [number, number][]> {
  switch (primitive) {
    case "sphere":
      return { radius: 1 };
    case "cylinder":
      return { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5 };
    case "cone":
      return { radius: 0.6, height: 1.2 };
    case "torus":
      return { radius: 1, tube: 0.3 };
    case "lathe":
      return { points: [[0, 0], [0.5, 0.3], [0.45, 1.0], [0, 1.2]] };
    case "extrude":
      return { shape: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]], depth: 0.4 };
    case "box":
    default:
      return { width: 1, height: 1, depth: 1 };
  }
}

const PRIMITIVE_PARAM_KEYS: Record<string, string[]> = {
  box: ["width", "height", "depth"],
  sphere: ["radius", "widthSegments", "heightSegments"],
  cylinder: ["radiusTop", "radiusBottom", "height", "radialSegments"],
  cone: ["radius", "height", "radialSegments"],
  torus: ["radius", "tube", "radialSegments", "tubularSegments"],
  lathe: ["points"],
  extrude: ["shape", "depth"],
};

/** Map one caption component onto a validated primitive node. */
function componentToNode(component: CaptionResult["components"][number]): SceneObjectNode | null {
  const params: Record<string, number | [number, number][]> = defaultParams(component.primitive);
  const allowed = PRIMITIVE_PARAM_KEYS[component.primitive] ?? [];
  for (const key of allowed) {
    const value = component.params[key];
    if (value !== undefined) params[key] = value;
  }

  // Assemble with optional transform/material, then validate through zod.
  const candidate: Record<string, unknown> = { type: component.primitive, params };
  if (component.position || component.rotation || component.scale !== undefined) {
    const transform: Record<string, unknown> = {};
    if (component.position) transform.position = component.position;
    if (component.rotation) transform.rotation = component.rotation;
    if (component.scale !== undefined) transform.scale = component.scale;
    candidate.transform = transform;
  }
  if (component.color) candidate.material = { color: component.color };

  try {
    return parseSceneSpec({ objects: [candidate] }).objects[0] as PrimitiveNodeSpec;
  } catch {
    // Retry without transform (likely a bad scale/rotation)…
    try {
      return parseSceneSpec({ objects: [{ type: component.primitive, params }] }).objects[0] as PrimitiveNodeSpec;
    } catch {
      return null; // …otherwise drop the component entirely.
    }
  }
}

/**
 * Pure mapping: CaptionResult → SceneSpec. Palette entries become the spec
 * palette and backfill components that lack an explicit color. Deterministic.
 */
export function captionToSpec(caption: CaptionResult): SceneSpec {
  const nodes: SceneObjectNode[] = [];
  for (const component of caption.components) {
    const node = componentToNode(component);
    if (node) nodes.push(node);
  }
  if (nodes.length === 0) {
    nodes.push({
      type: "box",
      params: { width: 1.2, height: 1.2, depth: 1.2 },
    });
  }
  const spec: SceneSpec = {
    name: caption.prompt.split(".")[0]?.slice(0, 80) || "Image Asset",
    palette: [...caption.palette],
    objects: nodes,
  };
  const parsed = parseSceneSpec(spec);
  return parsed;
}

/**
 * Full image-to-3D generation: VLM caption → SceneSpec mapping.
 * `vision` is injectable for tests.
 */
export async function generateSpecFromImage(
  input: { imageBase64: string; mime?: string; prompt?: string },
  vision?: VisionClient,
): Promise<ProviderResult> {
  const caption = await analyzeImage(input, vision);
  const spec = captionToSpec(caption);
  // VLM responses don't expose a token count — estimate from component count.
  const usedTokens = 400 + caption.components.length * 120 + Math.ceil(caption.prompt.length / 4);
  if (input.prompt && input.prompt.trim().length > 0) {
    // The user's guidance stays the task prompt; keep the caption-derived spec.
    spec.name = input.prompt.trim().slice(0, 80);
  }
  return { spec, usage: { used_tokens: usedTokens } };
}
