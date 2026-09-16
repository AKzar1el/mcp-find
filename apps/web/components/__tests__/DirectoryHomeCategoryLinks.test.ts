/**
 * The homepage category cards are a server-rendered discovery surface. Filter
 * URLs are intentionally robots-disallowed, so they must never be the target
 * of these navigational links; category hubs are the canonical crawlable path.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('homepage category discovery links', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../directory-home.tsx'), 'utf8');

  it('links Browse by Category cards to canonical category hubs, not filtered directory URLs', () => {
    expect(source).toContain('href={`/categories/${cat}`}');
    expect(source).not.toContain('href={`/servers?category=');
  });
});
