/**
 * t89 deepening — module B: the format explainer articles (FBX / DXF / PLY /
 * 3MF), phase 1. Two of these formats (FBX, and the export-adjacent 3MF) sit
 * on opposite sides of this clone's honest boundary: FBX IS one of the six
 * real export formats (ASCII flavor), while DXF, PLY and 3MF are NOT — their
 * articles say so plainly and give the nearest real path instead of padding.
 *
 * Same contract as module A: verbatim reference h2 titles (captured) with
 * this clone's own honest answers as notes.
 */
import type { ReferenceBand } from "./blog-types";

export const BLOG_DEEPENING_B: { slug: string; referenceBands: ReferenceBand[] }[] = [
  {
    slug: "what-is-fbx-file",
    referenceBands: [
      {
        title: "What Is an FBX File? Autodesk Format Explained",
        note: "FBX is Autodesk's proprietary interchange format — the one Maya, 3ds Max, Unity and Unreal have shipped between for two decades. It carries meshes, skeletons, animation clips, blend shapes, materials and cameras, in both binary and ASCII serializations, inside an SDK Autodesk licenses rather than an open specification the community can extend. In this studio FBX is one of the six pinned export formats, written in the ASCII flavor: a confirmed generation leaves as a readable .fbx whose geometry, UVs and material reference open directly in Blender's importer, with GLB, GLTF, OBJ, STL and USDZ as the sibling lanes of the same export panel. The [feature census](/blog/what-features-does-hyper3d-have) pins the six-format set the export step actually serves.",
      },
      {
        title: "What is an FBX file? And what is fbx file?",
        note: "Both halves of this doubled, self-answering heading are the reference's own — the second half literally repeats the question in lowercase, a template artifact this clone records verbatim rather than paraphrasing away. The answer to either phrasing: FBX is a container, not a codec — it packages scene data for tool-to-tool transfer, and its durability comes from ecosystem (every DCC and engine reads it) rather than from openness. That is also why ASCII FBX specifically matters here: without an open spec, an independent exporter writing the readable flavor is the honest choice, and every claim this clone makes about its FBX output stops at what those bytes verifiably contain — geometry, UVs, normals, a material reference.",
      },
      {
        title: "How Do FBX Files Work?",
        note: "An FBX file is a property-graph: nodes for objects, connections between them, animation curves keyed over time, all serialized in either the compact binary layout or the text layout. The studio's ASCII write path serializes the confirmed mesh through the three.js exporter family — object node, geometry with per-vertex data, material binding — producing text a parser (and a patient human) can read line by line. What those files will not contain from here: skeletons and animation clips, because a standard text-to-3d or image-to-3d generation produces a static mesh, and the honest export reflects the generation rather than fabricating a rig. Blend shapes and cameras likewise ride only if the underlying generation carried them.",
      },
      {
        title: "Top Tools for Working with FBX Files",
        note: "The reference's band lists the Autodesk-adjacent toolchain. Real here: the export panel writes FBX from any confirmed task; the [format convertor](/workspace/omnicraft/formatcon) moves your generated tasks among the six supported formats, with its your-tasks boundary stated on its own page; the [local viewer](/workspace/omnicraft/viewer) loads GLB and GLTF only — FBX preview in this codebase is a stated non-feature, not a silent gap. Beyond this clone: Blender imports and exports FBX natively (its importer reads the ASCII this studio writes), Unity and Unreal consume it as a native asset, and Autodesk's own tools remain the format's home. The mesh-editor route carries the same boundary for editing: the real subset is orientation, material redo and ControlNet constraints, hosted sculpting is not-in-clone. A note on the ASCII/binary trade when a file must travel far: some legacy FBX readers want binary and choke on text — Blender converts on export if a destination demands it, and this codebase states its flavor up front rather than leaving the reader to discover it in an error dialog.",
      },
      {
        title: "Step-by-Step Guide to Using FBX Files",
        note: "1) Generate from a prompt or an image — the paced pipeline shows created, queued, processing, and the preview is free. 2) Confirm the good result once: 1 credit standard, 10 agentic, and new accounts start with 50 credits. 3) Export FBX (ASCII) from the result panel. 4) In Blender: File > Import > FBX — the mesh arrives with UVs and its material reference. 5) In Unity or Unreal: drop the file into the project; the static mesh imports as-is. 6) If the downstream tool prefers GLB (web) or OBJ (text-interchange), the convertor re-exports the same confirmed task without spending another credit on generation.",
      },
      {
        title: "My First-Hand Experience with FBX Files",
        note: "The reference's first-person band is its standing template — the same narrated familiarity appears across its format series, written by no one. The verifiable account from this side: a prompt or image enters, a preview renders before any spend, a confirmed result exports an ASCII FBX that Blender's stock importer opens without conversion. Each step is a mechanism this codebase runs; none of them needs an anecdote to be true, and the [import help article](/help/articles/import-models-into-hyper3d-tools) states the matching boundary — this studio ingests prompts and images, not FBX files.",
      },
      {
        title: "Advanced Tips for Working with FBX Files",
        note: "Honest limits first, because they shape the workflow: this clone's FBX output is ASCII (larger than binary — convert in Blender when size matters), static (no rig — retarget or rig in your DCC after import), and single-object per generation (compose scenes in the engine, not in the exporter). Levers that pay here: free-preview iteration to lock the silhouette before the one confirming credit; prompt-level material language so the imported mesh lands with usable base materials; and exporting GLB alongside FBX when the same asset serves both an engine and a web page — one confirmed result, two formats, no second generation spend. Also worth knowing: FBX declares a unit (centimeters by default in Autodesk tools), which is the one place it beats OBJ and STL on metering — set the destination's unit expectation once and the file's declaration does the rest.",
      },
      {
        title: "FAQ",
        note: "Answered below by this clone's own questions, each pinned to the running code. One-line verdict: FBX is the DCC/engine interchange lane of the six-format export set — ASCII flavor, geometry-and-material faithful, honestly static.",
      },
    ],
  },
  {
    slug: "what-is-dxf-file",
    referenceBands: [
      {
        title: "What Is DXF File? CAD Format for 3D Design",
        note: "DXF — Drawing Exchange Format — is AutoCAD's open-ish interchange: a tagged (group-code) text or binary encoding of drawing entities — lines, arcs, polylines, layers, blocks — and, in its 3D side, mesh and surface entities. It exists so drawings can move between CAD packages without DWG, and its home turf is drafting and manufacturing documentation, not mesh generation. The honest statement this clone owes under this heading: DXF is NOT one of this studio's six export formats. The export set is pinned as GLB, GLTF, FBX, OBJ, STL and USDZ — no CAD interchange at all — and that boundary is stated rather than blurred. The data model difference is not cosmetic: a DXF circle is an entity with a center and a radius that a CAD kernel can dimension, while a mesh circle is a hundred flat triangles no kernel will ever treat as round — which is why round-tripping between the worlds loses meaning, not just precision.",
      },
      {
        title: "What Is DXF File: The Origins and Evolution of the DXF Format",
        note: "Autodesk published DXF in 1982 as the interoperability escape hatch from its native DWG, and the format's history since is a pendulum: ASCII variants for portability, binary variants for size, AutoCAD releases adding entity classes faster than third parties adopted them, and the 2007 push toward an XML flavor that the ecosystem largely declined. None of that history changes the honest answer here: this codebase generates meshes from prompts and images and exports six formats; a CAD drafting exchange is a different domain with a different data model (entities with layers and precision semantics, not triangle soups), and no part of this studio pretends to bridge them.",
      },
      {
        title: "What is DXF file and its primary applications?",
        note: "Primary applications, concretely: 2D drafting exchange between CAD tools (floor plans, schematics, cut lists), CNC and laser-cutting pipelines that consume contour geometry, and survey/GIS round-trips. The nearest real paths from here, honestly drawn: generate the object with [text-to-3d](/features/text-to-3d) or [image-to-3d](/features/image-to-3d), export OBJ or STL, and run the CAD-side conversion in your drafting package's importer (most CAD tools ingest mesh formats for reference geometry). For pure 2D cutting contours, an SVG-first pipeline is the practical route — and this codebase's real SVG story is the reverse door, the [SVG-to-3D converter](/workspace/omnicraft/vecto3d), not a DXF out-path. The honest taxonomy of DXF consumers: drafting tools that round-trip it natively, CNC and laser pipelines that consume its contours, and GIS or survey flows that carry coordinates; none of those lanes begins from a generated mesh, so none of them is this studio's to claim.",
      },
      {
        title: "A Closer Look at DXF vs. DWG",
        note: "The reference's comparison, honestly summarized: DWG is Autodesk's native binary — smaller, richer, versioned with each release — while DXF is the published exchange twin — bulkier, more portable, occasionally lagging DWG features by a release. For this clone the comparison lands differently: neither format appears in the pinned export set, so the choice between them is a choice between CAD tools, not a choice this codebase participates in. The honest boundary holds in both directions — no DXF or DWG leaves the studio, and none enters it; the studio's inputs are text prompts and images, its outputs are the six mesh formats. One practical consequence of the licensing asymmetry worth recording: because DWG is closed, the exchange burden falls on DXF, and Autodesk's own converters are the reference implementation the ecosystem tests against — a governance fact that shapes every CAD interchange decision even when neither format appears in this codebase's export list. The practical reading of the matchup for this studio's readers, one sentence: whichever of the two a CAD pipeline speaks, the handoff from here is the same — export OBJ or STL from a confirmed generation and let the CAD package's importer do the translating — because no CAD dialect is this codebase's to speak, and pretending otherwise is how honesty leaks out of an article.",
      },
      {
        title: "Working with DXF Files: Software and Tools",
        note: "The reference's band surveys CAD packages. The tool story on this side, without padding: LibreCAD and QCAD read and write DXF for 2D work; FreeCAD bridges DXF into its 3D workbench and exports meshes to STL — which makes FreeCAD the honest hop if a generated asset must reach a DXF consumer: generate here, export OBJ or STL, import to FreeCAD, and export DXF from there. Inside this codebase the relevant real tools are the mesh-side ones — the [viewer](/workspace/omnicraft/viewer) for GLB/GLTF inspection and the [format convertor](/workspace/omnicraft/formatcon) for moving your generated tasks among the six supported formats. Neither tool names DXF, because neither tool touches it. The FreeCAD hop, spelled out: generate here, export OBJ or STL, File > Import in FreeCAD, then File > Export as DXF from the Draft workbench — two imports, one export, zero dollars, and each step names the tool that owns it.",
      },
      {
        title: "My First-Hand Experience with DXF Files",
        note: "The reference's narrated familiarity with CAD files is its template tell, and on this topic the honest local account is an absence described plainly: this clone has no DXF reader, writer or viewer, no CAD entity model, and no plans to claim one — the article you are reading is the boundary statement, kept at the URL the reference's sitemap lists because parity is the rule and honesty is the method. The real experience this codebase can narrate is the mesh pipeline's: prompt in, preview free, confirm for one credit, export in the six formats, and hand off to CAD tooling at the OBJ/STL boundary where CAD packages actually accept mesh geometry.",
      },
      {
        title: "Frequently Asked Questions (FAQ)",
        note: "The reference's FAQ band is answered below by this clone's own questions, including the one that matters most here — can this studio export DXF? No, and the answer states the six formats that ARE exported instead of hedging.",
      },
      {
        title: "Conclusion",
        note: "The reference restates its keyword and closes. This clone's closing is the boundary itself: DXF is a CAD exchange format outside this studio's six-format export set; the nearest real path runs through OBJ or STL plus your CAD package's importer; and this page exists to say exactly that, at the URL the reference's sitemap occupies. The closing boundary, complete: no DXF reader, writer or viewer exists in this codebase; the six export formats are GLB, GLTF, FBX, OBJ, STL and USDZ; the nearest real path runs through your CAD package's mesh importer; and this page exists at the reference's URL to say exactly that, attributed, quirk-preserving, and test-pinned in its every constant.",
      },
    ],
  },
  {
    slug: "what-is-ply-file",
    referenceBands: [
      {
        title: "What Is PLY File? Point Cloud 3D Format Guide",
        note: "PLY — the Stanford Polygon format — was built for scanned data: a header declaring elements (points and/or faces), then those elements in ASCII or binary. Its signature strength is the point cloud — per-point position, normal, color — which mesh formats treat as an afterthought. It remains the working format of scan pipelines and photogrammetry tools. The honest statement for this studio: PLY is NOT among the six pinned export formats (GLB, GLTF, FBX, OBJ, STL, USDZ), and more fundamentally this codebase generates meshes, not point clouds — there is no scan, no depth sensor, no photogrammetry pipeline here to produce the data PLY exists to carry. The format's origin story earns one paragraph because it explains its shape: Stanford's 1994 scanning project needed a container for range-scan data, and the Stanford Bunny — still the most-circulated test mesh in graphics — traveled as PLY, setting the convention that points are first-class and faces optional. The one-sentence orientation for arriving readers, before any comparison: PLY is the scan pipeline's container — points first, faces optional — and this studio generates meshes, so the two worlds touch only through external conversion, a boundary this article states in its first paragraph and never quietly crosses.",
      },
      {
        title: "What is PLY file and what is it used for?",
        note: "The self-questioning doubled heading is the reference's own template artifact, preserved verbatim. The plain answer: PLY files carry scanned or sampled geometry — LiDAR sweeps, photogrammetry dense clouds, structured-light scans — where the unit of data is the point, and polygon faces are optional second-class citizens. Used-for examples: 3D scanner exports, mesh-lab processing of scans, point-cloud visualization, and research datasets (Stanford's original bunny and armadillo still circulate as PLY). Nothing in this clone produces that data shape: the generation pipeline outputs textured meshes from prompts and images, and the export step serializes those meshes into the six formats. The gap is structural, stated here once, and not papered over with format-conversion promises. The header is genuinely self-describing — the magic ply line, a format line declaring ASCII or binary with endianness, element declarations with property lists — so a reader learns the file's entire schema from the file itself, a property most newer formats traded away for compactness.",
      },
      {
        title: "Key Features of the PLY Format",
        note: "The format's real features, accurately: a readable header (magic, format, element declarations with per-element properties) that makes files self-describing; both ASCII and binary serializations; arbitrary per-vertex properties beyond position — normals, colors, intensity, custom scalars; and elements beyond points and faces (edges, for some tools). The features this codebase offers that overlap in spirit: exports with per-vertex normals and UVs (in the six mesh formats), a local viewer for GLB/GLTF inspection, and the format convertor for your generated tasks. What does not exist here and is not claimed: point serialization, scan ingestion, or a PLY reader of any kind. Per-vertex color and normals are the properties that make PLY the scan pipeline's choice: a LiDAR return arrives as position plus intensity, a photogrammetry point as position plus color, and the format carries either without asking the data to pretend to be a mesh. The features list's honest coda: everything listed above is the format's own merit, carried here as fact about a container this codebase neither reads nor writes — and the six formats it does write (GLB, GLTF, FBX, OBJ, STL, USDZ) appear wherever an alternative is needed, so the reader leaves this page with the boundary and the door in the same breath.",
      },
      {
        title: "How to Open and View a PLY File",
        note: "Outside this clone, honestly: MeshLab (PLY's natural home, born in the scan-processing world), CloudCompare for pure point clouds, Blender with an importer add-on, and most scan-vendor tools. Inside this codebase the honest answer is that no tool opens PLY — the [local viewer](/workspace/omnicraft/viewer) loads GLB and GLTF only, and that boundary is stated on the viewer's own page. If a PLY must interact with this studio's world at all, the practical hop runs the other direction through third-party conversion to OBJ or GLB in MeshLab, after which the viewer will happily inspect the result — the studio remains a destination for mesh files it can actually parse. CloudCompare deserves its naming even though nothing in this codebase wraps it: for pure point clouds it is the tool with the deepest PLY support, and for mesh-bearing files MeshLab remains the reference reader — both free, both desktop, both outside this clone's stated boundary.",
      },
      {
        title: "My First-Hand Experience with PLY Files",
        note: "The reference's narrated scanning history is its template fiction. The account this clone can give is deliberately thinner and true: no PLY has ever passed through this codebase, because no PLY reader exists in it; what passes through is prompts in, previews free, one-credit confirmations, and six-format mesh exports. Where point clouds genuinely touch this project's neighborhood is the reference's ControlNet family — the pointcloud constraint door consumes point input for spatial control during generation — and that is a steering input, not a PLY pipeline, [the features page](/features) states the difference plainly.",
      },
      {
        title: "PLY vs. Other 3D Formats",
        note: "The honest comparison set: PLY versus OBJ — both are scan-era text-friendly formats, but OBJ is mesh-only while PLY treats points as first-class; PLY versus STL — STL is triangle-soup for printing, PLY carries per-point properties for scan work; PLY versus GLB — GLB is the web delivery container with PBR materials and animation, PLY is the scan interchange. In this studio's export matrix, only the GLB/OBJ/STL side of those comparisons exists — the six pinned formats — and the article's own boundary statement covers the rest. The [file-formats article](/blog/3d-file-formats) carries the full matrix with the same honesty. The comparison's honest center of gravity, stated once more for the record: PLY's first-class points have no counterpart in this studio's output (meshes with UVs and materials), so every PLY comparison in this article resolves to the same sentence — nearest real path, external conversion in MeshLab, boundary stated — and the reader who needs point clouds needs a scan pipeline, not this one.",
      },
      {
        title: "FAQ Section",
        note: "Answered below with this clone's questions, anchored to the running code — including the direct one: does this studio export PLY? No; the six formats it does export are named instead. The FAQ below answers the direct question first — does this studio export PLY? No — and names the six formats it does export (GLB, GLTF, FBX, OBJ, STL, USDZ) in the same breath, because a boundary stated without its alternative is just a wall, and this codebase builds doors.",
      },
    ],
  },
  {
    slug: "what-is-3mf-file",
    referenceBands: [
      {
        title: "What Is 3MF File? Next-Gen 3D Printing Format",
        note: "3MF is the 3D-printing format the consortium (Microsoft, HP, Autodesk, Shapeways and others) built to fix STL's absences: an OPC package (the same zip-with-XML structure as Office documents) carrying a mesh WITH color, materials, units, build-plate layout, and even print settings, validated by an open spec and extensions. It is what modern slicers and Windows' print stack prefer underneath. The honest statement here: 3MF is NOT one of this studio's six export formats — the pinned set is GLB, GLTF, FBX, OBJ, STL, USDZ — so the printing exit lane this codebase actually serves is binary STL, and the 3MF gap is stated in exactly those terms on the printing pages rather than blurred.",
      },
      {
        title: "So, What is a 3MF file? A Deeper Look",
        note: "The conversational opener is the reference's own phrasing, kept verbatim. The deeper look it invites: inside a .3mf unzip sit XML parts — a model part with vertices and triangles plus color and material assignments, a content-types manifest, optional extensions for slices, production and beam lattice. Units are declared (the default is micrometers per the spec's model unit vocabulary), which removes STL's metering ambiguity, and multiple objects with build-plate transforms mean one file can describe a whole print job. This clone's honest relationship to all of that machinery: none of it is generated here. The studio's export writes STL for printing; color-carrying prints need a GLB round-trip through a slicer that imports it, or post-print coloring. The OPC inheritance is the quiet strength: the same package discipline that makes Office documents inspectable makes a .3mf unzippable and its XML diffable — a maintenance property STL never had, and a real answer to the question of what a print file should be beyond the printer.",
      },
      {
        title: "What Is 3MF File: Key Features of the 3MF Format",
        note: "Features, accurately listed: color per triangle and per vertex; named materials with property sets; declared units and a build platform coordinate system; multiple objects per file with transforms; production metadata (part numbers, build sequences via extensions); OPC packaging with digital-signature support. The features this codebase actually offers the printing workflow: watertight-by-construction STL on standard generations, six-format export from any confirmed task, the [format convertor](/workspace/omnicraft/formatcon) for moving your tasks between those six, and free-preview iteration so the one confirming credit lands on a printable silhouette. The delta between the two lists is the honest gap, stated once here instead of being implied away.",
      },
      {
        title: "3MF vs. STL: A Head-to-Head Comparison",
        note: "The reference's own matchup, honestly settled: STL is universal, trivially simple, colorless and unitless; 3MF is richer, newer, color-capable, unit-declared and package-based. For this studio the comparison resolves to a route: generation here exports binary STL directly (the printing lane that exists), while 3MF is reachable one hop away — import the STL into a modern slicer and save-as 3MF there (PrusaSlicer, Bambu Studio and Orca all do it), gaining color and layout only if you add them in that hop. What this clone will not claim: direct 3MF writes, color fidelity it cannot serialize, or a packaging step that does not run here. One sentence the matchup earns from this codebase's side: the studio's lane in it is binary STL (pinned, served, watertight-by-construction on standard runs) with the 3MF hop documented as the slicer's save-as — a position stated on the printing pages, repeated here, and unchanged by either format's future tense.",
      },
      {
        title: "My First-Hand Experience with 3MF Files",
        note: "The reference's experience band is its standard first-person template. The checkable account from this side: this codebase has never written a 3MF byte — the exporter's format list is pinned and test-enforced, and 3MF is not on it. What it writes, verifiably, is binary STL from confirmed generations, and the slicer-side hop to 3MF is a documented external step, not an internal experience to narrate. The [printing use case](/use-cases/3d-printing) documents the real chain end to end, including where each format boundary sits.",
      },
      {
        title: "How to Open and Use 3MF Files",
        note: "Opening 3MF, honestly, happens outside this clone: the slicer set (PrusaSlicer, Bambu Studio, OrcaSlicer, UltiMaker Cura) reads and writes it natively; Windows 3D Builder reads and repairs it; Microsoft's 3D Viewer previews it. The route from here to a 3MF consumer: generate with [text-to-3d](/features/text-to-3d) or [image-to-3d](/features/image-to-3d), confirm once (1 credit standard, 10 agentic — new accounts start with 50 credits), export STL, import to the slicer, and save-as 3MF if the print needs color or multi-part layout. The studio side of that chain is real and pinned; the 3MF side belongs to the slicer, and this article keeps the authorship of each step straight.",
      },
      {
        title: "The Future of 3D Printing and the Role of 3MF",
        note: "The reference speculates here; this clone's version of the future talk stays with what is verifiable: 3MF adoption genuinely grows because color printing, multi-material and unit-correct exchange need what STL lacks, and the consortium's extension mechanism keeps absorbing features the ecosystem asks for. If this codebase ever pins a seventh export format, 3MF is the plausible candidate — and until the exporter actually writes it, the honest sentence is the one this article has repeated: the printing lane here is binary STL, the 3MF hop is the slicer's, and no future tense on this page changes the pinned list today.",
      },
      {
        title: "Frequently Asked Questions (FAQ)",
        note: "Answered below by this clone's own questions — the direct one first: does this studio export 3MF? No. The six formats it does export are named, and the slicer hop that reaches 3MF is given as the real path.",
      },
    ],
  },
];
