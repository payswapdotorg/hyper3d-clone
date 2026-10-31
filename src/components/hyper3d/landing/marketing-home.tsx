import Link from "next/link";

import { HeroDemoCard } from "./hero-demo-card";
import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { EXPORT_FORMATS } from "@/lib/hyper3d";
import { STUDIO_PATH } from "@/lib/studio-path";

/**
 * t68 — the marketing landing page body (the reference hyper3d.ai home).
 *
 * Recon 2026-10-31 (1440px, ?bypass=true): header → hero ("Create 3D
 * Models / The Easy Way" + chips + the embedded studio demo) → 17-logo
 * trust row → "Every Creative Idea Takes 3D Shape" (6 feature cards) →
 * "Flexible 3D Controls" (BANG / Partial Edit / 3D ControlNet demos /
 * Free Retry / Smart Low-Poly) → "How It Works" (3 steps) → "Built for
 * Your 3D Pipeline" (API Platform / 3D Platform Add-On / Enterprise-grade
 * Control) → "Imagine It. Shape It." CTA band → footer.
 *
 * Copy discipline: section labels and product names are factual and match
 * the reference's structure; every prose claim is this clone's own and is
 * anchored to what the codebase really ships — free previews with free
 * redos (credits.ts: confirming costs 1–10 credits, new accounts start
 * with 50), real exports (EXPORT_FORMATS), and an honest reference-only
 * treatment for the enterprise machinery this clone does not have.
 */

/* ------------------------------------------------------------------ hero */

const HERO_CHIPS: { label: string; href?: string }[] = [
  { label: "Bounding Box ControlNet" },
  { label: "Voxel ControlNet" },
  { label: "PointCloud ControlNet" },
  { label: "Image to 3D", href: "/features/image-to-3d" },
  { label: "Text to Image/3D", href: "/features/text-to-3d" },
  { label: "Remix Gen" },
  { label: "Turbo Gen" },
  { label: "3D Editing" },
];

/* ------------------------------------------------------- trust logo row */

/** The reference's 17 partner wordmarks — rendered here as plain
 * grayscale text, their real names, the way the reference renders their
 * logos. No affiliation is implied beyond mirroring the row. */
const TRUSTED_BY: string[] = [
  "Acer", "Bambu", "ComfyUI", "Deepmind", "Fal", "Lovart", "Meta", "MIT",
  "NetEase", "NVIDIA", "PICO XR", "Replicate", "Rokid", "Shutterstock",
  "Supercell", "Tencent", "UCB",
];

/* ------------------------------------------------- feature card section */

const FEATURE_CARDS: { title: string; body: string; href: string; cta: string }[] = [
  {
    title: "Image to 3D Model",
    body: "One reference image is enough for the pipeline to draft most objects — extra views add control when you want it. Upload, preview for free, confirm only what you like.",
    href: "/features/image-to-3d",
    cta: "Image to 3D Model →",
  },
  {
    title: "Text to 3D Model",
    body: "Describe the item and watch it become geometry. The prompt carries style words into shapes, palettes, and proportions on the generation path that really runs here.",
    href: "/features/text-to-3d",
    cta: "Text to 3D Model →",
  },
  {
    title: "AI Avatar Generator",
    body: "The ChatAvatar surface — avatar packages from text or reference images. This clone documents the flow honestly on its feature page.",
    href: "/features/chatavatar",
    cta: "About ChatAvatar →",
  },
  {
    title: "AI Texture Generator",
    body: "Per-part material control — color, metalness, roughness — straight from the generation spec. No baked texture images; the page says exactly that.",
    href: "/features/omnicraft/ai-texture-generator",
    cta: "About textures →",
  },
  {
    title: "OmniCraft 3D Toolkit",
    body: "Four tools run live in this clone — HDRI generation, vector-to-3D, the model viewer, and the format convertor — plus honest panels for the rest of the toolbag.",
    href: "/workspace/omnicraft",
    cta: "Open OmniCraft →",
  },
  {
    title: "High-Fidelity Detail Control",
    body: "Bounding-box, voxel, and point-cloud constraints shape the result before generation, and the effort dial trades seconds for fidelity. Both are live in the studio.",
    href: "/features",
    cta: "All features →",
  },
];

/* ------------------------------------------------ controls section */

const CONTROL_CARDS: { title: string; body: string; href: string; cta: string }[] = [
  {
    title: "BANG",
    body: "Block out a rough shape and let generation fill in the detail. The help center's article walks the whole flow, including what runs here.",
    href: "/help/articles/use-bang-and-partial-edit",
    cta: "The BANG walkthrough →",
  },
  {
    title: "Partial Edit",
    body: "Edit selected regions of an asset without rebuilding the model — documented with its honest limits on the same article.",
    href: "/help/articles/use-bang-and-partial-edit",
    cta: "Partial Edit, honestly →",
  },
  {
    title: "3D ControlNet",
    body: "Guide generation with boxes, voxels, and point clouds. The constraint modal is live in the studio; the demo card on the reference shows the same trio.",
    href: STUDIO_PATH,
    cta: "Try the constraints →",
  },
  {
    title: "Free Retry",
    body: "Redos never cost credits — you only spend when you confirm a result. Generate, redo, and compare before paying a single credit.",
    href: STUDIO_PATH,
    cta: "Redo for free →",
  },
  {
    title: "Smart Low-Poly",
    body: "Optimize detailed assets into cleaner low-poly models — the topology, polycount, and LOD article covers what the pipeline really emits.",
    href: "/help/articles/control-topology-polycount-and-lods",
    cta: "Topology & LODs →",
  },
];

const CONTROLNET_DEMOS: { name: string; inputs: string[]; output: string }[] = [
  { name: "Bounding Box", inputs: ["+", "="], output: "" },
  { name: "Voxel", inputs: ["+", "="], output: "" },
  { name: "Point Cloud", inputs: ["+", "="], output: "" },
];

/* ------------------------------------------------ how it works */

const HOW_IT_WORKS: { step: string; title: string; body: string }[] = [
  {
    step: "1",
    title: "Start with Text or Image",
    body: "Upload a reference image, sketch, product photo, or enter a text prompt. Guests can explore everything; generating asks you to sign in first.",
  },
  {
    step: "2",
    title: "Generate with Control",
    body: "Pick an effort tier from Extreme-Low (~4s) to Extreme-High (~80s), set spatial constraints when you want them, and generate. Previews are free.",
  },
  {
    step: "3",
    title: "Generate and Export",
    body: `Preview the 3D result live in the browser, then export in ${EXPORT_FORMATS.join(", ")} — the formats this clone's exporters really write.`,
  },
];

/* ------------------------------------------------ pipeline / enterprise */

const PIPELINE_CARDS: { title: string; body: string; href: string; cta: string; external?: boolean }[] = [
  {
    title: "API Platform",
    body: "The API feature page documents the real routes this clone serves — generation, task state, exports — and is honest about the parts that are reference-only.",
    href: "/features/api",
    cta: "API Documentation →",
  },
  {
    title: "3D Platform Add-On",
    body: "The DCC add-ons (Blender, Unity, Unreal, Godot, Maya, 3DS Max, OV/Isaac) are the reference's own plug-ins — this clone links their docs instead of pretending to ship them.",
    href: "https://docs.deemos.dev/addon",
    cta: "The add-on docs →",
    external: true,
  },
];

const SSO_CARDS: { title: string; body: string }[] = [
  { title: "SAML 2.0 Authentication", body: "Reference-only — not in this clone." },
  { title: "Identity Provider Integration", body: "Reference-only — not in this clone." },
  { title: "Domain-Based Access", body: "Reference-only — not in this clone." },
  { title: "Centralized User Control", body: "Reference-only — not in this clone." },
];

const ENTERPRISE_CARDS: { title: string; body: string }[] = [
  {
    title: "Multi-Team Management",
    body: "Teams, roles, and cross-project access belong to the reference's enterprise tier. This clone has one account per user and no team machinery — and no page here pretends otherwise.",
  },
  {
    title: "Shared Asset Workspace",
    body: "What this clone shares instead: every confirmed generation lands in your task history with its spec, poster, and exports, ready to re-download.",
  },
  {
    title: "Security & Compliance",
    body: "The honest list: server-side scrypt password hashing, HMAC-signed httpOnly session cookies, and no third-party analytics on this clone's pages.",
  },
];

/* ---------------------------------------------------------------- render */

export function MarketingHome() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f0f12] text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------- hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(124,88,255,0.14),transparent),radial-gradient(40%_40%_at_20%_80%,rgba(192,70,107,0.10),transparent)]"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Create 3D Models
                <br />
                The Easy Way
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                Turn text prompts or images into detailed 3D assets in seconds — no 3D experience
                required. Every generation previews for free: redos cost nothing, and you only
                spend credits when you confirm a result worth keeping.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={STUDIO_PATH}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#f4b183] via-[#ee8f6d] to-[#e2735e] px-7 text-sm font-black tracking-wide text-[#20121a] shadow-[0_8px_30px_rgba(238,143,109,0.35)] transition-transform hover:scale-[1.02]"
                >
                  Start Creating
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  See pricing
                </Link>
              </div>
              {/* the reference's chip row — demo copy for the ControlNet
                  trio (the studio no longer shows a selector there), real
                  links where a feature page exists */}
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="Capability chips">
                {HERO_CHIPS.map((chip) => (
                  <li key={chip.label}>
                    {chip.href ? (
                      <Link
                        href={chip.href}
                        className="inline-flex min-h-8 items-center rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-white/70 transition-colors hover:border-violet-400/40 hover:text-white"
                      >
                        {chip.label}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-8 items-center rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-white/55">
                        {chip.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroDemoCard />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- trust row */}
        <section aria-label="Trusted by" className="border-y border-white/8 bg-white/[0.015]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-6 sm:px-6">
            {TRUSTED_BY.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-wide text-white/25 transition-colors hover:text-white/50"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------- feature cards */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Every Creative Idea
            <br />
            Takes <span className="bg-gradient-to-r from-violet-300 to-[#ee8f6d] bg-clip-text text-transparent">3D Shape</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Start with text prompts or reference images and turn them into detailed 3D models in
            seconds. Six surfaces, six honest pages — each one states exactly how much of the flow
            runs in this clone.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex min-h-44 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{card.body}</p>
                </div>
                <p className="mt-4 text-xs font-bold text-violet-300 transition-colors group-hover:text-violet-200">
                  {card.cta}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* --------------------------------------------- control cards */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Flexible 3D Controls</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Explore additional ways to shape your 3D result — constraint-guided generation,
            region edits, and retries that never bill you for a draft you didn&apos;t keep.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Link
              href={CONTROL_CARDS[0].href}
              className="group flex min-h-40 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/40"
            >
              <div>
                <h3 className="text-lg font-black tracking-tight">{CONTROL_CARDS[0].title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Use flexible controls to explore and refine different 3D directions — without 3D
                  expertise.
                </p>
              </div>
              <p className="mt-3 text-xs font-bold text-violet-300 group-hover:text-violet-200">
                {CONTROL_CARDS[0].cta}
              </p>
            </Link>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {CONTROL_CARDS.slice(1, 3).map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex min-h-40 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/40"
                >
                  <div>
                    <h3 className="text-base font-bold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{card.body}</p>
                  </div>
                  <p className="mt-3 text-xs font-bold text-violet-300 group-hover:text-violet-200">
                    {card.cta}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          {/* the ControlNet demo trio — the reference's "+ =" visual row */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {CONTROLNET_DEMOS.map((demo) => (
              <Link
                key={demo.name}
                href={STUDIO_PATH}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/40"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  {demo.name}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
                  <span className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-1 text-center text-[11px] leading-tight text-white/35 sm:h-16 sm:w-24 sm:flex-none sm:text-xs">
                    input
                  </span>
                  <span className="text-sm font-black text-white/30">+</span>
                  <span className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-1 text-center text-[11px] leading-tight text-white/35 sm:h-16 sm:w-24 sm:flex-none sm:text-xs">
                    hint
                  </span>
                  <span className="text-sm font-black text-white/30">=</span>
                  <span className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-400/10 px-1 text-center text-[11px] font-bold leading-tight text-violet-200 sm:h-16 sm:w-24 sm:flex-none sm:text-xs">
                    mesh
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CONTROL_CARDS.slice(3).map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex min-h-32 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-violet-400/40"
              >
                <div>
                  <h3 className="text-base font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{card.body}</p>
                </div>
                <p className="mt-3 text-xs font-bold text-violet-300 group-hover:text-violet-200">
                  {card.cta}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------- how it works */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">How It Works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-violet-400/40 bg-violet-400/10 text-sm font-black text-violet-200">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------ pipeline section */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Built for Your 3D Pipeline
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            Hyper3D helps teams move from concepts to high-quality, editable 3D assets for
            supported creative workflows — and this clone documents precisely which parts of that
            promise its own codebase keeps.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {PIPELINE_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div>
                  <h3 className="text-base font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{card.body}</p>
                </div>
                <div className="mt-4">
                  <PipelineLink card={card} />
                </div>
              </div>
            ))}
          </div>

          {/* enterprise — chrome parity, honest content */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
            <h3 className="text-xl font-black tracking-tight">Enterprise-grade Control</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/55">
              The reference&apos;s enterprise tier covers SSO, role-based access, shared asset
              workspaces, audit controls, and collaboration tooling. None of that machinery exists
              in this clone — so instead of marketing it, this section marks it reference-only and
              points at the honest write-up.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SSO_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <p className="text-sm font-bold text-white/80">{card.title}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {ENTERPRISE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <p className="text-sm font-bold text-white/80">{card.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">{card.body}</p>
                </div>
              ))}
            </div>
            <Link
              href="/help/articles/how-to-get-hyper3d-enterprise-support"
              className="mt-5 inline-flex text-xs font-bold text-violet-300 hover:text-violet-200"
            >
              The honest enterprise article →
            </Link>
          </div>
        </section>

        {/* ------------------------------------------------- CTA band */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#2a1a4a] via-[#3d2358] to-[#5a2a48] px-6 py-14 text-center sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(238,143,109,0.25),transparent)]"
            />
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Imagine It.
              <br />
              <span className="bg-gradient-to-r from-[#f4b183] to-[#ee8f6d] bg-clip-text text-transparent">
                Shape It.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              The studio is one click away — text or image in, exportable mesh out, free preview
              on every generation.
            </p>
            <Link
              href={STUDIO_PATH}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7ecdf] px-8 text-sm font-black tracking-wide text-[#20121a] shadow-xl transition-transform hover:scale-[1.02]"
            >
              Start Creating
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function PipelineLink({ card }: { card: { href: string; cta: string; external?: boolean } }) {
  if (card.external) {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-10 items-center justify-between gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-bold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
      >
        {card.cta}
      </a>
    );
  }
  return (
    <Link
      href={card.href}
      className="inline-flex min-h-10 items-center justify-between gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-bold text-white/80 transition-colors hover:border-violet-400/40 hover:text-white"
    >
      {card.cta}
    </Link>
  );
}
