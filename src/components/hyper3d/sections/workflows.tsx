"use client";

import { Blocks, Building2, Gamepad2, Palette } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "../smart-image";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";

const PERSONAS = [
  {
    icon: Gamepad2,
    title: "Game Developers",
    lines: "Fill worlds with props, weapons, and environment kits that drop straight into Unity or Unreal. Quads, LODs, and PBR maps included.",
    src: "/images/gallery-drone.png",
  },
  {
    icon: Blocks,
    title: "Product Teams",
    lines: "Prototype from a sketch or photo in minutes. Iterate on packaging, hardware, and marketing renders before a single CAD hour is spent.",
    src: "/images/gallery-mech.png",
  },
  {
    icon: Building2,
    title: "Architecture & Education",
    lines: "Turn references into walkthrough-ready objects for scenes, simulations, and classroom projects — no modeling curriculum required.",
    src: "/images/gallery-chest.png",
  },
  {
    icon: Palette,
    title: "Artists & 3D Printing",
    lines: "Explore silhouettes fast, then export watertight STL for the printer. Spend your hours on art, not retopology.",
    src: "/images/gallery-potions.png",
  },
] as const;

export function Workflows() {
  return (
    <section
      id="workflows"
      aria-label="3D workflows"
      className="relative border-y border-white/6 bg-[#141419]/60 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Personas"
          title="Built for Every 3D Workflow"
          sub="Different crafts, same engine — Rodin adapts to how each team thinks in three dimensions."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:gap-6">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <Card className="group h-full overflow-hidden border-white/8 bg-white/[0.04] transition-all duration-300 hover:border-h3d-purple/40">
                <CardContent className="flex h-full flex-col gap-4 p-5 sm:flex-row sm:p-6">
                  <div className="relative hidden aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">
                    <SmartImage
                      src={p.src}
                      alt={`${p.title} example asset`}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-h3d-purple/12">
                      <p.icon className="size-5 text-h3d-purple" aria-hidden="true" />
                    </span>
                    <h3 className="font-display mt-3 text-lg font-semibold text-white">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-h3d-muted">{p.lines}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
