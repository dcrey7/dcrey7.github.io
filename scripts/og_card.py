"""Draw the 1200 x 630 share card: assets/og-card.png.

Search results and link previews show this card. It uses the site's own
parts: the dark royal blue field, the afaicon, and the Anton and Archivo
type. Fonts come from Google Fonts; pass the folder that holds them.

    uv run --no-project --with pillow python scripts/og_card.py <font dir>
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path(sys.argv[1])
W, H = 1200, 630

# The field: the dark royal blue of the default theme, lit from top left.
card = Image.new("RGB", (W, H), (4, 11, 32))
glow = Image.new("RGB", (W, H), (4, 11, 32))
g = ImageDraw.Draw(glow)
g.ellipse((-300, -380, 900, 520), fill=(21, 51, 122))
g.ellipse((600, 260, 1500, 1000), fill=(12, 33, 97))
card = Image.blend(card, glow.filter(ImageFilter.GaussianBlur(160)), 0.9)

# The mascot, left.
face = Image.open(ROOT / "assets/afaicon.png").convert("RGBA")
face.thumbnail((300, 300), Image.LANCZOS)
card.paste(face, (90, (H - face.height) // 2), face)

# The words, right.
d = ImageDraw.Draw(card)
anton = ImageFont.truetype(str(FONTS / "Anton.ttf"), 104)
archivo = ImageFont.truetype(str(FONTS / "Archivo.ttf"), 34)
archivo.set_variation_by_axes([100, 500])
small = ImageFont.truetype(str(FONTS / "Archivo.ttf"), 28)
small.set_variation_by_axes([100, 600])
x = 450
d.text((x, 150), "ABHISHEK", font=anton, fill=(244, 246, 252))
d.text((x, 262), "THOMAS", font=anton, fill=(255, 200, 0))
d.text((x, 404), "AI ENGINEER  ·  PARIS", font=archivo, fill=(200, 210, 236))
d.text((x, 460), "LLM evals  ·  RAG  ·  agents", font=archivo, fill=(160, 174, 214))
d.text((x, 540), "hiabhi.com", font=small, fill=(255, 200, 0))

out = ROOT / "assets/og-card.png"
card.save(out, optimize=True)
print("wrote", out.name, card.size, out.stat().st_size // 1024, "KB")
