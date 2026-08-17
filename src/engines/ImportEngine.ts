import JSZip from 'jszip';
import { StudioDocument, PageSettings } from './types';
import { PageEngine } from './PageEngine';
import { OCREngine } from './OCREngine';

export interface ImportResult {
  title: string;
  content: string;
  fileType: string;
  pageSettings?: Partial<PageSettings>;
  parsedDoc?: Partial<StudioDocument>;
}

export class ImportEngine {
  /**
   * Parse uploaded file to HTML and document metadata
   */
  static async parseFile(file: File): Promise<ImportResult> {
    const filename = file.name;
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    // 1. DOCX Import (Zip XML Unpack & Semantic Extraction)
    if (ext === 'docx') {
      try {
        const content = await this.parseDocx(file);
        return {
          title,
          content,
          fileType: 'docx',
          pageSettings: PageEngine.createDefaultSettings(),
        };
      } catch (err) {
        console.warn('DOCX zip parse failed, falling back to text stream:', err);
        const text = await file.text();
        return {
          title,
          content: `<p>${this.escapeHtml(text.replace(/\0/g, ''))}</p>`,
          fileType: 'docx',
        };
      }
    }

    // 2. OCR Image Scanner (.png, .jpg, .jpeg, .webp, .tiff)
    if (['png', 'jpg', 'jpeg', 'webp', 'tiff', 'bmp'].includes(ext)) {
      const ocr = await OCREngine.scanDocument(file);
      return {
        title: ocr.title || title,
        content: ocr.htmlContent,
        fileType: ext,
      };
    }

    // 3. OpenDoc / JSON Import
    if (ext === 'opendoc' || ext === 'json') {
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
          return {
            title: parsed.title || title,
            content: parsed.content || '',
            fileType: 'json',
            parsedDoc: parsed,
          };
        }
      } catch (e) {
        console.error('Failed to parse OpenDoc JSON', e);
      }
    }

    // 4. Markdown Import (.md, .markdown)
    if (ext === 'md' || ext === 'markdown') {
      const text = await file.text();
      const content = this.markdownToHtml(text);
      return { title, content, fileType: 'md' };
    }

    // 5. HTML Import (.html, .htm)
    if (ext === 'html' || ext === 'htm') {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const bodyHtml = doc.body.innerHTML || text;
      return { title, content: bodyHtml, fileType: 'html' };
    }

    // 6. RTF Import (.rtf)
    if (ext === 'rtf') {
      const text = await file.text();
      const content = this.parseRtf(text);
      return { title, content, fileType: 'rtf' };
    }

    // 7. CSV Import (.csv)
    if (ext === 'csv') {
      const text = await file.text();
      const content = this.csvToHtmlTable(text);
      return { title, content, fileType: 'csv' };
    }

    // 8. Plain Text & Source Code (.txt, .js, .ts, etc.)
    const text = await file.text();
    const paragraphs = text
      .split(/\n\n+/)
      .map(p => `<p>${this.escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('\n');

    return {
      title,
      content: paragraphs || '<p></p>',
      fileType: 'txt',
    };
  }

  /**
   * Parse DOCX by extracting word/document.xml with JSZip
   */
  private static async parseDocx(file: File): Promise<string> {
    const zip = new JSZip();
    const zipDoc = await zip.loadAsync(file);

    const docXmlFile = zipDoc.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('Invalid DOCX: word/document.xml not found');
    }

    const xmlText = await docXmlFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    let html = '';

    // Iterate over top-level body children (paragraphs <w:p> and tables <w:tbl>)
    const body = xmlDoc.getElementsByTagName('w:body')[0];
    if (!body) return '<p>Empty Document</p>';

    for (let i = 0; i < body.childNodes.length; i++) {
      const node = body.childNodes[i] as Element;
      if (!node.tagName) continue;

      if (node.tagName === 'w:p') {
        html += this.parseDocxParagraph(node);
      } else if (node.tagName === 'w:tbl') {
        html += this.parseDocxTable(node);
      }
    }

    return html || '<p>Imported document contains no text.</p>';
  }

  private static parseDocxParagraph(pNode: Element): string {
    let pText = '';
    let isHeading = false;
    let headingLevel = 1;
    let align = 'left';

    // Check paragraph style
    const pPr = pNode.getElementsByTagName('w:pPr')[0];
    if (pPr) {
      const pStyle = pPr.getElementsByTagName('w:pStyle')[0];
      if (pStyle) {
        const val = pStyle.getAttribute('w:val') || '';
        if (/Heading1|Title/i.test(val)) {
          isHeading = true;
          headingLevel = 1;
        } else if (/Heading2/i.test(val)) {
          isHeading = true;
          headingLevel = 2;
        } else if (/Heading3/i.test(val)) {
          isHeading = true;
          headingLevel = 3;
        }
      }
      const jc = pPr.getElementsByTagName('w:jc')[0];
      if (jc) {
        align = jc.getAttribute('w:val') || 'left';
      }
    }

    // Extract text runs
    const runs = pNode.getElementsByTagName('w:r');
    for (let j = 0; j < runs.length; j++) {
      const r = runs[j];
      const rPr = r.getElementsByTagName('w:rPr')[0];
      let isBold = false;
      let isItalic = false;
      let isUnderline = false;

      if (rPr) {
        if (rPr.getElementsByTagName('w:b').length > 0) isBold = true;
        if (rPr.getElementsByTagName('w:i').length > 0) isItalic = true;
        if (rPr.getElementsByTagName('w:u').length > 0) isUnderline = true;
      }

      const tElements = r.getElementsByTagName('w:t');
      for (let k = 0; k < tElements.length; k++) {
        let text = tElements[k].textContent || '';
        text = this.escapeHtml(text);
        if (isBold) text = `<strong>${text}</strong>`;
        if (isItalic) text = `<em>${text}</em>`;
        if (isUnderline) text = `<u>${text}</u>`;
        pText += text;
      }
    }

    if (!pText.trim()) return '';

    const alignStyle = align !== 'left' ? ` style="text-align: ${align};"` : '';

    if (isHeading) {
      return `<h${headingLevel}${alignStyle}>${pText}</h${headingLevel}>\n`;
    }
    return `<p${alignStyle}>${pText}</p>\n`;
  }

  private static parseDocxTable(tblNode: Element): string {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">\n<tbody>\n';
    const rows = tblNode.getElementsByTagName('w:tr');

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      tableHtml += '  <tr style="border-bottom: 1px solid #e2e8f0;">\n';
      const cells = row.getElementsByTagName('w:tc');

      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        const paragraphs = cell.getElementsByTagName('w:p');
        let cellContent = '';
        for (let p = 0; p < paragraphs.length; p++) {
          cellContent += this.parseDocxParagraph(paragraphs[p]);
        }
        const tag = r === 0 ? 'th' : 'td';
        const bg = r === 0 ? 'background: #f8fafc; font-weight: bold;' : '';
        tableHtml += `    <${tag} style="border: 1px solid #cbd5e1; padding: 8px 12px; ${bg}">${cellContent || '&nbsp;'}</${tag}>\n`;
      }
      tableHtml += '  </tr>\n';
    }

    tableHtml += '</tbody>\n</table>\n';
    return tableHtml;
  }

  /**
   * Parse Rich Text Format (.rtf)
   */
  private static parseRtf(rtf: string): string {
    let stripped = rtf
      .replace(/\{\\fonttbl[\s\S]*?\}/g, '')
      .replace(/\{\\colortbl[\s\S]*?\}/g, '')
      .replace(/\{\\\*[\s\S]*?\}/g, '')
      .replace(/\\par[d]?\s*/gi, '\n\n')
      .replace(/\\b\s+(.*?)\\b0\s*/gi, '<strong>$1</strong>')
      .replace(/\\i\s+(.*?)\\i0\s*/gi, '<em>$1</em>')
      .replace(/\\ul\s+(.*?)\\ulnone\s*/gi, '<u>$1</u>')
      .replace(/\\line\s*/gi, '<br/>')
      .replace(/\\[a-z0-9]+\s?/gi, '')
      .replace(/[{}]/g, '')
      .trim();

    return stripped
      .split(/\n\n+/)
      .filter(Boolean)
      .map(p => `<p>${p.trim()}</p>`)
      .join('\n');
  }

  private static csvToHtmlTable(csv: string): string {
    const lines = csv.trim().split('\n');
    if (!lines.length) return '<p></p>';
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">\n<tbody>\n';
    lines.forEach((line, rowIndex) => {
      html += '  <tr style="border-bottom: 1px solid #e2e8f0;">\n';
      const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
      cells.forEach(cell => {
        const tag = rowIndex === 0 ? 'th' : 'td';
        const bg = rowIndex === 0 ? 'background: #f8fafc; font-weight: bold;' : '';
        html += `    <${tag} style="border: 1px solid #cbd5e1; padding: 8px 12px; ${bg}">${this.escapeHtml(cell)}</${tag}>\n`;
      });
      html += '  </tr>\n';
    });
    html += '</tbody>\n</table>\n';
    return html;
  }

  private static markdownToHtml(md: string): string {
    return md
      .replace(/^#{6}\s(.+)/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s(.+)/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s(.+)/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s(.+)/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s(.+)/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s(.+)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/^[-*+]\s(.+)/gm, '<li>$1</li>')
      .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
      .replace(/^>\s(.+)/gm, '<blockquote>$1</blockquote>')
      .replace(/^---+$/gm, '<hr/>')
      .replace(/\n\n/g, '</p>\n<p>')
      .replace(/^(?!<[hHblp])(.+)/gm, '<p>$1</p>');
  }

  private static escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
