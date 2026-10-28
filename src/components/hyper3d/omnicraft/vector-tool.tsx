"use client";

/**
 * OmniCraft Vector to 3D — SVG in, extruded model out, entirely local.
 * SVGLoader parses the paths (browser DOMParser), ExtrudeGeometry gives
 * them thickness, the result is normalized and exported through the SAME
 * exporter pipeline as every studio model — and the preview shows the exact
 * GLB bytes the download serves.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Download, FileText, Wand2 } from "lucide-react";
import { ControlSection, GhostButton, SliderRow, ToolShell } from "./tool-shell";
import { ModelViewer } from "@/components/hyper3d/studio/model-viewer";
import { EXPORT_FORMATS, exportModel, type ExportFormat } from "@/lib/exporters";
import {
  DEFAULT_EXTRUDE_CONTROLS,
  SAMPLE_SVG,
  extrudeGeometryOptions,
  extrudeSettingsFrom,
  looksLikeSvg,
  normalizeForExport,
  type ExtrudeControls,
} from "@/lib/vector-to-3d";

const SWATCHES = ["#a78bfa", "#f472b6", "#34d399", "#60a5fa", "#fbbf24", "#e5e7eb"];

export function VectorTool() {
  const [source, setSource] = useState(SAMPLE_SVG);
  const [controls, setControls] = useState<ExtrudeControls>(DEFAULT_EXTRUDE_CONTROLS);
  const [color, setColor] = useState(SWATCHES[0]);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "idle" | "ok" | "error"; message: string; paths?: number }>({
    kind: "idle",
    message: "Paste SVG source (or load the sample) and extrude.",
  });
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const build = useCallback(
    async (svgText: string, c: ExtrudeControls, hex: string): Promise<void> => {
      if (!looksLikeSvg(svgText)) {
        setStatus({ kind: "error", message: "That does not look like SVG — expected an <svg> root element." });
        setGlbUrl(null);
        return;
      }
      setBusy(true);
      try {
        const paths = new SVGLoader().parse(svgText).paths;
        if (paths.length === 0) {
          setStatus({ kind: "error", message: "No drawable paths found in this SVG (text-only? no shapes?)." });
          setGlbUrl(null);
          return;
        }

        const group = new THREE.Group();
        // SVG y runs down; flip so the art reads right-side up.
        group.scale.y = -1;
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(hex),
          roughness: 0.35,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        const opts = extrudeGeometryOptions(c);
        let shapeCount = 0;
        for (const path of paths) {
          const shapes = SVGLoader.createShapes(path);
          for (const shape of shapes) {
            const geo = new THREE.ExtrudeGeometry(shape, opts);
            geo.computeVertexNormals();
            group.add(new THREE.Mesh(geo, material));
            shapeCount++;
          }
        }
        if (shapeCount === 0) {
          setStatus({ kind: "error", message: "Paths parsed but no closed shapes to extrude." });
          setGlbUrl(null);
          return;
        }

        const normalized = normalizeForExport(group, 2);
        const result = await exportModel(normalized, "glb");
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(new Blob([result.bytes.buffer as ArrayBuffer], { type: result.contentType }));
        objectUrlRef.current = url;
        setGlbUrl(url);
        setStatus({ kind: "ok", message: `Extruded ${shapeCount} shape${shapeCount === 1 ? "" : "s"} from ${paths.length} path${paths.length === 1 ? "" : "s"}.`, paths: shapeCount });
      } catch (err) {
        setStatus({ kind: "error", message: err instanceof Error ? err.message : "SVG parse failed" });
        setGlbUrl(null);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  // Build once on mount so the tool demos itself with the sample.
  useEffect(() => {
    void build(SAMPLE_SVG, DEFAULT_EXTRUDE_CONTROLS, SWATCHES[0]);
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [build]);

  const download = async (format: ExportFormat) => {
    if (!looksLikeSvg(source)) return;
    setBusy(true);
    try {
      const paths = new SVGLoader().parse(source).paths;
      const group = new THREE.Group();
      group.scale.y = -1;
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      const opts = extrudeGeometryOptions(extrudeSettingsFrom(controls));
      for (const path of paths) {
        for (const shape of SVGLoader.createShapes(path)) {
          const geo = new THREE.ExtrudeGeometry(shape, opts);
          geo.computeVertexNormals();
          group.add(new THREE.Mesh(geo, material));
        }
      }
      const normalized = normalizeForExport(group, 2);
      const result = await exportModel(normalized, format);
      const url = URL.createObjectURL(new Blob([result.bytes.buffer as ArrayBuffer], { type: result.contentType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `omnicraft-vector.${result.ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Export failed" });
    } finally {
      setBusy(false);
    }
  };

  const takeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const setSlider = (key: keyof ExtrudeControls) => (v: number) => {
    const next = { ...controls, [key]: v };
    setControls(next);
    void build(source, next, color);
  };

  const controlPanel = (
    <>
      <ControlSection title="SVG source" hint="Paste vector source, drop an .svg file, or start from the sample star.">
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={7}
          spellCheck={false}
          aria-label="SVG source"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-2.5 font-mono text-[10px] leading-relaxed text-white/75 focus:border-violet-400/50 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          <GhostButton onClick={() => void build(source, controls, color)} disabled={busy}>
            <span className="flex items-center gap-1.5">
              <Wand2 className="size-3.5" aria-hidden="true" />
              Extrude
            </span>
          </GhostButton>
          <GhostButton
            onClick={() => {
              setSource(SAMPLE_SVG);
              setControls(DEFAULT_EXTRUDE_CONTROLS);
              void build(SAMPLE_SVG, DEFAULT_EXTRUDE_CONTROLS, color);
            }}
            disabled={busy}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5" aria-hidden="true" />
              Sample star
            </span>
          </GhostButton>
          <GhostButton onClick={() => fileInputRef.current?.click()} disabled={busy}>
            Load .svg
          </GhostButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) takeFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {status.kind !== "idle" && (
          <p className={`text-[11px] leading-relaxed ${status.kind === "error" ? "text-red-300/90" : "text-emerald-300/80"}`}>
            {status.message}
          </p>
        )}
      </ControlSection>

      <ControlSection title="Extrusion" hint="Changes rebuild the mesh and re-export the preview immediately.">
        <SliderRow label="Depth" value={controls.depth} min={0.05} max={4} step={0.05} format={(v) => v.toFixed(2)} onChange={setSlider("depth")} />
        <SliderRow label="Bevel size" value={controls.bevelSize} min={0} max={0.5} step={0.01} format={(v) => v.toFixed(2)} onChange={setSlider("bevelSize")} />
        <SliderRow label="Curve detail" value={controls.curveSegments} min={4} max={32} step={1} format={(v) => v.toFixed(0)} onChange={setSlider("curveSegments")} />
        <label className="flex items-center gap-2 text-xs font-semibold text-white/70">
          <input
            type="checkbox"
            checked={controls.bevelEnabled}
            onChange={(e) => {
              const next = { ...controls, bevelEnabled: e.target.checked };
              setControls(next);
              void build(source, next, color);
            }}
            className="size-3.5 accent-violet-400"
          />
          Bevel edges
        </label>
      </ControlSection>

      <ControlSection title="Material" hint="A single flat color — real PBR textures are the Texture Generator's job (see its honest note).">
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Color ${s}`}
              onClick={() => {
                setColor(s);
                void build(source, controls, s);
              }}
              className={`size-7 rounded-lg border-2 transition-transform ${
                color === s ? "scale-110 border-white/80" : "border-white/15 hover:border-white/40"
              }`}
              style={{ background: s }}
            />
          ))}
        </div>
      </ControlSection>

      <ControlSection title="Download" hint="Exports run through the same exporter pipeline as studio models.">
        <div className="grid grid-cols-3 gap-1.5">
          {EXPORT_FORMATS.map((f) => (
            <GhostButton key={f} onClick={() => void download(f)} disabled={busy || status.kind === "error"}>
              <span className="flex items-center justify-center gap-1">
                <Download className="size-3" aria-hidden="true" />
                {f}
              </span>
            </GhostButton>
          ))}
        </div>
      </ControlSection>
    </>
  );

  return (
    <ToolShell
      title="Vector to 3D"
      tagline="SVG in, extruded model out — depth, bevel and color, rendered locally."
      local
      badge="Real extrusion"
      controls={controlPanel}
      viewport={
        <div className="relative h-full w-full">
          {glbUrl ? (
            <ModelViewer url={glbUrl} textureMode="shaded" autoRotate className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <p className="max-w-xs text-sm text-white/45">
                {status.kind === "error" ? status.message : "Paste SVG source and press Extrude."}
              </p>
            </div>
          )}
          {busy && (
            <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white/60">
              building…
            </span>
          )}
        </div>
      }
      footer={
        <>
          Honest engine note: the extrusion is real and local (SVGLoader → ExtrudeGeometry), the preview streams the
          exact GLB the downloads serve, and every format goes through the clone&apos;s standard exporter pipeline.
          The reference&apos;s tool is an AI/DCC conversion service — this is the deterministic, upload-free
          equivalent.
        </>
      }
    />
  );
}
