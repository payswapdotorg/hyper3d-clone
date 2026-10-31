import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Route parity (t53 audit G6, re-pointed t68): the reference's canonical
  // product URL, signup rewrite, and referral short links must all resolve
  // on the clone. t68 moved the studio from / to /workspace/rodin (the
  // reference's own URL shape), so these redirect into the studio route
  // with params the app consumes (auth=signup opens the sign-in panel in
  // sign-up mode; referral_code prefills the referral field). /workspace
  // itself lands on /workspace/rodin, matching the reference's client-side
  // router behavior from the landing bounce.
  async redirects() {
    return [
      { source: "/workspace", destination: "/workspace/rodin", permanent: false },
      { source: "/signup", destination: "/workspace/rodin?auth=signup", permanent: false },
      { source: "/workspace/signup", destination: "/workspace/rodin?auth=signup", permanent: false },
      { source: "/register", destination: "/workspace/rodin?auth=signup", permanent: false },
      { source: "/workspace/register", destination: "/workspace/rodin?auth=signup", permanent: false },
      { source: "/r/:code", destination: "/workspace/rodin?auth=signup&referral_code=:code", permanent: false },
      { source: "/a/:code", destination: "/workspace/rodin?auth=signup&referral_code=:code", permanent: false },
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
