/**
 * Blog content B — account, support, and troubleshooting (9 of the 55
 * written articles).
 *
 * Auth anchors: scrypt password hashing (src/lib/auth.ts), email+password
 * sessions with no verification-code path, a 12-locale selector that is
 * decorative while the UI ships English. Support anchors are deliberately
 * negative: no ticket queue, no billing, no enterprise program — each
 * article says where the nearest real thing lives.
 */
import type { BlogArticleDef } from "./blog-types";

export const BLOG_ARTICLES_B: BlogArticleDef[] = [
  {
    slug: "how-to-get-support-from-hyper3d",
    title: "How to Get Support: The Honest Channel List",
    category: "insights",
    description:
      "No ticket queue or live chat exists in this codebase. The real support surfaces: the Help Center, the searchable task history, and the repo.",
    date: "2026-10-18",
    status: "not-in-clone",
    answer:
      "There is no support inbox here: no ticket queue, no live chat, no SLA. The real channels are the Help Center (33 articles anchored to this codebase), the task history in the studio (every generation keeps its inputs, settings, and error message), and — for people running the code — the repository itself.",
    sections: [
      {
        heading: "What 'support' can honestly mean here",
        paragraphs: [
          "A support channel is staff plus a queue plus a response promise. This project has none of the three, so instead of a contact form that writes to nowhere, the honest surfaces are self-serve and real: the Help Center answers the thirty-three questions this codebase actually gets asked, with a live/partial/not-in-clone verdict on each; the studio's task panel shows each run's prompt, image, effort, and — if something went wrong — the exact error string the pipeline recorded.",
          "The most useful 'support' move in a workspace like this is reproducibility: when a task fails, its card keeps everything needed to understand why (see the failure article in this blog). That is deliberate — a demo that hides its errors forces you to trust it; one that surfaces them lets you verify it.",
        ],
      },
      {
        heading: "If you need humans",
        paragraphs: [
          "For the hosted product with paid support, the reference company is the honest destination. For this codebase, the repository is the channel: issues, forks, and reading the source are all supported by the fact that everything described on every page here is in the tree. That is the whole idea — the docs are an index into the code, not a parallel universe of claims.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there live chat?",
        a: "No. The reference's help center advertises live chat; here the honest equivalent is the Help Center plus the task history, both of which exist entirely in this codebase.",
      },
      {
        q: "Where do I report a bug?",
        a: "The repository. Anything reproducible from the studio keeps its evidence in the task card — error string, settings, and inputs — which is exactly what a good bug report needs.",
      },
    ],
    related: [
      { label: "Help Center", href: "/help" },
      { label: "Why generations fail", href: "/blog/why-did-my-hyper3d-generation-fail" },
      { label: "Scam safety", href: "/blog/official-hyper3d-links-and-scam-safety" },
    ],
  },
  {
    slug: "how-to-get-hyper3d-enterprise-support",
    title: "Enterprise Support: What Exists and What Doesn't",
    category: "insights",
    description:
      "No enterprise program, priority queue, SLA, or volume licensing exists here — the honest boundary, and where those needs are actually served.",
    date: "2026-10-17",
    status: "not-in-clone",
    answer:
      "There is no enterprise tier here: no priority queue, no dedicated support, no SLA, no volume licensing, no procurement contact. Enterprise needs are real — and they are served by the reference product, not by this clone.",
    sections: [
      {
        heading: "The honest boundary",
        paragraphs: [
          "Enterprise support is a commitment: response times, escalation paths, legal entities, invoices. A demo clone offering any of that would be fabricating an operations team, so this page — a route the reference catalog lists — states the absence instead. What can be said truthfully: the task API is documentable, the pipeline is paced and serverless-friendly, and the whole billing story is one $0 tier, so 'enterprise readiness' here means 'run it yourself'.",
          "The Help Center's enterprise topic makes the same point in question form: the answer to every 'can I get an SLA / volume deal / dedicated support' question is no, with the reasoning attached.",
        ],
      },
      {
        heading: "What 'running it yourself' actually entails",
        paragraphs: [
          "The constructive half of the honest answer: this is a complete Next.js application — task pipeline, ledger, exporters, and the whole content tree — so an engineering team can deploy it, point it at their own database, and meter usage with the same 50-credit grant and 1-credit/10-credit charges the code ships. What self-hosting does not buy is anyone answering a phone: 'enterprise support' is a commercial relationship, and a demo clone has no commercial anything.",
          "The boundary is worth stating twice because it is the boundary the whole project runs on: technical completeness is real here, commercial completeness is the reference product's to sell.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I deploy this for my team?",
        a: "The code is a complete Next.js application with its own database layer — running it yourself is the supported path. What it does not bring is any commercial backing, which is the actual enterprise product.",
      },
      {
        q: "Is there a volume discount on credits?",
        a: "There is nothing to discount: credits cannot be purchased at any price here. The 50-credit grant is the only inflow.",
      },
    ],
    related: [
      { label: "Help: enterprise topic", href: "/help/enterprise" },
      { label: "Support channels", href: "/blog/how-to-get-support-from-hyper3d" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
  {
    slug: "how-to-request-a-hyper3d-refund",
    title: "How to Request a Refund: Nothing to Refund",
    category: "insights",
    description:
      "No payments are processed here, so no refund flow exists. The one refund-shaped thing that is real: canceled charges return automatically.",
    date: "2026-10-16",
    status: "not-in-clone",
    answer:
      "There is no refund process because there is no payment process: nothing in this codebase charges money. The only refund-shaped event that exists is automatic and code-level — canceling a creation-charged task grants the credits back in full (1 credit per standard confirm, 10 credits per agentic run, against the 50 credits every account starts with), no request needed.",
    sections: [
      {
        heading: "Two kinds of 'refund', one of them real",
        paragraphs: [
          "Money refunds require a charge, and no charge exists: no card is ever taken, no order is ever created, no plan is ever billed. The Fulfillment Policy page in the Legal Center exists precisely to say this in the formal register a policy needs — there is no billing to fulfill.",
          "Credit refunds are real and automatic. If a legacy charged task is canceled or fails, the route grants back exactly creditsSpent as a cancel_refund ledger entry, in the same request, with no form and no waiting. And on the pay-by-result flow the question cannot arise: unconfirmed tasks were never charged.",
        ],
      },
      {
        heading: "Why the distinction matters",
        paragraphs: [
          "Conflating the two is how demo products end up with fake reassurance on their refund pages: a 'request a refund' button that writes to nowhere, a 5–7 business days promise with no business days behind it. This codebase takes the other path — the money flow does not exist, so the refund page describes the credit flow that does, including its exact arithmetic (1 credit per standard confirm, 10 credits per agentic run, 50 credits granted at signup, all refundable only in the cancel-and-fail cases the routes implement).",
          "The result reads shorter than a real refund policy and is more verifiable than most: every sentence traces to a route handler or a ledger reason string in the tree.",
        ],
      },
    ],
    faqs: [
      {
        q: "I was charged a credit for a confirm I regret. Refund?",
        a: "The confirm charge is final by design — it unlocks exports permanently, and re-exports cost nothing. The automatic refunds cover failures and cancels, not changes of mind.",
      },
      {
        q: "Where is the refund policy text?",
        a: "In the Legal Center, as a fulfillment policy — written for a $0 product with no orders, which is why it is short.",
      },
    ],
    related: [
      { label: "Legal Center", href: "/legal" },
      { label: "Cancel refunds", href: "/blog/are-credits-returned-after-canceling-a-generation" },
      { label: "Plans article", href: "/blog/how-much-do-hyper3d-plans-cost" },
    ],
  },
  {
    slug: "how-to-reset-hyper3d-password",
    title: "How to Reset Your Password (and Why There's No Email Flow)",
    category: "insights",
    description:
      "No reset email exists here: passwords are scrypt hashes and no mailer is wired. The honest recovery options for accounts in this codebase.",
    date: "2026-10-15",
    status: "not-in-clone",
    answer:
      "There is no password-reset flow in this codebase: no reset email, no verification loop, no mailer wired to auth. Passwords are stored as scrypt hashes that cannot be read back. If you run the codebase, recovery is a database-side operation; as an end user of a deployment, a new account is the honest path.",
    sections: [
      {
        heading: "What auth actually does here",
        paragraphs: [
          "Sign-up takes email plus an 8-character-minimum password and hashes it with scrypt (salted, 64-byte). Sign-in verifies the hash and issues a session cookie. That is the entire auth surface — deliberately simple, deliberately self-contained. A reset-by-email flow needs an outbound mail path with credentials and templates; none is wired to auth in this codebase, so no page here will pretend to send you a link.",
          "The scrypt detail matters for expectations: the stored hash is one-way. Nobody — including an operator of a deployment — can 'look up' your password; recovery means replacing the hash, which is exactly what a reset flow would do after proving identity by email. The proof step is the part that does not exist here.",
        ],
      },
      {
        heading: "The honest options",
        paragraphs: [
          "If you operate a deployment: the user table is yours, and resetting a hash is a one-line database operation. If you are an end user: create a new account — signup is instant, costs nothing, and grants a fresh 50 credits. What you should not expect is a 'check your inbox' screen here; that would be a claim about infrastructure this project does not have.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I change my password while signed in?",
        a: "The reference's account menu offers change-password; here the honest answer is that no change-password route is wired in this clone. Sign-out and sign-in with the credentials you have is the working path.",
      },
      {
        q: "Are passwords stored securely?",
        a: "Yes — scrypt with a per-user salt, the same family of slow hashing used for production auth, and never stored or logged in plain text anywhere in this codebase.",
      },
    ],
    related: [
      { label: "Verification-code login", href: "/blog/can-i-log-in-to-hyper3d-with-a-verification-code" },
      { label: "Help: account settings", href: "/help/account-settings" },
      { label: "Beginner's guide", href: "/blog/how-to-use-hyper3d-beginners-guide" },
    ],
  },
  {
    slug: "can-i-log-in-to-hyper3d-with-a-verification-code",
    title: "Can I Log In With a Verification Code? No — Here's the Real Flow",
    category: "insights",
    description:
      "Email-and-password with scrypt hashing and a session cookie is the only login path. No codes are emailed, ever, because no mailer is attached to auth.",
    date: "2026-10-14",
    status: "live",
    answer:
      "No. The only sign-in path in this codebase is email plus password, verified against a scrypt hash, rewarded with a session cookie. No verification codes are generated, emailed, or accepted — because there is no mail path attached to authentication at all.",
    sections: [
      {
        heading: "The one real flow, end to end",
        paragraphs: [
          "Sign-in validates your email and password, checks the stored scrypt hash (salted, constant-time comparison on the derived bytes), and sets a session cookie bound to your user id. Sign-up does the same plus account creation — email, optional username, 8-plus-character password — and lands you signed in immediately, with the 50-credit grant already applied.",
          "That immediacy is a feature of having no mailer: nothing waits on an inbox. The cost is exactly the functionality this article is about — no code-based login, no reset email, no verification step. The reference's sign-in panel includes those affordances; this clone implements the panel's core honestly rather than the panel's edges hypothetically.",
        ],
      },
      {
        heading: "How to know which auth you are looking at",
        paragraphs: [
          "The tell is infrastructure, not UI: a code-based login needs an outbound mail path (SMTP credentials, templates, rate limits, token TTLs), and none is wired to auth in this codebase — the same absence the password-reset article documents. If a deployment of this project ever shows you a 'we sent you a code' screen, it is running something this repository does not contain.",
          "Email-plus-scrypt is the entire contract, and it is a good one to be able to read: the hash is salted and slow by construction, the session is an httpOnly cookie, and the flow has exactly two screens. Small, legible, and honest — which is the pattern this project prefers over feature-shaped promises.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is my session persistent?",
        a: "Yes — the session cookie holds your signed-in state across reloads until you sign out. The auth module owns both issuance and verification.",
      },
      {
        q: "Can I use a username instead of email?",
        a: "Sign-in is by email; usernames are display names set at signup. That split is deliberate — email is the unique key the user table is indexed on.",
      },
    ],
    related: [
      { label: "Password reset", href: "/blog/how-to-reset-hyper3d-password" },
      { label: "Beginner's guide", href: "/blog/how-to-use-hyper3d-beginners-guide" },
      { label: "Help: account settings", href: "/help/account-settings" },
    ],
  },
  {
    slug: "does-hyper3d-support-languages-besides-english",
    title: "Does Hyper3D Support Languages Besides English?",
    category: "insights",
    description:
      "The language selector offers twelve locales like the reference, but the interface ships English only — an honest partial, stated as such.",
    date: "2026-10-13",
    status: "partial",
    answer:
      "Partially: the studio's language selector lists the reference's twelve locales (English through Italian), but selecting any of them does not translate the interface — every label, toast, and article here ships in English. The selector is reproduced affordance, honestly labeled, not a localization system.",
    sections: [
      {
        heading: "Why the selector exists but the translations don't",
        paragraphs: [
          "The reference ships localized sitemaps for a dozen languages, which is how it markets to those markets. A real localization here would mean translating the studio, the help tree, this blog, and every status page — and keeping them in sync. That is a large ongoing commitment this project does not pretend to have made, so the honest state is exactly what you see: the affordance without the payload, and an article saying so instead of implying otherwise.",
          "What is true across languages: the generation pipeline is language-agnostic at the prompt level for text input — the pipeline's captioning and prompt handling process what you type — but the interface around it, all documentation, and all support content are English-only today.",
        ],
      },
      {
        heading: "Why honesty beats a language menu that lies",
        paragraphs: [
          "A selector that changes nothing is a small deception, and small deceptions are how the big ones hide. The reference can localize honestly because it runs a translation operation; this clone cannot yet, so the selector stays as reproduced affordance and articles like this one say what it does and does not do. A user who picks Türkçe and sees English at least knows where they stand — which is more than most twelve-language dropdowns can claim.",
          "When localization does ship here, it will ship the same way everything else does: real strings behind real routes, with the selector wired to them, and this article updated to say so.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will more languages be added?",
        a: "This project does not publish speculative roadmaps. The current, honest state is a twelve-entry selector with English strings behind it.",
      },
      {
        q: "Can I write prompts in my own language?",
        a: "You can type any text as a prompt; how the pipeline interprets non-English input is a model question, not a UI promise, so this article makes no claim about quality.",
      },
    ],
    related: [
      { label: "What is Hyper3D", href: "/blog/what-is-hyper3d" },
      { label: "Help: getting started", href: "/help/getting-started" },
    ],
  },
  {
    slug: "official-hyper3d-links-and-scam-safety",
    title: "Official Links and Scam Safety, Stated Plainly",
    category: "insights",
    description:
      "The full list of surfaces this codebase actually serves, how to tell a real page from a fake promise, and the one rule that keeps you safe.",
    date: "2026-10-12",
    status: "live",
    answer:
      "Every real surface of this project is enumerable: the studio and its two generation modes, the OmniCraft tools, the feature/help/legal/styles/use-cases/tools/blog trees, and the API routes behind them. Anything asking you for money, a card, or a seed phrase 'for Hyper3D' is not this project — there is nothing to pay anywhere in it.",
    sections: [
      {
        heading: "The enumerable-surface rule",
        paragraphs: [
          "The safest habit in any AI tool is the one this project is built around: a product can only do what its code does. Here that set is public and finite — two generation modes with free previews, six export formats, the OmniCraft toolbag, and content trees whose every page either works or says it doesn't. The moment a page asks for payment, you are not looking at this project: no checkout, card field, wallet connect, or 'activation fee' exists anywhere in this codebase, and the Help Center's scam-safety article repeats the same enumerable list.",
          "The reference company's real domains and announcements are theirs to publish; this clone deliberately does not relay third-party 'official links' beyond pointing at the reference site itself. Anything else claiming affiliation — Discord DMs, giveaway sites, lookalike domains — fails the enumerable-surface test by construction.",
        ],
      },
      {
        heading: "Practical checks that work here",
        paragraphs: [
          "Ask any page to prove its claim: generation costs should trace to the 1/10 constants, exports should open in a third-party viewer, the model viewer should parse your file without any network upload, and a 'coming soon' should be labeled as not-implemented rather than implied. A clone that states its gaps is auditable; a clone that hides them is just another pretty page.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does Hyper3D ever ask for payment?",
        a: "This project never does — there is no billing code. Anyone asking for money 'on behalf of' it is by definition not it.",
      },
      {
        q: "How do I verify a page is one of yours?",
        a: "Every route on this deployment is enumerable from the sitemap, and every status page names the code that backs it. If a surface is not in that set, it is not this project.",
      },
    ],
    related: [
      { label: "Help: scam safety", href: "/help/articles/official-hyper3d-links-and-scam-safety" },
      { label: "Feature census", href: "/blog/what-features-does-hyper3d-have" },
      { label: "Pricing page", href: "/pricing" },
    ],
  },
  {
    slug: "why-did-my-hyper3d-generation-fail",
    title: "Why Did My Generation Fail? The Real Error Paths",
    category: "workflow",
    description:
      "The pipeline's actual failure modes — invalid spec, engine error, cancel — what each looks like on the task card, and the money truth: failures never charge.",
    date: "2026-10-11",
    status: "live",
    answer:
      "Three failure families exist in the pipeline: an invalid spec rejected before generation starts, an engine error during the neural or server run, and user-initiated cancel. Each marks the task failed with a specific error string you can read on the task card — and none of them ever deducts a credit on the pay-by-result flow.",
    sections: [
      {
        heading: "The three failure families",
        paragraphs: [
          "Invalid spec: the pipeline validates the task's spec schema before doing work; a malformed spec fails fast with the validation error, before any engine call and before any charge path could matter. Engine error: the neural or server run itself errors — timeout, engine refusal, generation error — and the queue records the engine's message verbatim on the task row (or a plain 'generation failed' if the error carries no message). Cancel: your own stop, recorded as 'Canceled by user'.",
          "The task card keeps the evidence: prompt, settings, effort, and the error string, so 'why did it fail' is usually one glance, not a mystery. Failed tasks stay in history — they are marked, not deleted, which is the difference between debugging support and plausible deniability.",
        ],
      },
      {
        heading: "The money truth",
        paragraphs: [
          "On the pay-by-result flow — what the studio creates — failure and money never meet: the only charge is Confirm & Export, which requires a successful preview first. On the legacy creation-charged path, a failed task is refunded in full (a cancel_refund grant of exactly what was spent). The insufficient-balance case is not a failure of the task but a 402 from the API: generation and preview remain free, and your balance is untouched by the refusal.",
        ],
      },
    ],
    faqs: [
      {
        q: "The preview worked but looks wrong. Is that a failure?",
        a: "No — a low-quality preview is a successful generation you are free to abandon. Redo or walk away; the charge only exists if you confirm the export.",
      },
      {
        q: "Can I retry a failed task?",
        a: "Yes — the redo affordance exists for exactly that, and redos are free. What you cannot do is confirm a failed task; there is nothing there to confirm.",
      },
    ],
    related: [
      { label: "Failure charges", href: "/blog/are-credits-deducted-when-a-generation-fails" },
      { label: "Export problems", href: "/blog/fix-common-hyper3d-export-problems" },
      { label: "Help: troubleshooting", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
    ],
  },
  {
    slug: "fix-common-hyper3d-export-problems",
    title: "Common Export Problems and Their Real Fixes",
    category: "workflow",
    description:
      "Six real formats, real failure modes: wrong app for the format, ASCII FBX pickiness, USDZ zip structure — plus what 'export' means (and doesn't) here.",
    date: "2026-10-10",
    status: "live",
    answer:
      "The exporters write real bytes in six formats — GLB, glTF, FBX, OBJ, STL, USDZ — and the common problems are honest ones: opening a format in the wrong tool, expecting CAD formats that do not exist here, or misunderstanding what the convertor converts. The fixes below are all verifiable in a browser.",
    sections: [
      {
        heading: "Problem: 'my FBX won't open'",
        paragraphs: [
          "The FBX exporter here writes ASCII FBX 7.3 with geometry, normals, UVs, and vertex colors. Most modern DCCs import ASCII FBX fine; some pipelines expect binary-only and refuse. If your tool rejects it, the practical fix is exporting GLB (the most portable container, binary glTF) and converting in your DCC's importer — or opening it in the OmniCraft model viewer, which parses GLB, GLTF, OBJ, and STL locally to confirm the bytes themselves are sound before you blame the file.",
        ],
      },
      {
        heading: "Problem: 'there's no DXF/3MF/STEP option'",
        paragraphs: [
          "Correct — and permanent, as far as this codebase is concerned: the exporter set is exactly six formats, and CAD output is not among them. The tools tree's converter pages state this per pair; the honest workaround for CAD-bound work is exporting OBJ or STL and importing into your CAD tool's mesh pathway. What will not help is waiting for a format whose writer does not exist here.",
        ],
      },
      {
        heading: "Problem: 'the convertor won't take my file'",
        paragraphs: [
          "That is by design, not a bug: the Format Convertor re-exports tasks you generated and confirmed here — it is not an arbitrary-file upload service. Give it a task from your history and it will re-emit that mesh in any of the six formats, costing nothing extra. Uploading an external model for conversion is a different product category, and this clone's pages say so rather than accepting files it cannot process.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which format should I pick for the web?",
        a: "GLB — one binary file carrying geometry plus materials, which is what three.js and most WebXR stacks ingest natively. The GLB format article in this blog covers why.",
      },
      {
        q: "Which for 3D printing?",
        a: "STL (binary) — the slicing world's lingua franca; the bytes here are standard 80-byte-header binary STL that slicers accept directly.",
      },
      {
        q: "Do re-exports cost credits?",
        a: "No. Once a task is confirmed, exporting and re-exporting it in any format costs nothing extra; the convertor's pages state the same.",
      },
    ],
    related: [
      { label: "GLB format article", href: "/blog/what-is-glb-file" },
      { label: "STL format article", href: "/blog/what-is-stl-file" },
      { label: "Format convertor", href: "/workspace/omnicraft/formatcon" },
      { label: "Model viewer", href: "/workspace/omnicraft/viewer" },
    ],
  },
];
