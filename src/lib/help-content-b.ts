/**
 * Help Center content, part B — Credit (6) + Features, first half (7).
 * Reference sitemap parity (recon 2026-10-30): these are the categories'
 * exact article sets, minus the ones in part C.
 *
 * Honesty anchors used in this module (all real code facts):
 *  - INITIAL_BALANCE 50 / STANDARD_COST 1 / AGENTIC_COST 10 (credits.ts)
 *  - confirm charges exactly CONFIRM_COST = 1, atomically, once
 *    (confirm.ts; second confirm answers "already_confirmed", charges 0)
 *  - task states: created → queued → processing → DonePreview → done|failed
 *  - neural abort reasons: SSE error, stall > 75s, fetch failure, quota —
 *    then the server Fast-tier fallback stamps engine_used="fast"
 *  - export route rejects bad formats and unfinished tasks
 *  - cancel: pay-by-result tasks were never charged; creation-charged
 *    tasks are refunded in full (ledger reason "cancel_refund");
 *    complete tasks answer 409 "already_complete"
 */

import type { HelpArticleDef } from "./help-types";
import { STUDIO_PATH } from "./studio-path";

export const HELP_ARTICLES_B: HelpArticleDef[] = [
  /* ------------------------------- Credit (6) ----------------------------- */
  {
    slug: "how-many-credits-does-each-hyper3d-generation-cost",
    title: "How many credits does each generation cost?",
    category: "credit",
    description:
      "The real price list: 50 credits at signup, 0 to create and preview, exactly 1 at Confirm & Export for standard runs, 10 for agentic runs.",
    status: "live",
    answer:
      "Creating a task and watching its preview costs 0 credits. Confirm & Export costs exactly 1 credit for a standard run and 10 for an agentic run, charged once. New accounts start with 50 credits, and OmniCraft's local tools cost nothing.",
    sections: [
      {
        heading: "The price list (from the code, not a pricing page)",
        paragraphs: [
          "The numbers in this article are the constants the metering code actually uses, which is why they are so refreshingly short: a new account is granted 50 credits at signup; a standard generation costs 1 credit; an agentic-tier generation costs 10 credits; and the first task's preview is free — under the pay-by-result flow every preview is free, because the charge only happens at confirm.",
          "Confirm is atomic and idempotent: it charges exactly 1 credit once, inside a single transaction, and a second confirm attempt answers 'already confirmed' and charges 0. Your balance never goes negative — an insufficient balance refuses the request with a 402 instead.",
        ],
      },
      {
        heading: "What never costs credits",
        paragraphs: [
          "OmniCraft's tools do not touch the ledger: HDRI Generation, Vector to 3D, the Model Viewer and the Format Convertor run without spending credits. Browsing, searching, liking featured models, polishing a prompt and watching progress are all free actions too.",
        ],
        note: "50 to start · 0 to preview · 1 per standard confirm · 10 per agentic run. Those four numbers are the entire pricing model.",
      },
      {
        heading: "Use the displayed cost as the source of truth",
        paragraphs: [
          "The studio tells you the price before you can pay it: the confirm step presents the charge, and when a balance cannot cover it the refusal names both numbers — the credits the task needs and the credits you have. Those strings come from the metering code itself, so the number on screen and the number in the ledger are the same number.",
          "There is no separate pricing page to drift out of date, because the prices live in one constant module and every surface that mentions them — the pricing overlay, these articles, the feature pages' tests — reads from the same source.",
        ],
      },
      {
        heading: "Why two similar tasks can cost different amounts",
        paragraphs: [
          "Here they cannot. The price depends on exactly one thing — the tier of the run: 1 credit for a standard confirm, 10 for an agentic one — and nothing else about the task moves it: not prompt length, not effort level, not image count, not which version you picked, and not how long the engine took.",
          "The reference's pricing varies by model and settings, and its own help article explains those mechanics; that is its product's truth. This clone's truth is a flat table, and the flatness is test-enforced — the tests pin the 1 and the 10 and forbid any other number appearing as a price.",
        ],
      },
    ],
    faq: [
      {
        q: "Does the agentic tier cost more because it is better?",
        a: "It costs 10 instead of 1 because it runs a different, heavier pipeline on the image-to-3D path. Whether it is 'better' is your call after comparing previews — both tiers preview for free, so you can compare without spending.",
      },
      {
        q: "Do effort levels change the price?",
        a: "No. Effort changes how long the engine works — roughly 4 seconds on the fastest level up to about 80 on the highest — but the confirm charge stays 1 credit standard, 10 agentic, regardless.",
      },
      {
        q: "What if my balance is not enough?",
        a: "The confirm is refused with HTTP 402, and the refusal message names the required credits and your current balance. Your balance never goes negative and the task simply waits for you to decide.",
      },
      {
        q: "Do exports cost extra?",
        a: "No — the confirm charge covers the export. Once a task is confirmed, all six formats are served from the stored model with no further metering.",
      },
      {
        q: "Where do I see what I have spent?",
        a: "The studio's credit readout always shows the current balance, and the credit-history article covers what is visible: the balance live, and the per-entry ledger server-side with every movement carrying a reason.",
      },
    ],
    related: [
      { label: "Failed generations cost 0", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Do credits expire?", href: "/help/articles/do-hyper3d-credits-expire" },
      { label: "Purchasing credits (not possible)", href: "/help/articles/how-to-purchase-hyper3d-credits" },
      { label: "Beginner's guide", href: "/help/articles/how-to-use-hyper3d-beginners-guide" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "do-hyper3d-credits-expire",
    title: "Do credits expire?",
    category: "credit",
    description:
      "No — this clone has no expiry logic at all. Credits persist until spent; nothing schedules a lapse, a rollover or a monthly reset.",
    status: "live",
    answer:
      "No. Credits in this clone never expire: the ledger keeps a plain per-account balance, and nothing in the codebase schedules an expiry, a rollover window or a monthly reset. Credits leave your balance exactly one way — you spend them on confirms.",
    sections: [
      {
        heading: "What the code actually does",
        paragraphs: [
          "The balance is an integer per account, moved only by grants (your 50-credit signup) and spends (your confirm actions), each recorded as a ledger entry with a reason and timestamp. There is no TTL on entries, no cron that sweeps balances, and no subscription cycle that could reset an allowance — the entire concept of expiring credits has no place to attach in this codebase.",
        ],
      },
      {
        heading: "The honest caveats",
        paragraphs: [
          "Two limits are real, though neither is expiry. First, a balance is tied to its account and is not transferable — a second account means a second, separate 50-credit grant, not a merge. Second, if you delete your browser data you only lose the session cookie; the account and its balance stay intact behind the sign-in page, where a password you cannot remember becomes the real 'expiry' risk (the reset article covers that honestly).",
        ],
        note: "No expiry logic exists here. Spend them today or spend them next month — the ledger does not care.",
      },
      {
        heading: "Frozen credits are not expired credits",
        paragraphs: [
          "The reference distinguishes expiring subscription credits from directly-purchased ones, and mentions credits a plan change can freeze. None of those states exist here: a balance is one plain integer per account, with no tiers, no freezing, no thawing, and no categories that behave differently. If you can see a number, that number is spendable, full stop.",
        ],
      },
      {
        heading: "How to protect an expiring balance",
        paragraphs: [
          "There is nothing to protect — no date approaches. The only real ways to lose credits here are spending them (which is their purpose) and losing the account's password with no reset path existing, which strands the balance along with the task history. The reset article covers that case honestly: finish what matters inside a signed-in session, because the session — not the balance — is what expires.",
        ],
      },
      {
        heading: "Subscription credits",
        paragraphs: [
          "The reference's first category — credits granted by a recurring plan, expiring with the cycle — cannot exist here because neither half of the definition can: there is no subscription to grant them and no expiry logic anywhere in the ledger. The signup grant is the only inflow, and it is indistinguishable from any other credit the moment it lands: same integer, same spendability, same immortality.",
        ],
      },
      {
        heading: "Directly purchased credits",
        paragraphs: [
          "The reference's second category — bought outright, longer-lived — is equally absent, for the simpler reason that nothing here can be bought. No credit in this clone has a provenance distinction, because there is exactly one provenance: the 50-credit grant at signup. That uniformity is why this article can be this short and still be the whole truth.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there an expiry date anywhere on my account?",
        a: "No. The ledger entry carries a timestamp for when a movement happened, but no credit ever carries a deadline — nothing in the code computes one.",
      },
      {
        q: "What happens to credits in a dormant account?",
        a: "They sit. No inactivity rule, no dormancy fee, no sweep — the balance is the same integer whenever you return.",
      },
      {
        q: "Do promotional or bonus credits behave differently?",
        a: "There are none. The signup grant is the only inflow, and it behaves exactly like every other credit: one integer, no expiry, no categories.",
      },
      {
        q: "If credits never expire, why track them at all?",
        a: "Because metering still needs accounting: the ledger keeps every grant, spend and refund with a reason so the balance is auditable rather than a mutable number someone could edit. Expiry was never the point — correctness was.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Checking your balance", href: "/help/articles/how-to-check-hyper3d-credit-history" },
      { label: "Password reset (not offered)", href: "/help/articles/how-to-reset-hyper3d-password" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "how-to-check-hyper3d-credit-history",
    title: "How to check your credit history",
    category: "credit",
    description:
      "Your live balance is always in the studio top bar; a full per-entry history page is not exposed in this clone. Here is exactly what you can and can't see.",
    status: "partial",
    answer:
      "Your current balance is always visible in the studio top bar, fetched live from the account endpoint. A full per-entry credit history page is not exposed in this clone — the ledger records every grant and spend internally, but only balances and per-task spend are surfaced in the UI.",
    sections: [
      {
        heading: "What you can see",
        paragraphs: [
          "The studio top bar shows your balance and updates it after each task action, because it reads the same account endpoint the metering writes through. Every task card also shows what that task actually spent — a preview-stage task shows 0, a confirmed task shows its 1 (or 10) credit charge — so recent activity is reconstructable task by task from your list.",
        ],
      },
      {
        heading: "What you can't see (yet, or at all)",
        paragraphs: [
          "There is no wallet-history page: the ledger's individual entries — signup grants, confirm spends, cancel refunds — exist in the database and are asserted by the test suite, but no route renders them as a browsable list. That is a UI gap, not a data gap, and we would rather call it a gap than dress the task list up as an account statement.",
        ],
        note: "Balance: always visible. Per-entry ledger page: not rendered in this clone — the entries exist, the surface doesn't.",
      },
      {
        heading: "If a record looks wrong",
        paragraphs: [
          "Check it against the rules the ledger actually follows: the only inflow is the 50-credit signup grant, the only outflows are confirm charges (1 standard, 10 agentic), and the only credit return is the automatic cancel refund. Every movement carries one of those machine-readable reasons — free_preview bookkeeping, standard_generation, agentic_generation, cancel_refund — so an entry that does not fit a reason is worth a second look, and an entry that fits one is almost certainly correct.",
          "The balance itself is always live in the studio's credit readout, and it is the running total of exactly those entries — the code never mutates it independently. What you cannot do here is browse the entry list as its own page; that surface is not rendered, and this article says so instead of linking something that does not exist.",
        ],
      },
      {
        heading: "Open your credit history",
        paragraphs: [
          "The honest version of this step: there is no history page to open — the balance in the studio's credit readout is the live, always-current total, and watching it across your own actions is the real history surface this clone renders. The reference's version is a browsable ledger page; this clone's is a number that moves only when the documented rules move it, which trades the browsable list for a number you can trust in place.",
        ],
      },
    ],
    faq: [
      {
        q: "Where exactly is my balance shown?",
        a: "In the studio's top-bar credit readout, live. It updates on every confirm and refund without a manual refresh of the page.",
      },
      {
        q: "Is there a statement or receipt page?",
        a: "No — the per-entry ledger surface is not rendered in this clone. The entries exist server-side with reasons on every one; the page that would list them does not.",
      },
      {
        q: "Can I export my ledger?",
        a: "No export surface exists here. The balance and the movement rules are documented in these articles, which is the honest extent of it.",
      },
      {
        q: "Who do I contact about a wrong entry?",
        a: "There is no support inbox. The practical check is behavioral: confirm a fresh task and watch the readout move by exactly the documented amount — the metering is deterministic, so the same actions always produce the same entries.",
      },
    ],
    related: [
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
      { label: "Cancel refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Open the studio", href: STUDIO_PATH },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "are-credits-deducted-when-a-generation-fails",
    title: "Are credits deducted when a generation fails?",
    category: "credit",
    description:
      "No — creation is free and the charge only happens at confirm, after a successful preview. Failed generations cost 0 credits here.",
    status: "live",
    answer:
      "No. Under this clone's pay-by-result flow a generation is charged only at Confirm & Export — a step that only exists after a successful preview — so a failed generation costs 0 credits by construction. There is one legacy edge (creation-charged tasks) and it is covered below.",
    sections: [
      {
        heading: "Why failure cannot bill you",
        paragraphs: [
          "The task lifecycle runs created → queued → processing → DonePreview → done (or failed). The only charge point sits after DonePreview, at your explicit confirm, when the pipeline has already produced the model you are looking at. If the run dies before that — invalid input, engine error, your own cancel — the task ends in failed and the ledger never sees a spend from it. Failure and payment are sequential states, and failure comes first.",
        ],
      },
      {
        heading: "The neural-failure case that still delivers",
        paragraphs: [
          "When the in-browser neural run aborts (connection error, a stall past 75 seconds, quota), the honest fallback kicks in: the server runs the production-proven Fast tier instead, stamps the task with the fallback reason, and you still land on a preview — still 0 credits. You are never charged for watching a recovery happen.",
        ],
      },
      {
        heading: "The legacy edge, stated plainly",
        paragraphs: [
          "Older tasks in this system were charged at creation rather than at confirm. For those, a failure did not auto-refund — the honest recovery was Cancel, which returns the full amount (see the cancel article). No task created under the current flow carries this edge, and the refund article documents the automatic path.",
        ],
        note: "Failed generation, aborted neural run, canceled task — all of them cost 0 under the current flow. The 1-credit charge needs your confirm and a finished preview.",
      },
      {
        heading: "How to verify a suspected deduction",
        paragraphs: [
          "Verification here is behavioral and free: read the balance before the action, take the action, read it after. A confirm moves it by exactly 1 (or 10 on the agentic tier); everything else — creation, previewing, retrying, failing, canceling before confirm — moves it by exactly 0. The refusal case is even louder: an underfunded confirm is refused with HTTP 402 and a message that names the required amount and your balance, so you see the arithmetic the code would have performed.",
        ],
      },
      {
        heading: "Web generation",
        paragraphs: [
          "The reference splits its answer by where the generation ran — web or API — because its two surfaces meter differently. Here the split collapses: the studio is the only generation surface this clone ships, and its rule is the single one stated above — 0 until confirm, then the tier price, never on failure. There is no second web pricing tier, no session-based discount, and no difference between your first generation and your hundredth.",
        ],
      },
      {
        heading: "API generation",
        paragraphs: [
          "The honest version of this section: this clone exposes no public generation API for your account — the studio's own routes drive the pipeline, and they enforce the same pay-by-result rules as the UI. The API the MCP sheet documents belongs to the real service, with its own metering; nothing you do there touches this clone's ledger, and nothing here can answer for its billing.",
        ],
      },
    ],
    faq: [
      {
        q: "Can a bug charge me silently?",
        a: "The charge path is narrow by construction — one route, one constant per tier, one ledger write — and the tests pin the amounts. The failure modes this codebase knows about end before the charge, not after it.",
      },
      {
        q: "What about the neural fallback — does that count as failure?",
        a: "No. A stalled neural run falls back to the fast tier, the task completes, and you still have a preview to judge. Nothing is charged until you confirm that preview, whichever tier produced it.",
      },
      {
        q: "If I confirm and then regret it, is that a failure refund?",
        a: "No — confirm is deliberate and final: the export unlocks, the cancel route answers 409 already_complete, and the refund article explains why that refusal is the honest behavior.",
      },
      {
        q: "Do failed tasks appear in my history?",
        a: "Yes, with their failure state visible — the task rail shows what actually happened rather than hiding it, which is part of how you can audit the behavior described here.",
      },
    ],
    related: [
      { label: "Canceling and refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
      { label: "Credit costs", href: "/help/articles/how-many-credits-does-each-hyper3d-generation-cost" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "are-credits-returned-after-canceling-a-generation",
    title: "Are credits returned after canceling a generation?",
    category: "credit",
    description:
      "Yes where it matters: pay-by-result tasks were never charged, and creation-charged tasks are refunded in full on cancel. Post-confirm cancels are refused.",
    status: "live",
    answer:
      "Yes — in both cases that can occur. Pay-by-result tasks were never charged, so canceling them returns you to exactly zero spent; legacy tasks charged at creation are refunded in full, automatically, the moment you cancel. After a confirm, cancel is refused — the export is already yours.",
    sections: [
      {
        heading: "Cancel before confirm: nothing was taken",
        paragraphs: [
          "Canceling a running or preview-stage task marks it failed with an honest 'Canceled by user' error and touches no credits, because under pay-by-result the charge lives at confirm, which you never reached. The button gives the API a one-word story: canceled, spent 0.",
        ],
      },
      {
        heading: "Cancel a creation-charged (legacy) task: full refund",
        paragraphs: [
          "For tasks that were charged at creation, Cancel grants back exactly what was spent — in full, immediately — and the ledger records it with the reason 'cancel_refund' so the movement is auditable. The task flips to failed, its charge flips to zero, and your balance is made whole without a support request in sight.",
        ],
      },
      {
        heading: "After confirm: cancel is refused, on purpose",
        paragraphs: [
          "Once a task is complete or confirmed, the cancel endpoint answers 'already complete' with a 409 and changes nothing. The preview was delivered, the credit was spent on a real result, and the export remains available — undoing a delivered result would make the 1-credit promise meaningless.",
        ],
        note: "Pay-by-result cancel: 0 taken, 0 to return. Legacy cancel: refunded in full, automatically. Post-confirm: refused (409) — the model is yours.",
      },
      {
        heading: "What to do when credits look wrong",
        paragraphs: [
          "Run the free checks in order: refresh the studio so the credit readout re-reads the ledger; check the task's state in the rail (a done task was charged, a failed or canceled one was not); and re-read the refusal case — a 402 never deducts anything, it only refuses. If a number still looks wrong after that, the deterministic metering means the entry list server-side holds the answer, and the credit-history article states exactly how much of it is visible.",
        ],
      },
      {
        heading: "Unconfirmed web results",
        paragraphs: [
          "An unconfirmed result is the free state by definition: the preview exists, the task is inspectable, and the balance has not moved. Canceling such a task returns nothing because nothing was taken — the reference's phrase for this stage maps exactly, and the only honest advice is to treat the unconfirmed state as the free look it is: orbit it, wireframe it, and confirm only the keepers.",
        ],
      },
      {
        heading: "Accepted API tasks",
        paragraphs: [
          "The reference's third case — tasks submitted through its API, which meter on acceptance — has no counterpart here: this clone exposes no public generation API, so no task of yours can exist in that state. The nearest real thing is the legacy creation-charged task from this codebase's own past, and that one refunds in full on cancel — the ledger reason is cancel_refund, and the mechanism is the same automatic grant-back either way.",
        ],
      },
    ],
    faq: [
      {
        q: "Why is cancel refused after confirm?",
        a: "Because there is nothing left to cancel: the confirm charge covered the export, the file is already yours, and refunding it would be unmetering a delivered result. The 409 already_complete answer is the code saying precisely that.",
      },
      {
        q: "Does the automatic refund need a request?",
        a: "No. The legacy cancel and the cancel_refund ledger entry are the same transaction — pressing cancel IS the request, and the credit lands immediately.",
      },
      {
        q: "Can I cancel a queued task?",
        a: "Yes — and under pay-by-result it costs nothing, because nothing was charged: the task simply stops before a preview ever exists.",
      },
      {
        q: "What if I cancel exactly while a confirm is in flight?",
        a: "The ledger writes are ordered — a cancel that lands after the confirm finds a complete task and answers 409 already_complete, and one that lands before it finds nothing charged and simply stops the task. Either ordering is safe; there is no half-state where credits vanish.",
      },
      {
        q: "Is there a cancel time limit?",
        a: "The boundary is state, not time: cancelable until confirm, refused after. There is no window in minutes because there is nothing to race — the charge has not happened until you trigger it.",
      },
    ],
    related: [
      { label: "Failed generations", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Refund article", href: "/help/articles/how-to-request-a-hyper3d-refund" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "why-did-my-hyper3d-generation-fail",
    title: "Why did my generation fail?",
    category: "credit",
    description:
      "The real failure modes: rejected inputs, neural aborts (with an automatic Fast-tier fallback), your own cancel, and true pipeline errors — and what each costs.",
    status: "live",
    answer:
      "Failures here come from four honest places: input the pipeline rejects, a neural run that aborts (connection error, stall past 75 seconds, quota — usually rescued by the automatic Fast-tier fallback), your own Cancel, or a true pipeline error. All of them cost 0 credits under the current flow.",
    sections: [
      {
        heading: "Reading what actually happened",
        paragraphs: [
          "A failed task carries its reason in the task's error field, and the common values are honest ones: 'Canceled by user' for your own cancels, fallback reasons like connection errors or stalls for neural aborts, and validation messages for rejected inputs. Start there — the status line on the card is the diagnosis, not a generic 'something went wrong'.",
        ],
      },
      {
        heading: "The neural abort that usually isn't fatal",
        paragraphs: [
          "The engine run happens in your browser, so it inherits your network's bad days. On an abort the server takes over with the production-proven Fast tier, stamps engine_used='fast' plus the fallback reason, and the task lands on a preview anyway. If your model arrived looking simpler than expected, check the engine tag — you got the fallback, and it still cost you nothing until you confirm.",
        ],
      },
      {
        heading: "A real troubleshooting pass",
        paragraphs: [
          "Most failures resolve in one of four moves, and none of them cost credits to try.",
        ],
        steps: [
          {
            title: "Check the input",
            body: "One clear subject for images, a specific prompt for text — the pipeline rejects what it cannot interpret, and the error says so.",
          },
          {
            title: "Check your balance",
            body: "A 402 means the ledger refused a charge; the balance top bar is the fastest check. (Creation itself is free — this fires at confirm.)",
          },
          {
            title: "Look at the engine tag",
            body: "engine_used='fast' with a fallback reason means the neural run aborted but the fallback delivered. Not a failure — a rescue.",
          },
          {
            title: "Generate again",
            body: "Retry is free: creation and preview cost 0, so a second attempt is the cheapest diagnostic this side of anywhere.",
          },
        ],
        note: "Failed tasks cost 0 under pay-by-result. Retry freely — the 1-credit charge cannot happen until a preview exists and you confirm it.",
      },
      {
        heading: "Common causes",
        paragraphs: [
          "The causes that actually occur in this pipeline, in rough frequency order. A prompt the spec compiler cannot accept — objects out of the 2-to-12 range, dimensions outside 0.05 to 4, unknown keys — is rejected up front with the validator's own message, which is the fastest failure to fix: rephrase toward the documented vocabulary. An image that cannot be read (wrong type, undecodable, oversized) fails at intake with its own error, before any engine work.",
          "Then the soft cases: a neural run that stalls past its watchdog window falls back to the fast tier automatically — stamped with the fallback reason rather than failed — and a total backend outage degrades to the deterministic fallback spec so you still see a composition. Neither of those is your fault, and neither costs anything. Balance shortfalls are not failures at all: they are 402 refusals at confirm time, named with the exact numbers.",
        ],
      },
    ],
    faq: [
      {
        q: "Is a rejected prompt the same as a failed task?",
        a: "Close — the task fails fast, before engine work, with the validator's message telling you exactly which rule broke. Fixing the prompt and regenerating is free, since the charge only exists at confirm.",
      },
      {
        q: "How do I know whether the fallback ran?",
        a: "The task carries the engine actually used and the fallback reason on it — the task rail surfaces what really happened rather than relabeling it.",
      },
      {
        q: "Does retrying use more credits?",
        a: "No. Every retry runs the free path: create, preview, decide. The 1-credit (or 10-credit) charge happens only on the confirm you choose to press.",
      },
      {
        q: "When should I stop retrying and change approach?",
        a: "When the failure repeats with the same message — that is the code telling you the input breaks the same rule every time. A different phrasing, fewer objects, or a cleaner reference image changes the input; pressing generate again does not.",
      },
      {
        q: "Are failures visible anywhere besides the task state?",
        a: "The failure article is the map, and the studio's own surfaces — the generation toast and the task rail — show the real state transitions as they happen, so you can watch the pipeline tell the truth about itself.",
      },
    ],
    related: [
      { label: "Failed generations & credits", href: "/help/articles/are-credits-deducted-when-a-generation-fails" },
      { label: "Cancel & refunds", href: "/help/articles/are-credits-returned-after-canceling-a-generation" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },

  /* ---------------------- Features, first half (7) ----------------------- */
  {
    slug: "choose-rodin-model-and-generation-settings",
    title: "Choosing a model version and generation settings",
    category: "features",
    description:
      "The studio's real controls: two live modes (Text and Image to 3D), Gen-1.5 vs Gen-2.5 versions, five effort levels — and the settings that don't exist here.",
    status: "partial",
    answer:
      "The studio exposes the reference-shaped controls: a mode picker (Text to 3D and Image to 3D are live; Editing and WorldGen are marked 'not implemented here yet'), two model versions (Gen-1.5 speedy standard and Gen-2.5 agent-ready with five efforts), and viewer display modes. What it doesn't have: polycount targets, seeds or LOD switches.",
    sections: [
      {
        heading: "What the controls really steer",
        paragraphs: [
          "The mode picker is honest about reachability — 'Image and Text to 3D are live' is the interface's own wording for the two entries that run, and the other two entries stay visible but disabled with their reason. Model versions map to real pipelines: Gen-1.5 is the speedy standard path, Gen-2.5 is the agent-ready tier whose runs cost 10 credits instead of 1.",
          "Effort is a real, five-step dial — Extreme-Low through Extreme-High — that trades refinement time (4 seconds up to 80) for detail in the result. The viewer's shaded, wireframe and normal modes are display toggles for inspecting what you generated, not regeneration settings.",
        ],
      },
      {
        heading: "The settings that are not on the panel",
        paragraphs: [
          "There is no polycount slider, no face-count target and no LOD chain — geometry here is prompt-steered and pipeline-built, not budgeted. The topology article explains why and what to do instead, and the styles pages state the same limit per style (the low-poly page says 'no polycount slider' in plain words).",
        ],
        note: "Two live modes, two versions, five efforts, a lockable seed, a privacy toggle. No polycount, no LOD — absence stated on the panel itself.",
      },
      {
        heading: "Choose between Gen-2.5 and Gen-1.5",
        paragraphs: [
          "The model picker mirrors the reference's split: Gen-2.5, labeled 'The most capable model yet.', and Gen-1.5, 'Faster, better on simple models.' The choice is real here — Gen-2.5 unlocks the neural image-to-3D tier and agentic mode, while Gen-1.5 keeps generation on the lighter path and maps legacy mode picks onto it.",
        ],
      },
      {
        heading: "Set privacy and batch size before generation",
        paragraphs: [
          "Privacy is real: a toggle marks a task private, which hides it from the gallery — public is the default, and the toggle's own tooltip states both sides. Batch size is the honest absence: one generate press produces one task, and there is no batch field anywhere in the request schema.",
        ],
      },
      {
        heading: "Use presets for repeatable input",
        paragraphs: [
          "The Presets panel is live: geometry presets append a style hint to the prompt (the hint text is visible, not hidden), saved presets persist locally in your browser, and a 'Use Recommended' toggle rides the header. It is a repeatability tool, not a quality tool — the preset changes the prompt, and the prompt remains the steering surface.",
        ],
      },
      {
        heading: "Leave topology and texture decisions for the correct stage",
        paragraphs: [
          "The reference's advice maps cleanly here: topology (face counts, LODs) and texture work are downstream decisions this clone deliberately does not put on the generation panel. The prompt steers geometry within the spec's rules; your DCC handles decimation, retopology and painting after export. The settings panel carrying no such sliders is the honest version of that division of labor.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the default version?",
        a: "Gen-2.5 — the capable tier, and the only one that unlocks the neural image-to-3D pipeline and agentic mode. Switching to Gen-1.5 is the faster lane for simple subjects.",
      },
      {
        q: "What do the effort levels actually change?",
        a: "How long the engine works — roughly 4 seconds on the fastest level to about 80 on the highest — and therefore how refined the result is. Price stays flat: effort never changes the 1-credit (or 10-credit agentic) confirm charge.",
      },
      {
        q: "Can I pin a seed?",
        a: "Yes — the presets panel carries a numeric seed (0 to 65535) with a lock toggle. Locked, the same seed reproduces the same run; unlocked, each generation rolls a fresh one. It is the reproducibility lever, not a quality control.",
      },
      {
        q: "Does private mean encrypted or hidden?",
        a: "Hidden from the gallery surface — that is the toggle's stated effect. The task and its files behave identically either way; there is no additional encryption tier in this clone.",
      },
      {
        q: "Where do these settings live?",
        a: "On the generation panel itself: the version pill opens the model picker, the effort pill opens the effort cards, and the presets button (labeled 'Prompt presets and seed') opens the presets and seed panel.",
      },
    ],
    related: [
      { label: "Topology & polycount", href: "/help/articles/control-topology-polycount-and-lods" },
      { label: "Agentic mode", href: "/help/articles/use-rodin-agentic-mode-for-image-to-3d" },
      { label: "Beginner's guide", href: "/help/articles/how-to-use-hyper3d-beginners-guide" },
      { label: "Low-poly style page", href: "/styles/low-poly" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "connect-hyper3d-rodin-mcp-to-ai-agents",
    title: "Connecting the MCP endpoint to AI agents",
    category: "features",
    description:
      "The studio's Connect Hyper3D MCP sheet is real: a public Streamable HTTP endpoint, a CLI install line and a paste-ready agent instruction.",
    status: "partial",
    answer:
      "The 'Connect Hyper3D MCP' sheet in the studio is real and gives you three copyable facts: the public Streamable HTTP endpoint (api.hyper3d.com/api/mcp), the CLI install command, and a paste-ready instruction that configures an AI agent to use it. The MCP server itself is the public Hyper3D service, not this clone's backend.",
    sections: [
      {
        heading: "What the sheet hands you",
        paragraphs: [
          "Open the modal from the top bar and you get the endpoint URL, the CLI one-liner (npm install --global @hyper3d/cli), and a compact agent instruction that tells a coding agent how to register the connection, authorize in the browser and verify the tool list. Everything on the sheet copies with one click, which is the entire job of a connect sheet.",
        ],
        steps: [
          {
            title: "Copy the agent instruction",
            body: "The sheet's instruction block names the connection, gives the Streamable HTTP URL and says OAuth — paste it into your agent's chat.",
          },
          {
            title: "Authorize in the browser",
            body: "The agent walks you through browser authorization against the real service; the sheet's hint text tells you to expect it.",
          },
          {
            title: "Verify the tools",
            body: "Ask the agent to list the available tools and whether a restart is required — the last line of the instruction asks for exactly that.",
          },
        ],
      },
      {
        heading: "The honest boundary",
        paragraphs: [
          "This clone's own backend is its task API, not an MCP server — the endpoint in the sheet belongs to the real Hyper3D service and knows nothing about your clone account or its 50 credits. The sheet exists here because the reference has the same affordance; what it configures lives on the real service, and we say so rather than imply this workspace is the MCP host.",
        ],
        note: "The sheet is this clone's; the MCP endpoint is the public Hyper3D service. Two different backends, one honest modal.",
      },
      {
        heading: "Connect the MCP server",
        paragraphs: [
          "The connect sheet carries the constants an agent needs, byte-pinned to the modal that renders them: the public endpoint at https://api.hyper3d.com/api/mcp, the CLI install (npm install --global @hyper3d/cli), and a paste-ready agent instruction. Open the studio's MCP button, copy the block, and drop it into any MCP-capable client's config.",
        ],
      },
      {
        heading: "Troubleshoot the connection",
        paragraphs: [
          "The honest scope first: the connection under test is between your agent and the real Hyper3D service — this clone renders the instructions but is not the endpoint, so it cannot see, proxy or debug your agent's session. If the agent cannot reach the endpoint, check the endpoint URL exactly as printed, the CLI's own authentication against the real service, and your client's config syntax.",
          "What this clone can verify is its own half: the sheet's constants are pinned in tests against the modal's source, so the URL and package name you copied are the ones intended. If a paste fails because of a typo, the sheet is the thing to re-copy from.",
        ],
      },
    ],
    faq: [
      {
        q: "Does this clone proxy or host the MCP server?",
        a: "No — the modal documents the real service's public endpoint as a connection fact. Your agent talks to api.hyper3d.com directly; this clone's backend is not in that path at all.",
      },
      {
        q: "Do I need an API key from this clone?",
        a: "No key exists here to issue. Authentication against the real service belongs to that service's own account system — this clone shares nothing with those accounts.",
      },
      {
        q: "Which agents can use the sheet?",
        a: "Any MCP-capable client — the sheet is client-agnostic because it documents a standard MCP endpoint and a CLI, not a particular vendor's protocol extension.",
      },
      {
        q: "Where is the connect sheet?",
        a: "In the studio — the MCP button opens the modal with the endpoint, the CLI install line, and the paste-ready agent instruction, the same constants pinned in the tests.",
      },
    ],
    related: [
      { label: "What is Hyper3D", href: "/help/articles/what-is-hyper3d" },
      { label: "Feature overview", href: "/help/articles/what-features-does-hyper3d-have" },
      { label: "API feature page", href: "/features/api" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "control-topology-polycount-and-lods",
    title: "Controlling topology, polycount and LODs (you can't here)",
    category: "features",
    description:
      "There is no polycount slider and no LOD generation in this clone — geometry is prompt-steered. The honest path: export and retopo in a DCC.",
    status: "not-in-clone",
    answer:
      "You can't — this clone has no polycount slider, no face-count targeting and no LOD generation. Geometry comes from the prompt-steered pipeline, and effort changes refinement time, not triangle budget. The honest path for topology control is exporting the mesh and retopologizing in Blender or your DCC of choice.",
    sections: [
      {
        heading: "What topology looks like here",
        paragraphs: [
          "Meshes are built by the generation pipeline from your prompt and settings — there is no decimation stage, no face-count parameter and no LOD chain anywhere in the code path. The effort dial (Extreme-Low to Extreme-High) changes how long the run refines, which changes detail, but at no point do you or the pipeline set a numeric triangle budget.",
        ],
      },
      {
        heading: "The honest workflow instead",
        paragraphs: [
          "If your target engine needs a specific budget or LOD set, treat this workspace as the generator and your DCC as the finisher: export GLB (the most faithful of the six formats), import into Blender, and use its remesher and decimate tools — then build your LOD chain there. The low-poly style page covers the same limit from the styling side and says 'no polycount slider' in exactly those words.",
        ],
        note: "No polycount slider. No face-count targeting. No LODs. Geometry is prompt-steered — budget it in your DCC, not here.",
      },
      {
        heading: "Choose face count from the use case",
        paragraphs: [
          "The reference's guidance — pick a face-count band for the destination (games, print, film) — transfers here as downstream advice, because the generation step exposes no face-count control at all. What you steer at generation is composition: the spec's objects, their dimensions (0.05 to 4), and the prompt's form vocabulary. The face count you end up with is what the engine produced; adjusting it is a decimate-after-export step in your DCC, where the target band for the destination actually gets enforced.",
        ],
      },
      {
        heading: "Build LODs as a downstream set",
        paragraphs: [
          "Same boundary: no LOD generation exists here — no chain, no automatic simplification pass, no LOD preview. The honest workflow is to export the full-detail mesh and build the LOD set in the receiving tool, which is where LODs get judged in context anyway (screen size, distance bands, platform budget). What this clone guarantees is a stable source mesh: same task, same stored model, six formats from identical geometry.",
        ],
      },
      {
        heading: "Choose the supported mesh output deliberately",
        paragraphs: [
          "The reference advises picking your mesh flavor (quad vs tri, tessellated vs baked) to match the pipeline; this clone's honest equivalent is picking among the six real formats with their known behaviors. All six serialize the same stored geometry, but destinations care: GLB for the web and configurators, FBX and OBJ for DCCs and engines, STL for slicers, USDZ for AR. That choice — plus whatever your DCC's importer does with it — is the entire 'mesh output' decision available here, stated at its real size.",
        ],
      },
      {
        heading: "Bake normals for efficient delivery",
        paragraphs: [
          "Normal baking — packing surface detail into normal maps so the mesh can stay light — is not implemented here: there are no texture maps of any kind, so there is nothing to bake into. Materials are flat parameters. The honest delivery-efficiency levers that do exist are the format choice (above), the effort level that shapes how refined the base geometry is, and the decimation you do downstream — everything else on this front belongs to the DCC pipeline that receives the export.",
        ],
      },
    ],
    faq: [
      {
        q: "Is there any topology control at all?",
        a: "Composition-level only: object count (2 to 12 per spec), dimensions (0.05 to 4), and the prompt's form words. Face count, edge flow and retopology are downstream, by design.",
      },
      {
        q: "Can I at least see the mesh density before paying?",
        a: "Yes — the preview's wireframe display mode shows exactly the geometry you would be confirming, and the preview is free. Density judgment happens before the 1-credit charge, not after.",
      },
      {
        q: "Do any export formats change the topology?",
        a: "No — all six formats serialize the same stored mesh. Format choice changes packaging (and which DCC accepts it most happily), not the geometry itself.",
      },
      {
        q: "What is the nearest tool for decimation?",
        a: "Your DCC — Blender's decimate modifier, or engine-native import settings. This clone's job ends at a clean, honestly-described mesh; the topology budget belongs to the tool that will live with it.",
      },
    ],
    related: [
      { label: "Low-poly style page", href: "/styles/low-poly" },
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
      { label: "Game development use case", href: "/use-cases/game-development" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-avatars-with-chatavatar",
    title: "Creating 3D avatars with ChatAvatar (not in this clone)",
    category: "features",
    description:
      "ChatAvatar isn't implemented here — the nearest honest path is a character-focused Text to 3D run, previewed free and exported the usual way.",
    status: "not-in-clone",
    answer:
      "ChatAvatar does not exist in this clone — there is no portrait-to-avatar pipeline and no avatar-specific rigging or blendshapes. The nearest honest path is a character-focused Text to 3D run: describe the character, preview free, confirm for 1 credit, export the mesh.",
    sections: [
      {
        heading: "What's missing, specifically",
        paragraphs: [
          "An avatar product needs a face-and-body pipeline tuned for humanoid proportions, plus the output niceties avatars imply (usable rigs, blendshapes, ready-made expressions). None of that is implemented here — the feature page for ChatAvatar in this clone states its own absence rather than showing a mockup that implies otherwise.",
        ],
      },
      {
        heading: "The nearest thing that IS real",
        paragraphs: [
          "Text to 3D runs end-to-end here and handles character subjects as happily as any other: a prompt like 'a friendly cartoon mascot character with a round head' previews in the studio viewer for free, and confirming spends the standard 1 credit for a six-format export. What you get is a static mesh with flat parameter materials — no rig, no blendshapes — and the character-design use-case page sets that expectation in the same words.",
        ],
        note: "No ChatAvatar, no rigs, no blendshapes here. Character meshes from Text to 3D are real — everything avatar-specific is not.",
      },
      {
        heading: "Prepare the identity reference",
        paragraphs: [
          "For the nearest real path — a character mesh from Text to 3D — 'preparing the reference' means preparing the description: subject, build, costume, pose, and the style band (stylized, low poly, flat-color). There is no photo-to-identity stage here: no upload becomes 'the person', and likeness is not a concept this engine has. Writing the description as if you were briefing a sculptor is the working method.",
        ],
      },
      {
        heading: "Review more than likeness",
        paragraphs: [
          "The reference's review checklist — likeness, topology, blendshapes — reduces honestly here to what a static mesh can be reviewed for: silhouette (orbit the preview), proportions (against your description), and mesh density (the wireframe mode). Likeness cannot be reviewed because it was never generated; saying that plainly beats pretending a likeness score exists.",
        ],
      },
      {
        heading: "Business Lisence",
        paragraphs: [
          "That heading is the reference's own — a typo it ships on its own help page ('Lisence' for 'License'), recorded here faithfully rather than corrected silently, because the clone's rule is to state facts as they are. The substance under it: on the reference, commercial avatar licensing is its product's terms; here, the terms are this clone's own documents — generated models are your output, this codebase claims no ownership over them, and the copyright-license document in /legal carries the details.",
        ],
      },
    ],
    faq: [
      {
        q: "Can a photo become an avatar here?",
        a: "No — the image-to-3D path produces a mesh of what the image shows, not an identity-bound avatar with a face rig. Portrait-to-avatar is the reference's ChatAvatar feature, which does not exist in this clone.",
      },
      {
        q: "Can I rig the character mesh afterwards?",
        a: "Yes — export in your DCC's preferred format and rig there. The mesh is a normal static model; rigging is downstream work by design.",
      },
      {
        q: "Can I use the output commercially?",
        a: "The terms state it plainly: your prompts and reference images are your input, the generated models are your output, and this codebase claims no ownership over either. Verify fitness for your purpose — the terms also say results vary and you are responsible for use.",
      },
      {
        q: "What is ChatAvatar, exactly?",
        a: "The reference's portrait-to-avatar generator — multi-angle identity input, a rigged, blendshaped avatar out. This clone deliberately ships none of that pipeline; the honest equivalent is a described character via Text to 3D.",
      },
    ],
    related: [
      { label: "Text to 3D in practice", href: "/help/articles/create-3d-models-from-text-with-rodin" },
      { label: "ChatAvatar feature page", href: "/features/chatavatar" },
      { label: "Character design use case", href: "/use-cases/character-design" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-models-from-images-with-rodin",
    title: "Creating 3D models from images",
    category: "features",
    description:
      "Image to 3D is live here: upload one reference image, the caption chain reads it, the pipeline builds the mesh, preview free and 1-credit confirm.",
    status: "live",
    answer:
      "Yes — Image to 3D is live end-to-end. Upload a single reference image, the caption chain describes what it sees, the mesh pipeline builds the model, and you preview it free before the 1-credit confirm unlocks the usual six-format export.",
    sections: [
      {
        heading: "The real flow",
        paragraphs: [
          "The upload is a standard multipart form — the API route takes your file, stores a reference URL alongside the task, and runs the caption step that turns the image into a textual description the mesh builder can steer. What you see in the viewer afterward is the same orbit-able, shaded preview every generation produces, and the same confirm gate applies: nothing is charged while you look.",
        ],
        steps: [
          {
            title: "Pick a clean reference",
            body: "One subject, well-lit, minimal background clutter — the caption step can only describe what the image actually shows.",
          },
          {
            title: "Upload and generate",
            body: "Switch the mode picker to Image to 3D, drop the file, generate. Creation costs 0 credits.",
          },
          {
            title: "Preview, then decide",
            body: "Orbit the result in the viewer; if it's right, Confirm & Export spends 1 credit and enables the download buttons.",
          },
        ],
      },
      {
        heading: "The honest limits",
        paragraphs: [
          "This is a single-image pipeline: there is no multi-view consistency of the kind multi-camera products offer, so occluded backs are the pipeline's best inference, not a second photo's truth. Materials arrive as flat parameters rather than baked textures — the model exports with geometry and parameter materials, and painting happens in your DCC if you need more.",
        ],
        note: "One mesh out, 0 credits to look, 1 to keep. Multi-view input is real on the neural tier — multi-view capture is not.",
      },
      {
        heading: "Add references only when they add information",
        paragraphs: [
          "The upload strip accepts PNG, JPEG or WebP, up to eight files, and the first image is the primary — the one the caption builds from. Beyond it, extra views only help on the neural tier and only when they show something the primary cannot: the back, the sides, the underside. A second angle of the same face adds nothing but contradiction risk; a photo of the hidden back adds real information.",
        ],
      },
      {
        heading: "Keep every image consistent",
        paragraphs: [
          "Consistency rules carry over with real stakes here: same subject, same scale framing, same lighting story. The vision stage builds one spec from the evidence it is given, and images that disagree — different objects, zoom levels that imply different sizes — produce a spec that compromises between them. If two views conflict, drop the weaker one rather than letting the engine arbitrate.",
        ],
      },
      {
        heading: "Assign Image Directions (Optional)",
        paragraphs: [
          "This is real and worth doing on the neural tier: each extra view can carry a direction label from the reference's own set — front, back, left, right and the diagonal corners — via the direction picker, and the labeled views ride along as tagged multiview images (up to four beyond the primary). Direction-tagged evidence steers the reconstruction far better than unlabeled hope.",
        ],
      },
      {
        heading: "Review the generated task",
        paragraphs: [
          "The review costs nothing: orbit the preview, switch to wireframe to judge density, check the silhouette against the primary image. Only a confirm charges — 1 credit standard, 10 agentic — and until then every regeneration is free, so 'review' here can genuinely mean 'look, adjust, look again' without metering pressure.",
        ],
      },
    ],
    faq: [
      {
        q: "How many images can I upload?",
        a: "The strip holds up to eight files, but the request the server accepts is one primary image plus up to four direction-tagged extra views on the neural tier — the API schema's own caps, stated as they are.",
      },
      {
        q: "Which file types are accepted?",
        a: "PNG, JPEG and WebP. Anything else is refused at the door with an explicit message, before any engine work or credit implications.",
      },
      {
        q: "Does the background matter?",
        a: "Clean and uncluttered helps, because the caption describes what it sees. There is no automatic background removal here — the honest expectation is that clutter becomes part of the evidence.",
      },
      {
        q: "What if I only have one photo?",
        a: "That is the common case and it works — the primary image alone drives the whole pipeline. Extra views are an optional accuracy boost for the neural tier, not a requirement.",
      },
      {
        q: "Can I generate from a screenshot or drawing?",
        a: "Yes — concept sketches and screenshots are ordinary images to this pipeline. The caption stage describes what is visibly there, which is exactly what a sketch has to offer.",
      },
    ],
    related: [
      { label: "Text to 3D", href: "/help/articles/create-3d-models-from-text-with-rodin" },
      { label: "Why generations fail", href: "/help/articles/why-did-my-hyper3d-generation-fail" },
      { label: "Image to 3D feature page", href: "/features/image-to-3d" },
      { label: "Fixing export problems", href: "/help/articles/fix-common-hyper3d-export-problems" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-3d-models-from-text-with-rodin",
    title: "Creating 3D models from text",
    category: "features",
    description:
      "Text to 3D is live here: prompt in, real mesh out — free preview, 1-credit confirm, six export formats, and a prompt-polish button that actually fixes typos.",
    status: "live",
    answer:
      "Yes — Text to 3D is the primary live loop. Type a prompt, generate, and preview the mesh free; Confirm & Export spends 1 credit and unlocks GLB, GLTF, FBX, OBJ, STL and USDZ. The prompt card even has a working polish button that fixes typos before you commit.",
    sections: [
      {
        heading: "The real flow",
        paragraphs: [
          "The prompt card sits in the studio's control panel: type a description, optionally polish it (a real server-side spell-and-grammar pass, the same 'correct' action the reference's prompt card has), pick your effort, and generate. The task runs the pipeline and lands on a preview you can orbit before any money-like commitment happens — which here means before the single 1-credit confirm.",
        ],
        steps: [
          {
            title: "Write a specific prompt",
            body: "Subject, form, a few adjectives — 'a rugged scout mech with matte panels' beats 'a robot' every time.",
          },
          {
            title: "Polish if you like",
            body: "The polish button cleans typos and grammar without changing your meaning; it returns the corrected prompt for you to approve.",
          },
          {
            title: "Generate, preview, confirm",
            body: "Watch the preview free, then Confirm & Export for 1 credit and download in any of the six formats.",
          },
        ],
      },
      {
        heading: "What 'from text' honestly means here",
        paragraphs: [
          "The prompt steers real geometry through this codebase's own pipeline — it is not a gateway to an external model farm, and there is no style-lock or polycount control attached to it (the settings and topology articles say why; a lockable seed does exist on the presets panel for reproducible runs). Materials come out as flat parameters; if you need a specific art style, the styles pages tell you which looks are steerable with prompts alone and which need finishing in a DCC.",
        ],
        note: "Prompt in, mesh out, preview free, 1 credit to keep it. The polish button is real — and so is every limit listed above.",
      },
      {
        heading: "Write one object at a time",
        paragraphs: [
          "The reference's advice, checked against this engine: the spec accepts 2 to 12 objects, so small compositions are legal — but clarity still wins. Fewer objects, each named precisely with its form, beats a crowded prompt where every object fights for attention. The engine composes ground-level by design; describing a coherent small arrangement ('a mug beside a stack of two books') reads better than inventorying a room.",
        ],
      },
      {
        heading: "Refine the source before rebuilding everything",
        paragraphs: [
          "This maps to real mechanics: the prompt is the source, and refining it — tightening the subject, swapping form words, fixing typos with the polish button — then regenerating is the free loop. Nothing partial exists to preserve: no 'keep this part, redo that part', because editing at that granularity is not implemented. The honest iteration unit is the whole prompt, and its cost is zero until you confirm a result worth 1 credit.",
        ],
      },
    ],
    faq: [
      {
        q: "How many objects can one prompt hold?",
        a: "Between 2 and 12 — the spec's hard rules. Dimensions clamp between 0.05 and 4, positions within -4 to 4, and anything outside is rejected with the validator's own message rather than silently guessed.",
      },
      {
        q: "What happens to a vague prompt?",
        a: "It degrades to the deterministic fallback — a composed set of primitives named from your prompt's first words, inspectable like any preview. It is a visible signal that the prompt was too vague, and re-prompting is free.",
      },
      {
        q: "Can I write prompts in another language?",
        a: "You can type anything — nothing rejects it — but the compiler's keyword vocabulary is English tokens, so English steers reliably. The languages article covers the clone's English-only stance in full.",
      },
      {
        q: "Does the prompt have a length limit?",
        a: "The request schema caps the prompt at 2000 characters — a real, stated bound rather than an invisible truncation.",
      },
      {
        q: "How do I get a specific style?",
        a: "Style words steer: low poly, voxel, flat-color and their kin work as levers, and the /styles tree documents per-style which levers are real and which are texture-dependent finishes that belong to your DCC.",
      },
    ],
    related: [
      { label: "Image to 3D", href: "/help/articles/create-3d-models-from-images-with-rodin" },
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Text to 3D feature page", href: "/features/text-to-3d" },
      { label: "Style pages", href: "/styles" },
    ],
    updated: "2026-10-30",
  },
  {
    slug: "create-editable-scenes-with-hyper3d-worldgen",
    title: "Creating editable scenes with WorldGen (not in this clone)",
    category: "features",
    description:
      "WorldGen is listed in the mode picker but marked 'not implemented here yet' — this clone generates single assets, not editable scenes.",
    status: "not-in-clone",
    answer:
      "WorldGen is not implemented in this clone. The mode appears in the picker for structural parity, but the interface itself marks it 'not implemented here yet' — this workspace generates single assets from text or one image, not multi-object editable scenes.",
    sections: [
      {
        heading: "What the picker shows vs what runs",
        paragraphs: [
          "The generation modes are Text to 3D (live), Image to 3D (live), 3D Editing and WorldGen (both honestly disabled). Keeping the full reference-shaped picker visible is deliberate: it shows the surface structure being cloned, and the disabled labels show where this codebase stops. No scene route, no scene serializer and no editable-scene format exist behind that entry.",
        ],
      },
      {
        heading: "The honest alternative",
        paragraphs: [
          "Compose instead of generating a scene: produce the individual assets (each with its own free preview and 1-credit confirm), export them, and assemble the scene in Blender, Unity or Unreal — where editing is real. The use-case pages for game development and VR/AR describe exactly this asset-by-asset workflow and its limits, so the expectation is set before you spend a credit.",
        ],
        note: "WorldGen: listed, disabled, labeled. Single assets are real; scenes are your DCC's job — and the picker says so.",
      },
      {
        heading: "Upload a readable scene image",
        paragraphs: [
          "Here is exactly what happens if you try: Image to 3D accepts the image and produces one asset from it. A busy scene photo yields one merged mesh of whatever the caption could resolve — not a scene graph, not separate movable objects, not an editable reconstruction. The reference's WorldGen reads a scene image and builds an editable multi-object package; that pipeline is not in this codebase, and no upload here will behave as though it were.",
        ],
      },
      {
        heading: "Validate the downstream package",
        paragraphs: [
          "The reference's validation step — checking the package's objects, materials and export readiness — has its honest analog in what this clone does ship: the free preview (orbit, wireframe, normal modes), the six-format export from the stored model, and the DCC round-trip where real scene assembly happens. Validation for a scene happens in the tool that can actually hold a scene.",
        ],
      },
      {
        heading: "Choose the creation mode",
        paragraphs: [
          "The reference's WorldGen offers creation modes (image-to-scene, text-to-scene and the like); this clone's mode picker carries the WorldGen entry in a permanently honest state — listed, disabled, labeled not implemented — so there is no mode to choose and no ambiguity about it. The choices that do exist for building a world here are the two live generation modes, used asset by asset, and the composition your DCC or engine provides for assembling them.",
        ],
      },
    ],
    faq: [
      {
        q: "What does the disabled WorldGen entry actually say?",
        a: "That it is not implemented here — the mode picker labels its non-running entries honestly instead of rendering a dead button. The label is the clone's first line of honesty about the boundary.",
      },
      {
        q: "Can I still get multiple objects in one generation?",
        a: "Yes — via Text to 3D, whose spec carries 2 to 12 objects with their own transforms. What you cannot get is the editable scene graph: objects in one mesh-level composition, not independently editable scene nodes.",
      },
      {
        q: "Can I at least generate a background environment for a scene?",
        a: "Yes — the OmniCraft HDRI tool generates environment skies locally and free (2K or 4K PNG), which covers the backdrop and lighting half of scene-building while your DCC holds the geometry half.",
      },
      {
        q: "Will WorldGen be added?",
        a: "Nothing in this codebase says so, and this article will not speculate. The picker's label is the current truth, and it is labeled not implemented.",
      },
      {
        q: "What is the nearest real path for scene work?",
        a: "Generate the individual assets (each its own task, free previews until you confirm the good ones), export them, and assemble the scene in Blender or Unity — where scene semantics actually exist.",
      },
    ],
    related: [
      { label: "Choosing settings", href: "/help/articles/choose-rodin-model-and-generation-settings" },
      { label: "Game development use case", href: "/use-cases/game-development" },
      { label: "Text to 3D", href: "/help/articles/create-3d-models-from-text-with-rodin" },
    ],
    updated: "2026-10-30",
  },
];
