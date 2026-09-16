import { describe, expect, it } from 'vitest';
import { metadata } from './not-found';

describe('not-found metadata', () => {
  it('is explicitly noindex, follows helpful links, and clears the homepage canonical', () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toEqual({ canonical: null });
  });
});
