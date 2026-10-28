import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  DEFAULT_EXTRUDE_CONTROLS,
  SAMPLE_SVG,
  extrudeGeometryOptions,
  extrudeSettingsFrom,
  looksLikeSvg,
  normalizeForExport,
} from "./vector-to-3d";
import { OMNICRAFT_TOOLS, liveOmniCraftTools, omnicraftToolBySlug, omnicraftHref, isOmnicraftSlug } from "./omnicraft";

describe("vector-to-3d: extrusion settings", () => {
  it("clamps out-of-range UI input into legal extrusion ranges", () => {
    const c = extrudeSettingsFrom({ depth: 99, bevelSize: -3, curveSegments: 1e6 });
    expect(c.depth).toBe(4);
    expect(c.bevelSize).toBe(0);
    expect(c.curveSegments).toBe(32);
  });

  it("defaults survive undefined/garbage input", () => {
    const c = extrudeSettingsFrom({ depth: Number.NaN, bevelSize: undefined, curveSegments: Number.NaN });
    expect(c).toEqual(DEFAULT_EXTRUDE_CONTROLS);
  });

  it("bevel only engages when a positive size is set", () => {
    expect(extrudeGeometryOptions({ ...DEFAULT_EXTRUDE_CONTROLS, bevelEnabled: true, bevelSize: 0 }).bevelEnabled).toBe(false);
    expect(extrudeGeometryOptions({ ...DEFAULT_EXTRUDE_CONTROLS, bevelEnabled: true, bevelSize: 0.2 }).bevelEnabled).toBe(true);
    expect(extrudeGeometryOptions({ ...DEFAULT_EXTRUDE_CONTROLS, bevelEnabled: false, bevelSize: 0.2 }).bevelEnabled).toBe(false);
  });
});

describe("vector-to-3d: export normalization", () => {
  it("centers the object and scales the largest axis to the target size, uniformly", () => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 1));
    box.position.set(10, -6, 3);
    const wrapper = normalizeForExport(box, 2);
    wrapper.updateMatrixWorld(true);
    const out = new THREE.Box3().setFromObject(wrapper);
    const size = out.getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(2, 5);
    expect(size.y).toBeCloseTo(1, 5);
    expect(size.z).toBeCloseTo(0.5, 5);
    const center = out.getCenter(new THREE.Vector3());
    expect(Math.abs(center.x)).toBeLessThan(1e-6);
    expect(Math.abs(center.y)).toBeLessThan(1e-6);
    expect(Math.abs(center.z)).toBeLessThan(1e-6);
  });

  it("degenerates safely on an empty object (scale 1, no NaN)", () => {
    const empty = new THREE.Group();
    const wrapper = normalizeForExport(empty, 2);
    expect(wrapper.scale.x).toBe(1);
    expect(Number.isFinite(wrapper.scale.x)).toBe(true);
  });
});

describe("vector-to-3d: SVG source detection", () => {
  it("accepts plain svg roots and xml-prologued sources", () => {
    expect(looksLikeSvg("<svg xmlns=\"x\"></svg>")).toBe(true);
    expect(looksLikeSvg("<?xml version=\"1.0\"?>\n<svg/>")).toBe(true);
    expect(looksLikeSvg(SAMPLE_SVG)).toBe(true);
  });

  it("rejects empty and non-SVG pastes", () => {
    expect(looksLikeSvg("")).toBe(false);
    expect(looksLikeSvg("   ")).toBe(false);
    expect(looksLikeSvg("<div>hello</div>")).toBe(false);
    expect(looksLikeSvg("M50 5 L61 38")).toBe(false);
  });
});

describe("omnicraft registry", () => {
  it("carries the reference's nine tools in the reference's order", () => {
    expect(OMNICRAFT_TOOLS.map((t) => t.name)).toEqual([
      "Texture Generator",
      "Image Enhancer",
      "Image Remix",
      "HDRI Generation",
      "Rodin Search",
      "Vector to 3D",
      "Mesh Editor",
      "Model Viewer",
      "Format Convertor",
    ]);
  });

  it("every live tool has a blurb; every stub has an honest note", () => {
    for (const t of OMNICRAFT_TOOLS) {
      expect(t.blurb.length).toBeGreaterThan(10);
      if (t.status === "not-in-clone") expect((t.note ?? "").length).toBeGreaterThan(20);
      else expect(t.note).toBeUndefined();
    }
  });

  it("slug lookup, hrefs and route guards agree", () => {
    expect(omnicraftToolBySlug("hdri")?.status).toBe("live");
    expect(omnicraftToolBySlug("nope")).toBeUndefined();
    expect(omnicraftHref("hdri")).toBe("/omnicraft/hdri");
    expect(isOmnicraftSlug("hdri")).toBe(true);
    expect(isOmnicraftSlug("bogus")).toBe(false);
  });

  it("this session ships four live tools", () => {
    expect(liveOmniCraftTools().map((t) => t.slug).sort()).toEqual(["convertor", "hdri", "vector", "viewer"]);
  });
});
