import { describe, it, expect, vi } from "vitest";
import { analyzeImage, parseCaptionOutput, type CaptionResult, type VisionClient } from "@/lib/caption";

const VALID_CAPTION = {
  caption_prompt: "A red fresh apple. simple geometry.",
  components: [
    {
      primitive: "sphere",
      params: { radius: 1 },
      position: [0, 0, 0],
      scale: 1,
      rotation: [0, 0, 0],
      color: "#c62828",
    },
    {
      primitive: "cylinder",
      params: { radiusTop: 0.06, radiusBottom: 0.08, height: 0.7 },
      position: [0, 1.1, 0],
      color: "#6d4c41",
    },
  ],
  palette: ["#c62828", "#6d4c41", "#43a047"],
  form: "rounded-organic",
};

function visionClientReturning(content: unknown): VisionClient {
  return {
    createVision: vi.fn().mockResolvedValue({ choices: [{ message: { content } }] }),
  };
}

describe("image captioning (VLM → CaptionResult)", () => {
  it("returns a structured CaptionResult from a valid VLM response", async () => {
    const client = visionClientReturning(JSON.stringify(VALID_CAPTION));
    const result = await analyzeImage({ imageBase64: "aGVsbG8=" }, client);

    expect(result.prompt).toBe("A red fresh apple. simple geometry.");
    expect(result.form).toBe("rounded-organic");
    expect(result.palette).toEqual(["#c62828", "#6d4c41", "#43a047"]);
    expect(result.components).toHaveLength(2);
    expect(result.components[0]).toMatchObject({
      primitive: "sphere",
      position: [0, 0, 0],
      color: "#c62828",
    });
    // The VLM must have been called with the image payload.
    expect(client.createVision).toHaveBeenCalledTimes(1);
    const body = (client.createVision as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      messages: { role: string; content: unknown }[];
    };
    const userMsg = body.messages.find((m) => m.role === "user");
    expect(userMsg).toBeTruthy();
  });

  it("falls back to a safe caption when the VLM returns malformed output", async () => {
    const client = visionClientReturning("Sorry, I cannot describe this image.");
    const result = await analyzeImage({ imageBase64: "aGVsbG8=" }, client);

    expect(result.prompt.length).toBeGreaterThan(0);
    expect(result.components.length).toBeGreaterThan(0);
    expect(result.palette.length).toBeGreaterThan(0);
    for (const hex of result.palette) expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    for (const component of result.components) {
      expect(["box", "sphere", "cylinder", "cone", "torus", "lathe", "extrude"]).toContain(component.primitive);
    }
  });

  it("falls back to a safe caption when the VLM throws", async () => {
    const client: VisionClient = {
      createVision: vi.fn().mockRejectedValue(new Error("boom")),
    };
    const result = await analyzeImage({ imageBase64: "aGVsbG8=" }, client);
    expect(result.prompt.length).toBeGreaterThan(0);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it("falls back when the VLM returns valid JSON that is not a caption", async () => {
    const client = visionClientReturning(JSON.stringify({ hello: "world", items: 4 }));
    const result = await analyzeImage({ imageBase64: "aGVsbG8=" }, client);
    expect(result.prompt.length).toBeGreaterThan(0);
    expect(result.components.length).toBeGreaterThan(0);
  });

  it("parseCaptionOutput strips code fences around JSON", () => {
    const fenced = "```json\n" + JSON.stringify(VALID_CAPTION) + "\n```";
    const result = parseCaptionOutput(fenced);
    expect(result.prompt).toBe("A red fresh apple. simple geometry.");
    expect(result.components).toHaveLength(2);
  });

  it("parseCaptionOutput sanitizes invalid components and colors", () => {
    const messy = {
      prompt: "a thing",
      components: [
        { primitive: "hypercube", params: { radius: 1 }, color: "not-a-color" },
        { primitive: "box", params: { width: 1, height: 1, depth: 1 }, color: "#112233" },
        "nonsense",
      ],
      palette: ["#ff0000", "orange", "#00ff00"],
    };
    const result = parseCaptionOutput(messy);
    expect(result.components.every((c) => typeof c.primitive === "string")).toBe(true);
    expect(result.palette.every((p) => /^#[0-9a-fA-F]{6}$/.test(p))).toBe(true);
    expect(result.palette).toEqual(["#ff0000", "#00ff00"]);
  });

  it("parseCaptionOutput returns a full safe fallback for garbage input", () => {
    for (const garbage of [null, undefined, 42, "", "   ", "[broken json", { prompt: "" }]) {
      const result = parseCaptionOutput(garbage) as CaptionResult;
      expect(result.prompt.length).toBeGreaterThan(0);
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.palette.length).toBeGreaterThan(0);
    }
  });
});
