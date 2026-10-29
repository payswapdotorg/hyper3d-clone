"use client";

/**
 * Help Center search — the reference's search affordance (hyper3d.ai/help,
 * recon 2026-10-30: a search box above the article list with a "No matching
 * articles" empty state), implemented here as a REAL client-side filter
 * over the article registry. Matching is plain substring over title +
 * description + category name, case-insensitive; results link to the
 * article routes. No server round-trip, no fake suggestions — if nothing
 * matches, it says exactly that, same words as the reference's empty state.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface HelpSearchItem {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  status: "live" | "partial" | "not-in-clone";
}

const STATUS_DOT: Record<HelpSearchItem["status"], string> = {
  live: "bg-emerald-400/80",
  partial: "bg-amber-400/80",
  "not-in-clone": "bg-white/40",
};

export function HelpSearch({ items }: { items: HelpSearchItem[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.title} ${item.description} ${item.categoryName}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div>
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35"
          aria-hidden="true"
        />
        <span className="sr-only">Search the help center</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the help center — credits, exports, avatars…"
          className="min-h-12 w-full rounded-2xl border border-white/12 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-violet-400/50 focus:outline-none"
        />
      </label>

      {query.trim() ? (
        results.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/35">
              {results.length} matching {results.length === 1 ? "article" : "articles"}
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {results.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/help/articles/${item.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-violet-400/40 hover:bg-violet-400/[0.04]"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[item.status])}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold text-white/85 group-hover:text-violet-100">
                        {item.title}
                      </span>
                    </span>
                    <span className="mt-1.5 text-xs leading-relaxed text-white/50">
                      {item.description}
                    </span>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
                      {item.categoryName}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-white/45">
            No matching articles. Try a shorter word — &ldquo;credits&rdquo;, &ldquo;export&rdquo;,
            &ldquo;avatar&rdquo;.
          </p>
        )
      ) : null}
    </div>
  );
}
