/**
 * SceneSpec — the intermediate representation every generation path converges
 * on. Text-to-3D (LLM), Image-to-3D (VLM caption) and seeded gallery assets
 * all produce a SceneSpec, which the mesh builder deterministically turns
 * into a three.js scene (and from there into real GLB/GLTF/OBJ/STL/USDZ
 * export bytes and a rasterized poster).
 *
 * Validation is intentionally strict: unknown keys and out-of-range numbers
 * are rejected so that machine-generated JSON can never smuggle garbage
 * into the mesh builder. No eval/Function is ever used — specs are data,
 * interpreted only by this module's builders.
 */
import { z } from "zod";

/* ------------------------------ scalars ------------------------------ */

const finite = z.number().finite();

/** Dimensions and radii: strictly positive, bounded to keep meshes sane. */
const dimension = finite.gt(0).max(100);
const radius = finite.gt(0).max(100);
/** Cylinder radii may taper to a point (0) — that is a valid cone-ish shape. */
const endRadius = finite.min(0).max(100);

const segments = z.number().int().min(3).max(64);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected 6-digit hex color like #c62828");

const vec3 = z.tuple([finite, finite, finite]);

const scale = z.union([finite.gt(0).max(100), z.tuple([finite.gt(0).max(100), finite.gt(0).max(100), finite.gt(0).max(100)])]);

const vec2 = z.tuple([finite, finite]);

/* ------------------------------ material ------------------------------ */

export const MaterialSchema = z.strictObject({
  color: hexColor.optional(),
  metalness: finite.min(0).max(1).optional(),
  roughness: finite.min(0).max(1).optional(),
  opacity: finite.min(0).max(1).optional(),
});

export const TransformSchema = z.strictObject({
  position: vec3.optional(),
  rotation: z.tuple([finite, finite, finite]).optional(),
  scale: scale.optional(),
});

/* ------------------------------ primitives ------------------------------ */

export const BoxParams = z.strictObject({
  width: dimension,
  height: dimension,
  depth: dimension,
});

export const SphereParams = z.strictObject({
  radius,
  widthSegments: segments.optional(),
  heightSegments: segments.optional(),
});

export const CylinderParams = z.strictObject({
  radiusTop: endRadius.optional(),
  radiusBottom: endRadius.optional(),
  height: dimension,
  radialSegments: segments.optional(),
});

export const ConeParams = z.strictObject({
  radius,
  height: dimension,
  radialSegments: segments.optional(),
});

export const TorusParams = z.strictObject({
  radius,
  tube: radius,
  radialSegments: segments.optional(),
  tubularSegments: segments.optional(),
});

export const LatheParams = z.strictObject({
  points: z.array(vec2).min(2).max(64),
  segments: segments.optional(),
});

export const ExtrudeParams = z.strictObject({
  shape: z.array(vec2).min(3).max(64),
  depth: dimension,
});

export type PrimitiveType = "box" | "sphere" | "cylinder" | "cone" | "torus" | "lathe" | "extrude";

export const PRIMITIVE_TYPES: PrimitiveType[] = [
  "box",
  "sphere",
  "cylinder",
  "cone",
  "torus",
  "lathe",
  "extrude",
];

const PrimitiveNode = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("box"),
    params: BoxParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("sphere"),
    params: SphereParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("cylinder"),
    params: CylinderParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("cone"),
    params: ConeParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("torus"),
    params: TorusParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("lathe"),
    params: LatheParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
  z.strictObject({
    type: z.literal("extrude"),
    params: ExtrudeParams,
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
]);

/* ------------------------------ groups ------------------------------ */

const GroupNode = z.lazy(() =>
  z.strictObject({
    type: z.literal("group"),
    children: z.array(SceneObject).min(1).max(64),
    transform: TransformSchema.optional(),
    material: MaterialSchema.optional(),
  }),
);

export const SceneObject = z.union([PrimitiveNode, GroupNode]);

/* ------------------------------ top level ------------------------------ */

export const SceneSpecSchema = z.strictObject({
  name: z.string().min(1).max(200).optional(),
  palette: z.array(hexColor).min(1).max(16).optional(),
  objects: z.array(SceneObject).min(1).max(128),
});

export type Material = z.infer<typeof MaterialSchema>;
export type Transform = z.infer<typeof TransformSchema>;
export type SceneObjectNode = z.infer<typeof SceneObject>;

export type PrimitiveNodeSpec = Extract<SceneObjectNode, { type: PrimitiveType }>;
export type GroupNodeSpec = Extract<SceneObjectNode, { type: "group" }>;

export interface SceneSpec {
  name?: string;
  palette?: string[];
  objects: SceneObjectNode[];
}

export type ParseResult =
  | { ok: true; spec: SceneSpec }
  | { ok: false; error: string };

/** Parse and validate a SceneSpec, throwing on any violation. */
export function parseSceneSpec(input: unknown): SceneSpec {
  return SceneSpecSchema.parse(input) as SceneSpec;
}

/** Non-throwing variant for machine-generated payloads. */
export function safeParseSceneSpec(input: unknown): ParseResult {
  const result = SceneSpecSchema.safeParse(input);
  if (result.success) return { ok: true, spec: result.data as SceneSpec };
  return {
    ok: false,
    error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };
}
