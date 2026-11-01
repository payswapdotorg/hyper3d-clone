import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Route parity (t53 audit G6, re-pointed t68/t74, re-probed t82): the
  // reference's root-level short-form aliases are PERMANENT redirects
  // into the workspace (probed live 2026-11-01, recon/t82/notes.md):
  //
  //   /register            301 → /workspace/register
  //   /login               301 → /workspace/login
  //   /imageto3d           301 → /features/image-to-3d   (the marketing page)
  //   /imageto3d/{uuid}    301 → /workspace/imageto3d/{uuid} — shape-checked,
  //                         so it is a Route Handler (src/app/imageto3d/[uuid]/
  //                         route.ts), not a table row
  //   /r/{code…} /a/{code…} 301 → /workspace/r|a/{code…} — the reference's own
  //                         two-hop referral shape; the workspace hop is the
  //                         catch-all's pre-paint replace (register + code)
  //
  // Gone in t82, re-probed: /signup 404s on the reference (its shell
  // script never serves there — only /workspace/signup does, now a real
  // 200 + replace route), and /workspace itself serves 200 + a client
  // replace to /workspace/rodin (the catch-all), so neither keeps a
  // redirect row.
  async redirects() {
    return [
      { source: "/register", destination: "/workspace/register", statusCode: 301 },
      { source: "/login", destination: "/workspace/login", statusCode: 301 },
      { source: "/imageto3d", destination: "/features/image-to-3d", statusCode: 301 },
      // The referral short links at ANY depth ≥1 segment (the reference
      // 301s /r/testcode/extra with the extra segment intact; bare /r
      // and /a 404 there, so no zero-segment row exists).
      { source: "/r/:code", destination: "/workspace/r/:code", statusCode: 301 },
      { source: "/r/:code/:rest*", destination: "/workspace/r/:code/:rest*", statusCode: 301 },
      { source: "/a/:code", destination: "/workspace/a/:code", statusCode: 301 },
      { source: "/a/:code/:rest*", destination: "/workspace/a/:code/:rest*", statusCode: 301 },
      // t71: the reference retired its public OmniCraft landing tree —
      // /omnicraft and three of the four tool URLs 301 to the HDRI feature
      // page, /omnicraft/viewer to the viewer marketing hub (probed
      // 2026-10-31, exact targets), and the working tools now live under
      // /workspace/omnicraft/* like the reference's own. The t56 reverse
      // redirects (workspace → public landing) are gone with the tree.
      // statusCode 301 mirrors the reference's own permanent redirects.
      {
        source: "/omnicraft/viewer",
        destination: "/tools/viewer",
        statusCode: 301,
      },
      {
        source: "/omnicraft/:tool*",
        destination: "/features/omnicraft/ai-hdri-generator",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
