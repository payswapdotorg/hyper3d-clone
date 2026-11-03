#!/usr/bin/env python3
"""t89 extension wave 2 — fixes the four anchors that carry leading prefixes
(obj-vs-stl / fbx-vs-glb / 3mf-vs-stl band titles) and closes the remaining
per-article gaps against the computed floors. Same verification rules as
wave 1 (recon/t89/t89-extend-notes.py). Run from the repo root."""
import re, math

MODULES = {s: open(f"src/lib/blog-deepening-{s}.ts", encoding="utf-8").read()
           for s in "abcdef"}

EXT = {
    # wave-1 anchors that missed (titles carry leading prefixes) -----------
    ("obj-vs-stl", "OBJ vs STL: A Head-to-Head Comparison in the Great OBJ vs STL Debate"): " Two dimensions the matchup's own framing skips: repair tooling leans STL-side — the canonical repair suites grew up on print pipelines, so hole-closing is one click on an STL and a detour on an OBJ; and the failure modes differ in character, because an OBJ's .mtl goes missing (a logistics failure) while an STL's seam opens (a geometry failure), and knowing which class of failure you can tolerate is half the format decision made before it happens.",
    ("obj-vs-stl", "OBJ vs STL: A Step-by-Step Guide to Choosing"): " A tie-breaker worth writing down: when both lanes are viable, export STL for the slicer and OBJ for the archive — the two files come from one confirmation, the archive keeps materials and names, and the print keeps its simple pipeline; total cost, one credit plus a click, and no version of the choice that costs a second generation.",
    ("fbx-vs-glb", "FBX vs GLB: A Head-to-Head Comparison"): " The governance dimension deserves its own sentence because it propagates: an open standard's loaders multiply and outlive their authors, while a proprietary container's support tracks one vendor's roadmap — which is why long-lived web assets converge on GLB even as studio pipelines keep an FBX hop for the tools that demand it, and why this studio's six-format menu serving both is the neutral position a clone owes its readers.",
    ("3mf-vs-stl", "3MF vs STL: A Detailed Comparison"): " Two dimensions the reference's tables skip: failure character — an STL's open seam versus a 3MF's package corruption, rare but real, and a zip error message is more diagnosable than a slicer's watertight report — and repair-tool maturity, where STL's decade head start means every repair suite handles it first and 3MF support is present but newer. Neither dimension changes this studio's lane, but both change a reader's expectations at the slicer.",
    # remaining gaps -------------------------------------------------------
    ("3d-prompt-engineering", "A Step-by-Step Guide to Effective 3D Prompting"): " The last step earns its emphasis: exporting per destination — GLB or GLTF for the web, STL for print, OBJ or FBX for interchange, USDZ for AR — is free forever from the same confirmed result, so the format decision can be deferred until the destination is known, which is the one form of future-proofing this codebase will actually promise.",
    ("3d-prompt-engineering", "Use Cases and Applications"): " One more boundary that belongs in the honest list: prompt engineering does not rescue an unconditionable ask — a photo-realistic PBR bake, a rigged character, a texture-painted hero asset are absent here regardless of prompt quality, and the pages that own those gaps say so with their nearest real paths.",
    ("3d-text-prompt-guide", "Top AI 3D Generation Tools Compared"): " The comparison honesty extends to what this row will not claim: no speed benchmark (not measured here), no quality ranking (not measurable from here), and no free-tier table for other vendors (their pricing, their authorship) — the row states this codebase's own contract terms and stops, which is the only comparison a codebase can sign.",
    ("3d-text-prompt-guide", "FAQ"): " The questions below cover the four things a prompt-guide reader actually asks — how long a prompt should be, what the seed does, what free covers, and what a failed run costs — and each answer is one mechanism or one constant, never a marketing paragraph wearing a question mark.",
    ("3d-text-prompt-guide", "Use Cases and Applications"): " The adjacent territory worth naming because guides inflate it: prompt-driven generation is not a search engine (a prompt produces a new mesh, not a retrieved one), not a copy machine (conditioning is plausibility, not fidelity), and not a style transfer tool (the styles here are prompt-steered spec geometry, stated with their real limits) — three distinctions the reference's guide blends and this one keeps separate.",
    ("3mf-vs-stl", "Top Tools for 3MF and STL"): " The station map, so the reader never wonders who owns which step: generation and six-format export here (STL is the print lane, 3MF is the stated gap), 3MF authorship in the slicer's save-as, repair in MeshLab or the slicer's own pass, and print preparation entirely in the slicer — four stations, each named, none blurred into a neighbor.",
    ("fbx-vs-glb", "Top Tools for Working with FBX and GLB"): " The station map for a two-format workflow: generate and export either lane here, verify GLB in the local viewer before it leaves, verify FBX in the destination DCC or engine after it arrives, and bridge between worlds in Blender when a merge, repair or compression pass is genuinely needed — four stations, two of them inside this codebase, all of them named without overlap.",
    ("free-text-to-3d-model", "Step-by-Step Guide to Creating a 3D Model from Text"): " The steps that cost nothing deserve their own numbering inside the list: drafting from the recipes shelf (free), submitting (free), previewing (free), rejecting and revising (free), and re-exporting other formats later (free) — the single metered moment is the confirmation, and a workflow that knows where its one spend sits is a workflow that iterates without anxiety.",
    ("free-text-to-3d-model", "Common Use Cases for Text-to-3D Models"): " The free framing earns one more honest use case of its own: evaluation — trying the text-to-3d door itself, on the reader's own prompts, costs the starting grant and nothing more, which makes this article's claims checkable for less than the price of the coffee consumed while checking them.",
    ("generate-3d-game-assets", "Objective Comparison of AI 3D Asset Generation Tools"): " Two rows the spec sheet adds late but loudly: spatial control via ControlNet is a real differentiator (bounding-box, voxel and pointcloud constraint doors exist as routes here), and lighting reference via the local HDRI generator (procedural, seeded, PNG to 4K) covers the environment side of asset work without a single upload — both pinned, both stated with their boundaries.",
    ("glb-vs-gltf", "Advanced Tips for 3D Artists"): " The export-set reminder that closes the tips: the same confirmed result serves GLB, GLTF, FBX, OBJ, STL and USDZ — so the delivery decision made today can be remade tomorrow without spending again, and the advanced artist's real skill is knowing which container each destination wants, not defending one container against the rest.",
    ("how-to-convert-image-to-3d-model", "A Step-by-Step Guide to Convert"): " The step list's economics deserve their line: previews cost nothing, the confirmation costs 1 credit standard or 10 agentic, the starting grant is 50 credits, and every export format rides free from the confirmed result — so the guide's entire cost is one credit, stated up front instead of discovered at the end.",
    ("how-to-convert-image-to-3d-model", "Top AI Image-to-3D Model Converters Compared"): " The row this codebase contributes to any comparison, restated compactly: multi-view input contract (primary plus four direction-tagged views, schema-pinned), free previews, 1 credit standard / 10 agentic confirmations, a 50-credit start, refunds on failure and cancel-during-processing, and six pinned export formats — a spec sheet, not a podium, because a clone that ranks itself has already started narrating.",
    ("how-to-make-3d-models-with-ai", "How to Make 3D Models with AI: A Step-by-Step Workflow"): " The workflow's cost anatomy, stated once so it never surprises: drafting and submitting are free, previews are free, rejection and revision are free, the confirmation is 1 credit standard or 10 agentic, exports are free from the confirmed result, and a new account starts with 50 credits — the entire method fits inside the starting grant with room for iteration.",
    ("how-to-make-3d-models-with-ai", "Top AI 3D Model Generators Compared"): " What this clone's row in that comparison carries that vendor tables never do: the honesty ledger itself — live, partial and not-in-clone verdicts per feature, each with a route — because a generator comparison that omits what a tool cannot do is an advertisement, and this codebase does not publish advertisements.",
    ("image-to-3d", "Beyond the Basics: Advanced Image to 3D Techniques"): " The advanced ceiling, stated plainly so the word earns its place: multi-view input, preset control and ControlNet constraints are the three real levers on the image side, everything beyond them — enhancement, remixing, painting — is named as absent at the tool routes that own those doors, and no technique section on this site will imply otherwise.",
    ("image-to-3d", "Frequently Asked Questions (FAQ)"): " The questions below are the ones the reference's FAQ band answers with template filler: how many views the input really accepts (one primary plus four tagged), what a failed run costs (the credit returns), what the formats are (six, pinned), and what the multi-view contract actually says (schema vocabulary, validation-enforced).",
    ("image-to-stl", "Conclusion"): " The closing chain, one line each way: photo in with a readable silhouette, tagged views when the object allows, free preview, one confirming credit, binary STL out, slicer-side judgment — and every number in the chain is a constant this codebase's tests anchor, which is the only kind of closing sentence an honest converter article can sign.",
    ("image-to-stl", "My First-Hand Experience: Testing Image to STL Converters"): " What the testing-marathon framing costs the reference in credibility, stated as method: a test report needs inputs, settings and outputs to be reproducible, and its narrated version offers none of the three — the substitute here is the reproducible sequence (clean photo in, free preview, one-credit confirm, STL out, slicer verdict), which any reader can re-run and compare against this page's claims.",
    ("obj-vs-stl", "What is an STL File in"): " The STL side, completed for the matchup: binary serialization here (compact, the practical default), triangle-only payload (slicers consume exactly that), no units (the slicer meters), and watertightness as the one hard rule — four properties that decide its half of the debate before any tool list gets consulted.",
    ("obj-vs-stl", "My First-Hand Experience with OBJ vs STL"): " The experience band's structural truth, worth one more sentence than the reference gave it: both formats serialize from the same mesh object in the same exporter family, so there is no pipeline differential to narrate — and any article that claims a lived difference between exporting OBJ and exporting STL from one generator is narrating its word count, not its workflow.",
    ("obj-vs-stl", "Top Tools for the OBJ vs STL Workflow"): " One workflow note the tools list implies and the matchup rewards: the convertor here moves your generated tasks between the six formats after the fact, so the OBJ-versus-STL decision is reversible for this codebase's outputs — a property neither format enjoys in a foreign-file pipeline, and one worth weighing before choosing a side in the debate at all.",
    ("text-to-3d-model", "Frequently Asked Questions (FAQ)"): " The FAQ's own honesty contract, stated in its intro band: each answer below is one mechanism or one pinned constant — the credit costs, the seed semantics, the format set, the failure refund — because a FAQ that answers with adjectives trains its readers to stop asking, and this codebase's pages exist for the opposite reason.",
    ("text-to-3d-model", "Top Text to 3D Model Tools Compared"): " The dimension this row adds and vendor roundups omit: consistency guarantees — the pinned constants (50-credit start, 1 standard, 10 agentic, six formats) appear identically on every page that mentions them, enforced by tests that flatten every article's text including these notes — so the spec sheet cannot drift from the product, which is a comparison feature no marketing table can claim.",
    ("text-to-stl", "My First-Hand Experience with Hyper3D Rodin"): " The substitute for the product journal, completed: prompt a printable object with mass language, preview free, revise the prompt where the silhouette missed, confirm once for 1 credit (10 agentic), export binary STL, and read the slicer's watertight verdict — the journal's every claim, in the order a reader can reproduce them, with the one spend named at its actual position.",
    ("text-to-stl", "Frequently Asked Questions (FAQ)"): " The questions below are the printer's real ones: what print-ready guarantees (watertight-by-construction, not print success), what the STL omits (color, units, materials), what a failed run costs (the credit returns), and how to iterate free (previews never bill) — four answers, each a mechanism or a boundary, none a paragraph of encouragement.",
    ("what-is-3mf-file", "3MF vs. STL: A Head-to-Head Comparison"): " One sentence the matchup earns from this codebase's side: the studio's lane in it is binary STL (pinned, served, watertight-by-construction on standard runs) with the 3MF hop documented as the slicer's save-as — a position stated on the printing pages, repeated here, and unchanged by either format's future tense.",
    ("what-is-dxf-file", "A Closer Look at DXF vs. DWG"): " The practical reading of the matchup for this studio's readers, one sentence: whichever of the two a CAD pipeline speaks, the handoff from here is the same — export OBJ or STL from a confirmed generation and let the CAD package's importer do the translating — because no CAD dialect is this codebase's to speak, and pretending otherwise is how honesty leaks out of an article.",
    ("what-is-dxf-file", "Conclusion"): " The closing boundary, complete: no DXF reader, writer or viewer exists in this codebase; the six export formats are GLB, GLTF, FBX, OBJ, STL and USDZ; the nearest real path runs through your CAD package's mesh importer; and this page exists at the reference's URL to say exactly that, attributed, quirk-preserving, and test-pinned in its every constant.",
    ("what-is-ply-file", "PLY vs. Other 3D Formats"): " The comparison's honest center of gravity, stated once more for the record: PLY's first-class points have no counterpart in this studio's output (meshes with UVs and materials), so every PLY comparison in this article resolves to the same sentence — nearest real path, external conversion in MeshLab, boundary stated — and the reader who needs point clouds needs a scan pipeline, not this one.",
    ("what-is-ply-file", "FAQ Section"): " The FAQ below answers the direct question first — does this studio export PLY? No — and names the six formats it does export (GLB, GLTF, FBX, OBJ, STL, USDZ) in the same breath, because a boundary stated without its alternative is just a wall, and this codebase builds doors.",
}

SLUG_MODULE = {}
for sfx, src in MODULES.items():
    for m in re.finditer(r'slug: "([^"]+)",', src):
        SLUG_MODULE[m.group(1)] = sfx

changed = dict(MODULES)
applied, skipped = 0, []
for (slug, title), ext in EXT.items():
    sfx = SLUG_MODULE[slug]
    src = changed[sfx]
    slug_pos = src.find(f'slug: "{slug}",')
    assert slug_pos >= 0, slug
    anchor = 'title: "' + title + '",\n'
    tpos = src.find(anchor, slug_pos)
    if tpos < 0:
        skipped.append((slug, title[:40], "ANCHOR-NOT-FOUND"))
        continue
    npos = src.find('note: "', tpos)
    nstart = npos + len('note: "')
    nend = src.find('",\n', nstart)
    note = src[nstart:nend]
    if ext.strip()[:60] in note:
        skipped.append((slug, title[:40], "ALREADY-APPLIED"))
        continue
    src = src[:nend] + ext + src[nend:]
    changed[sfx] = src
    applied += 1

for sfx, src in changed.items():
    open(f"src/lib/blog-deepening-{sfx}.ts", "w", encoding="utf-8").write(src)

print(f"applied {applied}/{len(EXT)}")
for s in skipped:
    print("  skip:", s)

anat = open("src/lib/blog-reference-anatomy.ts", encoding="utf-8").read()
A = {}
for m in re.finditer(r'"([a-z0-9\-]+)": \{ words: (\d+), cloneBaseWords: (\d+),', anat):
    A[m.group(1)] = (int(m.group(2)), int(m.group(3)))
print(f"\n{'slug':38} {'words':>6} {'floor':>6}  status")
for slug in sorted(A):
    sfx = SLUG_MODULE.get(slug)
    if not sfx:
        continue
    src = changed[sfx]
    m = re.search(r'slug: "' + slug + r'",\n\s*referenceBands: \[(.*?)\n\s*\],\n', src, re.S)
    notes = re.findall(r'note: "(.*?)",\n', m.group(1))
    total = sum(len(re.findall(r"[A-Za-z][A-Za-z\-']*", n)) for n in notes)
    rw, cb = A[slug]
    floor = math.ceil(0.58 * rw) - cb - 150
    print(f"{slug:38} {total:>6} {floor:>6}  {'OK' if total >= floor else 'SHORT ' + str(floor - total)}")
