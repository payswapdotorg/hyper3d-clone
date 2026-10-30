import type { Metadata } from "next";

import { PricingPageView } from "@/components/hyper3d/landing/pricing-page";
import { LANDING_PRICING_PAGE } from "@/lib/landing";
import { familyMetadata } from "@/lib/seo";

/**
 * /pricing — the honest anti-pricing page (t62). The reference sells
 * five tiers here; this clone reproduces the page's anatomy (plan card,
 * tier list, comparison table, pricing FAQ, CTA) with the one plan that
 * actually exists: $0, 50 credits at signup, 1 credit per standard
 * confirm, 10 per agentic.
 */
export const metadata: Metadata = {
  title: `${LANDING_PRICING_PAGE.title} — Hyper3D`,
  description: LANDING_PRICING_PAGE.description,
  ...familyMetadata({ title: `${LANDING_PRICING_PAGE.title} — Hyper3D`, description: LANDING_PRICING_PAGE.description, path: "/pricing" }),
};

export default function PricingRoute() {
  return <PricingPageView page={LANDING_PRICING_PAGE} />;
}
