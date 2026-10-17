import { renderPoster } from "../src/lib/render-preview.ts";
import { buildScene } from "../src/lib/mesh-builder.ts";
import { parseSceneSpec } from "../src/lib/spec.ts";
import { writeFileSync } from "node:fs";

const spec = parseSceneSpec({
  name: "Apple",
  palette: ["#c62828", "#6d4c41", "#43a047"],
  objects: [
    { type: "sphere", params: { radius: 1, widthSegments: 32, heightSegments: 24 }, material: { color: "#c62828", roughness: 0.35 } },
    { type: "cylinder", params: { radiusTop: 0.05, radiusBottom: 0.07, height: 0.5 }, transform: { position: [0, 1.15, 0] }, material: { color: "#6d4c41" } },
    { type: "lathe", params: { points: [[0, 0], [0.28, 0.1], [0.2, 0.3], [0, 0.34]], segments: 16 }, transform: { position: [0.22, 1.32, 0], rotation: [0, 0, -0.5] }, material: { color: "#43a047" } },
    { type: "torus", params: { radius: 1.35, tube: 0.05, tubularSegments: 64 }, transform: { position: [0, -1.0, 0], rotation: [Math.PI / 2, 0, 0] }, material: { color: "#8d6e63" } },
  ],
});
const group = buildScene(spec);
const bytes = renderPoster(group);
writeFileSync("/home/z/my-project/base/db/poster-spike.png", bytes);
console.log("PNG bytes:", bytes.length);
console.log("signature:", bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47);
const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const w = view.getUint32(16, false);
const h = view.getUint32(20, false);
console.log("IHDR dims:", w, "x", h, "colorType:", bytes[25]);
// Determinism check
const bytes2 = renderPoster(buildScene(spec));
console.log("deterministic:", Buffer.compare(Buffer.from(bytes), Buffer.from(bytes2)) === 0);
console.log("SPIKE OK");
