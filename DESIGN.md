# Portfolio v4 — locked design decisions

Updated 2026-07-05 after brainstorm session. This is the build contract;
`updates/` logs how each piece lands.

## Navigation — full XMB (decided)
Vertical = sections. Horizontal = carousel inside rows that have more
content. No scrolling anywhere; every state fills the viewport.

```
                        ▲▼  section
  [00] BOOT      cover-collage screen (see below) → PRESS START
  [01] HELLO     who i am
  [02] WORK      ◄ Vistiq · AXA · MathCo · …resume.typ ►
  [03] PROJECTS  ◄ Kicky · Jobamatrix · BridgeAI · GLiNER · NotMe · FIFA ►  (Cover Flow)
  [04] PEOPLE    ◄ 16 recommendation cards ►  + interactive boids flock
  [05] TROPHIES  numbers & awards
  [06] CONTACT   say hello — interactive water
                        ◄►  row browse (drag/swipe/wheel-over-row)
```

## Background — interactive fluid (SHIPPED 2026-07-05)
Real stable-fluids sim (WebGL2, RGBA16F ping-pong FBOs: advect →
splat → divergence → 20× Jacobi pressure → gradient subtract → dye
advect → composite). Cursor injects force + scene-colored dye; two
lissajous "stirrers" keep it alive when idle; every screen change
throws a 5-splat ink burst; scene palettes recolor bg + new dye.
Cloud shader stays as the WebGL1 / reduced-motion fallback; CSS
gradient when no WebGL at all.

## Per-section hero effects (decided)
- HELLO — fluid + 3D afaicon coin (shipped; face orientation fixed)
- WORK — glass cards (liquid-glass shader lineage from portfolio-3)
- PROJECTS — **Cover Flow**: KDE cover-switch/iTunes style; center card
  faces camera, neighbors tilt ±55°, glossy floor reflection
- PEOPLE — **boids**: separation/alignment/cohesion flock; birds
  scatter from the cursor; click a bird → it delivers a recommendation
  card
- CONTACT — **water**: heightfield ripples + pool caustics; Vice City
  neon script reflected in the water; tap = ripples (Evan Wallace
  WebGL-Water reference)
- One heavy sim active per screen; sims pause off-screen; half-res on
  mobile.

## GTA touches (user, 2026-07-05)
- **Wanted stars** — 5 stars pop in staggered on MISSION PASSED
  (SHIPPED). Reuse grammar for ratings/achievements elsewhere.
- **Cover-collage boot screen** (QUEUED): screen divided into polygon
  panels by black gutters like the GTA V/VI key art — each panel runs
  its own cheap mini-shader (one scene color each), afaicon logo badge
  center, stars scattered:

```
  ┌─────────┬───────────────┬─────────┐
  │ fluid   │  clouds gold  │ voxel ★ │
  │ cyan    ├──────┬────────┴─────────┤
  ├─────────┤ AFA  │   caustics pink  │
  │ grid    │ICON  ├─────────┬────────┤
  │ green ★ │badge │scanlines│ stars  │
  └─────────┴──────┴─────────┴────────┘
   black gutters ≈ GTA cover panels
```

## Content backlog (fills the rows)
Jobamatrix (agentic job system, 290 tests) · Memory BridgeAI (Treble
winner ×3) · Active GLiNER (paper+repo) · NotMe (Mistral Game Jam
finalist) · Mistral×Alan RAG finalist · FIFA Elo award · 2 merged OSS
PRs (GLiNER, HF Gemma) · full work history from `profile/resume.typ` ·
all 16 recommendations from `profile/recommendations.md`.

## Screen-by-screen wireframes

### [02] WORK — XMB row, glass cards
```
┌──────────────────────────────────────────────┐
│ ▓ DCREY7.EXE      ▂▂▂▂▂▂▂         SOUND: ON  │
│  CURRENTLY — VISTIQ.AI, PARIS                │
│  LLMS, CHEAPER & SHARPER                     │
│                                              │
│  ◄ ┌────────────┐ ┌─────────┐ ┌───────── ►   │
│    │ ▐VISTIQ.AI▌│ │  AXA    │ │ MATHCO       │
│    │ evals·rag  │ │ ai lab  │ │ analytics    │
│    │ ·agents    │ │ 2025-26 │ │ 2021-22      │
│    └────────────┘ └─────────┘ └─────────     │
│     focused card grows + refracts the fluid  │
│ [02] WORK          ● ○ ○ ○     row position  │
└──────────────────────────────────────────────┘
```

### [03] PROJECTS — Cover Flow deck
```
              ┌───────────┐
   ╱▌  ╱▌     │ KICKY AI  │     ▐╲  ▐╲
  ╱ ▌ ╱ ▌     │ ★★★★★     │     ▐ ╲ ▐ ╲
  ╲ ▌ ╲ ▌     │ MISSION   │     ▐ ╱ ▐ ╱      neighbors tilt ±55°
   ╲▌  ╲▌     │ PASSED    │     ▐╱  ▐╱
  ═══════════ └───────────┘ ═══════════════
   ¸.·˙˙·.¸  glossy reflection  ¸.·˙˙·.¸
  ◄ jobamatrix · KICKY · bridgeai · gliner · notme · fifa ►
    drag/wheel flips the deck · click opens mission-stats view
```

### [04] PEOPLE — boids deliver the quotes
```
┌──────────────────────────────────────────────┐
│      ⋀     ⋀ ⋀        ⋀        birds flock   │
│    ⋀    ⋀       ⋀  ⋀     ⋀    around a home  │
│  PEOPLE SAY          ⋀        point, scatter │
│                               when cursor    │
│  click/tap a bird → it dives  dives in       │
│  and drops its card:                         │
│    ┌───────────────────────┐                 │
│    │ ⓅⒻ Philippe Fraisse   │  ◄ 16 cards ►   │
│    │ Head of AI Lab · AXA  │                 │
│    │ "…solutions autonom…" │                 │
│    └───────────────────────┘                 │
│ [04] PEOPLE                                  │
└──────────────────────────────────────────────┘
```

### [06] CONTACT — Vice neon over tappable water
```
┌──────────────────────────────────────────────┐
│         ~ say hello ~     (pink neon script) │
│   GET IN TOUCH█                              │
│   [ abhishek01789@gmail.com ]                │
│   GITHUB · LINKEDIN · HUGGING FACE           │
│ ┈┈┈┈┈┈┈┈┈┈┈ water line ┈┈┈┈┈┈┈┈┈┈┈┈          │
│   ollǝɥ ʎɐs   ← reflection wobbles in waves  │
│     ◦))  ((◦   tap = ripple rings + caustic  │
│                light-nets on the pool floor  │
└──────────────────────────────────────────────┘
```

### Input legend
```
              desktop                mobile / iPad
section ▲▼    wheel · ↑↓ · space     vertical swipe
row     ◄►    drag · wheel over row  horizontal swipe
open          click · enter          tap
fluid ink     cursor move            finger drag (even mid-swipe)
easter eggs   T = coin rain          long-press = big ink blob
```

## References
- Fluid: Pavel Dobryakov WebGL-Fluid-Simulation (pattern followed)
- Water/caustics: https://madebyevan.com/webgl-water/
- Boids: https://threejs.org/examples/#webgl_gpgpu_birds (GPU version;
  CPU-instanced ~150 birds is enough here)
- Cover Flow: iTunes 2006 / KWin cover-switch
