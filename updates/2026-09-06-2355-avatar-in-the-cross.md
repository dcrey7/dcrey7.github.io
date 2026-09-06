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
