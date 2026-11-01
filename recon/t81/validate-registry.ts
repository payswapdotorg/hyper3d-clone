import { readFileSync } from "node:fs";
import { referenceDescription } from "/home/z/my-project/hyper3d-clone/src/lib/reference-descriptions.ts";
import { referenceOgImage } from "/home/z/my-project/hyper3d-clone/src/lib/reference-og-images.ts";

const R = JSON.parse(readFileSync("/home/z/my-project/hyper3d-clone/recon/t81/article-probe.json", "utf8")) as any[];

const withRel = R.filter((r) => r.related_cards?.length);
let imgMatch = 0;
let imgMiss: string[] = [];
let descMatch = 0;
let descMiss: string[] = [];
let descLens: number[] = [];
let titleSources = 0;

for (const r of withRel) {
  for (const c of r.related_cards) {
    const og = referenceOgImage(c.href);
    if (og === c.img.src) imgMatch++;
    else imgMiss.push(`${r.slug} ${c.href}: card=${c.img.src} t77=${og}`);
    const d = referenceDescription(c.href);
    if (d === c.desc) descMatch++;
    else descMiss.push(`${r.slug} ${c.href}: card=${JSON.stringify(c.desc)} t76=${JSON.stringify(d)}`);
    if (d) descLens.push(d.length);
    if (c.title) titleSources++;
  }
}

console.log(`cards: ${withRel.reduce((n, r) => n + r.related_cards.length, 0)}`);
console.log(`img == t77 og:image: ${imgMatch}/${imgMatch + imgMiss.length}`);
imgMiss.slice(0, 8).forEach((m) => console.log("  IMG MISS", m));
console.log(`desc == t76 description: ${descMatch}/${descMatch + descMiss.length}`);
descMiss.slice(0, 8).forEach((m) => console.log("  DESC MISS", m));
console.log(`t76 desc lengths for card targets: min=${Math.min(...descLens)} max=${Math.max(...descLens)}`);

// how many t76 descriptions exceed 155 chars (would need truncation)?
const long = descLens.filter((l) => l > 155).length;
console.log(`t76 descriptions > 155 chars: ${long}/${descLens.length}`);

// prose-link internal hrefs: how many resolve to routes this clone serves?
// (spot check the /tools and /workspace families against the clone's libs)
const proseInternal = R.flatMap((r) =>
  r.prose_links.map((l: any) => ({ slug: r.slug, href: l.href })),
).filter((l: any) => l.href.startsWith("/"));
console.log(`internal prose hrefs: ${proseInternal.length}`);
const uniq = [...new Set(proseInternal.map((l: any) => l.href.split("?")[0]))];
console.log(`unique internal prose routes: ${uniq.length}`);
uniq.forEach((h) => console.log("  ", h));
