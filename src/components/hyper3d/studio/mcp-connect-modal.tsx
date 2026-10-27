"use client";

/**
 * Connect Hyper3D MCP modal — the reference's topbar "Connect Hyper3D MCP"
 * affordance (2026-10-27 recon): a compact setup sheet with two copyable
 * blocks — an MCP setup instruction for AI coding agents (Streamable HTTP
 * endpoint, OAuth) and the CLI install command. This clone mirrors the
 * function with its own copy; the endpoint URL and package name are the
 * real, public connection facts.
 */
import { useCallback, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Public Streamable-HTTP endpoint of the Rodin MCP server. */
const MCP_ENDPOINT = "https://api.hyper3d.com/api/mcp";
/** Public CLI package name. */
const CLI_INSTALL = "npm install --global @hyper3d/cli";

/** A paste-ready agent instruction that configures the MCP connection. */
const MCP_AGENT_PROMPT = [
  `Set up Hyper3D MCP in this client: name hyper3d, Streamable HTTP URL ${MCP_ENDPOINT}, OAuth.`,
  "Preserve my other settings and reuse or update any existing entry.",
  "Then guide me through browser authorization, verify the connection, list the available tools, and tell me whether a restart is required.",
].join(" ");

function CopyBlock({
  label,
  text,
  hint,
  mono,
}: {
  label: string;
  text: string;
  hint: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can be unavailable (insecure context) — select-fallback.
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    toast.success(`${label} copied`, { description: "Paste it into your client to continue." });
    setTimeout(() => setCopied(false), 2000);
  }, [label, text]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/35">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-h3d-muted">{hint}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
            copied
              ? "border-emerald-400/40 text-emerald-300"
              : "border-white/15 bg-white/[0.06] text-white/80 hover:border-white/30 hover:text-white",
          )}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p
        className={cn(
          "px-4 py-3.5 text-[13px] leading-relaxed text-white/85",
          mono && "font-mono text-[12.5px] break-all",
        )}
        aria-label={label}
      >
        {text}
      </p>
    </div>
  );
}

export function McpConnectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h3d-glass-strong max-h-[90vh] overflow-y-auto border-white/15 bg-[#1e1b24]/95 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Terminal className="size-5 text-h3d-violet" aria-hidden="true" />
            Connect Hyper3D MCP
          </DialogTitle>
          <DialogDescription>
            Hook the generation tools straight into your agent workflow or terminal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section aria-label="MCP setup" className="space-y-2.5">
            <p className="text-sm text-white/70">
              Send the instruction below to your AI coding agent and it will register the
              connection for you.
            </p>
            <CopyBlock label="MCP setup prompt" hint="MCP · Streamable HTTP + OAuth" text={MCP_AGENT_PROMPT} />
          </section>

          <section aria-label="CLI install" className="space-y-2.5">
            <p className="text-sm font-semibold text-white">Hyper3D CLI</p>
            <p className="text-sm text-white/70">
              Prefer the terminal? Install the CLI and start generating from your shell.
            </p>
            <CopyBlock label="CLI install command" hint="npm · global install" text={CLI_INSTALL} mono />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
