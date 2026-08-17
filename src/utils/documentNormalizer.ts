import { v4 as uuidv4 } from 'uuid';
import { Document, EditorMode, FileType } from '@/types';
import { Slide, CanvasElement, PageSettings, PresentationSettings, SlideLayout, SlideTransition } from '@/engines/types';
import { PageEngine } from '@/engines/PageEngine';
import { PresentationEngine, PRESENTATION_THEMES } from '@/engines/PresentationEngine';
import { countWords, countChars } from '@/utils/cn';

/**
 * Sanitizes numeric dimensions to safe, positive, finite numbers.
 */
export function sanitizeNumber(value: unknown, fallback: number, min = 0, max = 100000): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Sanitizes and validates a single slide element
 */
export function normalizeCanvasElement(raw: any, index: number): CanvasElement {
  const id = (raw && typeof raw.id === 'string' && raw.id.trim()) || `el_${Date.now()}_${index}`;
  const type = ['text', 'shape', 'image', 'chart', 'diagram', 'table', 'code', 'qrcode', 'drawing', 'signature', 'equation'].includes(raw?.type)
    ? raw.type
    : 'text';

  const transform = {
    x: sanitizeNumber(raw?.transform?.x, 50, -5000, 5000),
    y: sanitizeNumber(raw?.transform?.y, 50, -5000, 5000),
    width: sanitizeNumber(raw?.transform?.width, 200, 10, 5000),
    height: sanitizeNumber(raw?.transform?.height, 100, 10, 5000),
    rotation: sanitizeNumber(raw?.transform?.rotation, 0, -360, 360),
  };

  const rawStyle = raw?.style && typeof raw.style === 'object' ? raw.style : {};
  const style = {
    ...rawStyle,
    fill: typeof rawStyle.fill === 'string' ? rawStyle.fill : 'transparent',
    stroke: typeof rawStyle.stroke === 'string' ? rawStyle.stroke : 'transparent',
    strokeWidth: sanitizeNumber(rawStyle.strokeWidth, 0, 0, 100),
    opacity: sanitizeNumber(rawStyle.opacity, 1, 0, 1),
    borderRadius: sanitizeNumber(rawStyle.borderRadius, 0, 0, 500),
    shadow: typeof rawStyle.shadow === 'object' ? rawStyle.shadow : undefined,
    fontSize: sanitizeNumber(rawStyle.fontSize, 16, 6, 300),
    fontFamily: typeof rawStyle.fontFamily === 'string' ? rawStyle.fontFamily : 'Inter',
    color: typeof rawStyle.color === 'string' ? rawStyle.color : '#0f172a',
    textAlign: ['left', 'center', 'right', 'justify'].includes(rawStyle.textAlign)
      ? rawStyle.textAlign
      : 'left',
    zIndex: sanitizeNumber(raw?.zIndex ?? rawStyle.zIndex, 1, 0, 1000),
  };

  return {
    id,
    type,
    transform,
    style,
    zIndex: sanitizeNumber(raw?.zIndex, 1, 0, 1000),
    content: typeof raw?.content === 'string' ? raw.content : '',
    locked: Boolean(raw?.locked),
    hidden: Boolean(raw?.hidden),
  };
}

/**
 * Sanitizes and validates a single slide
 */
export function normalizeSlide(raw: any, index: number): Slide {
  const id = (raw && typeof raw.id === 'string' && raw.id.trim()) || `slide_${Date.now()}_${index}`;
  const validLayouts: SlideLayout[] = [
    'blank', 'title', 'title-content', 'two-columns', 'image-text',
    'section-header', 'comparison', 'timeline', 'statistics', 'full-image',
    'quote', 'diagram', 'closing'
  ];
  const layout: SlideLayout = validLayouts.includes(raw?.layout) ? raw.layout : 'title-content';

  const elements: CanvasElement[] = Array.isArray(raw?.elements)
    ? raw.elements.map((el: any, elIdx: number) => normalizeCanvasElement(el, elIdx))
    : [];

  const transition: SlideTransition = ['none', 'fade', 'slide-left', 'slide-right', 'zoom'].includes(raw?.transition)
    ? raw.transition
    : 'fade';

  return {
    id,
    title: typeof raw?.title === 'string' ? raw.title : `Slide ${index + 1}`,
    layout,
    elements,
    speakerNotes: typeof raw?.speakerNotes === 'string' ? raw.speakerNotes : typeof raw?.notes === 'string' ? raw.notes : '',
    background: typeof raw?.background === 'string' ? raw.background : undefined,
    gradient: typeof raw?.gradient === 'string' ? raw.gradient : undefined,
    transition,
    hidden: Boolean(raw?.hidden),
  };
}

/**
 * Canonical normalizer for any raw document state.
 * Guarantees that any malformed, corrupted, or legacy document object
 * is transformed into a valid, safe, and fully functional Document object.
 */
export function normalizeDocument(raw: any): Document {
  if (!raw || typeof raw !== 'object') {
    const now = new Date().toISOString();
    return {
      id: uuidv4(),
      title: 'Untitled Document',
      content: '<p></p>',
      folderId: null,
      fileType: 'doc',
      isStarred: false,
      wordCount: 0,
      charCount: 0,
      paragraphCount: 1,
      pageCount: 1,
      tags: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      mode: 'document',
      pageSettings: PageEngine.createDefaultSettings(),
      slides: [
        PresentationEngine.createSlide('title', PRESENTATION_THEMES[0]),
        PresentationEngine.createSlide('title-content', PRESENTATION_THEMES[0]),
      ],
      activeSlideIndex: 0,
      presentationSettings: PresentationEngine.createDefaultSettings(),
      designElements: [],
      canvasWidth: 800,
      canvasHeight: 600,
      canvasBackground: '#FFFFFF',
    };
  }

  const now = new Date().toISOString();
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : uuidv4();
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim().slice(0, 300) : 'Untitled Document';
  const content = typeof raw.content === 'string' ? raw.content : '<p></p>';
  const mode: EditorMode = ['document', 'presentation', 'design'].includes(raw.mode) ? raw.mode : 'document';
  const fileType: FileType = ['doc', 'docx', 'pdf', 'md', 'txt', 'rtf', 'pptx', 'html', 'csv'].includes(raw.fileType)
    ? raw.fileType
    : mode === 'presentation' ? 'pptx' : 'doc';

  const slides: Slide[] = Array.isArray(raw.slides) && raw.slides.length > 0
    ? raw.slides.map((s: any, idx: number) => normalizeSlide(s, idx))
    : [
        PresentationEngine.createSlide('title', PRESENTATION_THEMES[0]),
        PresentationEngine.createSlide('title-content', PRESENTATION_THEMES[0]),
      ];

  const designElements: CanvasElement[] = Array.isArray(raw.designElements)
    ? raw.designElements.map((el: any, idx: number) => normalizeCanvasElement(el, idx))
    : [];

  const pageSettings: PageSettings = {
    ...PageEngine.createDefaultSettings(),
    ...(raw.pageSettings && typeof raw.pageSettings === 'object' ? raw.pageSettings : {}),
  };

  const presentationSettings: PresentationSettings = {
    ...PresentationEngine.createDefaultSettings(),
    ...(raw.presentationSettings && typeof raw.presentationSettings === 'object' ? raw.presentationSettings : {}),
  };

  return {
    id,
    title,
    content,
    folderId: typeof raw.folderId === 'string' ? raw.folderId : null,
    fileType,
    isStarred: Boolean(raw.isStarred),
    wordCount: sanitizeNumber(raw.wordCount, countWords(content), 0, 10000000),
    charCount: sanitizeNumber(raw.charCount, countChars(content), 0, 50000000),
    paragraphCount: sanitizeNumber(raw.paragraphCount, 1, 0, 1000000),
    pageCount: sanitizeNumber(raw.pageCount, 1, 1, 10000),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string' && t.trim()) : [],
    createdAt: typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' && raw.updatedAt ? raw.updatedAt : now,
    deletedAt: typeof raw.deletedAt === 'string' ? raw.deletedAt : null,

    mode,
    pageSettings,
    coverPageData: raw.coverPageData && typeof raw.coverPageData === 'object' ? raw.coverPageData : undefined,
    references: Array.isArray(raw.references) ? raw.references : [],
    figures: Array.isArray(raw.figures) ? raw.figures : [],

    slides,
    activeSlideIndex: sanitizeNumber(raw.activeSlideIndex, 0, 0, Math.max(0, slides.length - 1)),
    presentationSettings,

    designElements,
    canvasWidth: sanitizeNumber(raw.canvasWidth, 800, 100, 10000),
    canvasHeight: sanitizeNumber(raw.canvasHeight, 600, 100, 10000),
    canvasBackground: typeof raw.canvasBackground === 'string' ? raw.canvasBackground : '#FFFFFF',
  };
}
