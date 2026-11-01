#!/usr/bin/env python3
"""t81: apply curated inline prose links to the 55 written articles.

The map is hand-authored (label placements chosen per article against its
own prose, mirroring the reference's per-class density: ~2-4 links on the
24 format/comparison/prompt articles, 0-3 on the platform/credits class).
Every anchor must appear EXACTLY once in its file — the script asserts
that before touching anything. Run with --check to validate only.

Syntax added into paragraph strings: markdown-lite [label](href), parsed
by src/lib/blog-prose.ts at render time.
"""

import sys

# (file, old, new) — each old asserted to appear exactly once in the file.
MAP: list[tuple[str, str, str]] = []


def A(old: str, new: str):
    MAP.append(("a", old, new))


def B(old: str, new: str):
    MAP.append(("b", old, new))


def C(old: str, new: str):
    MAP.append(("c", old, new))


def D(old: str, new: str):
    MAP.append(("d", old, new))


def E(old: str, new: str):
    MAP.append(("e", old, new))


# ------------------------------------------------ file A — platform overviews
A(
    "modes — Text to 3D and Image to 3D — over a paced task pipeline",
    "modes — [Text to 3D](/features/text-to-3d) and [Image to 3D](/features/image-to-3d) — over a paced task pipeline",
)
A(
    "Around the studio sit the OmniCraft tools — a texture generator",
    "Around the studio sit the [OmniCraft tools](/workspace/omnicraft) — a texture generator",
)
A(
    "The fastest verification path: open the studio, generate from a text prompt",
    "The fastest verification path: [open the studio](/workspace/rodin), generate from a text prompt",
)
A(
    "Text to 3D takes a prompt (with one-click presets",
    "[Text to 3D](/features/text-to-3d) takes a prompt (with one-click presets",
)
A(
    "Image to 3D accepts one reference image",
    "[Image to 3D](/features/image-to-3d) accepts one reference image",
)
A("OmniCraft ships four real generators", "[OmniCraft](/workspace/omnicraft) ships four real generators")
A(
    "The pricing page is a single honest row",
    "The [pricing page](/pricing) is a single honest row",
)
A(
    "one format (SVG to 3D) running a genuine local conversion. The model viewer parses in the browser",
    "one format ([SVG to 3D](/workspace/omnicraft/vecto3d)) running a genuine local conversion. The [model viewer](/workspace/omnicraft/viewer) parses in the browser",
)
A(
    "The blog — this blog — ships 55 written articles",
    "The blog — [this blog](/blog) — ships 55 written articles",
)
A(
    "pick Text to 3D or Image to 3D, describe or upload",
    "pick [Text to 3D](/features/text-to-3d) or [Image to 3D](/features/image-to-3d), describe or upload",
)
A("In Text to 3D, type what you want", "In [Text to 3D](/features/text-to-3d), type what you want")
A(
    "In Image to 3D, drop one .png/.jpg/.webp reference",
    "In [Image to 3D](/features/image-to-3d), drop one .png/.jpg/.webp reference",
)
A(
    "The OmniCraft model viewer will open any of them locally",
    "The [OmniCraft model viewer](/workspace/omnicraft/viewer) will open any of them locally",
)
A(
    "That is the entire price list. There is no per-format surcharge",
    "That is the entire [price list](/pricing). There is no per-format surcharge",
)
A(
    "no tier where any of these numbers change — because there are no tiers.",
    "no tier where any of these numbers change — because [there are no tiers](/blog/how-much-do-hyper3d-plans-cost).",
)
A(
    "the standing 50 credits at signup, which expire never.",
    "the standing 50 credits at signup, which [expire never](/blog/do-hyper3d-credits-expire).",
)
A(
    "this clone states that on its enterprise-support page too.",
    "this clone states that on its [enterprise-support page](/blog/how-to-get-hyper3d-enterprise-support) too.",
)
A(
    "Open the studio: the balance chip in the header",
    "[Open the studio](/workspace/rodin): the balance chip in the header",
)
A(
    "Second, the OmniCraft toolbag is credit-free",
    "Second, the [OmniCraft toolbag](/workspace/omnicraft) is credit-free",
)
A(
    "Every credit article in this blog quotes the",
    "Every credit article in this blog quotes [the constants](/blog/how-many-credits-does-each-hyper3d-generation-cost) from the",
)
A(
    "an engine error — the cancel/failure handling refunds",
    "an engine error — the [cancel/failure handling](/blog/are-credits-returned-after-canceling-a-generation) refunds",
)
A(
    "For the pay-by-result tasks the studio creates today",
    "For the pay-by-result tasks [the studio](/workspace/rodin) creates today",
)
A(
    "that one has a real answer in the expiry article:",
    "that one has a real answer in the [expiry article](/blog/do-hyper3d-credits-expire):",
)

# ------------------------------------------------- file B — support & account
B(
    "understand why (see the failure article",
    "understand why (see [the failure article](/blog/why-did-my-hyper3d-generation-fail)",
)
B(
    "The Help Center's enterprise topic makes the same point",
    "The [Help Center's enterprise topic](/help/enterprise) makes the same point",
)
B(
    "The Fulfillment Policy page in the Legal Center",
    "The [Fulfillment Policy page](/legal/fulfillment) in the Legal Center",
)
B(
    "the model viewer should parse your file",
    "the [model viewer](/workspace/omnicraft/viewer) should parse your file",
)
B(
    "generation costs should trace to the 1/10 constants",
    "generation costs should trace to [the 1/10 constants](/blog/how-many-credits-does-each-hyper3d-generation-cost)",
)
B(
    "On the pay-by-result flow — what the studio creates —",
    "On the pay-by-result flow — what [the studio](/workspace/rodin) creates —",
)
B(
    "the Format Convertor re-exports tasks you generated",
    "the [Format Convertor](/workspace/omnicraft/formatcon) re-exports tasks you generated",
)

# --------------------------------------------- file C — modes & tools guides
C(
    "export in any of the six real formats and re-export in others for free",
    "export in any of the six real formats and [re-export in others for free](/workspace/omnicraft/formatcon)",
)
C(
    "Image generation here is reference-driven",
    "[Image generation](/features/image-to-3d) here is reference-driven",
)
C(
    "crop the object you care about and use Image to 3D",
    "crop the object you care about and use [Image to 3D](/features/image-to-3d)",
)
C(
    "the general studio will happily build",
    "the [general studio](/workspace/rodin) will happily build",
)
C(
    "the studio's material redo re-paints",
    "the [studio](/workspace/rodin) material redo re-paints",
)
C(
    "the model viewer opens GLB, GLTF, OBJ, and STL locally",
    "the [model viewer](/workspace/omnicraft/viewer) opens GLB, GLTF, OBJ, and STL locally",
)
C(
    "plus the local model viewer for any GLB/G",
    "plus the [local model viewer](/workspace/omnicraft/viewer) for any GLB/G",
)
C(
    "Open the connect modal from the studio",
    "Open the [connect modal](/workspace/rodin) from the studio",
)
C(
    "stated as gaps on the feature page",
    "stated as gaps on the [feature page](/features/mcp)",
)

# ------------------------------------------------ file D — the format family
D(
    "the model viewer parses it locally",
    "the [model viewer](/workspace/omnicraft/viewer) parses it locally",
)
D(
    "The comparison article in this blog cove",
    "The [comparison article](/blog/glb-vs-gltf) in this blog cove",
)
D(
    "the model viewer parses OBJ locally for inspection",
    "the [model viewer](/workspace/omnicraft/viewer) parses OBJ locally for inspection",
)
D(
    "export binary STL, and drop it straight into a slicer",
    "export binary STL, and drop it straight into a slicer",
)
D(
    "confirm it (the 1-credit moment)",
    "confirm it ([the 1-credit moment](/blog/how-many-credits-does-each-hyper3d-generation-cost))",
)
D(
    "The modern fix is 3MF (colors plus units",
    "The modern fix is [3MF](/blog/what-is-3mf-file) (colors plus units",
)
D(
    "Going to the web: neither — GLB.",
    "Going to the web: neither — [GLB](/blog/what-is-glb-file).",
)
D(
    "The fourth candidate people forget is GLB",
    "The fourth candidate people forget is [GLB](/blog/what-is-glb-file)",
)
D(
    "The tools tree's converter pages carry the same sta",
    "The [tools tree's converter pages](/tools/converter/3mf/to/stl) carry the same sta",
)
D(
    "export OBJ or STL, import into your CAD application's mesh pathway",
    "export [OBJ or STL](/blog/obj-vs-stl), import into your CAD application's mesh pathway",
)
D(
    "The ControlNet point-cloud constraint borrows the vocabulary",
    "The [ControlNet point-cloud constraint](/features/text-to-3d) borrows the vocabulary",
)
D(
    "this codebase's converter works on your confirmed tasks",
    "this codebase's [converter](/workspace/omnicraft/formatcon) works on your confirmed tasks",
)
D(
    "Want 3MF? Export STL,",
    "Want [3MF](/blog/what-is-3mf-file)? Export STL,",
)
D(
    "This pipeline writes binary STL (the six-format boundary",
    "This pipeline writes [binary STL](/blog/what-is-stl-file) (the six-format boundary",
)

# --------------------------------------------- file E — prompts & converters
E(
    "the entire commercial surface is one tier at $0",
    "the entire commercial surface is [one tier at $0](/pricing)",
)
E(
    "and the convertor re-emits STL from any confirmed task later for free",
    "and the [convertor](/workspace/omnicraft/formatcon) re-emits STL from any confirmed task later for free",
)
E(
    "For print, the same prompt-level rules from text-to-STL apply",
    "For print, the same prompt-level rules from [text-to-STL](/blog/text-to-stl) apply",
)
E(
    "the DXF article covers that boundary",
    "the [DXF article](/blog/what-is-dxf-file) covers that boundary",
)
E(
    "the topology topic page in this catalog marks",
    "the [topology topic page](/blog/mesh-topology-3d) in this catalog marks",
)
E(
    "ControlNet constraints are the spatial half of prompting",
    "[ControlNet constraints](/features/text-to-3d) are the spatial half of prompting",
)

# ---------------------------------------------------------------------- apply

BASE = "/home/z/my-project/hyper3d-clone/src/lib/blog-content-{}.ts"
files = {c: open(BASE.format(c)).read() for c in "abcde"}

errors = []
for c, old, new in MAP:
    n = files[c].count(old)
    if n != 1:
        errors.append(f"  file {c}: anchor count {n}: {old[:70]!r}")

if errors:
    print("ANCHOR ERRORS:")
    print("\n".join(errors))
    sys.exit(1)

if "--check" in sys.argv:
    total = len(MAP)
    per = {}
    for c, _, _ in MAP:
        per[c] = per.get(c, 0) + 1
    print(f"all {total} anchors unique: {per}")
    sys.exit(0)

for c, old, new in MAP:
    files[c] = files[c].replace(old, new)

for c, content in files.items():
    open(BASE.format(c), "w").write(content)

print(f"applied {len(MAP)} inline links")
