# Category rail rotation fix

Time: 2026-08-30 22:54 CEST

Fixed the XMB category rail after the icon-only pass.

- The rail now shows one previous icon, the selected icon, then every next
  icon that really comes after it.
- The rail does not wrap visually. At CONTACT, moving right returns to ABOUT.
- The selected category icon always starts with `speed: 1`. This prevents it
  from inheriting `speed: 0` from its old still-neighbour state.
- `icon3d.spin()` also defaults to motion again when no speed is passed. A
  still icon must ask for `speed: 0`.
- The phone layout uses `js/mobile.js`; it is unchanged.
