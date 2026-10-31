#!/usr/bin/env python3
"""t77: rebuild the census URL list from the pinned title registry
(src/lib/reference-titles.ts keys) + the one 405 (/content-preview/render)
= the exact t76 probe set (7,079 URLs). Writes /tmp/t77-urls.json.
"""
import json
import re

src = open("src/lib/reference-titles.ts", encoding="utf-8").read()
# entries look like:  "/path": "title",
body = src[src.index("{") + 1 : src.rindex("}")]
paths = re.findall(r'^\s*"((?:[^"\\]|\\.)*)":', body, re.MULTILINE)
assert len(paths) == len(set(paths)), "duplicate paths"
urls = ["https://hyper3d.ai" + (p if p.startswith("/") else "/" + p) for p in paths]
urls.append("https://hyper3d.ai/content-preview/render")
json.dump(urls, open("/tmp/t77-urls.json", "w"))
print(f"{len(urls)} URLs (registry {len(paths)} + the 405)")
