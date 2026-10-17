/**
 * Poster renderer — turns the built three.js scene into a real 512×512 PNG
 * on the server.
 *
 * The sandbox has no headless WebGL, so this module rasterizes the actual
 * generated mesh triangles (the very geometry that gets exported) with a
 * z-buffer, barycentric shading from a 3-light setup and 2× supersampling,
 * then encodes a standards-compliant PNG via node:zlib. Deterministic:
 * the same group always produces identical bytes.
 */
import * as THREE from "three";
import * as nodeZlib from "node:zlib";

export interface PosterOptions {
  width?: number;
  height?: number;
}

const BG = { r: 236, g: 236, b: 240 }; // neutral studio grey

interface Light {
  dir: [number, number, number]; // normalized direction TO the light
  intensity: number;
}

const LIGHTS: Light[] = [
  // key (camera-side upper right), fill (left), rim (back top) — 3-light setup
  { dir: [0.45, 0.75, 0.5], intensity: 0.95 },
  { dir: [-0.6, 0.25, 0.35], intensity: 0.3 },
  { dir: [-0.15, 0.6, -0.78], intensity: 0.45 },
];
const AMBIENT = 0.22;

/** Deep-clone a group and normalize it into a ~2-unit box at the origin. */
export function normalizedClone(group: THREE.Object3D): THREE.Object3D {
  const model = group.clone(true);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2 / maxDim;
  const wrapper = new THREE.Group();
  model.position.set(-center.x, -center.y, -center.z);
  wrapper.add(model);
  wrapper.scale.setScalar(scale);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}

interface ProjectedVertex {
  x: number;
  y: number;
  depth: number;
  world: [number, number, number];
  normal: [number, number, number];
}

function perspectiveProject(
  v: [number, number, number],
  eye: THREE.Vector3,
  right: THREE.Vector3,
  up: THREE.Vector3,
  forward: THREE.Vector3,
  tanHalfFov: number,
  width: number,
  height: number,
): { x: number; y: number; depth: number } {
  const ex = v[0] - eye.x;
  const ey = v[1] - eye.y;
  const ez = v[2] - eye.z;
  const zc = ex * forward.x + ey * forward.y + ez * forward.z; // depth along forward
  const xc = ex * right.x + ey * right.y + ez * right.z;
  const yc = ex * up.x + ey * up.y + ez * up.z;
  if (zc <= 0.001) return { x: 0, y: 0, depth: -1 }; // behind camera
  const halfW = width / 2;
  const halfH = height / 2;
  const f = 1 / (tanHalfFov * zc);
  return { x: halfW + xc * f * halfW, y: halfH - yc * f * halfH, depth: zc };
}

function normalize3(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function shade(
  normal: [number, number, number],
  baseR: number,
  baseG: number,
  baseB: number,
  roughness: number,
): [number, number, number] {
  let r = AMBIENT;
  let g = AMBIENT;
  let b = AMBIENT;
  for (const light of LIGHTS) {
    const ndl = Math.max(0, normal[0] * light.dir[0] + normal[1] * light.dir[1] + normal[2] * light.dir[2]);
    r += ndl * light.intensity;
    g += ndl * light.intensity;
    b += ndl * light.intensity;
  }
  // Blinn-Phong-ish highlight from the key light, tempered by roughness.
  const h = normalize3([LIGHTS[0].dir[0], LIGHTS[0].dir[1] + 1, LIGHTS[0].dir[2]]);
  const ndh = Math.max(0, normal[0] * h[0] + normal[1] * h[1] + normal[2] * h[2]);
  const spec = Math.pow(ndh, 24) * (1 - roughness) * 0.35;
  r += spec;
  g += spec;
  b += spec;
  return [
    Math.min(255, Math.round(baseR * r)),
    Math.min(255, Math.round(baseG * g)),
    Math.min(255, Math.round(baseB * b)),
  ];
}

/* ------------------------------ PNG encoding ------------------------------ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)), false);
  return out;
}

export function encodePng(width: number, height: number, rgb: Uint8Array): Uint8Array {
  // rgb: width*height*3, row-major.
  const raw = new Uint8Array(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0; // filter type 0 (None)
    raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), rowStart + 1);
  }
  const zlib = nodeZlib;
  const idat = zlib.deflateSync(raw, { level: 6 });

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = pngChunk("IHDR", ihdr);
  const idatChunk = pngChunk("IDAT", new Uint8Array(idat));
  const iendChunk = pngChunk("IEND", new Uint8Array(0));

  const total = signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length;
  const out = new Uint8Array(total);
  let offset = 0;
  out.set(signature, offset); offset += signature.length;
  out.set(ihdrChunk, offset); offset += ihdrChunk.length;
  out.set(idatChunk, offset); offset += idatChunk.length;
  out.set(iendChunk, offset);
  return out;
}

/* ------------------------------ rasterizer ------------------------------ */

interface Triangle {
  a: ProjectedVertex;
  b: ProjectedVertex;
  c: ProjectedVertex;
  color: [number, number, number];
  roughness: number;
}

function collectTriangles(model: THREE.Object3D): Triangle[] {
  const triangles: Triangle[] = [];
  model.updateMatrixWorld(true);
  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position as THREE.BufferAttribute | undefined;
    const norm = geo.attributes.normal as THREE.BufferAttribute | undefined;
    if (!pos) return;
    const index = geo.index;
    const triCount = index ? index.count / 3 : pos.count / 3;
    const worldMatrix = mesh.matrixWorld;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const std = material as THREE.MeshStandardMaterial | undefined;
    const baseColor = std?.color ?? new THREE.Color(0x8a8f98);
    const baseR = Math.round(baseColor.r * 255);
    const baseG = Math.round(baseColor.g * 255);
    const baseB = Math.round(baseColor.b * 255);
    const roughness = std?.roughness ?? 0.5;

    for (let t = 0; t < triCount; t++) {
      const i0 = index ? index.getX(t * 3) : t * 3;
      const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
      const verts: ProjectedVertex[] = [];
      let behind = false;
      for (const i of [i0, i1, i2]) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(worldMatrix);
        const n = new THREE.Vector3(
          norm ? norm.getX(i) : 0,
          norm ? norm.getY(i) : 1,
          norm ? norm.getZ(i) : 0,
        ).applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(worldMatrix));
        verts.push({
          x: 0,
          y: 0,
          depth: 0,
          world: [v.x, v.y, v.z],
          normal: [n.x, n.y, n.z],
        });
        void behind;
      }
      triangles.push({
        a: verts[0],
        b: verts[1],
        c: verts[2],
        color: [baseR, baseG, baseB],
        roughness,
      });
    }
  });
  return triangles;
}

/**
 * Render the group into a deterministic 512×512 PNG poster.
 * The group is cloned+normalized (never mutated).
 */
export function renderPoster(group: THREE.Object3D, options: PosterOptions = {}): Uint8Array {
  const width = options.width ?? 512;
  const height = options.height ?? 512;
  const ss = 2; // supersampling factor
  const frameW = width * ss;
  const frameH = height * ss;

  const model = normalizedClone(group);

  // 3/4 perspective camera.
  const eye = new THREE.Vector3(2.05, 1.55, 2.6);
  const target = new THREE.Vector3(0, 0, 0);
  const forward = new THREE.Vector3().subVectors(target, eye).normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  const tanHalfFov = Math.tan((32 * Math.PI) / 180 / 2);

  // Project all triangle vertices once.
  const triangles = collectTriangles(model).filter((tri) => {
    let visible = true;
    const project = (vert: ProjectedVertex): ProjectedVertex => {
      const p = perspectiveProject(vert.world, eye, right, up, forward, tanHalfFov, frameW, frameH);
      if (p.depth <= 0) visible = false;
      vert.x = p.x;
      vert.y = p.y;
      vert.depth = p.depth;
      return vert;
    };
    tri.a = project(tri.a);
    tri.b = project(tri.b);
    tri.c = project(tri.c);
    return visible;
  });

  const colorBuffer = new Float32Array(frameW * frameH * 3);
  const depthBuffer = new Float32Array(frameW * frameH).fill(Number.POSITIVE_INFINITY);

  // Paint the neutral background.
  for (let i = 0; i < frameW * frameH; i++) {
    colorBuffer[i * 3] = BG.r;
    colorBuffer[i * 3 + 1] = BG.g;
    colorBuffer[i * 3 + 2] = BG.b;
  }

  for (const tri of triangles) {
    const { a, b, c } = tri;
    // Bounding box (in supersampled pixel space).
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const maxX = Math.min(frameW - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const maxY = Math.min(frameH - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
    if (minX > maxX || minY > maxY) continue;

    const area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    if (Math.abs(area) < 1e-9) continue;
    const invArea = 1 / area;

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        // Sample at pixel center.
        const sx = px + 0.5;
        const sy = py + 0.5;
        const w0 = ((b.x - a.x) * (sy - a.y) - (b.y - a.y) * (sx - a.x)) * invArea; // for c
        const w1 = ((c.x - b.x) * (sy - b.y) - (c.y - b.y) * (sx - b.x)) * invArea; // for a
        const w2 = ((a.x - c.x) * (sy - c.y) - (a.y - c.y) * (sx - c.x)) * invArea; // for b
        const inside = w0 >= 0 && w1 >= 0 && w2 >= 0;
        if (!inside) continue;
        const depth = a.depth * w1 + b.depth * w2 + c.depth * w0;
        const idx = py * frameW + px;
        if (depth >= depthBuffer[idx]) continue;
        depthBuffer[idx] = depth;
        // Interpolated normal (barycentric weights map: a←w1, b←w2, c←w0).
        const nx = a.normal[0] * w1 + b.normal[0] * w2 + c.normal[0] * w0;
        const ny = a.normal[1] * w1 + b.normal[1] * w2 + c.normal[1] * w0;
        const nz = a.normal[2] * w1 + b.normal[2] * w2 + c.normal[2] * w0;
        const n = normalize3([nx, ny, nz]);
        const [pr, pg, pb] = shade(n, tri.color[0], tri.color[1], tri.color[2], tri.roughness);
        colorBuffer[idx * 3] = pr;
        colorBuffer[idx * 3 + 1] = pg;
        colorBuffer[idx * 3 + 2] = pb;
      }
    }
  }

  // Box downsample to the final resolution.
  const rgb = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const idx = (y * ss + dy) * frameW + (x * ss + dx);
          r += colorBuffer[idx * 3];
          g += colorBuffer[idx * 3 + 1];
          b += colorBuffer[idx * 3 + 2];
        }
      }
      const o = (y * width + x) * 3;
      rgb[o] = Math.round(r / (ss * ss));
      rgb[o + 1] = Math.round(g / (ss * ss));
      rgb[o + 2] = Math.round(b / (ss * ss));
    }
  }

  return encodePng(width, height, rgb);
}
