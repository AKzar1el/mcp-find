/**
 * Stable, path-based pagination for category hubs.
 *
 * Page one keeps the canonical category URL. Subsequent pages use a path
 * segment so they can remain independently cacheable ISR routes without
 * opening an unbounded query-string render space.
 */
export const CATEGORY_PAGE_SIZE = 48;

export type CategoryPageWindow = {
  page: number;
  totalPages: number;
  start: number;
  end: number;
};

export function getCategoryPageWindow(totalItems: number, page: number): CategoryPageWindow | null {
  if (!Number.isSafeInteger(totalItems) || totalItems < 0 || !Number.isSafeInteger(page) || page < 1) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / CATEGORY_PAGE_SIZE));
  if (page > totalPages) return null;

  const start = (page - 1) * CATEGORY_PAGE_SIZE;
  return {
    page,
    totalPages,
    start,
    end: Math.min(start + CATEGORY_PAGE_SIZE, totalItems),
  };
}

export function parseCategoryPage(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 2 ? page : null;
}

export function categoryPagePath(category: string, page: number): string {
  return page <= 1
    ? `/categories/${category}`
    : `/categories/${category}/page/${page}`;
}
