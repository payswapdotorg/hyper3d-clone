import { describe, expect, it } from "vitest";

import { SHARE_NETWORK_ORDER, shareLinks } from "./share-links";

const ORIGIN = "https://hyper3d-clone.vercel.app";
const PATH = "/blog/what-is-glb-file";
const TITLE = "What Is GLB File & Why It Matters for Web 3D (2026)";

describe("share links — the six-network panel formulas (t81 recon)", () => {
  const links = shareLinks(PATH, TITLE, ORIGIN);
  const by = (n: string) => links.find((l) => l.network === n)!;

  it("emits exactly six networks in the reference panel's order", () => {
    expect(links.map((l) => l.network)).toEqual([...SHARE_NETWORK_ORDER]);
  });

  it("X: intent/tweet with url and text", () => {
    expect(by("x").href).toBe(
      "https://twitter.com/intent/tweet?url=https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file&text=What%20Is%20GLB%20File%20%26%20Why%20It%20Matters%20for%20Web%203D%20(2026)",
    );
  });

  it("LinkedIn: share-offsite with url only", () => {
    expect(by("linkedin").href).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file",
    );
  });

  it("Facebook: sharer with url only", () => {
    expect(by("facebook").href).toBe(
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file",
    );
  });

  it("Reddit: submit with url and title", () => {
    expect(by("reddit").href).toBe(
      "https://www.reddit.com/submit?url=https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file&title=What%20Is%20GLB%20File%20%26%20Why%20It%20Matters%20for%20Web%203D%20(2026)",
    );
  });

  it("WhatsApp: send with 'title url' joined by a literal space", () => {
    expect(by("whatsapp").href).toBe(
      "https://api.whatsapp.com/send?text=What%20Is%20GLB%20File%20%26%20Why%20It%20Matters%20for%20Web%203D%20(2026)%20https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file",
    );
  });

  it("Email: mailto with subject and body", () => {
    expect(by("email").href).toBe(
      "mailto:?subject=What%20Is%20GLB%20File%20%26%20Why%20It%20Matters%20for%20Web%203D%20(2026)&body=https%3A%2F%2Fhyper3d-clone.vercel.app%2Fblog%2Fwhat-is-glb-file",
    );
  });

  it("aria-labels are the reference panel's verbatim", () => {
    expect(links.map((l) => l.ariaLabel)).toEqual([
      "Share on X",
      "Share on LinkedIn",
      "Share on Facebook",
      "Share on Reddit",
      "Share on WhatsApp",
      "Share on Email",
    ]);
  });

  it("every share link is absolute (shareable off-site)", () => {
    for (const l of links) expect(l.href).toMatch(/^https?:\/\/|^mailto:/);
  });

  it("titles with special characters encode without throwing", () => {
    expect(() => shareLinks("/blog/x", "100% “quoted” + snowman ☃", ORIGIN)).not.toThrow();
    const weird = shareLinks("/blog/x", "100% “quoted” + snowman ☃", ORIGIN);
    expect(weird.find((l) => l.network === "x")!.href).toContain("100%25");
  });
});
