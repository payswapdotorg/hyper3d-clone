"use client";

/**
 * OmniCraft tool router — resolves a tool slug to its real page or the
 * honest not-in-clone panel. Lives as a client component so every tool page
 * keeps its interactive controls tree in one place.
 */
import { NotInClonePanel } from "./omnicraft-landing";
import { HdriTool } from "./hdri-tool";
import { ViewerTool } from "./viewer-tool";
import { ConvertorTool } from "./convertor-tool";
import { VectorTool } from "./vector-tool";
import { omnicraftToolBySlug } from "@/lib/omnicraft";

export function OmniCraftToolRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "hdri":
      return <HdriTool />;
    case "viewer":
      return <ViewerTool />;
    case "convertor":
      return <ConvertorTool />;
    case "vector":
      return <VectorTool />;
    default: {
      const tool = omnicraftToolBySlug(slug);
      if (tool && tool.status === "not-in-clone") {
        return <NotInClonePanel name={tool.name} note={tool.note ?? "Not part of this clone."} />;
      }
      // Unknown slug — honest generic panel (not a fake product page).
      return (
        <NotInClonePanel
          name="Unknown tool"
          note="This OmniCraft tool does not exist — neither in the reference's grid nor in this clone."
        />
      );
    }
  }
}
