// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { getAllPosts } from './blog';

describe('getAllPosts', () => {
  it('continues returning a noindex post for normal retrieval', () => {
    const post = getAllPosts().find(({ slug }) => slug === 'mcp-server-monitoring-production');

    expect(post).toMatchObject({
      slug: 'mcp-server-monitoring-production',
      frontmatter: { noindex: true },
    });
  });
});
