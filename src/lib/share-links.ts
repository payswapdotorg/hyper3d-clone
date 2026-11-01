/**
 * Share links — the six-network share panel every reference blog article
 * carries (t81 recon: 55/55, constant formulas, all
 * `target="_blank" rel="noopener noreferrer nofollow"`).
 *
 * The reference builds its URLs from the article's own origin and H1;
 * the honest clone equivalent builds them from this clone's SITE_ORIGIN
 * and the clone's own article headline. Formulas pinned to the recon:
 *
 *   X        twitter.com/intent/tweet?url={url}&text={title}
 *   LinkedIn linkedin.com/sharing/share-offsite/?url={url}
 *   Facebook facebook.com/sharer/sharer.php?u={url}
 *   Reddit   reddit.com/submit?url={url}&title={title}
 *   WhatsApp api.whatsapp.com/send?text={title} {url}
 *   Email    mailto:?subject={title}&body={url}
 *
 * (url and title percent-encoded; WhatsApp joins with a literal space.)
 */

/** The six networks, in the reference panel's order. */
export type ShareNetwork = "x" | "linkedin" | "facebook" | "reddit" | "whatsapp" | "email";

export interface ShareLink {
  network: ShareNetwork;
  href: string;
  /** The reference panel's aria-label, verbatim. */
  ariaLabel: string;
}

export const SHARE_NETWORK_ORDER: readonly ShareNetwork[] = [
  "x",
  "linkedin",
  "facebook",
  "reddit",
  "whatsapp",
  "email",
] as const;

const ARIA_LABELS: Record<ShareNetwork, string> = {
  x: "Share on X",
  linkedin: "Share on LinkedIn",
  facebook: "Share on Facebook",
  reddit: "Share on Reddit",
  whatsapp: "Share on WhatsApp",
  email: "Share on Email",
};

const enc = encodeURIComponent;

/** Build the six share links for one article (path is site-relative,
 * title is the on-page H1). */
export function shareLinks(path: string, title: string, origin: string): ShareLink[] {
  const url = `${origin}${path}`;
  return [
    {
      network: "x",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
      ariaLabel: ARIA_LABELS.x,
    },
    {
      network: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
      ariaLabel: ARIA_LABELS.linkedin,
    },
    {
      network: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      ariaLabel: ARIA_LABELS.facebook,
    },
    {
      network: "reddit",
      href: `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`,
      ariaLabel: ARIA_LABELS.reddit,
    },
    {
      network: "whatsapp",
      href: `https://api.whatsapp.com/send?text=${enc(`${title} ${url}`)}`,
      ariaLabel: ARIA_LABELS.whatsapp,
    },
    {
      network: "email",
      href: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
      ariaLabel: ARIA_LABELS.email,
    },
  ];
}
