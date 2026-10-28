"use client";

/**
 * OmniCraft Model Viewer — the reference's local inspection tool. Drop any
 * GLB/GLTF (file or URL) and inspect it with the studio's real viewer
 * (orbit, material modes, turntable stats). The file never leaves the
 * browser: it is read as an object URL and parsed locally.
 */
import { useRef, useState } from "react";
import { Box, Link2, UploadCloud } from "lucide-react";
import { ControlSection, GhostButton, ToolShell } from "./tool-shell";
import { ModelViewer } from "@/components/hyper3d/studio/model-viewer";

export function ViewerTool() {
  const [source, setSource] = useState<{ url: string; name: string; kind: "file" | "remote" } | null>(null);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [polys, setPolys] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const setSourceUrl = (url: string, name: string, kind: "file" | "remote") => {
    if (objectUrlRef.current && source?.url !== url) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (kind === "file") objectUrlRef.current = url;
    setSource({ url, name, kind });
    setLoadError(false);
    setPolys(0);
  };

  const takeFile = (file: File) => {
    const isGlb = file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf");
    if (!isGlb) {
      setLoadError(true);
      return;
    }
    const url = URL.createObjectURL(file);
    setSourceUrl(url, file.name, "file");
  };

  const controls = (
    <>
      <ControlSection
        title="Open a model"
        hint="GLB or GLTF — parsed locally, never uploaded. OBJ/STL/FBX: generate or import via the studio first, then use the Format Convertor."
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
            if (f) takeFile(f);
          }}
          className={`flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed px-3 py-8 text-center transition-colors ${
            dragOver ? "border-violet-400/60 bg-violet-400/10" : "border-white/15 bg-white/[0.02] hover:border-white/30"
          }`}
        >
          <UploadCloud className="size-7 text-white/40" aria-hidden="true" />
          <span className="text-xs font-bold text-white/65">Drop a .glb / .gltf here</span>
          <span className="text-[10px] text-white/35">or click to browse — stays on your machine</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) takeFile(f);
            e.target.value = "";
          }}
        />
      </ControlSection>

      <ControlSection title="From a URL" hint="Any CORS-readable GLB URL — e.g. this clone's own export endpoints.">
        <div className="flex gap-1.5">
          <input
            type="url"
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
            placeholder="https://…/model.glb"
            aria-label="Remote GLB URL"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/85 placeholder:text-white/30 focus:border-violet-400/50 focus:outline-none"
          />
          <GhostButton
            onClick={() => {
              const u = remoteUrl.trim();
              if (u) setSourceUrl(u, u.split("/").pop() || "remote model", "remote");
            }}
          >
            <span className="flex items-center gap-1">
              <Link2 className="size-3.5" aria-hidden="true" />
              Load
            </span>
          </GhostButton>
        </div>
      </ControlSection>

      {source && (
        <ControlSection title="Loaded">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
            <p className="truncate font-bold text-white/80" title={source.name}>
              {source.name}
            </p>
            <p className="mt-1 font-mono text-[10px] text-white/45">
              {source.kind === "file" ? "local file · object URL" : "remote URL"} ·{" "}
              {loadError ? "failed to parse" : `${polys.toLocaleString()} triangles`}
            </p>
            {loadError && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-red-300/80">
                Could not parse this as GLB/GLTF — check the file, or its CORS headers if remote.
              </p>
            )}
            <GhostButton
              className="mt-2 w-full"
              onClick={() => {
                if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
                setSource(null);
                setPolys(0);
                setLoadError(false);
              }}
            >
              Close model
            </GhostButton>
          </div>
        </ControlSection>
      )}
    </>
  );

  return (
    <ToolShell
      title="Model Viewer"
      tagline="Inspect any GLB/GLTF locally — orbit, material modes, live triangle count."
      local
      badge="No upload"
      controls={controls}
      viewport={
        <div className="relative h-full w-full">
          {source ? (
            <ModelViewer
              key={source.url}
              url={source.url}
              textureMode="shaded"
              autoRotate
              onStats={(p) => setPolys(p)}
              onLoaded={(ok) => setLoadError(!ok)}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="max-w-xs text-center">
                <Box className="mx-auto size-10 text-white/20" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-white/60">Nothing loaded yet</p>
                <p className="mt-1 text-xs leading-relaxed text-white/40">
                  Drop a GLB on the left, or paste a URL. The model renders in your browser and never touches a
                  server.
                </p>
              </div>
            </div>
          )}
        </div>
      }
      footer={
        <>
          Honest engine note: this is the studio&apos;s real viewer (GLTFLoader + OrbitControls, shaded/wireframe/
          normal material modes, WebGL-gated with poster fallback) pointed at a local object URL or remote URL of
          your choosing. The reference&apos;s viewer additionally accepts DCC formats — for those, generate or
          import via the studio and use the Format Convertor.
        </>
      }
    />
  );
}
