#!/usr/bin/env python3
"""t66 generator: fetch the reference's 11 non-EN locale sitemaps and emit
src/lib/i18n-locale-data.ts — the localized route sets, exactly as the
reference ships them.

GENERATED FILE — regenerate with `python3 scripts/gen-locale-routes.py`,
never hand-edit.

Reference facts this pins (recon 2026-10-30, landing-sitemap-index.xml):
  * locales: zh de ja ko ru pt fr es ar tr it (EN is unprefixed)
  * features / tools / use-cases / styles / legal use the EN slugs verbatim
    in every locale (validated per locale at generation time)
  * static per locale = the EN set minus /event/chroma-awards (EN-only),
    with the reference's own translation-file oddball: the help article
    use-bang-and-partial-edit becomes use-bang-and-partial-edit-{loc} in
    zh/de/ja/ko/ru/fr/es (pt/ar/tr/it keep the plain slug)
  * sub-categories exists only for ja(1) ko(2) pt(1) es(2) tr(1) — subsets
    of the EN three
  * blog per locale = index + 234-235 articles, every slug suffixed
    "-{loc}", base slugs all present in the EN blog catalog
  * per-locale route totals: 542-545 (see LOCALE_ROUTE_COUNTS)
"""

import re
import sys
import urllib.request
from datetime import date

BASE = "https://hyper3d.ai"
LOCALES = ["zh", "de", "ja", "ko", "ru", "pt", "fr", "es", "ar", "tr", "it"]
SHARED_FAMILIES = ["features", "tools", "use-cases", "styles", "legal"]
OUT = "src/lib/i18n-locale-data.ts"

FAMILY_PREFIX = {
    "features": "/features",
    "tools": "/tools",
    "use-cases": "/use-cases",
    "styles": "/styles",
    "legal": "/legal",
    "sub-categories": "/sub-categories",
    "blog": "/blog",
}


def fetch_locs(family: str, locale: str) -> list[str]:
    url = f"{BASE}/landing-sitemap-{family}-{locale}.xml"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        if err.code == 404 and family == "sub-categories":
            return []  # the reference ships sub-categories for 6 locales only
        raise
    return re.findall(r"<loc>([^<]+)</loc>", body)


def strip_family(url: str, family: str, locale: str = "en") -> str:
    path = url[len(BASE) :]
    if locale != "en":
        assert path == f"/{locale}" or path.startswith(f"/{locale}/"), url
        if path == f"/{locale}":
            return ""
        path = path[len(locale) + 1 :]
    prefix = FAMILY_PREFIX[family]
    if path == prefix:
        return ""  # the family index route
    assert path.startswith(prefix + "/"), (family, path)
    return path[len(prefix) + 1 :]


def main() -> int:
    en_raw = {f: fetch_locs(f, "en") for f in FAMILY_PREFIX}
    en_static_raw = fetch_locs("static", "en")

    problems: list[str] = []
    locale_only_subcats: list[str] = []
    blog_oddballs: list[str] = []

    # --- shared families: identical slugs in every locale ----------------
    shared: dict[str, list[str]] = {}
    for family in SHARED_FAMILIES:
        slugs = [strip_family(p, family) for p in en_raw[family]]
        shared[family] = slugs

    # --- per-locale data --------------------------------------------------
    static_routes: dict[str, list[str]] = {}
    subcat_slugs: dict[str, list[str]] = {}
    blog_slugs: dict[str, list[str]] = {}
    counts: dict[str, int] = {}

    for loc in LOCALES:
        # static — normalize 'https://hyper3d.ai/zh' -> '', '/zh/x' -> 'x'
        norm: list[str] = []
        for url in fetch_locs("static", loc):
            path = url[len(BASE) :]
            assert path == f"/{loc}" or path.startswith(f"/{loc}/"), url
            norm.append(path[len(loc) + 1 :].lstrip("/"))
        # validate against EN
        en_norm = [p[len(BASE) :].lstrip("/") for p in en_static_raw]
        allowed = set(en_norm) - {"event/chroma-awards"}
        oddball = f"help/articles/use-bang-and-partial-edit-{loc}"
        for p in norm:
            if p in allowed or p == oddball:
                continue
            problems.append(f"{loc}/static unexpected route: {p}")
        plain = "help/articles/use-bang-and-partial-edit"
        if oddball in norm and plain in norm:
            problems.append(f"{loc}/static has both use-bang variants")
        static_routes[loc] = norm

        # sub-categories — the EN three are standard; the reference also
        # ships locale-only slugs here (ko: insects-bugs, es: firearms,
        # tr: rocks-minerals) that have no EN route at all — recorded, not
        # rejected, because sitemap parity means carrying them verbatim.
        sub = [strip_family(p, "sub-categories", loc) for p in fetch_locs("sub-categories", loc)]
        en_sub = set(strip_family(p, "sub-categories") for p in en_raw["sub-categories"])
        for s in sub:
            if s not in en_sub:
                locale_only_subcats.append(f"{loc}/{s}")
        subcat_slugs[loc] = sub

        # blog
        blog = [strip_family(p, "blog", loc) for p in fetch_locs("blog", loc)]
        assert blog[0] == "", f"{loc}/blog sitemap must start with the index"
        arts = blog[1:]
        en_blog = set(strip_family(p, "blog") for p in en_raw["blog"]) - {""}
        for s in arts:
            if not s.endswith(f"-{loc}"):
                problems.append(f"{loc}/blog slug not -{loc} suffixed: {s}")
                continue
            base = s[: -len(loc) - 1]
            if base not in en_blog:
                # the reference's double-suffixed oddballs: ar ships
                # ai-game-character-creator-zh-ar, tr what-is-ply-file-zh-tr
                # (a -zh tail under a different locale — content-farm
                # sitemap sloppiness, mirrored verbatim for parity)
                if base.endswith("-zh") and base[:-3] in en_blog:
                    blog_oddballs.append(f"{loc}/{s}")
                else:
                    problems.append(f"{loc}/blog base not in EN catalog: {s}")
        blog_slugs[loc] = arts

        # shared families validated per locale
        for family in SHARED_FAMILIES:
            loc_slugs = sorted(strip_family(p, family, loc) for p in fetch_locs(family, loc))
            if loc_slugs != sorted(shared[family]):
                problems.append(f"{loc}/{family} slug set differs from EN")

        counts[loc] = (
            len(norm) + len(shared["features"]) + len(shared["tools"])
            + len(shared["use-cases"]) + len(shared["styles"]) + len(shared["legal"])
            + len(sub) + len(arts) + 1  # +1 = the locale blog index route
        )

    if problems:
        print("PROBLEMS — file NOT written:")
        for p in problems:
            print(" -", p)
        return 1

    # --- emit --------------------------------------------------------------
    def arr(items: list[str], indent: str = "  ") -> str:
        if not items:
            return "[],"
        inner = "\n".join(f'{indent}  "{i}",' for i in items)
        return "[\n" + inner + f"\n{indent}]"

    def record(data: dict[str, list[str]], key: str) -> str:
        parts = []
        for loc in LOCALES:
            body = arr(data[loc], "  ")
            parts.append(f"  {loc}: {body}" if body.endswith(",") else f"  {loc}: {body},")
        joined = "\n".join(parts)
        return f"export const {key}: Record<LocaleCode, readonly string[]> = {{\n{joined}\n}};\n"

    today = date.today().isoformat()
    lines = []
    lines.append("/**")
    lines.append(" * GENERATED by scripts/gen-locale-routes.py from the reference's")
    lines.append(f" * landing sitemaps ({today} fetch). Regenerate, never hand-edit.")
    lines.append(" *")
    lines.append(" * Validated at generation time:")
    lines.append(" *  - features / tools / use-cases / styles / legal carry the EN slugs")
    lines.append(" *    verbatim in all 11 locales (asserted per locale)")
    lines.append(" *  - static = EN set minus /event (EN-only) plus the reference's own")
    lines.append(" *    use-bang-and-partial-edit-{loc} oddball where it ships one")
    lines.append(" *  - sub-categories ships for ja/ko/pt/es/tr only; besides the EN")
    lines.append(" *    three, the reference also ships locale-only slugs with no EN")
    lines.append(" *    route (see LOCALE_ONLY_SUBCATEGORIES)")
    lines.append(" *  - every locale blog slug is suffixed -{loc} and its base exists in")
    lines.append(" *    the EN blog catalog — except the reference's own double-suffixed")
    lines.append(" *    oddballs (see LOCALE_BLOG_ODDBALLS)")
    lines.append(" *")
    lines.append(" * Per-locale route totals (routes, including each family index):")
    for loc in LOCALES:
        lines.append(f" *   {loc}: {counts[loc]}")
    lines.append(" */")
    lines.append("")
    lines.append('import type { LocaleCode } from "./i18n";')
    lines.append("")
    lines.append("export const LOCALE_FAMILY_SLUGS = {")
    for family in SHARED_FAMILIES:
        lines.append(f"  {json_key(family)}: {arr(shared[family])},")
    lines.append("} as const;")
    lines.append("")
    lines.append(record(static_routes, "LOCALE_STATIC_ROUTES"))
    lines.append(record(subcat_slugs, "LOCALE_SUBCATEGORY_SLUGS"))
    lines.append(record(blog_slugs, "LOCALE_BLOG_SLUGS"))
    oddball_block = (
        "/** Reference quirks carried verbatim for parity — never invented "
        "here. */\n"
        "export const LOCALE_ONLY_SUBCATEGORIES: readonly string[] = "
        + arr(locale_only_subcats)
        + "\n\n"
        "export const LOCALE_BLOG_ODDBALLS: readonly string[] = "
        + arr(blog_oddballs)
        + "\n"
    )
    lines.append(oddball_block)
    lines.append("export const LOCALE_ROUTE_COUNTS: Record<LocaleCode, number> = {")
    lines.append(",\n".join(f"  {loc}: {counts[loc]}" for loc in LOCALES))
    lines.append("};")
    lines.append("")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    total = sum(counts.values())
    print(f"wrote {OUT}")
    print(f"locales: {len(LOCALES)}, total localized routes: {total}")
    for loc in LOCALES:
        print(
            f"  {loc}: {counts[loc]} "
            f"(static {len(static_routes[loc])}, subcat {len(subcat_slugs[loc])}, "
            f"blog {len(blog_slugs[loc])})"
        )
    print(f"locale-only sub-category slugs: {locale_only_subcats}")
    print(f"double-suffixed blog oddballs: {blog_oddballs}")
    return 0


def json_key(family: str) -> str:
    """tools-index style keys: camelCase the family name."""
    parts = family.split("-")
    return parts[0] + "".join(p.title() for p in parts[1:])


if __name__ == "__main__":
    sys.exit(main())
