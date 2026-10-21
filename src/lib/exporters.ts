/**
 * Model exporters — REAL bytes for every format, powered by three.js
 * exporters (GLTFExporter / OBJExporter / STLExporter / USDZExporter from
 * three/examples/jsm). Runs server-side in Node/Bun.
 *
 * GLTFExporter reads its own output Blobs through `FileReader`, which does
 * not exist outside browsers — a minimal, byte-faithful polyfill is
 * installed below (readAsArrayBuffer / readAsText / readAsDataURL via the
 * Blob async methods + Node Buffer base64). This shim lives only in this
 * server module and never runs on the client.
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { exportAsciiFbx } from "./exporters-fbx";

/* ------------------------- FileReader polyfill (server) ------------------------- */

class ServerFileReader {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;

  private finish(value: ArrayBuffer | string): void {
    this.result = value;
    this.onloadend?.();
  }

  readAsArrayBuffer(blob: Blob): void {
    blob
      .arrayBuffer()
      .then((buffer) => this.finish(buffer))
      .catch((err) => this.onerror?.(err));
  }

  readAsText(blob: Blob): void {
    blob
      .text()
      .then((text) => this.finish(text))
      .catch((err) => this.onerror?.(err));
  }

  readAsDataURL(blob: Blob): void {
    blob
      .arrayBuffer()
      .then((buffer) => {
        const base64 = Buffer.from(buffer).toString("base64");
        const type = blob.type || "application/octet-stream";
        this.finish(`data:${type};base64,${base64}`);
      })
      .catch((err) => this.onerror?.(err));
  }
}

function ensureFileReader(): void {
  const scope = globalThis as { FileReader?: unknown };
  if (typeof scope.FileReader === "undefined") {
    scope.FileReader = ServerFileReader;
  }
}

/* ------------------------------ export API ------------------------------ */

export type ExportFormat = "glb" | "gltf" | "fbx" | "obj" | "stl" | "usdz";

export const EXPORT_FORMATS: ExportFormat[] = ["glb", "gltf", "fbx", "obj", "stl", "usdz"];

export interface ExportResult {
  bytes: Uint8Array;
  contentType: string;
  ext: string;
}

function glbFromExporter(group: THREE.Object3D): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    new GLTFExporter().parse(
      group,
      (result) => resolve(result as ArrayBuffer),
      (err) => reject(err),
      { binary: true },
    );
  });
}

function gltfFromExporter(group: THREE.Object3D): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    new GLTFExporter().parse(
      group,
      (result) => {
        // The exporter hands back the glTF JSON object; buffers are
        // embedded as a base64 data-URI in json.buffers[0].uri.
        resolve(JSON.stringify(result));
      },
      (err) => reject(err),
      { binary: false },
    );
  });
}

/**
 * Export a built scene into real, standards-compliant bytes.
 *
 *   glb  — binary glTF container (magic 0x46546C67, JSON + BIN chunks)
 *   gltf — glTF 2.0 JSON with embedded base64 buffer
 *   fbx  — ASCII FBX 7.3 (exporters-fbx.ts — geometry/normals/UVs/colors)
 *   obj  — Wavefront OBJ text (v/f lines)
 *   stl  — binary STL (80-byte header + uint32 triangle count + 50B/tri)
 *   usdz — zip archive containing a .usda scene
 */
export async function exportModel(group: THREE.Object3D, format: ExportFormat): Promise<ExportResult> {
  switch (format) {
    case "glb": {
      ensureFileReader();
      const buffer = await glbFromExporter(group);
      return { bytes: new Uint8Array(buffer), contentType: "model/gltf-binary", ext: "glb" };
    }
    case "gltf": {
      ensureFileReader();
      const json = await gltfFromExporter(group);
      return {
        bytes: new TextEncoder().encode(json),
        contentType: "model/gltf+json",
        ext: "gltf",
      };
    }
    case "fbx": {
      const text = exportAsciiFbx(group);
      return {
        bytes: new TextEncoder().encode(text),
        contentType: "application/octet-stream",
        ext: "fbx",
      };
    }
    case "obj": {
      const text = new OBJExporter().parse(group);
      return { bytes: new TextEncoder().encode(text), contentType: "text/plain", ext: "obj" };
    }
    case "stl": {
      const data = new STLExporter().parse(group, { binary: true }) as DataView;
      return {
        bytes: new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)),
        contentType: "model/stl",
        ext: "stl",
      };
    }
    case "usdz": {
      const data = await new USDZExporter().parseAsync(group);
      return { bytes: new Uint8Array(data), contentType: "model/vnd.usdz+zip", ext: "usdz" };
    }
    default: {
      const exhaustive: never = format;
      throw new Error(`unsupported export format: ${String(exhaustive)}`);
    }
  }
}
