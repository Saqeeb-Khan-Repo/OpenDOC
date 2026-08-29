import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, ResumeEngine } from './ResumeEngine';

export interface ResumeExportOptions {
  html: string;
  title?: string;
  paperSize?: 'A4' | 'Letter';
  quality?: 'standard' | 'high';
  clickableLinks?: boolean;
}

export class ResumeExportEngine {
  /**
   * Generates an isolated HTML document string containing ONLY the resume.
   * Useful for text/markup inspection, test validation, and headless renderers.
   */
  static getIsolatedPrintHtml(options: ResumeExportOptions): string {
    const paperSize = options.paperSize || 'A4';
    const isLetter = paperSize === 'Letter';
    const pageWidth = isLetter ? '215.9mm' : '210mm';
    const pageMinHeight = isLetter ? '279.4mm' : '297mm';
    const docTitle = options.title || 'Resume';

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
      size: ${isLetter ? 'letter' : 'A4'} portrait;
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
      max-width: ${pageWidth};
      min-height: ${pageMinHeight};
      margin: 0 auto;
      background: #ffffff !important;
      position: relative;
    }
    .resume-document {
      width: 100% !important;
      max-width: ${pageWidth} !important;
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
   * Generates a true A4 / Letter PDF containing ONLY the resume.
   */
  static async exportToPdf(options: ResumeExportOptions): Promise<boolean> {
    const paperSize = options.paperSize || 'A4';
    const isLetter = paperSize === 'Letter';
    const rawTitle = (options.title || 'Resume').replace(/\.pdf$/i, '');
    const cleanFileName = `${rawTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Resume'}.pdf`;

    // 1. Create a dedicated off-screen isolated container for the resume ONLY
    const exportContainer = document.createElement('div');
    exportContainer.id = 'resume-pdf-export';
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-99999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = isLetter ? '816px' : '794px';
    exportContainer.style.minHeight = isLetter ? '1056px' : '1123px';
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
      <div class="resume-export-wrapper" style="width: 100%; max-width: ${isLetter ? '816px' : '794px'}; margin: 0 auto; background: #ffffff; box-sizing: border-box;">
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

      // 3. Render container to high-resolution canvas (Retina/Print quality)
      const scale = options.quality === 'high' ? 2.5 : 2.0;
      const canvas = await (html2canvas as any)(exportContainer, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: isLetter ? 816 : 794,
      });

      // 4. Initialize jsPDF in A4/Letter portrait mode
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isLetter ? 'letter' : 'a4',
      });

      const pdfPageWidth = isLetter ? 215.9 : 210;
      const pdfPageHeight = isLetter ? 279.4 : 297;

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      // Exact pixel height of a single A4 page on this canvas
      const pageHeightPx = (imgWidthPx * pdfPageHeight) / pdfPageWidth;

      let remainingHeightPx = imgHeightPx;
      let positionYPx = 0;
      let pageIndex = 0;

      while (remainingHeightPx > 0) {
        if (pageIndex > 0) {
          pdf.addPage(isLetter ? 'letter' : 'a4', 'portrait');
        }

        // Slice canvas for clean multi-page resumes
        const sliceHeightPx = Math.min(remainingHeightPx, pageHeightPx);
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
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight);

        remainingHeightPx -= sliceHeightPx;
        positionYPx += sliceHeightPx;
        pageIndex++;
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
  static getAtsExportHtml(data: ResumeData, paperSize: 'A4' | 'Letter' = 'A4'): string {
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
      paperSize,
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
