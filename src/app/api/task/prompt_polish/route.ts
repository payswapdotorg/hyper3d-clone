import { NextRequest, NextResponse } from "next/server";

import { getChatClient } from "@/lib/ai-clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Prompt polish — the reference prompt card's "correct" button
 * (UX-recon 2026-10-22: a small spell/grammar-fix action beside the
 * textarea). Real LLM call server-side; returns the corrected prompt.
 * Falls back to the original text when no chat backend responds.
 */
function extractContent(response: unknown): string | null {
  if (typeof response !== "object" || response === null) return null;
  const choices = (response as { choices?: unknown[] }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  if (typeof message?.content === "string") return message.content;
  return null;
}

export async function POST(req: NextRequest) {
  let body: { prompt?: unknown };
  try {
    body = (await req.json()) as { prompt?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "empty_prompt" }, { status: 400 });
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "prompt_too_long" }, { status: 400 });
  }

  try {
    const client = await getChatClient();
    const response = await client.create({
      messages: [
        {
          role: "system",
          content:
            "You correct 3D-generation prompts. Fix spelling and grammar, tighten phrasing, keep the user's language and every described detail. Reply with ONLY the corrected prompt — no quotes, no commentary, no preamble.",
        },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });
    const content = extractContent(response);
    const polished = (content ?? prompt).trim().replace(/^["'`]+|["'`]+$/g, "");
    return NextResponse.json({ prompt: polished || prompt, corrected: polished !== prompt });
  } catch {
    /* no chat backend / network failure — honest no-op */
    return NextResponse.json({ prompt, corrected: false });
  }
}
