import { StudioDocument, EditorMode, CanvasElement, Slide, PageSettings, ReferenceItem, FigureItem, CoverPageData } from './types';
import { PageEngine } from './PageEngine';
import { PresentationEngine, PRESENTATION_THEMES } from './PresentationEngine';
import { ElementEngine } from './ElementEngine';
import { LocalStorageEngine } from './LocalStorageEngine';

export class EditorCore {
  /**
   * Factory to create an empty or initialized StudioDocument
   */
  static createNewDocument(mode: EditorMode = 'document', title = 'Untitled Document'): StudioDocument {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
    const now = new Date().toISOString();

    const base: StudioDocument = {
      id,
      title,
      mode,
      folderId: null,
      isStarred: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,

      // Document mode
      content: '<h1>' + title + '</h1><p>Start writing your document...</p>',
      pageSettings: PageEngine.createDefaultSettings(),
      references: [],
      figures: [],

      // Presentation mode
      slides: [
        PresentationEngine.createSlide('title', PRESENTATION_THEMES[0]),
        PresentationEngine.createSlide('title-content', PRESENTATION_THEMES[0]),
      ],
      activeSlideIndex: 0,
      presentationSettings: PresentationEngine.createDefaultSettings(),

      // Visual Design mode
      designElements: [
        ElementEngine.createElement('text', {
          transform: { x: 50, y: 50, width: 400, height: 80, rotation: 0 },
          content: '<h1 style="font-size: 28px; font-weight: bold; color: #1e3a8a;">Visual Canvas</h1>',
        }),
      ],
      canvasWidth: 800,
      canvasHeight: 600,
      canvasBackground: '#FFFFFF',

      // Statistics
      wordCount: 0,
      charCount: 0,
      paragraphCount: 0,
      pageCount: 1,
    };

    return base;
  }

  /**
   * Count words, chars, and paragraphs from HTML text
   */
  static calculateStats(html: string): { words: number; chars: number; paragraphs: number; pages: number; readTimeMin: number } {
    if (!html) return { words: 0, chars: 0, paragraphs: 0, pages: 1, readTimeMin: 0 };

    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.innerText || temp.textContent || '';

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const paragraphs = temp.querySelectorAll('p, h1, h2, h3, h4, li').length || 1;
    const pages = Math.max(1, Math.ceil(words / 350));
    const readTimeMin = Math.max(1, Math.ceil(words / 200));

    return { words, chars, paragraphs, pages, readTimeMin };
  }
}
