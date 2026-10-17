"use client";

import { Plug } from "lucide-react";

import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";
import { DCC_TOOLS } from "@/lib/hyper3d";

export function Pipeline() {
  return (
    <section
      id="pipeline"
      aria-label="3D pipeline integrations"
      className="relative border-y border-white/6 bg-[#141419]/60 py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Plug-ins & integrations"
          title="Built for Your 3D Pipeline"
          sub="Official plug-ins keep Rodin inside the DCC and engine tools you already use — no context switching, no re-imports."
        />
        <Reveal delay={0.1}>
          <ul
            className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12 lg:grid-cols-9"
            aria-label="Supported tools"
          >
            {DCC_TOOLS.map((tool) => (
              <li key={tool}>
                <span className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-2 py-3 text-center grayscale transition-all hover:grayscale-0 hover:border-h3d-purple/40 hover:bg-h3d-purple/8">
                  <Plug className="size-4 text-white/30" aria-hidden="true" />
                  <span className="font-display text-xs font-semibold tracking-wide text-white/55 sm:text-sm">
                    {tool}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 text-center font-mono text-[11px] text-h3d-muted">
            docs.deemos.dev/addon — Blender · Unity · Unreal · Godot · Maya · 3ds Max · Omniverse · C4D · ComfyUI
          </p>
        </Reveal>
      </div>
    </section>
  );
}
