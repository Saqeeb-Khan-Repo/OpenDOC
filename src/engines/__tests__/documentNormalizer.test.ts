import { describe, it, expect } from 'vitest';
import { normalizeDocument, normalizeSlide, normalizeCanvasElement, sanitizeNumber } from '../../utils/documentNormalizer';

describe('Document Normalizer & Schema Validation', () => {
  it('should normalize null/undefined input into a valid Document with default fields', () => {
    const doc = normalizeDocument(null);
    expect(doc).toBeDefined();
    expect(doc.id).toBeDefined();
    expect(doc.title).toBe('Untitled Document');
    expect(doc.content).toBe('<p></p>');
    expect(doc.mode).toBe('document');
    expect(doc.wordCount).toBe(0);
    expect(doc.charCount).toBe(0);
    expect(doc.pageCount).toBe(1);
    expect(doc.slides).toBeDefined();
    expect(doc.slides?.length).toBeGreaterThanOrEqual(1);
  });

  it('should sanitize NaN and Infinity in dimensions and coordinates', () => {
    expect(sanitizeNumber(NaN, 100)).toBe(100);
    expect(sanitizeNumber(Infinity, 100)).toBe(100);
    expect(sanitizeNumber(-Infinity, 0)).toBe(0);
    expect(sanitizeNumber(-50, 10, 0, 500)).toBe(0);
    expect(sanitizeNumber(999999, 10, 0, 500)).toBe(500);
    expect(sanitizeNumber(42, 10)).toBe(42);
  });

  it('should normalize a malformed canvas element safely', () => {
    const rawElement = {
      id: '',
      type: 'invalid_type',
      transform: {
        x: NaN,
        y: 'not-a-number',
        width: -200,
        height: Infinity,
      },
      style: {
        fontSize: 'huge',
        opacity: 5,
      },
    };

    const element = normalizeCanvasElement(rawElement, 0);
    expect(element.id).toBeDefined();
    expect(element.type).toBe('text');
    expect(element.transform.x).toBe(50);
    expect(element.transform.width).toBe(10); // clamped to min width
    expect(element.transform.height).toBe(100); // fallback applied for Infinity
    expect(element.style.opacity).toBe(1); // clamped between 0 and 1
    expect(element.style.fontSize).toBe(16); // fallback
  });

  it('should normalize slides with missing elements array', () => {
    const rawSlide = {
      title: 'Slide With Missing Elements',
      layout: 'unknown_layout',
      elements: null,
    };

    const slide = normalizeSlide(rawSlide, 0);
    expect(slide.title).toBe('Slide With Missing Elements');
    expect(slide.layout).toBe('title-content'); // fallback to title-content
    expect(Array.isArray(slide.elements)).toBe(true);
    expect(slide.elements.length).toBe(0);
  });

  it('should handle corrupt document data with malformed slide elements', () => {
    const corruptDoc = {
      id: 'doc_123',
      title: '   Trimmed Title   ',
      mode: 'presentation',
      slides: [
        {
          id: 's1',
          layout: 'title',
          elements: [
            { id: 'e1', type: 'text', transform: { x: NaN, y: 10, width: 200, height: 100 } },
          ],
        },
      ],
      canvasWidth: NaN,
    };

    const doc = normalizeDocument(corruptDoc);
    expect(doc.id).toBe('doc_123');
    expect(doc.title).toBe('Trimmed Title');
    expect(doc.mode).toBe('presentation');
    expect(doc.slides).toBeDefined();
    expect(doc.slides![0].elements[0].transform.x).toBe(50);
    expect(doc.canvasWidth).toBe(800);
  });
});
