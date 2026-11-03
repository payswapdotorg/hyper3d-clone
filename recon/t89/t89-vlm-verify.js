// t89 VLM verification — analyze the deepened blog-article screenshots for
// layout defects. Same flow as t87/t88 (z-ai-web-dev-sdk vision).
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");

async function main() {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const dir = "/home/z/my-project/download/t89-verify";
  const shots = [
    {
      file: "t89-obj-format.png",
      what:
        "a blog article page (What is an OBJ file) carrying the t89 deepening anatomy: a breadcrumb top bar, an H1 with date and status chip, a short-version box, an 'On this page' TOC, body sections, then 'The reference's article at this URL, answered here' — an attribution paragraph and an accordion of band rows whose summaries are the reference's verbatim h2 headings (some with doubled keyword phrases) — then an FAQ details band, a Share panel, related chips and a closing CTA",
    },
    {
      file: "t89-obj-vs-stl.png",
      what:
        "a comparison blog article page (OBJ vs STL) with the same anatomy: top bar, H1 + status chip, short-version box, TOC, body sections, the 'The reference's article at this URL, answered here' attribution paragraph plus accordion of verbatim-titled band rows, FAQ details, Share panel, related chips, closing CTA",
    },
    {
      file: "t89-prompt-guide.png",
      what:
        "a prompt-guide blog article page (3D Text Prompt Guide) with the same anatomy: top bar, H1 + status chip, short-version box, TOC including the 'The reference's article, answered here' entry, body sections, the band accordion under the attribution paragraph, FAQ details, Share panel, related chips, closing CTA",
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
                "their containers, broken alignment, unreadable contrast, missing sections (top bar/H1/" +
                "status chip/short-version box/TOC/band accordion/FAQ/Share/CTA), or rendering errors. " +
                "Answer in <=4 short lines: either 'NO DEFECTS' plus one sentence on what looks correct, " +
                "or list each defect found.",
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
