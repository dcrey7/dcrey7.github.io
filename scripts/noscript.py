"""Copy llms.txt into index.html as a <noscript> block.

The site is drawn by JavaScript. Google runs the scripts, but Bing and most
AI crawlers do not, and without them the page says 27 words of menu chrome.
A <noscript> block holds the same profile as llms.txt, as plain HTML.

A browser with scripts on never draws a <noscript> block, so visitors see
the site exactly as before. llms.txt stays the one source: edit it, then run

    python3 scripts/noscript.py

The block sits between two marker comments; the script replaces what is
between them and nothing else.
"""

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- noscript:start -->"
END = "<!-- noscript:end -->"
LINK = re.compile(r"\[([^\]]+)\]\((https://[^)]+)\)")
BARE = re.compile(r"(?<![\"=>])(https://[^\s<]+)")


def inline(text):
    """Escape a line, then turn [label](url) and bare urls into links."""
    text = html.escape(text, quote=False)
    text = LINK.sub(r'<a href="\2">\1</a>', text)
    return BARE.sub(r'<a href="\1">\1</a>', text)


def to_html(markdown):
    out, in_list = [], False
    for line in markdown.splitlines():
        if line.startswith("- "):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(line[2:])}</li>")
            continue
        if in_list:
            out.append("</ul>")
            in_list = False
        if line.startswith("# "):
            out.append(f"<h1>{inline(line[2:])}</h1>")
        elif line.startswith("## "):
            out.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.startswith("> "):
            out.append(f"<p>{inline(line[2:])}</p>")
        elif line.strip():
            out.append(f"<p>{inline(line)}</p>")
    if in_list:
        out.append("</ul>")
    return "\n".join(out)


def block():
    body = to_html((ROOT / "llms.txt").read_text())
    return f'{START}\n<noscript>\n<article class="nojs">\n{body}\n</article>\n</noscript>\n{END}'


def main():
    page = ROOT / "index.html"
    source = page.read_text()
    if START in source:
        a = source.index(START)
        b = source.index(END) + len(END)
        source = source[:a] + block() + source[b:]
    else:
        tag = '<body class="booting">'
        source = source.replace(tag, tag + "\n\n" + block(), 1)
    page.write_text(source)
    print("noscript block written")


if __name__ == "__main__":
    main()
