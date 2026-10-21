"use client";

/**
 * Real 3D model viewer — loads the generated GLB from the export endpoint
 * (GLTFLoader + OrbitControls), with shaded/wireframe/normal material
 * modes, auto-orbit, live triangle stats and a client-side turntable
 * recorder (canvas.captureStream + MediaRecorder → WebM download — the
 * reference product's turntable.webm artifact, produced from the real
 * rendered model). This displays the exact bytes the download endpoints
 * serve.
 *
 * WebGL-safe (gate-found fix): if a WebGL context cannot be created (for
 * example in headless/software-rendered browsers), the viewer degrades to
 * the task's real rasterized poster instead of crashing the React tree.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cn } from "@/lib/utils";

export type TextureMode = "shaded" | "wireframe" | "normal";

export interface ModelViewerHandle {
  /** Record one full turntable orbit of the loaded model as a WebM blob. */
  recordTurntable: () => Promise<Blob>;
}

interface ViewerState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  model: THREE.Group | null;
  wireframeMat: THREE.MeshBasicMaterial;
  normalMat: THREE.MeshNormalMaterial;
  originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
}

export const ModelViewer = forwardRef<ModelViewerHandle, {
  url: string | null;
  textureMode: TextureMode;
  autoRotate: boolean;
  onStats?: (polys: number) => void;
  onLoaded?: (ok: boolean) => void;
  className?: string;
}>(function ModelViewer(
  {
    url,
    textureMode,
    autoRotate,
    onStats,
    onLoaded,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ViewerState | null>(null);
  const onStatsRef = useRef(onStats);
  const onLoadedRef = useRef(onLoaded);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    onStatsRef.current = onStats;
    onLoadedRef.current = onLoaded;
  }, [onStats, onLoaded]);

  /* ---------- one-time engine setup ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL context (headless / software-rendered / locked-down
      // browsers). Degrade to the poster fallback — never crash the app.
      // (One-time probe of an external system; setState here is intentional.)
      setWebglFailed(true);
      onLoadedRef.current?.(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x191420, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D model preview");
    renderer.domElement.setAttribute("role", "img");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(3.4, 2.2, 3.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.6;
    controls.maxDistance = 12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc4b5fd, 1.8);
    rim.position.set(-5, 2.5, -4.5);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0xe879f9, 0.8);
    rim2.position.set(2, -3, -5);
    scene.add(rim2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const grid = new THREE.GridHelper(16, 32, 0x3a3342, 0x262230);
    grid.position.y = -1.62;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.45;
    scene.add(grid);

    stateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      model: null,
      wireframeMat: new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true }),
      normalMat: new THREE.MeshNormalMaterial({ flatShading: true }),
      originalMaterials: new Map(),
    };

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
      const state = stateRef.current;
      if (state) {
        if (state.model) disposeModel(state.model, state.originalMaterials);
        state.wireframeMat.dispose();
        state.normalMat.dispose();
        state.controls.dispose();
        state.scene.environment?.dispose();
        state.renderer.dispose();
      }
      container.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []);

  /* ---------- (re)load the GLB whenever the URL changes ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state || !url) return;

    let cancelled = false;
    const loader = new GLTFLoader();

    const clearCurrent = () => {
      if (state.model) {
        disposeModel(state.model, state.originalMaterials);
        state.scene.remove(state.model);
        state.model = null;
        state.originalMaterials.clear();
        state.controls.target.set(0, 0, 0);
        state.controls.update();
      }
    };

    clearCurrent();
    onStatsRef.current?.(0);
    onLoadedRef.current?.(false);

    const fetchAndParse = async () => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`viewer fetch failed: ${res.status}`);
      const buffer = await res.arrayBuffer();
      return buffer;
    };

    fetchAndParse()
      .then(
        (buffer) =>
          new Promise<THREE.Group>((resolve, reject) => {
            loader.parse(
              buffer,
              "",
              (gltf) => resolve(gltf.scene as unknown as THREE.Group),
              (err) => reject(err),
            );
          }),
      )
      .then((model) => {
        if (cancelled) return;
        // Normalize into a ~2.4-unit box at the origin.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const wrapper = new THREE.Group();
        model.position.set(-center.x, -center.y, -center.z);
        wrapper.add(model);
        wrapper.scale.setScalar(2.4 / maxDim);

        // Track stats + original materials.
        let polys = 0;
        wrapper.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.geometry) {
            state.originalMaterials.set(mesh, mesh.material);
            const geo = mesh.geometry as THREE.BufferGeometry;
            polys += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
          }
        });
        applyTextureMode(wrapper, textureMode, state);
        state.scene.add(wrapper);
        state.model = wrapper;
        state.controls.target.set(0, 0.2, 0);
        state.controls.update();
        onStatsRef.current?.(Math.round(polys));
        onLoadedRef.current?.(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("[ModelViewer] failed to load model", err);
        onLoadedRef.current?.(false);
      });

    return () => {
      cancelled = true;
    };
    // textureMode intentionally excluded — material swaps happen in a separate effect.
  }, [url]);

  /* ---------- material mode swap (no reload) ---------- */
  useEffect(() => {
    const state = stateRef.current;
    if (!state || !state.model) return;
    applyTextureMode(state.model, textureMode, state);
  }, [textureMode]);

  /* ---------- auto-rotate ---------- */
  useEffect(() => {
    if (stateRef.current) stateRef.current.controls.autoRotate = autoRotate;
  }, [autoRotate]);

  /* ---------- turntable recorder (imperative handle) ---------- */
  const recordingRef = useRef(false);
  useImperativeHandle(
    ref,
    () => ({
      /**
       * Record one full turntable orbit as a WebM blob. Temporarily boosts
       * autoRotate for a ~6s orbit, captures the live canvas via
       * MediaRecorder, then restores the user's rotation settings.
       */
      recordTurntable: async (): Promise<Blob> => {
        const state = stateRef.current;
        if (!state || !state.model) throw new Error("No model loaded");
        if (recordingRef.current) throw new Error("A turntable recording is already running");
        if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported("video/webm")) {
          throw new Error("This browser cannot record WebM video");
        }
        recordingRef.current = true;
        const prevAuto = state.controls.autoRotate;
        const prevSpeed = state.controls.autoRotateSpeed;
        try {
          const canvas = state.renderer.domElement;
          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream, { mimeType: "video/webm", videoBitsPerSecond: 4_000_000 });
          const chunks: Blob[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          const stopped = new Promise<void>((resolve) => {
            recorder.onstop = () => resolve();
          });
          recorder.start(200);
          // autoRotateSpeed 2.0 = 30s/orbit → 10.0 ≈ 6s/orbit. Record a
          // hair over one full revolution so the loop reads as a turntable.
          state.controls.autoRotate = true;
          state.controls.autoRotateSpeed = 10.0;
          await new Promise((r) => setTimeout(r, 6_300));
          recorder.stop();
          stream.getTracks().forEach((t) => t.stop());
          await stopped;
          return new Blob(chunks, { type: "video/webm" });
        } finally {
          state.controls.autoRotate = prevAuto;
          state.controls.autoRotateSpeed = prevSpeed;
          recordingRef.current = false;
        }
      },
    }),
    [],
  );

  /* ---------- WebGL fallback: real poster of the generated model ---------- */
  const posterUrl = url ? url.replace(/\/export\?format=[a-z]+$/i, "/preview") : null;

  if (webglFailed) {
    return (
      <div
        className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}
        aria-label="3D viewer (static preview — WebGL unavailable)"
      >
        {posterUrl ? (
          <>
            <img
              src={posterUrl}
              alt="Rendered preview of the generated 3D model"
              className="h-full w-full object-contain"
            />
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/70">
              Interactive 3D needs WebGL — showing the real rendered preview. Exports are unaffected.
            </p>
          </>
        ) : (
          <p className="px-6 text-center text-sm text-white/50">
            WebGL is unavailable in this browser, so the interactive viewer is disabled.
            Generation and all export formats still work.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing", className)}
      aria-label="3D viewer"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_38%,rgba(133,132,255,0.13),transparent_70%)]"
        aria-hidden="true"
      />
    </div>
  );
});

function applyTextureMode(model: THREE.Object3D, mode: TextureMode, state: ViewerState): void {
  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mode === "wireframe") {
      mesh.material = state.wireframeMat;
    } else if (mode === "normal") {
      mesh.material = state.normalMat;
    } else {
      const original = state.originalMaterials.get(mesh);
      mesh.material = original ?? mesh.material;
    }
  });
}

function disposeModel(model: THREE.Object3D, originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]>): void {
  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const original = originalMaterials.get(mesh);
    const mats = original ?? mesh.material;
    for (const mat of Array.isArray(mats) ? mats : [mats]) {
      (mat as THREE.Material).dispose();
    }
    mesh.geometry?.dispose();
  });
}
