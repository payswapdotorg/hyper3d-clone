#!/usr/bin/env python3
"""t81: probe the reference's pages for all 55 slugs this clone actually
wrote — the body link-structure anatomy per article:

  - inline prose links (hrefs inside <p> after the H1, TOC anchors excluded)
  - the share panel: which networks, the exact URL formulas, Copy link
  - the related section: card hrefs / titles / descriptions (raw <p> text,
    for deriving the truncation rule) / image srcs + alt + width/height
  - the TOC: entry count, the Overview → #article-top first entry
  - where id="article-top" sits
  - presence of the vote card (useful-card) and the side CTA (side-cta)

Output: /home/z/my-project/hyper3d-clone/recon/t81/article-probe.json
"""
import re
import html as htmlmod
import json
import urllib.request
import urllib.error
import concurrent.futures as cf

REF = "https://hyper3d.ai"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130"}

slugs = json.load(open("/tmp/written-slugs.json"))
print(f"written slugs: {len(slugs)}")


def probe(slug):
    path = f"/blog/{slug}"
    url = REF + path
    req = urllib.request.Request(url, headers=UA)
    out = {"slug": slug, "status": None}
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            body = r.read().decode("utf-8", "replace")
            out["status"] = r.status
    except urllib.error.HTTPError as e:
        out["status"] = e.code
        out["error"] = "http"
        return out
    except Exception as e:
        out["error"] = repr(e)
        return out

    # article region: <main> → after H1 → </main>
    m = re.search(r"<main[^>]*>", body)
    main = body[m.start():] if m else body
    h1 = re.search(r"<h1[^>]*>", main)
    art = main[h1.start():] if h1 else main
    e = re.search(r"</main>", art)
    art = art[: e.start()] if e else art

    # 1. inline prose links — <a> with non-# href inside <p>
    prose_links = []
    for p in re.findall(r"<p\b[^>]*>.*?</p>", art, re.S):
        for lm in re.finditer(r'<a\s+([^>]*?)>(.*?)</a>', p, re.S):
            tag, inner = lm.group(1), lm.group(2)
            hm = re.search(r'href="([^"]*)"', tag)
            if not hm:
                continue
            href = htmlmod.unescape(hm.group(1))
            if href.startswith("#"):
                continue
            text = re.sub(r"<[^>]+>", "", inner)
            prose_links.append({"href": href, "text": text.strip()[:90]})
    out["prose_links"] = prose_links

    # 2. share panel — capture the section and its links
    i = body.find('<section class="share-panel"')
    out["has_share_panel"] = i >= 0
    if i >= 0:
        j = body.find("</section>", i)
        panel = body[i : j + 10]
        share = []
        for lm in re.finditer(r'<a\s+([^>]*?)>(.*?)</a>', panel, re.S):
            tag = lm.group(1)
            hm = re.search(r'href="([^"]*)"', tag)
            am = re.search(r'aria-label="([^"]*)"', tag)
            if hm:
                share.append(
                    {
                        "href": htmlmod.unescape(hm.group(1)),
                        "aria_label": am.group(1) if am else None,
                    }
                )
        out["share_links"] = share
        out["has_copy_link"] = "Copy link" in panel

    # 3. related section — cards
    i = body.find('<section class="related-section"')
    out["has_related_section"] = i >= 0
    cards = []
    if i >= 0:
        j = body.find("</section>", i)
        rel = body[i : j + 10]
        for cm in re.finditer(r'<a class="related-card" href="([^"]*)"[^>]*>(.*?)</a>', rel, re.S):
            href, inner = cm.group(1), cm.group(2)
            im = re.search(r'<img\s+([^>]*?)/?>', inner)
            img = {}
            if im:
                for am in re.finditer(r'([\w:-]+)="([^"]*)"', im.group(1)):
                    img[am.group(1)] = htmlmod.unescape(am.group(2))
            tm = re.search(r"<h3[^>]*>(.*?)</h3>", inner, re.S)
            dm = re.search(r"<p[^>]*>(.*?)</p>", inner, re.S)
            cards.append(
                {
                    "href": href,
                    "img": img,
                    "title": re.sub(r"<[^>]+>", "", tm.group(1)).strip() if tm else None,
                    "desc": re.sub(r"<[^>]+>", "", dm.group(1)).strip() if dm else None,
                    "desc_len": len(dm.group(1)) if dm else None,
                }
            )
        hm = re.search(r"<h2[^>]*>(.*?)</h2>", rel, re.S)
        out["related_heading"] = re.sub(r"<[^>]+>", "", hm.group(1)).strip() if hm else None
    out["related_cards"] = cards

    # 4. TOC — entries with their targets
    i = body.find('class="toc-list"')
    toc = []
    if i >= 0:
        j = body.find("</ul>", i)
        ul = body[i : j]
        for tm in re.finditer(r'<a class="toc-button" href="([^"]*)"[^>]*>(.*?)</a>', ul, re.S):
            toc.append(
                {
                    "href": tm.group(1),
                    "text": re.sub(r"<[^>]+>", "", tm.group(2)).strip()[:80],
                }
            )
    out["toc_entries"] = toc

    # 5. article-top anchor — the element carrying the id
    am = re.search(r'<(\w+)[^>]*id="article-top"', body)
    out["article_top_tag"] = am.group(1) if am else None
    if am:
        out["article_top_context"] = re.sub(
            r"\s+", " ", body[am.start() : am.start() + 220]
        )

    # 6. vote card / side CTA presence
    out["has_vote_card"] = 'class="useful-card"' in body
    out["has_side_cta"] = 'class="side-cta"' in body
    if out["has_vote_card"]:
        vm = re.search(r'data-vote-key="([^"]*)"', body)
        out["vote_key"] = vm.group(1) if vm else None

    # h2/h3 heading ids (the heading-N scheme)
    out["heading_ids"] = re.findall(r'<h[23][^>]*id="heading-(\d+)"', body)
    return out


results = []
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for r in ex.map(probe, slugs):
        results.append(r)
        print(f"  {r['slug']}: {r['status']}, prose={len(r.get('prose_links', []))}")

json.dump(
    results,
    open("/home/z/my-project/hyper3d-clone/recon/t81/article-probe.json", "w"),
    indent=1,
    ensure_ascii=False,
)
ok = sum(1 for r in results if r["status"] == 200)
print(f"probed: {ok}/{len(slugs)} ok")
