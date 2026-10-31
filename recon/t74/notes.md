# t74 recon — the workspace entry routes (2026-10-31)

Method: static-HTML diff of both served homepages (internal-link
census) + curl probes + agent-browser walks of every new route.

- `ref-home.html` — the reference's served homepage (400KB, its Astro
  build with the embedded-hidden workspace chrome: the h3d-nav rail,
  GENERATE button, full mega-menu). Link census: 103 internal links.
- `clone-home.html` — this clone's served homepage at parity time
  (166KB). The ref-only drift that started t74: 12 /workspace URLs
  (register, subscribe, api-dashboard, chatavatar, video, eight
  OmniCraft tool links) + the external Trustpilot badge.
- `ref-api-dashboard.html` — the reference's 11KB SPA shell for
  /workspace/* routes (no static title; the client router sets it).

Probed titles (byte-faithful, pinned in src/lib/workspace-routes.ts):
register → the default workspace title; subscribe → "Pricing |
Hyper3D"; api-dashboard → "API Dashboard | Hyper3D"; chatavatar and
video → their long product titles. Guest behavior: register renders
the signup view; subscribe opens the plans drawer; api-dashboard shows
the studio (its dashboard panel is auth-gated); chatavatar and video
are full product surfaces (avatar cards with likes; the video form
with 720p/5s/0.5-credits and "No Videos Yet").

Homepage link contexts (the reference's own hrefs): signup-entry →
/workspace/register (visible); login-entry → /workspace/login;
workspace-entry → /workspace/rodin (auth-only, hidden for guests);
the API action → /workspace/api-dashboard (auth-only); the subscribe
pill's trial-button and subscribe-button → /workspace/subscribe; the
Products menu and footer Product column link chatavatar and rodin at
their workspace routes, OmniCraft at /workspace/omnicraft/hdri; the
h3d-nav rail carries the nine OmniCraft tool hrefs in the served HTML.
The footer brand column carries the TRUSTPILOT block ("Rated 4.5 out
of 5 on Trustpilot", five stars, linking trustpilot.com/review/
hyper3d.ai).

Post-fix census: the homepage link diff is empty (ref-only links:
none, excluding the reference's _astro build assets); all five routes
200 with the probed titles.
