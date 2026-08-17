---
title: v4 rebuilt as a PlayStation 5 home screen
date: 2026-08-17 11:27 CEST
author: Claude (Opus 5)
type: update
status: built, verified in browser, not deployed
---

# v4 rebuilt as a PlayStation 5 home screen

The reel prototype was rejected. On desktop the 3D coin collided with the
headline and the card rail ran off the right edge; on mobile the focused card
was clipped on the left with dead space below it. The brief: make it simple,
and make one layout that works on a phone and a desktop.

The answer was already in `moodboards/playstation-home-ui/notes.md`. The
research existed; the build had not followed it.

## Decisions (agreed with Abhishek, 2026-08-17)

1. **PS5 home layout, painted in his colours.** Not a Sony clone, not the PS4
   blue menu. One tile rail, artwork behind it, focus-reactive background.
2. **Generated colour art, no images.** Every entry owns a key colour. The
   background field, the glow and the tile face all derive from it with
   `color-mix()`. No key art files exist, so the type became the art.
3. **The WebGL is gone.** The fluid simulation, the cloud shader and the 3D
   coin were the reason the old screens read as noisy. Cut.

## What shipped

One screen, four bands, at every size:

```
 topbar   ☻ DCREY7    WORK  PLAY              ♪   11:27
 rail     [☻][V][AXA][EXL][MC][AMZ] ┊ (16)(★)(✉)
          VISTIQ.AI
 hero     AI ENGINEER
          VISTIQ.AI                    ← Anton, 9.5vw
          Paris · 2026 —
 shelf    [ LLM evals ][ RAG −40% ][ MCP agents ][ STACK ]
```

- **Tabs** WORK / PLAY. Three tiles pin to the right of both rails: PEOPLE
  (16 recommendations), TROPHIES, CONTACT.
- **Tile faces are typography.** 1–3 characters set in Anton, sized by
  character count so a three-letter mark reads as loud as a one-letter one.
  The afaicon gets the only image, on a dark face so the yellow pops.
- **Key art** is the same mark blown up to 32vh at 7% opacity, behind
  everything. Without it the middle of the screen read as empty.
- **Colour crossfade** works because `--key` is registered with `@property`,
  so the gradients interpolate instead of snapping.
- **Grain** overlay so the flat colour fields read as printed ink.
- No separate detail page. The shelf below the hero *is* the detail. That is
  how the real PS5 home works and it removes a whole navigation layer.

## Measured

- **18/18 interaction tests pass** (`tests/interaction.html`, run in headless
  Chrome): arrow keys move focus, up/down switch tabs, each tab remembers its
  own focus, clicking a tile focuses it, focus clamps at both ends, the key
  colour and hero follow the rail, PEOPLE renders all 16 quote cards, and the
  KICKY action button carries the right href.
- Verified in a real browser at **1440×900, 768×1024 and 390×844**, plus the
  boot screen and a `--force-prefers-reduced-motion` pass. Screenshots in this
  folder.
- **~380 lines of WebGL deleted** (`fluid.js` 218, `clouds.js` 83, `coin.js`
  76) and the three.js import map with it. The site now ships no third-party
  JavaScript at all.

## Unknown / not done

- **Not tested on a real phone or on Safari.** Headless Chrome only. Touch
  swipe and `100dvh` behaviour under the iOS URL bar are unverified.
- **`@property` has no fallback.** Where it is unsupported the background will
  snap between colours instead of crossfading. Everything else still works.
- **No CV tile.** There is no resume PDF in this repo, so shipping a download
  button would have pointed at nothing. Add `assets/resume.pdf` and it can go
  back on the rail.
- Sound is wired to focus and tab events but was not listened to.
- `TheMathCompany` was renamed to `MathCo` in `data.js` — one long word set
  badly at display size.

## On disk

```
new      js/home.js          the rail engine (was deck.js)
new      js/tiles.js         builds the rail model from data.js
new      tests/interaction.html
rewrite  index.html  css/main.css  js/config.js  js/main.js  js/boot.js  js/sound.js
edit     js/data.js          + key colour and mark per entry, + ABOUT
delete   js/fluid.js  js/clouds.js  js/coin.js  js/deck.js
```

## Next session

1. Open it on a real iPhone and a real Android. Check swipe and the URL-bar
   height. This is the one thing that killed portfolio-3.
2. Decide whether the rail should wrap around at the ends instead of clamping.
3. Add `assets/resume.pdf` and restore the CV tile.
4. Merge `worktree-ps5-ui` into `main` and let Pages deploy it.

---

# 12:15 — the rail had no animation at all

Abhishek: *"the playstation cards are terrible, there is no animation and it
doesn't even move."* Correct on both counts. Measured before touching anything.

## Root causes (three, all separate)

1. **The rail physically could not move.** At 1440px the rail measured
   `clientWidth 1336`, `scrollWidth 1336` — **0px of overflow**. All nine tiles
   fit, so the `scrollTo()` in `centreRail()` was a no-op every single time.
   The rail had never slid once, at any width.
2. **Nothing but the tiles could animate.** `renderTile()` rebuilds the hero,
   the cards and the key art with `replaceChildren()`. Those are brand-new DOM
   nodes on every focus change, and a new node has no previous value for a CSS
   transition to interpolate from. Measured `transition-duration: 0s` on hero,
   title, sub, meta, key art and label. Transitions were never going to fire.
3. **The one thing that did move** was the tile's `width`/`height` over 0.24s —
   layout-driven, so also the least smooth property available.

## Fixes

1. **The rail is now a track that translates.** `.rail` is an overflow window;
   `.rail__track` is the flex row with `transform: translateX()` and a 0.46s
   transition. A transform always moves, whether or not the content overflows.
   `.rail__track` is `position: relative` so `tile.offsetLeft` is measured from
   the track and the maths cannot be broken by an ancestor's positioning.
   The focused tile anchors one tile in from the left on desktop (so you can
   see where you came from) and centred on phones, clamped at 0 so the first
   tile never leaves a gap.
2. **Rebuilt nodes get keyframes, not transitions** — `rise`, `bloom` and
   `slidein`, staggered with `animation-delay: calc(var(--i) * 55ms)`. The
   index is set in JS, so it works for 3 hero lines or 16 quote cards.
   The rail label persists, so its animation is restarted with a forced reflow.
3. **The tile grows on a `--ease-back` curve**, lifts 4px, and its glow got
   stronger.

## Measured after

- **21 concurrent animations** per focus change (7 × rise, 1 × bloom,
  1 × slidein, plus transitions on transform, width, height, opacity,
  box-shadow and `--key`). Before: effectively none visible.
- **Track slides on every step**: 6 of 6 distinct positions
  (`0, −20, −126, −232, −338, −444…`).
- **Reduced motion still suppresses all of it** — every duration drops to
  `1e-05s` under `--force-prefers-reduced-motion`, verified side by side
  against the normal run.
- Interaction suite still **18/18**.

## Note

An earlier measurement of this looked like a failure because it read
`getComputedStyle().transform` immediately after the key press — mid-transition
that returns the *starting* value, so the track looked stuck at identity. The
inline style holds the target. Read the target, not the computed value.

## Changelog

- 2026-08-17 12:15 CEST — Fixed: rail now translates, rebuilt nodes animate.
- 2026-08-17 11:27 CEST — Built and verified. Not deployed.
