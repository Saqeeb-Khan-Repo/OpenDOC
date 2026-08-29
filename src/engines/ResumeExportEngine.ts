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
   * Generates a fully self-contained, isolated HTML document containing ONLY the A4/Letter resume.
   * Completely decoupled from the editor UI, toolbars, sidebars, zoom containers, or backgrounds.
   */
  static getIsolatedPrintHtml(options: ResumeExportOptions): string {
    const paperSize = options.paperSize || 'A4';
    const isLetter = paperSize === 'Letter';
    const pageWidth = isLetter ? '8.5in' : '210mm';
    const pageMinHeight = isLetter ? '11in' : '297mm';
    const docTitle = options.title || 'Resume';

    let contentHtml = options.html;
    if (options.clickableLinks === false) {
      // Strip anchor tags to plain text if user opted out
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
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
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
    /* Page Break Rules for Clean Multi-page Resumes */
    .page-break-avoid, [style*="page-break-inside: avoid"], [style*="break-inside: avoid"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    h1, h2, h3, [style*="page-break-after: avoid"], [style*="break-after: avoid"] {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    @media print {
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .resume-export-wrapper {
        box-shadow: none !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
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
   * Executes pristine isolated PDF download/print.
   * Spawns a sandboxed hidden iframe with ONLY the resume content, guaranteeing 0% editor UI leakage.
   */
  static exportToPdf(options: ResumeExportOptions): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const printHtml = this.getIsolatedPrintHtml(options);

        // Remove any stale print iframes
        const existing = document.getElementById('docpro-resume-export-frame');
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'docpro-resume-export-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '-9999';

        document.body.appendChild(iframe);

        const frameDoc = iframe.contentWindow?.document;
        if (!frameDoc) {
          console.error('Failed to access print iframe document');
          resolve(false);
          return;
        }

        frameDoc.open();
        frameDoc.write(printHtml);
        frameDoc.close();

        // Wait briefly for fonts and layouts to settle inside iframe
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            resolve(true);
          } catch (e) {
            console.error('Print iframe execution failed', e);
            resolve(false);
          } finally {
            // Clean up iframe after a safety timeout
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }, 3000);
          }
        }, 350);
      } catch (err) {
        console.error('Error during isolated resume export', err);
        resolve(false);
      }
    });
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
      title: `${data.personalInfo?.name || 'Candidate'}_ATS_Resume`,
      paperSize,
      clickableLinks: true,
      quality: 'high',
    });
  }
}
