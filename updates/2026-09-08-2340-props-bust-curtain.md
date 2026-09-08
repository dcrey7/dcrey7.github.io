---
title: Real 3D props on the bar, the bust, and a clean cut between motions
date: 2026-09-08 23:40 CEST
author: Claude
type: update
status: deployed
---

# What changed

## The category bar is seven real models

`js/props3d.js` draws the bar. One offscreen WebGL renderer, seven 2D
canvases that receive its pixels: the browser caps contexts at about
sixteen and the character in the middle already spends one.

Six props came from gpt-image-2 pictures turned into models by Tripo
(`scripts/gen_props.py`, `scripts/tripo_models.py`). Tripo model version
v3.0-20250812 honours `face_limit`; v2.5 accepts the number and returns
101,000 triangles anyway. Each prop is about 3,500 to 4,000 triangles and
105 to 126 KB with its texture inside.

The INTRO icon is him: `scripts/make_bust.py` cuts a passport bust from
`assets/avatar/avatar/facial-rigged.glb`. Three things had to be right:

1. The file carries five face shapes (blink left and right, jaw open,
   mouth wide, mouth round) and every one was switched fully on. That gave
   shut eyes and a hanging jaw. All go to zero.
2. The eyeballs are a separate object. Deleting it left two holes. It stays.
3. The model is stored arms out. The upper arm bones are turned down 78
   degrees and the pose is baked before one cut at 69.5 percent of his
   height, just at the collarbone.

Every model, the bust included, has its front on +X. `FRONT = -PI / 2` in
the renderer turns them to face the camera, so the bar's 38 degree tilts
mean what they say: previous cards look right, next cards look left.

The renderer marks each canvas `data-renderer=prop` or `fallback`, holds
still under reduced motion, and drops every icon to its flat glyph if the
GPU context is lost.

## The curtain between motions

Changing screens on INTRO switched the clip the instant the fade started,
so the new motion showed through a half closed curtain, then a blank, then
the same motion again. Now, measured in the browser at 144 Hz:

```
0 ms     fade out starts
69 ms    dark, and the motion switches in that same frame
215 ms   fade in starts
354 ms   fully back
```

The bearing and the height are kept across the switch, a drift in
progress included. The distance and the centre cut straight to the new
pose, and only after the pose has held still for three frames
(`settled()`), because the clip is still blending in for 120 ms and the
desk lands after it. Before this, the look at point slid 27 cm sideways for
a full second after the curtain had risen. After: the camera moves 2 to 4
mm and the target under 2 cm in the first second in view.

## Smaller things

- Tile shadows are gone from the vertical menu; `main.css` is now versioned
  `2026-09-08a` so browsers fetch it.
- DPS Sharjah has its crest: `assets/education/dps-sharjah.png`, cleaned by
  the flat art upscaler, background cut, the letter counters of SHARJAH
  cleared.
- The education third line is place and years only. The school is never
  spelt out twice.

# What was measured

- Bust: 5,221 triangles, 186 KB, 0.321 wide by 0.289 tall in the source.
- Switch ABOUT to BUILDING: dark at 63 to 70 ms, motion at 97 ms, back at
  354 to 486 ms depending on how long the pose takes to settle.
- Hand span never passed 1.2 m during a switch: no T pose frame.

# What stays open

- `tests/test_category_props.py` was rewritten to the Tripo contract but
  not run this session (the run was interrupted twice). Run it:
  `just check-category-props` with the local server on 8001.
- The PEOPLE prop reads as one figure at bar size.

# Files

- `js/props3d.js`, `js/xmb.js`, `js/mobile.js`, `js/avatar.js`, `js/data.js`
- `assets/props/*.glb`, `assets/education/dps-sharjah.png`
- `assets/avatar/play/embed.js`, `embed.html`
- `css/main.css`, `index.html`
- `scripts/make_bust.py`, `scripts/gen_props.py`, `scripts/tripo_models.py`
- `updates/category-props/` (references, generated pictures, screenshots)

## Changelog

- 2026-09-08 23:40 CEST: written at deploy time.
