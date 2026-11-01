import type { Metadata } from "next";

import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { ShellRedirect } from "@/components/hyper3d/workspace/shell-redirect";
import { WORKSPACE_MARKER_SCRIPT } from "@/lib/workspace-visit";
import { WORKSPACE_TAB_TITLES } from "@/lib/workspace-tabs";
import {
  SIGNUP_REPLACE_SCRIPT,
  classifyWorkspaceCatchall,
  referralReplaceScript,
} from "@/lib/workspace-shell-routes";

/**
 * /workspace/[...rest] — the SPA catch-all (t82). The reference's
 * shared shell serves HTTP 200 for EVERY /workspace path (probed
 * 2026-11-01, recon/t82: 53 candidate paths, all the byte-identical
 * shell) and its boot scripts + client router decide what happens
 * next. This catch-all mirrors the three child behaviors the probes
 * pinned (the bare /workspace root replace is its own page.tsx):
 *
 *   /workspace/signup     → replace → /workspace/register (+search+hash)
 *                            — the shell script's own exact-path rule;
 *                            deeper signup/* falls through to the studio
 *   /workspace/r|a/…      → replace → /workspace/register, with
 *                            referral_code set from the second segment
 *                            (the shell script's merge semantics) — bare
 *                            /workspace/r lands on the plain register
 *                            URL (the router's own replace, probed)
 *   anything else         → the default studio view AT THE UNKNOWN URL
 *                            (probed: /workspace/foobar, /workspace/settings,
 *                            /workspace/logout, /workspace/xyz/abc all
 *                            render the studio with the studio title,
 *                            URL unchanged)
 *
 * A MANDATORY catch-all (not [[...rest]]): the bare /workspace root is
 * its own page.tsx, and mandatory-catch-all-with-static-siblings is the
 * pattern this app already builds cleanly (omnicraft + [tool]) — the
 * optional form mis-shadowed two static routes under output:standalone
 * (verified during t82; recon/t82/notes.md).
 *
 * Every static workspace route (login, register, subscribe, …), the
 * rodin tab tree, omnicraft, imageto3d, and the two OAuth surfaces are
 * more specific and take precedence over this catch-all.
 */

type CatchallParams = { rest: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<CatchallParams>;
}): Promise<Metadata> {
  const { rest } = await params;
  const view = classifyWorkspaceCatchall(rest);
  // The transient replace shells carry no <title> — the reference's
  // shell serves none pre-replace (title: null suppresses the root
  // layout's default). The studio fallback serves the studio title
  // (the reference's client sets it post-boot).
  if (view.kind === "studio") {
    return { title: WORKSPACE_TAB_TITLES.asset };
  }
  return { title: null };
}

export default async function WorkspaceCatchallPage({
  params,
}: {
  params: Promise<CatchallParams>;
}) {
  const { rest } = await params;
  const view = classifyWorkspaceCatchall(rest);

  if (view.kind === "signup") {
    return <ShellRedirect script={SIGNUP_REPLACE_SCRIPT} />;
  }
  if (view.kind === "referral") {
    return <ShellRedirect script={referralReplaceScript(view.code)} />;
  }

  // The studio fallback at the unknown URL — the shell markers plus
  // the mounted studio, exactly like every other studio-rendering
  // workspace route.
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: WORKSPACE_MARKER_SCRIPT }} />
      <Hyper3DApp />
    </>
  );
}
