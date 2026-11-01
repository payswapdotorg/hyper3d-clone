#!/usr/bin/env python3
"""t83 head-shape inspection helper (throwaway): print the served head
per route class so the verification pins can be written against real
bytes."""
import re
import subprocess


def fetch(path):
    out = subprocess.run(
        ["curl", "-s", "http://127.0.0.1:3111" + path],
        capture_output=True, text=True, timeout=30,
    )
    return out.stdout


for path in (
    "/blog",
    "/zh/blog/2d-image-to-3d-model",
    "/workspace/rodin",
    "/no-such-page",
    "/content-preview",
    "/zh",
):
    html = fetch(path)
    head = html.split("</head>")[0]
    print("=====", path, f"({len(html)} bytes)")
    print(" viewport:", re.findall(r'<meta name="viewport" content="[^"]*"', head))
    print(" icons:", re.findall(r'<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>', head))
    print(" hints:", re.findall(r'<link rel="(?:preconnect|dns-prefetch)"[^>]*>', head))
    print(" fonts-in-head:", head.count("fonts.googleapis.com"))
    print(" og:", re.findall(r'<meta property="og:[^"]*" content="[^"]*"', head))
    print(" twitter metas:", len(re.findall(r'<meta name="twitter:', head)))
    print(" hreflang count:", len(re.findall(r'<link rel="alternate" hreflang', head)))
    print(" canonical:", re.findall(r'<link rel="canonical"[^>]*>', head))
    print(" theme-color:", bool(re.search(r"theme-color", head)),
          "notranslate:", bool(re.search(r"notranslate", head)),
          "keywords:", bool(re.search(r'name="keywords"', head)))
    print(" title:", re.findall(r"<title[^>]*>([^<]*)</title>", head))
