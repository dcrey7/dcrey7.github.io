# dcrey7.github.io — portfolio v4

A Cross Media Bar wearing the PlayStation 5's skin. Categories run across,
the items inside one run down, and the whole screen takes the colour of
whatever is selected. Live: https://dcrey7.github.io/

## Architecture

Zero build step, zero dependencies — native ES modules on a static host.

```
index.html        shell: meta/OG, fonts, the cross, the boot gate
css/main.css      all styles. --key drives every colour on screen
js/
  main.js         boot order: xmb → boot gate → sound → clock
  config.js       reduced-motion flag, breakpoint helper, event bus
  data.js         ALL content (about, jobs, projects, people, trophies)
  menu.js         turns data.js into categories × items
  xmb.js          the cross: both axes, detail, keys, wheel, swipe
  boot.js         load bar and PRESS START
  sound.js        opt-in synth blips (WebAudio, no assets)
assets/afaicon.png
assets/logos/     optional company logos — see below
tests/interaction.html
DESIGN.md         locked design decisions + wireframes
updates/          dated build logs + verification screenshots
```

**The cross.** `←→` moves between categories, `↑↓` moves between the items
inside one. Each category remembers its own item. Both axes are tracks that
**translate** — never scroll, because a row whose content already fits has no
overflow and would not move at all.

**Colour.** Every entry carries a `key` colour and a 1–3 character `mark`. The
background field, the glow, the icons and the giant ghosted key art all derive
from those. `--key` is registered with `@property`, which is what lets the
background crossfade rather than snap.

**Logos (optional).** Drop a file in `assets/logos/` named after the entry and
it replaces the typographic mark automatically:

```
vistiq-ai.svg   axa-france.svg   exl-services.svg   mathco.svg   amazon.svg
```

`.png` works too. A missing file falls back to the mark, so nothing breaks if
you add none, and no code changes when you add some.

`prefers-reduced-motion` disables animation but keeps the colour change.
Sound is opt-in.

## Develop

```bash
python -m http.server 8000   # ES modules need http://
```

Deep links are handy while working:

```
http://localhost:8000/?skip               # straight past the boot gate
http://localhost:8000/?skip&cat=play&i=1  # open a category on a given item
```

`cat` is one of `about work play people trophies contact`.

## Test

`tests/interaction.html` loads the real page in an iframe and drives it with
keyboard and click events, then prints the results.

```bash
# open http://localhost:8000/tests/interaction.html — or headless:
google-chrome --headless=new --disable-gpu --virtual-time-budget=15000 \
  --dump-dom http://localhost:8000/tests/interaction.html | grep -A40 '<pre'
```

32 assertions cover both axes, per-category item memory, clamping, category
wrap-around, colour propagation, item counts, action links, clicking, and that
a missing logo falls back to exactly one mark with no stray images.

## Deploy

Push to `main` → GitHub Pages serves the repo root (`.nojekyll`, no build).

## Content edits

Everything textual lives in `js/data.js`. Adding a job or a project is one
object with a `key` and a `mark`. Design rules in `DESIGN.md`.
