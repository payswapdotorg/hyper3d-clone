#!/usr/bin/env python3
"""t89 extension pass — appends the second wave of honest note content to the
deepening modules, sized to the per-article floors computed from the captured
anatomy (0.58 x refWords - cloneBaseWords - 150). Each extension targets one
band of one article, identified by (slug, title); the script verifies every
anchor before writing and reports per-article word totals after.

Idempotent-ish: an anchor that no longer matches aborts that article loudly
rather than corrupting the file. Run from the repo root."""
import re, sys, math

MODULES = {s: open(f"src/lib/blog-deepening-{s}.ts", encoding="utf-8").read()
           for s in "abcdef"}

# (slug, band-title-prefix) -> extension sentences appended to that note
EXT = {
    # ---- module b -------------------------------------------------------
    ("what-is-fbx-file", "Top Tools"): " A note on the ASCII/binary trade when a file must travel far: some legacy FBX readers want binary and choke on text — Blender converts on export if a destination demands it, and this codebase states its flavor up front rather than leaving the reader to discover it in an error dialog.",
    ("what-is-fbx-file", "Advanced Tips"): " Also worth knowing: FBX declares a unit (centimeters by default in Autodesk tools), which is the one place it beats OBJ and STL on metering — set the destination's unit expectation once and the file's declaration does the rest.",
    ("what-is-dxf-file", "What Is DXF File? CAD"): " The data model difference is not cosmetic: a DXF circle is an entity with a center and a radius that a CAD kernel can dimension, while a mesh circle is a hundred flat triangles no kernel will ever treat as round — which is why round-tripping between the worlds loses meaning, not just precision.",
    ("what-is-dxf-file", "What is DXF file and its primary"): " The honest taxonomy of DXF consumers: drafting tools that round-trip it natively, CNC and laser pipelines that consume its contours, and GIS or survey flows that carry coordinates; none of those lanes begins from a generated mesh, so none of them is this studio's to claim.",
    ("what-is-dxf-file", "A Closer Look at DXF vs. DWG"): " One practical consequence of the licensing asymmetry worth recording: because DWG is closed, the exchange burden falls on DXF, and Autodesk's own converters are the reference implementation the ecosystem tests against — a governance fact that shapes every CAD interchange decision even when neither format appears in this codebase's export list.",
    ("what-is-dxf-file", "Working with DXF Files"): " The FreeCAD hop, spelled out: generate here, export OBJ or STL, File > Import in FreeCAD, then File > Export as DXF from the Draft workbench — two imports, one export, zero dollars, and each step names the tool that owns it.",
    ("what-is-ply-file", "What Is PLY File?"): " The format's origin story earns one paragraph because it explains its shape: Stanford's 1994 scanning project needed a container for range-scan data, and the Stanford Bunny — still the most-circulated test mesh in graphics — traveled as PLY, setting the convention that points are first-class and faces optional.",
    ("what-is-ply-file", "What is PLY file and what"): " The header is genuinely self-describing — the magic ply line, a format line declaring ASCII or binary with endianness, element declarations with property lists — so a reader learns the file's entire schema from the file itself, a property most newer formats traded away for compactness.",
    ("what-is-ply-file", "Key Features"): " Per-vertex color and normals are the properties that make PLY the scan pipeline's choice: a LiDAR return arrives as position plus intensity, a photogrammetry point as position plus color, and the format carries either without asking the data to pretend to be a mesh.",
    ("what-is-ply-file", "How to Open and View"): " CloudCompare deserves its naming even though nothing in this codebase wraps it: for pure point clouds it is the tool with the deepest PLY support, and for mesh-bearing files MeshLab remains the reference reader — both free, both desktop, both outside this clone's stated boundary.",
    ("what-is-3mf-file", "So, What is a 3MF file?"): " The OPC inheritance is the quiet strength: the same package discipline that makes Office documents inspectable makes a .3mf unzippable and its XML diffable — a maintenance property STL never had, and a real answer to the question of what a print file should be beyond the printer.",
    # ---- module c -------------------------------------------------------
    ("obj-vs-stl", "OBJ vs STL: Which Format"): " The deeper reason STL wins the print lane is consumption model: a slicer's first act is to intersect the mesh with a plane and produce toolpaths — an operation that wants triangle soup and ignores every richer structure, so OBJ's advantages are paid for and never spent on the way to the nozzle.",
    ("obj-vs-stl", "What is an OBJ File in"): " One more OBJ property that matters in the matchup: named groups let a single file carry parts, which slicers ignore and DCCs exploit — the reason OBJ remains the interchange choice even for workflows whose final output prints as STL.",
    ("obj-vs-stl", "A Head-to-Head Comparison"): " Repair tooling leans STL-side too: the canonical repair suites grew up on print pipelines, so hole-closing and re-meshing are one click on an STL and a detour on an OBJ. And the failure modes differ in character — an OBJ's .mtl goes missing (a logistics failure) while an STL's seam opens (a geometry failure) — and knowing which class of failure you can tolerate is half the format decision.",
    ("obj-vs-stl", "Top Tools for the OBJ vs STL"): " The studio's place in that chain is narrow and stated: it produces the mesh once, from a prompt or an image, and writes either serialization — the repair and conversion stations downstream belong to tools that have done those jobs for a decade and say so on their own menus.",
    ("obj-vs-stl", "A Step-by-Step Guide to Choosing"): " A tie-breaker worth writing down: when both lanes are viable, export STL for the slicer and OBJ for the archive — the two files come from one confirmation, the archive keeps materials and names, and the print keeps its simple pipeline; total cost, one credit plus a click.",
    ("glb-vs-gltf", "How They Work"): " The choice surfaces in the tool list too: this codebase's convertor writes all six lanes — GLB and GLTF alongside FBX, OBJ, STL and USDZ — so the container decision never binds the generation; the mesh exists once and serializes to whichever packaging the destination wants.",
    ("glb-vs-gltf", "Top Tools for these Formats"): " For completeness against the export set: the same confirmed result also serves FBX for engine import, OBJ for text interchange, STL for the print lane and USDZ for Apple AR — the pairing question in this article is really a sub-question of the six-way export menu, and every item on that menu is one click from the same result.",
    ("glb-vs-gltf", "My First-Hand Experience with these Tools"): " The economics that make the pairing painless: previews are free, a standard confirmation costs 1 credit and an agentic run 10, a new account starts with 50 credits, and either container serializes from the same confirmed result — the either/or costs nothing to reverse.",
    ("fbx-vs-glb", "FBX vs GLB: Best Format"): " One asymmetry worth leading with: FBX carries rigs and clips natively, which matters exactly when authored animation must travel — and this studio's generations are static meshes, so the animation advantage is real in the format and idle here, a distinction this article keeps visible instead of spending twice.",
    ("fbx-vs-glb", "A Head-to-Head Comparison"): " The governance dimension deserves its own sentence because it propagates: an open standard's loaders multiply and outlive their authors, while a proprietary container's support tracks one vendor's roadmap — which is why long-lived web assets converge on GLB and studio pipelines keep an FBX hop for the tools that demand it.",
    ("fbx-vs-glb", "Step-by-Step Guide: Converting FBX to GLB"): " The verification asymmetry repeats at the end of the route: the GLB side of the hop lands in the local viewer for a ten-second check, while the FBX side verifies in the destination DCC or engine — the same file discipline, two different benches.",
    ("3mf-vs-stl", "A Detailed Comparison"): " Two dimensions the reference's tables skip: failure character — an STL's open seam versus a 3MF's package corruption, rare but real, and a zip error message is more diagnosable than a slicer's watertight report — and repair-tool maturity, where STL's decade head start means every repair suite handles it first and 3MF support is present but newer.",
    ("3mf-vs-stl", "My First-Hand Experience with 3MF vs STL"): " The generation side of either lane costs the same: previews free, a standard confirmation 1 credit and an agentic run 10, a new account starting with 50 credits — the format choice happens after the only spend, which is why this article can be agnostic about it.",
    ("stl-vs-obj-vs-fbx", "Which Format Should You Use?"): " The one-click-ness is the point worth underlining: format choice never costs a second generation — the same confirmed result re-exports through the convertor or the export panel, and with a 50-credit starting grant covering the first fifty standard confirmations, only the confirmation itself (1 credit standard, 10 agentic) ever spends.",
    # ---- module d -------------------------------------------------------
    ("text-to-3d-model", "Text to 3D Model: How AI Converts"): " Two more mechanism facts that separate honest description from hand-waving: the pipeline's pacing is real state, not a spinner — the task row shows created, queued and processing because those are distinct states — and a stalled worker falls back rather than hanging, a behavior the failure article documents instead of hiding.",
    ("text-to-3d-model", "What is Text-to-3D and How Does"): " The presets deserve their sentence because they are the only real control surface: the version choice trades speed against quality in this codebase's own terms, privacy controls whether a generation can appear in public galleries, batch runs siblings in one submission, and the seed lock makes a prompt reproducible — four levers, each test-pinned, no hidden knobs claimed.",
    ("text-to-3d-model", "The Text to 3D Model Workflow"): " Two economics notes that change behavior: the seed lock means a prompt revision can differ from its sibling by exactly one edit (locked) or explore freely (unlocked), and the free-preview loop means the expensive mistake is confirming too early, not generating too often.",
    ("text-to-3d-model", "The Future of 3D Content Creation"): " What the reference's futurology misses by design: the honest near future is enumerable — the pinned list of what runs today, the stated gaps beside it, and the rule that the list changes only when the exporter or the pipeline changes, in a commit, with tests attached.",
    ("image-to-3d", "Image to 3D: Complete AI Photo-to-3D"): " The multi-view door deserves its sentence of emphasis because it is the input contract most pages undersell: one primary plus up to four direction-tagged views is corroboration the pipeline actually uses, and the schema's labels — front, back, left, right — are validation vocabulary, not documentation decoration.",
    ("image-to-3d", "Top AI Tools for Image to 3D"): " The comparison row that matters beyond features: nobody meters the preview here — the inspect-before-pay loop is the product's spine — and any comparison that skips preview pricing is comparing list prices while ignoring the actual bill.",
    ("image-to-3d", "A Step-by-Step Guide to Creating"): " On image selection, the two levers that observably move conditioning: silhouette readability (background clutter competes with the subject for the pipeline's attention) and lighting honesty (overlaid shadows read as geometry) — the images help article expands both with worked examples.",
    ("text-to-stl", "Text to STL: Generate 3D Print-Ready"): " The phrase print-ready also hides a unit decision the workflow must make consciously: the STL carries no meter, the slicer assumes one, and the preview's proportions are the only pre-export evidence — which is why checking scale in the slicer before committing filament is part of the chain, not an afterthought.",
    ("text-to-stl", "Top Text to STL Tools Compared"): " The spec-sheet comparison also states what it will not rank: other services' output quality is not measurable from here, so the row lists contract terms — input, cost, formats, refunds — and leaves quality to the reader's own preview, which is free in both senses of the word.",
    ("text-to-stl", "Step-by-Step Guide: From Text"): " One prompt-side lever specific to printing: mass language — solid, thick-walled, chunky — generates toward printable topology, and the styles recipes carry print-shaped examples with honest notes; the cheapest printability improvement happens before the first generation, in the sentence itself.",
    ("text-to-stl", "Use Cases and Applications for Text-to-STL"): " A use case this codebase supports that the reference's list never names honestly: same-day replacement of a broken plastic part, described from photographs of the pieces — the image door and the STL exit in one credit, with the multi-view schema carrying the two halves.",
    ("how-to-convert-image-to-3d-model", "How AI Converts an Image"): " The conditioning framing also sets expectations the converter framing cannot: an ambiguous photo yields a plausible mesh, not a faithful one, and the free preview is where plausibility gets judged — the difference between a tool that overpromises and one that shows its work before the bill.",
    ("how-to-convert-image-to-3d-model", "My First-Hand Experience with Hyper3D Rodin"): " The account economics worth stating in any honest guide: a new account starts with 50 credits, a standard confirmation costs 1 credit and an agentic run 10 — so a reader's entire first exploration, previews plus one confirmation plus six-format exports, fits inside the starting grant.",
    ("how-to-convert-image-to-3d-model", "Common Use Cases and Applications"): " The exclusions list earns one more entry for honesty: batch reconstruction of many photos into one scene — a photogrammetry-shaped ask this generation pipeline does not serve — is stated here so the reader does not discover it after spending a credit.",
    # ---- module e -------------------------------------------------------
    ("image-to-stl", "Image to STL Converter: Turn Any Photo"): " The any-photo promise also deserves its boundary sentence: photos of objects the pipeline cannot see around — glass, mirrors, hair-fine structures — condition poorly, and the preview says so for free; the honest version of any is any photo whose silhouette reads.",
    ("image-to-stl", "What is an Image to STL Converter"): " One more distinction the converter framing erases: a converter's output is deterministic — same input, same file — while a generator's output is conditioned, so the same photo yields plausible variation; that is why the seed lock exists and why re-submitting an ambiguous photo is a legitimate strategy rather than a defect.",
    ("image-to-stl", "Objective Comparison of Image to STL"): " The comparison dimension the spec sheet adds beyond the reference's table: refund behavior on failure — the credit returns when a task fails, and canceling during processing refunds — because a comparison that omits failure economics is comparing only the happy path, and the happy path is not where tools differ.",
    ("how-to-make-3d-models-with-ai", "How to Make 3D Models with AI: Step-by-Step"): " The presets panel is the part of the method most guides skip: version, privacy, batch and the lockable seed are the only pre-generation decisions, and each is named here because each is pinned — a method that names its variables is reproducible in a way a vibes-based one is not.",
    ("how-to-make-3d-models-with-ai", "Common Use Cases and Applications"): " One boundary worth its own sentence in any honest use-case list: nothing in this pipeline is an accuracy instrument — no dimension is guaranteed to a tolerance — so engineering and medical geometry are excluded by contract, not by caution.",
    ("free-text-to-3d-model", "Free Text to 3D Model Tools:"): " The no-plans part of the story deserves its sentence: there is no subscription, no trial countdown, no watermark tier — the starting grant and the per-confirmation price are the entire pricing surface, and [the plans article](/blog/how-much-do-hyper3d-plans-cost) carries the same statement with the constants pinned.",
    ("free-text-to-3d-model", "My First-Hand Experience with Hyper3D Rodin"): " One more free-tier fact that comparisons bury: cancellation during processing refunds the credit, so even the paid step is reversible up to the moment of completion — free turns out to be a gradient, and the gradient is stated rather than discovered.",
    ("generate-3d-game-assets", "How to Generate 3D Game Assets"): " The no-art-skills claim has an honest sibling: no modeling-time either — the pipeline replaces the modeling hours, and the engine's import dialog is the only manual step between prompt and project.",
    ("generate-3d-game-assets", "Conclusion"): " One closing line for the loop's every station: the prompt shelf, the free preview, the one-credit confirmation, the six-format export, and the engine that receives them — each either pinned here or named as external, which is the whole honesty contract applied to a workflow.",
    # ---- module f -------------------------------------------------------
    ("3d-text-prompt-guide", "3D Text Prompt Guide: How to Write"): " The prompt's anatomy, stated as spec: nouns carry identity — the object itself; adjectives carry form — proportions, mass, style; numbers carry spec — dimensions and counts; material words carry finish. A prompt that touches all four layers conditions better than one that repeats the noun four ways, which is the farm's signature mistake and the reason its pages read alike.",
    ("3d-text-prompt-guide", "3D Text Prompt Guide: What is a 3D Text Prompt?"): " The seed deserves one more sentence because it is the most misunderstood control: locking it does not improve quality — a common myth — it makes a prompt reproducible, which is a debugging property, not a quality property, and conflating the two is how prompt folklore starts.",
    ("3d-text-prompt-guide", "A Step-by-Step Workflow for Text-to-3D"): " The layer method has an inspection counterpart: read the preview in the same order you wrote — silhouette first, then proportions, then material response, detail last — because the layer that missed tells you which sentence to edit, and a wholesale rewrite throws away the layers that already worked.",
    ("3d-text-prompt-guide", "Use Cases and Applications"): " The honest use-case boundary for prompt guides themselves: a guide is only as honest as its examples are testable, which is why this one links every example to the recipes shelf where the notes state what each prompt actually produced — a guide that cannot be run is a brochure.",
    ("3d-prompt-engineering", "3D Prompt Engineering: Best Prompts"): " One law the engineering framing earns: the feedback loop is the engineering — a spec, an observation, a revision, a re-run — and the free preview is what makes the loop closable at zero cost, which is the entire difference between prompt engineering and prompt wishing.",
}

# which module file holds each slug (for anchor resolution)
SLUG_MODULE = {}
for sfx, src in MODULES.items():
    for m in re.finditer(r'slug: "([^"]+)",', src):
        SLUG_MODULE[m.group(1)] = sfx

changed = {s: src for s, src in MODULES.items()}
applied, skipped = 0, []
for (slug, prefix), ext in EXT.items():
    sfx = SLUG_MODULE[slug]
    src = changed[sfx]
    # find the band: title starting with prefix, within this slug's entry
    slug_pos = src.find(f'slug: "{slug}",')
    assert slug_pos >= 0, slug
    title_esc = prefix.replace("(", r"\(").replace(")", r"\)").replace("?", r"\?").replace(".", r"\.")
    m = re.compile(r'title: "' + title_esc + r'([^"]*)",\n\s*note: "(.*?)",\n', re.S).search(src, slug_pos)
    if not m:
        skipped.append((slug, prefix, "ANCHOR-NOT-FOUND"))
        continue
    note = m.group(2)
    if ext.strip()[:60] in note:
        skipped.append((slug, prefix, "ALREADY-APPLIED"))
        continue
    new_note = note + ext
    src = src[:m.start(2)] + new_note + src[m.end(2):]
    changed[sfx] = src
    applied += 1

for sfx, src in changed.items():
    open(f"src/lib/blog-deepening-{sfx}.ts", "w", encoding="utf-8").write(src)

print(f"applied {applied}/{len(EXT)} extensions")
for s in skipped:
    print("  skip:", s)

# report per-article totals against the computed floor
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
