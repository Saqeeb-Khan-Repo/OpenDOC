import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ResumeData, ResumeEngine, ResumePageSettings, ResumePageSize, ResumeOrientation,
  DEFAULT_PAGE_SETTINGS
} from './ResumeEngine';

export interface ResumeExportOptions {
  html: string;
  title?: string;
  paperSize?: ResumePageSize;
  orientation?: ResumeOrientation;
  pageSettings?: ResumePageSettings;
  pageRange?: string; // e.g. 'all' | 'current' | '1-2' | '1,3-5' | '2'
  currentPage?: number;
  quality?: 'standard' | 'high';
  clickableLinks?: boolean;
}

export class ResumeExportEngine {
  /**
   * Helper: Parse page range string into array of 1-based page indices
   * Supports: 'all', 'current', '1', '1-2', '1,3-5', '2-4,7'
   */
  static parsePageRange(rangeStr?: string, totalPages: number = 1, currentPage: number = 1): number[] {
    if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (rangeStr.trim().toLowerCase() === 'current') {
      return [Math.max(1, Math.min(totalPages, currentPage))];
    }

    const pages = new Set<number>();
    const tokens = rangeStr.split(',').map(t => t.trim()).filter(Boolean);

    tokens.forEach(token => {
      if (token.includes('-')) {
        const [startStr, endStr] = token.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(startStr) && !isNaN(endStr)) {
          const start = Math.max(1, Math.min(startStr, endStr));
          const end = Math.min(totalPages, Math.max(startStr, endStr));
          for (let p = start; p <= end; p++) {
            pages.add(p);
          }
        }
      } else {
        const pageNum = parseInt(token, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    });

    const result = Array.from(pages).sort((a, b) => a - b);
    return result.length > 0 ? result : [1];
  }

  /**
   * Helper: Get physical page dimensions in mm
   */
  static getPageDimensionsMm(
    paperSize: ResumePageSize = 'A4',
    customWidth?: number,
    customHeight?: number,
    unit: string = 'mm',
    orientation: ResumeOrientation = 'portrait'
  ): { widthMm: number; heightMm: number } {
    let width = 210;
    let height = 297;

    switch (paperSize) {
      case 'Letter':
        width = 215.9; height = 279.4; break;
      case 'Legal':
        width = 215.9; height = 355.6; break;
      case 'Executive':
        width = 184.1; height = 266.7; break;
      case 'A3':
        width = 297; height = 420; break;
      case 'A5':
        width = 148; height = 210; break;
      case 'Custom':
        if (customWidth && customHeight) {
          // Convert unit to mm
          const factor = unit === 'cm' ? 10 : unit === 'in' ? 25.4 : unit === 'px' ? 0.264583 : 1;
          width = customWidth * factor;
          height = customHeight * factor;
        }
        break;
      case 'A4':
      default:
        width = 210; height = 297; break;
    }

    if (orientation === 'landscape') {
      return { widthMm: Math.max(width, height), heightMm: Math.min(width, height) };
    }
    return { widthMm: Math.min(width, height), heightMm: Math.max(width, height) };
  }

  /**
   * Generates an isolated HTML document string containing ONLY the resume.
   */
  static getIsolatedPrintHtml(options: ResumeExportOptions): string {
    const ps = options.pageSettings || DEFAULT_PAGE_SETTINGS;
    const paperSize = options.paperSize || ps.pageSize || 'A4';
    const orientation = options.orientation || ps.orientation || 'portrait';
    const docTitle = options.title || 'Resume';

    const { widthMm, heightMm } = this.getPageDimensionsMm(
      paperSize, ps.customWidth, ps.customHeight, ps.unit, orientation
    );

    let contentHtml = options.html;
    if (options.clickableLinks === false) {
      contentHtml = contentHtml.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: ${widthMm}mm ${heightMm}mm ${orientation};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a;
      width: 100%;
      height: auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .resume-export-wrapper {
      width: 100%;
      max-width: ${widthMm}mm;
      min-height: ${heightMm}mm;
      margin: 0 auto;
      background: #ffffff !important;
      position: relative;
    }
    .resume-document {
      width: 100% !important;
      max-width: ${widthMm}mm !important;
      box-sizing: border-box !important;
      box-shadow: none !important;
      border: none !important;
      background: #ffffff !important;
    }
    a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .page-break-avoid,
    [style*="page-break-inside: avoid"],
    [style*="break-inside: avoid"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    h1, h2, h3,
    [style*="page-break-after: avoid"],
    [style*="break-after: avoid"] {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
  </style>
</head>
<body>
  <div class="resume-export-wrapper">
    ${contentHtml}
  </div>
</body>
</html>`;
  }

  /**
   * DIRECT PDF GENERATION & DOWNLOAD.
   * Completely avoids window.print() and the browser print dialog.
   * Generates a true PDF containing ONLY the selected resume pages.
   */
  static async exportToPdf(options: ResumeExportOptions): Promise<boolean> {
    const ps = options.pageSettings || DEFAULT_PAGE_SETTINGS;
    const paperSize = options.paperSize || ps.pageSize || 'A4';
    const orientation = options.orientation || ps.orientation || 'portrait';
    const rawTitle = (options.title || 'Resume').replace(/\.pdf$/i, '');
    const cleanFileName = `${rawTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Resume'}.pdf`;

    const { widthMm, heightMm } = this.getPageDimensionsMm(
      paperSize, ps.customWidth, ps.customHeight, ps.unit, orientation
    );

    // Pixel container width at 96 DPI
    const containerWidthPx = Math.round((widthMm / 25.4) * 96);
    const containerMinHeightPx = Math.round((heightMm / 25.4) * 96);

    // 1. Create a dedicated off-screen isolated container for the resume ONLY
    const exportContainer = document.createElement('div');
    exportContainer.id = 'resume-pdf-export';
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-99999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = `${containerWidthPx}px`;
    exportContainer.style.minHeight = `${containerMinHeightPx}px`;
    exportContainer.style.background = '#ffffff';
    exportContainer.style.color = '#0f172a';
    exportContainer.style.zIndex = '-99999';
    exportContainer.style.boxSizing = 'border-box';
    exportContainer.style.overflow = 'visible';

    let contentHtml = options.html;
    if (options.clickableLinks === false) {
      contentHtml = contentHtml.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
    }

    exportContainer.innerHTML = `
      <div class="resume-export-wrapper" style="width: 100%; max-width: ${containerWidthPx}px; margin: 0 auto; background: #ffffff; box-sizing: border-box;">
        ${contentHtml}
      </div>
    `;

    document.body.appendChild(exportContainer);

    try {
      // 2. Wait for fonts and images to load completely
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 200));

      // 3. Render container to high-resolution canvas (Print quality)
      const scale = options.quality === 'high' ? 2.5 : 2.0;
      const canvas = await (html2canvas as any)(exportContainer, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: containerWidthPx,
      });

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // Exact pixel height of a single page on this canvas
      const pageHeightPx = (imgWidthPx * heightMm) / widthMm;

      // Calculate total natural pages
      const totalNaturalPages = Math.max(1, Math.ceil(imgHeightPx / pageHeightPx));
      const targetPages = this.parsePageRange(options.pageRange, totalNaturalPages, options.currentPage || 1);

      // 4. Initialize jsPDF with exact dimensions & orientation
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthMm, heightMm],
      });

      let addedPageCount = 0;

      for (let pageNum = 1; pageNum <= totalNaturalPages; pageNum++) {
        // Only include pages requested by user in pageRange
        if (targetPages.includes(pageNum)) {
          if (addedPageCount > 0) {
            pdf.addPage([widthMm, heightMm], orientation === 'landscape' ? 'landscape' : 'portrait');
          }

          const positionYPx = (pageNum - 1) * pageHeightPx;
          const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - positionYPx);

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidthPx;
          pageCanvas.height = pageHeightPx;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0, positionYPx, imgWidthPx, sliceHeightPx,
              0, 0, imgWidthPx, sliceHeightPx
            );
          }

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, widthMm, heightMm);
          addedPageCount++;
        }
      }

      // 5. Download the PDF directly (No Print Dialog!)
      pdf.save(cleanFileName);
      return true;
    } catch (err) {
      console.error('Direct PDF export error', err);
      return false;
    } finally {
      // 6. Clean up isolated DOM container
      if (exportContainer.parentNode) {
        exportContainer.parentNode.removeChild(exportContainer);
      }
    }
  }

  /**
   * Render purely ATS-Optimized HTML format for direct ATS parsers
   */
  static getAtsExportHtml(data: ResumeData, paperSize: ResumePageSize = 'A4'): string {
    const atsDesign = {
      headerLayout: 'minimal' as const,
      fontFamily: 'Arial',
      typographyPreset: 'normal' as const,
      nameSize: 24,
      headingSize: 12,
      bodySize: 10.5,
      metadataSize: 9.5,
      lineHeight: 1.4,
      letterSpacing: 'normal',
      textAlign: 'left' as const,
      palette: 'minimal-black',
      colors: {
        primary: '#000000',
        accent: '#111111',
        heading: '#000000',
        body: '#222222',
        muted: '#555555',
        link: '#000000',
        border: '#cccccc',
        background: '#ffffff',
      },
      spacingPreset: 'balanced' as const,
      spacing: {
        pageMargin: 24,
        sectionGap: 14,
        entryGap: 10,
        paragraphGap: 3,
        lineHeight: 1.4,
      },
      paperSize: (paperSize === 'Letter' ? 'Letter' : 'A4') as 'A4' | 'Letter',
      skillsStyle: 'categories' as const,
      bulletStyle: 'dot' as const,
      headingStyle: 'underline' as const,
      projectStyle: 'standard' as const,
      educationStyle: 'classic' as const,
    };

    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_ats_classic', atsDesign);
    return this.getIsolatedPrintHtml({
      html: renderedHtml,
      title: `${(data.personalInfo?.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume`,
      paperSize,
      clickableLinks: true,
      quality: 'high',
    });
  }
}
