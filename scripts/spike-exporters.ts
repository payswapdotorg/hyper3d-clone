import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";

const group = new THREE.Group();
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.4, roughness: 0.3 }),
);
mesh.name = "box";
group.add(mesh);
const mesh2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.1, roughness: 0.6 }),
);
mesh2.position.set(1, 0, 0);
group.add(mesh2);

// GLB
const glb = await new Promise<ArrayBuffer>((res, rej) =>
  new GLTFExporter().parse(group, (r) => res(r as ArrayBuffer), rej, { binary: true }),
);
const glbBytes = new Uint8Array(glb);
console.log("GLB magic:", String.fromCharCode(...glbBytes.slice(0, 4)), "len:", glbBytes.length);

// GLTF (json)
const gltf = await new Promise<unknown>((res, rej) =>
  new GLTFExporter().parse(group, (r) => res(r), rej, { binary: false }),
);
console.log("GLTF type:", typeof gltf, "asset:", JSON.stringify((gltf as {asset?: unknown}).asset));

// OBJ
const obj = new OBJExporter().parse(group);
console.log("OBJ has v:", /^v /m.test(obj), "has f:", /^f /m.test(obj));

// STL
const stl = new STLExporter().parse(group, { binary: true }) as DataView;
const tris = new DataView(stl.buffer, stl.byteOffset, stl.byteLength).getUint32(80, true);
console.log("STL tris:", tris, "len ok:", stl.byteLength === 84 + tris * 50);

// USDZ
const usdz = await new USDZExporter().parseAsync(group);
const u8 = new Uint8Array(usdz);
console.log("USDZ magic PK:", u8[0] === 0x50 && u8[1] === 0x4b, "len:", u8.length);
const str = Buffer.from(u8).toString("latin1");
console.log("USDZ contains usda:", str.includes(".usda"));
console.log("SPIKE OK");
