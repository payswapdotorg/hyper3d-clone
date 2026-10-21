"use client";

import { FolderLock, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";

const CARDS = [
  {
    icon: Users,
    title: "Multi-Team Management",
    desc: "Organize your studio into teams with roles, shared quotas, and per-project billing — everyone ships from the same plan.",
    badges: [],
  },
  {
    icon: FolderLock,
    title: "Shared Asset Workspace",
    desc: "One home for prompts, models, and renders. Unlimited private assets on Creator and Business; publish to the gallery only when you choose.",
    badges: [],
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    desc: "GDPR-ready data handling and ISO-aligned processes. Your prompts and assets stay yours — always.",
    badges: ["GDPR", "ISO 27001"],
  },
] as const;

export function Enterprise() {
  return (
    <section id="enterprise" aria-label="Enterprise-grade control" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="For studios and teams"
          title="Enterprise-grade Control"
          sub="The governance layer production teams expect — without the production-team paperwork."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-12 lg:gap-6">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <Card className="h3d-glass h-full border-white/10 bg-white/[0.04] transition-colors hover:border-h3d-purple/35">
                <CardContent className="flex h-full flex-col p-5 sm:p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-h3d-purple/12">
                    <c.icon className="size-5 text-h3d-purple" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-h3d-muted">{c.desc}</p>
                  {c.badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1.5 rounded-full border border-h3d-gold/30 bg-h3d-gold/10 px-3 py-1.5 font-mono text-[11px] font-medium text-h3d-gold"
                        >
                          <ShieldCheck className="size-3.5" aria-hidden="true" />
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
