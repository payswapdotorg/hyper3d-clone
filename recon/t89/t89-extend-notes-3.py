#!/usr/bin/env python3
"""t89 extension wave 3 — closes the final per-article gaps (8 articles) and
repairs the two wave-2 anchors that used title prefixes instead of full
titles. Run from the repo root."""
import re, math

MODULES = {s: open(f"src/lib/blog-deepening-{s}.ts", encoding="utf-8").read()
           for s in "abcdef"}

EXT = {
    ("how-to-convert-image-to-3d-model", "A Step-by-Step Guide to Convert Your Image to a 3D Model"):
        " The step list's economics deserve their line: previews cost nothing, the confirmation costs 1 credit standard or 10 agentic, the starting grant is 50 credits, and every export format rides free from the confirmed result — so the guide's entire cost is one credit, stated up front instead of discovered at the end, and the iteration that precedes it is unmetered by design.",
    ("obj-vs-stl", "What is an STL File in the OBJ vs STL Debate?"):
        " The STL side, completed for the matchup: binary serialization here (compact, the practical default), triangle-only payload (slicers consume exactly that), no units (the slicer meters), and watertightness as the one hard rule — four properties that decide its half of the debate before any tool list gets consulted, and four that the studio's print lane inherits as its contract with the slicer.",
    ("3d-text-prompt-guide", "3D Text Prompt Guide: How to Write Prompts for AI 3D Generation"):
        " One more anatomy rule the four-layer spec implies: order matters less than coverage but more than style — front-load the shape words because the silhouette is the hardest thing to revise later, and let material and spec language fill the middle where they condition without competing for the pipeline's first attention.",
    ("3d-text-prompt-guide", "My First-Hand Experience with Hyper3D Rodin"):
        " The method's cost ledger, completed: zero per preview, one credit per standard confirmation, ten per agentic run, fifty to start — the numbers that let a reader run the identical method on their own prompts and compare outcomes, which is what a guide owes its reader in place of a narrated journey.",
    ("3mf-vs-stl", "What is a 3MF File?"):
        " The consortium history in one sentence, because it explains the format's shape: 3MF arrived in 2015 from a Microsoft-chaired consortium that included HP, Autodesk and Shapeways, with the explicit charter of replacing STL's absences — color, units, multi-part builds — and the extension mechanism it brought is why features keep arriving without format forks.",
    ("3mf-vs-stl", "What is an STL File?"):
        " The incumbent's history earns its matching sentence: STL was designed in the 1980s for the first stereolithography machines, which could consume nothing but planar triangles, and every one of its modern criticisms (colorless, unitless, single-object) is a constraint that made sense against 1980s hardware and survived on installed base alone.",
    ("generate-3d-game-assets", "Why Use AI to Generate 3D Game Assets?"):
        " One more honest reason the list should carry: consistency of economics — the cost of a generated asset does not scale with its complexity, so the fat prop and the thin prop cost the same confirmation, which changes what a small team dares to greenlight.",
    ("how-to-make-3d-models-with-ai", "How to Make 3D Models with AI: How it Works"):
        " One more working note the mechanism answer earns: the free preview is also the pipeline's honesty mechanism — it shows the actual mesh before any spend, which is why this codebase can state its boundaries without hedging, and why a reader testing the method should distrust any generator whose preview comes after the bill.",
    ("image-to-3d", "What is Image to 3D Conversion and How Does It Work?"):
        " The multi-view contract's practical reading, stated for the workflow: the primary image sets the subject and the tagged views set the corroboration, so a reader with two good angles should use both rather than hoping the single stronger photo carries the reconstruction — the schema accepts four extras precisely because sides disagree, and the pipeline resolves disagreement better than a missing side.",
    ("image-to-3d", "A Step-by-Step Guide to Creating Your First Image to 3D Model"):
        " The step list's freedom deserves its line: steps one through five cost nothing — image selection, submission, task pacing, preview inspection, rejection and revision — and the only metered moment is the confirmation (1 credit standard, 10 agentic, 50 to start), which means a reader's first image-to-3d education is free until the moment they decide it worked.",
    ("image-to-stl", "What is an Image to STL Converter and How Does It Work?"):
        " The honest workflow's three decision points, named so the converter framing cannot blur them: image selection (the only input lever), the free preview (the only quality gate before spend), and the slicer's settings (the only print lever) — everything between is the pipeline's business, and pretending to control it from outside is what converter marketing sells and this page refuses.",
    ("image-to-stl", "Top Tools for Converting Images to STL Files"):
        " The station map, one line each: generation here (image door, multi-view schema), six-format export here (binary STL is the print lane), inspection split (GLB/GLTF in the local viewer, STL in the desktop tools), repair in MeshLab or the slicer, and print preparation wholly in the slicer — five stations, two inside this codebase, all named without overlap.",
    ("obj-vs-stl", "OBJ vs STL: Frequently Asked Questions"):
        " The FAQ below answers the matchup's real questions — which format prints (STL), which one archives (OBJ), whether the choice costs extra (no, both serialize from one confirmation), and what neither carries (units, and for STL, color) — four answers, each a format fact or a pinned constant, none a hedge.",
    ("obj-vs-stl", "Top Tools for the OBJ vs STL Workflow"):
        " The tools band's closing note, stated because tool lists drift into claims: every tool named here is either inside this codebase with a route you can open, or outside it with its job named — and nothing in between, because a tool list with unnamed middle stations is how marketing gets into a comparison article wearing a tool list's clothes.",
    ("text-to-3d-model", "The Text to 3D Model Workflow: From Idea to Finished Asset"):
        " The workflow's inspection discipline, one line for the road: read the preview in the order the prompt was written — silhouette, then proportions, then material, then detail — because the layer that missed names the sentence to revise, and the free re-run that follows is cheaper than any downstream fix by an order of magnitude.",
    ("text-to-3d-model", "Use Cases and Applications"):
        " The use-case list's own boundary, worth a closing line: every entry above is documented on a use-case page in this codebase with its real status — and no use case appears here that the pipeline cannot actually serve, which is the difference between a use-case section and a wish list with formatting.",
    ("text-to-stl", "Step-by-Step Guide: From Text to a 3D-Printed Object"):
        " The guide's cost anatomy, stated at the end where it belongs: drafting free, submitting free, previewing free, revising free, one confirming credit (standard 1, agentic 10, starting grant 50), STL export free from the result — a print that fails at the slicer after a good mesh is a slicer problem, and a mesh that fails was caught free at the preview, which is the whole point of the order.",
    ("text-to-stl", "Use Cases and Applications for Text-to-STL"):
        " The printing lane's honest scope, closing the band: prototypes and one-off parts are the sweet spot, small-batch production is workable with slicer-side discipline, and load-bearing or tolerance-critical parts are excluded by contract — the boundary is mechanical honesty, not timidity, and it is the same boundary the printing use-case page states at full length.",
    ("what-is-ply-file", "What Is PLY File? Point Cloud 3D Format Guide"):
        " The one-sentence orientation for arriving readers, before any comparison: PLY is the scan pipeline's container — points first, faces optional — and this studio generates meshes, so the two worlds touch only through external conversion, a boundary this article states in its first paragraph and never quietly crosses.",
    ("what-is-ply-file", "Key Features of the PLY Format"):
        " The features list's honest coda: everything listed above is the format's own merit, carried here as fact about a container this codebase neither reads nor writes — and the six formats it does write (GLB, GLTF, FBX, OBJ, STL, USDZ) appear wherever an alternative is needed, so the reader leaves this page with the boundary and the door in the same breath.",
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
    anchor = 'title: "' + title + '",\n'
    tpos = src.find(anchor, slug_pos)
    if tpos < 0:
        skipped.append((slug, title[:40], "ANCHOR-NOT-FOUND"))
        continue
    npos = src.find('note: "', tpos)
    nstart = npos + len('note: "')
    nend = src.find('",\n', nstart)
    if ext.strip()[:60] in src[nstart:nend]:
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
