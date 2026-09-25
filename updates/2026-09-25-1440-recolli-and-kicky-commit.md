---
title: Recolli on the site, the Kicky commit, and what recolli.com lacks
date: 2026-09-25 14:40 CEST
author: Claude
type: update
status: deployed
---

# What changed

- Memory BridgeAI is becoming Recolli AI. The MEMORY BRIDGEAI heading
  now links to https://recolli.com (the LinkedIn story stays as the
  second link). BUILDING lists recolli.com. `js/data.js`.
- `llms.txt`, the noscript block and the JSON-LD name Recolli AI as a
  product he made. The audit requires all four product names in
  `llms.txt`. Imports stamped `2026-09-25a`. Commit `85d02ac`.
- Kicky AI: Codex committed only the maker change as `a4648b8` (7
  files). Kicky's older uncommitted work is untouched.

# Search Console: "Invalid sitemap address"

The sitemap is fine: HTTP 200, `application/xml`, valid, from every
address. The error comes from the address typed. In a URL-prefix
property the box already holds `https://hiabhi.com/`; type only
`sitemap.xml`. If the property is `https://www.hiabhi.com/` or
`http://hiabhi.com/`, the sitemap is outside it: use the
`https://hiabhi.com/` or Domain property.

# recolli.com, as a search engine sees it (checked 14:40)

- `/robots.txt`, `/sitemap.xml` and `/llms.txt` all return the homepage
  as HTML.
- No canonical and no JSON-LD. `og:image` is a relative path.
- 0 words of text without JavaScript.
- No link to hiabhi.com.
- A web search for "Recolli AI recolli.com" finds Recollective and
  RecollyAI, not recolli.com.
- The local `work/recolli` folder holds only `brand/`. The site source
  is not on this machine, so it is not fixed here.

## Changelog

- 2026-09-25 14:40 CEST: written at deploy time.
