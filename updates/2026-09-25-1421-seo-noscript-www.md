---
title: SEO third pass, text without scripts and one address
date: 2026-09-25 14:21 CEST
author: Claude
type: update
status: deployed
---

# What was asked

"Fix all these": the open items in `2026-09-25-1352-seo-entity-and-card.md`.

# What changed

## Text without JavaScript

- `index.html` body: a `<noscript>` block with the same profile as
  `llms.txt` (about, work, education, products, awards, links).
- `index.html` head: a `<noscript><style>` that hides the boot screen and
  styles the block. It only applies with scripts off.
- `scripts/noscript.py` writes the block from `llms.txt` between two
  marker comments. `llms.txt` is the one source; a test fails if the two
  drift.
- `llms.txt` gains the four "About me" lines the site already shows.

Measured: a crawler without scripts now reads 367 words, up from 27. With
scripts on, the block is not in the DOM and its style is not loaded, so
visitors see the site exactly as before (checked in Chrome).

The owner removed a no-script fallback on 11 Sep. He approved this one on
25 Sep after the "zero visual change" explanation.

## One address

- `functions/index.ts`: a Pages function on `/` only. `www.hiabhi.com`
  gets a 301 to `https://hiabhi.com/`; every other request goes straight
  to the static page.
- `_routes.json`: the function runs on `/` alone, never on assets.

Why a function: the Cloudflare token answers "request is not authorized"
on the zone redirect rules, and `_redirects` cannot match a host name.

Tested on a preview deploy first: the homepage through the function still
returns 200 with the full security headers from `_headers`.

## Kicky AI link

Handed to Codex, which owns kickyai.com (its `AGENTS.md`): a "Built by
Abhishek Thomas" footer link to hiabhi.com and a creator Person in its
JSON-LD. See kickyai `docs/updates/` for its own note.

# Measured

- `pytest tests/test_seo.py`: 19 passed (3 new: noscript matches
  llms.txt, 300+ words without scripts, the www function shape).
- Local audit: pass, zero issues.

# Open

- Search Console: resubmit the sitemap and request indexing. Only the
  owner can, it is his Google account.
- Old 3D asset scripts (`gen_props.py`, `make_bust.py`,
  `tripo_models.py`) have ruff lint warnings. Not touched here.

## Changelog

- 2026-09-25 14:21 CEST: written at deploy time.
