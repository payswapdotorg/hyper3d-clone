"use client";

import { ArrowRight, BookOpen, FlaskConical, Layers3 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "../reveal";

const PAPERS = [
  {
    icon: Layers3,
    name: "Rodin",
    desc: "The diffusion-first 3D generator behind the product — geometry, texture, and control in one model family.",
  },
  {
    icon: BookOpen,
    name: "CLAY",
    desc: "Large-scale generative pre-training for 3D neural representations that scale across object domains.",
  },
  {
    icon: FlaskConical,
    name: "CAST",
    desc: "Controllable reconstruction research that powers ControlNets and editing inside the workspace.",
  },
] as const;

export function Research() {
  return (
    <section id="research" aria-label="Research" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(46rem_26rem_at_50%_115%,rgba(74,0,224,0.22),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-h3d-purple">
            From the Deemos research lab
          </p>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Research-Backed 3D Generation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-h3d-muted sm:text-base">
            Hyper3D combines controllable 3D generation, reconstruction, and production workflows
            shaped by research behind Rodin, CLAY, and CAST.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-12">
          {PAPERS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <Card className="h3d-glass h-full border-white/10 bg-white/[0.04] text-left transition-colors hover:border-h3d-purple/35">
                <CardContent className="p-5 sm:p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-h3d-purple/12">
                    <p.icon className="size-5 text-h3d-purple" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-4 font-mono text-lg font-semibold tracking-wide text-white">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-h3d-muted">{p.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <Button
            size="lg"
            variant="outline"
            className="mt-10 h-12 rounded-full border-white/15 bg-white/4 px-6 text-sm font-semibold text-white/85 hover:bg-white/10"
            onClick={() =>
              toast.info("Hyper3D research", {
                description: "Clone demo — the research tab lives at /workspace/rodin/tab/research on the real site.",
              })
            }
          >
            Learn More about Hyper3D research
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
