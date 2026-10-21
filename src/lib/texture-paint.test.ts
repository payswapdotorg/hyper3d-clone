import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { gradientAt, paintVertexColors, sampleImage, enableVertexColors, type PaintSource } from "./texture-paint";

/* ------------------------- helpers ------------------------- */

/** Solid-color 2×2 RGBA image. */
function solidImage(r: number, g: number, b: number, w = 2, h = 2): PaintSource {
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  }
  return { width: w, height: h, rgba };
}

/** Half red (top), half blue (bottom) image for vertical checks. */
function splitImage(): PaintSource {
  const w = 2;
  const h = 2;
  const rgba = new Uint8Array(w * h * 4);
  // top row red
  for (let x = 0; x < w; x++) {
    rgba[(0 * w + x) * 4] = 255;
    rgba[(0 * w + x) * 4 + 3] = 255;
  }
  // bottom row blue
  for (let x = 0; x < w; x++) {
    rgba[(1 * w + x) * 4 + 2] = 255;
    rgba[(1 * w + x) * 4 + 3] = 255;
  }
  return { width: w, height: h, rgba };
}

function frontPlane(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
  mesh.material = new THREE.MeshStandardMaterial();
  return mesh;
}

function backPlane(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
  mesh.rotation.y = Math.PI; // normal now points -Z
  mesh.material = new THREE.MeshStandardMaterial();
  return mesh;
}

function colorOf(mesh: THREE.Mesh, index = 0): [number, number, number] {
  const attr = mesh.geometry.getAttribute("color") as THREE.BufferAttribute;
  return [attr.getX(index), attr.getY(index), attr.getZ(index)];
}

/* ------------------------------ tests ------------------------------ */

describe("texture-paint (COLOR_0 vertex colors)", () => {
  it("front-facing vertices receive the projected image pixel color", () => {
    const mesh = frontPlane();
    const stats = paintVertexColors(mesh, solidImage(200, 10, 10), { palette: ["#00ff00", "#0000ff"] });
    const [r, g, b] = colorOf(mesh, 0);
    expect(r).toBeGreaterThan(0.7); // red image wins on the front
    expect(g).toBeLessThan(0.1);
    expect(b).toBeLessThan(0.1);
    expect(stats.painted).toBe(mesh.geometry.getAttribute("position").count);
    expect(stats.meshes).toBe(1);
  });

  it("back-facing vertices receive the palette gradient, not the image", () => {
    const mesh = backPlane();
    paintVertexColors(mesh, solidImage(255, 0, 0), { palette: ["#00ff00", "#0000ff"] });
    // Vertex 0 sits at the top of the plane → gradient top color (blue).
    const [r, g, b] = colorOf(mesh, 0);
    expect(r).toBeLessThan(0.05); // image red must not bleed to the back
    expect(b).toBeGreaterThan(0.5); // palette gradient blue
    expect(g).toBeLessThan(0.4);
  });

  it("the gradient varies with height: bottom ≠ top for a 2-color palette", () => {
    const mesh = backPlane();
    paintVertexColors(mesh, solidImage(0, 0, 0), { palette: ["#ff0000", "#0000ff"] });
    const pos = mesh.geometry.getAttribute("position");
    let bottom: [number, number, number] | null = null;
    let top: [number, number, number] | null = null;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) bottom = colorOf(mesh, i);
      if (pos.getY(i) > 0) top = colorOf(mesh, i);
    }
    expect(bottom).toBeTruthy();
    expect(top).toBeTruthy();
    expect(bottom![0]).toBeGreaterThan(top![0]); // bottom is redder
    expect(top![2]).toBeGreaterThan(bottom![2]); // top is bluer
  });

  it("silhouette vertices (normal ⊥ view) blend smoothly between image and gradient", () => {
    // A plane rotated ~82° — normal.z ≈ 0.14, inside the blend band.
    const mesh = frontPlane();
    mesh.rotation.y = Math.PI / 2.2;
    paintVertexColors(mesh, solidImage(255, 0, 0), { palette: ["#00ff00", "#0000ff"] });
    const [r, g, b] = colorOf(mesh, 0);
    // Neither pure image (r≈1, g≈0) nor pure gradient — a genuine mix.
    expect(r).toBeGreaterThan(0.1);
    expect(r).toBeLessThan(0.95);
    expect(g + b).toBeGreaterThan(0.05);
  });

  it("adds a `color` attribute (COLOR_0 on export) with itemSize 3 and full coverage", () => {
    const mesh = frontPlane();
    const geo = mesh.geometry;
    expect(geo.getAttribute("color")).toBeUndefined();
    paintVertexColors(mesh, solidImage(120, 120, 140));
    const attr = geo.getAttribute("color") as THREE.BufferAttribute;
    expect(attr).toBeTruthy();
    expect(attr.itemSize).toBe(3);
    expect(attr.count).toBe(geo.getAttribute("position").count);
    for (let i = 0; i < attr.count * 3; i++) {
      const v = attr.array[i] as number;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("no palette → neutral grey backfill, image still paints the front; enableVertexColors flips materials", () => {
    const group = new THREE.Group();
    const front = frontPlane();
    const back = backPlane();
    group.add(front, back);
    paintVertexColors(group, solidImage(255, 255, 255));
    const neutral = gradientAt([], 0.5);
    expect(neutral.r).toBeCloseTo(0.55, 1);
    const [br, bg, bb] = colorOf(back, 0);
    expect(br).toBeCloseTo(neutral.r, 1);
    expect(bg).toBeCloseTo(neutral.g, 1);
    expect(bb).toBeCloseTo(neutral.b, 1);
    const [fr] = colorOf(front, 0);
    expect(fr).toBeGreaterThan(0.9); // white image on the front

    enableVertexColors(group);
    expect((front.material as THREE.MeshStandardMaterial).vertexColors).toBe(true);
    expect((back.material as THREE.MeshStandardMaterial).vertexColors).toBe(true);
    // sampleImage clamps out-of-range uv without throwing.
    expect(() => sampleImage(solidImage(1, 2, 3), 5, -3)).not.toThrow();
  });
});
