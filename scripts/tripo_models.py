"""Turn the six approved pictures into models, through Tripo image_to_model.

Upload each picture, start a task, wait, download the GLB. One call per prop,
the same settings for all six, because the set has to stay a set.

The user agent matters: Tripo's edge answers the default Python one with a 403
carrying error 1010, which looks like a rejected key and is not.
"""
import json
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

BASE = 'https://api.tripo3d.ai/v2/openapi'
ROOT = Path(__file__).resolve().parents[1]
GEN = ROOT / 'updates/category-props/gen'
OUT = ROOT / 'assets/props'
OUT.mkdir(parents=True, exist_ok=True)
PROPS = ['work', 'education', 'play', 'people', 'trophies', 'contact']
UA = 'curl/8.5.0'


def key():
    for line in open('/home/abhishek/Downloads/work/comfy/scripts/.env'):
        line = line.strip()
        if line.startswith('TRIPO_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit('no tripo key')


K = key()


def call(url, body=None, content_type=None):
    headers = {'Authorization': 'Bearer ' + K, 'User-Agent': UA}
    if content_type:
        headers['Content-Type'] = content_type
    req = urllib.request.Request(url, headers=headers, data=body,
                                 method='POST' if body else 'GET')
    try:
        return json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        raise SystemExit(f'{url}: HTTP {e.code} {e.read()[:200]}')


def upload(path):
    boundary = uuid.uuid4().hex
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
        f'Content-Type: image/{path.suffix[1:]}\r\n\r\n'
    ).encode() + path.read_bytes() + f'\r\n--{boundary}--\r\n'.encode()
    r = call(f'{BASE}/upload', body, f'multipart/form-data; boundary={boundary}')
    return r['data']['image_token']


started = {}
for name in PROPS:
    img = GEN / f'{name}.webp'
    if not img.exists():
        print(f'  {name}: no picture')
        continue
    token = upload(img)
    body = json.dumps({
        'type': 'image_to_model',
        'file': {'type': img.suffix[1:], 'file_token': token},
        # v3.0 is the version that actually honours face_limit. The default
        # v2.5 accepts the number, echoes it back, and returns 101,000
        # triangles anyway, which then has to be cut down here instead.
        'model_version': 'v3.0-20250812',
        # Low poly on purpose: this sits in a 60 pixel icon and has to look
        # like a PlayStation 2 asset, not a scan.
        'face_limit': 4000,
        'texture': True,
        'pbr': False,
    }).encode()
    r = call(f'{BASE}/task', body, 'application/json')
    started[name] = r['data']['task_id']
    print(f'  {name}: task {started[name]}')

print('waiting...')
done = {}
deadline = time.time() + 900
while started and time.time() < deadline:
    for name, task in list(started.items()):
        r = call(f'{BASE}/task/{task}')['data']
        status = r.get('status')
        if status == 'success':
            url = (r.get('output') or {}).get('pbr_model') or (r.get('output') or {}).get('model')
            if not url:
                print(f'  {name}: success but no model url: {list((r.get("output") or {}))}')
                started.pop(name)
                continue
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            data = urllib.request.urlopen(req, timeout=300).read()
            (OUT / f'{name}.glb').write_bytes(data)
            print(f'  {name}: {len(data) // 1024} KB')
            done[name] = True
            started.pop(name)
        elif status in ('failed', 'banned', 'cancelled', 'unknown'):
            print(f'  {name}: {status}')
            started.pop(name)
    if started:
        time.sleep(10)

print('models:', sorted(done))
