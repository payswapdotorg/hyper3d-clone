# Reset recovery — how to restore this workspace after a sandbox reset

The sandbox that hosts this clone gets recycled periodically (9 resets
and counting as of 2026-10-31). Everything under the project root is
wiped except what lives in the git remote. This file is the restore
procedure, kept IN the repo so it survives resets with the code.

## What is lost on reset

- The cloned repo working tree (uncommitted work — always commit and
  push before ending a session)
- `~/.git-credentials`, `~/.bashrc` env-var block, and any local
  `.env` (never commit secrets — this repo is public)
- Node modules, databases, `.next` builds

## Restore procedure (verified on the 8th and 9th resets, 2026-10-31)

1. **Rebuild git credentials** (the PAT comes from the session context,
   never from this file):

   ```bash
   git config --global credential.helper store
   printf 'https://payswapdotorg:<PAT>@github.com\n' > ~/.git-credentials
   chmod 600 ~/.git-credentials
   ```

   The username component is required: a bare `https://<PAT>@github.com`
   line makes `git push` fail with "could not read Username" even though
   clone works (public repos clone without auth, masking the problem).

2. **Clone and install:**

   ```bash
   cd /home/z/my-project
   git clone --depth 50 https://github.com/payswapdotorg/hyper3d-clone.git
   cd hyper3d-clone && bun install
   ```

3. **Verify the baseline before starting new work:**

   ```bash
   bun run test   # must be all green (518 tests / 35 suites as of t72)
   bun run lint   # must be 0 errors
   ```

   Known non-gating tsc baseline: ~26 pre-existing errors in untouched
   files (api task routes, prompts page, older test files). Compare
   against the count in the latest DECISIONS.md entry before assuming
   new breakage.

4. **Production checks** (Vercel auto-deploys main; the API tokens may
   be rotated independently — the GitHub PAT is the push path):

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://hyper3d-clone.vercel.app/
   ```

## Standing lessons

- `rm -rf .next` before any standalone smoke after multi-patch
  sessions — warm incremental builds have produced SSG HTML referencing
  chunks the build never wrote (t71, DECISIONS.md #51).
- generateStaticParams for an optional catch-all needs `{ param: [] }`
  for the bare route; an empty `{}` silently prerenders nothing (t72,
  DECISIONS.md #52).
- The standalone server for local smoke needs an ABSOLUTE sqlite
  `DATABASE_URL` and must be started detached (`( cmd & )` subshell) to
  survive across tool invocations; kill it by port (`ss -tlnp`) because
  the process renames itself to `next-server (v1…)`.
