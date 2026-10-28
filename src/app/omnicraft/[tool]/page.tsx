import { OmniCraftToolRouter } from "@/components/hyper3d/omnicraft/tool-router";

/**
 * Per-tool OmniCraft route — mirrors the reference's /workspace/omnicraft/{tool}
 * pages. The slug decides between a real tool and the honest not-in-clone
 * panel; unknown slugs render the same honesty (never a fake 404 product).
 */
export default async function OmniCraftToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  return <OmniCraftToolRouter slug={tool} />;
}
