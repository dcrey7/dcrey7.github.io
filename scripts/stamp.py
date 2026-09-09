"""Stamp every module import with one version, so a deploy is seen at once.

Cloudflare serves the scripts with a four hour cache. A module without a
version in its address can be four hours stale on a phone, and modules are
keyed by their full address, so the same file imported with two different
addresses becomes two copies (two event buses, two renderers). Every import
gets the same stamp, from one place. Run after any change under js/:

    python3 scripts/stamp.py 2026-09-09a
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
stamp = sys.argv[1]
spec = re.compile(r"(from\s+'\./(?!vendor/)[\w-]+\.js)(\?v=[^']*)?'")
touched = 0
for path in sorted((ROOT / 'js').glob('*.js')):
    text = path.read_text()
    new = spec.sub(lambda m: f"{m.group(1)}?v={stamp}'", text)
    if new != text:
        path.write_text(new)
        touched += 1
index = ROOT / 'index.html'
text = index.read_text()
new = re.sub(r'src="js/main\.js(\?v=[^"]*)?"', f'src="js/main.js?v={stamp}"', text)
new = re.sub(r'href="css/main\.css(\?v=[^"]*)?"', f'href="css/main.css?v={stamp}"', new)
if new != text:
    index.write_text(new)
    touched += 1
print(f'stamped {stamp} in {touched} files')
