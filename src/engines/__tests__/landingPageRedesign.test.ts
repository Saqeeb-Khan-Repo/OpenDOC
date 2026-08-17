import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Landing Page Redesign & SaaS Design System', () => {
  const landingPagePath = path.resolve(__dirname, '../../pages/LandingPage.tsx');
  const landingPageCode = fs.readFileSync(landingPagePath, 'utf8');

  it('should NOT contain any Sign In, Login, or Register action buttons on the public landing page', () => {
    expect(landingPageCode).not.toContain('Sign In');
    expect(landingPageCode).not.toContain('Log In');
    expect(landingPageCode).not.toContain('Register');
    expect(landingPageCode).not.toContain('>Sign Up</');
  });

  it('should contain the official product name DocProEditor and primary CTA "Start Creating Free"', () => {
    expect(landingPageCode).toContain('DocProEditor');
    expect(landingPageCode).toContain('Start Creating Free');
    expect(landingPageCode).toContain('Explore Templates');
    expect(landingPageCode).toContain('All-in-One Workspace');
  });

  it('should show 3 simple benefits without fake claims', () => {
    expect(landingPageCode).toContain('No Sign Up Required');
    expect(landingPageCode).toContain('Fast &amp; Simple');
    expect(landingPageCode).toContain('Works Anywhere');
    expect(landingPageCode).not.toContain('Trusted by Google');
    expect(landingPageCode).not.toContain('Trusted by Microsoft');
  });

  it('should render all 5 core tool cards with descriptive copy and launch links', () => {
    expect(landingPageCode).toContain('Document Editor');
    expect(landingPageCode).toContain('Presentation Maker');
    expect(landingPageCode).toContain('Flowchart Studio');
    expect(landingPageCode).toContain('PDF Tools');
    expect(landingPageCode).toContain('Resume Builder');
    expect(landingPageCode).toContain('Everything You Need to Get Work Done');
  });

  it('should include the 3-step "How It Works" section and "One Workspace. Less Switching."', () => {
    expect(landingPageCode).toContain('How It Works');
    expect(landingPageCode).toContain('Choose a tool');
    expect(landingPageCode).toContain('Create and edit');
    expect(landingPageCode).toContain('Export or share');
    expect(landingPageCode).toContain('One Workspace.');
    expect(landingPageCode).toContain('Less Switching.');
  });

  it('should have removed global KaTeX from index.html and loaded it dynamically inside DocumentCanvas', () => {
    const indexPath = path.resolve(__dirname, '../../../index.html');
    const indexCode = fs.readFileSync(indexPath, 'utf8');

    // Index.html should not preload KaTeX
    expect(indexCode).not.toContain('katex.min.css');

    // DocumentCanvas should dynamically load KaTeX
    const canvasPath = path.resolve(__dirname, '../../components/editor/DocumentCanvas.tsx');
    const canvasCode = fs.readFileSync(canvasPath, 'utf8');
    expect(canvasCode).toContain('katex-css-loader');
    expect(canvasCode).toContain('katex.min.css');
  });

  it('should have refined dark theme variables in index.css for modern deep navy surfaces', () => {
    const cssPath = path.resolve(__dirname, '../../index.css');
    const cssCode = fs.readFileSync(cssPath, 'utf8');

    expect(cssCode).toContain('--background: 220 50% 6%'); // #080D18
    expect(cssCode).toContain('--card: 218 43% 12%'); // #111A2B
  });
});
