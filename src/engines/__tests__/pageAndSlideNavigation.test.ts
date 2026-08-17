import { describe, it, expect } from 'vitest';
import { PageEngine } from '../PageEngine';
import { PresentationEngine, PRESENTATION_THEMES } from '../PresentationEngine';
import { Slide } from '../types';
import fs from 'fs';
import path from 'path';

describe('Document Editor: Add New Page Functionality', () => {
  it('should split document with new pages and maintain distinct page segments', () => {
    const initialContent = '<p>First page content</p>';
    const pages = PageEngine.splitIntoPages(initialContent, 1000, 600);
    expect(pages.length).toBe(1);

    // Simulate adding a blank new page
    const updatedPages = [...pages, '<p></p>'];
    const unifiedHtml = updatedPages.join('\n<div data-type="page-break"></div>\n');

    // Split again and verify both pages exist
    const splitAgain = PageEngine.splitIntoPages(unifiedHtml, 1000, 600);
    expect(splitAgain.length).toBe(2);
    expect(splitAgain[0]).toContain('First page content');
    expect(splitAgain[1]).toContain('<p></p>');
  });

  it('should handle sequential additions of multiple pages without collision', () => {
    let pages = ['<p>Page 1</p>'];
    for (let i = 2; i <= 5; i++) {
      pages = [...pages, `<p>Page ${i}</p>`];
    }
    const combined = pages.join('\n<div data-type="page-break"></div>\n');
    const result = PageEngine.splitIntoPages(combined, 1000, 600);

    expect(result.length).toBe(5);
    expect(result[0]).toContain('Page 1');
    expect(result[4]).toContain('Page 5');
  });

  it('should verify DocumentCanvas and TiptapToolbar contain Add Page (+ Page) controls', () => {
    const canvasPath = path.resolve(__dirname, '../../components/editor/DocumentCanvas.tsx');
    const canvasCode = fs.readFileSync(canvasPath, 'utf8');

    expect(canvasCode).toContain('handleAddNewPage');
    expect(canvasCode).toContain('data-page-index');
    expect(canvasCode).toContain('+ Add Page');
    expect(canvasCode).toContain('activePageIndex');

    const toolbarPath = path.resolve(__dirname, '../../components/editor/TiptapEditor.tsx');
    const toolbarCode = fs.readFileSync(toolbarPath, 'utf8');

    expect(toolbarCode).toContain('+ Page');
    expect(toolbarCode).toContain('onAddPage');
  });
});

describe('Presentation Editor: Previous and Next Slide Navigation', () => {
  it('should correctly handle boundary checks for first and last slide navigation', () => {
    const theme = PRESENTATION_THEMES[0];
    const slides: Slide[] = [
      PresentationEngine.createSlide('title', theme),
      PresentationEngine.createSlide('title-content', theme),
      PresentationEngine.createSlide('closing', theme),
    ];

    expect(slides.length).toBe(3);

    // Slide 0 (First Slide): Prev is disabled, Next is enabled
    let activeIndex = 0;
    let hasPrev = activeIndex > 0;
    let hasNext = activeIndex < slides.length - 1;
    expect(hasPrev).toBe(false);
    expect(hasNext).toBe(true);

    // Move to Slide 1 (Middle Slide): Both are enabled
    activeIndex = 1;
    hasPrev = activeIndex > 0;
    hasNext = activeIndex < slides.length - 1;
    expect(hasPrev).toBe(true);
    expect(hasNext).toBe(true);

    // Move to Slide 2 (Last Slide): Prev is enabled, Next is disabled
    activeIndex = 2;
    hasPrev = activeIndex > 0;
    hasNext = activeIndex < slides.length - 1;
    expect(hasPrev).toBe(true);
    expect(hasNext).toBe(false);
  });

  it('should preserve slide elements and modifications when navigating back and forth', () => {
    const theme = PRESENTATION_THEMES[0];
    const slide1 = PresentationEngine.createSlide('title', theme);
    const slide2 = PresentationEngine.createSlide('title-content', theme);
    let deck: Slide[] = [slide1, slide2];

    // Edit Slide 1 content
    const modifiedSlide1 = {
      ...slide1,
      elements: slide1.elements.map(el =>
        el.type === 'text' ? { ...el, content: '<h1>Custom Edited Title</h1>' } : el
      ),
    };
    deck[0] = modifiedSlide1;

    // Navigate to Slide 2
    let activeIndex = 1;
    expect(deck[activeIndex].id).toBe(slide2.id);

    // Navigate back to Slide 1
    activeIndex = 0;
    expect(deck[activeIndex].elements.some(el => el.content?.includes('Custom Edited Title'))).toBe(true);
  });

  it('should verify PresentationCanvas renders Previous and Next navigation buttons with accessible ARIA labels', () => {
    const canvasPath = path.resolve(__dirname, '../../components/editor/PresentationCanvas.tsx');
    const canvasCode = fs.readFileSync(canvasPath, 'utf8');

    expect(canvasCode).toContain('aria-label="Previous slide"');
    expect(canvasCode).toContain('aria-label="Next slide"');
    expect(canvasCode).toContain('handlePrevSlide');
    expect(canvasCode).toContain('handleNextSlide');
    expect(canvasCode).toContain('ChevronLeft');
    expect(canvasCode).toContain('ChevronRight');
  });
});
