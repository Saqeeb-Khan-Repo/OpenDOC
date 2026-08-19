import { describe, it, expect } from 'vitest';
import { DiagramEngine, DIAGRAM_THEMES } from '../DiagramEngine';
import { PresentationEngine, PRESENTATION_THEMES } from '../PresentationEngine';
import { ElementEngine } from '../ElementEngine';
import { DiagramData, DiagramNode, Slide, CanvasElement } from '../types';

describe('Flowchart History and Document Persistence Verification', () => {
  it('should initialize flowchart with a clean diagram and history stack', () => {
    const defaultDiagram = DiagramEngine.createDefaultFlowchart();
    expect(defaultDiagram.nodes.length).toBeGreaterThan(0);
    expect(defaultDiagram.connectors.length).toBeGreaterThan(0);

    const history: DiagramData[] = [defaultDiagram];
    let historyIndex = 0;

    expect(history.length).toBe(1);
    expect(historyIndex).toBe(0);
  });

  it('should properly push states, advance historyIndex, and invalidate redo branch', () => {
    const stateA = DiagramEngine.createDefaultFlowchart();
    let history: DiagramData[] = [stateA];
    let historyIndex = 0;

    const push = (next: DiagramData) => {
      const upToCurrent = history.slice(0, historyIndex + 1);
      history = [...upToCurrent, next];
      historyIndex = history.length - 1;
    };

    // State B: Add node
    const stateB: DiagramData = {
      ...stateA,
      nodes: [
        ...stateA.nodes,
        {
          id: 'node_b',
          type: 'process',
          text: 'Process Step B',
          x: 200,
          y: 200,
          width: 150,
          height: 54,
        },
      ],
    };
    push(stateB);
    expect(history.length).toBe(2);
    expect(historyIndex).toBe(1);

    // State C: Move node
    const stateC: DiagramData = {
      ...stateB,
      nodes: stateB.nodes.map(n => n.id === 'node_b' ? { ...n, x: 350, y: 350 } : n),
    };
    push(stateC);
    expect(history.length).toBe(3);
    expect(historyIndex).toBe(2);

    // Undo to State B
    historyIndex = historyIndex - 1;
    expect(historyIndex).toBe(1);
    expect(history[historyIndex].nodes.find(n => n.id === 'node_b')?.x).toBe(200);

    // Undo to State A
    historyIndex = historyIndex - 1;
    expect(historyIndex).toBe(0);
    expect(history[historyIndex].nodes.find(n => n.id === 'node_b')).toBeUndefined();

    // Redo to State B
    historyIndex = historyIndex + 1;
    expect(historyIndex).toBe(1);
    expect(history[historyIndex].nodes.find(n => n.id === 'node_b')?.x).toBe(200);

    // Make new modification (State D) following Undo -> Invalidates State C
    const stateD: DiagramData = {
      ...history[historyIndex],
      nodes: [
        ...history[historyIndex].nodes,
        {
          id: 'node_d',
          type: 'decision',
          text: 'Condition D?',
          x: 500,
          y: 500,
          width: 140,
          height: 70,
        },
      ],
    };
    push(stateD);

    // History is now A -> B -> D (State C is removed)
    expect(history.length).toBe(3);
    expect(historyIndex).toBe(2);
    expect(history[2].nodes.find(n => n.id === 'node_d')).toBeDefined();
    expect(history[2].nodes.find(n => n.id === 'node_b')?.x).toBe(200); // not 350 from C
  });

  it('should serialize and restore flowchart document state and history accurately', () => {
    const originalDiagram = DiagramEngine.createDefaultFlowchart();
    const historyStack = [
      originalDiagram,
      {
        ...originalDiagram,
        nodes: [...originalDiagram.nodes, { id: 'n2', type: 'end' as const, text: 'Complete', x: 400, y: 400, width: 140, height: 60 }],
      },
    ];

    const persistedState = {
      id: 'flowchart-main',
      title: 'Sprint 24 Architecture',
      diagram: historyStack[1],
      selectedThemeId: 'dark-neon',
      viewport: { x: 50, y: 50, zoom: 0.9 },
      history: historyStack,
      historyIndex: 1,
      updatedAt: new Date().toISOString(),
    };

    const serialized = JSON.stringify(persistedState);
    const restored = JSON.parse(serialized);

    expect(restored.title).toBe('Sprint 24 Architecture');
    expect(restored.selectedThemeId).toBe('dark-neon');
    expect(restored.history.length).toBe(2);
    expect(restored.historyIndex).toBe(1);
    expect(restored.diagram.nodes.length).toBe(originalDiagram.nodes.length + 1);
  });
});

describe('Presentation 30 Themes & Canva Layouts Verification', () => {
  it('should define 30 premium themes across 6 distinct categories', () => {
    expect(PRESENTATION_THEMES.length).toBe(30);

    const categories = ['professional', 'modern', 'creative', 'technology', 'premium', 'academic'];
    categories.forEach(cat => {
      const themesInCat = PRESENTATION_THEMES.filter(t => t.category === cat);
      expect(themesInCat.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should verify each theme contains all required visual styling tokens', () => {
    PRESENTATION_THEMES.forEach(theme => {
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.category).toBeDefined();
      expect(theme.headingFont).toBeDefined();
      expect(theme.bodyFont).toBeDefined();
      expect(theme.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}/);
      expect(theme.accentColor).toMatch(/^#[0-9A-Fa-f]{6}/);
      expect(theme.textColor).toBeDefined();
      expect(theme.backgroundColor).toBeDefined();
    });
  });

  it('should apply theme non-destructively preserving all text, positions, and custom edits', () => {
    const initialTheme = PRESENTATION_THEMES.find(t => t.id === 'modern-minimal')!;
    const slides: Slide[] = [
      PresentationEngine.createSlide('title', initialTheme, undefined, 'Q3 Strategy Roadmap'),
    ];

    const targetTheme = PRESENTATION_THEMES.find(t => t.id === 'black-gold')!;
    const styledSlides = PresentationEngine.applyThemeToSlides(slides, targetTheme);

    expect(styledSlides[0].elements.length).toBe(slides[0].elements.length);

    // Text content is preserved
    const textEl = styledSlides[0].elements.find(el => el.type === 'text');
    expect(textEl?.content).toContain('Q3 Strategy Roadmap');
    expect(textEl?.style?.fontFamily).toBe(targetTheme.headingFont);

    // Coordinates and transforms are preserved
    expect(styledSlides[0].elements[0].transform).toEqual(slides[0].elements[0].transform);
  });

  it('should create modern Canva-style layouts accurately', () => {
    const theme = PRESENTATION_THEMES[0];

    const splitSlide = PresentationEngine.createSlide('split-screen', theme, undefined, 'Split Screen Title');
    expect(splitSlide.elements.length).toBeGreaterThanOrEqual(2);

    const threeCardsSlide = PresentationEngine.createSlide('three-cards', theme, undefined, 'Three Pillars');
    expect(threeCardsSlide.elements.length).toBe(4);

    const processSlide = PresentationEngine.createSlide('process', theme, undefined, 'Workflow');
    expect(processSlide.elements.length).toBeGreaterThan(4);

    const quoteSlide = PresentationEngine.createSlide('quote', theme, undefined, 'Simplicity Quote');
    expect(quoteSlide.elements.length).toBe(1);

    const conclusionSlide = PresentationEngine.createSlide('conclusion', theme, undefined, 'Summary');
    expect(conclusionSlide.elements.length).toBe(2);
  });
});

describe('Font Size Engine & Single Source of Truth Bug Fix', () => {
  it('should update element style.fontSize and rewrite inner HTML inline font sizes', () => {
    const textEl = ElementEngine.createElement('text', {
      content: '<h1 style="font-size: 42px; font-weight: 800; color: #1e3a8a;">Title Text</h1><p style="font-size: 20px;">Subtitle</p>',
      style: { fontSize: 42 },
    });

    const updated = ElementEngine.updateElementFontSize(textEl, 64);
    expect(updated.style?.fontSize).toBe(64);
    expect(updated.content).toContain('font-size: 64px');
    expect(updated.content).not.toContain('font-size: 42px');
    expect(updated.content).not.toContain('font-size: 20px');
  });

  it('should read font size accurately via getElementFontSize', () => {
    const elWithStyle = ElementEngine.createElement('text', {
      content: 'Hello World',
      style: { fontSize: 36 },
    });
    expect(ElementEngine.getElementFontSize(elWithStyle)).toBe(36);

    const elWithInlineHtml = ElementEngine.createElement('text', {
      content: '<h2 style="font-size: 28px;">Hello</h2>',
    });
    expect(ElementEngine.getElementFontSize(elWithInlineHtml)).toBe(28);

    const emptyEl = ElementEngine.createElement('text', { content: 'Plain text' });
    expect(ElementEngine.getElementFontSize(emptyEl)).toBe(24);
  });

  it('should update multiple selected text elements simultaneously', () => {
    const el1 = ElementEngine.createElement('text', {
      id: 'el_1',
      content: '<h1 style="font-size: 24px;">Title</h1>',
      style: { fontSize: 24 },
    });
    const el2 = ElementEngine.createElement('text', {
      id: 'el_2',
      content: '<p style="font-size: 16px;">Body</p>',
      style: { fontSize: 16 },
    });
    const el3 = ElementEngine.createElement('shape', { id: 'el_3' });

    const elements: CanvasElement[] = [el1, el2, el3];
    const updated = ElementEngine.updateElementsFontSize(elements, ['el_1', 'el_2'], 48);

    expect(ElementEngine.getElementFontSize(updated[0])).toBe(48);
    expect(ElementEngine.getElementFontSize(updated[1])).toBe(48);
    expect(updated[2].id).toBe('el_3');
  });

  it('should clamp font sizes between 8px and 144px', () => {
    const textEl = ElementEngine.createElement('text', { content: 'Test' });

    const clampedMin = ElementEngine.updateElementFontSize(textEl, 2);
    expect(clampedMin.style?.fontSize).toBe(8);

    const clampedMax = ElementEngine.updateElementFontSize(textEl, 300);
    expect(clampedMax.style?.fontSize).toBe(144);

    const rounded = ElementEngine.updateElementFontSize(textEl, 37.4);
    expect(rounded.style?.fontSize).toBe(37);
  });

  it('should support font size changes through Undo/Redo history stack', () => {
    const theme = PRESENTATION_THEMES[0];
    const initialSlide = PresentationEngine.createSlide('title', theme);
    let history: Slide[][] = [[initialSlide]];
    let historyIndex = 0;

    const push = (next: Slide[]) => {
      history = [...history.slice(0, historyIndex + 1), next];
      historyIndex = history.length - 1;
    };

    // Step 1: Change to 36px
    const targetId = initialSlide.elements[0].id;
    const slide1Elements = ElementEngine.updateElementsFontSize(initialSlide.elements, [targetId], 36);
    push([{ ...initialSlide, elements: slide1Elements }]);
    expect(ElementEngine.getElementFontSize(history[historyIndex][0].elements[0])).toBe(36);

    // Step 2: Change to 48px
    const slide2Elements = ElementEngine.updateElementsFontSize(slide1Elements, [targetId], 48);
    push([{ ...initialSlide, elements: slide2Elements }]);
    expect(ElementEngine.getElementFontSize(history[historyIndex][0].elements[0])).toBe(48);

    // Step 3: Undo -> returns to 36px
    historyIndex -= 1;
    expect(ElementEngine.getElementFontSize(history[historyIndex][0].elements[0])).toBe(36);

    // Step 4: Undo -> returns to initial size
    historyIndex -= 1;
    expect(ElementEngine.getElementFontSize(history[historyIndex][0].elements[0])).toBe(ElementEngine.getElementFontSize(initialSlide.elements[0]));
  });
});
