import { Hyper3DApp } from "@/components/hyper3d/app-shell";
import { homeGraph } from "@/lib/schema-org";
import { JsonLd } from "@/components/hyper3d/json-ld";

export default function Home() {
  // t67: the reference homepage's six-node @graph (Organization, WebSite,
  // WebPage, WebApplication + free Offer, ImageObject, BreadcrumbList),
  // rebuilt on this clone's own origin. Lives here — not in the root
  // layout — so deep pages never duplicate the site-level nodes their
  // own family bundles already carry.
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Hyper3DApp />
    </>
  );
}
