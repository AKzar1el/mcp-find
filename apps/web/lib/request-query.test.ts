import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { invalidDirectoryQuery, canonicalDirectoryApiQuery } from './request-query';

describe('bounded directory request input', () => {
  it('rejects ambiguous duplicate keys and oversized cache-busting payloads', () => {
    for (const query of ['q=a&q=b', 'page=0', 'page=101', 'page=1.5', `q=${'x'.repeat(121)}`, `nonce=${'x'.repeat(2049)}`]) {
      expect(invalidDirectoryQuery(new URLSearchParams(query))).toBe(true);
      for (const route of ['/servers', '/api/servers']) {
        const response = middleware(new NextRequest(`https://mcpfind.org${route}?${query}`));
        expect(response.status).toBe(400);
        expect(response.headers.get('cache-control')).toBe('no-store');
      }
    }
  });
  it('consolidates API cache variants while retaining every supported filter', () => {
    expect(canonicalDirectoryApiQuery(new URLSearchParams('sort=updated&q=calendar&nonce=123&lang=Python&status=deprecated&limit=30')))
      .toBe('lang=Python&limit=30&q=calendar&sort=updated&status=deprecated');
    const response = middleware(new NextRequest('https://mcpfind.org/api/servers?q=test&nonce=123'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://mcpfind.org/api/servers?q=test');
  });
  it('leaves humans and SEO/AI crawlers on public detail and blog pages unaffected', () => {
    for (const agent of ['Mozilla/5.0', 'Googlebot', 'bingbot', 'ClaudeBot', 'PerplexityBot', 'Amazonbot']) {
      expect(middleware(new NextRequest('https://mcpfind.org/servers', { headers: { 'user-agent': agent } })).status).toBe(200);
    }
  });
  it('retains a retryable burst ceiling for expensive searches', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1000000000000);
    const request = () => new NextRequest('https://mcpfind.org/api/servers?q=test', { headers: { 'x-forwarded-for': '192.0.2.123' } });
    for (let index = 0; index < 100; index++) expect(middleware(request()).status).toBe(200);
    expect(middleware(request()).status).toBe(429);
    clock.mockReturnValue(1000000060001);
    expect(middleware(request()).status).toBe(200);
    clock.mockRestore();
  });
});
