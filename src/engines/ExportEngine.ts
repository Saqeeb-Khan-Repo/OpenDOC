import { StudioDocument } from './types';
import { ImageAssetEngine } from './ImageAssetEngine';

export class ExportEngine {
  /**
   * Export Document / Tables as Excel Spreadsheet (.xlsx / XML Spreadsheet)
   */
  static exportExcel(doc: StudioDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content || '';

    const tables = temp.querySelectorAll('table');
    let rowsXml = '';

    if (tables.length > 0) {
      // Extract from DOM tables
      tables.forEach((table, tableIdx) => {
        const trs = table.querySelectorAll('tr');
        trs.forEach(tr => {
          rowsXml += '<Row>';
          const cells = tr.querySelectorAll('th, td');
          cells.forEach(cell => {
            const val = (cell.textContent || '').trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const isHeader = cell.tagName.toLowerCase() === 'th';
            rowsXml += `<Cell ss:StyleID="${isHeader ? 'HeaderStyle' : 'NormalStyle'}"><Data ss:Type="String">${val}</Data></Cell>`;
          });
          rowsXml += '</Row>';
        });
        rowsXml += '<Row><Cell><Data ss:Type="String"></Data></Cell></Row>';
      });
    } else {
      // Extract headings & paragraphs into rows
      rowsXml += `<Row><Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${doc.title || 'Document'}</Data></Cell></Row>`;
      const paragraphs = temp.querySelectorAll('h1, h2, h3, h4, p, li');
      paragraphs.forEach(p => {
        const text = (p.textContent || '').trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (text) {
          const isH = p.tagName.toLowerCase().startsWith('h');
          rowsXml += `<Row><Cell ss:StyleID="${isH ? 'HeaderStyle' : 'NormalStyle'}"><Data ss:Type="String">${text}</Data></Cell></Row>`;
        }
      });
    }

    const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
   </Borders>
  </Style>
  <Style ss:ID="NormalStyle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sheet1">
  <Table ss:DefaultColumnWidth="120">
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    this.downloadFile(`${doc.title || 'export'}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', excelXml);
  }

  /**
   * Export Document / Tables as CSV (.csv)
   */
  static exportCsv(doc: StudioDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content || '';
    const tables = temp.querySelectorAll('table');
    let csvLines: string[] = [];

    if (tables.length > 0) {
      tables.forEach(table => {
        const trs = table.querySelectorAll('tr');
        trs.forEach(tr => {
          const cells = tr.querySelectorAll('th, td');
          const rowVals: string[] = [];
          cells.forEach(cell => {
            const raw = (cell.textContent || '').trim().replace(/"/g, '""');
            rowVals.push(`"${raw}"`);
          });
          csvLines.push(rowVals.join(','));
        });
        csvLines.push('');
      });
    } else {
      csvLines.push(`"Title","${(doc.title || '').replace(/"/g, '""')}"`);
      csvLines.push(`"Mode","${doc.mode || 'document'}"`);
      csvLines.push(`"Words","${doc.wordCount || 0}"`);
      csvLines.push(`"Updated","${doc.updatedAt || ''}"`);
      csvLines.push('');
      csvLines.push('"Section","Content"');
      const paragraphs = temp.querySelectorAll('h1, h2, h3, h4, p, li');
      paragraphs.forEach((p, idx) => {
        const text = (p.textContent || '').trim().replace(/"/g, '""');
        if (text) {
          csvLines.push(`"${p.tagName.toUpperCase()} ${idx + 1}","${text}"`);
        }
      });
    }

    const csvContent = '\ufeff' + csvLines.join('\r\n'); // UTF-8 BOM for Excel compatibility
    this.downloadFile(`${doc.title || 'export'}.csv`, 'text/csv', csvContent);
  }

  /**
   * Export Presentation / Slides as PowerPoint PPTX presentation file
   */
  static exportPptx(doc: StudioDocument): void {
    const slides = doc.slides && doc.slides.length > 0 ? doc.slides : [
      {
        id: 's1',
        title: doc.title,
        elements: [],
        speakerNotes: '',
        layout: 'title' as const,
        background: '#FFFFFF',
      }
    ];

    // Generate clean HTML5 Presentation bundle that can be opened and presented in any browser / exported to PPT
    const presentationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.title || 'Presentation'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      padding: 40px 20px;
    }
    .slide-page {
      width: 960px;
      height: 540px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      box-sizing: border-box;
      padding: 40px;
    }
    .slide-header {
      font-size: 28px;
      font-weight: bold;
      color: #1e3a8a;
      margin-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .slide-notes {
      width: 960px;
      color: #94a3b8;
      font-size: 13px;
      margin-top: -15px;
      margin-bottom: 20px;
      font-style: italic;
    }
    @media print {
      body { background: transparent; padding: 0; gap: 0; }
      .slide-page { box-shadow: none; border-radius: 0; width: 100vw; height: 100vh; }
      .slide-notes { display: none; }
    }
  </style>
</head>
<body>
  ${slides.map((s, idx) => `
    <div class="slide-page" style="background: ${s.gradient || s.background || '#ffffff'};">
      <div class="slide-header">${s.title || `Slide ${idx + 1}`}</div>
      <div class="slide-content">
        ${s.elements.map(el => `<div style="position: absolute; left: ${(el.transform.x / 960) * 100}%; top: ${(el.transform.y / 540) * 100}%; width: ${(el.transform.width / 960) * 100}%; height: ${(el.transform.height / 540) * 100}%;">${el.content || ''}</div>`).join('')}
      </div>
    </div>
    ${s.speakerNotes ? `<div class="slide-notes">Speaker Notes: ${s.speakerNotes}</div>` : ''}
  `).join('')}
</body>
</html>`;

    this.downloadFile(`${doc.title || 'presentation'}.pptx.html`, 'text/html', presentationHtml);
  }

  /**
   * Export Document as standard HTML file
   */
  static exportHtml(doc: StudioDocument): void {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1, h2, h3, h4 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1.5em 0; padding-left: 16px; color: #475569; font-style: italic; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    img { max-width: 100%; border-radius: 8px; }
  </style>
</head>
<body>
  ${doc.content || '<p></p>'}
</body>
</html>`;

    this.downloadFile(`${doc.title || 'document'}.html`, 'text/html', htmlContent);
  }

  /**
   * Export Document as Markdown
   */
  static exportMarkdown(doc: StudioDocument): void {
    let md = `# ${doc.title}\n\n`;
    const temp = document.createElement('div');
    temp.innerHTML = doc.content || '';

    const convertNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes).map(convertNode).join('');

      switch (tag) {
        case 'h1': return `\n# ${children}\n\n`;
        case 'h2': return `\n## ${children}\n\n`;
        case 'h3': return `\n### ${children}\n\n`;
        case 'h4': return `\n#### ${children}\n\n`;
        case 'p': return `\n${children}\n\n`;
        case 'strong':
        case 'b': return `**${children}**`;
        case 'em':
        case 'i': return `*${children}*`;
        case 'u': return `_${children}_`;
        case 's':
        case 'strike': return `~~${children}~~`;
        case 'code': return `\`${children}\``;
        case 'pre': return `\n\`\`\`\n${el.textContent}\n\`\`\`\n\n`;
        case 'blockquote': return `\n> ${children.trim()}\n\n`;
        case 'li': return `- ${children}\n`;
        case 'ul': return `\n${children}\n`;
        case 'ol': return `\n${children}\n`;
        case 'hr': return `\n---\n\n`;
        case 'a': return `[${children}](${el.getAttribute('href') || ''})`;
        case 'img': return `![${el.getAttribute('alt') || 'Image'}](${el.getAttribute('src') || ''})`;
        default: return children;
      }
    };

    md += Array.from(temp.childNodes).map(convertNode).join('');
    this.downloadFile(`${doc.title || 'document'}.md`, 'text/markdown', md.trim());
  }

  /**
   * Export Document as Plain Text
   */
  static exportPlainText(doc: StudioDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content || '';
    const text = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n${temp.innerText || temp.textContent || ''}`;
    this.downloadFile(`${doc.title || 'document'}.txt`, 'text/plain', text);
  }

  /**
   * Export Document as Microsoft Word compatible DOCX / XML document
   */
  static exportDocx(doc: StudioDocument): void {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${doc.title}</title>
  <style>
    @page {
      size: 21.0cm 29.7cm;
      margin: 2.54cm 2.54cm 2.54cm 2.54cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
    }
    h1 { font-size: 18pt; font-weight: bold; color: #1e3a8a; }
    h2 { font-size: 14pt; font-weight: bold; color: #1e3a8a; }
    h3 { font-size: 12pt; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
    th, td { border: 1pt solid #999; padding: 6pt; text-align: left; }
    th { background-color: #f3f4f6; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${doc.title}</h1>
  ${doc.content || ''}
</body>
</html>`;

    const blob = new Blob(['\ufeff', header], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title || 'document'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export Document as Rich Text Format (RTF)
   */
  static exportRtf(doc: StudioDocument): void {
    const temp = document.createElement('div');
    temp.innerHTML = doc.content || '';
    const plainText = temp.innerText || '';
    const rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 {\\b ${doc.title}}\\par\\par ${plainText.replace(/\n/g, '\\par ')} }`;
    this.downloadFile(`${doc.title || 'document'}.rtf`, 'application/rtf', rtf);
  }

  /**
   * Export complete OpenDoc Studio JSON project file
   */
  static exportOpenDocProject(doc: StudioDocument): void {
    const data = JSON.stringify(doc, null, 2);
    this.downloadFile(`${doc.title || 'project'}.opendoc`, 'application/json', data);
  }

  /**
   * High-fidelity Browser Print / PDF generation
   */
  static async printDocument(doc: StudioDocument): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const resolvedContent = await ImageAssetEngine.resolveHtmlImages(doc.content || '');
    const { pageSettings } = doc;
    const isLandscape = pageSettings?.orientation === 'landscape';
    const margins = pageSettings?.margins || { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: ${pageSettings?.size || 'A4'} ${isLandscape ? 'landscape' : 'portrait'};
              margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            h1, h2, h3, h4 { color: #0f172a; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; page-break-inside: avoid; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
            th { background: #f8fafc !important; }
            img { max-width: 100% !important; height: auto !important; page-break-inside: avoid !important; break-inside: avoid !important; display: block; margin: 12px auto; }
            blockquote { border-left: 4px solid #3b82f6; padding-left: 12px; font-style: italic; }
            pre, code { font-family: monospace; background: #f1f5f9 !important; }
            pre { padding: 12px; border-radius: 6px; }
            .header-text { text-align: right; font-size: 9pt; color: #64748b; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .footer-text { text-align: center; font-size: 9pt; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
          </style>
        </head>
        <body>
          ${pageSettings?.headerText ? `<div class="header-text">${pageSettings.headerText}</div>` : ''}
          ${resolvedContent}
          ${pageSettings?.footerText ? `<div class="footer-text">${pageSettings.footerText}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  }

  private static downloadFile(filename: string, mimeType: string, content: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }
}
