"""Turn each bar icon into a PlayStation 2 style game asset, with gpt-image-2.

The icon goes in as the reference so the SHAPE is inherited rather than
invented. The reference is a neutral grey, so it says nothing about colour:
each object's real materials are named in its own line below. That is the fix
for the first run, where a black glyph came back as six black props.

One style sentence, one camera and one light for all six, because consistency
across the set matters more than any single picture.
"""
import base64
import io
from pathlib import Path

from PIL import Image

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
REFS = ROOT / 'updates/category-props/refs'
OUT = ROOT / 'updates/category-props/gen'
OUT.mkdir(parents=True, exist_ok=True)

# What each thing is, and what it is really made of. The materials are the
# ordinary ones: a briefcase is tan leather and brass, a trophy is gold on
# wood. Nothing here refers to the site's palette.
SUBJECT = {
    'work': 'a briefcase, in tan brown leather with brass clasps and a darker '
            'brown leather handle',
    'education': 'a graduation mortarboard cap, in black cloth with a gold '
                 'tassel and a gold button on top',
    'play': 'a video game controller, in light grey plastic with dark grey '
            'grips, a dark grey directional pad and coloured round buttons',
    'people': 'two people standing side by side, head and shoulders, with warm '
              'skin tones, dark hair, one in a blue shirt and one in a green '
              'shirt',
    'trophies': 'a trophy cup with two handles, in polished gold on a dark '
                'wooden base',
    'contact': 'a sealed paper envelope, in cream white paper with a soft grey '
               'fold line and a small red wax seal',
}

STYLE = (
    'Low poly PlayStation 2 era video game asset. Chunky simplified geometry '
    'with visibly flat faces and hard edges, a small hand painted texture with '
    'soft painted shading, no smooth subdivision, no realistic reflections. '
    'Three quarter view from slightly above, object centred and filling the '
    'frame, plain flat light grey background, soft even light from the upper '
    'left. No text, no logos, no ground shadow, no extra objects.'
)

env = {}
for line in open('/home/abhishek/Downloads/work/comfy/scripts/.env'):
    line = line.strip()
    if '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")

client = OpenAI(api_key=env['OPENAI_API_KEY'])

for name, subject in SUBJECT.items():
    ref = REFS / f'{name}.png'
    if not ref.exists():
        print(f'  {name}: no reference')
        continue
    prompt = (
        f'Make {subject}. Copy the exact silhouette and proportions of the grey '
        f'shape in the reference picture, but NOT its colour: the grey is only '
        f'there to show the shape. {STYLE}'
    )
    try:
        with open(ref, 'rb') as fh:
            r = client.images.edit(model='gpt-image-2', image=[fh],
                                   prompt=prompt, size='1024x1024')
        data = base64.b64decode(r.data[0].b64_json)
        # webp at quality 85, the size the repo keeps pictures at
        (OUT / f'{name}.png').write_bytes(data)
        Image.open(io.BytesIO(data)).save(OUT / f'{name}.webp', quality=85)
        (OUT / f'{name}.png').unlink()
        print(f'  {name}: {len(data) // 1024} KB')
    except Exception as e:
        print(f'  {name}: FAILED {type(e).__name__}: {str(e)[:200]}')

print('generated:', sorted(p.stem for p in OUT.glob('*.webp')))
