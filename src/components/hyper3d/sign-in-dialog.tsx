"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Box, Loader2, LogIn, ShieldCheck, UserRound } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";

export function SignInDialog({
  open,
  onOpenChange,
  onSuccess,
  onGuest,
  intent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (email: string) => void;
  onGuest: () => void;
  intent?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // Mock auth: any credentials are accepted (clone demo contract).
    window.setTimeout(() => {
      setBusy(false);
      const finalEmail = email.trim() || "creator@hyper3d.clone";
      onSuccess(finalEmail);
      onOpenChange(false);
      setPassword("");
    }, 600);
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
              placeholder="you@studio.com"
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
              className="h-11 border-white/12 bg-white/5"
            />
            <p className="text-xs text-h3d-muted">
              Clone demo — any credentials are accepted.
            </p>
          </div>

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

        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1 bg-white/10" />
          <span className="text-xs text-h3d-muted">or</span>
          <Separator className="flex-1 bg-white/10" />
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10"
            onClick={() => {
              onGuest();
              onOpenChange(false);
              toast.info("Continuing as guest", {
                description: "Generation previews are free — sign in anytime to keep assets.",
              });
            }}
          >
            <UserRound className="size-4" /> Continue as guest
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-h3d-muted">
            <ShieldCheck className="size-3.5 text-h3d-purple" aria-hidden="true" />
            Sessions are stored locally in this browser only.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
