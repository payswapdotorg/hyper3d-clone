"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Sign-in panel — restyled to the reference's right slide-in
 * (UX-recon 2026-10-22): fixed right-[25px] top-[25px] z-21011,
 * 480px wide, min-height 725px, rounded-[25px] glass (border white/12,
 * bg white/5, backdrop-blur-30px), HYPER3D.AI logo header, pill inputs
 * ("Your email address" / "Your password"), Forgot password? link,
 * gradient Sign In button, Sign Up link, OR divider, white Google button,
 * dark GitHub button, SSO text link. Closes on outside click.
 *
 * Task 48 backend audit: the Sign Up link is REAL now — the panel flips to
 * a sign-up mode (username + email + password) that POSTs
 * /api/auth/sign-up (new accounts start at the reference's 40 free
 * credits) and lands the user signed in via the same onSuccess flow.
 */
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
  const [username, setUsername] = useState("");
  const [signUp, setSignUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(signUp ? "/api/auth/sign-up" : "/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          signUp
            ? { email: email.trim(), password, username: username.trim() || undefined }
            : { email: email.trim(), password },
        ),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string; issues?: string[] };
        if (signUp && res.status === 409) {
          setError(body.message ?? "An account with this email already exists — sign in instead.");
        } else if (signUp && Array.isArray(body.issues) && body.issues.length > 0) {
          setError(body.issues.join(" "));
        } else {
          setError(body.error === "invalid_credentials" ? "Wrong email or password." : `Request failed (${res.status}).`);
        }
        return;
      }
      setPassword("");
      // Gate-found fix (kept): do NOT close via onOpenChange here — the
      // parent clears the pending afterSignIn action on close, which raced
      // this handler's `await refresh()` and dropped the "open studio"
      // callback. The parent closes the panel after running that callback.
      onSuccess();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* click-away (transparent, like the reference) */}
      <div className="fixed inset-0 z-[21010]" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <aside
        role="dialog"
        aria-label={signUp ? "Sign up" : "Sign in"}
        className="fixed right-[25px] top-[25px] z-[21011] flex h-[calc(100vh-50px)] min-h-[600px] w-[min(480px,calc(100vw-32px))] flex-col overflow-y-auto rounded-[25px] border-2 border-white/12 bg-[rgba(255,255,255,0.05)] p-8 backdrop-blur-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:min-h-[725px]"
      >
        {/* logo header */}
        <div className="flex items-center justify-center">
          <img src="/images/hyper3d-logo.png" alt="" aria-hidden="true" className="h-[34px] w-auto" />
          <span className="ml-2 text-2xl font-bold tracking-tight text-white">HYPER3D.AI</span>
        </div>

        {intent && (
          <p className="mt-5 text-center text-sm text-white/55">{intent}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
          {signUp && (
            <div className="space-y-1.5">
              <label htmlFor="h3d-username" className="text-[13px] font-semibold text-white/85">
                Username
              </label>
              <input
                id="h3d-username"
                type="text"
                autoComplete="username"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 w-full rounded-full border border-white/10 bg-[#3a3a42] px-5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="h3d-email" className="text-[13px] font-semibold text-white/85">
              Email Address
            </label>
            <input
              id="h3d-email"
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-full border border-white/10 bg-[#3a3a42] px-5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="h3d-password" className="text-[13px] font-semibold text-white/85">
              Password
            </label>
            <input
              id="h3d-password"
              type="password"
              autoComplete={signUp ? "new-password" : "current-password"}
              placeholder={signUp ? "At least 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={signUp ? 8 : undefined}
              className="h-12 w-full rounded-full border border-white/10 bg-[#3a3a42] px-5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
            />
            {!signUp && (
              <button
                type="button"
                className="text-[12.5px] text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
                onClick={() =>
                  setError("Password reset is not wired in this clone — use the demo account below.")
                }
              >
                Forgot password?
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(97deg,#a78bfa_0%,#818cf8_100%)] text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {signUp ? "Creating account…" : "Signing in…"}
              </>
            ) : signUp ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>

          <button
            type="button"
            className="text-center text-[13px] text-white/75 underline-offset-2 transition-colors hover:text-white hover:underline"
            onClick={() => {
              setSignUp((v) => !v);
              setError(null);
            }}
          >
            {signUp ? "Already have an account? Sign in!" : "Sign Up to create a new account!"}
          </button>

          {/* OR divider */}
          <div className="my-1 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/45">or</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <button
            type="button"
            onClick={() =>
              setError("Google sign-in is a reference-chrome button in this clone — use the demo account below.")
            }
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white text-sm font-semibold text-[#2d2d34] transition-opacity hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2 3.5-5 3.5-8.58z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.14.01-3.1 2.4-.04.11C3.9 21.2 7.6 24 12 24z" />
              <path fill="#FBBC05" d="M5.2 14.4c-.25-.7-.4-1.5-.4-2.4s.15-1.7.4-2.4l-.01-.16-3.2-2.5-.1.05C1 8.3.5 10.1.5 12s.5 3.7 1.4 5.2l3.3-2.8z" />
              <path fill="#EB4335" d="M12 4.6c2.2 0 3.7.9 4.6 1.8l3.3-3.2C17.9 1.2 15.2 0 12 0 7.6 0 3.9 2.8 1.9 6.8l3.3 2.6c1-2.9 3.7-4.8 6.8-4.8z" />
            </svg>
            Sign in with Google
          </button>
          <button
            type="button"
            onClick={() =>
              setError("GitHub sign-in is a reference-chrome button in this clone — use the demo account below.")
            }
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#3a3a42] text-sm font-semibold text-white transition-colors hover:bg-[#46464f]"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1v3.12c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            Sign in with GitHub
          </button>
          <button
            type="button"
            onClick={() =>
              setError("SSO is a reference-chrome button in this clone — use the demo account below.")
            }
            className="text-center text-[12.5px] text-white/60 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Sign in with SSO
          </button>

          {/* demo hint (clone necessity — the golden-path wallet) */}
          <p className="mt-auto pt-4 text-center text-[11px] leading-relaxed text-white/40">
            Demo account: <span className="font-mono text-[#c4b0f0]">demo@hyper3d.clone</span> /{" "}
            <span className="font-mono text-[#c4b0f0]">demo1234</span> — 50 starter credits.
          </p>
        </form>
      </aside>
    </>
  );
}
