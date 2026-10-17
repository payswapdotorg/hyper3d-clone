"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Box, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInDialog({
  open,
  onOpenChange,
  onSuccess,
  intent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  intent?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === "invalid_credentials" ? "Wrong email or password." : `Sign-in failed (${res.status}).`);
        return;
      }
      setPassword("");
      // Gate-found fix: do NOT close via onOpenChange here — the parent clears
      // the pending afterSignIn action on close, which raced this handler's
      // `await refresh()` and dropped the "open studio" callback. The parent
      // now closes the dialog after running that callback.
      onSuccess();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h3d-glass-strong border-white/15 bg-[#17171b]/95 sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2" aria-hidden="true">
            <span className="flex size-9 items-center justify-center rounded-lg h3d-gradient-primary text-white">
              <Box className="size-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-wide">HYPER3D</span>
          </div>
          <DialogTitle className="font-display text-left text-xl font-semibold">
            Sign in to Hyper3D
          </DialogTitle>
          <DialogDescription className="text-left">
            {intent ?? "Access your Rodin workspace, credits, and generated assets."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="h3d-email">Email</Label>
            <Input
              id="h3d-email"
              type="email"
              autoComplete="email"
              placeholder="demo@hyper3d.clone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-white/12 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="h3d-password">Password</Label>
            <Input
              id="h3d-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 border-white/12 bg-white/5"
            />
            <p className="text-xs text-h3d-muted">
              Demo account: <span className="font-mono text-h3d-violet">demo@hyper3d.clone</span> /{" "}
              <span className="font-mono text-h3d-violet">demo1234</span> — 50 starter credits.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full h3d-gradient-primary text-sm font-semibold text-white hover:opacity-90"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn className="size-4" /> Sign in
              </>
            )}
          </Button>
        </form>

        <DialogFooter className="sm:flex-col sm:items-center">
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-h3d-muted">
            <ShieldCheck className="size-3.5 text-h3d-purple" aria-hidden="true" />
            Sessions use an httpOnly signed cookie, stored server-side verified.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
