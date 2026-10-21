/**
 * ASCII FBX 7.3 exporter — fills the last gap in the reference export row
 * (reference FAQ: "STL, FBX, OBJ, GLB, GLTF, and USDZ").
 *
 * Emits a real, parseable ASCII FBX: FBXHeaderExtension + GlobalSettings +
 * Definitions + Objects (Geometry with Vertices / PolygonVertexIndex /
 * LayerElementNormal / LayerElementUV / LayerElementColor, Model, Material) +
 * Connections. Triangles are emitted as 3-gons with the FBX last-index
 * convention (bitwise-not), and every mesh is baked through its world
 * matrix so multi-object scenes land correctly in Blender/Unity/Maya.
 *
 * Same contract as the other exporters: THREE.Object3D in, bytes out.
 * No eval, no dynamic code — pure data serialization.
 */
import * as THREE from "three";

const FBX_VERSION = 7300;
const FBX_HEADER_VERSION = 1003;

function f(n: number): string {
  // FBX ASCII number formatting: plain decimals, no exponent, capped precision.
  if (!Number.isFinite(n)) return "0";
  const s = n.toFixed(6);
  return s === "-0.000000" ? "0" : s.replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m));
}

function id(num: number): string {
  return String(1_000_000_000_000 + num * 7919);
}

interface FbxMesh {
  geometryId: string;
  modelId: string;
  materialId: string | null;
  vertices: number[];
  polygonVertexIndex: number[];
  normals: number[];
  uvs: number[];
  uvIndex: number[];
  colors: number[];
  name: string;
  diffuse: [number, number, number] | null;
  translation: [number, number, number];
}

function collectMeshes(root: THREE.Object3D): FbxMesh[] {
  const out: FbxMesh[] = [];
  let counter = 0;
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    counter += 1;
    const geom = mesh.geometry as THREE.BufferGeometry;
    const posAttr = geom.getAttribute("position");
    if (!posAttr || posAttr.count === 0) return;

    const world = mesh.matrixWorld;
    const v = new THREE.Vector3();
    const vertices: number[] = [];
    for (let i = 0; i < posAttr.count; i += 1) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(world);
      // FBX is Z-up right-handed with the same axis handedness as glTF after
      // a Y→Z basis swap; glTF->FBX convention: (x, y, z) -> (x, z, -y).
      vertices.push(v.x, v.z, -v.y);
    }

    const index = geom.getIndex();
    const triCount = index ? index.count / 3 : posAttr.count / 3;
    const polygonVertexIndex: number[] = [];
    for (let t = 0; t < triCount; t += 1) {
      const i0 = index ? index.getX(t * 3) : t * 3;
      const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      polygonVertexIndex.push(i0, i1, ~i2);
    }

    // Normals: ByPolygonVertex / Direct — expand vertex normals per corner.
    const normals: number[] = [];
    const normalAttr = geom.getAttribute("normal");
    const n = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(world);
    if (normalAttr) {
      for (const corner of polygonVertexIndex) {
        const idx = corner < 0 ? ~corner : corner;
        n.fromBufferAttribute(normalAttr as THREE.BufferAttribute, idx).applyMatrix3(normalMatrix).normalize();
        normals.push(n.x, n.z, -n.y);
      }
    } else {
      for (let t = 0; t < triCount; t += 1) {
        for (let k = 0; k < 3; k += 1) normals.push(0, 1, 0);
      }
    }

    // UVs: IndexToDirect — the uv list stays per-vertex, UVIndex per corner.
    const uvs: number[] = [];
    const uvIndex: number[] = [];
    const uvAttr = geom.getAttribute("uv");
    if (uvAttr) {
      for (let i = 0; i < uvAttr.count; i += 1) {
        uvs.push(uvAttr.getX(i), uvAttr.getY(i));
      }
      for (const corner of polygonVertexIndex) {
        const idx = corner < 0 ? ~corner : corner;
        uvIndex.push(Math.min(idx, uvAttr.count - 1));
      }
    }

    // Vertex colors (COLOR_0 / color attribute) — ByPolygonVertex / Direct, RGB.
    const colors: number[] = [];
    const colorAttr =
      (geom.getAttribute("color") as THREE.BufferAttribute | undefined) ??
      (geom.getAttribute("color_0") as THREE.BufferAttribute | undefined);
    if (colorAttr && colorAttr.itemSize >= 3) {
      const c = new THREE.Color();
      for (const corner of polygonVertexIndex) {
        const idx = corner < 0 ? ~corner : corner;
        c.fromBufferAttribute(colorAttr, idx);
        colors.push(c.r, c.g, c.b);
      }
    }

    // Material diffuse (single material; vertex colors stay the source of truth).
    let diffuse: [number, number, number] | null = null;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (mat && "color" in mat && (mat as THREE.MeshStandardMaterial).color) {
      const c = (mat as THREE.MeshStandardMaterial).color;
      diffuse = [c.r, c.g, c.b];
    }

    out.push({
      geometryId: id(counter * 3),
      modelId: id(counter * 3 + 1),
      materialId: diffuse ? id(counter * 3 + 2) : null,
      vertices,
      polygonVertexIndex,
      normals,
      uvs,
      uvIndex,
      colors,
      name: mesh.name || `mesh${counter}`,
      diffuse,
      translation: [0, 0, 0],
    });
  });
  return out;
}

function block(name: string, body: string[], indent = 0): string {
  const pad = " ".repeat(indent * 4);
  return `${pad}${name}: ${body.length > 0 ? "{" : "{}"}\n${body.join("\n")}${body.length > 0 ? `\n${pad}}\n` : "\n"}`;
}

function arrayProp(name: string, values: number[], perLine = 24, indent = 3): string {
  const pad = " ".repeat(indent * 4);
  const parts: string[] = [];
  for (let i = 0; i < values.length; i += perLine) {
    parts.push(values.slice(i, i + perLine).map(f).join(","));
  }
  const a = parts.map((p) => `${pad}    a: ${p}`).join("\n");
  return `${pad}${name}: *${values.length} {\n${a}\n${pad}}`;
}

export function exportAsciiFbx(root: THREE.Object3D): string {
  const meshes = collectMeshes(root);
  const totalTris = meshes.reduce((n, m) => n + m.polygonVertexIndex.length / 3, 0);

  const header = `; FBX ${FBX_VERSION / 1000}.0 project file
; Generated by the hyper3d-clone FBX exporter (${meshes.length} mesh(es), ${totalTris} triangles)
; ----------------------------------------------------

FBXHeaderExtension:  {
    FBXHeaderVersion: ${FBX_HEADER_VERSION}
    FBXVersion: ${FBX_VERSION}
    Creator: "hyper3d-clone FBXExporter 1.0"
}
GlobalSettings:  {
    Version: 1000
    Properties70:  {
        P: "UpAxis", "int", "Integer", "",1
        P: "UpAxisSign", "int", "Integer", "",1
        P: "FrontAxis", "int", "Integer", "",2
        P: "FrontAxisSign", "int", "Integer", "",-1
        P: "CoordAxis", "int", "Integer", "",0
        P: "CoordAxisSign", "int", "Integer", "",1
        P: "UnitScaleFactor", "double", "Number", "",1
    }
}
`;

  const defs = `Definitions:  {
    Version: 100
    Count: ${1 + meshes.length * 3}
    ObjectType: "GlobalSettings" {
        Count: 1
    }
    ObjectType: "Model" {
        Count: ${meshes.length}
    }
    ObjectType: "Geometry" {
        Count: ${meshes.length}
    }
    ObjectType: "Material" {
        Count: ${meshes.filter((m) => m.materialId).length}
    }
}
`;

  const objects: string[] = [];
  const connections: string[] = [];
  for (const m of meshes) {
    const layerElements: string[] = [];
    layerElements.push(
      `        LayerElementNormal: 0 {
            Version: 101
            Name: ""
            MappingInformationType: "ByPolygonVertex"
            ReferenceInformationType: "Direct"
${arrayProp("Normals", m.normals, 24, 3)}
        }`,
    );
    layerElements.push(
      `        Layer: 0 {
            Version: 100
            LayerElement:  {
                Type: "LayerElementNormal"
                TypedIndex: 0
            }
        }`,
    );
    if (m.uvs.length > 0) {
      layerElements.push(
        `        LayerElementUV: 0 {
            Version: 101
            Name: "map1"
            MappingInformationType: "ByPolygonVertex"
            ReferenceInformationType: "IndexToDirect"
${arrayProp("UV", m.uvs, 24, 3)}
${arrayProp("UVIndex", m.uvIndex, 24, 3)}
        }`,
      );
      layerElements.push(
        `        Layer: 0 {
            Version: 100
            LayerElement:  {
                Type: "LayerElementUV"
                TypedIndex: 0
            }
        }`,
      );
    }
    if (m.colors.length > 0) {
      layerElements.push(
        `        LayerElementColor: 0 {
            Version: 101
            Name: "col"
            MappingInformationType: "ByPolygonVertex"
            ReferenceInformationType: "Direct"
${arrayProp("Colors", m.colors, 24, 3)}
        }`,
      );
      layerElements.push(
        `        Layer: 0 {
            Version: 100
            LayerElement:  {
                Type: "LayerElementColor"
                TypedIndex: 0
            }
        }`,
      );
    }

    objects.push(`    Geometry: ${m.geometryId}, "Geometry::${m.name}", "Mesh" {
${arrayProp("Vertices", m.vertices, 24, 2)}
${arrayProp("PolygonVertexIndex", m.polygonVertexIndex, 24, 2)}
        GeometryVersion: 124
${layerElements.join("\n")}
    }`);

    objects.push(`    Model: ${m.modelId}, "Model::${m.name}", "Mesh" {
        Version: 232
        Properties70:  {
            P: "Lcl Translation", "Lcl Translation", "", "A",${m.translation.map(f).join(",")}
            P: "DefaultAttributeIndex", "int", "Integer", "",0
        }
        Shading: T
        Culling: "CullingOff"
    }`);

    connections.push(`    C: "OO",${m.geometryId},${m.modelId}`);
    connections.push(`    C: "OO",${m.modelId},0`);
    if (m.materialId && m.diffuse) {
      objects.push(`    Material: ${m.materialId}, "Material::${m.name}", "" {
        Version: 102
        ShadingModel: "phong"
        AmbientColor: 0,0,0
        DiffuseColor: ${m.diffuse.map(f).join(",")}
        TransparencyFactor: 0
    }`);
      connections.push(`    C: "OO",${m.materialId},${m.modelId}`);
    }
  }

  const connectionsBlock = connections.length > 0 ? `\nConnections:  {\n${connections.join("\n")}\n}\n` : "";

  return `${header}${defs}Objects:  {
${objects.join("\n")}
}${connectionsBlock}`;
}
