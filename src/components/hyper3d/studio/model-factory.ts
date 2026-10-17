"use client";

import * as THREE from "three";
import type { Archetype } from "@/lib/hyper3d";

/** Deterministic PRNG so the same prompt always yields the same model. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BuiltModel {
  group: THREE.Group;
  polys: number;
}

function markPolys(group: THREE.Group): number {
  let polys = 0;
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      const geo = mesh.geometry;
      polys += geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
    }
  });
  return Math.round(polys);
}

function normalize(group: THREE.Group, targetSize = 2.3) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  group.scale.setScalar(scale);
  // Re-center precisely at the origin.
  const box3 = new THREE.Box3().setFromObject(group);
  const c = new THREE.Vector3();
  box3.getCenter(c);
  group.position.set(-c.x, -c.y, -c.z);
}

/* --------------------------- archetypes --------------------------- */

function buildTorusKnot(rnd: () => number): THREE.Group {
  const group = new THREE.Group();
  const p = rnd() < 0.5 ? 2 : 3;
  const q = 3 + Math.floor(rnd() * 3);
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.85, 0.26, 160 + Math.floor(rnd() * 90), 24 + Math.floor(rnd() * 12), p, q),
  );
  knot.rotation.set(rnd() * 0.6, rnd() * Math.PI, 0);
  group.add(knot);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.03, 12, 90));
  ring.rotation.x = Math.PI / 2 + rnd() * 0.4;
  ring.rotation.y = rnd() * Math.PI;
  ring.userData.accent = true;
  group.add(ring);

  const orbs = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < orbs; i++) {
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + rnd() * 0.08, 1));
    const angle = (i / orbs) * Math.PI * 2 + rnd();
    orb.position.set(Math.cos(angle) * 1.65, (rnd() - 0.5) * 1.1, Math.sin(angle) * 1.65);
    if (rnd() < 0.4) orb.userData.accent = true;
    group.add(orb);
  }
  return group;
}

function buildIcoCluster(rnd: () => number): THREE.Group {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.95, 1));
  group.add(core);

  const count = 9 + Math.floor(rnd() * 6);
  for (let i = 0; i < count; i++) {
    const size = 0.14 + rnd() * 0.3;
    const shard = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, rnd() < 0.5 ? 0 : 1),
    );
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    const radius = 1.25 + rnd() * 0.75;
    shard.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.85,
      radius * Math.sin(phi) * Math.sin(theta),
    );
    shard.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
    if (rnd() < 0.3) shard.userData.accent = true;
    group.add(shard);
  }
  return group;
}

function buildCrystal(rnd: () => number): THREE.Group {
  const group = new THREE.Group();

  const main = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0));
  main.scale.set(1, 2.3 + rnd() * 0.5, 1);
  main.rotation.y = rnd() * Math.PI;
  group.add(main);

  const shardCount = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < shardCount; i++) {
    const h = 0.8 + rnd() * 1.4;
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + rnd() * 0.2, 0));
    shard.scale.set(1, h, 1);
    const angle = (i / shardCount) * Math.PI * 2 + rnd() * 0.8;
    const dist = 0.55 + rnd() * 0.5;
    shard.position.set(Math.cos(angle) * dist, -0.9 + rnd() * 0.35, Math.sin(angle) * dist);
    shard.rotation.set((rnd() - 0.5) * 0.5, rnd() * Math.PI, (rnd() - 0.5) * 0.5);
    if (rnd() < 0.35) shard.userData.accent = true;
    group.add(shard);
  }

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.28, 7));
  base.position.y = -1.15;
  base.userData.accent = true;
  group.add(base);
  return group;
}

function buildGearStack(rnd: () => number): THREE.Group {
  const group = new THREE.Group();

  const makeGear = (radius: number, height: number, teeth: number, accent = false) => {
    const gear = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 28));
    gear.add(disc);
    for (let i = 0; i < teeth; i++) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.16, height * 0.92, 0.2));
      const angle = (i / teeth) * Math.PI * 2;
      tooth.position.set(Math.cos(angle) * (radius + 0.06), 0, Math.sin(angle) * (radius + 0.06));
      tooth.rotation.y = -angle;
      gear.add(tooth);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, height * 1.5, 12));
    if (accent) hub.userData.accent = true;
    gear.add(hub);
    gear.rotation.x = rnd() * 0.15;
    return gear;
  };

  const layers = 3;
  let y = 0.55;
  for (let i = 0; i < layers; i++) {
    const radius = 0.95 - i * 0.22 + rnd() * 0.1;
    const gear = makeGear(radius, 0.16, 10 + Math.floor(rnd() * 5), i === 1);
    gear.position.set((rnd() - 0.5) * 0.3, y, (rnd() - 0.5) * 0.3);
    gear.rotation.y = rnd() * Math.PI;
    group.add(gear);
    y -= 0.5;
  }

  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.7, 12));
  axle.position.y = -0.15;
  axle.userData.accent = true;
  group.add(axle);
  return group;
}

const BUILDERS: Record<Archetype, (rnd: () => number) => THREE.Group> = {
  "torus-knot": buildTorusKnot,
  "ico-cluster": buildIcoCluster,
  crystal: buildCrystal,
  "gear-stack": buildGearStack,
};

export function buildModel(archetype: Archetype, seed: number): BuiltModel {
  const rnd = mulberry32(seed || 1);
  const group = BUILDERS[archetype](rnd);
  normalize(group);
  return { group, polys: markPolys(group) };
}
