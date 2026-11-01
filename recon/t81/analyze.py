#!/usr/bin/env python3
"""t81 analyze — cross-validate the reference's related cards against this
clone's t76 (descriptions) and t77 (og:image) registries, quantify the
truncation rule, and dump the link-structure class table for the notes.

Run with bun (needs the TS registries):
  bun run recon/t81/analyze.ts
"""
import json
import re

R = json.load(open("/home/z/my-project/hyper3d-clone/recon/t81/article-probe.json"))

# --- 1. the two classes -----------------------------------------------------
with_rel = [r for r in R if r.get("related_cards")]
without = [r for r in R if not r.get("related_cards")]
print(f"class A (related section, {len(with_rel)}): prose range "
      f"{min(len(r['prose_links']) for r in with_rel)}-"
      f"{max(len(r['prose_links']) for r in with_rel)}")
print(f"class B (no related section, {len(without)}): prose range "
      f"{min(len(r['prose_links']) for r in without)}-"
      f"{max(len(r['prose_links']) for r in without)}")

# --- 2. card hrefs: all internal blog articles? -----------------------------
all_cards = [(r["slug"], c) for r in with_rel for c in r["related_cards"]]
non_blog = [c for _, c in all_cards if not c["href"].startswith("/blog/")]
print(f"\ncards total: {len(all_cards)}, non-/blog/ hrefs: {len(non_blog)}")
for c in non_blog[:5]:
    print("  ODD:", c["href"])

# --- 3. prose-link href classes ----------------------------------------------
internal, external = [], []
for r in R:
    for l in r["prose_links"]:
        if l["href"].startswith("/") or "hyper3d.ai" in l["href"]:
            internal.append(l["href"])
        else:
            external.append(l["href"])
print(f"\nprose links: {len(internal)} internal, {len(external)} external")
print("external domains:")
for d in sorted({re.sub(r'^https?://([^/]+).*', r'\1', h) for h in external}):
    print("  ", d, sum(1 for h in external if d in h))
print("internal prefixes:")
for p in sorted({("/" + h.split("hyper3d.ai")[-1].lstrip("/")).split("?")[0].rsplit("/", 1)[0] if len(("/" + h.split("hyper3d.ai")[-1].lstrip("/")).split("/")) > 2 else "/" + h.split("hyper3d.ai")[-1].lstrip("/") for h in internal}):
    print("  ", p)

# --- 4. TOC: entries per article, first entry -------------------------------
print("\nTOC: first entry Overview→#article-top on all:",
      all(r["toc_entries"] and r["toc_entries"][0]["href"] == "#article-top"
          and r["toc_entries"][0]["text"].lower().startswith("overview") for r in R))
print("TOC entry counts:", sorted(len(r["toc_entries"]) for r in R))

# --- 5. the 24-slug set + JSON for the lib ----------------------------------
keep_reading = sorted(r["slug"] for r in with_rel)
json.dump(keep_reading, open("/tmp/keep-reading-slugs.json", "w"), indent=0)
print(f"\nkeep-reading slugs: {len(keep_reading)} (written to /tmp/keep-reading-slugs.json)")

# --- 6. card description raw lengths -----------------------------------------
lens = sorted(c["desc_len"] for _, c in all_cards)
print("card desc_len distribution:", lens[:6], "...", lens[-6:])

# --- 7. prose-link text samples for content authoring ------------------------
print("\nsample prose-link texts (for natural placements):")
seen = set()
for r in R[:55]:
    for l in r["prose_links"]:
        if l["href"].startswith("https://hyper3d.ai/workspace") and l["text"] and l["text"] not in seen:
            seen.add(l["text"])
            print(f"  {l['text'][:60]!r} -> {l['href']}")
        if len(seen) > 14:
            break
    if len(seen) > 14:
        break
