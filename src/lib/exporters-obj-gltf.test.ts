import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { exportModel } from "./exporters";

/**
 * OBJ + GLTF export byte-contracts for the engine2 parity surface (the
 * reference exports 6 mesh formats; the clone covers GLB/GLTF/OBJ/STL/USDZ —
 * FBX omitted, documented in DECISIONS.md #4).
 */
function boxScene(): THREE.Object3D {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1.5), new THREE.MeshStandardMaterial({ color: "#c62828" }));
  mesh.updateMatrixWorld(true);
  return mesh;
}

describe("exporters — OBJ & GLTF", () => {
  it("OBJ is text with one `v ` line per exported vertex", async () => {
    const result = await exportModel(boxScene(), "obj");
    const text = new TextDecoder().decode(result.bytes);
    expect(result.contentType).toBe("text/plain");
    const vLines = text.split("\n").filter((l) => l.startsWith("v "));
    expect(vLines.length).toBeGreaterThan(0);
    // A box has 24 corner-vertices (4 per face × 6 faces) in three.js.
    expect(vLines.length).toBe(24);
    // Sanity: coordinates parse as floats.
    const parts = vLines[0].trim().split(/\s+/).slice(1).map(Number);
    expect(parts).toHaveLength(3);
    expect(parts.every((n) => Number.isFinite(n))).toBe(true);
  });

  it("OBJ has `f ` lines whose count matches the triangle count", async () => {
    const result = await exportModel(boxScene(), "obj");
    const text = new TextDecoder().decode(result.bytes);
    const fLines = text.split("\n").filter((l) => l.startsWith("f "));
    // BoxGeometry = 12 triangles.
    expect(fLines.length).toBe(12);
    // Each face references 3 vertices (1-based indices).
    for (const line of fLines) {
      const refs = line.trim().split(/\s+/).slice(1);
      expect(refs).toHaveLength(3);
      for (const ref of refs) {
        expect(Number.parseInt(ref, 10)).toBeGreaterThan(0);
      }
    }
  });

  it("GLTF is valid JSON declaring asset.version 2.0", async () => {
    const result = await exportModel(boxScene(), "gltf");
    expect(result.contentType).toBe("model/gltf+json");
    const json = JSON.parse(new TextDecoder().decode(result.bytes)) as {
      asset: { version: string };
    };
    expect(json.asset.version).toBe("2.0");
  });

  it("GLTF embeds its geometry buffer as a base64 data URI", async () => {
    const result = await exportModel(boxScene(), "gltf");
    const json = JSON.parse(new TextDecoder().decode(result.bytes)) as {
      buffers: { uri: string; byteLength: number }[];
    };
    expect(json.buffers.length).toBeGreaterThan(0);
    expect(json.buffers[0].uri).toMatch(/^data:application\/(octet-stream|gltf-buffer);base64,/);
    expect(json.buffers[0].byteLength).toBeGreaterThan(0);
  });

  it("OBJ and GLTF describe the same mesh (vertex counts agree)", async () => {
    const scene = boxScene();
    const obj = await exportModel(scene, "obj");
    const gltf = await exportModel(scene, "gltf");
    const objVerts = new TextDecoder().decode(obj.bytes).split("\n").filter((l) => l.startsWith("v ")).length;
    const json = JSON.parse(new TextDecoder().decode(gltf.bytes)) as {
      accessors: { count: number; type: string }[];
      meshes: { primitives: { attributes: { POSITION: number } }[] }[];
    };
    const positionIndex = json.meshes[0].primitives[0].attributes.POSITION;
    expect(typeof positionIndex).toBe("number");
    expect(json.accessors[positionIndex].type).toBe("VEC3");
    expect(json.accessors[positionIndex].count).toBe(objVerts);
  });
});
