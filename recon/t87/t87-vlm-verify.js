// t87 VLM verification — analyze use-cases screenshots for layout defects.
// Uses z-ai-web-dev-sdk vision (same flow as t59-t61/t85/t86 verifications).
const fs = require("node:fs");

async function main() {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const dir = "/home/z/my-project/download/t87-verify";
  const shots = [
    {
      file: "3d-printing.png",
      what:
        "a use-case page carrying the three new t87 sections: prompt-example cards (mono boxes with 'Here:' notes), a tech-cards grid, and a six-card export-format grid",
    },
    {
      file: "jewelry-design.png",
      what:
        "a use-case page carrying two new t87 sections: a tech-cards grid ('Castable STL for lost-wax printing') and a six-card export-format grid",
    },
    {
      file: "nft-creation.png",
      what:
        "a use-case page carrying the new t87 prompt-example cards (rarity ladder, mono boxes) and a tech-cards grid ('What happens on mint day')",
    },
  ];
  for (const shot of shots) {
    const b64 = fs.readFileSync(`${dir}/${shot.file}`).toString("base64");
    const res = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `This is a screenshot of ${shot.what} on a dark-themed site (bg #0f0f12, violet accents). ` +
                "Check ONLY for layout defects: overlapping text, clipped/truncated text, elements outside " +
                "their containers, broken alignment, unreadable contrast, missing sections (hero/status panel/" +
                "steps/cards/FAQ/closing CTA), or rendering errors. Answer in <=4 short lines: either " +
                "'NO DEFECTS' plus one sentence on what looks correct, or list each defect found.",
            },
            { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          ],
        },
      ],
    });
    console.log(`=== ${shot.file} ===`);
    console.log(res.choices[0]?.message?.content?.trim());
    console.log();
  }
}

main().catch((err) => {
  console.error("VLM verification failed:", err.message);
  process.exit(1);
});
