# dcrey7.github.io — portfolio v4

A PlayStation 5 home screen. One tile rail, one hero, one shelf of cards, and
a background that becomes whatever you highlight. Live: https://dcrey7.github.io/

## Architecture

Zero build step, zero dependencies — native ES modules on a static host.

```
index.html        shell: meta/OG, fonts, the four bands, the boot gate
css/main.css      all styles. --key drives every colour on screen
js/
  main.js         boot order: home → boot gate → sound → clock
  config.js       reduced-motion flag, breakpoint helper, event bus
  data.js         ALL content (about, jobs, projects, people, trophies)
  tiles.js        turns data.js into the rail model
  home.js         the rail engine: tabs, focus, hero, shelf, keys, swipe
  boot.js         load bar and PRESS START
  sound.js        opt-in synth blips (WebAudio, no assets)
assets/afaicon.png
tests/interaction.html
DESIGN.md         locked design decisions + wireframes
updates/          dated build logs + verification screenshots
```

Every entry in `data.js` carries a `key` colour and a 1–3 character `mark`.
The background field, the glow, the tile face and the giant ghosted key art
are all derived from those two values — there are no image assets for content.
`--key` is registered with `@property`, which is what lets the background
crossfade when focus moves.

`prefers-reduced-motion` disables animation but keeps the colour change.
Sound is opt-in.

## Develop

```bash
python -m http.server 8000   # ES modules need http://
```

Deep links are handy while working:

```
http://localhost:8000/?skip              # straight past the boot gate
http://localhost:8000/?skip&tab=play&i=1 # open the rail on a given tile
```

## Test

`tests/interaction.html` loads the real page in an iframe and drives it with
keyboard and click events, then prints the results.

```bash
# open http://localhost:8000/tests/interaction.html — or headless:
google-chrome --headless=new --disable-gpu --virtual-time-budget=15000 \
  --dump-dom http://localhost:8000/tests/interaction.html | grep -A40 '<pre'
```

18 assertions cover focus movement, tab switching, per-tab focus memory,
clamping at both ends, colour propagation, card counts and action links.

## Deploy

Push to `main` → GitHub Pages serves the repo root (`.nojekyll`, no build).

## Content edits

Everything textual lives in `js/data.js`. Adding a job or a project is one
object with a `key` and a `mark`. Design rules in `DESIGN.md`.
