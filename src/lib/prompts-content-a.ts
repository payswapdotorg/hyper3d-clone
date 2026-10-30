/**
 * Written prompt articles, part 1 — characters & creatures (t69).
 *
 * Every prompt below is this clone's own text and runs in its real
 * text-to-3D studio: subject, surface, and one qualifier per clause, the
 * shape its planner reliably reads. Craft notes are anchored to code that
 * runs here — the effort tiers (4/9/20/40/80 s), the free preview before
 * any charge, the 1-credit confirm, the polish button, the 21 style
 * pages, and the six export formats. None of the reference's community
 * prompt text, attribution, or screenshots is reproduced anywhere in
 * this file.
 */

import type { PromptArticleDef } from "./prompts-types";

export const PROMPT_ARTICLES_A: PromptArticleDef[] = [
  {
    slug: "kana-pixel-rabbit-archer",
    title: "Pixel Rabbit Archer",
    description:
      "A written prompt page: an original archer-character prompt for this clone's text-to-3D studio, with craft notes on silhouette, scale cues, and the effort tiers.",
    blurb:
      "A compact archer character prompt — silhouette first, palette second, and a game-asset qualifier that keeps proportions clean.",
    prompt:
      "a stylized rabbit archer character, oversized hood, wooden longbow, one visible quiver, flat cel-shaded colors, game-ready proportions",
    keywords: ["character", "game asset", "cel-shaded", "archer"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "One silhouette, one signature prop",
        body: "The prompt names exactly two reads — hood and longbow — because a character prompt that lists ten props produces a busy model where none of them read. Generate at Medium effort (about 20 seconds) for a first look, then decide whether the face and the bow grip deserve a High-effort pass (40 seconds) before you spend the 1-credit confirm.",
      },
      {
        title: "Game-ready is a proportion instruction",
        body: "The phrase 'game-ready proportions' tells the planner to favor slightly oversized head and hands over anatomical realism — the exaggeration that keeps a low-face-count character readable at gameplay distance. If you want the opposite, say 'realistic proportions' and let the geometry get denser.",
      },
      {
        title: "Style pages are the palette shortcuts",
        body: "'Flat cel-shaded colors' is doing real work, but you can go further by pairing the prompt with a look from the 21 style pages — cel-shaded, pixel-art, or low-poly each come with recipe notes for prompting that look, and the style chips feed the same planner this prompt feeds.",
      },
    ],
    related: [
      { label: "Cel-shaded style page", href: "/styles/cel-shaded" },
      { label: "Character design use case", href: "/use-cases/character-design" },
      { label: "Low-poly style page", href: "/styles/low-poly" },
    ],
  },
  {
    slug: "a-2d-logo-becomes-an-animated-character-2096559197999501724",
    title: "From a 2D Logo to a 3D Mascot",
    description:
      "A written prompt page for image-to-3D: turning a flat logo or mark into a posed mascot, with notes on the upload strip, the direction picker, and honest limits.",
    blurb:
      "The image-mode route: upload the mark, pick the facing direction, and prompt the pose — with the honest note that rigging and animation are not part of this pipeline.",
    prompt:
      "a mascot figure based on the uploaded mark, rounded volume, friendly stance, matte toy-like material, symmetric build",
    keywords: ["image-to-3d", "mascot", "logo", "symmetry"],
    mode: "image",
    group: "characters",
    notes: [
      {
        title: "The direction picker is the first draft",
        body: "In image mode the upload strip asks for the facing of every picture you add — front, three-quarter, side, or unknown. A flat logo has no meaningful facing, so leave it 'Unknown' and let the caption stage describe what it sees; the direction you pick steers the first geometry pass, and 'Unknown' keeps that steering honest.",
      },
      {
        title: "Symmetry is worth saying out loud",
        body: "Marks are usually symmetric, so the prompt says 'symmetric build'. The planner honors bilateral symmetry cues well, and a symmetric first draft halves the iteration you need before a preview you would actually confirm — the confirm is the only step that costs a credit.",
      },
      {
        title: "What this will not become",
        body: "The reference's version of this idea ends in a rigged, animated character. This clone's pipeline generates and textures the model; it has no rigger and no keyframe editor. Export the mascot in GLB or FBX and rig it in your DCC — that is the real path, and the export list is the same six formats for every account.",
      },
    ],
    related: [
      { label: "Image to 3D feature", href: "/features/image-to-3d" },
      { label: "ChatAvatar feature", href: "/features/chatavatar" },
      { label: "Animation use case", href: "/use-cases/animation" },
    ],
  },
  {
    slug: "artwork-to-a-playable-character-2096107343268257953",
    title: "Concept Art to a Character Model",
    description:
      "A written prompt page: working from a concept sketch in image mode, with notes on one-image runs, multiview, and the caption stage you can read yourself.",
    blurb:
      "One concept sketch is enough for a first model — this note walks the caption the studio writes for your image and how to push against it in the prompt.",
    prompt:
      "a fantasy adventurer character from the concept sketch, layered travel clothing, single shoulder cape, worn leather and cloth materials",
    keywords: ["concept art", "image-to-3d", "fantasy", "costume"],
    mode: "image",
    group: "characters",
    notes: [
      {
        title: "One image is a real mode, not a fallback",
        body: "The studio's image mode generates from a single picture by default: the vision stage writes a caption of your sketch, and that caption becomes part of the plan. You can read the caption in the task card — if it misread the cloak as armor, say 'cloth cape, not armor' in the prompt box and regenerate. Previews are free; the loop is cheap.",
      },
      {
        title: "Multiview tightens the silhouette",
        body: "Add a back view or a three-quarter view to the upload strip and the geometry gets visibly more decisive about the far side of the character. Two images cost the same single standard credit at confirm — image count changes quality, not price.",
      },
      {
        title: "Costume lists stay short",
        body: "'Layered travel clothing, single shoulder cape' is two clauses because costume prompts compound: every extra garment is another surface the texture stage has to separate. Keep the list to the three reads that matter and leave the trim for the redo pass.",
      },
    ],
    related: [
      { label: "Image to 3D feature", href: "/features/image-to-3d" },
      { label: "Fantasy style page", href: "/styles/fantasy" },
      { label: "How to choose settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
    ],
  },
  {
    slug: "articulated-printable-action-figure-2095481098201387287",
    title: "Printable Articulated Action Figure",
    description:
      "A written prompt page for print-minded makers: a chunky, print-in-place figure prompt plus the honest notes on watertightness, STL export, and slicer QA.",
    blurb:
      "A print-oriented figure prompt — chunky joints, flat base — with the honest print checklist: STL is real, printability QA belongs to your slicer.",
    prompt:
      "a chunky articulated action figure, ball-jointed shoulders and hips, oversized head, flat circular base, toy-like matte surfaces",
    keywords: ["3d printing", "action figure", "articulated", "toy"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Chunky is an instruction",
        body: "Print-in-place joints survive when clearances are generous, so the prompt says 'chunky' and 'ball-jointed' rather than naming thin hinge geometries. The planner reads adjectives of mass well; precise millimeter clearances it does not — those belong to your CAD pass after export.",
      },
      {
        title: "STL comes out of the same confirm",
        body: "STL is one of the six export formats, and the export is the exact geometry the viewer previewed — no paywall between preview and file. The confirm costs the same single credit whether you export STL, GLB, or USDZ.",
      },
      {
        title: "The honest print checklist",
        body: "This pipeline writes the mesh as-is: it does not guarantee watertightness, wall thickness, or manifold edges, and no color-separation stage exists. Run the model through your slicer's repair pass before committing filament — the 3D-printing use case page says the same thing in the same words.",
      },
    ],
    related: [
      { label: "3D printing use case", href: "/use-cases/3d-printing" },
      { label: "Print help article", href: "/help/articles/fix-common-hyper3d-export-problems" },
      { label: "What is STL", href: "/blog/what-is-stl" },
    ],
  },
  {
    slug: "detailed-robot-through-blender-automation-2094909825561805003",
    title: "Detailed Hero Robot",
    description:
      "A written prompt page: a hero-robot prompt with material contrast, plus notes on the effort tiers, redo passes, and where Blender automation honestly fits the workflow.",
    blurb:
      "Material contrast is the engine of a good robot prompt — and the redo pass, not a DCC script, is the honest way to iterate one part at a time here.",
    prompt:
      "a detailed hero robot, brushed titanium torso, exposed actuator joints, amber viewport eyes, weathered paint on the shoulders",
    keywords: ["robot", "hard surface", "sci-fi", "materials"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Effort tiers are real seconds",
        body: "The effort selector is five tiers — Extreme-Low at about 4 seconds, Low 9, Medium 20, High 40, Extreme-High 80 seconds. A detailed robot is the case for starting at High: the actuator joints and viewport eyes are exactly the detail a Medium pass skips, and only an Extreme-High run chases every last greeble. You watch the preview before confirming, so the extra seconds are the cheapest quality lever in the studio.",
      },
      {
        title: "Redo one part, not the model",
        body: "The redo passes — geometry and material — regenerate what you point them at, with their own quota accounting. 'Weathered paint on the shoulders' being in the original prompt matters less than it would elsewhere: if the wear lands wrong, redo the material pass and leave the geometry alone.",
      },
      {
        title: "Where the DCC honestly enters",
        body: "The reference's version of this subject is a Blender automation showcase. This clone's pipeline ends at a textured mesh in six export formats; the panel beading, bevel passes, and rigging happen in your DCC after export — FBX and OBJ are the round-trip formats for exactly that.",
      },
    ],
    related: [
      { label: "Sci-fi hardware use case", href: "/use-cases/game-development" },
      { label: "Industrial style page", href: "/styles/industrial" },
      { label: "What is FBX", href: "/blog/what-is-fbx" },
    ],
  },
  {
    slug: "mech-robot-blueprint-set-2082760534500188606",
    title: "Mech Blueprint Set",
    description:
      "A written prompt page: generating a mech and its orthographic presentation set — plus honest notes on what a 'blueprint render' means in a studio with one poster renderer.",
    blurb:
      "A mech prompt framed as a presentation set — the model is real, the orthographic plates are honest re-renders you make after export.",
    prompt:
      "a humanoid defense mech, split chest cockpit, shoulder missile pods, hydraulic legs, factory primer gray with hazard stripes",
    keywords: ["mech", "blueprint", "hard surface", "presentation"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Hazard stripes are a texture-stage gift",
        body: "Two-tone markings like hazard stripes are cheap to say and expensive to model — they give the texture stage a strong read to place, which is why this prompt leans on markings instead of extra geometry. The PBR temperature slider in the viewer then dials how worn the stripes look before you commit.",
      },
      {
        title: "The blueprint plates are yours to render",
        body: "A true orthographic blueprint set — front, side, top, with callouts — is a layout job, not a generation job. This studio renders the model, previews it live, and exports geometry; the plates happen in your illustration tool after a GLB export. The prompt page can say that plainly because the studio's own poster render has exactly one camera.",
      },
      {
        title: "Symmetry plus asymmetry",
        body: "'Split chest cockpit' breaks bilateral symmetry on purpose: one asymmetric read (the cockpit hatch) makes a symmetric mech look designed rather than stamped. Pair every symmetric build with one deliberate asymmetric element and the silhouette stops feeling stock.",
      },
    ],
    related: [
      { label: "Robot prompt (written)", href: "/3d-prompts/detailed-robot-through-blender-automation-2094909825561805003" },
      { label: "Industrial style page", href: "/styles/industrial" },
      { label: "Mechanical engineering use case", href: "/use-cases/mechanical-engineering" },
    ],
  },
  {
    slug: "jungle-temple-and-giant-vanara-guardian-2095729606066348290",
    title: "Jungle Temple Guardian",
    description:
      "A written prompt page: a statue-scale guardian and its temple plinth as one generation, with notes on scene scale cues and the WorldGen boundary.",
    blurb:
      "Statue scale in one prompt — the guardian, the plinth, and the jungle overgrowth — and a note on where a single-mesh generation ends and WorldGen begins.",
    prompt:
      "a giant stone guardian statue of a monkey warrior, arms crossed over a temple plinth, carved headdress, cracked stone with moss in the crevices",
    keywords: ["statue", "temple", "guardian", "stone"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Scale lives in the objects, not the adjectives",
        body: "'Giant' alone does little; 'arms crossed over a temple plinth' gives the planner a human-scale object to build the figure around, and the moss in the crevices ages it. Scale cues are objects the planner already knows the size of — steps, doorways, plinths.",
      },
      {
        title: "Stone and moss is a material contrast",
        body: "Two materials in tension — cracked stone, live moss — are what make a statue prompt render like a place rather than a prop. The material selector (PBR, Shaded, All, None) then decides how much of that contrast survives into the export; PBR keeps the albedo story, Shaded keeps the lighting story.",
      },
      {
        title: "The WorldGen boundary",
        body: "This prompt generates one composed statue-and-plinth mesh. If you want the surrounding jungle as a walkable scene — canopy, paths, a second temple in the distance — that is the WorldGen mode's job, with its own creation-mode pills (Build Myself, Generate Objects) picking how much of the scene it assembles. One generation per intent is the honest rule.",
      },
    ],
    related: [
      { label: "WorldGen feature", href: "/features/worldgen" },
      { label: "Hand-painted style page", href: "/styles/hand-painted" },
      { label: "Temple scene prompt (written)", href: "/3d-prompts/ancient-temple-above-a-glowing-canyon-2095012880383099339" },
    ],
  },
  {
    slug: "dragon-lair-scene-in-blender-2095149546187653547",
    title: "Dragon on Its Hoard",
    description:
      "A written prompt page: a dragon-and-hoard diorama prompt with notes on pose verbs, coin mass, and the one-renderer honesty about 'cinematic' lighting.",
    blurb:
      "Pose verbs do the heavy lifting in creature prompts — coiled, wing-furled, head-turned — and the hoard is one material call, not ten thousand coins.",
    prompt:
      "an adult dragon coiled asleep on a gold hoard, wing-furled, head resting toward the viewer, scattered coins and goblets, dim ember light",
    keywords: ["dragon", "diorama", "fantasy", "pose"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Pose verbs beat anatomy lists",
        body: "'Coiled asleep, wing-furled, head resting' is three verbs and they decide the whole model; a paragraph of anatomy terms would decide nothing. The planner reads posture language well — give it the verbs first and let the species details ride along.",
      },
      {
        title: "The hoard is a material, not a count",
        body: "Do not ask for ten thousand coins. 'Scattered coins and goblets' asks for a hoard-like surface the texture stage can make read as treasure; individual coin geometry would exhaust the face budget and change nothing about the silhouette.",
      },
      {
        title: "One renderer, one camera",
        body: "'Dim ember light' steers the poster render and the preview mood — genuinely. But there is no lighting rig, no turntable video, and no camera path in this pipeline; the reference's cinematic Blender render happens in your DCC after export. The studio's honest lighting offer is the local HDRI generator for the environment and the PBR temperature for the model.",
      },
    ],
    related: [
      { label: "Fantasy style page", href: "/styles/fantasy" },
      { label: "HDRI generator feature", href: "/features/omnicraft/ai-hdri-generator" },
      { label: "Forest prompt (written)", href: "/3d-prompts/dense-procedural-forest-in-three-js-2096263046918197609" },
    ],
  },
  {
    slug: "chameleon-and-robot-hide-and-seek-game-2080392777515311115",
    title: "Hide-and-Seek Diorama",
    description:
      "A written prompt page: a two-character narrative diorama — a chameleon hiding from a searching robot — with notes on implied story and eye-line reads.",
    blurb:
      "Two characters, one story beat, one prompt: the hide-and-seek diorama shows how implied gaze makes a static model feel like a scene.",
    prompt:
      "a diorama of a tiny robot searching under a mushroom cap while a chameleon hides on a branch above it, warm forest lighting, toy miniature scale",
    keywords: ["diorama", "narrative", "miniature", "two characters"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "The story beat is one clause",
        body: "'Searching under a mushroom cap while a chameleon hides above it' — the while is the whole trick. One spatial relationship between two characters implies motion, intent, and payoff; the model stops being a pair of props and becomes a scene. Every good diorama prompt has exactly one of these clauses.",
      },
      {
        title: "Toy miniature scale is a protection",
        body: "Naming 'toy miniature scale' tells the planner to round shapes and soften detail the way a physical miniature would — which also hides the joins between the two characters and their shared base. 'Miniature' plus 'diorama' in one prompt is the most reliable pairing in this file.",
      },
      {
        title: "One generation, then redo passes",
        body: "If the chameleon lands too small to read, redo the geometry pass with 'enlarge the chameleon, keep the robot and mushroom unchanged' — partial redos with their own quota are the honest equivalent of the reference's per-object iteration, no scene graph required.",
      },
    ],
    related: [
      { label: "Campfire diorama prompt (written)", href: "/3d-prompts/campfire-scene-model-comparison" },
      { label: "Cartoon style page", href: "/styles/cartoon" },
      { label: "Stylized style page", href: "/styles/stylized" },
    ],
  },
  {
    slug: "interactive-3d-character-cards-2095963576049832347",
    title: "Character Card Set",
    description:
      "A written prompt page: a repeatable character-card template prompt — the honest batch story for a studio whose batch gate is honest too.",
    blurb:
      "A template prompt for consistent character cards — run it per character, tweak one clause each time, and know the honest state of batching here.",
    prompt:
      "a trading-card style character portrait model, bust above a stylized base frame, dramatic rim lighting, single hero prop in hand",
    keywords: ["character cards", "template", "series", "portrait"],
    mode: "text",
    group: "characters",
    notes: [
      {
        title: "Consistency lives in the fixed clauses",
        body: "Keep 'bust above a stylized base frame, dramatic rim lighting' identical across every card and change only the hero prop and the species clause. The planner does not carry memory between generations — consistency is prompt discipline, not a session feature, and this template makes that discipline mechanical.",
      },
      {
        title: "The batch chip is honest chrome",
        body: "The studio shows a ×1 batch chip; multi-variation batch runs are gated to the Business tier and this deployment has none. The honest workflow is sequential: generate, preview free, confirm the keepers for one credit each, and let the failed drafts cost nothing.",
      },
      {
        title: "Cards want PBR off",
        body: "A trading-card look is a flat-illustration look — set the material selector to Shaded for card renders and the texture stage stops fighting the flat colors. Export GLB when a card goes into a web gallery; the format list is the same six for every route out.",
      },
    ],
    related: [
      { label: "Character design use case", href: "/use-cases/character-design" },
      { label: "Flat style page", href: "/styles/flat" },
      { label: "Rabbit archer prompt (written)", href: "/3d-prompts/kana-pixel-rabbit-archer" },
    ],
  },
  {
    slug: "soda-bottle-starship-kitchen-launch",
    title: "Soda-Bottle Starship",
    description:
      "A written prompt page: a whimsical product-character hybrid — a starship built from kitchen-sink parts — with notes on borrowed-object design and honest material play.",
    blurb:
      "The soda-bottle starship: one borrowed silhouette, three kitchen parts, and a paint job — a masterclass in prompt-level kitbashing.",
    prompt:
      "a whimsical starship built from a two-liter soda bottle hull, bottle-cap engine pods, and a chrome faucet nose cone, candy-red paint with paper labels",
    keywords: ["kitbash", "whimsical", "starship", "product"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "Borrowed objects carry their own detail",
        body: "Naming real objects — a two-liter bottle, bottle caps, a faucet — imports their proportions and surface breaks for free. The planner knows what these things look like; you spend your prompt budget on the paint and the arrangement instead of describing cylinder ratios.",
      },
      {
        title: "Paper labels are the material wink",
        body: "'Candy-red paint with paper labels' gives the texture stage two deliberately different materials to place — glossy enamel against matte paper. That contrast is what makes a whimsical build read as designed rather than mashed together.",
      },
      {
        title: "Whimsy survives low effort",
        body: "A silhouette-first subject like this lands at Low effort (about 9 seconds) surprisingly well, because the borrowed shapes do the work. Run the cheap pass first, look at the preview, and only escalate to High if the faucet nose or the label placement matters to the joke.",
      },
    ],
    related: [
      { label: "Stylized style page", href: "/styles/stylized" },
      { label: "Retro style page", href: "/styles/retro" },
      { label: "Energy-core prop prompt (written)", href: "/3d-prompts/interactive-dual-ring-energy-core-2096551010089263181" },
    ],
  },
  {
    slug: "titanic-the-last-light",
    title: "Ocean Liner at Last Light",
    description:
      "A written prompt page: a period ocean-liner prompt about restraint — one hull, one light condition, one mood — with notes on period detail and honest framing.",
    blurb:
      "A period subject taught as a restraint exercise: the liner prompt that works is the one that names the light and stops listing details.",
    prompt:
      "a grand early-twentieth-century ocean liner at dusk, four riveted smokestacks, tiers of porthole decks, low sun glinting along the hull",
    keywords: ["ship", "period", "dusk", "restraint"],
    mode: "text",
    group: "props",
    notes: [
      {
        title: "The light condition is part of the subject",
        body: "'Low sun glinting along the hull' is doing as much modeling as the stack count — dusk compresses the value range so the rivets and porthole rhythm carry the render. Name the hour and the weather in every period prompt; they are geometry decisions in disguise.",
      },
      {
        title: "Four smokestacks, not a deck plan",
        body: "Period accuracy is a research job; prompt accuracy is a rhythm job. 'Four riveted smokestacks, tiers of porthole decks' names the two rhythms that make the silhouette read as a liner — the stacks vertically, the portholes horizontally — and lets the rest be suggestion.",
      },
      {
        title: "Preview the poster, export the hull",
        body: "The studio's poster render is one camera at one light — which is exactly what a subject like this wants from a preview. The export is the unlit mesh in six formats; if the dusk mood matters downstream, relight in your renderer and use the HDRI generator to build the environment's sky gradient honestly.",
      },
    ],
    related: [
      { label: "Realistic style page", href: "/styles/realistic" },
      { label: "HDRI generator feature", href: "/features/omnicraft/ai-hdri-generator" },
      { label: "Pagoda city prompt (written)", href: "/3d-prompts/floating-japanese-pagoda-city-2094886088963690607" },
    ],
  },
];
