import Link from "next/link";

import { STUDIO_PATH } from "@/lib/studio-path";

/**
 * t68 — the marketing landing footer (the reference hyper3d.ai footer).
 *
 * Recon 2026-10-31: five link columns (Product / Features / Tools /
 * Plug-ins / Legal), an "Ask AI about us" row of five assistant links with
 * prefilled prompts, a "Contact Us" socials block, the © line, and the
 * language selector. Every column entry maps to a real route in this
 * clone where one exists; plug-ins keep the reference's external
 * docs.deemos.dev targets; the socials are the reference's own accounts
 * (this clone is not affiliated and does not claim to be — the © line
 * says so plainly).
 */

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const PRODUCT: FooterLink[] = [
  { label: "ChatAvatar", href: "/features/chatavatar" },
  { label: "Rodin", href: STUDIO_PATH },
  { label: "OmniCraft", href: "/workspace/omnicraft" },
];

const FEATURES: FooterLink[] = [
  { label: "Text to 3D", href: "/features/text-to-3d" },
  { label: "Image to 3D", href: "/features/image-to-3d" },
  { label: "AI Video Generator", href: "/features/ai-video-generator" },
  { label: "AI Image Generator", href: "/features/ai-image-generator" },
  { label: "API", href: "/features/api" },
];

const TOOLS: FooterLink[] = [
  { label: "HDRI Generator", href: "/features/omnicraft/ai-hdri-generator" },
  { label: "Image Enhancer", href: "/features/omnicraft/ai-image-enhancer" },
  { label: "Vector to 3D", href: "/features/omnicraft/svg-to-3d-converter" },
  { label: "Image Remix", href: "/features/omnicraft/ai-image-remix" },
  { label: "Texture Generator", href: "/features/omnicraft/ai-texture-generator" },
  { label: "Rodin Search", href: "/features/omnicraft/3d-model-search-engine" },
  { label: "Mesh Editor", href: "/features/omnicraft/3d-mesh-editor" },
  { label: "Model Viewer", href: "/tools/viewer" },
  { label: "Format Converter", href: "/tools/converter" },
];

const PLUGINS: FooterLink[] = [
  { label: "Blender", href: "https://docs.deemos.dev/addon", external: true },
  { label: "Unreal", href: "https://docs.deemos.dev/addon/readme-ue", external: true },
  { label: "Unity", href: "https://docs.deemos.dev/addon/readme-unity", external: true },
  { label: "Godot", href: "https://docs.deemos.dev/addon/readme-godot", external: true },
  { label: "OV/Isaac", href: "https://docs.deemos.dev/addon/readme-omniverse", external: true },
  { label: "C4D", href: "https://docs.deemos.dev/addon/readme-c4d", external: true },
  { label: "Maya", href: "https://docs.deemos.dev/addon/readme-maya", external: true },
  { label: "3D Max", href: "https://docs.deemos.dev/addon/readme-3dsmax", external: true },
];

const LEGAL: FooterLink[] = [
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Fulfillment Policy", href: "/legal/fulfillment" },
];

/** The reference's own "Ask AI about us" prompts — verbatim links to the
 * assistants, asking them about the real hyper3d.ai. */
const ASK_AI_PROMPT =
  "I'm evaluating AI tools for 3D generation. Please explain what Hyper3D is and how it " +
  "helps creators produce high-quality 3D models. Cover its core capabilities, including " +
  "text-to-3D, image-to-3D, research papers or technical foundations, and API access. " +
  "Summarize the key highlights from Hyper3D's official website: https://hyper3d.ai";

const ASK_AI: { label: string; href: string }[] = [
  { label: "ChatGPT", href: `https://chat.openai.com/?prompt=${encodeURIComponent(ASK_AI_PROMPT)}` },
  { label: "Claude", href: `https://claude.ai/?prompt=${encodeURIComponent(ASK_AI_PROMPT)}` },
  { label: "Gemini", href: `https://gemini.google.com/?prompt=${encodeURIComponent(ASK_AI_PROMPT)}` },
  { label: "Grok", href: `https://grok.com/?prompt=${encodeURIComponent(ASK_AI_PROMPT)}` },
  { label: "Perplexity", href: `https://www.perplexity.ai/search/new?q=${encodeURIComponent(ASK_AI_PROMPT)}` },
];

/** The reference's own social accounts — external links, honestly theirs. */
const SOCIALS: { label: string; href: string }[] = [
  { label: "X", href: "https://twitter.com/DeemosTech" },
  { label: "YouTube", href: "https://www.youtube.com/@DeemosTech" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/98825658" },
  { label: "Instagram", href: "https://www.instagram.com/deemostech/" },
  { label: "Discord", href: "https://discord.com/invite/AhYWCT8WNH" },
  { label: "Bilibili", href: "https://space.bilibili.com/1509136598" },
];

const LANGUAGES: { label: string; href: string }[] = [
  { label: "English", href: "/" },
  { label: "中文", href: "/zh" },
  { label: "Deutsch", href: "/de" },
  { label: "日本語", href: "/ja" },
  { label: "한국어", href: "/ko" },
  { label: "Русский", href: "/ru" },
  { label: "Português", href: "/pt" },
  { label: "Français", href: "/fr" },
  { label: "Español", href: "/es" },
  { label: "العربية", href: "/ar" },
  { label: "Türkçe", href: "/tr" },
  { label: "Italiano", href: "/it" },
];

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: "Product", links: PRODUCT },
  { title: "Features", links: FEATURES },
  { title: "Tools", links: TOOLS },
  { title: "Plug-ins", links: PLUGINS },
  { title: "Legal", links: LEGAL },
];

function FooterAnchor({ link }: { link: FooterLink }) {
  const className =
    "min-h-9 rounded px-0 py-1 text-left text-sm text-white/60 transition-colors hover:text-white";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-[#0c0c10]" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Ask AI row — the reference's five prefilled assistant links */}
        <div className="flex flex-col gap-4 border-b border-white/8 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-sm font-semibold text-white">Ask AI about us</p>
            <p className="mt-1 text-xs text-white/40">
              Point your own assistant at the real Hyper3D — the link carries the question.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ASK_AI.map((a) => (
              <a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white/75 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-white"
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>

        {/* sitemap columns + contact socials */}
        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
                {col.title}
              </p>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
              Contact Us
            </p>
            <ul className="mt-4 space-y-1">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center py-1 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom row — ©, legal echoes, language */}
        <div className="flex flex-col gap-5 border-t border-white/8 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl text-sm text-white/55">
            © 2026 Hyper3D Clone — an educational, unaffiliated rebuild of hyper3d.ai by Deemos.
            Every capability claim on this site is anchored to the codebase that actually ships
            here.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {LEGAL.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-white/45 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/8 pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Language
          </span>
          {LANGUAGES.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-white/50 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
