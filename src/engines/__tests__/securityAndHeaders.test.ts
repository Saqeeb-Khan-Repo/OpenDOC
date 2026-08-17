import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Vercel Configuration Tests', () => {
  it('should have valid vercel.json with SPA rewrites and security headers', () => {
    const vercelPath = path.resolve(__dirname, '../../../vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);

    const raw = fs.readFileSync(vercelPath, 'utf8');
    const config = JSON.parse(raw);

    // Verify SPA catch-all rewrite to /index.html
    expect(config.rewrites).toBeDefined();
    const catchAllRewrite = config.rewrites.find((r: any) => r.destination === '/index.html');
    expect(catchAllRewrite).toBeDefined();

    // Verify Security Headers
    expect(config.headers).toBeDefined();
    const globalHeaders = config.headers.find((h: any) => h.source === '/(.*)');
    expect(globalHeaders).toBeDefined();

    const headerKeys = globalHeaders.headers.map((h: any) => h.key);
    expect(headerKeys).toContain('Content-Security-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Referrer-Policy');
  });

  it('should verify index.html contains non-blocking stylesheet configuration', () => {
    const indexPath = path.resolve(__dirname, '../../../index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const html = fs.readFileSync(indexPath, 'utf8');
    // Ensure font preconnect exists
    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
    // Ensure KaTeX is loaded asynchronously without blocking first paint
    expect(html).toContain('rel="preload"');
  });
});
