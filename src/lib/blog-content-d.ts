/**
 * Blog content D — the thirteen format articles (of the 55 written).
 *
 * These are genuine format explainers — container structure, when to use
 * each, what reads them — anchored wherever this clone is opinionated to
 * the six real exporters (src/lib/exporters.ts) and to the OmniCraft
 * viewer/convertor surfaces. Formats this codebase cannot write (DXF, 3MF)
 * get honest treatment: real format, real uses, no writer here.
 */
import type { BlogArticleDef } from "./blog-types";

export const BLOG_ARTICLES_D: BlogArticleDef[] = [
  {
    slug: "what-is-glb-file",
    title: "What Is a GLB File? The Web's 3D Container",
    category: "insights",
    description:
      "GLB packs a whole 3D scene — geometry, materials, textures, animations — into one binary file. Why the web standardizes on it, and how it exports here.",
    date: "2026-10-19",
    status: "live",
    answer:
      "A GLB is the binary form of glTF: one file containing a scene's geometry, materials, textures, and animations, structured as a small header plus a JSON chunk and a binary chunk. It is the format the web standardized on, and it is the default export of a confirmed task here — real bytes, written by the glTF exporter family.",
    sections: [
      {
        heading: "The structure, briefly",
        paragraphs: [
          "A GLB opens with a 12-byte header (magic, version, length), then a JSON chunk describing the scene graph — nodes, meshes, materials — then a binary chunk holding the vertex and index data and embedded images. The magic number is 0x46546C67, which is 'glTF' in ASCII and the first thing any loader checks. Everything the scene needs travels in that one file, which is the whole point: no missing-texture errors, no relative paths to break.",
          "Contrast with plain .gltf, which is the same JSON referencing external .bin and image files — nicer to hand-edit, worse to share. The comparison article in this blog covers the trade in detail.",
        ],
      },
      {
        heading: "When GLB is the right answer",
        paragraphs: [
          "Web delivery (three.js, model-viewer, most WebXR stacks ingest it natively), AR quick-look-style experiences, and any 'send it to someone' scenario — one file, one request, no assembly. For 3D printing you want STL instead; for CAD round-tripping, neither.",
          "Here, GLB is the first-class export: every confirmed task emits it, the model viewer parses it locally (orbit, material modes, live triangle count, no upload), and the format convertor will re-emit any confirmed task as GLB for free.",
        ],
      },
    ],
    faqs: [
      {
        q: "GLB or glTF — which do I export here?",
        a: "GLB for portability and sharing (one binary file); glTF if you want to inspect or hand-edit the JSON scene description. Both are real exports from the same pipeline.",
      },
      {
        q: "Can GLB carry animations?",
        a: "The container supports animations, yes. What lands in the file is whatever the generation pipeline produced for your task — the honest scope is per-task, and the preview shows you exactly that.",
      },
    ],
    related: [
      { label: "GLB vs glTF", href: "/blog/glb-vs-gltf" },
      { label: "Model viewer", href: "/omnicraft/viewer" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "what-is-obj-file",
    title: "What Is an OBJ File? The Great Interchange Format",
    category: "insights",
    description:
      "Wavefront OBJ: human-readable geometry plus an MTL sidecar for materials. The oldest common denominator of 3D — and a real export format here.",
    date: "2026-10-18",
    status: "live",
    answer:
      "OBJ is a plain-text geometry format from the 1980s that nearly everything can open: vertices, UVs, normals, and faces as lines of text, with materials described in a companion .mtl file. It carries no scene graph, no animations, and no hierarchy — and it is one of the six real export formats here.",
    sections: [
      {
        heading: "What's in the file",
        paragraphs: [
          "Open an OBJ in a text editor and you can read it: 'v' lines are vertex positions, 'vt' lines are texture coordinates, 'vn' lines are normals, 'f' lines are faces indexing the above. Materials live separately in an .mtl file the OBJ references. That transparency is why OBJ survives — a bug in an OBJ is visible with the naked eye, and every tool written in the last thirty years can parse the basics.",
          "The costs are the flip side: no units or orientation convention beyond convention itself, no scene hierarchy, no animation, and files get large fast because text is a verbose encoding. It is the interchange format, not the delivery format — GLB owns delivery.",
        ],
      },
      {
        heading: "Where OBJ fits here",
        paragraphs: [
          "Every confirmed task exports as OBJ through the real Wavefront writer, and the model viewer parses OBJ locally for inspection. The classic workflow this supports: generate here, export OBJ, import into Blender or your DCC of choice for further work — the mesh arrives as clean geometry with UVs and normals, ready to edit.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do materials survive the OBJ export?",
        a: "OBJ carries geometry with UVs and normals; material fidelity is the MTL sidecar's job and varies by exporter. For full material delivery, GLB is the better export here.",
      },
      {
        q: "OBJ for 3D printing?",
        a: "Possible — many slicers accept OBJ — but STL is the lingua franca of slicing and the safer choice.",
      },
    ],
    related: [
      { label: "OBJ vs STL", href: "/blog/obj-vs-stl" },
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
      { label: "Model viewer", href: "/omnicraft/viewer" },
    ],
  },
  {
    slug: "what-is-stl-file",
    title: "What Is an STL File? 3D Printing's Native Tongue",
    category: "3d-printing",
    description:
      "STL describes a surface as naked triangles — no materials, no color, just geometry. Why every slicer reads it, and how it exports here.",
    date: "2026-10-17",
    status: "live",
    answer:
      "An STL file is a triangle soup: a closed surface described purely as facet normals and vertex triples, in ASCII or binary. No materials, no color, no units — and universally accepted by slicing software, which is why it remains 3D printing's exchange format. Binary STL is one of the six real export formats here.",
    sections: [
      {
        heading: "Triangles and nothing else",
        paragraphs: [
          "Binary STL — the form the exporter here writes — is an 80-byte header, a 32-bit triangle count, then exactly 50 bytes per triangle: a normal, three vertices, an attribute word. That's the entire spec, and its austerity is its strength: nothing to interpret, nothing to misread, nothing a slicer can reject except the geometry itself.",
          "What STL cannot carry is everything that isn't shape: no colors, no materials, no textures, no hierarchy. Multi-part objects export as one merged surface unless your tool splits them. For rich delivery you want GLB; for the printer you want STL, because the printer only cares about the surface anyway.",
        ],
      },
      {
        heading: "From generation to print",
        paragraphs: [
          "The pipeline here supports the print-bound workflow directly: generate your object, confirm it (the 1-credit moment), export binary STL, and drop it straight into a slicer. The bytes are standards-compliant — 80-byte header, correct count, 50 bytes a triangle — so a slicer rejecting them is a slicer bug, not a file bug. For image-to-print workflows, see the text-to-STL and image-to-STL articles in this blog.",
        ],
      },
    ],
    faqs: [
      {
        q: "Binary or ASCII STL?",
        a: "Binary here — roughly six times smaller for the same mesh and what tools expect. ASCII STL exists for readability and little else.",
      },
      {
        q: "Why is my STL huge?",
        a: "Triangle count drives size at 50 bytes a triangle. Higher-effort generations produce denser meshes; if the file is too heavy for the next tool, that is a decimation question, and this codebase ships no decimator — stated as a gap.",
      },
    ],
    related: [
      { label: "Text to STL", href: "/blog/text-to-stl" },
      { label: "Image to STL", href: "/blog/image-to-stl" },
      { label: "3MF vs STL", href: "/blog/3mf-vs-stl" },
    ],
  },
  {
    slug: "what-is-fbx-file",
    title: "What Is an FBX File? The DCC Exchange Format",
    category: "insights",
    description:
      "FBX carries geometry, rigs, and animations between DCC tools — proprietary, ubiquitous, and exported here as standards-compliant ASCII.",
    date: "2026-10-16",
    status: "live",
    answer:
      "FBX is Autodesk's exchange format for moving rich scenes — geometry, materials, skeletons, animations — between DCC tools like Maya, 3ds Max, and Unity/Unreal imports. It exists in binary and ASCII forms; this codebase writes real ASCII FBX 7.3 with geometry, normals, UVs, and vertex colors.",
    sections: [
      {
        heading: "Why FBX exists at all",
        paragraphs: [
          "The DCC world needed a format that could carry a rigged, animated character — bones, skin weights, keyframes — not just static triangles, and FBX became the default despite (or because of) being proprietary. Most game engines and DCCs import it natively, which makes it the pragmatic choice when Blender's place in a pipeline is 'in between two Autodesk tools'.",
          "The honest caveat for this codebase's export: ASCII FBX 7.3 carries the geometry faithfully — meshes, normals, UVs, vertex colors — but a generated task here has no rig or animation to carry, so the FBX you export is static geometry. Tools that insist on binary FBX may refuse ASCII; the workaround is GLB in, convert in the DCC.",
        ],
      },
      {
        heading: "Reading an FBX enough to trust it",
        paragraphs: [
          "ASCII FBX is text, which means the sanity check needs no special tool: open the file and look for the FBXHeaderExtension block, the object counts, and the geometry sections with their vertex and polygon arrays — the same landmarks every FBX parser looks for. If those structures are present and non-empty, the file is structurally sound, and any import failure is the importer's policy (usually the ASCII/binary question) rather than corruption.",
          "That inspectability is why this pipeline ships ASCII rather than binary: the bytes you download are the bytes you can audit. Binary FBX is smaller and opaque; ASCII FBX is larger and legible — and for a project whose whole thesis is legibility, that is the right side of the trade.",
        ],
      },
    ],
    faqs: [
      {
        q: "My tool won't open the FBX — is the file broken?",
        a: "Probably not: open it in the model viewer (GLB/GLTF/OBJ/STL locally) after re-exporting as one of those to verify the mesh, and if the mesh is sound, your tool is likely rejecting ASCII FBX specifically.",
      },
      {
        q: "FBX or GLB from here?",
        a: "FBX when the destination is a DCC or engine that prefers it; GLB for web delivery and sharing. Both are one click on a confirmed task.",
      },
    ],
    related: [
      { label: "FBX vs GLB", href: "/blog/fbx-vs-glb" },
      { label: "STL vs OBJ vs FBX", href: "/blog/stl-vs-obj-vs-fbx" },
      { label: "Export problems", href: "/blog/fix-common-hyper3d-export-problems" },
    ],
  },
  {
    slug: "what-is-3mf-file",
    title: "What Is a 3MF File? The Modern Print Format",
    category: "3d-printing",
    description:
      "3MF is STL's successor for printing: a zip carrying geometry plus units, colors, materials, and print metadata. Real format — and not writable here.",
    date: "2026-10-15",
    status: "not-in-clone",
    answer:
      "3MF (3D Manufacturing Format) is the modern print format: a zip archive whose XML payload describes geometry with real units, colors, materials, and even print settings — everything STL drops. It is a genuinely better print container, and this codebase has no 3MF writer: the print-bound export here is binary STL, and the honest workflow for wanting 3MF is below.",
    sections: [
      {
        heading: "What 3MF fixes about STL",
        paragraphs: [
          "STL's austerity — triangles, nothing else — means unit ambiguity, single-color parts, and lost orientation and metadata. 3MF solves all of it: millimeter units by specification, per-part colors and materials, component reuse (one bolt geometry, many bolt placements), and production metadata. Slicers increasingly accept it, and multi-material printing essentially requires it.",
          "None of that changes the export surface here: the six real formats are GLB, glTF, FBX, OBJ, STL, and USDZ. The exporter set has no 3MF writer, and the converter pages say so per pair rather than implying CAD/print extras exist.",
        ],
      },
      {
        heading: "The honest path to a 3MF",
        paragraphs: [
          "Export binary STL here (confirmed tasks emit it directly), then let the tool that owns 3MF do the conversion: modern slicers import STL and save 3MF natively, adding units, colors, and print setup on their side. That division of labor is the honest one — this pipeline generates the geometry; the slicer authors the print package.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is 3MF just zipped STL?",
        a: "No — it is a zip containing a defined XML model structure plus optional parts (textures, print settings). Geometry is one component of a richer document, which is exactly why a writer is nontrivial and absent here.",
      },
      {
        q: "Will 3MF export be added?",
        a: "No roadmap claims from this project — today the statement stands: six formats, no 3MF, slicer-side conversion is the path.",
      },
    ],
    related: [
      { label: "3MF vs STL", href: "/blog/3mf-vs-stl" },
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "what-is-dxf-file",
    title: "What Is a DXF File? CAD's Exchange Format",
    category: "insights",
    description:
      "DXF is AutoCAD's drawing exchange format — 2D/3D geometry with layers and precision. Real format, no writer here, and no CAD anywhere in this codebase.",
    date: "2026-10-14",
    status: "not-in-clone",
    answer:
      "DXF (Drawing Exchange Format) is AutoCAD's format for precision drawings and models — layered 2D geometry, 3D entities, exact coordinates, the lingua franca of CAD interchange. It is a real and important format, and it has no relationship to this codebase: there is no CAD support here, no DXF writer, and no precision-drawing pipeline — the mesh generators here are the wrong tool for CAD work.",
    sections: [
      {
        heading: "The category difference that matters",
        paragraphs: [
          "A mesh format (STL, OBJ, GLB) describes a surface as triangles for rendering and printing. A CAD format (DXF, and its siblings like STEP and DWG) describes geometry as precise, editable entities — lines, arcs, parametric solids — for engineering. Converting mesh to CAD is reconstruction, not export: turning triangles back into parametric features is a hard, lossy, often manual process that no honest page should describe as a save-as.",
          "This codebase is a mesh pipeline end to end: six export formats, all mesh-or-scene containers, no CAD writer anywhere. The tools tree's converter pages carry the same statement per pair — 'no CAD support anywhere' is the computed reason, not an apology.",
        ],
      },
      {
        heading: "If you need DXF from geometry you generated here",
        paragraphs: [
          "The honest path runs through a CAD tool: export OBJ or STL, import into your CAD application's mesh pathway, and trace or reconstruct the entities you need there. For 2D drawings derived from 3D — plans, elevations — the rendering-or-screenshot step also lives outside this codebase. What you should not expect is a DXF button, today or implied.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can the converter produce DXF?",
        a: "No — and every converter page here states the six-format boundary. The image-to-DXF topic page in this catalog is likewise an honest status page, not a converter.",
      },
      {
        q: "Is DXF 2D or 3D?",
        a: "Both — layered 2D drawings are its classic use, with 3D entities supported. Either way, authoring it is CAD work, and this is not CAD software.",
      },
    ],
    related: [
      { label: "STL vs OBJ vs FBX", href: "/blog/stl-vs-obj-vs-fbx" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
      { label: "Export problems", href: "/blog/fix-common-hyper3d-export-problems" },
    ],
  },
  {
    slug: "what-is-ply-file",
    title: "What Is a PLY File? The Scanner's Format",
    category: "insights",
    description:
      "PLY carries point clouds and meshes with per-vertex data — the photogrammetry and scanning world's format. Real format, honored here by the viewer.",
    date: "2026-10-13",
    status: "not-in-clone",
    answer:
      "PLY (Polygon File Format) is the scanning format: point clouds or meshes with arbitrary per-vertex properties — colors, normals, confidence — in ASCII or binary. It is what photogrammetry and LiDAR tools emit, and this codebase does not write it: the six export formats exclude PLY. The honest relationship here is conversational — the format's role in scanning pipelines is context, and this pipeline's outputs are the six containers it ships.",
    sections: [
      {
        heading: "Why scanners love PLY",
        paragraphs: [
          "A scan produces points, not surfaces: millions of sampled positions, each often carrying color and a normal estimate. PLY was designed exactly for that — an element/property model where a vertex can carry whatever the scanner measured, before any meshing step turns points into faces. Photogrammetry tools emit PLY at the point-cloud stage, then mesh into OBJ or GLB for delivery.",
          "This pipeline has no scanning stage: generation here goes prompt-or-image to mesh directly, so the artifact PLY exists to carry never exists here. The ControlNet point-cloud constraint borrows the vocabulary (sparse points as a generation guide) but produces none of the files.",
        ],
      },
      {
        heading: "If PLY appears in your workflow",
        paragraphs: [
          "Then a scanning or reconstruction tool put it there, and the tool that made it is the tool to convert it — this codebase's converter works on your confirmed tasks, not on arbitrary uploads, and its format list is the six real ones. The honest summary: PLY is a fine format doing a job this pipeline does not have.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I export PLY here?",
        a: "No — six formats: GLB, glTF, FBX, OBJ, STL, USDZ. A PLY writer is absent by scope, not by oversight, and the converter pages state the boundary.",
      },
      {
        q: "Point-cloud ControlNet — does that output points?",
        a: "No — the point-cloud constraint shapes generation input (a sparse spatial guide); the output is a mesh exported in the six formats like any other task.",
      },
    ],
    related: [
      { label: "OBJ explainer", href: "/blog/what-is-obj-file" },
      { label: "Photogrammetry topic", href: "/blog/what-is-photogrammetry" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "what-is-usdz",
    title: "What Is USDZ? Apple's AR Format",
    category: "xr",
    description:
      "USDZ is Apple's zero-compression AR package — a zip of USD stages that iOS visionOS and Safari open natively. One of the six real exports here.",
    date: "2026-10-12",
    status: "live",
    answer:
      "USDZ is Apple's AR delivery format: an uncompressed zip archive containing a USD (Universal Scene Description) stage — typically a .usda text scene with referenced textures — that AR Quick Look and visionOS open directly from a URL. It is one of the six real export formats here: confirmed tasks emit a genuine USDZ archive containing a USDA scene.",
    sections: [
      {
        heading: "Why a zip with no compression",
        paragraphs: [
          "AR delivery wants memory-mapped, stream-friendly files: no decompression step between disk and renderer. USDZ is therefore a zip stored uncompressed — the archive structure gives packaging (scene plus textures in one file), while the no-compression rule gives the mmap-ability. Apple's tooling consumes it natively: Safari on iOS opens a USDZ link straight into AR Quick Look.",
          "Inside, USD itself is the interesting part — a scene description language with layering and composition, inherited from Pixar's pipeline. The .usda variant is the human-readable ASCII form, and that is what the exporter here writes into the archive.",
        ],
      },
      {
        heading: "USDZ from this pipeline",
        paragraphs: [
          "The use case writes itself: generate an object, confirm it, export USDZ, host the file, and an iOS user taps the link to see it in their space. Combined with the six-format convertor, USDZ is also free to produce later from any already-confirmed task. What USDZ is not: a general interchange format for DCC round-tripping — its job is AR delivery, and it does that job well.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does USDZ work on Android?",
        a: "Not natively — AR delivery there is glTF territory (scene viewer). The right export depends on the headset-or-phone you target: USDZ for Apple, GLB for the web and Android viewers.",
      },
      {
        q: "Why is my USDZ bigger than the GLB?",
        a: "No compression, by design — the archive trades bytes for memory-mapping. If size matters more than AR-native behavior, GLB is the lighter delivery.",
      },
    ],
    related: [
      { label: "GLB explainer", href: "/blog/what-is-glb-file" },
      { label: "Model viewer", href: "/omnicraft/viewer" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "glb-vs-gltf",
    title: "GLB vs glTF: Binary Container or JSON + Assets?",
    category: "comparisons",
    description:
      "Same standard, two packagings: GLB is the single binary file, glTF is JSON referencing external buffers and images. When each wins — both real exports here.",
    date: "2026-10-11",
    status: "live",
    answer:
      "They are the same standard — glTF 2.0 — in two packagings. glTF is a JSON file describing the scene and referencing separate .bin geometry and image files; GLB wraps the JSON and the binary data into one file. Sharing and web delivery: GLB. Editing and inspecting the scene graph: glTF. Both are real exports from this pipeline.",
    sections: [
      {
        heading: "The practical trade",
        paragraphs: [
          "GLB's single-file property is a deployment feature: one URL, one fetch, nothing to misplace — which is why three.js, model-viewer, and AR tooling treat it as the default. glTF's multi-file property is a workflow feature: the scene description is readable text you can diff and edit, textures are separately swappable files, and the binary buffer can be regenerated without touching the JSON.",
          "Size-wise they carry the same data; GLB saves a little packaging overhead, glTF can win when textures compress better as separate files than embedded ones. For everything except hand-editing, the ecosystem consensus is GLB-first.",
        ],
      },
      {
        heading: "From this pipeline specifically",
        paragraphs: [
          "A confirmed task exports as either, from the same exporter family — the GLB path writes the binary container (magic, JSON chunk, BIN chunk), the glTF path writes the JSON with embedded base64 buffer data. The model viewer parses both locally; the convertor re-emits either from any confirmed task for free. The choice is purely downstream: who or what opens the file next.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is GLB smaller than glTF?",
        a: "Usually marginally, from packaging overhead — base64 embedding in a .gltf costs ~33% on the buffer specifically. Same geometry either way.",
      },
      {
        q: "Can I convert between them without loss?",
        a: "Yes — same standard, lossless either direction. The convertor here will re-emit a confirmed task as either format; for arbitrary files, any glTF toolkit does the repack.",
      },
    ],
    related: [
      { label: "GLB explainer", href: "/blog/what-is-glb-file" },
      { label: "FBX vs GLB", href: "/blog/fbx-vs-glb" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "obj-vs-stl",
    title: "OBJ vs STL: Interchange Geometry or Print Geometry",
    category: "comparisons",
    description:
      "OBJ carries UVs, normals, and materials via MTL; STL carries bare triangles. Editing pipelines want OBJ, slicers want STL — both real exports here.",
    date: "2026-10-10",
    status: "live",
    answer:
      "For pure printing, STL — it is what slicers are built around and nothing in an STL confuses one. For anything downstream of the mesh — texturing, editing, rendering — OBJ, because it carries UV coordinates, explicit normals, and material references that STL structurally cannot. Both are one click away on any confirmed task here.",
    sections: [
      {
        heading: "The capability table",
        paragraphs: [
          "OBJ: vertices, UVs, normals, faces, material references (.mtl), human-readable text, multi-object files, universal DCC import. STL: facet normals and vertex triples, period — but universally sliced, byte-simple, and effectively the print standard for three decades. The information difference is real: an STL of a textured model is the same shape with the texture story amputated.",
          "When people complain 'STL lost my colors', that is not a bug in their exporter — the format has nowhere to put colors. The modern fix is 3MF (colors plus units for printing), which this codebase does not write; the classic fix is OBJ for everything except the print step itself.",
        ],
      },
      {
        heading: "Choosing from this pipeline",
        paragraphs: [
          "Generated task going to a DCC for more work: OBJ. Going to a slicer: STL (binary, 50 bytes a triangle). Going to the web: neither — GLB. The pipeline exports all three from the same confirmed task, and the convertor re-emits any of them for free later, so the decision can be revisited without regenerating or re-confirming.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can a slicer open OBJ?",
        a: "Most modern slicers accept OBJ. STL remains the safest common denominator — if a tool accepts exactly one geometry format, historically it is STL.",
      },
      {
        q: "Which is smaller?",
        a: "Binary STL is compact (50 bytes per triangle); ASCII OBJ is verbose but compresses well. For transfer size, zip whatever you send.",
      },
    ],
    related: [
      { label: "OBJ explainer", href: "/blog/what-is-obj-file" },
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
      { label: "STL vs OBJ vs FBX", href: "/blog/stl-vs-obj-vs-fbx" },
    ],
  },
  {
    slug: "stl-vs-obj-vs-fbx",
    title: "STL vs OBJ vs FBX: Which Geometry Format, When",
    category: "comparisons",
    description:
      "Three formats, three jobs: STL feeds slicers, OBJ feeds DCC interchange, FBX feeds rigged/animated DCC-and-engine pipelines. All three export here.",
    date: "2026-10-09",
    status: "live",
    answer:
      "Pick by destination. To a slicer: STL — bare triangles, nothing to misinterpret. To another 3D tool for editing or texturing: OBJ — UVs, normals, materials. To an engine or DCC expecting a richer scene (or the Autodesk corner of the world): FBX — geometry plus whatever rig/animation the source carried. This pipeline writes all three from any confirmed task.",
    sections: [
      {
        heading: "The one-line versions",
        paragraphs: [
          "STL: triangle soup, print-native, zero semantics beyond shape. OBJ: readable geometry with UVs and an MTL materials sidecar — the great interchange format, no scene graph or animation. FBX: Autodesk's proprietary-but-ubiquitous exchange carrying geometry, materials, skeletons, and animation between DCCs and engines; this codebase writes the ASCII 7.3 flavor (geometry, normals, UVs, vertex colors).",
          "The fourth candidate people forget is GLB, which is the answer whenever the destination is a browser or AR — one binary file, full materials, web-native. For a generated task here the practical set is: GLB for sharing, STL for printing, OBJ for editing, FBX for the Autodesk/engine path.",
        ],
      },
      {
        heading: "The decision, compressed",
        paragraphs: [
          "One question decides it: what opens the file next? A slicer — STL, no exceptions worth the risk. A DCC for further modeling — OBJ (interchange everywhere) or FBX (Autodesk-shaped pipelines). A browser, an AR surface, or a colleague's inbox — GLB, the one-file answer with materials included. An Apple ecosystem AR link — USDZ.",
          "The nice property of the six-format exporter here is that the decision is not permanent: a confirmed task re-exports into any of them at any time, for free, including through the Format Convertor. Choose wrong, and the fix is one click, not one regeneration — the meter (1 credit per standard confirm, 10 per agentic run, from the starting 50 credits) already did its only work at the confirm.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which keeps the most detail?",
        a: "All of them carry the same mesh geometry from this pipeline — the difference is semantics (materials, UVs, rigging), not vertex fidelity. STL is the one that visibly loses the non-geometry story.",
      },
      {
        q: "One format to keep as master?",
        a: "GLB is the strongest master here (geometry + materials in one standards-based file), with free re-exports to the other formats from any confirmed task.",
      },
    ],
    related: [
      { label: "OBJ vs STL", href: "/blog/obj-vs-stl" },
      { label: "FBX vs GLB", href: "/blog/fbx-vs-glb" },
      { label: "Format convertor", href: "/omnicraft/convertor" },
    ],
  },
  {
    slug: "fbx-vs-glb",
    title: "FBX vs GLB: DCC Pipeline or Web Delivery",
    category: "comparisons",
    description:
      "FBX is the DCC/engine exchange heavyweight; GLB is the open web-delivery standard. Rigged-animation pipelines versus one-binary-file portability.",
    date: "2026-10-08",
    status: "live",
    answer:
      "FBX when the destination is a DCC or game engine and the pipeline around it expects Autodesk exchange — especially if rigs or animations are in play. GLB when the destination is a browser, an AR surface, or a human you want to send one file to. Both export from here; the pipelines they feed are different worlds.",
    sections: [
      {
        heading: "Open versus entrenched",
        paragraphs: [
          "GLB is the open standard (glTF's binary container, Khronos-run, web-native, streamed by three.js and model-viewer). FBX is the entrenched proprietary one (Autodesk's, imported by essentially every DCC and engine, carrying the richest animation semantics in practice). Neither is 'better' — they won different territories: GLB owns delivery and the web runtime; FBX owns authoring interchange inside the DCC world.",
          "From this pipeline's honest position: what you generated has geometry, materials, and no rig, so the FBX advantage (rig/animation fidelity) does not activate, while GLB's advantages (one file, open, viewer-native, works in the local model viewer) always do. Default to GLB; choose FBX when a specific tool downstream asks for it by name.",
        ],
      },
      {
        heading: "The open-format argument, stated fairly",
        paragraphs: [
          "GLB is a Khronos-run open standard with a public specification anyone can implement — which is why three.js, model-viewer, and every web runtime parse it without licensing conversations. FBX is Autodesk's proprietary format, documented unevenly, with binary parsing reverse-engineered by the community over years. In the long run, open wins delivery; in the DCC-and-engine world of today, entrenched wins interchange — and both statements are true at once, which is why this pipeline exports both.",
          "For the files leaving this codebase specifically: GLB is the default recommendation because its consumers (including this project's own local model viewer) are where its guarantees hold strongest. FBX exists in the exporter set for the pipelines that would otherwise transcode anyway.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can GLB carry animations?",
        a: "The standard supports skeletal and node animations, yes — delivery pipelines play them in-browser. The animation authoring, as everywhere, happens in a DCC and usually travels through FBX.",
      },
      {
        q: "Why did my FBX import flat or unreadable?",
        a: "Check the ASCII/binary question first — some importers reject ASCII FBX — and verify the mesh itself by re-exporting GLB and opening it in the model viewer. See the export-problems article for the full checklist.",
      },
    ],
    related: [
      { label: "GLB explainer", href: "/blog/what-is-glb-file" },
      { label: "FBX explainer", href: "/blog/what-is-fbx-file" },
      { label: "Export problems", href: "/blog/fix-common-hyper3d-export-problems" },
    ],
  },
  {
    slug: "3mf-vs-stl",
    title: "3MF vs STL: The Print Format Decision",
    category: "3d-printing",
    description:
      "STL is the universal minimal print format; 3MF adds units, colors, materials, and assembly structure. What each means for files leaving this pipeline.",
    date: "2026-10-07",
    status: "live",
    answer:
      "If your slicer and your needs are single-material and single-part, STL is the frictionless choice and the direct export here. If you need units guaranteed, multiple parts, colors, or material assignments in the file itself, 3MF is the format built for that — and this codebase does not write it, so the honest path is STL here plus 3MF authoring in the slicer.",
    sections: [
      {
        heading: "What the format spec changes",
        paragraphs: [
          "3MF is a zip with an XML model: geometry with explicit millimeters, per-part colors and materials, component reuse (define once, place many), and production metadata. STL has a header, a count, and triangles — the spec is deliberately that small. For a single-material FDM print of one part, the difference is invisible at the printer; for multi-material, multi-part, or unit-sensitive work, 3MF is structurally the right container.",
          "The ecosystem reality: STL support is universal; 3MF support is strong in modern slicers but not guaranteed in older tooling or fragmented workflows. The conservative default remains STL.",
        ],
      },
      {
        heading: "The honest export path here",
        paragraphs: [
          "This pipeline writes binary STL (the six-format boundary is pinned across the exporter, the converter pages, and this blog's format articles). Want 3MF? Export STL, import to your slicer, and save-as 3MF there — the slicer is where print-specific structure (colors, arrangements, settings) gets authored anyway, so nothing honest is lost in the handoff.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is STL going away?",
        a: "No — thirty years of tooling inertia says otherwise. 3MF is the richer container winning new features; STL remains the floor every tool supports.",
      },
      {
        q: "Does 3MF compress better?",
        a: "The zip container can carry compressed XML, so text-wise often yes; geometry volume-wise it is roughly the same data as STL's binary form.",
      },
    ],
    related: [
      { label: "STL explainer", href: "/blog/what-is-stl-file" },
      { label: "3MF explainer", href: "/blog/what-is-3mf-file" },
      { label: "Text to STL", href: "/blog/text-to-stl" },
    ],
  },
];
