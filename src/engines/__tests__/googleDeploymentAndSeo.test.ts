import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Google Deployment, Production Headers & SEO Compliance', () => {
  it('should have valid robots.txt allowing public routes and disallowing private workspaces', () => {
    const robotsPath = path.resolve(__dirname, '../../../public/robots.txt');
    const robots = fs.readFileSync(robotsPath, 'utf8');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Allow: /document-editor');
    expect(robots).toContain('Allow: /presentation-maker');
    expect(robots).toContain('Allow: /flowchart-maker');
    expect(robots).toContain('Allow: /resume-builder');
    expect(robots).toContain('Disallow: /dashboard');
    expect(robots).toContain('Disallow: /editor/');
    expect(robots).toContain('Sitemap: https://docflow.app/sitemap.xml');
  });

  it('should have valid sitemap.xml with canonical public routes', () => {
    const sitemapPath = path.resolve(__dirname, '../../../public/sitemap.xml');
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');

    expect(sitemap).toContain('https://docflow.app/');
    expect(sitemap).toContain('https://docflow.app/document-editor');
    expect(sitemap).toContain('https://docflow.app/presentation-maker');
    expect(sitemap).toContain('https://docflow.app/flowchart-maker');
    expect(sitemap).toContain('https://docflow.app/resume-builder');
    expect(sitemap).not.toContain('/dashboard');
    expect(sitemap).not.toContain('/editor/');
  });

  it('should have a compliant llms.txt file with H1 and public URL directory', () => {
    const llmsPath = path.resolve(__dirname, '../../../public/llms.txt');
    const llms = fs.readFileSync(llmsPath, 'utf8');

    expect(llms.startsWith('# DocProEditor')).toBe(true);
    expect(llms).toContain('## Core Features');
    expect(llms).toContain('## Important Public URLs');
    expect(llms).toContain('https://docflow.app/document-editor');
    expect(llms).toContain('https://docflow.app/presentation-maker');
  });

  it('should have structured data JSON-LD and optimized fonts in index.html', () => {
    const indexPath = path.resolve(__dirname, '../../../index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type": "WebApplication"');
    expect(html).toContain('"name": "DocProEditor"');
    expect(html).toContain('display=swap');
    expect(html).toContain('viewport-fit=cover');
  });

  it('should contain robust production security headers and caching in vercel.json', () => {
    const vercelPath = path.resolve(__dirname, '../../../vercel.json');
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

    expect(vercel.rewrites).toBeDefined();
    expect(vercel.rewrites[0].destination).toBe('/index.html');

    const headers = vercel.headers[0].headers;
    const headerKeys = headers.map((h: { key: string }) => h.key);

    expect(headerKeys).toContain('Content-Security-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
  });
});
