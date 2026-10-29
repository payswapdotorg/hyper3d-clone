"use client";

import { Copy } from "lucide-react";

/**
 * Copy-prompt island — the /3d-prompts page's one piece of client JS
 * (mirroring how the help center keeps HelpSearch as its one island).
 * Real clipboard write with a transient copied state on the button
 * itself: no toast theater, no fake animation queue — if the clipboard
 * API is unavailable the button simply stays a no-op, which is the
 * honest failure mode for a progressive enhancement.
 */
export function CopyPromptButton({ prompt }: { prompt: string }) {
  return (
    <button
      type="button"
      data-copy-prompt={prompt}
      onClick={(event) => {
        const button = event.currentTarget;
        void navigator.clipboard?.writeText(prompt).then(() => {
          button.dataset.copied = "true";
          window.setTimeout(() => {
            delete button.dataset.copied;
          }, 1500);
        });
      }}
      title="Copy prompt"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-xs font-bold text-white/60 transition-colors hover:border-white/30 hover:text-white data-[copied=true]:border-emerald-400/40 data-[copied=true]:text-emerald-300"
    >
      <Copy className="size-3.5" aria-hidden="true" />
      Copy
    </button>
  );
}
