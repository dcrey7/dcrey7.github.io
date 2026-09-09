---
title: The phone gets the props, the character first, and the iPad upright
date: 2026-09-09 11:33 CEST
author: Claude
type: update
status: deployed
---

# What was wrong

Reproduced on hiabhi.com at 390 px: all seven phone rows showed the flat
glyph, and the console said "Too many active WebGL contexts. Oldest
context will be lost" fourteen times.

`props3d.js` guarded its boot on `renderer`, but boot is async. Every icon
on the page calls `spin()` in the same tick, before the first import has
resolved, so fourteen boots ran (seven desktop canvases plus seven phone
rows) and opened fourteen WebGL contexts. Chrome allows about sixteen.
With the aurora and the character, the oldest context was lost, the
renderer marked itself broken, and every icon fell back to the flat glyph.
The desktop only ever raced seven, under the cap, which hid the bug. The
character's own context was the one being killed, and the viewer rebuilds
itself into the pose it was built in: that was the T pose on the phone.

# What changed

- One boot, shared as a promise. The hidden desktop bar no longer paints
  on a phone (`stop()` per deck canvas when `MOBILE()`).
- The phone drop-down always puts the character first. The first item
  mounted before its words, an item tapped later mounted after them, so
  `mountAvatar` now prepends.
- The frame keeps its canvas veiled from the moment the shade lifts until
  the first motion has landed. Measured on a fresh phone frame: shade
  opaque to 366 ms, canvas veiled from 408 ms, eating clip on at 503 ms,
  canvas back at 669 ms with the clip playing.
- The phone version now covers any portrait screen up to 1024 px wide, so
  an iPad held upright gets the phone build; on its side it keeps the
  desktop cross. `config.MOBILE()` and the four phone media queries in
  `main.css` carry the same rule.
- The phone player: 44 px disc (was 64), smaller lines, and the disc turns
  only while a song plays, as on the desktop.
- Every module import carries one version stamp, written by
  `scripts/stamp.py`. Cloudflare serves the scripts with a four hour
  cache, and modules are keyed by their full address, so a mixed set of
  addresses was both stale and, for `config.js`, at risk of two event
  buses. Run `python3 scripts/stamp.py <stamp>` after any change under
  `js/`.

# Files

`js/props3d.js`, `js/xmb.js`, `js/mobile.js`, `js/avatar.js`,
`js/config.js`, `js/main.js`, `js/menu.js`, `js/boot.js`, `js/sound.js`,
`css/main.css`, `index.html`, `assets/avatar/play/embed.js`, `embed.html`,
`scripts/stamp.py`.

## Changelog

- 2026-09-09 11:33 CEST: written at deploy time.
