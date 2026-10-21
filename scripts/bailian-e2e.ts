/**
 * bailian-e2e.ts — validate the PRODUCTION AI path (Bailian qwen3-vl-plus)
 * end-to-end at the library level: apple image → caption → SceneSpec →
 * three.js mesh → poster PNG. Run with the repo's .env sourced.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createBailianClients } from "../src/lib/ai-clients";
import { analyzeImage } from "../src/lib/caption";
import { generateSpecFromImage } from "../src/lib/providers/image-to-3d";
import { buildScene } from "../src/lib/mesh-builder";
import { renderPoster } from "../src/lib/render-preview";

async function main() {
  const apiKey = process.env.BAILIAN_API_KEY;
  if (!apiKey) throw new Error("BAILIAN_API_KEY missing");
  const clients = createBailianClients({ apiKey });

  const apple = readFileSync("/home/z/h3d-capture/test-apple.png");
  const imageBase64 = apple.toString("base64");

  const t0 = Date.now();
  // 1. caption via the REAL Bailian vision model
  const caption = await analyzeImage({ imageBase64, mime: "image/png" }, clients.vision);
  console.log("[caption]", `${Date.now() - t0}ms`);
  console.log("  prompt:", caption.prompt);
  console.log("  form:", caption.form, "| palette:", caption.palette.join(", "));
  for (const c of caption.components) {
    console.log("  component:", c.primitive, JSON.stringify(c.params).slice(0, 90), c.color ?? "", c.position ? `@ ${c.position}` : "");
  }

  // 2. caption → SceneSpec
  const t1 = Date.now();
  const result = await generateSpecFromImage({ imageBase64, mime: "image/png" }, clients.vision);
  console.log("[spec]", `${Date.now() - t1}ms`, "| name:", result.spec.name, "| objects:", result.spec.objects.length);

  // 3. spec → mesh → poster
  const t2 = Date.now();
  const group = buildScene(result.spec);
  const poster = renderPoster(group);
  writeFileSync("/home/z/h3d-capture/bailian-e2e-poster.png", poster);
  console.log("[poster]", `${Date.now() - t2}ms`, "|", poster.length, "bytes → /home/z/h3d-capture/bailian-e2e-poster.png");

  console.log("DONE — total", `${Date.now() - t0}ms`);
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
