"use client";

import { useCallback, useState } from "react";
import { Check, Link2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The share panel's "Copy link" action (t81). The reference pairs its six
 * network links with a copy-to-clipboard button; this is the clone's —
 * real clipboard write with a visible confirmed state, no fake feedback.
 * Server-safe fallback: if the Clipboard API is unavailable the button
 * says so instead of pretending.
 */
export function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "unavailable">("idle");

  const onClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
      return;
    } catch {
      // Clipboard API unavailable (http origin / older browser) — the
      // legacy path: select a temporary textarea and execCommand.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) {
          setState("copied");
          setTimeout(() => setState("idle"), 2000);
          return;
        }
      } catch {
        // fall through to the honest failure state
      }
    }
    setState("unavailable");
    setTimeout(() => setState("idle"), 2000);
  }, [url]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy link"
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition-colors",
        state === "copied"
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/30 hover:text-white",
      )}
    >
      {state === "copied" ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Link2 className="size-3.5" aria-hidden="true" />
      )}
      <span>{state === "copied" ? "Copied" : state === "unavailable" ? "Copy failed" : "Copy link"}</span>
    </button>
  );
}
