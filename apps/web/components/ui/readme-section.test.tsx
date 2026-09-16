import { describe, expect, it } from 'vitest';
import { cleanReadmeHtml, renderReadmeHtml } from './readme-section';

describe('ReadmeSection transport', () => {
  it('keeps substantive markdown in sanitized server HTML', async () => {
    const html = await renderReadmeHtml('# Overview\n\nInstall with `npx demo`.\n\n```bash\nnpx demo\n```');
    expect(html).toContain('Overview');
    expect(html).toContain('Install with');
    expect(html).toContain('npx demo');
    expect(html).toContain('<pre');
  });

  it('removes unsafe protocols and raw script markup before HTML insertion', async () => {
    const html = await renderReadmeHtml('[unsafe](javascript:alert(1))\n\n<script>alert(1)</script>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('<script');
  });

  it('keeps safe README details markup while stripping unsafe raw markup', async () => {
    const html = await renderReadmeHtml('<details><summary>Install</summary>Use npx demo</details><script>alert(1)</script>');
    expect(html).toContain('<details>');
    expect(html).toContain('Use npx demo');
    expect(html).not.toContain('<script');
  });

  it('adds safe external-link attributes after sanitization', async () => {
    const html = await renderReadmeHtml('[docs](https://example.com/docs)');
    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('removes decorative GitHub markup before conversion', () => {
    expect(cleanReadmeHtml('<p align="center">badge</p>\n# Useful docs')).toBe('# Useful docs');
  });
  it('resolves safe relative links and images against the repository', async () => {
    const html = await renderReadmeHtml(
      '[guide](docs/guide.md)\n\n![logo](assets/logo.png)\n\n[parent](../CONTRIBUTING.md)\n\n![parent image](../assets/logo.png)',
      'https://github.com/acme/demo'
    );
    expect(html).toContain('href="https://github.com/acme/demo/blob/HEAD/docs/guide.md"');
    expect(html).toContain('src="https://raw.githubusercontent.com/acme/demo/HEAD/assets/logo.png"');
    expect(html).toContain('href="https://github.com/acme/demo/blob/HEAD/CONTRIBUTING.md"');
    expect(html).not.toContain('/blob/CONTRIBUTING.md');
    expect(html).not.toContain('/demo/assets/logo.png');
  });

});
