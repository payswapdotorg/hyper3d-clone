import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { exportModel, type ExportFormat } from "@/lib/exporters";
import { parseSceneSpec } from "@/lib/spec";
import { buildScene } from "@/lib/mesh-builder";

function buildFixture(): THREE.Group {
  const spec = parseSceneSpec({
    palette: ["#c62828", "#6d4c41", "#43a047"],
    objects: [
      { type: "sphere", params: { radius: 1 } },
      { type: "cylinder", params: { radiusTop: 0.06, radiusBottom: 0.08, height: 0.7 }, transform: { position: [0, 1.1, 0] } },
      { type: "box", params: { width: 0.8, height: 0.4, depth: 0.8 }, transform: { position: [1, 0, 0] } },
    ],
  });
  return buildScene(spec);
}

/** Minimal zip central-directory reader for verifying USDZ contents. */
function zipEntryNames(bytes: Uint8Array): string[] {
  const decoder = new TextDecoder("latin1");
  // Find End Of Central Directory record (PK\x05\x06) scanning backwards.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("no EOCD found — not a valid zip");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entryCount = view.getUint16(eocd + 10, true);
  const cdOffset = view.getUint32(eocd + 16, true);
  const names: string[] = [];
  let p = cdOffset;
  for (let i = 0; i < entryCount; i++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error("bad central directory entry");
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    names.push(decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen)));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

describe("model exporters", () => {
  it("GLB: starts with magic 0x46546C67 (\"glTF\") and contains a JSON chunk", async () => {
    const { bytes } = await exportModel(buildFixture(), "glb");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint32(0, true)).toBe(0x46546c67);
    expect(view.getUint32(4, true)).toBe(2); // glTF container version
    // First chunk (at offset 12) must be the JSON chunk type 0x4E4F534A.
    const jsonChunkLen = view.getUint32(12, true);
    expect(view.getUint32(16, true)).toBe(0x4e4f534a);
    const jsonText = new TextDecoder().decode(bytes.subarray(20, 20 + jsonChunkLen));
    const parsed = JSON.parse(jsonText.replace(/\0+$/, "")) as { asset?: { version?: string } };
    expect(parsed.asset?.version).toBe("2.0");
  });

  it("GLTF: emits JSON with asset.version", async () => {
    const { bytes, contentType } = await exportModel(buildFixture(), "gltf");
    expect(contentType).toContain("model/gltf+json");
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as {
      asset?: { version?: string };
      meshes?: unknown[];
    };
    expect(parsed.asset?.version).toBe("2.0");
    expect(parsed.meshes?.length).toBeGreaterThan(0);
  });

  it("OBJ: contains vertex lines (\"v \") and face lines (\"f \")", async () => {
    const { bytes } = await exportModel(buildFixture(), "obj");
    const text = new TextDecoder().decode(bytes);
    expect((text.match(/^v /gm) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((text.match(/^f /gm) ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("STL: 80-byte header, uint32 triangle count matches file length", async () => {
    const { bytes } = await exportModel(buildFixture(), "stl");
    expect(bytes.length).toBeGreaterThan(84);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const triCount = view.getUint32(80, true);
    expect(triCount).toBeGreaterThan(0);
    expect(bytes.length).toBe(84 + triCount * 50);
  });

  it("USDZ: is a valid zip containing a .usda/.usdc entry", async () => {
    const { bytes } = await exportModel(buildFixture(), "usdz");
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    const names = zipEntryNames(bytes);
    expect(names.some((n) => n.endsWith(".usda") || n.endsWith(".usdc"))).toBe(true);
  });

  it("rejects unknown formats and returns sensible content types", async () => {
    await expect(exportModel(buildFixture(), "3ds" as ExportFormat)).rejects.toThrow();
    const glb = await exportModel(buildFixture(), "glb");
    expect(glb.contentType).toContain("model/gltf-binary");
    const obj = await exportModel(buildFixture(), "obj");
    expect(obj.contentType).toContain("text/plain");
    const stl = await exportModel(buildFixture(), "stl");
    expect(stl.contentType).toContain("model/stl");
    const usdz = await exportModel(buildFixture(), "usdz");
    expect(usdz.contentType).toContain("model/vnd.usdz+zip");
  });

  it("FBX: ASCII FBX 7.3 — FBXHeaderExtension token, Objects/Geometry blocks, octet-stream", async () => {
    const { bytes, contentType, ext } = await exportModel(buildFixture(), "fbx");
    const text = new TextDecoder().decode(bytes);
    expect(ext).toBe("fbx");
    expect(contentType).toBe("application/octet-stream");
    expect(text).toContain("FBXHeaderExtension");
    expect(text).toContain("FBXHeaderVersion: 1003");
    expect(text).toContain("Objects:");
    expect(text).toContain("Geometry:");
    expect(text).toContain("Vertices:");
    expect(text).toContain("PolygonVertexIndex:");
  });
});
