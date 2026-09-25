---
title: SEO second pass, the same tools that made rezoume and Kicky rank
date: 2026-09-25 13:52 CEST
author: Claude
type: update
status: deployed
---

# What was asked

Rezoume and Kicky AI rank first on Google for their names. Tranzlato got the
same treatment on 25 Sep. Do the same for hiabhi.com without changing how
the site looks or works.

# What the other three do that hiabhi did not

Compared from their docs and source (rezoume `frontend/`, kickyai `web/`,
tranzlato `docs/updates/2026-09-25-1339-seo-brand-ranking.md`):

1. Readable text in the HTML without JavaScript. hiabhi has 27 words, all
   menu chrome. Not changed here, see "Open".
2. A real `llms.txt`. hiabhi answered `/llms.txt` with the homepage.
3. A 1200 x 630 share card with `summary_large_image`. hiabhi used the
   small afaicon.
4. A linked `@graph` of structured data: WebSite with alternate names,
   Organization or Person, and the products tied to their maker.
5. `lastmod` in the sitemap, and `noindex` on pages that are not the point.

# What changed

Only the `<head>` and crawler files. The body of `index.html` is byte for
byte the one deployed at 40eed0b; no file under `js/`, `css/` or the avatar
changed.

- `index.html` head: one JSON-LD `@graph` with WebSite (HiAbhi,
  hiabhi.com), ProfilePage, Person (job, employer, schools, city, skills,
  GitHub, LinkedIn, Hugging Face), and rezoume, tranzlato and Kicky AI as
  WebApplications with `creator` pointing at him. Every fact is one the
  site already shows.
- `assets/og-card.png`: 1200 x 630, 107 KB, drawn by `scripts/og_card.py`
  from the royal blue field, the afaicon, Anton and Archivo.
- `llms.txt`: work, education, products, awards, links. Same facts as
  `js/data.js`, nothing private.
- `sitemap.xml`: `lastmod` 2026-09-25.
- `_headers`: `X-Robots-Tag: noindex, follow` on `/themes/*`.
- `scripts/seo_audit.py`: checks the large card, walks the `@graph`, and
  fails when `llms.txt` is the homepage. `tests/test_seo.py`: three new
  tests.
- The 11 Sep SEO work (canonical, robots, sitemap, audit, daily timer) was
  deployed but never committed. It is committed now with this.

# Measured

- `pytest tests/test_seo.py`: 16 passed. Ruff check and format pass.
- Local audit: technical pass, zero issues.
- Body of `index.html` diffed against HEAD: identical.

# Open

- **Text without JavaScript.** The biggest gap left. Google renders the
  scripts (the 11 Sep live test found the profile), but Bing and most AI
  crawlers do not, and they see 27 words. On 11 Sep a `noscript` fallback
  was removed at the owner's request. It needs his decision before any
  change.
- **Links in.** Kicky AI does not link to hiabhi.com. Rezoume and
  tranzlato do. A footer link from kickyai.com would tie the three.
- **www redirect.** `www.hiabhi.com` still serves the page instead of
  redirecting. Needs a Cloudflare zone rule in the dashboard.
- **Search Console.** Resubmit the sitemap and request indexing after this
  deploy. Ranking for "Abhishek Thomas" is unmeasured and competes with
  many people of that name; "hiabhi" and "Abhishek Thomas AI engineer
  Paris" are the realistic targets.

## Changelog

- 2026-09-25 13:52 CEST: written at deploy time.
