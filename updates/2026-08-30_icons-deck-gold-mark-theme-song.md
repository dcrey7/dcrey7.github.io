---
title: Icons only deck, gold chrome mark, theme song, sounds, one ink
date: 2026-08-30 17:52 CEST
author: Claude (with Abhishek)
type: update
status: deployed to hiabhi.com from worktree-ps5-ui (commit 70f1006)
---

# What changed

## The deck (category bar)

- No cards. The deck is icons alone. Each slot keeps the size a card
  had, so the cross point and the tests hold.
- Every icon is a 3D extrusion drawn on a canvas (`js/icon3d.js`, no
  library): the shape is stamped along the depth one pixel at a time, so
  the side is one solid body and there is no blink edge on.
- The selected icon revolves on Y (85% of the slot). The previous and the
  next stand still at the 38° cover flow slant (60%). Further icons hide.
- A faded mirror hangs under each icon, drawn in the same frame.
- Colours: Apple's system palette (light and dark pairs) per category,
  dealt across the PLAY rows; brand colours for GitHub (ink), LinkedIn
  (#0A66C2), Hugging Face (#FFD21E). Cards, when they existed, never had
  colour; the icon carries it.

## The vertical menu

- Marks sit flat: a letter or an icon on nothing; an image keeps its
  square and its shadow. Transparent PNG badges (the AWS hexagons) are
  their own shape, no box.
- The selected row: mark at 1.35x, name bold and larger; other rows at
  72%. No glow, no plate (both tried and rejected).

## The gate (landing page)

- WELCOME, PRESS ANY KEY TO CONTINUE (breathes, does not blink).
- The afaicon's black outline traced to a vector (potrace, blurred first
  so the scan's stair steps do not become facets; `js/afaicon-path.js`).
- Rendered live in WebGL (`js/chrome3d.js`, three.js from cdnjs): extrude
  with a rounded bevel, gold metal (`0xffc247`, metalness 1), a studio
  panorama for the reflections (`assets/env-studio.webp`, Poly Haven
  studio_small_09, CC0, 1024x512), prefiltered with PMREM, a non repeating
  noise as roughness and bump with light scratches, eye level, perspective
  camera. The studio is turned so the white sweep sits behind the camera:
  the front and the back never go black. The press spins it up 7x and
  fades the gate.
- Fallback without WebGL: the canvas extrusion with a painted chrome
  environment (`assets/env-chrome.webp`).
- Search and speaker buttons take no space on the gate (no gap top right).
- Theme pages hide their own panels when loaded with `?embed`.

## Sound

- `js/sfx.js`: a synthesised PS3 style tick, measured from the console's
  own cursor sound (6.84 kHz, 46 ms) for the rows, a fifth lower for the
  deck, an OK tone (3.13 kHz) on select. No Sony file shipped. Speaker
  button mutes ticks and the theme, remembered in `xmb-sound`.
- `js/theme.js`: the theme song (`assets/theme.mp3`, the user's Flume
  extension, 58.5 s, the first 120 ms cut, peak normalised) plays from the
  first key or click, loops sample accurately from 15.347 s to the end
  (the last bar is crossfaded into the bar before the loop point, made
  offline), at 20% everywhere, pauses while the YouTube radio plays.
  Browsers block sound before the first gesture; nothing changes that.

## Type and palette

- Fonts: Anton (titles) and Archivo (everything else). Space Mono gone.
- One ink per mode: `--chrome-dim` equals `--chrome`; lines use the ink.
- The right rail starts on the cross top line (`--cross-top`, measured).

# What was measured

- Suite `tests/interaction.html`: 59/59 at every step.
- Reference tick: 6838 Hz, partial 8687 Hz (0.15), 46 ms, peak 0.09.
- Loop point (librosa, 156 bpm): a = 15.467 s, b = 58.624 s in the source.
- Blender (bpy 5.0.1, Cycles OptiX on the 3090) rendered 72 frames of the
  chrome mark in 3 min; used to confirm the look, not shipped (the live
  WebGL version replaced the sheet).

# What failed or stays open

- The chrome-devtools MCP browser disconnects on pages with WebGL; the
  checks used headless Chrome with Vulkan ANGLE instead.
- Blender 5.0 API: `action.fcurves`, `scene.node_tree` and the glare node
  properties changed; the render script sets the angle per frame and skips
  the glare.
- The Flume track is the user's decision to publish; flagged twice.
- Mobile pass still pending.

# Files

- css/main.css, index.html, js/{boot,main,menu,xmb,data}.js
- new: js/{icon3d,chrome3d,theme,sfx,afaicon-path}.js, assets/theme.mp3,
  assets/env-studio.webp, assets/env-chrome.webp, tests/theme-ui.html
- themes/{lava,beach,space,birds}.html (embed flag)

# Next session

1. Mobile: the icons deck and the WebGL mark at 390x844.
2. Locale bake for the new strings (WELCOME, PRESS ANY KEY TO CONTINUE).
3. OG image.

## Changelog

- 2026-08-30 17:52 CEST: written at deploy time.
