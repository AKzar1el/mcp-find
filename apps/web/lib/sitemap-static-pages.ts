/**
 * The URL list behind sitemap-static.xml.
 *
 * Lives in lib/ rather than inside the route because sitemap.xml has to
 * advertise a lastmod for the static shard, and the only honest value for
 * that is the max lastmod of the URLs the shard actually contains. Both
 * consumers therefore build from this one list. When the index computed its
 * own date instead — `today`, unconditionally — it contradicted the shard it
 * pointed at, and Google stopped downloading the shard.
 */

import { getCategoryLastUpdated, getIndexableSitemapMaxLastmod } from '@/lib/queries';
import { SITE_URL, CATEGORIES } from '@mcpfind/shared';
import { getAllPosts } from '@/lib/blog';
import { maxLastmod, type SitemapUrlEntry } from '@/lib/sitemap-lastmod';

export async function getStaticSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const [categoryLastUpdated, catalogueLastmod] = await Promise.all([
    getCategoryLastUpdated(),
    getIndexableSitemapMaxLastmod(),
  ]);

  // `/` and `/servers` both render the server catalogue, so the catalogue's
  // own most-recent real change is their honest lastmod. Previously both
  // carried a rolling `today` that moved on every request while the
  // underlying rows had not changed since 2026-03-25.
  //
  // `/submit` is a static form. Its content changes at deploy time, and we
  // have no stored timestamp for that — so it ships no lastmod and, with
  // nothing to derive a cadence from, no changefreq either. Declining to
  // answer is the honest option the sitemap protocol provides.
  const staticPages: SitemapUrlEntry[] = [
    { loc: SITE_URL, priority: '1.0', lastmod: catalogueLastmod },
    { loc: `${SITE_URL}/servers`, priority: '0.9', lastmod: catalogueLastmod },
    { loc: `${SITE_URL}/submit`, priority: '0.5', lastmod: null },
  ];

  // A category with no member row carrying a timestamp gets no lastmod,
  // rather than the `today` fallback this used to apply.
  const categoryPages: SitemapUrlEntry[] = CATEGORIES.map(cat => ({
    loc: `${SITE_URL}/categories/${cat}`,
    priority: '0.8',
    lastmod: categoryLastUpdated[cat] ?? null,
  }));

  // `/categories` is the canonical hub for every category page. Its rendered
  // contents are the catalogue's category groups, so its honest lastmod is
  // the latest real change from either the catalogue as a whole or one of
  // those category groups. Do not substitute a deployment or request date.
  const categoriesHub: SitemapUrlEntry[] = [
    {
      loc: `${SITE_URL}/categories`,
      priority: '0.8',
      lastmod: maxLastmod([catalogueLastmod, ...Object.values(categoryLastUpdated)]),
    },
  ];

  // Blog frontmatter dates are authored, real dates — no fallback needed.
  // A noindex post remains available to readers and internal consumers; it is
  // only excluded from crawler discovery. Keep this filter local to sitemap
  // generation rather than changing getAllPosts' retrieval contract.
  const blogPosts = getAllPosts().filter(post => !post.frontmatter.noindex);

  const blogIndexPage: SitemapUrlEntry[] = [
    {
      loc: `${SITE_URL}/blog`,
      priority: '0.8',
      lastmod: maxLastmod(
        blogPosts.map(p => p.frontmatter.updatedAt || p.frontmatter.date),
      ),
    },
  ];

  const blogPages: SitemapUrlEntry[] = blogPosts.map(post => ({
    loc: `${SITE_URL}/blog/${post.slug}`,
    priority: post.frontmatter.cornerstone ? '0.8' : '0.6',
    lastmod: post.frontmatter.updatedAt || post.frontmatter.date || null,
  }));

  return [...staticPages, ...categoriesHub, ...categoryPages, ...blogIndexPage, ...blogPages];
}

/** Max real lastmod across the static shard's URLs, or null if it has none. */
export async function getStaticSitemapLastmod(): Promise<string | null> {
  const entries = await getStaticSitemapEntries();
  return maxLastmod(entries.map(e => e.lastmod));
}
