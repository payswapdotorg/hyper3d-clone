"use client";

import { MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";
import { FAQS } from "@/lib/hyper3d";

export function Faq() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Answers"
          title="Frequently Asked Questions"
          sub="Everything people ask before their first generation."
        />
        <Reveal delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="mt-10 space-y-3"
            aria-label="Frequently asked questions"
          >
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="h3d-glass rounded-xl border-white/10 bg-white/[0.04] px-5 transition-colors data-[state=open]:border-h3d-purple/40"
              >
                <AccordionTrigger className="min-h-14 py-4 text-left font-display text-base font-medium text-white hover:no-underline sm:text-[17px]">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-h3d-purple">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-h3d-muted">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-h3d-muted">Still have questions?</p>
            <Button
              variant="outline"
              className="h-11 rounded-full border-white/15 bg-white/4 px-5 text-sm font-medium text-white/85 hover:bg-white/10"
              onClick={() =>
                toast.info("Chat with our team", {
                  description: "Clone demo — support chat is not wired up in this clone.",
                })
              }
            >
              <MessageCircleQuestion className="size-4 text-h3d-purple" aria-hidden="true" />
              Chat with our team
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
