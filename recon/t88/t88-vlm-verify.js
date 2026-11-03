// t88 VLM verification — analyze /help screenshots for layout defects.
// Uses z-ai-web-dev-sdk vision (same flow as t59-t61/t85-t87 verifications).
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");

async function main() {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const dir = "/home/z/my-project/download/t88-verify";
  const shots = [
    {
      file: "features-article.png",
      what:
        "a help-center article page carrying the t88 body-density anatomy: a status chip + short-answer box, seven content bands (Rodin Text to 3D, Rodin Image to 3D, mesh/material/texture controls, preview/refine/export, OmniCraft tools, ChatAvatar, API and add-ons), a 'Related questions' accordion band, related-link pills, and a closing category CTA",
    },
    {
      file: "credit-hub.png",
      what:
        "a help-center topic hub page carrying the t88 guide anatomy: a topic hero with counts, a two-column grid of article cards with status chips, a topic guide section ('The credit system, end to end') with paragraphs and a FAQ accordion band, and an 'Other topics' pill row",
    },
    {
      file: "help-index.png",
      what:
        "the help-center index page carrying the t88 reading-guide anatomy: a hero, a search box, a 'Popular articles' list, a 'Browse by topic' card grid, a 'How to read these answers' section with paragraphs and a FAQ accordion band, and a closing Support block",
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
                "their containers, broken alignment, unreadable contrast, missing sections (status chip/" +
                "answer box/bands/FAQ accordions/cards/closing CTA), or rendering errors. Answer in <=4 short " +
                "lines: either 'NO DEFECTS' plus one sentence on what looks correct, or list each defect found.",
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
