"use client";

import { useState } from "react";
import { ArrowRight, BadgeCheck, Check, GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reveal } from "../reveal";
import { SectionHeading } from "./section-heading";
import {
  COMPARE_ROWS,
  PRICING_FAQS,
  PRICING_PLANS,
  type BillingCycle,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

export function Pricing({ onStartFree }: { onStartFree: () => void }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const planCta = (planId: string, cta: string) => {
    if (planId === "free") {
      onStartFree();
      return;
    }
    toast.info(cta, {
      description:
        planId === "enterprise"
          ? "Clone demo — sales contact flow is not wired up."
          : "Clone demo — checkout is not wired up. Pricing mirrors the real site.",
    });
  };

  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="relative border-t border-white/6 bg-[#141419]/60 py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(50rem_18rem_at_50%_-8%,rgba(74,0,224,0.18),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple Plans, Serious Output"
          sub="Simple plans for Rodin 3D generation, API access, ChatAvatar previews, OmniCraft tools, and production support."
        />

        {/* billing cycle toggle */}
        <Reveal delay={0.08}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                cycle === "monthly" ? "text-white" : "text-h3d-muted",
              )}
            >
              Monthly
            </span>
            <Switch
              checked={cycle === "yearly"}
              onCheckedChange={(checked) => setCycle(checked ? "yearly" : "monthly")}
              aria-label="Toggle yearly billing (save 20%)"
              className="data-[state=checked]:bg-h3d-purple"
            />
            <span
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                cycle === "yearly" ? "text-white" : "text-h3d-muted",
              )}
            >
              Yearly
              <span className="rounded-full border border-h3d-gold/40 bg-h3d-gold/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-h3d-gold">
                Save 20%
              </span>
            </span>
          </div>
        </Reveal>

        {/* plan cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {PRICING_PLANS.map((plan, i) => {
            const isYearly = cycle === "yearly";
            const price = isYearly ? plan.yearly : plan.monthly;
            const card = (
              <Card
                className={cn(
                  "relative flex h-full flex-col border-white/10 bg-[#17171b]/85 transition-all duration-300",
                  plan.popular
                    ? "h3d-gradient-border shadow-[0_24px_70px_rgba(74,0,224,0.35)] lg:-translate-y-2"
                    : "bg-white/[0.04] hover:border-white/20",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full h3d-gradient-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                    <Sparkles className="size-3" aria-hidden="true" /> Popular
                  </span>
                )}
                <CardHeader className="pb-0 pt-6">
                  <p className="font-display text-lg font-semibold text-white">{plan.name}</p>
                  <p className="mt-1 min-h-10 text-sm leading-snug text-h3d-muted">{plan.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    {price === null ? (
                      <span className="font-display text-3xl font-bold text-white">Let&rsquo;s Talk</span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-bold text-white">${price}</span>
                        <span className="text-sm text-h3d-muted">/mo</span>
                      </>
                    )}
                  </div>
                  {price !== null && plan.monthly !== null && plan.monthly > 0 && (
                    <p className="mt-1 font-mono text-[11px] text-h3d-muted">
                      {isYearly
                        ? `billed $${(plan.yearly! * 12).toLocaleString("en-US")}/yr`
                        : `$${plan.yearly}/mo if billed yearly`}
                    </p>
                  )}
                  <p className="mt-3 inline-flex w-fit rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] font-medium text-h3d-violet">
                    {plan.creditsLabel}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 pt-5">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-h3d-dim">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-h3d-purple"
                          aria-hidden="true"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button
                    className={cn(
                      "h-11 w-full text-sm font-semibold",
                      plan.popular
                        ? "h3d-gradient-primary text-white hover:opacity-90"
                        : "border border-white/15 bg-white/5 text-white/90 hover:bg-white/10",
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => planCta(plan.id, plan.cta)}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </CardFooter>
              </Card>
            );
            return (
              <Reveal key={plan.id} delay={i * 0.07} className="h-full">
                {card}
              </Reveal>
            );
          })}
        </div>

        {/* education card */}
        <Reveal delay={0.12}>
          <Card className="h3d-glass mt-4 border-white/10 bg-white/[0.04] lg:mt-6">
            <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-h3d-gold/12">
                  <GraduationCap className="size-5 text-h3d-gold" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-white">Education</p>
                  <p className="mt-1 text-sm text-h3d-muted">
                    For verified students, educators, classrooms, and learning programs.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-11 shrink-0 border-white/15 bg-white/5 text-sm font-medium text-white/85 hover:bg-white/10"
                onClick={() =>
                  toast.info("Verify education", {
                    description: "Clone demo — education verification is not wired up.",
                  })
                }
              >
                <BadgeCheck className="size-4 text-h3d-gold" aria-hidden="true" />
                Verify education
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {/* compare plans table */}
        <div className="mt-16 lg:mt-24">
          <SectionHeading
            eyebrow="Side by side"
            title="Compare Plans"
            sub="Compare credits, Rodin features, API access, ChatAvatar, OmniCraft, and production controls."
          />
          <Reveal delay={0.1}>
            <div
              className="h3d-scroll mt-10 overflow-x-auto rounded-2xl border border-white/10"
              role="region"
              aria-label="Plan comparison table"
              tabIndex={0}
            >
              <Table className="min-w-[820px] border-collapse text-sm">
                <TableHeader>
                  <TableRow className="border-white/10 bg-white/[0.04] hover:bg-white/[0.04]">
                    <TableHead className="h-12 min-w-44 pl-5 text-left font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                      Feature
                    </TableHead>
                    {["Free", "Creator", "Business", "Enterprise"].map((h) => (
                      <TableHead
                        key={h}
                        className={cn(
                          "h-12 px-4 text-center font-display text-sm font-semibold",
                          h === "Creator" && "text-h3d-violet",
                        )}
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARE_ROWS.map((row) => (
                    <TableRow
                      key={row.label}
                      className="border-white/8 transition-colors hover:bg-white/[0.03]"
                    >
                      <TableCell className="max-w-56 py-3.5 pl-5 pr-4 text-sm font-medium text-white/85">
                        {row.label}
                      </TableCell>
                      {row.values.map((v, idx) => (
                        <TableCell
                          key={idx}
                          className={cn(
                            "px-4 py-3.5 text-center text-sm",
                            v === "✓" && "font-semibold text-h3d-violet",
                            v === "—" && "text-white/25",
                            v !== "✓" && v !== "—" && "text-h3d-muted",
                          )}
                        >
                          {v}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Reveal>
        </div>

        {/* pricing FAQ */}
        <div className="mx-auto mt-16 max-w-3xl lg:mt-24">
          <SectionHeading eyebrow="Billing" title="Pricing FAQ" />
          <Reveal delay={0.1}>
            <Accordion
              type="single"
              collapsible
              className="mt-8 space-y-3"
              aria-label="Pricing frequently asked questions"
            >
              {PRICING_FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`pfaq-${i}`}
                  className="h3d-glass rounded-xl border-white/10 bg-white/[0.04] px-5 transition-colors data-[state=open]:border-h3d-purple/40"
                >
                  <AccordionTrigger className="min-h-14 py-4 text-left font-display text-base font-medium text-white hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-h3d-muted">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
