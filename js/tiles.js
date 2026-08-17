/* Builds the rail model from data.js.

   One tile shape for everything:
     { id, tab, mark, key, title, sub, meta, badge, action, cards }

   tab is 'work' | 'play'. Tiles marked pinned:true appear at the right end of
   BOTH rails, the way the PS5 keeps its library and settings tiles. */

import { ABOUT, WORK, PROJECTS, PEOPLE, TROPHIES, CONTACT, SYSTEM_KEYS } from './data.js';

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* Link cards show where they go, so they are not an empty box with a label. */
const host = url => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
};

const about = {
  id: 'about', tab: 'both', pinned: false, icon: true,
  mark: ABOUT.mark, key: ABOUT.key,
  title: ABOUT.title, sub: ABOUT.sub, meta: ABOUT.meta,
  badge: null, action: null, cards: ABOUT.cards
};

const work = WORK.map(j => ({
  id: slug(j.company), tab: 'work', pinned: false,
  mark: j.mark, key: j.key,
  title: j.company.toUpperCase(),
  sub: j.role,
  meta: `${j.where} · ${j.dates}`,
  badge: null,
  action: null,
  cards: j.bullets.map(b => ({ kicker: null, title: null, body: b }))
    .concat([{ kicker: 'STACK', title: null, body: j.stack }])
}));

const play = PROJECTS.map(p => ({
  id: slug(p.name), tab: 'play', pinned: false,
  mark: p.mark, key: p.key,
  title: p.name,
  sub: p.tag,
  meta: null,
  badge: p.passed ? 'MISSION PASSED' : null,
  action: p.links[0] ? { label: p.links[0].label, href: p.links[0].href } : null,
  cards: [{ kicker: null, title: null, body: p.desc }]
    .concat(p.links.map(l => ({ kicker: 'OPEN', title: l.label, body: host(l.href), href: l.href })))
}));

const people = {
  id: 'people', tab: 'both', pinned: true,
  mark: SYSTEM_KEYS.people.mark, key: SYSTEM_KEYS.people.key,
  title: 'PEOPLE SAY', sub: '16 linkedin recommendations', meta: null,
  badge: null, action: null,
  cards: PEOPLE.map(p => ({
    kicker: p.rel, title: p.name, sub: p.role, body: `“${p.quote}”`, init: p.init
  }))
};

const trophies = {
  id: 'trophies', tab: 'both', pinned: true,
  mark: SYSTEM_KEYS.trophies.mark, key: SYSTEM_KEYS.trophies.key,
  title: 'THE NUMBERS', sub: 'trophy cabinet', meta: null,
  badge: null, action: null,
  cards: TROPHIES.map(t => ({ kicker: null, title: t.n, body: t.label, big: true }))
};

const contact = {
  id: 'contact', tab: 'both', pinned: true,
  mark: SYSTEM_KEYS.contact.mark, key: SYSTEM_KEYS.contact.key,
  title: 'GET IN TOUCH', sub: 'say hello', meta: CONTACT.where,
  badge: null,
  action: { label: `✉ ${CONTACT.email}`, href: `mailto:${CONTACT.email}` },
  cards: CONTACT.links.map(l => ({ kicker: 'OPEN', title: l.label, body: host(l.href), href: l.href }))
};

const PINNED = [people, trophies, contact];

export const TABS = [
  { id: 'work', label: 'WORK', tiles: [about, ...work,  ...PINNED] },
  { id: 'play', label: 'PLAY', tiles: [about, ...play,  ...PINNED] }
];
