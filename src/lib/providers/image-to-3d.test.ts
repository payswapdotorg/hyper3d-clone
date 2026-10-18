import { describe, it, expect } from "vitest";
import { captionToSpec } from "./image-to-3d";
import type { CaptionResult } from "../caption";

describe("attachment-proportion clamp", () => {
  it("clamps short cylinder/cone attachments to stem-like radii (the lid bug)", () => {
    const caption: CaptionResult = {
      prompt: "A red apple with a stem. simple geometry.",
      components: [
        {
          primitive: "lathe",
          params: { points: [[0, 0], [0.7, 0.4], [0.65, 0.9], [0, 1.1]] },
          position: [0, 0, 0],
          color: "#C1121F",
        },
        {
          // The bug: a wide flat disk emitted as the "stem".
          primitive: "cylinder",
          params: { radiusTop: 0.3, radiusBottom: 0.3, height: 0.15 },
          position: [0, 1.15, 0],
          color: "#6B8E23",
        },
      ],
      palette: ["#C1121F", "#6B8E23"],
      form: "rounded-organic",
    };
    const spec = captionToSpec(caption);
    const stem = spec.objects.find(
      (o) => "params" in o && "radiusTop" in (o.params as Record<string, unknown>),
    );
    expect(stem).toBeDefined();
    const p = (stem as { params: Record<string, number> }).params;
    expect(p.radiusTop).toBeLessThanOrEqual(0.09);
    expect(p.radiusBottom).toBeLessThanOrEqual(0.09);
  });

  it("leaves long cylinders (legs, bodies) untouched", () => {
    const caption: CaptionResult = {
      prompt: "A stool. simple geometry.",
      components: [
        {
          primitive: "cylinder",
          params: { radiusTop: 0.25, radiusBottom: 0.25, height: 1.4 },
          position: [0, 0.7, 0],
          color: "#8B5A2B",
        },
      ],
      palette: ["#8B5A2B"],
      form: "tall-slender",
    };
    const spec = captionToSpec(caption);
    const leg = spec.objects[0] as { params: Record<string, number> };
    expect(leg.params.radiusTop).toBe(0.25);
  });
});
