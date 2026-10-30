/**
 * Per-family metadata helper (t67).
 *
 * Recon 2026-10-30: every reference page ships a full link-preview card —
 * og:type / og:site_name / og:title / og:description / og:url /
 * og:image / og:image:alt, a twitter large-image card with @DeemosTech
 * attribution, and a self-canonical — while this clone's family routes
 * emitted only <title> + meta description.
 *
 * `familyMetadata()` builds the card half every family route needs; the
 * route keeps owning its title/description (the drift-anchored clone
 * copy) and merges this in. Canonicals are absolute EN URLs — for the
 * localized router pages that is deliberate (their content lives on the
 * English originals, DECISIONS.md #46); for EN pages it is the reference's
 * own self-canonical behavior.
 *
 * The og:image is the reference's own og-banner asset (the t53
 * twitter-card pattern): the clone hotlinks the real banner instead of
 * mirroring thousands of per-page CDN images.
 */

import type { Metadata } from "next";
import { OG_IMAGE_URL, SITE_ORIGIN } from "./schema-org";

export interface FamilyMetadataInput {
  /** Page <title> — the family route's own title string. */
  title: string;
  /** Meta description (the route's own honest copy). */
  description: string;
  /** EN path of the page, e.g. "/features/text-to-3d". */
  path: string;
  /** og:type — "website" for landing pages, "article" for help/blog prose. */
  type?: "website" | "article";
}

export function familyMetadata({
  title,
  description,
  path,
  type = "website",
}: FamilyMetadataInput): Metadata {
  const url = `${SITE_ORIGIN}${path}`;
  return {
    openGraph: {
      type,
      siteName: "Hyper3D",
      title,
      description,
      url,
      images: [{ url: OG_IMAGE_URL, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@DeemosTech",
      title,
      description,
      images: [OG_IMAGE_URL],
    },
    alternates: {
      canonical: url,
    },
  };
}
