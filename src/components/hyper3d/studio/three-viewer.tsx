"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildModel } from "./model-factory";
import type { Archetype } from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

export type TextureMode = "shaded" | "wireframe" | "normal";

interface ViewerMaterials {
  shaded: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  wireframe: THREE.MeshBasicMaterial;
  normal: THREE.MeshNormalMaterial;
}

function applyMaterial(group: THREE.Group, mode: TextureMode, mats: ViewerMaterials) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      if (mode === "shaded") {
        mesh.material = mesh.userData.accent ? mats.accent : mats.shaded;
      } else if (mode === "wireframe") {
        mesh.material = mats.wireframe;
      } else {
        mesh.material = mats.normal;
      }
    }
  });
}

/**
 * Procedural three.js model viewer — purple studio lighting, drag-orbit,
 * auto-rotate, and Shaded / Wireframe / Normal material modes.
 */
export function ThreeViewer({
  archetype,
  seed,
  textureMode,
  autoRotate,
  onStats,
  className,
}: {
  archetype: Archetype;
  seed: number;
  textureMode: TextureMode;
  autoRotate: boolean;
  onStats?: (polys: number) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Engine refs (populated once on mount — effects run in declaration order)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<ViewerMaterials | null>(null);
  const onStatsRef = useRef(onStats);

  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  /* ---------- one-time engine setup ---------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D model preview");
    renderer.domElement.setAttribute("role", "img");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(3.4, 2.2, 3.8);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.2;
    controls.maxDistance = 9;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    // Environment (soft studio reflections)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Key + purple rim + fill
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8584ff, 2.1);
    rim.position.set(-5, 2.5, -4.5);
    scene.add(rim);
    const rim2 = new THREE.DirectionalLight(0xbe34ff, 0.9);
    rim2.position.set(2, -3, -5);
    scene.add(rim2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // Studio grid floor
    const grid = new THREE.GridHelper(16, 32, 0x3a3439, 0x232329);
    grid.position.y = -1.62;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.55;
    scene.add(grid);

    materialsRef.current = {
      shaded: new THREE.MeshStandardMaterial({
        color: 0xb9a7f5,
        metalness: 0.6,
        roughness: 0.3,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: 0xffd176,
        metalness: 0.95,
        roughness: 0.22,
      }),
      wireframe: new THREE.MeshBasicMaterial({ color: 0x916af0, wireframe: true }),
      normal: new THREE.MeshNormalMaterial({ flatShading: true }),
    };

    rendererRef.current = renderer;
    sceneRef.current = scene;
    controlsRef.current = controls;

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
      if (modelRef.current) {
        modelRef.current.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) mesh.geometry.dispose();
        });
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
      const mats = materialsRef.current;
      if (mats) {
        mats.shaded.dispose();
        mats.accent.dispose();
        mats.wireframe.dispose();
        mats.normal.dispose();
      }
      scene.environment?.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  /* ---------- (re)build the procedural model ---------- */
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const mats = materialsRef.current;
    if (!mats) return;

    if (modelRef.current) {
      modelRef.current.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      scene.remove(modelRef.current);
      modelRef.current = null;
    }

    const { group, polys } = buildModel(archetype, seed);
    applyMaterial(group, textureMode, mats);
    scene.add(group);
    modelRef.current = group;
    onStatsRef.current?.(polys);
  }, [archetype, seed]);

  /* ---------- material mode swap (no rebuild) ---------- */
  useEffect(() => {
    if (modelRef.current && materialsRef.current) {
      applyMaterial(modelRef.current, textureMode, materialsRef.current);
    }
  }, [textureMode]);

  /* ---------- auto-rotate ---------- */
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing",
        className,
      )}
      aria-label="3D viewer"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_38%,rgba(133,132,255,0.13),transparent_70%)]"
        aria-hidden="true"
      />
    </div>
  );
}
