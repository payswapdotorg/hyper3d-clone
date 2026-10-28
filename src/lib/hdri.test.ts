import { describe, expect, it } from "vitest";
import {
  clampSkyOverrides,
  deriveSkyParams,
  fbmPeriodic,
  hashString,
  luma,
  mulberry32,
  paletteFromPixels,
  periodicValueNoise,
  type RGB,
  type SkyParams,
} from "./hdri";

const r = (r: number, g: number, b: number): RGB => ({ r, g, b });

describe("hdri: seeded determinism", () => {
  it("the same prompt derives byte-identical params, forever", () => {
    const a = deriveSkyParams("a calm sunset over a tropical ocean");
    const b = deriveSkyParams("a calm sunset over a tropical ocean");
    expect(a).toEqual(b);
  });

  it("different prompts derive different skies", () => {
    const a = deriveSkyParams("starry night");
    const b = deriveSkyParams("bright noon");
    expect(a.sunElevation).not.toBe(b.sunElevation);
  });

  it("hashString is stable and mulberry32 reproducible", () => {
    expect(hashString("hyper3d")).toBe(hashString("hyper3d"));
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });
});

describe("hdri: keyword parsing", () => {
  it("night keywords drop the sun below the horizon and raise stars", () => {
    const p = deriveSkyParams("a starry midnight sky");
    expect(p.sunElevation).toBeLessThan(0);
    expect(p.starDensity).toBeGreaterThan(0.5);
  });

  it("a below-horizon sun without a star keyword still gets a few stars", () => {
    const p = deriveSkyParams("twilight");
    expect(p.sunElevation).toBeLessThan(0);
    expect(p.starDensity).toBeGreaterThan(0);
  });

  it("sunset keywords warm the horizon (r > b)", () => {
    const p = deriveSkyParams("sunset");
    expect(p.horizon.r).toBeGreaterThan(p.horizon.b);
  });

  it("storm keywords max out cloud coverage", () => {
    const p = deriveSkyParams("thunder storm rain");
    expect(p.cloudDensity).toBeGreaterThan(0.8);
  });

  it("clear/cloudless keywords strip the clouds", () => {
    const p = deriveSkyParams("a clear cloudless crisp morning");
    expect(p.cloudDensity).toBeLessThan(0.2);
  });

  it("alien palette applies its distinctive zenith", () => {
    const p = deriveSkyParams("an alien nebula sky");
    expect(p.zenith.b).toBeGreaterThan(p.zenith.r);
    expect(p.horizon.r).toBeGreaterThan(p.horizon.g);
  });

  it("a below-horizon sun physically deepens the palette (night is dark)", () => {
    const night = deriveSkyParams("starry midnight sky");
    const day = deriveSkyParams("bright clear noon");
    expect(luma(night.zenith)).toBeLessThan(luma(day.zenith) * 0.4);
    expect(luma(night.horizon)).toBeLessThan(luma(day.horizon));
  });

  it("slider-driven elevation below the horizon deepens the palette live, too", () => {
    const high = deriveSkyParams("clear sky", { sunElevation: 30 });
    const low = deriveSkyParams("clear sky", { sunElevation: -10 });
    expect(luma(low.zenith)).toBeLessThan(luma(high.zenith) * 0.5);
    expect(luma(low.horizon)).toBeLessThan(luma(high.horizon) * 0.7);
  });
});

describe("hdri: override handling", () => {
  it("clamps out-of-range overrides into the engine's legal ranges", () => {
    const c = clampSkyOverrides({
      sunElevation: 999,
      sunAzimuth: -50,
      cloudDensity: 2,
      starDensity: -3,
      haze: 12,
      cloudSharpness: 0.5,
    });
    expect(c.sunElevation).toBe(90);
    expect(c.sunAzimuth).toBe(310);
    expect(c.cloudDensity).toBe(1);
    expect(c.starDensity).toBe(0);
    expect(c.haze).toBe(1);
    expect(c.cloudSharpness).toBe(0.5);
  });

  it("user overrides always win over keywords", () => {
    const p = deriveSkyParams("starry night", { starDensity: 0.1 });
    expect(p.starDensity).toBe(0.1);
    const q = deriveSkyParams("clear sky", { cloudDensity: 0.7 });
    expect(q.cloudDensity).toBe(0.7);
  });

  it("every derived param lands inside its legal range", () => {
    for (const prompt of ["", "x", "golden hour storm", "cyberpunk fog night", "arctic noon clear"]) {
      const p: SkyParams = deriveSkyParams(prompt);
      expect(p.sunElevation).toBeGreaterThanOrEqual(-18);
      expect(p.sunElevation).toBeLessThanOrEqual(90);
      expect(p.sunAzimuth).toBeGreaterThanOrEqual(0);
      expect(p.sunAzimuth).toBeLessThan(360);
      for (const axis of [p.cloudDensity, p.cloudSharpness, p.starDensity, p.haze]) {
        expect(axis).toBeGreaterThanOrEqual(0);
        expect(axis).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("hdri: image palette extraction", () => {
  it("assigns brightest bucket to the sun tint and darkest to the zenith", () => {
    const samples: RGB[] = [];
    for (let i = 0; i < 60; i++) samples.push(r(250, 250, 240)); // bright cloud
    for (let i = 0; i < 40; i++) samples.push(r(140, 170, 210)); // mid sky
    for (let i = 0; i < 50; i++) samples.push(r(20, 30, 60)); // zenith blue
    const pal = paletteFromPixels(samples);
    expect(luma(pal.sunTint)).toBeGreaterThan(luma(pal.horizon));
    expect(luma(pal.horizon)).toBeGreaterThan(luma(pal.zenith));
  });

  it("degrades honestly on a single-color image (derived shades, no NaN)", () => {
    const pal = paletteFromPixels([r(100, 150, 200), r(100, 150, 200)]);
    expect(luma(pal.sunTint)).toBeGreaterThan(luma(pal.horizon));
    expect(luma(pal.zenith)).toBeLessThan(luma(pal.horizon));
  });

  it("empty input falls back to neutral gray", () => {
    const pal = paletteFromPixels([]);
    expect(pal.zenith).toEqual(pal.horizon);
  });
});

describe("hdri: seam-free periodic noise", () => {
  it("wraps in x with the stated period (no azimuth seam)", () => {
    const period = 8;
    for (const x of [0.3, 2.7, 5.1, 7.9]) {
      expect(periodicValueNoise(x, 1.3, period, 123)).toBeCloseTo(
        periodicValueNoise(x + period, 1.3, period, 123),
        10,
      );
    }
  });

  it("fbm inherits the wrap and stays in [0,1]", () => {
    for (let i = 0; i < 40; i++) {
      const x = i * 0.73;
      const v = fbmPeriodic(x, 2.1, 8, 77);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(fbmPeriodic(x, 2.1, 8, 77)).toBeCloseTo(fbmPeriodic(x + 8, 2.1, 8, 77), 10);
    }
  });
});
