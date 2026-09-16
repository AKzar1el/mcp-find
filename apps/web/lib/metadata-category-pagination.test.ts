import { describe, expect, it } from 'vitest';
import type { ServerListItem } from '@mcpfind/shared';
import { generateCategoryJsonLd, generateCategoryMetadata } from './metadata';

const SERVER = {
  id: 'server-1',
  slug: 'legacy-server-slug',
  canonical_slug: 'canonical-server-slug',
  name: 'Canonical server',
} as ServerListItem;

describe('category pagination metadata', () => {
  it('self-canonicalizes a later category page instead of collapsing it onto page one', () => {
    const metadata = generateCategoryMetadata('devtools', 'Developer Tools', 120, { page: 2 });
    expect(metadata.alternates?.canonical).toBe('https://mcpfind.org/categories/devtools/page/2');
    expect(metadata.openGraph?.url).toBe('https://mcpfind.org/categories/devtools/page/2');
    expect(metadata.title).toBe('Developer Tools MCP Servers — Page 2');
  });

  it('uses the page URL and canonical server links in its structured data', () => {
    const jsonLd = generateCategoryJsonLd('devtools', 'Developer Tools', [SERVER], 120, '2026-09-16', {
      page: 2,
      positionOffset: 48,
      includeFaq: false,
    }) as {
      '@graph': Array<Record<string, unknown>>;
    };
    const collection = jsonLd['@graph'][0] as { url: string; mainEntity: { itemListElement: Array<{ position: number; url: string }> } };

    expect(collection.url).toBe('https://mcpfind.org/categories/devtools/page/2');
    expect(collection.mainEntity.itemListElement).toEqual([
      { '@type': 'ListItem', position: 49, url: 'https://mcpfind.org/servers/canonical-server-slug', name: 'Canonical server' },
    ]);
    expect(jsonLd['@graph'].some(node => node['@type'] === 'FAQPage')).toBe(false);
  });
});
