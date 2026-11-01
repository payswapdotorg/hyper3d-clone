#!/usr/bin/env python3
"""t81 pass 2 — the second authoring wave: every article that got zero or
one link in pass 1, plus density boosts for the class-A format articles.
Same rules: every anchor exactly once, --check to validate only."""

import sys

MAP: list[tuple[str, str, str]] = []


def add(c, old, new):
    MAP.append((c, old, new))


# --- what-is-fbx-file ---
add("d", "the workaround is GLB in, convert in the DCC",
    "the workaround is [GLB](/blog/fbx-vs-glb) in, convert in the DCC")
# --- what-is-3mf-file ---
add("d", "STL's austerity — triangles, nothing else — means unit ambiguity",
    "[STL's austerity](/blog/what-is-stl-file) — triangles, nothing else — means unit ambiguity")
add("d", "the converter pages say so per pair",
    "the [converter pages](/tools/converter/3mf/to/stl) say so per pair")
# --- what-is-usdz ---
add("d", "Combined with the six-format convertor, USDZ is also free to produce later",
    "Combined with the [six-format convertor](/workspace/omnicraft/formatcon), USDZ is also free to produce later")
add("d", "The use case writes itself: generate an object, confirm it, export USDZ",
    "The use case writes itself: [generate an object](/workspace/rodin), confirm it, export USDZ")
# --- glb-vs-gltf ---
add("d", "The model viewer parses both locally; the convertor re-emits either from any confirmed task for free",
    "The [model viewer](/workspace/omnicraft/viewer) parses both locally; the [convertor](/workspace/omnicraft/formatcon) re-emits either from any confirmed task for free")
add("d", "GLB's single-file property is a deployment feature",
    "[GLB's single-file property](/blog/what-is-glb-file) is a deployment feature")
# --- fbx-vs-glb ---
add("d", "works in the local model viewer) always do",
    "works in the [local model viewer](/workspace/omnicraft/viewer)) always do")
add("d", "GLB is the open standard (glTF's binary container",
    "[GLB](/blog/what-is-glb-file) is the open standard (glTF's binary container")
# --- what-is-glb-file boost ---
add("d", "and the format convertor will re-emit any confirmed task as GLB for free",
    "and the [format convertor](/workspace/omnicraft/formatcon) will re-emit any confirmed task as GLB for free")
# --- what-is-obj-file boost ---
add("d", "The classic workflow this supports: generate here",
    "The classic workflow this supports: [generate here](/workspace/rodin)")
# --- what-is-stl-file boost ---
add("d", "The pipeline here supports the print-bound workflow directly: generate your object",
    "The pipeline here supports the print-bound workflow directly: [generate your object](/workspace/rodin)")
# --- stl-vs-obj-vs-fbx boost ---
add("d", "FBX (Autodesk-shaped pipelines",
    "[FBX](/blog/what-is-fbx-file) (Autodesk-shaped pipelines")

# --- image-to-3d ---
add("e", "Exports and re-exports in GLB, glTF, FBX, OBJ, STL, USDZ cost nothing further",
    "Exports and [re-exports](/workspace/omnicraft/formatcon) in GLB, glTF, FBX, OBJ, STL, USDZ cost nothing further")
add("e", "Confirm & Export is the single charge — 1 credit standard, 10 for the agentic type",
    "Confirm & Export is the single charge — 1 credit standard, 10 for [the agentic type](/blog/use-rodin-agentic-mode-for-image-to-3d)")
# --- how-to-convert-image-to-3d-model ---
add("e", "then export GLB for the web, OBJ for editing, STL for printing",
    "then export [GLB for the web](/blog/what-is-glb-file), OBJ for editing, [STL for printing](/blog/what-is-stl-file)")
add("e", "Confirm & Export, the single 1-credit moment",
    "Confirm & Export, [the single 1-credit moment](/blog/how-many-credits-does-each-hyper3d-generation-cost)")
# --- 3d-text-prompt-guide ---
add("e", "then silhouette (ControlNet if wrong), then materials",
    "then silhouette ([ControlNet](/features/text-to-3d) if wrong), then materials")
add("e", "What burns credits without burning quality",
    "What burns [credits](/blog/how-many-credits-does-each-hyper3d-generation-cost) without burning quality")
add("e", "the aesthetic frame ('low poly', 'stylized', 'photorealistic')",
    "the aesthetic frame ('low poly', 'stylized', 'photorealistic') — with [whole style pages](/styles/low-poly) to anchor the frame")
# --- 3d-prompt-engineering ---
add("e", "The prompt steers identity and materials; the ControlNet constrains space",
    "The prompt steers identity and materials; [the ControlNet](/features/text-to-3d) constrains space")
add("e", "previews are free at every tier, so the expensive pass should be the last pass",
    "[previews are free at every tier](/blog/how-many-credits-does-each-hyper3d-generation-cost), so the expensive pass should be the last pass")
# --- free-text-to-3d-model ---
add("e", "Fifty standard confirms — fifty meshes you previewed, liked, and exported. Five agentic runs.",
    "Fifty standard confirms — fifty meshes you previewed, liked, and exported. [Five agentic runs](/blog/use-rodin-agentic-mode-for-image-to-3d).")
# --- generate-3d-game-assets ---
add("e", "style-anchored prompts ('low poly', 'stylized', 'hand-painted')",
    "[style-anchored prompts](/blog/3d-text-prompt-guide) ('low poly', 'stylized', 'hand-painted')")
add("e", "Formats: GLB is the engine-friendly default (one file, materials included)",
    "Formats: [GLB is the engine-friendly default](/blog/what-is-glb-file) (one file, materials included)")
# --- how-to-make-3d-models-with-ai ---
add("e", "structure the prompt (object, material, modifiers)",
    "[structure the prompt](/blog/3d-text-prompt-guide) (object, material, modifiers)")
# --- image-to-stl ---
add("e", "The vision step is the quality lever",
    "[The vision step](/features/image-to-3d) is the quality lever")
# --- text-to-3d-model ---
add("e", "and structure beats length: object, then material, then modifiers",
    "and [structure beats length](/blog/3d-text-prompt-guide): object, then material, then modifiers")
# --- text-to-stl ---
add("e", "Confirmed tasks export binary STL directly",
    "Confirmed tasks export [binary STL](/blog/what-is-stl-file) directly")

# --- create-hdri-skyboxes-with-omnicraft ---
add("c", "a seeded generator fills in everything you left unsaid",
    "[a seeded generator](/workspace/omnicraft/hdri) fills in everything you left unsaid")
add("c", "export your confirmed task as GLB, load it in your renderer",
    "export your confirmed task as [GLB](/blog/what-is-glb-file), load it in your renderer")
# --- use-bang-and-partial-edit ---
add("c", "the 1-credit meter and the six real exporters are the expensive parts",
    "the [1-credit meter](/blog/how-many-credits-does-each-hyper3d-generation-cost) and the six real exporters are the expensive parts")
add("c", "Decompose-later: generate the whole object here",
    "Decompose-later: [generate the whole object here](/workspace/rodin)")
# --- choose-rodin-model-and-generation-settings ---
add("c", "the richer task surface the MCP modal advertises",
    "the richer task surface [the MCP modal](/features/mcp) advertises")
add("c", "the standard pipeline versus the agent-ready tier",
    "the standard pipeline versus [the agent-ready tier](/blog/use-rodin-agentic-mode-for-image-to-3d)")
# --- use-rodin-agentic-mode-for-image-to-3d ---
add("c", "Create a RodinAgentic task and three things differ",
    "[Create a RodinAgentic task](/workspace/rodin) and three things differ")
add("c", "it exists so the MCP surface can hand",
    "it exists so [the MCP surface](/features/mcp) can hand")
# --- how-to-reset-hyper3d-password ---
add("b", "signup is instant, costs nothing, and grants a fresh 50 credits",
    "signup is instant, costs nothing, and grants [a fresh 50 credits](/blog/how-many-credits-does-each-hyper3d-generation-cost)")
# --- can-i-log-in-to-hyper3d-with-a-verification-code ---
add("b", "the same absence the password-reset article documents",
    "the same absence [the password-reset article](/blog/how-to-reset-hyper3d-password) documents")
# --- does-hyper3d-support-languages-besides-english ---
add("b", "translating the studio, the help tree, this blog, and every status page",
    "translating the studio, [the help tree](/help), this blog, and every status page")

BASE = "/home/z/my-project/hyper3d-clone/src/lib/blog-content-{}.ts"
files = {c: open(BASE.format(c)).read() for c in "abcde"}

errors = []
for c, old, new in MAP:
    if old == new:
        errors.append(f"  file {c}: NO-OP anchor: {old[:60]!r}")
        continue
    n = files[c].count(old)
    if n != 1:
        errors.append(f"  file {c}: anchor count {n}: {old[:70]!r}")

if errors:
    print("ANCHOR ERRORS:")
    print("\n".join(errors))
    sys.exit(1)

if "--check" in sys.argv:
    per = {}
    for c, _, _ in MAP:
        per[c] = per.get(c, 0) + 1
    print(f"all {len(MAP)} anchors unique: {per}")
    sys.exit(0)

for c, old, new in MAP:
    files[c] = files[c].replace(old, new)
for c, content in files.items():
    open(BASE.format(c), "w").write(content)
print(f"applied {len(MAP)} more inline links")
