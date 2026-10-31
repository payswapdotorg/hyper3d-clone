"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Globe, Menu } from "lucide-react";

import { STUDIO_PATH } from "@/lib/studio-path";
import { WORKSPACE_TAB_ROUTES } from "@/lib/workspace-tabs";

/**
 * t68 — the marketing landing header (the reference hyper3d.ai header).
 *
 * Recon 2026-10-31 (reference / header, 1440px): logo left, then the
 * "Free 7-Day Trial / Subscribe" pill, then the primary nav — Products ▾
 * (Rodin, ChatAvatar), Features ▾ (5 image-cards + 10 text links), API,
 * Pricing, Resources ▾ (Story, Research, Blog, 3d-prompts, 12 use-cases,
 * 7 plug-ins + ComfyUI, 21 styles) — then the Discord icon, Login, and
 * the language picker (12 real locale routes).
 *
 * Honest mapping: every dropdown entry that has a real page in this clone
 * links to it (the features tree, use-cases tree, styles tree, blog,
 * 3d-prompts, pricing, help, locale pages); Rodin deep-links into the
 * real studio at /workspace/rodin; ChatAvatar routes to the clone's
 * ChatAvatar feature page (the reference's is an app-gated route);
 * plug-ins keep the reference's external docs.deemos.dev targets; Story,
 * Research and ComfyUI land in the studio (this clone has no tab-routed
 * research surface). Subscribe / 7-Day Trial point at the pricing page —
 * the clone's honest subscription surface.
 */

interface NavLink {
  label: string;
  href: string;
  note?: string;
}

const PRODUCTS: NavLink[] = [
  { label: "Rodin", href: STUDIO_PATH, note: "The studio — text/image to 3D" },
  { label: "ChatAvatar", href: "/features/chatavatar", note: "3D avatar packages" },
];

const FEATURES: NavLink[] = [
  { label: "Image To 3D", href: "/features/image-to-3d", note: "One image is enough for most objects" },
  { label: "Text To 3D", href: "/features/text-to-3d", note: "From text prompt to 3D object — instantly" },
  { label: "WorldGen", href: "/features/worldgen", note: "Images into editable 3D worlds" },
  { label: "API", href: "/features/api", note: "Plug the generation pipeline into your app" },
  { label: "MCP", href: "/features/mcp", note: "Connect AI agents to 3D generation" },
  { label: "AI Video Generator", href: "/features/ai-video-generator" },
  { label: "AI Image Generator", href: "/features/ai-image-generator" },
  { label: "AI Image Remix", href: "/features/omnicraft/ai-image-remix" },
  { label: "AI Image Enhancer", href: "/features/omnicraft/ai-image-enhancer" },
  { label: "AI Texture Generator", href: "/features/omnicraft/ai-texture-generator" },
  { label: "AI HDRI Generator", href: "/features/omnicraft/ai-hdri-generator" },
  { label: "3D Model Search Engine", href: "/features/omnicraft/3d-model-search-engine" },
  { label: "SVG to 3D Converter", href: "/features/omnicraft/svg-to-3d-converter" },
  { label: "3D Mesh Editor", href: "/features/omnicraft/3d-mesh-editor" },
];

const RESOURCES_HEAD: NavLink[] = [
  // t72: the reference's header menu links its Story / Research items at
  // the workspace's real tab routes (hrefs probed on the homepage,
  // 2026-10-31) — /workspace/rodin/tab/story and /tab/research.
  { label: "Story", href: WORKSPACE_TAB_ROUTES.story },
  { label: "Research", href: WORKSPACE_TAB_ROUTES.research },
  { label: "Blog", href: "/blog" },
  { label: "3d-prompts", href: "/3d-prompts" },
  { label: "Help Center", href: "/help" },
];

const RESOURCES_USE_CASES: NavLink[] = [
  { label: "3D Printing", href: "/use-cases/3d-printing" },
  { label: "Animation", href: "/use-cases/animation" },
  { label: "Game Development", href: "/use-cases/game-development" },
  { label: "Automotive Design", href: "/use-cases/automotive-design" },
  { label: "NFT Creation", href: "/use-cases/nft-creation" },
  { label: "E-commerce", href: "/use-cases/e-commerce" },
  { label: "VR/AR", href: "/use-cases/vr-ar" },
  { label: "Character Design", href: "/use-cases/character-design" },
  { label: "Metaverse", href: "/use-cases/metaverse" },
  { label: "Jewelry Design", href: "/use-cases/jewelry-design" },
  { label: "Mechanical Engineering", href: "/use-cases/mechanical-engineering" },
];

/** External, like the reference: the DCC add-on docs. */
const RESOURCES_PLUGINS: NavLink[] = [
  { label: "Blender", href: "https://docs.deemos.dev/addon" },
  { label: "Unity", href: "https://docs.deemos.dev/addon/readme-unity" },
  { label: "Unreal", href: "https://docs.deemos.dev/addon/readme-ue" },
  { label: "Godot", href: "https://docs.deemos.dev/addon/readme-godot" },
  { label: "Maya", href: "https://docs.deemos.dev/addon/readme-maya" },
  { label: "3DS Max", href: "https://docs.deemos.dev/addon/readme-3dsmax" },
  { label: "ComfyUI", href: STUDIO_PATH },
];

const RESOURCES_STYLES: NavLink[] = [
  "Abstract", "Anime", "Cartoon", "Cel-Shaded", "Fantasy", "Flat", "Gothic",
  "Hand-Painted", "Industrial", "Isometric", "Low Poly", "Medieval", "Minimalist",
  "Modern", "Organic", "Photorealistic", "Pixel Art", "Realistic", "Retro",
  "Stylized", "Voxel",
].map((s) => ({ label: s, href: `/styles/${s.toLowerCase().replace(/ /g, "-")}` }));

const LOCALE_LINKS: { label: string; href: string }[] = [
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

type MenuKey = "products" | "features" | "resources" | "language" | null;

export function SiteHeader() {
  const [open, setOpen] = useState<MenuKey>(null);

  const navButton = (key: Exclude<MenuKey, null>, label: string) => (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
      onClick={() => setOpen(open === key ? null : key)}
      aria-expanded={open === key}
    >
      {label}
      <ChevronDown
        className={`size-3.5 text-white/40 transition-transform ${open === key ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0f0f12]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" aria-label="Hyper3D home" className="flex items-center gap-2">
          <img src="/images/hyper3d-logo.png" alt="" aria-hidden="true" className="h-6 w-auto sm:h-7" />
          <span className="font-display text-base font-bold tracking-wide text-white sm:text-lg">
            HYPER3D<span className="text-violet-300">.AI</span>
          </span>
        </Link>

        {/* the reference's subscribe pill, left of the nav */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1">
          <Link
            href="/pricing"
            className="text-[11px] font-semibold text-violet-200/90 transition-colors hover:text-violet-100"
          >
            Free 7-Day Trial
          </Link>
          <span className="h-3 w-px bg-white/15" aria-hidden="true" />
          <Link
            href="/pricing"
            className="text-[11px] font-semibold text-white/75 transition-colors hover:text-white"
          >
            Subscribe
          </Link>
        </div>

        {/* primary nav */}
        <nav aria-label="Primary navigation" className="hidden flex-1 items-center gap-1 lg:flex">
          {navButton("products", "Products")}
          {navButton("features", "Features")}
          <Link
            href="/features/api"
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            API
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Pricing
          </Link>
          {navButton("resources", "Resources")}
        </nav>

        {/* right utilities */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href="https://discord.com/invite/AhYWCT8WNH"
            target="_blank"
            rel="noreferrer"
            aria-label="Discord"
            className="inline-flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4.5" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
          </a>
          {/* t72: the reference's header Login button points at its
              dedicated /workspace/login route (href probed on the
              homepage, 2026-10-31). */}
          <Link
            href="/workspace/login"
            className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Login
          </Link>
          <div className="relative">
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-white/60 transition-colors hover:text-white"
              onClick={() => setOpen(open === "language" ? null : "language")}
              aria-expanded={open === "language"}
              aria-label="Change language"
            >
              <Globe className="size-4" aria-hidden="true" />
              <span className="hidden text-xs font-medium sm:inline">English</span>
            </button>
            {open === "language" ? (
              <div className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-white/12 bg-[#16161c] p-1 shadow-2xl">
                {LOCALE_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex min-h-9 items-center rounded-lg px-3 text-xs text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                    onClick={() => setOpen(null)}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* mobile nav trigger */}
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:text-white lg:hidden"
          onClick={() => setOpen(open === "features" ? null : "features")}
          aria-label="Open menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* dropdown panels (desktop) */}
      {open === "products" ? (
        <NavPanel>
          {PRODUCTS.map((l) => (
            <NavPanelLink key={l.label} link={l} onNavigate={() => setOpen(null)} big />
          ))}
        </NavPanel>
      ) : null}
      {open === "features" ? (
        <NavPanel wide>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {FEATURES.slice(0, 5).map((l) => (
              <NavPanelLink key={l.label} link={l} onNavigate={() => setOpen(null)} card />
            ))}
          </div>
          <div className="mt-2 border-t border-white/8 pt-2">
            <div className="grid gap-0.5 sm:grid-cols-3">
              {FEATURES.slice(5).map((l) => (
                <NavPanelLink key={l.label} link={l} onNavigate={() => setOpen(null)} />
              ))}
            </div>
          </div>
        </NavPanel>
      ) : null}
      {open === "resources" ? (
        <NavPanel wide>
          <div className="grid max-h-[70vh] grid-cols-2 gap-x-6 gap-y-3 overflow-y-auto sm:grid-cols-4">
            <NavPanelColumn title="Community" links={RESOURCES_HEAD} onNavigate={() => setOpen(null)} />
            <NavPanelColumn title="Use Cases" links={RESOURCES_USE_CASES} onNavigate={() => setOpen(null)} />
            <NavPanelColumn title="Plug-ins" links={RESOURCES_PLUGINS} onNavigate={() => setOpen(null)} />
            <NavPanelColumn title="Styles" links={RESOURCES_STYLES} onNavigate={() => setOpen(null)} />
          </div>
        </NavPanel>
      ) : null}
    </header>
  );
}

function NavPanel({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={`absolute left-0 right-0 top-full z-30 border-b border-white/10 bg-[#121218]/98 shadow-2xl backdrop-blur-xl ${
        wide ? "" : ""
      }`}
    >
      <div className={`mx-auto px-4 py-4 sm:px-6 ${wide ? "max-w-7xl" : "max-w-7xl"}`}>{children}</div>
    </div>
  );
}

function NavPanelLink({
  link,
  onNavigate,
  big,
  card,
}: {
  link: NavLink;
  onNavigate: () => void;
  big?: boolean;
  card?: boolean;
}) {
  const external = link.href.startsWith("http");
  return (
    <LinkOrAnchor
      href={link.href}
      external={external}
      onNavigate={onNavigate}
      className={`flex items-start gap-2 rounded-xl transition-colors ${
        card
          ? "min-h-20 flex-col justify-center border border-white/10 bg-white/[0.03] p-3 hover:border-violet-400/40"
          : "min-h-9 items-center px-3 py-1.5 text-sm text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className={card ? "text-sm font-bold text-white" : big ? "text-sm font-semibold text-white" : ""}>
        {link.label}
      </span>
      {link.note ? (
        <span className={card ? "text-[11px] leading-snug text-white/45" : "text-[11px] text-white/40"}>
          {link.note}
        </span>
      ) : null}
    </LinkOrAnchor>
  );
}

function NavPanelColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{title}</p>
      {links.map((l) => (
        <NavPanelLink key={l.label} link={l} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function LinkOrAnchor({
  href,
  external,
  onNavigate,
  className,
  children,
}: {
  href: string;
  external: boolean;
  onNavigate: () => void;
  className: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}
