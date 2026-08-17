/* Shared state: motion flag, breakpoint helper, event bus. */

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE = () => innerWidth < 760;

/* One event bus wires the modules:
   'focus' {tile}   — rail focus moved            (home → sound tick)
   'tab'   {id}     — tab switched                (home → sound)
   'start' {}       — boot finished                                        */
export const bus = new EventTarget();
export const emit = (type, detail = {}) => bus.dispatchEvent(new CustomEvent(type, { detail }));
