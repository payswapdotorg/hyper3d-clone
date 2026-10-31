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
 * The og:image is the reference's own per-page asset, pinned
 * byte-faithfully in the t77 registry (797 unique CDN URLs across the
 * censused tree); routes outside the census fall back to the reference's
 * own shared og-banner.webp. The alt is the card title the route passes
 * in — which is exactly the reference's og:image:alt on every censused
 * page (the t75 title minus the " | Hyper3D" suffix), so the card and
 * the alt stay derived from one string, like the reference's own pages.
 */

import type { Metadata } from "next";
import {
  FACEBOOK_DOMAIN_VERIFICATION,
  OG_BANNER_FALLBACK_URL,
  SITE_ORIGIN,
} from "./schema-org";
import { referenceOgImage } from "./reference-og-images";
import type { ReferenceArticleMeta } from "./reference-article-metas";

export interface FamilyMetadataInput {
  /** Page <title> — the family route's own title string. */
  title: string;
  /** Meta description (the route's own honest copy). */
  description: string;
  /** EN path of the page, e.g. "/features/text-to-3d". */
  path: string;
  /** og:type — "website" for landing pages, "article" for help/blog prose. */
  type?: "website" | "article";
  /**
   * t78 — the reference's OpenGraph article metas (published / modified /
   * author) for blog articles, registry-pinned. Served as
   * article:published_time / article:modified_time / article:author like
   * the reference's own blog pages (help articles ship none — probe-
   * verified — and stay article-meta-free by omitting this).
   */
  article?: ReferenceArticleMeta;
  /**
   * t78 — the blog family's own RSS alternate link
   * (`<link rel="alternate" type="application/rss+xml" title="Hyper3D Blog">`),
   * which the reference ships on every blog index, article, pagination and
   * category page. The href resolves against metadataBase to the clone's
   * own /blog/rss.xml — the same origin translation every canonical
   * already applies to the reference's relative self-URLs.
   */
  rss?: boolean;
}

export function familyMetadata({
  title,
  description,
  path,
  type = "website",
  article,
  rss,
}: FamilyMetadataInput): Metadata {
  const url = `${SITE_ORIGIN}${path}`;
  // t77: the reference's own og:image for censused paths, hotlinked
  // from its CDN (the honest alternative to mirroring 797 assets);
  // uncensused deep routes get the reference's own shared banner.
  const image = referenceOgImage(path) ?? OG_BANNER_FALLBACK_URL;
  return {
    // t78: the reference's own crawler-surface head — robots
    // "index, follow" and its facebook-domain-verification token on
    // every censused family page (the category override below is the
    // one deliberate exception, matching the reference's own
    // noindex-follow category behavior).
    robots: "index, follow",
    other: { "facebook-domain-verification": FACEBOOK_DOMAIN_VERIFICATION },
    openGraph: {
      type,
      siteName: "Hyper3D",
      title,
      description,
      url,
      images: [{ url: image, alt: title }],
      ...(article
        ? {
            publishedTime: article.published,
            modifiedTime: article.modified,
            authors: [article.author],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: "@DeemosTech",
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    alternates: {
      canonical: url,
      ...(rss
        ? {
            types: {
              "application/rss+xml": [{ url: "/blog/rss.xml", title: "Hyper3D Blog" }],
            },
          }
        : {}),
    },
  };
}
