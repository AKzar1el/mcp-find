# Directory request cost controls

`/blog` is built from deployment-local MDX files. Its index now prerenders at
build time and has no timed ISR revalidation. Publishing a post already deploys
the site, which refreshes this index. `dynamic = 'error'` makes the build reject
future request-time data dependencies rather than silently becoming dynamic.

Category selection is local browser state with shareable `?category=` URLs and
back/forward support. Every article card and its link is rendered in the initial
HTML; the client receives rendered slots, category names and counts, not MDX
article bodies. Canonical metadata continues to point to `/blog`. Without
JavaScript the full index remains readable.

Directory list/search input is bounded before function/database execution:

- `/servers` queries and `/api/servers` reject duplicate parameter keys, encoded
  query strings over 2,048 characters, search text over 120 characters and page
  numbers outside the existing supported integer range 1–100.
- `/api/servers` permanently redirects unknown cache-busting parameters and
  parameter-order permutations to one supported, sorted query URL. All supported
  API filter values and the existing handler's validation semantics are retained.
- Rejections and the existing 100-request/minute burst responses are uncacheable.

These bounds apply to costly request behavior, independent of user-agent. No new
user-agent block, CAPTCHA, or detail-page restriction is introduced. Existing
verified WAF blocks and unrestricted public article/detail access are retained.
The in-process rate limit is best effort across distributed Vercel instances;
it is not a durable global quota and no paid external rate-limit service was
added. The deterministic input limits apply on every request/instance.

Validation: focused request/filter tests, workspace type checks, and production
build. `/blog` appears as static in the build output; its prerender manifest has
`initialRevalidateSeconds: false`, and built HTML contains its canonical and
article links. Measure spend and cache-hit changes after production deployment;
these changes do not establish a bot/human traffic split.
