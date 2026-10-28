/**
 * OmniCraft HDRI engine — prompt-seeded procedural skyboxes.
 *
 * Honesty contract (DECISIONS.md #34 ethos): the reference's HDRI tool is an
 * AI image generator; this clone has no image-generation backend, so this
 * engine is 100% procedural and local — the prompt is parsed for time-of-day,
 * weather and palette keywords, every unparsed axis is filled by a seeded PRNG
 * (same prompt → same sky, forever), and the user's sliders always win.
 * The equirectangular PNG this produces is a real usable HDRI source for
 * environment lighting (horizon-crossing gradient + sun disc + clouds), it is
 * simply not "AI" — and the tool says so.
 *
 * Pure module: no DOM, no three.js. paintSky() only touches the 2D context it
 * is handed, so tests can drive it with a stub.
 */

/* ------------------------------ tiny color kit ------------------------------ */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));
const clamp255 = (v: number): number => clamp(Math.round(v), 0, 255);

function rgb(r: number, g: number, b: number): RGB {
  return { r: clamp255(r), g: clamp255(g), b: clamp255(b) };
}

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return rgb(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return lerpRGB(a, b, clamp(t, 0, 1));
}

/** Uniform brightness scale (twilight/night deepening). */
function scaleRGB(c: RGB, f: number): RGB {
  return rgb(c.r * f, c.g * f, c.b * f);
}

/** Perceived luma (Rec. 601) — used for palette bucket assignment. */
export function luma(c: RGB): number {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

/* ------------------------------ seeded random ------------------------------ */

/** FNV-1a 32-bit string hash — stable across sessions/runtimes. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, well-distributed seeded PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------ sky params ------------------------------ */

export interface SkyParams {
  /** Sun elevation in degrees. Negative → below the horizon (twilight/night). [-18, 90] */
  sunElevation: number;
  /** Sun azimuth in degrees. [0, 360) */
  sunAzimuth: number;
  /** Cloud coverage fraction. [0, 1] */
  cloudDensity: number;
  /** Cloud edge contrast: 0 = soft diffuse, 1 = hard defined. [0, 1] */
  cloudSharpness: number;
  /** Star coverage (visible only when the sun is below the horizon). [0, 1] */
  starDensity: number;
  /** Horizon haze/bloom strength. [0, 1] */
  haze: number;
  /** Sky gradient colors. */
  zenith: RGB;
  horizon: RGB;
  sunTint: RGB;
  /** Stable seed for noise + stars (from the prompt hash). */
  seed: number;
}

/* keyword tables — English, matching the clone's UI language */

type Rule = { words: string[]; apply: Partial<Pick<SkyParams, "sunElevation" | "sunAzimuth" | "cloudDensity" | "starDensity" | "haze" | "zenith" | "horizon" | "sunTint">> };

const TIME_RULES: Rule[] = [
  {
    words: ["night", "midnight", "starry", "stars", "moonlit", "moon", "nocturnal"],
    apply: { sunElevation: -12, starDensity: 0.9 },
  },
  { words: ["twilight", "blue hour"], apply: { sunElevation: -5, starDensity: 0.35 } },
  {
    words: ["sunset", "dusk", "golden hour", "evening", "sundown"],
    apply: { sunElevation: 5, horizon: rgb(255, 140, 66), sunTint: rgb(255, 196, 120) },
  },
  {
    words: ["sunrise", "dawn", "daybreak", "morning"],
    apply: { sunElevation: 9, horizon: rgb(255, 168, 143), sunTint: rgb(255, 216, 186) },
  },
  { words: ["noon", "midday", "zenith sun"], apply: { sunElevation: 62 } },
];

const WEATHER_RULES: Rule[] = [
  {
    words: ["storm", "thunder", "rain", "rainy", "downpour", "tempest"],
    apply: {
      cloudDensity: 0.92,
      haze: 0.5,
      cloudSharpness: 0.72,
      // storm skies are desaturated steel greys, not blue-with-holes
      zenith: rgb(50, 54, 62),
      horizon: rgb(148, 153, 163),
    },
  },
  {
    words: ["overcast", "grey sky", "gray sky", "gloomy"],
    apply: { cloudDensity: 0.82, zenith: rgb(94, 99, 108), horizon: rgb(176, 180, 188) },
  },
  { words: ["cloudy", "partly cloudy", "scattered clouds"], apply: { cloudDensity: 0.55 } },
  { words: ["fog", "foggy", "mist", "misty", "hazy"], apply: { haze: 0.85, cloudDensity: 0.4 } },
  { words: ["clear", "cloudless", "blue sky", "crisp"], apply: { cloudDensity: 0.1 } },
];

interface PaletteRule {
  words: string[];
  zenith: RGB;
  horizon: RGB;
  sunTint: RGB;
}

type Palette = Pick<PaletteRule, "zenith" | "horizon" | "sunTint">;

const PALETTE_RULES: PaletteRule[] = [
  { words: ["alien", "nebula", "space", "cosmic", "galaxy", "surreal"], zenith: rgb(14, 8, 34), horizon: rgb(122, 62, 198), sunTint: rgb(160, 255, 236) },
  { words: ["cyberpunk", "neon", "synthwave", "vaporwave"], zenith: rgb(10, 6, 30), horizon: rgb(255, 72, 182), sunTint: rgb(94, 234, 255) },
  { words: ["tropical", "beach", "summer", "paradise", "island"], zenith: rgb(24, 108, 214), horizon: rgb(158, 224, 255), sunTint: rgb(255, 250, 214) },
  { words: ["winter", "snow", "arctic", "ice", "frozen", "polar"], zenith: rgb(96, 138, 186), horizon: rgb(224, 240, 252), sunTint: rgb(255, 252, 245) },
  { words: ["desert", "sahara", "dune", "sand", "arid"], zenith: rgb(58, 116, 190), horizon: rgb(240, 196, 130), sunTint: rgb(255, 226, 160) },
  { words: ["volcanic", "apocalyptic", "ember", "hell", "inferno", "lava"], zenith: rgb(26, 10, 12), horizon: rgb(210, 62, 32), sunTint: rgb(255, 122, 40) },
  { words: ["forest", "jungle", "woodland"], zenith: rgb(30, 92, 120), horizon: rgb(178, 216, 168), sunTint: rgb(255, 244, 190) },
  { words: ["ocean", "sea", "marine", "coastal"], zenith: rgb(16, 84, 168), horizon: rgb(148, 214, 232), sunTint: rgb(255, 246, 208) },
  { words: ["mars", "martian", "rust", "dusty"], zenith: rgb(72, 38, 30), horizon: rgb(214, 122, 74), sunTint: rgb(255, 190, 150) },
];

function firstMatch(rules: Rule[], prompt: string): Partial<Rule["apply"]> {
  for (const rule of rules) {
    if (rule.words.some((w) => prompt.includes(w))) return rule.apply;
  }
  return {};
}

/** Clamp user overrides (sliders) into the engine's legal ranges. */
export function clampSkyOverrides(o: Partial<SkyParams>): Partial<SkyParams> {
  const out: Partial<SkyParams> = { ...o };
  if (typeof o.sunElevation === "number") out.sunElevation = clamp(o.sunElevation, -18, 90);
  if (typeof o.sunAzimuth === "number") out.sunAzimuth = ((o.sunAzimuth % 360) + 360) % 360;
  if (typeof o.cloudDensity === "number") out.cloudDensity = clamp(o.cloudDensity, 0, 1);
  if (typeof o.cloudSharpness === "number") out.cloudSharpness = clamp(o.cloudSharpness, 0, 1);
  if (typeof o.starDensity === "number") out.starDensity = clamp(o.starDensity, 0, 1);
  if (typeof o.haze === "number") out.haze = clamp(o.haze, 0, 1);
  return out;
}

const DEFAULT_PALETTE: Palette = {
  zenith: rgb(28, 62, 138),
  horizon: rgb(186, 220, 246),
  sunTint: rgb(255, 244, 214),
};

/**
 * Derive a full sky from a prompt. Deterministic: the same prompt yields the
 * same params forever (seeded PRNG fills every axis no keyword pinned).
 * Overrides (user sliders) are clamped and applied last — they always win.
 */
export function deriveSkyParams(prompt: string, overrides: Partial<SkyParams> = {}): SkyParams {
  const p = prompt.trim().toLowerCase();
  const seed = hashString(p || "empty sky");
  const rng = mulberry32(seed);

  const time = firstMatch(TIME_RULES, p);
  const weather = firstMatch(WEATHER_RULES, p);
  const palette: Palette = PALETTE_RULES.find((r) => r.words.some((w) => p.includes(w))) ?? DEFAULT_PALETTE;

  // Seeded defaults, then keyword layers, then clamped user overrides.
  const merged: SkyParams = {
    sunElevation: clamp(38 + (rng() - 0.5) * 14, -18, 90),
    sunAzimuth: rng() * 360,
    cloudDensity: clamp(0.3 + (rng() - 0.5) * 0.3, 0, 1),
    cloudSharpness: clamp(0.45 + (rng() - 0.5) * 0.4, 0, 1),
    starDensity: 0,
    haze: clamp(0.18 + rng() * 0.22, 0, 1),
    zenith: palette.zenith,
    horizon: palette.horizon,
    sunTint: palette.sunTint,
    seed,
  };

  // Night default: if the sun ends up below the horizon without an explicit
  // star keyword, still show a few stars — a starless twilight looks broken.
  Object.assign(merged, time, weather);

  const clamped = clampSkyOverrides(overrides);
  Object.assign(merged, clamped);

  if (merged.sunElevation < 0 && merged.starDensity === 0) merged.starDensity = 0.25;
  merged.sunElevation = clamp(merged.sunElevation, -18, 90);
  merged.sunAzimuth = ((merged.sunAzimuth % 360) + 360) % 360;
  merged.cloudDensity = clamp(merged.cloudDensity, 0, 1);
  merged.cloudSharpness = clamp(merged.cloudSharpness, 0, 1);
  merged.starDensity = clamp(merged.starDensity, 0, 1);
  merged.haze = clamp(merged.haze, 0, 1);

  // Physical deepening: a daytime-bright gradient under a below-horizon sun
  // reads as broken (VLM verification caught exactly that), so the palette
  // darkens with depth below the horizon — zenith strongly, horizon only
  // partially (twilight keeps its glow band). Runs AFTER overrides so slider
  // elevation drives it live; image palettes get the same physics.
  if (merged.sunElevation < 2) {
    const t = clamp((2 - merged.sunElevation) / 14, 0, 1); // 0 at +2°, 1 at −12°
    merged.zenith = scaleRGB(merged.zenith, 1 - 0.8 * t);
    merged.horizon = scaleRGB(merged.horizon, 1 - 0.55 * t);
  }
  return merged;
}

/* ------------------------------ image palette ------------------------------ */

/**
 * Extract a sky palette from image pixel samples (the browser side
 * down-samples the uploaded reference image to ≤ 4096 px and hands the raw
 * samples over). Buckets colors at 4 bits/channel, takes the three most
 * populous distinct buckets, and assigns by luma: brightest → sunTint,
 * mid → horizon, darkest → zenith. This is real image analysis, not "AI".
 */
export function paletteFromPixels(samples: RGB[]): { zenith: RGB; horizon: RGB; sunTint: RGB } {
  if (samples.length === 0) {
    const g = rgb(128, 128, 128);
    return { zenith: g, horizon: g, sunTint: g };
  }

  const buckets = new Map<number, { count: number; sum: RGB }>();
  for (const s of samples) {
    const key = ((s.r >> 4) << 8) | ((s.g >> 4) << 4) | (s.b >> 4);
    const cur = buckets.get(key);
    if (cur) {
      cur.count++;
      cur.sum.r += s.r;
      cur.sum.g += s.g;
      cur.sum.b += s.b;
    } else {
      buckets.set(key, { count: 1, sum: { r: s.r, g: s.g, b: s.b } });
    }
  }

  const ranked = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((b) => rgb(b.sum.r / b.count, b.sum.g / b.count, b.sum.b / b.count))
    .sort((a, b) => luma(a) - luma(b));

  if (ranked.length === 3) return { zenith: ranked[0], horizon: ranked[1], sunTint: ranked[2] };
  if (ranked.length === 2) return { zenith: ranked[0], horizon: ranked[1], sunTint: mixRGB(ranked[1], rgb(255, 255, 255), 0.35) };
  const only = ranked[0];
  return {
    zenith: mixRGB(only, rgb(0, 0, 0), 0.45),
    horizon: only,
    sunTint: mixRGB(only, rgb(255, 255, 255), 0.4),
  };
}

/* ------------------------------ periodic noise ------------------------------ */

function latticeHash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ seed;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

/**
 * Value noise on a lattice that wraps in x with `periodX` — sampling an
 * equirect map with (x = u * periodX, y = v * scale) yields clouds with no
 * visible seam at the azimuth wrap.
 */
export function periodicValueNoise(x: number, y: number, periodX: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const p = Math.max(1, Math.round(periodX));
  const wrap = (v: number): number => ((v % p) + p) % p;
  const v00 = latticeHash(wrap(x0), y0, seed);
  const v10 = latticeHash(wrap(x0 + 1), y0, seed);
  const v01 = latticeHash(wrap(x0), y0 + 1, seed);
  const v11 = latticeHash(wrap(x0 + 1), y0 + 1, seed);
  const a = v00 + (v10 - v00) * fx;
  const b = v01 + (v11 - v01) * fx;
  return a + (b - a) * fy;
}

/** 4-octave fbm built on the seam-free periodic noise. */
export function fbmPeriodic(x: number, y: number, periodX: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let freq = 1;
  for (let o = 0; o < 4; o++) {
    sum += amp * periodicValueNoise(x * freq, y * freq, periodX * freq, seed + o * 101);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/* ------------------------------ sky painter ------------------------------ */

function dirFromEquirect(u: number, v: number): { x: number; y: number; z: number } {
  const az = u * Math.PI * 2;
  const el = (0.5 - v) * Math.PI;
  const ce = Math.cos(el);
  return { x: ce * Math.cos(az), y: Math.sin(el), z: ce * Math.sin(az) };
}

const smoothstep = (lo: number, hi: number, x: number): number => {
  const t = clamp((x - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Paint an equirectangular sky onto a 2D context (w × h, ideally 2:1).
 * Deterministic from params — the same params always paint the same pixels.
 * Only touches the passed context; safe for tests with a stub.
 */
export function paintSky(ctx: CanvasRenderingContext2D, params: SkyParams, w: number, h: number): void {
  const img = ctx.createImageData(w, h);
  const data = img.data;

  const sunEl = (params.sunElevation * Math.PI) / 180;
  const sunAz = (params.sunAzimuth * Math.PI) / 180;
  const cs = Math.cos(sunEl);
  const sun = { x: cs * Math.cos(sunAz), y: Math.sin(sunEl), z: cs * Math.sin(sunAz) };

  // Sun visibility fades through the horizon so night is dark, twilight glows.
  const sunStrength = smoothstep(-9, 4, params.sunElevation);
  const ground = mixRGB(params.horizon, rgb(8, 9, 14), 0.72);
  const noiseScaleX = 12; // cloud lattice cells around the equator
  const noiseScaleY = 6;

  // Calibrated against the measured fbm distribution (median 0.512, p90
  // 0.685): this mapping makes cloudDensity track the real pixel share.
  const cloudThresh = 0.75 - 0.48 * params.cloudDensity;
  const cloudBand = clamp(0.42 - params.cloudSharpness * 0.3, 0.08, 0.42);

  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      const d = dirFromEquirect(u, v);
      const dotSun = d.x * sun.x + d.y * sun.y + d.z * sun.z;
      const angSun = Math.acos(clamp(dotSun, -1, 1));

      // --- base gradient ---
      let c: RGB;
      if (v <= 0.5) {
        const t = Math.pow(v / 0.5, 0.78);
        c = lerpRGB(params.zenith, params.horizon, t);
      } else {
        const t = (v - 0.5) / 0.5;
        c = lerpRGB(params.horizon, ground, Math.pow(t, 0.65));
      }

      // --- sun disc + glow ---
      const glow = Math.exp(-Math.pow(angSun / 0.19, 2));
      const core = 1 - smoothstep(0.012, 0.02, angSun);
      const sunAmt = sunStrength * (core * 1.0 + glow * 0.5);
      if (sunAmt > 0.002) {
        c = mixRGB(c, params.sunTint, sunAmt);
        // warm wash on the sun-facing sky
        c = lerpRGB(c, params.sunTint, sunStrength * glow * 0.26);
      }

      // --- clouds (upper hemisphere, fading below the horizon) ---
      if (params.cloudDensity > 0.01 && v < 0.62) {
        const n = fbmPeriodic(u * noiseScaleX, v * noiseScaleY * 2, noiseScaleX, params.seed);
        let cover = smoothstep(cloudThresh, cloudThresh + cloudBand, n);
        cover *= smoothstep(0.62, 0.47, v); // fade out under the horizon line
        if (cover > 0.003) {
          const lit = Math.exp(-Math.pow(angSun / 0.7, 2)) * sunStrength;
          // Small-scale density variation keeps VISIBLE formations at high
          // coverage — without it, overcast renders as a flat grey wash
          // (browser-verification caught exactly that).
          const n2 = fbmPeriodic(
            u * noiseScaleX * 2.5 + 7.3,
            v * noiseScaleY * 5 + 3.1,
            noiseScaleX * 2.5,
            params.seed + 977,
          );
          const cloudCol = mixRGB(rgb(236, 240, 246), params.sunTint, lit * 0.55);
          const shade = (0.6 + 0.4 * n2) * (v < 0.5 ? 1 - (0.5 - v) * 0.22 : 1);
          const shaded = rgb(cloudCol.r * shade, cloudCol.g * shade, cloudCol.b * shade);
          c = mixRGB(c, shaded, cover * 0.95);
        }
      }

      // --- horizon haze ---
      if (params.haze > 0.003) {
        const band = Math.exp(-Math.pow((v - 0.5) / 0.045, 2));
        const hazeCol = mixRGB(params.horizon, params.sunTint, sunStrength * 0.4);
        c = mixRGB(c, hazeCol, params.haze * band * 0.55);
      }

      const idx = (y * w + x) * 4;
      data[idx] = clamp255(c.r);
      data[idx + 1] = clamp255(c.g);
      data[idx + 2] = clamp255(c.b);
      data[idx + 3] = 255;
    }
  }

  // --- stars (only when the sun is meaningfully below the horizon) ---
  if (params.starDensity > 0.01 && params.sunElevation < 1) {
    const nightFall = smoothstep(1, -8, params.sunElevation); // deeper night → fuller stars
    const count = Math.floor(params.starDensity * nightFall * 1600);
    const rng = mulberry32(params.seed ^ 0x5eed1234);
    for (let i = 0; i < count; i++) {
      const su = rng();
      const sv = Math.pow(rng(), 1.35) * 0.5; // upper hemisphere, denser near zenith
      const sx = Math.floor(su * w);
      const sy = Math.floor(sv * h);
      const bright = 0.35 + rng() * 0.65;
      // Size variety: most stars are single pixels; ~1 in 6 gets a soft
      // 3×3 halo so the field reads as points, not a grid of squares.
      const wide = rng() < 0.17;
      const starCol = mixRGB(rgb(255, 255, 255), params.sunTint, 0.25);
      const splat = (px: number, py: number, wgt: number) => {
        const idx = (py * w + px) * 4;
        data[idx] = clamp255(data[idx] + starCol.r * bright * wgt);
        data[idx + 1] = clamp255(data[idx + 1] + starCol.g * bright * wgt);
        data[idx + 2] = clamp255(data[idx + 2] + starCol.b * bright * wgt);
      };
      const px = ((sx % w) + w) % w;
      const py = clamp(sy, 0, h - 1);
      splat(px, py, 1);
      if (wide) {
        splat((px + 1) % w, py, 0.18);
        splat((px - 1 + w) % w, py, 0.18);
        splat(px, clamp(py + 1, 0, h - 1), 0.18);
        splat(px, clamp(py - 1, 0, h - 1), 0.18);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}

/** Canonical export sizes (the reference paywalls 8K; this clone ships both free). */
export const HDRI_SIZES = [
  { id: "2k", label: "2K PNG", width: 2048, height: 1024 },
  { id: "4k", label: "4K PNG", width: 4096, height: 2048 },
] as const;

export type HdriSizeId = (typeof HDRI_SIZES)[number]["id"];
