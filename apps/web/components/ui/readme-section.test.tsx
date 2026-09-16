import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReadmeSection, cleanReadmeHtml } from './readme-section';

describe('ReadmeSection', () => {
  it('keeps substantive markdown in server-rendered HTML without client fetching', () => {
    const html = renderToStaticMarkup(
      <ReadmeSection
        readmeContent={'# Overview\n\nInstall with `npx demo`.\n\n```bash\nnpx demo\n```'}
        githubUrl="https://github.com/acme/demo"
      />
    );
    expect(html).toContain('Overview');
    expect(html).toContain('Install with');
    expect(html).toContain('npx demo');
    expect(html).toContain('Copy');
    expect(html).not.toContain('api.github.com');
  });

  it('does not render unsafe README links', () => {
    const html = renderToStaticMarkup(
      <ReadmeSection readmeContent={'[unsafe](javascript:alert(1))'} githubUrl={null} />
    );
    expect(html).not.toContain('javascript:');
  });

  it('keeps a safe maintainer link when no stored README is available', () => {
    const html = renderToStaticMarkup(
      <ReadmeSection readmeContent={null} githubUrl="https://github.com/acme/demo" />
    );
    expect(html).toContain('This MCP has no overview available.');
    expect(html).toContain('https://github.com/acme/demo');
  });

  it('removes decorative GitHub markup before static rendering', () => {
    const cleaned = cleanReadmeHtml('<p align="center">badge</p>\n# Useful docs');
    expect(cleaned).toBe('# Useful docs');
  });
});
