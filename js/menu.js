/* The Cross Media Bar model.

   Horizontal axis = categories. Vertical axis = the items inside the selected
   category. They cross at a fixed point on screen. This is the PS3 XMB
   structure wearing the PS5's dark, focus-reactive skin.

   Category { id, label, mark, key, logo?, items[] }
   Item     { id, mark, key, logo?, title, sub, meta, badge, body, action, cards[] }

   `logo` is optional and points at assets/logos/<file>.svg. If the file is not
   there the renderer falls back to `mark`, so logos can be dropped in later
   without touching any code. */

import { ABOUT, WORK, PROJECTS, PEOPLE, TROPHIES, CONTACT } from './data.js';

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const host = url => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return null; }
};

/* ---------- ABOUT: three facets of the intro ---------- */
const about = {
  id: 'about', label: 'ABOUT', mark: null, icon: true, key: ABOUT.key,
  items: ABOUT.cards.map((c, i) => ({
    id: 'about-' + i, mark: ['①','②','③'][i] || '·', key: ABOUT.key,
    title: c.title, sub: c.kicker, meta: null, badge: null,
    body: c.body, action: null, cards: []
  }))
};

/* ---------- WORK ---------- */
const work = {
  id: 'work', label: 'WORK', mark: '▣', key: '#2F6BFF',
  items: WORK.map(j => ({
    id: slug(j.company), mark: j.mark, key: j.key, logo: `${slug(j.company)}.svg`,
    title: j.company.toUpperCase(),
    sub: j.role,
    meta: `${j.where} · ${j.dates}`,
    badge: null,
    body: null,
    action: null,
    cards: j.bullets.map(b => ({ body: b }))
      .concat([{ kicker: 'STACK', body: j.stack }])
  }))
};

/* ---------- PLAY ---------- */
const play = {
  id: 'play', label: 'PLAY', mark: '▶', key: '#16A34A',
  items: PROJECTS.map(p => ({
    id: slug(p.name), mark: p.mark, key: p.key, logo: `${slug(p.name)}.svg`,
    title: p.name,
    sub: p.tag,
    meta: null,
    badge: p.passed ? 'MISSION PASSED' : null,
    body: p.desc,
    action: p.links[0] || null,
    cards: p.links.map(l => ({ kicker: 'OPEN', title: l.label, body: host(l.href), href: l.href }))
  }))
};

/* ---------- PEOPLE ---------- */
const people = {
  id: 'people', label: 'PEOPLE', mark: '❝', key: '#8B5CF6',
  items: PEOPLE.map(p => ({
    id: slug(p.name), mark: p.init, key: '#8B5CF6',
    title: p.name.toUpperCase(),
    sub: p.role,
    meta: p.rel,
    badge: null,
    body: `“${p.quote}”`,
    action: null,
    cards: []
  }))
};

/* ---------- TROPHIES ---------- */
const trophies = {
  id: 'trophies', label: 'TROPHIES', mark: '★', key: '#F59E0B',
  items: TROPHIES.map((t, i) => ({
    id: 'trophy-' + i, mark: t.n, key: '#F59E0B',
    title: t.n,
    sub: null,
    meta: null,
    badge: null,
    body: t.label,
    action: null,
    cards: []
  }))
};

/* ---------- CONTACT ---------- */
const contact = {
  id: 'contact', label: 'CONTACT', mark: '✉', key: '#EC4899',
  items: [
    {
      id: 'email', mark: '✉', key: '#EC4899',
      title: 'EMAIL', sub: 'the fastest way', meta: CONTACT.where, badge: null,
      body: CONTACT.email,
      action: { label: `✉ ${CONTACT.email}`, href: `mailto:${CONTACT.email}` },
      cards: []
    },
    ...CONTACT.links.map(l => ({
      id: slug(l.label), mark: l.label.slice(0, 2), key: '#EC4899',
      title: l.label, sub: host(l.href), meta: null, badge: null,
      body: null,
      action: { label: `open ${l.label.toLowerCase()}`, href: l.href },
      cards: []
    }))
  ]
};

export const CATEGORIES = [about, work, play, people, trophies, contact];
