"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RotateCcw, Triangle } from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "../smart-image";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";
import { GALLERY_MODELS } from "@/lib/hyper3d";

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 160,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), {
    stiffness: 160,
    damping: 18,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Gallery({ onOpenModel }: { onOpenModel: (prompt: string) => void }) {
  return (
    <section
      id="gallery"
      aria-label="Model showcase gallery"
      className="relative border-y border-white/6 bg-[#141419]/60 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Made with Rodin"
          title="Imagine It. Shape It."
          sub="A snapshot of community generations — every card below started as a sentence or a photo."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:mt-12">
          {GALLERY_MODELS.map((m, i) => (
            <Reveal key={m.src} delay={(i % 4) * 0.06}>
              <TiltCard className="will-change-transform">
                <button
                  type="button"
                  className="h3d-glass group block w-full overflow-hidden rounded-2xl border-white/10 text-left transition-colors hover:border-h3d-purple/45"
                  aria-label={`Open ${m.title} in the Studio`}
                  onClick={() => {
                    toast.info(`Opening “${m.title}” in the Studio`, {
                      description: "Gallery cards launch the workspace with the prompt prefilled.",
                    });
                    onOpenModel(m.title);
                  }}
                >
                  <span className="relative block aspect-square overflow-hidden rounded-t-[calc(1rem-1px)]">
                    <SmartImage
                      src={m.src}
                      alt={`Generated 3D model — ${m.title}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute right-2 top-2 rounded-md border border-white/15 bg-black/50 px-2 py-1 font-mono text-[10px] font-medium text-white/85 backdrop-blur-sm">
                      {m.tag}
                    </span>
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md border border-white/12 bg-black/50 px-2 py-1 font-mono text-[10px] text-white/75 backdrop-blur-sm">
                      <RotateCcw className="size-2.5" aria-hidden="true" />
                      360° preview
                    </span>
                  </span>
                  <span className="block p-3 sm:p-4">
                    <span className="font-display block truncate text-sm font-semibold text-white">
                      {m.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-h3d-muted">
                      <Triangle className="size-3 fill-h3d-purple/60 text-h3d-purple/60" aria-hidden="true" />
                      {m.polys}
                    </span>
                  </span>
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
