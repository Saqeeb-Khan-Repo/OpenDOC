import { PDFDocument } from 'pdf-lib';
import { EditablePDFDocument, PDFDocumentPage, PDFTextBlock, PDFImageBlock, PageSettings, PageSize, PageOrientation } from './types';
import { PageEngine } from './PageEngine';

export interface PDFInspectionResult {
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  title?: string;
  author?: string;
  pageDimensions: string;
  orientation: PageOrientation;
  isScanned: boolean;
  pages: {
    pageNumber: number;
    width: number;
    height: number;
    isPortrait: boolean;
    textSnippet?: string;
  }[];
}

export interface PDFImportConversionResult {
  title: string;
  pageSettings: PageSettings;
  htmlContent: string;
  editablePdf: EditablePDFDocument;
  rawTextPreview: string;
  warnings: string[];
}

export class PDFImportEngine {
  /**
   * Quick inspection of PDF structure without full parsing
   */
  static async inspectPdf(file: File): Promise<PDFInspectionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const author = pdfDoc.getAuthor() || '';

    const pagesInfo: PDFInspectionResult['pages'] = [];
    let portraitCount = 0;

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const isPortrait = height >= width;
      if (isPortrait) portraitCount++;

      pagesInfo.push({
        pageNumber: i + 1,
        width: Math.round(width),
        height: Math.round(height),
        isPortrait,
      });
    }

    const firstPage = pagesInfo[0] || { width: 595, height: 842, isPortrait: true };
    const orientation: PageOrientation = portraitCount >= (pageCount / 2) ? 'portrait' : 'landscape';

    return {
      fileName: file.name,
      fileSizeBytes: file.size,
      pageCount,
      title,
      author,
      pageDimensions: `${firstPage.width} × ${firstPage.height} pt`,
      orientation,
      isScanned: false,
      pages: pagesInfo,
    };
  }

  /**
   * Parse PDF into structured pages with normalized coordinates
   */
  static async parsePdf(file: File): Promise<PDFImportConversionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    const rawTitle = pdfDoc.getTitle() || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const warnings: string[] = [];

    const pages: PDFDocumentPage[] = [];
    const allTextSegments: string[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const pageNumber = i + 1;

      // Extract text content streams
      const extractedLines = this.extractTextFromPageStream(page, arrayBuffer, i);
      allTextSegments.push(...extractedLines.map(l => l.text));

      // Build normalized text blocks
      const textBlocks: PDFTextBlock[] = [];
      const pageWidth = Math.round(width) || 595;
      const pageHeight = Math.round(height) || 842;

      // Group or format lines into coherent text blocks
      extractedLines.forEach((line, lineIdx) => {
        const isHeading = line.fontSize > 16 || line.isBold;
        textBlocks.push({
          id: `tb_${pageNumber}_${lineIdx + 1}`,
          text: line.text,
          x: Math.max(20, Math.min(pageWidth - 40, line.x || 40)),
          y: Math.max(30, Math.min(pageHeight - 30, line.y || (50 + lineIdx * 24))),
          width: Math.min(pageWidth - 60, Math.max(120, line.width || (line.text.length * (line.fontSize * 0.55)))),
          height: Math.max(20, Math.round(line.fontSize * 1.5)),
          fontSize: line.fontSize || 14,
          fontFamily: line.fontFamily || 'Inter, sans-serif',
          fontWeight: line.isBold ? 'bold' : 'normal',
          color: '#0f172a',
          alignment: line.alignment || 'left',
          isHeading,
        });
      });

      // Fallback if content stream parsing yielded no text
      if (textBlocks.length === 0) {
        textBlocks.push({
          id: `tb_${pageNumber}_empty`,
          text: `Page ${pageNumber} Content`,
          x: 40,
          y: 60,
          width: pageWidth - 80,
          height: 30,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#0f172a',
          alignment: 'left',
        });
      }

      pages.push({
        id: `pdf_page_${pageNumber}`,
        pageNumber,
        width: pageWidth,
        height: pageHeight,
        textBlocks,
        images: [],
      });
    }

    // Determine PageSettings based on first page dimensions
    const firstPage = pages[0];
    const isLandscape = firstPage && firstPage.width > firstPage.height;
    const pageSettings: PageSettings = {
      ...PageEngine.createDefaultSettings(),
      size: (firstPage && Math.abs(firstPage.width - 612) < 20) ? 'Letter' : 'A4',
      orientation: isLandscape ? 'landscape' : 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    };

    // Convert to semantic flowing HTML for rich document editor
    const htmlContent = this.convertPagesToHtml(pages);

    const editablePdf: EditablePDFDocument = {
      pages,
      activeBlockId: pages[0]?.textBlocks[0]?.id || null,
      selectedPageNumber: 1,
    };

    return {
      title: rawTitle,
      pageSettings,
      htmlContent,
      editablePdf,
      rawTextPreview: allTextSegments.slice(0, 30).join('\n'),
      warnings,
    };
  }

  /**
   * Convert structured PDF pages into clean, semantic HTML with page breaks
   */
  static convertPagesToHtml(pages: PDFDocumentPage[]): string {
    const pageHtmls: string[] = [];

    pages.forEach(page => {
      const elements: string[] = [];
      let currentParagraph: string[] = [];
      let inList = false;

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          elements.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
      };

      const closeList = () => {
        if (inList) {
          elements.push('</ul>');
          inList = false;
        }
      };

      page.textBlocks.forEach(block => {
        const text = this.escapeHtml(block.text.trim());
        if (!text) return;

        // 1. Heading check
        if (block.isHeading || block.fontSize >= 18) {
          flushParagraph();
          closeList();
          const tag = block.fontSize >= 22 ? 'h1' : block.fontSize >= 18 ? 'h2' : 'h3';
          elements.push(`<${tag}>${text}</${tag}>`);
          return;
        }

        // 2. Bullet list check
        const bulletMatch = text.match(/^[•*\-]\s+(.+)$/);
        const numberMatch = text.match(/^\d+[.)]\s+(.+)$/);

        if (bulletMatch || numberMatch) {
          flushParagraph();
          if (!inList) {
            elements.push('<ul class="list-disc pl-5">');
            inList = true;
          }
          elements.push(`<li>${bulletMatch ? bulletMatch[1] : numberMatch![1]}</li>`);
          return;
        }

        closeList();

        // 3. Regular paragraph flow
        if (block.fontSize < 18) {
          currentParagraph.push(text);
        }
      });

      flushParagraph();
      closeList();

      const bodyContent = elements.length > 0 ? elements.join('\n') : '<p></p>';
      pageHtmls.push(bodyContent);
    });

    // Join pages using the document engine's standard page break delimiter
    return pageHtmls.join('\n<div data-page-break="true" class="page-break-node"><hr class="page-break" /></div>\n');
  }

  /**
   * Helper to create a new editable PDF text block with default coordinates
   */
  static createNewTextBlock(x: number, y: number, text: string = 'Double click to edit'): PDFTextBlock {
    return {
      id: `tb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      width: 200,
      height: 36,
      text,
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#0f172a',
      fontWeight: 'normal',
      alignment: 'left',
    };
  }

  /**
   * Extract lines from PDF page stream with estimated font sizes and coordinates
   */
  private static extractTextFromPageStream(
    page: any,
    arrayBuffer: ArrayBuffer,
    pageIdx: number
  ): { text: string; x: number; y: number; width?: number; fontSize: number; isBold?: boolean; alignment?: 'left' | 'center' | 'right'; fontFamily?: string }[] {
    const lines: { text: string; x: number; y: number; width?: number; fontSize: number; isBold?: boolean; alignment?: 'left' | 'center' | 'right'; fontFamily?: string }[] = [];

    try {
      const { node } = page;
      const contents = node.Contents();
      if (contents) {
        const streamBytes = contents.asUint8Array ? contents.asUint8Array() : null;
        if (streamBytes) {
          const rawStream = new TextDecoder('utf-8').decode(streamBytes);
          // Parse Tj / TJ and positional operators: Tm, Td, TD, Tf
          const textMatches = rawStream.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g);
          if (textMatches && textMatches.length > 0) {
            let currentY = 50;
            textMatches.forEach((m, idx) => {
              const cleaned = m
                .replace(/^\(/, '').replace(/\)\s*Tj$/, '')
                .replace(/^\[/, '').replace(/\]\s*TJ$/, '')
                .replace(/\\([()\\])/g, '$1')
                .trim();

              if (cleaned.length > 0 && !/^[0-9\s.]+$/.test(cleaned)) {
                const isHeading = idx === 0 || (cleaned.length < 50 && cleaned === cleaned.toUpperCase() && cleaned.length > 4);
                const fontSize = isHeading ? 20 : 13;
                lines.push({
                  text: cleaned,
                  x: 40,
                  y: currentY,
                  fontSize,
                  isBold: isHeading,
                });
                currentY += fontSize * 1.6;
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn('Direct stream parsing fallback on page', pageIdx, err);
    }

    // Fallback if stream extraction found very little text: scan ASCII strings
    if (lines.length === 0) {
      const rawAscii = new TextDecoder('ascii', { fatal: false }).decode(arrayBuffer);
      const matches = rawAscii.match(/\(([^()]{4,150})\)\s*Tj/g);
      if (matches) {
        let currentY = 50;
        matches.slice(pageIdx * 15, (pageIdx + 1) * 15).forEach((m, idx) => {
          const clean = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim();
          if (clean && clean.length > 3) {
            const isHeading = idx === 0;
            const fontSize = isHeading ? 18 : 13;
            lines.push({
              text: clean,
              x: 40,
              y: currentY,
              fontSize,
              isBold: isHeading,
            });
            currentY += fontSize * 1.6;
          }
        });
      }
    }

    return lines;
  }

  // ── Coordinates & Element Manipulation Helpers ─────────────────────────────

  /**
   * Add a brand new text block to a specific page
   */
  static addTextBlockToPage(
    editablePdf: EditablePDFDocument,
    pageNumber: number,
    text: string,
    x: number,
    y: number,
    options?: Partial<PDFTextBlock>
  ): EditablePDFDocument {
    const pageIndex = editablePdf.pages.findIndex(p => p.pageNumber === pageNumber);
    if (pageIndex === -1) return editablePdf;

    const targetPage = editablePdf.pages[pageIndex];
    const newBlock: PDFTextBlock = {
      id: `tb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      x: Math.round(x),
      y: Math.round(y),
      width: options?.width || Math.max(120, text.length * 9),
      height: options?.height || 28,
      fontSize: options?.fontSize || 14,
      fontFamily: options?.fontFamily || 'Inter, sans-serif',
      fontWeight: options?.fontWeight || 'normal',
      color: options?.color || '#0f172a',
      alignment: options?.alignment || 'left',
      ...options,
    };

    const updatedPages = [...editablePdf.pages];
    updatedPages[pageIndex] = {
      ...targetPage,
      textBlocks: [...targetPage.textBlocks, newBlock],
    };

    return {
      ...editablePdf,
      pages: updatedPages,
      activeBlockId: newBlock.id,
    };
  }

  /**
   * Update properties of an existing text block
   */
  static updateTextBlock(
    editablePdf: EditablePDFDocument,
    blockId: string,
    patch: Partial<PDFTextBlock>
  ): EditablePDFDocument {
    const updatedPages = editablePdf.pages.map(page => {
      const blockIdx = page.textBlocks.findIndex(b => b.id === blockId);
      if (blockIdx === -1) return page;

      const nextBlocks = [...page.textBlocks];
      nextBlocks[blockIdx] = {
        ...nextBlocks[blockIdx],
        ...patch,
      };

      return {
        ...page,
        textBlocks: nextBlocks,
      };
    });

    return {
      ...editablePdf,
      pages: updatedPages,
    };
  }

  /**
   * Delete a text block from the document
   */
  static deleteTextBlock(
    editablePdf: EditablePDFDocument,
    blockId: string
  ): EditablePDFDocument {
    const updatedPages = editablePdf.pages.map(page => ({
      ...page,
      textBlocks: page.textBlocks.filter(b => b.id !== blockId),
    }));

    return {
      ...editablePdf,
      pages: updatedPages,
      activeBlockId: editablePdf.activeBlockId === blockId ? null : editablePdf.activeBlockId,
    };
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
