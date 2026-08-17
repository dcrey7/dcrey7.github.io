---
title: Coverflow deck + straight vertical — the approved grammar (xmb-v1)
date: 2026-08-17 18:59 CEST
author: Claude (Opus 5)
type: update
status: approved by Abhishek ("great work"); tagged xmb-v1; not deployed
---

# The afternoon of iteration, condensed

Between ~17:00 and ~19:00 the cross's interaction grammar was iterated live
with Abhishek. Final state (tagged **`xmb-v1`**):

**Horizontal = coverflow deck.** Landscape cards, all one size; selected
flat/front/ringed/titled; sides tilted 38° pivoting on the selection-facing
edge, tucked flush, .30 slivers, z-stacked, brightness-dimmed (opaque).
Wraps.

**Vertical = straight rows.** Flush first item; deeper items one reserved
row down with the previous fading above; circular wrap. A picker-drum
variant (iOS alarm wheel) was built, measured, and REJECTED by Abhishek —
lives at `33ed4b1`, reverted in `d5a6eaa`.

**The crosspoint law.** `--crossx = .36 catw` for every category; the column
never moves horizontally. Left fade = crossx/2 so the reserved slot can
never be swallowed.

## Lessons that cost real time (do not relearn)

1. **Never position the deck with layout.** Clearance margins animated
   layout, offsetLeft moved mid-read, three distinct crosspoints appeared.
   The suite caught it; Abhishek saw it live. Transforms over a constant
   pitch, always.
2. **Dim with brightness, not opacity.** Transparent overlapping cards show
   the card behind through themselves — the stacking dissolves.
3. **A fade wider than its slot erases the slot.** Tie fade widths to the
   geometry they guard (`--crossx * .5`).
4. **Measure layout, never rendered rects, in tests.** Twice this project a
   correct build "failed" because the assertion read a mid-transition rect.
5. Iterating one visual knob per commit with a screenshot each time is what
   kept this converging while requirements arrived mid-turn.

## Where things stand

- 49/49 assertions; branch `worktree-ps5-ui` pushed; tag `xmb-v1` pushed.
- Still open: real-phone check (touch + URL-bar `100dvh` — the portfolio-3
  killer), logo files from LinkedIn into `assets/logos/`, and the merge to
  `main` (Abhishek's call; live site still serves the old build).

## Changelog

- 2026-08-17 18:59 CEST — Written at Abhishek's "save it somewhere".
