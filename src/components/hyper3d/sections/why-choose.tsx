"use client";

import { FileDown, Gem, MousePointerClick, Sparkles, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";

const VALUES = [
  {
    icon: MousePointerClick,
    title: "One-Click Simplicity",
    desc: "From prompt to PBR model in a single click — no modeling skills, no node graphs, no 3D experience required.",
  },
  {
    icon: FileDown,
    title: "Multiple Export Formats",
    desc: "GLB, GLTF, FBX, OBJ, STL, and USDZ — whatever your pipeline speaks, Rodin speaks it too.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Results",
    desc: "Turbo Gen drafts in seconds; Extreme-High effort lands hero-quality in about a minute.",
  },
  {
    icon: Sparkles,
    title: "Free to Start",
    desc: "Generate and preview for free — pay only when you confirm a result you actually keep.",
  },
  {
    icon: Gem,
    title: "High-Fidelity 3D",
    desc: "Near production-ready geometry with clean topology, baked normals, and PBR materials.",
  },
] as const;

export function WhyChoose() {
  return (
    <section id="why" aria-label="Why choose Hyper3D" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="The short version"
          title="Why Choose Hyper3D?"
          sub="Five reasons teams replace days of modeling with a Rodin prompt."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <Card className="h3d-glass h-full border-white/10 bg-white/[0.04] transition-colors hover:border-h3d-purple/35">
                <CardContent className="p-5 sm:p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-h3d-purple/12">
                    <v.icon className="size-5 text-h3d-purple" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-h3d-muted">{v.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
