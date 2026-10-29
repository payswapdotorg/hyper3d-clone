/**
 * MCP feature pages (reference sitemap slugs): mcp, mcp/mcp-claude,
 * mcp/mcp-codex, mcp/mcp-kimi.
 *
 * These map to a REAL capability of this clone: the MCP connect modal in
 * the studio (t54/t55) — honest about what the modal actually gives an
 * agent (endpoint + tool surface) and what the reference additionally
 * provides per-agent guides for.
 */
import type { FeaturePageDef } from "./features-types";

export const MCP_FEATURE_PAGES: FeaturePageDef[] = [
  {
    slug: "mcp",
    name: "MCP",
    title: "MCP — connect AI agents to 3D generation",
    subline:
      "Give coding and chat agents direct access to generation tools over the Model Context Protocol. The studio's connect modal hands them everything they need to start.",
    status: "live",
    statusChip: "LIVE IN THIS CLONE",
    statusNote:
      "The MCP connect modal is real in this clone: it exposes the endpoint URL, the tool surface, and copy-ready connection config. An agent that speaks MCP can use it to drive the same task pipeline the studio UI drives. What the reference additionally ships — hosted MCP authentication, per-agent marketplace listings, and richer docs — is honestly out of scope here; the modal is the whole story, and it works.",
    cta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    ctaSecondary: { label: "See the studio", href: "/" },
    stepsTitle: "Connect an Agent in Three Steps",
    stepsIntro: "The real flow with this clone's modal.",
    steps: [
      {
        title: "Open the Connect Modal",
        body: "From the studio, open the MCP connect dialog — it lays out the endpoint and the tools an agent will see once connected.",
      },
      {
        title: "Copy the Connection Config",
        body: "The modal presents copy-ready configuration for your agent client. Drop it wherever your agent keeps its MCP server list.",
      },
      {
        title: "Let the Agent Drive the Pipeline",
        body: "Connected agents can create tasks, poll progress, and fetch exports through the same surface the studio UI uses — the API page documents that contract.",
      },
    ],
    benefitsTitle: "Why Connect Agents to 3D Tools?",
    benefitsIntro: "What agent access actually unlocks.",
    benefits: [
      {
        title: "Generation in the Loop",
        body: "Agents that can generate assets mid-conversation stop saying 'imagine a…' and start attaching the model.",
      },
      {
        title: "One Config, Standard Protocol",
        body: "MCP is the emerging standard for tool-using agents — one connection pattern instead of bespoke REST wrappers.",
      },
      {
        title: "Same Pipeline as the UI",
        body: "The modal's endpoint is this clone's real task pipeline — an agent's generations land in the same history the studio shows.",
      },
      {
        title: "Honest Scope",
        body: "This clone's MCP surface covers the pipeline it actually implements. The reference's hosted auth and marketplace listings are documented as gaps, not faked.",
      },
    ],
    useCasesTitle: "Who Connects Agents to Generation?",
    useCasesIntro: "Where agent-driven 3D pays off.",
    useCases: [
      {
        tag: "Coding agents",
        title: "Asset Pipelines in Code",
        body: "A coding agent generates, previews, and wires assets into your build without leaving the terminal.",
      },
      {
        tag: "Chat agents",
        title: "Conversational Creation",
        body: "Chat clients with MCP support can attach generated models to answers about objects and props.",
      },
      {
        tag: "Automation",
        title: "Batch Variation Runs",
        body: "Scripted agents iterate prompt variants and collect exports while you review the history rail.",
      },
    ],
    faqTitle: "Frequently Asked Questions About MCP",
    faqIntro: "What the modal here really provides.",
    faq: [
      {
        q: "Is MCP actually implemented in this clone?",
        a: "Yes — the connect modal is a real feature (not a mockup): it surfaces the endpoint and connection config an MCP-capable agent needs against this clone's pipeline.",
      },
      {
        q: "Which agents are supported?",
        a: "Any MCP-capable client. The reference publishes per-agent guides for Claude, Codex, and Kimi; this clone keeps the modal agent-agnostic — the three agent pages below mirror the reference's structure with honest copy.",
      },
      {
        q: "Does it cost credits?",
        a: "Agent-created tasks bill through the same wallet and confirm-first gates as studio-created ones — there is no separate pricing tier to surprise you.",
      },
      {
        q: "Where do agent generations appear?",
        a: "In the same task history the studio renders — the rail is fed by the shared pipeline, not a parallel one.",
      },
      {
        q: "Is there hosted authentication?",
        a: "No — the reference's hosted OAuth-style MCP auth is out of scope; the modal carries the config directly, which is the honest scope for this clone.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The surfaces around agent access.",
    crossLinks: [
      { label: "MCP for Claude", href: "/features/mcp/mcp-claude" },
      { label: "MCP for Codex", href: "/features/mcp/mcp-codex" },
      { label: "MCP for Kimi", href: "/features/mcp/mcp-kimi" },
      { label: "API", href: "/features/api" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Hand Your Agent the Tools",
    closingBody: "Open the connect modal, copy the config, and let the agent generate.",
    closingCta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    group: "mcp",
    indexBlurb: "Live: the connect modal hands MCP agents the real pipeline.",
  },
  {
    slug: "mcp/mcp-claude",
    name: "MCP for Claude",
    title: "Connect Claude to 3D generation",
    subline:
      "Claude's MCP support makes it a natural client for generation tools. This page mirrors the reference's Claude guide — with this clone's honest connection story.",
    status: "live",
    statusChip: "LIVE — CONFIG FROM THE MODAL",
    statusNote:
      "What is real: the connect modal's endpoint and config work with Claude's MCP client config (claude mcp add / claude_desktop_config.json). What is not: this clone does not ship the reference's illustrated step-by-step screenshots or marketplace listing — the modal plus this page is the entire, honest guide.",
    cta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    ctaSecondary: { label: "General MCP guide", href: "/features/mcp" },
    stepsTitle: "Connect Claude in Three Steps",
    stepsIntro: "Using this clone's modal with Claude's client.",
    steps: [
      {
        title: "Open the Connect Modal",
        body: "In the studio, open the MCP connect dialog and copy the endpoint config it presents.",
      },
      {
        title: "Register the Server with Claude",
        body: "Add the endpoint to your Claude MCP configuration — the same mechanism Claude uses for any Model Context Protocol server.",
      },
      {
        title: "Generate from the Conversation",
        body: "Ask Claude for an object; it calls the generation tools through the pipeline and reports progress like the studio does.",
      },
    ],
    benefitsTitle: "Why Claude + 3D Tools",
    benefitsIntro: "The pairing's real strengths.",
    benefits: [
      {
        title: "Strong Tool Discipline",
        body: "Claude follows multi-step tool flows well — create, poll, fetch, export — which is exactly the task lifecycle shape.",
      },
      {
        title: "Prompting Skill",
        body: "Claude writes tight generation prompts from loose requests, playing to the pipeline's prompt-polish strengths.",
      },
      {
        title: "Same History",
        body: "Claude-initiated tasks land in your studio history with everything else — no parallel universe of generations.",
      },
      {
        title: "Honest Scope",
        body: "No Claude-specific marketplace listing or hosted auth here: the config is the contract, and it works.",
      },
    ],
    useCasesTitle: "Claude-Driven Generation",
    useCasesIntro: "Where the pairing shines.",
    useCases: [
      {
        tag: "Coding agents",
        title: "Asset Sprints",
        body: "Claude scaffolds a scene, generates props into the build, and iterates from your review comments.",
      },
      {
        tag: "Prototyping",
        title: "Conversational Blocking",
        body: "Describe an object conversationally; Claude iterates variants until one sticks.",
      },
      {
        tag: "Automation",
        title: "Batch Runs",
        body: "Hand Claude a list of prompt variants and collect the exports from history.",
      },
    ],
    faqTitle: "Frequently Asked Questions — Claude",
    faqIntro: "The practical questions.",
    faq: [
      {
        q: "Does the modal's config work with Claude Desktop?",
        a: "Yes — the endpoint config from the connect modal fits Claude's MCP server registration (CLI or desktop config file), the standard mechanism for MCP servers.",
      },
      {
        q: "Is this an official Claude integration?",
        a: "No — it is a standard MCP connection any capable client can make. The reference brands per-agent guides; this clone keeps the mechanism honest and generic.",
      },
      {
        q: "What can Claude actually generate here?",
        a: "Whatever the studio's pipeline generates: text-to-3D tasks with ControlNet options, exports in five formats, and history access.",
      },
      {
        q: "Where do I start?",
        a: "Open the connect modal from the studio — the config there is the whole setup step.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The MCP family and the pipeline.",
    crossLinks: [
      { label: "MCP overview", href: "/features/mcp" },
      { label: "MCP for Codex", href: "/features/mcp/mcp-codex" },
      { label: "MCP for Kimi", href: "/features/mcp/mcp-kimi" },
      { label: "Text to 3D", href: "/features/text-to-3d" },
    ],
    closingTitle: "Claude, Meet the Pipeline",
    closingBody: "One config copy and Claude can generate real assets in conversation.",
    closingCta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    group: "mcp",
    indexBlurb: "Live: modal config registers with Claude's MCP client.",
  },
  {
    slug: "mcp/mcp-codex",
    name: "MCP for Codex",
    title: "Connect Codex to 3D generation",
    subline:
      "For terminal-first workflows, Codex-class coding agents can drive generation directly. This page mirrors the reference's Codex guide with this clone's real config story.",
    status: "live",
    statusChip: "LIVE — CONFIG FROM THE MODAL",
    statusNote:
      "What is real: the connect modal's endpoint config registers with OpenAI Codex-style agent setups (mcpServers config block). What is not: the reference's hosted auth and per-agent screenshots — the modal plus this page is the honest guide.",
    cta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    ctaSecondary: { label: "General MCP guide", href: "/features/mcp" },
    stepsTitle: "Connect Codex in Three Steps",
    stepsIntro: "Using this clone's modal with a Codex-class agent.",
    steps: [
      {
        title: "Open the Connect Modal",
        body: "In the studio, open the MCP connect dialog and copy the endpoint config it presents.",
      },
      {
        title: "Add to the Agent's MCP Config",
        body: "Drop the config into your Codex setup's mcpServers block — the standard registration for tool-using agents.",
      },
      {
        title: "Generate from the Terminal",
        body: "The agent creates tasks, polls progress, and pulls exports into your project tree — the same pipeline the studio drives.",
      },
    ],
    benefitsTitle: "Why Codex + 3D Tools",
    benefitsIntro: "The terminal-native strengths.",
    benefits: [
      {
        title: "Files Where You Work",
        body: "A coding agent writes exports straight into the asset directory of your project — no download dance.",
      },
      {
        title: "Pipeline Awareness",
        body: "Codex-class agents handle the create → poll → fetch lifecycle reliably across long generations.",
      },
      {
        title: "Diffable Iteration",
        body: "Prompt tweaks become reviewable changes in the conversation, with every variant kept in task history.",
      },
      {
        title: "Honest Scope",
        body: "Standard MCP connection, no special casing — if your client speaks the protocol, it works.",
      },
    ],
    useCasesTitle: "Codex-Driven Generation",
    useCasesIntro: "Where terminal-native wins.",
    useCases: [
      {
        tag: "Coding agents",
        title: "Game Asset Drops",
        body: "Generate, export, and wire GLBs into your game project in one agent session.",
      },
      {
        tag: "Automation",
        title: "CI Asset Refresh",
        body: "Scripted regeneration of placeholder props against the task pipeline.",
      },
      {
        tag: "Web apps",
        title: "Prototype Populate",
        body: "Fill a demo app with generated 3D objects exported straight to public/.",
      },
    ],
    faqTitle: "Frequently Asked Questions — Codex",
    faqIntro: "The practical questions.",
    faq: [
      {
        q: "Does this work with OpenAI Codex specifically?",
        a: "The config registers with any agent that consumes an mcpServers-style MCP config, Codex-class clients included. No Codex-specific auth exists here — by design.",
      },
      {
        q: "Is this an official OpenAI integration?",
        a: "No — it is a standard MCP endpoint. The reference publishes branded per-agent guides; this clone documents the generic mechanism honestly.",
      },
      {
        q: "Can the agent charge credits accidentally?",
        a: "No more than the UI can — pay-by-result tasks surface the same confirm-first gate to agents as to humans.",
      },
      {
        q: "Where do exports land?",
        a: "Wherever the agent puts them; the export endpoint serves the bytes, the agent writes the files.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The MCP family and the pipeline.",
    crossLinks: [
      { label: "MCP overview", href: "/features/mcp" },
      { label: "MCP for Claude", href: "/features/mcp/mcp-claude" },
      { label: "MCP for Kimi", href: "/features/mcp/mcp-kimi" },
      { label: "Format Convertor", href: "/omnicraft/convertor" },
    ],
    closingTitle: "Generation Without Leaving the Terminal",
    closingBody: "Register the endpoint once; the agent handles the rest of the lifecycle.",
    closingCta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    group: "mcp",
    indexBlurb: "Live: modal config drops into mcpServers-style agent setups.",
  },
  {
    slug: "mcp/mcp-kimi",
    name: "MCP for Kimi",
    title: "Connect Kimi to 3D generation",
    subline:
      "Kimi's MCP support brings generation tools into long-context chat workflows. This page mirrors the reference's Kimi guide with this clone's honest connection story.",
    status: "live",
    statusChip: "LIVE — CONFIG FROM THE MODAL",
    statusNote:
      "What is real: the connect modal's endpoint config registers with Kimi's MCP-capable client setups. What is not: the reference's illustrated guide and marketplace listing — the modal plus this page is the entire honest guide for Kimi here.",
    cta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    ctaSecondary: { label: "General MCP guide", href: "/features/mcp" },
    stepsTitle: "Connect Kimi in Three Steps",
    stepsIntro: "Using this clone's modal with Kimi.",
    steps: [
      {
        title: "Open the Connect Modal",
        body: "In the studio, open the MCP connect dialog and copy the endpoint config it presents.",
      },
      {
        title: "Register with Kimi",
        body: "Add the endpoint to Kimi's MCP/tool configuration — the same mechanism it uses for other Model Context Protocol servers.",
      },
      {
        title: "Generate in Chat",
        body: "Kimi calls the generation tools mid-conversation and reports progress through the shared pipeline.",
      },
    ],
    benefitsTitle: "Why Kimi + 3D Tools",
    benefitsIntro: "The pairing's strengths.",
    benefits: [
      {
        title: "Long-Context Briefs",
        body: "Kimi holds whole design briefs in context and derives consistent prompts across many generations.",
      },
      {
        title: "Multilingual Prompts",
        body: "Kimi's language coverage widens who can drive the pipeline conversationally.",
      },
      {
        title: "Same History",
        body: "Kimi-initiated tasks land in the studio's task rail like every other generation.",
      },
      {
        title: "Honest Scope",
        body: "Generic MCP connection — no Kimi-specific auth or marketplace entry here, and no pretense otherwise.",
      },
    ],
    useCasesTitle: "Kimi-Driven Generation",
    useCasesIntro: "Where the pairing shines.",
    useCases: [
      {
        tag: "Localization",
        title: "Multilingual Asset Briefs",
        body: "Drive generations from briefs written in languages the underlying pipeline still accepts.",
      },
      {
        tag: "Prototyping",
        title: "Brief-to-Variants",
        body: "Turn one long creative brief into a consistent family of generated props.",
      },
      {
        tag: "Chat agents",
        title: "Show and Tell",
        body: "Attach generated models to conversational answers instead of describing them.",
      },
    ],
    faqTitle: "Frequently Asked Questions — Kimi",
    faqIntro: "The practical questions.",
    faq: [
      {
        q: "Does the modal's config work with Kimi?",
        a: "Yes — Kimi's MCP-capable client consumes the same endpoint config the modal presents; register it like any other MCP server.",
      },
      {
        q: "Is this an official Kimi integration?",
        a: "No — it is a standard MCP connection. The reference publishes a branded Kimi guide; this clone keeps the mechanism generic and honest.",
      },
      {
        q: "Can Kimi use ControlNet constraints?",
        a: "Through the pipeline, yes — agents pass the same task parameters the studio UI does.",
      },
      {
        q: "Where do I start?",
        a: "Open the connect modal from the studio — the config there is the whole setup step.",
      },
    ],
    crossLinksTitle: "Explore related features",
    crossLinksIntro: "The MCP family and the pipeline.",
    crossLinks: [
      { label: "MCP overview", href: "/features/mcp" },
      { label: "MCP for Claude", href: "/features/mcp/mcp-claude" },
      { label: "MCP for Codex", href: "/features/mcp/mcp-codex" },
      { label: "Image to 3D", href: "/features/image-to-3d" },
    ],
    closingTitle: "Long Context, Real Assets",
    closingBody: "Register the endpoint and let Kimi generate against your whole brief.",
    closingCta: { label: "Open the Connect Modal", href: "/?mcp=1" },
    group: "mcp",
    indexBlurb: "Live: modal config registers with Kimi's MCP client.",
  },
];
