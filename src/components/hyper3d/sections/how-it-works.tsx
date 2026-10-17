"use client";

import { FileDown, Image as ImageIcon, Type, Wand2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";
import { EXPORT_FORMATS, FORMAT_USES } from "@/lib/hyper3d";

const STEPS = [
  {
    step: "01",
    icon: Type,
    title: "Start with Text or Image",
    desc: "Describe your asset or drop in a reference photo. No 3D experience required — a single clear image is enough.",
  },
  {
    step: "02",
    icon: Wand2,
    title: "Generate with Control",
    desc: "Pick a ControlNet, set the thinking effort, and let Gen-2.5 reason about geometry and materials.",
  },
  {
    step: "03",
    icon: ImageIcon,
    title: "Generate and Export",
    desc: "Preview for free, confirm the result you love, and export straight into your pipeline.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Three steps to production"
          title="How It Works"
          sub="From idea to engine-ready asset in a single afternoon — not a sprint."
        />
        <div className="relative mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14 lg:gap-6">
          {/* connector line */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-h3d-purple/40 to-transparent sm:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <Card className="h3d-glass relative h-full border-white/10 bg-white/[0.04]">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-h3d-purple/12">
                      <s.icon className="size-5.5 text-h3d-purple" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-2xl font-semibold text-white/15">{s.step}</span>
                  </div>
                  <h3 className="font-display mt-4 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-h3d-muted">{s.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* export formats */}
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-4 lg:mt-14">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-h3d-muted">
              <FileDown className="size-3.5" aria-hidden="true" />
              Export formats
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXPORT_FORMATS.map((f) => (
                <span
                  key={f}
                  className="rounded-lg border border-white/10 bg-white/4 px-3.5 py-2 font-mono text-xs font-medium text-white/80 transition-colors hover:border-h3d-purple/50 hover:text-white"
                  title={FORMAT_USES[f]}
                >
                  .{f.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
