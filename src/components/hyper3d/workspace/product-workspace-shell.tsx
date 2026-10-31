"use client";

/**
 * Product workspace shell (t74) — the shared chrome for the reference's
 * non-Rodin workspace products (/workspace/chatavatar, /workspace/video),
 * probed live 2026-10-31 (agent-walked):
 *
 *  - a compact top bar: logo → `/` (the landing, the reference's own
 *    link), the "7-Day Trial | Subscribe" pill → /workspace/subscribe
 *    (the reference homepage's pill hrefs), the product's own secondary
 *    actions (ChatAvatar shows "Plug-in"; Video shows nothing extra),
 *    MCP&CLI → the real /features/mcp page, Login → the t72 login route;
 *  - the right-side product rail (the reference's h3d-nav): the three
 *    product entries — Avatar → /workspace/chatavatar, 3D →
 *    /workspace/rodin, Video → /workspace/video — then the OmniCraft
 *    toolbag list. On the reference's video page these tool names are
 *    display-only labels; here they are real links to the t71 tool
 *    routes (every route exists — an honest improvement, not a fake);
 *  - a "Chat with us" dock stub that routes to the t73 contact surface
 *    (/workspace/contact-us) instead of duplicating the studio's dock.
 *
 * Everything is robots-disallowed by prefix (robots.txt `Disallow:
 * /workspace`), so nothing here enters any sitemap.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { OMNICRAFT_TOOLS } from "@/lib/omnicraft";
import { WORKSPACE_RAIL_PRODUCTS } from "@/lib/workspace-routes";

const RAIL_PRODUCT_BLURBS: Record<string, string> = {
  ChatAvatar: "Image / Text/Image to 3D Avatar",
  Rodin: "Image / 3D Large Model",
  Video: "Image / Video Generators",
};

export function ProductWorkspaceShell({
  activeProduct,
  secondaryAction,
  children,
}: {
  /** Which rail product is highlighted (the current page). */
  activeProduct: string;
  /** Product-specific top-bar action rendered before MCP&CLI (e.g.
   * ChatAvatar's "Plug-in"); omitted for Video. */
  secondaryAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      {/* top bar — the reference's workspace product header */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/10 bg-[#17181c]/80 px-4 py-2.5 backdrop-blur">
        <Link href="/" aria-label="Hyper3D home" className="flex items-center gap-2">
          <img src="/images/hyper3d-logo.png" alt="" aria-hidden="true" className="h-6 w-auto" />
          <span className="font-display text-sm font-bold tracking-wide text-white">
            HYPER3D<span className="text-violet-300">.AI</span>
          </span>
        </Link>

        {/* the subscribe pill (the reference's own href: /workspace/subscribe) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1">
          <Link
            href="/workspace/subscribe"
            className="text-[11px] font-semibold text-violet-200/90 transition-colors hover:text-violet-100"
          >
            Free 7-Day Trial
          </Link>
          <span className="h-3 w-px bg-white/15" aria-hidden="true" />
          <Link
            href="/workspace/subscribe"
            className="text-[11px] font-semibold text-white/75 transition-colors hover:text-white"
          >
            Subscribe
          </Link>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {secondaryAction}
          <Link
            href="/features/mcp"
            className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
            title="The reference's MCP connect surface — this clone's honest MCP feature page."
          >
            MCP&amp;CLI
          </Link>
          <Link
            href="/workspace/login"
            className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/workspace/contact-us"
            aria-label="Chat with us"
            title="Chat with us — the contact surface"
            className="inline-flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* body: product surface | right product rail */}
      <div className="flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        <main className="relative min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* the right product rail (the reference's h3d-nav, visible) */}
        <aside
          aria-label="Workspace products and tools"
          className="w-full shrink-0 border-b border-white/10 bg-[#14151a] p-3 lg:w-[188px] lg:border-b-0 lg:border-l"
        >
          <nav className="space-y-1">
            {WORKSPACE_RAIL_PRODUCTS.map((p) => {
              const active = p.label === activeProduct;
              return (
                <Link
                  key={p.label}
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg border px-3 py-2 transition-colors ${
                    active
                      ? "border-violet-400/40 bg-violet-400/10"
                      : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`block text-xs font-bold ${active ? "text-white" : "text-white/75"}`}>
                    {p.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-white/40">
                    {RAIL_PRODUCT_BLURBS[p.label]}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              OmniCraft｜Toolbag
            </p>
            <ul className="mt-2 space-y-0.5">
              {OMNICRAFT_TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/workspace/omnicraft/${tool.slug}`}
                    title={tool.status === "live" ? tool.blurb : tool.note}
                    className="block truncate rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
