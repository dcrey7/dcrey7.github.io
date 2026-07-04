# v4 reel prototype — "the console boot"

**Date:** 2026-07-03 · **Status:** first working prototype (single file)

## What this is
`portfolio-4/index.html` — a zero-dependency prototype of the v4
concept: a 7-screen story/reel with no scrolling, a raw-WebGL backdrop
that morphs its palette per screen, and a console-boot opening.

## Concept mapping (moodboard → feature)
| Moodboard source | Feature in prototype |
|---|---|
| GTA V loading screens | Boot screen: afaicon key art w/ Ken Burns, progress bar, rotating tips |
| y-n10 enter gate | "PRESS START" + opt-in synth sound (WebAudio, no assets) |
| Instagram stories | Segmented progress bar top-center, tap segments to jump |
| PS5 home screen | Palette-morphing backdrop per screen (focus-reactive room) |
| PS5 activity cards | Recommendation cards (avatar, role, relationship chip, quote) |
| GTA mission passed | Kicky AI screen: ★ MISSION PASSED ★ + stat rows |
| Vice City | Contact: neon script "say hello" + indigo/pink scene |
| Void demo chips | `[0X] NAME` HUD chip bottom-left, mono labels everywhere |
| bepatrickdavid | "JUL '26 — OPEN TO WORK · PARIS" live badge |
| Shopify/teenage type | Anton display set at 10–12vw, one message per screen |

## Screens
00 BOOT · 01 HELLO · 02 WORK (Vistiq.AI: evals/RAG/agents glass cards)
· 03 KICKY AI · 04 PEOPLE (5 of 16 LinkedIn recs) · 05 TROPHIES
· 06 CONTACT

## Tech notes
- Raw WebGL1 fullscreen fbm shader (no three.js needed at this stage):
  uniforms `uCA/uCB/uAcc` lerped in JS per slide; grain + vignette +
  mouse parallax. Renders at 0.7–0.8× DPR-capped resolution (cheaper on
  mobile).
- Navigation: wheel (950ms debounce), ↑↓/PgUp/PgDn/Space, touch swipe
  (vertical, 55px threshold), ▲▼ buttons, story-segment jump. Deck
  moves via `translate3d` in px (recomputed on resize — dvh-safe).
- The people rail converts vertical wheel to horizontal scroll when
  hovered; horizontal swipes inside it don't change slides.
- `prefers-reduced-motion`: shader time frozen, deck transition
  instant, no blink/bob animations.
- Sound OFF by default; square-wave blips on nav, triad on boot.
- Fonts: Anton + Space Mono + Yellowtail via Google Fonts (needs
  network; system fallbacks otherwise).

## Verified (chrome-devtools, this session)
- 1440×900: boot → all 7 screens (screenshots `shot-*-desktop.webp`)
- 390×844: hero/work/contact (`shot-*-mobile.webp`) — everything fits,
  no scroll, cards stack (3rd work card hidden by design)
- 768×1024: contact (`shot-06-contact-tablet.webp`)
- Fixed during verification: `prog` identifier collision (WebGL program
  vs boot progress) killed the whole script; palettes brightened ~2×
  and vignette eased after first visual pass read as flat black.

## v2 — "wow pass" (2026-07-04, after iPad/desktop feedback)
User feedback: iPad showed the clouds/color morphing, desktop (CachyOS,
RTX 3090) rendered pure black; wanted a 3D object / real wow.
- **Root cause of the black desktop:** `smoothstep(1.5, 0.2, x)` —
  reversed edges are undefined behavior in GLSL. Apple GPUs evaluate
  the formula anyway; the NVIDIA Linux driver returns 0 → black.
  Replaced with correctly-ordered smoothstep.
- Background upgraded to domain-warped fbm **clouds** (5 octaves,
  double warp) — dramatic smoke in each scene's palette, pointer-
  following glow core.
- **3D afaicon coin** (three.js 0.160 via importmap/unpkg): gold
  metallic rim, icon on both faces, idle spin + bob, 360° flip on every
  screen change, point light tinted live by the scene palette. Floats
  right of text on landscape, above text on portrait. `try/catch` —
  site works without it (offline/blocked WebGL).
- `.slide::before` scrim (left gradient; radial on boot) keeps type
  readable over the loud clouds.
- No-WebGL fallback: `body.nogl` animated CSS gradient.
- Verified: localhost desktop 1440×900 (hero + work) & 390×844 (work,
  coin repositioned to avoid right-edge clip). file:// blocks the coin
  texture (CORS) — use `python -m http.server` locally.

## Known gaps / next steps
- Slide-transition could add scale/tilt depth (currently clean slide).
- LinkedIn URL is linkedin.com/in/dcrey7 (from resume.typ) — confirm.
- No Jobamatrix/Treble/GLiNER project screens yet — 02/03 could become
  a PS5-style tile rail of 5 projects instead of a single mission.
- afaicon PNG has baked white circle — consider a cutout/transparent
  version for compositing.
- Sound toggle state not persisted; no analytics; no OG/meta tags.
