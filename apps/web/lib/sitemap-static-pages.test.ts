// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlogPost } from '@/types/blog';

const mocks = vi.hoisted(() => ({
  getCategoryLastUpdated: vi.fn(),
  getIndexableSitemapMaxLastmod: vi.fn(),
  getAllPosts: vi.fn(),
}));

vi.mock('@/lib/queries', () => ({
  getCategoryLastUpdated: mocks.getCategoryLastUpdated,
  getIndexableSitemapMaxLastmod: mocks.getIndexableSitemapMaxLastmod,
}));

vi.mock('@/lib/blog', () => ({ getAllPosts: mocks.getAllPosts }));

vi.mock('@mcpfind/shared', () => ({
  SITE_URL: 'https://mcpfind.org',
  CATEGORIES: ['ai', 'devtools'],
}));

function post(slug: string, overrides: Partial<BlogPost['frontmatter']> = {}): BlogPost {
  return {
    slug,
    content: '',
    readingTime: 1,
    frontmatter: {
      title: slug,
      description: `${slug} description`,
      date: '2026-04-01',
      author: 'MCPFind',
      tags: [],
      ...overrides,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCategoryLastUpdated.mockResolvedValue({
    ai: '2026-06-04T12:00:00Z',
    devtools: '2026-05-01T12:00:00Z',
  });
  mocks.getIndexableSitemapMaxLastmod.mockResolvedValue('2026-05-20T12:00:00Z');
  mocks.getAllPosts.mockReturnValue([]);
});

describe('static sitemap entries', () => {
  it('includes the canonical categories hub with a lastmod derived from category and catalogue data', async () => {
    const { getStaticSitemapEntries, getStaticSitemapLastmod } = await import('./sitemap-static-pages');

    const entries = await getStaticSitemapEntries();

    expect(entries).toContainEqual({
      loc: 'https://mcpfind.org/categories',
      priority: '0.8',
      lastmod: '2026-06-04T12:00:00Z',
    });
    expect(await getStaticSitemapLastmod()).toBe('2026-06-04T12:00:00Z');
  });

  it('uses the catalogue timestamp for the categories hub when it is newer than every category', async () => {
    mocks.getIndexableSitemapMaxLastmod.mockResolvedValue('2026-06-20T12:00:00Z');
    const { getStaticSitemapEntries } = await import('./sitemap-static-pages');

    const categoriesHub = (await getStaticSitemapEntries()).find(
      entry => entry.loc === 'https://mcpfind.org/categories',
    );

    expect(categoriesHub).toMatchObject({ lastmod: '2026-06-20T12:00:00Z' });
  });

  it('renders the categories hub into sitemap-static.xml', async () => {
    const { GET } = await import('@/app/sitemap-static.xml/route');

    const xml = await (await GET()).text();

    expect(xml).toContain('<loc>https://mcpfind.org/categories</loc>');
    expect(xml).toContain('<lastmod>2026-06-04</lastmod>');
  });

  it('omits noindex posts from sitemap-static.xml and the blog index lastmod', async () => {
    mocks.getAllPosts.mockReturnValue([
      post('reader-visible', { updatedAt: '2026-04-10T12:00:00Z' }),
      post('private-search', { noindex: true, updatedAt: '2026-06-10T12:00:00Z' }),
    ]);
    const { GET } = await import('@/app/sitemap-static.xml/route');

    const xml = await (await GET()).text();

    expect(xml).toContain('<loc>https://mcpfind.org/blog/reader-visible</loc>');
    expect(xml).not.toContain('https://mcpfind.org/blog/private-search');
    expect(xml).toMatch(
      /<loc>https:\/\/mcpfind\.org\/blog<\/loc>\n    <lastmod>2026-04-10<\/lastmod>/,
    );
  });
});
