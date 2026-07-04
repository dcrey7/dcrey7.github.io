/* Shared state: palettes, reduced-motion flag, event bus. */

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = () => innerWidth < 760;

/* One event bus wires the modules:
   'nav'   {index, fwd}  — section changed (deck → fluid burst, coin flip, sound)
   'row'   {dir}         — row focus moved (deck → sound tick)
   'start' {}            — boot finished, user pressed start                    */
export const bus = new EventTarget();
export const emit = (type, detail = {}) => bus.dispatchEvent(new CustomEvent(type, { detail }));

/* Scene palettes: [deep, mid, accent] per section.
   0 BOOT · 1 HELLO · 2 WORK · 3 PROJECTS · 4 PEOPLE · 5 TROPHIES · 6 CONTACT */
export const PAL = [
  [[0.02,0.02,0.03],[0.10,0.09,0.04],[1.0,0.78,0.02]],
  [[0.04,0.04,0.05],[0.24,0.18,0.03],[1.0,0.78,0.02]],
  [[0.02,0.06,0.18],[0.10,0.24,0.48],[0.31,0.76,0.97]],
  [[0.02,0.12,0.06],[0.08,0.36,0.19],[0.61,0.88,0.36]],
  [[0.10,0.05,0.20],[0.28,0.16,0.48],[0.72,0.61,1.0]],
  [[0.06,0.05,0.03],[0.26,0.20,0.08],[0.91,0.72,0.29]],
  [[0.13,0.04,0.26],[0.50,0.10,0.40],[1.0,0.31,0.64]]
];

export const palette = { cur: PAL[0].map(c => c.slice()), tgt: PAL[0] };

/* Called once per frame by the backdrop. */
export function lerpPalette(){
  for(let i = 0; i < 3; i++)
    for(let j = 0; j < 3; j++)
      palette.cur[i][j] += (palette.tgt[i][j] - palette.cur[i][j]) * 0.045;
}
