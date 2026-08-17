import { PageMargin, PageNumberFormat, PageOrientation, PageSize, PageSettings, TOCItem, FigureItem } from './types';

export const PAGE_DIMENSIONS_MM: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Executive: { width: 184.1, height: 266.7 },
  Custom: { width: 210, height: 297 },
};

export const MM_TO_PX = 3.7795275591; // 96 DPI

export class PageEngine {
  /**
   * Returns page width and height in pixels based on size, orientation, and zoom
   */
  static getPagePixelDimensions(
    size: PageSize,
    orientation: PageOrientation,
    zoom = 100
  ): { width: number; height: number } {
    const base = PAGE_DIMENSIONS_MM[size] || PAGE_DIMENSIONS_MM.A4;
    const widthMm = orientation === 'portrait' ? base.width : base.height;
    const heightMm = orientation === 'portrait' ? base.height : base.width;

    const scale = zoom / 100;
    return {
      width: Math.round(widthMm * MM_TO_PX * scale),
      height: Math.round(heightMm * MM_TO_PX * scale),
    };
  }

  /**
   * Formats a page number into Arabic, Roman, or Alphabetic
   */
  static formatPageNumber(pageNumber: number, format: PageNumberFormat, totalPages = 1): string {
    if (pageNumber <= 0) return '';

    switch (format) {
      case 'roman':
        return this.toRoman(pageNumber);
      case 'roman-lower':
        return this.toRoman(pageNumber).toLowerCase();
      case 'alpha':
        return this.toAlpha(pageNumber);
      case 'alpha-lower':
        return this.toAlpha(pageNumber).toLowerCase();
      case 'page-x-of-y':
        return `Page ${pageNumber} of ${totalPages}`;
      case 'arabic':
      default:
        return `${pageNumber}`;
    }
  }

  private static toRoman(num: number): string {
    const lookup: Record<string, number> = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };
    let roman = '';
    for (const i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman || 'I';
  }

  private static toAlpha(num: number): string {
    let s = '';
    let t = num;
    while (t > 0) {
      const m = (t - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      t = Math.floor((t - m) / 26);
    }
    return s || 'A';
  }

  /**
   * Parse headings (H1 - H4) from HTML content to generate Table of Contents
   */
  static extractHeadingsFromHtml(html: string): TOCItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4');

    const items: TOCItem[] = [];
    headingElements.forEach((el, index) => {
      const tag = el.tagName.toLowerCase();
      const level = parseInt(tag.replace('h', ''), 10) as 1 | 2 | 3 | 4;
      const text = el.textContent?.trim() || `Heading ${index + 1}`;
      items.push({
        id: `heading-${index + 1}`,
        level,
        text,
        pageNumber: Math.max(1, Math.floor((index + 2) / 2)), // estimated paginated location
      });
    });

    return items;
  }

  /**
   * Parse figures and tables from HTML content
   */
  static extractFiguresFromHtml(html: string): FigureItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const items: FigureItem[] = [];

    // Find images with captions or alt texts
    const images = doc.querySelectorAll('img');
    images.forEach((img, idx) => {
      const caption = img.getAttribute('alt') || img.getAttribute('title') || `Figure ${idx + 1}`;
      items.push({
        id: `fig-${idx + 1}`,
        number: idx + 1,
        caption,
        pageNumber: idx + 1,
        type: 'figure',
      });
    });

    // Find tables
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, idx) => {
      const captionEl = table.querySelector('caption');
      const caption = captionEl?.textContent?.trim() || `Table ${idx + 1}: Data Matrix`;
      items.push({
        id: `tbl-${idx + 1}`,
        number: idx + 1,
        caption,
        pageNumber: idx + 2,
        type: 'table',
      });
    });

    return items;
  }

  /**
   * Split unified HTML document content into discrete, non-overlapping page HTML segments
   */
  static splitIntoPages(htmlContent: string, usableHeightPx = 800, printableWidthPx = 600): string[] {
    if (!htmlContent || !htmlContent.trim()) {
      return ['<p></p>'];
    }

    if (typeof DOMParser === 'undefined') {
      const parts = htmlContent.split(/<div\s+data-type="page-break"[^>]*><\/div>|<div\s+class="page-break"[^>]*><\/div>/i);
      return parts.map(p => p.trim() || '<p></p>');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
    const root = doc.body.firstElementChild;
    if (!root) return ['<p></p>'];

    const pages: string[] = [];
    let currentPageNodes: Node[] = [];
    let estimatedCurrentHeight = 0;

    const flushPage = () => {
      if (currentPageNodes.length > 0) {
        const temp = document.createElement('div');
        currentPageNodes.forEach(node => temp.appendChild(node.cloneNode(true)));
        pages.push(temp.innerHTML.trim());
        currentPageNodes = [];
        estimatedCurrentHeight = 0;
      }
    };

    // Helper to estimate height of an element
    const estimateNodeHeight = (node: Node): number => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        return Math.max(24, Math.ceil(text.length / 75) * 24);
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return 0;

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'hr' || el.classList.contains('page-break-node') || el.getAttribute('data-type') === 'page-break') {
        return -1; // Explicit Page break marker
      }

      if (tag === 'h1') return 56;
      if (tag === 'h2') return 44;
      if (tag === 'h3') return 36;
      if (tag === 'h4') return 28;
      if (tag === 'table') {
        const rows = el.querySelectorAll('tr').length || 3;
        return rows * 36 + 24;
      }
      if (tag === 'pre') return Math.max(60, (el.textContent?.split('\n').length || 3) * 22 + 32);
      if (tag === 'img') return 260;
      if (tag === 'blockquote') return 60;
      if (tag === 'ul' || tag === 'ol') {
        const items = el.querySelectorAll('li').length || 3;
        return items * 28 + 16;
      }

      // Standard paragraph / block
      const text = el.textContent || '';
      const lines = Math.max(1, Math.ceil(text.length / 75));
      return lines * 26 + 16;
    };

    Array.from(root.childNodes).forEach(node => {
      const h = estimateNodeHeight(node);

      if (h === -1) {
        // Explicit Page Break encountered
        flushPage();
        return;
      }

      if (estimatedCurrentHeight + h > usableHeightPx && currentPageNodes.length > 0) {
        // Usable height limit reached, cleanly break to next page
        flushPage();
      }

      currentPageNodes.push(node);
      estimatedCurrentHeight += h;
    });

    flushPage();

    return pages.length > 0 ? pages : ['<p></p>'];
  }

  /**
   * Default Page Settings Factory
   */
  static createDefaultSettings(): PageSettings {
    return {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 }, // Standard 1 inch (25.4mm)
      columns: 1,
      headerText: 'OpenDoc Studio — Project Report',
      footerText: 'Confidential & Proprietary',
      differentFirstPage: true,
      differentOddEven: false,
      showPageNumbers: true,
      pageNumberFormat: 'arabic',
      pageNumberPosition: 'bottom-center',
      startPageNumberAt: 1,
      hideNumberOnCover: true,
      backgroundColor: '#ffffff',
      showRulers: true,
      showGrid: false,
      snapToGrid: false,
      zoom: 100,
      pageAlignment: 'center',
      textDirection: 'ltr',
      showMarginGuides: true,
      border: {
        enabled: false,
        style: 'solid',
        width: 2,
        color: '#1e3a8a',
        inset: 16,
        applyTo: 'all',
      },
    };
  }
}
