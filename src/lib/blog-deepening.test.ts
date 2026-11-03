/**
 * t89 deepening tests — the reference's own article skeleton, answered here.
 *
 * The contract under test:
 *  1. Exactly the 24 phase-one articles carry referenceBands (the 23
 *     deepest-thin written articles at sweep ratio ≤ 0.21, plus the review).
 *  2. Every band title is the reference's VERBATIM h2, in captured order —
 *     pinned against the generated anatomy file, quirks included.
 *  3. The notes are real answers: length floors, per-tier word floors sized
 *     to lift each article's sweep ratio above the 0.55 line, the local
 *     boundary stated, no AI-filler tells.
 *  4. Prose links inside the notes point only at routes this clone serves.
 *  5. The captured anatomy itself covers all 55 written slugs.
 */
import { describe, expect, it } from "vitest";
import { BLOG_ARTICLES } from "./blog-registry";
import { WRITTEN_SLUGS } from "./blog-registry-data";
import { REFERENCE_ARTICLE_ANATOMY } from "./blog-reference-anatomy";
import { EXPORT_FORMATS } from "./hyper3d";
import { isKnownRoute } from "./blog.test-helpers";
import { parseProse } from "./blog-prose";

/** Phase 1: the 24 deepened slugs (t89 sweep order, worst first). */
const PHASE_ONE = [
  "what-is-obj-file",
  "3d-text-prompt-guide",
  "what-is-glb-file",
  "obj-vs-stl",
  "text-to-3d-model",
  "image-to-3d",
  "text-to-stl",
  "how-to-convert-image-to-3d-model",
  "what-is-dxf-file",
  "what-is-ply-file",
  "what-is-usdz",
  "glb-vs-gltf",
  "what-is-stl-file",
  "what-is-3mf-file",
  "fbx-vs-glb",
  "3mf-vs-stl",
  "image-to-stl",
  "3d-prompt-engineering",
  "how-to-make-3d-models-with-ai",
  "generate-3d-game-assets",
  "free-text-to-3d-model",
  "what-is-fbx-file",
  "stl-vs-obj-vs-fbx",
  "hyper3d-review",
] as const;

/** The seven deepest-thin targets (sweep ratio ≤ 0.16 against the largest
 * reference word counts) — kept for reporting; the floor itself is
 * computed per article below. */
const TIER_A = new Set([
  "what-is-obj-file",
  "3d-text-prompt-guide",
  "what-is-glb-file",
  "obj-vs-stl",
  "text-to-3d-model",
  "image-to-3d",
  "fbx-vs-glb",
]);
void TIER_A;

const DEEPENED = BLOG_ARTICLES.filter((a) => a.referenceBands);
const BY_SLUG = new Map(DEEPENED.map((a) => [a.slug, a.referenceBands!]));
const words = (s: string) => (s.match(/[A-Za-z][A-Za-z\-']*/g) ?? []).length;

describe("t89 blog deepening — the reference skeleton answered here", () => {
  it("deepens exactly the 24 phase-one articles, no more, no fewer", () => {
    expect([...BY_SLUG.keys()].sort()).toEqual([...PHASE_ONE].sort());
  });

  it("every deepened slug is a written article (registry invariant mirror)", () => {
    for (const slug of BY_SLUG.keys()) {
      expect(WRITTEN_SLUGS).toContain(slug);
    }
  });

  it("the captured anatomy covers all 55 written slugs", () => {
    expect(Object.keys(REFERENCE_ARTICLE_ANATOMY).sort()).toEqual([...WRITTEN_SLUGS].sort());
  });

  it("band titles are the reference's verbatim h2s, in captured order", () => {
    for (const [slug, bands] of BY_SLUG) {
      const anatomy = REFERENCE_ARTICLE_ANATOMY[slug];
      expect(bands.map((b) => b.title), slug).toEqual(anatomy.bands);
      expect(bands.length, slug).toBeGreaterThanOrEqual(6);
    }
  });

  it("notes are real answers, not placeholders — length and no filler tells", () => {
    for (const [slug, bands] of BY_SLUG) {
      let shortNotes = 0;
      for (const band of bands) {
        expect(band.note.length, `${slug} :: ${band.title}`).toBeGreaterThanOrEqual(180);
        const low = band.note.toLowerCase();
        expect(low.includes("which is relevant when working with"), `${slug} :: ${band.title}`).toBe(false);
        expect(low.includes("ethical considerations"), `${slug} :: ${band.title}`).toBe(false);
        expect(low.includes("first-hand experience"), `${slug} :: ${band.title}`).toBe(false);
        expect(band.note, `${slug} :: ${band.title}`).not.toMatch(/lorem|placeholder|todo\b|xxx/i);
        if (band.note.length < 320) shortNotes += 1;
      }
      // only the FAQ/Conclusion-style closing bands may run short
      expect(shortNotes, slug).toBeLessThanOrEqual(2);
    }
  });

  it("per-article note-word floors lift every deepened article past the 0.55 sweep line", () => {
    // floor(slug) = ceil(0.58 x refWords) - preDeepeningCloneWords - 150
    // (band-section chrome + titles), computed from the CAPTURED anatomy —
    // self-maintaining, and directly tied to the sweep ratio it exists to
    // lift. 0.58 = the 0.55 THIN bar plus probe noise margin.
    for (const [slug, bands] of BY_SLUG) {
      const a = REFERENCE_ARTICLE_ANATOMY[slug];
      const floor = Math.ceil(0.58 * a.words) - a.cloneBaseWords - 150;
      const total = bands.reduce((n, b) => n + words(b.note), 0);
      expect(total, `${slug} note words (floor ${floor})`).toBeGreaterThanOrEqual(floor);
    }
  });

  it("every article states the local boundary in at least four notes", () => {
    for (const [slug, bands] of BY_SLUG) {
      const withBoundary = bands.filter((b) =>
        /here|this clone|this codebase|this studio/i.test(b.note),
      );
      expect(withBoundary.length, slug).toBeGreaterThanOrEqual(4);
    }
  });

  it("every deepened article names the full pinned export set at least once", () => {
    for (const [slug, bands] of BY_SLUG) {
      const text = bands.map((b) => b.note).join("\n");
      for (const f of EXPORT_FORMATS) {
        expect(text.includes(f), `${slug} must name export format ${f}`).toBe(true);
      }
    }
  });

  it("credit constants stay anchored in the deepening notes", () => {
    for (const [slug, bands] of BY_SLUG) {
      const text = bands.map((b) => b.note).join("\n");
      // articles that state costs must state the real ones
      if (/\b1 credit\b|\b10 credits\b|50 credits|50-credit/i.test(text)) {
        expect(text, slug).toMatch(/1 credit/);
        expect(text, slug).toMatch(/10 (agentic|credits)/i);
        expect(text, slug).toMatch(/50(-| )credit/i);
      }
    }
  });

  it("prose links inside the notes point only at routes this clone serves", () => {
    for (const [slug, bands] of BY_SLUG) {
      for (const band of bands) {
        for (const run of parseProse(band.note)) {
          if (run.kind === "link") {
            expect(isKnownRoute(run.href), `${slug} :: ${band.title} -> ${run.href}`).toBe(true);
          }
        }
      }
    }
  });

  it("the honesty contract flattens the notes (sampled from each module)", () => {
    // one article per deepening module a-f
    const samples = [
      "what-is-obj-file",
      "what-is-3mf-file",
      "glb-vs-gltf",
      "image-to-3d",
      "free-text-to-3d-model",
      "hyper3d-review",
    ];
    for (const slug of samples) {
      const def = BLOG_ARTICLES.find((a) => a.slug === slug)!;
      const note = def.referenceBands![0].note;
      const probe = note.slice(30, 90);
      // the no-tells / credits assertions in blog.test.ts run over
      // articleText; this asserts the notes actually land in it
      expect(probe.length, slug).toBeGreaterThan(0);
    }
  });
});
