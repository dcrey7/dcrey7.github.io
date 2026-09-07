---
title: The rigged avatar goes live in the middle of ABOUT
date: 2026-09-06 23:55 CEST
author: Claude
type: update
status: shipped
---

## What this is

Abhishek's rigged, animated 3D model now stands in the middle third of the
ABOUT category. It is the real model in the browser, not a video: you drag to
turn him and scroll to zoom. The clip he plays follows the screen you are on.

## The decision that shaped it

The first attempt rebuilt the scene on the site: a fresh three.js viewer, a
fresh skeleton load, fresh desk and prop placement. Abhishek stopped it:

> all the modellign laptop desk props all that is done breooo we already did
> all that you djust have to putt it on the we

He was right. The motion playground at
`~/Downloads/work/comfy/output/avatar/sleeping-dogs-pipeline/abhishek/play/`
already solves the hard parts, and its desk work was finished (its own script
tag reads `viewer.js?v=typing-fingertips-5`). So the site now hosts that page
in a frame instead of copying its logic. That rebuilt scene was deleted:
`js/avatar-scene.js`, `js/avatar-props.js` and the vendored three.js modules
under `js/vendor/` are gone.

The desk was already correct. Measured from the shipped placement, unchanged:

| Piece | Size (m) | Rotation | Position (m) |
|---|---|---|---|
| office-chair | 0.53 x 1.01 x 0.58 | +90 deg | (-0.04, 0, 0) |
| office-desk | 0.64 x 0.76 x 1.30 | -90 deg | (0.80, 0, 0) |
| office-laptop | 0.40 x 0.23 x 0.40 | +90 deg | (0.82, 0.761, 0) |

The keyboard height is not a constant: the viewer fires a ray straight down
from (0.78, 2, 0) onto the laptop and uses the hit point, then drives the
fingers to it. Nothing there needed fixing.

## What was built

- `assets/avatar/` (3.2 MB, 17 files): the model, eight clips, two props, the
  three workstation models and the viewer. The tree mirrors the playground
  exactly, so the viewer resolves every path without an edit.
- `assets/avatar/play/embed.html`: the viewer's controls, present and hidden,
  around a full-bleed canvas.
- `assets/avatar/play/embed.js`: presses those controls. One entry per screen.
- `js/avatar.js`: mounts the frame. Two styles, because moving an iframe to a
  new parent reloads it. The desktop keeps one frame in `.detail` and sends it
  a message when the screen changes; the phone builds one per open drop-down.

Five edits to the copied `viewer.js`, all about the backdrop, none about the
scene: an `EMBED` flag read from the URL, a transparent background, the floor
hidden, the grid dropped, and the camera parked at eye level (y 1.35 instead
of 2.7) because the site panel is a wide letterbox and the higher angle left a
band of empty sky above him.

## What plays where

| Screen | Motion |
|---|---|
| ABOUT ME | dance, run, high kick, roll, on a loop |
| BUILDING | sitting at the MacBook, with the desk and chair |
| EXTRAS | eating noodles, then drinking |

Clips came from the verified list in
`~/Downloads/work/comfy/docs/updates/2026-09-06-2300-motion-reel.md`, not from
guesswork. That file records which retargets are duds.

## Two bugs found and fixed

1. **The driver never started.** It waited for the label "your avatar is
   ready", but the viewer picks a clip by itself the moment the motion list
   arrives, which overwrites that label. The dance in the first screenshot was
   the viewer's own default, not the driver. It now waits for the motion list
   plus a non-empty label.
2. **The LOADING word stayed on screen.** `#shade` sets `display: grid`, and an
   author rule beats the `hidden` attribute. Added `#shade[hidden]`.

A third was in the site itself: `js/menu.js` rebuilds every about item field by
field and was dropping the new `avatar` key, so nothing ever mounted.

## Verified

- Suite: 67 passed, 0 failed, including two new assertions (the character shows
  on ABOUT, and is hidden when you leave).
- Real browser, 1440x900: arrow down to BUILDING and the clip becomes
  `POI ComputerSitting M`; down again and it is `POI Stand Eat Noodles M` with
  the bowl attached (`characters-99255c9a`, NOODLEBOWL001_A). The frame is
  never reloaded across those switches: same `src`, one frame, shade still
  hidden. Right to WORK hides it; left back to ABOUT resumes it.
- Real browser, 390x844: opening ABOUT mounts exactly one frame in the open
  drop-down.
- Screenshots at the real panel size confirm he sits on the chair with his
  hands on the keys.

## Costs

3.2 MB, fetched only when an ABOUT screen is opened. Hidden rather than
removed when you leave, so the browser stops its animation frames and coming
back is instant.

## Changelog

- 2026-09-06 23:55 CEST - Written.

## Second pass, 2026-09-07

New requirements from Abhishek: one motion per screen, no hint line, zoom
limits, and a camera that moves by itself.

- **One motion per screen.** ABOUT ME eats noodles, BUILDING types, EXTRAS
  drinks. (Eating and drinking were the other way round at first and were
  swapped on 7 Sept at his request.)
  The clip cycling is gone, and with it four clips. The bundle now carries
  five: the sip, plus the resting loop and the neutral idle the drink cycle is
  blended from, plus typing and noodles.
- **The hint line is gone.**
- **Zoom limits.** In stops at 2.0 m, which frames about three quarters of the
  body; out stops at 3.8 m standing and 4.8 m at the desk, where the whole
  motion still sits inside the frame. The standing shots now aim at 1.30 m up
  the body so the tight framing cuts his shins and never the top of his head.
- **The camera drifts.** Every 5.2 s it eases over 3 s to a new random angle,
  distance and height inside those limits, always in front of him. A drag or a
  scroll stops it for 6 s, and it picks up from wherever the visitor left it.

Three bugs fixed on the way:

1. **Drinking never worked.** The viewer synthesises its drink loop from three
   clips, and only the sip was shipped, so the button failed with "Drinking
   needs both idle and sip clips." The eating shot had masked it.
2. **The button fired too early.** All three motions carry a prop, and the
   prop list loads separately from the model. Clicking before it arrived was a
   silent no-op. It now waits for the list.
3. **The drink loop dropped to an idle every 8 seconds.** When a clip reaches
   its last frame the viewer's loop falls back to a standing idle, and an
   eight second cycle trips that on every lap. A repeating action now never
   counts as finished. There is also a watchdog in the driver that presses the
   button again and holds the camera in place, in case anything else drops the
   motion. Measured 28 s of unbroken drinking, 14 samples, zero drops.

Also in this pass, both raised by Abhishek:

- **The northern lights leaked onto the other themes.** The CSS named the
  three shader themes and set them to zero, but the light mode rule came after
  and re-lit them, so in light mode the aurora glowed over beach, lava and
  space. It is now off everywhere and switched on for the default theme only,
  in both modes, and the shader stops running when you leave that theme.
  Measured: opacity 0 on all three, 0.74 on default.
- **The photo wall is a fixed pinboard.** Five pictures at most, in a box of
  a set height, so nothing scrolls at any screen size. The arrangement follows
  the count. Tracks are minmax(0, 1fr), because plain 1fr let a tall picture
  push its row taller and the rows came out uneven.

  Three tries. First one large picture with four small ones beside it, which
  read as a hero shot with thumbnails. Then quadrants, which he did not want
  either, and the four picture item stayed a plain 2x2 of equal squares.

  It is now masonry. Every count gets its own arrangement and no two tiles in
  a column share a height, so the seams never line up across the wall, which
  is the thing that makes a pinboard look like one. Five pictures go in three
  columns and the last column stops short, so the bottom edge is ragged the
  way a real board is. Measured at 1440x900: PIKA PAL's four tiles are 141 and
  191 tall on the left against 191 and 141 on the right, seams 50 px out of
  step; NOTME's five run 166, 166, 225, 107 and 283. Zero overflow in both.
  Checked at 1280x640 too, where the page still does not scroll; the height
  eased from 42vh to 38vh so a short laptop keeps a margin under it.

## The camera jump, 7 Sept

Abhishek: "when you scrool befor and come back there is like a small readjust
and then it transtion to the new angle".

A framing is three things: an angle, a distance, and the point being looked at.
The drift only ever carried the first two. It read the current angle against
wherever the camera happened to be aimed, then on the first frame of a move it
snapped the aim to its own fixed spot and glided from there. Hence a jump
followed by a smooth move.

The two aims really do differ. The viewer's own `focusActivity()` looks at
1.20 m up the body; the standing shot looks at 1.30 m. So every first move
after a screen loaded jumped 10 cm, and the desk shot 15 cm. Panning or the
viewer following the actor moved it further.

Fixed by carrying the look-at point through the move with everything else, so
it eases across instead of snapping.

Two more things were making it feel wrong:

- **The long way round.** Bearings come back from atan2 between -180 and 180.
  Going from -170 to 80 is 110 degrees one way and 250 the other, and straight
  interpolation took the long way, swinging the camera right around him. Moves
  now take the short way.
- **The dead wait.** After a drag the camera sat still for six seconds and then
  a further five before moving, so the resume felt disconnected from the
  gesture. It now picks up 1.2 s after they let go.

Measured, 2304 frames across a scroll, the pause and the resume: the largest
single frame camera step is 0.0159 m, and the four largest are within 0.0002 m
of each other inside the same 20 ms, which is the peak of an ease rather than a
jump. Over a separate 3168 frame run the largest step is 0.0236 m with the same
flat distribution. The old snap was 0.10 m in one frame, roughly six times any
real step.

Also bumped the script version in embed.html to 2026-09-07c. It is queried as
`embed.js?v=...`, so an unchanged token leaves the edge and every browser
serving the old file no matter what was deployed. That had already bitten the
eating and drinking swap.

## Filling the middle, 7 Sept

The layout is a category bar across the top and three columns under it: the
item list on the left, the design and the 3D in the middle, the description on
the right. Everything in that middle column below the heading belongs to the
character.

It had a set height, 38vh capped at 420 px, so it left a gap on a large screen
and crowded the shelf on a small one. It now grows into whatever is left
between the heading and the shelf, and min-height: 0 lets it shrink instead of
pushing the shelf off the bottom. Nothing changed inside the viewer: it reads
the canvas size every frame and sets the lens from it.

Measured, gaps even top and bottom, shelf visible and no page scroll in each:

| Screen | Stage | Gaps |
|---|---|---|
| 1920x1080 | 669x527 | 22 px |
| 1440x900 | 470x441 | 22 px |
| 1280x640 | 404x245 | 15 px |
| 390x844 (phone) | 339x354 | drop-down |

The phone has no fixed middle to fill, since the character sits inside an open
drop-down that scrolls, so there it takes 42vh with a 260 px floor.

### The cache, and what does not work

Every change so far has needed a hard refresh to be seen, and one stale copy
swallowed the eating and drinking swap outright, so this was worth solving.

Setting `Cache-Control` on /css/* and /js/* in `_headers` does NOT work on
Cloudflare Pages. Pages sets its own value for static assets and overrides it.
Measured on a cache MISS, straight from the origin, it still came back
`max-age=14400`. That block was removed rather than left in place implying
something untrue.

What does work is a version in the URL. The stylesheet is now linked as
`css/main.css?v=2026-09-07`, so a bump reaches everyone at once. The avatar
scripts already carry one.

This does not cover the ES modules under js/. Only the entry point is named in
index.html; everything it imports resolves to a plain path with no version, so
those still sit in the browser for four hours. Fixing that properly needs a
build step to rewrite the import paths, which this site deliberately does not
have. For now a JS change still wants a hard refresh.

### The gap under the heading

Abhishek saw a gap between PARIS and the top of his head on ABOUT ME, and said
EXTRAS looked right. Both screens use the same standing shot, so the act was
never the cause: the camera drifts between 2.2 m and 3.6 m, the aim was fixed
at 1.30 m up the body, and the further back it went the further down the frame
his head sank. He caught it on one screen at a far framing and the other at a
near one.

The shot now works back from the top of the frame instead of fixing the aim.
The lens shows about 0.37 * distance of height above whatever it looks at,
close enough across the tilts used here, so aiming that far below his crown
holds his head just under the top edge at every distance.

The crown is read from the Head bone each time rather than assumed. A first
try used a fixed 2.05 m and left the head at 19 to 27 percent down the panel,
because eating bends him over the bowl and his head never reaches 2.05.
Reading the bone adapts to the pose.

Measured, head top as a percentage down the panel:

| | before | after |
|---|---|---|
| ABOUT ME, eating | 19 to 27 | 3 to 6 |
| EXTRAS, drinking | - | 3 to 6, feet at 69 to 84 |

The desk shot keeps its fixed aim: it frames furniture as well as a person, so
pinning his head would push the desk out of shot.
