import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  CATEGORY_PAGE_SIZE,
  categoryPagePath,
  getCategoryPageWindow,
  parseCategoryPage,
} from './category-pagination';

describe('category hub pagination', () => {
  const componentSource = fs.readFileSync(path.resolve(__dirname, '../components/category-directory.tsx'), 'utf8');
  it('renders real server-side previous and next links for crawler discovery', () => {
    expect(componentSource).toContain('<Link');
    expect(componentSource).toContain('href={categoryPagePath(category, previousPage)}');
    expect(componentSource).toContain('href={categoryPagePath(category, nextPage)}');
  });

  it('keeps page one at the canonical category path and gives later pages stable paths', () => {
    expect(categoryPagePath('devtools', 1)).toBe('/categories/devtools');
    expect(categoryPagePath('devtools', 2)).toBe('/categories/devtools/page/2');
  });

  it('splits a large category into bounded server-rendered windows', () => {
    expect(getCategoryPageWindow(CATEGORY_PAGE_SIZE * 2 + 1, 2)).toEqual({
      page: 2,
      totalPages: 3,
      start: CATEGORY_PAGE_SIZE,
      end: CATEGORY_PAGE_SIZE * 2,
    });
  });

  it('keeps a small category on one page and rejects impossible pages', () => {
    expect(getCategoryPageWindow(3, 1)).toEqual({ page: 1, totalPages: 1, start: 0, end: 3 });
    expect(getCategoryPageWindow(3, 2)).toBeNull();
    expect(getCategoryPageWindow(3, 0)).toBeNull();
    expect(getCategoryPageWindow(3, Number.MAX_SAFE_INTEGER + 1)).toBeNull();
  });

  it('accepts only a canonical positive path page number after page one', () => {
    expect(parseCategoryPage('2')).toBe(2);
    expect(parseCategoryPage('01')).toBeNull();
    expect(parseCategoryPage('1')).toBeNull();
    expect(parseCategoryPage('0')).toBeNull();
    expect(parseCategoryPage('-2')).toBeNull();
    expect(parseCategoryPage('2.5')).toBeNull();
  });
});
