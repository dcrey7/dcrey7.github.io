# Portfolio v4 — locked design decisions

Updated 2026-08-17 19:00 CEST. This is the build contract for the state tagged
`xmb-v1`; `updates/` logs how each piece landed. Supersedes the 2026-08-17
tile-rail contract and the 2026-07-05 reel/XMB contract.

## The conceit — a Cross Media Bar in the PS5's skin

One screen, never a page. Categories run across, the items inside the
selected category run down, and the whole screen takes the selected item's
colour. Near-black base, afaicon yellow for focus only, per-entry key colour
driving background, glow, cards and the ghosted key art.

```
        ┌────────┐
  ▶sliv │  WORK  │ PLAY-sliv CONTACT-sliv        ← coverflow deck
        └────────┘
          WORK                                   ← only selected is titled
        ┌───────┐
        │VISTIQ │  VISTIQ.AI                     ← straight rows
        └───────┘
         AXA FRANCE      (faded)
         EXL SERVICES    (faded)
                  ┌─ hero: huge Anton title, meta, action
                  └─ shelf: glass cards
```

## The horizontal axis — coverflow deck (user-approved final)

The Ubuntu/Compiz cover-switch alt-tab grammar:

- **Landscape cards** (`--catw` = 1.6 × height), all the SAME size — never
  scale-on-focus.
- **Selected card**: flat, front (`translateZ`), yellow ring, glow with room
  to fall (the bar's clipping box carries glow padding), the ONLY card with
  a visible title.
- **Side cards**: tilted ±38° with the pivot on the edge FACING the
  selection, tucked flush against it, each showing a **.30 sliver** from
  under its neighbour, z-stacked nearest-on-top, dimmed by **brightness,
  never opacity** (transparent cards dissolve the stacking).
- **No clearance** around the selected card — a continuous deck.
- Categories **wrap** on input.

## The vertical axis — straight rows (user-approved final)

No 3D here (a picker-drum variant was tried and rejected — `33ed4b1`,
reverted in `d5a6eaa`):

- Landscape item cards (`--imarkw`), same shape language as the deck.
- **First item flush** under the category — no gap, no top fade
  (`.column--athead`).
- **Deeper items park one reserved row down**, with the row you came from
  fading above (`--topfade` spans that whole row, so no fade edge can cross
  the selected ring).
- Items **wrap** (circular) like the bar.
- Bottom of the list fades out; every clipping edge everywhere fades rather
  than cuts.

## The crosspoint — the one law of the layout

`--crossx = .36 × card width` (one sliver + air). The active category always
parks exactly there; the column hangs at exactly the same x and NEVER moves.
The bar's left fade is defined as half of `--crossx`, so it can never
swallow the reserved slot.

**Architecture rule that keeps this true: the deck and every visual effect
are TRANSFORMS over a constant layout pitch.** Layout properties (margins)
were tried for the deck spacing and broke alignment mid-animation — never
position the deck with layout again.

## Sizing — one fluid base

`--cat: clamp(46px, 4.6vw, 66px)`; every other dimension derives from it by
calc. No per-breakpoint size re-declarations. `--key`, `--crossx`, `--row`
are registered `@property` so JS reads resolved pixels and the background
crossfades.

## Content

All content in `js/data.js` (`key` colour + 1–3 char `mark` per entry).
`js/menu.js` shapes it into categories × items. Logos: drop
`assets/logos/<id>.svg` and it replaces the mark, missing files fall back
silently (fallback only if the img is still mounted — 404s arrive after
re-renders).

## Input

```
←→ categories (wrap) · ↑↓ items (wrap) · enter acts · wheel both axes
swipe: horizontal = category, vertical = item · ?skip&cat=play&i=1 deep link
```

## Verification

`tests/interaction.html` — 49 assertions: both axes, wrap both directions,
per-category memory, crosspoint identical everywhere, flush-first and
reserved-row geometry, logo fallback. Compare LAYOUT values in tests, never
rendered rects — mid-transition rects lie (twice bitten this project).

## Changelog

- 2026-08-17 19:00 — Final `xmb-v1` contract: coverflow deck + straight
  vertical, transform-only architecture, crosspoint law.
- 2026-08-17 — XMB rebuild; tile-rail contract superseded.
- 2026-07-05 — Original reel/XMB contract (superseded).
