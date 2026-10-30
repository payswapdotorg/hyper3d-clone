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
      // t56: the reference's OmniCraft tool routes resolve to the clone's
      // real toolbag pages (4 live tools + honest not-in-clone panels).
      { source: "/workspace/omnicraft", destination: "/omnicraft", permanent: false },
      { source: "/workspace/omnicraft/:tool", destination: "/omnicraft/:tool", permanent: false },
    ];
  },
};

export default nextConfig;
