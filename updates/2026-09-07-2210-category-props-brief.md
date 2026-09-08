---
title: Real 3D props for the category bar, the brief for Codex
date: 2026-09-07 22:10 CEST
author: Claude (plan and review), Codex (build)
type: brief
status: handed to Codex
---

# The goal

The seven icons across the top of hiabhi.com are flat Material Design glyphs
that `js/icon3d.js` extrudes and spins. Abhishek wants real 3D objects in their
place, modelled in Blender, in the style of a PlayStation 2 game asset. Not
photoreal. Chunky, low poly, flat shaded, readable at 60 pixels.

# The one rule that matters most

> "the good thing about the icon is that they are all consistent style,
> basically I want the same consistent style in blender also"

They must read as ONE set from ONE game, not seven models made separately.
Consistency is the deliverable. Get that wrong and the rest is worthless.

So do not model seven objects by eye. Build a **kit of parts** first, in one
Blender script, and assemble all seven from it. Consistency then comes from
the structure of the code, not from taste applied seven times.

The kit, at minimum:

- `slab(w, h, d)`: a box with a fixed chamfer on every edge. Every prop is
  mostly slabs. The chamfer is ONE constant for the whole set.
- `rod(len, r)`: a low segment cylinder, one segment count for the set.
- `disc(r)`, `wedge()`, `plate()`: as needed, same treatment.
- `paint(obj, role)`: applies a material from the shared palette by ROLE, not
  by colour. Roles: `body`, `dark`, `light`, `accent`.

Hard numbers, the same for every prop:

| | |
|---|---|
| triangles | 150 to 400 each, and within 2x of each other |
| chamfer | one width, in the same units, on every edge in the set |
| cylinder segments | one number for the set, 8 or 10 |
| shading | flat everywhere, no smooth normals, no subdivision |
| textures | none, materials only |
| thin parts | nothing thinner than a chamfer is readable at 60 px, so nothing is |
| fitted into | a common cube, each prop filling the same share of it |
| origin | centred on that cube, so every prop turns about its own middle |

# The seven

Category ids, from `js/menu.js`. The key colour is already per category and
becomes the `body` role.

| id | prop | notes |
|---|---|---|
| `about` | his own head | NOT modelled: taken from the avatar |
| `work` | a briefcase | slab body, rod handle, two small clasps |
| `education` | a mortarboard | plate on a cap, with a tassel |
| `play` | a game controller | slab body, two grips, d-pad and buttons |
| `people` | two figures | shoulders and heads, side by side, one behind |
| `trophies` | a cup | bowl, two handles, stem, base |
| `contact` | an envelope | slab with a flap, the flap a shallow wedge |

`about` is the exception and the best one: use the real head from
`assets/avatar/avatar/facial-rigged.glb`, the same model that stands in the
middle of the ABOUT screens. Cut the head from the skinned mesh at the neck,
freeze it in its rest pose, drop the skeleton, and fit it to the same cube as
the others. It is already a game asset, so it already matches the brief.

# How to build it

Blender as a Python module, which is how this machine runs it:

    uv run --no-project --with bpy python scripts/build_category_props.py

One script, checked in at `scripts/build_category_props.py`. It builds all
seven and exports each to `assets/props/<id>.glb`. Running it twice must give
the same result: no random numbers, no manual steps. Say in the file's
docstring what the kit is and why each constant has the value it has.

Keep the files small. The whole set together should be well under 400 KB;
these are seven small objects with no textures.

# Putting them on the site

`js/icon3d.js` currently owns this: it registers canvases by group and spins
them, with `spin(el, opts)`, `stop(group)`, `setSpeed(mult, group)` and
`recolour()`. Read it before writing anything.

Write a new `js/props3d.js` that keeps that exact API, so `js/xmb.js` and
`js/mobile.js` change as little as possible, and:

- Uses ONE three.js WebGLRenderer for all of them, offscreen, drawn into each
  icon's own 2D canvas with `drawImage`. Seven WebGL contexts is not
  acceptable; the browser caps them and the site already spends one on the
  character. three.js comes from cdnjs, exactly as `js/chrome3d.js` imports it
  (the CSP allows that host and no other).
- Loads each GLB once, shares it between canvases, and loads nothing until an
  icon actually asks for it.
- Keeps the present behaviour: the selected icon turns on Y and bobs, the
  others stand still at a fixed angle. Same speeds, same bob, same feel.
- Keeps the palette: the `body` material takes the element's computed colour,
  so light and dark mode and the per category colour keep working, which is
  what `recolour()` is for.
- Falls back to the existing flat extrusion if a GLB fails to load or WebGL is
  unavailable. The bar must never be empty.
- Respects `prefers-reduced-motion`, as the site does now.

`js/xmb.js` builds the icon canvas and sets `cv.dataset.d`. Add
`cv.dataset.prop = cat.id` so the renderer knows which object to show.

# Rules

- Read `~/.claude/CLAUDE.md` and this repo's `CLAUDE.md` first. No em dashes
  anywhere, in code, comments or commit messages. Simple code a junior reads
  once. Comments say WHY, not what.
- Work in this worktree. Do not touch `main`. Commit, do not push, do not
  deploy.
- The suite must stay green. It is 67/67:
  `google-chrome-stable --headless=new --disable-gpu --virtual-time-budget=25000
  --dump-dom http://localhost:8001/tests/interaction.html` and grep "passed".
  The dev server is already up on port 8001 serving this worktree.
- Verify with real screenshots at 1440x900 and 390x844. GPU headless needs
  `--use-gl=angle --use-angle=swiftshader` or WebGL comes out blank.
- Anything under `assets/avatar/play/` is a copied third party viewer with
  deliberate local edits. Do not touch it.
- Write `updates/<date>-<time>-category-props.md`: what the kit is, the
  constants and why, the triangle count of each prop, the file sizes, what
  failed with the real error.

# What good looks like

Seven objects across the top that look like they came out of the same game.
Turn the bar and the selected one revolves and bobs exactly as the flat icons
do now. His own head sits on the left where the person glyph used to be. At a
glance the set is obviously one family: same chunk, same chamfer, same light.

---

# Correction, 22:25: they need proper textures

Abhishek, on the set above: "i want the texture also properly and good enough".

He is right and the line in this brief saying materials only was wrong. A
PlayStation 2 asset is low poly AND textured: the poly count went into the
silhouette and everything else was painted into a small map. Flat colours are
a modern stylisation, not the era.

So keep every model and every constant already built. Add texture.

## One atlas for the whole set

All six built props share ONE texture, and that is not a saving, it is the
thing that keeps them a set. One image means one palette, one light direction,
one amount of wear, one grain, by construction rather than by eye. It is also
exactly how the era worked.

- 256 x 256, or 512 x 512 if 256 genuinely cannot hold the detail. Small
  enough that the texels read as of the period.
- Painted by the script, deterministically. No noise seeded off the clock, no
  hand painting in an editor, no downloads. Run it twice, get the same file.
- Each prop is unwrapped and packed into its own region. Regions do not touch,
  and leave a margin, or filtering will bleed one prop into another.
- Written to `assets/props/kit.png` and referenced by every exported GLB, so
  the browser fetches one image for all six.

## What the painting must contain

Not flat fills. That is the whole point.

- A light from above and slightly left, the same on every prop: a lighter band
  on upward faces, a darker one low down. Painted in, not lit at runtime.
- Edge darkening where parts meet, so the forms separate at 60 pixels.
- The small details that are painted rather than modelled, which is the era's
  signature: the briefcase's clasps and stitching, the controller's buttons
  and d-pad, the mortarboard's band, the envelope's fold and seal, the
  trophy's engraved plate, the faces on the two figures.
- A trace of grain or wear across the whole atlas, the same across all six, so
  nothing looks freshly extruded.

## The head

The avatar head keeps its own texture from `facial-rigged.glb`. It has to look
like him, and it is a real asset from the same era of craft. Paint the atlas
to sit beside it: sample his skin and shirt colours and keep the six props
within that range of saturation and brightness. The head is the reference the
others match, not the exception to them.

## Still true

Every rule above still stands: one kit of parts, the same chamfer, the same
segment count, flat shaded, the same triangle budget, the same cube. Texture
is added to that, it does not replace it. And the runtime must still be able
to tint the body per category, so a category's colour keeps driving its icon:
multiply the texture by the colour rather than replacing it.

## Then finish the job

The site side was not started. `js/props3d.js`, the same API as
`js/icon3d.js`, one shared renderer, the fallback, the reduced motion, all as
set out above.
