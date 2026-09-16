# Search Console validation investigation — 2026-09-16

**Source:** authenticated Search Console Page indexing report for `sc-domain:mcpfind.org`, read on 2026-09-16. The report itself was last updated 2026-09-13, before the 2026-09-16 production changes. Page-indexing cohorts are UI-only in this investigation; the available API does not provide the full report or validation-example export.

## What the report says

- The site-wide report showed **1 indexed** and **7.4K not indexed** URLs.
- **Not found (404):** 33 examples. Validation began 2026-07-26 and failed 2026-09-14 because one URL failed: `https://mcpfind.org/servers/io-github-sidneybissoli-cid10-br-mcp` (last crawled 2026-09-10). The other **32 remain pending**; they are not 32 additional validation failures.
- **Crawled — currently not indexed:** 6,732 examples. Validation began 2026-08-18 and failed 2026-09-14 because one URL failed: `https://mcpfind.org/servers/com-monday-monday-com` (last crawled 2026-09-09). The other **6,731 remain pending**. Search Console caps the visible example table at 1,000, so it is not a complete cohort export.

The historical site-wide indexed count fell from 11 on 2026-07-05 to 6 on 2026-08-26/27 and 1 on 2026-08-28 and 2026-09-04. Those observations predate the current sitemap, category-pagination, cache, and detail-page changes.

## Current-route classification

A read-only authenticated registry query found every supplied server slug in the current registry with the same `canonical_slug`; no successor alias was available for a safe redirect.

- The failed 404 URL is a `deprecated` registry entry and currently returns a real HTTP 404. It must remain a 404.
- The sample also contains deprecated registry entries and old `/docs/...` and `/src/server` paths that correctly return 404. No homepage, category, or blanket fallback redirect is appropriate.
- Active thin entries from the historical 404 example list now return 200 with `noindex, follow`; the `www` example canonicals to the apex URL. These are historical examples, not evidence for resurrecting thin pages.
- The failed crawled-not-indexed URL is healthy at the current route: HTTP 200, self-canonical `https://mcpfind.org/servers/com-monday-monday-com`, `index, follow`, visible installation content, a 16,883-character README, 424 GitHub stars, and a category. It does not justify lowering the quality gate or manufacturing content.

## Bounded technical correction

The homepage's server-rendered Browse by Category cards now link directly to `/categories/<category>`. Previously they linked to `/servers?category=<category>`, which is intentionally robots-disallowed and non-canonical. The directory's interactive filter controls remain unchanged.

The global not-found document previously inherited the homepage canonical and positive robots directives alongside Next's automatic noindex. The not-found metadata now explicitly clears the canonical and uses noindex/follow semantics. This makes legitimate 404s clearer without changing their status or redirecting them.

## Limits and follow-up

This change does not claim that Google will index the site or that either validation will pass. Do not click Start validation until Google has recrawled the deployed routes and a new report is available. The separate authenticated Manual Actions and Security Issues surfaces were also checked on 2026-09-16; both reported no detected issues. That does not change the Page indexing cohort status.
