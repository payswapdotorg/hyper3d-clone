"use client";

/**
 * OmniCraft HDRI Generation — the reference's flagship tool
 * (/workspace/omnicraft/hdri: "Create your own virtual world through image,
 * text and imagination") with the reference's three-step flow:
 *   1. prompt (or drop a reference image → palette extraction)
 *   2. live 360° preview (drag to look around)
 *   3. download — 2K and 4K PNG, both free in this clone
 *
 * Engine honesty: the sky is PROCEDURAL (lib/hdri.ts) — prompt keywords pin
 * time-of-day / weather / palette, a seeded PRNG fills the rest, sliders
 * always win. No AI image model is involved and nothing is uploaded.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Download, ImagePlus, RefreshCw, Sparkles } from "lucide-react";
import { ControlSection, GhostButton, SliderRow, ToolShell } from "./tool-shell";
import {
  deriveSkyParams,
  HDRI_SIZES,
  paintSky,
  paletteFromPixels,
  type RGB,
  type SkyParams,
} from "@/lib/hdri";

const SAMPLE_PROMPTS = [
  "sunset over a tropical ocean",
  "starry midnight sky",
  "cyberpunk neon skyline",
  "stormy grey morning",
  "alien nebula horizon",
];

const PREVIEW_W = 1024;
const PREVIEW_H = 512;

interface Overridable {
  sunElevation: number;
  sunAzimuth: number;
  cloudDensity: number;
  cloudSharpness: number;
  starDensity: number;
  haze: number;
}

export function HdriTool() {
  const [prompt, setPrompt] = useState("sunset over a tropical ocean");
  const [params, setParams] = useState<SkyParams>(() => deriveSkyParams("sunset over a tropical ocean"));
  const [sliders, setSliders] = useState<Partial<Overridable>>({});
  const [imagePalette, setImagePalette] = useState<{ zenith: RGB; horizon: RGB; sunTint: RGB } | null>(null);
  const [lastSource, setLastSource] = useState<"prompt" | "image">("prompt");
  const [webglFailed, setWebglFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const paramsRef = useRef<SkyParams>(params);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ---------- derive: prompt + image palette + sliders ---------- */
  const rederive = useCallback(
    (nextSliders: Partial<Overridable>, palette: { zenith: RGB; horizon: RGB; sunTint: RGB } | null) => {
      const overrides: Partial<SkyParams> = { ...nextSliders };
      if (palette) {
        overrides.zenith = palette.zenith;
        overrides.horizon = palette.horizon;
        overrides.sunTint = palette.sunTint;
      }
      setParams(deriveSkyParams(prompt, overrides));
    },
    [prompt],
  );

  const setSlider = (key: keyof Overridable) => (v: number) => {
    const next = { ...sliders, [key]: v };
    setSliders(next);
    rederive(next, imagePalette);
  };

  const generate = () => {
    setLastSource(imagePalette ? "image" : "prompt");
    rederive(sliders, imagePalette);
  };

  /* ---------- preview canvas: repaint whenever params change ---------- */
  useEffect(() => {
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = PREVIEW_W;
      canvas.height = PREVIEW_H;
      canvasRef.current = canvas;
    }
    // Keep a ref of the latest params so the one-time engine effect can
    // aim the initial camera at the sun without re-initializing on slides.
    paramsRef.current = params;
    // Paint deferred to the next tick so the first frame lands before the
    // (fast, 1024×512) procedural pass runs.
    const t = window.setTimeout(() => {
      const ctx = canvas!.getContext("2d");
      if (ctx) paintSky(ctx, params, PREVIEW_W, PREVIEW_H);
      const tex = textureRef.current;
      if (tex) tex.needsUpdate = true;
    }, 0);
    return () => window.clearTimeout(t);
  }, [params]);

  /* ---------- fallback mode: show the flat panorama ---------- */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!webglFailed || !container || !canvas) return;
    canvas.className = "h-full w-full object-contain";
    container.appendChild(canvas);
    return () => {
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [webglFailed]);

  /* ---------- 360° preview engine (one-time probe — same pattern as the
     studio's ModelViewer: setState only fires when WebGL is unavailable,
     and the effect never re-runs, so there is no feedback loop) ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // One-time external-system probe failure — flip the fallback flag on
      // the next tick so the effect body performs no synchronous setState
      // (react-hooks/set-state-in-effect: no cascading renders).
      queueMicrotask(() => setWebglFailed(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, Math.max(container.clientHeight, 1));
    renderer.setClearColor(0x0f0f12, 1);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "360° HDRI preview — drag to look around");
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100);
    // Aim the initial view AT the sun (camera sits opposite the sun
    // direction; OrbitControls look from position toward the origin), so the
    // reference's "rotate to look around" starts on the money shot.
    {
      const el = (paramsRef.current.sunElevation * Math.PI) / 180;
      const az = (paramsRef.current.sunAzimuth * Math.PI) / 180;
      const ce = Math.cos(el);
      camera.position.set(-ce * Math.cos(az) * 0.05, -Math.sin(el) * 0.05, -ce * Math.sin(az) * 0.05);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    // The paint effect (declared above) creates the canvas element before
    // this effect runs, so it is always present here.
    const source = canvasRef.current;
    if (!source) return;
    const texture = new THREE.CanvasTexture(source);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    textureRef.current = texture;

    // Canonical equirect panorama sphere (three.js webgl_panorama pattern):
    // scale(-1,1,1) inverts the sphere AND fixes the texture's u-direction —
    // a plain BackSide sphere mirrors the azimuth, which aimed the camera at
    // the wrong side of the sky (browser-verification caught it).
    const sphereGeo = new THREE.SphereGeometry(40, 64, 40);
    sphereGeo.scale(-1, 1, 1);
    const sphere = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ map: texture }));
    scene.add(sphere);

    let raf = 0;
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const resize = () => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      sphere.geometry.dispose();
      (sphere.material as THREE.Material).dispose();
      texture.dispose();
      textureRef.current = null;
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ---------- downloads ---------- */
  const download = (sizeId: string) => {
    const size = HDRI_SIZES.find((s) => s.id === sizeId) ?? HDRI_SIZES[0];
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    paintSky(ctx, params, size.width, size.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `omnicraft-hdri-${size.id}-${params.seed.toString(16)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  /* ---------- reference image → palette ---------- */
  const absorbImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const small = document.createElement("canvas");
      small.width = 64;
      small.height = 64;
      const sctx = small.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, 64, 64);
      const data = sctx.getImageData(0, 0, 64, 64).data;
      const samples: RGB[] = [];
      for (let i = 0; i < data.length; i += 4) samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      const palette = paletteFromPixels(samples);
      setImagePalette(palette);
      setLastSource("image");
      rederive(sliders, palette);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const controls = (
    <>
      <ControlSection title="From text" hint="Time-of-day, weather and palette keywords pin the sky; everything else is seeded from your exact words.">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. golden hour over a calm tropical ocean"
          aria-label="Sky prompt"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs text-white/85 placeholder:text-white/30 focus:border-violet-400/50 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1">
          {SAMPLE_PROMPTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setPrompt(s);
                setSliders({});
                setImagePalette(null);
                setParams(deriveSkyParams(s));
                setLastSource("prompt");
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-white/50 transition-colors hover:border-violet-400/40 hover:text-white/85"
            >
              {s}
            </button>
          ))}
        </div>
        <GhostButton onClick={generate} className="w-full !py-2">
          <span className="flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Generate sky
          </span>
        </GhostButton>
      </ControlSection>

      <ControlSection
        title="From image"
        hint="Drop a reference image — its dominant colors become the sky palette (real pixel analysis, in-browser)."
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f && f.type.startsWith("image/")) absorbImage(f);
          }}
          className={`flex w-full flex-col items-center gap-1 rounded-xl border border-dashed px-3 py-4 text-center transition-colors ${
            dragOver ? "border-violet-400/60 bg-violet-400/10" : "border-white/15 bg-white/[0.02] hover:border-white/30"
          }`}
        >
          <ImagePlus className="size-5 text-white/40" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-white/55">Drag an image or click to choose</span>
          <span className="text-[10px] text-white/30">colors only — the image never leaves your browser</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) absorbImage(f);
            e.target.value = "";
          }}
        />
        {imagePalette && (
          <div className="flex items-center gap-2">
            {(["zenith", "horizon", "sunTint"] as const).map((k) => (
              <span
                key={k}
                className="size-6 rounded-md border border-white/20"
                style={{ background: `rgb(${imagePalette[k].r},${imagePalette[k].g},${imagePalette[k].b})` }}
                title={`${k}: rgb(${imagePalette[k].r},${imagePalette[k].g},${imagePalette[k].b})`}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setImagePalette(null);
                rederive(sliders, null);
              }}
              className="ml-auto text-[10px] font-bold text-white/40 underline-offset-2 hover:text-white/80 hover:underline"
            >
              clear
            </button>
          </div>
        )}
      </ControlSection>

      <ControlSection title="Fine-tune" hint="Sliders override the prompt-derived values and re-render instantly.">
        <SliderRow label="Sun elevation" value={params.sunElevation} min={-18} max={90} step={1} format={(v) => `${v.toFixed(0)}°`} onChange={setSlider("sunElevation")} />
        <SliderRow label="Sun azimuth" value={params.sunAzimuth} min={0} max={360} step={1} format={(v) => `${v.toFixed(0)}°`} onChange={setSlider("sunAzimuth")} />
        <SliderRow label="Clouds" value={params.cloudDensity} min={0} max={1} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={setSlider("cloudDensity")} />
        <SliderRow label="Cloud sharpness" value={params.cloudSharpness} min={0} max={1} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={setSlider("cloudSharpness")} />
        <SliderRow label="Stars" value={params.starDensity} min={0} max={1} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={setSlider("starDensity")} />
        <SliderRow label="Haze" value={params.haze} min={0} max={1} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={setSlider("haze")} />
        <GhostButton
          onClick={() => {
            setSliders({});
            setImagePalette(null);
            setParams(deriveSkyParams(prompt));
          }}
          className="w-full"
        >
          <span className="flex items-center justify-center gap-1.5">
            <RefreshCw className="size-3" aria-hidden="true" />
            Reset to prompt
          </span>
        </GhostButton>
      </ControlSection>

      <ControlSection title="Download" hint="The reference paywalls 8K behind a subscription — both sizes are free here.">
        {HDRI_SIZES.map((s) => (
          <GhostButton key={s.id} onClick={() => download(s.id)} className="w-full">
            <span className="flex items-center justify-center gap-1.5">
              <Download className="size-3.5" aria-hidden="true" />
              {s.label} ({s.width}×{s.height})
            </span>
          </GhostButton>
        ))}
      </ControlSection>
    </>
  );

  return (
    <ToolShell
      title="HDRI Generator"
      tagline="Create your own virtual world through image, text and imagination."
      local
      badge="Procedural & free"
      controls={controls}
      viewport={
        <div className="relative h-full w-full">
          <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
          {webglFailed && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/70">
              WebGL unavailable — showing the flat panorama. Downloads are unaffected.
            </p>
          )}
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/50">
            seed {params.seed.toString(16)} · {lastSource}
          </span>
        </div>
      }
      footer={
        <>
          Honest engine note: this sky is <b>procedural</b> — your prompt pins time-of-day, weather and palette
          keywords, a seeded PRNG fills the rest (same prompt → same sky, forever), and dropped images contribute
          their real dominant colors. No AI image model is involved and nothing is uploaded. The reference&apos;s
          HDRI tool is AI-generated and gates 8K behind a subscription; this clone ships 2K and 4K PNG free.
        </>
      }
    />
  );
}
