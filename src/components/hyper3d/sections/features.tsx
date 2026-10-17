"use client";

import { ArrowRight, Film, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { SmartImage } from "../smart-image";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";

const CARDS = [
  {
    title: "Image to 3D Model",
    desc: "One image is enough for Rodin to generate most objects. Optional views add extra control.",
    src: "/images/gallery-helmet.png",
    icon: ImageIcon,
  },
  {
    title: "Text to 3D Model",
    desc: "From text prompt to 3D object — instantly. Describe it, tune it, export it.",
    src: "/images/gallery-sword.png",
    icon: Type,
  },
  {
    title: "Image Generator",
    desc: "Free Creator-tier image models — Seedream and defaults, right inside the suite.",
    src: "/images/gallery-potions.png",
    icon: ImageIcon,
  },
  {
    title: "Video Generator",
    desc: "Cinematic AI video with featured Business models like Veo 3.1 and Seedance X30.",
    src: "/images/gallery-drone.png",
    icon: Film,
  },
] as const;

export function Features() {
  return (
    <section id="features" aria-label="Feature families" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="One suite, every medium"
          title="Every Creative Idea Takes 3D Shape"
          sub="Images, text, video — the Hyper3D suite turns each into production-ready 3D or media assets."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <Card className="group h-full overflow-hidden border-white/8 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-h3d-purple/40 hover:shadow-[0_18px_50px_rgba(74,0,224,0.25)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <SmartImage
                    src={c.src}
                    alt={`${c.title} example output`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17171b] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-lg border border-white/15 bg-black/45 backdrop-blur-sm">
                    <c.icon className="size-4 text-h3d-violet" aria-hidden="true" />
                  </span>
                </div>
                <CardContent className="p-4 sm:p-5">
                  <h3 className="font-display text-base font-semibold text-white sm:text-lg">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 min-h-10 text-sm leading-relaxed text-h3d-muted">{c.desc}</p>
                  <button
                    type="button"
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-h3d-violet transition-colors hover:text-white"
                    onClick={() =>
                      toast.info(c.title, {
                        description: "Clone demo — feature pages are not part of this single-route clone.",
                      })
                    }
                  >
                    Learn more
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
