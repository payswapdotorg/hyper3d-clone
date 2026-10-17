"use client";

import { Box, Cuboid, Grid3x3, Layers } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "../smart-image";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";

const CONTROLS = [
  {
    icon: Box,
    title: "Bounding Box",
    desc: "Block out the silhouette first — Rodin fills in believable detail inside your volumes.",
  },
  {
    icon: Grid3x3,
    title: "Voxel",
    desc: "Coarse volumetric structure that keeps proportion and mass exactly where you want it.",
  },
  {
    icon: Layers,
    title: "PointCloud",
    desc: "From sparse points to full PBR surfaces — ideal when scans define the shape.",
  },
] as const;

export function ControlNetSection() {
  return (
    <section
      id="controlnet"
      aria-label="ControlNet detail control"
      className="relative border-y border-white/6 bg-[#141419]/60 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* visual */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
            <SmartImage
              src="/images/controlnet-bbox.png"
              alt="Bounding-box ControlNet guiding a 3D generation"
              width={1024}
              height={768}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#121317]/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/12 bg-black/55 px-3 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-sm">
              <Cuboid className="size-3.5 text-h3d-purple" aria-hidden="true" />
              controlnet: bounding_box · tier: Gen-2.5
            </div>
          </div>
        </Reveal>

        {/* copy + control cards */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Precision without plugins"
            title="High-Fidelity Detail Control"
            sub="Guide generation with Bounding Box, Voxel, and PointCloud ControlNets. Define the structure first, then let Rodin pour in the detail — clean topology, production-ready results."
          />
          <div className="mt-8 space-y-4">
            {CONTROLS.map((c, i) => (
              <Reveal key={c.title} delay={0.08 + i * 0.07}>
                <Card className="h3d-glass border-white/10 bg-white/[0.045] transition-colors hover:border-h3d-purple/35">
                  <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-h3d-purple/12">
                      <c.icon className="size-5 text-h3d-purple" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-white">{c.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-h3d-muted">{c.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
