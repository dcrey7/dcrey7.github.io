# Portfolio v4 — locked design decisions

Updated 2026-08-17. This is the build contract; `updates/` logs how each piece
lands. It replaces the reel/XMB contract of 2026-07-05, which was rejected for
being unreadable on a phone.

## The conceit — a PlayStation 5 home screen

The site is a console home screen painted in the afaicon palette. Not a Sony
clone, not the PS4 blue menu. Research: `../moodboards/playstation-home-ui/`.

There is **one screen**. Nothing navigates anywhere; moving focus along the
rail changes what the screen is.

```
┌──────────────────────────────────────────────────────────┐
│ ☻ DCREY7    WORK  PLAY                    ♪   11:27     │  topbar
│                                                          │
│  ┌──────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  ┊ (16)(★)(✉)     │  rail
│  │  V   │ │AXA │ │EXL │ │ MC │ │AMZ │  ┊  pinned         │
│  └──────┘ └────┘ └────┘ └────┘ └────┘                    │
│    VISTIQ.AI                                             │  label
│                                       ██                 │
│                                      ████  ← key art     │
│    AI ENGINEER                        ██                 │
│    VISTIQ.AI                                             │  hero
│    Paris · 2026 —                                        │
│    [ ▶ demo ]                                            │
│                                                          │
│  ┌────────────┐┌────────────┐┌────────────┐              │  shelf
│  │ LLM evals  ││ RAG −40%   ││ MCP agents │              │
│  └────────────┘└────────────┘└────────────┘              │
└──────────────────────────────────────────────────────────┘
```

Four bands: **topbar · rail · hero · shelf**. The same four at 390px, 768px
and 1440px. There is no second layout to maintain — that was the failure of
both portfolio-3 and the v4 reel prototype.

## Non-negotiables

1. **No separate detail page.** The shelf below the hero is the detail. A tile
   that has somewhere to go gets one button; everything else is cards.
2. **No image assets for content.** Every entry carries a `key` colour and a
   1–3 character `mark`. Background, glow and tile face derive from `key` with
   `color-mix()`; the mark, set in Anton, is the art — on the tile and blown
   up to 32vh behind the hero. Adding a project must never mean commissioning
   artwork.
3. **No third-party JavaScript.** No three.js, no GSAP, no shader libraries.
   Native ES modules, no build step.
4. **Yellow means focus, nothing else.** `#FFC800` is the focus ring, the card
   kicker and the active dot. It is never decoration.
5. **Every feature states its phone behaviour before it is built.**
6. Sound is opt-in. `prefers-reduced-motion` kills animation but keeps the
   colour change.

## Tokens

```
--void       #08090B   near-black base
--chrome     #EDEFF3   primary text
--chrome-dim #8A9099   secondary text
--yellow     #FFC800   focus only
--key        per entry, registered with @property so it crossfades
```

Type: **Anton** display (hero title, tile marks, key art) · **Archivo 300/500/600**
chrome (tabs, labels, buttons, card body) · **Space Mono** meta (dates, clock).
Three faces, three jobs. Yellowtail is gone.

Tile sizes: 92px desktop / 76px tablet / 58px phone. Focused tile is ~1.2× and
pushes the rail.

## The rails

```
WORK  [☻ ABOUT] [VISTIQ] [AXA] [EXL] [MATHCO] [AMAZON]     ┊ pinned
PLAY  [☻ ABOUT] [KICKY] [BRIDGEAI] [JOBAMATRIX] [RIZZUME]
                [GLINER] [NOTME] [MEDICAL RAG] [FIFA ELO]  ┊ pinned

pinned = [16 PEOPLE] [★ TROPHIES] [✉ CONTACT]   round, both rails
```

Each tab remembers its own focus.

## Input

```
                desktop                    phone
tile      ◄►    ← →  ·  wheel over rail    horizontal swipe
tab       ▲▼    ↑ ↓                        vertical swipe
open            enter · click focused tile tap focused tile
back            esc
deep link       ?skip&tab=play&i=1         (also used for screenshots)
```

## Content

All of it lives in `js/data.js`. `js/tiles.js` turns it into the rail model.
Adding a job or project means adding one object with a `key` and a `mark`.

## Tests

`tests/interaction.html` drives the real page in an iframe and asserts focus,
tabs, clamping, colour propagation and card counts. Open it on the dev server,
or run it headless — see README.

## Changelog

- 2026-08-17 — Rewritten for the PS5 home screen. Replaces the reel/XMB
  contract; fluid simulation, cloud shader and 3D coin removed.
- 2026-07-05 — Original reel/XMB contract (superseded).
