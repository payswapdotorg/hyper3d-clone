import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Route parity (t53 audit G6): the reference's canonical product URL,
  // signup rewrite, and referral short links must all resolve on the clone.
  // The clone is a single-page app, so they redirect into / with params the
  // studio consumes (auth=signup opens the sign-in panel in sign-up mode;
  // referral_code prefills the referral field).
  async redirects() {
    return [
      { source: "/workspace/rodin", destination: "/", permanent: false },
      { source: "/workspace", destination: "/", permanent: false },
      { source: "/signup", destination: "/?auth=signup", permanent: false },
      { source: "/workspace/signup", destination: "/?auth=signup", permanent: false },
      { source: "/register", destination: "/?auth=signup", permanent: false },
      { source: "/workspace/register", destination: "/?auth=signup", permanent: false },
      { source: "/r/:code", destination: "/?auth=signup&referral_code=:code", permanent: false },
      { source: "/a/:code", destination: "/?auth=signup&referral_code=:code", permanent: false },
    ];
  },
};

export default nextConfig;
