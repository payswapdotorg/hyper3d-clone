"use client";

/**
 * Manage cookie preferences — the reference's granular consent modal
 * (UX-recon 2026-10-22, t47 capture 20-cookie-prefs): opened from the
 * guest cookie banner's "Preferences" button — a centered white modal
 * with a soft purple glow, circular X close, centered title + intro
 * ("Choose which optional cookies Hyper3D can use…"), four cookie
 * categories as light-gray rounded cards:
 *   - Essential cookies — locked, "Always on" badge (purple on lavender)
 *   - Analytics / Personalization / Advertising — purple toggles, all ON
 *     by default
 * Footer (right-aligned pills): "Essential only" (outline) + "Save
 * preferences" (filled #4A00E0, wider). Backdrop click / Escape dismisses
 * WITHOUT saving (the guest banner stays up until an explicit choice).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/* pixel-calibrated against the t47 reference capture (1440×900):
 * modal 719×519, cards 72px tall / 10px gaps, card bg ≈ #eef0f3,
 * relative card-vs-white contrast ≈ 7% */

export interface CookiePrefs {
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
}

export const ESSENTIAL_ONLY_PREFS: CookiePrefs = {
  analytics: false,
  personalization: false,
  advertising: false,
};

export const ALL_PREFS: CookiePrefs = {
  analytics: true,
  personalization: true,
  advertising: true,
};

const CATEGORIES: {
  key: keyof CookiePrefs | "essential";
  label: string;
  description: string;
}[] = [
  {
    key: "essential",
    label: "Essential cookies",
    description:
      "Required for authentication, security, routing, checkout, and other core website functions.",
  },
  {
    key: "analytics",
    label: "Analytics cookies",
    description:
      "Help us measure page performance and product usage so we can improve the site.",
  },
  {
    key: "personalization",
    label: "Personalization cookies",
    description:
      "Remember choices and tailor parts of the experience to your preferences.",
  },
  {
    key: "advertising",
    label: "Advertising cookies",
    description:
      "Support campaign measurement and more relevant marketing across advertising platforms.",
  },
];

interface CookiePreferencesOverlayProps {
  initialPrefs: CookiePrefs;
  onSave: (prefs: CookiePrefs) => void;
  onClose: () => void;
}

export function CookiePreferencesOverlay({ initialPrefs, onSave, onClose }: CookiePreferencesOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState<CookiePrefs>(initialPrefs);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === rootRef.current) onClose();
    },
    [onClose],
  );

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Manage cookie preferences"
      onMouseDown={onBackdrop}
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-[#101114]/60 p-4 backdrop-blur-[2px]"
    >
      <div className="w-[min(92vw,720px)] overflow-hidden rounded-2xl bg-white px-7 pb-7 pt-6 text-[#1f2023] shadow-[0_24px_70px_rgba(16,17,20,0.55),0_0_40px_rgba(74,0,224,0.16)]">
        {/* header — centered title + intro, circular close */}
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cookie preferences"
            className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-[#e5e7eb] text-[#4b5563] transition-colors hover:bg-[#d8d9de] hover:text-[#1f2023]"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <h2 className="text-center text-xl font-bold text-[#111114]">Manage cookie preferences</h2>
          <p className="mx-auto mt-2 max-w-[440px] text-center text-[13px] leading-normal text-[#6f7078]">
            Choose which optional cookies Hyper3D can use. Essential cookies stay on because they are required for
            security and core site behavior.
          </p>
        </div>

        {/* categories — light-gray rounded cards */}
        <div className="mt-4 flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => {
            const locked = cat.key === "essential";
            const checked = locked ? true : prefs[cat.key as keyof CookiePrefs];
            return (
              <div
                key={cat.key}
                className="flex items-start justify-between gap-5 rounded-xl bg-[#eef0f3] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#111114]">
                    {cat.label}
                    {locked && (
                      <span className="rounded-full bg-[#ede9fe] px-2.5 py-0.5 text-xs font-semibold text-[#4a00e0]">
                        Always on
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6f7078]">{cat.description}</p>
                </div>
                {locked ? null : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={`${cat.label} toggle`}
                    onClick={() =>
                      setPrefs((p) => ({ ...p, [cat.key as keyof CookiePrefs]: !p[cat.key as keyof CookiePrefs] }))
                    }
                    className={`relative mt-1 inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors duration-200 ${
                      checked ? "bg-[#4a00e0]" : "bg-[#d1d5db]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-[3px] top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-200 ${
                        checked ? "translate-x-[18px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* actions — right-aligned pills, primary wider */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onSave(ESSENTIAL_ONLY_PREFS)}
            className="h-[40px] rounded-full border border-[#c9c9cf] bg-white px-5 text-sm font-semibold text-[#1f2023] transition-colors hover:bg-[#f4f4f6]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => onSave(prefs)}
            className="h-[40px] rounded-full bg-[#4a00e0] px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}

/* scan-refresh */
