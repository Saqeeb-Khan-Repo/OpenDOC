import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Mobile Scrolling & Root Entry Routing Verification', () => {
  it('should have proper viewport-fit=cover meta tag in index.html without zoom restrictions', () => {
    const indexPath = path.resolve(__dirname, '../../../index.html');
    const html = fs.readFileSync(indexPath, 'utf8');

    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width');
    expect(html).toContain('viewport-fit=cover');
    // Ensure no user zoom disabling attributes
    expect(html).not.toContain('user-scalable=no');
    expect(html).not.toContain('maximum-scale=1.0');
    expect(html).not.toContain('maximum-scale=1"');
  });

  it('should render LandingPage directly at root route / in App.tsx', () => {
    const appPath = path.resolve(__dirname, '../../App.tsx');
    const appCode = fs.readFileSync(appPath, 'utf8');

    expect(appCode).toContain('<Route path="/" element={<LandingPage />} />');
  });

  it('should use dynamic viewport height 100dvh and safe area insets in AppLayout', () => {
    const layoutPath = path.resolve(__dirname, '../../components/layout/AppLayout.tsx');
    const layoutCode = fs.readFileSync(layoutPath, 'utf8');

    expect(layoutCode).toContain('100dvh');
    expect(layoutCode).toContain('env(safe-area-inset-bottom');
    expect(layoutCode).toContain('touch-pan-y');
  });

  it('should support natural vertical scrolling and touch-pan-y in DocumentCanvas', () => {
    const canvasPath = path.resolve(__dirname, '../../components/editor/DocumentCanvas.tsx');
    const canvasCode = fs.readFileSync(canvasPath, 'utf8');

    expect(canvasCode).toContain('touch-pan-y');
    expect(canvasCode).toContain('overflow-y-auto');
    expect(canvasCode).toContain('safe-area-inset-bottom');
  });

  it('should restore body overflow state cleanly in MobileBottomSheet', () => {
    const sheetPath = path.resolve(__dirname, '../../components/editor/MobileBottomSheet.tsx');
    const sheetCode = fs.readFileSync(sheetPath, 'utf8');

    expect(sheetCode).toContain('prevOverflow');
    expect(sheetCode).toContain('document.body.style.overflow = prevOverflow');
  });
});
