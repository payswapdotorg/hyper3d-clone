/**
 * Tool page content builders (t64) — every /tools leaf page's def is
 * BUILT from the registries (tools-registry) and the format facts
 * (tool-formats), so copy can never drift from the codebase's reality.
 *
 * Honesty rules enforced by tools.test.ts:
 *  - "live" pair pages never claim arbitrary-file upload — the source
 *    is always "your generated tasks" (the convertor's real contract).
 *  - "generative" pages always carry the words "generation, not
 *    conversion" and the real credit numbers (50 / 1 / 10).
 *  - "not-here" pages open their status summary with the computed
 *    reason and never describe a conversion that runs.
 *  - Viewer pages: only GLB/GLTF are live; the live pages state
 *    "parsed locally" and "never uploaded" (the real viewer's contract).
 *  - Format lists always match EXPORT_FORMATS exactly.
 */

import {
  converterPairStatus,
  converterPairReason,
  REFERENCE_CONVERTER_PAIRS,
} from "./tools-registry";
import {
  REAL_FORMAT_LIST,
  isCadFormat,
  isRealExportFormat,
  toolFormat,
} from "./tool-formats";
import type { ToolCta, ToolLink, ToolPageDef } from "./tool-types";
import { STUDIO_PATH } from "./studio-path";

const SIX = REAL_FORMAT_LIST;

function fmtName(slug: string): string {
  return toolFormat(slug)?.name ?? slug.toUpperCase();
}

/** Sibling pair links from the same from-format (max n, real routes). */
function siblingPairLinks(from: string, exclude: string, max = 5): ToolLink[] {
  const sibs = REFERENCE_CONVERTER_PAIRS.filter(
    ([f, t]) => f === from && t !== exclude,
  ).slice(0, max);
  return sibs.map(
    ([f, t]) => ({ label: `${fmtName(f)} to ${fmtName(t)}`, href: `/tools/converter/${f}/to/${t}` }),
  );
}

/** "Other 3D Tools" links — the live tools plus the sibling indexes. */
const OTHER_TOOLS_LINKS: ToolLink[] = [
  { label: "Format Convertor (live tool)", href: "/workspace/omnicraft/formatcon" },
  { label: "Model Viewer (live tool)", href: "/workspace/omnicraft/viewer" },
  { label: "Vector to 3D (live tool)", href: "/workspace/omnicraft/vecto3d" },
  { label: "All converter pairs", href: "/tools/converter" },
  { label: "3D viewer formats", href: "/tools/viewer" },
];

/* ------------------------------------------------------------------ */
/* Converter pair pages (178)                                          */
/* ------------------------------------------------------------------ */

export function buildConverterPairPage(from: string, to: string): ToolPageDef {
  const FROM = fmtName(from);
  const TO = fmtName(to);
  const status = converterPairStatus(from, to);
  const route = `/tools/converter/${from}/to/${to}`;
  const name = `${FROM} → ${TO}`;
  const title = `Free ${FROM} to ${TO} Converter`;
  const faqTitle = `${FROM} to ${TO} Converter FAQ`;

  if (status === "task-export") {
    return {
      route,
      name,
      title,
      description: `${FROM} to ${TO} is real in this clone — the Format Convertor re-exports your own generated tasks. Honest limits stated plainly on the page.`,
      subline: `The reference's converter accepts any ${FROM} file you drop in. This clone's version is narrower and says so: it re-exports tasks you generated here, and the ${FROM}→${TO} pair genuinely runs.`,
      status,
      statusChip: "REAL HERE — TASK-BASED",
      statusPanel: {
        summary: `${FROM} to ${TO} is genuinely real here, with one honest difference from a generic converter: the source is a task you generated in this studio — not an arbitrary ${FROM} file from your disk.`,
        works: [
          `The live Format Convertor lists your generated tasks after you sign in, so the ${FROM} side comes from real work you already did.`,
          `The export endpoint really produces ${TO} — one of the six formats the exporters ship (${SIX}).`,
          "You preview the exact mesh before exporting, and re-exporting a confirmed task costs nothing extra — the 1-credit Confirm already unlocked exports.",
          `Every task can be exported in any of the six real formats, so ${TO} is one click away whenever you need it.`,
        ],
        limits: [
          `No arbitrary ${FROM} upload: a file from your disk cannot enter the pipeline — only tasks generated in this studio.`,
          "Auth-gated: the convertor needs a session, because it lists YOUR tasks.",
          `Task-based only: the ${TO} you download is the mesh you confirmed, not a re-interpretation of some external file.`,
          "Materials travel as parameters — no baked texture-map sets are converted with the mesh.",
        ],
      },
      sections: [
        {
          title: "How To Convert Here",
          intro: `Three real steps — no file picker, because there is no arbitrary upload.`,
          steps: [
            { title: "Open the Format Convertor", body: `Sign in and open the live Format Convertor — it lists your generated tasks with their previews.` },
            { title: "Pick the task", body: `Select the task whose ${FROM} you want to carry forward; the mesh preview shows exactly what will export.` },
            { title: `Choose ${TO} and download`, body: `Pick ${TO} from the six real formats and download — the export endpoint produces the exact file.` },
          ],
        },
        {
          title: "Why This Converter Is Honest",
          cards: [
            { title: "Preview before export", body: "The convertor shows the mesh you are about to take — no blind downloads." },
            { title: `${SIX}`, body: "Every export format on this page is real — the exporters ship exactly these six, nothing invented." },
            { title: "Pay once", body: "The standard Confirm costs 1 credit and unlocks exports; re-exporting the same task in other formats costs nothing extra." },
            { title: "Local inspection", body: "Drop the exported GLB into the local Model Viewer to inspect it — parsed in your browser, never uploaded." },
          ],
        },
      ],
      faqTitle,
      faq: [
        { q: `Is the ${FROM} to ${TO} conversion free?`, a: `The conversion itself costs nothing extra — but the task being exported was confirmed first, and a standard Confirm costs 1 credit (agentic runs cost 10). Every account starts with 50 credits, and previews are free.` },
        { q: `Can I upload a ${FROM} file I already have?`, a: `No. The convertor re-exports your own generated tasks — an arbitrary ${FROM} file from your disk has no path into this clone. Generate a model here first, confirm it, then export ${TO}.` },
        { q: "Do I need an account?", a: "Yes — the convertor is auth-gated because it lists YOUR tasks. Sign-up is email and password, and the session cookie is httpOnly with a 7-day lifetime." },
        { q: "How is this different from the reference's converter?", a: "The reference accepts arbitrary file uploads in many formats and converts them in the browser. This clone's converter is task-based: it re-exports work generated here, across six real formats. The page you are on states that difference instead of hiding it." },
      ],
      crossLinksTitle: "More Converters & Tools",
      crossLinks: [
        ...siblingPairLinks(from, to),
        ...OTHER_TOOLS_LINKS,
      ],
      closingTitle: `Convert your ${FROM} task to ${TO}`,
      closingBody: "Open the live Format Convertor, pick the task, pick the format. That is the whole honest flow.",
      closingCta: { label: "Open the Format Convertor", href: "/workspace/omnicraft/formatcon" },
      cta: { label: "Open the Format Convertor", href: "/workspace/omnicraft/formatcon" },
      ctaSecondary: { label: "See all 178 pairs", href: "/tools/converter" },
    };
  }

  if (status === "generative") {
    const isSvgGlb = from === "svg" && to === "glb";
    return {
      route,
      name,
      title,
      description: isSvgGlb
        ? "SVG to GLB genuinely runs here — the live Vector to 3D tool extrudes SVG into GLB locally. No account, no upload."
        : `No ${FROM}-to-${TO} file conversion exists in this clone — but image-to-3D generation plus ${TO} export is real. Honest status on the page.`,
      subline: isSvgGlb
        ? "The rare pair that is a real local conversion: the live Vector to 3D tool extrudes SVG into GLB in your browser — depth, bevel and color, no account, no upload."
        : `The reference converts ${FROM} files to ${TO} directly. This clone has no ${FROM}-to-${TO} file conversion — what is real is the generative path: upload the image as a reference, generate a 3D model from it, export ${TO}.`,
      status,
      statusChip: "REAL PATH — GENERATION, NOT CONVERSION",
      statusPanel: {
        summary: isSvgGlb
          ? "SVG to GLB is a genuine local conversion here — the live Vector to 3D tool does exactly this, entirely in your browser."
          : `There is no ${FROM}-to-${TO} file conversion in this clone. The real path: image-to-3D generation from your ${FROM}, then ${TO} export — generation, not conversion.`,
        works: isSvgGlb
          ? [
              "The live Vector to 3D tool takes SVG in and extrudes GLB out — locally, in your browser, with depth, bevel and color controls.",
              "No account and no upload: the SVG never leaves your device.",
              "The GLB drops straight into the local Model Viewer for inspection.",
              "Generated tasks export in all six real formats for everything beyond GLB.",
            ]
          : [
              `Image-to-3D generation from a ${FROM} reference image is real — the studio's Rodin image mode is a live feature.`,
              `Previews are free, and a confirmed task exports as ${TO} for real (${SIX}).`,
              "Every account starts with 50 credits; a standard Confirm costs 1, an agentic run 10.",
              "The local Model Viewer inspects any GLB you already have — parsed locally, never uploaded.",
            ],
        limits: isSvgGlb
          ? [
              "Vector to 3D outputs GLB only — every other target format on this tree needs a different route (generation, then export).",
              "It extrudes flat artwork — no full 3D reconstruction from a single vector.",
              "Companion materials beyond the SVG's own colors do not travel.",
              "It is a local tool, not a batch pipeline.",
            ]
          : [
              `This is generation, not conversion — the ${TO} you get is an AI-generated interpretation of the image, not a faithful ${FROM}→${TO} file conversion.`,
              "A standard Confirm costs 1 credit (agentic runs cost 10); previews are free.",
              `There is no arbitrary ${FROM}→${TO} file processing — no drag-drop converter for files you already have.`,
              "Output geometry follows the procedural shape grammar — complex photographed scenes come out stylized, not scanned.",
            ],
      },
      sections: isSvgGlb
        ? [
            {
              title: "How To Convert SVG to GLB Here",
              steps: [
                { title: "Open Vector to 3D", body: "Open the live tool — no account needed for the local conversion." },
                { title: "Drop your SVG", body: "The SVG is parsed in your browser; set depth, bevel and colors with the real controls." },
                { title: "Download the GLB", body: "The extruded GLB downloads directly, and it drops into the local Model Viewer." },
              ],
            },
          ]
        : [
            {
              title: `The Real Path From ${FROM} to ${TO}`,
              intro: "Not a converter — three generative steps, honestly labeled.",
              steps: [
                { title: `Upload the ${FROM}`, body: "Open the studio's image mode and upload your image as the reference — framing and lighting are choices, not requirements." },
                { title: "Generate", body: `Rodin generates the 3D model from the image. The preview is free; confirming costs 1 credit (agentic runs cost 10).` },
                { title: `Export ${TO}`, body: `A confirmed task exports as ${TO} — one of the six real formats (${SIX}).` },
              ],
            },
          ],
      faqTitle,
      faq: isSvgGlb
        ? [
            { q: "Is SVG to GLB a real conversion here?", a: "Yes — the live Vector to 3D tool extrudes SVG into GLB locally in your browser. This is the one pair on the whole converter tree that runs as a genuine local file conversion." },
            { q: "Does it cost anything?", a: "No — Vector to 3D is a local browser tool; the SVG never leaves your device and no credits are involved." },
            { q: "Can I get other formats out of an SVG?", a: `Not in one step. The tool outputs GLB; generated tasks export in all six real formats (${SIX}), so generate from the artwork and export what you need.` },
            { q: "What about SVG to CAD formats?", a: `No. There is no CAD support anywhere in this clone — no DXF, DWG, STEP or IGES output of any kind.` },
          ]
        : [
            { q: `Is ${FROM} to ${TO} a real conversion here?`, a: `No. There is no ${FROM}-to-${TO} file conversion in this clone. What is real is the generative path — image-to-3D generation from the ${FROM}, then ${TO} export — and this page labels it as generation, not conversion.` },
            { q: `How much does the generative path cost?`, a: "Previews are free; a standard Confirm costs 1 credit and an agentic run costs 10. Every account starts with 50 credits, and a canceled Confirm is refunded." },
            { q: "Will the output match my image exactly?", a: "No — it is a generated interpretation. Geometry follows the procedural shape grammar; complex scenes come out stylized rather than scanned. Inspect the free preview before confirming." },
            { q: `What if I need a faithful ${FROM}→${TO} file conversion?`, a: `That does not exist here — take the file to a DCC or a dedicated converter. What this clone offers is generation plus six real export formats, stated plainly.` },
          ],
      crossLinksTitle: "More Converters & Tools",
      crossLinks: isSvgGlb
        ? [
            { label: "Vector to 3D (live tool)", href: "/workspace/omnicraft/vecto3d" },
            { label: "Model Viewer (live tool)", href: "/workspace/omnicraft/viewer" },
            { label: "All converter pairs", href: "/tools/converter" },
            ...OTHER_TOOLS_LINKS,
          ]
        : [
            { label: "Image to 3D (the real feature)", href: "/features/image-to-3d" },
            ...siblingPairLinks(from, to, 3),
            ...OTHER_TOOLS_LINKS,
          ],
      closingTitle: isSvgGlb ? "Extrude your SVG locally" : `Generate from your ${FROM}, export ${TO}`,
      closingBody: isSvgGlb
        ? "The live Vector to 3D tool is the whole flow — no account, no upload, GLB out."
        : "The generative path is the only honest route from an image to a 3D file here — and it is a real one.",
      closingCta: isSvgGlb
        ? { label: "Open Vector to 3D", href: "/workspace/omnicraft/vecto3d" }
        : { label: "Open the studio", href: STUDIO_PATH },
      cta: isSvgGlb
        ? { label: "Open Vector to 3D", href: "/workspace/omnicraft/vecto3d" }
        : { label: "Open the studio's image mode", href: STUDIO_PATH },
      ctaSecondary: { label: "See all 178 pairs", href: "/tools/converter" },
    };
  }

  // status === "not-here" (108 pages)
  const reason = converterPairReason(from, to);
  const works: string[] = [
    `Your generated tasks export in ${SIX} for real — the exporters are the source of truth.`,
    "The local Model Viewer inspects GLB/GLTF — parsed in your browser, never uploaded.",
  ];
  if (isRealExportFormat(to)) {
    works.push(`Your generated tasks export as ${TO} for real — the exporters ship ${SIX}.`);
  }
  if (isRealExportFormat(from)) {
    works.push(`Tasks re-export FROM ${FROM} too — the live Format Convertor carries generated work across all six real formats.`);
  }
  if (from === "svg") {
    works.push("SVG has a genuinely local path: the live Vector to 3D tool extrudes SVG into GLB in your browser.");
  }
  works.push("Text-to-3D and image-to-3D generation are live studio features — the start of every real path here.");

  const cta: ToolCta = isRealExportFormat(to)
    ? { label: "Open the Format Convertor", href: "/workspace/omnicraft/formatcon" }
    : isRealExportFormat(from) || from === "svg"
      ? { label: "Open the studio", href: STUDIO_PATH }
      : { label: "Open the studio", href: STUDIO_PATH };

  return {
    route,
    name,
    title,
    description: `${FROM} to ${TO} conversion does not exist in this clone. The honest reason is on the page, with the real alternatives — six export formats, live tools.`,
    subline: `The reference ships a ${FROM}-to-${TO} converter page. This clone does not have that conversion, and this page exists to say exactly why — and what the real routes are.`,
    status,
    statusChip: "NOT HERE",
    statusPanel: {
      summary: reason,
      works,
      limits: [
        reason,
        `No arbitrary ${FROM} upload: the only converter here is task-based — it re-exports work generated in this studio.`,
        isCadFormat(to) || isCadFormat(from)
          ? "There is no CAD support anywhere in this clone — no STEP, IGES, IFC, DXF or DWG in or out."
          : `The exporters ship exactly six formats (${SIX}) — nothing else leaves this clone.`,
        "No batch conversion, no drag-drop file pipeline, no desktop app.",
      ],
    },
    sections: [
      {
        title: "What Is Real Instead",
        intro: "The nearest honest routes to what this page's URL promises.",
        cards: [
          { title: "Generate, then export", body: `Text-to-3D and image-to-3D are real studio features; confirmed tasks export in ${SIX}.` },
          { title: "Task-based conversion", body: "The live Format Convertor re-exports your generated tasks across the six real formats." },
          { title: "Local inspection", body: "The Model Viewer parses GLB/GLTF locally — never uploaded — for a quick look at any mesh you already have." },
          { title: "Vector special case", body: "SVG artwork has a genuinely local conversion here: Vector to 3D extrudes it into GLB in your browser." },
        ],
      },
    ],
    faqTitle,
    faq: [
      { q: `Can I convert ${FROM} to ${TO} here?`, a: `No. ${reason}` },
      { q: "Will this clone ever take arbitrary file uploads?", a: "Not in its current shape — the converters and viewers on this site are task-based or GLB/GLTF-only, and the pages say so rather than pretending otherwise." },
      { q: "What formats does this clone actually ship?", a: `Exactly six export formats: ${SIX}. No CAD formats, no 3MF, no DAE, no PLY — the exporters are the source of truth.` },
      { q: "Where do I go instead?", a: isRealExportFormat(to)
        ? `The Format Convertor re-exports your generated tasks — if ${TO} is your target, generation plus export is the real path.`
        : `For ${TO} specifically, nothing here produces it — a DCC or a dedicated converter outside this clone is the honest answer.` },
    ],
    crossLinksTitle: "More Converters & Tools",
    crossLinks: [
      ...siblingPairLinks(from, to, 3),
      ...OTHER_TOOLS_LINKS,
    ],
    closingTitle: "The honest version of this page",
    closingBody: `No ${FROM}-to-${TO} conversion runs here. The real surfaces are the studio's generation, the six-format exporters, and the live tools below.`,
    closingCta: cta,
    cta,
    ctaSecondary: { label: "See all 178 pairs", href: "/tools/converter" },
  };
}

/* ------------------------------------------------------------------ */
/* Viewer pages (15)                                                   */
/* ------------------------------------------------------------------ */

export function buildViewerPage(format: string): ToolPageDef {
  const NAME = fmtName(format);
  const live = format === "glb" || format === "gltf";
  const route = `/tools/viewer/${format}`;
  const title = `Free ${NAME} Viewer Online`;

  if (live) {
    return {
      route,
      name: `${NAME} Viewer`,
      title,
      description: `Open ${NAME} files locally in your browser — the live Model Viewer parses them on your device, never uploads, with orbit and material modes.`,
      subline: `The reference's viewer accepts many DCC formats. This clone's Model Viewer accepts ${NAME} — and it is genuinely local: the file is parsed in your browser and never uploaded.`,
      status: "live",
      statusChip: "LIVE HERE — LOCAL",
      statusPanel: {
        summary: `${NAME} viewing is live here: drop the file or paste any CORS-readable URL, and the Model Viewer parses it locally — orbit, material modes and a live triangle count, no account, no upload.`,
        works: [
          `Drop a .${format} file or paste a URL — parsing happens in your browser, and the model never touches a server.`,
          "Orbit the model, switch material modes, and watch the live triangle count.",
          "No account needed — the viewer is open to anyone with a file or URL.",
          "Remote URLs work too (e.g. this clone's own export endpoints), as long as their CORS headers allow it.",
        ],
        limits: [
          `${NAME} and its sibling format only — the viewer does not parse DCC formats like FBX, OBJ or STL; for those, generate or import via the studio first, then use the Format Convertor.`,
          "It is an inspector, not an editor — no mesh modification happens here.",
          "Remote URLs must be CORS-readable, or the browser will refuse them.",
          "Companion material files beyond what the format embeds are not a concept here.",
        ],
      },
      sections: [
        {
          title: `Popular ${NAME} Viewer Workflows`,
          cards: [
            { title: "Pre-export check", body: "Inspect a task's exported GLB before handing it to a client or engine." },
            { title: "Asset review", body: "Orbit, switch material modes and read the triangle count before importing anywhere." },
            { title: "URL preview", body: "Paste a CORS-readable GLB URL — this clone's own export endpoints work directly." },
            { title: "Privacy", body: "The file never leaves your device — there is no upload, because there is no server in the loop." },
          ],
        },
        {
          title: "How To View a Model Here",
          steps: [
            { title: "Open the Model Viewer", body: "The live tool needs no account." },
            { title: `Drop your .${format}`, body: "Drag the file in, or paste a CORS-readable URL in the URL field." },
            { title: "Inspect", body: "Orbit, change material modes, read the triangle count — all locally." },
          ],
        },
      ],
      faqTitle: `${NAME} Viewer FAQ`,
      faq: [
        { q: `Is my ${NAME} file uploaded anywhere?`, a: "No. Parsing happens in your browser; the file never touches a server. The only network request happens if you load a remote URL yourself." },
        { q: "Do I need an account?", a: "No — the viewer is open to anyone. Sign-in only matters for the task-based tools like the Format Convertor." },
        { q: "Can it open FBX, OBJ or STL too?", a: "No — the viewer parses GLB/GLTF only. For other formats: generate or import via the studio first, then use the Format Convertor, which is the honest path this clone ships." },
        { q: "Can I edit the model in the viewer?", a: "No — it is an inspector. Mesh editing happens in the studio's real controls or your DCC, not here." },
      ],
      crossLinksTitle: "More Tools & Workflows",
      crossLinks: [
        { label: "Model Viewer (the live tool)", href: "/workspace/omnicraft/viewer" },
        { label: "Format Convertor (live tool)", href: "/workspace/omnicraft/formatcon" },
        { label: "All viewer formats", href: "/tools/viewer" },
        { label: "GLB to FBX pair page", href: "/tools/converter/glb/to/fbx" },
        { label: "All converter pairs", href: "/tools/converter" },
      ],
      closingTitle: `Inspect your ${NAME} locally`,
      closingBody: "Drop the file, orbit the model, read the triangle count — the whole thing runs in your browser.",
      closingCta: { label: "Open the Model Viewer", href: "/workspace/omnicraft/viewer" },
      cta: { label: "Open the Model Viewer", href: "/workspace/omnicraft/viewer" },
      ctaSecondary: { label: "All viewer formats", href: "/tools/viewer" },
    };
  }

  const isCad = isCadFormat(format);
  const reason = isCad
    ? `${NAME} is a CAD format, and there is no CAD support anywhere in this clone — no viewer, no converter, no import path.`
    : `The local Model Viewer parses GLB and GLTF only — ${NAME} files do not open here.`;
  const convertHint =
    isRealExportFormat(format)
      ? `${NAME} is a real export format here: generated tasks export as ${NAME}, and the studio's own hint for DCC formats is to generate or import first, then use the Format Convertor.`
      : `For a quick look at a ${NAME} file, convert it to GLB in your DCC first, then drop the GLB into the local viewer.`;

  return {
    route,
    name: `${NAME} Viewer`,
    title,
    description: `No ${NAME} viewer exists in this clone — the local Model Viewer accepts GLB/GLTF only. The honest reason and real alternatives are on the page.`,
    subline: `The reference's viewer opens ${NAME} files in the browser. This clone's viewer does not — it parses GLB/GLTF only, and this page says so instead of implying otherwise.`,
    status: "not-here",
    statusChip: "NOT HERE",
    statusPanel: {
      summary: reason,
      works: [
        "The local Model Viewer is live for GLB/GLTF — parsed in your browser, never uploaded, no account needed.",
        isRealExportFormat(format)
          ? `${NAME} is one of the six real export formats — generated tasks export as ${NAME} through the live convertor.`
          : `Generation is real: text-to-3D and image-to-3D produce models that export in ${SIX}.`,
        convertHint,
      ],
      limits: [
        reason,
        isCad
          ? "There is no CAD support anywhere in this clone — no STEP, STP, IGES, IFC, DXF or DWG in or out."
          : "The viewer accepts exactly two formats — GLB and GLTF. Nothing else parses.",
        "It is an inspector, not an editor, even for the formats it does accept.",
        "No drag-drop for DCC formats: the studio path for those is generation plus conversion, stated plainly.",
      ],
    },
    sections: [
      {
        title: "What Is Real Instead",
        cards: [
          { title: "GLB/GLTF viewer", body: "The live Model Viewer inspects GLB and GLTF locally — never uploaded, no account." },
          { title: "Task-based conversion", body: `The Format Convertor re-exports your generated tasks in ${SIX}.` },
          { title: "Generation", body: "Text-to-3D and image-to-3D are live studio features — the start of every real path here." },
          { title: isCad ? "CAD: not here at all" : "DCC hand-off", body: isCad ? "No CAD format enters or leaves this clone — a CAD workstation is the honest answer for CAD files." : `Take your ${NAME} into a DCC, export GLB, and view it here locally.` },
        ],
      },
    ],
    faqTitle: `${NAME} Viewer FAQ`,
    faq: [
      { q: `Can I open ${NAME} files in this clone?`, a: `No. ${reason}` },
      { q: "Which formats does the viewer actually accept?", a: "GLB and GLTF — file drop or CORS-readable URL, parsed locally in your browser and never uploaded." },
      { q: "What about CAD formats like STEP or IFC?", a: "No CAD support exists anywhere in this clone — no viewer, no converter, no import. The pages say so rather than pretending." },
      { q: "Where can I inspect a non-GLB mesh?", a: isRealExportFormat(format)
        ? `Generate or import it via the studio, then use the Format Convertor — that is the studio's own published path for DCC formats.`
        : `Convert it to GLB in your DCC and drop it into the local Model Viewer.` },
    ],
    crossLinksTitle: "More Tools & Workflows",
    crossLinks: [
      { label: "Model Viewer (the live tool)", href: "/workspace/omnicraft/viewer" },
      { label: "GLB viewer page", href: "/tools/viewer/glb" },
      { label: "GLTF viewer page", href: "/tools/viewer/gltf" },
      { label: "All viewer formats", href: "/tools/viewer" },
      { label: "All converter pairs", href: "/tools/converter" },
    ],
    closingTitle: "The honest version of this page",
    closingBody: `No ${NAME} viewer runs here. The live viewer takes GLB/GLTF — locally, never uploaded — and everything else says so.`,
    closingCta: { label: "Open the Model Viewer", href: "/workspace/omnicraft/viewer" },
    cta: { label: "Open the Model Viewer (GLB/GLTF)", href: "/workspace/omnicraft/viewer" },
    ctaSecondary: { label: "All viewer formats", href: "/tools/viewer" },
  };
}

/* ------------------------------------------------------------------ */
/* Image-to pages (8)                                                  */
/* ------------------------------------------------------------------ */

export function buildImageToPage(format: string): ToolPageDef {
  const NAME = fmtName(format);
  const live = isRealExportFormat(format);
  const route = `/tools/image-to-${format}`;
  const title = `Free AI Image to ${NAME} Converter`;

  if (live) {
    return {
      route,
      name: `Image → ${NAME}`,
      title,
      description: `Image to ${NAME} is real in this clone — Rodin image-to-3D generation plus a real ${NAME} export. Honest status and costs on the page.`,
      subline: `The reference converts images to ${NAME}. This clone's route is generative: upload the image as a reference, generate a 3D model from it, then export ${NAME} — a real path, honestly labeled as generation rather than file conversion.`,
      status: "live",
      statusChip: "REAL HERE — GENERATIVE",
      statusPanel: {
        summary: `Image to ${NAME} is real here through the studio's live image-to-3D mode: your image steers generation, and the confirmed task exports as ${NAME}. It is generation, not a file conversion — and the difference is stated, not hidden.`,
        works: [
          `Image-to-3D generation is a live studio feature — upload a reference image and Rodin generates the model.`,
          `A confirmed task exports as ${NAME} for real — one of the six formats the exporters ship (${SIX}).`,
          "Previews are free, every account starts with 50 credits, and a standard Confirm costs 1 (agentic runs cost 10).",
          "The local Model Viewer inspects the exported GLB before you hand it off — parsed locally, never uploaded.",
        ],
        limits: [
          "Generation, not conversion: the output is an AI-generated interpretation of the image — not a faithful file-to-file conversion.",
          "A standard Confirm costs 1 credit (agentic runs cost 10); previews are free and a canceled Confirm is refunded.",
          `The image itself is not transformed into ${NAME} — geometry follows the procedural shape grammar, so complex scenes come out stylized.`,
          "No arbitrary mesh upload: the image is the input, the generated task is the output, and there is no other pipeline.",
        ],
      },
      sections: [
        {
          title: `How To Convert an Image to ${NAME}`,
          steps: [
            { title: "Upload a reference image", body: "Open the studio's image mode and upload the photo or sketch — framing and lighting are choices, not requirements." },
            { title: "Generate", body: "Rodin generates the 3D model from the image. The preview is free; confirming costs 1 credit (agentic runs cost 10)." },
            { title: `Preview and export ${NAME}`, body: `Inspect the result, confirm it, and export ${NAME} — the exporters really ship it.` },
          ],
        },
        {
          title: "Why Use This Clone for Image to 3D",
          cards: [
            { title: "Image-first creation", body: "Start from product photos, sketches or concept art instead of modeling from scratch." },
            { title: "Free previews", body: "See the generated mesh before paying the 1-credit Confirm — no blind purchases." },
            { title: `${SIX}`, body: "Confirmed tasks export in all six real formats — the exporters are the source of truth." },
            { title: "Local inspection", body: "Drop the exported GLB into the Model Viewer — parsed in your browser, never uploaded." },
          ],
        },
      ],
      faqTitle: `Image to ${NAME} FAQ`,
      faq: [
        { q: `Is image to ${NAME} a real conversion?`, a: `It is real, and it is generation: the image steers Rodin's model generation, and the confirmed task exports as ${NAME}. This clone does not convert an image file into a mesh file — it generates a model from the image, and the page says the difference.` },
        { q: "How much does it cost?", a: "Previews are free; a standard Confirm costs 1 credit and an agentic run costs 10. Every account starts with 50 credits, and a canceled Confirm is refunded." },
        { q: "Which image formats work as input?", a: "Standard web image formats upload fine in the studio's image mode — PNG, JPG and WebP are the everyday cases." },
        { q: "Will the model match my image exactly?", a: "No — it is a generated interpretation. Inspect the free preview first; that is what previews are for." },
      ],
      crossLinksTitle: "Related Tools & Pages",
      crossLinks: [
        { label: "Image to 3D (the real feature)", href: "/features/image-to-3d" },
        { label: "Text to 3D", href: "/features/text-to-3d" },
        { label: "Format Convertor (live tool)", href: "/workspace/omnicraft/formatcon" },
        { label: "All converter pairs", href: "/tools/converter" },
        { label: "All viewer formats", href: "/tools/viewer" },
      ],
      closingTitle: `Generate from your image, export ${NAME}`,
      closingBody: "Upload the reference, preview for free, confirm for 1 credit, export — the honest generative path.",
      closingCta: { label: "Open the studio's image mode", href: STUDIO_PATH },
      cta: { label: "Open the studio's image mode", href: STUDIO_PATH },
      ctaSecondary: { label: "How image-to-3D works", href: "/features/image-to-3d" },
    };
  }

  const isCad = isCadFormat(format);
  return {
    route,
    name: `Image → ${NAME}`,
    title,
    description: `Image to ${NAME} does not exist in this clone — ${NAME} is not among the six real export formats. The honest reason and real alternatives are on the page.`,
    subline: `The reference converts images to ${NAME}. This clone cannot: its exporters ship exactly six formats, ${NAME} is not among them, and no image-to-${format} path exists here.`,
    status: "not-here",
    statusChip: "NOT HERE",
    statusPanel: {
      summary: isCad
        ? `${NAME} is a CAD format, and there is no CAD support anywhere in this clone — no ${NAME} output, no CAD detour, nothing to convert to.`
        : `There is no image-to-${format} path in this clone: the exporters ship exactly six formats (${SIX}), and ${NAME} is not among them.`,
      works: [
        `Image-to-3D generation is real — upload a reference image and Rodin generates a model.`,
        `Confirmed tasks export in ${SIX} — all six real, none invented.`,
        "The local Model Viewer inspects GLB/GLTF — parsed in your browser, never uploaded.",
        "Previews are free, and every account starts with 50 credits.",
      ],
      limits: [
        isCad
          ? `${NAME} is a CAD format with no support of any kind in this clone — no output, no viewer, no conversion.`
          : `${NAME} is not among the six real export formats — nothing in this clone produces it.`,
        "There is no image-to-image conversion either — images are generation inputs, not files to be re-encoded.",
        "No arbitrary ${NAME} upload or download: the format simply does not appear in this clone's pipelines.",
        isCad ? "No CAD formats enter or leave this clone, period." : `Take a real export into your DCC if you need ${NAME}.`,
      ],
    },
    sections: [
      {
        title: "What Is Real Instead",
        cards: [
          { title: "Image to GLB", body: "The real generative path: image reference → Rodin generation → GLB export." },
          { title: "Image to FBX, OBJ, STL, USDZ", body: "Same path, all real export formats of the exporters." },
          { title: "Image to glTF", body: "Also real — glTF ships alongside GLB in the six-format export set." },
          { title: "Local inspection", body: "Drop any GLB into the Model Viewer — parsed locally, never uploaded." },
        ],
      },
    ],
    faqTitle: `Image to ${NAME} FAQ`,
    faq: [
      { q: `Can I convert an image to ${NAME} here?`, a: `No. ${isCad ? "There is no CAD support anywhere in this clone." : `${NAME} is not among the six real export formats (${SIX}).`}` },
      { q: "Which formats can an image become?", a: `Exactly the six real export formats: ${SIX} — via image-to-3D generation and a confirmed export.` },
      { q: "Is it a conversion or a generation?", a: "Generation. The image steers Rodin's model generation; the confirmed task then exports in a real format. This clone has no image-to-file conversion of any kind." },
      { q: "What does it cost?", a: "Previews are free; a standard Confirm costs 1 credit and an agentic run costs 10. Every account starts with 50 credits." },
    ],
    crossLinksTitle: "Related Tools & Pages",
    crossLinks: [
      { label: "Image to GLB (real here)", href: "/tools/image-to-glb" },
      { label: "Image to FBX (real here)", href: "/tools/image-to-fbx" },
      { label: "Image to 3D (the real feature)", href: "/features/image-to-3d" },
      { label: "All converter pairs", href: "/tools/converter" },
      { label: "All viewer formats", href: "/tools/viewer" },
    ],
    closingTitle: "The honest version of this page",
    closingBody: `No image-to-${format} path runs here — the six real formats are what exist, and every one of their pages says the same.`,
    closingCta: { label: "Open the studio's image mode", href: STUDIO_PATH },
    cta: { label: "Image to GLB instead (real)", href: "/tools/image-to-glb" },
    ctaSecondary: { label: "All converter pairs", href: "/tools/converter" },
  };
}
