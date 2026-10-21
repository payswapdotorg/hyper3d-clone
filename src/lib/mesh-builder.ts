/**
 * SceneSpec → three.js Group.
 *
 * Deterministic: the same spec always yields an identical scene (identical
 * geometry parameters, transforms, materials, traversal order). No
 * randomness, no timestamps, no eval — geometry is constructed purely from
 * validated spec data.
 */
import * as THREE from "three";
import type { Material, PrimitiveNodeSpec, SceneObjectNode, SceneSpec, Transform } from "./spec";

const DEFAULT_METALNESS = 0.1;
const DEFAULT_ROUGHNESS = 0.55;
const DEFAULT_OPACITY = 1;

function buildGeometry(node: PrimitiveNodeSpec): THREE.BufferGeometry {
  switch (node.type) {
    case "box":
      return new THREE.BoxGeometry(node.params.width, node.params.height, node.params.depth);
    case "sphere":
      return new THREE.SphereGeometry(
        node.params.radius,
        node.params.widthSegments ?? 24,
        node.params.heightSegments ?? 16,
      );
    case "cylinder":
      return new THREE.CylinderGeometry(
        node.params.radiusTop ?? node.params.radiusBottom ?? 0.5,
        node.params.radiusBottom ?? node.params.radiusTop ?? 0.5,
        node.params.height,
        node.params.radialSegments ?? 24,
      );
    case "cone":
      return new THREE.ConeGeometry(
        node.params.radius,
        node.params.height,
        node.params.radialSegments ?? 24,
      );
    case "torus":
      return new THREE.TorusGeometry(
        node.params.radius,
        node.params.tube,
        node.params.radialSegments ?? 12,
        node.params.tubularSegments ?? 48,
      );
    case "lathe": {
      let points = node.params.points.map(([x, y]) => new THREE.Vector2(Math.max(0, x), y));
      // Smooth organic silhouettes: vision models emit SPARSE profiles
      // (4-10 points), which revolve into faceted bodies. A Catmull-Rom
      // spline through the same control points (THREE.SplineCurve, 2D)
      // yields a smooth revolve while passing through every original
      // point — deterministic, no model cooperation required. Dense
      // profiles (>20 points) are already smooth and pass through.
      if (points.length >= 4 && points.length <= 20) {
        const spline = new THREE.SplineCurve(points);
        const sampled = spline.getPoints(Math.max(points.length * 3, 24));
        points = sampled.map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
        // Pin the exact original endpoints (spline endpoints coincide,
        // but re-pinning guards against float drift).
        points[0] = new THREE.Vector2(Math.max(0, node.params.points[0][0]), node.params.points[0][1]);
        const last = node.params.points[node.params.points.length - 1];
        points[points.length - 1] = new THREE.Vector2(Math.max(0, last[0]), last[1]);
      }
      return new THREE.LatheGeometry(points, node.params.segments ?? 36);
    }
    case "extrude": {
      const shape = new THREE.Shape();
      const pts = node.params.shape;
      shape.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: node.params.depth, bevelEnabled: false });
    }
    default: {
      throw new Error(`unknown primitive type: ${String((node as { type?: string }).type)}`);
    }
  }
}

function applyTransform(object: THREE.Object3D, transform: Transform | undefined): void {
  if (!transform) return;
  if (transform.position) object.position.set(...transform.position);
  if (transform.rotation) object.rotation.set(...transform.rotation);
  if (typeof transform.scale === "number") {
    object.scale.setScalar(transform.scale);
  } else if (Array.isArray(transform.scale)) {
    object.scale.set(...transform.scale);
  }
}

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Build the material for a node, falling back to the palette color when the
 * node has no explicit color. Palette assignment is index-based over the
 * mesh traversal order, which is fully deterministic.
 */
function buildMaterial(material: Material | undefined, paletteColor: string | undefined): THREE.MeshStandardMaterial {
  const color = material?.color ?? paletteColor ?? "#8a8f98";
  const opacity = material?.opacity ?? DEFAULT_OPACITY;
  const result = new THREE.MeshStandardMaterial({
    color: hexToColor(color),
    metalness: material?.metalness ?? DEFAULT_METALNESS,
    roughness: material?.roughness ?? DEFAULT_ROUGHNESS,
    opacity,
    transparent: opacity < 1,
  });
  return result;
}

interface BuildContext {
  palette?: string[];
  meshIndex: number;
}

function nextPaletteColor(ctx: BuildContext): string | undefined {
  if (!ctx.palette || ctx.palette.length === 0) return undefined;
  const color = ctx.palette[ctx.meshIndex % ctx.palette.length];
  return color;
}

function buildNode(node: SceneObjectNode, ctx: BuildContext, inheritedMaterial?: Material): THREE.Object3D {
  if (node.type === "group") {
    const group = new THREE.Group();
    group.name = "group";
    applyTransform(group, node.transform);
    const effectiveMaterial = node.material ?? inheritedMaterial;
    for (const child of node.children) {
      group.add(buildNode(child, ctx, effectiveMaterial));
    }
    return group;
  }

  const mesh = new THREE.Mesh(buildGeometry(node));
  mesh.name = node.type;
  applyTransform(mesh, node.transform);
  // Explicit material beats inherited group material beats palette color.
  const material = node.material ?? inheritedMaterial;
  if (material) {
    mesh.material = buildMaterial(material, undefined);
  } else {
    mesh.material = buildMaterial(undefined, nextPaletteColor(ctx));
  }
  ctx.meshIndex += 1;
  return mesh;
}

/**
 * Build a three.js Group from a validated SceneSpec. Deterministic:
 * `buildScene(spec)` twice produces structurally identical output.
 */
export function buildScene(spec: SceneSpec): THREE.Group {
  const root = new THREE.Group();
  root.name = spec.name ?? "scene";
  const ctx: BuildContext = { palette: spec.palette, meshIndex: 0 };
  for (const node of spec.objects) {
    root.add(buildNode(node, ctx));
  }
  return root;
}

/** Count meshes under an object (for stats display). */
export function countMeshes(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) count += 1;
  });
  return count;
}
