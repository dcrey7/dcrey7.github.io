# dcrey7.github.io — portfolio v4

Full-screen, no-scroll "story/reel" portfolio. Live: https://dcrey7.github.io/

## Architecture

Zero build step — native ES modules, deployable to any static host.

```
index.html        shell: meta/OG, fonts, static section skeletons
css/main.css      all styles (HUD, deck, rails, cards, boot, contact)
js/
  main.js         boot order: deck → boot gate → backdrop → sound → coin
  config.js       palettes, reduced-motion flag, event bus
  data.js         ALL content (jobs, projects, recommendations, trophies)
  deck.js         XMB engine: vertical sections × horizontal card rails
  fluid.js        interactive stable-fluids backdrop (WebGL2, float FBOs)
  clouds.js       fallback backdrop (WebGL1-compatible fbm clouds)
  coin.js         3D afaicon coin (three.js via importmap/unpkg)
  boot.js         loading bar, tips, PRESS START
  sound.js        opt-in synth blips (WebAudio, no assets)
assets/afaicon.png
DESIGN.md         locked design decisions + ASCII wireframes
updates/          dated build logs + verification screenshots
```

Graceful degradation: fluid (WebGL2+float) → clouds (any WebGL) → animated
CSS gradient. `prefers-reduced-motion` freezes the backdrop and disables
animations. Sound is opt-in.

## Develop

```bash
python -m http.server 8000   # ES modules + texture loading need http://
```

## Deploy

Push to `main` → GitHub Pages serves the repo root (`.nojekyll`, no build).

## Content edits

Everything textual lives in `js/data.js`. Design rules in `DESIGN.md`.
