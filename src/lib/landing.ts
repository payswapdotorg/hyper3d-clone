/**
 * Landing pages registry — the single source of truth for the five
 * standalone landing routes added in t62 to reach full parity with the
 * reference's English landing sitemap (landing-sitemap-static-en.xml,
 * recon 2026-10-30): /pricing, /3d-prompts, /switch, /switch/makerworld,
 * /event/chroma-awards.
 *
 * Shared by the route files, the shared renderers, the studio footer
 * wiring, the sitemap, and the tests. Same pattern as features.ts (t57),
 * legal.ts (t58), use-cases.ts (t59), styles.ts (t60), help.ts (t61) —
 * except these are singleton pages, so each def carries its own shape
 * (landing-types.ts) instead of a tree of children.
 */

import { PRICING_PAGE } from "./landing-content-a";
import { PROMPTS_PAGE } from "./landing-content-b";
import {
  EVENT_CHROMA_AWARDS_PAGE,
  SWITCH_INDEX_PAGE,
  SWITCH_MAKERWORLD_PAGE,
} from "./landing-content-c";
import type { EventPageDef, SwitchPageDef } from "./landing-types";

export { SWITCH_INDEX_PAGE } from "./landing-content-c";
export { SWITCH_MAKERWORLD_PAGE } from "./landing-content-c";
export { PRICING_PAGE } from "./landing-content-a";
export { PROMPTS_PAGE } from "./landing-content-b";

export type {
  AbsentOfferPoint,
  AbsentPromise,
  AbsentTier,
  EventPageDef,
  LandingCta,
  LandingClosing,
  LandingFaq,
  LandingHero,
  LandingTableRow,
  OnlyPlan,
  PricingPageDef,
  PromptsPageDef,
  PromptCategory,
  PromptExample,
  RealInsteadItem,
  RealWorkflowLink,
  SwitchPageDef,
} from "./landing-types";

/** The reference's five standalone landing routes (sitemap recon
 * 2026-10-30), exactly as they appear in landing-sitemap-static-en.xml
 * minus the routes this clone already covered before t62. */
export const REFERENCE_LANDING_ROUTES = [
  "/3d-prompts",
  "/event/chroma-awards",
  "/pricing",
  "/switch",
  "/switch/makerworld",
] as const;

export const LANDING_PRICING_PAGE = PRICING_PAGE;
export const LANDING_PROMPTS_PAGE = PROMPTS_PAGE;

/** The /switch tree: the index page (Meshy/Tripo) + the MakerWorld page. */
export const SWITCH_PAGES: SwitchPageDef[] = [SWITCH_INDEX_PAGE, SWITCH_MAKERWORLD_PAGE];

/** The /event tree: only chroma-awards exists, here and at the reference. */
export const EVENT_PAGES: EventPageDef[] = [EVENT_CHROMA_AWARDS_PAGE];

export function switchPageBySlug(slug: string): SwitchPageDef | undefined {
  return SWITCH_PAGES.find((p) => p.slug === slug);
}

export function eventPageBySlug(slug: string): EventPageDef | undefined {
  return EVENT_PAGES.find((p) => p.slug === slug);
}

/** Every route this module family exposes (for the sitemap + tests):
 * exactly the reference's five, nothing invented. */
export function landingRoutes(): string[] {
  return [
    LANDING_PRICING_PAGE.route,
    LANDING_PROMPTS_PAGE.route,
    ...SWITCH_PAGES.map((p) => p.route),
    ...EVENT_PAGES.map((p) => p.route),
  ];
}
