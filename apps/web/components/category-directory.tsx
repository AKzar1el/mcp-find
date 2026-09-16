import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES, CATEGORY_DESCRIPTIONS, CATEGORY_FAQS, CATEGORY_LABELS } from '@mcpfind/shared';
import type { Category } from '@mcpfind/shared';
import { getCategoryCount, getIndexableServersByCategory } from '@/lib/queries';
import { generateCategoryJsonLd, generateCategoryMetadata } from '@/lib/metadata';
import { categoryPagePath, getCategoryPageWindow } from '@/lib/category-pagination';
import { getQualityStatus } from '@/lib/quality-status';
import { safeJsonLd } from '@/lib/json-ld';
import { CategoryFaq } from '@/components/ui/category-faq';
import { Navbar } from '@/components/ui/navbar';
import { ServerCard } from '@/components/ui/server-card';
import { RelatedServersForCategory } from '@/components/RelatedServersForCategory';

function isCategory(category: string): category is Category {
  return (CATEGORIES as readonly string[]).includes(category);
}

function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] || category;
}

export async function getCategoryPageMetadata(category: string, page: number): Promise<Metadata> {
  if (!isCategory(category) || !Number.isSafeInteger(page) || page < 1) {
    return { title: 'Category Not Found', robots: { index: false, follow: false } };
  }

  const count = await getCategoryCount(category);
  return generateCategoryMetadata(category, categoryLabel(category), count, { page });
}

export async function CategoryDirectory({ category, page }: { category: string; page: number }) {
  if (!isCategory(category)) notFound();

  // The indexable set stays cached at the data layer. Slice it before JSX so a
  // large category never serializes thousands of cards and links into one ISR
  // document; every subsequent page remains discoverable through SSR anchors.
  const [allServers, categoryCount] = await Promise.all([
    getIndexableServersByCategory(category),
    getCategoryCount(category),
  ]);
  const window = getCategoryPageWindow(allServers.length, page);
  if (!window) notFound();

  const servers = allServers.slice(window.start, window.end);
  const label = categoryLabel(category);
  const isFirstPage = page === 1;

  // Most recent server update date — used for the visible freshness line and JSON-LD dateModified.
  const mostRecentDate = allServers.reduce<string | null>((best, server) => {
    const date = server.github_last_push ?? server.registry_updated_at ?? server.updated_at;
    if (!date) return best;
    if (!best || new Date(date) > new Date(best)) return date;
    return best;
  }, null);
  const dateModified = mostRecentDate ?? new Date().toISOString().slice(0, 10);
  const dateModifiedDisplay = new Date(dateModified.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const previousPage = page - 1;
  const nextPage = page + 1;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar variant="sticky" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(generateCategoryJsonLd(category, label, servers, categoryCount, dateModified, {
              page,
              positionOffset: window.start,
              includeFaq: isFirstPage,
            })),
          }}
        />

        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 mb-2">
            {label} MCP Servers{page > 1 ? ` — Page ${page}` : ''}
          </h1>
          {isFirstPage && (
            <p className="text-neutral-400 text-base max-w-2xl mb-2">
              {CATEGORY_DESCRIPTIONS[category]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-neutral-500 text-lg">
              {allServers.length} servers in this category
              {window.totalPages > 1 && (
                <span className="text-sm"> · Showing {window.start + 1}–{window.end}</span>
              )}
            </p>
            <time
              dateTime={dateModified}
              className="text-neutral-600 text-sm"
              title="Most recent server update in this category"
            >
              Updated {dateModifiedDisplay}
            </time>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
          {servers.map((server) => (
            <li key={server.id} className="contents" role="listitem">
              <ServerCard server={server} qualityStatus={getQualityStatus(server.slug)} />
            </li>
          ))}
        </ul>

        {window.totalPages > 1 && (
          <nav aria-label={`${label} MCP Servers pages`} className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-900">
            <div>
              {page > 1 && (
                <Link
                  href={categoryPagePath(category, previousPage)}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  Previous page
                </Link>
              )}
            </div>
            <span className="text-sm text-neutral-500">
              Page <span className="text-white font-semibold">{page}</span> of{' '}
              <span className="text-white font-semibold">{window.totalPages}</span>
            </span>
            <div>
              {page < window.totalPages && (
                <Link
                  href={categoryPagePath(category, nextPage)}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  Next page
                </Link>
              )}
            </div>
          </nav>
        )}

        {isFirstPage && (
          <>
            <CategoryFaq
              categoryLabel={label}
              faqs={CATEGORY_FAQS[category] || []}
            />
            <RelatedServersForCategory
              category={category}
              includeDegraded={true}
              limit={8}
            />
          </>
        )}
      </main>
    </div>
  );
}
