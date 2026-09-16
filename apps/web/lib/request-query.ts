const DIRECTORY_API_KEYS = new Set([
  'q', 'page', 'limit', 'category', 'sort', 'status', 'pkg', 'lang',
  'tools', 'resources', 'prompts', 'official', 'featured',
]);

/** Bound input before search or cache allocation, independent of user-agent. */
export function invalidDirectoryQuery(params: URLSearchParams): boolean {
  if (params.toString().length > 2048) return true;
  const seen = new Set<string>();
  for (const [key] of params) {
    if (seen.has(key)) return true;
    seen.add(key);
  }
  const page = params.get('page');
  return (params.get('q')?.length ?? 0) > 120
    || Boolean(page && (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 100));
}

/** Unknown cache-busting keys and key ordering cannot create new CDN variants. */
export function canonicalDirectoryApiQuery(params: URLSearchParams): string {
  const normalized = new URLSearchParams();
  for (const [key, value] of params) if (DIRECTORY_API_KEYS.has(key)) normalized.set(key, value);
  normalized.sort();
  return normalized.toString();
}
