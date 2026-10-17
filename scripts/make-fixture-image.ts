/**
 * Draws a canvas-style PNG fixture (a red apple on a white background)
 * for the e2e golden-path upload. Pure Node — no canvas dep.
 */
import * as nodeZlib from "node:zlib";
import { writeFileSync } from "node:fs";

const W = 256;
const H = 256;
const rgb = new Uint8Array(W * H * 3);

function put(x: number, y: number, r: number, g: number, b: number) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  rgb[i] = r;
  rgb[i + 1] = g;
  rgb[i + 2] = b;
}

// white background
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) put(x, y, 248, 248, 250);

// apple body: squashed circle centered (128, 158), rx 78, ry 72
const cx = 128;
const cy = 158;
const rx = 78;
const ry = 70;
// leaf: ellipse around (170, 62)
const lx = 172;
const ly = 60;
// stem: short thick line from (128, 88) up to (126, 54)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    const d = dx * dx + dy * dy;
    if (d <= 1) {
      // shading: light from top-left
      const shade = 0.68 + 0.4 * Math.max(0, 1 - Math.hypot(dx + 0.5, dy - 0.5));
      const baseR = 198;
      const baseG = 40;
      const baseB = 40;
      put(x, y, Math.min(255, Math.round(baseR * shade + 30)), Math.round(baseG * shade), Math.round(baseB * shade));
    }
    // dimple at top of apple
    if (Math.hypot(x - 128, y - 108) < 14 && d <= 1.08) {
      put(x, y, 150, 30, 30);
    }
  }
}

// stem
for (let y = 54; y < 104; y++) {
  const width = 3 + Math.round((y - 54) / 25);
  for (let x = 124 - width; x <= 128 + width; x++) {
    put(x, y, 109, 76, 65);
  }
}

// leaf (rotated ellipse)
for (let y = 40; y < 88; y++) {
  for (let x = 140; x < 210; x++) {
    const ex = (x - lx) / 34;
    const ey = (y - ly) / 15;
    const rot = ex * Math.cos(-0.5) - ey * Math.sin(-0.5);
    const rot2 = ex * Math.sin(-0.5) + ey * Math.cos(-0.5);
    if (rot * rot + rot2 * rot2 <= 1) {
      put(x, y, 67, 160, 71);
    }
  }
}

// PNG encode
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)), false);
  return out;
}
const raw = new Uint8Array(H * (W * 3 + 1));
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  raw.set(rgb.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
}
const idat = nodeZlib.deflateSync(raw, { level: 6 });
const ihdr = new Uint8Array(13);
const ihdrView = new DataView(ihdr.buffer);
ihdrView.setUint32(0, W, false);
ihdrView.setUint32(4, H, false);
ihdr[8] = 8;
ihdr[9] = 2;
const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", new Uint8Array(idat)), chunk("IEND", new Uint8Array(0))];
const total = parts.reduce((n, p) => n + p.length, 0);
const png = new Uint8Array(total);
let off = 0;
for (const p of parts) {
  png.set(p, off);
  off += p.length;
}
writeFileSync("/tmp/test-apple.png", png);
console.log("fixture written: /tmp/test-apple.png", png.length, "bytes");
