/* Shared state: motion flag, breakpoint helper, event bus. */

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* The phone version: any narrow screen, and any portrait screen up to a
   tablet's width. An iPad held upright is 768 to 1024 wide and got the
   desktop cross, which does not fit it; on its side it is 1024 to 1366 and
   the cross is right. The same rule is written in css/main.css. */
export const MOBILE = () =>
  innerWidth < 760 || (innerWidth <= 1024 && matchMedia('(orientation: portrait)').matches);

/* One event bus wires the modules:
   'focus' {tile}   — rail focus moved            (home → sound tick)
   'tab'   {id}     — tab switched                (home → sound)
   'start' {}       — boot finished                                        */
export const bus = new EventTarget();
export const emit = (type, detail = {}) => bus.dispatchEvent(new CustomEvent(type, { detail }));
