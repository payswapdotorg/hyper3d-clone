#!/usr/bin/env python3
"""t66 recon: fetch all 11 non-EN locale sitemaps from the reference site,
diff them against the EN tree, and validate the structure assumptions the
localized route module will be built on. Prints a report + writes the raw
route sets to /tmp for the generator (gen-locale-routes.py re-fetches on
its own; this script exists to eyeball the diff first).

Reference sitemap families (landing-sitemap-index.xml, 2026-10-30):
  static, features, tools, use-cases, styles, legal, sub-categories, blog
  × locales en, zh, de, ja, ko, ru, pt, fr, es, ar, tr, it
"""

import json
import re
import sys
import urllib.request

BASE = "https://hyper3d.ai"
FAMILIES = [
    "static",
    "features",
    "tools",
    "use-cases",
    "styles",
    "legal",
    "sub-categories",
    "blog",
]
LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]


def fetch_locs(family: str, locale: str) -> list[str]:
    url = f"{BASE}/landing-sitemap-{family}-{locale}.xml"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        # The reference ships sub-categories for exactly en, ja, ko, pt,
        # es, tr — a missing sitemap there means "no localized routes in
        # this family", which is the parity fact we want to capture.
        if err.code == 404 and family == "sub-categories":
            return []
        raise
    return re.findall(r"<loc>([^<]+)</loc>", body)


def strip_prefix(loc_url: str, locale: str) -> str:
    """https://hyper3d.ai/zh/help/articles/x -> help/articles/x
    https://hyper3d.ai/zh              -> ''  (the locale home)"""
    path = loc_url[len(BASE) :]
    assert path == f"/{locale}" or path.startswith(f"/{locale}/"), loc_url
    return path[len(locale) + 1 :]


def main() -> int:
    en = {}
    for family in FAMILIES:
        en[family] = [u[len(BASE) :] for u in fetch_locs(family, "en")]

    data = {}
    problems = []
    for loc in LOCALES:
        per_family = {}
        total = 0
        for family in FAMILIES:
            urls = fetch_locs(family, loc)
            paths = [strip_prefix(u, loc) for u in urls]
            per_family[family] = paths
            total += len(paths)
        data[loc] = per_family
        print(f"{loc}: total {total} | " +
              " ".join(f"{f}={len(per_family[f])}" for f in FAMILIES))

        # --- structural validations -------------------------------------
        # static: same slugs as EN except /event (EN-only) — modulo the
        # reference's own translation-file oddballs (e.g. use-bang-...-zh)
        en_static = set(en["static"])
        zh_static = set(per_family["static"])
        missing = en_static - zh_static - {"/event/chroma-awards"}
        extra = zh_static - en_static
        if missing:
            problems.append(f"{loc}/static missing EN routes: {sorted(missing)}")
        if extra:
            print(f"  {loc}/static oddballs vs EN: {sorted(extra)}")

        # blog: every article slug ends with the locale suffix; the set is
        # the EN catalog minus the game-filler bulk (reference-localized
        # subset); one index route at ''
        blog_paths = per_family["blog"]
        if blog_paths[0] != "":
            problems.append(f"{loc}/blog first loc is not the index: {blog_paths[0]}")
        articles = blog_paths[1:]
        bad = [s for s in articles if not s.endswith(f"-{loc}")]
        if bad:
            problems.append(f"{loc}/blog non-suffixed slugs: {bad[:5]}")
        stripped = {s[: -len(loc) - 1] for s in articles}
        en_blog = set(en["blog"]) - {""}
        unknown = stripped - en_blog
        if unknown:
            problems.append(f"{loc}/blog slugs not in EN catalog: {sorted(unknown)[:5]}")

        # features / tools / use-cases / styles / legal: identical slugs to EN
        for family in ["features", "tools", "use-cases", "styles", "legal"]:
            if set(per_family[family]) != set(en[family]):
                diff_a = sorted(set(per_family[family]) - set(en[family]))
                diff_b = sorted(set(en[family]) - set(per_family[family]))
                problems.append(
                    f"{loc}/{family} differs from EN: +{diff_a[:3]} -{diff_b[:3]}"
                )

    print()
    if problems:
        print("PROBLEMS:")
        for p in problems:
            print(" -", p)
    else:
        print("ALL STRUCTURAL CHECKS PASSED")

    json.dump(
        {"en": en, "locales": data},
        open("/tmp/locale-sitemap-raw.json", "w"),
        indent=1,
        sort_keys=True,
    )
    print("\nraw sets -> /tmp/locale-sitemap-raw.json")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
