---
title: Rebuilt as a Cross Media Bar; four bugs fixed
date: 2026-08-17 16:36 CEST
author: Claude (Opus 5)
type: update
status: built, verified in browser, not deployed
---

# Rebuilt as a Cross Media Bar

Abhishek, after living with the PS5 rail: *"you gotta fix it cuz there are some
bugs, and you have to get the actual logos of the companies, and I wanted it
more like a cross media tab — main theme is PS5 but it's also cross media
menu."*

So: keep the PS5 skin, replace the single horizontal rail with a real XMB.

## The cross

```
  ☻      ▣      ▶      ❝      ★      ✉
 ABOUT   WORK   PLAY  PEOPLE TROPHY  MAIL     ← horizontal: categories
         ┃
         ┃ VISTIQ.AI                          ← vertical: items in that
         ┃ ▸ AXA FRANCE      AXA FRANCE          category. Each category
         ┃ EXL SERVICES      DATA SCIENTIST      remembers its own item.
         ┃ MATHCO            Paris · 2025—26
         ┃ AMAZON            [ cards … ]
```

`←→` category, `↑↓` item, `enter` opens. Wheel does both: horizontal intent
changes category, vertical walks items. Swipe is the same cross. On a phone the
two axes fold into a stack — categories across the top, items beneath, detail
at the bottom — which reads as an Instagram story, the shape v4 wanted from the
start.

Categories **wrap** past either end; items **clamp**. Both axes keep one
neighbour visible behind the selection so you can see where you came from.

## Four bugs found and fixed

1. **The rail label sat underneath the focused tile.** Mine. I gave the rail
   `padding: 26px 0` with `margin: -26px 0` so the focus glow would not be
   clipped. The negative margin applied to the *bottom* too, dragging the label
   up into a tile that is 1.2× tall and lifted 4px. Fixed by cancelling only the
   top. This is what Abhishek saw as "some padding covering the AI ENGINEER".
2. **Key art rendered two marks at once — "VAXA".** A logo `error` handler
   appended its fallback mark to the key art element, but a 404 arrives
   asynchronously, by which time the render had been replaced — so the previous
   item's mark landed on the current one. Fixed by checking the image is still
   mounted (`img.parentNode`) before falling back.
3. **On a phone the detail did not grow.** `.detail` had no `flex-grow` inside
   the stacked column, so everything crammed against the top, the bottom half
   was empty, and the key art crashed into the quote text.
4. **`role="tablist"` with no `role="tab"` children.** Both the old rail and the
   old tab strip declared a tablist whose buttons had no role — a broken widget
   for screen readers. Categories are now proper `role="tab"`.

Also hardened: resize re-anchoring is debounced 120ms so it recomputes *after*
layout settles, instead of reading stale geometry mid-resize and leaving the
selection off-screen.

Not a bug: an earlier sweep flagged "hero overlaps rail" at four viewports. That
was my measurement reading the rail's *padded* box. The real gap is 390px.

## Logos — blocked on assets, but wired

Six routes tried from this sandbox, all blocked or 404: simple-icons CDN,
GitHub raw (429), Clearbit (DNS refused), `/favicon.ico` (only axa.com
answered, at 1150 bytes — far too small for a 64px icon, let alone key art),
`/apple-touch-icon.png` (404), and LinkedIn (guest page renders but WebFetch
returns markdown, so image URLs are stripped).

I did not hand-draw approximations: a not-quite-right AXA or Amazon mark is
worse than clean type and misrepresents the brand.

Instead the renderer is logo-ready. Drop files into `assets/logos/` named after
the entry and they replace the typographic mark with no code change:

```
vistiq-ai.svg   axa-france.svg   exl-services.svg   mathco.svg   amazon.svg
```

A missing file falls back to the mark. LinkedIn is a fine source — Abhishek is
signed in, and his own experience section carries all five employer logos.

## Measured

- **32/32 interaction assertions pass** (`tests/interaction.html`, headless
  Chrome): both axes, per-category memory, clamping, category wrap, colour
  propagation, item counts (3/5/8/16/4/4), badge, action hrefs, clicking, and
  that a missing logo yields exactly one mark and zero stray images.
- Verified at **1440×900, 768×1024 and 390×844**.
- One test initially failed asserting the key art was "V"; the code was right
  and the assertion was wrong — WORK had remembered EXL by that point. The
  assertion now derives the expected mark from the live selection.

## On disk

```
new      js/menu.js        categories x items model
new      js/xmb.js         the cross engine
rewrite  index.html  css/main.css  js/main.js  tests/interaction.html
edit     js/boot.js        loadbar id renamed (#bar is the category bar now)
delete   js/home.js  js/tiles.js
```

## Next session

1. Real phone. Still the one unverified thing — touch swipe on both axes and
   `100dvh` under the URL bar.
2. Add `assets/logos/*` and confirm the fallback swaps cleanly.
3. Decide whether items should wrap like categories do.
4. Merge to `main` when Abhishek says so. He has not.

## Changelog

- 2026-08-17 16:36 CEST — XMB rebuild; four bugs fixed; logos wired but unshipped.
