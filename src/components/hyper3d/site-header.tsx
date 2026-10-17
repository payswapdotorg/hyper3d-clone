"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Boxes,
  ChevronDown,
  Code2,
  Coins,
  Film,
  Globe,
  Grid3x3,
  Image as ImageIcon,
  LogOut,
  Menu,
  Palette,
  PenTool,
  Plug,
  Search,
  Shuffle,
  Smile,
  Sun,
  Type,
  UserRound,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SmartImage } from "./smart-image";
import {
  LOCALES,
  NAV_AI_MEDIA,
  NAV_FEATURES_MAIN,
  NAV_OMNICRAFT,
  NAV_PRODUCTS,
  NAV_STYLES,
  NAV_USE_CASES,
} from "@/lib/hyper3d";
import { cn } from "@/lib/utils";

type MenuId = "products" | "features" | "usecases" | "styles" | null;

const linkToast = (label: string) =>
  toast.info(`${label}`, {
    description: "Clone demo — this page is not part of the single-route clone.",
  });

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    image: ImageIcon,
    type: Type,
    globe: Globe,
    code: Code2,
    plug: Plug,
    film: Film,
    palette: Palette,
    shuffle: Shuffle,
    wand: Wand2,
    grid: Grid3x3,
    sun: Sun,
    search: Search,
    pen: PenTool,
    edit: Boxes,
    box: Box,
    smile: Smile,
  };
  const Cmp = map[name] ?? Box;
  return <Cmp className={className} />;
}

export function SiteHeader({
  authed,
  userEmail,
  credits,
  onSignIn,
  onSignOut,
  onStartCreating,
}: {
  authed: boolean;
  userEmail: string | null;
  credits: number;
  onSignIn: () => void;
  onSignOut: () => void;
  onStartCreating: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [locale, setLocale] = useState("English");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navButton = (id: Exclude<MenuId, null>, label: string) => (
    <button
      type="button"
      aria-expanded={openMenu === id}
      aria-haspopup="true"
      onMouseEnter={() => setOpenMenu(id)}
      onFocus={() => setOpenMenu(id)}
      onClick={() => setOpenMenu(openMenu === id ? null : id)}
      className={cn(
        "flex min-h-11 items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        openMenu === id ? "text-white" : "text-white/70 hover:text-white",
      )}
    >
      {label}
      <ChevronDown
        className={cn("size-3.5 transition-transform", openMenu === id && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  );

  const panel =
    "absolute inset-x-0 top-full border-b border-white/10 bg-[#141419]/97 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.55)]";

  return (
    <header
      className="sticky top-0 z-40 h3d-glass border-b border-white/8"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Wordmark */}
        <button
          type="button"
          className="flex min-h-11 items-center gap-2"
          aria-label="Hyper3D home"
          onClick={() => {
            setOpenMenu(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-lg h3d-gradient-primary shadow-[0_0_18px_rgba(133,132,255,0.45)]">
            <Box className="size-4.5 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-wide text-white">
            HYPER3D<span className="text-h3d-purple">.AI</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navButton("products", "Products")}
          {navButton("features", "Features")}
          {navButton("usecases", "Use Cases")}
          {navButton("styles", "Styles")}
          <button
            type="button"
            className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            onClick={() => {
              setOpenMenu(null);
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Pricing
          </button>
        </nav>

        {/* Right utilities */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language selector (decorative) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden min-h-11 gap-1.5 px-2 text-white/70 hover:bg-white/8 hover:text-white sm:flex"
                aria-label="Select language"
              >
                <Globe className="size-4" aria-hidden="true" />
                <span className="text-xs font-medium">{locale.slice(0, 3).toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="h3d-scroll max-h-96 w-44 overflow-y-auto border-white/12 bg-[#1c1c22]">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l}
                  className={cn("min-h-9", locale === l && "text-h3d-purple")}
                  onClick={() => {
                    setLocale(l);
                    toast.info(`Language: ${l}`, {
                      description: "The 12-locale selector is decorative in this clone.",
                    });
                  }}
                >
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {authed ? (
            <>
              <div
                className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 md:flex"
                title="Credits wallet"
              >
                <Coins className="size-4 text-h3d-gold" aria-hidden="true" />
                <span className="font-mono text-sm font-medium text-white">{credits}</span>
                <span className="text-xs text-h3d-muted">credits</span>
              </div>
              <span className="hidden rounded-full h3d-gradient-primary px-3 py-1.5 text-xs font-semibold text-white md:inline-flex">
                Free · 7-Day Trial
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 rounded-full border border-white/12 bg-white/5 hover:bg-white/10"
                    aria-label="User menu"
                  >
                    <UserRound className="size-5 text-h3d-violet" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-white/12 bg-[#1c1c22]">
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-medium text-white">{userEmail ?? "Creator"}</p>
                    <p className="font-mono text-xs text-h3d-muted">Free plan · trial</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="min-h-9" onClick={() => linkToast("Manage billing")}>
                    <Coins className="size-4" /> Manage billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="min-h-9" onClick={() => linkToast("Email preferences")}>
                    <UserRound className="size-4" /> Account settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="min-h-9" onClick={onSignOut}>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden min-h-11 px-3 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-white sm:flex"
              onClick={onSignIn}
            >
              Sign in
            </Button>
          )}

          <Button
            size="sm"
            className="min-h-11 rounded-full h3d-gradient-primary px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(133,132,255,0.35)] hover:opacity-90 sm:px-5"
            onClick={onStartCreating}
          >
            Start Creating
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 text-white lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="h3d-scroll w-[86vw] max-w-sm overflow-y-auto border-white/10 bg-[#141419] p-0"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <SheetTitle className="font-display text-base font-bold tracking-wide">
                  HYPER3D<span className="text-h3d-purple">.AI</span>
                </SheetTitle>
              </div>
              <div className="px-2 py-3">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="products">
                    <AccordionTrigger className="min-h-11 px-3 text-sm font-medium">
                      Products
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 px-1 pb-3">
                      {NAV_PRODUCTS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-white/6"
                          onClick={() => {
                            setMobileOpen(false);
                            if (p.label === "Rodin") onStartCreating();
                            else linkToast(p.label);
                          }}
                        >
                          <FeatureIcon name={p.icon} className="mt-0.5 size-4.5 text-h3d-purple" />
                          <span>
                            <span className="block text-sm font-medium text-white">{p.label}</span>
                            <span className="block text-xs text-h3d-muted">{p.desc}</span>
                          </span>
                        </button>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="features">
                    <AccordionTrigger className="min-h-11 px-3 text-sm font-medium">
                      Features
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 px-1 pb-3">
                      {[...NAV_FEATURES_MAIN, ...NAV_AI_MEDIA, ...NAV_OMNICRAFT].map((f) => (
                        <button
                          key={f.label}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm text-white/85 hover:bg-white/6"
                          onClick={() => {
                            setMobileOpen(false);
                            linkToast(f.label);
                          }}
                        >
                          <FeatureIcon name={"icon" in f ? f.icon : "box"} className="size-4 text-h3d-violet" />
                          {f.label}
                        </button>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="usecases">
                    <AccordionTrigger className="min-h-11 px-3 text-sm font-medium">
                      Use Cases
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-3">
                      <div className="grid grid-cols-2 gap-1">
                        {NAV_USE_CASES.map((u) => (
                          <button
                            key={u}
                            type="button"
                            className="rounded-lg p-2.5 text-left text-sm text-white/85 hover:bg-white/6"
                            onClick={() => {
                              setMobileOpen(false);
                              linkToast(u);
                            }}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="styles">
                    <AccordionTrigger className="min-h-11 px-3 text-sm font-medium">
                      Styles
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {NAV_STYLES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-white/80 hover:border-h3d-purple/50 hover:text-white"
                            onClick={() => {
                              setMobileOpen(false);
                              linkToast(s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 space-y-2 px-3 pb-6">
                  <Button
                    className="h-11 w-full h3d-gradient-primary text-sm font-semibold text-white"
                    onClick={() => {
                      setMobileOpen(false);
                      onStartCreating();
                    }}
                  >
                    Start Creating
                  </Button>
                  {!authed ? (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-white/15 bg-white/5 text-sm font-medium"
                      onClick={() => {
                        setMobileOpen(false);
                        onSignIn();
                      }}
                    >
                      Sign in
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-white/15 bg-white/5 text-sm font-medium"
                      onClick={() => {
                        setMobileOpen(false);
                        onSignOut();
                      }}
                    >
                      <LogOut className="size-4" /> Log out ({credits} credits)
                    </Button>
                  )}
                  <p className="pt-2 text-center text-xs text-h3d-muted">
                    12 locales available in the full product
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ---------------- Mega-menu panels (desktop) ---------------- */}
      <AnimatePresence>
        {openMenu && (
          <div className="hidden lg:block" onMouseEnter={() => setOpenMenu(openMenu)}>
            {openMenu === "products" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className={panel}
                role="menu"
                aria-label="Products menu"
              >
                <div className="mx-auto grid max-w-7xl gap-2 px-6 py-6 sm:grid-cols-2">
                  {NAV_PRODUCTS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      role="menuitem"
                      className="flex items-start gap-4 rounded-xl p-4 text-left transition-colors hover:bg-white/6"
                      onClick={() => {
                        setOpenMenu(null);
                        if (p.label === "Rodin") onStartCreating();
                        else linkToast(p.label);
                      }}
                    >
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <FeatureIcon name={p.icon} className="size-5 text-h3d-purple" />
                      </span>
                      <span>
                        <span className="font-display block text-sm font-semibold text-white">{p.label}</span>
                        <span className="mt-0.5 block text-sm text-h3d-muted">{p.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {openMenu === "features" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className={panel}
                role="menu"
                aria-label="Features menu"
              >
                <div className="mx-auto grid max-w-7xl grid-cols-5 gap-5 px-6 py-6">
                  {/* col 1 — generation */}
                  <div className="space-y-1">
                    <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                      Generation
                    </p>
                    {NAV_FEATURES_MAIN.map((f) => (
                      <button
                        key={f.label}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left hover:bg-white/6"
                        onClick={() => {
                          setOpenMenu(null);
                          linkToast(f.label);
                        }}
                      >
                        <FeatureIcon name={f.icon} className="mt-0.5 size-4.5 shrink-0 text-h3d-purple" />
                        <span>
                          <span className="block text-sm font-medium text-white">{f.label}</span>
                          <span className="block text-xs leading-snug text-h3d-muted">{f.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* col 2 — AI media */}
                  <div className="space-y-1">
                    <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                      AI Media
                    </p>
                    {NAV_AI_MEDIA.map((f) => (
                      <button
                        key={f.label}
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/6"
                        onClick={() => {
                          setOpenMenu(null);
                          linkToast(f.label);
                        }}
                      >
                        <FeatureIcon name={f.icon} className="size-4.5 text-h3d-blue" />
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* col 3-4 — OmniCraft */}
                  <div className="col-span-2 space-y-1">
                    <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                      OmniCraft
                    </p>
                    <div className="grid grid-cols-2 gap-x-3">
                      {NAV_OMNICRAFT.map((f) => (
                        <button
                          key={f.label}
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/6"
                          onClick={() => {
                            setOpenMenu(null);
                            linkToast(f.label);
                          }}
                        >
                          <FeatureIcon name={f.icon} className="size-4 shrink-0 text-h3d-cyan" />
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* col 5 — featured image link */}
                  <button
                    type="button"
                    role="menuitem"
                    aria-label="WorldGen — turn images into editable 3D worlds"
                    className="group relative overflow-hidden rounded-xl border border-white/10"
                    onClick={() => {
                      setOpenMenu(null);
                      linkToast("WorldGen");
                    }}
                  >
                    <SmartImage
                      src="/images/worldgen-scene.png"
                      alt="WorldGen generated 3D world scene"
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-3 text-left">
                      <span className="block font-display text-sm font-semibold text-white">WorldGen</span>
                      <span className="block text-xs text-white/70">Editable 3D worlds from images</span>
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {openMenu === "usecases" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className={panel}
                role="menu"
                aria-label="Use cases menu"
              >
                <div className="mx-auto max-w-7xl px-6 py-6">
                  <div className="h3d-scroll grid max-h-96 grid-cols-3 gap-1 overflow-y-auto pr-2 xl:grid-cols-4">
                    {NAV_USE_CASES.map((u) => (
                      <button
                        key={u}
                        type="button"
                        role="menuitem"
                        className="min-h-11 rounded-lg px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/6 hover:text-white"
                        onClick={() => {
                          setOpenMenu(null);
                          linkToast(u);
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {openMenu === "styles" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className={panel}
                role="menu"
                aria-label="Styles menu"
              >
                <div className="mx-auto max-w-7xl px-6 py-6">
                  <p className="pb-3 font-mono text-[11px] uppercase tracking-wider text-h3d-muted">
                    21 styles · one click away from your next look
                  </p>
                  <div className="h3d-scroll flex max-h-96 flex-wrap gap-2 overflow-y-auto pr-2">
                    {NAV_STYLES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="menuitem"
                        className="min-h-11 rounded-full border border-white/10 bg-white/4 px-4 text-sm text-white/80 transition-colors hover:border-h3d-purple/60 hover:bg-h3d-purple/15 hover:text-white"
                        onClick={() => {
                          setOpenMenu(null);
                          linkToast(s);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
