// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BlogFilterProvider, BlogFilteredPost, BlogArticleCount } from '../blog/blog-filter-state';
import { BlogCategoryFilter } from '../blog/blog-category-filter';

const categories = [{ name: 'devtools', count: 1 }, { name: 'security', count: 1 }];
function fixture() {
  return <BlogFilterProvider>
    <BlogArticleCount categories={categories} totalCount={2} />
    <BlogCategoryFilter categories={categories} totalCount={2} />
    <ul><BlogFilteredPost category="devtools"><a href="/blog/tools">Tools article</a></BlogFilteredPost>
      <BlogFilteredPost category="security"><a href="/blog/security">Security article</a></BlogFilteredPost></ul>
  </BlogFilterProvider>;
}
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/blog'); });
describe('static blog category filtering', () => {
  it('shows all server-rendered cards and filters without a server navigation', () => {
    render(fixture());
    expect(screen.getByText('2 articles')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Developer Tools/ })[0]!);
    expect(screen.getByText('Security article').closest('li')?.hidden).toBe(true);
    expect(screen.getByText('Tools article').closest('li')?.hidden).toBe(false);
    expect(window.location.search).toBe('?category=devtools');
    expect(screen.getByText('1 article in devtools')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Developer Tools/ })[0]!);
    expect(screen.getByText('Security article').closest('li')?.hidden).toBe(false);
    expect(window.location.search).toBe('');
  });
  it('supports bookmarked categories and browser back/forward', async () => {
    window.history.replaceState(null, '', '/blog?category=security&utm_source=test');
    render(fixture());
    await waitFor(() => expect(screen.getByText('Tools article').closest('li')?.hidden).toBe(true));
    window.history.replaceState(null, '', '/blog?category=devtools');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByText('Tools article').closest('li')?.hidden).toBe(false);
    expect(screen.getByText('Security article').closest('li')?.hidden).toBe(true);
  });
});
