"use client";

import { Globe, Star } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES } from "@/lib/hyper3d";

/** t56+t57: footer entries that now have REAL pages in this clone route to
 * them instead of firing the parity toast — the toolbag (t56) and the
 * features tree (t57) are no longer stubs. */
const REAL_ROUTES: Record<string, string> = {
  OmniCraft: "/omnicraft",
  ChatAvatar: "/features/chatavatar",
  "Text to 3D": "/features/text-to-3d",
  "Image to 3D": "/features/image-to-3d",
  "AI Video Generator": "/features/ai-video-generator",
  "AI Image Generator": "/features/ai-image-generator",
  API: "/features/api",
  "HDRI Generator": "/omnicraft/hdri",
  "Vector to 3D": "/omnicraft/vector",
  "Model Viewer": "/omnicraft/viewer",
  // footer spells it "Converter", the reference grid "Convertor" — cover both
  "Format Convertor": "/omnicraft/convertor",
  "Format Converter": "/omnicraft/convertor",
};

const COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Product",
    links: ["ChatAvatar", "Rodin", "OmniCraft"],
  },
  {
    title: "Features",
    links: ["Text to 3D", "Image to 3D", "AI Video Generator", "AI Image Generator", "API"],
  },
  {
    title: "Tools",
    links: [
      "HDRI Generator",
      "Image Enhancer",
      "Vector to 3D",
      "Image Remix",
      "Texture Generator",
      "Rodin Search",
      "Mesh Editor",
      "Model Viewer",
      "Format Converter",
    ],
  },
  {
    title: "Plug-ins",
    links: ["Blender", "Unreal", "Unity", "Godot", "OV / Isaac", "C4D", "Maya", "3D Max"],
  },
  {
    title: "Legal",
    links: ["Terms of Use", "Privacy Policy", "Fulfillment Policy", "Contact Us"],
  },
];

const ASK_AI = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity"] as const;

const linkToast = (label: string) =>
  toast.info(label, {
    description: "Clone demo — this link points outside the single-route clone.",
  });

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-[#0f0f13]" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Ask AI row */}
        <div className="flex flex-col gap-4 border-b border-white/8 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-sm font-semibold text-white">Ask AI about us</p>
            <p className="mt-1 text-xs text-h3d-muted">
              Ask your favorite assistant about Hyper3D Rodin — prefilled prompts, one click away.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ASK_AI.map((a) => (
              <button
                key={a}
                type="button"
                className="min-h-11 rounded-full border border-white/10 bg-white/4 px-4 text-xs font-medium text-white/75 transition-colors hover:border-h3d-purple/50 hover:bg-h3d-purple/12 hover:text-white"
                onClick={() => linkToast(`Ask ${a} about Hyper3D`)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* sitemap columns */}
        <nav
          aria-label="Footer sitemap"
          className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-h3d-purple">
                {col.title}
              </p>
              <ul className="mt-4 space-y-1">
                {col.links.map((link) => (
                  <li key={link}>
                    {REAL_ROUTES[link] ? (
                      <a
                        href={REAL_ROUTES[link]}
                        className="min-h-9 rounded px-0 py-1 text-left text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="min-h-9 rounded px-0 py-1 text-left text-sm text-white/60 transition-colors hover:text-white"
                        onClick={() => linkToast(link)}
                      >
                        {link}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* bottom row */}
        <div className="flex flex-col gap-5 border-t border-white/8 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5">
              <span className="flex" aria-label="Trustpilot rating 4.1 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < 4
                        ? "size-3.5 fill-[#00b67a] text-[#00b67a]"
                        : "size-3.5 fill-[#00b67a]/40 text-[#00b67a]/40"
                    }
                    aria-hidden="true"
                  />
                ))}
              </span>
              <span className="font-mono text-xs text-white/75">
                4.1<span className="text-white/40">/5 · 105 ratings</span>
              </span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 text-xs font-medium text-white/75 transition-colors hover:text-white"
                aria-label="Select footer language"
              >
                <Globe className="size-3.5" aria-hidden="true" />
                English
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="h3d-scroll max-h-96 w-44 overflow-y-auto border-white/12 bg-[#1c1c22]"
              >
                {LOCALES.map((l) => (
                  <DropdownMenuItem
                    key={l}
                    className="min-h-9"
                    onClick={() =>
                      toast.info(`Language: ${l}`, {
                        description: "Decorative in this clone.",
                      })
                    }
                  >
                    {l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col items-start gap-1 lg:items-end">
            <p className="text-sm text-white/55">
              © 2026 Hyper3D Clone — educational product clone
            </p>
            <p className="font-mono text-[11px] text-white/30">
              Faithful rebuild of hyper3d.ai (Deemos) for evaluation · not affiliated
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
